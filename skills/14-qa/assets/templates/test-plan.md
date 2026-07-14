# Recette (plan de test) — {nom du projet}
> Écrite par le QA Analyst à l'**ouverture de la Phase 4**. *Comment on teste.* Dérivée des critères d'acceptation (PRD) + spec de validation (plan). {AAAA-MM-JJ}

## Principe
Chaque test se rattache à un **critère d'acceptation** du PRD. Verdict au format `PASS / CONCERNS / FAIL / WAIVED` + **preuve citée**.

## Par feature
### {feature}
- **Critères d'acceptation** (du PRD) : {liste}
- **Test technique** (dev / CTO) : {ce qu'on vérifie, comment}
- **Test sécuritaire** (CTO) : {OWASP / STRIDE applicables}
- **Test fonctionnel** (Tech Lead / faux-client) : {comportement + parcours}
- **Test design / a11y** (Designer / faux-client) : {conformité DESIGN.md + WCAG}
- **Test métier** (CEO) : {conformité workflow cœur / edge}

## Parcours d'intégration (A→Z)
1. **Parcours #0 (imposé) — CONDITIONNÉ PAR ARCHÉTYPE** (🚨 socle par archétype : `_shared/state-schema.md` ; portes 14 : `skills/saas-factory/references/routing.md`, ligne `14-qa`) — remplir **la ligne de l'archétype du run** (`state.md`), pas les trois :
   - **`web-saas`** — *arrivée réelle* : landing → signup OTP → mot de passe (code **réellement reçu + saisi**, puis **mot de passe posé** ; plus de magic link) → onboarding (création de l'**entité cœur**) → **dashboard non-vide** → job cœur. Verdict « pro et complet » vs « démo creuse ».
   - **`landing`** — *visiteur* : landing conforme (5-second test) → CTA/waitlist fonctionne → confirmation reçue → OG/responsive/légal. **Pas de signup/onboarding/dashboard** (`_shared/archetypes/landing.md`).
   - **`automation`** — *run* (headless) : déclencheur → run exécuté (logs) → effet + idempotence → boucle fermée (alerte/rapport au propriétaire) (`_shared/archetypes/automation.md`).
   Protocole : `references/fake-client-protocol.md`, « Parcours #0 ». **Ne recale jamais un `landing`/`automation` faute d'onboarding/dashboard.**
{+ les autres parcours de bout en bout à jouer au faux-client (passe 2 de l'étape 14).}

## Cas limites transverses
{Entrée invalide · double-clic · session expirée · offline · gros volume…}
