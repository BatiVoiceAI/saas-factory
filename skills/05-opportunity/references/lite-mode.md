# Référence — Étape 5 allégée (`type = perso` ou `interne`)

Pour ces routes, il n'y a **pas d'analyse de marché** (étapes 2·3·4 sautées, cf. `conventions.md` — routage par type). La question **change de nature** :

```
  type = public   →  « le marché en veut-il ? »       (verdict marché)
  type = interne  →  « ça FIT nos outils/process ? »   (verdict d'adoption)
  type = perso    →  « est-ce assez utile pour moi ? »  (verdict d'utilité)
```

On ne surdimensionne pas : la décision porte sur l'**utilité / le fit**, pas sur un TAM. Ne fabrique **jamais** un marché manquant pour « remplir » le brief.

## Livrables réduits

| Type | Ce qu'on écrit | Ce qu'on N'écrit PAS |
|---|---|---|
| **perso** | `opportunity-summary.md` **court** : besoin réel + effort vs gain + non-goals + porte | Pas de brief marché, pas de concurrents, pas de taille |
| **interne** | `opportunity-summary.md` centré **fit** : outils/process/sécurité + effort vs gain + non-goals + porte | Pas d'edge concurrentiel, pas de SAM/TAM |

Le `opportunity-brief.md` complet est **optionnel** ici : s'il est écrit, il ne contient que ce qui existe réellement (besoin, contraintes, non-goals) — sections marché laissées explicitement « non applicable (route allégée) ».

## Recette forcing — route `perso` (« est-ce utile POUR TOI ? »)
- **Ask exact** : « Cet outil te sert à **toi**. Concrètement, tu t'en sers combien de fois par semaine, et qu'est-ce que tu fais aujourd'hui à la place ? »
- **Push jusqu'à** : un **usage concret et récurrent** (« 3× / semaine, aujourd'hui je bricole dans un tableur »). Un « ça pourrait être pratique » n'est pas un usage.
- **Red flags à refuser** : « ce serait cool », « un jour peut-être », « ça pourrait servir à d'autres » (si ça vise d'autres, ce n'est plus `perso` → re-router en `public`).
- **MOU** : « Ça m'aiderait à mieux m'organiser. »
- **FORT** : « Je relance mes factures à la main chaque lundi (~30 min) ; un outil qui le fait me rendrait ces 30 min/semaine. Effort de build estimé : 1 week-end. Gain récurrent net → ça vaut le coup. »

## Recette forcing — route `interne` (« ça FIT la boîte ? »)
- **Ask exact** : « Ça doit s'insérer dans vos outils et vos règles existantes. Ça remplace quoi, ça se branche sur quoi, et quelles contraintes de sécurité/données s'appliquent ? »
- **Push jusqu'à** : un **fit vérifié** sur les 3 dimensions — outils (intégrations), process (qui l'utilise, à quelle étape), sécurité (données, accès, conformité interne).
- **Red flags à refuser** : « on verra pour l'intégration », « la sécurité on gérera après » (un blocage sécurité/données est un **tueur** ici, comme un tueur marché en `public`).
- **MOU** : « Ça ferait gagner du temps à l'équipe. »
- **FORT** : « Remplace 2 exports manuels/semaine de l'équipe ops (~2 h) ; se branche sur l'outil X déjà en place ; données non sensibles, reste intra-SI → fit OK. Effort ~1 semaine. Gain net positif. »

## La porte reste explicite (même protocole)

Même en allégé, la porte est **Go / Ajuster / No-Go** via `AskUserQuestion` (cf. `gate-and-routing.md`). Le HARD GATE tient. Adaptations :

| Issue | perso / interne |
|---|---|
| **Go** | On passe au build (Phase 2) — cadrage réduit à l'utile |
| **Ajuster** | Reboucle sur `01-discover` (le besoin/fit est mal cerné — pas de 02/03/04 à réviser) |
| **No-Go** | Post-mortem 5 lignes (l'utilité/le fit ne justifie pas l'effort) + `state.md` |

## Definition of Done — mode allégé
- [ ] `type` = perso ou interne confirmé depuis `idea-brief.md`.
- [ ] Question recadrée sur utilité (perso) ou fit (interne), **pas** sur le marché.
- [ ] Usage concret/récurrent (perso) ou fit 3-dimensions vérifié (interne) obtenu.
- [ ] Effort vs gain posé + non-goals nommés.
- [ ] Aucun marché fabriqué ; sections N/A dites explicitement.
- [ ] Porte explicite Go/Ajuster/No-Go posée.

## Modes d'échec du mode allégé
- **Le surdimensionnement.** Sortir une analyse marché complète pour un outil perso. *Parade :* la question est l'utilité, pas le TAM.
- **Le faux perso.** L'idée vise en fait d'autres utilisateurs → devrait être `public`. *Parade :* si ça sert des tiers, re-router en `public`.
- **La sécurité repoussée (interne).** Traiter le fit sécurité « pour plus tard ». *Parade :* un blocage données/accès est un tueur — il tranche la porte.
- **Le marché fabriqué.** Combler l'absence de 02-04 par des chiffres inventés. *Parade :* case vide = « non applicable (route allégée) ».
