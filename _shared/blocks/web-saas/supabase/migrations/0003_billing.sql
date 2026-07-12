-- BLOC OPTIONNEL — inclus seulement si providers.billing = stripe (config-schema)
--
-- Bloc `billing` : état d'abonnement Stripe par utilisateur.
-- Migration figée (CONVENTIONS.md §5) : 0003_billing.sql, aucune collision.
--
-- Sécurité (safety-rails §4 / CONVENTIONS.md §8) : RLS ACTIVÉE.
--   - Lecture : chaque user ne voit QUE sa propre ligne.
--   - Écriture : réservée au service role (webhook Stripe), qui bypasse la RLS.
--     Aucune policy insert/update/delete pour les users authentifiés.

create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique
                           references auth.users (id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  status                 text,
  price_id               text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is
  'Bloc billing : miroir local de l''état d''abonnement Stripe, une ligne par user.';

-- Lookup rapide par customer (utilisé par le webhook pour retrouver le user).
create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id);

-- updated_at auto (fonction nommée pour le bloc → pas de collision inter-blocs).
create or replace function public.billing_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.billing_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;

-- Un utilisateur lit uniquement son propre abonnement.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Pas de policy insert/update/delete : toute mutation passe par le service
-- role (webhook / routes serveur), qui contourne la RLS. Un client authentifié
-- ne peut donc jamais forger son propre statut d'abonnement.
