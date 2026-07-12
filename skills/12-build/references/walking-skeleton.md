# Référence — Walking skeleton (la tranche verticale d'abord)

Avant **tout** fan-out, on fait tourner une tranche verticale mince de bout en bout. C'est l'étape 2 de la procédure du skill. Objectif : un **squelette qui tourne tôt**, sur lequel les features se greffent — pas construire en largeur avant que rien ne marche (`_shared/lessons.md` : anti-pattern « tout en largeur »).

## Ce qu'est (et n'est pas) un walking skeleton
- **C'est** : le chemin cœur, vertical, minimal, **exécutable de bout en bout** à travers tout le châssis : `auth → une action cœur → persistance → affichage`.
- **Ce n'est pas** : une feature complète, jolie, ou couvrant les cas limites. C'est le **plus court chemin** qui prouve que la stack est câblée et tourne.

```
   [ UI mince ]──►[ route/API ]──►[ logique cœur ]──►[ BDD ]──►[ retour UI ]
        auth ✔        1 action ✔        minimal ✔      persist ✔   affiche ✔
   └──────────────── une seule tranche verticale, qui TOURNE ────────────────┘
```

## Procédure (séquentielle, PAS de parallélisme ici)
0. **Gestes de fondation** (avant de câbler quoi que ce soit, écrivain unique) : applique la **charte** (`app/globals.css` + `tailwind.config` depuis `DESIGN.md`) **et** brande l'**identité** — renseigne `lib/brand.ts` (`name`, `tagline`, `description`) depuis `research/positioning.md` + `product/pricing.md`. C'est ici, une seule fois, que le produit cesse d'être générique : le `<title>`, le wordmark d'auth et la sidebar consomment `lib/brand.ts`. Le défaut `"SaaS Factory Template"` doit avoir **disparu** du repo avant le fan-out.
1. Lis `tech/execution-plan.md` §3 (walking skeleton identifié) + §5 (Lane A séquentielle).
2. Identifie **l'action cœur** unique du produit (le verbe central du PRD) et le plus court chemin qui la traverse.
3. Câble le châssis de bout en bout pour **cette seule action** : auth minimal → route → logique minimale → persistance → affichage.
4. **TDD** même ici : un test d'intégration « le chemin cœur tourne » d'abord (rouge), puis le câblage (vert).
5. **Merge sur `main`** avant d'ouvrir le moindre worktree de feature.
6. Seulement alors : lance le fan-out (`fan-out.md`).

## Definition-of-Done du skeleton
- [ ] **Charte appliquée** (`app/globals.css` ≠ défaut châssis) **et identité brandée** (`lib/brand.ts` ≠ défaut ; `grep "SaaS Factory Template"` = 0) — gestes de fondation faits.
- [ ] L'action cœur s'exécute **de bout en bout** (UI → BDD → UI), pas en mock.
- [ ] Auth minimal en place (un user peut atteindre l'action).
- [ ] Persistance réelle (une donnée écrite est relue).
- [ ] Au moins **un test d'intégration vert** qui traverse toute la tranche.
- [ ] Déployable / lançable en local sans étape manuelle cachée.
- [ ] Mergé sur `main` — les worktrees de feature partiront de **cette** base.

## Matrice de décision
| Condition | Action |
|---|---|
| Le plan ne nomme pas clairement l'action cœur | Reviens au PRD (étape 7) : le workflow cœur = la tranche. Ne devine pas large |
| La tranche « verticale » grossit (plusieurs actions) | Coupe : **une** action cœur. Le reste = features en fan-out |
| Tentation de paralléliser avant que le skeleton soit vert | STOP : 0 fan-out tant que le skeleton n'est pas mergé sur main |
| Une brique du châssis (BDD, auth) n'est pas provisionnée | Repli honnête (`safety-rails` §6) : remonte, ne mock pas la persistance pour « faire semblant » |
| Le skeleton révèle une faille d'archi (étape 9) | Loge-la, remonte au CTO avant le fan-out — c'est le bon moment (coût de correction minimal) |

## Forcing-question — « ce skeleton est-il vraiment vertical ? »
- **Ask exact** : *« Une donnée saisie côté UI traverse-t-elle réellement route → logique → BDD → et revient-elle à l'écran, prouvée par un test qui s'exécute ? »*
- **Push-until** : validé quand le test d'intégration traverse **toute** la pile, avec persistance **réelle**.
- **Red-flags** :
  - persistance mockée (« ça marchera avec la vraie BDD »),
  - « le front est fait, le back suivra » (horizontal, pas vertical),
  - aucun test d'intégration (juste des unitaires isolés),
  - plusieurs actions cœur empaquetées (c'est déjà des features).
- **MOU vs FORT** :
  - MOU : *« Le squelette est prêt, l'appli démarre. »*
  - FORT : *« Créer + lister un item : saisie UI → POST → insert Postgres → GET → rendu. Test e2e vert, mergé sur main. Prêt pour fan-out. »*

## Modes d'échec
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Skeleton horizontal** | On a « fait tout le front » mais rien ne persiste | Repars vertical : une action, toute la pile |
| **Fan-out prématuré** | Worktrees ouverts avant skeleton mergé | Séquence stricte : skeleton → merge → fan-out |
| **Persistance simulée** | Mock au lieu de vraie BDD | Le skeleton doit prouver la vraie pile, sinon il ne prouve rien |
| **Skeleton obèse** | Il embarque des cas limites/plusieurs features | Réduis à l'os : le reste part en lanes |
