# Référence — La porte, le routage & la clôture (procédure des étapes 5 & 6)

L'étape 5 **est** la porte de sortie de la Phase 1 — la seule barrière avant de dépenser le moindre effort produit. **HARD GATE : on n'écrit jamais la suite sans la réponse explicite de l'utilisateur.**

## Machine à états de la porte

```
         [résumé + verdict présentés]
                    │
              AskUserQuestion
        ┌───────────┼───────────────┐
        ▼           ▼               ▼
      Go         Ajuster          No-Go
        │           │               │
        │           │               ▼
        │           │        post-mortem.md (5 lignes)
        │           │        state.md : arrêt
        │           │               │
        │           ▼             (fin propre)
        │   reboucle étape faible
        │   (01/02/03/04) → MAJ inputs
        │           │
        │      REPASSE par étape 5  ◄── retour à la porte
        ▼
   Phase 1 TERMINÉE
   state.md : porte franchie = Go
        │
        ▼
   Phase 2 (cadrage produit)
```

Le retour arrière est autorisé **à tout moment** (cf. protocole de porte, `conventions.md`).

## Recette forcing — poser la porte (`AskUserQuestion`)

- **Présente d'abord** : le résumé 1-2 pages + ton verdict net (avec sa clause de bascule). Pas le brief entier — le résumé se suffit.
- **Ask exact** : trois issues nommées, **Go / Ajuster / No-Go**, chacune avec sa conséquence en une ligne (ce que ça déclenche).
- **Push jusqu'à** : une des trois est **choisie**. Un « peut-être », « on verra », « ça dépend » n'est **pas** une réponse → reformule le trade-off et redemande.
- **Red flags — réponses à ne pas traiter comme un franchissement** :
  - Silence / évitement → repose la question, ne présume rien.
  - « Fais au mieux » / « à toi de voir » → la porte est une décision **de l'utilisateur** ; rappelle l'enjeu (c'est du temps/argent) et redemande.
  - Enthousiasme vague sans choix (« super idée ! ») → « Est-ce un Go, alors ? » — force le mot.
- **Anti-flagornerie à la porte** : ne pousse pas au Go pour faire plaisir. Si ton verdict est No-Go, la recommandation par défaut affichée est No-Go, même si l'utilisateur semblait attaché à l'idée.

## Matrice de routage du « Ajuster » — vers l'étape qui a produit le maillon faible

| Maillon faible identifié | Reboucle vers | Ce qu'on y refait |
|---|---|---|
| Cible floue / problème mal cadré | `01-discover` | Resserrer persona + problème |
| Marché mal dimensionné / concurrents mal vus | `02-market` | Re-sizer, re-profiler |
| Positionnement / catégorie bancals | `03-positioning` | Re-cadrer catégorie & angle (April Dunford) |
| Demande ténue / edge absent | `04-demand-edge` | Re-miner les avis, chercher l'angle |

Après reboucle : **mettre à jour les inputs concernés**, puis **repasser par l'étape 5** (retour à la porte avec les artefacts rafraîchis). On ne saute jamais la re-synthèse.

## Procédure — `research/post-mortem.md` (si No-Go)

**Exactement 5 lignes**, sans dramatiser. Un No-Go documenté a **économisé** le build — c'est une réussite de la méthode (lessons.md, règle n°9 : kill explicite).

```
1. L'idée en une phrase : <…>
2. Le fait qui tue : <le blocage précis, sourcé si possible>
3. Ce qu'on a appris (le point non évident) : <…>
4. Ce qui aurait pu changer la donne : <la condition de bascule>
5. Statut : No-Go — <date>
```

**DoD post-mortem :**
- [ ] Exactement 5 lignes.
- [ ] Ligne 2 = un **fait**, pas un ressenti.
- [ ] Ligne 3 = un apprentissage réutilisable, pas une évidence.
- [ ] Ton factuel, zéro drame.

## Clôture de l'état (étape 6) — `.saas-factory/state.md`

Schéma : `_shared/state-schema.md`. Mets à jour **en sortie**, quelle que soit l'issue.

| Champ | Go | Ajuster | No-Go |
|---|---|---|---|
| Étape courante | passe à Phase 2 / étape 6-7 | reste étape 5 (reboucle en cours) | figée |
| Statut | fait | porte en attente | fait (arrêt) |
| Portes franchies → « Opportunité (étape 5) » | Go + date | — (pas encore franchie) | No-Go + date |

**Jamais de secret / clé** dans `state.md` (safety-rails §4). Puis **résume en 2 lignes** et annonce la suite : Phase 2, reboucle sur l'étape X, ou arrêt propre.

## Definition of Done — porte & clôture
- [ ] Résumé + verdict présentés **avant** la question.
- [ ] `AskUserQuestion` posé avec les 3 issues + conséquences.
- [ ] Une issue **explicitement** choisie (pas de « peut-être » accepté).
- [ ] Aucune écriture de la suite avant la réponse (HARD GATE respecté).
- [ ] Si No-Go → post-mortem 5 lignes écrit.
- [ ] `state.md` mis à jour (étape, statut, porte) — sans secret.
- [ ] Résumé 2 lignes + annonce de la suite.

## Modes d'échec de la porte
- **Le franchissement présumé.** Enchaîner sur la suite sans réponse claire. *Parade :* HARD GATE, ne rien écrire tant que le mot n'est pas dit.
- **La délégation de décision.** « Fais au mieux » traité comme un Go. *Parade :* renvoyer la décision à l'utilisateur, redemander.
- **Le Ajuster sans re-porte.** Reboucler puis foncer en Phase 2 sans repasser l'étape 5. *Parade :* la machine à états impose le retour à la porte.
- **Le No-Go non tracé.** Arrêt sans post-mortem ni state.md. *Parade :* DoD clôture.
- **Le drame.** Post-mortem culpabilisant. *Parade :* ton factuel — un kill est une économie.
