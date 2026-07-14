# Référence — Spec de validation par feature (paramétrage de la cascade)

Étape [6] du composer. Pour **chaque feature**, on attache ce que la **cascade de validation** de la Phase 4 (`_shared/validation-cascade.md`) vérifiera : **critères d'acceptation**, **Definition of Done (DoD)**, **budget d'itération**. Le composer **paramètre** la cascade ; la Phase 4 l'**exécute**.

## Ce que la cascade attend de nous
La cascade monte Développeur → Tech Lead → CTO → Designer → CEO, chaque cran boucle jusqu'à satisfaction. Elle a besoin, **par feature**, de trois choses écrites :
```
Critères d'acceptation ─▶ ce que "ça marche" veut dire (testable, du PRD)
Definition of Done      ─▶ la barre de sortie (tests, doc, design, sécu)
Budget d'itération      ─▶ plafond de boucles + critère de sortie (anti-boucle infinie)
```

## 1. Critères d'acceptation — les dériver des fiches feature
- **Source obligatoire** : `product/features/*` (§ User story + § Critères d'acceptation de chaque fiche Must/Should). **Jamais inventés.** Si une feature n'a pas de critère traçable, c'est un trou du PRD → noter dans l'audit (`[Hypothèse]`), ne pas fabriquer.
- **Format** : testables, binaires (vrai/faux), au présent, orientés comportement observable. « Quand {contexte}, alors {résultat observable} ».
- **Couvrir le chemin ET les bords** : au moins un critère nominal + les cas limites recensés au data flow de l'étape 9 (entrée vide/invalide, échec tiers, double soumission/idempotence, concurrence, limite haute).

### Forcing-question — un critère est-il assez fort ?
- **Ask exact** : « Un agent `feature-dev` peut-il écrire un test rouge **directement** à partir de ce critère, sans deviner ? »
- **Push-until** : chaque critère est vérifiable par un test automatisé sans interprétation.
- **Red-flags** : « ça doit être intuitif », « rapide », « propre » → **non testable** → reformuler en seuil observable (« la liste s'affiche en < 1 s pour 1 000 éléments ») ou déplacer vers le DoD design.
- **MOU** : « l'export fonctionne ». **FORT** : « quand l'utilisateur clique Exporter avec ≥1 ligne, un CSV est téléchargé contenant exactement les lignes visibles ; avec 0 ligne, un message "rien à exporter" s'affiche et aucun fichier n'est produit ».

## 2. Definition of Done — la barre de sortie (checklist par feature)
- [ ] Tous les critères d'acceptation passent (tests verts).
- [ ] Cas limites de la feature couverts par des tests (liste de l'étape 9).
- [ ] Conforme à l'architecture (frontières de module respectées) — cran Tech Lead/CTO.
- [ ] Sécurité : entrées validées, authZ correcte, pas de PII loguée — points `[SÉCU]` adressés.
- [ ] Conforme à `DESIGN.md` (tokens, composants, hiérarchie) + états UX (vide/chargement/erreur/succès) — cran Designer.
- [ ] Accessibilité WCAG 2.1 AA sur les surfaces de la feature.
- [ ] Doc à jour (le Verifier resynchronise doc **et** tests — `_shared/lessons.md` §5).
- [ ] Commits TDD citant les tâches.

> La DoD peut être **transverse** (une base commune, ci-dessus) + **spécifique** à la feature (ex. « le webhook paiement est idempotent »). Le composer note le spécifique par feature.

### Variante AUTOMATION — cran Designer dégradé + DoD adaptée
> **Conditionné par `archetype = automation`** (`.saas-factory/state.md`, source `_shared/state-schema.md`). En `web-saas` (défaut), la DoD ci-dessus s'applique **inchangée**. En automation (worker/cron/bot/intégration **headless**), deux lignes de la DoD transverse sont **sans objet** et se **dégradent** — la dégradation est **déclarée**, pas ignorée :

- **Cran Designer dégradé (pas supprimé).** Il n'y a **pas de surface visuelle** à juger : « Conforme `DESIGN.md` » + « états UX vide/chargement/erreur/succès » + « WCAG 2.1 AA » sont **N/A par conception d'archétype**. À la place, **le cran CEO-persona (propriétaire de l'automatisation) porte l'edge** : il vérifie la **boucle fermée** (un run raté/réussi **notifie/rapporte** au propriétaire) et l'**idempotence** (re-run ne double ni les effets — grain run — ni les entités — grain entité). C'est l'exigence dure de l'archétype (`routing.md` §automation, `_shared/boucles-fermees.md`), et elle **remplace** le jugement Designer dans la cascade.
- **DoD automation (remplace les 2 lignes visuelles)** :
  - [ ] ~~Conforme `DESIGN.md` + états UX visuels~~ → **N/A (headless)**. À la place : **gabarit de sortie fr-FR conforme** (le rapport/alerte de la boucle fermée est rédigé dans la langue de l'utilisateur, format attendu) **+ états de RUN couverts** (succès silencieux journalisé · rapport périodique · **échec → alerte immédiate**) — l'équivalent « états » de l'archétype porte sur le **run**, pas sur l'écran.
  - [ ] ~~Accessibilité WCAG 2.1 AA~~ → **N/A (pas de surface publique)**.
  - [ ] (conservées) critères d'acceptation verts · cas limites (dont **idempotence run + entité**, **fenêtre de cadence**, échec source/cible) · frontières de module · `[SÉCU]` (secrets d'intégration, service-role) · doc à jour · commits TDD.

> Le composer **écrit** cette dégradation dans la spec de validation de chaque feature automation (colonne DoD), pour que la cascade Phase 4 sache que le cran Designer est **déclaré N/A** et que l'edge passe au CEO-persona — jamais un cran « oublié en silence ».

### Variante ECOMMERCE — cran Designer COMPLET + edges d'achat durs (workflow · boucle EC4 · 3 pièges)
> **Conditionné par `archetype = ecommerce`** (`.saas-factory/state.md`, source `_shared/state-schema.md` ; canon `_shared/archetypes/ecommerce.md`). **À l'inverse d'automation, ecommerce A une UI** (vitrine · fiche produit · panier · checkout) : le **cran Designer reste COMPLET** — aucune ligne visuelle n'est dégradée. Ce que la variante ajoute, ce sont des **edges DURS de commerce** que la spec de validation de chaque feature d'achat doit poser — l'équivalent e-commerce de la « boucle fermée + idempotence » d'automation, exigés par le **CEO-persona + le CTO** :

- **Workflow d'achat conforme au PRD (edge dur).** La feature d'achat n'est « faite » que si le parcours **catalogue (EC1) → panier (EC2, sous-total recalculé serveur) → checkout one-shot (EC3, `mode:payment`) → commande (EC4)** est conforme au PRD de bout en bout. Un maillon manquant, un `mode:subscription`, ou un total fourni par le client = critère **rouge**.
- **Boucle fermée EC4 — aucune vente muette.** Toute vente confirmée déclenche **confirmation au CLIENT** (email Resend immédiat) **ET** notification **au MARCHAND** (nouvelle commande) : c'est la boucle fermée de l'archétype (`_shared/boucles-fermees.md`), l'équivalent commerce de la boucle fermée automation. Une commande payée sans cette double notification = boucle ouverte = critère **rouge**.
- **3 pièges non négociables (P1/P2/P3).** La spec pose comme edges **DURS** — un seul non prouvé = **porte fermée** (`_shared/archetypes/ecommerce.md` §Pièges + §Critères d'acceptation) :
  - **P1 — survente** : décrément de stock **atomique** (update conditionnel `stock >= :qty` ou `CHECK (stock >= 0)` dans la **même transaction** que la commande, **au paiement confirmé**) — deux commandes concurrentes sur le dernier article ne réussissent pas toutes les deux.
  - **P2 — intégrité prix** : montant **recalculé côté serveur** depuis le catalogue (jamais un total client) ; la ligne de commande **snapshot** le prix payé — un panier au prix altéré est rejeté/recalculé.
  - **P3 — idempotence webhook** : commande créée **une seule fois** malgré les redeliveries Stripe (contrainte unique `stripe_session_id`, upsert `on conflict do nothing`) + **signature** du webhook vérifiée.
- **DoD ecommerce (le socle transverse s'applique, cran Designer CONSERVÉ, + spécifiques d'achat)** :
  - [ ] (conservées — cran Designer COMPLET) Conforme `DESIGN.md` + **états UX vide/chargement/erreur/succès** (panier vide, produit épuisé, paiement refusé, page /merci) · **WCAG 2.1 AA** sur vitrine/fiche/panier/checkout — ecommerce **a** une surface publique.
  - [ ] **Workflow d'achat EC1→EC4 conforme au PRD** (edge dur ci-dessus) **+ copy dans la langue du client** (fiche produit, checkout, email de confirmation, **CGV/mentions de vente adaptées à `jurisdiction`**).
  - [ ] **Boucle fermée EC4 prouvée** : confirmation client **ET** notif marchand sur une vente de test réelle.
  - [ ] **P1 + P2 + P3 prouvés** par des cas limites (concurrence sur le dernier article · panier au prix altéré · redelivery du webhook) — portés aux crans **CEO-persona + CTO** / `[SÉCU]`.
  - [ ] (conservées) critères d'acceptation verts · frontières de module · `[SÉCU]` (webhook signing secret, service-role stock) · doc à jour · commits TDD.

> Le composer **écrit** ces edges (workflow d'achat · boucle EC4 · P1/P2/P3) dans la spec de validation de chaque feature d'achat (colonne DoD), pour que la cascade Phase 4 les traite comme **durs** : le cran Designer **reste COMPLET** (UI présente) et l'edge commerce est porté par le **CEO-persona + le CTO** — jamais « oublié en silence ». Une feature d'achat dont un seul de P1/P2/P3 n'est pas prouvé se solde `DONE_WITH_CONCERNS` au mieux, jamais « done ».

## 3. Budget d'itération — plafonner les boucles
Chaque feature reçoit un **plafond** de boucles de la cascade + un **critère de sortie** (rappel `_shared/safety-rails.md` §7 : pas d'itération infinie).

### Matrice de budget (défaut, ajustable selon complexité/risque)
| Type de feature | Plafond de boucles | Critère de sortie |
|---|---|---|
| Câblage de bloc | **2** | Bloc vert + config présente |
| CRUD standard | **3** | Critères + cas limites verts |
| **Logique / calcul métier pur** (transformation, dérivation, règle de décision — **pas d'UI ni de CRUD**) | **3** | Critères + cas limites (entrée vide/invalide, borne haute, arrondi) verts ; **table de vérité couverte** |
| Verticale cœur (edge produit) | **4** | Critères + cas limites + cran CEO PASS |
| Intégration tierce / paiement | **4** + `[SÉCU]` | Idempotence + sécu adressées |

> **Ne pas ranger une feature `logique/calcul métier pur` en « CRUD » par défaut.** En automation (et pour tout module de calcul), le cœur de valeur est une **transformation déterministe** (ex. « besoin net = seuil − dispo », « quantité de réappro arrondie au pack »), pas une opération de persistance. Son budget suit la ligne dédiée ci-dessus : le critère de sortie porte sur la **table de vérité** (entrées → sorties attendues), pas sur un rendu.

Budget épuisé → on **loge l'état**, on marque la feature `DONE_WITH_CONCERNS`, on continue (l'humain tranchera au client-review de l'étape 15). **Jamais** de blocage infini.

### Forcing-question — le budget est-il honnête ?
- **Ask exact** : « Ce plafond laisse-t-il la place à ≥1 loop-back Tech Lead/CTO/Designer/CEO réaliste, sans autoriser une boucle sans fin ? »
- **Red-flags** : budget 1 sur une verticale cœur (irréaliste, aucune correction possible) ; budget « illimité » (interdit) ; absence de critère de sortie (le plafond seul ne suffit pas).

## Micro-exemple (niche-agnostique) — une ligne de la table §7
| Feature | Critères d'acceptation | DoD | Budget |
|---|---|---|---|
| Édition d'une entité | (1) sauvegarde persiste après reload ; (2) deux onglets → dernière écriture gagne + avertissement ; (3) champ requis vide → refus + message | base + « conflit concurrent testé » | 3 boucles, sortie = critères+conflit verts |

## Modes d'échec
| Mode d'échec | Symptôme | Correctif |
|---|---|---|
| Critère non testable | « doit être intuitif » dans les critères | Reformuler en seuil observable / basculer en DoD design |
| Critère inventé | Aucune trace dans les user stories | Tagger `[Hypothèse]` dans l'audit, ne pas fabriquer un besoin |
| DoD absente | Feature sans barre de sortie | Appliquer la DoD transverse + spécifique |
| Budget manquant/infini | Pas de plafond ou « jusqu'à parfait » | Poser plafond + critère de sortie (matrice) |
| Bords oubliés | Critères nominaux seulement | Rapatrier les cas limites de l'étape 9 |

## Sortie (dans `tech/execution-plan.md`)
La table **spec de validation par feature** (§7) : Feature | Critères d'acceptation | DoD | Budget d'itération — c'est l'entrée directe de la cascade Phase 4.
