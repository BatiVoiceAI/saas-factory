# Routage & calibrage — 3 axes : **archétype × type × tenancy**

Le routage n'est plus piloté par le seul `type`. Depuis l'audit v0.4.4 (thème TYPES), le livrable se décrit par un **triplet orthogonal** capté à l'**étape 1** (`01-discover`, écrit dans `research/idea-brief.md`) et inscrit par le master dans `.saas-factory/state.md` au plus tôt :

1. **`archetype`** — la **forme TECHNIQUE** du livrable → décide le **socle de complétude** (07) et la **forme du pipeline** ;
2. **`type`** — le modèle d'**ACCÈS/commercial** (`public` | `interne` | `perso`), **orthogonal** à l'archétype → décide la **cérémonie marché & publication** ;
3. **`tenancy`** (web-saas seulement) — `single` (défaut) | `multi-org` → décide l'activation du **substrat org**.

Les 6 livrables de la vision se dérivent de ce triplet : SaaS public = web-saas+public+single ; outil interne = web-saas+interne ; perso = web-saas+perso ; **landing seule = landing (+public)** ; **automatisation = automation (+interne le plus souvent)** ; **SaaS B2B multi-entreprise = web-saas+public+multi-org**. **S'y ajoute l'archétype de PREMIÈRE CLASSE `ecommerce`** (au-delà des 6 livrables d'origine) : **site de vente (boutique) = ecommerce (+public le plus souvent)** — table de dérivation complète, ecommerce compris : `_shared/state-schema.md` §Dérivation des 6 livrables + `_shared/archetypes/ecommerce.md`.

> 🚨 **Le modèle des 3 axes ET le conditionnement du socle par archétype sont définis à UN seul endroit : `_shared/state-schema.md` (SOURCE UNIQUE). Ici on ROUTE dessus — on ne redéfinit pas les axes.** Ce fichier reste **LA table canonique** « étape × (archétype × type × tenancy) » : toute autre mention du routage dans le plugin (orchestrateurs de phase, skills experts) est un **renvoi** (« route selon routing.md ») ; le seul contenu local autorisé ailleurs est le **calibrage de profondeur** d'une étape active, jamais le skip-set.

> ⚠️ **Périmètre du code châssis (statut réel, à jour).** Ce fichier pose le MODÈLE et le ROUTING. Statut des **scaffolds** par archétype/substrat :
> - **`automation` → LIVRÉ** : le bloc `_shared/blocks/automation/` **existe** (socle **AU1-AU5** en `src/*` réels + migration + harness `node:test` + runner one-shot). Une route `automation` est **buildable aujourd'hui** ; on ne dit plus « scaffold = Thème C » pour cet archétype. Manifeste des fichiers : `_shared/blocks/automation/README.md`.
> - **`landing` → assemblage clé-en-main LIVRÉ** : pas de bloc séparé (par conception) — le `landing` s'assemble par **sélection du sous-ensemble web-saas** : skeleton (avec `components/landing/*`) + **`waitlist`** + notifications + légal, **tous livrés** (`tsc`-verts ; `_shared/blocks/web-saas/BLOCKS.md` + `MOAT-STATUS.md`). **Reste** : calibration amont 02/03/05 (allégée à la main).
> - **substrat `multi-org` → LIVRÉ** : bloc **`org-tenancy`** du châssis web-saas (`0006_org_tenancy.sql` orgs/members/invitations + RLS par org + helpers lesson #15, `lib/org/*`, `components/org/org-switcher.tsx`, `tsc`-vert ; `_shared/blocks/web-saas/BLOCKS.md`). `org-billing` = extension typée (stub documenté).
> - **`ecommerce` → LIVRÉ (logique commerce + SQL + pièges)** : le bloc **`_shared/blocks/ecommerce/`** **existe** — logique testée `lib/pricing` (P2, recalcul serveur) · `lib/inventory` (P1, décrément atomique) · `lib/cart` / `lib/orders` · `webhook` (P3, idempotent), **migrations SQL** (schéma / RLS + RPC `fulfill_paid_order` = P1+P2+P3), `verify:machine` (5 lints) + tests `node:test` **verts**, **dependency-light** (comme `automation/`). Archétype **de PREMIÈRE CLASSE** : détection en **01**, socle **EC1-EC5** en **07**, patterns `skills/09-architecture/references/data-model.md` **§Variante ECOMMERCE**, **Stripe one-shot** (`mode:payment`, jamais abonnement), recette live = **achat de test réel**, metrics = **funnel e-commerce**. L'**UI/app** (vitrine / panier / checkout / back-office / route webhook Next) se **dérive du socle web-saas** en **remplaçant `billing` (abonnement) par le checkout one-shot** — documentée dans `_shared/blocks/ecommerce/BLOCKS.md`, **pas compilée** dans ce châssis. Manifeste : `_shared/blocks/ecommerce/BLOCKS.md` ; fiche : `_shared/archetypes/ecommerce.md`.
>
> Règle : là où une route dit « socle landing » / « substrat org », lire encore **archétype défini au modèle ; scaffold code = Thème C / à bâtir** ; pour « socle automation » **et** « socle ecommerce », lire **scaffold LIVRÉ** (`_shared/blocks/automation/`, `_shared/blocks/ecommerce/`) — pour `ecommerce`, la **logique commerce (+ SQL + pièges) est livrée** et l'**UI se dérive de web-saas**.
>
> 🚨 **Comportement de run — honnêteté sur le périmètre (NE PAS BLUFFER, ni sur- ni sous-vendre).** Les **4 archétypes + le substrat org sont couverts au châssis** : `web-saas` / `automation` (A-à-Z clé-en-main), `ecommerce` (logique + SQL + pièges P1/P2/P3 **LIVRÉS**, UI dérivée du socle web-saas), `landing` (**assemblage clé-en-main** du sous-ensemble web-saas — blocs livrés), `multi-org` (bloc **`org-tenancy` livré**). Ce qui **reste** et se **signale** honnêtement : **(a)** pour un `landing`, les **étapes amont 02/03/05 sont encore calibrées web-saas** (à alléger à la main — un landing n'a pas besoin d'une analyse marché aussi lourde) ; **(b)** l'**épreuve run** (build SSR + E2E sur Supabase/env réels) se fait à la 1re instanciation, comme tout web-saas (`MOAT-STATUS.md`).
> - **Cas `landing`** : *« Le châssis est **couvert** — le `landing` s'assemble clé-en-main par sélection du sous-ensemble web-saas (skeleton + `waitlist` + notifications + légal, tous livrés). Reste une **calibration amont** : les étapes 02/03/05 sont calibrées web-saas et seront **allégées à la main** pour un landing. »* — pas de blocage, juste la transparence sur l'amont.
> - **Cas `multi-org`** : le substrat **`org-tenancy` est livré** (bloc web-saas : `orgs`/membres/invitations + RLS par org + switch) — le run l'active **sans réserve de scaffold**.
> - **Cas `ecommerce`** : *« Le **châssis `_shared/blocks/ecommerce/` est LIVRÉ et vérifié** : il fournit la **logique commerce + le SQL + les pièges P1/P2/P3** (`lib/pricing` recalcul serveur, `lib/inventory` décrément atomique, `lib/cart`/`lib/orders`, `webhook` idempotent, migrations RLS + RPC `fulfill_paid_order`, `verify:machine` + tests `node:test` **verts**). L'**UI/app** (vitrine / panier / checkout / back-office / route webhook Next) se **dérive du socle web-saas** en **remplaçant le `billing` abonnement par le checkout Stripe one-shot** — documentée dans le `BLOCKS.md` du châssis, non compilée. La détection (01), le socle EC1-EC5 (07), les patterns (09 §Variante ECOMMERCE) et les pièges P1-P3 (survente / intégrité du prix / idempotence du webhook) sont **définis et appliqués** — c'est un archétype de première classe, **PAS un web-saas déguisé**. »* Puis il propose : dérouler le build (logique livrée du châssis `ecommerce` + UI dérivée de web-saas, socle **EC1-EC5** + pièges **P1-P3** conservés et vérifiés).
>
> **La transparence prime** : le run DIT l'état réel — `web-saas`/`automation` couverts A-à-Z clé-en-main ; `ecommerce` = logique livrée (`_shared/blocks/ecommerce/`) + UI dérivée de web-saas ; `landing` = **assemblage clé-en-main livré** (reste la calibration amont 02/03/05) ; `multi-org` = substrat **`org-tenancy` livré**. La divergence silencieuse 02/03/05 que l'audit avait trouvée est désormais réduite à une **calibration amont signalée** (plus un « scaffold manquant ») — `CONTRIBUTING.md`.

## Sommaire

- Ordre de lecture du routage (toujours dans cet ordre)
- Archétype **web-saas** (défaut) — matrice étape × type
- Archétype **landing** — pipeline allégé (page marketing seule)
- Archétype **automation** — pipeline headless (worker / cron / bot / intégration)
- Archétype **ecommerce** — pipeline boutique (catalogue / panier / checkout one-shot / commandes / stock)
- Portes actives (par archétype × type)
- Garde-fous (à conserver tels quels + archétype)
- Où le routage se décide, où il s'applique
- Cas limites

## Ordre de lecture du routage (toujours dans cet ordre)

1. **`archetype` D'ABORD** — choisit la **famille de pipeline** et le **socle** (07 n'est plus universel, il dépend de l'archétype) :
   - **web-saas** (défaut) → pipeline complet, socle **UI produit** (matrice type × étape ci-dessous) ;
   - **landing** → route **LANDING** (allégée, publique, **SEO conservé**, **PAS d'auth/dashboard**) ;
   - **automation** → route **AUTOMATION** (headless, **PAS de socle UI**, **boucle fermée obligatoire**) ;
   - **ecommerce** → route **ECOMMERCE** (boutique publique, socle **EC1-EC5** = catalogue/panier/checkout one-shot/commandes/stock, **PAS le socle UI S1-S8**, **billing = one-shot jamais abonnement**, **pièges P1-P3 non négociables**).
2. **`type` ENSUITE** — module la cérémonie marché (02-04) et publication (17) **à l'intérieur** de l'archétype. `public` = complet ; `interne`/`perso` = allégé.
3. **`tenancy` ENFIN** (web-saas uniquement) — `multi-org` **ajoute** le substrat org sans changer la cérémonie de son `type`.

> Règle inchangée : le routage **saute des ÉTAPES, jamais des PHASES**. On traverse toujours les 6 orchestrateurs ; certains déroulent moins d'étapes. Une phase « allégée » reste invoquée (elle porte la MAJ d'état + la porte éventuelle).

---

## Archétype **web-saas** (défaut) — matrice étape × type

L'app actuelle : auth + BDD + dashboard. Socle **UI produit** (onboarding wizard qui crée l'entité cœur, dashboard non-vide, empty states, profil/settings…).

| Étape | SaaS public | Outil interne | Outil perso |
|---|---|---|---|
| 01-discover | Exécuter (capte le triplet en Q1) | Exécuter | Exécuter |
| 02-market | Exécuter | Sauter | Sauter |
| 03-positioning | Exécuter | **Sauter** | Sauter |
| 04-demand-edge | Exécuter | Sauter | Sauter |
| 05-opportunity | Exécuter (complet) | Lite-mode : fit outils/process/sécurité | Lite-mode : utilité récurrente |
| 06-business-model | Exécuter (pricing.md) | Alléger : ROI interne (coût évité), PAS de pricing marché | Sauter |
| 07-product-spec | Exécuter (socle UI) | Exécuter | Alléger |
| 08-design-system | Exécuter | Alléger | Alléger |
| 09-architecture | Exécuter | Exécuter + bloc access-gate | Exécuter + bloc access-gate |
| 10-execution-plan | Exécuter | Exécuter | Exécuter |
| 11-project-setup | Complet (DNS public, email, billing si vend) | Alléger : sous-domaine optionnel, signup désactivé + invitations | Alléger : URL par défaut du provider, pas de DNS, compte unique seedé |
| 12-build | Landing complète exigée | Pas de landing (racine = login) ; gate = « pas de template châssis visible » | Idem interne |
| 14-qa | Parcours avec upgrade si billing | Parcours sans upgrade + test « signup anonyme refusé » | Idem, persona toi |
| 15-client-review | Persona founder | Persona sponsor interne | Toi-même (très court) |
| 16-seo | Exécuter (plafond 3-8 pages) | Sauter + noindex | Sauter + noindex |
| 17-deploy | Complet + porte | Porte conditionnelle + check signup refusé | Preview URL coût nul = pas de porte |
| **17b-recette-live-auth.** | **Complète, multi-rôles + matrice cross-tenant** (au max en `multi-org`) | **Complète + cross-tenant** (+ « signup anonyme refusé ») | **Preuve d'action authentifiée** (cross-tenant sans objet — mono-tenant) |
| 18-metrics | Funnel AARRR complet | Adoption interne | Usage réel, allégé |
| 19-retro | Exécuter | Exécuter | Alléger (mémoire conservée) |

**Tranché : `03-positioning` est SAUTÉE pour un outil interne.** Pas d'edge concurrentiel à formaliser — le fit-entreprise du lite-mode de 05 couvre le besoin. Toute mention contraire ailleurs (« interne → allège 03 ») est périmée : cette table fait foi.

(`13-reviews` n'apparaît pas : la cascade tourne pour **tous** les archétypes/types — c'est sa *rigueur* qui se calibre, dans la Phase 4.)

### Tenancy web-saas — `single` (défaut) vs `multi-org`

- **`single`** (défaut) : mono-compte / mono-org — la matrice ci-dessus s'applique telle quelle.
- **`multi-org`** (SaaS B2B **vendu à N entreprises**) = **web-saas + public + multi-org**. La cérémonie **suit le `type` public** — donc **landing + pricing (06) + SEO (16) CONSERVÉS** (on l'acquiert publiquement) — **PLUS** l'activation du **substrat org-tenancy** (bloc web-saas **LIVRÉ** : `0006_org_tenancy.sql` + `lib/org/*` + org-switcher, RLS par org). Deltas :
  - **07** : entité **Org** + membres + invitations + **switch d'org** + **rôles org** entrent au socle (Org déjà modélisée en pattern par défaut, `09/data-model.md`) ;
  - **09** : substrat multi-tenant org-based (isolation par org) ; **SSO** et **billing PAR ORG** en options ;
  - **11** : provisioning billing par org si vendu ; SSO org optionnel.

🚨 **Ne pas confondre les deux « B2B ».** L'ancien routage rangeait à tort « B2B fermé » dans l'**interne mono-org**. À distinguer désormais :
- **outil interne d'équipe / B2B fermé** = **web-saas + interne** (mono-org) → **PAS** de landing/pricing/SEO (route interne, ci-dessus) ;
- **SaaS B2B commercial multi-entreprise** = **web-saas + public + multi-org** → landing/pricing/SEO **CONSERVÉS** + substrat org.

---

## Archétype **landing** — pipeline allégé (page marketing seule)

Livrable = **page marketing seule** (+ waitlist/CTA optionnelle). **PAS d'auth, PAS de BDD produit, PAS de dashboard, PAS d'onboarding wizard, PAS d'entité cœur CRUD.** Le socle n'est **pas** le socle UI produit : c'est le **socle LANDING** (sections du landing-playbook + légal adapté à `jurisdiction` + waitlist/CTA + métadonnées/OG) — défini au modèle (`_shared/state-schema.md`), **assemblage clé-en-main LIVRÉ** (sélection du sous-ensemble web-saas : `components/landing/*` + `waitlist` + notifications + légal, tous livrés `tsc`-verts) ; briques : `05-opportunity/references/go-test-playbook.md`, `components/landing/*`.

| Étape | landing (généralement `public`) |
|---|---|
| 01-discover | Exécuter (capte archétype=landing en Q1) |
| 02-market | Alléger : juste de quoi cadrer le message — **pas de dossier lourd** |
| 03-positioning | Alléger : **le positionnement = le message de la landing** (1 angle net), pas d'edge formalisé |
| 04-demand-edge | Sauter (la landing **EST** le test de demande) |
| 05-opportunity | Lite : « vaut-il la peine de publier cette landing ? » (1 décision) — cf. go-test-playbook |
| 06-business-model | Sauter (ou simple teaser pricing si la landing l'affiche) — **pas de billing** |
| 07-product-spec | **Socle LANDING** (sections landing-playbook, waitlist/CTA, légal, OG) — **pas de PRD produit, pas d'onboarding, pas d'entité cœur** |
| 08-design-system | **Charte : 1 décision de direction** |
| 09-architecture | Minimal : hébergement statique/landing + backend waitlist optionnel — **pas d'auth, pas de BDD produit** |
| 10-execution-plan | Exécuter (léger) |
| 11-project-setup | DNS **public** (la landing est publique) — **pas de billing, pas de signup/auth** — juste le formulaire waitlist |
| 12-build | Gate = **LANDING** (socle landing présent, pas de template châssis visible) — **pas de login racine** |
| 14-qa | Parcours : la landing charge, waitlist/CTA fonctionne, responsive, OG correct — **pas de flow auth** |
| 15-client-review | Persona founder / cible |
| 16-seo | **SEO LANDING ACTIF** (métadonnées, OG, technique verte) — la landing est publique, on la référence |
| 17-deploy | **Deploy public + porte** |
| **17b-recette-live-auth.** | **Sans objet** (landing = pas d'auth/dashboard/RLS) |
| 18-metrics | Conversions waitlist / clics CTA (signal de demande) |
| 19-retro | Exécuter |

🚨 **Distinguo clé landing vs interne/perso** : `landing` est **PUBLIQUE → SEO CONSERVÉ** (contrairement à web-saas interne/perso où 16 est sautée + noindex). Ce qui saute en landing, c'est l'**auth / dashboard / PRD produit**, **pas** le SEO.

---

## Archétype **automation** — pipeline headless (worker / cron / bot / intégration)

Livrable = **worker / cron / bot / intégration HEADLESS**. **PAS de socle UI produit, PAS d'onboarding wizard, PAS de dashboard produit** (admin minimal optionnel). Socle = **AUTOMATION** (config/secrets, historique de runs + logs, healthcheck, **boucle fermée OBLIGATOIRE** = alerte/rapport au propriétaire quand un run échoue/réussit, idempotence) — défini au modèle (`_shared/state-schema.md`), **scaffold LIVRÉ → `_shared/blocks/automation/`** (AU1-AU5 en `src/*` réels + harness de test + runner one-shot ; manifeste : son `README.md`). Le plus souvent `interne`.

| Étape | automation (généralement `interne`) |
|---|---|
| 01-discover | Exécuter (capte archétype=automation en Q1) |
| 02-market | Sauter |
| 03-positioning | Sauter |
| 04-demand-edge | Sauter |
| 05-opportunity | Lite : fit process / temps gagné, **boucle à fermer** clairement nommée |
| 06-business-model | ROI interne (coût/temps évité) si interne — **pas de pricing** |
| 07-product-spec | **Socle AUTOMATION** (config/secrets, run history+logs, healthcheck, **boucle fermée**, idempotence) — **pas d'onboarding, pas de dashboard produit** |
| 08-design-system | Sauter / minimal (charte seulement si un **admin minimal** existe) |
| 09-architecture | Worker/cron/bot/intégration : ordonnancement, secrets, **idempotence**, store de runs + bloc access-gate pour l'admin |
| 10-execution-plan | Exécuter |
| 11-project-setup | Host worker/scheduler + secrets — **pas de DNS public** (sauf endpoint webhook), **pas de billing** |
| 12-build | Gate = **socle automation présent** (config, run history, healthcheck, boucle fermée, idempotence) — **pas de landing, pas de dashboard**, headless (admin minimal au plus) |
| 14-qa | Parcours : déclencher un run → logs enregistrés → **boucle fermée déclenchée** (alerte/rapport) → **idempotence vérifiée** (re-run ne double pas) — pas de test signup |
| 15-client-review | Persona **propriétaire** de l'automatisation |
| 16-seo | **Sauter + noindex** (headless, pas de pages publiques) |
| 17-deploy | **Deploy worker/cron** (ordonnanceur actif, healthcheck vert) + porte conditionnelle — pré-vol/rollback identiques |
| **17b-recette-live-auth.** | **Remplacée** par la vérif de **boucle fermée** en connecté/headless (run → logs → boucle → idempotence, déjà portée par 14/17) — pas de recette d'auth utilisateur |
| 18-metrics | Taux de succès des runs, déclenchement de la boucle fermée |
| 19-retro | Exécuter |

🚨 **Boucle fermée = non négociable en automation** (cf. `_shared/boucles-fermees.md`) : un worker/cron qui échoue en silence n'est **pas** livrable. La porte 12 et le parcours 14 vérifient qu'un run raté/réussi **notifie/rapporte** au propriétaire.

---

## Archétype **ecommerce** — pipeline boutique (catalogue / panier / checkout one-shot / commandes / stock)

Livrable = **site de vente (boutique en ligne)** : catalogue de produits, panier, **paiement one-shot** (achat, PAS abonnement), commandes, stock. Le plus souvent `public`. **Auth CLIENT légère et optionnelle** : **checkout invité par défaut** (email suffit), compte client (historique de commandes) en **option** — jamais un prérequis à l'achat ; **back-office admin** (produits + commandes) au socle. Socle = **ECOMMERCE (EC1-EC5)**, **PAS** le socle UI S1-S8 web-saas. Défini au modèle (`_shared/archetypes/ecommerce.md`, `_shared/state-schema.md`), **scaffold `_shared/blocks/ecommerce/` = LIVRÉ** (logique commerce + SQL + pièges P1/P2/P3, `verify:machine` + tests `node:test` verts) → l'**UI se dérive du socle web-saas** (réutilise skeleton/ui-shell/notifications/legal ; **remplace `billing` abonnement par le checkout Stripe one-shot** ; câble la logique livrée du châssis : catalogue/panier/commandes/stock). C'est un archétype de **PREMIÈRE CLASSE**, **pas un web-saas déguisé**.

| Étape | ecommerce (généralement `public`) |
|---|---|
| 01-discover | Exécuter (capte archétype=ecommerce en Q1) |
| 02-market | Exécuter (boutique publique : marché / niche, comme web-saas public) |
| 03-positioning | Exécuter (angle de marque / de boutique) |
| 04-demand-edge | Exécuter |
| 05-opportunity | Exécuter (complet, public) — « vaut-il la peine d'ouvrir cette boutique ? » |
| 06-business-model | **Panier moyen / marge / coûts** (paiement one-shot) — **PAS de pricing d'abonnement** |
| 07-product-spec | **Socle ECOMMERCE (EC1-EC5)** : catalogue, panier, checkout one-shot, commandes + **boucle fermée**, stock — **PAS** le socle UI S1-S8, **PAS** de dashboard SaaS (le back-office admin ≠ dashboard) |
| 08-design-system | Exécuter : **archétype de structure « boutique »** (vitrine + fiche produit + panier + checkout + /merci) |
| 09-architecture | Exécuter : patterns e-commerce (`09/data-model.md` **§Variante ECOMMERCE**) + **pièges P1-P3** (survente / prix serveur / idempotence webhook) + Stripe `mode:payment` (jamais `subscription`) |
| 10-execution-plan | Exécuter |
| 11-project-setup | DNS **public** + **Stripe one-shot** (checkout + webhook signing secret, **pas** d'abonnement) + email confirmations — câble la **logique livrée** du châssis `_shared/blocks/ecommerce/` + UI dérivée du socle web-saas |
| 12-build | Gate = **socle ecommerce présent** (catalogue → panier → checkout → commandes → stock) ; cascade avec **cran sécurité RENFORCÉ sur P1-P3** ; **vitrine publique exigée** |
| 14-qa | Parcours d'**achat de test réel** : ajout panier → checkout Stripe test → webhook → **commande créée une seule fois** (P3) → **stock décrémenté atomiquement** (P1) → **prix recalculé serveur** (P2) → email confirmation client **ET** notif marchand (EC4) |
| 15-client-review | Persona founder / marchand |
| 16-seo | **SEO ACTIF** (boutique publique : pages produits / catégories indexées, OG, technique verte) |
| 17-deploy | **Deploy public + porte** + recette live = **achat de test réel bout-en-bout** (P1-P3 prouvés en prod) |
| **17b-recette-live-auth.** | **Achat de test réel** + actions RLS-protégées (un client voit **SES** commandes, l'admin toutes ; **refus cross-client** prouvé) — checkout invité + compte optionnel |
| 18-metrics | **Funnel e-commerce** : vue produit → ajout panier → checkout → achat ; **panier moyen**, taux de conversion, **abandon de panier** — **PAS** le funnel d'activation SaaS |
| 19-retro | Exécuter |

🚨 **P1-P3 = non négociables en ecommerce** (cf. `_shared/archetypes/ecommerce.md` §Pièges — l'équivalent de l'idempotence 2-grains d'automation) : **P1 survente / course sur le stock** (décrément **atomique** en base, jamais `SELECT stock` puis `if stock>0`), **P2 intégrité du prix** (montant **recalculé côté serveur** depuis le catalogue, **jamais** un total envoyé par le client), **P3 idempotence du webhook Stripe** (commande créée **une seule fois** malgré les redeliveries + signature vérifiée). Les trois **ne se voient pas au build** — la porte 12, la cascade **13** (**cran sécurité renforcé**) et le parcours 14 les vérifient explicitement ; **un seul non prouvé = porte fermée**. La **boucle fermée** (confirmation client + notif marchand, `_shared/boucles-fermees.md`) s'applique aussi : **aucune vente muette**.

🚨 **Distinguo clé ecommerce vs web-saas** : la valeur = **vendre des produits**, pas un workflow applicatif auth+dashboard. Le billing est un **checkout one-shot** (Stripe `mode:payment`), **jamais** un abonnement ; le socle est **EC1-EC5** (catalogue/panier/commandes/stock), **jamais** le socle UI **S1-S8** ; le back-office admin **n'est PAS** un dashboard SaaS. Exiger le socle web-saas d'une boutique = **faux-négatif d'archétype**.

---

## Portes actives (par archétype × type)

**web-saas** — par type :

| Porte | public | interne | perso |
|---|---|---|---|
| 🚪 Opportunité (05) | Go / Ajuster / Go-test / No-Go complet | décision d'utilité interne | décision build/non, très courte |
| 🚪 PRD (07) | oui | oui | oui (validation courte) |
| 🚪 Charte (08) | oui | oui | oui (1 décision de direction) |
| 🚪 Client-review (15) | oui — persona founder | oui — sponsor interne | oui — toi-même, très court |
| 🚪 Gate contenu SEO (16) | oui | — (16 sautée) | — (16 sautée) |
| 🚪 Publication (17) | oui — plan-then-apply complet | oui — conditionnelle + check « signup anonyme refusé » | **non** si cible = preview URL du provider à coût nul ; **oui** dès que ça touche un domaine public ou que ça dépense |
| 🚪 Kill / Continue (19) | oui, argumentée | oui | oui (peut être informelle) |

- **web-saas + multi-org** : portes du **type public** (landing/SEO/publication complètes) **+** la porte 07 vérifie le **substrat org** présent (Org, membres, invitations, switch, rôles).

> **17b (recette live authentifiée) n'est pas une porte utilisateur** mais un **contrôle BLOQUANT de fin de Phase 5** : dès qu'il y a auth + RLS, le produit n'est **« livré »** qu'après exécution **verte** de chaque action RLS-protégée de chaque rôle en prod connecté (2xx + ligne au bon tenant + notif `sent` + refus cross-tenant). Il ne figure donc pas dans les tables de portes ci-dessus mais reste **non contournable**. Détail : `skills/17-deploy/references/live-qa.md`, cadre `skills/phase-5-launch/SKILL.md` + règle d'or 19.

**landing** : 🚪 Opportunité (05, lite) · 🚪 Socle landing (07) · 🚪 Charte (08, 1 décision) · 🚪 Client-review (15) · **🚪 Gate SEO (16) OUI** (landing publique) · 🚪 Publication (17, deploy public complet). **Pas** de porte auth/dashboard (n'existent pas dans l'archétype).

**automation** : 🚪 Opportunité (05, lite : boucle nommée) · 🚪 Socle automation (07, dont **boucle fermée** + idempotence) · 🚪 QA run (14 : run → logs → boucle → idempotence) · 🚪 Publication (17, worker/cron, conditionnelle). **16 sautée + noindex.** **Pas** de porte landing/SEO.

**ecommerce** : 🚪 Opportunité (05, public) · 🚪 PRD / socle **EC1-EC5** (07) · 🚪 Charte « boutique » (08) · 🚪 Client-review (15) · **🚪 Gate SEO (16) OUI** (boutique publique) · **🚪 QA achat de test réel (14** : panier → checkout → webhook → **commande unique** → **stock décrémenté** → **prix serveur**) · 🚪 Publication (17, deploy public complet). **Cran sécurité RENFORCÉ P1-P3 (survente / prix / idempotence) en 12/13/14 — un seul non prouvé = porte fermée.** **17b (recette live authentifiée) non contournable** dès qu'il y a RLS commandes.

## Garde-fous (à conserver tels quels + archétype)

- **Socle = celui de l'ARCHÉTYPE.** La règle « existence des éléments non négociable » de `07/completeness-baseline` devient « existence des éléments **de l'archétype** » : web-saas → socle UI ; landing → socle landing ; automation → socle automation ; **ecommerce → socle EC1-EC5** (catalogue/panier/commandes/stock). On **n'injecte plus** le socle UI S1-S8 d'office sur un archétype landing/automation/**ecommerce** (dashboard parasite = bug corrigé par l'audit v0.4.4).
- **Étapes sautées tracées** dans `state.md` (« 02-market : sautée (route perso) », « 16-seo : sautée + noindex (archétype automation) »), jamais silencieuses.
- **Sections « non applicable » explicites** dans les artefacts : on dit ce qui manque **par conception d'archétype**, on ne comble pas.
- **Interdiction de fabriquer un marché manquant** : une route sans 02-04 ne « devine » pas de données marché.
- **Défauts prudents** : archétype = **web-saas**, type = **public**, tenancy = **single**. Archétype **ou** type ambigu à l'étape 01 → ne devine pas : ce sont les questions de cadrage qui valent d'être posées franchement (elles changent tout le reste). À défaut, cérémonie complète plutôt que sauter une validation qui manquerait.
- **Déploiement interne / landing / automation ≠ déploiement bâclé** : pré-vol, plan, apply réversible, canary restent — seules changent la **surface publique** et la **cible** (page publique / worker-cron) selon l'archétype.
- **17b jamais sautée quand l'archétype porte auth + RLS** : « ship plus vite » ne la supprime pas (les bugs RLS/scoping/junction ne surgissent **qu'en connecté**). Un web-saas à auth n'est **jamais « livré »** sur un simple canary vert — il faut la recette live authentifiée VERTE (règle d'or 19, `_shared/lessons.md`).
- **Scaffold : les 4 archétypes + le substrat org sont couverts.** `_shared/blocks/automation/` (AU1-AU5 + harness) et `_shared/blocks/ecommerce/` (logique + SQL + pièges P1/P2/P3, `verify:machine` + tests verts) **existent** ; `landing` s'**assemble clé-en-main** du sous-ensemble web-saas (skeleton + `components/landing/*` + `waitlist` + notifications + légal, tous livrés `tsc`-verts) et le substrat **`org-tenancy` est livré** (bloc web-saas `0006_org_tenancy.sql` + `lib/org/*` + switch, `tsc`-vert). Pour `ecommerce`, la logique est livrée et l'**UI se dérive du socle web-saas**. **Reste**, pour un `landing`, la **calibration amont 02/03/05** (allégée à la main) + l'épreuve run à la 1re instanciation — le signaler honnêtement, ni sur- ni sous-vendre.

## Où le routage se décide, où il s'applique

- **Décidé** : à l'étape 01 (le triplet `archetype` + `type` + `tenancy`), relayé par le master dans l'état **dès la fin de P1**.
- **Appliqué** : par chaque orchestrateur de phase, qui lit le triplet dans `.saas-factory/state.md` et **route selon ce fichier**. Le master n'a pas à micro-piloter : il **transmet le cadrage** et vérifie que l'état porte bien `Archétype` + `Type / route` + `Tenancy` + `Ambition`.

## Cas limites

- **Changement de `type` en cours de route** (ex. un « perso » qu'on décide de rendre public) : **retour arrière** de cadrage → mets à jour `Type / route` dans l'état, réactive les étapes précédemment sautées (marché 02-04, SEO 16) si la phase concernée n'est pas encore passée. Si elle est passée, signale-le honnêtement (on ne rejoue pas P1 sans le dire).
- **Changement d'`archetype`** (ex. une `landing` qu'on décide de transformer en `web-saas`, ou l'inverse ; ou un `web-saas` repositionné en boutique `ecommerce` — le `billing` abonnement devient un checkout one-shot, on ajoute catalogue/panier/stock) : c'est un **changement de SOCLE et de famille de pipeline** — retour arrière de cadrage **majeur**. Mets à jour `Archétype`, signale honnêtement que le pipeline change de famille (socle landing ≠ socle UI ≠ socle automation ≠ socle EC1-EC5 ecommerce) ; ne prétends pas récupérer sans coût des étapes qui n'existaient pas dans l'archétype précédent.
- **Promotion `single` → `multi-org`** : active le substrat org (07/09/11) ; si 07/09 sont déjà passés, signale que le substrat org (Org, membres, invitations, switch, rôles) doit être rajouté — bloc **`org-tenancy` LIVRÉ** (web-saas), on l'active.
