-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0002 — Panier / Stock / Commandes (le cœur TRANSACTIONNEL)
-- ─────────────────────────────────────────────────────────────────────────────
-- S'applique APRÈS 0001_catalog.sql (référence public.products, public.is_store_admin).
-- Ici vivent les trois invariants DURS de l'archétype (portes 13/14) :
--   • P1 — anti-survente : `inventory.stock` porte un CHECK (stock >= 0) ; le
--          décrément conditionnel atomique est dans la RPC (0003).
--   • P2 — intégrité du prix : `cart_items` NE PORTE AUCUN PRIX (juste product_id
--          + qty) ; `order_items` SNAPSHOT le prix serveur payé (figé).
--   • P3 — idempotence webhook : `orders.stripe_session_id` UNIQUE (une session
--          Stripe = au plus une commande).
--
-- Frontière de confiance DOUBLE (data-model.md §Variante ECOMMERCE) : le CLIENT
-- (jamais un prix venu du navigateur) et le WEBHOOK Stripe (signature + idempotence,
-- source de vérité du paiement). Rôles : anon (catalogue + panier invité médié
-- serveur) · authenticated (voit SES commandes) · service_role (webhook : crée les
-- commandes, décrémente le stock) · admin (back-office : toutes les commandes).
-- ─────────────────────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════════════════════
-- EC2 — Panier (carts / cart_items). AUCUN PRIX DE CONFIANCE (P2).
-- ═════════════════════════════════════════════════════════════════════════════
-- Un panier vit sous `cart_token` (invité, cookie httpOnly) OU `user_id` (connecté).
-- À la connexion, le panier invité se FUSIONNE dans le panier user (logique
-- applicative, lib/cart). Le panier est une donnée de CONFORT : au checkout le
-- serveur ré-hydrate produits + prix depuis le catalogue et ignore tout montant client.
create table if not exists public.carts (
  id         uuid        primary key default gen_random_uuid(),
  -- Panier INVITÉ : jeton opaque porté par un cookie httpOnly. null si compte.
  cart_token text        unique,
  -- Panier CONNECTÉ : rattaché à l'utilisateur. null si invité.
  user_id    uuid        references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Exactement un porteur : au moins l'un des deux identifiants est présent.
  constraint carts_identity_ck check (cart_token is not null or user_id is not null)
);

comment on table public.carts is
  'EC2 : panier scopé par cart_token (invité) OU user_id (connecté). Donnée de '
  'confort, JAMAIS de prix de confiance (P2) — le prix est recalculé serveur au checkout.';

create table if not exists public.cart_items (
  id         uuid        primary key default gen_random_uuid(),
  cart_id    uuid        not null references public.carts (id) on delete cascade,
  product_id uuid        not null references public.products (id) on delete cascade,
  -- P2 : SEULEMENT product_id + qty. AUCUNE colonne de prix ici, par conception.
  qty        integer     not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Une seule ligne par produit et par panier (incréments = update de qty).
  constraint cart_items_unique_line unique (cart_id, product_id)
);

comment on table public.cart_items is
  'EC2 : ligne de panier = product_id + qty UNIQUEMENT (P2). Le prix n''existe pas ici.';

create index if not exists cart_items_cart_idx on public.cart_items (cart_id);

alter table public.carts      enable row level security;
alter table public.cart_items enable row level security;

-- CONNECTÉ : un utilisateur gère SON panier (user_id = auth.uid()).
drop policy if exists "carts_owner_all" on public.carts;
create policy "carts_owner_all"
  on public.carts
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "cart_items_owner_all" on public.cart_items;
create policy "cart_items_owner_all"
  on public.cart_items
  for all
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );

-- INVITÉ (anon) : AUCUNE policy directe — choix délibéré (deny anon en direct). Un
-- cookie `cart_token` n'est pas exprimable en RLS anon sans fuite (anon partagerait
-- une même identité). Le panier invité est donc MÉDIÉ CÔTÉ SERVEUR : une route Next
-- (service_role) scopée par le cookie httpOnly lit/écrit le panier du porteur. Le
-- prix étant de toute façon recalculé serveur au checkout, le panier reste non fiable.

-- ═════════════════════════════════════════════════════════════════════════════
-- EC5 — Inventaire (stock). P1 : borne DB, jamais un check applicatif.
-- ═════════════════════════════════════════════════════════════════════════════
-- Grain PRODUIT (1-1 avec products). Le décrément conditionnel atomique vit dans la
-- RPC fulfill_paid_order (0003) et s'exécute AU PAIEMENT CONFIRMÉ (webhook), pas à
-- l'ajout au panier (sinon un panier abandonné gèle le stock).
create table if not exists public.inventory (
  product_id uuid        primary key references public.products (id) on delete cascade,
  -- P1 : le CHECK (stock >= 0) rend la survente IMPOSSIBLE au niveau base. Combiné
  -- au décrément conditionnel `where stock >= qty` de la RPC, deux commandes
  -- concurrentes sur le dernier article ne peuvent pas réussir toutes les deux.
  stock      integer     not null default 0 check (stock >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.inventory is
  'EC5 : stock au grain produit. P1 : CHECK (stock >= 0) + décrément conditionnel '
  'atomique (RPC 0003). Service-role only : aucune policy anon/authenticated.';

alter table public.inventory enable row level security;
-- Service-role UNIQUEMENT : volontairement AUCUNE policy (deny anon/authenticated,
-- comme les tables d'infrastructure du châssis automation). La DISPO au catalogue
-- passe par la vue `products_public.in_stock` (booléen dérivé), JAMAIS ce compte brut.

-- ═════════════════════════════════════════════════════════════════════════════
-- EC4 — Commandes (orders / order_items). P2 (snapshot) + P3 (idempotence).
-- ═════════════════════════════════════════════════════════════════════════════
create table if not exists public.orders (
  id                uuid        primary key default gen_random_uuid(),
  -- P3 : clé Stripe (checkout session / payment intent). L'unicité ci-dessous rend
  -- la création idempotente sur les redeliveries at-least-once du webhook.
  stripe_session_id text        not null,
  -- null = achat INVITÉ (checkout guest, le défaut e-commerce). Sinon le client
  -- connecté propriétaire (voit SES commandes via RLS).
  user_id           uuid        references auth.users (id) on delete set null,
  customer_email    text        not null,
  status            text        not null default 'paid'
                      check (status in ('paid', 'fulfilled', 'cancelled', 'refunded')),
  -- P2 : total RECALCULÉ serveur (somme des unit_price_cents × qty), jamais un
  -- total transmis par le navigateur. En cents entiers.
  total_cents       integer     not null default 0 check (total_cents >= 0),
  currency          text        not null default 'eur',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- P3 : une session Stripe = AU PLUS une commande. La RPC fait
  -- `insert ... on conflict (stripe_session_id) do nothing` (noop en redelivery).
  constraint orders_stripe_session_uniq unique (stripe_session_id)
);

comment on table public.orders is
  'EC4 : commande créée UNIQUEMENT par le webhook (service_role, RPC fulfill_paid_order). '
  'P3 : unique(stripe_session_id). P2 : total_cents recalculé serveur. Jamais écrite par le client.';

-- « Mes commandes » (client) + back-office (admin) filtrent par récence.
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_recent_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id               uuid        primary key default gen_random_uuid(),
  order_id         uuid        not null references public.orders (id) on delete cascade,
  -- SET NULL : si le produit est supprimé du catalogue APRÈS la vente, la ligne
  -- d'historique survit (le snapshot ci-dessous reste la vérité de ce qui fut payé).
  product_id       uuid        references public.products (id) on delete set null,
  -- P2 — SNAPSHOT figés au paiement (pas de FK vive vers products.name/price) :
  product_name     text        not null,
  unit_price_cents integer     not null check (unit_price_cents >= 0),
  qty              integer     not null check (qty > 0),
  created_at       timestamptz not null default now()
);

comment on table public.order_items is
  'EC4 : ligne de commande = SNAPSHOT (P2) du prix serveur payé (unit_price_cents) '
  'et du nom produit, figés au paiement. Écriture service_role (RPC) uniquement.';

create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- orders — SELECT : le client voit SES commandes ; l'admin toutes. Un achat invité
-- (user_id null) se consulte via un lien de commande signé hors-bande (e-mail de
-- confirmation), PAS via une policy anon.
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_store_admin());

-- orders — INSERT / UPDATE / DELETE : AUCUNE policy anon/authenticated. L'écriture
-- est réservée au WEBHOOK (service_role, qui bypasse la RLS) via la RPC
-- fulfill_paid_order (0003). Un client ne crée ni ne modifie JAMAIS une commande (P2/P3).

-- order_items — SELECT via la commande parente (propriétaire ou admin). Écriture
-- service_role uniquement (aucune policy write → deny anon/authenticated).
drop policy if exists "order_items_select_via_order" on public.order_items;
create policy "order_items_select_via_order"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_store_admin())
    )
  );

-- ═════════════════════════════════════════════════════════════════════════════
-- Exposition PUBLIQUE de la disponibilité — vue à colonnes explicites (EC5)
-- ═════════════════════════════════════════════════════════════════════════════
-- `inventory` est service-role-only : `anon` ne peut PAS lire le compte de stock.
-- Mais le catalogue doit afficher « épuisé » (EC5). Parade recommandée par
-- data-model.md : une VUE à colonnes explicites qui expose une DISPO DÉRIVÉE
-- (booléen `in_stock`), JAMAIS le compte brut, et UNIQUEMENT les produits publiés.
--
-- `security_invoker = false` (défaut, rendu explicite) : la vue s'exécute avec les
-- droits de son PROPRIÉTAIRE (le rôle de migration, qui bypasse la RLS). Elle peut
-- donc joindre `inventory` (service-role-only) pour calculer `in_stock`, tout en
-- ne divulguant à `anon` que les colonnes listées ci-dessous — zéro PII, zéro compte.
create or replace view public.products_public
with (security_invoker = false)
as
  select
    p.id,
    p.category_id,
    p.slug,
    p.name,
    p.description,
    p.price_cents,
    p.currency,
    p.image_url,
    (coalesce(i.stock, 0) > 0) as in_stock   -- dispo DÉRIVÉE : booléen seul
  from public.products p
  left join public.inventory i on i.product_id = p.id
  where p.published = true;                  -- brouillons invisibles

comment on view public.products_public is
  'EC5 : projection catalogue publique. Expose in_stock (booléen dérivé de '
  'inventory.stock), JAMAIS le compte brut ; produits publiés seulement. Lecture anon.';

grant select on public.products_public to anon, authenticated;
