# Référence — Walking skeleton (la tranche verticale d'abord)

Avant **tout** fan-out, on fait tourner une tranche verticale mince de bout en bout. C'est l'étape 2 de la procédure du skill. Objectif : un **squelette qui tourne tôt**, sur lequel les features se greffent — pas construire en largeur avant que rien ne marche (`_shared/lessons.md` : anti-pattern « tout en largeur »).

## Ce qu'est (et n'est pas) un walking skeleton
- **C'est** : le chemin cœur, vertical, minimal, **exécutable de bout en bout** à travers tout le châssis : `auth → une action cœur → persistance → affichage`.
- **Ce n'est pas** : une feature complète, jolie, ou couvrant les cas limites. C'est le **plus court chemin** qui prouve que la stack est câblée et tourne.

```
   [ UI mince ]──►[ route/API ]──►[ logique cœur ]──►[ BDD ]──►[ retour UI ]
        auth ✔        1 action ✔        minimal ✔      persist ✔   affiche ✔
   └──────────────── une seule tranche verticale, qui TOURNE ────────────────┘
```

> **La tranche ci-dessus (et toute la procédure web-saas plus bas) est celle de `web-saas`.** Le skeleton est **conditionné par archétype** (`_shared/state-schema.md` §socle-par-archétype). Pour un **`landing`** : tranche = `page statique brandée → formulaire waitlist → POST → lead persisté → confirmation (boucle fermée)` (pas d'auth ni d'entité produit). Pour un **`automation` (headless)**, voir l'encart ci-dessous — les gestes de fondation web-saas (charte, visuels Nano Banana, retrait du shell d'exemple, redirections post-login) sont **N/A** (pas d'UI).

### Walking skeleton `automation` (headless — remplace la procédure web-saas)
La tranche verticale prouve que **le worker tourne de bout en bout**, pas qu'un écran s'affiche :
```
   [ config valide ]──►[ 1 run déclenché ]──►[ effet réel ]──►[ log/run_log ]──►[ boucle fermée ]
      zod fail-fast ✔      manuel/tick ✔       persisté ✔        historisé ✔       notifie proprio ✔
   └──────── une seule exécution, idempotente, observable, qui TOURNE ────────┘
```
**Gestes de fondation automation** (écrivain unique, avant tout fan-out — châssis `_shared/blocks/automation/`) :
1. **Config validée** : `config.ts` (zod fail-fast) charge les secrets requis + **au moins un canal de notif** ; un secret manquant plante au démarrage, pas au 1er run.
2. **Un run s'exécute** : le point d'entrée (`index.ts`) exécute **une** passe du travail cœur (le verbe central du PRD : « surveille X », « synchronise Y ») déclenchée à la main ou par un tick.
3. **Effet réel persisté** : l'effet attendu est **réellement produit et vérifiable à la source** (ligne écrite / message posté / fichier généré), via `store.ts` (**idempotence d'entité** : index unique partiel + upsert atomique).
4. **Run historisé** : `runs.ts` écrit dans `run_log` (AU2) — début/fin, statut, logs ; le healthcheck (AU3) reflète le dernier run.
5. **Boucle fermée** : `notify.ts` **alerte le propriétaire** sur run échoué (toujours) / réussi (selon enjeu) — `Promise.allSettled`, ne lève jamais (AU4, `_shared/boucles-fermees.md`).
6. **Idempotence 2-grains prouvée** : `idempotency.ts` (grain **run** : claim-avant, fenêtre `windowSec`) + `store.ts` (grain **entité**) — **re-jouer le même déclencheur ne double NI l'effet NI l'entité**. C'est l'edge dur de l'archétype (porté par le CEO-persona en cascade, cf. `skills/13-reviews/references/cascade-protocol.md` §Conditionnement).

**DoD skeleton automation** : `npm run verify:machine` **vert** (plancher, cf. `integration-pass.md`) · 1 run réel exécuté (trace `run_log`) · effet vérifié à la source · **re-run = 0 doublon** (les deux grains) · boucle fermée reçue par le propriétaire · **0 secret en dur** (`lint:secrets`). Mergé sur `main` avant le fan-out. *(Charte / visuels / shell d'exemple / empty-states / redirections post-login = **N/A headless** — ne pas les exiger, faux-négatif d'archétype.)*

## Procédure (séquentielle, PAS de parallélisme ici) — `web-saas`
0. **Gestes de fondation** (avant de câbler quoi que ce soit, écrivain unique) : applique la **charte** (`app/globals.css` + `tailwind.config` depuis `DESIGN.md`) **et** brande l'**identité** — renseigne `lib/brand.ts` (`name`, `tagline`, `description`) depuis `research/positioning.md` + `product/pricing.md`. C'est ici, une seule fois, que le produit cesse d'être générique : le `<title>`, le wordmark d'auth et la sidebar consomment `lib/brand.ts`. Le défaut `"SaaS Factory Template"` doit avoir **disparu** du repo avant le fan-out.
0 bis. **Retirer la tuyauterie exemple du châssis** (même écrivain unique, même 1er geste) : le châssis livre un **shell d'exemple** — un **gabarit à cloner, PAS le produit**. Le walking skeleton le **supprime** dès qu'il pose la vraie surface, sur trois artefacts :
   - **entité CRUD d'exemple `items`** : `app/(app)/items/*` (`page.tsx`, `actions.ts`), `components/items/*` (`item-form.tsx`), `lib/schemas/item.ts`, migration `supabase/migrations/0002_items.sql`. *(Le patron générique `lib/crud/factory.ts` **reste** — c'est le modèle qu'on **clone** pour les vraies entités du PRD ; c'est l'**instance `items`** qui disparaît.)*
   - **dashboard d'exemple** : `app/(app)/dashboard/page.tsx` (écran par défaut du châssis, jamais le vrai espace produit).
   - **sidebar aux liens hardcodés** : `components/nav/app-sidebar.tsx` liste en dur `navItems` (« Tableau de bord » → `/dashboard`, « **Éléments** » → `/items`, « **Facturation** » → `/billing`). **Régénère `navItems` à partir des features du PRD** — les **routes réelles** du produit (les entités/surfaces construites depuis `product/*`), pas les liens du châssis. Une entrée de nav ne pointe que vers une route qui **existe** ; le lien **Facturation** n'apparaît **que si `billing=stripe`** est configuré (`providers.billing`, `~/.saas-factory/config.json` ; sinon ni page ni lien — **jamais** un lien mort).
   Les **redirections post-login** pointent vers le **vrai espace produit**, jamais un `/dashboard` d'exemple. **Balaie toutes les cibles `/dashboard` en dur** (`grep -rn "/dashboard" lib app`) : la constante **`AFTER_LOGIN` (`lib/auth/actions.ts`) — cible du verify OTP + de la connexion par mot de passe, la plus importante** —, `app/(auth)/login/page.tsx` (déjà-authentifié), `lib/auth/get-user.ts` (`requireRole`), le callback auth (`app/auth/callback/route.ts`), le wordmark de la sidebar, et les URLs de retour Stripe si billing. Un `/dashboard` en dur oublié = le verify OTP atterrit sur un **404** alors même que la nav passe les greps anti-scaffolding. Laisser survivre ce shell = un fondateur non-tech découvre dans SON produit une entité « Items — à cloner » et un lien mort « Facturation » (404) — finding « Poser » → **bloquant**. La passe d'intégration re-vérifie (garde-fou anti-scaffolding, `integration-pass.md`).
0 ter. **Générer les visuels on-brand** (même écrivain unique, après la charte — il faut `DESIGN.md` appliqué) : quand le design a besoin d'imagerie (hero éditorial/atmosphérique, **OG image**, illustrations d'**empty-states**, spot art, favicon/wordmark), **GÉNÈRE**-les avec **Nano Banana Pro** (`gemini-3-pro-image`) via le helper `scripts/generate-visual.mjs` (`_shared/blocks/web-saas/scripts/generate-visual.mjs` dans le châssis) : `node scripts/generate-visual.mjs "<prompt>" public/generated/<nom>.png`. Les **prompts sont dérivés de `DESIGN.md`** (section « Visuels générés » + palette/typo/métier) — **jamais du stock ni un placeholder** (levier anti-convergence : chaque projet génère SES visuels). Sortie `public/generated/`, **câblée dans les composants via `next/image`** (hero, empty-states) et dans les `metadata` (`openGraph.images` = l'OG générée) — pas des placeholders. ⚠️ **Jamais une image IA maquillée en screenshot produit** (la preuve « voici l'app » reste un vrai screenshot — interdit n°17) ni en fausse preuve sociale (n°18). Clé `GEMINI_API_KEY` lue depuis `~/.saas-factory/.env`, jamais en dur. **Repli honnête** (`safety-rails.md` §6) : clé absente ou `providers.visuals="none"` → **ne pas simuler** d'images ; consigner « ajoute ta clé pour générer les visuels » et livrer le reste.
1. Lis `tech/execution-plan.md` §3 (walking skeleton identifié) + §5 (Lane A séquentielle).
2. Identifie **l'action cœur** unique du produit (le verbe central du PRD) et le plus court chemin qui la traverse.
3. Câble le châssis de bout en bout pour **cette seule action** : auth minimal → route → logique minimale → persistance → affichage.
4. **TDD** même ici : un test d'intégration « le chemin cœur tourne » d'abord (rouge), puis le câblage (vert).
5. **Merge sur `main`** avant d'ouvrir le moindre worktree de feature.
6. Seulement alors : lance le fan-out (`fan-out.md`).

## Definition-of-Done du skeleton
- [ ] **Charte appliquée** (`app/globals.css` ≠ défaut châssis) **et identité brandée** (`lib/brand.ts` ≠ défaut ; `grep "SaaS Factory Template"` = 0) — gestes de fondation faits.
- [ ] **Tuyauterie exemple retirée** : aucune route/écran `items` (`find app -path '*items*'` = 0), pas de dashboard d'exemple (`app/(app)/dashboard`), sidebar (`components/nav/app-sidebar.tsx`) **dérivée des features du PRD** (0 lien hardcodé châssis, 0 lien mort — `/billing` seulement si `billing=stripe`), redirections post-login vers le **vrai espace produit**.
- [ ] **Visuels on-brand générés** (si le design en demande) : `public/generated/` peuplé via `scripts/generate-visual.mjs` (Nano Banana Pro, prompts dérivés de `DESIGN.md`), **câblés via `next/image`** + OG dans `metadata` — **0 stock/placeholder**. *(Ou repli honnête tracé si `GEMINI_API_KEY`/`visuals` absents — jamais d'images simulées.)*
- [ ] L'action cœur s'exécute **de bout en bout** (UI → BDD → UI), pas en mock.
- [ ] Auth minimal en place (un user peut atteindre l'action).
- [ ] Persistance réelle (une donnée écrite est relue).
- [ ] Au moins **un test d'intégration vert** qui traverse toute la tranche.
- [ ] Déployable / lançable en local sans étape manuelle cachée.
- [ ] Mergé sur `main` — les worktrees de feature partiront de **cette** base.

## Matrice de décision
| Condition | Action |
|---|---|
| Le plan ne nomme pas clairement l'action cœur | Reviens au PRD (étape 7) : le workflow cœur = la tranche. Ne devine pas large |
| La tranche « verticale » grossit (plusieurs actions) | Coupe : **une** action cœur. Le reste = features en fan-out |
| Tentation de paralléliser avant que le skeleton soit vert | STOP : 0 fan-out tant que le skeleton n'est pas mergé sur main |
| Une brique du châssis (BDD, auth) n'est pas provisionnée | Repli honnête (`safety-rails` §6) : remonte, ne mock pas la persistance pour « faire semblant » |
| Le skeleton révèle une faille d'archi (étape 9) | Loge-la, remonte au CTO avant le fan-out — c'est le bon moment (coût de correction minimal) |
| La sidebar / les redirections pointent encore vers `/dashboard` ou `/items` d'exemple | Régénère `navItems` depuis les features du PRD ; redirige post-login vers le vrai espace produit ; supprime le shell d'exemple (`app/(app)/items`, `app/(app)/dashboard`) |
| Le produit **vend** mais `billing≠stripe` (ou l'inverse) | Le lien/route **Facturation** suit `providers.billing` : présent **seulement** si `billing=stripe` ; sinon retiré (ni page ni lien) — jamais un lien mort |
| Le design demande de l'imagerie (hero/OG/empty-states) mais on pose un **placeholder** ou du stock | **Générer** on-brand via `scripts/generate-visual.mjs` (Nano Banana Pro, prompt dérivé de `DESIGN.md`) → `public/generated/`, câblé `next/image` — jamais de stock/placeholder (levier anti-convergence) |
| `GEMINI_API_KEY` absente / `providers.visuals="none"` | **Repli honnête** (`safety-rails.md` §6) : pas d'images simulées ; consigner le guide « ajoute ta clé », livrer le reste. Ne pas bloquer le skeleton |

## Forcing-question — « ce skeleton est-il vraiment vertical ? »
- **Ask exact** : *« Une donnée saisie côté UI traverse-t-elle réellement route → logique → BDD → et revient-elle à l'écran, prouvée par un test qui s'exécute ? »*
- **Push-until** : validé quand le test d'intégration traverse **toute** la pile, avec persistance **réelle**.
- **Red-flags** :
  - persistance mockée (« ça marchera avec la vraie BDD »),
  - « le front est fait, le back suivra » (horizontal, pas vertical),
  - aucun test d'intégration (juste des unitaires isolés),
  - plusieurs actions cœur empaquetées (c'est déjà des features),
  - le shell d'exemple du châssis survit (route `items`, dashboard d'exemple, lien « Facturation » mort) — pas retiré au 1er geste.
- **MOU vs FORT** :
  - MOU : *« Le squelette est prêt, l'appli démarre. »*
  - FORT : *« Créer + lister un item : saisie UI → POST → insert Postgres → GET → rendu. Test e2e vert, mergé sur main. Prêt pour fan-out. »*

## Modes d'échec
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Skeleton horizontal** | On a « fait tout le front » mais rien ne persiste | Repars vertical : une action, toute la pile |
| **Fan-out prématuré** | Worktrees ouverts avant skeleton mergé | Séquence stricte : skeleton → merge → fan-out |
| **Persistance simulée** | Mock au lieu de vraie BDD | Le skeleton doit prouver la vraie pile, sinon il ne prouve rien |
| **Skeleton obèse** | Il embarque des cas limites/plusieurs features | Réduis à l'os : le reste part en lanes |
| **Shell d'exemple survivant** | Le produit montre encore l'entité `items` (« à cloner »), un dashboard d'exemple ou un lien « Facturation » mort — le vrai espace produit a été créé **à côté** sans retirer le shell châssis (finding « Poser ») | Le 1er geste **supprime** la tuyauterie exemple et **régénère** la nav depuis le PRD ; la passe d'intégration a un garde-fou anti-scaffolding bloquant |
