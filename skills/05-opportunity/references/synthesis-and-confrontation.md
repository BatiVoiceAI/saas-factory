# Référence — Synthèse & confrontation des 4 inputs (procédure de l'étape 1)

L'étape 5 ne lance **aucune recherche neuve**. Sa valeur naît **de la confrontation** : mettre les 4 artefacts côte à côte et faire ressortir les **tensions** que chaque étape amont, prise isolément, ne pouvait pas voir. Une synthèse qui se contente de recopier les 4 fichiers a raté sa mission.

## Data-flow — d'où vient quoi

```
        AMONT (déjà produit)                       CETTE ÉTAPE
  ┌────────────────────────────┐
  │ 01 idea-brief.md           │ problème · cible · type/route
  │ 02 market.md + confidence  │ taille · dynamique · concurrents · confiance
  │ 03 positioning.md          │ catégorie · alternatives · angle
  │ 04 demand-signals.md       │ signal par proxy · edge (ou absence)
  └─────────────┬──────────────┘
                │  charge les 4, NE re-fouille PAS
                ▼
      ┌───────────────────┐   confronte deux à deux
      │  MATRICE DE        │   → repère contradictions
      │  CONFRONTATION     │   → nomme les tensions
      └─────────┬─────────┘
                ▼
     opportunity-brief.md  (le détaillé, traçable)
     opportunity-summary.md (le POURQUOI, l'humain lit)
```

## Lecture ciblée de chaque input (quoi extraire, dans quel ordre)

Ne relis pas les 4 fichiers en entier « pour t'imprégner ». Extrais **exactement** ceci, dans cet ordre :

| Input | Ce que tu en sors | Le piège à éviter |
|---|---|---|
| `idea-brief.md` | Problème + cible + **`type`** (public/interne/perso) | Prendre le problème d'origine tel quel alors que 02-04 l'ont nuancé |
| `market.md` | Taille (avec hypothèse), dynamique, top concurrents + leur force | Recopier un chiffre nu sans l'hypothèse de calcul |
| `confidence.md` | Le **score de confiance** de la recherche marché + ses trous | L'ignorer : une confiance basse doit teinter tout le verdict |
| `positioning.md` | Catégorie retenue, alternatives réelles, angle | Confondre « angle marketing » et « edge produit » |
| `demand-signals.md` | Signal **par proxy** + edge (ou son absence assumée) | Lire le proxy comme une demande *prouvée* |

**Règle de confiance héritée.** Si `confidence.md` est bas sur une dimension, le verdict final ne peut pas être plus confiant que sa source la plus faible. On ne « remonte » jamais la confiance en aval.

## La matrice de confrontation (le cœur de l'étape)

Confronte les inputs **deux à deux** et cherche activement la contradiction. C'est là que se cachent les décisions.

| Croisement | Tension à débusquer | Ce qu'une synthèse honnête écrit |
|---|---|---|
| demande × marché | Douleur forte **mais** 40 concurrents installés | « Problème réel *et* créneau saturé » — pas un tiède moyenné |
| marché × edge | Marché gros **mais** aucun edge net | « Pari exécution + niche » (viable) — pas « on trouvera un edge » |
| demande × edge | Edge séduisant **mais** personne ne réclame ce manque | « Solution en quête de problème » — red flag |
| positioning × marché | Angle clair **mais** catégorie en déclin | « Bien positionné sur un radeau qui coule » |
| confidence × tout | Verdict fort **mais** confiance recherche basse | « Verdict provisoire, à re-solidifier sur X » |
| idea-brief × 02-04 | La cible d'origine a été **démentie** par la recherche | « Tu visais X, la donnée pousse vers Y » |

**Interdit :** moyenner deux signaux opposés pour produire un « ça peut marcher » rassurant. Une tension se **nomme**, elle ne se dissout pas.

### Recette forcing — nommer la tension (usage interne, pas de question à l'utilisateur ici)
- **Cherche jusqu'à** : au moins **1 contradiction explicite** entre deux inputs, ou la preuve écrite qu'il n'y en a pas (« les 4 inputs convergent : demande proxy + marché en croissance + edge net + peu de concurrents »).
- **Red flags à refuser dans ta propre synthèse** : « globalement positif », « plutôt prometteur », « quelques concurrents mais de la place » (flou), tout adjectif sans chiffre ni source derrière.
- **MOU** : « Le marché est intéressant et la demande semble là. » → recopie déguisée, zéro tension.
- **FORT** : « [Data] 5 concurrents notés >4/5 se partagent le créneau ; [Assumption] la demande proxy est réelle mais banalisée → la vraie question n'est pas *y a-t-il un besoin* mais *pourquoi te choisir eux installés*. »

## Matrice — input manquant (routage selon le `type`)

Un input peut manquer légitimement (route allégée) ou anormalement (bug amont). Traite les deux **explicitement**, ne comble jamais.

| Situation | `type` | Action |
|---|---|---|
| `market.md` absent | interne / perso | **Normal** (étape 2 sautée) → bascule en mode allégé, cf. `lite-mode.md` |
| `market.md` absent | public | **Anormal** → dis-le dans le livrable (« marché non analysé »), NE fabrique pas de taille, signale un flag |
| `demand-signals.md` absent | public | Anormal → verdict impossible à solidifier ; propose de reboucler sur 04 avant de trancher |
| `confidence.md` absent | public | Traite la confiance comme **inconnue** → verdict plus humble encore |
| `positioning.md` absent | interne | Souvent normal (pas d'edge concurrentiel visé) → note-le, continue |

**Principe unique :** une case vide **se dit** (« non disponible — étape X non exécutée / à reboucler »). Elle ne se remplit jamais par une supposition plausible. Un blanc honnête vaut mieux qu'un chiffre inventé.

## Definition of Done — étape 1 (synthèse)
- [ ] Les 4 (ou N) inputs chargés, extraits ciblés faits.
- [ ] `type` relu depuis `idea-brief.md` → mode complet ou allégé décidé.
- [ ] Score de `confidence.md` intégré comme plafond de confiance du verdict.
- [ ] Au moins une passe de la matrice de confrontation faite ; tensions **nommées** (ou convergence prouvée).
- [ ] Chaque input manquant qualifié (normal vs anormal) et tracé — rien de comblé.

## Modes d'échec de cette étape
- **La moyenne tiède.** Deux signaux opposés → un « mitigé » confortable. *Parade :* la matrice de confrontation oblige à nommer, pas à moyenner.
- **La recopie.** Le brief final = copier-coller des 4 inputs. *Parade :* si aucune tension ni lecture nouvelle n'émerge, la synthèse n'existe pas — recommence la confrontation.
- **La confiance qui remonte.** Recherche peu sûre → verdict très sûr. *Parade :* plafond de confiance hérité de `confidence.md`.
- **Le comblage.** Input manquant rempli « au plausible ». *Parade :* case vide = phrase explicite, jamais une valeur.
