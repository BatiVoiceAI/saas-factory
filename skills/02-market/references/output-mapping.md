# Mapping des sorties — brancher le moteur sur NOS artefacts

Le moteur écrit nativement dans `{projet}/` (competitors-report, competitive-matrix, pricing-landscape, battle-cards, raw/…). **Nous consolidons dans UN livrable** (`market.md`, sections multiples) + on conserve le brut. Ce fichier dit **quelle sortie du moteur alimente quelle section**, et ce qui se garde tel quel pour l'aval.

## Data-flow — du moteur à nos fichiers

```
   Sorties natives moteur                Sections de research/market.md
   ─────────────────────                 ──────────────────────────────
   competitor-profiles.md ──┐──► SYNTHÈSE ──► §Dossiers concurrents détaillés
   pricing-intelligence.md ─┼───────────────► §Prix (table palier-par-palier)
   competitive-matrix ──────┼───────────────► §Matrice comparative
   gtm.md (tranche marché) ─┘                 (+ §Taille servable, §Ouvertures)

   review-mining.md ────────┐──► §Carte de langage (verbatims sourcés)
   forum-mining.md ─────────┤    + research/raw/*  (CONSERVÉ BRUT)
   (verbatims, volumes)     └──► gardés tels quels ──► consommés par ÉTAPE 4
                                                        (demand-signals)

   verification (tiers) ────────► §Fiabilité & confiance   (ex-confidence.md,
                                    (dans le même market.md)  fusionné poids mort §5)
```

## `research/market.md` — quelle section alimente quoi

| Section du template `market.md` | Source(s) moteur |
|---|---|
| **§Synthèse marché** (5 phrases) | écrite en dernier : concentration + dynamique + ouvertures dominantes |
| **§Dossiers concurrents détaillés** (directs + adjacents + statu quo) | W1 A1 (profils détaillés) + règle d'inclusion (`decision-matrices.md` §Inclusion) — dossier complet par acteur |
| → Forces (honnêtes) | W1 A1 forces + louanges W2 |
| → Faiblesses = **nos ouvertures** (observées, jamais inventées) | W2 plaintes récurrentes, filtrées par `forcing-questions.md` §Ouverture |
| → Prix (renvoi à §Prix) · Position · Traction · Menace | W1 A1 + A2 + W3 (canal dominant, hiring) |
| **§Prix** (table palier-par-palier) + whitespace | W1 A2 (pricing intelligence) + `decision-matrices.md` §Whitespace |
| **§Carte de langage** (verbatims sourcés) | W2 B1/B2 — mots exacts rangés (problème / solution / frustrations / churn) ; **hérité par l'étape 4** |
| **§Taille servable & dynamique** | [Estimate] bottom-up : W1 A1 (nb d'acteurs cibles) × W1 A2 (prix observés), hypothèse écrite ; dynamique déduite des profils + signaux W3 — **l'étape 5 en hérite** |
| **§Matrice comparative** | W1 A1 (features) — 1 colonne par concurrent **+ colonne Statu quo** |
| **§Ouvertures observées** | synthèse : manque récurrent ↔ plainte ↔ prix (FORT uniquement) |
| **§Fiabilité & confiance** (ex-`confidence.md`) | verification-agent : tiers + score par affirmation + confirme/infirme + data gaps |

**Règles d'écriture (persona CEO) :**
- Labellise chaque affirmation `[Data]` / `[Estimate]` / `[Assumption]` / `[Opinion]`.
- **Pas de cheerleading** : une force concurrent réelle s'écrit telle quelle.
- Chaque ouverture porte la mention « à confirmer étape 4, jamais inventée ».
- Surligne dans la matrice les lignes où **personne** ne sert bien (ouvertures candidates).
- Date les données ; flag ce qui a > 12 mois.

## §Fiabilité & confiance — détail du remplissage (ex-`confidence.md`, fusionné)

Cette section vit **dans** `market.md` (plus de fichier séparé — poids mort §5). Elle se remplit à P3.5 :

| Sous-bloc de §Fiabilité | Source |
|---|---|
| **Sources en tiers 1/2/3** | verification-agent (classement) |
| **Score de confiance par affirmation** + confirme/infirme | verification-agent |
| **Haute confiance vs à vérifier** | affirmations Tier 1/2 vs Tier 3 seul |
| **Data gaps déclarés** | trous honnêtes + ouvertures MOU rétrogradées ici |

> C'est cette section que l'étape 5 lit comme **plafond de confiance** du verdict (elle ne lit plus un `confidence.md` distinct).

## `research/raw/` — ce qui se conserve tel quel (NE PAS jeter)

| Fichier | Pourquoi on le garde | Qui le consomme |
|---|---|---|
| `raw/intake.md` | traçabilité de l'amorçage | — |
| `raw/competitor-profiles.md` | détail complet des profils | référence |
| `raw/pricing-intelligence.md` | détail prix palier-par-palier | référence |
| **`raw/review-mining.md`** | **verbatims + volumes + notes** | **étape 4 (demande)** — cœur |
| **`raw/forum-mining.md`** | **carte de langage + churn** | **étape 4 (demande & edge)** |
| `raw/gtm.md` | canaux / signaux santé (tranche marché) | référence |

> **Non négociable :** l'étape 4 puise dans `raw/review-mining.md` et `raw/forum-mining.md` **plutôt que de re-scraper**. Un résumé destructif de ces fichiers casse le chaînage. Garde le brut : verbatims exacts, **URL par verbatim + marqueur « ouvert via WebFetch oui/non »**, volume d'avis par concurrent, note moyenne, dates. C'est ce marqueur que la vérif adversariale de l'étape 4 relit pour distinguer verbatim vérifié et `[snippet — non vérifié]`.

## Ce qu'on N'écrit PAS ici (rappel HARD GATE)

Le moteur peut générer battle-cards, positionnement, verdict de demande, décision. **On ne les consolide pas dans nos artefacts d'étape 2.** Voir `decision-matrices.md` §Découpage inter-étapes. Si le moteur les a écrits nativement, laisse-les dans son dossier natif ou ignore-les — notre livrable reste `market.md` (dont §Fiabilité).

## Micro-exemple (niche-agnostique)

Ouverture correctement branchée :

> Dans `market.md` §Ouvertures observées :
> « **Export/rapport** — `[Data]` 14 avis (A) + 9 (B) citent un export cassé ou verrouillé en add-on premium ; le statu quo (Excel) l'a « gratuit mais manuel ». Whitespace : personne ne propose un export propre en offre de base. *Ouverture observée, à confirmer étape 4, jamais inventée.* »
>
> Dans `market.md` §Fiabilité : affirmation « export = manque récurrent » → **confiance moyenne-haute** (Tier 3 volumineux + recoupé prix Tier 1) ; confirmerait = interviews cible étape 4 ; infirmerait = si les avis datent tous d'avant une mise à jour récente.
>
> Dans `market.md` §Carte de langage + `raw/review-mining.md` : les 23 verbatims conservés tels quels (URL + WebFetch oui/non) → l'étape 4 les relit.
