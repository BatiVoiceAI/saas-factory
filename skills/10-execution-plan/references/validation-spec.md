# Référence — Spec de validation par feature (paramétrage de la cascade)

Étape [6] du composer. Pour **chaque feature**, on attache ce que la **cascade de validation** de la Phase 4 (`_shared/validation-cascade.md`) vérifiera : **critères d'acceptation**, **Definition of Done (DoD)**, **budget d'itération**. Le composer **paramètre** la cascade ; la Phase 4 l'**exécute**.

## Ce que la cascade attend de nous
La cascade monte Développeur → Tech Lead → CTO → Designer → CEO, chaque cran boucle jusqu'à satisfaction. Elle a besoin, **par feature**, de trois choses écrites :
```
Critères d'acceptation ─▶ ce que "ça marche" veut dire (testable, du PRD)
Definition of Done      ─▶ la barre de sortie (tests, doc, design, sécu)
Budget d'itération      ─▶ plafond de boucles + critère de sortie (anti-boucle infinie)
```

## 1. Critères d'acceptation — les dériver des fiches feature
- **Source obligatoire** : `product/features/*` (§ User story + § Critères d'acceptation de chaque fiche Must/Should). **Jamais inventés.** Si une feature n'a pas de critère traçable, c'est un trou du PRD → noter dans l'audit (`[Hypothèse]`), ne pas fabriquer.
- **Format** : testables, binaires (vrai/faux), au présent, orientés comportement observable. « Quand {contexte}, alors {résultat observable} ».
- **Couvrir le chemin ET les bords** : au moins un critère nominal + les cas limites recensés au data flow de l'étape 9 (entrée vide/invalide, échec tiers, double soumission/idempotence, concurrence, limite haute).

### Forcing-question — un critère est-il assez fort ?
- **Ask exact** : « Un agent `feature-dev` peut-il écrire un test rouge **directement** à partir de ce critère, sans deviner ? »
- **Push-until** : chaque critère est vérifiable par un test automatisé sans interprétation.
- **Red-flags** : « ça doit être intuitif », « rapide », « propre » → **non testable** → reformuler en seuil observable (« la liste s'affiche en < 1 s pour 1 000 éléments ») ou déplacer vers le DoD design.
- **MOU** : « l'export fonctionne ». **FORT** : « quand l'utilisateur clique Exporter avec ≥1 ligne, un CSV est téléchargé contenant exactement les lignes visibles ; avec 0 ligne, un message "rien à exporter" s'affiche et aucun fichier n'est produit ».

## 2. Definition of Done — la barre de sortie (checklist par feature)
- [ ] Tous les critères d'acceptation passent (tests verts).
- [ ] Cas limites de la feature couverts par des tests (liste de l'étape 9).
- [ ] Conforme à l'architecture (frontières de module respectées) — cran Tech Lead/CTO.
- [ ] Sécurité : entrées validées, authZ correcte, pas de PII loguée — points `[SÉCU]` adressés.
- [ ] Conforme à `DESIGN.md` (tokens, composants, hiérarchie) + états UX (vide/chargement/erreur/succès) — cran Designer.
- [ ] Accessibilité WCAG 2.1 AA sur les surfaces de la feature.
- [ ] Doc à jour (le Verifier resynchronise doc **et** tests — `_shared/lessons.md` §5).
- [ ] Commits TDD citant les tâches.

> La DoD peut être **transverse** (une base commune, ci-dessus) + **spécifique** à la feature (ex. « le webhook paiement est idempotent »). Le composer note le spécifique par feature.

## 3. Budget d'itération — plafonner les boucles
Chaque feature reçoit un **plafond** de boucles de la cascade + un **critère de sortie** (rappel `_shared/safety-rails.md` §7 : pas d'itération infinie).

### Matrice de budget (défaut, ajustable selon complexité/risque)
| Type de feature | Plafond de boucles | Critère de sortie |
|---|---|---|
| Câblage de bloc | **2** | Bloc vert + config présente |
| CRUD standard | **3** | Critères + cas limites verts |
| Verticale cœur (edge produit) | **4** | Critères + cas limites + cran CEO PASS |
| Intégration tierce / paiement | **4** + `[SÉCU]` | Idempotence + sécu adressées |

Budget épuisé → on **loge l'état**, on marque la feature `DONE_WITH_CONCERNS`, on continue (l'humain tranchera au client-review de l'étape 15). **Jamais** de blocage infini.

### Forcing-question — le budget est-il honnête ?
- **Ask exact** : « Ce plafond laisse-t-il la place à ≥1 loop-back Tech Lead/CTO/Designer/CEO réaliste, sans autoriser une boucle sans fin ? »
- **Red-flags** : budget 1 sur une verticale cœur (irréaliste, aucune correction possible) ; budget « illimité » (interdit) ; absence de critère de sortie (le plafond seul ne suffit pas).

## Micro-exemple (niche-agnostique) — une ligne de la table §7
| Feature | Critères d'acceptation | DoD | Budget |
|---|---|---|---|
| Édition d'une entité | (1) sauvegarde persiste après reload ; (2) deux onglets → dernière écriture gagne + avertissement ; (3) champ requis vide → refus + message | base + « conflit concurrent testé » | 3 boucles, sortie = critères+conflit verts |

## Modes d'échec
| Mode d'échec | Symptôme | Correctif |
|---|---|---|
| Critère non testable | « doit être intuitif » dans les critères | Reformuler en seuil observable / basculer en DoD design |
| Critère inventé | Aucune trace dans les user stories | Tagger `[Hypothèse]` dans l'audit, ne pas fabriquer un besoin |
| DoD absente | Feature sans barre de sortie | Appliquer la DoD transverse + spécifique |
| Budget manquant/infini | Pas de plafond ou « jusqu'à parfait » | Poser plafond + critère de sortie (matrice) |
| Bords oubliés | Critères nominaux seulement | Rapatrier les cas limites de l'étape 9 |

## Sortie (dans `tech/execution-plan.md`)
La table **spec de validation par feature** (§7) : Feature | Critères d'acceptation | DoD | Budget d'itération — c'est l'entrée directe de la cascade Phase 4.
