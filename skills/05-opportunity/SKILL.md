---
name: 05-opportunity
description: >-
  Étape 5 (Phase 1 · validation) de SaaS Factory — Opportunité & décision (rôle CEO, la porte de sortie). Synthétise les étapes 1→4 en UN brief d'opportunité (avec un bloc POURQUOI non-technique en tête = ce que l'humain lit pour décider), pose un verdict honnête et humble, et fait décider l'utilisateur : Go / Ajuster / Go-test / No-Go. Se déclenche pour « est-ce que ça vaut le coup », « décision d'opportunité », « brief d'opportunité », après demand-signals.md.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash
---

# SaaS Factory — Étape 5 : Opportunité & décision (rôle CEO)

La **dernière étape** de la Phase 1, et sa **porte de sortie**. C'est un **overlay maison** : tu ne lances **aucune recherche neuve**. Tu **synthétises** ce que les étapes 1→4 ont produit, tu poses un **verdict honnête et humble**, puis tu **fais décider l'utilisateur**. C'est la seule barrière avant de dépenser le moindre effort produit.

## Rôle & garde-fou (HARD GATE)
Tu ne fais que **synthétiser + faire décider** : aucune recherche neuve, aucun input fabriqué, aucun démarrage de Phase 2. Tu **poses** le verdict, tu **ne tranches pas à la place de l'utilisateur** : la décision Go / Ajuster / Go-test / No-Go est la sienne, via `AskUserQuestion`, et tu **n'écris jamais la suite sans sa réponse**. Cette barrière est le seul point où la Phase 1 peut s'arrêter avant tout effort produit.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-1-validation/references/conventions.md`.
**Pré-vol** : relis `{PLUGIN_ROOT}/vendor/startup-skill/startup-competitors/references/honesty-protocol.md`. Il prime : pas de langage positif vague, on sépare **[Data]/[Estimate]/[Assumption]/[Opinion]**, on remonte les flags, on ne fabrique rien. Un résumé qui rassure à tort fait perdre à l'utilisateur temps, argent et énergie — c'est un échec.
> **Résolution du chemin** : `{PLUGIN_ROOT}` se résout en chemin ABSOLU avant tout accès (hook SessionStart ou échelle de fallback), Read de vérification avant dispatch, jamais de `vendor/…` relatif dans un brief de sous-agent — `_shared/vendored-engine-protocol.md` **§0**.

## Références (la profondeur — charge à l'usage)
Le SKILL reste l'aperçu ; chaque étape a sa procédure exhaustive en `references/` :
- `references/synthesis-and-confrontation.md` — étape 1 : lecture ciblée des 4 inputs, **matrice de confrontation** (débusquer les tensions), routage input manquant, plafond de confiance hérité.
- `references/writing-deliverables.md` — étapes 2-3 : brief section-par-section (labels + MOU→FORT), résumé 1-2 pages, DoD des deux livrables, test de cohérence.
- `references/verdict-engine.md` — étape 4 : cotation des 4 axes, **matrice de décision** marché×edge×demande×risques, anti-flagornerie, humilité proxy.
- `references/gate-and-routing.md` — étapes 5-6 : machine à états, recette forcing de la porte (4 issues), routage du « Ajuster », post-mortem 5 lignes, clôture `state.md`.
- `references/go-test-playbook.md` — issue « Go-test » : landing + waitlist shippée en 1 jour, **seuil pré-enregistré avant publication**, lecture du résultat, retour à la porte.
- `references/lite-mode.md` — routes `perso` / `interne` : recadrage utilité/fit, livrables réduits, forcing-questions dédiées.

## Contrat (lit / écrit)
| Lit (les 4 inputs) | Écrit |
|---|---|
| `research/idea-brief.md` (problème, cible, type/route) | `research/opportunity-brief.md` — **le SEUL livrable de décision** (template `assets/templates/opportunity-brief.md`) : bloc §Décision (POURQUOI, non-tech) en tête **+** le détaillé traçable |
| `research/market.md` (dont §Dossiers, §Prix, §Carte de langage, **§Fiabilité**) | `research/post-mortem.md` — **5 lignes**, uniquement si No-Go |
| `research/positioning.md` | `research/go-test.md` — **seuil pré-enregistré + résultat**, uniquement si issue Go-test |
| `research/demand-signals.md` | `.saas-factory/state.md` — étape, décision, porte franchie |

Si un input attendu manque (selon le `type`), **dis-le** dans le livrable plutôt que de combler. Jamais de secret dans ces fichiers.
> **Fusion poids mort §5.** `opportunity-summary` et `confidence` **n'existent plus en fichiers séparés** : le POURQUOI est le bloc §Décision **en tête** de l'`opportunity-brief` ; la confiance de la recherche est héritée de `market.md` §Fiabilité et reportée dans §Fiabilité du dossier du brief. Régime cible : `research/` = 5 fichiers (idea-brief, market, positioning, demand-signals, opportunity-brief) + raw/.

## Un seul livrable, deux fonctions (ne pas les confondre)
L'`opportunity-brief.md` porte **deux registres dans un fichier** :
- **§Décision — le POURQUOI** (en tête) = **la décision**, distillée, **non-technique**, **auto-suffisante**. Double emploi : (a) **ce que l'humain lit à la porte** pour décider Go / Ajuster / Go-test / No-Go ; (b) **entrée du cadrage Phase 2** — le POURQUOI qui ouvre le produit une fois le Go acté. Une seule question : *est-ce pertinent de continuer, oui ou non, et pourquoi ?* Si ce bloc oblige à descendre dans le détail pour trancher, il a raté sa mission.
- **Le détaillé** (sous la ligne) = **la matière**, traçable, pour que la **Phase 2** démarre sans re-fouiller : chiffres, sources, nuances, concurrents cités, risques.

Les deux disent la **même** vérité. Le POURQUOI n'est **pas** une version « adoucie » du détail (test de cohérence obligatoire, cf. `references/writing-deliverables.md`).

## Procédure
### 1. Rassembler et confronter les 4 inputs
Charge les quatre fichiers et **confronte-les** — c'est là que se cachent les décisions. Cherche les **contradictions** (ex. `demand-signals` dit « douleur forte » mais `market` montre 40 concurrents installés → problème réel *mais* créneau saturé). Une synthèse honnête **nomme** ces tensions ; elle ne moyenne pas les signaux pour un tiède rassurant. Vérifie le **`type`** : `public` = 4 inputs → étape complète ; `interne`/`perso` = étape **allégée** (voir bas), n'invente pas le marché manquant. → Procédure, matrice de confrontation et routage input-manquant : `references/synthesis-and-confrontation.md`.

### 2. Écrire le détaillé de `research/opportunity-brief.md`
En citant la **source** (cite les concurrents nommément, avec leur prix et une preuve/verbatim de `market.md`) et en **labellisant** chaque affirmation forte : Problème · Cible (resserrés par ce que la recherche a confirmé/démenti) · Marché (taille avec l'hypothèse de calcul, jamais un chiffre nu ; dynamique) · Concurrents clés (menace honnête High/Medium/Low, ce qu'ils font **bien**) · Demande (signal *par proxy* — « plausible », jamais « prouvée ») · Edge (ou absence assumée) · Risques (les vrais tueurs d'abord) · **Fiabilité du dossier** (héritée de `market.md` §Fiabilité = plafond de confiance) · Pertinence · Verdict + **Flags** · **Annexe Mom-Test**. → Section-par-section (MOU→FORT) + DoD : `references/writing-deliverables.md`.

### 3. Écrire le bloc **§Décision — le POURQUOI** (en tête du MÊME fichier)
C'est ce que **l'humain lit à la porte** : **zéro jargon**, **auto-suffisant** (on décide sans descendre dans le détail). Structure : (1) Le problème en 1 phrase · (2) Ce qu'on a trouvé (marché/concurrents/demande, en clair) · (3) Le POURQUOI (le cœur : *pourquoi* continuer ou pas — un raisonnement, pas un score) · (4) Recommandation Go/Ajuster/Go-test/No-Go + « à toi de décider ». Le kit interviews Mom-Test reste en **annexe** (hors pagination). → Recette forcing du bloc « POURQUOI », recette de l'annexe + **test de cohérence POURQUOI↔détaillé** : `references/writing-deliverables.md`.

### 4. Poser le verdict — honnête ET humble
Croise **marché × edge × demande × risques**. **On hérite, on ne re-cote pas** : Demande & Edge héritent des verdicts de l'étape 4 (table d'héritage, plafonnée par `market.md` §Fiabilité) ; Marché hérite de `market.md` § « Taille servable & dynamique » ; Risques s'énumèrent via la mini-taxonomie (5 familles). Deux garde-fous : **anti-flagornerie** (prends position, bannis « intéressant » / « ça peut marcher » ; si l'idée doit mourir, dis-le + dis ce qui changerait ton avis) ; **humilité** (demande inférée des avis → « plausible », « à valider par toi », jamais une certitude). → Table d'héritage + cotation des axes + matrice de décision + clause « ce qui le ferait basculer » : `references/verdict-engine.md`.

### 5. LA PORTE — décision explicite via `AskUserQuestion`
**D'abord, rends le brief en DOCUMENT accessible** (exigence fondateur : tout livrable présenté à l'humain est consultable par un non-tech, pas du markdown brut en chat). Lance le renderer zéro-dépendance :
```bash
node {PLUGIN_ROOT}/scripts/render-report.mjs research/opportunity-brief.md research/opportunity-brief.html "Note d'opportunité"
```
→ produit `research/opportunity-brief.html` (stylé, prêt à **Imprimer → Enregistrer en PDF**). **Présente ce document à l'utilisateur** (ouvre-le / preview dans le navigateur ; à défaut, pointe-lui le chemin du fichier) — c'est SA note d'opportunité, lisible.

Puis présente le **bloc §Décision — le POURQUOI** (en tête du brief, non-technique, auto-suffisant) + ton **verdict**, et demande explicitement l'issue via `AskUserQuestion`. **N'écris jamais la suite sans sa réponse.** → Machine à états, recette forcing de la porte (réponses à refuser) + routage détaillé : `references/gate-and-routing.md`.

> 🚨 **Nombre d'issues = fonction de la route.** **`public`** → **4 issues** (dont **Go-test**). **Routes allégées (`interne`/`perso`) ET archétype `automation`** → **3 issues** (**Go / Ajuster / No-Go**), **SANS Go-test** : le Go-test sonde une **demande marché** (landing + waitlist), sans objet quand il n'y a pas de marché (`go-test-playbook.md` : « un outil interne/perso ne se waitlist pas » ; cf. `references/lite-mode.md`). Ne propose Go-test que sur la route publique.

| Choix | Ce que ça déclenche | Route |
|---|---|---|
| **Go** | Phase 1 **terminée** → cadrage produit (Phase 2). Marque la porte franchie dans `state.md`. | toutes |
| **Ajuster** | **Reboucle** sur l'étape faible, met à jour les inputs, **repasse** par l'étape 5. | toutes |
| **Go-test** | **Convertit « à valider par toi » en test réel** : landing + waitlist shippée en **1 jour**, **seuil pré-enregistré avant publication** (`research/go-test.md`) ; au terme de la fenêtre, **retour à la porte** avec la donnée réelle. → `references/go-test-playbook.md` | **`public` uniquement** |
| **No-Go** | **Arrête proprement** : écris le **post-mortem** (ci-dessous), acte la fin dans `state.md`. | toutes |

**Routage du « Ajuster »** — vers *l'étape qui a produit le maillon faible* : cible/problème → `01-discover` · marché → `02-market` · positionnement → `03-positioning` · demande/edge → `04-demand-edge`.

**Si No-Go → `research/post-mortem.md`, exactement 5 lignes :** (1) l'idée en une phrase · (2) le **fait qui tue** · (3) ce qu'on a appris (le point non évident) · (4) ce qui **aurait pu** changer la donne · (5) Statut : `No-Go` + date. Un No-Go documenté a **économisé** le build — écris-le sans dramatiser.

### 6. Clôturer l'état
Mets à jour `.saas-factory/state.md` (étape 5 done, décision, porte franchie). Résume en 2 lignes et annonce la suite (Phase 2, reboucle, Go-test en cours, ou arrêt). → Table de clôture par issue (Go/Ajuster/Go-test/No-Go) : `references/gate-and-routing.md`.

## Cas `type = perso` ou `interne` — étape 5 **allégée**
Pas d'analyse de marché → la question change : plus « le marché en veut-il ? » mais **« est-ce utile — assez pour justifier de le construire ? »**. Livrable réduit : l'`opportunity-brief` **limité à son bloc §Décision** centré sur le besoin réel (perso) ou le **fit** outils/process/sécurité (interne), l'effort vs le gain, les non-goals ; sections marché « non applicable (route allégée) ». La porte reste explicite (même Go/Ajuster/No-Go). Ne surdimensionne pas — la décision porte sur l'**utilité**. → Recadrage utilité/fit, forcing-questions dédiées + DoD : `references/lite-mode.md`.
