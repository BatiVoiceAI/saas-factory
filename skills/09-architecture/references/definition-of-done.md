# Référence — Definition-of-Done & sortie de l'étape

Le contrôle qualité avant d'annoncer l'étape 10. Une architecture « finie » n'est pas une architecture « remplie » : c'est une architecture dont **chaque choix tient un critère de qualité** (tracé à une exigence, réversibilité notée) ou est **honnêtement marqué** `[Hypothèse]` / « à préciser ». Aucun choix inventé, aucune techno orpheline. Rappel : la Phase 3 n'a **aucune porte utilisateur** — cette DoD **est** le garde-fou qui remplace la revue humaine.

## Checklist de `tech/architecture.md`
Chaque ligne : la section, son critère de passage, le red-flag qui la recale.

| Section | Passe si… | Recalé si… |
|---|---|---|
| **1. Synthèse** | archi en 1 phrase + stack en 1 ligne + 1-2 décisions structurantes, lisible d'un coup | fourre-tout, ou ne dit pas la stack |
| **2. Matrice NFR** | 1 ligne/feature Must-Should, 8 axes, chaque exigence **sourcée** + classée dure/molle | exigence sans source ; axe inventé ; sécurité omise sur des PII |
| **3.1-3.2 C4 L1/L2** | contexte + conteneurs en Mermaid (auto-contenu) | image externe ; conteneurs non reliés |
| **3.3 Modèle de données** | `erDiagram` + RLS par table + tenant identifié + invariants concurrents en contraintes DB + surfaces `anon` gardées (`data-model.md`) | table tenantée sans RLS ; entité sans US ; **[SÉCU]** invariant concurrent en check applicatif seul ; **[SÉCU]** fonction grantée à `anon` sans checklist anti-abus |
| **3.4 Modules** | features → modules + **split réutiliser/custom complet** | module « à décider » ; auth/billing marqués custom |
| **3.5 Data-flow** | 2-3 workflows cœur (entrée→sortie) + points async marqués | opération lourde traitée en synchrone sans justification |
| **3.6 Frontières de confiance** | entrées non fiables + authN/authZ + surfaces publiques/privées | `tenant_id` fourni par le client ; webhook non idempotent |
| **3.7 Cas limites** | par data-flow : vide/invalide, échec tiers, double soumission, concurrence, état partiel, limite haute | cas limites absents (= tests manquants Phase 4) |
| **4. Stack retenue** | chaque ligne = `[Défaut]` **ou** `ADR-NNNN` | ligne orpheline (techno sans exigence) |
| **5. Décisions verrouillées** | renvoi vers les ADR + statut | ADR cité mais absent de `decisions.md` |
| **6. Risques & taste decisions** | risques listés + choix à impact produit remontés pour l'étape 10 | taste decision tranchée en douce sans la loguer |

## Checklist de `tech/decisions.md`
| Item | Passe si… | Recalé si… |
|---|---|---|
| **Index** | table à jour (# · décision · statut · exigence motrice) | ADR présent hors index |
| **Numérotation** | continue (ADR-0001, 0002…) | trous ou doublons |
| **Exigence motrice** | chaque ADR pointe une exigence dure **ou** l'edge produit | ADR sans motivation traçable |
| **Réversibilité** | notée (facile/moyenne/difficile) + comment revenir | absente, ou « facile » sur un choix structurant (multi-tenant) |
| **Budget d'innovation** | ≤ 1-2 déviations hors edge produit | 3+ déviations → sur-ingénierie |
| **Traçabilité inverse** | chaque déviation de la stack a son ADR | déviation dans la stack sans ADR correspondant |

## Auto-vérification avant de clore (l'agent se relit)
```
[ ] Chaque ligne de stack : [Défaut] ou rattachée à un ADR (zéro orphelin)
[ ] Chaque exigence de la matrice : sourcée (US/critère) ou labellisée [Hypothèse]
[ ] Chaque feature Must a au moins un module ; chaque module est réutiliser OU custom
[ ] Auth / billing / observability = blocs réutilisés (pas custom)
[ ] Seul l'edge produit est custom (jetons d'innovation ≤ 1-2)
[ ] Toute table tenantée a RLS + tenant dérivé du token (pas du client)
[ ] [SÉCU] Tout invariant violable par 2 écritures concurrentes = contrainte DB (EXCLUDE/CHECK/unique composite), jamais un check applicatif seul (data-model.md §Invariants)
[ ] [SÉCU] Surface anonyme : lecture = vue/fonction SECURITY DEFINER sans PII ; écriture = endpoint serveur validé + rate-limit ; toute fonction grantée à anon a ses 3 gardes anti-abus — bornes temporelles, plafonds par client, rate-limit IP (data-model.md §Accès public anonyme)
[ ] Chaque opération lourde/tierce = async explicite dans le data-flow
[ ] Cas limites présents pour chaque workflow cœur (= matrice de tests Phase 4)
[ ] Chaque ADR : exigence motrice + réversibilité honnête
[ ] Points sécurité-sensibles taggés [SÉCU] pour la Phase 4
[ ] Taste decisions (impact produit) loguées en section 6 pour l'étape 10
[ ] Diagrammes Mermaid auto-contenus (aucune dépendance externe)
[ ] ZÉRO secret / clé API dans architecture.md, decisions.md, state.md
[ ] HARD GATE tenu : aucun code de feature, aucune infra provisionnée, produit non re-spécifié
```

## Pas de porte utilisateur — mais on ne triche pas
Cette étape **ne pose aucune porte**. À la place :
1. **Récapitule en 2 lignes** : l'archi en une phrase + les 1-2 décisions structurantes.
   > Exemple : « web-saas Next.js + Supabase (RLS multi-tenant), 4 blocs câblés + 1 module custom (le moteur de scoring) ; 1 ADR : upload direct storage pour les gros fichiers. »
2. **Logue les taste decisions** (choix à goût produit) en section 6 — l'étape 10 les tranche **en autonomie** via `skills/10-execution-plan/references/decision-principles.md`, jamais de remontée utilisateur.
3. **Signale les points `[SÉCU]`** pour la revue Phase 4.

| Cas à la clôture | Action |
|---|---|
| DoD toute verte | écris/actualise `state.md`, annonce l'étape 10 |
| Un item recalé | redescends au cran fautif (`procedure.md`), corrige, re-vérifie |
| PRD révélé cassé pendant M3/M4 | **renvoi Phase 2** (`decision-matrices.md §0`), n'invente pas |
| Choix à goût produit non tranchable | taste decision loguée (section 6), pas de blocage |

## Mise à jour de l'état (`.saas-factory/state.md`)
En sortie, renseigne au minimum :
- **Étape 09** · statut `fait`
- **Archétype confirmé** (web-saas ou dévié via ADR)
- **Stack verrouillée** (résumé) + liste des **ADR ouverts** (# + titre)
- **Taste decisions** en attente pour l'étape 10 · points `[SÉCU]` pour la Phase 4

Jamais de secret dans `state.md` (safety-rails §4 ; schéma : `_shared/state-schema.md`).

## Sortie de l'étape
- **Artefacts** : `tech/architecture.md` + `tech/decisions.md`, DoD passée.
- **État** : `.saas-factory/state.md` à jour.
- **Suite** : `10-execution-plan` (Plan d'exécution) — il **relit l'architecture telle quelle** et l'ordonne ; il ne re-décide pas la stack.
- **Contrat de chaînage tenu** : l'aval exécute l'architecture (un ADR accepté = contrainte, pas suggestion).
