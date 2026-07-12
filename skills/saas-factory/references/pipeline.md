# Pipeline — les 6 phases enchaînées (carte du chef d'orchestre)

Règles transverses du **master**, lues une fois. Elles priment sur le comportement par défaut.
Tu **n'exécutes pas** les étapes ici : tu **invoques l'orchestrateur de phase**, qui déroule ses étapes expertes. Ta valeur = enchaîner dans l'ordre, router, tenir l'état, poser les portes.

## Le flux — diagramme

```
                        ┌─────────────────────────────────────────────────────────────┐
   [ infra-setup ]      │  global, 1×, sibling — PAS une phase du pipeline.            │
   (~/.saas-factory/    │  Débloque le provisioning auto des Phases 3 & 5.            │
     config.json)       │  Absent → mode local/fallback + guide (jamais bloquant).    │
                        └─────────────────────────────────────────────────────────────┘

  IDÉE
   │
   ▼
┌──────────────────┐  Go       ┌──────────────────┐  PRD+Charte ┌──────────────────┐
│ P1 phase-1-      │──────────▶│ P2 phase-2-      │────────────▶│ P3 phase-3-tech  │
│    validation    │           │    product       │  validés    │  (CTO)           │
│  (CEO) 01→05     │◀─┐        │  (PM/Des) 06→08  │◀─┐         │  09→11           │
└──────────────────┘  │Ajuster └──────────────────┘  │reboucle └──────────────────┘
   │        │         │           │                  │              │
   │No-Go   └─────────┘           └──────────────────┘              │ ZÉRO PORTE
   ▼                                                                 │ (100% autonome)
 STOP + post-mortem                                                  ▼
                                                          ┌──────────────────┐
                       ┌──────────── Stop ◀───────────────│ P4 phase-4-build │
                       │           Itérer ◀──────┐        │  (l'org)         │
                       ▼                          │        │  12→15  🚪15     │
                     STOP                         └────────└──────────────────┘
                                                                     │ Ship
                                                                     ▼
       ┌──────────────────┐  kill  ◀─────────────┐        ┌──────────────────┐
       │ P6 phase-6-after │                      │        │ P5 phase-5-launch│
       │  (PM/EngMgr)     │  continue → itère    │        │  (Mkt/Release)   │
       │  18→19  🚪19     │──────────────────────┘        │  16→17  🚪17     │
       └──────────────────┘   (retour Phase 4/5)          └──────────────────┘
              │ kill                                              │ publié
              ▼                                                   ▼
         archive + mémoire ◀────────────────────────────── (produit en ligne)
```

Les 🚪 = portes utilisateur. Les flèches `◀` remontantes = **retours arrière** autorisés (voir `gates.md`).

## La séquence — ce que chaque phase invoque et produit

| # | Orchestrateur | Rôle | Étapes | Produit (artefacts clés) | Porte |
|---|---|---|---|---|---|
| 1 | `phase-1-validation` | CEO | 01→05 | `research/opportunity-brief.md` + `-summary.md` | 🚪 **Go / Ajuster / No-Go** |
| 2 | `phase-2-product` | PM/CEO/Designer | 06→08 | `product/*` (PRD), `DESIGN.md` | 🚪 **PRD + charte validés** |
| 3 | `phase-3-tech` | CTO | 09→11 | `tech/architecture.md`, `tech/execution-plan.md`, repo + `tech/provisioning-log.md` | **aucune** (100% autonome) |
| 4 | `phase-4-build` | l'org | 12→15 | code validé (cascade + faux-client), `qa/*` | 🚪 **Ship / Itérer / Stop** (étape 15) |
| 5 | `phase-5-launch` | Marketing/Release | 16→17 | `seo/plan.md`, prod déployée | 🚪 **publication** (plan-then-apply, étape 17) |
| 6 | `phase-6-after` | PM/Eng Manager | 18→19 | `metrics/review.md`, `retro/retro.md`, mémoire | 🚪 **kill / continue** (étape 19) |

Chaque phase **lit** les artefacts de la précédente et **écrit** les siens (le bus de données). Le détail des chemins lit/écrit par étape vit dans les `references/conventions.md` de chaque phase — ne le duplique pas ici, ouvre-le au moment d'invoquer la phase.

## Règle d'enchaînement (robustesse)
- Invoque **une phase à la fois**, dans l'ordre. Ne saute jamais une phase (le routage saute des **étapes**, pas des phases — cf. `routing.md`).
- **Ne franchis jamais une 🚪 sans décision explicite** de l'utilisateur (`gates.md`).
- Entre deux phases : **mets à jour `.saas-factory/state.md`** (`state-resume.md`), résume en 2 lignes où on en est, annonce la phase / porte suivante.
- Phase 3 = **zéro porte** : ne demande rien à l'utilisateur, laisse le CTO trancher et loguer.
- Une porte peut **renvoyer en arrière** (Ajuster P1, reboucle P2, Itérer/Stop P4, continue→P4/P5 depuis P6). Suis alors le retour décrit dans `gates.md` et remets l'état à jour.

## Frontières (ce que le master ne fait PAS)
- Il ne code pas, ne spécifie pas, ne tranche pas la technique. Il **délègue**.
- Il ne pose **aucune** décision technique à l'utilisateur (les personas tranchent via `_shared/stack-defaults.md`).
- Il ne fait pas relire `_shared/*` par chaque phase (discipline « une fois » — `state-resume.md`).
