# Bloc verdict — cran {tech-lead | cto | designer | ceo}
> **Ajouté** à `status/<feature>.md` par le cran, à chaque passage. Async par fichier (jamais dans la conversation). Format unifié `verdict-schema.md`. Alimente le livret de test (`_shared/test-dossier.md`).

- **Feature** : {slug} — {titre}
- **Cran** : {tech-lead | cto | designer | ceo}
- **Itération / tour** : {n° dans le budget cascade}
- **Décision** : PASS | CONCERNS | FAIL | WAIVED
- **Confiance** : {1-10} (par finding important)

## Findings (Strengths · Critical · Important · Minor)
| Sévérité | Finding | Preuve `fichier:ligne` | Impact concret | Confiance |
|---|---|---|---|---|
| Critical/Important/Minor | {défaut} | {chemin:ligne} | {ce qui casse / risque / critère PRD} | {1-10} |

> **Gate anti-hallucination** : toute ligne sans preuve `fichier:ligne` est **supprimée** (ou confiance forcée ≤ 4-5, non bloquante). Un `FAIL` **exige** une ligne + un impact concret.

## Si FAIL — contrat de rejet (les 4 champs, cf. `rejection-contract.md`)
- **QUOI** : {le défaut, factuel}
- **OÙ** : {fichier:ligne}
- **POURQUOI** : {impact concret — jamais « c'est fragile »}
- **QUOI FAIRE** : {correction attendue + critère de sortie vérifiable}
> Jamais « refais ». → retour dev (étape 12) → re-grimpe depuis le cran 1.

## Si CONCERNS / WAIVED (non bloquant)
- **Réserve / dérogation** : {description} — **tracée pour le client-review (étape 15)**
- **[SÉCU]** (cran CTO, le cas échéant) : {point sécurité-sensible + exploit concret ou « aucun »}

## Cross-check codex (cran CTO — OPTIONNEL)
- **État** : fait | absent | non activé par l'utilisateur
- **Écart avec le verdict Claude** : {le cas échéant}
