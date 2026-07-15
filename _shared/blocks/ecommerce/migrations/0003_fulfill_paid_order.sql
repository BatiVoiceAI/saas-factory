-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0003 — RPC fulfill_paid_order : P1 + P2 + P3 dans UNE transaction
-- ─────────────────────────────────────────────────────────────────────────────
-- S'applique APRÈS 0002_orders_inventory.sql. C'est le POINT UNIQUE où une vente se
-- matérialise, appelé par le WEBHOOK Stripe (service_role) sur
-- `checkout.session.completed` / `payment_intent.succeeded`. Le webhook = source de
-- vérité du paiement ; le retour navigateur (page /merci) ne crée JAMAIS la commande.
--
-- Les trois pièges DURS de l'archétype (portes 13/14) sont réunis ici, atomiques :
--   • P1 — anti-survente : décrément CONDITIONNEL atomique (`update ... where
--          stock >= qty`) ; 0 ligne affectée ⇒ `raise exception` ⇒ ROLLBACK TOTAL
--          (stock + commande). Deux commandes concurrentes sur le dernier article
--          ne réussissent jamais toutes les deux. Jamais un `SELECT stock` puis `if`.
--   • P2 — intégrité du prix : le montant est RECALCULÉ depuis le CATALOGUE serveur
--          (`products.price_cents`), à partir des seuls (product_id, qty) transmis.
--          Aucun prix client. `order_items` SNAPSHOT le prix payé (figé).
--   • P3 — idempotence : `insert ... on conflict (stripe_session_id) do nothing`.
--          Une redelivery Stripe (at-least-once) ⇒ noop ⇒ on ressort la commande
--          existante avec `already_processed = true` (ni stock re-décrémenté, ni
--          e-mail à ré-émettre côté appelant).
--
-- ── lesson #15 (bug 42702 « column reference is ambiguous », INVISIBLE au build) ──
-- Une fonction plpgsql COMPILE toujours ; Postgres ne résout les noms qu'à
-- l'exécution. Garde-fous CUMULÉS ici (ceinture + bretelles) :
--   • `#variable_conflict use_column` en tête de corps → un nom ambigu résout vers
--     la COLONNE ;
--   • paramètres préfixés `p_`, variables préfixées `v_` (jamais un nom de colonne) ;
--   • colonnes systématiquement QUALIFIÉES (`orders.id`, `inventory.stock`…) ;
--   • `set search_path = ''` → tout schéma-qualifié (durcissement SECURITY DEFINER).
-- ⚠️ PREUVE : ni `tsc` ni `next build` ne voient ce SQL. Le seul filet est un
--    SMOKE-TEST qui APPELLE réellement la RPC contre une vraie base (étape 11 /
--    Phase 4) : 0 erreur 42702, P1 sous concurrence (2 appels → 1 seul décrément),
--    P3 (2 appels même session → 1 commande). Cf. integration-pass.md.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.fulfill_paid_order(
  p_stripe_session_id text,
  p_customer_email    text,
  p_user_id           uuid,   -- null = achat INVITÉ (checkout guest)
  p_items             jsonb   -- [{ "product_id": uuid, "qty": int }] — SANS prix (P2)
)
returns table (order_id uuid, already_processed boolean)
language plpgsql
security definer
set search_path = ''
as $$
  #variable_conflict use_column   -- (a) garde-fou anti-42702 (lesson #15)
declare
  v_order_id uuid;
  v_item     jsonb;
  v_price    integer;
  v_name     text;
  v_total    integer := 0;
begin
  -- ── P3 — idempotence : insert-or-noop sur la clé Stripe ────────────────────
  -- En redelivery, l'unique(stripe_session_id) déclenche le conflit → DO NOTHING →
  -- le RETURNING ne ramène aucune ligne → v_order_id reste NULL.
  insert into public.orders (stripe_session_id, user_id, customer_email, status, total_cents)
  values (p_stripe_session_id, p_user_id, p_customer_email, 'paid', 0)
  on conflict (stripe_session_id) do nothing
  returning orders.id into v_order_id;

  if v_order_id is null then
    -- Commande déjà traitée (redelivery) : on la ressort, SANS rejouer d'effet.
    return query
      select orders.id, true
      from public.orders
      where orders.stripe_session_id = p_stripe_session_id;
    return;
  end if;

  -- ── Pour chaque ligne : P2 (prix serveur) puis P1 (décrément atomique) ──────
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- P2 — prix + libellé pris au CATALOGUE (produit PUBLIÉ), jamais le payload client.
    select products.price_cents, products.name
      into v_price, v_name
    from public.products
    where products.id = (v_item ->> 'product_id')::uuid
      and products.published = true;

    if not found then
      raise exception 'produit introuvable ou non publié (%)', v_item ->> 'product_id';
    end if;

    -- P1 — décrément CONDITIONNEL atomique. `where stock >= qty` : 0 ligne affectée
    -- = rupture → on lève, ce qui ANNULE TOUTE la transaction (stock + commande).
    update public.inventory
    set stock      = stock - (v_item ->> 'qty')::int,
        updated_at = now()
    where inventory.product_id = (v_item ->> 'product_id')::uuid
      and inventory.stock      >= (v_item ->> 'qty')::int;

    if not found then
      raise exception 'rupture de stock (product %)', v_item ->> 'product_id';
    end if;

    -- SNAPSHOT du prix serveur payé (P2) — pas de FK vive vers products.price_cents.
    insert into public.order_items (order_id, product_id, qty, unit_price_cents, product_name)
    values (
      v_order_id,
      (v_item ->> 'product_id')::uuid,
      (v_item ->> 'qty')::int,
      v_price,
      v_name
    );

    v_total := v_total + v_price * (v_item ->> 'qty')::int;
  end loop;

  -- P2 — total RECALCULÉ serveur (jamais un total client).
  update public.orders
  set total_cents = v_total,
      updated_at  = now()
  where orders.id = v_order_id;

  return query select v_order_id, false;
end;
$$;

comment on function public.fulfill_paid_order(text, text, uuid, jsonb) is
  'ECOMMERCE : matérialise une vente payée (webhook Stripe, service_role). Réunit '
  'P1 (décrément stock atomique), P2 (prix recalculé serveur + snapshot) et P3 '
  '(idempotence sur stripe_session_id) dans UNE transaction. lesson #15 appliquée.';

-- ── SECURITY DEFINER : durcissement des droits (lesson #15) ───────────────────
-- Par défaut Postgres accorde EXECUTE à PUBLIC : on le retire, puis on ne rouvre
-- l'exécution qu'au SEUL rôle légitime — le WEBHOOK (service_role). Un client
-- (anon/authenticated) ne peut JAMAIS appeler cette RPC (P2/P3).
revoke all     on function public.fulfill_paid_order(text, text, uuid, jsonb) from public, anon, authenticated;
grant  execute on function public.fulfill_paid_order(text, text, uuid, jsonb) to   service_role;
