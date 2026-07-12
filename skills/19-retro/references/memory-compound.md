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
  ~/.saas-factory/learnings.jsonl     ~/.saas-factory/lessons-learned.md
  (append 1 ligne JSON)              (règles d'or capitalisées — hors
  mémoire projet, granulaire          plugin, survit aux updates ; lues
                                      au démarrage par le master en
                                      plus de _shared/lessons.md)
                                       + toujours aussi une ligne
                                         dans learnings.jsonl (trace)
```

- **`~/.saas-factory/learnings.jsonl`** — le journal brut, **append-only**, une ligne JSON par leçon. Granulaire, daté, traçable. Toute leçon y va (transverse ou non).
- **`~/.saas-factory/lessons-learned.md`** — les **règles d'or capitalisées** par tes projets, lues au démarrage par le master **en plus** de `_shared/lessons.md`. Seules les leçons **transverses** y remontent. Le fichier vit **hors du répertoire du plugin** : il survit aux updates et aux réinstallations. Créer au premier usage (`mkdir -p ~/.saas-factory`), même structure que `_shared/lessons.md` (« Règles d'or » / « Anti-patterns documentés »).
- **`_shared/lessons.md`** — les règles d'or **livrées avec le plugin** (baseline). La rétro le **lit**, elle n'y écrit **jamais** : le répertoire du plugin est écrasé à chaque update. Y remonter une règle est un **geste de maintenance dev explicite** (éditer le plugin, hors cycle projet) — à proposer, jamais à faire en silence pendant une rétro.

## Schéma de la ligne `learnings.jsonl` (append-only)

Une ligne = un objet JSON compact. Champs :

| Champ | Type | Règle |
|---|---|---|
| `lesson` | string | phrase **actionnable** (un impératif ou une règle), pas un constat vague |
| `confidence` | int 1-10 | barème ci-dessous |
| `source` | string | l'id du projet (ce cycle) |
| `date` | string | `AAAA-MM-JJ` |
| `transverse` | bool | vaut pour tout projet futur ? (déclenche la remontée `lessons-learned.md`) |
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
| énonce une règle de **process/méthode** rejouable partout | **oui** | `learnings.jsonl` **+** `~/.saas-factory/lessons-learned.md` |
| corrige un **anti-pattern** générique (sur-planif, validation tardive, dérive doc…) | **oui** | `learnings.jsonl` **+** `~/.saas-factory/lessons-learned.md` |
| confiance < 5 même si générique | **pas encore** | `learnings.jsonl`, drapeau à revérifier ; remonter quand confirmée par un 2e projet |
| contredit une règle existante (`lessons-learned.md` ou `_shared/lessons.md`) | **à trancher** | ne pas écraser en silence : voir procédure ci-dessous |

## Procédure de remontée dans `~/.saas-factory/lessons-learned.md` (leçon transverse, confiance ≥ 5)

1. **Créer le fichier au besoin** : `mkdir -p ~/.saas-factory` ; si `lessons-learned.md` n'existe pas, l'initialiser avec les deux sections (« Règles d'or » / « Anti-patterns documentés »).
2. **Dédup d'abord** : la règle existe-t-elle déjà — côté capitalisé **ou** côté plugin ? Chercher un doublon dans les deux (jamais de chemin absolu du poste de dev — le plugin se référence via `${CLAUDE_PLUGIN_ROOT}`) :
   ```bash
   grep -in "moment magique\|activation" ~/.saas-factory/lessons-learned.md "${CLAUDE_PLUGIN_ROOT}/_shared/lessons.md"
   ```
3. **Router** :
   - **Nouvelle règle rejouable** → ajouter à la liste « Règles d'or » de `lessons-learned.md`.
   - **Nouvel anti-pattern** → ajouter à « Anti-patterns documentés » de `lessons-learned.md`.
   - **Doublon exact** (dans l'un ou l'autre fichier) → ne rien ajouter ; monter éventuellement la confiance en `learnings.jsonl` (2e observation).
   - **Contradiction** avec une règle existante → **ne pas écraser** : présenter les deux à l'utilisateur (`AskUserQuestion`) — ces règles pilotent tous les skills.
4. **Écrire concis** : une ligne impérative, ton maison, zéro fluff — au format des règles existantes.
5. **Tracer** : la même leçon reste **aussi** une ligne dans `learnings.jsonl` (le journal garde tout).

**Jamais d'écriture dans le répertoire du plugin** pendant une rétro : `_shared/lessons.md` serait écrasé au prochain update. Si une règle mérite d'être **livrée** avec le plugin (baseline pour tous les utilisateurs), le proposer comme geste de **maintenance dev explicite**, hors cycle projet.

## Micro-exemples (niche-agnostiques)

| Leçon extraite | conf | transverse | Destination |
|---|---|---|---|
| « Le moment magique était sur un clic, pas sur un résultat → activation faible » | 8 | oui | jsonl + `lessons-learned.md` (anti-pattern activation) |
| « L'API de paiement niche X exige un KYC de 3 jours » | 7 | non | jsonl seul (spécifique) |
| « Lancer un worktree par feature a évité les collisions » | 6 | oui | jsonl + confirme une règle d'or existante (monter confiance, pas de doublon) |
| « Le walking skeleton tardif a retardé le 1er retour » | 5 | oui | jsonl + `lessons-learned.md` (anti-pattern sur-planif) |
| « Les gens utilisent la feature Y pas Z » | 4 | non | jsonl, drapeau à revérifier |

## Checklist definition-of-done (mémoire)

- [ ] **Chaque** leçon candidate de la rétro est appendée à `learnings.jsonl` (une ligne JSON valide).
- [ ] `confidence` attribuée selon le barème, **sans gonflement**.
- [ ] `transverse` évalué via la matrice pour chaque leçon.
- [ ] Chaque leçon **transverse & confiance ≥ 5** : dédup faite (les deux fichiers), puis remontée dans `~/.saas-factory/lessons-learned.md` (ou doublon acté).
- [ ] Aucune contradiction écrasée en silence dans `lessons-learned.md` (arbitrage utilisateur si conflit).
- [ ] **Rien écrit dans le répertoire du plugin** (`_shared/lessons.md` = lecture seule pendant la rétro).
- [ ] Aucun secret ni donnée sensible dans `learnings.jsonl` (`safety-rails` §4).
- [ ] `learnings.jsonl` resté **append-only** (jamais réécrit).

## Modes d'échec (mémoire) + parade

| Mode d'échec | Symptôme | Parade |
|---|---|---|
| Leçons perdues | rétro écrite, rien appendé | DoD : chaque leçon → une ligne jsonl |
| Confiance gonflée | tout à 9-10 | barème strict ; un fait par note haute |
| JSON invalide | ligne mal échappée casse le parsing | valider la ligne avant `>>` (guillemets, échappements) |
| Fichier réécrit | perte d'historique | **toujours** `>>` (append), jamais `>` |
| Doublons dans `lessons-learned.md` | même règle répétée | grep de dédup (les deux fichiers) avant d'écrire |
| Contradiction silencieuse | nouvelle règle écrase une ancienne | arbitrage `AskUserQuestion` — ces règles pilotent tous les skills |
| Sur-remontée | leçon spécifique promue transverse | matrice transverse ; spécifique = jsonl seul |
| Mémoire sous perfusion | leçons écrites dans le répertoire du plugin (écrasées à l'update) ou grep d'un chemin absolu du poste de dev | destination = `~/.saas-factory/` ; le plugin se référence via `${CLAUDE_PLUGIN_ROOT}` et ne se modifie qu'en maintenance dev explicite |
