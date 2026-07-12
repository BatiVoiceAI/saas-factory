# Référence — Guider le test (étape 2)

Comment faire tester l'humain **sans qu'il se perde**. Le recueil du feedback (étape 3) a sa propre référence : `references/feedback-elicitation.md`.

## Objectif de passage
L'humain a **effectivement parcouru** les 2-3 parcours cœur + l'edge, dans le navigateur, **sans blocage technique** et **sans avoir eu besoin de comprendre le produit à l'avance**. Critère de sortie : chaque parcours de la checklist est soit **fait**, soit **explicitement bloqué** (un blocage = un bug, note-le, n'insiste pas).

## Sous-procédure (dans l'ordre)
1. **Dériver les parcours du PRD, pas des features.** Reprends le **workflow cœur** (`product/product-spec.md`) et l'**edge** (la différenciation). Traduis-les en **actions utilisateur** concrètes, verbe à l'impératif : « crée X », « envoie Y », « vérifie que Z apparaît ».
2. **Ordonner comme un vrai usage.** Onboarding minimal → action cœur → résultat visible → l'edge. L'humain doit ressentir le **fil naturel**, pas une liste de tests.
3. **Limiter à 2-3 parcours + 1 edge.** Au-delà, l'humain fatigue et le feedback se dilue. Priorise ce qui **décide du ship**.
4. **Rendre chaque étape observable.** Chaque action se termine par un **résultat visible** que l'humain peut juger (« le PDF s'ouvre », « le total se met à jour »). Sans résultat observable, l'humain ne sait pas s'il a réussi.
5. **Choisir le mode de guidage** (voir matrice). Conversationnel par défaut ; tour in-app si le produit a une courbe d'entrée.
6. **Accompagner en direct.** Sur blocage : **ne dépanne pas techniquement**, note « bloqué à l'étape N » (c'est un signal produit), propose de sauter et de continuer.

## Construire la checklist
Une **checklist courte « essaie ça »** : les 2-3 **parcours cœur** (A→Z) + l'**edge**. Formulée en **actions utilisateur simples** (« crée un devis vocal, envoie-le, vérifie le PDF »), pas en features techniques. *(Base : `kata-verify-work` — UAT conversationnelle guidée, persona **founder** non-tech.)*

**Recette de formulation** :
- ✅ Action + objet + résultat attendu observable : « **Crée** un projet, **invite** un collègue, **vérifie** qu'il apparaît dans la liste. »
- ❌ Feature technique : « Teste le CRUD projet et le système d'invitation multi-tenant. »
- ✅ Une action par ligne, numérotée, dans l'ordre de réalisation.
- ❌ Un paragraphe touffu où l'humain doit décider quoi faire.

## Matrice de décision — mode de guidage
| Condition | Mode | Pourquoi |
|---|---|---|
| Produit simple, parcours évident | **Conversationnel** (checklist « essaie ça ») | Zéro dépendance, le défaut |
| Courbe d'entrée / UI dense | **Tour in-app** (shepherd.js / driver.js, MIT) | Le produit se montre lui-même |
| Humain à distance / async | **Checklist écrite** + résultats attendus | Il avance à son rythme |
| Humain disponible en live | **Accompagnement pas-à-pas** | On capte les hésitations en direct (or du feedback) |
| Edge difficile à atteindre seul | **Guidage renforcé sur l'edge** | La différenciation doit être vue, c'est ce qui décide |

Option (si tour *in-app* souhaité) : un tour guidé sur le staging via **shepherd.js / driver.js** (MIT). Sinon, **guidage conversationnel par défaut**.

## Definition of Done (étape 2)
- [ ] 2-3 parcours cœur + 1 edge, en actions utilisateur (impératif), numérotées.
- [ ] Chaque action se termine par un **résultat observable**.
- [ ] Zéro terme technique dans la checklist.
- [ ] Mode de guidage choisi selon la matrice.
- [ ] Chaque parcours est **fait** ou **explicitement bloqué** (blocage noté comme signal).

## Machine à états d'un parcours guidé
```
[Proposer l'action] ──► l'humain agit
       │
       ├─ résultat attendu observé ──► [Parcours suivant]
       ├─ hésitation / cherche où cliquer ──► note « friction UX » ──► on aide, on continue
       └─ blocage (rien ne se passe / erreur) ──► note « BUG: bloqué à l'étape N »
                                                  on NE dépanne PAS techniquement
                                                  on propose de sauter ──► [Parcours suivant]
```

## Modes d'échec + parade
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Checklist-cahier-des-charges** | On liste des features, l'humain ne sait pas agir | Réécrire en actions + résultat observable |
| **Trop de parcours** | L'humain fatigue, feedback dilué | Couper à 2-3 + 1 edge |
| **Dépannage technique en direct** | On « répare » à sa place → le bug est masqué | Noter le blocage, ne pas dépanner, continuer |
| **Edge jamais atteint** | L'humain reste sur le happy path | Guidage renforcé sur l'edge (c'est ce qui décide du ship) |
| **Pas de résultat observable** | L'humain ne sait pas s'il a réussi | Ajouter « vérifie que … apparaît » à chaque étape |

## Micro-exemple (niche-agnostique)
> **Essaie ça (5 min).**
> 1. Crée un nouvel élément depuis le bouton principal — vérifie qu'il apparaît dans ta liste.
> 2. Ouvre-le, modifie une info, enregistre — vérifie que le changement tient après rechargement.
> 3. **(L'edge)** Lance l'action-signature du produit — vérifie que le résultat est bien celui promis.
> Si à un moment rien ne se passe : dis-le-moi et saute à l'étape suivante, c'est exactement ce que je veux repérer.

## Principe
L'humain **teste**, il ne **débogue** pas. Notre job : rendre le parcours évident et **transformer chaque friction en signal** (pas en dépannage silencieux). Zéro friction imposée à lui, zéro jargon.
