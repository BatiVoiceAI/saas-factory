# Référence — Recette live & boucle de correction (étape 17, après canary)

> **Pourquoi.** Le canary (santé) dit « le site répond ». La recette live dit « **le produit marche** ». Le fondateur non-tech récupère quelque chose de **réellement fonctionnel** — c'est la dernière porte de qualité, sur la **prod réelle**. Un déploiement dont la recette n'est pas passée n'est pas une livraison.

## Séquence
```
canary OK ──> dispatch agents/live-qa.md ──> rapport (deploy/live-qa-report.md)
                     ▲                              │
                     │ re-test des KO               ▼
              redeploy (même pipeline)  <── correctifs (si échecs)
                     │
   3 cycles max ─────┴──> tout PASS → livraison ; sinon → escalade honnête
```

## 1. Dispatch du live-QA (contrat)
Prompt de délégation : **URL prod**, PRD + user-stories (les workflows à rejouer), `qa/test-booklet.md` (les cas déjà validés en local — à rejouer sur prod pour le cœur), **type de projet** (public/interne/perso — cf. matrice plus bas), rappel accès `.env` (service_role Supabase, clé Resend) et règles de données de test (`+liveqa@`, préfixe `[test]`, nettoyage). L'agent teste **routes, parcours 2 rôles, OTP réel, boucles email (statut Resend), effets en base, smoke RLS/cron** — détail dans `agents/live-qa.md`.

## 2. Boucle de correction — budget **3 cycles**
Pour chaque échec du rapport, dans l'ordre bloquant → majeur → mineur :
1. **Fix minimal** dans le repo (correctif ciblé ; si structurel → dispatch `feature-dev` avec le repro du rapport comme critère d'acceptation).
2. **Gate local** : `tsc` + `next build` verts — jamais de redeploy d'un build rouge.
3. **Redeploy** par le même pipeline (commit → promotion). *Pas de nouvelle porte utilisateur : le feu vert de publication (porte 3) couvre les correctifs de recette tant que le périmètre produit ne change pas — c'est de la réparation, pas une nouvelle publication.*
4. **Re-test** : le live-QA rejoue **les items KO + le parcours cœur** (non-régression). Un fix qui casse autre chose = échec du cycle.

**Épuisement du budget (3 cycles)** — honnêteté :
- **Bloquant subsiste** (cœur cassé) → **rollback** (`canary-rollback.md`) : re-promotion N-1, sinon dépublication → preview privée. Jamais un produit au cœur cassé entre les mains du fondateur.
- **Majeur/mineur subsiste** → le produit **reste en ligne**, l'échec est consigné (`deploy/live-qa-report.md` + `deploy/log.md` `[CONCERNS]`) et devient tête de backlog Phase 6. **Dit au fondateur, jamais silencieux.**

## 3. Matrice par type de projet
| Test | SaaS public | Outil interne | Outil perso |
|---|---|---|---|
| Routes + metadata + légal | ✅ tout | ✅ (légal N/A) | statuts seulement |
| Parcours cœur 2 rôles | ✅ | ✅ (rôles internes) | ✅ 1 rôle |
| OTP réel + email Resend | ✅ | ✅ | ✅ (léger) |
| Boucles fermées | ✅ toutes (email client) | ✅ **toutes** (canal adapté : email pro / in-app — dès qu'il y a contrepartie, la boucle est testée) | ✅ dérivées par action (trace toujours ; email si échéance/contrepartie) |
| Smoke RLS/cron | ✅ | ✅ | si multi-données |
| Mobile + desktop | ✅ | desktop d'abord | selon usage |

## 4. DoD de la recette
- [ ] Rapport `deploy/live-qa-report.md` complet : chaque parcours du PRD a un verdict **avec preuve** (screenshot / ID email Resend / ligne DB).
- [ ] **0 bloquant** ; majeurs/mineurs restants **consignés et annoncés**.
- [ ] Boucles fermées **prouvées** (les emails partent vraiment — statut Resend, pas « le code les envoie »).
- [ ] Données de test **nettoyées** (aucun `+liveqa@` / `[test]` résiduel en base).
- [ ] `.saas-factory/state.md` : `recette_live: PASS` (ou `PASS_WITH_CONCERNS` + liste).

## Modes d'échec
| Mode | Symptôme | Traitement |
|---|---|---|
| Recette « à l'écran » | verdict sans preuve (pas d'ID Resend, pas de ligne DB) | rejeter le rapport, re-tester — l'écran ment (cf. résa coiffeur : confirmation affichée, **zéro email parti**) |
| Fix-ping-pong | le cycle 3 re-casse ce que le cycle 2 a réparé | stop, rollback ou consignation — ne jamais dépasser le budget « pour finir » |
| Données de test orphelines | `[test]` visibles par de vrais utilisateurs | le nettoyage fait partie du DoD, pas une politesse |
| Faux vert par autoconfirm | OTP « passe » parce que l'email n'est pas vérifié en vrai | toujours vérifier le **statut Resend** de l'email, pas seulement la session |
