-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0006 — bloc `org-tenancy` : substrat B2B multi-org
-- ─────────────────────────────────────────────────────────────────────────────
-- Numéro figé (CONVENTIONS.md §5, zéro collision — vient après 0004_notifications
-- ; 0005 reste libre pour un autre bloc additif type `waitlist`). Bloc OPTIONNEL :
-- inclus SEULEMENT si `tenancy = multi-org` (_shared/state-schema.md §tenancy,
-- CONVENTIONS.md §13). En `single` (défaut), ces tables n'existent pas.
--
-- Modèle (data-model.md §09) : ORG ‖—o{ MEMBER, et `org_id` devient le TENANT
-- des entités métier (RLS PAR ORG, deny-by-default, org_id dérivé de la session
-- via les helpers ci-dessous — JAMAIS d'un paramètre client). Trois tables :
--   • orgs            — l'organisation (le tenant) ;
--   • org_members     — appartenance user↔org + rôle (owner/admin/member) ;
--   • org_invitations — invitations par e-mail (token opaque, expirable).
--
-- Sécurité (safety-rails §4 / CONVENTIONS.md §8) : RLS ACTIVÉE sur les 3 tables,
-- policies explicites. L'appartenance/le rôle sont résolus par des fonctions
-- `security definer` (is_org_member / is_org_admin / current_org_ids) qui
-- bypassent la RLS de `org_members` : c'est ce qui CASSE la récursion (une policy
-- de `org_members` qui interrogerait `org_members` en direct bouclerait). Même
-- pattern que `public.current_user_role()` de 0001_auth.sql.
--
-- ⚠️ Lesson #15 (bug 42702 invisible au build) : toute fonction plpgsql porte
-- `#variable_conflict use_column` en tête ET qualifie ses colonnes (`om.org_id`,
-- `new.owner_id`…) ; aucun nom nu collisionnable. Les paramètres sont préfixés
-- `p_` pour ne jamais entrer en collision avec une colonne.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.orgs (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  -- Slug URL-safe unique (sous-domaine / segment d'URL de l'org).
  slug       text        not null unique,
  -- Propriétaire (créateur self-serve). L'appartenance 'owner' correspondante
  -- est posée AUTOMATIQUEMENT par le trigger `orgs_add_owner_membership`.
  owner_id   uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.orgs is
  'Bloc org-tenancy : l''organisation = le TENANT en multi-org. RLS par org.';

create table if not exists public.org_members (
  org_id     uuid        not null references public.orgs (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  -- Rôle applicatif dans l'org. 'owner' (créateur), 'admin' (gère membres +
  -- invitations + facturation), 'member' (accès aux ressources de l'org).
  role       text        not null default 'member'
                 check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  -- Une appartenance unique par (org, user) — clé d'idempotence de l'accept
  -- d'invitation (ON CONFLICT DO NOTHING, cf. lib/org/invitations.ts).
  primary key (org_id, user_id)
);

comment on table public.org_members is
  'Bloc org-tenancy : appartenance user↔org + rôle. Résout le tenant courant.';

create table if not exists public.org_invitations (
  id         uuid        primary key default gen_random_uuid(),
  org_id     uuid        not null references public.orgs (id) on delete cascade,
  -- Adresse invitée (normalisée en minuscules côté lib).
  email      text        not null,
  -- Rôle attribué à l'acceptation. On n'invite pas un 'owner' (c'est le créateur).
  role       text        not null default 'member'
                 check (role in ('admin', 'member')),
  -- Secret opaque porté par le lien d'invitation. Sa POSSESSION vaut preuve
  -- (bearer) : généré par `crypto.randomBytes` côté lib, unique.
  token      text        not null unique,
  status     text        not null default 'pending'
                 check (status in ('pending', 'accepted', 'revoked')),
  -- Échéance (défaut J+7). Une invitation expirée n'est plus acceptable.
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

comment on table public.org_invitations is
  'Bloc org-tenancy : invitations par e-mail (token bearer, expirable). '
  'Créées par un owner/admin ; l''accept (service role) insère l''appartenance.';

-- ─── Index utiles ────────────────────────────────────────────────────────────
-- « Mes orgs » (lib/org/context.getUserOrgs) filtre org_members par user_id.
create index if not exists org_members_user_id_idx
  on public.org_members (user_id);
-- Lookup des orgs par propriétaire.
create index if not exists orgs_owner_id_idx
  on public.orgs (owner_id);
-- Liste des invitations d'une org (écran admin) + relance par e-mail.
create index if not exists org_invitations_org_id_idx
  on public.org_invitations (org_id);
create index if not exists org_invitations_email_idx
  on public.org_invitations (email);

-- ─── Helpers d'appartenance (security definer → bypass RLS, anti-récursion) ───
-- Résolvent le tenant courant à partir de la SESSION (auth.uid()), jamais d'un
-- paramètre client. `set search_path = ''` ⇒ tout est schéma-qualifié.

-- Ensemble des org_id dont l'utilisateur courant est membre (tenant scope).
create or replace function public.current_org_ids()
returns setof uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
  #variable_conflict use_column
begin
  return query
    select om.org_id
    from public.org_members om
    where om.user_id = auth.uid();
end;
$$;

-- L'utilisateur courant est-il membre de l'org `p_org_id` ?
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
  #variable_conflict use_column
begin
  return exists (
    select 1
    from public.org_members om
    where om.org_id = p_org_id
      and om.user_id = auth.uid()
  );
end;
$$;

-- L'utilisateur courant est-il owner/admin de l'org `p_org_id` ?
create or replace function public.is_org_admin(p_org_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
  #variable_conflict use_column
begin
  return exists (
    select 1
    from public.org_members om
    where om.org_id = p_org_id
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin')
  );
end;
$$;

-- ─── Trigger : le créateur d'une org en devient 'owner' (appartenance) ───────
-- Évite le paradoxe œuf-poule RLS (pour s'insérer en membre il faudrait déjà
-- être admin) : le trigger security definer pose l'appartenance owner d'office.
create or replace function public.org_tenancy_add_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
  #variable_conflict use_column
begin
  insert into public.org_members (org_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (org_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists orgs_add_owner_membership on public.orgs;
create trigger orgs_add_owner_membership
  after insert on public.orgs
  for each row
  execute function public.org_tenancy_add_owner_membership();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.orgs             enable row level security;
alter table public.org_members      enable row level security;
alter table public.org_invitations  enable row level security;

-- orgs : un membre voit son org ; owner/admin la modifient ; owner la supprime ;
-- création self-serve autorisée (l'owner posé = l'utilisateur courant).
drop policy if exists "orgs_select_member" on public.orgs;
create policy "orgs_select_member"
  on public.orgs
  for select
  to authenticated
  using (public.is_org_member(orgs.id));

drop policy if exists "orgs_insert_self_owner" on public.orgs;
create policy "orgs_insert_self_owner"
  on public.orgs
  for insert
  to authenticated
  with check (orgs.owner_id = auth.uid());

drop policy if exists "orgs_update_admin" on public.orgs;
create policy "orgs_update_admin"
  on public.orgs
  for update
  to authenticated
  using (public.is_org_admin(orgs.id))
  with check (public.is_org_admin(orgs.id));

drop policy if exists "orgs_delete_owner" on public.orgs;
create policy "orgs_delete_owner"
  on public.orgs
  for delete
  to authenticated
  using (orgs.owner_id = auth.uid());

-- org_members : les membres se voient entre eux ; owner/admin gèrent les membres
-- (ajout/rôle/retrait) ; un membre peut se retirer lui-même (self-leave).
-- L'INSERT via RLS est réservé aux admins ; l'accept d'invitation, lui, passe
-- par le service role (bypass RLS) — un invité ne s'auto-insère jamais.
drop policy if exists "org_members_select_member" on public.org_members;
create policy "org_members_select_member"
  on public.org_members
  for select
  to authenticated
  using (public.is_org_member(org_members.org_id));

drop policy if exists "org_members_insert_admin" on public.org_members;
create policy "org_members_insert_admin"
  on public.org_members
  for insert
  to authenticated
  with check (public.is_org_admin(org_members.org_id));

drop policy if exists "org_members_update_admin" on public.org_members;
create policy "org_members_update_admin"
  on public.org_members
  for update
  to authenticated
  using (public.is_org_admin(org_members.org_id))
  with check (public.is_org_admin(org_members.org_id));

drop policy if exists "org_members_delete_admin_or_self" on public.org_members;
create policy "org_members_delete_admin_or_self"
  on public.org_members
  for delete
  to authenticated
  using (
    public.is_org_admin(org_members.org_id)
    or org_members.user_id = auth.uid()
  );

-- org_invitations : seuls owner/admin de l'org voient/créent/révoquent/suppriment
-- les invitations. L'ACCEPT ne passe PAS par ces policies : il se fait via le
-- service role (lib/org/invitations.acceptInvitation), le token faisant preuve.
drop policy if exists "org_invitations_select_admin" on public.org_invitations;
create policy "org_invitations_select_admin"
  on public.org_invitations
  for select
  to authenticated
  using (public.is_org_admin(org_invitations.org_id));

drop policy if exists "org_invitations_insert_admin" on public.org_invitations;
create policy "org_invitations_insert_admin"
  on public.org_invitations
  for insert
  to authenticated
  with check (public.is_org_admin(org_invitations.org_id));

drop policy if exists "org_invitations_update_admin" on public.org_invitations;
create policy "org_invitations_update_admin"
  on public.org_invitations
  for update
  to authenticated
  using (public.is_org_admin(org_invitations.org_id))
  with check (public.is_org_admin(org_invitations.org_id));

drop policy if exists "org_invitations_delete_admin" on public.org_invitations;
create policy "org_invitations_delete_admin"
  on public.org_invitations
  for delete
  to authenticated
  using (public.is_org_admin(org_invitations.org_id));
