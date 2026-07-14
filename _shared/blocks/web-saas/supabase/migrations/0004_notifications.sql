-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0004 — bloc `notifications` : file de jobs de boucles fermées
-- ─────────────────────────────────────────────────────────────────────────────
-- Numéro figé (CONVENTIONS.md §5, zéro collision — vient après 0003_billing).
--
-- Table GÉNÉRIQUE (aucune fuite métier : ni booking, ni rdv, ni salon). Elle
-- porte TOUTES les boucles fermées du produit (_shared/boucles-fermees.md) :
-- confirmation à l'acteur, notification à la contrepartie, rappel avant échéance.
-- Le sens métier vit dans (entity_type, type, payload) — la table ne le connaît
-- pas. Le call-site d'une action de valeur ENFILE un job ici (durabilité +
-- idempotence + retry) puis APPELLE l'envoi immédiat (`dispatchEntityJobs`) —
-- cf. lib/notifications/dispatch.ts. Le cron quotidien ne fait que balayer les
-- échéances dues + rejouer les `pending` en échec.
--
-- Sécurité (safety-rails §4 / CONVENTIONS.md §8) : RLS ACTIVÉE, AUCUNE policy.
-- La table n'est jamais lue ni écrite par un client authentifié : seul le
-- service role (routes serveur + cron) y touche, en bypassant la RLS. Un job
-- de notification n'appartient à personne au sens « owner » — c'est de
-- l'infrastructure serveur, pas une ressource utilisateur.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.notification_jobs (
  id            uuid        primary key default gen_random_uuid(),

  -- Cible métier, opaque à la table : ex. entity_type = 'reservation' | 'order'
  -- | 'request' | 'invitation' … et l'id de la ligne concernée dans SA table.
  entity_type   text        not null,
  entity_id     uuid        not null,

  -- Nature de la boucle. Générique : 'confirmation' (accusé à l'acteur),
  -- 'notify_owner' (contrepartie informée), 'reminder' (rappel avant échéance)…
  -- La paire (entity_id, type) est UNIQUE (idempotence, cf. plus bas).
  type          text        not null,

  -- Canal de livraison. Le châssis livre 'email' (bloc notifications / Resend) ;
  -- un futur bloc SMS/push étendrait cet ensemble sans toucher la table.
  channel       text        not null default 'email',

  -- Destinataire résolu (email pour le canal 'email'). Peut être null si le
  -- destinataire est porté par le payload selon le canal.
  recipient     text,

  -- Contenu prêt-à-livrer, sérialisable (pas de composant React en base) :
  -- ex. { "subject": "...", "html": "...", "text": "...", "replyTo": "..." }.
  payload       jsonb       not null default '{}'::jsonb,

  -- Cycle de vie. 'pending' → 'sent' | 'failed'. Le worker/cron ne prend que
  -- les 'pending' dus (scheduled_for <= now()).
  status        text        not null default 'pending'
                  check (status in ('pending', 'sent', 'failed')),

  -- Échéance d'envoi. now() = envoi immédiat (confirmation/notification) ;
  -- daté dans le futur = rappel planifié (J-1) balayé par le cron quotidien.
  scheduled_for timestamptz not null default now(),

  -- Compteur de tentatives (retry best-effort) + dernière erreur pour le debug.
  attempts      int         not null default 0,
  last_error    text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.notification_jobs is
  'Bloc notifications : file GÉNÉRIQUE des jobs de boucles fermées (confirmation, '
  'notify_owner, reminder). Service-role only. Enfiler ≠ envoyer : le call-site '
  'de l''action appelle dispatchEntityJobs(entity_id) ; le cron ne fait que '
  'rappels + retry. Cf. _shared/boucles-fermees.md.';

-- ── Idempotence par (entity_id, type) ───────────────────────────────────────
-- Une seule ligne par (dossier, nature de boucle) : rejouer le call-site OU le
-- cron le même jour ne redouble JAMAIS l'envoi (garde-fou boucles-fermees.md).
-- Contrainte UNIQUE ⇒ `enqueueJob` peut faire un upsert idempotent (ON CONFLICT
-- DO NOTHING) sur cette paire — cf. lib/notifications/enqueue.ts.
create unique index if not exists notification_jobs_entity_type_key
  on public.notification_jobs (entity_id, type);

-- ── Balayage du worker/cron : les jobs dus en attente ───────────────────────
-- Requête chaude : status = 'pending' AND scheduled_for <= now(), triés par
-- échéance. Index composite (status, scheduled_for) pour la servir sans scan.
create index if not exists notification_jobs_due_idx
  on public.notification_jobs (status, scheduled_for);

-- ── updated_at auto (fonction nommée par bloc → aucune collision inter-blocs) ─
create or replace function public.notifications_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_notification_jobs_updated_at on public.notification_jobs;
create trigger set_notification_jobs_updated_at
  before update on public.notification_jobs
  for each row
  execute function public.notifications_set_updated_at();

-- ── RLS : service role uniquement (aucune policy = aucun accès client) ───────
alter table public.notification_jobs enable row level security;
-- Volontairement AUCUNE policy : seul le service role (dispatch + cron, qui
-- bypasse la RLS) lit/écrit cette table. Un client authentifié ne peut ni voir
-- ni forger un job de notification.
