---
name: 15-client-review
description: >-
  Étape 15 (Phase 4 · build) de SaaS Factory — Revue client (le vrai humain). Dernière étape du build et SEUL contact humain : le produit fini (validé par la cascade + le faux-client + le livret de test) est présenté à l'utilisateur/founder, qui le teste (guidé), donne son feedback en langage naturel, feedback traduit en tâches, re-dispatch des corrections avec budget d'itération, et PORTE de décision : ship en l'état / itérer / stop. Minimise la charge humaine (non-technique, guidé, honnête). Se déclenche après la QA (étape 14), pour « revue client », « montrer au client », « valider avec l'utilisateur ».
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, Grep, Glob, Task
---

# SaaS Factory — Étape 15 : Revue client (le vrai humain)

La **dernière étape du build**, et le **seul contact humain**. Le produit a passé la cascade (13), le faux-client (14) et le livret de test. Maintenant **l'humain le voit** pour la première fois depuis le Go de la Phase 1.

**Principe directeur : minimiser la charge de l'humain.** Non-technique, **guidé**, **honnête** (on montre ce qui marche ET ce qu'on sait imparfait). L'humain ne voit **aucun artefact technique** — juste le produit + un langage clair.

**HARD GATE.** Ici l'**humain décide** (porte). Les corrections repartent dans le build (12→13→14). Le produit sort d'ici seulement sur décision **« ship »**.

## À lire d'abord
`_shared/lessons.md`, `_shared/safety-rails.md`, `_shared/validation-cascade.md` (le budget), `_shared/test-dossier.md` (le livret = « ce qui en ressort ») ; `references/review-package.md` (étape 1), `references/guided-test.md` (étape 2), `references/feedback-elicitation.md` (étape 3, recettes de questions), `references/feedback-to-tasks.md` (étape 4), `references/iteration-gate.md` (étapes 5-6, re-dispatch + porte). Agent : `client-liaison` (feedback → tâches).

## Garde type (locale)
Lis `Type / route` dans `.saas-factory/state.md` **avant** de dérouler (matrice canonique : `skills/saas-factory/references/routing.md`) :
- **public** → l'humain est le **founder** : cérémonie complète (paquet + test guidé + feedback + porte).
- **interne** → l'humain est le **sponsor interne** : mêmes 6 étapes, parcours métier internes, langage « adoption équipe », pas de discours marché.
- **perso** → l'humain, c'est **toi** : version très courte — URL + « ce qui en ressort » + porte ship/itérer/stop, sans cérémonie de paquet.
Type absent (invocation isolée) → défaut prudent **public**, et signale l'anomalie.

## Les 6 étapes
1. **Paquet de revue** (`references/review-package.md`) — l'**URL staging** + un **résumé en langage clair** (ce qui a été construit, le workflow cœur) + **« ce qui en ressort »** du livret (santé) + **honnêtement** les `CONCERNS`/`WAIVED` + **miroir P0.7 (pricing = features livrées)** : le persona re-diffe la page pricing contre le § Périmètre livré du PRD — feature vendue non livrée = **bloquant** (« bientôt » ou retirée) **avant** de présenter (règle canonique en 12-build, ne pas redéfinir ; *(public)* — calibré par type, cf. « Garde type » ci-dessus & `routing.md`). Prépare un accès de test guidé. *(Réutilise gstack `document-release` + `qa`.)*
2. **Guider le test** (`references/guided-test.md`) — une courte checklist « essaie ça » : les **parcours cœur A→Z** + l'edge. L'humain clique, zéro compétence technique. *(Base : `kata-verify-work`, persona founder.)*
3. **Recueillir le feedback en langage naturel** (`references/feedback-elicitation.md`) — l'humain dit ce qu'il aime / ce qui cloche / ce qu'il changerait, **avec ses mots**. On capte **fidèlement** (`client-feedback.md`, template `assets/templates/client-feedback.md`), sans traduire encore. Élicitation « raconte ton ressenti », pas « remplis un bug report » (recettes de forcing-questions : pousser jusqu'au spécifique, ne pas prendre la politesse pour une validation).
4. **Traduire feedback → tâches** (`references/feedback-to-tasks.md`, agent `client-liaison`, sortie `client-review-tasks.md`, template `assets/templates/client-review-tasks.md`) — le langage utilisateur → **items concrets** : bug / feature manquante / ajustement UX / changement de scope. Distinguer **corrigeable (budget)** vs **expansion (parquer)** vs **« pas un vrai problème »**. *(Moteur : `synthesize-research` + `write-spec` vendorés.)*
5. **Re-dispatch avec budget** (`references/iteration-gate.md`) — renvoyer les corrections : build (12) → cascade (13) → faux-client (14), dans le **budget d'itération** (`_shared/validation-cascade.md`). Puis re-présenter à l'humain.
6. **LA PORTE — ship / itérer / stop** (`references/iteration-gate.md`, `AskUserQuestion`) — l'humain décide : **Ship** (→ Phase 5, `CONCERNS` documentés) · **Itérer** (sur X, dans le budget) · **Stop/park**. Bouton **« ship en l'état »**.

## Contrat d'artefacts
Lit : `qa/test-booklet.md` (« ce qui en ressort » + `CONCERNS`/`WAIVED`), `product/*` (l'attendu du PRD ; dont `product/pricing.md` ↔ `product-spec.md § Périmètre livré` pour le miroir P0.7 *(public)*), le staging (URL étape 11), `.saas-factory/state.md` (budget client + `Type / route` pour la garde type). Écrit : le paquet de revue rempli (`product/review-package.md`, template `assets/templates/review-package.md`), `product/client-feedback.md` (verbatim, template), `product/client-review-tasks.md` (tâches classées + routées, template) via `client-liaison`, et `.saas-factory/state.md` (porte 15 + budget). **Jamais de secret** dans un artefact (accès démo → env / oral, `safety-rails` §4).

## La porte (fin d'étape)
Présente le produit (URL + résumé clair + ce qui en ressort) + les options via `AskUserQuestion`. **Ne franchis jamais sans décision explicite.** Ship → Phase 5. Itérer → boucle (budget). Stop → park propre + post-mortem court.

## Garde-fous
- **Zéro jargon, zéro artefact technique** montré à l'humain.
- **Honnêteté** : les `CONCERNS`/`WAIVED` du livret sont dits, pas cachés (`_shared/lessons.md`).
- **Pricing = features livrées (P0.7, *(public)*)** : jamais présenter au founder une page pricing qui vend du non-livré — miroir rejoué **avant** l'étape 1→2 (règle canonique 12-build, calibré par type ; interne/perso : N/A, pas de pricing).
- **Budget** : l'itération client est **bornée** (pas de boucle infinie).
- **Minimiser la charge** : guidé, court, décision claire.

## Sortie & état
Décision de l'humain actée. Mets à jour `.saas-factory/state.md` (décision, porte). Résume en 2 lignes. **Ship** → annonce la **Phase 5** (SEO + déploiement). **Fin de la Phase 4.**
