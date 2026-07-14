# Bloc / châssis — archétype `ecommerce`

Châssis de la **LOGIQUE commerce** de l'archétype `ecommerce` (boutique en ligne : catalogue, panier, checkout **one-shot**, commandes, stock) — parallèle aux châssis `web-saas` et `automation`. Il fournit **la logique + le SQL + les pièges**, **testable sans réseau et sans Next.js**. Il implémente le socle **EC1-EC5** de `../../archetypes/ecommerce.md` et **blinde les trois pièges DURS** de l'archétype (P1/P2/P3, portes 13/14).

> **Ce châssis ne compile PAS l'UI.** La vitrine, le back-office et la route webhook Next **LAYER sur le châssis `web-saas`** (dérivés par projet, remplaçant le bloc `billing` **abonnement** par le **checkout one-shot**). Voir `BLOCKS.md §UI / app`. Ici : **la logique testable + le schéma SQL + les garde-fous**.

Ce README est le **manifeste** du bloc : il fait foi pour les noms de fichiers exacts.

## Manifeste des fichiers

| Fichier | Socle / piège | Rôle |
|---|---|---|
| `src/config.ts` | Support | Schéma **zod** de `process.env` → `loadConfig()` : parse + valide, **échoue tôt**. Trois paires **REQUISES** (Supabase service-role · Stripe secret + webhook · Resend) — une boutique n'a **aucun** fallback crédible (divergence assumée vs automation). |
| `src/supabase.ts` | Support | Client Supabase **REST minimal** (`restUrl`, `restHeaders` service-role, `rpc/<fn>`). **Couture `fetch` injectable** (`resolveFetch` / `FetchImpl`) → testable sans réseau. **Zéro SDK** (miroir du châssis automation). |
| `src/types.ts` | EC1-EC5 | Le **contrat de types** (miroir 1-pour-1 du SQL). **Argent en cents entiers** (`Cents`). **`CartItem = { productId, qty }`** : le panier **ne peut pas** porter de prix (P2 au niveau du type). |
| `src/pricing.ts` | **EC3 / P2** | `computeOrderTotal(items, catalog)` : **recalcule** le total depuis le catalogue **serveur** (product_id + qty seulement) — tout prix client est ignoré. Fonction **pure**, catalogue **injecté**. |
| `src/cart.ts` | **EC2** | `addItem` / `removeItem` / `setItemQty` : ops **pures immuables** (invariants `unique(cart,product)` + `qty > 0`). `cartSubtotal` **délègue** à `pricing` (le prix = serveur). |
| `src/inventory.ts` | **EC5 / P1** | `decrementStock(productId, qty, atomicDecrement)` : **miroir pur** du décrément conditionnel atomique — `1` ligne = vendu, `0` = `OutOfStockError`. **Ne lit jamais** le stock (zéro read-then-write). |
| `src/orders.ts` | **EC4** | `buildOrderFromPaidSession(session, catalog)` : construit l'`Order` (draft) + les `OrderItem[]` au **prix serveur figé** (snapshot) — la matière des e-mails de la **boucle fermée** EC4. Fonction **pure**. |
| `src/webhook.ts` | **P3 / P2** | `handleStripeWebhook(rawBody, sig, deps)` : **signature vérifiée AVANT la DB** (`verifyStripeSignature`, HMAC `node:crypto`, **zéro SDK Stripe**) puis **upsert idempotent** sur `stripe_session_id`. `buildWebhookDeps(config)` câble la prod. |
| `migrations/0001_catalog.sql` | EC1 | `categories` / `products` / `variants` + vue **`products_public`** (`in_stock` dérivé) + `is_store_admin()`. **RLS** : lecture des **publiés** à `anon`, écriture **admin**. |
| `migrations/0002_orders_inventory.sql` | EC2/EC4/EC5 · P1/P3 | `carts`/`cart_items` (**sans prix**) · `inventory` (**`CHECK (stock >= 0)`**, service-role only) · `orders`/`order_items` (snapshot ; **`unique(stripe_session_id)`**). RLS complète. |
| `migrations/0003_fulfill_paid_order.sql` | **P1+P2+P3** | RPC `fulfill_paid_order` : décrément atomique **+** prix serveur **+** idempotence dans **UNE transaction**. **lesson #15** intégrale. |
| `test/_smoke.test.ts` | — | Sentinelle du runner + **patron de fixtures loopback** (`loopbackFulfillRpc()` + `signStripe()`) + fumée transverse. |
| `test/pricing.test.ts` · `inventory.test.ts` · `webhook.test.ts` | P2 · P1 · P3 | Les **preuves DURES** de chaque piège, SANS réseau (deps injectées). |
| `scripts/verify-machine.mjs` | Plancher machine | **5 lints** : `secrets` + `sql` (réutilisés du châssis automation) + **`P1`/`P2`/`P3`** (structurels). |
| `.env.example` | Support | **Noms** de secrets uniquement — jamais de valeurs. |
| `package.json` · `tsconfig.json` | — | ESM strict NodeNext, `tsc --noEmit`- et `npm test`-vérifiable. |

## Design — dependency-light
- **Runtime = Node 20+ built-ins uniquement** : `fetch` global (Supabase REST, appel de la RPC), `node:crypto` (vérification HMAC de la signature Stripe — **zéro SDK `stripe`**).
- **Une seule dépendance externe** : `zod` (validation de la config + des métadonnées du webhook). Dev : `typescript`, `@types/node`, `tsx`.
- **Pas de** `@supabase/supabase-js`, **pas de** SDK `stripe`/`resend`, **pas de** Next.js/`app/` → tout en REST via `fetch` → deps minimales → `tsc` rapide.
- **Fonctions PURES + dépendances INJECTÉES** (catalogue, décrément atomique, `fetch`, `verifySignature`, `upsertOrder`) → **P1/P2/P3 se prouvent SANS réseau réel**, comme les tests du châssis automation.
- ESM TypeScript strict (`module`/`moduleResolution` **NodeNext** → les imports relatifs portent l'extension `.js`).

## Socle EC1-EC5 (résumé)
1. **EC1 — Catalogue** : `products`/`variants`/`categories`, lecture publique des **publiés** (`anon`), écriture admin ; dispo via `products_public.in_stock`.
2. **EC2 — Panier** : ops pures, **aucun prix de confiance** (P2 porté par le type `CartItem`).
3. **EC3 — Checkout ONE-SHOT** : Stripe `mode:payment` (**jamais** `subscription`) ; montant **recalculé serveur** (`computeOrderTotal`).
4. **EC4 — Commandes + boucle fermée** : `orders`/`order_items` (snapshot) ; confirmation **client** **ET** notif **marchand** — « aucune vente muette ».
5. **EC5 — Inventaire** : stock au grain produit, **décrément atomique** (jamais un check applicatif).

## Les trois pièges DURS (P1/P2/P3)
- **P1 — survente** : décrément **conditionnel atomique** en base (`update … where stock >= qty`, 0 ligne = rupture) + `CHECK (stock >= 0)`. **Jamais** un `SELECT stock` puis `if`.
- **P2 — intégrité du prix** : le montant est **TOUJOURS recalculé serveur** depuis le catalogue (`computeOrderTotal` + `select products.price_cents` de la RPC) ; le panier ne porte **aucun** prix ; `order_items` **snapshot** le prix payé.
- **P3 — idempotence du webhook** : **signature vérifiée** avant la DB + **`unique(stripe_session_id)`** + `on conflict do nothing`. 3 redeliveries ⇒ **1** commande, **1** décrément, **1** e-mail.

> Un seul de P1/P2/P3 non blindé = **porte 13/14 fermée**. Chacun est **prouvé sans réseau** par un test dédié (`inventory`/`pricing`/`webhook.test.ts`) ; la **RPC** se prouve en plus **contre une vraie base** (voir plus bas).

## Commandes
```bash
npm install          # zod + typescript + @types/node + tsx
npm run typecheck    # tsc --noEmit  (doit être vert)
npm test             # node --test --import tsx "test/**/*.test.ts" (doit être vert)
npm run verify:machine   # node scripts/verify-machine.mjs — 5 lints (doit être vert)
npm run build        # tsc → dist/
```

## Mapping des variables d'environnement
Connectées **une fois, en amont, via `infra-setup`** — jamais ad hoc. Détails dans `.env.example`. **Toutes requises** (une boutique n'a aucun mode dégradé crédible) :

| Variable | Rôle |
|---|---|
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Catalogue / commandes / stock. La service-role (bypass RLS) est l'**identité du webhook** (crée les commandes, décrémente le stock). Secret **serveur**. |
| `STRIPE_SECRET_KEY` | Création des **Checkout Sessions** one-shot (`mode:payment`) — côté app. |
| `STRIPE_WEBHOOK_SECRET` | **Vérification de signature** du webhook (P3) — avant tout accès DB. |
| `RESEND_API_KEY` + `EMAIL_FROM` | **Boucle fermée EC4** : confirmation client + notif marchand (envoi au call-site route). |

## Prouver la RPC contre une VRAIE base (le SQL est invisible au `tsc`)
`tsc` et `next build` **ne voient pas** le SQL : la RPC `fulfill_paid_order` **compile toujours** puis peut planter au **premier paiement réel** (42702, ou une garde P1/P3 absente). Le plancher machine (`lint:sql`) impose le garde-fou **lesson #15** statiquement, mais la **vérité** se prouve par **smoke-test contre une vraie base** (étape 11 / Phase 4) :
- **0 erreur 42702** au premier appel ;
- **P1 sous concurrence** : deux appels concurrents sur le dernier article ⇒ **un** décrément, l'autre lève « rupture de stock » (rollback total) ;
- **P3** : deux appels **même `stripe_session_id`** ⇒ **une** commande, le second ressort `already_processed = true`.

## UI / app : dérivée du châssis `web-saas`
La vitrine (`app/(shop)/`), le back-office (`app/(admin)/`) et la **route webhook** (`app/api/stripe/webhook/` → `handleStripeWebhook` + `buildWebhookDeps`) se **dérivent du châssis `web-saas`** en remplaçant le bloc `billing` (abonnement) par le **checkout one-shot**. La route envoie les e-mails EC4 (Resend) **uniquement** sur l'issue `created`. Détail complet : **`BLOCKS.md §UI / app`**.

## Vérification (critères d'acceptation, cf. `../../archetypes/ecommerce.md`)
- `npm run typecheck` **vert** (Node 20+, deps minimales).
- `npm test` **vert** : sentinelle + **P1** (survente, 2 & N concurrents), **P2** (prix client ignoré), **P3** (3 redeliveries ⇒ 1 commande ; signature invalide ⇒ 0 écriture).
- `npm run verify:machine` **vert** : **5 lints** (`secrets`, `sql`, `P1`, `P2`, `P3`).
- **Aucun secret en dur** ; config invalide → arrêt clair au démarrage (`loadConfig`).
- **RPC** prouvée contre une vraie base (P1 concurrence + P3 idempotence + 0 erreur SQL) — le garde-fou lesson #15 se **prouve** là, il ne se relit pas.

Doctrine complète de l'archétype (socle EC1-EC5, pièges, pipeline, critères) : **`../../archetypes/ecommerce.md`**. Modèle de données + RLS + RPC : **`../../skills/09-architecture/references/data-model.md §Variante ECOMMERCE`**.
