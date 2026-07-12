# Référence — Mener la rétro 3-plans (le job « apprendre »)

La rétro extrait **des faits**, pas des impressions. Sortie = un `retro/retro.md` rempli + une liste de leçons candidates (qui partent ensuite vers `memory-compound.md`). Règle maison : **honnêteté avant flagornerie** (`_shared/lessons.md`). Une rétro qui ne fait que féliciter est un déchet — on la refait.

## Data-flow de l'étape

```
metrics/review.md ┐
state.md (critère) ┼──> [RÉTRO 3-plans] ──> retro/retro.md
_shared/lessons.md ┘         │                      │
                             ▼                      ▼
                    leçons candidates ──> memory-compound.md ──> learnings.jsonl (+ ~/.saas-factory/lessons-learned.md si transverse)
                                                                        │
                                                                        ▼
                                                                 [PORTE kill/continue] ──> kill-continue.md
```

## Ordre d'exécution (ne pas sauter d'étape)

1. **Charger les faits** avant toute opinion. Lis `metrics/review.md` (les chiffres), `.saas-factory/state.md` (le critère de kill posé au lancement + l'historique des décisions), `_shared/lessons.md` + `~/.saas-factory/lessons-learned.md` si présent (ce qu'on savait déjà). Interdit de commencer la rétro « de mémoire ».
2. **Balayer les 3 plans** (build / méthode / produit) — pour chacun, remplir *a marché* **et** *a raté*. Une case *a raté* vide sur un plan = signal d'auto-complaisance → forcer (voir forcing-questions).
3. **Extraire les leçons candidates** — chaque *a raté* et chaque *a marché non évident* devient une leçon candidate (une phrase actionnable). Les leçons partent vers `memory-compound.md`.
4. **Remplir `retro/retro.md`** (template `assets/templates/retro.md`).
5. **Passer la porte** (`kill-continue.md`) — la rétro nourrit la décision, elle ne la prend pas.

Critère de passage à l'étape suivante : les 3 plans ont chacun **au moins une ligne concrète des deux côtés**, et il existe **≥ 1 leçon candidate** notée. Sinon la rétro est trop molle — relance les forcing-questions.

## Les 3 plans — quoi regarder, plan par plan

| Plan | Question cœur | Où chercher les faits | Exemples de *raté* (niche-agnostiques) |
|---|---|---|---|
| **Build** (la machine) | Le pipeline de fabrication a-t-il bien tourné ? | git log, nb d'itérations build/test (`safety-rails` §7), bugs à la jonction des worktrees, temps du walking skeleton | parallélisme non maîtrisé (bugs à l'intégration) ; walking skeleton arrivé trop tard ; boucle QA qui a mangé son budget |
| **Méthode** (le pipeline SaaS Factory) | Le process lui-même a-t-il aidé ou freiné ? | temps par phase, portes franchies vite/lentement, endroits où on a court-circuité une étape | sur-planification avant la 1re ligne de code ; validation marché faite trop tard ; une porte franchie « au feeling » |
| **Produit** (le marché) | A-t-il trouvé son marché ? | `metrics/review.md` : activation, rétention, conversion vs benchmarks | activation faible (moment magique mal placé) ; rétention → 0 (pas de PMF) ; conversion sous l'hypothèse pricing de l'étape 6 |

Pour chaque plan, remplir **les deux colonnes**. Le *a marché* n'est pas de la décoration : un succès non évident (« le déterminisme du pipeline a évité X ») est une **leçon à haute confiance** à capitaliser.

## Recette forcing-question — extraire l'honnêteté (anti-flagornerie)

À dégainer dès qu'une case *raté* est vide, vague, ou qu'une réponse sonne comme une auto-félicitation.

- **Ask exact** : « Sur ce plan, qu'est-ce qui **n'a pas marché** — le fait, pas l'ambiance ? Cite un moment précis où tu as perdu du temps, ou un chiffre en dessous de l'attendu. »
- **Push-until** (critère d'arrêt) : pousse jusqu'à obtenir **un fait daté ou chiffré** (un commit, une date, une métrique), pas une généralité. Tant que la réponse est « globalement ça allait », ce n'est pas fini.
- **Red-flags — réponses à refuser** (et relancer) :
  - « Tout s'est bien passé. » → aucun projet n'a zéro raté ; reformuler par plan.
  - « On a manqué de temps. » → symptôme, pas cause ; demander *quelle étape* a débordé et *pourquoi*.
  - « Le marché n'était pas prêt. » → suspect d'excuse ; confronter à l'activation/rétention réelle.
  - Une leçon qui blâme uniquement l'extérieur (concurrent, plateforme, chance) → chercher la part **contrôlable** interne.
- **Routage par cas** :
  - Métriques faibles **mais** rétro dit « produit super » → conflit fait/récit : trancher côté **faits** (`metrics/review.md`), noter la leçon « écart perçu/mesuré ».
  - Rétro riche en *raté* build/méthode mais produit OK → capitaliser fort côté méthode (ces leçons sont **transverses**, cf. `memory-compound.md`).
  - Rétro qui ne trouve qu'un raté « cosmétique » alors que le produit meurt → la porte kill n'est pas prise au sérieux ; forcer le plan **produit**.

**Exemplaire MOU vs FORT** (même situation, une activation à 12 %) :
- ❌ MOU : « L'activation était un peu basse, on pourra améliorer l'onboarding. »
- ✅ FORT : « Activation 12 % (benchmark faible < 20 %). Cause : le moment magique était placé sur *upload cliqué*, pas sur *résultat affiché* — 40 % des signups n'ont jamais vu de valeur. Leçon (confiance 8, **transverse**) : définir le moment magique = premier résultat tangible, jamais un clic d'intention. »

## Checklist definition-of-done (rétro)

- [ ] `metrics/review.md`, `state.md`, `_shared/lessons.md` (+ `lessons-learned.md` si présent) **lus** avant d'écrire.
- [ ] Les 3 plans ont **≥ 1 ligne concrète** en *a marché* **et** en *a raté*.
- [ ] Chaque *raté* est un **fait daté ou chiffré**, pas une impression.
- [ ] **≥ 1 leçon candidate** actionnable extraite (partira vers `learnings.jsonl`).
- [ ] Les leçons transverses sont **repérées** (drapeau oui/non) pour `~/.saas-factory/lessons-learned.md`.
- [ ] Aucun secret dans `retro.md` (`safety-rails` §4).
- [ ] `retro/retro.md` rempli à partir du template.

## Modes d'échec (rétro) + parade

| Mode d'échec | Symptôme | Parade |
|---|---|---|
| Rétro flagorneuse | que des *a marché*, aucun *raté* | forcing-question Ask/Push ; refuser « tout allait bien » |
| Rétro de mémoire | on écrit sans avoir ouvert les fichiers | bloquer : relire `metrics/review.md` + `state.md` d'abord |
| Généralités | « manqué de temps », « pas de chance » | Push-until : exiger un commit / une date / un chiffre |
| Blâme externe | 100 % de la faute au marché/plateforme | isoler la part contrôlable interne |
| Leçons perdues | rétro écrite mais rien dans `learnings.jsonl` | la DoD exige ≥ 1 leçon appendée (`memory-compound.md`) |
| Conflit fait/récit | métriques mauvaises, récit positif | trancher côté faits, noter la leçon d'écart |
