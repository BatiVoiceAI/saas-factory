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

## Mode d'échec le plus courant
« Le pré-vol paraissait vert mais le build promu n'était pas le build testé. » → Prévention : **figer le SHA** en tête de pré-vol et promouvoir *cet* artefact à l'étape 4, jamais un rebuild de dernière minute.
