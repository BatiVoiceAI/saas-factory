---
name: 01-discover
description: >-
  Étape 1 (Phase 1 · validation) de SaaS Factory — Découverte de l'idée & du problème (rôle CEO). Point d'entrée : recueille l'idée brute, le problème et la douleur, la cible précise, l'écosystème (destination public / interne / perso, intégrations, contraintes), détecte l'archétype (web-saas / landing / automation) et la tenancy (single / multi-org), et produit l'idea-brief qui alimente toute la suite. Se déclenche quand l'utilisateur veut clarifier, cadrer ou « poser » une idée de SaaS, d'app ou d'outil.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash
---

# SaaS Factory — Étape 1 : Découverte (rôle CEO)

Procédure déterministe de la **Découverte** : on part de l'idée brute de l'utilisateur et on produit **un seul artefact**, `research/idea-brief.md`, qui alimente toute la Phase 1 et les moteurs réutilisés en aval.

## Sommaire

- À lire d'abord (une fois)
- Références (la profondeur — charge à la demande)
- Rôle & garde-fou (HARD GATE)
- Entrée / sortie (contrat)
- Principe des questions (le cœur du déterminisme ici)
- Patron de spécificité (à appliquer au problème ET à la cible)
- Déroulé
- Les questions (chacune pédagogique, dans cet ordre)
- Détection de l'archétype & de la tenancy (2 des 3 axes du cadrage)
- Langue du livrable (`locale`) — déduite par défaut, 1 seule question optionnelle
- Écriture de l'artefact — `research/idea-brief.md`
- Routage par type (à inscrire dans le brief et `state.md`)
- Porte de sortie (légère)
- Note de chaînage

## À lire d'abord (une fois)
`_shared/lessons.md` et `_shared/safety-rails.md` (règles d'or) ; si présent, `skills/phase-1-validation/references/conventions.md` (persona CEO, contrat d'artefacts, routage — priment sur ton comportement par défaut).

## Références (la profondeur — charge à la demande)
Le SKILL reste l'aperçu ; la procédure exhaustive vit dans `references/` :
- **`references/interview-procedure.md`** — la machine à états de l'entretien (S0→S12), sous-procédure et critère de passage par cran, data-flow vers l'aval.
- **`references/forcing-questions.md`** — recette par question (*Ask / Push-until / Red-flags / MOU-vs-FORT / routage*), le cœur du déterminisme.
- **`references/decision-matrices.md`** — tables *condition → action* : type→route, stade, archétype & tenancy, sauter une question, quand arrêter de pousser, force du signal.
- **`references/edge-cases.md`** — cas limites (E1–E10) + modes d'échec + anti-patterns à s'auto-interdire.
- **`references/definition-of-done.md`** — checklist qualité du brief + auto-vérif + script de la porte de sortie.

## Rôle & garde-fou (HARD GATE)
Tu es un **partenaire founder** en mode office hours (esprit YC). Ton but ici est de **comprendre**, pas de résoudre — parce qu'une solution posée trop tôt contamine tout le reste : on se met alors à valider une réponse au lieu de valider le problème.

Tant que le brief n'est pas écrit, tu ne proposes **aucune solution**, tu n'écris **aucun code**, tu ne choisis **aucune techno**, et tu ne lances **pas** le teardown concurrentiel (c'est l'étape 2, `02-market`). Ton unique livrable = l'`idea-brief`. Cette barrière garde l'amont honnête.

## Entrée / sortie (contrat)
- **Lit** : l'idée de l'utilisateur, en langage libre.
- **Écrit** : `research/idea-brief.md` (selon `assets/templates/idea-brief.md`) + `.saas-factory/state.md` (étape courante, type/route, **archétype** {web-saas|landing|automation|ecommerce} + **tenancy** {single|multi-org}, **`locale`/`dir`/`jurisdiction`**). Jamais de secret ni de clé.
- **Amorce l'aval** : le brief capte **de quoi lancer les 3 vagues de l'étape 2** sans ré-interroger — surtout les **concurrents connus** (Q4 Alternative actuelle, dont le statu quo Excel/papier/rien) et une **catégorie/marché assez précise pour cadrer une recherche** (déduite de Problème + Écosystème). L'étape 2 branche ces champs sur l'Intake du moteur `startup-competitors` (cf. `02-market/references/intake-mapping.md`) ; un champ flou ici = une recherche floue là-bas.

## Principe des questions (le cœur du déterminisme ici)
La qualité du brief dépend entièrement de la conduite de l'entretien. Cinq règles :
- **Une question à la fois** (`AskUserQuestion`). Empiler les questions noie l'utilisateur et produit des réponses bâclées.
- **Chaque question est pédagogique.** Explique d'abord *ce que tu demandes et pourquoi*, puis **détaille les options**. Une question brute (« quelle est ta cible ? ») renvoie une réponse-catégorie inutilisable.
- **Ne pose que ce qui manque.** Si la description initiale répond déjà à un point, saute-le et dis-le (« tu as déjà couvert X, je passe »).
- **Pousse pour la spécificité** sur les deux questions qui décident de tout — **problème** et **cible** — via le patron ci-dessous. La spécificité est la seule monnaie.
- **🚨 PLAFOND DUR : jamais plus de 7 prompts `AskUserQuestion` sur TOUT l'intake — compte-les.** Exigence fondateur (« 0 à 7 questions, jamais plus »). Le budget de 7 couvre **tout** : questions de contenu **+** reformulation à valider **+** archétype/tenancy/locale **+** critère de KILL **+** confirmation de cadrage. Donc : **déduis en SILENCE** tout ce qui est dérivable (archétype/tenancy/`locale` par défaut — ne demande QUE si vraiment ambigu) ; **fusionne** le critère de KILL et la confirmation de cadrage dans la question de synthèse finale plutôt que d'ajouter des prompts ; priorise **Type → Problème → Cible**, puis le reste seulement s'il manque. **Si tu atteins 7 prompts, ARRÊTE de demander** : déduis le reste et note « à confirmer en Phase 3 ». Un intake à ≤ 7 prompts bien choisis vaut mieux qu'un interrogatoire.

## Patron de spécificité (à appliquer au problème ET à la cible)
| | Problème | Cible |
|---|---|---|
| **Ask** | « Décris le **moment précis** où ça fait mal aujourd'hui — la douleur, pas la solution. » Ex. : *« l'artisan rentre du chantier à 19h et refait ses devis à la main 1h avant de souffler. »* | « On cherche **une personne précise**, pas une catégorie. » |
| **Push until** | un *qui* + un *quand* + une *conséquence* (idéalement chiffrée). | un métier/segment précis (« le plombier solo qui fait ~5 devis/semaine »). |
| **Red flag** | l'abstrait : « gagner du temps », « être plus efficace ». | « les PME », « les artisans », « les indépendants ». |

Pourquoi si strict : l'étape 2 (marché) et l'étape 4 (demande) s'ancrent sur le *qui* et le *quand*. Un problème flou en entrée = une recherche floue en sortie.

> Recettes complètes (Ask / Push-until / Red-flags / MOU-vs-FORT) pour les **8 questions** : `references/forcing-questions.md`.

## Déroulé
1. **Accueil + question ouverte** : « Qu'est-ce que tu veux créer ? Décris ton idée et le problème que ça résout, avec tes mots. » Laisse parler — c'est là que sortent les vrais mots de l'utilisateur.
2. **Reformule** l'idée en 2 lignes et **fais valider**. Tant que ce n'est pas confirmé, tout ce qui suit repose sur du sable.
3. **Pose les questions manquantes** (ci-dessous), une par une, pédagogiques — en sautant celles déjà couvertes.
4. Déduis le **stade** (pré-produit / a des utilisateurs / a des clients payants) — sert au routage aval et aux forcing questions réutilisées ensuite.
5. **Détecte l'archétype** de build ({web-saas|landing|automation|ecommerce}, défaut web-saas) **et la tenancy** ({single|multi-org}, défaut single) — déduits par défaut, 1 question **seulement si ambigu** ; puis **capte la langue du livrable** (`locale` — défaut = langue parlée, 1 question optionnelle).
6. **Écris l'`idea-brief`** selon le template, puis **confirme le cadrage** (porte légère).

> Le déroulé détaillé (machine à états S0→S12, critère de passage de chaque cran, data-flow) : `references/interview-procedure.md`.

## Les questions (chacune pédagogique, dans cet ordre)
### 1. Type / destination — pose-la en premier, c'est l'aiguilleur du pipeline
Explique que **ce choix détermine les étapes qu'on fera ou qu'on sautera**. Propose (`AskUserQuestion`) :
- **Public** — vendu à des clients externes, n'importe qui s'inscrit. → *on fait marché, SEO, billing.*
- **Interne entreprise** — outil pour une boîte précise et ses employés. → *pas de marché public ; on vérifie le fit outils/sécurité.*
- **Perso** — outil pour ton usage. → *droit au build : pas de marché, pas de billing.*

Écris `type` **et** `route` (étapes activées/sautées) dans le brief — c'est ce que l'orchestrateur relira pour router.

### 2. Problème & douleur
Patron de spécificité (colonne Problème). Ne close pas tant que tu n'as pas *qui* + *quand* + *conséquence*.

### 3. Cible
Patron de spécificité (colonne Cible). Une réponse-catégorie se re-questionne jusqu'au persona précis.

### 4. Alternative actuelle
« Comment font-ils **aujourd'hui**, sans ton outil — Excel, papier, un concurrent, rien ? » C'est ce que le produit devra battre, et l'ancre de l'étape 3. **Note tout concurrent/outil nommé** : ce sont les « concurrents nommés » que l'étape 2 branchera sur sa recherche.

### 5. Écosystème métier
« Dans quel environnement ça s'insère ? » Secteur, pays/langue, règles (RGPD, données sensibles), et surtout les **outils à connecter** (WhatsApp, email, logiciel métier, ERP). Les intégrations cadrent la faisabilité avant le build. Le **pays/secteur** capté ici alimente `jurisdiction` et sert d'indice pour `locale` (cf. « Langue du livrable » ci-dessous).

### 6. Signal préliminaire de demande (léger ici)
« As-tu déjà des **signes** que des gens en veulent — qui s'en plaignent, cherchent, paient déjà pour un truc proche ? » Rappel : **interest ≠ demand**. On note, on ne sur-interprète pas ; on creuse à l'étape 4.

### 7. Contraintes
« Des contraintes à connaître dès maintenant ? Budget, données sensibles, technique, légal. »

### 8. Ce que ça n'est PAS (optionnel)
« Qu'est-ce que ton produit **ne fera pas**, au moins en v1 ? » Déductible si l'utilisateur ne sait pas — cadre le scope dès le départ.

## Détection de l'archétype & de la tenancy (2 des 3 axes du cadrage)
Le cadrage tient sur **3 axes orthogonaux** : **`type`** (accès public|interne|perso, déjà capté en Q1), **`archetype`** (forme **technique** du livrable) et **`tenancy`** (mono- vs multi-organisation). **Modèle 3-axes + conditionnement du socle de complétude par archétype : SOURCE UNIQUE `_shared/state-schema.md`** — ici on ne fait que **détecter et écrire** les deux axes techniques, sans les redéfinir. Le nommer à l'intake pré-charge les defaults réutilisés en aval et évite de reposer la question.

**⚠️ Périmètre : on DÉTECTE et on NOMME l'archétype/tenancy AU MODÈLE — le scaffold code réel (châssis des archétypes `landing` & `automation`, bloc org-tenancy) est DÉFÉRÉ au Thème C.** Le nommer ici ne prétend pas que c'est buildable aujourd'hui ; ça cadre l'aval.

- **Archétype** (défaut `web-saas`) : `web-saas` = auth + BDD + dashboard (l'app actuelle) · `landing` = page marketing seule (+ waitlist/CTA optionnelle), **PAS d'auth / BDD produit / dashboard** · `automation` = worker/cron/bot/intégration **headless**, **PAS de socle UI produit** (admin minimal optionnel) · **`ecommerce` = site de VENTE** (catalogue + panier + **paiement one-shot** Stripe + commandes + stock) — signaux : « vendre des produits », « boutique », « e-commerce », « panier », « catalogue ». **NE PAS classer une boutique en `web-saas`** (elle vend des produits en one-shot, pas un abonnement SaaS) — c'est l'archétype `ecommerce` (`_shared/archetypes/ecommerce.md`).
- **Tenancy** (défaut `single`, pertinente pour `web-saas`) : `single` = mono-compte/mono-org · `multi-org` = B2B **vendu à N entreprises**, chacune son espace → active en aval le **substrat org-tenancy** (Org + membres + invitations + switch d'org + rôles ; SSO & billing par org en options — cf. state-schema).

**Règle (ne gonfle PAS l'intake)** : déduis **`web-saas` + `single`** en silence. **Une seule question, et seulement si** l'entretien porte un signal `landing`/`automation`/`multi-org` **non tranché** ; sinon écris le défaut sans rien demander. Doute résiduel → défaut + note « à confirmer en Phase 3 ». Les 6 livrables de la vision se dérivent de ces 3 axes (landing-only = `landing` ; automatisation = `automation` ; SaaS B2B = web-saas+public+multi-org — **table de dérivation complète dans state-schema**).

> Détection du **stade**, de l'**archétype** et de la **tenancy** (tables *condition → action* + cas ambigus) : `references/decision-matrices.md`. Cas limites & modes d'échec (idée-solution, cible « tout le monde », type mouvant…) : `references/edge-cases.md`.

## Langue du livrable (`locale`) — déduite par défaut, 1 seule question optionnelle
La langue du **produit généré** (copy UI, onboarding, emails OTP/notifs, légal, landing, SEO) est un **champ canonique de 1er rang**, **distinct** de la langue de dialogue : `locale` (code BCP-47), avec `dir` (ltr/rtl) et `jurisdiction` dérivés. Définition unique + propagation downstream : **`_shared/state-schema.md`** — ici on ne fait que le **capter** (comme `type`/`route`), sans le redéfinir.
- **Défaut = la langue dans laquelle l'utilisateur t'écrit** (il parle FR → `locale = fr-FR` ; il parle anglais → `en-US`). **Zéro question ajoutée** si le défaut lui convient — on ne gonfle pas l'intake.
- **Une seule question, optionnelle et overridable** : « Dans quelle langue le produit doit-il être ? » — à poser **uniquement** pour confirmer/changer le défaut (un francophone peut vouloir un produit **anglais**). C'est le défaut **+ 1 override**, pas une question de plus imposée à chaque projet.
- **`dir`** dérivé de `locale` : `rtl` pour ar/he/fa/ur, sinon `ltr`. **`jurisdiction`** déduite de l'Écosystème (pays/secteur — Q5) : `FR`, `US`, `EU`, `intl`… ; elle pilotera en aval les **pages légales adaptées à la juridiction** (jamais « légal FR » en dur).
- **Écris `locale`/`dir`/`jurisdiction`** dans `research/idea-brief.md` **et** `.saas-factory/state.md`. Posés à l'intake comme l'identité du projet, ils restent **invariants** ensuite (propagés design/build/emails/légal/SEO/QA sans re-demander).

## Écriture de l'artefact — `research/idea-brief.md`
Selon `assets/templates/idea-brief.md`. Structuré pour servir d'**input direct à l'étape 2 ET aux moteurs réutilisés en aval** (dont `office-hours`), donc respecte les champs : Idée reformulée · Problème & douleur (qui/quand/conséquence) · Cible (persona précis) · Alternative actuelle (dont concurrents nommés) · Type + route · **`locale`/`dir`/`jurisdiction`** (langue du livrable) · Stade · Écosystème (secteur, géo/langue, réglementaire, intégrations) · Signal préliminaire · Contraintes · Non-goals préliminaires · Critère de KILL (pré-rempli à la porte S12 ; **sans objet en perso**) · **Archétype détecté** ({web-saas|landing|automation|ecommerce}) + **tenancy** ({single|multi-org}) — cf. `_shared/state-schema.md`. Jamais de secret ni de clé dans le brief.
> 🚨 **Si `archetype = automation`** : le template porte en fin un bloc **§Intake spécifique — archétype `automation`** (déclencheur & cadence · systèmes source→cible · **boucle fermée : canal + propriétaire** · seuils & règles · **unité d'idempotence** pressentie). **Le remplir est obligatoire** — ce sont des entrées de 1er rang de 05 lite (boucle à nommer + idempotence risque n°1), du socle AU1-AU5 (07), de l'architecture (09) et du provisioning scheduler (11) ; sans elles, l'aval doit tout inventer. Pour les **autres archétypes**, **retirer** ce bloc du brief (pas de case vide parasite).

## Routage par type (à inscrire dans le brief et `state.md`)
- **public** → étapes 2 · 3 · 4 · 5 complètes.
- **interne entreprise** → **saute** marché (2) et edge (4) ; à la place vérifie le **fit** (outils/process/sécurité) ; puis étape 5.
- **perso** → **saute** 2 · 3 · 4 ; étape 5 **allégée** (« cet outil te sert à toi — on build ? »).

## Porte de sortie (légère)
**Avant le récap, pré-enregistre le Critère de KILL** *(public/interne ; **sauté en perso** — pas de marché à abandonner)* : demande « qu'est-ce qui te ferait abandonner ce projet ? » (un signal concret) et note la réponse avec ses mots dans le brief — posé avant tout chiffre, il ne pourra pas être déplacé après coup (17-deploy le rendra mesurable, 19-retro le confrontera aux faits). Puis récapitule : reformulation + type/route + cible + problème, et **demande confirmation** avant la suite (« On part sur un SaaS *public*, cible *X*, problème *Y* — c'est bien ça ? »). Ne franchis pas sans réponse. Mets à jour `.saas-factory/state.md` (étape courante, type/route, **archétype + tenancy**, `locale`/`dir`/`jurisdiction`).

> Checklist qualité du brief (Definition-of-Done), auto-vérif avant la porte, et routage de la décision : `references/definition-of-done.md`.

## Note de chaînage
L'`idea-brief` est écrit pour être **relu tel quel en aval** : l'étape 2 y prend produit + problème + cible + concurrents nommés ; `office-hours` (gstack) y trouve déjà problème, cible, douleur, alternative, stade, contraintes. Objectif : l'aval **challenge et approfondit**, il ne **re-demande pas** les bases.
