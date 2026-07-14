# Référence — Déploiement AUTOMATION (scheduler « GitHub Actions schedule ») + vérif de boucle fermée headless

> Conditionnement par archétype. S'applique **quand `archetype = automation`** (worker/cron/bot headless — modèle en source unique `_shared/state-schema.md §Modèle à 3 axes`, socle AU1-AU5 `_shared/archetypes/automation.md`). Pour `web-saas`/`landing`, c'est `deploy-procedure.md` qui gouverne (Vercel/DNS/tracking). Ce fichier **ne remplace pas** la machine à états du déploiement — il en donne la **cible** et les **caveats** propres à l'automation. La rigueur (pré-vol vert, plan chiffré, apply réversible, canary, jamais de faux succès) est **identique** ; ce qui change, c'est **quoi on provisionne** (un ordonnanceur, pas un domaine + DNS) et **comment on vérifie** (boucle fermée headless, pas recette live authentifiée).

## Le host d'une automation EST son ordonnanceur
Un web-saas se déploie sur un hébergeur + DNS ; une automation se déploie sur un **scheduler**. Le « cutover » n'est pas un basculement DNS mais l'**activation d'un déclencheur planifié** qui exécute le worker one-shot (`node dist/index.js`) à la cadence voulue. Cibles possibles (défaut factory = **GitHub Actions `schedule:`** — zéro infra à gérer, le repo CI est déjà là) :

| Cible | Quand | Éphémérité du disque |
|---|---|---|
| **GitHub Actions `schedule:`** (défaut) | repo déjà sur GitHub, cadence ≥ 5 min, pas de secret d'infra à gérer | **éphémère** (runner effacé à chaque tick) |
| Cron système / conteneur long-running (VPS) | cadence fine (< 5 min), contrôle du fuseau, état sur disque persistant voulu | persistant possible |
| Cloud Scheduler / Lambda planifiée | déjà sur ce cloud | **éphémère** |

🚨 **Runner éphémère ⇒ état durable OBLIGATOIRE.** Sur GitHub Actions / Cloud Scheduler / CI, le disque est **effacé à chaque exécution** → le fallback fichier `.automation/*.json` disparaît → **l'idempotence (run ET entité) est cassée en silence**. Sur ces cibles, la **table Supabase (REST service-role)** n'est **pas** optionnelle : elle porte les curseurs d'idempotence et l'entité métier. Le fallback fichier n'est valide **que** sur disque persistant (VPS/conteneur) ou test local one-shot. Cette règle vient du modèle de données (`skills/09-architecture/references/data-model.md §Variante AUTOMATION`) et **conditionne la reco de déploiement ci-dessus**.

## Le workflow = CI + scheduler en une seule ressource
Sur GitHub Actions, **un seul fichier** `.github/workflows/<worker>.yml` est à la fois la **CI** (build/test à chaque push) et le **scheduler** (`schedule:`). Squelette (référence — le worker de run `runs/stocksentinel/worker/.github/workflows/stocksentinel.yml` en est l'implémentation prouvée) :

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'   # sync : ALIGNER l'expression sur SYNC_INTERVAL_HOURS (ici N=6)
    - cron: '0 6 * * *'     # digest : ALIGNER sur DIGEST_HOUR — en UTC (voir caveats)
  workflow_dispatch:         # déclenchement manuel = smoke-test / rejeu contrôlé
    inputs: { mode: { type: choice, options: [sync, digest], default: sync } }

concurrency:                 # un seul run à la fois → renforce l'idempotence mono-instance
  group: <worker>
  cancel-in-progress: false  # ne JAMAIS couper un run en cours

permissions: { contents: read }   # le workflow ne pousse rien

jobs:
  run:
    runs-on: ubuntu-latest
    timeout-minutes: 15      # filet : un run bloqué ne mange pas le quota
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: node dist/index.js
        env:
          # RUN_MODE dérivé du cron (ou de l'input manuel) — JAMAIS un secret
          RUN_MODE: ${{ github.event.inputs.mode || (github.event.schedule == '0 6 * * *' && 'digest' || 'sync') }}
          # secrets sensibles → ${{ secrets.* }} (masqués) ; config non sensible → ${{ vars.* }}
          SHOP_API_TOKEN: ${{ secrets.SHOP_API_TOKEN }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

**Split Secret / Variable** : les **valeurs sensibles** (tokens, clés API) vivent en **GitHub Actions Secrets** (`${{ secrets.* }}`, masquées dans les logs) ; la **config non sensible** (cadence, seuils, mode) en **GitHub Actions Variables** (`${{ vars.* }}`, lisibles). `RUN_MODE` n'est **jamais** un secret. Aucune valeur de secret n'est écrite dans le YAML ni dans `state.md`/logs (`_shared/safety-rails.md §4`). Détail du câblage secrets/variables → `skills/11-project-setup/references/secrets-wiring.md` (variante automation).

## ⚠️ CAVEATS OPÉRATIONNELS de `schedule:` (à documenter dans `deploy/log.md`)
Ces quatre pièges sont **invisibles au build** (`tsc`/`npm build` verts) et **silencieux en prod** — chacun est un finding réel du run StockSentinel. Le plan de déploiement (porte de publication) DOIT les énoncer, et la mitigation retenue est **tracée**.

1. **Cron = UTC uniquement.** GitHub Actions n'a **pas** de fuseau : `'0 6 * * *'` = **06:00 UTC**, pas « 6 h à Paris ». Un digest « chaque matin à 8 h heure de Paris » doit être **décalé à la main** — et le décalage **change entre hiver (UTC+1) et été (UTC+2)**. Mitigation : soit accepter un digest « à ~UTC fixe » (le plus simple, tracé), soit dupliquer/ajuster l'expression au passage à l'heure d'été, soit calculer l'heure locale **dans le code** (Intl/TZ) et déclencher plus tôt. **Écrire le choix** dans `deploy/log.md`.
2. **`schedule:` est best-effort (retardé, parfois sauté).** GitHub ne garantit **pas** l'heure exacte : sous charge, un tick peut **glisser de plusieurs minutes** voire **sauter**. Mitigation **native du châssis** : l'**idempotence de run** (clé bucketisée sur une fenêtre déterministe, pas sur `now()`) absorbe un tick en retard ou rejoué **sans double effet**, et **AU3** (healthcheck « retard vs cadence ») rend le retard **visible** au lieu de le subir. Ne **jamais** compter sur la ponctualité du tick pour la correction — compter sur l'idempotence + le balayage d'une fenêtre.
3. **AUTO-DÉSACTIVATION après 60 j sans activité du repo = mort silencieuse du scheduler.** GitHub **désactive** un workflow `schedule:` après **60 jours sans push/activité** sur le repo (mesure anti-repo-abandonné). Le worker **s'arrête sans erreur, sans alerte** — la boucle fermée elle-même se tait (aucun run ⇒ aucun échec ⇒ aucune alerte AU4). C'est le piège le plus dangereux car il **désarme la supervision**. Mitigations (choisir + tracer) : **keepalive** (un commit périodique automatisé / un job qui touche le repo), OU **basculer sur un cron système / conteneur** (VPS) qui ne s'auto-désactive pas, OU une **sonde externe morte-homme** (uptime monitor qui alerte si aucun run n'a été journalisé depuis > cadence). Sans mitigation, poser explicitement le risque « le scheduler peut mourir à J+60 » dans `deploy/log.md`.
4. **Granularité minimale = 5 min.** Le `cron:` de GitHub Actions ne descend **pas sous 5 minutes** (`*/1` est ignoré/arrondi). Une cadence < 5 min réellement voulue ⇒ **cron système / conteneur long-running**, pas GitHub Actions (décision + cible tracées).

## Pré-vol automation (delta vs `preflight-checklist.md`)
Le pré-vol reste **bloquant et vert-avant-apply**. Les items web-saas sans objet (domaine, DNS, `git_author` Vercel, redirect URLs, noindex de `*.vercel.app`, events funnel produit) sont **retirés et tracés** ; à la place :
- [ ] **Scheduler réellement branché ET exécution prouvée** : `workflow_dispatch` déclenché **une fois** en réel → logs d'un run one-shot complet (pas « le cron est dans le YAML »).
- [ ] **Expressions cron alignées** sur `SYNC_INTERVAL_HOURS` / `DIGEST_HOUR`, en **UTC** (caveat 1 tracé si décalage Paris).
- [ ] **État durable confirmé si runner éphémère** : la table Supabase existe et le worker y lit/écrit ses curseurs (pas de fallback fichier sur GitHub Actions).
- [ ] **Secrets d'intégration** (token source/cible, clé Resend) en **GitHub Actions Secrets**, config en **Variables** ; **aucune** valeur en dur dans le YAML.
- [ ] **Migrations d'état appliquées** (tables service-role-only : run_log, idempotence, entité) — migrations **seules**, sans Auth produit.
- [ ] **Boucle fermée cablée** : un run d'échec **envoie réellement** l'alerte au propriétaire (statut Resend/webhook `sent`, pas « le code l'envoie »).
- [ ] **Caveats §ci-dessus tracés** dans `deploy/log.md` (fuseau, best-effort, désactivation 60 j, granularité), avec la mitigation retenue.

## Vérification finale : boucle fermée headless (le « 17b » de l'automation)
Un headless **n'a pas d'auth utilisateur ni de RLS produit** → la **recette live AUTHENTIFIÉE (17b)** est **sans objet** ; on ne « franchit » aucune session. Elle est **remplacée** par une **vérification de boucle fermée headless** (règle 7 de `skills/phase-5-launch/references/routing.md`, colonne `automation`). Ce n'est **pas** une recette d'auth — c'est la preuve que **le job produit sa valeur et se supervise lui-même**. Sur le scheduler réel (ou via `workflow_dispatch`), prouver la chaîne **run → logs → boucle → idempotence** :

1. **run** — un tick réel s'exécute jusqu'au bout (`node dist/index.js`, exit 0), preuve = logs du run.
2. **logs** — le run est **journalisé** (AU2 : run_log en base, statut/horodatage/résumé) ; le healthcheck (AU3) rend « dernier run OK / retard vs cadence ».
3. **boucle fermée** — un run de **succès** est journalisé/rapporté et un run d'**échec** **déclenche réellement** l'alerte au propriétaire (AU4 : statut Resend/webhook `sent` observé, pas supposé). Les **trois régimes** de notif se comportent comme prévu (succès silencieux journalisé · rapport périodique · alerte immédiate).
4. **idempotence** — **rejouer** le même tick (double-déclenchement `workflow_dispatch`) produit **le même effet** : **grain run** (aucun double effet dans la fenêtre) **et grain entité** (aucune entité en double — au plus un réappro ouvert par déclencheur). C'est le contrôle qui attrape le vrai bug de l'archétype.

**Vert = les 4 prouvés (0 double effet au rejeu, alerte d'échec réellement partie).** Rouge (double effet, alerte muette, run non journalisé) → **fix → re-déclenche → re-vérifie** (budget 3 cycles, comme la recette live). **Jamais** de « livré » tant que le rejeu double un effet ou que la boucle fermée ne se ferme pas. Consigner dans `deploy/live-qa-report.md` (ou son équivalent automation `deploy/loop-check.md` selon le layout du run — le **contrat** est « preuve de boucle fermée + idempotence », pas le nom du fichier).

## Rappel : le canary reste, adapté
Pas de « pages clés à 200 » (headless), mais le **canary d'automation** existe : après activation du scheduler, un **premier tick réel** (via `workflow_dispatch`) doit passer **vert** (exit 0 + run journalisé + pas d'erreur), sinon **désactiver le `schedule:`** (l'équivalent du rollback : on ne laisse pas un scheduler cassé tourner en boucle) + log. La machine à états de `deploy-procedure.md` tient : `[PRÉ-VOL]→[PLAN]→[🚪 PORTE]→[APPLY = activer scheduler]→[CANARY = 1er tick vert]→[BOUCLE FERMÉE HEADLESS]→[LIVRÉ]`.
