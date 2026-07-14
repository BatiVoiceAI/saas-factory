# Pipeline — Phase 5 (lancement) : la carte

La séquence exacte de la phase, ce que chaque étape **produit**, les **règles d'enchaînement** et les **retours arrière** internes. Le SKILL.md est le chef d'orchestre scannable ; cette carte est la référence à ouvrir quand tu enchaînes.

## Diagramme de flux détaillé

```
   [Phase 4 · 15-client-review]
             │
             │ décision « ship »  (sinon : Itérer→reboucle P4 · Stop→archive)
             ▼
   ┌─────────────────────────── PHASE 5 ───────────────────────────┐
   │                                                               │
   │   0. PRÉ-VOL PHASE (orchestrateur)                            │
   │      • state.md : Phase 5, étape 16|17, statut « en cours »   │
   │      • lit `type`/route déjà fixé (routing.md) — ne redemande │
   │        PAS le cadrage                                          │
   │      • infra : ~/.saas-factory/config.json présent ? (sinon   │
   │        mode local/fallback — jamais bloquant, safety §6)      │
   │                          │                                    │
   │            ┌──── type ? ─┴──────────────┐                     │
   │     public │                            │ perso / interne     │
   │            ▼                            ▼                      │
   │   ┌──────────────────┐         (16 sautée — routing.md)       │
   │   │ 1. 16-seo (Mktg) │                 │                      │
   │   │  M1 kw→clusters  │                 │                      │
   │   │  M2 pages ≤ N    │                 │                      │
   │   │  M3 on-page+tech │                 │                      │
   │   │  M4 🚪 gate humain│                 │                      │
   │   │     publication  │                 │                      │
   │   │  (M5 itération = │                 │                      │
   │   │   post-deploy)   │                 │                      │
   │   └────────┬─────────┘                 │                      │
   │  écrit: topic-cluster-map.md,          │                      │
   │  seo/plan.md, pages optimisées         │                      │
   │            └──────────────┬────────────┘                      │
   │                           ▼                                   │
   │   ┌───────────────────────────────────────────┐              │
   │   │ 2. 17-deploy (Release Eng / CTO)          │              │
   │   │   a. pré-vol (bloquant) — build/tests     │              │
   │   │      verts, livret sans FAIL, secrets env │              │
   │   │   b. plan — quoi/où/coût/réversibilité    │              │
   │   │   c. 🚪 PORTE publication (OK explicite)  │──plan-then-  │
   │   │   d. apply (ordre strict) :               │  apply §1    │
   │   │      migrations→promotion staging→prod    │              │
   │   │      →cutover DNS→tracking PostHog+Sentry │              │
   │   │   e. canary — pages 200, parcours cœur,   │              │
   │   │      Sentry stable, CWV OK                 │              │
   │   └───────────┬───────────────┬───────────────┘              │
   │       sain ───┘               └─── dégradé / échec           │
   │         │                            │                        │
   │  écrit: deploy/log.md,        rollback version N-1 +          │
   │  URL live, tracking actif     log honnête (pas de faux succès)│
   │         │                            │                        │
   │         │                     → re-plan / repli guidé (§6)    │
   └─────────┼────────────────────────────────────────────────────┘
             ▼  canary vert (URL live) — NE SUFFIT PAS à déclarer « livré »
   ┌───────────────────────────────────────────────────────────────┐
   │ 3. 17b-recette-live-AUTHENTIFIÉE (Release Eng / QA)          │◀ OBLIGATOIRE
   │    dès qu'il y a auth + RLS — sur la PROD réelle, après canary:│  & BLOQUANTE
   │   a. franchit l'auth : OTP complété (boîte sandbox de test)   │
   │      OU session forgée Admin API (createUser+signIn)          │
   │   b. joue CHAQUE action RLS-protégée de CHAQUE rôle           │
   │      (multi-rôles : agence/client, org A/org B)               │
   │   c. preuve/action : 2xx + ligne au bon tenant + notif `sent` │
   │      + refus cross-tenant prouvé (JWT user-scopé, pas svc_role)│
   │   d. rouge → fix → redeploy → re-test (budget cycles)         │
   └───────────┬───────────────────────────────┬───────────────────┘
       vert ───┘                               └─── rouge (RLS/scoping/junction)
         │                                          │
   écrit: deploy/live-qa-report.md,           fix → redeploy → re-test
   state.md recette_live: PASS               (jamais « livré » au rouge)
         │
         ▼
   Fin Phase 5 : produit EN LIGNE & RECETTÉ CONNECTÉ (17 fait ET 17b vert)
             │
             ▼
   [Phase 6 · phase-6-after]  métriques → rétro → 🚪 kill/continue
```
> Détail exécutable de 17b (dispatch, preuve, DoD, modes d'échec) : `skills/17-deploy/references/live-qa.md` + `agents/live-qa.md` ; cadre : `skills/phase-5-launch/SKILL.md` + règle d'or 19 (`_shared/lessons.md`).

## Séquence exacte + contrat de sortie par étape

| # | Étape | Rôle | Actif si | Produit (artefacts) | Porte |
|---|---|---|---|---|---|
| 1 | `16-seo` | Marketing | `type = public` (route selon routing.md) | `seo/topic-cluster-map.md`, `seo/plan.md`, pages optimisées dans le code | 🚪 gate humain publication contenu (interne à l'étape) |
| 2 | `17-deploy` | Release Eng / CTO | toujours | `deploy/log.md`, URL live, tracking PostHog+Sentry actif | 🚪 porte de publication (plan-then-apply, **selon le type** — liste réelle : routing.md canonique) + canary |
| 3 | `17b-recette-live-authentifiée` | Release Eng / QA | **dès qu'il y a auth + RLS** (route selon routing.md) | `deploy/live-qa-report.md` (couverture feature Must × rôle), `state.md` `recette_live: PASS \| PASS_WITH_CONCERNS` | **contrôle BLOQUANT de fin de phase** (pas une porte utilisateur) — vert obligatoire avant « livré ». Détail : `skills/17-deploy/references/live-qa.md` |

Le **contrat lit/écrit exact** par étape vit dans `references/conventions.md` (§ Contrat d'artefacts) et dans chaque `SKILL.md` d'étape — cette table donne seulement le **chaînage**.

## Contrôle de réception des artefacts (anti-squelette)

L'existence d'un fichier ne prouve rien. À chaque artefact rendu par une étape, avant de le déclarer « fait » dans `state.md` :
1. **Ouvre l'artefact reçu** (Read) — jamais de « croire sur parole ».
2. **Checklist minimale par type** : sections requises présentes (clusters + pages ≤ plafond dans `seo/plan.md` ; pré-vol, plan, décision de porte, résultat canary dans `deploy/log.md` ; **une ligne de couverture par feature Must × rôle** avec scénario joué sous session + verdict + preuve d'effet dans `deploy/live-qa-report.md`), verdicts au format attendu, **preuves non vides** (URL réelles, sorties de checks, 2xx + ligne au bon tenant + notif `sent` + refus cross-tenant pour 17b, pas de placeholders), taille plancher plausible.
3. **Stub / squelette → renvoi à l'étape** qui l'a produit, avec le **manque nommé** (canary non exécuté, plan sans coût/réversibilité, page SEO creuse, recette live sans preuve d'effet cross-tenant), dans le budget d'itération — pas de sortie de phase sur un log creux ni un `live-qa-report.md` non joué en connecté.

## Règles d'enchaînement (déterminisme)
1. **Ordre fixe** : 16 puis 17 puis 17b. Jamais 17 avant 16 quand 16 est active — le déploiement indexe les pages produites par le SEO (l'indexation réelle se fait **au déploiement**, pas au SEO). **17b ne démarre qu'après un canary vert de 17** (la recette live s'exécute sur la prod réellement en ligne) et n'existe que **quand l'archétype porte auth + RLS** (route selon `references/routing.md`).
2. **Chaînage par artefacts** : 17 lit `seo/*` (produit par 16) + tout le validé de l'étape 15 + `tech/provisioning-log.md` + `~/.saas-factory/config.json`. Si 16 est sautée, `seo/*` est simplement absent — 17 déploie sans pages SEO, sans bluff.
3. **Une étape ne démarre que si la précédente est `fait`** dans `state.md` (ou explicitement sautée par le routage).
4. **Rien d'irréversible sans porte** : 17-c (porte publication) et 17-e (canary) sont les deux points durs ; tout apply de 17-d est réversible en une commande.
5. **Arrêt au premier échec** (pré-vol rouge, canary échec, accès manquant) : on s'arrête, on log honnêtement, on guide — jamais de faux succès (safety §6).

## Retours arrière internes à la phase
| Déclencheur | Retour |
|---|---|
| `16` : gate humain **refuse** des pages | corrige/retire les pages fautives (plafond, Helpful Content, cannibalisation) **avant** de passer à 17 — ne publie pas ce qui n'a pas l'OK |
| `17-a` : pré-vol **rouge** (test FAIL, secret en dur, migration non prête) | **ne pas** ouvrir la porte ; renvoyer au correctif (potentiellement Phase 4) puis re-pré-vol |
| `17-c` : porte publication **refusée / à ajuster** (coût, domaine, timing) | rester en sandbox, ajuster le plan, re-présenter la porte — aucun apply |
| `17-e` : canary **échec** | **rollback** vers version N-1, log, diagnostic ; re-plan puis nouvelle passe (ne pas laisser la prod dégradée) |
| `17b` : recette live **rouge** (bug RLS/scoping/junction, parcours d'invitation injoignable, notif absente, refus cross-tenant non prouvé) | **fix → redeploy → re-test** dans le budget cycles — **jamais** de « livré » ni de sortie de phase au rouge (détail : `skills/17-deploy/references/live-qa.md`) |
| accès infra manquant (KYC paiement, domaine non vérifié, clé absente) | repli honnête (§6) : s'arrêter, produire un guide pas-à-pas, ne pas simuler |

Le graphe complet des portes (décision → route) est dans `references/gates.md`. Le routage `type → étapes actives` est dans `references/routing.md`.

## Sortie de phase
Fin de phase = **`17-deploy` `fait` ET `17b` `fait` (recette live authentifiée verte, `recette_live: PASS`)** — un canary vert **ne suffit pas**. Quand les deux sont acquis (produit en ligne + tracking + santé verte + chaque action RLS-protégée de chaque rôle jouée en connecté avec preuve, ou repli honnête assumé pour 17) : mets à jour `.saas-factory/state.md` (déployé, URL, version, `recette_live`), résume en 2 lignes (URL live + santé + verdict recette), et enchaîne **`phase-6-after`** (mesure & rétro). Sans 17b verte, on **ne sort pas** de phase et on **ne déclare pas « livré »**.
