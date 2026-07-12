# Routage & calibrage — le `type` décide de toute la cérémonie

Le `type` capté à l'**étape 1** (`01-discover`, écrit dans `research/idea-brief.md`) est la **variable de routage maîtresse**. Il fixe l'**ambition** (court vs complet) et **quelles étapes sont actives, allégées ou sautées**. Le master l'inscrit dans `.saas-factory/state.md` (champ `Type / route` + `Ambition`) au plus tôt et le respecte jusqu'au bout.

**Ce fichier est LA table canonique étape × type — la seule.** Toute autre mention du routage dans le plugin (orchestrateurs de phase, skills experts) est un **renvoi** (« route selon routing.md ») ; le seul contenu local autorisé ailleurs est le **calibrage de profondeur** d'une étape active, jamais le skip-set. Une copie de matrice hors d'ici est une dérive à corriger, pas une commodité.

## Les trois routes (résumé)

- **public** (SaaS public sérieux) — ambition **complète** : pipeline entier, toutes les portes.
- **interne** (outil d'équipe / B2B fermé) — ambition **courte** : fit-entreprise → produit léger → build → deploy privé.
- **perso** (outil perso / one-off) — ambition **courte** : validation allégée → produit léger → build → deploy sur preview URL.

Le détail vit dans la matrice ci-dessous ; les portes réellement actives par route, dans « Portes actives par type ».

> Règle : le routage **saute des ÉTAPES, jamais des PHASES**. On traverse toujours les 6 orchestrateurs ; certains déroulent moins d'étapes. Une phase « allégée » reste invoquée (elle porte la mise à jour d'état + la porte éventuelle).

## Matrice canonique (étape × type)

| Étape | SaaS public | Outil interne | Outil perso |
|---|---|---|---|
| 01-discover | Exécuter (capte le type en Q1) | Exécuter | Exécuter |
| 02-market | Exécuter | Sauter | Sauter |
| 03-positioning | Exécuter | **Sauter** | Sauter |
| 04-demand-edge | Exécuter | Sauter | Sauter |
| 05-opportunity | Exécuter (complet) | Lite-mode : fit outils/process/sécurité | Lite-mode : utilité récurrente |
| 06-business-model | Exécuter (pricing.md) | Alléger : ROI interne (coût évité), PAS de pricing marché | Sauter |
| 07-product-spec | Exécuter | Exécuter | Alléger |
| 08-design-system | Exécuter | Alléger | Alléger |
| 09-architecture | Exécuter | Exécuter + bloc access-gate | Exécuter + bloc access-gate |
| 10-execution-plan | Exécuter | Exécuter | Exécuter |
| 11-project-setup | Complet (DNS public, email, billing si vend) | Alléger : sous-domaine optionnel, signup désactivé + invitations | Alléger : URL par défaut du provider, pas de DNS, compte unique seedé |
| 12-build | Landing complète exigée | Pas de landing (racine = login) ; gate = « pas de template châssis visible » | Idem interne |
| 14-qa | Parcours avec upgrade si billing | Parcours sans upgrade + test « signup anonyme refusé » | Idem, persona toi |
| 15-client-review | Persona founder | Persona sponsor interne | Toi-même (très court) |
| 16-seo | Exécuter (plafond 3-8 pages) | Sauter + noindex | Sauter + noindex |
| 17-deploy | Complet + porte | Porte conditionnelle + check signup refusé | Preview URL coût nul = pas de porte |
| 18-metrics | Funnel AARRR complet | Adoption interne | Usage réel, allégé |
| 19-retro | Exécuter | Exécuter | Alléger (mémoire conservée) |

**Tranché : `03-positioning` est SAUTÉE pour un outil interne.** Pas d'edge concurrentiel à formaliser — le fit-entreprise du lite-mode de 05 couvre le besoin. Toute mention contraire ailleurs (« interne → allège 03 ») est périmée : cette table fait foi.

(`13-reviews` n'apparaît pas : la cascade tourne pour **tous** les types — c'est sa *rigueur* qui se calibre, dans la Phase 4.)

## Portes actives par type (la liste réelle)

| Porte | public | interne | perso |
|---|---|---|---|
| 🚪 Opportunité (05) | Go / Ajuster / Go-test / No-Go complet | décision d'utilité interne | décision build/non, très courte |
| 🚪 PRD (07) | oui | oui | oui (validation courte) |
| 🚪 Charte (08) | oui | oui | oui (1 décision de direction) |
| 🚪 Client-review (15) | oui — persona founder | oui — sponsor interne | oui — toi-même, très court |
| 🚪 Gate contenu SEO (16) | oui | — (16 sautée) | — (16 sautée) |
| 🚪 Publication (17) | oui — plan-then-apply complet | oui — conditionnelle + check « signup anonyme refusé » | **non** si cible = preview URL du provider à coût nul ; **oui** dès que ça touche un domaine public ou que ça dépense |
| 🚪 Kill / Continue (19) | oui, argumentée | oui | oui (peut être informelle) |

## Garde-fous (à conserver tels quels)

- **Étapes sautées tracées** dans `state.md` (« 02-market : sautée (route perso) »), jamais silencieuses.
- **Sections « non applicable » explicites** dans les artefacts : on dit ce qui manque par conception, on ne comble pas.
- **Interdiction de fabriquer un marché manquant** : une route sans 02-04 ne « devine » pas de données marché.
- **Défaut prudent = public** : type ambigu / hésitant à l'étape 01 → ne devine pas — c'est la seule question de cadrage qui vaut d'être posée franchement, car elle change tout le reste. À défaut, cérémonie complète plutôt que sauter une validation qui manquerait.
- **Déploiement interne ≠ déploiement bâclé** : pré-vol, plan, apply réversible, canary restent — seule la surface publique change.

## Où le routage se décide, où il s'applique

- **Décidé** : à l'étape 01 (le `type`), relayé par le master dans l'état **dès la fin de P1**.
- **Appliqué** : par chaque orchestrateur de phase, qui lit le `type` dans `.saas-factory/state.md` et **route selon ce fichier**. Le master n'a pas à micro-piloter : il **transmet le cadrage** et vérifie que l'état porte bien `Type / route` + `Ambition`.

## Cas limites

- **Changement de type en cours de route** (ex. un « perso » qu'on décide de rendre public) : c'est un **retour arrière** de cadrage → mets à jour `Type / route` dans l'état, et réactive les étapes précédemment sautées (marché 02-04, SEO 16) si la phase concernée n'est pas encore passée. Si elle est passée, signale-le honnêtement (on ne rejoue pas P1 sans le dire).
