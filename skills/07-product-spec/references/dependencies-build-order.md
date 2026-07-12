# Référence — Dépendances + build order (étape 6)

Procédure exhaustive pour passer d'un ensemble de features à un **ordre de construction** exploitable par la Phase 3. Le build order vit dans `product-spec.md` (§ Dépendances & build order) — **source unique** depuis la fusion §5 (plus de `feature-prioritization.md` séparé). Il combine deux signaux : **les dépendances** (contrainte dure — ce qui doit exister avant quoi) et **le score RICE** (préférence — quoi apporte le plus de valeur en premier). **La dépendance prime toujours sur le score.**

## Le modèle : un graphe orienté sans cycle (DAG)

Chaque feature Must/Should est un **nœud**. Une flèche `A ─▶ B` signifie « B dépend de A » (A doit être construit avant B). Le build order est un **tri topologique** de ce graphe, affiné par RICE quand plusieurs features sont libres en même temps.

```
        (socle)                                   Légende :  A ─▶ B  =  B dépend de A
     ┌─────────┐
     │  Auth   │────────┬───────────┐
     └─────────┘        │           │
          │             ▼           ▼
          │        ┌─────────┐  ┌─────────┐
          ▼        │ Saisie  │  │ Compte/ │
     ┌─────────┐   └─────────┘  │ profil  │
     │Historique│       │       └─────────┘
     └─────────┘        ▼
          ▲        ┌──────────┐
          │        │Génération│
          └────────└──────────┘
                        │
                        ▼
                   ┌─────────┐
                   │ Export  │
                   └─────────┘

  Tri topologique possible : Auth → Saisie → Compte → Génération → Historique → Export
  (Auth d'abord car tout en dépend ; Export en dernier car il dépend de Génération)
```

## Sous-procédure

1. **Recenser les dépendances.** Pour chaque feature Must/Should, relire le champ **Dépendances** de sa fiche (`features/NN-*.md`). Lister les couples `A ─▶ B`.
2. **Identifier les socles.** Un socle = une feature dont **plusieurs autres** dépendent et qui ne dépend de (presque) rien (auth, modèle de données cœur, saisie de l'entrée). Les socles vont **en tête**.
3. **Trier topologiquement.** Poser les nœuds sans dépendance entrante d'abord, retirer, répéter. À chaque « palier » où **plusieurs** features sont libres, **RICE départage** (score le plus haut d'abord).
4. **Détecter les cycles.** Si le tri bloque (il reste des nœuds mais aucun n'est libre), il y a un **cycle** → le casser (voir plus bas).
5. **Écrire l'ordre** : liste numérotée, chaque item avec **la raison** (« socle / dépend de X / plus haut RICE à ce palier »).

## Règle d'arbitrage : dépendance > RICE

```
  Deux features candidates au même moment ?
        │
        ├─ L'une dépend de l'autre ?  ──oui──▶  la dépendance décide (la prérequise d'abord)
        │
        └─ non, indépendantes ?      ──────▶  RICE décide (score le plus haut d'abord)
```

Une feature à **fort RICE** mais qui **dépend** d'un socle non construit **attend** le socle. Le score n'autorise jamais à violer une dépendance.

## Casser un cycle

Un cycle (`A ─▶ B ─▶ A`) rend le build order impossible. Trois manœuvres, par ordre de préférence :

| Situation | Manœuvre |
|---|---|
| A et B partagent un besoin commun (ex. un modèle de données) | **Extraire un socle** C dont A et B dépendent → le cycle disparaît |
| La dépendance est en réalité **partielle** | Découper la feature : une **v0 minimale** sans la partie qui crée le cycle, puis compléter plus tard |
| La dépendance est **fausse** (confort, pas nécessité) | La **supprimer** : A n'a pas *besoin* de B pour un premier build |

## Critères de passage
- Toutes les dépendances des fiches sont **recensées** (aucune fiche ignorée).
- **Aucun cycle** (le tri topologique aboutit).
- Aucune feature placée **avant** une dépendance dont elle a besoin.
- À chaque palier libre, l'ordre suit le **RICE** décroissant.
- Chaque item du build order porte **sa raison** (socle / dépendance / RICE).
- L'ordre **alimente directement** le plan de la Phase 3 (lisible tel quel).

## Cohérence avec l'aval
Le build order est l'**interface** vers la Phase 3 (`12-build` et son plan). Il doit être exploitable sans retraduction : un socle en tête, des features regroupables en lots parallélisables signalés si pertinent (une feature sans dépendance croisée avec une autre peut être construite en parallèle — utile pour le « 1 feature = 1 worktree » de `lessons.md`, mais **ne pas** planifier le parallélisme ici en détail : c'est le rôle de la Phase 3).

## Micro-exemple (niche-agnostique)

Fiches → dépendances relevées :
- Auth : aucune.
- Saisie : dépend de Auth.
- Génération : dépend de Saisie.
- Export : dépend de Génération.
- Historique : dépend de Auth + Génération.

RICE (extrait) : Génération 960 > Historique 800 > Export 300.

Tri topologique + arbitrage :
```
1. Auth        — socle : tout en dépend
2. Saisie      — dépend d'Auth ; prérequis de Génération
3. Génération  — dépend de Saisie ; plus haut RICE à ce palier
4. Historique  — dépend d'Auth+Génération ; RICE 800
5. Export      — dépend de Génération ; RICE 300, en dernier
```
Note : *Export* a beau être « attendu », il arrive après *Historique* car RICE plus faible **et** aucune dépendance ne le force plus tôt.

## Checklist Definition-of-Done (build order)
- [ ] Dépendances recensées depuis **toutes** les fiches Must/Should.
- [ ] Graphe **sans cycle** (sinon cassé via extraction/découpe/suppression).
- [ ] Ordre = tri topologique **valide** (aucune feature avant sa dépendance).
- [ ] RICE départage **à dépendances égales**, jamais contre une dépendance.
- [ ] Chaque item porte **sa raison**.
- [ ] Build order écrit dans `product-spec.md` § Dépendances & build order (**source unique**).
- [ ] Exploitable tel quel par la Phase 3 (socle en tête, lots clairs).

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Cycle non détecté** | Deux features se dépendent mutuellement | Extraire un socle commun, découper en v0, ou supprimer la fausse dépendance |
| **RICE écrase la dépendance** | Feature à fort score placée avant son socle | Remettre le socle d'abord : dépendance > score |
| **Socle oublié** | Auth/modèle de données non priorisé | L'identifier (plusieurs features en dépendent) et le mettre en tête |
| **Ordre = ordre de la liste** | Build order recopie la numérotation §2 | Refaire le tri à partir du **graphe**, pas de la liste |
| **Dépendance fantôme** | Une dépendance « par confort » bloque l'ordre | La supprimer si la feature peut être construite sans |
| **Build order éparpillé** | On recopie le build order ailleurs et les copies divergent | Source unique = `product-spec.md` ; les autres fichiers renvoient, ne dupliquent pas |
| **Sur-planification du parallélisme** | Plan détaillé de worktrees/agents ici | Rester au build order ; le parallélisme fin = Phase 3 |
