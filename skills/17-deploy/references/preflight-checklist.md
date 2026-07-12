# Référence — Pré-vol (definition-of-done + cas limites)

Le pré-vol est **bloquant**. Aucune ligne de l'apply ne démarre tant que cette checklist n'est pas entièrement verte. C'est le contrat : on ne pousse **jamais** du rouge, du non-testé, ou du secret exposé en prod.

## Definition-of-done (tous les items → vert)

### A. Code & tests
- [ ] Build prod réussit localement / en CI (même config que la prod, pas `dev`).
- [ ] Suite de tests **verte** (unit + intégration + e2e du parcours cœur).
- [ ] Le **livret** `qa/test-booklet.md` n'a **aucun `FAIL` bloquant**.
- [ ] Les `CONCERNS`/`WAIVED` restants sont **listés** (destinés à `deploy/log.md`, pas cachés).
- [ ] Le commit/tag à promouvoir est **identifié** (SHA figé) — on promeut cet artefact, pas un rebuild.

### B. Secrets & config
- [ ] `grep` de secrets en dur → **rien** (`grep -rIn -E '(sk-|pk_|AKIA|-----BEGIN|Bearer )' src` propre).
- [ ] Toutes les variables d'env prod **présentes** côté provider (Vercel/CF env), pas seulement en local.
- [ ] Aucune clé de test/dev pointant vers un service prod (et inversement).
- [ ] `.env*` bien dans `.gitignore` ; aucun secret dans l'historique git.

### C. Base de données
- [ ] Migrations prod **prêtes** et **idempotentes** (`CREATE ... IF NOT EXISTS`, gardes de version).
- [ ] Chaque migration a un **`down`/rollback** ou est prouvée non destructive.
- [ ] RLS/permissions Supabase vérifiées (pas de table ouverte par accident).
- [ ] Backup/snapshot prod pris **avant** toute migration destructive (double confirm si destructif — `safety-rails.md` §5).

### D. Infra & réversibilité
- [ ] **Plan de rollback testé** (pas supposé), selon le cas :
  - **Redéploiement** (une version prod existe) → version **N-1 redéployable en une commande**, vérifiée en staging.
  - **Premier lancement** (l'étape 17 est le PREMIER cutover public → **pas de N-1**) → le repli est la **dépublication** : retirer l'alias prod / repointer le DNS pour que le domaine ne serve plus le build → retour en **preview URL privée**. Vérifier qu'on sait le faire en une commande.
- [ ] TTL DNS **abaissable** avant cutover (accès Cloudflare confirmé).
- [ ] Domaine **vérifié** côté provider (sinon → repli honnête, guide, pas de faux cutover).
- [ ] KYC/paiement du provider **en règle** si le plan facturé le requiert (sinon STOP + guide).

### E. Services tiers & déclencheurs (le premier ship casse ici)
Leçon de run : un produit peut passer A-D et sortir avec un worker jamais déclenché, zéro email parti et un funnel muet. Cette section vérifie que **ça tourne en vrai**, pas que le code existe.

- [ ] **Décisions « déférées » soldées** : relire les ADR (`tech/decisions.md`) et le plan (`tech/execution-plan.md`) — chaque décision marquée « déférée / à trancher / TODO » est **résolue** (choix acté) ou **re-portée explicitement** avec raison tracée dans `deploy/log.md`. Une décision déférée non soldée = **pas d'apply** (ex. réel : choix de scheduler « déféré » jamais tranché → aucun email n'est jamais parti).
- [ ] **Scheduler réellement branché** : le bloc crons est **présent** dans la config du provider (ex. `vercel.json` `{"crons":[…]}` + `CRON_SECRET` en env) **et** une exécution a été **prouvée** — log d'invocation réelle du endpoint cron en staging, pas « le worker est dans le code ».
- [ ] **Cadence cron compatible avec le plan d'hébergement** : sur **Vercel Hobby** (défaut factory), **toutes** les expressions cron de `vercel.json` sont **quotidiennes** (`"0 8 * * *"` — aucune `*/N`, aucune expression sub-quotidienne). Une cadence plus fréquente **fait échouer le déploiement** (« Hobby accounts are limited to daily cron jobs »). Rappel de boucle fermée = **cron quotidien + worker qui balaie les 24-48 h** (idempotent via `notification_jobs`, `_shared/boucles-fermees.md`). Un rappel fin (H-2) réellement voulu ⇒ **Vercel Pro acté** (décision + coût tracés dans `deploy/log.md`), sinon repli sur le quotidien.
- [ ] **Email transactionnel réel parti** depuis la config prod : domaine d'envoi **vérifié** (Resend), un envoi de test effectué avec la clé prod, statut `delivered` **constaté** — pas « le code l'envoie ».
- [ ] **Confirmation d'email réactivée** : l'autoconfirm du staging (posé par 11-project-setup) est **désactivé** pour la prod — un signup réel exige la confirmation par email.
- [ ] **Redirect URLs prod posées** côté auth (Supabase) : le domaine prod est dans la liste des URLs de redirection autorisées — sinon les liens de connexion renvoient vers localhost/staging.
- [ ] **Events du funnel émettent en staging** (bloquant) : `user_signed_up` + `activation_completed` (le moment magique du PRD) sont **visibles dans PostHog live-events** après un parcours de test — un funnel muet au ship rend la Phase 6 aveugle dès le premier tour.
- [ ] **`*.vercel.app` noindex/redirigé** : la neutralisation du domaine technique est **préparée** au pré-vol et **appliquée après le cutover** (noindex ou redirect 308 vers le domaine prod) — il ne doit pas concurrencer le domaine prod dans l'index.

### F. Accès & déploiement privé — `interne`/`perso` uniquement (le « privé » doit être PROUVÉ)
Un outil « interne » dont un inconnu qui a l'URL peut créer un compte **n'est pas privé** (P0.5). Ces items ne s'appliquent **que si `type ≠ public`** ; pour un SaaS public, ils sont **non applicables** (signup ouvert par conception, à marquer N/A explicitement).

- [ ] **`disable_signup=true` posé ET vérifié** côté Supabase (config Auth relue via l'API Management) — c'est l'**autorité** du refus, pas seulement le châssis (`APP_ACCESS_MODE` + `access-gate`).
- [ ] **Signup anonyme REFUSÉ — preuve, pas déclaration** : depuis une session **vierge**, tenter de se connecter avec un e-mail **aléatoire non enrôlé** → **aucune nouvelle ligne dans `auth.users`** (compté avant/après) **ET aucun OTP envoyé** (aucun événement Resend pour cet e-mail) ; l'écran renvoie le refus. C'est LA preuve P0.5 (rejouée aussi en recette `live-qa.md`).
- [ ] **Enrollment opérationnel** (le pendant positif) : au moins un compte **légitime** entre — invitation reçue (`interne`) ou compte fondateur seedé (`perso`) → OTP réel reçu → session ouverte. Un privé qui refuse **tout le monde** est cassé aussi.
- [ ] **`X-Robots-Tag: noindex` présent** sur une réponse de l'app en prod (bloc `access-gate` actif) ; `APP_ACCESS_MODE` = `interne`/`perso` en env host, cohérent avec Supabase.
- [ ] **Redirection de bord vérifiée** : un visiteur **non authentifié** sur une route applicative (ex. `/dashboard`) est renvoyé vers `/login` — aucun shell d'app exposé sans session.

## Recette forcing-question — « est-ce vraiment prêt ? »

Quand un item est ambigu, on ne suppose pas. On tranche par question.

- **Ask exact** : « Le build que je m'apprête à promouvoir est-il exactement celui validé à l'étape 15 (SHA `{x}`), sans modif depuis ? »
- **Push-until** (critère de sortie) : continuer tant qu'on n'a pas *un SHA figé + une suite verte sur ce SHA + une env prod complète*. Trois preuves, pas une impression.
- **Red-flags (réponses à refuser)** :
  - « Ça devrait passer » → pas une preuve, faire tourner la suite.
  - « On fixera le test rouge après le deploy » → refus, retour Phase 4.
  - « Le secret est juste temporaire, en dur » → refus, migrer en env + rotation.
  - « La migration marche, j'ai pas testé le rollback » → refus, tester le down.
- **MOU-vs-FORT** :
  - MOU : « Les tests passaient hier. » → insuffisant (le SHA a peut-être bougé).
  - FORT : « Suite verte à l'instant sur le SHA `abc123`, env prod complète, plan de rollback vérifié — N-1 redéployable en staging (redéploiement), ou dépublication → preview testée (premier ship). »

## Catalogue de cas limites (et quoi faire)

| Cas limite | Traitement |
|---|---|
| Test flaky rouge intermittent | Ne pas ignorer : reproduire, stabiliser ou quarantaine explicite loggée. Pas de « relance jusqu'à vert ». |
| Env prod a une variable de plus/de moins que staging | Diff des env avant tout apply ; aligner ou justifier chaque écart. |
| Migration déjà partiellement appliquée (essai précédent) | Vérifier l'état réel du schéma, rendre la migration rejouable, ne pas ré-empiler. |
| Domaine acheté mais DNS pas encore délégué à Cloudflare | STOP côté cutover : guider la délégation, garder le service en preview URL en attendant. |
| Provider demande une vérif KYC pour le plan payant | Repli honnête (§6) : s'arrêter, produire le guide pas-à-pas, ne pas simuler le passage en prod. |
| Le livret a un `WAIVED` sur un parcours secondaire | OK si documenté et non-cœur ; interdit sur le parcours d'activation. |
| Secret trouvé dans l'historique git (pas juste le HEAD) | Rotationner la clé (elle est compromise), purge d'historique en option, ne pas juste supprimer au HEAD. |
| Décision ADR « déférée » retrouvée au pré-vol | La solder **maintenant** : trancher, ou re-porter explicitement avec raison tracée. Jamais franchir l'apply sur un « on verra ». |
| Le cron « existe dans le code » mais aucune invocation loggée | Pas branché : ajouter le bloc crons côté provider + prouver une exécution en staging avant l'apply. |
| `vercel.json` a un cron `*/10` / « H-2 » mais l'hébergement est en plan **Hobby** | Deploy **rejeté** par Vercel (« Hobby = crons quotidiens »). Repli : cron **quotidien** (`"0 8 * * *"`) + worker qui balaie les 24-48 h (idempotent via `notification_jobs`, `_shared/boucles-fermees.md`). Rappel sub-quotidien réellement requis → passer le projet en **Vercel Pro** (décision + coût tracés dans `deploy/log.md`). |
| PostHog reçoit des pageviews mais aucun event du funnel | `capture()` jamais câblé : retour Phase 4 (12-build) pour instrumenter, re-vérifier en staging — pas de ship avec un funnel muet. |
| (interne/perso) signup anonyme **réussit** (compte créé pour un e-mail aléatoire) | `disable_signup` pas posé : retour 11-project-setup, poser le refus (API Management) + re-preuve. Jamais ship un « privé » resté ouvert (P0.5). |
| (interne/perso) `APP_ACCESS_MODE` resté `public` en env host | Incohérence app↔Supabase : `access-gate` inerte (pas de noindex, pas de redirection de bord). Poser `APP_ACCESS_MODE=interne`/`perso` en env host + redéployer avant cutover. |

## Mode d'échec le plus courant
« Le pré-vol paraissait vert mais le build promu n'était pas le build testé. » → Prévention : **figer le SHA** en tête de pré-vol et promouvoir *cet* artefact à l'étape 4, jamais un rebuild de dernière minute.
