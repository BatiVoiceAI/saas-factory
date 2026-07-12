-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0002 — bloc `crud` : entité exemple `items`
-- ─────────────────────────────────────────────────────────────────────────────
-- Numéro figé (cf. CONVENTIONS.md §5, zéro collision). Cette migration est le
-- MODÈLE à cloner par entité : table `owner`-scoped + RLS stricte par owner.
-- Voir lib/crud/factory.ts pour le pas-à-pas de clonage.
-- Règle safety-rails §4 / CONVENTIONS §8 : RLS activée + policies explicites.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.items (
  id         uuid        primary key default gen_random_uuid(),
  owner      uuid        not null references auth.users (id) on delete cascade,
  title      text        not null check (char_length(title) between 1 and 200),
  body       text        not null default '',
  created_at timestamptz not null default now()
);

-- Accès fréquent « mes items » → index sur owner.
create index if not exists items_owner_idx on public.items (owner);

-- ── RLS : chaque utilisateur ne voit et ne manipule QUE ses propres lignes ──
alter table public.items enable row level security;

create policy "items_select_own"
  on public.items for select
  using (auth.uid() = owner);

create policy "items_insert_own"
  on public.items for insert
  with check (auth.uid() = owner);

create policy "items_update_own"
  on public.items for update
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

create policy "items_delete_own"
  on public.items for delete
  using (auth.uid() = owner);
