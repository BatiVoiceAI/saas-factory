# Référence — Anatomie d'un dispatch de feature-dev

Le contrat exact d'un dispatch `feature-dev`. Un dispatch mal formé = un dev qui devine, sort de sa zone, ou boucle. Complément de `fan-out.md` (le quand/combien) : ici le **quoi mettre dedans**.

## Principe : un dispatch = une tâche, pas une session
Le sous-agent ne voit **pas** la conversation. Tout le contexte utile doit être dans le prompt de délégation — mais les **artefacts lourds passent par fichier**, pas collés (sinon on traîne du contexte de session parasite, anti-pattern superpowers).

## Les 5 éléments obligatoires
| # | Élément | Forme | Pourquoi |
|---|---|---|---|
| 1 | **Brief de feature** (extrait PRD + user story) | **fichier** (`briefs/NN-<slug>.md`) | Le dev sait quoi construire sans deviner |
| 2 | **Critères d'acceptation** (la recette) | fichier (dans le brief) ou inline court | Sans eux, pas de critère d'arrêt → boucle |
| 3 | **Zone de code autorisée** | inline précis (worktree + dossiers) | Empêche le franchissement de zone (collisions) |
| 4 | **Chemin du `status/NN-<slug>.md`** | inline | Canal de remontée async |
| 5 | **Modèle** | inline explicite (`opus`) | Défaut plugin = Opus ; nommé pour ne pas hériter du modèle de session (non déterministe) |

## Les invariants à rappeler dans chaque dispatch
- **TDD strict** (Iron Law : test rouge avant tout code).
- **Budget d'itération** (du plan §7) + critère de sortie (`DONE_WITH_CONCERNS` si épuisé).
- **Ne pas sortir de la zone** ; toute dépendance hors-zone → `BLOCKED` + remonte, jamais franchir.
- **Pas de secret** en dur/loggé/commité ; variables d'env.
- **Respecter** `tech/architecture.md`, `_shared/stack-defaults.md`, `DESIGN.md` ; toute feature à **surface UI** respecte en plus les **interdits binaires** de `_shared/design-doctrine.md` (la landing : + `_shared/landing-playbook.md`) et applique le **volet arsenal** de son brief (voir ci-dessous).
- **Repli honnête** si bloqué (clé/accès manquant) : le dire, ne pas bluffer.

## Volet arsenal (features à surface UI)
Pour toute feature à **surface UI**, le brief (`briefs/NN-<slug>.md`) contient un **volet arsenal** dérivé de `DESIGN.md` + `_shared/design-doctrine.md` §Arsenal — le dev UI ne décide pas ça tout seul en cours de route :
- **Animations** : lesquelles exactement (élément, déclencheur, ce qu'elles **communiquent**), avec quelle lib — **Motion par défaut** (MIT) ; **GSAP** seulement si la recette du `DESIGN.md` exige une scène orchestrée (dépendance npm, jamais vendoré) — sous les règles anti-slop de l'arsenal : durées 150-400 ms, pas de fade-in généralisé, 1-2 effets signature max par page, `prefers-reduced-motion`.
- **Blocs à dupliquer** : source exacte (vendorable MIT/Apache/ISC, LICENSE + PROVENANCE) et consigne de **re-thémage** obligatoire — tokens + polices + radius + contenu remplacés, le bloc ne doit **plus ressembler à son origine**.
- **og-image** : **générée en code** (`next/og`, tokens du thème : display + couleur de marque) si la feature touche une page publique — jamais d'image statique bricolée ni d'image IA.

## Squelette de dispatch (à instancier)
```
Tu es feature-dev. Implémente UNE feature en TDD + recette, dans ton worktree.

- Feature      : NN-<slug> — <titre>
- Worktree     : feature/<slug>   (pars de main, skeleton déjà mergé)
- Zone AUTORISÉE (et rien d'autre) : <dossiers/fichiers>
- Brief        : briefs/NN-<slug>.md   (lis-le : périmètre + critères d'acceptation)
- Statut       : écris ton avancement dans status/NN-<slug>.md
- Modèle       : opus   (défaut plugin — cf. org-hierarchy.md)
- Budget       : <N tours> ; épuisé → DONE_WITH_CONCERNS + remonte
Invariants : TDD strict · pas de secret · reste dans la zone · respecte archi/DESIGN
(+ doctrine anti-slop `_shared/design-doctrine.md` si surface UI, et applique le
volet arsenal du brief : animations Motion/GSAP prescrites · blocs dupliqués RE-THÉMÉS ·
og-image en code) ·
si bloqué (clé/dépendance) → BLOCKED dans status, ne bluffe pas.
```

## Checklist « dispatch prêt à partir »
- [ ] Les 5 éléments obligatoires présents.
- [ ] Zone **disjointe** de toutes les lanes actuellement actives (aucun fichier partagé).
- [ ] Brief en **fichier** (pas collé depuis la conversation).
- [ ] Critères d'acceptation présents (le dev a une recette → un critère d'arrêt).
- [ ] Modèle **explicite** = `opus` (défaut plugin, mode qualité max — `org-hierarchy.md`).
- [ ] Budget d'itération + critère de sortie rappelés.
- [ ] Feature UI → **volet arsenal** présent dans le brief (animations + lib prescrites, blocs à dupliquer/re-thémer avec source, og-image en code si page publique).
- [ ] Aucun secret dans le prompt (ni valeur de clé, ni token).

## Matrice de décision — forme du contenu
| Contenu | Inline | Fichier |
|---|---|---|
| Brief PRD, user stories, critères longs | — | **fichier** |
| Zone de code, chemin status, modèle, budget | **inline** | — |
| Schéma/contrat partagé (types, migration) | — | **fichier** (référence commune) |
| Historique d'autres tâches | **jamais** | **jamais** (contexte parasite) |
| Secret / clé / token | **jamais** | **jamais** (env côté user) |

## Modes d'échec
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Brief collé** | Le dispatch traîne l'historique de session | Brief en fichier ; un dispatch = une tâche |
| **Zone floue** | Le dev édite hors périmètre | Zone autorisée explicite + « et rien d'autre » |
| **Critères absents** | Le dev ne sait pas quand s'arrêter | Toujours joindre la recette (critères d'acceptation) |
| **Modèle implicite** | Héritage non déterministe du modèle de session | Nommer `opus` explicitement par dispatch |
| **Secret dans le prompt** | Clé exposée dans un artefact | Env côté user ; jamais dans le dispatch |
