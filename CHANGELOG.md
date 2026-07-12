# Changelog — SaaS Factory

Toutes les évolutions notables du plugin. Format inspiré de [Keep a Changelog](https://keepachangelog.com/).

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
- P0.2 pré-vol « services tiers & déclencheurs » · P0.3 events AARRR câblés · P0.4 invariants DB & anti-abus anonyme en règles d'architecture · P0.6 taille marché produite en amont.
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
