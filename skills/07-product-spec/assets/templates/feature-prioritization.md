# Feature Prioritization — <nom court du produit>

<!-- Artefact de l'étape 7. Frameworks de startup-design (references/frameworks.md) — on les APPLIQUE, on ne les réinvente pas. MoSCoW pour trancher le scope ; RICE pour départager l'ordre quand il n'est pas évident. -->

## MoSCoW
<!-- Chaque feature dans UN seul bucket. Le Won't have (this time) nomme explicitement le hors-scope : c'est lui qui protège du scope-creep. La justification rattache chaque feature à la Phase 1. -->
| Feature | Bucket | Justification (rattachement Phase 1) |
|---|---|---|
| <nom> | Must / Should / Could / Won't | <pourquoi ce bucket> |

## RICE
<!-- Pour départager l'ordre de build. Score = (Reach × Impact × Confidence) ÷ Effort. Impact : 3 massif / 2 fort / 1 moyen / 0.5 faible / 0.25 minime. Confidence : 100 / 80 / 50 %. Effort en personne-mois. Trier par score décroissant. -->
| Feature | Reach (/trim) | Impact | Confidence | Effort (p-mois) | Score |
|---|---|---|---|---|---|
| <nom> | <n> | <3..0.25> | <100/80/50 %> | <n> | <(R×I×C)/E> |

## Build order
<!-- L'ordre de construction, déduit des dépendances (ce qui doit exister avant quoi) + du score RICE. Alimente directement le plan de la Phase 3. -->
1. <feature — pourquoi en premier (socle / dépendance)>
2. <feature>
