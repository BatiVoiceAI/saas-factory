# Référence — Procédure PRD (chef d'orchestre des 6 étapes)

Procédure exhaustive de l'étape 7. Tu **exécutes** le moteur vendoré `startup-design` (Phase 6 « Product », `references/frameworks.md`) et tu **rediriges ses sorties** vers nos chemins `product/`. Ta surcouche PM = la **profondeur** : un PRD stratégique complet + des fiches feature **profondes** (flow, états, règles métier, boucles fermées, critères testables, volet technique). Ce fichier orchestre les 6 étapes ; la profondeur de chaque étape vit dans sa référence dédiée.

## Qualité avant vitesse (directive fondatrice)
Les Phases 1-2 étaient « trop light ». Ici on ne cherche **pas la rapidité mais la qualité** : un vrai PM produit des descriptions produit, fonctionnelles **et** techniques, riches et actionnables. La profondeur exigée n'est **pas** du poids mort — le poids mort, ce sont les **doublons structurels** (qu'on fusionne, §5). Le HARD GATE **échoue** si une feature **Must** n'a pas **flow + états + critères + volet technique** (`feature-spec-depth.md`).

## Le principe qui gouverne tout : traduire, pas réinventer
La Phase 1 a **déjà tranché** le besoin (problème, cible, edge, écosystème). Le PM ne rouvre pas ces décisions : il les **traduit** en features, specs, priorités, stories testables. Toute feature, toute story, tout critère se **rattache** à un élément de `research/`. Une sortie sans rattachement = un élément inventé = red flag. **Jamais de page blanche.**

## Fusion §5 — un PRD, pas cinq fichiers qui se recopient
La règle d'or (source unique + renvois) impose de fusionner les doublons structurels. Depuis la Vague B :
- **`product-spec.md` est le document unique** : il **absorbe** la priorisation MoSCoW/RICE **et** la définition du MVP (avant : `feature-prioritization.md` + `mvp-definition.md`, qui se recopiaient). La matrice, le MVP et le build order y vivent **une seule fois**.
- **La story et ses critères vivent dans la fiche feature** (`features/NN-*.md`) — on garde **les fiches**, pas un `user-stories.md` séparé (choix tracé : les fiches sont le foyer profond ; dupliquer les stories ailleurs serait un doublon).
- `feature-prioritization.md`, `mvp-definition.md`, `user-stories.md` ne subsistent qu'en **renvoi** (pointeur vers le PRD / les fiches) pour ne pas casser les lectures aval — à repointer côté aval (flag).

## Data-flow : d'où vient le PRD, où il va

```
        PHASE 1 (déjà validé — research/)                      ÉTAPE 7 (product/)                    AVAL
  ┌──────────────────────────────────┐
  │ idea-brief.md                    │─┐   ┌──────────────────────────────────────┐
  │  · besoin, type, écosystème      │ │   │ 1. Contexte, workflow, aha, actions  │──▶ product-spec.md
  │  · intégrations attendues        │ ├──▶│ 2. Liste features (+ socle archétype) │   § Contexte/Scope/Aha/Features
  │  · non-goals initiaux            │ │   │ 3. Priorisation MoSCoW+RICE → MVP    │──▶ product-spec.md § Priorisation/§ MVP
  ├──────────────────────────────────┤ │   │    (→ prioritization.md)             │
  │ opportunity-brief.md             │ │   │ 4. Boucles fermées (5 questions)     │──▶ product-spec.md § Boucles fermées
  │  · marché, edge, risques         │ ├──▶│    (→ _shared/boucles-fermees.md)    │
  │  · manques concurrents           │ │   │ 5. Fiches profondes (Must)           │──▶ features/NN-*.md
  ├──────────────────────────────────┤ │   │    flow/états/règles/boucles/critères│   (story + critères inclus)
  │ positioning.md  · angle          │─┤   │    /volet technique (→ feature-spec- │
  ├──────────────────────────────────┤ │   │    depth.md, acceptance-criteria.md) │
  │ demand-signals.md                │─┘   │ 6. Dépendances → build order         │──▶ product-spec.md § Build order
  │  · features réclamées, manques   │     │    (→ dependencies-build-order.md)   │      ▼
  └──────────────────────────────────┘     └──────────────────────────────────────┘   ÉTAPE 8 (design)
        business-model.md (étape 6) ──────────────┘  ancre scope + Must ← pricing         + PHASE 3 (build)
```

**Règle de traçabilité :** chaque feature de la liste porte, dans la colonne « Rattachement Phase 1 », **sa source** (`← workflow cœur`, `← demand-signals`, `← manque concurrent`, `← socle complétude`). Une feature sans source = feature inventée → couper ou passer en Won't. Le rattachement `socle complétude` est réservé aux éléments du socle « produit complet » (`completeness-baseline.md`) — injectés d'office, jamais orphelins.

## Ordre canonique (ne pas dévier)

```
1 Contexte ─▶ 2 Features ─▶ 3 Priorisation ─▶ 4 Boucles ─▶ 5 Fiches profondes ─▶ 6 Dépendances
 (le socle)   (le quoi)     (le scope: MVP)    (fermées)   (flow/états/technique) (l'ordre de build)
```

Pourquoi cet ordre : on **priorise (3) avant de spécifier en profondeur (5)** — la priorisation est *cheap* (test de retrait sur la liste), la profondeur est *chère* : on ne déploie les fiches complètes que sur les **Must**. Les **boucles fermées (4)** se dérivent une fois le scope figé (elles s'appliquent aux actions de valeur des Must) et **alimentent** les fiches (5) et peuvent **révéler** une feature manquante (email de confirmation, lien d'annulation). Le **build order (6)** suppose les dépendances des fiches figées. Hors ordre → PRD incohérent (mode d'échec « spec avant scope »).

---

## Étape 1 — Reprendre le besoin + le contexte

**But :** poser en tête du PRD le socle auquel **tout** se rattachera. Repris de la Phase 1, **jamais** réinventé.

**Sous-procédure :**
1. Lis les artefacts d'entrée (`idea-brief`, `opportunity-brief`, `positioning`, `demand-signals`, `business-model`).
2. Extrais et synthétise, en une phrase chacun : **problème** (← opportunity-brief), **cible / persona précis** (← idea-brief + opportunity-brief), **edge ou absence assumée** (← positioning), **intégrations / écosystème** (← idea-brief), **type de produit** (SaaS public / outil interne / outil perso — cadre le canal des boucles et l'adaptation du socle).
3. Écris le **workflow cœur** de bout en bout : le parcours que le MVP doit rendre fluide, étape par étape (de l'entrée de l'utilisateur au livrable qu'il obtient).
4. **Nomme les actions de valeur** du workflow (créer / modifier / annuler l'entité métier) — la liste qui sera dérivée à l'étape 4 (boucles fermées).
5. Nomme l'**aha moment** — la première action où l'utilisateur obtient la valeur promise (jamais le signup) — et le **chemin le plus court** pour y arriver (`entrée → onboarding → … → aha`, étapes comptées, cible ≤ 5). → `completeness-baseline.md` (§ Aha moment).

**Critère de passage :** le problème est formulé **du point de vue de la cible** (« je perds 2 h à recopier X » ✓, pas « manque d'automatisation » ✗) ; le workflow cœur tient en **un** parcours nommé ; les actions de valeur sont listées ; l'aha moment est une action de valeur **observable** et son chemin est chiffré.

**Décision :**

| Condition | Action |
|---|---|
| Un artefact d'entrée est **absent ou vide** | Ne pas inventer. Poser **la seule** question qui débloque (voir `forcing-questions.md` R1), citer l'artefact manquant, puis reprendre en autonomie |
| `opportunity-brief` et `positioning` **se contredisent** sur la cible/edge | Exposer les deux, demander de trancher (choix binaire), documenter (R1) |
| Plusieurs workflows candidats | En choisir **un** comme cœur (le plus douloureux / fréquent) ; les autres → notes « expansion possible » |
| La cible est un persona flou (« PME moderne ») | Resserrer en caractéristiques **observables** (« artisan solo qui facture >15 devis/mois ») |

---

## Étape 2 — Lister toutes les features

**But :** la liste **complète** des features candidates, dérivée des artefacts — un **bouquet cohérent autour d'UN workflow cœur**, niché, ni mono-feature ni plateforme horizontale.

**Sous-procédure :**
1. **Quatre sources, dans l'ordre :**
   - (a) **Workflow cœur** (étape 1) — décompose-le : chaque étape du parcours qui exige une capacité produit = une feature candidate.
   - (b) **Features réclamées** (`demand-signals`) — ce que la cible a explicitement demandé.
   - (c) **Manques concurrents** (`opportunity-brief`) — ce que les concurrents ne font pas et qui adresse le problème cœur.
   - (d) **Socle « produit complet »** (`completeness-baseline.md`) — injecté **d'office**, **CONDITIONNÉ PAR L'ARCHÉTYPE** (`_shared/state-schema.md` §socle-par-archétype ; portes par archétype dans `routing.md`) :
     - **web-saas → S1-S8** : onboarding wizard qui crée l'entité cœur avec défauts intelligents, profil/settings (dont suppression de compte), empty states, emails/notifs brandés, pages légales adaptées à la juridiction (`jurisdiction`/`locale`, jamais « FR » en dur), 404, seed data, **metadata/favicon**.
     - **landing → LP1-LP4** : sections landing-playbook, légal adapté à la juridiction, waitlist/CTA (boucle fermée), métadonnées/OG. **Pas** d'onboarding wizard, **pas** de dashboard, **pas** d'entité CRUD.
     - **automation → AU1-AU5** : config/secrets, historique runs/logs, healthcheck, boucle fermée, idempotence. **Pas** d'UI produit (headless).

     Le **type** (public/interne/perso) module ensuite le canal/mode, il ne remplace pas l'archétype. Rattachement = `socle complétude`.
2. Fusionne, **dédoublonne**, nomme chaque feature du point de vue de la valeur (pas de l'implémentation).
3. Remplis la table de `product-spec.md` (§ Liste des features) : `#`, `Feature`, `Priorité (provisoire)`, `Rattachement Phase 1`.

**Critère de passage :** chaque ligne a **une source rattachée** ; la liste couvre **tout** le workflow cœur (aucune étape du parcours sans feature) ; aucune feature n'existe **sans** rattachement.

**Décision (calibrage de l'ampleur) :**

| Condition | Action |
|---|---|
| Le workflow cœur tient en **1 seule** feature | Suspect « mono-feature » : chercher les features **de support** (compte, export, historique) qui rendent le job répétable |
| La liste dépasse ~12 features pour un MVP | Suspect « plateforme » : la plupart passeront en Should/Could/Won't à l'étape 3. Signaler, ne pas couper maintenant |
| Une feature n'adresse **aucun** élément Phase 1 | Feature orpheline → ne pas la lister comme candidate sérieuse ; la noter « idée hors-scope » |
| Un élément du socle semble orphelin (personne ne l'a « réclamé ») | Il ne l'est **pas** : rattachement `socle complétude` — Must d'office, à **adapter** au type/à la niche, pas à débattre |
| Deux features se recouvrent | Fusionner, ou tracer la frontière nette (le « N'inclut pas » de chaque fiche) |
| Une « feature » est en fait un critère d'acceptation ou un détail d'implémentation | La ranger sous sa feature parente ; ce n'est pas une feature |

**Micro-exemple (archétype web-saas — niche-agnostique).** Produit = générateur de X pour la cible C.
- (a) Workflow cœur → *saisie*, *génération*, *édition*, *export*. → 4 features.
- (b) `demand-signals` réclame *historique*, *modèles réutilisables*. → 2 features.
- (c) Manque concurrent = *pas d'export au format Y*. → renforce *export* (format Y prioritaire), pas une feature de plus.
- (d) Socle **web-saas → S1-S8** : *onboarding*, *profil/settings*, *empty states*, *emails brandés*, *légal adapté à la juridiction (`jurisdiction`/`locale`, jamais « FR » en dur) + 404*, *seed data*, *metadata/favicon*. → injectés d'office, rattachement `socle complétude`. **Si l'archétype était `landing`** → socle *LP1-LP4* (sections landing-playbook, légal, waitlist/CTA, métadonnées ; **pas** d'onboarding ni d'entité CRUD) ; **si `automation`** → *AU1-AU5* (config/secrets, historique runs, healthcheck, boucle fermée, idempotence ; **pas** d'UI). Voir `_shared/state-schema.md` §socle-par-archétype.

---

## Étape 3 — Prioriser (MoSCoW + RICE) → `references/prioritization.md`
Vient **avant** les fiches profondes : on ne déploie la profondeur (étape 5) que sur les **Must**. MoSCoW tranche le scope (Must = MVP, Won't = non-goals explicites), RICE départage l'ordre. Le socle « produit complet » est **Must d'office** (exempté du test de retrait). Sorties → `product-spec.md` § Priorisation **et** § MVP (hypothèse cœur, features Must, success criteria pointant l'aha moment, out-of-scope). **Procédure complète, matrices de scoring, modes d'échec :** voir `references/prioritization.md`.

## Étape 4 — Boucles fermées → `_shared/boucles-fermees.md`
**Aucune action de valeur muette.** Pour **chaque action de valeur** listée à l'étape 1 (créer/modifier/annuler l'entité métier), remplis les **5 questions** de la doctrine → confirmations, notifications à la contrepartie, liens réversibles, rappels, traces. Universel aux **3 types** ; ce qui varie = le **canal** (email client / email pro / notif in-app / webhook interne) et le **ton**, jamais l'existence de la boucle.

**Sous-procédure :**
1. Reprends la liste des actions de valeur (étape 1). Pour chacune, remplis le tableau des 5 questions (`_shared/boucles-fermees.md`).
2. Écris la synthèse dans `product-spec.md` § **Boucles fermées** (une ligne par action × 5 réponses).
3. Chaque « oui » devient une **exigence** répercutée dans la fiche de la feature concernée (§7 de la fiche, étape 5) et un **critère G/W/T** (§8).
4. Si une boucle réclame une brique absente de la liste (email de confirmation, lien d'annulation, page d'historique), **remonte-la** en feature/exigence (retour bref à l'étape 2).

**Critère de passage :** chaque action de valeur a ses 5 questions **répondues** ; dès qu'une **contrepartie** existe (client↔gérant, demandeur↔valideur, invité↔propriétaire), les questions 1-2 ne sont **jamais** sautées ; tout « pas de boucle » est **justifié par action**, jamais par type de produit. → recette `forcing-questions.md` Q9.

## Étape 5 — Fiches feature profondes → `references/feature-spec-depth.md`
Le cœur de la profondeur PM. Pour **chaque Must** : une fiche `features/NN-<slug>.md` avec les **11 sections** — Objectif/job, Persona, User story, **Flow détaillé** (étape par étape), **États** (vide/chargement/succès/erreur/edge), **Règles métier** (invariants), **Boucles fermées** (de l'étape 4), **Critères d'acceptation** (Given/When/Then, `acceptance-criteria.md`), **Volet technique** (entités/actions/validations/invariants — contrat logique cohérent avec 09, **jamais** le schéma concret), Dépendances, N'inclut pas. **Should** = fiche allégée. **Could/Won't** = pas de fiche. **Anatomie complète, catalogue d'états, frontière avec 09, DoD :** voir `references/feature-spec-depth.md` (+ `acceptance-criteria.md` pour la méthode story/critères).

## Étape 6 — Dépendances + build order → `references/dependencies-build-order.md`
Mappe les dépendances entre features (DAG), en déduit l'**ordre de construction** qui alimente la Phase 3. Écrit dans `product-spec.md` (§ Dépendances & build order) — **source unique**. **Détection de cycles, tri topologique, arbitrage RICE vs dépendances :** voir `references/dependencies-build-order.md`.

---

## Amorce du gate pricing ↔ features livrées (P0.7 — pour 06/12/15)
Le PRD produit la **liste des Must** = le **périmètre livré**. C'est la **référence** du gate « pricing = features livrées » : le pricing (étape 06) ne doit **vendre que ce que les Must du PRD couvrent** ; les gates de livraison (12/15) vérifient que le livré = les Must. Écris cette liste dans `product-spec.md` § **Périmètre livré (référence pricing)** — courte, canonique, sans re-décrire les features (renvoi aux fiches).

## Checklist Definition-of-Done (PRD complet)

`product-spec.md` (document unique)
- [ ] Contexte : problème (point de vue cible), persona précis, edge, intégrations, **archétype** (web-saas/landing/automation) + **type de produit** (public/interne/perso) — **tous repris de Phase 1**.
- [ ] Un **seul** workflow cœur décrit de bout en bout + **actions de valeur** listées.
- [ ] **Aha moment** nommé (action de valeur observable) + chemin le plus court chiffré (≤ 5 étapes).
- [ ] Liste des features **complète**, chaque ligne avec **rattachement Phase 1** (ou `socle complétude`).
- [ ] Socle « produit complet » **conditionné par l'archétype** présent en **Must** (web-saas → S1-S8 · landing → LP1-LP4 · automation → AU1-AU5 ; `_shared/state-schema.md` §socle-par-archétype), chaque élément **adapté au type/à la niche**. **Pas** d'onboarding/dashboard exigé pour un landing/automation.
- [ ] **§ Priorisation** : matrice MoSCoW + RICE (source unique de la priorité).
- [ ] **§ MVP** : hypothèse cœur falsifiable, features Must, success criteria mesurables (activation = job cœur), out-of-scope.
- [ ] **§ Boucles fermées** : les 5 questions remplies pour **chaque** action de valeur.
- [ ] **§ Dépendances & build order** présents (source unique).
- [ ] **§ Périmètre livré (référence pricing)** : liste des Must, pour le gate 06/12/15.
- [ ] **§ Non-goals** nommés explicitement (Won't have + non-goals `idea-brief`).

`features/NN-*.md` (une par Must ; allégée pour Should)
- [ ] Les **11 sections** remplies pour chaque Must (`feature-spec-depth.md`) : Objectif, Persona, Story, **Flow**, **États**, **Règles métier**, **Boucles**, **Critères G/W/T**, **Volet technique**, Dépendances, N'inclut pas.
- [ ] Priorité **cohérente** avec `product-spec.md` § Priorisation.
- [ ] Flow numéroté ; ≥ état vide + erreur ; ≥1 invariant si écriture ; volet technique **sans** débordement 09.

Renvois (compatibilité aval — fusion §5)
- [ ] `feature-prioritization.md`, `mvp-definition.md`, `user-stories.md` = **renvois** vers `product-spec.md` / les fiches, **zéro contenu dupliqué**.

Transverse
- [ ] **Zéro** feature orpheline (toutes rattachées Phase 1).
- [ ] MVP = **le plus petit** qui résout vraiment le problème cœur.
- [ ] Cohérence inter-fichiers : mêmes noms de features, mêmes priorités partout (source unique = PRD § Priorisation).
- [ ] Aucun débordement (pas de pricing, design, archi, ni schéma/stack — le volet technique reste le QUOI logique).
- [ ] Aucun secret / clé dans les fichiers.

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Page blanche** | Features inventées sans lien Phase 1 | Repartir des artefacts ; chaque feature porte une source ou saute |
| **Feature orpheline** | Une feature n'adresse aucun élément Phase 1 | Couper, ou passer en Won't (documenté comme non-goal) |
| **MVP gonflé** | Des Should/Could glissés dans les Must | Reboucler l'étape 3 : Must = strictement indispensable au job cœur |
| **Mono-feature** | Un seul bouton présenté comme produit | Ajouter les features de support qui rendent le job **répétable** |
| **Squelette de features** | Features cœur correctes mais produit creux | Injecter le socle **de l'archétype** (web-saas S1-S8 / landing LP1-LP4 / automation AU1-AU5) en Must dès l'étape 2 (`completeness-baseline.md`, `_shared/state-schema.md` §socle-par-archétype) |
| **Fiche titre** | Fiche Must d'une ligne, sans flow/états/technique | La dérouler (`feature-spec-depth.md`) — le HARD GATE échoue sinon |
| **Action muette** | Action de valeur sans boucle documentée | Dériver les 5 questions (étape 4) ; câbler confirmation + notif contrepartie |
| **Débordement 09** | Schéma SQL / stack / archi dans le volet technique | Remonter au QUOI logique (entités/actions/validations/invariants) ; le COMMENT = 09 |
| **Plateforme horizontale** | 15+ features, plusieurs workflows | Resserrer sur UN workflow cœur ; le reste en Should/Could/Won't |
| **Spec avant scope** | Fiches profondes écrites avant la priorisation | Respecter l'ordre 1→6 : prioriser (3) avant de spécifier en profondeur (5) |
| **Story sans critère** | User story sans Given/When/Then | Non finie : ajouter les critères (`acceptance-criteria.md`) |
| **Doublon ressuscité** | La matrice/le MVP recopiés dans un fichier séparé | Source unique = PRD ; les anciens fichiers restent des **renvois** |
| **Débordement** | Pricing/design/archi dans le PRD | Retirer : hors périmètre étape 7 |
| **Ré-interrogation redondante** | On repose une question tranchée en Phase 1 | Relire les artefacts ; brancher la donnée existante (R1 = exception rare) |
