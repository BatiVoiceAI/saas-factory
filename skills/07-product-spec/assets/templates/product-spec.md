# Product Spec (PRD) — <nom court du produit>

<!-- Artefact CŒUR et UNIQUE de l'étape 7 (rôle PM). LE document qui définit ce qu'on construit. Depuis la fusion §5, il absorbe la priorisation (MoSCoW/RICE) ET le MVP (avant : feature-prioritization.md + mvp-definition.md, qui se recopiaient). La priorité, le MVP et le build order vivent ici UNE seule fois (source unique). Les fiches product/features/NN-*.md portent la profondeur par feature Must (flow, états, règles, boucles, critères, volet technique). Fidèle à la Phase 1 : chaque feature se rattache à un élément de research/ — sinon elle passe en Non-goal. Jamais de page blanche. -->

## Contexte & besoin
<!-- Repris de la Phase 1, PAS réinventé. C'est le socle auquel tout le reste doit se rattacher. -->
- **Problème :** <le problème cœur, du point de vue de la cible, repris de opportunity-brief>
- **Cible :** <persona précis, caractéristiques observables>
- **Edge :** <axe différenciant, ou absence assumée>
- **Intégrations / écosystème :** <outils à connecter, repris de idea-brief>
- **Archétype :** <web-saas / landing / automation — **conditionne le socle de complétude** : web-saas → S1-S8, landing → LP1-LP4, automation → AU1-AU5 ; `_shared/state-schema.md` §socle-par-archétype>
- **Type de produit :** <SaaS public / outil interne entreprise / outil perso — cadre le canal des boucles et le calibrage du socle, par-dessus l'archétype>

## Scope — workflow cœur
<!-- UN workflow cœur bien fait. Micro-SaaS niché, pas plateforme horizontale. Décrire le parcours de bout en bout : c'est ce que le MVP doit rendre fluide. -->
<Le workflow cœur, étape par étape>

**Actions de valeur** (créer / modifier / annuler l'entité métier — alimentent § Boucles fermées) :
- <ex. créer une réservation ; annuler une réservation ; déplacer une réservation>

## Aha moment
<!-- La première action où l'utilisateur obtient la valeur promise — jamais le signup, jamais « compléter son profil ». Le chemin le plus court y mène depuis l'entrée (signup/SSO/usage direct), étapes comptées (cible ≤ 5) ; l'onboarding wizard doit y déboucher. Voir references/completeness-baseline.md. -->
- **Première action de valeur :** <ex. le gérant voit sa page de réservation en ligne avec ses vraies prestations>
- **Chemin le plus court :** <entrée → onboarding (2-4 écrans) → … → aha — N étapes>

## Liste des features
<!-- Liste COMPLÈTE dérivée de : (a) le workflow cœur, (b) les features réclamées (demand-signals), (c) les manques concurrents (opportunity-brief), (d) le socle « produit complet » injecté d'office, CONDITIONNÉ PAR L'ARCHÉTYPE (web-saas → S1-S8 · landing → LP1-LP4 · automation → AU1-AU5 ; rattachement « socle complétude »). Une ligne par feature ; fiche PROFONDE dans product/features/NN-<slug>.md pour les Must (allégée pour Should). -->
| # | Feature | Priorité (M/S/C/W) | Rattachement Phase 1 |
|---|---|---|---|
| 01 | <nom> | <Must / Should / Could / Won't> | <problème / demande / manque concurrent / socle complétude> |

## Socle « produit complet » (Must d'office — CONDITIONNÉ PAR L'ARCHÉTYPE)
<!-- Injecté d'office, exempté du test de retrait : on ADAPTE chaque élément au type/à la niche, on ne débat pas de son existence. Le socle DÉPEND DE L'ARCHÉTYPE (web-saas S1-S8 / landing LP1-LP4 / automation AU1-AU5) — un product-spec de landing ou d'automation N'HÉRITE PAS du socle web-saas (pas d'onboarding/dashboard/entité CRUD imposés). NE GARDER QUE LE BLOC de l'archétype du projet (§ Contexte → Archétype) ; supprimer les deux autres. « Socle réduit » = décision justifiée PAR ÉLÉMENT, jamais une dispense d'archétype. Détail : references/completeness-baseline.md ; portes par archétype : routing.md ; source : _shared/state-schema.md §socle-par-archétype. Le calibrage par type (public/interne/perso) module le canal/mode par-dessus. -->

<!-- ▼ Si archétype = web-saas → garder ce bloc (S1-S8), supprimer les deux autres -->
| Élément (web-saas) | Adaptation au type / à la niche |
|---|---|
| S1 · Onboarding wizard (2-4 écrans) → crée l'entité cœur avec défauts intelligents modifiables | <ex. salon : nom, adresse, horaires, 3 prestations types pré-remplies> |
| S2 · Profil / settings complet (infos, email, suppression de compte RGPD ; rôles + audit si interne) | <…> |
| S3 · Empty states pédagogiques (chaque écran vide guide vers l'action) | <…> |
| S4 · Emails / notifications transactionnels brandés (canal adapté au type) | <…> |
| S5 · Pages légales **adaptées à la juridiction** `jurisdiction`/`locale` (FR → mentions + confidentialité + CGV si vente ; US/EN → Terms + Privacy ; DE → Impressum + Datenschutz ; jamais « FR » en dur ; équivalent interne/perso adapté) | <…> |
| S6 · 404 brandée | <…> |
| S7 · Seed / demo data marquée « exemple » et supprimable | <…> |
| S8 · Metadata & favicon brandés (title, description, favicon, OG, lang fr) | <…> |

<!-- ▼ Si archétype = landing → garder ce bloc (LP1-LP4), supprimer les deux autres. PAS d'onboarding wizard, PAS de dashboard, PAS d'entité CRUD. -->
| Élément (landing) | Adaptation à la niche |
|---|---|
| LP1 · Sections du landing-playbook (hero, problème, solution, preuve, CTA…) | <…> |
| LP2 · Pages légales **adaptées à la juridiction** `jurisdiction`/`locale` (jamais « FR » en dur) | <…> |
| LP3 · Waitlist / CTA (boucle fermée : confirmation + trace lead) | <…> |
| LP4 · Métadonnées & favicon (title, description, OG, lang) | <…> |

<!-- ▼ Si archétype = automation → garder ce bloc (AU1-AU5), supprimer les deux autres. PAS d'UI produit (headless). -->
| Élément (automation) | Adaptation à la niche |
|---|---|
| AU1 · Config / secrets (déclarés, jamais en dur ; via infra-setup) | <…> |
| AU2 · Historique des runs / logs consultables | <…> |
| AU3 · Healthcheck / statut d'exécution | <…> |
| AU4 · Boucle fermée (notification succès/échec au bon canal + trace) | <…> |
| AU5 · Idempotence (re-run sûr, pas de double effet) | <…> |

## Priorisation — MoSCoW (source unique de la priorité)
<!-- Fusion §5 : la matrice vit ICI, plus dans un fichier séparé. Chaque feature dans UN bucket. Le Won't have est AUSSI important que le Must : il protège le scope. Justification = rattachement Phase 1. Le socle « produit complet » (conditionné par l'archétype : S1-S8 / LP1-LP4 / AU1-AU5) est Must d'office (justif « socle complétude »). Méthode : references/prioritization.md. -->
| Feature | Bucket | Justification (rattachement Phase 1) |
|---|---|---|
| <nom> | Must / Should / Could / Won't | <pourquoi ce bucket> |

### RICE (départage l'ordre)
<!-- Score = (Reach × Impact × Confidence) ÷ Effort. Impact : 3 massif / 2 fort / 1 moyen / 0.5 faible / 0.25 minime. Confidence : 100/80/50 %. Effort en personne-mois (unité CONSTANTE). Estimations marquées [Assumption]. Trier par score décroissant. -->
| Feature | Reach (/trim) | Impact | Confidence | Effort (p-mois) | Score |
|---|---|---|---|---|---|
| <nom> | <n> | <3..0.25> | <100/80/50 %> | <n> | <(R×I×C)/E> |

## MVP (les Must, rien d'autre)
<!-- Fusion §5 : la définition du MVP vit ICI. Le plus PETIT produit qui résout VRAIMENT le problème cœur. Le socle « produit complet » en fait partie d'office : sans lui le MVP n'est pas plus petit, il est inachevé. -->
- **Hypothèse cœur (falsifiable) :** « si on donne <capacité> à <cible>, alors <comportement/valeur attendu> ».
- **Features Must :** <UNIQUEMENT les Must de la matrice — aucun Should/Could> + socle « produit complet » de l'archétype (web-saas → S1-S8 · landing → LP1-LP4 · automation → AU1-AU5).
- **Success criteria (mesurables) :** <activation = job cœur accompli (ex. « premier livrable exporté »), rétention, complétion du workflow, willingness-to-pay — pas de vanity metric>.
- **Out-of-scope :** <repris du Won't have — nommer protège le focus au build>.

## Boucles fermées
<!-- Aucune action de valeur muette (doctrine _shared/boucles-fermees.md). Pour CHAQUE action de valeur (§ Scope), remplir les 5 questions. Canal adapté au type ; l'existence de la boucle, non. Dès qu'une contrepartie existe, les colonnes 1-2 ne sont jamais vides. Chaque « oui » = une exigence de la feature (§7 de sa fiche) + un critère G/W/T. -->
| Action de valeur | 1. Trace acteur | 2. Contrepartie informée | 3. Réversible | 4. Rappel | 5. Trace consultable |
|---|---|---|---|---|---|
| <ex. créer une réservation> | <email client + .ics> | <notif gérant> | <lien annuler (token signé)> | <rappel J-1> | <historique 2 côtés> |

## Dépendances & build order
<!-- Source unique (fusion §5). Ce qui doit exister AVANT quoi. Déduit des dépendances entre features (DAG) + du score RICE (dépendance > score). Chaque item porte sa raison. Alimente directement le plan de la Phase 3. Méthode : references/dependencies-build-order.md. -->
1. <feature — socle : tout en dépend>
2. <feature — dépend de X / plus haut RICE à ce palier>

## Périmètre livré (référence pour le gate pricing ↔ features)
<!-- Amorce P0.7 : la liste des Must EST le contrat de livraison. Le pricing (étape 06) ne vend QUE ce que ces Must couvrent ; les gates 12/15 vérifient que le livré = ces Must. Liste canonique, sans re-décrire (renvoi aux fiches). -->
- <Must 1 — features/NN-<slug>.md>
- <Must 2 — features/NN-<slug>.md>

## Non-goals
<!-- Ce que le produit NE fait PAS (au moins en v1). Reprend le Won't have + les non-goals de idea-brief. Nommer explicitement protège du scope-creep. -->
- <non-goal 1>
- <non-goal 2>
