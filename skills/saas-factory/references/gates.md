# Gestion des portes — ce que chaque 🚪 décide + le retour arrière

Une **porte = une décision de l'utilisateur, en clair + preuve**. Jamais faire lire un artefact technique : la phase qui porte la porte présente un résumé business + un verdict honnête, puis `AskUserQuestion`. Le master **enregistre** la décision dans `.saas-factory/state.md` (table « Portes franchies ») et **route** en conséquence. **On ne franchit jamais une porte sans décision explicite.**

## Les 5 portes (P3 n'en a aucune)

| Porte | Portée par | Décide | Options → suite |
|---|---|---|---|
| **Opportunité** | `05-opportunity` (P1) | l'idée vaut-elle qu'on la construise ? | **Go** → P2 · **Ajuster** → reboucle étape faible de P1 · **Go-test** *(public)* → ship une landing+waitlist à seuil pré-enregistré avant de builder ; seuil atteint → Go, sinon → Ajuster/No-Go · **No-Go** → post-mortem 5 lignes + stop |
| **PRD + Charte** | `07-product-spec` + `08-design-system` (P2) | le QUOI (produit + design) est-il le bon ? | **validé** → P3 · **à revoir** → reboucle 06-08 |
| — *(Phase 3)* | — | **aucune porte** — 100% autonome, décisions loguées | → P4 direct |
| **Client-review** | `15-client-review` (P4) | le produit construit est-il bon à lancer ? | **Ship** → P5 · **Itérer** → reboucle build (budget) · **Stop** → arrêt |
| **Déploiement** | `17-deploy` (P5) | plan-then-apply : publie-t-on réellement ? | **OK** → publie + canary → **17b** · **non** → on ne publie pas |
| **Kill / Continue** | `19-retro` (P6) | on poursuit ou on tue la piste ? | **continue** → itère (retour P4/P5) · **kill** → post-mortem + archive |

Les portes **réellement actives selon le `type`** (ex. porte Déploiement absente en perso sur preview URL à coût nul, conditionnelle en interne) : liste réelle dans `references/routing.md` §Portes actives par type — cette table décrit le cas complet (public).

## Le contrôle BLOQUANT de fin de Phase 5 — 17b (recette live authentifiée)
En plus des 5 portes utilisateur, la Phase 5 porte un **contrôle bloquant qui n'est PAS une porte utilisateur** : la **recette live AUTHENTIFIÉE (`17b`)**. Dès qu'il y a **auth + RLS**, après le **canary vert** de 17, on **franchit vraiment l'auth** sur la **PROD réelle** (OTP complété via boîte sandbox **ou** session forgée par l'Admin API) et on joue **CHAQUE action RLS-protégée de CHAQUE rôle** avec preuve (**2xx** + **ligne au bon tenant** + **notif `sent`** + **refus cross-tenant prouvé**). Il ne se **franchit pas** par décision utilisateur — il se **prouve** : **vert (`recette_live: PASS`) obligatoire avant de déclarer « livré »** ; rouge → **fix → redeploy → re-test**, jamais de sortie de Phase 5. Un canary vert **ne suffit pas**. Détail exécutable : `skills/17-deploy/references/live-qa.md` + `agents/live-qa.md` ; cadre : `skills/phase-5-launch/SKILL.md` + règle d'or 19 (`_shared/lessons.md`). Routage par archétype × type × tenancy : `references/routing.md`.

## Protocole de porte (identique partout)
1. La phase experte présente : **résumé business** (1-2 pages non-tech pour les grosses portes) + **verdict honnête** (anti-flagornerie — pas de « tout est parfait »).
2. `AskUserQuestion` avec les options réelles de cette porte.
3. Le master **inscrit** la décision (porte, décision, date) dans l'état, **résume en 2 lignes**, puis route.
4. Aucune anticipation : tant que la réponse n'est pas donnée, on **n'avance pas**.

## Portes en mode AUTONOME / test (pas d'humain à interroger)
Le protocole ci-dessus présuppose un **humain joignable** via `AskUserQuestion`. En **run autonome / non-interactif** (test de bout en bout, exécution scriptée, banc d'essai sans utilisateur), **il n'y a personne à qui poser la porte** — mais **on ne supprime pas la porte pour autant**. La règle se **reformule**, elle ne disparaît pas :

- **Le HARD GATE tient, reformulé** : « **rien de la suite n'est écrit en douce** ». Au lieu de « ne pas avancer sans réponse humaine », la version autonome est : *on ne franchit pas la frontière que la porte protège (aucune conception physique avant 09, aucun code de feature avant 12, aucune infra/publication réelle avant provisioning/porte) sans **décision explicite tracée***. La porte ne devient jamais un no-op silencieux.
- **Décision AUTO-ACTÉE + TRACÉE** : à la place de `AskUserQuestion`, le master **prend la décision par défaut la plus sûre** (Go seulement si le verdict honnête le soutient ; sinon Ajuster/No-Go) et **écrit dans `state.md` (« Portes franchies »)** : *(porte, décision `AUTO`, date, **raisonnement** en clair — le POURQUOI qui aurait été présenté à l'humain, + le verdict honnête anti-flagornerie)*. Une décision auto sans raisonnement tracé est un **échec de porte**, pas un raccourci.
- **Les actions irréversibles restent bloquées, pas auto-approuvées** : une porte qui déclencherait une **dépense**, une **publication publique**, ou un **provisioning distant réel** (safety-rails §1) **ne s'auto-franchit jamais** en mode autonome — elle **s'arrête proprement** et **consigne** « porte requérant un humain, non franchie en autonome » (repli honnête). L'auto-décision ne vaut que pour les portes de **jugement/route interne** (Opportunité, PRD/charte, Kill/Continue), jamais pour le feu vert d'un apply qui dépense ou publie.
- **La traçabilité est le garde-fou** : en autonome, la ligne `state.md` (décision + raisonnement + verdict) **remplace** la conversation comme preuve. Un relecteur doit pouvoir reconstituer *pourquoi* chaque porte a été actée sans avoir assisté au run. C'est ce qui distingue « décision autonome disciplinée » de « porte sautée en silence » (le trou que ce mode ferme).

> Frontière autonome : ces règles décrivent le mode **test / banc d'essai**. En run utilisateur normal, `AskUserQuestion` reste la voie unique — l'auto-décision ne s'y substitue **jamais** tant qu'un humain est joignable.

## Contrats de chemin d'artefact (les chemins varient par archétype / layout de run)
Une porte **présente** et **route** en lisant des artefacts (le §Décision d'un brief, un PRD, un plan). **Les chemins de ces artefacts ne sont pas universels** : ils varient selon le **layout du run** et l'**archétype**. Exemples de mismatch observés (hérités entre étapes 05→11) :

| Rôle de l'artefact | Chemin « web-saas » usuel | Variantes vues selon layout/archétype |
|---|---|---|
| Brief d'opportunité | `research/opportunity-brief.md` | `product/opportunity.md` |
| Modèle éco / ROI | `business-model.md` | `roi.md` (automation) |
| Spéc produit | `product-spec.md` | `PRD.md` |
| Archi + décisions | `tech/architecture.md` + `decisions.md` | `architecture/architecture.md` + `data-model.md` |
| Plan d'exécution | `tech/execution-plan.md` | `plan/execution-plan.md` |

**Principe (pas la réécriture)** : une porte (et l'orchestrateur) lit un artefact **par son RÔLE/contrat**, pas par un chemin codé en dur — et **résout le chemin réel** via le layout déclaré du run (`routing.md` / `state.md`), en tolérant les variantes ci-dessus. La **réécriture du chemin dans chaque SKILL concernée** appartient aux lanes de ces skills ; ici on pose seulement la **règle** : *ne jamais faire échouer une porte parce qu'un artefact est au chemin d'un autre layout — chercher par rôle, pas par chemin littéral.* Un artefact « introuvable » au chemin attendu mais présent sous une variante connue = **trouvé**, pas manquant.

## Retours arrière — le graphe autorisé
Une porte peut **renvoyer à une phase antérieure**. Le master gère la boucle et la re-mise à jour d'état :

- **Ajuster (P1)** → reboucle sur l'**étape faible** de P1 (le routage précis est dans `05-opportunity`), pas tout P1.
- **Go-test (P1, public)** → pas un retour arrière mais un **test réel avant build** : ship une landing+waitlist à seuil pré-enregistré, puis **retour à la porte 5** avec la donnée (seuil atteint → Go, sinon → Ajuster/No-Go). Détail : `skills/05-opportunity/references/go-test-playbook.md`.
- **À revoir (P2)** → reboucle 06-08 selon ce qui coince (business model, PRD, ou charte).
- **Itérer (P4, étape 15)** → repart dans le build (12→14), **borné par le budget d'itération** (`_shared/validation-cascade.md` / champ « Budget d'itération » de l'état). Budget épuisé → présenter l'état, proposer « ship en l'état » vs « continuer », laisser trancher.
- **Continue (P6, étape 19)** → itération produit : **retour Phase 4** (nouvelles features) ou **Phase 5** (re-deploy), selon la piste retenue à l'étape 18.
- **No-Go / Stop / Kill** → pas un retour : **arrêt propre** (post-mortem écrit) + archive. La mémoire (P6) capitalise même sur un kill.

## Discipline anti-boucle-infinie
Toute boucle (cascade de build, revue client, itérations post-lancement) a un **budget d'itérations** écrit dans l'état et un **critère de sortie** (cf. `_shared/safety-rails.md` §7). À l'épuisement : on ne relance pas en silence — on **rend la main à l'utilisateur** avec l'option ship-en-l'état.

## Ce que le master ne transforme jamais en porte
- Les décisions **techniques** (stack, archi, provisioning) : tranchées en autonomie, **loguées**, jamais soumises (Phase 3).
- Les validations **agent-à-agent** (cascade Tech Lead→CTO→Designer→CEO, faux-client) : internes à P4, invisibles pour l'utilisateur jusqu'à l'étape 15.
