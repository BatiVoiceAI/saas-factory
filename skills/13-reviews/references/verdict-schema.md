# Référence — Schéma de verdict unifié (tous les crans)

Tous les crans de la cascade (Tech Lead, CTO, Designer, CEO) rendent leur verdict dans **ce format unique**. Inspiré de BMAD (gate) + gstack `/cso` (confiance + preuve).

## Le verdict (par feature, par cran)
- **Décision** :
  - `PASS` — valide, **monte** au cran suivant.
  - `CONCERNS` — passe **avec réserve tracée** (non bloquant ; la réserve est loguée pour le client-review).
  - `FAIL` — **veto** → **retour dev** (étape 12).
  - `WAIVED` — dérogation **explicitement tracée + justifiée** (ex. contrainte assumée).
  - `N/A` — **cran non applicable à l'archétype** (ex. cran **Designer** sur un `automation` headless — pas de surface visuelle). Traçé, **laisse monter** au cran suivant, **jamais un `FAIL`** déguisé. L'edge de la feature est alors porté par un autre cran (automation : boucle fermée + idempotence → **CEO-persona**, `skills/10-execution-plan/references/validation-spec.md` §Variante AUTOMATION). N'utiliser que pour une **non-applicabilité d'archétype**, pas pour esquiver un jugement dû.
- **Confiance** : **1-10** par finding important (calibration façon gstack).
- **Preuve citée** : chaque finding **cite la/les ligne(s)** (`fichier:ligne`) qui la motive.

## Gate anti-hallucination (OBLIGATOIRE)
**Pas de preuve citée → la finding est supprimée** (ou sa confiance forcée ≤ 4-5, non bloquante). C'est ce qui empêche des agents adversariaux d'**inventer des vetos**. Un `FAIL` doit **toujours** pointer une ligne + un impact concret — jamais « ça me semble fragile ».

## Exclusions dures (tuent les faux positifs, façon gstack `/cso`)
Ne **PAS** bloquer (`FAIL`) sur : DoS/ReDoS sans entrée non fiable, rate-limiting générique, secrets chiffrés-mais-permissionnés, races sans exploit démontré, libs outdated sans CVE exploitable, « validation générique » sans impact prouvé. → au plus `CONCERNS`.

## Contextualiser le rejet (ta règle)
Un `FAIL` renvoie au dev **avec le contexte du POURQUOI** :
- **quoi** (le défaut) · **où** (`fichier:ligne`) · **pourquoi** (l'impact concret) · **quoi faire** (la correction attendue).
**Jamais « refais »** — sinon le dev ne peut rien corriger d'utile et la cascade tourne dans le vide.

## Vérification cross-modèle (OPTIONNELLE — opt-in, jamais imposée)
Un panel de N agents Claude = auto-critique, **pas** vérification indépendante (mêmes angles morts). **Si** le skill `codex` est disponible **et** activé par l'utilisateur, lance-le en **cross-check indépendant** sur le cran CTO (ou en juge final) — la seule vraie sortie du biais mono-modèle. **Non imposé** : sans `codex`, la cascade tourne mono-modèle (signale simplement la moindre indépendance dans le verdict). **On n'impose aucune API externe.**

## Calibrer la confiance (échelle 1-10)
La confiance n'est pas un ressenti : elle dit **à quel point la preuve tient**.
| Confiance | Sens | Effet |
|---|---|---|
| 9-10 | exploit / défaut **démontré**, ligne + scénario reproductible | peut porter un `FAIL` |
| 7-8 | défaut réel, ancré, impact clair mais non exécuté bout-en-bout | `FAIL` si cœur, sinon `CONCERNS` |
| 5-6 | plausible, ancré, impact incertain | au plus `CONCERNS` |
| ≤ 4 | spéculatif / non ancré | **supprimé** (gate anti-hallucination) |

## Forcing-question — « ce verdict tient-il la preuve ? »
- **Ask exact** : *« Pour chaque finding : quelle ligne exacte, quel impact concret, et est-ce reproductible ? »*
- **Push-until** : chaque finding important a `fichier:ligne` + impact ; un `FAIL` a une preuve à confiance ≥ 7.
- **Red-flags (à refuser)** : « ça me semble… », « en général c'est risqué », « pas testé mais probable », finding sans ligne.
- **MOU vs FORT** :
  - MOU : *« FAIL — le code paraît peu sûr. »*
  - FORT : *« FAIL (conf. 9) — `query.ts:22` : entrée concaténée dans le SQL, `;DROP TABLE` s'exécute (reproduit). Fix : requête paramétrée. »*
- **Routage** : preuve conf. ≥ 7 + impact cœur → `FAIL` ; réel mais non bloquant → `CONCERNS` ; assumé/tracé → `WAIVED` ; non ancré → supprimé.

## Exemple de bloc verdict (gabarit)
Chaque cran **ajoute** ce bloc à `status/<feature>.md` (gabarit complet : `assets/templates/cascade-verdict.md`). Squelette :
```
# Verdict — cran CTO — feature 07-entries — itération 2
Décision : FAIL   ·   Confiance : 9
Findings :
  [Critical] query.ts:22 — SQL concaténé depuis l'entrée → injection (;DROP TABLE reproduit) — conf. 9 [SÉCU]
  [Minor]    query.ts:8  — nom de variable ambigu — conf. 5 (non bloquant)
Rejet (contrat) :
  QUOI: injection SQL · OÙ: query.ts:22 · POURQUOI: exécution arbitraire sur la BDD
  QUOI FAIRE: requête paramétrée + allow-list de colonnes ; critère: test d'injection rejeté
Cross-check codex : non activé
```
> Le format du rejet (les 4 champs) est spécifié dans `rejection-contract.md`. Le bloc alimente le livret de test (`_shared/test-dossier.md`).
