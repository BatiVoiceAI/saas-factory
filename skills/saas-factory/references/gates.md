# Gestion des portes — ce que chaque 🚪 décide + le retour arrière

Une **porte = une décision de l'utilisateur, en clair + preuve**. Jamais faire lire un artefact technique : la phase qui porte la porte présente un résumé business + un verdict honnête, puis `AskUserQuestion`. Le master **enregistre** la décision dans `.saas-factory/state.md` (table « Portes franchies ») et **route** en conséquence. **On ne franchit jamais une porte sans décision explicite.**

## Les 5 portes (P3 n'en a aucune)

| Porte | Portée par | Décide | Options → suite |
|---|---|---|---|
| **Opportunité** | `05-opportunity` (P1) | l'idée vaut-elle qu'on la construise ? | **Go** → P2 · **Ajuster** → reboucle étape faible de P1 · **No-Go** → post-mortem 5 lignes + stop |
| **PRD + Charte** | `07-product-spec` + `08-design-system` (P2) | le QUOI (produit + design) est-il le bon ? | **validé** → P3 · **à revoir** → reboucle 06-08 |
| — *(Phase 3)* | — | **aucune porte** — 100% autonome, décisions loguées | → P4 direct |
| **Client-review** | `15-client-review` (P4) | le produit construit est-il bon à lancer ? | **Ship** → P5 · **Itérer** → reboucle build (budget) · **Stop** → arrêt |
| **Déploiement** | `17-deploy` (P5) | plan-then-apply : publie-t-on réellement ? | **OK** → publie + P6 · **non** → on ne publie pas |
| **Kill / Continue** | `19-retro` (P6) | on poursuit ou on tue la piste ? | **continue** → itère (retour P4/P5) · **kill** → post-mortem + archive |

Les portes **réellement actives selon le `type`** (ex. porte Déploiement absente en perso sur preview URL à coût nul, conditionnelle en interne) : liste réelle dans `references/routing.md` §Portes actives par type — cette table décrit le cas complet (public).

## Protocole de porte (identique partout)
1. La phase experte présente : **résumé business** (1-2 pages non-tech pour les grosses portes) + **verdict honnête** (anti-flagornerie — pas de « tout est parfait »).
2. `AskUserQuestion` avec les options réelles de cette porte.
3. Le master **inscrit** la décision (porte, décision, date) dans l'état, **résume en 2 lignes**, puis route.
4. Aucune anticipation : tant que la réponse n'est pas donnée, on **n'avance pas**.

## Retours arrière — le graphe autorisé
Une porte peut **renvoyer à une phase antérieure**. Le master gère la boucle et la re-mise à jour d'état :

- **Ajuster (P1)** → reboucle sur l'**étape faible** de P1 (le routage précis est dans `05-opportunity`), pas tout P1.
- **À revoir (P2)** → reboucle 06-08 selon ce qui coince (business model, PRD, ou charte).
- **Itérer (P4, étape 15)** → repart dans le build (12→14), **borné par le budget d'itération** (`_shared/validation-cascade.md` / champ « Budget d'itération » de l'état). Budget épuisé → présenter l'état, proposer « ship en l'état » vs « continuer », laisser trancher.
- **Continue (P6, étape 19)** → itération produit : **retour Phase 4** (nouvelles features) ou **Phase 5** (re-deploy), selon la piste retenue à l'étape 18.
- **No-Go / Stop / Kill** → pas un retour : **arrêt propre** (post-mortem écrit) + archive. La mémoire (P6) capitalise même sur un kill.

## Discipline anti-boucle-infinie
Toute boucle (cascade de build, revue client, itérations post-lancement) a un **budget d'itérations** écrit dans l'état et un **critère de sortie** (cf. `_shared/safety-rails.md` §7). À l'épuisement : on ne relance pas en silence — on **rend la main à l'utilisateur** avec l'option ship-en-l'état.

## Ce que le master ne transforme jamais en porte
- Les décisions **techniques** (stack, archi, provisioning) : tranchées en autonomie, **loguées**, jamais soumises (Phase 3).
- Les validations **agent-à-agent** (cascade Tech Lead→CTO→Designer→CEO, faux-client) : internes à P4, invisibles pour l'utilisateur jusqu'à l'étape 15.
