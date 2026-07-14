# Référence — Re-dispatch + porte (étapes 5-6) — notre IP

## Sommaire

- Re-dispatch avec budget (étape 5)
- La porte produit — ship / itérer / stop (étape 6)
- Machine à états de l'étape 15 (vue d'ensemble)
- Definition of Done (étapes 5-6)
- Modes d'échec + parade
- Principe (le gate produit, pas code-review)

## Re-dispatch avec budget (étape 5)
Les tâches `ready-for-agent` repartent dans le build : **étape 12** (dev) → **13** (cascade) → **14** (faux-client), puis re-présentation à l'humain. Le tout dans le **budget d'itération** (`_shared/validation-cascade.md`) : un plafond de tours de revue client + un critère de sortie. Budget épuisé → on présente l'état + le bouton **« ship en l'état »**.

### Objectif de passage
Les corrections `ready-for-agent` sont **entrées dans le build** (pas juste listées), le **compteur de budget** est décrémenté et logué dans `state.md`, et l'humain est **re-présenté** au produit corrigé (retour étape 1→2→3) **ou** amené à la porte si le budget est épuisé.

### Sous-procédure (dans l'ordre)
1. **Ne renvoyer que `ready-for-agent`.** Les `parked` restent au backlog, les `ready-for-human` attendent la précision de l'utilisateur, les « pas un vrai problème » ne partent jamais.
2. **Vérifier le budget avant de lancer.** Lire le compteur `Client (15)` dans `state.md`. Budget restant = 0 → **ne pas relancer**, aller directement à la porte avec « ship en l'état ».
3. **Dispatcher dans le build.** Chaque tâche remonte **toute la chaîne** 12 (dev, TDD) → 13 (cascade Tech Lead→CTO→Designer→CEO) → 14 (faux-client A→Z). Elle ne saute aucun cran (`validation-cascade.md`).
4. **Décrémenter et loguer.** Un tour de revue client consommé = 1 de moins au budget ; écrire l'état (`state.md` : plafond / tours consommés).
5. **Re-présenter** ou **porter**. Corrections validées par le build → re-boucle étape 1 (nouveau paquet) → 2 → 3, puis porte. Budget épuisé en cours → porte immédiate.

### Ce qui compte (et ne compte pas) dans le budget
| Événement | Compte pour un tour ? |
|---|---|
| Un lot de corrections re-dispatché puis re-présenté à l'humain | **Oui**, 1 tour |
| Un `ready-for-human` (l'utilisateur précise, on n'a pas rebâti) | Non |
| Un item `parked` | Non |
| Une explication « pas un vrai problème » donnée à la porte | Non |
| Une correction qui échoue le build et re-boucle **en interne** (13→12) | Non (c'est le budget cascade, pas le budget client) |

## La porte produit — ship / itérer / stop (étape 6)
La **décision est à l'humain** (`AskUserQuestion`). Présente : le produit (URL + résumé clair), « ce qui en ressort », les `CONCERNS` restants, et les 3 issues :

| Choix | Ce que ça déclenche |
|---|---|
| **Ship en l'état** | → **Phase 5** (SEO + déploiement). Les `CONCERNS`/`WAIVED` sont **documentés** (changelog / known issues), pas cachés. |
| **Itérer** | On reboucle sur les items retenus (étape 5), **dans le budget**, puis re-porte. |
| **Stop / park** | On **arrête proprement** : on parque l'état + un post-mortem court (façon `_shared/lessons.md` — kill explicite). |

### Recette forcing-question — la porte (`AskUserQuestion`)
- **Ask exact** : « Voici le produit et ce qu'on sait imparfait. **Pour toi**, est-ce assez bon pour être publié en l'état, ou tu veux qu'on corrige encore un point (dans le budget), ou on s'arrête ? »
- **Push-until** (critère : décision **explicite** parmi ship / itérer / stop) : ne jamais franchir sur un « oui je pense » vague. Si « itérer » → **quel** item précis (sinon on ne sait pas quoi renvoyer).
- **Red-flags** (réponses qui ne franchissent PAS la porte) :
  - « Fais comme tu le sens » → **refuser de décider à sa place** ; la décision de ship est à l'humain (c'est tout l'objet de l'étape 15).
  - « On verra plus tard » → clarifier : c'est **stop/park** (décision valide), pas un flottement.
  - Silence / enthousiasme sans choix → reposer les 3 options nettement.
- **Exemplaire** :
  - 🔴 MOU : « Ouais c'est bien, vas-y. » → creuse : ship en l'état **malgré** les limites nommées, confirmé ?
  - 🟢 FORT : « Ship. Les limites que tu as citées, je les assume pour le lancement. » / 🟢 FORT : « Itérer, uniquement sur l'annuler-action, le reste je le garde. »

### Routage par décision
```
Décision de l'humain (AskUserQuestion)
   │
   ├─ SHIP ──► documenter CONCERNS/WAIVED (changelog/known issues)
   │           mettre à jour state.md (porte 15 = Ship)
   │           annoncer Phase 5 (SEO + déploiement) — FIN Phase 4
   │
   ├─ ITÉRER ──► budget restant > 0 ?
   │               ├─ OUI ─► ne garder que l'item nommé ─► étape 5 (re-dispatch) ─► re-porte
   │               └─ NON ─► présenter l'état + « ship en l'état » vs « stop » (pas de boucle infinie)
   │
   └─ STOP/PARK ──► post-mortem court (5 lignes, façon lessons.md — kill explicite)
                    parquer l'état proprement (backlog, artefacts conservés)
                    mettre à jour state.md (porte 15 = Stop)
```

## Machine à états de l'étape 15 (vue d'ensemble)
```
        ┌──────────────────────────────────────────────────┐
        ▼                                                   │
[1 paquet] ─► [2 guider] ─► [3 feedback] ─► [4 → tâches] ─► [5 re-dispatch?]
                                                   │              │
                                        (aucun ready-for-agent)   │ (ready-for-agent + budget>0)
                                                   │              ▼
                                                   │        build 12→13→14 ──┐
                                                   ▼                         │ (re-présenter)
                                             [6 PORTE] ◄─────────────────────┘
                                          ship / itérer / stop
                                             │      │      │
                                          Phase 5  boucle  park + post-mortem
                                                   (budget)
```

## Definition of Done (étapes 5-6)
- [ ] Seuls les `ready-for-agent` re-dispatchés ; `parked`/`ready-for-human`/non-problèmes exclus.
- [ ] Budget lu **avant** de relancer ; épuisé → porte directe avec « ship en l'état ».
- [ ] Chaque tour de revue client décrémenté et **logué** dans `state.md`.
- [ ] Porte franchie **uniquement** sur décision **explicite** (ship / itérer-sur-X / stop).
- [ ] Ship → `CONCERNS`/`WAIVED` **documentés** (jamais cachés) + annonce Phase 5.
- [ ] Stop → post-mortem court + park propre.
- [ ] `state.md` mis à jour (porte 15 + budget) ; aucun secret.

## Modes d'échec + parade
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Boucle infinie** | On itère sans fin sur des détails | Budget borné (`safety-rails` §7) ; épuisé → « ship en l'état » vs « stop » |
| **Décision volée à l'humain** | On ship « parce que c'est prêt » | Interdit : la décision de ship est à l'humain (`AskUserQuestion`) |
| **Franchir sur un vague** | « Je pense que oui » → Phase 5 | Push-until une décision explicite parmi les 3 |
| **`CONCERNS` cachés au ship** | On publie sans documenter les limites | Documenter en known issues/changelog (honnêteté, `lessons.md`) |
| **Expansion renvoyée au build** | Un `parked` repart en correction | Ne re-dispatcher que `ready-for-agent` |
| **Stop sans trace** | On abandonne sans post-mortem | Post-mortem 5 lignes + park (kill explicite, `lessons.md` §9) |
| **Budget non logué** | On ne sait plus combien de tours consommés | Décrémenter + écrire `state.md` à chaque tour |

## Principe (le gate produit, pas code-review)
Contrairement aux gates techniques (étape 13), **celui-ci est produit et humain** : la question n'est pas « le code est-il bon ? » (déjà validé) mais **« est-ce assez bon pour toi, utilisateur, pour être publié ? »**. C'est **notre IP** — aucun skill existant ne fait ce gate produit + ce budget d'itération au niveau produit. Ne franchis jamais sans décision explicite.
