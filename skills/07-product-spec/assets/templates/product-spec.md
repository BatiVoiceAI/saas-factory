# Product Spec (PRD) — <nom court du produit>

<!-- Artefact CŒUR de l'étape 7 (rôle PM). LE document qui définit ce qu'on construit. Fidèle au besoin validé en Phase 1 : chaque feature se rattache à un élément de research/ (problème, cible, edge, demande) — sinon elle passe en Non-goal. Ne jamais repartir d'une page blanche : tout découle des artefacts research/. -->

## Contexte & besoin
<!-- Repris de la Phase 1, PAS réinventé. C'est le socle auquel tout le reste doit se rattacher. -->
- **Problème :** <le problème cœur, repris de opportunity-brief>
- **Cible :** <persona précis>
- **Edge :** <axe différenciant, ou absence assumée>
- **Intégrations / écosystème :** <outils à connecter, repris de idea-brief>

## Scope — workflow cœur
<!-- UN workflow cœur bien fait. Micro-SaaS niché, pas plateforme horizontale. Décrire le parcours de bout en bout : c'est ce que le MVP doit rendre fluide. -->
<Le workflow cœur, étape par étape>

## Aha moment
<!-- La première action où l'utilisateur obtient la valeur promise — jamais le signup, jamais « compléter son profil ». Le chemin le plus court y mène depuis le signup, étapes comptées (cible ≤ 5) ; l'onboarding wizard doit y déboucher. Voir references/completeness-baseline.md. -->
- **Première action de valeur :** <ex. le gérant voit sa page de réservation en ligne avec ses vraies prestations>
- **Chemin le plus court :** <signup → onboarding (2-4 écrans) → … → aha — N étapes>

## Liste des features
<!-- Liste COMPLÈTE dérivée de : (a) le workflow cœur, (b) les features réclamées (demand-signals), (c) les manques concurrents (opportunity-brief), (d) le socle « produit complet » injecté d'office (rattachement « socle complétude »). Une ligne par feature ; fiche détaillée dans product/features/NN-<slug>.md pour les Must/Should. -->
| # | Feature | Priorité (M/S/C/W) | Rattachement Phase 1 |
|---|---|---|---|
| 01 | <nom> | <Must / Should / Could / Won't> | <problème / demande / manque concurrent / socle complétude> |

## Socle « produit complet » (SaaS public — Must d'office)
<!-- Injecté d'office, exempté du test de retrait : on ADAPTE chaque élément à la niche, on ne débat pas de son existence. Détail des exigences : references/completeness-baseline.md. -->
| Élément | Adaptation à la niche |
|---|---|
| Onboarding wizard (2-4 écrans) → crée l'entité cœur avec défauts intelligents modifiables | <ex. salon : nom, adresse, horaires, 3 prestations types pré-remplies> |
| Page profil / settings complète (infos, email, suppression de compte) | <…> |
| Empty states pédagogiques (chaque écran vide guide vers l'action) | <…> |
| Emails transactionnels brandés | <…> |
| Pages légales FR (mentions légales, confidentialité, CGV si vente) | <…> |
| 404 brandée | <…> |
| Seed / demo data marquée « exemple » et supprimable | <…> |

## Priorisation (MoSCoW)
<!-- Résumé ici ; détail RICE + build order dans product/feature-prioritization.md. Le Won't have est AUSSI important que le Must : c'est lui qui protège le scope. -->
- **Must (= le MVP) :** <features sans lesquelles le problème cœur n'est pas résolu>
- **Should :** <important, itération suivante>
- **Could :** <si le temps/budget le permet>
- **Won't (this time) :** <explicitement hors scope, nommé>

## User stories (résumé)
<!-- Résumé ici ; stories complètes + critères d'acceptation dans product/user-stories.md. Une story par feature Must/Should. -->
- En tant que <persona>, je veux <action>, afin de <bénéfice>.

## Dépendances & build order
<!-- Ce qui doit exister AVANT quoi. Déduit des dépendances entre features + du score RICE. Alimente directement le plan de la Phase 3. -->
<Ordre de construction + dépendances entre features>

## Non-goals
<!-- Ce que le produit NE fait PAS (au moins en v1). Reprend le Won't have + les non-goals de idea-brief. Nommer explicitement protège du scope-creep. -->
- <non-goal 1>
- <non-goal 2>
