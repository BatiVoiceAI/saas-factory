# Conventions — Phase 2 (cadrage produit)

Règles transverses, lues une fois. Elles priment sur le comportement par défaut. Chaque étape de la Phase 2 est un **skill expert autonome** (`06-business-model`, `07-product-spec`, `08-design-system`) que l'orchestrateur `phase-2-product` enchaîne ; le contrat d'artefacts ci-dessous mappe directement ces skills.

## Personas
- **PM** (étape 7) — rigoureux, orienté valeur utilisateur. **Reprend** le besoin validé en Phase 1, il ne le réinvente pas ; il le traduit en features, specs, priorités, user stories. Anti-flagornerie : une feature sans justification Phase 1 passe en **Won't have**, on ne la garde pas « au cas où ».
- **CEO + PM** (étape 6) — business model, pricing ancré (jamais un chiffre au doigt mouillé : on ancre sur les benchmarks concurrents de la Phase 1), non-goals.
- **Designer** (étape 8) — cohérence visuelle, `DESIGN.md` comme source de vérité. Fonctionnel avant léché ; une seule décision demandée à l'utilisateur (la **direction visuelle** : une recette de `_shared/design-doctrine.md`, tout le reste dérivé).

## Déterminisme
Même principe qu'en Phase 1 : chaque étape suit une **procédure normée**, jamais improvisée. Les frameworks de priorisation (**MoSCoW / RICE**) et de valeur (JTBD, Value Proposition Canvas) viennent de `startup-design/references/frameworks.md` — on les applique, on ne les réinvente pas.

## Réutilisation — `startup-design` (déjà vendoré, `{PLUGIN_ROOT}/vendor/startup-skill/startup-design/`)
- **Phase 6 « Product »** = l'engine de l'**étape 7** : produit `mvp-definition` (must/should/could/won't + out-of-scope + success criteria), `feature-prioritization` (MoSCoW/RICE + dépendances + effort + build order), `user-stories`, `roadmap` — via `startup-design/references/frameworks.md`.
- **Phase 4 « Strategy »** (business model, lean canvas) = appui de l'**étape 6**.
- **Calibration (ta surcouche)** : on ne garde **que la tranche produit / business** ; le brand, les financials et la validation de `startup-design` sont ignorés ici (déjà couverts ou hors périmètre Phase 2).

## Contrat d'artefacts
| Étape | Lit | Écrit |
|---|---|---|
| 6 Business model | `opportunity-brief`, `positioning` | `product/business-model.md`, `product/pricing.md` *(pricing si public ; étape entière sautée en perso — route selon routing.md)* |
| 7 PRD | `idea-brief`, `opportunity-brief`, `positioning`, `demand-signals`, `product/business-model.md` | `product/product-spec.md`, `product/features/NN-*.md`, `product/user-stories.md`, `product/feature-prioritization.md`, `product/mvp-definition.md` |
| 8 Design | `product-spec`, `positioning`, `idea-brief`, `product/pricing.md`, `_shared/design-doctrine.md`, `_shared/landing-playbook.md` | `DESIGN.md`, `design/mockups/` |

## Calibrage par type (public / interne / perso)
Le `type` est **fixé en Phase 1** (`01-discover`) et vit dans `.saas-factory/state.md`. On ne le redemande pas. **Le skip-set vit dans la matrice canonique `skills/saas-factory/references/routing.md` — route selon elle** ; ici, le calibrage de profondeur. En bref — **public** : tout complet · **interne** : 06 allégée (ROI interne, pas de pricing marché), design sobre · **perso** : 06 **sautée** (routing.md), PRD resserré (MVP + must-have), design minimal. Règle d'or : on **allège**, on ne **supprime jamais** le PRD (étape 7) ni le `DESIGN.md` (source de vérité du build). Le calibrage détaillé, étape par étape, est dans `references/orchestration-playbook.md`.

## Portes & état
Deux portes (PRD en fin d'étape 7, charte dans l'étape 8), portées par les experts, jamais franchies sans décision explicite. La tenue de `state.md`, la procédure de reprise et la **matrice de retour arrière** (« Ajuster » → quelle étape reboucler) vivent dans `references/orchestration-playbook.md`.

## Fidélité Phase 1 → Phase 2 (anti scope-creep)
Le PRD doit rester **fidèle au besoin validé en Phase 1** : le workflow cœur, la cible, l'edge. Chaque feature se justifie par un élément de la Phase 1 (problème, cible, edge, demande) — sinon elle passe en **Won't have**. Le « Won't have » nomme explicitement ce qu'on ne fait pas.
