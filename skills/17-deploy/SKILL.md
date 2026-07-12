---
name: 17-deploy
description: >-
  Étape 17 (Phase 5 · lancement) de SaaS Factory — Déploiement & mise en ligne (rôle Release Eng / CTO). Exécute le « ship » décidé à l'étape 15 : plan-then-apply de la promotion staging→production, cutover DNS, activation du tracking (analytics + erreurs), et vérification de la santé prod (canary + rollback). Porte de publication avant la mise en ligne réelle. Se déclenche pour « déployer », « mettre en ligne », « ship », après le SEO (étape 16).
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, Grep, Glob
---

# SaaS Factory — Étape 17 : Déploiement & mise en ligne (Release Eng / CTO)

Le **« ship »** décidé à l'étape 15 devient **réel**. **Ça publie publiquement et ça peut dépenser** → `_shared/safety-rails.md` **§1 plan-then-apply** est **obligatoire**.

**HARD GATE.** On **met en ligne**, on ne build plus. Sortie : produit en **prod**, sur son domaine, tracking actif + santé vérifiée.

## À lire d'abord
`_shared/safety-rails.md` (§1 plan-then-apply, §1 bis autorisation durable, §2 sandbox), `_shared/stack-defaults.md`, la config `~/.saas-factory/config.json`, `references/deploy-procedure.md` (colonne vertébrale + machine à états).

Profondeur par étape (progressive disclosure) :
- `references/preflight-checklist.md` — DoD exhaustive du pré-vol + catalogue de cas limites.
- `references/publication-gate.md` — recette forcing-question de la porte + routage par réponse + cadrage coût.
- `references/canary-rollback.md` — seuils chiffrés, machine à états sain/dégradé/échec, runbook de rollback, modes d'échec.
- `references/live-qa.md` — recette live post-cutover : dispatch de l'agent `live-qa`, boucle de correction fix→redeploy→re-test (budget 3 cycles), matrice par type, DoD.

## Le moteur (on dépend, on ne réinvente pas)
Le déploiement s'appuie sur les **MCP infra** déjà connectés (`infra-setup`) : **Vercel/Cloudflare** (hébergement + promotion), **Cloudflare** (DNS), + activation **PostHog + Sentry**. On s'inspire des patterns **gstack `land-and-deploy`** (merge→CI→deploy→vérif) + **`canary`** (santé post-deploy) — sans les vendorer (couplés binaires).

## Procédure — plan-then-apply (dans l'ordre)
Principe : **rien d'irréversible sans porte**, chaque apply réversible en une commande, arrêt au premier échec (jamais de faux succès). Détail + matrices → `references/deploy-procedure.md`.

1. **Pré-vol** (bloquant) — build + tests **verts**, le **livret** (`qa/test-booklet.md`) **sans `FAIL` bloquant**, secrets en **env** (jamais en dur), migrations prod prêtes (idempotentes), rollback testé. → `preflight-checklist.md`.
2. **Plan de déploiement** — présente **quoi / où / coût / réversibilité** : domaine prod, promotion de la version staging (SHA figé), changement DNS, coût **chiffré**.
3. **🚪 PORTE de publication** (`AskUserQuestion`) — **OK explicite** avant tout apply. (Au-delà du « ship » produit de l'étape 15, c'est le feu vert **technique** au cutover.) **Jamais** de publication sans réponse. → `publication-gate.md`.
4. **Apply** (via MCP infra, ordre strict) — migrations prod → **promotion staging→production** (Vercel/CF) → **cutover DNS** (Cloudflare) → **activation tracking** (PostHog + Sentry). Chaque sous-étape = un point de rollback.
5. **Health check (canary)** — après déploiement : pages clés à 200, parcours cœur OK en prod, pas de pic d'erreurs Sentry (seuils **absolus** : 0 erreur sur le cœur, < 1/min hors-cœur, crash-free ≥ 99 % — pas de baseline au 1er ship), Core Web Vitals OK (LCP < 2,5 s / CLS < 0,1 / INP < 200 ms). **Échec → rollback** — re-promotion N-1 si une version prod existe, sinon (**premier ship**) **dépublication → preview URL privée** — + log, pas de faux succès. → `canary-rollback.md`.
6. **Recette live + boucle de correction** (bloquant pour la livraison) — le canary dit « le site répond », la recette dit « **le produit marche** ». Dispatche l'agent **`live-qa`** (`agents/live-qa.md`) sur la **prod réelle** : toutes les routes, le parcours cœur dans les **deux rôles** (navigateur réel), **OTP réel**, **boucles fermées prouvées** (`_shared/boucles-fermees.md` — statut Resend des emails, pas « le code les envoie »), effets en base, smoke RLS/cron. Chaque échec → **fix → redeploy → re-test** (budget **3 cycles**). Bloquant irréparable → rollback ; reste → consigné et **annoncé** au fondateur. Le fondateur non-tech récupère du **fonctionnel vérifié**, pas du « déployé ». → `live-qa.md`.

## Contrat d'artefacts
Lit : la décision **« ship »** dans `.saas-factory/state.md` (porte 15) + `product/review-package.md` + `client-review-tasks.md` (`CONCERNS` documentés, étape 15), `qa/test-booklet.md` (livret lu au pré-vol **et rejoué sur prod par la recette live**), `tech/provisioning-log.md`, `~/.saas-factory/config.json`, `_shared/boucles-fermees.md` (boucles à prouver en recette), `seo/*` **si `type=public`** (sinon l'étape 16 n'a rien produit — voir routage `deploy-procedure.md`). Écrit : `deploy/log.md` (template) + `deploy/live-qa-report.md` (recette live, preuves + correctifs) + URL live + tracking actif + `.saas-factory/state.md` (déployé, URL, version, `recette_live: PASS | PASS_WITH_CONCERNS`).

## Garde-fous
- **Plan-then-apply** non négociable (publication + dépense).
- **Sandbox jusqu'au cutover** : ne jamais toucher une autre prod.
- **Rollback prêt** : toute mise en ligne est **réversible** — revenir à la version d'avant (**N-1**) si elle existe, sinon (**premier ship**, pas de N-1) **dépublier** : retirer le domaine → retour preview URL privée.
- **Repli honnête** : accès manquant (KYC paiement, domaine non vérifié) → s'arrêter, guider, **pas de faux succès**.
- **« Déployé » ≠ « livré »** : la livraison exige la **recette live PASSÉE** (0 bloquant, preuves à l'appui — statut Resend, lignes DB, screenshots). Budget de correction **3 cycles** ; au-delà : bloquant → rollback, reste → consigné et annoncé. Données de test (`+liveqa@`, `[test]`) **nettoyées**.

## Sortie & état
Produit **en ligne** + tracking actif + santé vérifiée + **recette live passée** (`deploy/live-qa-report.md`, 0 bloquant, boucles fermées prouvées). Mets à jour `.saas-factory/state.md` (déployé, URL, version, `recette_live`). Résume (URL live + santé + verdict recette + correctifs appliqués). **Fin de Phase 5** → Phase 6 (mesure & retro).
