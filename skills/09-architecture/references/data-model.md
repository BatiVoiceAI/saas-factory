# Référence — Modèle de données, RLS & multi-tenant (mouvement 3, high-stakes)

Le modèle de données est le choix **le plus coûteux à défaire** d'un micro-SaaS : tout le reste (modules, API, UI) s'y adosse, et le changer après le build impose une migration de données. Il mérite donc sa propre procédure normée. Sortie : l'`erDiagram` + les règles RLS de la section 3.3 de `tech/architecture.md`, et l'entrée des migrations `supabase/` (étape 11 / Phase 4).

## Sommaire

- Procédure (déterministe)
- Choisir la stratégie multi-tenant
- Variante AUTOMATION — tables d'état service-role-only (multi-tenant « sans objet »)
- Variante ECOMMERCE — catalogue public + commandes/stock transactionnels
- Règles RLS (le socle du multi-tenant sur Supabase)
- Micro-exemple (niche-agnostique)
- Invariants d'intégrité DB (contraintes, jamais des checks applicatifs)
- Accès public anonyme (surface exposée sans login)
- Robustesse des fonctions PL/pgSQL (collision colonne / variable — bug runtime invisible au build)
- Cas limites de données (à lister explicitement)
- Modes d'échec du modèle de données
- Handoff

## Procédure (déterministe)
1. **Dériver les entités** depuis les features + user stories. Un **nom** qui revient dans les US (« projet », « facture », « membre ») = une entité candidate. Une action sur une donnée (« assigner une tâche ») = souvent une relation ou une table de jointure.
2. **Champs clés par entité** : identifiant, propriétaire (le tenant), horodatage, statut, + les champs métier nommés dans les US. Ne mets **que** ce qu'une US justifie (pas de champ « au cas où »).
3. **Relations** : 1-1, 1-N, N-N. Chaque N-N → table de jointure explicite. Marque les relations **de propriété** (cascade) vs **de référence** (restrict).
4. **Tenant & RLS** : pour chaque table, qui est le tenant propriétaire ? Qui lit / écrit ? Écris la **politique RLS** en clair (pas le SQL — la règle : « un membre lit les projets de son org, écrit les siens »).
5. **Cas limites de données** (voir plus bas) : suppression, orphelins, unicité, migration.
6. **Rends l'`erDiagram`** (Mermaid) + la table des politiques RLS dans la section 3.3.

## Choisir la stratégie multi-tenant
Le défaut de l'archétype couvre 95 % des micro-SaaS. Ne dévie que sur exigence dure (`decision-matrices.md §2`).

| Stratégie | Quand | Isolation | Réversibilité |
|---|---|---|---|
| **Shared-table + `tenant_id` + RLS** (défaut) | micro-SaaS B2B/B2C standard | logique (RLS Postgres) | — (c'est le défaut) |
| Schema-per-tenant | conformité imposant l'isolation logique forte | schéma Postgres par tenant | **difficile** (migration) → ADR |
| Base-per-tenant | isolation physique imposée (santé, souveraineté) | base dédiée | **très difficile** → ADR |

> Chaque déviation du défaut = un ADR avec réversibilité honnêtement notée « difficile ». Ne marque **jamais** un choix multi-tenant « réversible : facile ».

## Variante AUTOMATION — tables d'état service-role-only (multi-tenant « sans objet »)

> Conditionnement par archétype. Le modèle à 3 axes (`archetype` / `type` / `tenancy`) et la définition de `automation` vivent en **source unique** dans `_shared/state-schema.md §Modèle à 3 axes`. Ici on ne redéfinit rien : on dérive **ce que devient le modèle de données** quand `archetype = automation`. Toute la procédure « multi-tenant » ci-dessus (dérivation depuis US produit, tenant, RLS, `anon`) est **conçue pour `web-saas`** ; en `automation` elle est **inapplicable telle quelle** — appliquer le multi-tenant à un headless est un **faux-positif** (l'inverse du bug des portes de complétude, §`state-schema.md`).

Un `automation` n'a **pas de schéma applicatif orienté utilisateur** : pas de session, pas de JWT, pas de rôle produit, pas de surface `anon`. Ses tables sont un **état d'automatisation** (config, historique de runs + logs, curseurs d'idempotence, éventuelles entités métier créées par le job), **écrites et lues par le worker seul** via `service_role` (REST `fetch` — cf. `_shared/archetypes/automation.md`, socle AU1-AU5). Conséquences directes sur la procédure :

| Point de la procédure web-saas | En automation |
|---|---|
| **Stratégie multi-tenant** (table ci-dessus) | **sans objet** — pas de tenant, pas d'`org_id`, pas de FK propriétaire. Une seule « organisation » implicite : le worker. Ne pose **pas** de `tenant_id` « au cas où ». |
| **Ligne « Tenant »** de chaque table | **sans objet** — remplace par « écrit/lu par : worker (`service_role`) ». |
| **Règles RLS** (§ suivant) | **RLS activée mais deny-by-default sans policy** : la table est **service-role-only**. `service_role` **bypasse RLS** ; on n'ajoute **aucune** policy `select/insert/update/delete` (aucun rôle non-privilégié n'y accède). Documenter ce choix explicitement (RLS ON + 0 policy = « accès worker uniquement », pas un oubli). |
| **Frontière de confiance JWT** | **sans objet** — il n'y a pas de client à qui ne pas faire confiance. Les secrets d'intégration (token boutique, clé Resend) sont la seule frontière, portée par la config (AU1), pas par RLS. |
| **Surface `anon`** | **sans objet** — un headless n'expose **rien** à `anon`. Tout le bloc « Accès public anonyme » est ignoré (l'admin optionnel de statut/logs se protège par accès restreint, pas par un signup public). |

### L'invariant d'ENTITÉ idempotente est en 1er rang (avant tout le reste)
En web-saas, le premier invariant listé est souvent l'unicité **par tenant**. En automation, **le risque n°1 — et donc le premier invariant à poser** — est l'**idempotence au grain de l'entité** que le job crée : « un même déclencheur métier (ex. un manque de stock) ne doit produire **au plus une** entité ouverte (ex. un réappro), même si le run est rejoué ». C'est distinct de l'idempotence de **run** (AU5 `withIdempotency` : « un effet au plus par tick ») : le grain **entité** exige sa propre contrainte DB. Pose-le **en tête** de la table des invariants d'intégrité, avec :

| Invariant (grain entité) | Contrainte DB | Jamais |
|---|---|---|
| Au plus une entité ouverte par déclencheur métier (au plus un réappro par manque) | **index unique partiel** sur la **clé d'identité déterministe** `WHERE statut = 'ouvert'` + **upsert RPC atomique** (`insert … on conflict … do nothing/update`) | `SELECT` « existe-t-il déjà ? » puis `INSERT` (course : deux runs concurrents passent tous deux) |

- **Clé d'identité déterministe = attributs STABLES seulement.** La clé qui identifie l'entité **exclut toute quantité mutable**. Un `sha256(sku | besoin | fenêtre)` qui inclut la quantité manquante re-crée un doublon **dès que la quantité change** au run suivant — piège classique. La clé porte l'**identité** (quoi/où/quelle fenêtre), pas l'**état** (combien). Le patron complet 2-grains (run vs entité) + migration exemple vivent dans le socle automation (`_shared/archetypes/automation.md` AU5 + `_shared/blocks/automation/README.md`) — on ne le duplique pas ici, on **exige** sa contrainte au modèle.
- **Fenêtre déterministe** (le composant temporel de la clé) : ne **jamais** utiliser `now()` nu dans la clé (chaque run tombe dans un bucket différent → l'idempotence ne tient pas). Bucketise sur une **fenêtre calculée** : `floor((epoch(t) − EPOCH_CONSTANTE) / PÉRIODE_SEC)`, avec `EPOCH_CONSTANTE` **fixe** (constante versionnée du code, jamais l'heure de démarrage) et un **préfixe versionné** (`ss:v1:sync:…`) pour pouvoir changer de schéma de fenêtre sans collision. La période DOIT dériver de la **cadence réelle** du worker (piège de la fenêtre 24 h par défaut du châssis — cf. socle automation).

### RETURNING est SÛR sur table service-role-only (le piège RLS n'existe que sous policy SELECT auto-référente)
Le piège « `new row violates row-level security policy` au premier `INSERT` » — celui qui casse `.insert().select()` — **n'existe QUE** quand une **policy `SELECT` auto-référente** (qui re-requête sa propre table pour décider de la visibilité) s'applique au `RETURNING`. Un `INSERT … RETURNING` (côté SDK : `.insert(…).select()`) fait passer les lignes retournées **par la policy `SELECT`** ; si cette policy re-lit la table (ex. « je vois la ligne si j'appartiens à son org » alors que l'org vient d'être créée dans le même insert), le check échoue et l'insert entier est rejeté.

Sur une table **service-role-only** (automation) : **il n'y a aucune policy `SELECT`**, et `service_role` **bypasse RLS** de toute façon. Donc **`INSERT … RETURNING` / `.insert().select()` est SÛR** — récupère librement l'id/la ligne insérée, y compris l'upsert d'idempotence d'entité. **Ne transpose PAS** la prudence « RETURNING piégé » du contexte web-saas ici : ce serait une contrainte fantôme. La règle exacte : *le RETURNING n'est risqué que sous une policy SELECT auto-référente ; sans policy SELECT (service-role-only) il est inconditionnellement sûr.*

### Patron « domain store » (REST service-role + fallback fichier)
Le worker parle à ses tables d'état en **REST `service_role`** (pas de SDK lourd — cf. AU5). Le patron réutilisable pour une **entité métier** persistée par le job = un **« domain store »** : un module qui expose `get/upsert/list` sur l'entité, **REST Supabase en primaire** et **fallback fichier local** (`.automation/*.json`) en secours. Deux règles dures sur le fallback :
- **Concurrence** : le fallback fichier ne tient pas sous accès concurrent → n'est valide qu'en mono-instance (le `concurrency` du scheduler garantit un run à la fois).
- **Éphémérité** (⚠️ décisif au déploiement) : sur **runner éphémère** (GitHub Actions, Cloud Scheduler, CI), le disque est **effacé à chaque tick** → `.automation/*.json` disparaît → **l'idempotence d'entité est cassée en silence**. Donc : *fallback fichier valide UNIQUEMENT sur disque persistant OU test local one-shot ; **runner éphémère ⇒ table Supabase durable OBLIGATOIRE***. Cette contrainte **conditionne la reco de déploiement** (§`skills/17-deploy/references/automation-deploy.md`).

Toute fonction/RPC posée pour ce patron (upsert atomique d'idempotence d'entité) reste soumise à **lesson #15** : garde-fou anti-42702 obligatoire (`#variable_conflict use_column` **ou** préfixes `p_`/`v_` + qualification `table.colonne`) — cf. §Robustesse des fonctions PL/pgSQL ci-dessous. Un upsert d'idempotence est typiquement `SECURITY DEFINER` + `RETURNS TABLE` → cible directe du 42702.

## Variante ECOMMERCE — catalogue public + commandes/stock transactionnels

> Conditionnement par archétype. Le modèle à 3 axes (`archetype` / `type` / `tenancy`) et la définition de `ecommerce` vivent en **source unique** dans `_shared/state-schema.md §Modèle à 3 axes` ; la fiche complète (socle EC1-EC5, pièges P1-P3, pipeline) est dans `_shared/archetypes/ecommerce.md`. Ici on dérive **ce que devient le modèle de données** quand `archetype = ecommerce` : un **catalogue en lecture publique (`anon`)** adossé à un **cœur transactionnel commandes/stock** où trois invariants — survente (P1), intégrité du prix (P2), idempotence du webhook (P3) — sont des exigences **DURES** (portes 13/14). C'est un archétype de **première classe**, pas un web-saas déguisé.

Le **faux-positif miroir de l'automation** : ne **PAS** appliquer le **multi-tenant org de web-saas** à une boutique publique. Le tenant e-commerce = le **marchand / l'instance** (une instance = une boutique), **pas** un locataire parmi N ; le **catalogue est public**. Pas d'`org_id` sur `products`/`orders`, pas de `tenant_id` « au cas où ». Exiger l'isolation multi-locataire d'une boutique = le même faux-positif d'archétype qu'imposer le multi-tenant à un headless (§Variante AUTOMATION), à l'envers.

| Point de la procédure web-saas | En ecommerce |
|---|---|
| **Stratégie multi-tenant** (table plus haut) | **sans objet au sens org** — le tenant est le **marchand** (une boutique par instance), pas un locataire parmi N. Pas d'`org_id` sur le catalogue ni les commandes. |
| **Surface `anon`** | **centrale, PAS « sans objet »** — le catalogue (`categories`/`products`/`variants` **publiés**) est lu par `anon`. C'est la principale surface publique : elle relève de **§Accès public anonyme** (vue/fonction à colonnes explicites, **zéro PII client**, pas de brouillons, pas de coût interne exposé). |
| **Frontière de confiance** | **double** : (1) le **client** — jamais un prix/total venu du navigateur (P2) ; (2) le **webhook Stripe** — signature vérifiée, idempotent, **source de vérité** du paiement (P3). |
| **Rôles** | `anon` (catalogue + panier + **checkout invité**) · `authenticated` (client optionnel : voit **SES** commandes) · `service_role` (webhook : crée les commandes, décrémente le stock) · **admin** (back-office : catalogue + toutes les commandes). |

### Modèle de données + RLS (catalogue public / transactionnel protégé)
```mermaid
erDiagram
  CATEGORY ||--o{ PRODUCT    : "classe"
  PRODUCT  ||--o{ VARIANT    : "décline"
  PRODUCT  ||--|| INVENTORY  : "suit le stock"
  CART     ||--o{ CART_ITEM  : "contient"
  PRODUCT  ||--o{ CART_ITEM  : "référencé"
  ORDER    ||--o{ ORDER_ITEM : "détaille"
  PRODUCT  ||--o{ ORDER_ITEM : "snapshot"
```
| Table | Scope / tenant | RLS (select / write) |
|---|---|---|
| `categories`, `products`, `variants` | marchand (public) | **`select` `anon` sur `published = true` UNIQUEMENT** (brouillons invisibles) ; **write = admin**. Jamais `GRANT SELECT` brut si PII/coût → **vue/fonction à colonnes explicites** (§Accès public anonyme). |
| `inventory` | marchand (protégé) | **aucune** policy `anon`/`authenticated` — lu/écrit **uniquement** par le webhook (`service_role`). La dispo au catalogue passe par une **colonne dérivée** (`in_stock` booléen / vue), **pas** le compte de stock brut. |
| `carts`, `cart_items` | **session (`anon`) OU user** | scopé par `cart_token` (cookie invité) **ou** `user_id` ; lisible/modifiable par son seul porteur. **Ne porte aucun prix de confiance** (P2) — juste `product_id` + `qty`. |
| `orders` | client + marchand | **`select`** : le client voit **SES** commandes (`user_id = auth.uid()`, ou jeton de commande signé côté invité) ; l'**admin** voit **toutes**. **`insert`/`update` = `service_role` seulement** (webhook) — **jamais** le client. |
| `order_items` | via `orders` | `select` via la commande parente ; **`insert` `service_role`** ; **snapshot** `unit_price` + `product_name` **figés** au paiement (pas de FK vive vers le prix courant, qui peut changer après la vente). |

> **Carts scopés, jamais tenantés org.** Un panier invité vit sous un `cart_token` (cookie httpOnly) ; à la connexion, il se **fusionne** dans le panier `user_id`. Le panier n'est **pas** une donnée de confiance : au checkout, le serveur **ré-hydrate** produits + prix depuis le catalogue et **ignore** tout montant présent côté client (P2).

### P1 — Décrément atomique du stock (le piège en 1er rang)
Comme l'idempotence d'entité l'est en automation, **l'anti-survente est le premier invariant à poser** en ecommerce. Deux clients achètent le **dernier** article en même temps → sans protection atomique, **les deux paient**, un ne sera pas livré. Il se pose en **contrainte DB**, jamais en check applicatif, et se décrémente **au paiement confirmé (webhook)** — **pas** à l'ajout au panier (sinon un panier abandonné gèle le stock ; réservation optionnelle à TTL si vraiment nécessaire).

| Invariant (grain stock) | Contrainte DB | Jamais |
|---|---|---|
| Jamais de survente : deux commandes concurrentes sur le dernier article ne réussissent pas toutes deux | **décrément conditionnel atomique** (`update … where stock >= :qty`, 0 ligne = rupture → refus) **+** `CHECK (stock >= 0)`, dans la **même transaction** que la création de commande | `SELECT stock` puis `if stock>0 then INSERT` — fenêtre de course : deux runs passent tous deux |

Le décrément conditionnel, à l'état d'atome (le snippet canon de `ecommerce.md §P1`) :
```sql
-- 0 ligne affectée = rupture → la commande est refusée. Jamais un SELECT-puis-INSERT.
update inventory set stock = stock - :qty
where product_id = :id and stock >= :qty;     -- (catalogue à variantes : la clé de stock est variant_id)
```
Assemblé, il vit dans une **RPC `SECURITY DEFINER`** appelée par le webhook, qui **décrémente le stock ET crée la commande dans UNE seule transaction**, idempotente sur la clé Stripe (P3) et au prix serveur (P2) — conforme **lesson #15** (`#variable_conflict use_column`, `search_path=''`, `revoke` puis `grant execute` explicite) :
```sql
-- Appelée par le webhook (service_role). P1 (stock atomique) + P2 (prix serveur) + P3 (idempotence) réunis.
create function public.fulfill_paid_order(
  p_stripe_session_id text,
  p_customer_email    text,
  p_items             jsonb          -- [{ product_id, qty }] — SANS prix client (P2)
)
returns table (order_id uuid, already_processed boolean)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column                       -- (a) garde-fou anti-42702 (lesson #15)
declare
  v_order_id uuid;
  v_item     jsonb;
  v_price    numeric;
  v_name     text;
  v_total    numeric := 0;
begin
  -- P3 — idempotence : insert-or-noop sur la clé Stripe ; redelivery ⇒ on ressort la commande existante.
  insert into public.orders (stripe_session_id, customer_email, status)
  values (p_stripe_session_id, p_customer_email, 'paid')
  on conflict (stripe_session_id) do nothing
  returning orders.id into v_order_id;

  if v_order_id is null then
    return query select orders.id, true
      from public.orders where orders.stripe_session_id = p_stripe_session_id;
    return;
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- P2 — prix + libellé pris au CATALOGUE (jamais le payload client)
    select products.price, products.name into v_price, v_name
    from public.products where products.id = (v_item->>'product_id')::uuid;

    -- P1 — décrément conditionnel atomique : 0 ligne = rupture → on annule TOUTE la transaction
    update public.inventory
    set stock = stock - (v_item->>'qty')::int
    where inventory.product_id = (v_item->>'product_id')::uuid
      and inventory.stock      >= (v_item->>'qty')::int;
    if not found then
      raise exception 'rupture de stock (product %)', v_item->>'product_id';
    end if;

    -- snapshot du prix serveur payé (P2) — pas de FK vive vers products.price
    insert into public.order_items (order_id, product_id, qty, unit_price, product_name)
    values (v_order_id, (v_item->>'product_id')::uuid, (v_item->>'qty')::int, v_price, v_name);
    v_total := v_total + v_price * (v_item->>'qty')::int;
  end loop;

  update public.orders set total = v_total where orders.id = v_order_id;
  return query select v_order_id, false;
end;
$$;

revoke all     on function public.fulfill_paid_order(text, text, jsonb) from public, anon, authenticated;
grant  execute on function public.fulfill_paid_order(text, text, jsonb) to   service_role;  -- appelant = webhook
```
> **Grantee = `service_role`** (le webhook est l'appelant), là où une RPC invoquée par un utilisateur connecté serait `grant execute … to authenticated` : la discipline lesson #15 est identique (`revoke` de `public`/`anon`, `grant` au **seul** rôle légitime), seul le rôle cible change. Le `raise exception` **annule tout** (stock + commande) : atomicité garantie par la transaction de la RPC — une rupture sur une ligne ne laisse jamais une commande à moitié créée.

### P2 — Intégrité du prix (le montant est recalculé serveur)
**Ne jamais faire confiance à un prix/total envoyé par le client** — un payload de panier est trivialement altérable (`price: 0.01`). Le montant facturé au Checkout **et** les `order_items` sont **recalculés côté serveur** depuis le catalogue (`lib/pricing/`), à partir des **seuls `product_id` + quantités** (voir le `select products.price` de la RPC ci-dessus) ; jamais un total transmis par le navigateur. La ligne de commande **snapshot** le prix serveur payé (`order_items.unit_price`), **jamais** une FK vive vers `products.price` : le prix courant peut bouger après la vente, la commande doit rester le reflet fidèle de ce qui a été réellement payé.

### P3 — Idempotence du webhook Stripe (une commande, une seule fois)
Stripe redélivre ses webhooks (**at-least-once**) : créer la commande à chaque réception ⇒ **doublons**. Deux gardes, cumulées :
1. **Signature vérifiée** dans le handler (`stripe.webhooks.constructEvent`) **avant** tout accès DB — un POST non signé est rejeté ;
2. **Idempotence DB** — contrainte `unique(orders.stripe_session_id)` + `insert … on conflict do nothing` (le `RETURNING … into v_order_id` NULL = redelivery ⇒ noop, cf. RPC P1).
```sql
alter table public.orders add constraint orders_stripe_session_uniq unique (stripe_session_id);
```
La commande n'est créée/confirmée **qu'au** `checkout.session.completed` / `payment_intent.succeeded` (le webhook = **source de vérité** du paiement, **pas** le retour navigateur, qui peut ne jamais arriver). Trois redeliveries ⇒ **une** commande, **un** décrément de stock, **un** email de confirmation.

> **Le piège RETURNING ne mord pas ici — mais pour une raison distincte d'automation.** `orders`/`order_items` sont écrits **uniquement par `service_role`** (le webhook) via une RPC `SECURITY DEFINER` : le `RETURNING` s'exécute hors policy `SELECT` auto-référente (le définisseur / `service_role` **bypasse** la RLS). Le trap `.insert().select()` de web-saas ne surgirait que si un **client authentifié** insérait une commande sous une policy `SELECT` qui re-requête `orders` — ce que l'archétype **interdit** (insert = service_role). Comme en automation, la RPC reste soumise à **lesson #15** (garde-fou 42702) et se **prouve par smoke-test** contre une vraie base (§Robustesse des fonctions PL/pgSQL), pas par `tsc`.

## Règles RLS (le socle du multi-tenant sur Supabase)

> Archétype `automation` : ce bloc est **sans objet** (tables service-role-only, RLS ON + 0 policy) — voir §Variante AUTOMATION ci-dessus. Le reste de cette section vaut pour `web-saas`.
- **Toute table tenantée porte `tenant_id`** (ou une FK vers l'org) et **active RLS**. Une table tenantée sans RLS = fuite de données inter-clients → `[SÉCU]`.
- **Deny-by-default** : RLS activée, aucune policy permissive « à tous ». On ajoute les policies `select/insert/update/delete` explicitement.
- **Le tenant vient du token de session**, jamais d'un paramètre client (sinon un client lit les données d'un autre en changeant l'ID). Frontière de confiance : le `tenant_id` de la requête est **dérivé du JWT**, pas du body.
- **Tables non tenantées** (référentiels publics, contenu partagé) : documente-le explicitement — l'absence de RLS y est un **choix**, pas un oubli.
- **Rôles** : si le PRD a des rôles (admin/membre/lecteur), les policies les reflètent (un lecteur ne fait pas d'`update`).

## Micro-exemple (niche-agnostique)
```mermaid
erDiagram
  ORG      ||--o{ MEMBER   : "a"
  ORG      ||--o{ RESOURCE : "possède"
  MEMBER   ||--o{ RESOURCE : "crée"
  RESOURCE ||--o{ EVENT    : "génère"
```
| Table | Tenant | RLS (select / write) |
|---|---|---|
| `org` | soi-même | membre lit son org ; write = admin |
| `member` | `org_id` | lit les membres de son org ; write = admin |
| `resource` | `org_id` | lit celles de son org ; write = créateur ou admin |
| `event` | via `resource.org_id` | lit via la ressource ; write = système (jamais client) |

Lecture : le `tenant_id` effectif (`org_id`) est **toujours** dérivé de la session ; `event` est écrit par le backend (donnée non fiable si écrite par le client).

## Invariants d'intégrité DB (contraintes, jamais des checks applicatifs)
Règle dure : **tout invariant violable par 2 écritures concurrentes est porté par une contrainte DB** — `EXCLUDE` (GiST), `CHECK` ou unique composite — **jamais un check applicatif seul**. Un `SELECT` de vérification suivi d'un `INSERT` est une course : deux requêtes simultanées passent toutes les deux le check et violent l'invariant. Seule la contrainte tient sous concurrence. Invariant métier-critique → `[SÉCU]`.

| Invariant (exemple) | Contrainte DB | Jamais |
|---|---|---|
| Pas de chevauchement (réservation, planning, allocation) | `EXCLUDE USING gist (resource_id WITH =, plage WITH &&)` | check de disponibilité côté app avant insert |
| Unicité par tenant (slug, email, référence) | unique composite `(tenant_id, champ)` | « on vérifie avant d'insérer » |
| Borne métier (quantité ≥ 0, date dans une fenêtre) | `CHECK (…)` | validation zod seule |
| Un seul actif par parent (abonnement courant, défaut) | index unique partiel `WHERE actif` | flag géré par le code |

- **Recette** : pour chaque règle du PRD du type « jamais deux X en même temps / au plus N / dans la fenêtre Y » et chaque cas limite « concurrence », écris la **contrainte SQL** dans la section 3.3 — elle entre en migration à l'étape 11 et devient un test de concurrence en Phase 4.
- La validation applicative (zod, RPC) **s'ajoute** pour les messages d'erreur ; elle ne **remplace** jamais la contrainte.

## Accès public anonyme (surface exposée sans login)
Dès qu'une table, vue ou fonction est accessible au rôle `anon` (page publique, formulaire sans compte), la surface est **attaquable par script** — elle se conçoit ici, pas au build. Tout ce bloc est `[SÉCU]`.

- **Lecture anonyme** : jamais de `GRANT SELECT` sur la table — une **vue ou fonction `SECURITY DEFINER` à colonnes explicites, SANS PII** (pas d'email / téléphone / nom de clients ; colonnes listées une à une, jamais `SELECT *`).
- **Écriture anonyme** : jamais d'insert direct — un **endpoint serveur** (route API / RPC) qui **valide** l'entrée + **rate-limit**.
- **Toute fonction grantée à `anon` ⇒ checklist anti-abus OBLIGATOIRE** (les trois, pas « au choix ») :
  1. **Bornes temporelles** — l'action n'est valable que dans une fenêtre métier (ex. réservable ≤ `now() + 60 jours`) ;
  2. **Plafonds par client** — au plus N objets actifs par identifiant client (email / téléphone) ;
  3. **Rate-limit IP** — au niveau endpoint / middleware.
- Sans ces trois gardes, un script remplit la ressource de n'importe quel tenant = **DoS métier trivial**. Chaque garde est documentée en section 3.3 (elle devient contrainte / code / test aux étapes 11 et Phase 4).

## Robustesse des fonctions PL/pgSQL (collision colonne / variable — bug runtime invisible au build)
Une fonction `plpgsql` **compile toujours** : Postgres ne résout les noms qu'**à l'exécution**. Un nom de **colonne de sortie** (`RETURNS TABLE(… x …)`), de **paramètre** ou de **variable locale** qui porte le **même nom qu'une colonne de table** référencée **sans qualification** lève l'erreur runtime **42702 « column reference … is ambiguous »** — au **premier appel réel**, jamais au build. Ni `tsc` ni `next build` ne voient le SQL : une fonction cœur (réservation, paiement, création de compte) passe toute la CI verte puis **plante au premier vrai clic en prod**. C'est un point `[SÉCU]`/qualité DB.

Règle dure : **toute fonction `plpgsql`** (a fortiori `SECURITY DEFINER` et/ou `RETURNS TABLE`) applique **l'un des deux** garde-fous, jamais aucun :
- **(a) directive `#variable_conflict use_column`** en **tête de corps** (après `as $$`, avant `begin`/`declare`) — un nom ambigu résout alors vers la **colonne** ; **ou**
- **(b) discipline de nommage** : variables locales / paramètres **préfixés `v_` / `p_` / `c_`** (jamais le nom d'une colonne) **ET** **toute référence de colonne qualifiée** `table.colonne` — aucun nom **nu** qui puisse collisionner avec un paramètre OUT, une variable ou une colonne.

Les deux se cumulent volontiers (ceinture + bretelles). Ce qui est **interdit** : un nom **nu** (`hold_expires_at`) dans une fonction où ce nom est **aussi** une colonne de sortie, un paramètre ou une variable.

### Le fix exact (bug réel `create_booking`)
```sql
-- ❌ AVANT — 42702 au premier appel : la colonne OUT `hold_expires_at` de
-- RETURNS TABLE collisionne avec appointments.hold_expires_at, référencée NUE.
create function public.create_booking(slot_id uuid, client_email text)
returns table (id uuid, hold_expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  insert into public.appointments (slot_id, client_email, hold_expires_at)
  values (slot_id, client_email, now() + interval '15 minutes')
  returning appointments.id, hold_expires_at;  -- hold_expires_at AMBIGU (colonne OUT vs colonne table)
end;
$$;

-- ✅ APRÈS — un seul des deux garde-fous suffit ; ici les deux, par sûreté.
create function public.create_booking(p_slot_id uuid, p_client_email text)
returns table (id uuid, hold_expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column                                         -- (a) nom ambigu ⇒ colonne
begin
  return query
  insert into public.appointments (slot_id, client_email, hold_expires_at)
  values (p_slot_id, p_client_email, now() + interval '15 minutes')   -- (b) paramètres préfixés p_
  returning appointments.id, appointments.hold_expires_at;            -- (b) colonnes qualifiées
end;
$$;
```
> La collision était sur la **sortie** : `hold_expires_at` (colonne OUT de `RETURNS TABLE`) et `appointments.hold_expires_at` portent le même nom ; **nue** dans le `RETURNING`, la référence devient ambiguë → 42702. Fix : la directive (a) **et** la qualification `appointments.hold_expires_at` (b), plus les paramètres préfixés `p_` par hygiène. Règle mnémotechnique : **dans une fonction, un nom nu ne doit désigner qu'une seule chose.**

- **Recette** : toute fonction posée en section 3.3 (et sa migration `supabase/` à l'étape 11) porte **(a) ou (b)** — c'est un point de revue à la DoD (item DB) et un red-flag de sa checklist.
- **Preuve** : le build **ne l'attrape pas** ; seul un **smoke-test qui appelle réellement la fonction** contre une vraie base le détecte → porte de la passe d'intégration (`skills/12-build/references/integration-pass.md`, § smoke-test des fonctions/RPC).

## Cas limites de données (à lister explicitement)
Chacun est un test futur (Phase 4) — non listé ici = test manquant plus tard.

| Cas | Question à trancher | Action typique |
|---|---|---|
| Suppression d'un parent | cascade ou restrict ? | propriété → cascade ; référence → restrict + message |
| Orphelins | une ligne peut-elle perdre son tenant ? | FK non-null + `on delete cascade` |
| Unicité | quel champ est unique **par tenant** (pas global) ? | contrainte unique composite `(tenant_id, champ)` |
| Concurrence | 2 écritures simultanées (même ligne ou invariant inter-lignes) | même ligne : `updated_at` / version ; invariant : contrainte DB (§ Invariants d'intégrité DB) |
| Idempotence | événement externe rejoué (webhook) | clé d'idempotence unique (id d'événement) |
| Soft vs hard delete | garder l'historique ? | `deleted_at` si le PRD veut de la corbeille/audit |
| Volumétrie haute | une table grossit sans borne (events, logs) | pagination, index, purge/archivage planifié |
| Migration future | un champ changera souvent (statuts, plan) | enum en table de référence, pas en dur |

## Modes d'échec du modèle de données
- **Sur-modélisation** : 12 tables pour un MVP à 2 features → reviens aux entités que les US **nomment**. Explicite > malin.
- **`tenant_id` client-fourni** : faille d'isolation classique → dérive-le du JWT, taggue `[SÉCU]`.
- **RLS oubliée sur une table tenantée** : fuite inter-clients → deny-by-default, revue à la DoD.
- **Invariant en check applicatif** : « on vérifie avant d'insérer » cède sous concurrence → contrainte `EXCLUDE`/`CHECK`/unique composite (§ Invariants d'intégrité DB), taggue `[SÉCU]`.
- **Surface `anon` sans garde** : fonction grantée à `anon` sans bornes temporelles / plafonds / rate-limit → checklist anti-abus obligatoire (§ Accès public anonyme), taggue `[SÉCU]`.
- **Fonction `plpgsql` à nom collisionnable** : colonne OUT / paramètre / variable homonyme d'une colonne de table référencée nue → 42702 « column reference is ambiguous » au premier appel, **invisible au build** → `#variable_conflict use_column` ou préfixe `v_`/`p_` + qualification systématique (§ Robustesse des fonctions PL/pgSQL) ; prouvé par smoke-test, pas par `tsc`.
- **Entité fantôme** : une table sans US qui la justifie → supprime (choix orphelin).
- **Modèle figé trop tôt** : si une US n'a pas d'entité pour la porter, **itère** avant de figer les modules (M3 boucle interne).

## Handoff
- **Étape 10 (plan)** : chaque entité `crud` → tâche de câblage ; le custom → tâches verticale.
- **Étape 11 (setup)** : le modèle → migrations `supabase/` versionnées.
- **Phase 4 (build)** : les cas limites → matrice de tests ; les points `[SÉCU]` → revue sécurité ; **chaque fonction/RPC → smoke-test contre une vraie base (0 erreur SQL)** avant livraison (`skills/12-build/references/integration-pass.md`) — le garde-fou (a)/(b) se **prouve** là, il ne se relit pas.
