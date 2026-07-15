# Archétype : ecommerce (V1 — bloc partagé, lu à la demande)

Un archétype parmi 4 — le modèle **3 axes orthogonaux** (`archetype` / `type` / `tenancy`) et le **conditionnement du socle par archétype** vivent dans `../state-schema.md` §modèle 3 axes (SOURCE UNIQUE) ; voir aussi `web-saas.md`, `landing.md`, `automation.md`. Ici : la fiche de l'archétype **ecommerce**.

> **Scaffold code : châssis `../blocks/ecommerce/` LIVRÉ (logique commerce + SQL + pièges P1/P2/P3).** Ce fichier pose le **modèle** (forme du livrable, socle EC1-EC5, patterns d'architecture, pièges) ; le châssis **`_shared/blocks/ecommerce/`** livre la **LOGIQUE commerce testée** — `lib/pricing` (P2, recalcul serveur) · `lib/inventory` (P1, décrément atomique) · `lib/cart` / `lib/orders` · `webhook` (P3, idempotent) — **+** les **migrations SQL** (schéma / RLS + RPC `fulfill_paid_order` qui réunit P1+P2+P3 en une transaction) **+** `verify:machine` (5 lints) **+** tests `node:test` **verts**, **dependency-light** (comme `automation/`). L'**UI/app** (vitrine + panier + checkout + back-office + route webhook Next) se **dérive du châssis web-saas** en remplaçant `billing` (abonnement) par le checkout one-shot — documentée dans `../blocks/ecommerce/BLOCKS.md`, **pas compilée** dans ce châssis. Le CTO (09) architecture, le DEV (12) câble. **Détection (01) + socle (07) + routage + architecture + logique = définis et LIVRÉS ; archétype de PREMIÈRE CLASSE, pas un cas web-saas déguisé.**

Livrable = **site de vente (boutique en ligne)** : catalogue de produits, panier, **paiement one-shot** (achat, pas abonnement), commandes, stock. Le plus souvent `type = public`. Cas d'usage : boutique de marque (DTC), petit e-commerce niché, vente de produits physiques ou numériques, précommande. **Distinct de `web-saas`** : la valeur n'est pas un workflow applicatif avec auth+dashboard, c'est **vendre des produits** — et le billing n'est **PAS** un abonnement Stripe mais un **paiement de panier one-shot**.

## Stack
Next.js 15 (App Router, TS strict) + Supabase (Postgres, RLS, catalogue/commandes/stock) + **Stripe en mode PAIEMENT ONE-SHOT** (Stripe **Checkout** ou **Payment Intents** — *jamais* `mode:subscription` ; c'est la différence dure avec le bloc `billing` de web-saas) + Resend (confirmations de commande) + Vercel/Cloudflare. **Auth CLIENT légère et optionnelle** : le **checkout invité** (guest, sans compte) est le défaut e-commerce ; un compte client (historique de commandes) est une **option**, jamais un prérequis à l'achat. Un **back-office admin** (gestion produits + commandes) est du socle (EC1/EC4). Défauts et alternatives self-host : `../stack-defaults.md`.

## Structure du châssis généré → `../blocks/ecommerce/` (LIVRÉ : logique + SQL ; UI dérivée de web-saas)
```
app/
  (shop)/                # vitrine PUBLIQUE : catalogue, page produit, panier, checkout, /merci
  (admin)/               # back-office : produits, stock, commandes (accès restreint)
  api/stripe/webhook/    # webhook paiement → crée la commande, décrémente le stock (idempotent)
components/shop/ · components/admin/
lib/cart/ · lib/orders/ · lib/inventory/ · lib/pricing/   # panier, commandes, stock, calcul serveur
supabase/migrations/     # products, variants, categories, carts, orders, order_items, inventory (RLS)
```
**Réutilise le socle web-saas** (skeleton, ui-shell, notifications, legal, repo-ci, hosting) ; **remplace `billing` (abonnement) par un checkout one-shot** ; **ajoute** les blocs commerce. Sélection & câblage par l'étape 11 (à étendre) : `../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype.

## Socle inclus par défaut — socle **ECOMMERCE** (remplace le socle S1-S8 web-saas)
Le socle de complétude dépend de l'**archétype** (règle canonique `../state-schema.md` §modèle 3 axes). Pour ecommerce, l'existence non négociable porte sur **EC1-EC5** :
- **EC1 — Catalogue produits** — table `products` (+ `variants`, `categories`), page **liste** + page **détail** produit (nom, description, **prix**, images réelles, disponibilité). Lecture **publique** (RLS : `select` anon sur les produits *publiés* seulement). Back-office : CRUD produits (admin).
- **EC2 — Panier** — état de panier (client + persistance : cookie/`carts` table), ajout/retrait/quantité, sous-totaux **recalculés côté serveur** (jamais un total envoyé par le client — cf. §Pièges). Vide → état vide avec CTA « continuer mes achats ».
- **EC3 — Checkout + paiement ONE-SHOT** — **Stripe Checkout / Payment Intents** (`mode:payment`, PAS `subscription`). **Checkout invité par défaut** (email suffit). Le montant est **calculé côté serveur** depuis le catalogue au moment du checkout. La commande n'est créée/confirmée **qu'au webhook `checkout.session.completed`/`payment_intent.succeeded`** (source de vérité = Stripe), **idempotent** sur l'id de session/intent (redelivery Stripe ⇒ pas de double commande).
- **EC4 — Commandes + boucle fermée** — tables `orders` + `order_items` (snapshot du prix payé, pas une FK vive vers le prix courant), statut (`paid`/`fulfilled`/`cancelled`/`refunded`). **Boucle fermée (`../boucles-fermees.md`)** : confirmation de commande **au client** (email Resend, immédiate) **ET** notification **au marchand** (nouvelle commande) — aucune vente muette. Espace client « mes commandes » (si compte) + back-office commandes (admin : voir, marquer expédié, rembourser).
- **EC5 — Inventaire / stock (le piège de correction n°1)** — suivi du stock par produit/variant, **décrément ATOMIQUE à la commande** (contrainte DB, jamais un check applicatif), **anti-survente** : deux commandes concurrentes sur le dernier article ne peuvent pas réussir toutes les deux. Rupture → produit non achetable + état « épuisé ». Voir §Pièges.

**PAS le socle S1-S8 web-saas d'office** : pas d'onboarding wizard produit, pas de dashboard applicatif (le back-office admin n'est PAS un dashboard SaaS), pas d'entité « cœur CRUD » générique — l'entité cœur est **le produit + la commande**. Exiger le socle web-saas d'une boutique = **faux-négatif d'archétype**.

## Pièges (les exigences DURES de l'archétype — équivalent de l'idempotence 2-grains d'automation)

> 🚨 Trois pièges cassent une boutique en prod et **ne se voient pas au build**. Les trois sont **non négociables** (portes 13/14).

### P1 — Survente / course sur le stock (le pire)
Deux clients achètent le **dernier** article en même temps → sans protection, **les deux paient**, un ne sera pas livré. **Jamais** un `SELECT stock` puis `if stock>0 then INSERT` (fenêtre de course). Parade : **décrément conditionnel atomique** en base —
```sql
update inventory set stock = stock - :qty
where product_id = :id and stock >= :qty;     -- 0 ligne affectée = rupture → refuse la commande
```
ou une contrainte `CHECK (stock >= 0)` + décrément dans la **même transaction** que la création de la commande (RPC `SECURITY DEFINER`, conforme lesson #15 : `#variable_conflict use_column`, `search_path=''`, `revoke`). Le stock se décrémente **au paiement confirmé** (webhook), pas à l'ajout au panier (sinon un panier abandonné bloque le stock) — réservation optionnelle à durée limitée si besoin.

### P2 — Intégrité du prix (sécurité)
**Ne JAMAIS faire confiance à un prix/total envoyé par le client.** Un client peut altérer le payload du panier (`price: 0.01`). Le montant facturé est **TOUJOURS recalculé côté serveur** depuis le catalogue (`lib/pricing/`) au moment du checkout, à partir des **seuls `product_id` + quantités**. La ligne de commande **snapshot** le prix serveur payé (pas une FK vers le prix courant, qui peut changer après la vente).

### P3 — Idempotence du paiement (webhook Stripe)
Stripe **redélivre** ses webhooks (at-least-once). Créer la commande à chaque réception ⇒ **doublons**. Parade : idempotent sur l'**id de session/payment_intent** (contrainte unique `orders.stripe_session_id`, upsert `on conflict do nothing`), + vérifier la **signature** du webhook. La commande = créée une seule fois même sur 3 redeliveries.

## Architecture (patterns — détail en 09)
Modèle de données : `products`/`variants`/`categories` (RLS : `select` anon sur publiés) · `carts`/`cart_items` (scopé session/user) · `orders`/`order_items` (RLS : le client voit SES commandes, l'admin toutes) · `inventory` (décrément atomique). Paiement : Stripe `mode:payment`, webhook = source de vérité. Détail des patterns + RLS + RPC stock : `../../skills/09-architecture/references/data-model.md` §Variante ECOMMERCE.

## Pipeline
**intake** (quoi vendre, produits physiques/numériques, guest vs compte, `locale`/`jurisdiction` — TVA/CGV de vente obligatoires) → **marché/positionnement** (public, comme web-saas) → **PRD** (socle EC1-EC5 + workflow d'achat) → **design** (archétype de structure « boutique » — vitrine + fiche produit + panier + checkout) → **architecture** (patterns ci-dessus, pièges P1-P3) → **build** (catalogue → panier → checkout → commandes → stock, cascade avec cran sécurité **renforcé** sur P1-P3) → **deploy** + recette live authentifiée (achat de test réel bout-en-bout : ajout panier → checkout Stripe test → webhook → commande créée → stock décrémenté → email confirmation reçu) → **metrics** (funnel e-commerce : vue produit → ajout panier → checkout → achat ; **panier moyen**, taux de conversion, taux d'abandon de panier — PAS le funnel d'activation SaaS).

## Critères d'acceptation
Build vert (`tsc`/`next build`) ; **achat de test réel de bout en bout** (Stripe mode test) : panier → checkout → webhook → **commande créée une seule fois** (P3) → **stock décrémenté atomiquement** (P1) → email de confirmation client **ET** notif marchand (EC4) ; **prix recalculé serveur** prouvé (un panier au prix altéré est rejeté/recalculé — P2) ; RLS prouvée (un client ne voit pas les commandes d'un autre) ; **CGV / mentions de vente adaptées à `jurisdiction`** présentes ; back-office admin fonctionnel (produit + commande). Un seul de P1/P2/P3 non prouvé = porte fermée.

## Clés API requises
Connectées **une fois via `infra-setup`** : Supabase (catalogue/commandes/stock) · **Stripe** (paiement one-shot + webhook signing secret) · Resend (confirmations) · l'hébergement (Vercel/CF) + DNS (Cloudflare). Pas d'abonnement Stripe. Chaque clé = un guide pas-à-pas ; jamais stockée par le plugin.
