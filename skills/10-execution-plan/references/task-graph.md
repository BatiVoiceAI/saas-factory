# Référence — Graphe de tâches, ordonnancement & parallélisation

Comment décomposer le build en un graphe de tâches ordonné et parallélisé pour les agents. C'est le cœur du skill : les autres références (`reuse-vs-build.md`, `delegation.md`, `validation-spec.md`) branchent dessus.

---

## Sommaire

- Vue d'ensemble — le data-flow du composer
- Décomposition en tâches TDD
- Walking skeleton d'abord
- Analyse de dépendances → lanes
- Passe d'intégration (ne pas l'oublier)
- Definition of Done — le graphe est-il prêt à livrer aux agents ?
- Modes d'échec (à prévenir activement)
- Sortie (dans `tech/execution-plan.md`)

## Vue d'ensemble — le data-flow du composer

```
tech/architecture.md ─┐
  (modules, données,  │
   data flows, NFR)   │
product/features/*   ─┼─▶ [2] réutilisation vs build ──▶ [3] décomposition TDD ──▶ [4] walking skeleton
product/mvp-def.     ─┤        (reuse-vs-build.md)          (tâches + zones code)      (tranche verticale)
_shared/blocks/      ─┘                                             │                          │
                                                                   ▼                          ▼
                                                          [4] analyse dépendances ──▶ [4] lanes (// vs séq.)
                                                                   │                          │
                                                                   ▼                          ▼
                                                          [5] carte délégation ──▶ [6] specs validation ──▶ tech/execution-plan.md
                                                          (delegation.md)          (validation-spec.md)
```

Règle cardinale (rappel `_shared/lessons.md` §3-4) : **le plan sert les agents, pas un humain**. Jamais un calendrier, jamais de jours. On optimise pour le **contexte**, les **tokens** et l'**absence de collision**.

---

## Décomposition en tâches TDD

Chaque **feature** (du PRD) → une ou plusieurs **tâches**. Chaque tâche :
- est **TDD** : test rouge → implémentation → vert → commit citant la tâche (`T7: …`) ;
- est mappée à une **zone de code** (module / dossier précis) ;
- a une **taille agent-friendly** : assez petite pour tenir dans le contexte d'un sous-agent, assez grande pour être cohérente.

Sépare les tâches de **câblage de bloc** (réutilisation `_shared/blocks/`, rapides) des tâches de **build custom** (la verticale). Le split lui-même est fait à l'étape [2] — voir `reuse-vs-build.md`. Les tâches de câblage dont le bloc est posé par le scaffold (étape 11) portent le tag **`[pré-câblé]`** dans le graphe : leur test rouge d'entrée cible le **delta** (config / extension), jamais le déjà-fait (règle complète : `reuse-vs-build.md §Tâches « pré-câblées au scaffold »`).

### Recette de découpage (déterministe)
1. Prends une feature Must/Should. Relis ses **user stories** et ses **critères d'acceptation**.
2. Trace la **couture verticale** de la feature à travers les couches : donnée (migration/RLS) → API/action → logique → UI → état. Chaque couture qui **traverse une frontière de module** est un candidat-tâche.
3. Regroupe ce qui partage la **même zone de code** et le **même test rouge naturel** dans une seule tâche. Sépare ce qui touche des zones distinctes.
4. Nomme chaque tâche par son **verbe + livrable + zone** : « T7 · CRUD `projets` (migration + RLS) · `supabase/` ». Pas « travailler sur les projets ».
5. Attache à chaque tâche : zone(s) de code, `dépend de`, `réutilise/custom`, et le **test rouge d'entrée** (le test qui échoue avant de commencer).

### Forcing-question — dimensionner une tâche (ni trop grosse, ni trop fine)
- **Ask exact** : « Un sous-agent `feature-dev`, contexte vierge, peut-il finir cette tâche (rouge → vert → commit) sans avoir à lire plus de ~3-4 fichiers d'architecture ? »
- **Push-until** : chaque tâche a **un** test rouge d'entrée clair, **une** zone de code dominante, et un livrable committable seul.
- **Red-flags (à refuser)** :
  - « Implémenter la feature X » sans sous-découpage → **trop grosse** (ne tient pas en contexte, commits fourre-tout).
  - « Ajouter un champ `title` » isolé → **trop fine** (bruit ; fusionne dans la tâche CRUD de l'entité).
  - Une tâche qui touche **3+ modules** → elle cache des dépendances → éclate-la par module.
  - Une tâche sans test rouge formulable → ce n'est pas une tâche TDD, c'est un vœu.
- **MOU** : « T3 · faire l'auth ». **FORT** : « T3 · câbler bloc `auth` (OTP → mot de passe, sessions, rôles) · zone `app/(auth)/` + `lib/auth/` · réutilise `_shared/blocks/auth` · test rouge : un code OTP invalide est refusé ».
- **Routage par cas** : bloc réutilisable → tâche de **câblage** (1 tâche/bloc, rapide) ; verticale métier → **1..n tâches de build** par couture ; glue transverse (nav, layout) → tâche `ui-shell` unique en amont.

### Repère de granularité (heuristique, pas une loi)
| Feature | Découpage typique |
|---|---|
| Câblage d'un bloc (auth, notifications, observability) | **1 tâche** de câblage + config |
| CRUD d'une entité | **1 tâche** (migration+RLS) + **1 tâche** (UI liste/détail) |
| Workflow cœur (la verticale) | **2-4 tâches** (donnée → logique → UI → état) |
| Intégration tierce (webhook, LLM, paiement) | **1 tâche** adaptateur + **1 tâche** câblage |

Si une feature produit **>5 tâches**, elle est probablement deux features déguisées — vérifie le PRD.

---

## Walking skeleton d'abord

La **première** tranche = un chemin **vertical mince** du workflow cœur, de bout en bout à travers le châssis (auth → une action cœur → persistance → affichage). Objectif : un squelette qui **tourne tôt**, sur lequel les features se greffent. Anti-pattern évité (`_shared/lessons.md` §3) : tout construire en largeur avant que rien ne marche.

### Recette — identifier LE walking skeleton
1. Prends le **workflow cœur** (le parcours critique n°1 du data flow de `tech/architecture.md`, celui qui porte l'edge produit).
2. Réduis-le à sa **couche la plus mince qui traverse tout** : 1 entrée → 1 action → 1 écriture DB → 1 lecture/affichage. **Une** entité, **un** rôle, **un** écran. Zéro variante, zéro edge case, zéro polish.
3. Ajoute le strict minimum de châssis pour que ça tourne de bout en bout : `auth` (login), `ui-shell` (layout+1 route), la persistance de cette entité.
4. Critère de passage : **un humain (ou un test e2e) peut faire le parcours complet et voir un résultat persistant**. Si un maillon manque, ce n'est pas encore un skeleton qui tourne.

### Forcing-question — « est-ce bien le squelette le plus mince ? »
- **Ask exact** : « Puis-je retirer un écran, une entité, ou une variante de ce skeleton et qu'il traverse encore auth→action→persistance→affichage ? »
- **Push-until** : on ne peut plus rien retirer sans casser la chaîne de bout en bout.
- **Red-flags** : skeleton qui inclut un 2ᵉ rôle, du billing, une intégration tierce non-cœur, plusieurs entités, ou du CSS de finition → **trop gras**, dégraisse.

```
WALKING SKELETON (mince, vertical, de bout en bout)
┌──────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐
│ Auth │──▶│ 1 action │──▶│ 1 écriture│──▶│ 1 lecture│
│login │   │  cœur    │   │   DB      │   │ affichée │
└──────┘   └──────────┘   └───────────┘   └──────────┘
     tout le reste (features) se GREFFE ensuite sur ce tronc
```

---

## Analyse de dépendances → lanes

1. Pour chaque tâche, liste : **zones de code touchées** + **dépend de** (autres tâches).
2. Construis les **lanes** :
   - Tâches à **zones disjointes** et **sans dépendance** → **lanes parallèles**.
   - Tâches partageant une zone **ou** liées par une dépendance → **même lane, séquentielle**.
3. **Ordre des lanes** : walking skeleton d'abord ; puis les lanes parallèles ; les tâches dépendantes dans des lanes ultérieures.
4. **Drapeaux de conflit** : deux lanes parallèles qui touchent la même zone → signale le risque de merge (séquentialise ou coordonne).

### Machine de décision — où va une tâche ?

```
Pour chaque tâche T (après le walking skeleton) :
        │
        ├─ T dépend d'une tâche non finie ? ──oui──▶ MÊME LANE que sa dépendance, APRÈS elle (séquentiel)
        │
        ├─ Zone de code de T ∩ zone d'une lane existante ≠ ∅ ?
        │        ├─ oui ─▶ Peut-on isoler la zone partagée dans une tâche amont commune ?
        │        │            ├─ oui ─▶ crée la tâche amont partagée, puis T part en lane parallèle
        │        │            └─ non ─▶ MÊME LANE que la lane en conflit (séquentiel) + DRAPEAU conflit
        │        └─ non ─▶ NOUVELLE LANE PARALLÈLE
        │
        └─ sinon ─▶ NOUVELLE LANE PARALLÈLE
```

### Matrice de décision — parallèle vs séquentiel
| Condition | Zones de code | Dépendance | Décision |
|---|---|---|---|
| Features indépendantes | disjointes | aucune | **Lanes parallèles** |
| B consomme la sortie de A | disjointes | B→A | **Même lane**, A puis B |
| Deux tâches écrivent le même module | qui se recouvrent | aucune logique | **Séquentialiser** + drapeau conflit, ou extraire une tâche amont commune |
| Glue transverse (nav, schéma partagé, types) | touchée par tout le monde | tout dépend d'elle | **Tâche socle amont**, avant les lanes parallèles |
| Passe finale | toutes | dépend de toutes les lanes | **Lane d'intégration**, en dernier |

### Micro-exemple (niche-agnostique)
Features : `auth`, `CRUD entité-A`, `CRUD entité-B`, `export`, `dashboard`.
- Skeleton : auth + entité-A (créer→voir).
- Zones : A=`app/a/`+`supabase/a`, B=`app/b/`+`supabase/b` (disjointes) → **Lane B** et **Lane C** parallèles.
- `export` lit A et B → **dépend de** A et B → lane **après** B et C.
- `dashboard` agrège A+B → **dépend de** A et B → même diagnostic.
- Types partagés (`lib/types.ts`) touchés par A et B → **tâche socle amont** T-types, sinon A et B se marchent dessus.

```
Skeleton(auth+A) ──▶ ┌ Lane B: entité-A features
                     ├ Lane C: entité-B features   ┐
   T-types (socle) ─▶┘                              ├─▶ Lane D: export ──▶ Lane E: intégration
                       (B, C en parallèle)          ┘   + dashboard (séq.)
```

---

## Passe d'intégration (ne pas l'oublier)

Après le merge des lanes parallèles, prévois une **tâche d'intégration** dédiée : les **bugs de jonction** sont le coût caché du parallélisme (cf. `_shared/lessons.md` §« parallélisme non maîtrisé »). Un plan qui parallélise sans passe d'intégration ment sur son état final.

### Checklist de la passe d'intégration
- [ ] Merge des worktrees dans l'ordre (skeleton d'abord, puis lanes, puis dépendantes).
- [ ] Types/contrats partagés cohérents entre lanes (pas deux définitions divergentes).
- [ ] Navigation/routing : toutes les routes des lanes sont câblées dans `ui-shell`.
- [ ] Data flows cross-features (export/dashboard) testés bout-en-bout, pas seulement par module.
- [ ] Migrations DB appliquées dans le bon ordre, pas de collision de schéma.
- [ ] Suite de tests **complète** verte après merge (pas seulement les tests par lane).
- [ ] Un test e2e du/des workflow(s) cœur passe sur l'assemblage complet.

---

## Definition of Done — le graphe est-il prêt à livrer aux agents ?
- [ ] Chaque feature Must/Should du PRD est couverte par ≥1 tâche.
- [ ] Chaque tâche : TDD (test rouge nommé) + une zone de code dominante + `dépend de` + `réutilise/custom`.
- [ ] Le walking skeleton est identifié, minimal, et placé **en premier**.
- [ ] Chaque tâche appartient à **exactement une** lane.
- [ ] Aucune lane parallèle ne partage une zone de code sans **drapeau de conflit** explicite.
- [ ] La passe d'intégration existe et est en **dernier**.
- [ ] L'ordre de lancement est explicite (skeleton → parallèles → dépendantes → intégration).
- [ ] Zéro mention de durée/jours/calendrier.

---

## Modes d'échec (à prévenir activement)
| Mode d'échec | Symptôme dans le plan | Correctif |
|---|---|---|
| **Big-bang horizontal** | Pas de skeleton ; tout démarre en parallèle | Extraire d'abord la tranche verticale mince |
| **Sur-parallélisation** | 8 lanes pour 5 features ; micro-tâches éparpillées | Regrouper par frontière de module (`delegation.md`) |
| **Conflit de zone masqué** | Deux lanes parallèles écrivent `lib/` sans drapeau | Extraire tâche socle amont ou séquentialiser |
| **Dépendance en boucle** | A dépend de B qui dépend de A | Casser via une interface/adaptateur ; l'une des deux passe en socle amont |
| **Intégration oubliée** | Le plan finit sur les lanes parallèles | Ajouter la lane d'intégration (obligatoire) |
| **Tâche non-TDD** | Tâche sans test rouge formulable | Reformuler ou fusionner ; sinon la sortir du graphe |
| **Calendrier déguisé** | « Semaine 1 », « 2 jours » | Supprimer ; on parle graphe et ordre, pas temps |

---

## Sortie (dans `tech/execution-plan.md`)
- Le **graphe** (tâches + dépendances), en table (ou Mermaid).
- Les **lanes** (parallèles vs séquentielles) + l'ordre de lancement.
- Le **walking skeleton** identifié en premier + la **passe d'intégration** en dernier.
