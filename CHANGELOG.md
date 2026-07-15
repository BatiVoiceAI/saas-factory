# Changelog — SaaS Factory

Toutes les évolutions notables du plugin. Format inspiré de [Keep a Changelog](https://keepachangelog.com/).

## [0.15.0] — 2026-07-15
### Changé — couverture COMPLÈTE des archétypes : `landing` + substrat `org-tenancy` réconciliés « LIVRÉS »
- **Constat (statut stale, même bug que l'ecommerce)** : le code **`landing`** (assemblage web-saas — `components/landing/*` + bloc `waitlist` + notifications + légal) **ET** le bloc **`org-tenancy`** (`0006_org_tenancy.sql` orgs/membres/invitations + RLS par org + helpers lesson #15, `lib/org/*`, `org-switcher`) **EXISTAIENT déjà** (campagne `level-up-web-saas-automation`, dans `main`) et sont **`tsc`-verts + `verify:machine` vert** — mais le statut affiché était encore « à bâtir / Thème C / déféré ». Réconcilié « à bâtir → LIVRÉ / couvert » partout : `state-schema` (×4), routing maître (×9), `phase-5-launch/routing` (×3), `CONTRIBUTING` (retitré), `01-discover` (×2), `07-completeness`, `12-integration-pass`.
- **Calibration amont `landing` — IMPLÉMENTÉE** : `02-market` + `03-positioning` avaient **0 conscience** de `landing` (le routing la **déclarait** dans sa table, mais les skills ne l'**appliquaient** pas — la « divergence silencieuse 02/03/05 » que l'audit avait trouvée). Ajouté : conditionnement `archetype=landing` → **02** en tier **Light** (cadrer le message, pas le teardown 3-vagues), **03** = positionnement = **message de la landing** (1 angle net). **05** lite-mode déjà présent.
- **`MOAT-STATUS.md`** (web-saas) : ajoute les blocs `waitlist` + `org-tenancy` (jamais listés) + migrations 0001→0006 + note `tsc`/`verify:machine`.
> **Les 4 archétypes (`web-saas` · `automation` · `ecommerce` · `landing`) + le substrat `org-tenancy` sont désormais COUVERTS au châssis.** Aucun code de châssis n'a été écrit ici (il existait) : c'est une **réconciliation de statut** + la fermeture d'un vrai trou de calibration amont. Seul résidu **universel** : l'épreuve run (build SSR + E2E) à la 1re instanciation, comme tout web-saas. Évals 7/7.

## [0.14.0] — 2026-07-15
### Ajouté — E-commerce (4ᵉ archétype first-class + châssis livré) · design anti-convergence structurelle · intégration complète du moteur `startup`

**#1 Design — anti-convergence STRUCTURELLE** (au-delà de la peau) :
- `_shared/landing-playbook.md` : **menu d'archétypes structurels** (Conversion-dense / Éditorial / Product-led / Trust local / Marketplace / Statement) au lieu d'un ordre imposé + invariant minimum — la **silhouette** de page fait partie de la distinctiveness.
- `skills/08-design-system/references/structural-sourcing.md` : **sourcing de STRUCTURE** via l'écosystème de registres shadcn (MCP shadcn / `npx shadcn add`, porte licence MIT/Apache). Porte distinctiveness étendue à la **convergence structurelle** (marqueur 21) — deux métiers → deux structures, plus « une des 5 recettes ».

**#2 E-commerce — archétype de PREMIÈRE CLASSE, de bout en bout + châssis LIVRÉ** :
- **Modèle** : détection (01), socle **EC1-EC5** (07), patterns **09 §Variante ECOMMERCE**, routing maître + phase-5, conditionnement **12/13/14/17/18/19** + `validation-spec` (edges CEO-persona) + provisioning + enums SKILL + audit de couverture (parité ecommerce). **Stripe ONE-SHOT** (`mode:payment`, jamais `subscription`), **checkout invité** par défaut. 3 pièges DURS (portes 13/14/17b) : **P1** survente → décrément atomique, **P2** intégrité prix → recalcul serveur, **P3** idempotence webhook → `unique(stripe_session_id)`.
- **Châssis `_shared/blocks/ecommerce/` LIVRÉ** (bâti via **ultracode** — Workflow 6 agents — PUIS vérifié) : logique commerce **dependency-light** (`lib/pricing` P2 · `lib/inventory` P1 · `lib/cart`/`lib/orders` · `webhook` P3) + migrations (RLS + **RPC `fulfill_paid_order`** réunissant P1+P2+P3 en **une transaction**, `SECURITY DEFINER` + lesson #15) + **`verify:machine` 5 lints** + **`tsc` vert** + **23 tests `node:test` verts**. L'**UI se dérive du châssis `web-saas`** (remplace `billing` abonnement par le checkout one-shot ; documentée dans `BLOCKS.md`, pas compilée).

**Intégration moteur `startup-skill`** (4 sous-skills vendorés MIT, gelés) — **complétée** :
- 3 trous de complétude fermés : **`startup-pitch`** câblé (optionnel, opt-in) · **Brand Ph5 → 08-design** (tone-of-voice + brand-personality nourrissent la direction + la voix, sans casser l'anti-convergence) · **Validation Ph8 kill-criteria → 05 + 19** (grille pré-enregistrée mesurable).
- Carte globale `_shared/startup-engine-map.md` (pilotage étape × tranche × sortie → aval). ⚠️ Vendor **GELÉ** — ne pas re-synchroniser (l'upstream récent a supprimé `verification-agent.md` dont 04-demand-edge dépend).

### Changé
- **Doctrine modèle explicitée** : **Opus 4.8 effort MAX partout ; phases de CODE = ultracode** (`saas-factory/SKILL.md` + `12-build/org-hierarchy §ULTRACODE`) — les **14/14 agents** portent `model: opus` + `effort: max`, jamais de routage économique par défaut.
- **Évals : 7/7** (ajout du plancher `verify:machine` du châssis ecommerce + check châssis `web-saas`+`automation`+`ecommerce` dans l'audit de couverture).

## [0.13.0] — 2026-07-14
### Ajouté — Campagne « plugin killer », Thème 3 : autonomie & accessibilité (clôt la campagne)
- **T3.1 — plafond DUR de 7 prompts à l'intake** (exigence fondateur « 0-7 questions, jamais plus », qui n'était pas encodée) : `01-discover` SKILL (5ᵉ règle des questions) + `interview-procedure.md` (conduite transverse) — le budget de 7 couvre TOUT (contenu + reformulation + archétype/tenancy/locale + KILL + confirmation) ; déduire le dérivable en silence ; à 7 atteint, arrêter et déduire.
- **T3.2 — rendu document accessible** (exigence fondateur « tout livrable consultable par un non-tech ») : `scripts/render-report.mjs` = renderer markdown→HTML **autonome, stylé, zéro-dépendance, prêt à Imprimer → Enregistrer en PDF** (titres/tables/listes/citations/gras/code/liens ; thèmes clair+sombre ; styles d'impression). Câblé à la **porte 05** (rend + présente `opportunity-brief.html` avant la décision Go/Ajuster/Go-test/No-Go) et à la **porte 07** (rend + présente `product-spec.html` avant la validation des fonctionnalités). Réutilisable pour tout rapport.
> **Campagne « plugin killer » bouclée** (v0.11 → v0.13) : machine de guerre (hooks mécaniques + LSP + évals + effort MAX/ultracode) · hygiène des skills (ToC + one-level vérifié) · autonomie & accessibilité (cap intake + documents rendus). Le plugin est passé de « la doctrine dit » à « le harnais impose », dans le respect des best-practices officielles.

## [0.12.0] — 2026-07-14
### Changé — effort MAX partout · doctrine ultracode · Thème 2 (hygiène des références)
- **Directive fondateur** : les 14 agents passent de `effort: high` à **`effort: max`** (Opus 4.8, déterministe). Doctrine gravée (`org-hierarchy.md`) : effort MAX partout ; les **phases de code = ULTRACODE** (fan-out multi-agents 1 feature=1 worktree=1 agent + cascade adversariale 13 + plancher mécanique `machine-gate`).
- **Thème 2 — hygiène des références** :
  - **ToC sur les 62 références > 100 lignes** (best-practice officielle « références longues → table des matières en tête ») via `scripts/add-reference-toc.mjs` (idempotent, zéro-dep) — mitige la lecture partielle.
  - **Références « one-level depuis SKILL.md » — VÉRIFIÉ CONFORME** par un **workflow ultracode** (27 agents parallèles, 1 par skill) : les 27 SKILL.md lient déjà directement toutes leurs références (spot-check 14-qa 6/6, 07 7/7). Le fan-out a *vérifié* la best-practice au lieu de casser le DRY par un aplatissement inutile.
  - Retrait de l'orphelin daté `_shared/AUDIT-v0.4.4.md`.
- Non-régression : `evals/run.sh` 6/6 vert.

## [0.11.0] — 2026-07-14
### Ajouté — Campagne « plugin killer », Thème 1 : la MACHINE DE GUERRE (primitives Claude Code)
> Audit (prisme `docs/RAPPORT-PLUGIN-CLAUDE-CODE.md`, doc officielle) : le plugin avait la méthode (skills), la flotte (14 agents) et avait **codé les pièces mécaniques** (`verify:machine`, healthcheck, run_log) — mais il les **actionnait en prose**, jamais via les primitives qui les *enforce*. Débranché. Ce thème les branche.
- **Portes MÉCANIQUES (3 hooks, 108 cas de test)** : `mcp-guard.sh` (`PreToolUse` matcher `mcp__.*`) referme l'angle mort destructif MCP que le plugin documentait lui-même (DROP/TRUNCATE/DELETE-sans-WHERE + outils delete/destroy/remove distants → `ask`) — **21/21** ; `machine-gate.sh` (`SubagentStop` matcher `feature-dev`) rend **mécanique le plancher machine** (`lessons #18`) : `verify:machine` rouge à la fin d'une lane → `{"decision":"block"}`, le feature-dev corrige avant que son DEV-DONE ne remonte la cascade 13 — **fail-open partout**, **7/7** ; `safety-guard` (Bash) toujours **80/80**.
- **Flotte configurée** : les 14 agents passent en `effort: high` déterministe (cohérent « Opus partout / qualité max »). *(Différés avec raison : `maxTurns`, `isolation:worktree`, `disallowedTools`.)*
- **Intelligence de code** : `.lsp.json` (serveur de langage TypeScript, `npx --no-install`, fail-safe) + `typescript-language-server` en devDep du châssis → diagnostics compilateur temps réel pour les agents de build (à confirmer en run réel).
- **Eval harness** (`evals/`) : `run.sh` agrège en 1 commande toutes les vérifs mécaniques (**6/6 vert**, = check de vague G6 dans `CONTRIBUTING.md`) ; `scenarios/*.json` = rubriques comportement (12/13/14) au format officiel, dérivées des tables « modes d'échec ».
- Garde-fous tenus : contrat d'I/O officiel des hooks **vérifié avant de coder** ; tout ce qui risquait un faux-blocage (`Stop` global, `maxTurns`, `isolation:worktree`, `disallowedTools`) **différé avec sa raison**. Suivi : `docs/CAMPAGNE-PLUGIN-KILLER.md`.

## [0.10.0] — 2026-07-13
### Ajouté — Chantier D : gouvernance & anti-dérive (capacité durable)
> Trou d'audit : CHANGELOG/tags désynchronisés (0.4.4→0.7.1 non tracés — réconciliés par le commit baseline), un faux « done », et **aucun garde-fou empêchant la dérive** (l'asymétrie d'archétype des Chantiers A/B avait justement dérivé en silence).
- **Auto-audit de couverture archétype** : nouveau `scripts/audit-archetype-coverage.mjs` (zéro dépendance) — vérifie que chaque skill critique (12/13/14/18/19) traite `automation` + que le gate de mesure existe en 12-build + que les 2 châssis vivants sont présents. **8/8 vert** ; il aurait **échoué** avant le Chantier B (13/18/19 = 0 mention automation). À lancer à chaque vague (G6). Audite LE PLUGIN, jamais les runs utilisateur.
- **Doctrine de dev `CONTRIBUTING.md`** : grave le protocole anti-régression G1-G6 (tag de rollback, **édition additive/conditionnelle**, vérif deux châssis, preuve d'invariance, smoke re-run, discipline de vague) + le rappel snapshot-cache + la frontière Thème C.
- **Honnêteté rétablie** : le faux « P0.3 events câblés » (v0.4.0) est **rectifié** (définis alors, câblés en v0.8.0). Frontière **Thème C explicite** : un run sur `landing` / `tenancy=multi-org` le **signale et ne bluffe pas** le build (règle de comportement dans `routing.md` + `state-schema.md`) — ferme la seule divergence non-dite que l'audit avait trouvée (02/03/05 landing).
- **Rappel de périmètre** : couverture pleine A-à-Z = `web-saas` + `automation` (choix assumé) ; `landing` + org substrate restent Thème C, différés **honnêtement**.

## [0.9.0] — 2026-07-13
### Ajouté — Chantier B : l'automation devient un archétype de PREMIÈRE CLASSE dans le jugement
> Trou d'audit (rétro StockSentinel) : 13-reviews, 18-metrics et 19-retro n'avaient AUCUNE conscience d'archétype → un worker headless était faux-négativé par le cran Designer (FAIL « pas d'empty-states »), puis mesuré contre un funnel AARRR inexistant. 12 et 14 étaient conditionnés, pas eux.
- **Cascade 13 archétype-aware (édition strictement additive — chemin web-saas inchangé, prouvé par diff G4)** : le cran **Designer est `N/A` tracé** pour `automation` (headless, pas de surface), l'edge (boucle fermée + idempotence) passe au **CEO-persona** — exactement ce que l'étape 10 écrivait déjà dans la spec de validation. `N/A` **formalisé dans `verdict-schema.md`**. Câblé dans : `cascade-protocol.md` (chaîne), `agents/designer.md` (garde anti-faux-négatif en tête + verdict N/A), `reviewer-playbooks.md` / `review-gates.md` / `SKILL.md` (cran 3). Plus jamais de FAIL Designer sur du headless.
- **Walking-skeleton automation** (`12-build/walking-skeleton.md`) : branche headless complète (config zod → 1 run → effet persisté → `run_log` → boucle fermée → idempotence 2-grains) + DoD dédiée ; gestes de fondation web-saas (charte/visuels/shell) déclarés N/A headless.
- **Plancher machine du châssis automation** : nouveau `_shared/blocks/automation/scripts/verify-machine.mjs` (auto-contenu, zéro dépendance) portant **lint:secrets** (le worker manipule SERVICE_ROLE/RESEND/WEBHOOK) + **lint:sql** (classe 42702 des migrations) ; `npm run verify:machine` **vert** (8 fichiers src + 2 migrations). Comble l'absence de plancher pour l'archétype qui en avait le plus besoin.
- **18-metrics + 19-retro archétype-aware** : 18 lit des **métriques de run** (succès des runs, entités traitées, idempotence, fraîcheur, taux d'alerte via `run_log`/healthcheck) au lieu d'un funnel PostHog inexistant ; 19 juge le plan « produit » d'un automation sur la fiabilité/idempotence/boucle fermée, critère de kill run-based. `tsc` automation + web-saas verts.

## [0.8.0] — 2026-07-13
### Ajouté — Chantier A : la boucle de MESURE est enfin câblée (pilier de vision tenu)
> Trou d'audit (run AgencyDesk) : `capture()` n'était posé à AUCUN call-site produit → funnel d'activation muet, Phase 6 aveugle au 1er run. Corrigé de bout en bout, **en miroir des notifications** (câblées au call-site, elles).
- **Châssis web-saas — la boucle est démontrée, plus seulement définie** : `capture("waitlist_joined")` au succès du `waitlist-form` (action de valeur landing), `identify()`/`resetIdentity()` câblés dans `top-nav` (spine d'identité, no-op si PostHog absent). `events.ts` : event `waitlist_joined` + **contrat de spécialisation** (« 12-build spécialise le catalogue au domaine, pose le `capture()` au call-site »). `grep capture(|identify(` hors `lib/analytics/` : passe de **0** à **3 call-sites réels** ; `tsc` + `verify:machine` (5 lints) verts.
- **12-build (`integration-pass.md`) — nouveau garde-fou bloquant « Boucle de mesure »** : grep du call-site pour `capture()` (jumeau du grep boucles fermées), **conditionné par type/archétype** (funnel public/interne/perso · `waitlist_joined` landing · métriques de run automation) + mode d'échec « Funnel muet ». Comble le vide que le pré-vol 17 §E dénonçait sans destinataire.
- **07-product-spec** : l'aha moment **déclare l'event analytics à émettre** (chaîne 07 → 12 `capture()` → 18 lecture). **14-qa** : le faux-client vérifie l'**émission réelle** en staging (PostHog live-events), pas la définition. **17-deploy §E** : check events **conditionné par archétype** (automation → métriques de run, pas funnel). **18-metrics** : lecture d'un funnel réel (délégation du fix vers 12-build désormais honorée).

## [0.7.1] — 2026-07-13
### Corrigé (les moteurs vendorés sont maintenant APPELABLES au runtime — avant, chemins morts → improvisation)
- **Cause racine** : toutes les références `vendor/…` étaient **relatives et non ancrées** ; au runtime le cwd = le projet du client → `Read vendor/…` échouait, l'agent refaisait la méthode à la main. Deux vendors (`security-review`, `accessibility-review`) n'étaient référencés **par aucun chemin** (cités par nom seulement).
- **Nouveau hook `SessionStart`** (`hooks/announce-plugin-root.sh`) : annonce `[saas-factory] {PLUGIN_ROOT} = /chemin/absolu` + la règle de résolution dans le contexte de chaque session. Fail-open, auto-localisation si `CLAUDE_PLUGIN_ROOT` absent/invalide.
- **`_shared/vendored-engine-protocol.md` §0 (nouveau)** : résolution de `{PLUGIN_ROOT}` (hook → chemin du SKILL courant → find de l'install → déclarer + fallback Option B), **Read de vérification avant tout dispatch**, règle absolue « jamais de `vendor/…` relatif dans un brief de sous-agent — toujours l'absolu résolu ». « Règle des deux » → **« règle des trois »** (le (0) = chemin résolu).
- **Notation unifiée `{PLUGIN_ROOT}/vendor/…`** dans TOUTES les références moteur (02-market incl. formes ellipsées `vendor/.../x.md`, 03, 04, 05, 06, 07, 01-discover, phase-1, phase-2) + pointeur §0 à chaque point de chargement moteur.
- **Master (`saas-factory`)** : nouvelle étape de démarrage n°2 — résoudre `{PLUGIN_ROOT}` UNE fois et l'écrire dans l'état ; `_shared/state-schema.md` : nouveau champ **`plugin_root`** (§Environnement, re-vérifié à chaque reprise) ; `state-resume.md` : séquence de démarrage 1→6.
- **Cascade (13) — les deux vendors muets sont câblés et exécutables** : cran CTO exécute `{PLUGIN_ROOT}/vendor/security-review/.claude/commands/security-review.md` sur le **diff de la feature** (préambules `!`git …`` reproduits à la main, base = la lane du worktree ; l'Action Python amont = dépendance CI optionnelle, PAS le moteur ici) + affinage `docs/custom-*.md` ; cran Designer exécute `{PLUGIN_ROOT}/vendor/accessibility-review/SKILL.md` **critère WCAG par critère** (ratio mesuré exigé). Câblé dans SKILL 13, `review-gates`, `owasp-cards`, `reviewer-playbooks` (+ DoD « ouvert via Read, pas de scan de mémoire »), `agents/cto.md`, `agents/designer.md`.
- **12-build** : mention périmée « (À vendorer dans `vendor/superpowers/`) » corrigée — superpowers EST vendoré ; `org-hierarchy.md` liste les 7 moteurs avec leurs fichiers compagnons (`implementer-prompt.md`, `code-reviewer.md`…) et impose le chemin absolu dans les briefs dev.
- **10-execution-plan** : `writing-plans` (superpowers vendoré) câblé dans « À lire d'abord » (granularité, chemins exacts, critères de vérification).
- **14-qa** : note `webapp-testing` honnête (pas encore vendoré → `VENDORING-TODO.md` ; fallback : skill installé sinon Playwright direct du châssis).
- **`vendor/README.md`** : superpowers ajouté à la table (retiré du « à venir ») + nouvelle section « Accès au runtime — `{PLUGIN_ROOT}` » ; `hooks/README.md` documente le hook d'ancrage.

## [0.4.4] — 2026-07-13
### Ajouté (moteur de visuels câblé dans le pipeline — directive fondateur « crée des images pour les designs »)
- **Nano Banana Pro (`gemini-3-pro-image`) est le moteur de VISUELS du plugin, câblé de bout en bout.** Quand le design a besoin d'imagerie (hero éditorial/atmosphérique, **OG image**, empty-states, spot art, favicon/wordmark), on **GÉNÈRE** un visuel **on-brand dérivé de `DESIGN.md`** (palette/typo/métier) via le helper `_shared/blocks/web-saas/scripts/generate-visual.mjs` — **jamais du stock ni un placeholder**. C'est un **levier d'anti-convergence côté image** (deux métiers → deux prompts → deux visuels).
- **Doctrine** (`_shared/design-doctrine.md`) : nouvelle sous-section **§Génération de visuels (Nano Banana Pro)** (helper, `public/generated/`, `next/image`, OG générée, favicon/wordmark, repli honnête) ; ligne Arsenal mise à jour (modèle + helper + sortie) ; **marqueur n°17 clarifié** — l'imagerie de marque générée on-brand est **permise** ; ce qui reste interdit, c'est le stock/placeholder et une image IA **maquillée en screenshot produit** (la preuve « voici l'app » reste un vrai screenshot).
- **Design system (étape 08)** : mouvement 4 renommé **« Génération de visuels (Nano Banana Pro) »** (SKILL + `procedure-detaillee` + matrice **M5** élargie : hero éditorial/OG/spot art/favicon en plus du favicon+empty-state) ; forcing-question **A5** réorientée (« GÉNÉRÉS on-brand, pas du stock ») ; template `DESIGN.md` : nouvelle section **« Visuels générés »** (tableau prompts→`public/generated/`).
- **Build (étape 12)** : la **génération des visuels devient un geste de fondation du walking skeleton** (après la charte) — `scripts/generate-visual.mjs` appelé depuis `DESIGN.md` → `public/generated/`, câblé `next/image` + OG dans `metadata`. Nouveau **garde-fou d'intégration bloquant** « Visuels générés on-brand » + ligne métadonnées étendue à l'**OG générée** ; DoD walking skeleton + matrices mises à jour. Châssis : `CONVENTIONS.md` **§15 Visuels générés**.
- **Config / provisioner** : `providers.visuals="nano-banana"` → **modèle `gemini-3-pro-image`**, clé **`GEMINI_API_KEY`** (déjà en infra-setup) — `config-schema` (note modèle + porte design « distinctiveness » + `GEMINI_API_KEY` au tableau des secrets), `stack-defaults`, `decision-matrices` alignés. Repli honnête inchangé (`visuals="none"` ou clé absente → pas d'images simulées).

## [0.4.3] — 2026-07-12
### Corrigé (trouvé par le run réel « Poser » — ultracode, base Opus 4.8)
- **Recette live durcie** : « route 200 ≠ feature qui marche » — la recette EXÉCUTE chaque feature Must du PRD sur la prod avec preuve d'effet, échoue bruyamment. Corrige le trou OTP (l'ancien test ouvrait une session via `generateLink` sans mesurer le code → masquait le bug 8-vs-6) : mesure la longueur du vrai code + `verifyOtp` par le chemin réel. Chaque **RPC/fonction Postgres** invoquée ≥1× (0 erreur runtime). Même exigence d'exécution au faux-client 14.
- **Robustesse SQL** : `09-architecture` impose `#variable_conflict use_column` / qualification systématique (cause du bug résa 42702) ; `12-build` ajoute une porte **smoke-test des RPC contre une vraie base** (`tsc`/`next build` verts ≠ SQL correct). Leçons #14/#15.
- **Base model = Opus 4.8 partout** : les 14 agents passent à `model: opus` (fini le routage économique), le master pose « qualité maximale / ultracode » — qualité > vitesse, directive fondateur.
- **Anti-scaffolding — la tuyauterie exemple du châssis ne fuit plus dans le produit livré.** Un non-tech découvrait dans SON produit une entité « Items — entité exemple du bloc CRUD, à cloner » et un lien de nav mort « Facturation » → `/billing` (404). Corrigé : `12-build` **retire** l'entité `items` + le dashboard/sidebar de démo au **1er geste** du walking skeleton et **régénère la nav depuis les features du PRD** ; nouvelle **porte d'intégration bloquante** (« zéro tuyauterie exemple » : `/items`→404, 0 texte de dev, 0 lien mort) ; **nav billing CONDITIONNELLE** (`/billing` seulement si `billing=stripe`, garde `isBillingEnabled()`) ; châssis (`BLOCKS.md`/`CONVENTIONS.md` §10-11) marque les exemples « RETIRÉS au build ». Rejeu au faux-client (14) + re-preuve en live (17). Nettoyage châssis : lien de nav orphelin « Réglages » → `/settings` (page inexistante) retiré de `app-sidebar.tsx`.

## [0.4.2] — 2026-07-12
### Corrigé (trouvé par un déploiement réel — cron de rappels vs plan Vercel Hobby)
- **Rappels de boucle fermée = cron QUOTIDIEN par défaut.** Le pattern de rappels générait un `vercel.json` avec un cron sub-quotidien (`"*/10 * * * *"`) qui **faisait échouer le déploiement** sur le plan **Vercel Hobby** (« Hobby accounts are limited to daily cron jobs »). Défaut posé partout : **un cron quotidien** (`"0 8 * * *"`) + worker qui **balaie les échéances des ~24-48 h** à venir, **idempotent via `notification_jobs`**. Un rappel fin (H-2) / toute cadence sub-quotidienne **exige Vercel Pro** — capacité optionnelle, jamais le défaut.
- Câblé dans : `_shared/boucles-fermees.md` (garde-fou « Rappels planifiés » + question 4), `_shared/stack-defaults.md` (note « Vercel — crons & plan »), `_shared/blocks/web-saas/BLOCKS.md` (bloc `notifications`), `skills/09-architecture` (matrice cron), `skills/07-product-spec` (fiche feature + template), `skills/12-build` (règle boucles fermées).
- **Pré-vol 17-deploy** : nouveau check « **cadence cron compatible avec le plan d'hébergement** » + entrée au catalogue de cas limites.

### Corrigé (trouvé par le run réel « Poser » — expéditeur email & SMTP)
- **Expéditeur email sur domaine non vérifié** : le plugin dérivait `noreply@<domain>` (apex) mais ne vérifiait que `mail.<domain>` dans Resend → Resend refuse d'envoyer depuis un domaine non vérifié (**HTTP 500**). Invariant posé partout : **le domaine de `email_from` = le domaine vérifié dans Resend** (`provisioner-email`, `provisioner-db`, `provisioning-plan`, `mcp-map`, `stack-defaults`).
- **L'adresse d'expéditeur devient une QUESTION d'`infra-setup`** (plus un défaut apex imposé) — SKILL + connection-procedure + config-schema + decision-matrices.
- **Resend gratuit = 1 seul domaine** : changer d'adresse = `provisioner-email` REMPLACE le domaine (delete+add+re-DNS), jamais empiler (évite le 403).
- **Gotchas SMTP Supabase↔Resend** dans `provisioner-db` (évitent le 500) : `smtp_port` en **chaîne** ('587'), **bloc SMTP indivisible** (toujours PATCHer complet), `rate_limit_email_sent`~30 + `smtp_max_frequency`~15s desserrés (défaut 2/h bloquait l'utilisateur).

## [0.4.1] — 2026-07-12
### Corrigé (trouvé par un run réel — « Poser »)
- **OTP longueur** : `provisioner-db` pinne désormais `mailer_otp_length = 6` (API Management + env GoTrue self-host). Le défaut Supabase est **8** alors que l'input OTP du châssis n'accepte que 6 cases → sans le pin, le code reçu par email ne rentrait pas dans l'input et la vérif échouait pour **tous** les projets OTP. Invariant posé : `mailer_otp_length` (Supabase) = nb de cases de l'input (`auth-form.tsx`).
- Aligné les listes de champs Auth (`provisioning-plan.md`, `mcp-map.md`).

## [0.4.0] — 2026-07-12

Refonte qualité majeure, déclenchée par l'usage réel (premier SaaS déployé : `booking.speechflow.fr`). Objectif : passer de « génère un SaaS qui compile » à « livre un produit **pro, complet et vérifié**, pour SaaS public / outil interne / outil perso ».

### Ajouté — doctrines & références
- `_shared/design-doctrine.md` — doctrine anti-AI-slop issue de recherche web : 20 marqueurs interdits (grep-ables), leviers de design distinctif, 12 paires de polices, 5 recettes complètes, sources de blocs vendorables (licences vérifiées), checklist de review binaire.
- `_shared/design-doctrine.md` §Arsenal créatif — outiller la créativité (création + duplication) : Motion (MIT) / GSAP (gratuit, npm), galeries de templates MIT, `@vercel/og`, Nano Banana ; règles CRÉER vs DUPLIQUER + re-thématisation.
- `_shared/landing-playbook.md` — anatomie des landing qui convertissent (structure canonique, formules de headline, preuve sociale honnête, checklist).
- `_shared/boucles-fermees.md` — « aucune action de valeur muette » : dérivation universelle (public / interne / perso) des confirmations, notifications, rappels, traces. Câblé en 07/12/14 et prouvé en recette live.
- `agents/live-qa.md` + `skills/17-deploy/references/live-qa.md` — **recette live post-deploy** : teste toutes les fonctionnalités sur le vrai site, boucle fix→redeploy→re-test (3 cycles). « Déployé ≠ livré ».

### Ajouté — profondeur & complétude
- Auth **passwordless OTP / magic link** par défaut dans le châssis (plus de mot de passe).
- Étape 08 : pattern **design-shotgun** (3 variantes réellement codées → choix sur du réel).
- Portes 12/13/14 durcies : anti-slop binaire, complétude (onboarding → vraie entité, empty states, légal FR, metadata brandées), boucles fermées.

### Corrigé — roadmap d'audit (Vague A)
- P0.2 pré-vol « services tiers & déclencheurs » · P0.3 events AARRR **définis** (catalogue typé `events.ts`) — ⚠️ *rectificatif honnêteté (v0.9.0) : ils n'étaient PAS encore **câblés** aux call-sites ici ; le `capture()` réel a été posé au **Chantier A / v0.8.0**. Le libellé « câblés » de la v0.4.0 était un faux « done ».* · P0.4 invariants DB & anti-abus anonyme en règles d'architecture · P0.6 taille marché produite en amont.
- P1.1 filet post-launch · P1.2 critère de KILL écrit au lancement · P1.5 hook safety-guard recadré & testé · P1.6 routage de modèle des agents · P1.8 provisioning par type · P1.9 SEO technique = code · P1.10 mémoire portable (`~/.saas-factory/lessons-learned.md`) · P1.11 replis provisioning réels · P1.13 héritage du verdict.
- Table de routage **canonique** étape × type (`skills/saas-factory/references/routing.md`) ; copies → renvois.

### Gouvernance
- Le plugin est désormais un **dépôt git** (tag `v0.3.6-snapshot` comme point de rollback) ; règle : chaque vague = commit.

### Ajouté — profondeur PM/CEO (Vague B)
- **Phase 1 = vraie analyse concurrentielle** : méthodo `startup-competitors` vendorée (MIT), 3 vagues (deep-dives 5-8 concurrents + adjacents, pricing intelligence tier-par-tier, sentiment mining avec verbatims sourcés + language map + churn signals, GTM/channel map), quotas de preuve, honesty-protocol.
- **PRD PM-grade** (étape 07) : chaque feature Must = 11 sections (objectif/job, persona, user story, flow détaillé, tous les états, règles métier, boucles fermées, critères Given/When/Then, volet technique). Socle complétude généralisé aux 3 types + metadata/favicon brandés (S8).
- **P0.1** plan soldé prouvé par exécution (registre `plan-ledger.md`, tests committés, E2E cœur exécuté) · **P0.5** déploiement privé réel interne/perso (bloc `enrollment.ts` + `access-gate` + middleware noindex) · **P0.7** pricing = features livrées.
- **« Cap qualité »** (le soin prime sur la vitesse) gravé dans l'orchestrateur maître.
- Fusion des doublons (§5) : research/ 7→5 fichiers, le PRD absorbe MVP + priorisation ; **Go-test** devient une 4ᵉ issue de porte canonique.

### Gouvernance
- Le plugin est un **dépôt git** (tag `v0.3.6-snapshot`) ; chaque vague = commit + entrée CHANGELOG.

### Reste (backlog, non bloquant)
- Adoptions issues de l'évaluation comparative (gstack / startup / superpowers) — à relancer (perdue au gel nocturne).
- Cosmétiques : diagrammes ASCII compressés, quelques mentions génériques « user-stories » à préciser.

## [0.3.6] — 2026-07-11
- Emails autonomes : domaine d'envoi générique unique, SMTP custom = Resend posé par la machine (lève la limite Supabase, zéro upgrade payant), pour confirmation de compte **et** transactionnel.

## [0.3.x] — 2026-07-11
- Densification des 27 skills, moat châssis `web-saas` (Next.js 15 + Supabase), hook de sécurité PreToolUse, choix open-source ↔ managé exécutable, infra-setup (profil + connexion des outils).
