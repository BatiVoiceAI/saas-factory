# Feature — <nom de la feature>

<!-- Une fiche par feature Must/Should (product/features/NN-<slug>.md). Décline la feature en spec exploitable par le build. Le « N'inclut pas » est aussi important que le comportement : il borne la feature et évite le gonflement silencieux. -->

## Priorité
<!-- MoSCoW. Doit correspondre à product/feature-prioritization.md — pas de divergence entre les deux fichiers. Une fiche ne concerne QUE les Must/Should (Could/Won't = une ligne dans la liste, pas de fiche). -->
<Must / Should>

## Description
<!-- Quoi, en 2-3 lignes : ce que la feature fait et le problème qu'elle règle. -->
<Description>

## Pour qui
<!-- Le persona qui l'utilise, cohérent avec la cible validée en Phase 1. -->
<Persona>

## Comportement attendu
<!-- Le comportement nominal, étape par étape. Testable : ce qui doit arriver quand l'utilisateur fait X. C'est ce que le build implémente. -->
<Comportement nominal>

## Cas limites
<!-- Erreurs, entrées vides, limites de volume, accès concurrent, permissions. Ce que le build doit gérer et qu'on oublie souvent — les nommer maintenant évite les bugs plus tard. -->
- <cas limite 1>

## N'inclut pas
<!-- La frontière de la feature. Ce qui pourrait sembler inclus mais ne l'est pas (v1). Protège contre le scope-creep au niveau feature. -->
- <exclusion 1>

## Dépendances
<!-- Autres features / briques qui doivent exister AVANT celle-ci. Alimente le build order du PRD. -->
- <dépendance 1>
