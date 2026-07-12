# Product Spec (PRD) — <nom court du produit>

<!-- Artefact CŒUR et UNIQUE de l'étape 7 (rôle PM). LE document qui définit ce qu'on construit. Depuis la fusion §5, il absorbe la priorisation (MoSCoW/RICE) ET le MVP (avant : feature-prioritization.md + mvp-definition.md, qui se recopiaient). La priorité, le MVP et le build order vivent ici UNE seule fois (source unique). Les fiches product/features/NN-*.md portent la profondeur par feature Must (flow, états, règles, boucles, critères, volet technique). Fidèle à la Phase 1 : chaque feature se rattache à un élément de research/ — sinon elle passe en Non-goal. Jamais de page blanche. -->

## Contexte & besoin
<!-- Repris de la Phase 1, PAS réinventé. C'est le socle auquel tout le reste doit se rattacher. -->
- **Problème :** <le problème cœur, du point de vue de la cible, repris de opportunity-brief>
- **Cible :** <persona précis, caractéristiques observables>
- **Edge :** <axe différenciant, ou absence assumée>
- **Intégrations / écosystème :** <outils à connecter, repris de idea-brief>
- **Type de produit :** <SaaS public / outil interne entreprise / outil perso — cadre le canal des boucles et l'adaptation du socle>

## Scope — workflow cœur
<!-- UN workflow cœur bien fait. Micro-SaaS niché, pas plateforme horizontale. Décrire le parcours de bout en bout : c'est ce que le MVP doit rendre fluide. -->
<Le workflow cœur, étape par étape>

**Actions de valeur** (créer / modifier / annuler l'entité métier — alimentent § Boucles fermées) :
- <ex. créer une réservation ; annuler une réservation ; déplacer une réservation>

## Aha moment
<!-- La première action où l'utilisateur obtient la valeur promise — jamais le signup, jamais « compléter son profil ». Le chemin le plus court y mène depuis l'entrée (signup/SSO/usage direct), étapes comptées (cible ≤ 5) ; l'onboarding wizard doit y déboucher. Voir references/completeness-baseline.md. -->
- **Première action de valeur :** <ex. le gérant voit sa page de réservation en ligne avec ses vraies prestations>
- **Chemin le plus court :** <entrée → onboarding (2-4 écrans) → … → aha — N étapes>

## Liste des features
<!-- Liste COMPLÈTE dérivée de : (a) le workflow cœur, (b) les features réclamées (demand-signals), (c) les manques concurrents (opportunity-brief), (d) le socle « produit complet » S1-S8 injecté d'office (rattachement « socle complétude »). Une ligne par feature ; fiche PROFONDE dans product/features/NN-<slug>.md pour les Must (allégée pour Should). -->
| # | Feature | Priorité (M/S/C/W) | Rattachement Phase 1 |
|---|---|---|---|
| 01 | <nom> | <Must / Should / Could / Won't> | <problème / demande / manque concurrent / socle complétude> |

## Socle « produit complet » (Must d'office — universel aux 3 types)
<!-- Injecté d'office, exempté du test de retrait : on ADAPTE chaque élément au type/à la niche, on ne débat pas de son existence. « Socle réduit » = décision justifiée PAR ÉLÉMENT (outil interne/perso), jamais une dispense de type. Détail : references/completeness-baseline.md. -->
| Élément | Adaptation au type / à la niche |
|---|---|
| S1 · Onboarding wizard (2-4 écrans) → crée l'entité cœur avec défauts intelligents modifiables | <ex. salon : nom, adresse, horaires, 3 prestations types pré-remplies> |
| S2 · Profil / settings complet (infos, email, suppression de compte RGPD ; rôles + audit si interne) | <…> |
| S3 · Empty states pédagogiques (chaque écran vide guide vers l'action) | <…> |
| S4 · Emails / notifications transactionnels brandés (canal adapté au type) | <…> |
| S5 · Pages légales FR (mentions, confidentialité, CGV si vente ; équivalent interne/perso adapté) | <…> |
| S6 · 404 brandée | <…> |
| S7 · Seed / demo data marquée « exemple » et supprimable | <…> |
| S8 · Metadata & favicon brandés (title, description, favicon, OG, lang fr) | <…> |

## Priorisation — MoSCoW (source unique de la priorité)
<!-- Fusion §5 : la matrice vit ICI, plus dans un fichier séparé. Chaque feature dans UN bucket. Le Won't have est AUSSI important que le Must : il protège le scope. Justification = rattachement Phase 1. Le socle S1-S8 est Must d'office (justif « socle complétude »). Méthode : references/prioritization.md. -->
| Feature | Bucket | Justification (rattachement Phase 1) |
|---|---|---|
| <nom> | Must / Should / Could / Won't | <pourquoi ce bucket> |

### RICE (départage l'ordre)
<!-- Score = (Reach × Impact × Confidence) ÷ Effort. Impact : 3 massif / 2 fort / 1 moyen / 0.5 faible / 0.25 minime. Confidence : 100/80/50 %. Effort en personne-mois (unité CONSTANTE). Estimations marquées [Assumption]. Trier par score décroissant. -->
| Feature | Reach (/trim) | Impact | Confidence | Effort (p-mois) | Score |
|---|---|---|---|---|---|
| <nom> | <n> | <3..0.25> | <100/80/50 %> | <n> | <(R×I×C)/E> |

## MVP (les Must, rien d'autre)
<!-- Fusion §5 : la définition du MVP vit ICI. Le plus PETIT produit qui résout VRAIMENT le problème cœur. Le socle « produit complet » en fait partie d'office : sans lui le MVP n'est pas plus petit, il est inachevé. -->
- **Hypothèse cœur (falsifiable) :** « si on donne <capacité> à <cible>, alors <comportement/valeur attendu> ».
- **Features Must :** <UNIQUEMENT les Must de la matrice — aucun Should/Could> + socle « produit complet » S1-S8.
- **Success criteria (mesurables) :** <activation = job cœur accompli (ex. « premier livrable exporté »), rétention, complétion du workflow, willingness-to-pay — pas de vanity metric>.
- **Out-of-scope :** <repris du Won't have — nommer protège le focus au build>.

## Boucles fermées
<!-- Aucune action de valeur muette (doctrine _shared/boucles-fermees.md). Pour CHAQUE action de valeur (§ Scope), remplir les 5 questions. Canal adapté au type ; l'existence de la boucle, non. Dès qu'une contrepartie existe, les colonnes 1-2 ne sont jamais vides. Chaque « oui » = une exigence de la feature (§7 de sa fiche) + un critère G/W/T. -->
| Action de valeur | 1. Trace acteur | 2. Contrepartie informée | 3. Réversible | 4. Rappel | 5. Trace consultable |
|---|---|---|---|---|---|
| <ex. créer une réservation> | <email client + .ics> | <notif gérant> | <lien annuler (token signé)> | <rappel J-1> | <historique 2 côtés> |

## Dépendances & build order
<!-- Source unique (fusion §5). Ce qui doit exister AVANT quoi. Déduit des dépendances entre features (DAG) + du score RICE (dépendance > score). Chaque item porte sa raison. Alimente directement le plan de la Phase 3. Méthode : references/dependencies-build-order.md. -->
1. <feature — socle : tout en dépend>
2. <feature — dépend de X / plus haut RICE à ce palier>

## Périmètre livré (référence pour le gate pricing ↔ features)
<!-- Amorce P0.7 : la liste des Must EST le contrat de livraison. Le pricing (étape 06) ne vend QUE ce que ces Must couvrent ; les gates 12/15 vérifient que le livré = ces Must. Liste canonique, sans re-décrire (renvoi aux fiches). -->
- <Must 1 — features/NN-<slug>.md>
- <Must 2 — features/NN-<slug>.md>

## Non-goals
<!-- Ce que le produit NE fait PAS (au moins en v1). Reprend le Won't have + les non-goals de idea-brief. Nommer explicitement protège du scope-creep. -->
- <non-goal 1>
- <non-goal 2>
