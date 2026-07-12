# Référence — Priorisation MoSCoW + RICE (étape 4)

Procédure exhaustive pour trancher le **scope** (`product/feature-prioritization.md`) et figer le **MVP** (`product/mvp-definition.md`). Tu **appliques** les frameworks du moteur vendoré `startup-design` (`references/frameworks.md`) — tu ne les réinventes pas. **MoSCoW** décide *ce qui entre dans le MVP* ; **RICE** départage *l'ordre* quand il n'est pas évident.

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

   **Exception unique : le socle « produit complet »** (`completeness-baseline.md`) est **Must d'office** pour tout SaaS public — **exempté du test de retrait**. On adapte ses éléments à la niche (quels champs, quels défauts intelligents), on ne débat jamais de leur existence. Justification dans la table : `socle complétude`.
3. Écris la table MoSCoW (`feature-prioritization.md`) : `Feature · Bucket · Justification (rattachement Phase 1)`.
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
- Chaque Must **échoue** au test de retrait (aucun Must « confort ») — **hors socle « produit complet »**, Must d'office.
- Le bucket **Won't have** est **non vide** et **nommé** (features précises).
- Chaque ligne porte une **justification rattachée Phase 1**.

### Règles anti-dérive
- **Le MVP ne se négocie pas à la hausse.** Toute envie d'ajouter un Must → repasser le test de retrait. « C'est mieux avec » n'est pas « indispensable ».
- **Won't have = protection active du scope.** Ne pas le laisser vide « parce qu'on verra ». Nommer ce qu'on écarte empêche le scope-creep au build.
- **Un Should n'est pas un Must en attente.** Should = itération *suivante*, pas « Must qu'on n'a pas le temps de faire ».
- **Le socle « produit complet » n'est pas du gonflement.** Un MVP sans onboarding, profil ou empty states n'est pas « plus petit », il est **inachevé**. À l'inverse, le socle ne crée aucun passe-droit : toute feature **hors socle** repasse le test de retrait normalement.

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

## Partie C — Figer le MVP (`mvp-definition.md`)

Le MVP = **les Must, rien d'autre**. Le plus **petit** produit qui résout **vraiment** le problème cœur.

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
La priorité d'une feature a **une seule source de vérité** : `feature-prioritization.md`. Les fiches `features/NN-*.md` (§ Priorité) et le § Priorisation de `product-spec.md` doivent la **refléter**, jamais la contredire. Une divergence = red flag à corriger avant la Porte.

## Checklist Definition-of-Done (priorisation)
- [ ] Chaque feature dans **un seul** bucket MoSCoW, justifié Phase 1 (ou `socle complétude`).
- [ ] Tous les Must **échouent** au test de retrait (aucun Must confort) — hors socle « produit complet », Must d'office.
- [ ] Socle « produit complet » **entier en Must**, chaque élément adapté à la niche (`completeness-baseline.md`).
- [ ] Won't have **non vide et nommé** → reporté en Non-goals du PRD.
- [ ] RICE : Must/Should scorées, **unité d'effort constante**, Confidence honnête.
- [ ] Build order alimenté par RICE **et** dépendances (étape 6), pas par RICE seul.
- [ ] MVP = **Must uniquement** ; hypothèse cœur falsifiable ; success criteria mesurables.
- [ ] Out-of-scope = Won't have, cohérent.
- [ ] Priorités **identiques** entre matrice, fiches feature et product-spec.
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
| **Socle débattu** | Un élément du socle (onboarding, profil, empty states…) dégradé en Should après test de retrait | Le socle est **exempté** : Must d'office (`completeness-baseline.md`) — on adapte à la niche, on ne débat pas |
| **Divergence de priorité** | Fiche dit Must, matrice dit Should | Source unique = matrice ; aligner fiches + product-spec |
| **Activation vanity** | Success criterion = « nombre d'inscrits » | Remplacer par le job cœur accompli (ex. « premier livrable exporté ») |
