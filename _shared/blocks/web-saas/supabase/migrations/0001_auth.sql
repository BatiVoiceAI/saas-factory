-- 0001_auth.sql — bloc `auth`
-- Profils applicatifs, rôles et RLS. Multi-tenant-ready :
--   * chaque utilisateur possède exactement UN profil (1-1 avec auth.users) ;
--   * la colonne `role` porte le contrôle d'accès applicatif ('user' | 'admin') ;
--   * un utilisateur lit/met à jour SON profil ; un admin lit tous les profils ;
--   * la colonne `role` n'est PAS modifiable par l'utilisateur (anti-escalade) —
--     seul le service role (côté serveur privilégié) peut promouvoir un compte.
-- Toute table de ce fichier active la RLS (CONVENTIONS.md §8, safety-rails §4).

-- ---------------------------------------------------------------------------
-- Table : public.profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,
  role       text        not null default 'user' check (role in ('user', 'admin')),
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Profil applicatif 1-1 avec auth.users. `role` porte le contrôle d''accès.';

-- Maintient `updated_at` à jour sur chaque modification.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger : création automatique du profil à l'inscription
-- ---------------------------------------------------------------------------
-- Déclenché à l'insertion d'un compte dans auth.users (signup email ou OAuth).
-- `security definer` : la fonction s'exécute avec les droits du propriétaire
-- pour pouvoir écrire dans public.profiles malgré la RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper : rôle de l'utilisateur courant (sans récursion RLS)
-- ---------------------------------------------------------------------------
-- `security definer` => bypass RLS : appelable dans une policy de public.profiles
-- sans provoquer de récursion infinie sur la même table.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Un utilisateur lit son propre profil.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Un admin lit tous les profils (contrôle d'accès par rôle).
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.current_user_role() = 'admin');

-- Un utilisateur met à jour son propre profil.
-- (La colonne `role` est protégée séparément par le revoke ci-dessous : même si
--  cette policy autorise l'UPDATE de la ligne, l'utilisateur ne peut pas écrire
--  la colonne `role`.)
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Anti-escalade de privilèges : l'utilisateur ne peut pas changer son `role`
-- ---------------------------------------------------------------------------
-- Le profil est créé par le trigger (service role) ; l'utilisateur n'insère ni
-- ne supprime jamais son profil directement. On retire le droit d'UPDATE au
-- niveau TABLE (sinon un REVOKE de la seule colonne `role` serait ignoré tant
-- que le grant table subsiste), puis on ne re-grant l'UPDATE que sur les
-- colonnes éditables — `role` reste hors de portée. Le service role (accès
-- serveur privilégié) conserve tous les droits.
revoke insert, update, delete on public.profiles from authenticated, anon;
grant update (full_name, updated_at) on public.profiles to authenticated;
