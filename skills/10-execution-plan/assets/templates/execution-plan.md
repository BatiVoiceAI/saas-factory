# Plan d'exécution — {nom du projet}
> Produit par l'étape 10 (composer). Graphe de tâches pour les agents de build (Phase 4). **Pas un calendrier.**
> Archétype : {web-saas} · Date : {AAAA-MM-JJ}

## 1. Synthèse
{Nb de features · nb de lanes parallèles · le walking skeleton en une phrase.}

## 2. Réutilisation vs build (80/20)
| Module | Réutilise un bloc | ou Custom (verticale) |
|---|---|---|
| … | `_shared/blocks/{bloc}` `[pré-câblé]` | — |
| … | — | build custom |

> Tag **`[pré-câblé]`** sur chaque module dont le bloc est posé par le scaffold de l'étape 11 — en Phase 4, la tâche = vérifier + configurer + delta, pas de test rouge sur le déjà-fait (`references/reuse-vs-build.md`).

## 3. Walking skeleton (à faire en premier)
{La tranche verticale mince : auth → action cœur → persistance → affichage. Les tâches qui la composent.}

## 4. Graphe de tâches
> Chaque tâche : 1 test rouge d'entrée, 1 zone de code dominante, committable seule (voir `references/task-graph.md`). Pour une tâche `[pré-câblé]`, le test rouge porte sur le **delta** (config / extension), pas sur ce que le scaffold livre déjà.

| # | Tâche (TDD) | Feature | Zone de code | Dépend de | Réutilise / Custom | Test rouge d'entrée |
|---|---|---|---|---|---|---|
| T1 | … | … | … | — | … | … |

## 5. Lanes (parallélisation)
- **Lane A** (séquentielle) : walking skeleton → …
- **Lane B** (parallèle) : {tâches à zones disjointes}
- **Lane C** (parallèle) : …
- **Ordre de lancement** : walking skeleton → {A + B + C en parallèle} → intégration.
- **Drapeaux de conflit** : {lanes touchant une zone commune, le cas échéant}

## 6. Carte de délégation
> 1 feature = 1 worktree = 1 agent · zones disjointes · statut async au schéma de `references/delegation.md`.

| Lane | Agent | Worktree | Zones de code | Dépend de | Fichier de statut |
|---|---|---|---|---|---|
| … | feature-dev | … | … | — | `status/NN-*.md` |

## 7. Spec de validation par feature (pour la cascade Phase 4)
| Feature | Critères d'acceptation | DoD | Budget d'itération |
|---|---|---|---|
| … | {issus des user stories} | … | {plafond + critère de sortie} |

> **Variante `automation`** (si `Archétype = automation`) : le cran **Designer est dégradé/N-A** (headless) et l'edge — **boucle fermée + idempotence (run ET entité)** — passe au **CEO-persona** ; la DoD visuelle (`DESIGN.md`/WCAG) est remplacée par « **gabarit fr-FR + états de run** », et une feature de transformation pure se range en **« logique/calcul métier pur »** (pas « CRUD »). Détail : `references/validation-spec.md` §Variante AUTOMATION + `references/delegation.md` §Variante AUTOMATION.
> **Variante `ecommerce`** (si `Archétype = ecommerce`) : à l'inverse, le cran **Designer reste COMPLET** (vitrine publique — aucune ligne visuelle dégradée) ; l'edge dur = **workflow d'achat EC1→EC4 + boucle fermée EC4** (confirmation client **ET** notif marchand) **+ 3 pièges P1/P2/P3** (survente / intégrité prix / idempotence webhook), porté au **CEO-persona + CTO** / `[SÉCU]`. Détail : `references/validation-spec.md` §Variante ECOMMERCE + `references/delegation.md` §Variante ECOMMERCE.

## 8. Critères d'acceptation de l'archétype (porte 12 + parcours 14)
> **Slot alimenté par `saas-factory/references/routing.md` §archétype** — recopié, jamais inventé. Acceptation **au niveau run** (le socle de l'archétype), distincte de la spec par feature (§7) : ce que la **porte 12 (build)** exige comme présent et ce que le **parcours 14 (QA)** déroule de bout en bout. Le composer prend la ligne de l'archétype du run (champ `Archétype` ci-dessus) et remplit le tableau depuis `routing.md`.

| Portée | Critère (de `routing.md` §archétype) |
|---|---|
| **Porte 12 — socle présent** | {web-saas : socle UI + auth + action cœur + persistance, pas de tuyauterie exemple · **automation** : socle AUTOMATION présent — config/secrets, run history+logs, healthcheck, **boucle fermée**, idempotence — headless, pas de dashboard produit · **ecommerce** : socle **EC1-EC5** — catalogue public + panier (sous-total serveur) + checkout one-shot (`mode:payment`) + commandes/boucle fermée EC4 + stock atomique — **pas** le socle web-saas, cran sécurité renforcé P1-P3 · landing : socle landing} |
| **Parcours 14 — chemin QA bout-en-bout** | {web-saas : signup → action cœur → persistance → affichage · **automation** : déclencher un run → logs enregistrés → **boucle fermée déclenchée** (alerte/rapport au propriétaire) → **idempotence vérifiée** (re-run ne double ni les effets ni les entités) — **pas** de test signup · **ecommerce** : **achat A→Z** — catalogue → panier → checkout Stripe test → **webhook → commande créée une seule fois** → **stock décrémenté** → email confirmation client+marchand, avec preuves **P1/P2/P3** · landing : CTA → conversion} |

> **`automation` — non négociable** : la **boucle fermée** (`_shared/boucles-fermees.md`) et l'**idempotence** (grain run **et** grain entité) sont les critères **durs** de la porte 12 et du parcours 14 — un run qui échoue en silence n'est pas livrable (`routing.md` §automation). Le cran Designer étant N/A (headless), c'est le **CEO-persona** qui porte cet edge (§7 · `references/validation-spec.md`).
> **`ecommerce` — non négociable** : le **workflow d'achat (EC1→EC4)**, la **boucle fermée EC4** (confirmation client + notif marchand) et les **3 pièges P1/P2/P3** (survente / intégrité prix / idempotence webhook) sont les critères **durs** de la porte 12 et du parcours 14 — un seul de P1/P2/P3 non prouvé = **porte fermée** (`_shared/archetypes/ecommerce.md` §Critères d'acceptation). Ici le cran Designer **reste COMPLET** (UI présente), et l'edge commerce est porté par le **CEO-persona + CTO**. Pour `web-saas` (défaut), remplir la colonne web-saas et retirer les mentions d'archétype non pertinentes.

## 9. Passe d'intégration
{Tâche(s) d'intégration après merge des lanes parallèles — adresse les bugs de jonction.}

## 10. Audit trail des décisions autonomes
> Une ligne par décision non triviale. Chaque ligne cite UN principe P1-P6 (`references/decision-principles.md`). Tag `[SÉCU]` sur tout choix auth / PII / paiement / permissions → repris par la revue sécu de la Phase 4.

| # | Décision | Principe | Alternative écartée | Réversibilité | [SÉCU] ? |
|---|---|---|---|---|---|
| … | … | … | … | … | — |
