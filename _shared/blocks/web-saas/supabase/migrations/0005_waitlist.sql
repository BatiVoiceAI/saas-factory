-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0005 — bloc `waitlist` (OPTIONNEL) : capture de leads landing
-- ─────────────────────────────────────────────────────────────────────────────
-- Numéro figé (CONVENTIONS.md §5, zéro collision — vient après 0004_notifications).
--
-- Bloc ADDITIF sélectionné pour l'archétype **landing-only** (skeleton + waitlist
-- + notifications + légal, SANS auth/crud/dashboard/billing). Table GÉNÉRIQUE de
-- capture d'e-mails : aucune fuite métier (ni booking, ni salon, ni rdv). Le sens
-- « produit » vit dans (source, referrer, metadata) — la table ne le connaît pas.
--
-- Boucle fermée : l'insertion d'un lead se fait via la route serveur
-- `app/api/waitlist/route.ts` (client service-role), qui ENFILE ensuite un job
-- `waitlist_confirmation` (bloc notifications) puis APPELLE l'envoi immédiat
-- (`dispatchEntityJobs(lead.id)`) — cf. lib/notifications/*.
--
-- Sécurité (safety-rails §4 / CONVENTIONS.md §8) : RLS ACTIVÉE, AUCUNE policy.
-- Un visiteur anonyme n'écrit JAMAIS directement cette table : la route
-- serveur, en service-role (qui bypasse la RLS), est la seule porte d'insertion.
-- Cela évite le spam d'insert anon et centralise validation + boucle e-mail.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.leads (
  id          uuid        primary key default gen_random_uuid(),

  -- E-mail capturé (obligatoire). La normalisation (trim + minuscule) est faite
  -- côté route serveur ; la contrainte d'unicité ci-dessous est insensible à la
  -- casse par sécurité.
  email       text        not null,

  -- Provenance fonctionnelle du lead, opaque à la table : ex. 'hero',
  -- 'pricing', 'footer', 'campaign:launch'… Renseignée par le call-site.
  source      text,

  -- Referrer HTTP capté à l'insertion (page d'origine), pour l'attribution.
  referrer    text,

  -- Métadonnées libres, sérialisables (UTM, variante A/B…) — jamais de PII
  -- sensible. Défaut objet vide.
  metadata    jsonb       not null default '{}'::jsonb,

  -- Cycle de vie du lead. 'pending' à la capture ; 'confirmed' si un double
  -- opt-in est câblé plus tard (clic sur un lien de confirmation). Le châssis
  -- livre la capture simple ('pending') — le passage à 'confirmed' est optionnel.
  status      text        not null default 'pending'
                check (status in ('pending', 'confirmed')),

  created_at  timestamptz not null default now()
);

comment on table public.leads is
  'Bloc waitlist (archétype landing) : table GÉNÉRIQUE de capture de leads '
  'landing (e-mail + source + referrer + metadata). Aucune fuite métier. '
  'Insertion via route serveur service-role uniquement (RLS sans policy). '
  'Boucle fermée e-mail via le bloc notifications (type waitlist_confirmation).';

-- ── Idempotence e-mail (insensible à la casse) ──────────────────────────────
-- Un même e-mail ne s'inscrit qu'UNE fois, quelle que soit la casse saisie
-- ("A@B.com" == "a@b.com"). Index UNIQUE sur lower(email) : la route serveur
-- attrape la violation d'unicité (SQLSTATE 23505) et renvoie { ok:true } sans
-- doublon (idempotence côté API).
create unique index if not exists leads_email_unique_idx
  on public.leads (lower(email));

-- ── Tri anti-chronologique (dashboards / exports) ───────────────────────────
-- Requête chaude : les leads les plus récents d'abord. Index sur created_at.
create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

-- ── RLS : service role uniquement (aucune policy = aucun accès client) ───────
alter table public.leads enable row level security;
-- Volontairement AUCUNE policy : un client anonyme/authentifié ne peut ni lire
-- ni insérer. Seule la route serveur (service role, qui bypasse la RLS) écrit
-- ici — validation + anti-spam + boucle e-mail centralisés côté serveur.
