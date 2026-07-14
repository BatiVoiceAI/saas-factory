# Orchestration Playbook — Phase 2 (cadrage produit)

Le **flux exécutable** de la phase. Le `SKILL.md` donne l'aperçu ; ici vit la mécanique : séquence, calibrage, portes, retour arrière, état, reprise. Charge ce fichier quand tu pilotes la phase — pas besoin de le relire à chaque étape.

## Sommaire

- Valeur de l'orchestrateur (ce que TU fais, ce que tu ne fais PAS)
- Discipline « lire `_shared` une fois »
- Table de séquence (étape → invoque → lit → écrit → porte)
- Contrôle de réception des artefacts (anti-squelette)
- Diagramme de flux
- Matrices de calibrage (par `type`, lu dans `state.md`)
- Protocole des portes
- Matrice de retour arrière (« Ajuster » → quelle étape)
- Tenue de l'état (`.saas-factory/state.md`)
- Procédure de reprise
- Passation vers la Phase 3

## Valeur de l'orchestrateur (ce que TU fais, ce que tu ne fais PAS)
- **Tu fais** : enchaîner les 3 experts dans l'ordre · lire `state.md` et le `type` pour **calibrer** · tenir l'état · poser les **deux portes** · router les « Ajuster » vers la bonne étape · passer le relais à la Phase 3.
- **Tu ne fais PAS** : le travail des experts (tu ne rédiges pas le PRD, tu ne choisis pas les couleurs, tu ne fixes pas le pricing) · relancer un moteur vendoré toi-même · recharger `_shared` entre deux étapes.

## Discipline « lire `_shared` une fois »
Sous le master, les `_shared/*` (`lessons.md`, `safety-rails.md`, …) sont **déjà en contexte** (lus une fois au démarrage de session) et **priment** — ne les relis pas, ne les fais pas relire. L'orchestrateur lit **une fois** `references/conventions.md` (local) au démarrage de la phase ; chaque skill expert relit ce dont il a besoin de son côté. Recharger = bruit + tokens gaspillés. Exception : si l'utilisateur revient sur la phase après une longue interruption, une relecture de `state.md` (pas de `_shared`) suffit à te resituer.

## Table de séquence (étape → invoque → lit → écrit → porte)

| # | Skill expert | Rôle | Lit | Écrit | Porte |
|---|---|---|---|---|---|
| 6 | `06-business-model` | CEO + PM (léger) | `research/opportunity-brief.md`, `research/positioning.md` | `product/business-model.md`, `product/pricing.md` *(pricing si public ; étape entière **sautée en perso** — route selon routing.md)* | — |
| 7 | `07-product-spec` | PM (cœur) | `research/idea-brief.md`, `research/opportunity-brief.md`, `research/positioning.md`, `research/demand-signals.md`, `product/business-model.md` | `product/product-spec.md`, `product/features/NN-*.md`, `product/user-stories.md`, `product/feature-prioritization.md`, `product/mvp-definition.md` | 🚪 **PRD** |
| 8 | `08-design-system` | Designer | `product/product-spec.md`, `research/positioning.md`, `research/idea-brief.md`, `product/pricing.md`, `_shared/design-doctrine.md`, `_shared/landing-playbook.md` | `DESIGN.md`, `design/mockups/` | 🚪 **Charte** |

Le relais se fait **par fichiers sur disque**, jamais par la conversation. Ne mets **jamais** de secret ou de clé API dans ces fichiers ni dans `state.md`.

## Contrôle de réception des artefacts (anti-squelette)

L'existence d'un fichier ne prouve rien. À chaque artefact rendu par un expert, avant de le déclarer « fait » dans `state.md` :
1. **Ouvre l'artefact reçu** (Read) — jamais de « croire sur parole ».
2. **Checklist minimale par type** : sections requises présentes (ex. must/should/could/won't + success criteria dans `product-spec.md` § MVP — depuis la fusion §5, `mvp-definition.md`/`feature-prioritization.md` ne sont que des **renvois**, le contenu vit dans le PRD), verdict/priorisation au format attendu (MoSCoW/RICE, dans `product-spec.md` § Priorisation), **preuves non vides** (chaque feature justifiée par un élément Phase 1, pas de placeholders), taille plancher plausible (un PRD de 20 lignes n'est pas un PRD).
3. **Stub / squelette → renvoi à l'étape** qui l'a produit, avec le **manque nommé** (section absente, justification vide, story sans critère), dans le budget d'itération — pas de porte présentée sur un artefact creux.

## Diagramme de flux
```
   research/ (Phase 1, GO)
        │
        ▼
   ┌────────────────────┐
   │ 06-business-model  │  type public → BM + pricing ancré complets
   │                    │  type interne → allégé : ROI interne (coût évité), PAS de pricing marché
   │                    │  type perso  → étape SAUTÉE (route selon routing.md)
   └────────────────────┘
        │
        ▼
   ┌────────────────────┐
   │ 07-product-spec    │  cœur de phase — PRD complet quel que soit le type
   │  (PRD)             │  (perso : périmètre plus serré, moins de user stories)
   └────────────────────┘
        │
        ▼   🚪 PORTE PRD
   valide ──────────────► 08          ajuste ──► reboucle (voir matrice retour arrière)
        │
        ▼
   ┌────────────────────┐
   │ 08-design-system   │  public/interne → DESIGN.md + mockups clés
   │                    │  perso → 1 décision de direction (recette minimale), mockups réduits (ou sautés)
   └────────────────────┘
        │
        ▼   🚪 PORTE CHARTE
   valide ──────────────► Phase 3 (09-architecture)     ajuste ──► reboucle direction visuelle
```

## Matrices de calibrage (par `type`, lu dans `state.md`)
Le `type` (public / interne / perso) est **fixé en Phase 1** (`01-discover`) et vit dans `state.md`. Tu ne le redemandes pas. **Le skip-set (quelles étapes s'exécutent — ex. 06 sautée en perso) vit dans la matrice canonique `skills/saas-factory/references/routing.md` : route selon elle.** Ici, uniquement le **calibrage de profondeur** des étapes actives. Dis toujours à l'utilisateur, en début de phase, l'impact du calibrage retenu.

### Étape 6 — business model
| type | 06-business-model |
|---|---|
| **public** | **complet** — lean canvas + pricing ancré (benchmark concurrents Phase 1, willingness-to-pay, palier(s)). |
| **interne** | **allégé** — pas de pricing marché : à la place, **ROI interne** (coût évité / gain de temps) + fit budget/process. Pas de GTM. |
| **perso** | **sautée** (route selon routing.md) — pas de business model pour un outil à soi ; on passe directement au PRD (07), le saut est tracé dans `state.md`. |

### Étape 7 — PRD (toujours actif — c'est le cœur)
| type | 07-product-spec |
|---|---|
| **public** | **complet** — features, MoSCoW/RICE, user stories, dépendances, non-goals, MVP definition. |
| **interne** | **complet** — mêmes livrables ; les « user stories » ciblent les rôles internes ; non-goals = ce que l'outil ne remplace pas. |
| **perso** | **resserré** — MVP definition + must-have uniquement, moins de user stories, priorisation légère. Le PRD existe quand même (il pilote le build). |

### Étape 8 — design system
| type | 08-design-system |
|---|---|
| **public** | **complet** — `DESIGN.md` + mockups des écrans clés (landing + parcours cœur). |
| **interne** | **allégé** — `DESIGN.md` sobre (réutilise si possible la charte de la boîte), mockups limités aux écrans fonctionnels. |
| **perso** | **minimal** — 1 décision de direction (recette minimale de la doctrine, ex. R4/Manrope), `DESIGN.md` court, mockups réduits ou sautés. Fonctionnel > léché — mais jamais le zinc shadcn brut (interdit doctrine n°20). |

**Règle d'or du calibrage** : on **allège**, on ne **supprime jamais** le PRD (étape 7). Un `DESIGN.md`, même minimal, est toujours produit (il sert de source de vérité au build en Phase 4). La **seule** étape sautable de la phase est 06 (route perso), selon la matrice canonique.

## Protocole des portes
Une porte = une décision **explicite** de l'utilisateur, formulée en langage clair + une preuve (le livrable). On ne franchit **jamais** une porte sans réponse. Les experts portent les portes ; toi, tu vérifies qu'elles ont bien été franchies avant d'enchaîner.

### 🚪 Porte PRD (fin de `07-product-spec`)
- **Décide** : le périmètre MVP est-il le bon ? Les must-have sont-ils vraiment must ? Les non-goals sont-ils assumés ?
- **Preuve présentée** : `product/product-spec.md` § MVP (must/should/could/won't + out-of-scope + success criteria) — source unique depuis la fusion §5 (`mvp-definition.md` n'est qu'un renvoi).
- **Issues** : `valide` → on passe à `08`. `ajuste` → retour ciblé (matrice ci-dessous).

### 🚪 Porte Charte (dans `08-design-system`)
- **Décide** : la direction visuelle (couleurs + ton) est-elle validée ?
- **Preuve présentée** : `DESIGN.md` + aperçu couleurs/mockups.
- **Issues** : `valide` → fin de Phase 2, passation Phase 3. `ajuste` → reboucle la **direction visuelle uniquement**, pas le PRD.

## Matrice de retour arrière (« Ajuster » → quelle étape)
| Ce qui cloche à la porte | Reboucle sur | Ne touche pas |
|---|---|---|
| Le **pricing / modèle** n'a plus de sens vu le périmètre | `06-business-model` | le PRD déjà validé en dehors du point litigieux |
| **Trop de features** dans le MVP / scope-creep | `07` — `product-spec.md` § Priorisation + § MVP (source unique depuis la fusion §5) | business-model |
| Une **feature manque** ou une user story est fausse | section concernée de `07` (`features/NN-*`, `user-stories`) | design |
| Le besoin **Phase 1** n'est plus respecté (dérive) | remonter d'un cran : reboucle `07` en repartant de `research/opportunity-brief.md` ; si le doute porte sur la validation elle-même, **signale-le** — c'est un retour Phase 1, pas Phase 2 | — |
| **Direction visuelle** rejetée | direction de `08` uniquement | PRD, business-model |

Règle : reboucle **le plus localement possible**. Un « Ajuster » sur les couleurs ne rouvre jamais le PRD.

## Tenue de l'état (`.saas-factory/state.md`)
Après **chaque** étape, mets à jour :
- **Phase courante** : `2 — cadrage produit`.
- **Étape courante** : `06` / `07` / `08` (ou `porte-PRD`, `porte-charte`).
- **Type / calibrage** : public / interne / perso + niveau appliqué (complet / allégé / minimal) par étape.
- **Décisions verrouillées** : pricing retenu, périmètre MVP validé, direction visuelle validée.
- **Portes franchies** : PRD (date/verdict), Charte (date/verdict).
- **Artefacts produits** : cocher les fichiers écrits (contrat dans `conventions.md`).

Jamais de secret ni de clé API dans `state.md`.

**Écrivain unique** : c'est **toi, l'orchestrateur**, qui écris `state.md` — **jamais** les experts. Règle canonique (+ l'unique exception `01-discover`) : `skills/saas-factory/references/state-resume.md` §Écrivain unique. Ne redéfinis pas la règle ici.

## Procédure de reprise
Au (re)démarrage de la phase :
1. Relis `.saas-factory/state.md`. Repère l'**étape courante** et les portes déjà franchies.
2. Vérifie l'existence des artefacts attendus jusqu'à cette étape (contrat `conventions.md`). Un artefact manquant = étape à refaire, pas à sauter — **sauf** un artefact légitimement absent selon la route (ex. `product/business-model.md`/`pricing.md` en **perso** : étape 06 sautée par routage, tracée dans `state.md` — pas une étape à refaire).
3. Reprends **à l'étape courante**, avec le **calibrage** déjà noté (ne redemande pas le type).
4. Ne recharge pas `_shared` : `state.md` suffit à te resituer.

Ne repars **jamais** de zéro si `state.md` existe.

## Passation vers la Phase 3
Fin de Phase 2 = les deux portes franchies + artefacts complets :
- `product/business-model.md` (+ `product/pricing.md` si public) — si l'étape 06 était active (sautée en perso, tracée dans `state.md`),
- `product/product-spec.md` + `product/features/*` + `product/user-stories.md` + `product/feature-prioritization.md` + `product/mvp-definition.md`,
- `DESIGN.md` (+ `design/mockups/`).

Mets `state.md` à jour (Phase 2 close), résume en 2 lignes **ce qu'on construit** (le MVP + la direction), et annonce la **Phase 3 — cadrage technique (`09-architecture`)**, rôle CTO : le *comment*. Rappelle le HARD GATE : la Phase 2 dit **quoi**, pas **comment** ; aucune techno n'a encore été choisie.
