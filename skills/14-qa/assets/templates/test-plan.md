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
1. **Parcours #0 (imposé) — arrivée réelle** : landing → signup OTP/magic link (code **réellement reçu + saisi**) → onboarding (création de l'**entité cœur**) → dashboard non-vide → job cœur. Verdict « pro et complet » vs « démo creuse » (`references/fake-client-protocol.md`).
{+ les autres parcours de bout en bout à jouer au faux-client (passe 2 de l'étape 14).}

## Cas limites transverses
{Entrée invalide · double-clic · session expirée · offline · gros volume…}
