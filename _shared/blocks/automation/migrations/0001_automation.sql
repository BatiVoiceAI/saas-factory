-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0001 — état d'automatisation (archétype AUTOMATION)
-- ─────────────────────────────────────────────────────────────────────────────
-- Deux tables d'INFRASTRUCTURE serveur (pas un schéma orienté utilisateur) :
--   • automation_runs         → AU2 : historique des runs + logs consultables
--   • automation_idempotency  → AU5 : curseurs de re-run (pas de double effet)
--
-- Sécurité (safety-rails §4) : RLS ACTIVÉE, AUCUNE policy. Ces tables ne sont ni
-- lues ni écrites par un client authentifié — seul le SERVICE ROLE (le worker,
-- qui bypasse la RLS) y touche via REST. Un run ou un curseur n'appartient à
-- personne au sens « owner » : c'est de l'infrastructure, pas une ressource user.
--
-- Supabase est OPTIONNEL : sans DB, le worker bascule sur un fallback console
-- (runs) et fichier/mémoire (idempotence). Ces tables ne sont donc requises que
-- pour une trace durable et multi-instance.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── AU2 — Historique des runs + logs ────────────────────────────────────────
create table if not exists public.automation_runs (
  id            uuid        primary key default gen_random_uuid(),

  -- Nom logique du job (ex. 'automation', 'sync-crm', 'daily-digest'…).
  name          text        not null,

  started_at    timestamptz not null default now(),
  finished_at   timestamptz,

  -- Cycle de vie : 'running' → 'success' | 'failure'. Le healthcheck (AU3) lit
  -- le dernier statut ; un job en cours reste 'running' jusqu'à finishRun().
  status        text        not null default 'running'
                  check (status in ('running', 'success', 'failure')),

  -- Résumé humain du run (volume traité, cause d'échec…) + lignes de log.
  summary       text,
  logs          jsonb       not null default '[]'::jsonb,

  created_at    timestamptz not null default now()
);

comment on table public.automation_runs is
  'AU2 : historique des runs du worker (début, fin, statut, résumé, logs). '
  'Service-role only (RLS activée, aucune policy). Cf. _shared/blocks/automation.';

-- Requête chaude du healthcheck / de l'admin optionnel : « le dernier run ».
create index if not exists automation_runs_recent_idx
  on public.automation_runs (started_at desc);

-- ── AU5 — Curseurs d'idempotence ────────────────────────────────────────────
-- Une ligne par clé d'unité de travail (sha256 hex, dérivée déterministe). La
-- PRIMARY KEY sur `key` garantit l'unicité ⇒ upsert idempotent (merge-duplicates).
create table if not exists public.automation_idempotency (
  key           text        primary key,

  -- Horodatage de la RÉCLAMATION (claim-avant) : le worker skippe si une clé a
  -- été réclamée dans la fenêtre d'idempotence (IDEMPOTENCY_WINDOW_SEC).
  claimed_at    timestamptz not null default now(),

  created_at    timestamptz not null default now()
);

comment on table public.automation_idempotency is
  'AU5 : curseurs d''idempotence (re-run sûr, pas de double effet). Clé = sha256 '
  'de l''unité de travail. Service-role only (RLS activée, aucune policy).';

-- Balayage du purge par ancienneté (cf. fonction ci-dessous).
create index if not exists automation_idempotency_claimed_idx
  on public.automation_idempotency (claimed_at);

-- ── Housekeeping — purge des vieux curseurs d'idempotence ───────────────────
-- Fonction plpgsql : lesson #15 appliquée intégralement (une fonction plpgsql,
-- a fortiori SECURITY DEFINER, ne doit jamais référencer un nom NU collisionnable
-- avec une colonne). Parades cumulées ici :
--   • `#variable_conflict use_column`  → un nom ambigu résout vers la COLONNE ;
--   • paramètre préfixé `p_`, variable préfixée `v_` (jamais de collision) ;
--   • colonnes TOUJOURS qualifiées (public.automation_idempotency.claimed_at) ;
--   • `set search_path = ''`           → schémas explicites (durcissement DEFINER).
create or replace function public.automation_prune_idempotency(p_before timestamptz)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
  #variable_conflict use_column
declare
  v_deleted integer;
begin
  delete from public.automation_idempotency
    where public.automation_idempotency.claimed_at < p_before;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

comment on function public.automation_prune_idempotency(timestamptz) is
  'Purge les curseurs d''idempotence réclamés avant p_before. Service-role only.';

-- SECURITY DEFINER : retirer l'exécution au public / aux rôles clients. Seul le
-- service-role (bypass RLS) appelle cette maintenance.
revoke all on function public.automation_prune_idempotency(timestamptz)
  from public, anon, authenticated;

-- ── RLS : service role uniquement (aucune policy = aucun accès client) ───────
alter table public.automation_runs         enable row level security;
alter table public.automation_idempotency  enable row level security;
-- Volontairement AUCUNE policy sur ces deux tables : seul le service role
-- (worker/cron, qui bypasse la RLS) lit/écrit. Un client authentifié ne peut ni
-- voir l'historique des runs ni forger un curseur d'idempotence.
