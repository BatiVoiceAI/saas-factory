-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0002 (EXEMPLE / TEMPLATE) — Idempotence d'ENTITÉ (P1-C)
-- ─────────────────────────────────────────────────────────────────────────────
-- ⚠️ CE FICHIER NE TOURNE PAS TEL QUEL. C'est un PATRON à copier/adapter par
--    verticale (renomme `example_item`, ses colonnes, ses statuts, sa RPC). Il
--    documente le SEUL montage qui tient l'invariant d'entité sous CONCURRENCE —
--    ce que `withIdempotency` (AU5, grain RUN) ne fait PAS.
--
-- S'applique APRÈS `0001_automation.sql`. Idempotent (`if not exists`). Concerne
-- UNIQUEMENT le path Supabase (prod) : le run de test/local tourne en fallback
-- FICHIER (`src/store.ts`, branche fichier) et n'exécute PAS ce SQL.
--
-- ── LES DEUX GRAINS D'IDEMPOTENCE (ne pas confondre) ─────────────────────────
--   • grain RUN    → `automation_idempotency` (0001) : « au plus un effet PAR
--                    déclenchement ». Géré par `withIdempotency`.
--   • grain ENTITÉ → CE fichier : « un besoin = AU PLUS UNE entité OUVERTE »,
--                    même sur plusieurs runs / instances / cadences. À porter par
--                    une CONTRAINTE DB (index unique partiel) + un upsert atomique
--                    (RPC `INSERT ... ON CONFLICT`), JAMAIS un check applicatif.
--
-- ── RÈGLE D'OR : LA CLÉ D'IDENTITÉ EXCLUT LES ATTRIBUTS MUTABLES ─────────────
-- `idem_key` = hash déterministe de ce qui DÉFINIT le besoin (ex. entité concernée
-- + FENÊTRE temporelle) — PAS la quantité, PAS la sévérité, PAS un prix. Inclure
-- un attribut mutable re-crée un doublon dès qu'il change (piège #16/#23 rétro).
--   idem_key = sha256( `<clé-métier>` | `<fenêtre>` )     -- déterministe, stable
--   ▸ Fenêtre DÉTERMINISTE : `floor((epoch_now - EPOCH_CONST) / periode_sec)`,
--     EPOCH_CONST fixe, préfixe VERSIONNÉ (`v1:`) pour pouvoir faire évoluer la
--     formule sans collisionner l'historique. Calculée côté worker, passée en RPC.
--
-- Sécurité : RLS activée SANS policy = service-role only (deny client). RPC en
-- `security definer`, `search_path = ''`, `revoke` public/anon (lesson #15).
-- ⚠️ [SÉCU] La preuve de vérité (RPC sans 42702, I1 sous CONCURRENCE : 2 upserts
--    concurrents → 1 seule ligne ouverte) se fait CONTRE UNE VRAIE BASE (étape 11 /
--    Phase 4) — elle est INVISIBLE au `tsc` et au run de test fichier.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Entité métier (RENOMME `example_item` + ses colonnes par ton domaine) ─────
create table if not exists public.example_item (
  id            uuid        primary key default gen_random_uuid(),

  -- CLÉ D'IDENTITÉ déterministe (attributs mutables EXCLUS). Porte l'invariant.
  idem_key      text        not null,

  -- Colonnes d'IDENTITÉ (immuables pour un besoin donné) — exemple.
  subject_key   text        not null,      -- ex. le sku, l'utilisateur, la ressource
  window_id     bigint      not null,      -- ex. bucket de fenêtre déterministe (v. supra)

  -- Colonnes MUTABLES (révisables sans changer l'identité) — exemple.
  amount        int         not null check (amount > 0),
  severity      text        not null default 'normal'
                  check (severity in ('normal', 'critique')),

  -- Cycle de vie : `ouvert` (arbitre de l'index partiel) → état FINAL.
  status        text        not null default 'ouvert'
                  check (status in ('ouvert', 'resolu', 'expire')),
  close_reason  text,

  -- Traçabilité vers le run qui a créé / mis à jour la ligne (AU2).
  run_id_creation uuid      references public.automation_runs(id) on delete set null,
  run_id_maj      uuid      references public.automation_runs(id) on delete set null,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  closed_at     timestamptz
);

comment on table public.example_item is
  'EXEMPLE (P1-C) : entité métier créée par un job. Invariant : au plus un OUVERT '
  'par idem_key, via l''index unique partiel ci-dessous. Service-role only.';

-- ── L'INVARIANT D'ENTITÉ : index unique PARTIEL sur la clé d'identité ─────────
-- Unicité UNIQUEMENT sur les lignes OUVERTES (`status = 'ouvert'`) : après
-- résolution/expiration, un nouveau besoin légitime (nouvelle fenêtre) peut
-- ré-ouvrir une ligne pour le même `subject_key`. C'est ce partiel qui rend
-- l'upsert atomique possible (l'ON CONFLICT infère cet index par sa clause WHERE).
create unique index if not exists example_item_open_idem_ux
  on public.example_item (idem_key) where status = 'ouvert';

-- Balayages usuels (adapter/retirer) : par sujet ouvert, par fenêtre ouverte.
create index if not exists example_item_subject_status_idx
  on public.example_item (subject_key, status);
create index if not exists example_item_window_open_idx
  on public.example_item (window_id) where status = 'ouvert';

-- ── UPSERT ATOMIQUE (concurrence-safe, RETURNING-safe, lesson #15) ────────────
-- INSERT ... ON CONFLICT sur l'index unique PARTIEL. La nouvelle ligne naît
-- toujours `status = 'ouvert'` ⇒ l'arbitre partiel s'applique. En conflit : on
-- RÉVISE les attributs mutables (jamais l'identité), on ne crée pas de 2ᵉ ouvert.
--
-- lesson #15 (fonction SECURITY DEFINER 42702-safe) appliquée intégralement :
--   • `#variable_conflict use_column` → un nom ambigu résout vers la COLONNE ;
--   • paramètres préfixés `p_`, variables préfixées `v_` (jamais de collision) ;
--   • colonnes TOUJOURS qualifiées dans le RETURNING (`public.example_item.*`) ;
--   • `set search_path = ''` → schémas explicites (durcissement DEFINER).
-- RETURNING-safe : la RPC renvoie la ligne SANS dépendre d'une policy SELECT
-- (service-role bypass RLS ; ces tables n'ont de toute façon aucune policy).
create or replace function public.reconcile_example_item(
  p_idem_key    text,
  p_subject_key text,
  p_window_id   bigint,
  p_amount      int,
  p_severity    text,
  p_run_id      uuid
) returns public.example_item
language plpgsql
security definer
set search_path = ''
as $$
  #variable_conflict use_column
declare
  v_row public.example_item;
begin
  insert into public.example_item
    (idem_key, subject_key, window_id, amount, severity,
     status, run_id_creation, run_id_maj)
  values
    (p_idem_key, p_subject_key, p_window_id, p_amount, p_severity,
     'ouvert', p_run_id, p_run_id)
  on conflict (idem_key) where (status = 'ouvert')
  do update set
     amount     = excluded.amount,       -- attribut MUTABLE révisé (hors identité)
     severity   = excluded.severity,
     run_id_maj = excluded.run_id_maj,
     updated_at = now()
  returning public.example_item.*
    into v_row;
  return v_row;
end;
$$;

comment on function public.reconcile_example_item(text, text, bigint, int, text, uuid) is
  'EXEMPLE (P1-C) : upsert idempotent d''une entité ouverte. Crée si absent, révise '
  'les attributs mutables si présent. Concurrence-safe (index partiel). Service-role only.';

-- ── RLS : service-role uniquement (aucune policy = aucun accès client) ────────
alter table public.example_item enable row level security;
-- Volontairement AUCUNE policy : seul le service-role (worker, bypass RLS) lit/écrit.

-- SECURITY DEFINER : retirer l'exécution aux rôles clients.
revoke all on function public.reconcile_example_item(text, text, bigint, int, text, uuid)
  from public, anon, authenticated;
