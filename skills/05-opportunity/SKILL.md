---
name: 05-opportunity
description: >-
  Étape 5 (Phase 1 · validation) de SaaS Factory — Opportunité & décision (rôle CEO, la porte de sortie). Synthétise les étapes 1→4 en un brief d'opportunité complet + un résumé 1-2 pages non-technique (le POURQUOI), pose un verdict honnête et humble, et fait décider l'utilisateur : Go / Ajuster / No-Go. Se déclenche pour « est-ce que ça vaut le coup », « décision d'opportunité », « brief d'opportunité », après demand-signals.md.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash
---

# SaaS Factory — Étape 5 : Opportunité & décision (rôle CEO)

La **dernière étape** de la Phase 1, et sa **porte de sortie**. C'est un **overlay maison** : tu ne lances **aucune recherche neuve**. Tu **synthétises** ce que les étapes 1→4 ont produit, tu poses un **verdict honnête et humble**, puis tu **fais décider l'utilisateur**. C'est la seule barrière avant de dépenser le moindre effort produit.

## Rôle & garde-fou (HARD GATE)
Tu ne fais que **synthétiser + faire décider** : aucune recherche neuve, aucun input fabriqué, aucun démarrage de Phase 2. Tu **poses** le verdict, tu **ne tranches pas à la place de l'utilisateur** : la décision Go / Ajuster / No-Go est la sienne, via `AskUserQuestion`, et tu **n'écris jamais la suite sans sa réponse**. Cette barrière est le seul point où la Phase 1 peut s'arrêter avant tout effort produit.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-1-validation/references/conventions.md`.
**Pré-vol** : relis `vendor/startup-skill/startup-competitors/references/honesty-protocol.md`. Il prime : pas de langage positif vague, on sépare **[Data]/[Estimate]/[Assumption]/[Opinion]**, on remonte les flags, on ne fabrique rien. Un résumé qui rassure à tort fait perdre à l'utilisateur temps, argent et énergie — c'est un échec.

## Références (la profondeur — charge à l'usage)
Le SKILL reste l'aperçu ; chaque étape a sa procédure exhaustive en `references/` :
- `references/synthesis-and-confrontation.md` — étape 1 : lecture ciblée des 4 inputs, **matrice de confrontation** (débusquer les tensions), routage input manquant, plafond de confiance hérité.
- `references/writing-deliverables.md` — étapes 2-3 : brief section-par-section (labels + MOU→FORT), résumé 1-2 pages, DoD des deux livrables, test de cohérence.
- `references/verdict-engine.md` — étape 4 : cotation des 4 axes, **matrice de décision** marché×edge×demande×risques, anti-flagornerie, humilité proxy.
- `references/gate-and-routing.md` — étapes 5-6 : machine à états, recette forcing de la porte, routage du « Ajuster », post-mortem 5 lignes, clôture `state.md`.
- `references/lite-mode.md` — routes `perso` / `interne` : recadrage utilité/fit, livrables réduits, forcing-questions dédiées.

## Contrat (lit / écrit)
| Lit (les 4 inputs) | Écrit |
|---|---|
| `research/idea-brief.md` (problème, cible, type/route) | `research/opportunity-brief.md` — **brief complet** (template `assets/templates/opportunity-brief.md`) |
| `research/market.md` + `research/confidence.md` | `research/opportunity-summary.md` — **1-2 pages non-tech = le POURQUOI** (template `assets/templates/opportunity-summary.md`) |
| `research/positioning.md` | `research/post-mortem.md` — **5 lignes**, uniquement si No-Go |
| `research/demand-signals.md` | `.saas-factory/state.md` — étape, décision, porte franchie |

Si un input attendu manque (selon le `type`), **dis-le** dans les livrables plutôt que de combler. Jamais de secret dans ces fichiers.

## Pourquoi DEUX livrables (ne pas les confondre)
- `opportunity-brief.md` = **la matière**, détaillée et traçable, pour que la **Phase 2** démarre sans re-fouiller. On y garde tout : chiffres, sources, nuances, risques.
- `opportunity-summary.md` = **la décision**, distillée. Double emploi, pas orphelin : (a) **livrable de la porte** — ce que **l'humain lit** pour décider Go / Ajuster / No-Go ; (b) **entrée du cadrage Phase 2** — le POURQUOI qui ouvre le produit une fois le Go acté. Une seule question : *est-ce pertinent de continuer, oui ou non, et pourquoi ?* — en langage marché/fonctionnel qu'un **non-technique** comprend. Si le résumé oblige à ouvrir le brief pour trancher, il a raté sa mission.

Les deux disent la **même** vérité. Le résumé n'est pas une version « adoucie ».

## Procédure
### 1. Rassembler et confronter les 4 inputs
Charge les quatre fichiers et **confronte-les** — c'est là que se cachent les décisions. Cherche les **contradictions** (ex. `demand-signals` dit « douleur forte » mais `market` montre 40 concurrents installés → problème réel *mais* créneau saturé). Une synthèse honnête **nomme** ces tensions ; elle ne moyenne pas les signaux pour un tiède rassurant. Vérifie le **`type`** : `public` = 4 inputs → étape complète ; `interne`/`perso` = étape **allégée** (voir bas), n'invente pas le marché manquant. → Procédure, matrice de confrontation et routage input-manquant : `references/synthesis-and-confrontation.md`.

### 2. Écrire `research/opportunity-brief.md` (le détaillé)
En citant la **source** et en **labellisant** chaque affirmation forte : Problème · Cible (resserrés par ce que la recherche a confirmé/démenti) · Marché (taille avec l'hypothèse de calcul, jamais un chiffre nu ; dynamique) · Concurrents clés (menace honnête High/Medium/Low, ce qu'ils font **bien**) · Demande (signal *par proxy* — « plausible », jamais « prouvée ») · Edge (ou absence assumée) · Risques (les vrais tueurs d'abord) · Pertinence (ta lecture argumentée) · Verdict + **Flags**. → Section-par-section (MOU→FORT) + DoD : `references/writing-deliverables.md`.

### 3. Écrire `research/opportunity-summary.md` (le POURQUOI, 1-2 pages)
**1 à 2 pages MAX**, **zéro jargon**. Structure : (1) Le problème en 1 phrase · (2) Ce qu'on a trouvé (marché/concurrents/demande, en clair) · (3) Le POURQUOI (le cœur : *pourquoi* continuer ou pas — un raisonnement, pas un score) · (4) Recommandation Go/Ajuster/No-Go + « à toi de décider ». → Recette forcing du bloc « POURQUOI » + test de cohérence brief↔résumé : `references/writing-deliverables.md`.

### 4. Poser le verdict — honnête ET humble
Croise **marché × edge × demande × risques**. Deux garde-fous : **anti-flagornerie** (prends position, bannis « intéressant » / « ça peut marcher » ; si l'idée doit mourir, dis-le + dis ce qui changerait ton avis) ; **humilité** (demande inférée des avis → « plausible », « à valider par toi », jamais une certitude). → Cotation des axes + matrice de décision + clause « ce qui le ferait basculer » : `references/verdict-engine.md`.

### 5. LA PORTE — décision explicite via `AskUserQuestion`
Présente le **résumé 1-2 pages** + ton **verdict**, puis demande explicitement l'une des trois issues. **N'écris jamais la suite sans sa réponse.** → Machine à états, recette forcing de la porte (réponses à refuser) + routage détaillé : `references/gate-and-routing.md`.

| Choix | Ce que ça déclenche |
|---|---|
| **Go** | Phase 1 **terminée** → cadrage produit (Phase 2). Marque la porte franchie dans `state.md`. |
| **Ajuster** | **Reboucle** sur l'étape faible, met à jour les inputs, **repasse** par l'étape 5. |
| **No-Go** | **Arrête proprement** : écris le **post-mortem** (ci-dessous), acte la fin dans `state.md`. |

**Routage du « Ajuster »** — vers *l'étape qui a produit le maillon faible* : cible/problème → `01-discover` · marché → `02-market` · positionnement → `03-positioning` · demande/edge → `04-demand-edge`.

**Si No-Go → `research/post-mortem.md`, exactement 5 lignes :** (1) l'idée en une phrase · (2) le **fait qui tue** · (3) ce qu'on a appris (le point non évident) · (4) ce qui **aurait pu** changer la donne · (5) Statut : `No-Go` + date. Un No-Go documenté a **économisé** le build — écris-le sans dramatiser.

### 6. Clôturer l'état
Mets à jour `.saas-factory/state.md` (étape 5 done, décision, porte franchie). Résume en 2 lignes et annonce la suite (Phase 2, reboucle, ou arrêt). → Table de clôture par issue (Go/Ajuster/No-Go) : `references/gate-and-routing.md`.

## Cas `type = perso` ou `interne` — étape 5 **allégée**
Pas d'analyse de marché → la question change : plus « le marché en veut-il ? » mais **« est-ce utile — assez pour justifier de le construire ? »**. Livrables réduits : pas de brief marché complet ; un **`opportunity-summary` court** centré sur le besoin réel (perso) ou le **fit** outils/process/sécurité (interne), l'effort vs le gain, les non-goals. La porte reste explicite (même Go/Ajuster/No-Go). Ne surdimensionne pas — la décision porte sur l'**utilité**. → Recadrage utilité/fit, forcing-questions dédiées + DoD : `references/lite-mode.md`.
