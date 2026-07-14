# Référence — Priorisation MoSCoW + RICE (étape 3)

Procédure exhaustive pour trancher le **scope** et figer le **MVP**. **Fusion §5 :** depuis la Vague B, la matrice MoSCoW/RICE et la définition du MVP **vivent dans le PRD** (`product/product-spec.md` § Priorisation et § MVP) — plus de fichiers `feature-prioritization.md` / `mvp-definition.md` séparés (ils ne sont conservés qu'en **renvoi** pour compatibilité aval). **Source unique** de la priorité : `product-spec.md` § Priorisation. Tu **appliques** les frameworks du moteur vendoré `startup-design` (`references/frameworks.md`) — tu ne les réinventes pas. **MoSCoW** décide *ce qui entre dans le MVP* ; **RICE** départage *l'ordre* quand il n'est pas évident.

**Pourquoi l'étape 3 (avant les specs) :** la priorisation est **cheap** (test de retrait sur la liste) et les fiches profondes (étape 5) sont **chères** — on ne déploie la profondeur (`feature-spec-depth.md`) que sur les **Must**. Prioriser d'abord, spécifier en profondeur ensuite.

## Sommaire

- Les deux frameworks ne servent pas à la même chose
- Partie A — MoSCoW (décision de scope)
- Partie B — RICE (décision d'ordre)
- Partie C — Figer le MVP (`product-spec.md` § MVP)
- Cohérence inter-fichiers (non négociable)
- Checklist Definition-of-Done (priorisation)
- Modes d'échec (et comment les gérer)

## Les deux frameworks ne servent pas à la même chose

```
  MoSCoW  ─▶  décision de SCOPE      : chaque feature dans UN bucket (Must / Should / Could / Won't)
              → Must = le MVP · Won't = les non-goals explicites
  RICE    ─▶  décision d'ORDRE       : score numérique pour trier, surtout au sein des Must/Should
              → arbitre "quoi d'abord" quand MoSCoW laisse une égalité
```

MoSCoW d'abord (le scope), RICE ensuite (l'ordre). RICE ne **remonte** jamais une feature Won't en Must : le scope est une décision de valeur, pas d'arithmétique.

## Partie A — MoSCoW (décision de scope)

### Sous-procédure
1. Reprends la liste complète des features (étape 2).
2. Passe **chaque** feature au **test de retrait** : *« si je retire cette feature, le problème cœur reste-t-il résolu ? »*
   - **Non** (l'enlever casse le job cœur) → **Must**.
   - **Oui, mais le produit est nettement diminué** → **Should**.
   - **Oui, simple confort** → **Could**.
   - **Hors trajectoire v1 / attente qu'on écarte volontairement** → **Won't have (this time)**.

   **Exception unique : le socle « produit complet » DE L'ARCHÉTYPE** (`completeness-baseline.md` ; modèle 3 axes en source unique `_shared/state-schema.md` §socle-par-archétype) est **Must d'office** — **exempté du test de retrait**. Le socle **dépend de l'archétype** (web-saas **S1-S8** / landing **LP1-LP4** / automation **AU1-AU5**), plus « universel aux 3 types ». On adapte ses éléments à la niche/au type (quels champs, quels défauts, quel canal), on ne débat jamais de leur existence. Justification dans la table : `socle complétude`.
3. Écris la table MoSCoW (`product-spec.md` § Priorisation) : `Feature · Bucket · Justification (rattachement Phase 1)`.
4. Reporte les **Won't** en **Non-goals** du PRD (§ Non-goals de `product-spec.md`).

### Matrice de décision (bucket)

| Le retrait de la feature… | …et l'effort est… | Bucket |
|---|---|---|
| **casse** le workflow cœur | quelconque | **Must** |
| diminue nettement le produit | raisonnable | **Should** |
| diminue nettement le produit | énorme (v1 impossible) | **Could** (ou Won't si vraiment hors portée) |
| ne change rien au job cœur | faible | **Could** |
| ne change rien au job cœur | élevé | **Won't** |
| relève d'une attente qu'on **écarte** exprès | — | **Won't** (→ non-goal nommé) |

### Critères de passage (MoSCoW)
- Chaque feature dans **un seul** bucket.
- Chaque Must **échoue** au test de retrait (aucun Must « confort ») — **hors socle « produit complet » de l'archétype**, Must d'office.
- Le bucket **Won't have** est **non vide** et **nommé** (features précises).
- Chaque ligne porte une **justification rattachée Phase 1**.

### Règles anti-dérive
- **Le MVP ne se négocie pas à la hausse.** Toute envie d'ajouter un Must → repasser le test de retrait. « C'est mieux avec » n'est pas « indispensable ».
- **Won't have = protection active du scope.** Ne pas le laisser vide « parce qu'on verra ». Nommer ce qu'on écarte empêche le scope-creep au build.
- **Un Should n'est pas un Must en attente.** Should = itération *suivante*, pas « Must qu'on n'a pas le temps de faire ».
- **Le socle « produit complet » n'est pas du gonflement.** Un livrable amputé du socle **de son archétype** (web-saas sans onboarding/profil/empty states ; landing sans waitlist/légal ; automation sans runs/logs/boucle fermée) n'est pas « plus petit », il est **inachevé**. À l'inverse, le socle ne crée aucun passe-droit : toute feature **hors socle** repasse le test de retrait normalement.

## Partie B — RICE (décision d'ordre)

Score = **(Reach × Impact × Confidence) ÷ Effort**. On l'applique surtout **au sein des Must et des Should** pour départager l'ordre quand les dépendances (étape 6) ne l'imposent pas déjà.

### Barème (imposé — cohérent avec `frameworks.md`)

| Facteur | Définition | Échelle |
|---|---|---|
| **Reach** | Combien d'utilisateurs/événements touchés par trimestre | nombre estimé (par trimestre) |
| **Impact** | Ampleur de l'effet sur le job cœur | **3** massif · **2** fort · **1** moyen · **0.5** faible · **0.25** minime |
| **Confidence** | Confiance dans les estimations ci-dessus | **100 %** élevée · **80 %** moyenne · **50 %** faible |
| **Effort** | Charge de réalisation | personne-mois (ou personne-semaines, unité **constante**) |

### Sous-procédure
1. Pour chaque feature Must/Should, estime les 4 facteurs (marque les estimations `[Assumption]` — ce ne sont pas des mesures).
2. Calcule le score `(R × I × C) ÷ E`. Garde **une unité d'effort constante** sur toute la table (sinon les scores ne sont pas comparables).
3. Trie par score **décroissant**. C'est l'ordre *par valeur/effort* — à croiser ensuite avec les dépendances (étape 6).

### Critères de passage (RICE)
- Toutes les Must/Should scorées, **même unité d'effort** partout.
- Confidence **honnête** : une estimation posée au doigt mouillé = 50 %, pas 100 %.
- Le tri est un **input** au build order, pas le mot final : les dépendances priment (voir `dependencies-build-order.md`).

### Micro-exemple (niche-agnostique)

| Feature | Reach/trim | Impact | Confidence | Effort (p-mois) | Score |
|---|---|---|---|---|---|
| Génération du livrable | 800 | 3 | 80 % | 2 | `(800×3×0.8)/2 = 960` |
| Historique | 800 | 1 | 100 % | 1 | `(800×1×1)/1 = 800` |
| Modèles réutilisables | 300 | 2 | 50 % | 1.5 | `(300×2×0.5)/1.5 = 200` |

Lecture : *Génération* passe avant *Historique* par la valeur ; mais si *Historique* est un **socle technique** d'une autre feature, le build order (étape 6) peut le remonter malgré son score inférieur. RICE informe, la dépendance tranche.

## Partie C — Figer le MVP (`product-spec.md` § MVP)

Le MVP = **les Must, rien d'autre**. Le plus **petit** produit qui résout **vraiment** le problème cœur. Depuis la fusion §5, l'hypothèse cœur, les features Must, les success criteria et l'out-of-scope sont une **section du PRD** (§ MVP), pas un fichier séparé.

### Sous-procédure
1. **Hypothèse cœur** — le pari central : « si on donne \<capacité\> à \<cible\>, alors \<comportement/valeur attendu\> ». C'est ce que le lancement doit valider.
2. **Features Must** — recopier **uniquement** les Must (aucun Should/Could : les y glisser = gonfler le MVP).
3. **Success criteria** — mesurables : activation, rétention, complétion du workflow cœur, willingness-to-pay. Un critère non mesurable n'en est pas un. (L'activation doit correspondre au **job résolu**, pas à une vanity metric — cohérent avec le bloc 8 AARRR de l'étape 6.)
4. **Out-of-scope** — reprendre le **Won't have** de la matrice. Nommer explicitement protège le focus au build.

### Critères de passage (MVP)
- L'hypothèse cœur est **falsifiable** (on peut dire qu'elle est fausse).
- **Zéro** Should/Could dans les features Must.
- Chaque success criterion est **mesurable** et l'activation = le job cœur.
- Out-of-scope non vide, cohérent avec le Won't have.

## Cohérence inter-fichiers (non négociable)
La priorité d'une feature a **une seule source de vérité** : `product-spec.md` § Priorisation (la matrice y vit désormais — fusion §5). Les fiches `features/NN-*.md` (§ Priorité) doivent la **refléter**, jamais la contredire. Une divergence = red flag à corriger avant la Porte.

## Checklist Definition-of-Done (priorisation)
- [ ] Chaque feature dans **un seul** bucket MoSCoW, justifié Phase 1 (ou `socle complétude`).
- [ ] Tous les Must **échouent** au test de retrait (aucun Must confort) — hors socle « produit complet », Must d'office.
- [ ] Socle « produit complet » **de l'archétype entier en Must** (web-saas S1-S8 / landing LP1-LP4 / automation AU1-AU5), chaque élément adapté à la niche/au type ; aucun élément d'un autre archétype injecté (`completeness-baseline.md`).
- [ ] Won't have **non vide et nommé** → reporté en Non-goals du PRD.
- [ ] RICE : Must/Should scorées, **unité d'effort constante**, Confidence honnête.
- [ ] Build order alimenté par RICE **et** dépendances (étape 6), pas par RICE seul.
- [ ] MVP = **Must uniquement** ; hypothèse cœur falsifiable ; success criteria mesurables.
- [ ] Out-of-scope = Won't have, cohérent.
- [ ] Priorités **identiques** entre le PRD § Priorisation (source unique) et les fiches feature.
- [ ] Estimations RICE marquées `[Assumption]`.

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **MVP gonflé** | Des Should/Could dans les Must | Repasser le test de retrait ; ne garder que l'indispensable au job cœur |
| **Won't vide** | « on verra plus tard » sans rien nommer | Lister les attentes plausibles écartées ; les reporter en non-goals |
| **RICE incomparable** | Efforts en unités mixtes (mois **et** jours) | Une **seule** unité d'effort sur toute la table |
| **Confidence gonflée** | Tout à 100 % | Rabaisser les estimations au doigt mouillé à 50-80 % |
| **RICE écrase la dépendance** | Une feature socle reléguée car score faible | Le build order remonte le socle : dépendance > score (étape 6) |
| **Bucket-shopping** | Une feature « négociée » de Won't vers Must | Le scope se décide au test de retrait, pas à l'envie |
| **Socle débattu** | Un élément du socle de l'archétype (onboarding, profil, empty states ; waitlist/légal ; runs/boucle fermée…) dégradé en Should après test de retrait | Le socle **de l'archétype** est **exempté** : Must d'office (`completeness-baseline.md`) — on adapte à la niche/au type, on ne débat pas |
| **Socle du mauvais archétype** | Éléments d'un autre archétype priorisés (dashboard sur `automation`, onboarding sur `landing`) | Prioriser le socle **de l'archétype** du livrable, pas d'un autre — cf. `completeness-baseline.md` + `state-schema.md` §socle-par-archétype |
| **Divergence de priorité** | Fiche dit Must, PRD dit Should | Source unique = PRD § Priorisation ; aligner les fiches |
| **Activation vanity** | Success criterion = « nombre d'inscrits » | Remplacer par le job cœur accompli (ex. « premier livrable exporté ») |
