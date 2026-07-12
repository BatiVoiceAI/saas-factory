# Référence — Synthèse & confrontation des 4 inputs (procédure de l'étape 1)

L'étape 5 ne lance **aucune recherche neuve**. Sa valeur naît **de la confrontation** : mettre les 4 artefacts côte à côte et faire ressortir les **tensions** que chaque étape amont, prise isolément, ne pouvait pas voir. Une synthèse qui se contente de recopier les 4 fichiers a raté sa mission.

## Data-flow — d'où vient quoi

```
        AMONT (déjà produit)                       CETTE ÉTAPE
  ┌────────────────────────────┐
  │ 01 idea-brief.md           │ problème · cible · type/route
  │ 02 market.md (§Fiabilité)  │ taille · dynamique · concurrents · confiance (§Fiabilité)
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
     opportunity-brief.md  (UN livrable : §Décision/POURQUOI en tête + le détaillé traçable)
```

## Lecture ciblée de chaque input (quoi extraire, dans quel ordre)

Ne relis pas les 4 fichiers en entier « pour t'imprégner ». Extrais **exactement** ceci, dans cet ordre :

| Input | Ce que tu en sors | Le piège à éviter |
|---|---|---|
| `idea-brief.md` | Problème + cible + **`type`** (public/interne/perso) | Prendre le problème d'origine tel quel alors que 02-04 l'ont nuancé |
| `market.md` § « Taille servable & dynamique » | Taille servable + dynamique (**hérités** — jamais recalculés ici), + §Dossiers/§Prix (concurrents nommés + leur force + prix) | Recopier un chiffre nu sans l'hypothèse ; improviser une taille si la section manque (input anormal → flag) |
| `market.md` §Fiabilité (ex-`confidence.md`) | Le **score de confiance** de la recherche marché + ses trous | L'ignorer : une confiance basse doit teinter tout le verdict |
| `positioning.md` | Catégorie retenue, alternatives réelles, angle | Confondre « angle marketing » et « edge produit » |
| `demand-signals.md` | Signal **par proxy** + edge (ou son absence assumée) | Lire le proxy comme une demande *prouvée* |

**Règle de confiance héritée.** Si `market.md` §Fiabilité est bas sur une dimension, le verdict final ne peut pas être plus confiant que sa source la plus faible. On ne « remonte » jamais la confiance en aval.

## La matrice de confrontation (le cœur de l'étape)

Confronte les inputs **deux à deux** et cherche activement la contradiction. C'est là que se cachent les décisions.

| Croisement | Tension à débusquer | Ce qu'une synthèse honnête écrit |
|---|---|---|
| demande × marché | Douleur forte **mais** 40 concurrents installés | « Problème réel *et* créneau saturé » — pas un tiède moyenné |
| marché × edge | Marché gros **mais** aucun edge net | « Pari exécution + niche » (viable) — pas « on trouvera un edge » |
| demande × edge | Edge séduisant **mais** personne ne réclame ce manque | « Solution en quête de problème » — red flag |
| positioning × marché | Angle clair **mais** catégorie en déclin | « Bien positionné sur un radeau qui coule » |
| §Fiabilité × tout | Verdict fort **mais** confiance recherche basse (§Fiabilité) | « Verdict provisoire, à re-solidifier sur X » |
| idea-brief × 02-04 | La cible d'origine a été **démentie** par la recherche | « Tu visais X, la donnée pousse vers Y » |

**Interdit :** moyenner deux signaux opposés pour produire un « ça peut marcher » rassurant. Une tension se **nomme**, elle ne se dissout pas.

## Énumérer les risques — mini-taxonomie (5 familles)

Le 4e axe du verdict (Risques) exige une **énumération**, pas une intuition. Passe les 5 familles sur les 4 inputs : famille vide → écris « rien d'identifié » ; famille pleine → nomme le risque + sa preuve. Puis ordonne **tueur d'abord** (un seul non contournable = axe Risques **Faible** → No-Go tendanciel, cf. `verdict-engine.md`).

| Famille | La question à se poser | Exemple de tueur |
|---|---|---|
| **Marché** | Le créneau se ferme-t-il (déclin, saturation, mauvais timing) ? | catégorie en déclin structurel |
| **Concurrence** | Un incumbent peut-il l'absorber d'un geste (bundle, gratuit, riposte rapide) ? | leader qui offre la feature en standard demain |
| **Exécution / technique** | Une dépendance ou une complexité peut-elle couler le build (API tierce critique, intégration lourde, données introuvables) ? | tout repose sur une API fermée ou hors budget |
| **Distribution** | Sait-on **atteindre** la cible à coût sain (canal, accès, CAC) ? | cible injoignable hors salons physiques |
| **Réglementaire / dépendance** | Une règle ou une plateforme tierce peut-elle interdire ou étrangler (RGPD, données sensibles, CGU d'un tiers) ? | produit dépendant d'un scraping que les CGU interdisent |

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
| `market.md` §Fiabilité absente | public | Traite la confiance comme **inconnue** → verdict plus humble encore |
| `positioning.md` absent | interne | Souvent normal (pas d'edge concurrentiel visé) → note-le, continue |

**Principe unique :** une case vide **se dit** (« non disponible — étape X non exécutée / à reboucler »). Elle ne se remplit jamais par une supposition plausible. Un blanc honnête vaut mieux qu'un chiffre inventé.

## Definition of Done — étape 1 (synthèse)
- [ ] Les 4 (ou N) inputs chargés, extraits ciblés faits.
- [ ] `type` relu depuis `idea-brief.md` → mode complet ou allégé décidé.
- [ ] Score de `market.md` §Fiabilité intégré comme plafond de confiance du verdict (reporté dans §Fiabilité du dossier du brief).
- [ ] Au moins une passe de la matrice de confrontation faite ; tensions **nommées** (ou convergence prouvée).
- [ ] Les **5 familles de risques** passées : risques nommés + preuve, ordonnés tueur d'abord (ou « rien d'identifié » par famille).
- [ ] Chaque input manquant qualifié (normal vs anormal) et tracé — rien de comblé.

## Modes d'échec de cette étape
- **La moyenne tiède.** Deux signaux opposés → un « mitigé » confortable. *Parade :* la matrice de confrontation oblige à nommer, pas à moyenner.
- **La recopie.** Le brief final = copier-coller des 4 inputs. *Parade :* si aucune tension ni lecture nouvelle n'émerge, la synthèse n'existe pas — recommence la confrontation.
- **La confiance qui remonte.** Recherche peu sûre → verdict très sûr. *Parade :* plafond de confiance hérité de `market.md` §Fiabilité.
- **Le comblage.** Input manquant rempli « au plausible ». *Parade :* case vide = phrase explicite, jamais une valeur.
