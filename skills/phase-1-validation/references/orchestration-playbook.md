# Orchestration playbook — Phase 1 (le flux exécutable)

La profondeur de l'orchestrateur. Le SKILL.md donne l'aperçu ; ici vit la mécanique : **comment enchaîner, router, calibrer**, sans jamais faire le travail des étapes à leur place. Lu à l'usage. La tenue de l'état et les portes ont leur propre référence : `state-and-gates.md`.

## Ce que fait (et ne fait pas) l'orchestrateur

L'orchestrateur n'exécute **aucune recherche**, n'écrit **aucun artefact `research/*`**, ne pose **aucune question de contenu** (celles-ci appartiennent aux experts). Sa valeur tient en quatre gestes, répétés à chaque étape :

1. **Enchaîner** — invoquer le bon skill expert, dans l'ordre, une fois l'artefact amont écrit.
2. **Router** — traduire le `type` capté à l'étape 1 en séquence d'étapes actives / sautées.
3. **Tenir l'état** — mettre à jour `.saas-factory/state.md` après chaque étape (cf. `state-and-gates.md`).
4. **Poser la porte** — à l'étape 5, garantir une décision explicite avant toute sortie de phase.

Anti-pattern à s'interdire : **faire le travail de l'étape** (rédiger l'idea-brief soi-même, lancer un teardown, improviser un positionnement). Si un expert semble « lent », on l'invoque quand même — la répétabilité vient de sa procédure normée, pas d'un raccourci de l'orchestrateur.

## Table de séquence (le contrat d'enchaînement)

Chaque ligne = une étape. On ne passe à la suivante que lorsque l'artefact **écrit** existe et que `state.md` est à jour.

| # | Skill expert | Rôle | Lit | Écrit | Moteur vendoré | Porte |
|---|---|---|---|---|---|---|
| 1 | `01-discover` | Découverte + captation du **type** | idée utilisateur | `research/idea-brief.md` | — | — |
| 2 | `02-market` | Teardown concurrents + review-mining + vérif adversariale | `idea-brief` | `research/market.md` (dont §Fiabilité — ex-`confidence.md`, fusion §5) | `startup-competitors` (waves 1→3) | — |
| 3 | `03-positioning` | Angle différenciant (framework Dunford) | `market`, `idea-brief` | `research/positioning.md` | `startup-positioning` | — |
| 4 | `04-demand-edge` | Demande par proxy (humble) + edge nommé | `market` (review-mining), `positioning` | `research/demand-signals.md` | `startup-competitors` (review-mining réutilisé) | — |
| 5 | `05-opportunity` | Synthèse 1→4 + verdict + décision | tous les précédents | `research/opportunity-brief.md` (bloc §Décision en tête = POURQUOI ; ex-`opportunity-summary.md`, fusion §5) (+ `post-mortem.md` si No-Go) | — (overlay maison) | 🚪 **Go / Ajuster / No-Go** |

**Précondition d'invocation** : avant d'appeler l'étape N, vérifier que l'artefact attendu par N (colonne « Lit ») existe. S'il manque (reprise partielle, route atypique), c'est un signal de reprise ou de route — voir `state-and-gates.md`, pas un feu pour improviser le contenu manquant.

## Contrôle de réception des artefacts (anti-squelette)

L'existence d'un fichier ne prouve rien. À chaque artefact rendu par un expert, avant de le déclarer « fait » dans `state.md` :
1. **Ouvre l'artefact reçu** (Read) — jamais de « croire sur parole ».
2. **Checklist minimale par type** : sections requises du template présentes, verdict au format attendu (ex. demande Forte/Moyenne/Faible), **preuves non vides** (URL, verbatims, chiffres — pas de placeholders), taille plancher plausible (un `market.md` de 15 lignes n'est pas un teardown).
3. **Stub / squelette → renvoi à l'étape** qui l'a produit, avec le **manque nommé** (section absente, preuve vide, verdict manquant), dans le budget d'itération — pas de passage au maillon suivant.

## Calibrage & routage par type (décidé à l'étape 1)

Le `type` (public / interne / perso) capté par `01-discover` **route toute la suite**. Il est écrit dans `state.md` (`Type / route`) et devient la source de vérité de la séquence.

**Le skip-set (quelles étapes s'exécutent) vit à UN seul endroit : la matrice canonique de `skills/saas-factory/references/routing.md` — route selon elle.** Ne recopie pas la matrice ici ni ailleurs ; le contenu local ci-dessous = le **calibrage** (comment les étapes actives s'exécutent), jamais le skip-set.

### Règles de calibrage

- **Annonce l'impact au moment du choix de type** (à l'étape 1) : dis à l'utilisateur, en clair, ce qu'on **fait** et ce qu'on **saute** selon son choix. Il choisit la cérémonie en connaissance de cause.
- **Route ≠ bâclage.** Une route courte (perso/interne) allège le *périmètre* (moins d'étapes marché), pas la *rigueur* des étapes qui restent. La porte 5 existe toujours ; le verdict reste honnête.
- **Le `fit-check` interne** est porté par `05-opportunity` en mode adapté (cf. `skills/05-opportunity/references/lite-mode.md`) : on ne lance pas `02-market` pour un outil interne — on vérifie l'adéquation aux outils/process/sécurité de l'entreprise.
- **Une étape sautée est tracée**, pas silencieuse : `state.md` note « 02-market : sautée (route perso) ». En sortie, `05-opportunity` **dit** quels inputs manquent-par-conception au lieu de combler.
- **Doute sur le type** → reste sur `01-discover` et pousse la spécificité ; ne devine pas une route.

## Calibration des moteurs vendorés (rappel opérationnel)

Les moteurs (`vendor/startup-skill/*`) sont exécutés **tels quels** par les étapes, pas par l'orchestrateur. Deux points d'attention côté flux :

- **Périmètre Phase 1 uniquement.** Certains moteurs débordent sur le produit/brand/financials (= Phase 2). L'orchestrateur ne garde que la **tranche marché / validation / positionnement** ; le reste est ignoré ici et routé vers la phase suivante (détail dans `conventions.md`).
- **Réutilisation review-mining.** Le review-mining produit à l'étape 2 (`startup-competitors` wave 2) est **consommé** à l'étape 4 — ne le relance pas. Si l'étape 4 tourne sans `market.md` disponible, c'est un défaut de séquence (reprise), pas une invitation à re-miner.

## Discipline « lire `_shared` une fois »

Objectif : progressive disclosure, pas de rechargement inutile de contexte.

- **Sous le master, les `_shared/*` sont déjà en contexte** (`lessons.md`, `safety-rails.md`, … — lus une fois au démarrage de session) et **priment**. L'orchestrateur de phase lit **une fois** `references/conventions.md` (local) au démarrage de la phase — rien d'autre.
- **Ne recharge pas** les `_shared/*` entre deux étapes et ne les fais pas relire. Chaque skill expert relit lui-même ce dont il a besoin à son propre démarrage — c'est son travail, pas celui de l'orchestrateur.
- **Charge le détail au moment utile** : les `references/` d'une étape se lisent quand cette étape s'exécute, pas avant. Le SKILL et ce playbook restent volontairement courts pour tenir en contexte tout du long.
- **Ne réinjecte pas** le contenu des `_shared/*` dans `state.md` ni dans les artefacts `research/*` — on y référence, on n'y recopie pas (et **jamais de secret**, cf. `safety-rails`).

## Boucle nominale (pseudo-procédure)

```
lire une fois : conventions.md (les _shared/* sont déjà en contexte — lus par le master)
reprendre l'état : state-and-gates.md → (nouveau projet ? git init + state.md : reprendre à l'étape courante)

invoquer 01-discover → idea-brief.md ; capter type ; annoncer l'impact du routage
mettre à jour state.md (étape, type/route)

selon type : router selon la matrice canonique
  (skills/saas-factory/references/routing.md — seule source du skip-set)

pour chaque étape active :
  vérifier la précondition (l'artefact « Lit » existe)
  invoquer le skill expert
  OUVRIR l'artefact rendu + contrôle de réception (anti-squelette, cf. §ci-dessus)
  résumer en 2 lignes ce qu'il a produit
  mettre à jour state.md
  annoncer l'étape suivante

à l'étape 05 : poser la porte (state-and-gates.md) → Go | Ajuster | No-Go
```

Voir `state-and-gates.md` pour la tenue précise de `state.md`, la reprise, le protocole de porte et la matrice de retour arrière.
