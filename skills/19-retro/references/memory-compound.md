# Référence — Mémoire qui compound (l'actif long terme)

Le mécanisme qui rend SaaS Factory **meilleur à chaque cycle**. Chaque projet dépose des leçons ; les leçons **transverses** deviennent des règles lues par *tous* les skills au démarrage. Sans cette étape, chaque projet repart de zéro et répète les mêmes erreurs. C'est ici que la méthode capitalise.

## Les deux niveaux de mémoire

```
                     leçon extraite de la rétro
                              │
              ┌───────────────┴───────────────┐
              ▼                                ▼
   transverse ? = NON                 transverse ? = OUI
              │                                │
              ▼                                ▼
  ~/.saas-factory/learnings.jsonl     _shared/lessons.md
  (append 1 ligne JSON)              (règle d'or, lue par tous
  mémoire projet, granulaire          les skills — l'actif partagé)
                                       + toujours aussi une ligne
                                         dans learnings.jsonl (trace)
```

- **`~/.saas-factory/learnings.jsonl`** — le journal brut, **append-only**, une ligne JSON par leçon. Granulaire, daté, traçable. Toute leçon y va (transverse ou non).
- **`_shared/lessons.md`** — les **règles d'or** consolidées, lues par chaque sous-skill au démarrage. Seules les leçons **transverses** y remontent. Fichier partagé, éditer avec parcimonie (voir garde-fou).

## Schéma de la ligne `learnings.jsonl` (append-only)

Une ligne = un objet JSON compact. Champs :

| Champ | Type | Règle |
|---|---|---|
| `lesson` | string | phrase **actionnable** (un impératif ou une règle), pas un constat vague |
| `confidence` | int 1-10 | barème ci-dessous |
| `source` | string | l'id du projet (ce cycle) |
| `date` | string | `AAAA-MM-JJ` |
| `transverse` | bool | vaut pour tout projet futur ? (déclenche la remontée `lessons.md`) |
| `plan` | string | `build` \| `méthode` \| `produit` (d'où vient la leçon, cf. `retro-procedure.md`) |

Exemple (une ligne, niche-agnostique) :
```json
{"lesson":"Définir le moment magique = premier résultat tangible, jamais un clic d'intention","confidence":8,"source":"projet-XYZ","date":"2026-07-11","transverse":true,"plan":"produit"}
```

Append via `Bash` (jamais réécrire le fichier — append-only) :
```bash
echo '{"lesson":"…","confidence":7,"source":"projet-XYZ","date":"2026-07-11","transverse":false,"plan":"build"}' >> ~/.saas-factory/learnings.jsonl
```
Créer le dossier au besoin : `mkdir -p ~/.saas-factory`.

## Barème de confiance (1-10) — comment noter

| Confiance | Quand l'attribuer |
|---|---|
| **8-10** | preuve nette : un chiffre/fait clair l'appuie, cohérent avec une leçon déjà connue, ou observé plusieurs fois |
| **5-7** | plausible : observé une fois sur ce projet, cause probable mais non prouvée |
| **2-4** | hypothèse : intuition, un seul point de données ambigu |
| **1** | à vérifier au prochain cycle : soupçon non étayé |

Règle : **ne pas gonfler** la confiance (anti-flagornerie). Une leçon à confiance 3 honnête vaut mieux qu'un 9 fabriqué. La confiance guide la remontée transverse.

## Matrice de décision — transverse ou pas ?

| La leçon… | transverse ? | Destination |
|---|---|---|
| dépend d'une spécificité de CE projet (ce marché, cette stack précise) | **non** | `learnings.jsonl` seul |
| énonce une règle de **process/méthode** rejouable partout | **oui** | `learnings.jsonl` **+** `_shared/lessons.md` |
| corrige un **anti-pattern** générique (sur-planif, validation tardive, dérive doc…) | **oui** | `learnings.jsonl` **+** `_shared/lessons.md` |
| confiance < 5 même si générique | **pas encore** | `learnings.jsonl`, drapeau à revérifier ; remonter quand confirmée par un 2e projet |
| contredit une règle existante de `lessons.md` | **à trancher** | ne pas écraser en silence : voir procédure ci-dessous |

## Procédure de remontée dans `_shared/lessons.md` (leçon transverse, confiance ≥ 5)

1. **Dédup d'abord** : la règle existe-t-elle déjà ? Chercher un doublon.
   ```bash
   grep -in "moment magique\|activation" /Users/felix/Desktop/Felix.In.Progress/SaaS-Factory-Project/plugin/saas-factory/_shared/lessons.md
   ```
2. **Router** :
   - **Nouvelle règle rejouable** → ajouter à la liste « Règles d'or ».
   - **Nouvel anti-pattern** → ajouter à « Anti-patterns documentés ».
   - **Doublon exact** → ne rien ajouter ; monter éventuellement la confiance en `learnings.jsonl` (2e observation).
   - **Contradiction** avec une règle existante → **ne pas écraser** : présenter les deux à l'utilisateur (`AskUserQuestion`), c'est un fichier partagé qui pilote tous les skills.
3. **Écrire concis** : une ligne impérative, ton maison, zéro fluff — au format des règles existantes.
4. **Tracer** : la même leçon reste **aussi** une ligne dans `learnings.jsonl` (le journal garde tout).

## Micro-exemples (niche-agnostiques)

| Leçon extraite | conf | transverse | Destination |
|---|---|---|---|
| « Le moment magique était sur un clic, pas sur un résultat → activation faible » | 8 | oui | jsonl + `lessons.md` (anti-pattern activation) |
| « L'API de paiement niche X exige un KYC de 3 jours » | 7 | non | jsonl seul (spécifique) |
| « Lancer un worktree par feature a évité les collisions » | 6 | oui | jsonl + confirme une règle d'or existante (monter confiance, pas de doublon) |
| « Le walking skeleton tardif a retardé le 1er retour » | 5 | oui | jsonl + `lessons.md` (anti-pattern sur-planif) |
| « Les gens utilisent la feature Y pas Z » | 4 | non | jsonl, drapeau à revérifier |

## Checklist definition-of-done (mémoire)

- [ ] **Chaque** leçon candidate de la rétro est appendée à `learnings.jsonl` (une ligne JSON valide).
- [ ] `confidence` attribuée selon le barème, **sans gonflement**.
- [ ] `transverse` évalué via la matrice pour chaque leçon.
- [ ] Chaque leçon **transverse & confiance ≥ 5** : dédup faite, puis remontée dans `_shared/lessons.md` (ou doublon acté).
- [ ] Aucune contradiction écrasée en silence dans `lessons.md` (arbitrage utilisateur si conflit).
- [ ] Aucun secret ni donnée sensible dans `learnings.jsonl` (`safety-rails` §4).
- [ ] `learnings.jsonl` resté **append-only** (jamais réécrit).

## Modes d'échec (mémoire) + parade

| Mode d'échec | Symptôme | Parade |
|---|---|---|
| Leçons perdues | rétro écrite, rien appendé | DoD : chaque leçon → une ligne jsonl |
| Confiance gonflée | tout à 9-10 | barème strict ; un fait par note haute |
| JSON invalide | ligne mal échappée casse le parsing | valider la ligne avant `>>` (guillemets, échappements) |
| Fichier réécrit | perte d'historique | **toujours** `>>` (append), jamais `>` |
| Doublons dans `lessons.md` | même règle répétée | grep de dédup avant d'écrire |
| Contradiction silencieuse | nouvelle règle écrase une ancienne | arbitrage `AskUserQuestion` — fichier partagé |
| Sur-remontée | leçon spécifique promue transverse | matrice transverse ; spécifique = jsonl seul |
