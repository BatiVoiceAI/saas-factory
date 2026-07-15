# Gates — Phase 5 : gestion des portes

La Phase 5 est la phase la plus sensible du pipeline : **elle publie et elle dépense**. Deux portes utilisateur (une interne à 16, une majeure à 17), plus le canary, plus le **contrôle BLOQUANT de fin de phase 17b** (recette live authentifiée). Ce fichier dit ce que chaque 🚪 **décide**, comment la présenter, et où renvoient les refus.

## Principe : une porte = une décision utilisateur, en clair + preuve
On ne fait **jamais** lire un artefact technique pour décider. On présente **quoi / où / coût / réversibilité** en langage business + une preuve (URL de preview, coût chiffré, checklist verte), puis on demande un **OK explicite** (`AskUserQuestion`). L'OK est **tracé** dans `state.md`. Aucune généralisation d'un OK à une action ultérieure.

## Porte 1 — Gate humain de publication du contenu (`16-seo`, interne)
- **Décide** : est-ce que ces pages SEO **peuvent être publiées** ? (On ne publie pas de contenu public sans OK — safety §1.)
- **Preuve présentée** : nombre de pages ≤ plafond dur, chaque page PASS au self-assessment Helpful Content / E-E-A-T, pas de cannibalisation, technique verte (`unlighthouse`).
- **Retour si refus** : corrige/retire les pages fautives (plafond, contenu creux, cannibalisation) **avant** d'enchaîner 17. Ne passe pas à 17 avec du contenu non validé.
- **Note** : l'**indexation réelle** ne se fait pas ici — elle se fait au **déploiement (17)**. Ce gate valide le *contenu*, pas la mise en ligne.

## Porte 2 — Porte de publication (`17-deploy`, majeure — plan-then-apply)
- **Active selon le type** (liste réelle des portes par type : `skills/saas-factory/references/routing.md` §Portes actives) : complète en `public`, conditionnelle en `interne` (+ check « signup anonyme refusé »), absente en `perso` quand la cible est la preview URL du provider à coût nul — elle revient dès que ça touche un domaine public ou que ça dépense.
- **Décide** : **on met en ligne en production, maintenant, avec ce plan** ? C'est le feu vert **technique** au cutover (au-delà de la décision « ship » produit de l'étape 15 — les deux sont distincts).
- **Pré-condition** : pré-vol **vert** (build/tests OK, livret sans `FAIL` bloquant, secrets en env, migrations prod idempotentes, rollback testé). Pré-vol rouge ⇒ **la porte ne s'ouvre pas**.
- **Plan présenté** : domaine prod, promotion de la version staging (SHA figé), changement DNS, **coût chiffré**, réversibilité (rollback N-1 en une commande).
- **OK explicite requis** avant **tout** apply. Jamais de publication sans réponse.
- **Retour si refus / à ajuster** (coût, domaine, timing) : rester en **sandbox**, ajuster le plan, **re-présenter** la porte. Aucun apply tant que pas d'OK.

## Contrôle 3 — Canary (`17-deploy`, post-apply, pas une porte utilisateur)
- **Vérifie** : pages clés à 200, parcours cœur OK en prod, pas de pic d'erreurs Sentry, Core Web Vitals OK.
- **Sain** → la mise en ligne est confirmée : URL live + tracking actif → **on enchaîne 17b** (le canary vert **ne suffit pas** à déclarer « livré »).
- **Dégradé / échec** → **rollback** vers version N-1 + log honnête, diagnostic, re-plan. **Pas de faux succès** (safety §6). On ne laisse jamais la prod dégradée.

## Contrôle 4 — Recette live AUTHENTIFIÉE (`17b`, post-canary, BLOQUANT — pas une porte utilisateur)
- **Active** : **dès qu'il y a auth + RLS** (route selon `skills/saas-factory/references/routing.md` — complète et multi-rôles avec matrice cross-tenant en web-saas `public`/`interne`, **au maximum** en `multi-org` ; preuve d'action seule en `perso` ; sans objet en `landing` ; réduite à la boucle fermée en `automation` ; **spécialisée en achat de test réel A→Z (preuves P1/P2/P3) en `ecommerce`** — cf. §Archétype `ecommerce`).
- **Vérifie** : sur la **PROD réelle**, on **franchit vraiment l'auth** (OTP **complété** via boîte sandbox de test **ou** session **forgée par l'Admin API** : `createUser` `email_confirm` + `signIn`) et on **exécute CHAQUE action de valeur RLS-protégée de CHAQUE rôle** — au **JWT user-scopé**, jamais service_role. **Preuve par action** : **2xx** + **ligne écrite au bon tenant** (vérif hors-bande) + **notification `sent` immédiate** + **refus cross-tenant prouvé**.
- **Vert (`recette_live: PASS`, 0 bloquant)** → produit **« livré »** → fin de phase.
- **Rouge** (bug RLS/scoping/junction, parcours d'invitation injoignable, notif absente, refus cross-tenant non prouvé) → **fix → redeploy → re-test** (budget cycles). **Jamais** de « livré » au rouge. « Ship plus vite » ne la supprime pas : les bugs RLS ne surgissent **qu'en connecté**.
- **Moteur déjà en place** — on ne réinvente pas : dispatch `agents/live-qa.md`, détail exécutable + DoD + modes d'échec dans `skills/17-deploy/references/live-qa.md`. Cadre : `skills/phase-5-launch/SKILL.md` + règle d'or 19 (`_shared/lessons.md`).

## Archétype `automation` — déploiement scheduler + boucle fermée headless
Quand `archetype = automation`, la Phase 5 **ne déploie pas une app web** : la cible du cutover est un **ordonnanceur** (GitHub Actions `schedule:` par défaut) et le contrôle 4 (recette live authentifiée `17b`) est **sans objet** (pas d'auth/RLS produit) → **remplacé** par une **vérif de boucle fermée headless** (run → logs → boucle → idempotence). La porte de publication reste **conditionnelle** (elle revient dès qu'on provisionne un scheduler distant, dépense, ou migre une BDD d'état). Caveats opérationnels de `schedule:` (cron UTC only · best-effort/retardé · **auto-désactivation après 60 j = mort silencieuse** · granularité 5 min) et règle « runner éphémère ⇒ Supabase obligatoire » : `skills/17-deploy/references/automation-deploy.md` (source unique — ne pas dupliquer ici).

## Archétype `ecommerce` — vitrine publique : SEO actif + recette live = achat de test réel A→Z
Quand `archetype = ecommerce`, la Phase 5 déploie une **vraie app web publique** (boutique) : **toutes les portes web-saas `public` restent actives**, aucune n'est retirée (à l'inverse d'automation).
- **Porte 1 — Gate contenu SEO (16) : OUI.** La vitrine est **publique et indexable** (catalogue, fiches produit) → le gate de publication du contenu SEO s'applique **comme en web-saas public** (jamais sauté).
- **Porte 2 — Publication (17) : complète** (domaine public + ça dépense) — plan-then-apply, **OK explicite** requis.
- **Contrôle 4 — Recette live 17b : ACTIVE et SPÉCIALISÉE en achat de test réel A→Z** (gate **non contournable**). Au-delà de la matrice cross-tenant classique, `17b` déroule sur la **PROD réelle** un **achat de bout en bout en Stripe mode test** : ajout au panier → checkout → **webhook `checkout.session.completed`/`payment_intent.succeeded`** → **commande créée UNE SEULE FOIS** (preuve **P3** — idempotence, la redelivery Stripe ne double pas) → **stock décrémenté atomiquement** (preuve **P1** — deux commandes concurrentes sur le dernier article ne réussissent pas toutes les deux) → **email de confirmation reçu** (client **ET** marchand — boucle fermée EC4). **Preuve P2** : un panier au **prix altéré** est **rejeté / recalculé serveur**. **RLS commandes** prouvée (un client ne voit pas les commandes d'un autre). **Un seul de P1/P2/P3 non prouvé = rouge** → fix → redeploy → re-test, **jamais « livré » au rouge** (`_shared/archetypes/ecommerce.md` §Critères d'acceptation).
- **Cran sécurité renforcé** hérité de la cascade 13 (P1/P2/P3 = edges `[SÉCU]` durs) : « ship plus vite » ne supprime pas ces preuves — survente, altération de prix et double-commande **ne surgissent qu'en paiement réel**. Détail exécutable de la recette d'achat : `_shared/archetypes/ecommerce.md` §Pipeline/Critères + `skills/17-deploy/references/live-qa.md` (spécialisation achat).

## Mode autonome / test (pas d'humain à la porte)
En run non-interactif, les portes de cette phase ne se suppriment **pas** : `AskUserQuestion` est remplacé par une **décision AUTO-ACTÉE + tracée** (raisonnement + verdict dans `state.md`), et le HARD GATE devient « rien de la suite écrit en douce ». **Exception dure spécifique à la Phase 5** : la **porte de publication** (elle **dépense et publie**) **ne s'auto-franchit jamais** — en autonome, on **s'arrête au plan** et on consigne « porte de publication requérant un humain, non franchie en autonome » (repli honnête, safety-rails §1). Règle canonique : `skills/saas-factory/references/gates.md §Portes en mode AUTONOME / test`.

## Graphe des décisions & retours arrière

```
 15-client-review ──Ship──▶ [Phase 5]
        │
        ├─Itérer─▶ reboucle Phase 4        (hors P5)
        └─Stop───▶ archive + mémoire       (hors P5)

 16-seo · gate contenu
   OK tracé ──────────▶ 17-deploy
   Refus ─────────────▶ corriger/retirer pages ─▶ re-gate

 17-deploy · pré-vol
   vert ──────────────▶ porte publication
   rouge ─────────────▶ correctif (→ éventuellement Phase 4) ─▶ re-pré-vol

 17-deploy · porte publication
   OK explicite ──────▶ apply ─▶ canary
   Refus/Ajuster ─────▶ ajuster plan (sandbox) ─▶ re-présenter porte

 17-deploy · canary
   sain ──────────────▶ 17b (recette live authentifiée)   [canary vert ≠ « livré »]
   échec ─────────────▶ rollback N-1 + log ─▶ re-plan ─▶ re-apply
   accès manquant ────▶ repli honnête (guide pas-à-pas), pas de faux succès

 17b · recette live authentifiée   (BLOQUANT, dès auth + RLS)
   vert (PASS) ───────▶ « LIVRÉ » ─▶ Fin Phase 5 ▶ Phase 6
   rouge ─────────────▶ fix ─▶ redeploy ─▶ re-test   (jamais « livré » au rouge)
   sans objet (landing / automation) ─▶ Fin Phase 5 ▶ Phase 6
```

## Traçabilité (obligatoire)
À chaque porte franchie, inscris dans `.saas-factory/state.md` : (porte, décision, date). Le **contrôle 17b** n'est pas une porte utilisateur mais son verdict s'inscrit aussi : `recette_live: PASS | PASS_WITH_CONCERNS` (+ chemin `deploy/live-qa-report.md`). Un OK de porte déjà inscrit **ne se redemande pas** à la reprise (state-resume.md). Jamais de secret/clé dans l'état ni dans les logs (safety §4).
