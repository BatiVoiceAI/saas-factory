# Référence — Feedback → tâches (étape 4, agent `client-liaison`)

Le **cœur de valeur** : transformer le langage utilisateur en **items actionnables**. C'est le pont entre le ressenti (étape 3, ses mots) et le build (étape 5, des tâches). L'agent `client-liaison` tourne en **contexte isolé** et produit `client-review-tasks.md` (template `assets/templates/client-review-tasks.md`).

## Sommaire

- Objectif de passage
- Procédure (agent `client-liaison`)
- Arbre de classification (dans cet ordre — le premier qui matche gagne)
- Matrice de décision — classe → route → action
- Recette forcing-question — trancher bug vs UX vs expansion
- Anatomie d'une tâche (format `AGENT-BRIEF`, via `write-spec`)
- Garde-fous
- Definition of Done (étape 4)
- Data-flow
- Modes d'échec + parade
- Micro-exemple (niche-agnostique)
- Principe

## Objectif de passage
Chaque morceau de feedback réel est **classé** (bug / UX / expansion / non-problème) et **routé** (`ready-for-agent` / `ready-for-human` / `parked`), avec pour chaque item corrigeable une **tâche** exécutable (quoi / où / critère de « corrigé »). Critère de sortie : **rien d'inventé**, **rien de glissé en douce**, et chaque tâche se rattache à une **citation** du feedback.

## Procédure (agent `client-liaison`)
1. **Synthétiser** le feedback brut → **findings** (thèmes récurrents, fréquence × impact, citations). *(Moteur : `synthesize-research` vendoré — feedback → findings priorisés.)*
2. **Classer** chaque finding :
   - **Bug** (ça devait marcher, ça marche pas) → corrigeable.
   - **Ajustement UX** (ça marche, mais gênant) → corrigeable **si dans le budget**.
   - **Feature manquante / expansion de scope** → à **parquer** (backlog), pas maintenant.
   - **« Pas un vrai problème »** (préférence, malentendu) → on l'**explique**, on ne code pas.
3. **Traduire** les items corrigeables → **tâches** (quoi / où / critère de « corrigé »). *(Format : `write-spec` vendoré → une tâche par correction, façon `AGENT-BRIEF`.)*
4. **Router** : `ready-for-agent` (le build reprend) · `ready-for-human` (précision requise de l'utilisateur) · `parked`.

## Arbre de classification (dans cet ordre — le premier qui matche gagne)
```
Un finding arrive
   │
   ├─ Ça devait marcher selon le PRD, et ça ne marche pas ?
   │        └─ OUI ─► BUG (corrigeable, priorité) ─► ready-for-agent
   │
   ├─ Ça marche, mais un frottement / une confusion à l'usage ?
   │        └─ OUI ─► AJUSTEMENT UX
   │                    ├─ tient dans le budget + petit ─► ready-for-agent
   │                    └─ gros / hors budget ────────────► parked (noté honnêtement)
   │
   ├─ Ça demande une capacité NON prévue au PRD ?
   │        └─ OUI ─► EXPANSION DE SCOPE ─► parked (backlog, nommée comme telle)
   │
   ├─ Le feedback est flou / on ne sait pas quoi corriger ?
   │        └─ OUI ─► ready-for-human (une question précise à l'utilisateur)
   │
   └─ Préférence perso / malentendu / attente hors périmètre ?
            └─ OUI ─► « PAS UN VRAI PROBLÈME » ─► on l'explique, on ne code pas
```

## Matrice de décision — classe → route → action
| Classe | Route | Action concrète |
|---|---|---|
| **Bug** | `ready-for-agent` | Tâche `AGENT-BRIEF` + **test de régression** attendu (étape 14 le générera) |
| **Ajustement UX (petit, budget)** | `ready-for-agent` | Tâche minimaliste (la plus petite qui règle le ressenti) |
| **Ajustement UX (gros / hors budget)** | `parked` | Backlog, nommé, expliqué à l'humain à la porte |
| **Expansion de scope** | `parked` | Backlog « nouvelle feature », **jamais** glissée dans le build en douce |
| **Flou / ambigu** | `ready-for-human` | **Une** question précise, pas un questionnaire |
| **Pas un vrai problème** | (aucune) | Réponse d'explication à donner à la porte (étape 6) |

## Recette forcing-question — trancher bug vs UX vs expansion
Quand un finding est ambigu, l'agent se pose (à lui-même, contre le PRD) :
- **Ask exact** : « Le PRD promet-il ce comportement ? » → si oui et absent = **bug** ; si non = **expansion**.
- **Push-until** (critère : rattacher au PRD, pas au goût) : ne pas classer « bug » un manque de feature non promise ; ne pas parquer un vrai bug sous prétexte qu'il « ressemble à une demande ».
- **Red-flags** (à ne PAS faire) :
  - Inventer une tâche sans citation du feedback → **interdit** (fidélité).
  - Reclasser une expansion en « petit ajustement » pour la faire passer dans le build → **interdit** (honnêteté).
  - Lancer une refonte sur un simple « je préférerais » → **interdit** (minimalisme).
- **Exemplaire** :
  - 🔴 MOU (tâche floue) : « Améliorer l'écran d'export. »
  - 🟢 FORT (tâche actionnable) : « BUG — bouton Export non visible au-dessus de la ligne de flottaison sur l'écran Export ; **corrigé quand** le bouton est atteignable sans scroll sur desktop et mobile. Cite : ‘j'ai cliqué trois fois avant de le trouver'. »

## Anatomie d'une tâche (format `AGENT-BRIEF`, via `write-spec`)
```
[CLASSE] Titre court
  Cite      : « le verbatim exact du feedback »
  Quoi      : le comportement à obtenir (côté utilisateur)
  Où        : l'écran / le parcours concerné (pas de fichier:ligne ici, le dev localise)
  Corrigé quand : le critère observable de « c'est réglé »
  Route     : ready-for-agent | ready-for-human | parked
  Budget    : compte pour 1 item du budget d'itération client
```

## Garde-fous
- **Fidélité** : chaque tâche se rattache à un morceau du feedback **réel** (jamais inventé).
- **Minimalisme** : la plus petite correction qui règle le ressenti — pas de refonte sur un « je préférerais ».
- **Honnêteté** : un feedback = expansion de scope est **nommé** comme tel (« ça, c'est une nouvelle feature, on la parque »), pas glissé en douce dans le build.

## Definition of Done (étape 4)
- [ ] Chaque finding a **une** classe et **une** route.
- [ ] Chaque tâche `ready-for-agent` a : citation + quoi + où + critère « corrigé quand ».
- [ ] Chaque expansion est **explicitement nommée** parquée (pas déguisée en fix).
- [ ] Les items `ready-for-human` sont formulés en **une question précise** chacun.
- [ ] Les « pas un vrai problème » ont une **réponse d'explication** prête pour la porte.
- [ ] `client-review-tasks.md` écrit ; aucun secret dedans.

## Data-flow
```
client-feedback.md (verbatim) ─► synthesize-research ─► findings priorisés
                                                            │
                                        classification (arbre ci-dessus)
                                                            │
        ┌───────────────┬───────────────────┬──────────────┴───────────┐
   ready-for-agent   ready-for-human       parked                « pas un vrai problème »
   (write-spec →     (1 question à          (backlog, nommé)      (explication → porte)
    AGENT-BRIEF)      l'utilisateur)
        │
        └─► étape 5 (re-dispatch build 12→13→14, dans le budget)
```

## Modes d'échec + parade
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Tâche inventée** | Une correction sans citation du feedback | Supprimer ; règle de fidélité (tout item ↔ verbatim) |
| **Expansion déguisée** | Une nouvelle feature classée « petit fix » | Reclasser `parked`, la nommer à la porte |
| **Sur-correction** | Refonte lancée sur « je préférerais » | Minimalisme : plus petite correction qui règle le ressenti |
| **Tâche floue** | « Améliorer X » sans critère | Ajouter « corrigé quand … » observable |
| **Flou traité comme certitude** | On code sur une interprétation | Router `ready-for-human` + une question précise |
| **Non-problème codé** | On corrige une préférence/malentendu | Le classer « pas un vrai problème » + réponse d'explication |

## Micro-exemple (niche-agnostique)
> Feedback : « J'ai eu peur de perdre mon travail, y'a pas de retour en arrière. Et ce serait bien d'avoir un mode équipe. Sinon l'écran de départ m'a perdu. »
> - « peur de perdre mon travail / pas de retour en arrière » → **Ajustement UX** (petit, budget) → `ready-for-agent` : « Ajouter annuler-dernière-action ; corrigé quand une action peut être défaite en un clic. »
> - « un mode équipe » → **Expansion de scope** → `parked` (nommé « nouvelle feature multi-utilisateur »).
> - « l'écran de départ m'a perdu » → **Ajustement UX** → `ready-for-agent` : « Ajouter un point d'entrée clair ‘commencer ici' sur l'écran d'accueil ; corrigé quand la première action est évidente en < 5 s. »

## Principe
On transforme **le ressenti en travail exécutable**, avec **fidélité** (rien d'inventé), **minimalisme** (le plus petit fix) et **honnêteté** (l'expansion est nommée, jamais glissée). Le tri **bug/expansion** se fait **ici**, jamais pendant le recueil (étape 3).
