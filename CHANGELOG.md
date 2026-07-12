# Changelog — SaaS Factory

Toutes les évolutions notables du plugin. Format inspiré de [Keep a Changelog](https://keepachangelog.com/).

## [0.4.0] — 2026-07-12 (en cours)

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

### En cours (Vague B, à venir)
- Profondeur PM/CEO Phases 1-2 (competitive-analysis vendorée, PRD PM-grade).
- P0.1 (plan soldé prouvé par exécution), P0.5 (déploiement privé interne/perso), P0.7 (pricing = features livrées), fusion des artefacts en doublon.
- Adoptions issues de l'évaluation comparative (gstack / startup / superpowers).

## [0.3.6] — 2026-07-11
- Emails autonomes : domaine d'envoi générique unique, SMTP custom = Resend posé par la machine (lève la limite Supabase, zéro upgrade payant), pour confirmation de compte **et** transactionnel.

## [0.3.x] — 2026-07-11
- Densification des 27 skills, moat châssis `web-saas` (Next.js 15 + Supabase), hook de sécurité PreToolUse, choix open-source ↔ managé exécutable, infra-setup (profil + connexion des outils).
