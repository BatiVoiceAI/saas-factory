# BLOCKS — châssis `ecommerce`

Inventaire des **blocs** du châssis d'archétype `ecommerce`. Contrairement au châssis `web-saas` (blocs S1-S8, features UI assemblées) et au châssis `automation` (headless AU1-AU5), ce châssis livre **la LOGIQUE commerce + le SQL + les pièges** d'une boutique — testable **sans réseau, sans Next.js**. L'**UI/app** (vitrine, back-office, route webhook Next) **LAYER sur le châssis `web-saas`** : elle est **dérivée par projet** et **documentée** ici (§ UI / app), **pas compilée** dans ce châssis.

Chaque bloc mappe le socle **EC1-EC5** de `../../archetypes/ecommerce.md` et les trois pièges **P1/P2/P3** (exigences DURES, portes 13/14). Références doctrinales : `../../archetypes/ecommerce.md` (fiche archétype) · `../../skills/09-architecture/references/data-model.md §Variante ECOMMERCE` (schéma, RLS, RPC) · `../../boucles-fermees.md` (boucle fermée EC4) · `../../lessons.md` (lesson #15, appliquée à la RPC).

**Argent en CENTS ENTIERS partout** (`*_cents` SQL ↔ `Cents` TS) — jamais un flottant, aligné sur Stripe. **Tenant = le marchand** (une boutique = une instance) : **pas** d'`org_id`/`tenant_id` (le faux-positif miroir de l'automation, à l'envers). Le **catalogue est public** (`anon`) ; le **cœur transactionnel** (commandes/stock) est protégé.

---

## EC1 — Catalogue → `migrations/0001_catalog.sql` · `src/types.ts`
**Le catalogue public : categories / products / variants.**
- Tables `categories`, `products`, `variants` (+ `is_store_admin()`, helper d'accès back-office porté par `app_metadata.role` du JWT). **RLS** : `anon`/`authenticated` lisent les **publiés** (`published = true`), l'**admin** voit les brouillons et écrit. Aucune PII au catalogue.
- Vue **`products_public`** (`security_invoker = false`) : projection publique à **colonnes explicites** exposant `in_stock` (booléen **dérivé** de `inventory.stock`), **jamais** le compte brut — la surface `anon` de la dispo (EC5).
- Types : `Category`, `Product`, `Variant`, `PublicProduct`, `Uuid`, `Cents`, `CurrencyCode`. Prix `price_cents integer check (>= 0)`.
- **Pas de module `src/` de lecture** : le catalogue se lit au **call-site app** (PostgREST / `products_public`). Ce châssis en fixe le **schéma + les types + la RLS**.

## EC2 — Panier → `src/cart.ts` · `migrations/0002_orders_inventory.sql` · `src/types.ts`
**Le panier : opérations PURES, AUCUN prix de confiance (P2).**
- `addItem` / `removeItem` / `setItemQty` : pures, **immuables** (nouveau tableau), invariant `unique (cart_id, product_id)` (fusion des quantités) + `qty > 0` (miroir du `CHECK` SQL). `cartSubtotal` **DÉLÈGUE** à `computeOrderTotal` (`pricing.ts`) — le prix vient du **catalogue serveur**, jamais du panier.
- Tables `carts` (scopé `cart_token` invité **ou** `user_id`) + `cart_items` (**`product_id` + `qty` UNIQUEMENT**, zéro colonne de prix). RLS : le connecté gère **son** panier ; l'invité est **médié serveur** (cookie httpOnly).
- Types : `CartItem = { productId, qty }` (le type **interdit** structurellement un prix — c'est P2 au niveau du contrat), `Cart`.

## EC3 — Checkout + paiement ONE-SHOT → `src/pricing.ts` · `src/webhook.ts` (+ route app)
**Le montant fait foi CÔTÉ SERVEUR (P2) ; la vente se matérialise au webhook (P3).**
- `pricing.computeOrderTotal(items, catalog)` : **recalcule** le total depuis le catalogue serveur (`Map<productId → cents>`) à partir des **seuls** `(productId, qty)` — c'est ce montant qui alimente les **line items de la Checkout Session Stripe** (`mode:payment`, **jamais** `subscription`) **et** l'affichage. Fonction **pure**, catalogue **injecté**.
- La **création de la session** est **app-layer** (route Next, `metadata.cart_items = [{product_id, qty}]` + `user_id` optionnel). La **matérialisation** est `webhook.ts` (§ EC4/P3).

## EC4 — Commandes + boucle fermée → `src/orders.ts` · `migrations/0002_orders_inventory.sql` · `src/webhook.ts`
**La commande de domaine (snapshot) + « aucune vente muette ».**
- `orders.buildOrderFromPaidSession(session, catalog)` : construit l'entête `Order` (draft) + les `OrderItem[]` au **prix serveur figé** (snapshot du prix **et** du libellé, comme la RPC 0003) — la matière de l'e-mail de confirmation **client** et de la notif **marchand**. Fonction **pure**.
- Tables `orders` (**`unique(stripe_session_id)`** — P3 ; `total_cents` recalculé serveur — P2 ; `user_id` null = **invité**) + `order_items` (**snapshot** `unit_price_cents` + `product_name`, `on delete set null` sur le produit). RLS : le client voit **SES** commandes, l'admin **toutes**, écriture **`service_role` uniquement** (webhook).
- **Boucle fermée EC4** : le handler `webhook.ts` renvoie l'issue (`created` / `duplicate-ignored`) ; c'est la **route app** qui envoie la confirmation **client** + la notif **marchand** (Resend) **UNIQUEMENT sur `created`** — 3 redeliveries ⇒ **1 e-mail** (P3 se propage à EC4).

## EC5 — Inventaire / stock → `src/inventory.ts` · `migrations/0002` · `migrations/0003` · `products_public.in_stock`
**Anti-survente (P1) : décrément ATOMIQUE, jamais un check applicatif.**
- `inventory.decrementStock(productId, qty, atomicDecrement)` : **miroir PUR et TESTABLE** de l'`update inventory set stock = stock - qty where stock >= qty`. Ne **LIT JAMAIS** le stock : délègue le décrément conditionnel à l'atome **injecté** et branche sur le **nombre de lignes affectées** (`1` = vendu, `0` = `OutOfStockError`). Le vrai décrément, transactionnel, vit dans la **RPC 0003**.
- Table `inventory` (grain **produit**, `CHECK (stock >= 0)`, **service-role only** : aucune policy `anon`/`authenticated`). La dispo au catalogue passe par `products_public.in_stock`.

## Les pièges DURS — P1 / P2 / P3 (récap : où chacun vit)
| Piège | Garde SQL | Garde TS | Preuve sans réseau |
|---|---|---|---|
| **P1 — survente** | `migrations/0003` (`update … where stock >= qty`) + `0002` (`CHECK (stock >= 0)`) | `inventory.ts` (`decrementStock`, zéro read-then-write) | `test/inventory.test.ts` (2 & N décréments concurrents) |
| **P2 — prix** | `0003` (`select products.price_cents`) + `0002` (`cart_items` sans prix, `order_items` snapshot) | `pricing.ts` (`computeOrderTotal`) + `CartItem` sans prix | `test/pricing.test.ts` (prix client ignoré) |
| **P3 — idempotence** | `0002` (`unique(stripe_session_id)`) + `0003` (`on conflict do nothing`) | `webhook.ts` (`verifyStripeSignature` + `handleStripeWebhook`) | `test/webhook.test.ts` (3 redeliveries ⇒ 1 commande ; signature invalide ⇒ 0 écriture) |

## RPC transactionnelle → `migrations/0003_fulfill_paid_order.sql`
`fulfill_paid_order(p_stripe_session_id, p_customer_email, p_user_id, p_items jsonb)` : **P1 + P2 + P3 dans UNE transaction** (décrément atomique + prix serveur + idempotence). `security definer`, `set search_path = ''`, **lesson #15** intégrale (`#variable_conflict use_column`, params `p_`, vars `v_`, colonnes qualifiées, `revoke` puis `grant execute to service_role`). ⚠️ Sa vérité (0 erreur 42702, P1 sous concurrence, P3) se **prouve par smoke-test contre une vraie base** (étape 11 / Phase 4), **invisible** au `tsc`.

## Support → `src/config.ts` · `src/supabase.ts`
- `config.ts` : schéma **zod** de `process.env` → `loadConfig()` (fail-fast). Trois paires **REQUISES** (divergence assumée vs automation : une boutique n'a **aucun** fallback crédible) — Supabase (service-role) · Stripe (secret + webhook) · Resend (boucle fermée EC4).
- `supabase.ts` : client **REST minimal** (`restUrl`, `restHeaders` service-role, `rpc/<fn>`), **couture `fetch` injectable** (`resolveFetch` / `FetchImpl`) → testable sans réseau. **Zéro SDK** (miroir exact du châssis automation).

## Persistance → `migrations/0001_catalog.sql` · `0002_orders_inventory.sql` · `0003_fulfill_paid_order.sql`
Appliquées dans l'ordre. **0001** : catalogue + RLS publique + `products_public`. **0002** : panier/stock/commandes + RLS + `unique(stripe_session_id)` (P3) + `CHECK (stock >= 0)` (P1). **0003** : la RPC `fulfill_paid_order` (P1+P2+P3).

## Test → `test/_smoke.test.ts` · `test/pricing.test.ts` · `test/inventory.test.ts` · `test/webhook.test.ts`
- **`_smoke.test.ts`** : sentinelle du runner `node --test --import tsx` + **patron de fixtures loopback** (`loopbackFulfillRpc()` en mémoire + `signStripe()` HMAC réel) + fumée transverse (config, EC2, EC4, P1/P2/P3).
- **`pricing.test.ts` (P2)**, **`inventory.test.ts` (P1, concurrence)**, **`webhook.test.ts` (P3, signature + idempotence)** : les **preuves DURES**, chacune SANS réseau (deps injectées).

## Plancher machine → `scripts/verify-machine.mjs`
**5 lints** (exit 1 si un échoue), tournent **avant `npm ci`** : `lint:secrets` + `lint:sql` (réutilisés **tels quels** du châssis automation) + **`lint:P1`** (décrément atomique en SQL + zéro read-then-write JS) + **`lint:P2`** (`computeOrderTotal` exporté + panier sans prix) + **`lint:P3`** (`unique(stripe_session_id)` + signature + upsert idempotent).

---

## UI / app : LAYER sur `web-saas` (dérivé par projet, **PAS compilé ici**)
Ce châssis fournit la **LOGIQUE + le SQL + les pièges** ; l'**app se dérive du châssis `web-saas`** en **remplaçant le bloc `billing` (abonnement Stripe) par le checkout ONE-SHOT** (`mode:payment` + webhook `fulfill_paid_order`). Elle **réutilise le socle web-saas** : `skeleton`, `ui-shell`, `notifications` (Resend), `legal` (**CGV de vente** adaptées à `jurisdiction`), `repo-ci`, `hosting`. Ce qui se dérive :

| Surface app (Next, sur web-saas) | Rôle | S'appuie sur (ce châssis) |
|---|---|---|
| `app/(shop)/` | **vitrine** (catalogue), **fiche produit**, **panier**, **checkout**, **/merci** | `products_public` (EC1) · `cart.ts` (EC2) · `computeOrderTotal` pour les line items de la **Checkout Session** `mode:payment` (EC3/P2) |
| `app/(admin)/` | **back-office** : produits (CRUD), commandes (voir / expédié / remboursé), stock | `is_store_admin()` + RLS (EC1) · `orders`/`order_items` (EC4) · `inventory` (EC5) |
| `app/api/stripe/webhook/` | **route webhook** Next (paiement = source de vérité) | `handleStripeWebhook(rawBody, sig, buildWebhookDeps(config))` → sur `created` : boucle fermée EC4 (confirmation **client** + notif **marchand**, Resend) ; sur `duplicate-ignored` : **rien** (P3) |

> **Frontière nette.** Ce châssis expose des **fonctions pures + deps injectées** (`buildWebhookDeps`, `computeOrderTotal`, `buildOrderFromPaidSession`, `decrementStock`) ; la route Next fournit le `rawBody` **exact** (indispensable au HMAC) et **envoie** les e-mails EC4 (Resend) au bon moment. Le châssis **décide** (issue idempotente), l'app **agit** (I/O).

## Ce que ce châssis n'a PAS (par périmètre)
Pas de **Next.js/`app/`** compilé, pas de composant React, pas de bloc **`billing` abonnement**, **pas de SDK** (`stripe`/`@supabase/supabase-js`/`resend` — tout en REST `fetch` + `node:crypto`). L'**auth produit** n'est pas ici (l'admin dérive du JWT `app_metadata.role` en autonome, ou se branche sur le bloc `auth` du socle web-saas — cf. `is_store_admin()`). L'**envoi effectif** des e-mails EC4 (Resend) est au **call-site** (route webhook), pas dans ce châssis minimal — le châssis en fournit la **matière** (`buildOrderFromPaidSession`) et le **déclencheur** (issue `created`).
