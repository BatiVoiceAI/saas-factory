# Référence — Procédure d'architecture (machine à états)

La conduite exacte du cadrage technique, mouvement par mouvement. Le SKILL.md donne l'aperçu ; ici la sous-procédure exhaustive de chaque cran : **quoi faire · dans quel ordre · critère de passage avant de monter d'un cran**. Rien n'est improvisé — la Phase 3 est **100 % autonome** (aucune porte utilisateur), donc le déterminisme de cette machine remplace le jugement humain.

## Sommaire

- Invariant
- Machine à états
- Sous-procédures (par cran)
- Data-flow (ce que l'architecture alimente en aval)
- Règles opérationnelles (rappel)

## Invariant
Le cadrage a un **cran courant**. Il ne **monte** d'un cran qu'une fois le **critère de passage** atteint. Il peut **retomber** : si un mouvement révèle un trou dans un artefact amont, on **redescend** (jusqu'au renvoi Phase 2 si c'est le PRD qui est cassé). Un choix technique sans exigence traçable = un choix orphelin : on le supprime ou on le justifie par un ADR (jamais « au feeling »). Règle d'or transverse : **défaut sauf exigence contraire** (`_shared/stack-defaults.md`).

## Machine à états
```
 [M0 CHARGER LESSONS + SAFETY + STACK-DEFAULTS + ARCHÉTYPE]
     │  contexte méthode chargé
     ▼
 [M1 INGÉRER LE PRD] ──PRD incomplet/contradictoire──┐
     │  socle produit cohérent et lu                 │ renvoi Phase 2
     ▼                                                │ (decision-matrices §0)
 [M2 EXTRAIRE LES NFR] ◀───────────────────────────-─┘
     │  matrice des exigences (feature × 8 axes) + exigences dures isolées
     ▼
 [M3 DÉCOUPAGE TECHNIQUE] ──modèle de données instable──┐
     │  C4 (L1/L2/L3) + modèle de données + data-flow    │ boucle interne
     │  + frontières + split réutiliser/custom           │ (data-model.md)
     ▼                                                   │
 [M4 DÉCIDER LA STACK] ◀────────────────────────────────┘
     │  chaque ligne de stack = [Défaut] ou ADR-NNNN
     ▼
 [M5 ÉCRIRE LES 2 ARTEFACTS]  tech/architecture.md + tech/decisions.md
     │
     ▼
 [M6 DoD + AUTO-VÉRIFICATION]  (definition-of-done.md) ──recalé──┐
     │  les deux artefacts « tiennent »                          │ corrige le cran fautif
     ▼                                                           │
 [M7 ÉTAT + TASTE DECISIONS] ◀──────────────────────────────────┘
     │  state.md à jour · taste decisions loguées pour l'étape 10
     ▼
 [FIN] annonce l'étape 10 (Plan d'exécution)
```

## Sous-procédures (par cran)

### M0 — Charger le contexte méthode (une fois)
- **Fais** : lis `_shared/lessons.md`, `_shared/safety-rails.md`, `_shared/stack-defaults.md`, `_shared/archetypes/web-saas.md`, et si présent `skills/phase-3-tech/references/conventions.md`.
- **But** : verrouiller la posture (CTO qui tranche seul, boring-by-default, zéro secret dans les artefacts).
- **Passage** : les 4 fichiers socle sont lus.

### M1 — Ingérer le découpage fonctionnel (le PRD)
- **Fais** : lis **tout** le travail produit — `product/product-spec.md` (dont § Priorisation, § MVP, § Dépendances & build order), `product/features/*` (§ User story + § Critères d'acceptation + § Volet technique par fiche), `DESIGN.md`, `research/idea-brief.md`.
- **Auto-interrogation** : applique `forcing-questions.md §1` (le PRD est-il *architecturable* ?). Cherche les trous qui **empêchent** de décider une archi : entité centrale non nommée, workflow cœur sans critères d'acceptation, intégration mentionnée sans le nom de l'outil, non-goal contredit par une feature.
- **Interdit** : **combler un trou côté produit** (re-spécifier une feature, inventer une US). Le HARD GATE tient : si le produit est flou, on **renvoie à la Phase 2**, on ne bouche pas.
- **Passage** : soit le PRD est cohérent et complet côté architecture → M2 ; soit un déclencheur de `decision-matrices.md §0` est atteint → **renvoi Phase 2** (on s'arrête, on dit précisément quel artefact manque/contredit).

### M2 — Extraire les exigences techniques (NFR)
- **Fais** : applique la grille fixe de `nfr-checklist.md` (8 axes) sur **chaque feature Must/Should** et chaque US. Renseigne l'exigence **et sa source** (US / critère / élément du PRD).
- **Classe** : chaque exigence en **dure** (contrainte non négociable → pilotera un choix M4) vs **molle** (souhait → n'impose rien). Isole la **liste des exigences dures** — c'est l'entrée de M4.
- **Honnêteté** : un axe sans exigence = **case vide assumée**. `[Exigence]` (tracée) / `[Hypothèse]` (déduite) / `[Défaut]` (couvert par la stack).
- **Passage** : matrice complète (feature × 8 axes) + liste des exigences dures isolée + exigences socle (transverses) identifiées.

### M3 — Découpage technique (miroir du fonctionnel)
- **Fais** : suis `technical-decomposition.md` — C4 niveau 1 (contexte), niveau 2 (conteneurs), **modèle de données** (via `data-model.md` : entités/relations/RLS/multi-tenant), niveau 3 (modules en miroir des features), **data-flow** des workflows cœur, **frontières de confiance**, **cas limites**.
- **Reprends les noms de 07 (anti-dette)** : chaque fiche `product/features/*` porte un **§ Volet technique** (contrat logique : entités touchées, actions logiques, validations, invariants à préserver). L'architecte **reprend ces noms d'entités/actions tels quels** pour nommer tables et modules — il ne les réinvente pas ; il les **traduit** en COMMENT (schéma, RLS, routes, index) sans renommer le QUOI. Un renommage silencieux (« Réservation » du PM → `booking_slot` en archi) casse la traçabilité feature → module et crée de la dette.
- **Décide le split** : pour chaque module → **réutilise un bloc** (`_shared/blocks/`) ou **custom** (la verticale). Matrice : `decision-matrices.md §3`. Ce split est l'entrée directe de l'étape 10.
- **Boucle interne** : si le modèle de données ne « ferme » pas (une US n'a pas d'entité pour la porter, une relation ambiguë) → itère sur `data-model.md` avant de figer les modules (les modules dépendent des entités).
- **Passage** : C4 L1+L2 rendus en Mermaid + modèle de données (erDiagram + RLS) + data-flow des 2-3 workflows cœur + cas limites listés + tableau réutiliser/custom rempli (L3 modules).

### M4 — Décider la stack + l'architecture
- **Fais** : suis `stack-decision.md`. Pose le défaut de l'archétype comme hypothèse. Pour **chaque exigence dure** (de M2) : le défaut la satisfait-il ? Oui → verrouille `[Défaut]`. Non → **Scenario Compare** (fit/coût/complexité/réversibilité) + `WebSearch` (Search-Before-Building) + **ADR** (`adr-template.md`).
- **Budget de jetons d'innovation** : ≤ 1-2 déviations, réservées à l'edge produit. Au-delà → tu sur-ingénieres, reviens au défaut.
- **Passage** : chaque ligne de la stack finale rattachée à `[Défaut]` **ou** à un `ADR-NNNN` ; aucun choix orphelin.

### M5 — Écrire les deux artefacts
- **Fais** : écris `tech/architecture.md` (template `assets/templates/architecture.md`, sections 1-6) et `tech/decisions.md` (template `assets/templates/decisions.md`, journal ADR numéroté + index).
- **Hygiène** : **zéro secret / clé** dans ces fichiers (safety-rails §4). Les diagrammes sont **auto-contenus** (Mermaid texte, aucune image externe).
- **Passage** : les deux fichiers existent, toutes les sections des templates renseignées ou marquées « à préciser » avec justification.

### M6 — Definition-of-Done + auto-vérification
- **Fais** : passe la checklist `definition-of-done.md`. L'agent **se relit** : traçabilité (chaque choix → une exigence), réversibilité notée dans chaque ADR, split réutiliser/custom complet, cas limites présents.
- **Recalé** : un item qui ne passe pas → **redescends** au cran fautif (souvent M2 exigence manquante ou M4 choix orphelin), corrige, re-vérifie.
- **Passage** : tous les items DoD verts.

### M7 — État + taste decisions
- **Fais** : mets à jour `.saas-factory/state.md` (étape 9 faite, archétype confirmé, stack verrouillée, ADR ouverts). Logue les **taste decisions** (choix à impact produit) en fin de `architecture.md` (section 6) — l'étape 10 les tranchera en autonomie via ses principes encodés, jamais de remontée utilisateur.
- **Signalement** : les points sécurité-sensibles → taggés `[SÉCU]` (pour la revue Phase 4).
- **Passage** : state.md à jour, taste decisions et `[SÉCU]` logués.

## Data-flow (ce que l'architecture alimente en aval)
```
 PRD (product/*) + DESIGN.md + idea-brief
   │
   ▼
 tech/architecture.md ──┬─→ 10-execution-plan : split réutiliser/custom → ordre du graphe de tâches
                        ├─→ 10-execution-plan : taste decisions → tranchées via decision-principles
                        ├─→ 11-project-setup   : stack + modèle de données → scaffold repo + migrations
                        └─→ Phase 4 (build)     : data-flow + frontières de confiance → matrice de tests + revue sécu
 tech/decisions.md ─────→ 10 / 11 / Phase 4      : ADR = contraintes verrouillées (on ne rejoue pas les choix)
```
Objectif de chaînage : l'aval **exécute** l'architecture, il ne **re-décide pas** la stack. Un ADR accepté est une contrainte, pas une suggestion.

## Règles opérationnelles (rappel)
- **Ordre imposé** : M1 → M2 → M3 → M4. On ne choisit pas la stack (M4) avant d'avoir les exigences (M2) — sinon on choisit « au feeling ».
- **Traçabilité d'abord** : chaque ligne de stack et chaque module se rattache à une exigence de la matrice. Pas de rattachement → pas dans l'archi.
- **Économie de contexte** : lis le fichier de référence d'un mouvement **au moment** de l'exécuter, pas tous d'un coup.
- **Zéro question technique à l'utilisateur** : « Postgres ou Mongo ? » = échec. Le CTO tranche, logue, avance.
