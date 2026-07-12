# Mapping des sorties — brancher le moteur sur NOS artefacts

Le moteur écrit nativement dans `{projet}/` (competitors-report, competitive-matrix, pricing-landscape, battle-cards, raw/…). **Nous consolidons dans deux fichiers** + on conserve le brut. Ce fichier dit **quel champ va où**, et ce qui se garde tel quel pour l'aval.

## Data-flow — du moteur à nos fichiers

```
   Sorties natives moteur                Nos artefacts (chemins SaaS Factory)
   ─────────────────────                 ────────────────────────────────────
   competitor-profiles.md ──┐
   pricing-intelligence.md ─┼──► SYNTHÈSE ──► research/market.md
   competitive-matrix ──────┘                  (template assets/templates/market.md)
   gtm.md (tranche marché) ─┘

   review-mining.md ────────┐                research/raw/*  (CONSERVÉ BRUT)
   forum-mining.md ─────────┼──► gardés tels quels ──►  ⟶ consommés par ÉTAPE 4
   (verbatims, volumes)     ┘                            (demand-signals)

   verification (tiers) ────────► research/confidence.md
                                    (template assets/templates/confidence.md)
```

## `research/market.md` — quel bloc alimente quoi

| Section du template `market.md` | Source(s) moteur |
|---|---|
| **Concurrents nommés** (directs + adjacents + statu quo) | W1 A1 (profils) + règle d'inclusion (`decision-matrices.md` §Inclusion) |
| → Forces (honnêtes) | W1 A1 forces + louanges W2 |
| → Faiblesses = **nos ouvertures** (observées, jamais inventées) | W2 plaintes récurrentes, filtrées par `forcing-questions.md` §Ouverture |
| → Prix (modèle, paliers, métrique de valeur) | W1 A2 (pricing intelligence) |
| → Position (segment/angle) | W1 A1 + W3 (canal dominant) |
| **Prix — paysage** + **whitespace** | W1 A2 + `decision-matrices.md` §Whitespace |
| **Matrice comparative** | W1 A1 (features) — 1 colonne par concurrent **+ colonne Statu quo** |
| **Ouvertures observées** | synthèse : manque récurrent ↔ plainte ↔ prix (FORT uniquement) |

**Règles d'écriture (persona CEO) :**
- Labellise chaque affirmation `[Data]` / `[Estimate]` / `[Assumption]` / `[Opinion]`.
- **Pas de cheerleading** : une force concurrent réelle s'écrit telle quelle.
- Chaque ouverture porte la mention « à confirmer étape 4, jamais inventée ».
- Surligne dans la matrice les lignes où **personne** ne sert bien (ouvertures candidates).
- Date les données ; flag ce qui a > 12 mois.

## `research/confidence.md` — quel bloc alimente quoi

| Section du template `confidence.md` | Source |
|---|---|
| **Sources en tiers 1/2/3** | verification-agent (classement) |
| **Score de confiance par affirmation** + confirme/infirme | verification-agent |
| **Haute confiance vs à vérifier** | affirmations Tier 1/2 vs Tier 3 seul |
| **Data gaps déclarés** | trous honnêtes + ouvertures MOU rétrogradées ici |

## `research/raw/` — ce qui se conserve tel quel (NE PAS jeter)

| Fichier | Pourquoi on le garde | Qui le consomme |
|---|---|---|
| `raw/intake.md` | traçabilité de l'amorçage | — |
| `raw/competitor-profiles.md` | détail complet des profils | référence |
| `raw/pricing-intelligence.md` | détail prix palier-par-palier | référence |
| **`raw/review-mining.md`** | **verbatims + volumes + notes** | **étape 4 (demande)** — cœur |
| **`raw/forum-mining.md`** | **carte de langage + churn** | **étape 4 (demande & edge)** |
| `raw/gtm.md` | canaux / signaux santé (tranche marché) | référence |

> **Non négociable :** l'étape 4 puise dans `raw/review-mining.md` et `raw/forum-mining.md` **plutôt que de re-scraper**. Un résumé destructif de ces fichiers casse le chaînage. Garde le brut : verbatims exacts, volume d'avis par concurrent, note moyenne, dates.

## Ce qu'on N'écrit PAS ici (rappel HARD GATE)

Le moteur peut générer battle-cards, positionnement, verdict de demande, décision. **On ne les consolide pas dans nos artefacts d'étape 2.** Voir `decision-matrices.md` §Découpage inter-étapes. Si le moteur les a écrits nativement, laisse-les dans son dossier natif ou ignore-les — nos deux livrables restent `market.md` + `confidence.md`.

## Micro-exemple (niche-agnostique)

Ouverture correctement branchée :

> Dans `market.md` §Ouvertures observées :
> « **Export/rapport** — `[Data]` 14 avis (A) + 9 (B) citent un export cassé ou verrouillé en add-on premium ; le statu quo (Excel) l'a « gratuit mais manuel ». Whitespace : personne ne propose un export propre en offre de base. *Ouverture observée, à confirmer étape 4, jamais inventée.* »
>
> Dans `confidence.md` : affirmation « export = manque récurrent » → **confiance moyenne-haute** (Tier 3 volumineux + recoupé prix Tier 1) ; confirmerait = interviews cible étape 4 ; infirmerait = si les avis datent tous d'avant une mise à jour récente.
>
> Dans `raw/review-mining.md` : les 23 verbatims conservés tels quels → l'étape 4 les relit.
