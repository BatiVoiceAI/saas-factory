-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0001 — Catalogue (archétype ECOMMERCE) : categories / products / variants
-- ─────────────────────────────────────────────────────────────────────────────
-- La surface PUBLIQUE de la boutique. Trois tables de catalogue + le helper d'accès
-- back-office. Règle d'archétype (data-model.md §Variante ECOMMERCE) : le catalogue
-- est en LECTURE PUBLIQUE (`anon`), PAS de multi-tenant org — le tenant est le
-- MARCHAND (une boutique = une instance). Pas d'`org_id`, pas de `tenant_id`.
--
-- RLS (safety-rails §4 / CONVENTIONS.md §8) : RLS activée + policies explicites,
-- deny-by-default. `anon` NE VOIT QUE les produits PUBLIÉS (`published = true`) —
-- les brouillons restent invisibles. L'écriture (CRUD catalogue) est réservée à
-- l'ADMIN (back-office). Aucune PII dans le catalogue → une policy `select` de
-- table à colonnes publiques est acceptable ici (contrairement à une surface avec
-- e-mail/coût, qui exigerait une vue à colonnes explicites).
--
-- ⚠️ ARGENT EN CENTS ENTIERS : les prix sont des `integer` en plus petite unité
-- monétaire (cents), jamais un `numeric`/flottant — aligné sur Stripe (`amount` en
-- cents) et sur le contrat de types (`src/types.ts` : `priceCents`). Boutique
-- mono-devise par défaut (`currency` partagé) ; le multi-devise est une extension.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper d'accès back-office : l'utilisateur courant est-il ADMIN ? ─────────
-- Signal d'admin porté par `app_metadata.role` du JWT — écrit CÔTÉ SERVEUR
-- (service-role / dashboard Supabase), NON modifiable par l'utilisateur
-- (contrairement à `user_metadata`) : anti-escalade de privilèges. `language sql`
-- (pas plpgsql) → pas de risque 42702, hors périmètre lesson #15. `stable` +
-- `set search_path = ''` (durcissement : `auth.jwt()` schéma-qualifié).
--
-- 🔀 VARIANTE PROJET : une boutique qui compose le bloc `auth` du socle web-saas
--    (table `public.profiles` + `public.current_user_role()`) peut préférer y
--    brancher l'admin — remplacer le corps par `select public.current_user_role()
--    = 'admin'`. Ce défaut AUTONOME évite une dépendance dure au bloc auth (parité
--    avec le châssis automation : migrations applicables telles quelles). Voir BLOCKS.md.
create or replace function public.is_store_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

comment on function public.is_store_admin() is
  'ECOMMERCE : l''utilisateur courant est-il l''admin du back-office ? Signal '
  'app_metadata.role du JWT (server-controlled, anti-escalade). Utilisé par les '
  'policies d''écriture du catalogue et de lecture des commandes.';

-- L'admin s'évalue dans le contexte de l'appelant (anon/authenticated) au sein des
-- policies : le droit d'exécution doit leur être ouvert.
grant execute on function public.is_store_admin() to anon, authenticated;

-- ── EC1 — Catégories (taxonomie publique) ────────────────────────────────────
create table if not exists public.categories (
  id         uuid        primary key default gen_random_uuid(),
  slug       text        not null unique,
  name       text        not null,
  created_at timestamptz not null default now()
);

comment on table public.categories is
  'EC1 : catégories du catalogue (taxonomie publique). Lecture anon, écriture admin.';

-- ── EC1 — Produits ───────────────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid        primary key default gen_random_uuid(),
  category_id uuid        references public.categories (id) on delete set null,
  slug        text        not null unique,
  name        text        not null,
  description text,
  -- Prix de référence en CENTS entiers (plus petite unité monétaire). C'est ce
  -- prix que le serveur lit au checkout (P2) — jamais un montant client.
  price_cents integer     not null check (price_cents >= 0),
  -- Devise ISO 4217 minuscule (Stripe). Défaut boutique mono-devise.
  currency    text        not null default 'eur',
  image_url   text,
  -- Brouillon (false) invisible à anon ; publié (true) achetable au catalogue.
  published   boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.products is
  'EC1 : produit vendable. Lecture anon SI published=true (brouillons invisibles). '
  'Écriture admin. Prix en cents entiers (P2 : lu serveur au checkout). Pas de tenant org.';

-- Parcours catalogue par catégorie (produits publiés).
create index if not exists products_category_idx
  on public.products (category_id) where published = true;

-- ── EC1 — Variantes (déclinaisons ; grain transactionnel = produit dans ce socle) ─
create table if not exists public.variants (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references public.products (id) on delete cascade,
  name        text        not null,
  sku         text        unique,
  -- Surcharge de prix (cents) pour cette variante ; null ⇒ hérite du prix produit.
  price_cents integer     check (price_cents is null or price_cents >= 0),
  created_at  timestamptz not null default now()
);

comment on table public.variants is
  'EC1 : déclinaison d''un produit (taille/couleur…). Dans ce socle le stock et les '
  'commandes sont au grain PRODUIT ; le stock par variante est une extension (BLOCKS.md).';

create index if not exists variants_product_idx on public.variants (product_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — lecture publique des PUBLIÉS uniquement, écriture ADMIN
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.variants   enable row level security;

-- ── categories : taxonomie publique en lecture, écriture admin ───────────────
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_insert_admin" on public.categories;
create policy "categories_insert_admin"
  on public.categories
  for insert
  to authenticated
  with check (public.is_store_admin());

drop policy if exists "categories_update_admin" on public.categories;
create policy "categories_update_admin"
  on public.categories
  for update
  to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists "categories_delete_admin" on public.categories;
create policy "categories_delete_admin"
  on public.categories
  for delete
  to authenticated
  using (public.is_store_admin());

-- ── products : anon/authenticated voient les PUBLIÉS ; l'admin voit tout + écrit ─
drop policy if exists "products_select_published" on public.products;
create policy "products_select_published"
  on public.products
  for select
  to anon, authenticated
  using (published = true);

-- L'admin voit AUSSI les brouillons (back-office) — policy select additive.
drop policy if exists "products_select_admin" on public.products;
create policy "products_select_admin"
  on public.products
  for select
  to authenticated
  using (public.is_store_admin());

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
  on public.products
  for insert
  to authenticated
  with check (public.is_store_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
  on public.products
  for update
  to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (public.is_store_admin());

-- ── variants : visibles si le produit parent est publié ; écriture admin ─────
drop policy if exists "variants_select_published" on public.variants;
create policy "variants_select_published"
  on public.variants
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = variants.product_id and p.published = true
    )
  );

drop policy if exists "variants_select_admin" on public.variants;
create policy "variants_select_admin"
  on public.variants
  for select
  to authenticated
  using (public.is_store_admin());

drop policy if exists "variants_insert_admin" on public.variants;
create policy "variants_insert_admin"
  on public.variants
  for insert
  to authenticated
  with check (public.is_store_admin());

drop policy if exists "variants_update_admin" on public.variants;
create policy "variants_update_admin"
  on public.variants
  for update
  to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists "variants_delete_admin" on public.variants;
create policy "variants_delete_admin"
  on public.variants
  for delete
  to authenticated
  using (public.is_store_admin());
