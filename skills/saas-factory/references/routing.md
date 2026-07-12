# Routage & calibrage — le `type` décide de toute la cérémonie

Le `type` capté à l'**étape 1** (`01-discover`, écrit dans `research/idea-brief.md`) est la **variable de routage maîtresse**. Il fixe l'**ambition** (court vs complet) et **quelles étapes sont actives, allégées ou sautées**. Le master l'inscrit dans `.saas-factory/state.md` (champ `Type / route` + `Ambition`) au plus tôt et le respecte jusqu'au bout.

## Les trois routes

| `type` | Ambition | Cérémonie | Ce qu'on saute / allège |
|---|---|---|---|
| **perso** | courte | validation allégée → produit léger → build → deploy | saute marché (**02-04**) et SEO (**16**) ; étape **05** allégée ; portes minimales |
| **interne** | courte | fit-entreprise → produit léger → build → deploy | saute la recherche marché publique (**02-04** → remplacée par un fit-entreprise dans 05) ; SEO (**16**) sauté (usage non public) |
| **public** | complète | pipeline **entier**, **toutes** les portes | rien n'est sauté |

> Règle : le routage **saute des ÉTAPES, jamais des PHASES**. On traverse toujours les 6 orchestrateurs ; certains déroulent moins d'étapes. Une phase « allégée » reste invoquée (elle porte la mise à jour d'état + la porte éventuelle).

## Matrice phase par phase

| Phase | perso | interne | public |
|---|---|---|---|
| **P1** validation | 01 + 05 allégée | 01 + fit-entreprise + 05 | 01→05 complet, porte pleine |
| **P2** product | 06-08 légers (PRD court) | 06-08 (PRD cadré usage interne) | 06-08 complets + charte |
| **P3** tech | 09→11 (autonome) | 09→11 (autonome) | 09→11 (autonome) — identique |
| **P4** build | 12→15, budget d'itération serré | 12→15 | 12→15, cascade complète |
| **P5** launch | **16 sauté** → 17 deploy | **16 sauté** → 17 deploy | **16 SEO** puis 17 deploy |
| **P6** after | 18→19 (métriques légères) | 18→19 (métriques internes) | 18→19 complet |

`16-seo` n'est actif **que** si `type = public` (l'orchestrateur de Phase 5 vérifie déjà cette condition ; le master n'a qu'à propager le `type` via l'état).

## Où le routage se décide, où il s'applique
- **Décidé** : à l'étape 01 (le `type`), relayé par le master dans l'état **dès la fin de P1**.
- **Appliqué** : par chaque orchestrateur de phase, qui lit le `type` dans `.saas-factory/state.md`. Le master n'a pas à micro-piloter : il **transmet le cadrage** et vérifie que l'état porte bien `Type / route` + `Ambition`.

## Cas limites
- **Type ambigu / hésitant** à l'étape 01 : ne devine pas — c'est la seule question de cadrage qui vaut d'être posée franchement, car elle change tout le reste. Par défaut prudent = traiter comme **public** (cérémonie complète) plutôt que de sauter une validation qui manquerait.
- **Changement de type en cours de route** (ex. un « perso » qu'on décide de rendre public) : c'est un **retour arrière** de cadrage → mets à jour `Type / route` dans l'état, et réactive les étapes précédemment sautées (marché 02-04, SEO 16) si la phase concernée n'est pas encore passée. Si elle est passée, signale-le honnêtement (on ne rejoue pas P1 sans le dire).
