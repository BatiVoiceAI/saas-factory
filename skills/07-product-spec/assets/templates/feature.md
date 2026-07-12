# Feature — <nom de la feature>

<!-- Fiche PROFONDE, une par feature Must (product/features/NN-<slug>.md). C'est la « grosse description fonctionnelle + technique » d'un vrai PM : elle absorbe la user story et ses critères (fusion §5 — pas de user-stories.md séparé). Une fiche Must SANS flow + états + critères + volet technique est une spec non finie (échec du HARD GATE). Should = fiche allégée (Objectif, Persona, Story, Comportement + états clés, critères nominaux, volet technique en 2-3 lignes, N'inclut pas). Could/Won't = pas de fiche. Anatomie détaillée : references/feature-spec-depth.md. -->

## Priorité
<!-- MoSCoW. Doit correspondre à product-spec.md § Priorisation (source unique). Une fiche ne concerne QUE Must (complète) / Should (allégée). -->
<Must / Should>

## Objectif / job
<!-- Le job-to-be-done, du point de vue de la cible, rattaché Phase 1 (workflow cœur / demand-signals / manque concurrent / socle complétude). Le POURQUOI (valeur), pas seulement le QUOI (mécanique). 2-3 lignes. -->
<Objectif>

## Pour qui
<!-- Le(s) persona(s) précis qui déclenche(nt) la feature, cohérent(s) avec la cible Phase 1. Jamais « un utilisateur ». Si plusieurs rôles la touchent (ex. cliente ET gérant), les nommer. -->
<Persona(s)>

## User story
<!-- En tant que <persona>, je veux <action observable>, afin de <bénéfice rattaché Phase 1>. Une story par rôle si plusieurs personas agissent. Méthode : references/acceptance-criteria.md Partie A. -->
En tant que <persona>, je veux <action>, afin de <bénéfice>.

## Flow détaillé
<!-- Le parcours NOMINAL, numéroté, du déclencheur au résultat à valeur. Chaque étape = une action utilisateur ou une réaction produit observable. Nommer les écrans/vues traversés (sans les dessiner : design = étape 8). Un ingénieur doit pouvoir maquetter l'écran rien qu'en lisant. -->
1. <déclencheur — ex. la cliente ouvre le lien de réservation>
2. <étape>
3. <… → résultat observable + boucle fermée (§ Boucles)>

## États
<!-- JAMAIS un seul happy path. Pour chaque écran du flow, nommer l'état rendu. Vide → socle S3 ; Succès → boucle ci-dessous ; Erreur → repli honnête (safety-rails §6) ; Edge → catalogue acceptance-criteria.md Partie C. Chaque état pertinent devient un critère d'acceptation. -->
- **Vide :** <message pédagogique + CTA, jamais un tableau vide muet>
- **Chargement :** <skeleton / spinner / progression, pas de gel>
- **Succès :** <résultat + trace durable, pas seulement l'écran qui se ferme>
- **Erreur :** <message clair actionnable, état non corrompu>
- **Edge / partiel :** <cas limites pertinents : volume, concurrence, quota, session expirée, double-clic>

## Règles métier
<!-- Contraintes et INVARIANTS fonctionnels (le quoi, pas le comment=09). Validations d'entrée, invariants (ce qui doit rester vrai), droits/propriété, effets de bord métier. Chaque règle non triviale ressort en critère d'acceptation. -->
- **Validations :** <champ requis, format, unicité métier>
- **Invariants :** <ex. deux réservations ne se chevauchent jamais sur la même ressource>
- **Droits :** <qui a le droit de faire quoi>

## Boucles fermées
<!-- Si la feature est une action de valeur (crée/modifie/annule l'entité métier) : remplir les 5 questions (repris de product-spec.md § Boucles fermées / _shared/boucles-fermees.md). Chaque « oui » = une exigence + un critère. « Pas de boucle » = justifié par action, jamais par type. Omettre cette section si la feature n'est pas une action de valeur (le préciser). -->
| # | Question | Réponse |
|---|---|---|
| 1 | Trace durable pour l'acteur ? | <email/notif de confirmation, ou « écran + historique suffisent » justifié> |
| 2 | Contrepartie informée ? | <notif à l'autre partie — jamais sautable si contrepartie> |
| 3 | Réversible / modifiable ? | <lien annuler/déplacer (token signé si sans compte)> |
| 4 | Rappel pertinent ? | <rappel J-1/H-2 si échéance> |
| 5 | Trace consultable ? | <historique acteur + contrepartie> |

## Critères d'acceptation
<!-- Given/When/Then vérifiables oui/non, résultat CONCRET. Couverture : 1 nominal + 1 par état + 1 par règle métier + 1 par boucle + ≥1 frontière (vérifie une exclusion). Méthode + catalogue : references/acceptance-criteria.md. -->
- **Nominal :** Étant donné <contexte>, quand <action>, alors <résultat attendu>.
- **État vide :** Étant donné <aucune donnée>, quand <écran s'ouvre>, alors <empty state + CTA>.
- **Erreur :** Étant donné <condition d'échec>, quand <action>, alors <message clair, état non corrompu>.
- **Règle métier :** Étant donné <contexte>, quand <action violant l'invariant>, alors <rejet explicite>.
- **Boucle :** Étant donné <action de valeur réussie>, alors <email de confirmation part + contrepartie notifiée>.
- **Frontière :** Étant donné <écran>, quand <l'utilisateur cherche X hors-scope>, alors <non proposé en v1>.

## Volet technique (contrat logique — interface vers 09)
<!-- Le QUOI logique que 09 consomme, JAMAIS le COMMENT (pas de schéma SQL, stack, index, migration, route HTTP exacte = débordement 09, échec du HARD GATE). Noms d'entités/actions cohérents avec ceux que 09 reprendra. Détail + frontière : references/feature-spec-depth.md §9. -->
- **Entités touchées :** <Réservation (créée), Prestation (lue), Client (créé/retrouvé)>
- **Actions logiques :** <créer une réservation ; annuler une réservation>
- **Validations à garantir :** <créneau requis + libre ; email valide>
- **Invariants à préserver :** <pas de chevauchement de créneau sur la même ressource>

## Dépendances
<!-- Autres features / briques qui doivent exister AVANT celle-ci. Alimente le build order du PRD (étape 6). -->
- <dépendance 1>

## N'inclut pas
<!-- La frontière. Ce qu'un ingénieur pourrait raisonnablement croire inclus mais qui ne l'est PAS (v1). ≥1 exclusion non triviale. Protège contre le scope-creep au niveau feature. -->
- <exclusion 1>
