# Référence — Recettes d'auto-interrogation (le CTO se force la main)

En Phase 3, **on ne pose aucune question technique à l'utilisateur**. Le forcing ne s'exerce donc pas *vers l'utilisateur* mais **vers les artefacts et vers ses propres décisions** : le CTO interroge le PRD (est-il architecturable ?) et challenge chaque choix avant de le verrouiller. C'est le cœur du déterminisme : une décision non interrogée est une décision au feeling.

Chaque recette a le même format que l'entretien de la Découverte : **Ask-self** (la question exacte que tu te poses) · **Push-until** (le critère qui autorise à trancher) · **Red-flags** (les réponses/situations à **refuser**, avec la conduite) · **MOU vs FORT** (un exemplaire de sortie faible et sa version forte, niche-agnostique) · **Routage** (quoi faire selon le cas). Les tables *condition → action* correspondantes sont dans `decision-matrices.md`.

---

## §1 — Le PRD est-il architecturable ? (mouvement 1)
- **Ask-self** : « Ai-je, pour **chaque** feature Must, de quoi la porter techniquement — une entité de données, un acteur, un déclencheur, un critère d'acceptation ? »
- **Push-until** : les 2-3 **workflows cœur** ont chacun des critères d'acceptation exploitables (entrée → sortie attendue), et chaque feature Must nomme au moins une **donnée manipulée** et un **acteur**.
- **Red-flags** (→ renvoi Phase 2, `decision-matrices.md §0`) :
  - Une feature Must sans US ni critère d'acceptation → **on ne devine pas** le comportement attendu.
  - Une intégration citée sans nom d'outil (« se connecte à leur CRM ») → la faisabilité est opaque.
  - Deux artefacts qui se contredisent (mvp-definition dit « pas de paiement v1 », une feature décrit un checkout) → le scope est instable.
  - Un non-goal contredit par une feature listée.
- **MOU** (ce qu'on refuse d'ingérer) : « Le produit permet de gérer ses projets. » (aucune entité, aucun acteur, aucun flux).
- **FORT** (ce qui est architecturable) : « Un *membre* crée un *projet* (nom, deadline, statut) ; il y attache des *tâches* assignées à d'autres membres ; à la deadline, une notification part. » → entités {membre, projet, tâche}, acteurs, déclencheur async identifiables.
- **Routage** : PRD FORT → M2. Trou bloquant → **renvoi Phase 2** (dis quel artefact précis manque). Trou **non bloquant** (détail cosmétique) → note `[Hypothèse]`, avance, ne bloque pas la Phase 3 pour un détail.

---

## §2 — Est-ce vraiment une exigence, ou une hypothèse ? (mouvement 2)
- **Ask-self** : « Pour cette case de la matrice NFR, existe-t-il une **source** (US, critère, élément du PRD), ou est-ce que je l'invente ? »
- **Push-until** : chaque exigence notée pointe une source **nommée**. Sinon → label `[Hypothèse]`, pas `[Exigence]`.
- **Red-flags** :
  - Exigence de perf inventée (« il faut que ce soit rapide ») sans latence-cible ni US qui la motive → c'est du bruit, pas une exigence dure.
  - Scalabilité « au cas où » (« et si on a 1M d'utilisateurs ») sans signal de charge dans le PRD → sur-ingénierie ; case vide assumée.
  - Sécurité sous-déclarée : des PII manipulées mais **aucune** ligne sécurité → là c'est l'inverse, tu **dois** la remonter (une omission de sécurité n'est jamais « case vide »).
- **MOU** : colonne Coût = « optimiser les coûts » (générique, non actionnable).
- **FORT** : « Chaque génération appelle le LLM (~1 500 tokens out) ; à 50 gén./jour/tenant → cache des résultats identiques + quota souple par plan. `[Exigence]` (US-12). »
- **Routage** : exigence sourcée + non négociable → **dure** (entre dans la liste qui pilote M4). Souhait sourcé → **molle**. Non sourcé → `[Hypothèse]`, n'impose rien. Omission de sécurité → **remonte-la** taggée `[SÉCU]`.

---

## §3 — Ce module : réutiliser un bloc, ou custom ? (mouvement 3)
- **Ask-self** : « Cette capacité est-elle déjà un bloc du châssis (`_shared/blocks/`), ou fait-elle partie de la **verticale** différenciante ? »
- **Push-until** : chaque module Must est classé **réutiliser** (nomme le bloc) ou **custom** (nomme pourquoi le châssis ne couvre pas). Aucun module « à décider plus tard ».
- **Red-flags** :
  - Ré-implémenter l'auth / le billing / l'observabilité « pour maîtriser » → **non** : ce sont des blocs, on les câble (DRY, boring-by-default).
  - Marquer « custom » l'edge produit **et** trois autres modules → tu dilues les jetons d'innovation ; seul le cœur métier est custom.
  - Étirer un bloc au-delà de son contrat (mettre de la logique métier dans `auth`) → garde le bloc pur, mets le custom à côté.
- **MOU** : « on fait un système de login maison + un module de paiement custom. »
- **FORT** : « `auth`, `billing`, `observability`, `ui-shell` = blocs câblés ; seul le *moteur de scoring* (l'edge produit) est custom — c'est là que va tout l'effort. »
- **Routage** : capacité générique → **réutiliser** (bloc nommé). Cœur métier différenciant → **custom**. Doute → défaut = réutiliser si un bloc existe, custom sinon (`decision-matrices.md §3`).

---

## §4 — Le défaut suffit-il, ou dois-je dévier ? (mouvement 4)
- **Ask-self** : « Quelle **exigence dure précise** m'oblige à quitter la stack par défaut ? Si je n'en trouve pas, pourquoi est-ce que je dévie ? »
- **Push-until** : toute déviation pointe une exigence dure **nommée** de la matrice M2 **et** a survécu à un Scenario Compare **et** à un `WebSearch` (le framework par défaut ne le fait-il pas déjà ?).
- **Red-flags** (déviation à refuser) :
  - « Redis parce que ça scale » sans exigence de charge sourcée → orphelin, supprime.
  - Une techno « parce qu'elle est cool / récente / que je maîtrise » → jeton d'innovation gaspillé hors edge produit.
  - Dévier alors que `WebSearch` montre que Next.js / Supabase le fait en natif (ex. réécrire un cache que le framework fournit) → reviens au défaut.
  - Plus de 1-2 déviations hors cœur métier → signal de sur-ingénierie, re-challenge chaque déviation.
- **MOU** : « On prend Mongo, c'est plus flexible. » (aucune exigence, préférence personnelle).
- **FORT** : « Le workflow *import* traite des fichiers de 200 Mo `[Exigence US-8]` ; le défaut (route API Next.js, 4 Mo de body) ne passe pas → ADR-0003 : upload direct vers le storage + worker. Réversible (adaptateur d'upload). »
- **Routage** : défaut satisfait → **verrouille `[Défaut]`** (la majorité des lignes). Défaut insuffisant + exigence dure → **ADR** (`adr-template.md`). Exigence molle → **jamais** de déviation (reste au défaut).

---

## §5 — Ce choix mérite-t-il un ADR, et est-il réversible ? (transverse M4)
- **Ask-self** : « Ce choix est-il structurant/irréversible/à impact produit ? Et si je me trompe, combien ça coûte de revenir en arrière ? »
- **Push-until** : tout choix qui coûte cher à défaire (modèle de données central, stratégie multi-tenant, provider critique) a un ADR **avec** une ligne réversibilité honnête (facile/moyenne/difficile + comment).
- **Red-flags** :
  - Marquer « réversible : facile » un schéma multi-tenant → **faux** : c'est le choix le plus difficile à défaire (data à migrer). Sois honnête.
  - ADR sans exigence motrice → choix arbitraire, rattache-le ou supprime-le.
  - Empiler des ADR sur des détails réversibles en 5 min → bruit ; garde les ADR pour le structurant.
- **MOU** : « Réversibilité : moyenne » (sans dire comment on reviendrait).
- **FORT** : « Réversibilité : difficile — passer d'un schéma *shared-table + RLS* à *schema-per-tenant* impose une migration de toutes les lignes ; on l'assume car l'isolation RLS suffit à l'échelle micro-SaaS (voir `data-model.md`). »
- **Routage** : structurant/irréversible/impact-produit → **ADR**. Détail réversible → pas d'ADR (décision d'implémentation, laissée à la Phase 4). Impact produit → ADR **+** taste decision loguée pour l'étape 10.

---

## Garde-fou transverse (anti-flagornerie technique)
Ne te raconte pas d'histoire pour meubler une décision. La question honnête n'est pas « est-ce que ça peut marcher ? » (presque tout peut marcher) mais « **quelle exigence l'impose, et qu'est-ce qui me ferait changer d'avis ?** ». Un « inconnu » assumé (`[Hypothèse]`, taste decision remontée) vaut mieux qu'une archi inventée présentée comme une contrainte prouvée. La **traçabilité est la seule monnaie** : un choix sans exigence traçable se re-challenge, toujours.
