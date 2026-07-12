# Référence — Procédure PRD (chef d'orchestre des 6 étapes)

Procédure exhaustive de l'étape 7. Tu **exécutes** le moteur vendoré `startup-design` (Phase 6 « Product », `references/frameworks.md`) et tu **rediriges ses sorties** vers nos chemins `product/`. Ta surcouche PM = la structure PRD complète + les user stories détaillées + les critères d'acceptation. Ce fichier couvre en profondeur les **étapes 1→3** (contexte, features, specs) et **route** les étapes 4→6 vers leurs références dédiées.

## Le principe qui gouverne tout : traduire, pas réinventer
La Phase 1 a **déjà tranché** le besoin (problème, cible, edge, écosystème). Le PM ne rouvre pas ces décisions : il les **traduit** en features, specs, priorités, stories testables. Toute feature, toute story, tout critère se **rattache** à un élément de `research/`. Une sortie sans rattachement = un élément inventé = red flag. **Jamais de page blanche.**

## Data-flow : d'où vient le PRD, où il va

```
        PHASE 1 (déjà validé — research/)                      ÉTAPE 7 (product/)                    AVAL
  ┌──────────────────────────────────┐
  │ idea-brief.md                    │─┐   ┌──────────────────────────────────────┐
  │  · besoin, type, écosystème      │ │   │ 1. Contexte & workflow cœur          │──▶ product-spec.md
  │  · intégrations attendues        │ ├──▶│ 2. Liste features (complète)         │      (§ Contexte, Scope)
  │  · non-goals initiaux            │ │   │ 3. Fiche spec / feature Must-Should  │──▶ features/NN-*.md
  ├──────────────────────────────────┤ │   ├──────────────────────────────────────┤
  │ opportunity-brief.md             │ │   │ 4. Priorisation MoSCoW + RICE        │──▶ feature-prioritization.md
  │  · marché, edge, risques         │ ├──▶│    (→ references/prioritization.md)  │──▶ mvp-definition.md
  │  · manques concurrents           │ │   ├──────────────────────────────────────┤
  ├──────────────────────────────────┤ │   │ 5. User stories + critères accept.   │──▶ user-stories.md
  │ positioning.md  · angle          │─┤   │    (→ references/acceptance-criteria)│
  ├──────────────────────────────────┤ │   ├──────────────────────────────────────┤
  │ demand-signals.md                │─┘   │ 6. Dépendances → build order         │──▶ product-spec.md (§ build)
  │  · features réclamées, manques   │     │    (→ references/dependencies-...)   │      ▼
  └──────────────────────────────────┘     └──────────────────────────────────────┘   ÉTAPE 8 (design)
                                                                                       + PHASE 3 (build)
```

**Règle de traçabilité :** chaque feature de la liste porte, dans la colonne « Rattachement Phase 1 », **sa source** (`← workflow cœur`, `← demand-signals`, `← manque concurrent`, `← socle complétude`). Une feature sans source = feature inventée → couper ou passer en Won't. Le rattachement `socle complétude` est réservé aux éléments du socle « produit complet » (`completeness-baseline.md`) — injectés d'office, jamais orphelins.

## Ordre canonique (ne pas dévier)

```
1 Contexte ─▶ 2 Features ─▶ 3 Specs ─▶ 4 Priorisation ─▶ 5 Stories ─▶ 6 Dépendances
 (le socle)   (le quoi)    (le détail) (le scope: MVP)   (le testable) (l'ordre de build)
```

Pourquoi cet ordre : on ne **spécifie** (3) que ce qu'on a **listé** (2), qui découle du **contexte** (1) ; on ne **priorise** (4) que ce qui est spécifié ; les **stories** (5) ne portent que sur les Must/Should retenus ; le **build order** (6) suppose les dépendances des specs figées. Hors ordre → PRD incohérent (mode d'échec « spec avant scope »).

---

## Étape 1 — Reprendre le besoin + le contexte

**But :** poser en tête du PRD le socle auquel **tout** se rattachera. Repris de la Phase 1, **jamais** réinventé.

**Sous-procédure :**
1. Lis les 4 artefacts d'entrée (`idea-brief`, `opportunity-brief`, `positioning`, `demand-signals`).
2. Extrais et synthétise, en une phrase chacun : **problème** (← opportunity-brief), **cible / persona précis** (← idea-brief + opportunity-brief), **edge ou absence assumée** (← positioning), **intégrations / écosystème** (← idea-brief).
3. Écris le **workflow cœur** de bout en bout : le parcours que le MVP doit rendre fluide, étape par étape (de l'entrée de l'utilisateur au livrable qu'il obtient).
4. Nomme l'**aha moment** — la première action où l'utilisateur obtient la valeur promise (jamais le signup) — et le **chemin le plus court** pour y arriver (`signup → onboarding → … → aha`, étapes comptées, cible ≤ 5). → `completeness-baseline.md` (§ Aha moment).

**Critère de passage :** le problème est formulé **du point de vue de la cible** (« je perds 2 h à recopier X » ✓, pas « manque d'automatisation » ✗) ; le workflow cœur tient en **un** parcours nommé (pas trois workflows concurrents) ; l'aha moment est une action de valeur **observable** (« s'inscrire » ✗) et son chemin est chiffré.

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
   - (d) **Socle « produit complet »** (`completeness-baseline.md`) — injecté **d'office** pour tout SaaS public : onboarding wizard 2-4 écrans qui crée l'entité cœur avec défauts intelligents, profil/settings complet (dont suppression de compte), empty states pédagogiques, emails transactionnels brandés, pages légales FR, 404 brandée, seed data marquée et supprimable. Rattachement = `socle complétude`.
2. Fusionne, **dédoublonne**, nomme chaque feature du point de vue de la valeur (pas de l'implémentation).
3. Remplis la table de `product-spec.md` (§ Liste des features) : `#`, `Feature`, `Priorité (provisoire)`, `Rattachement Phase 1`.

**Critère de passage :** chaque ligne a **une source rattachée** ; la liste couvre **tout** le workflow cœur (aucune étape du parcours sans feature) ; aucune feature n'existe **sans** rattachement.

**Décision (calibrage de l'ampleur) :**

| Condition | Action |
|---|---|
| Le workflow cœur tient en **1 seule** feature | Suspect « mono-feature » : est-ce un vrai produit ou un bouton ? Chercher les features **de support** (compte, export, historique) qui rendent le job répétable |
| La liste dépasse ~12 features pour un MVP | Suspect « plateforme » : la plupart passeront en Should/Could/Won't à l'étape 4. Ne pas couper maintenant, mais signaler |
| Une feature n'adresse **aucun** élément Phase 1 | Feature orpheline → ne pas la lister comme candidate sérieuse ; la noter « idée hors-scope » |
| Un élément du socle « produit complet » semble orphelin (personne ne l'a « réclamé ») | Il ne l'est **pas** : rattachement `socle complétude` (`completeness-baseline.md`) — Must d'office, à **adapter** à la niche, pas à débattre |
| Deux features se recouvrent | Fusionner en une, ou tracer la frontière nette (le « N'inclut pas » de chaque fiche) |
| Une « feature » est en fait un critère d'acceptation ou un détail d'implémentation | La ranger sous sa feature parente ; ce n'est pas une feature |

**Micro-exemple (niche-agnostique).** Produit = générateur de X pour la cible C.
- (a) Workflow cœur → *saisie de l'entrée*, *génération*, *édition du résultat*, *export*. → 4 features.
- (b) `demand-signals` réclame *historique des générations*, *modèles réutilisables*. → 2 features.
- (c) Manque concurrent = *pas d'export au format Y*. → renforce la feature *export* (format Y prioritaire), pas une feature de plus.
- (d) Socle « produit complet » → *onboarding wizard (crée la première configuration avec défauts intelligents)*, *profil/settings*, *empty states*, *emails brandés*, *légal FR + 404*, *seed data*. → injectés d'office, rattachement `socle complétude`.

---

## Étape 3 — Décliner chaque feature en spec

**But :** transformer chaque feature **Must/Should** en fiche exploitable par le build (`product/features/NN-<slug>.md`, template `feature.md`). Le « N'inclut pas » borne la feature aussi fort que le comportement la définit.

**Sous-procédure (par feature Must/Should) :**
1. **Priorité** — reprendre le bucket MoSCoW (doit **matcher** `feature-prioritization.md`, zéro divergence).
2. **Description** — 2-3 lignes : ce que la feature fait + le problème qu'elle règle (rattaché Phase 1).
3. **Pour qui** — le persona qui l'utilise, cohérent avec la cible.
4. **Comportement attendu** — le nominal, **étape par étape**, testable : « quand l'utilisateur fait X, alors Y ».
5. **Cas limites** — piocher dans le catalogue (`acceptance-criteria.md`) : erreurs, entrées vides, limites de volume, accès concurrent, permissions.
6. **N'inclut pas** — la frontière : ce qui *pourrait sembler* inclus mais ne l'est pas en v1.
7. **Dépendances** — features/briques qui doivent exister **avant** (alimente l'étape 6).

**Critère de passage (par fiche) :** comportement nominal **testable** (on peut écrire un Given/When/Then dessus) ; au moins un cas limite nommé ; au moins une exclusion nommée ; priorité cohérente avec la matrice.

**Décision :**

| Condition | Action |
|---|---|
| Feature **Could / Won't** | **Pas** de fiche détaillée : une ligne dans la liste suffit. Les fiches ne concernent que Must/Should |
| Comportement décrit en termes d'implémentation (« appelle l'endpoint /gen ») | Le reformuler en comportement **observable** par l'utilisateur ; le comment = Phase 3 |
| Aucun cas limite trouvé | Suspect : passer le catalogue `acceptance-criteria.md` (vide, volume, concurrence, permission, panne) — il y en a toujours |
| Le « N'inclut pas » est vide | Forcer au moins une exclusion : sans frontière, la feature gonfle en silence au build |
| La fiche déborde en pricing / design / archi | Retirer : ça appartient aux étapes 6 / 8 / 9 |

Numérotation `NN` = ordre de la liste (§2), **pas** l'ordre de build (qui vient à l'étape 6). Slug court et parlant.

---

## Étape 4 — Prioriser (MoSCoW + RICE) → `references/prioritization.md`
MoSCoW pour trancher le scope (Must = MVP, Won't = non-goals explicites), RICE pour départager l'ordre. Produit `feature-prioritization.md` + `mvp-definition.md`. **Procédure complète, matrices de scoring et modes d'échec :** voir `references/prioritization.md`.

## Étape 5 — User stories + critères d'acceptation → `references/acceptance-criteria.md`
Une story par feature Must/Should (« En tant que… je veux… afin de… ») + critères testables Given/When/Then couvrant nominal **et** cas limites. C'est ce qui rend le PRD **exécutable**. Produit `user-stories.md`. **Recettes de rédaction, catalogue de cas limites, format imposé :** voir `references/acceptance-criteria.md`.

## Étape 6 — Dépendances + build order → `references/dependencies-build-order.md`
Mappe les dépendances entre features (DAG), en déduit l'**ordre de construction** qui alimente la Phase 3. Écrit dans `product-spec.md` (§ Dépendances & build order) + `feature-prioritization.md` (§ Build order). **Détection de cycles, tri topologique, arbitrage RICE vs dépendances :** voir `references/dependencies-build-order.md`.

---

## Checklist Definition-of-Done (PRD complet — les 5 artefacts)

`product-spec.md`
- [ ] Contexte : problème (point de vue cible), persona précis, edge (ou absence assumée), intégrations — **tous repris de Phase 1**.
- [ ] Un **seul** workflow cœur décrit de bout en bout.
- [ ] **Aha moment** nommé (action de valeur observable) + chemin le plus court chiffré (≤ 5 étapes).
- [ ] Liste des features **complète**, chaque ligne avec **rattachement Phase 1** (ou `socle complétude`).
- [ ] Socle « produit complet » présent en **Must**, chaque élément **adapté à la niche** (`completeness-baseline.md`).
- [ ] Priorisation MoSCoW résumée (détail → `feature-prioritization.md`).
- [ ] User stories résumées (détail → `user-stories.md`).
- [ ] Dépendances & build order présents.
- [ ] Non-goals nommés explicitement (reprend le Won't have + non-goals `idea-brief`).

`features/NN-*.md` (une par Must/Should)
- [ ] Priorité **cohérente** avec `feature-prioritization.md`.
- [ ] Comportement nominal **testable** + ≥1 cas limite + ≥1 exclusion.
- [ ] Dépendances listées.

`feature-prioritization.md` · `mvp-definition.md` · `user-stories.md`
- [ ] Voir les DoD dédiées dans `prioritization.md` et `acceptance-criteria.md`.

Transverse
- [ ] **Zéro** feature orpheline (toutes rattachées Phase 1).
- [ ] MVP = **le plus petit** qui résout vraiment le problème cœur.
- [ ] Cohérence inter-fichiers : mêmes noms de features, mêmes priorités partout.
- [ ] Aucun débordement (pas de pricing, design, archi, ni détail d'implémentation).
- [ ] Aucun secret / clé dans les fichiers.

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Page blanche** | Features inventées sans lien Phase 1 | Repartir des 4 artefacts ; chaque feature porte une source ou saute |
| **Feature orpheline** | Une feature n'adresse aucun élément Phase 1 | Couper, ou passer en Won't (documenté comme non-goal) |
| **MVP gonflé** | Des Should/Could glissés dans les Must | Reboucler l'étape 4 : Must = strictement indispensable au job cœur |
| **Mono-feature** | Un seul bouton présenté comme produit | Ajouter les features de support qui rendent le job **répétable** (compte, historique, export) |
| **Squelette de features** | Features cœur correctes mais produit creux (pas d'onboarding, de profil, d'empty states) | Injecter le socle « produit complet » en Must dès l'étape 2 (`completeness-baseline.md`) — la complétude est une exigence de spec, pas un polish |
| **Plateforme horizontale** | 15+ features, plusieurs workflows | Resserrer sur UN workflow cœur ; le reste en Should/Could/Won't |
| **Spec avant scope** | Fiches détaillées écrites avant la priorisation | Respecter l'ordre 1→6 : lister/prioriser avant de spécifier en détail |
| **Story sans critère** | User story sans Given/When/Then | Non finie : ajouter les critères testables (`acceptance-criteria.md`) |
| **Divergence inter-fichiers** | Priorité d'une feature différente entre fiche et matrice | Une seule source de vérité pour la priorité : `feature-prioritization.md` |
| **Débordement** | Pricing/design/archi/implémentation dans le PRD | Retirer : hors périmètre étape 7 |
| **Ré-interrogation redondante** | On repose à l'utilisateur une question tranchée en Phase 1 | Relire les artefacts ; brancher la donnée existante (R1 = exception rare) |
