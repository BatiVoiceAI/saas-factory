# Référence — Cas limites & modes d'échec

Catalogue des situations qui font dérailler le cadrage technique, et la conduite à tenir. Chaque cas : *symptôme → risque → action*. Le fil rouge : **traduire, pas re-spécifier** ; **défaut sauf exigence** ; **traçabilité** ; **ne rien inventer**.

## Modes d'échec du cadrage

### E1 — Le PRD arrive incomplet / contradictoire
- **Symptôme** : feature Must sans US, workflow sans critères, deux artefacts qui se contredisent.
- **Risque** : on invente le comportement produit → on valide une archi pour un produit fantôme (le HARD GATE existe pour ça).
- **Action** : **renvoi Phase 2** (`decision-matrices.md §0`), une fois, en citant l'artefact fautif précis. Ne bouche **jamais** le trou côté produit. Un détail cosmétique manquant, en revanche, se note `[Hypothèse]` et on avance.

### E2 — Choix de techno sans exigence (le choix orphelin)
- **Symptôme** : « on ajoute Redis / une file / un cache » sans exigence dure derrière.
- **Risque** : sur-ingénierie, dette gratuite, coût qui monte.
- **Action** : supprime le choix, **ou** trouve l'exigence dure qui le motive et écris l'ADR. Pas d'exigence traçable → pas dans l'archi.

### E3 — Réinventer un bloc du châssis
- **Symptôme** : auth maison, billing custom, observabilité re-buildée « pour maîtriser ».
- **Risque** : on brûle l'effort sur du commodité au lieu de l'edge produit ; on casse le moat (80 % réutilisable).
- **Action** : câble le bloc (`_shared/blocks/`). Le custom est réservé à la verticale. Si un bloc ne couvre pas un cas précis → **bloc + extension custom**, pas remplacement.

### E4 — Trop de jetons d'innovation dépensés
- **Symptôme** : 3+ déviations de la stack par défaut, plusieurs modules « custom » hors cœur métier.
- **Risque** : archi fragile, non reproductible, difficile à builder/maintenir.
- **Action** : re-challenge **chaque** déviation (`forcing-questions.md §4`). Garde le custom au seul edge produit ; ramène le reste au défaut. Si tu ne peux pas nommer l'exigence dure, c'est un défaut.

### E5 — `tenant_id` fourni par le client
- **Symptôme** : l'isolation multi-tenant s'appuie sur un paramètre de requête/body.
- **Risque** : un client lit les données d'un autre en changeant l'ID → fuite inter-clients.
- **Action** : le tenant se **dérive du token de session** (JWT), jamais du client. RLS deny-by-default. Taggue `[SÉCU]` (revue Phase 4). Voir `data-model.md`.

### E6 — Opération lourde traitée en synchrone
- **Symptôme** : appel LLM / génération PDF / gros import dans le handler de requête, en bloquant.
- **Risque** : timeouts, mauvaise UX, coûts d'exécution qui explosent.
- **Action** : bascule en **asynchrone** (job + statut + polling/realtime), marque le point async dans le data-flow, génère ses cas limites (double déclenchement, échec à mi-parcours). `decision-matrices.md §5`.

### E7 — Webhook / événement externe non idempotent
- **Symptôme** : un webhook (paiement, tiers) traité sans clé d'idempotence.
- **Risque** : double comptage, double envoi, incohérence (les tiers **rejouent** les webhooks).
- **Action** : clé d'idempotence unique (id d'événement), dédup en base, retries bornés. Frontière de confiance : valide la signature du webhook. `[SÉCU]`.

### E8 — Modèle de données figé trop tôt / sur-modélisé
- **Symptôme** : 12 tables pour 2 features, ou modules figés alors qu'une US n'a pas d'entité.
- **Risque** : dette structurelle (le modèle est le plus coûteux à défaire).
- **Action** : reviens aux entités que les US **nomment** (explicite > malin). Si une US n'a pas d'entité pour la porter → **itère** le modèle avant de figer les modules (M3 boucle interne).

### E9 — Le framework par défaut fait déjà le job
- **Symptôme** : tu t'apprêtes à dévier pour un besoin que Next.js / Supabase couvre en natif (cache, auth, edge, storage).
- **Risque** : déviation inutile, complexité ajoutée, jeton d'innovation gaspillé.
- **Action** : `WebSearch` « {besoin} {framework} built-in » **avant** de dévier (Search-Before-Building). Si natif → reste au défaut, pas d'ADR.

### E10 — L'agent veut coder / provisionner ici
- **Symptôme** : tentation d'écrire du code de feature, de créer un compte, de générer une clé.
- **Risque** : viole le HARD GATE (le code = Phase 4 ; l'infra/les comptes/les clés = étape 11).
- **Action** : arrête. Les seuls livrables sont `tech/architecture.md` + `tech/decisions.md`. Le provisioning est pré-autorisé **pour l'étape 11**, pas ici.

### E11 — Secret / clé glissé dans un artefact
- **Symptôme** : une clé API, un token, une URL avec credentials recopiés dans architecture.md ou state.md.
- **Risque** : fuite (les artefacts sont commités).
- **Action** : **jamais** de secret dans les artefacts (safety-rails §4). Les accès vivent en variables d'env (étape 11) / `~/.saas-factory/`. Nomme la *variable*, pas la valeur.

### E12 — Choix à goût produit tranché en douce
- **Symptôme** : un compromis qui change l'expérience/le coût, décidé sans le remonter.
- **Risque** : décision produit prise par le CTO sans traçabilité, non revisitable.
- **Action** : **taste decision** loguée en section 6 de `architecture.md` — l'étape 10 la tranche via ses principes encodés. On ne remonte pas à l'utilisateur (Phase 3 = zéro porte), mais on ne masque pas non plus.

## Anti-patterns à s'auto-interdire (côté agent)
| Anti-pattern | Correctif |
|---|---|
| Choisir la stack avant d'avoir les exigences | M2 avant M4, toujours (`procedure.md`) |
| Poser une question technique à l'utilisateur | le CTO tranche, logue, avance (`decision-matrices`) |
| Ajouter une techno « au cas où » | pas d'exigence → pas dans l'archi |
| Combler un trou produit soi-même | renvoi Phase 2 |
| Marquer un choix multi-tenant « réversible : facile » | honnêteté : c'est « difficile » |
| Réinventer auth/billing/observability | câbler le bloc |
| Laisser une table tenantée sans RLS | deny-by-default + `[SÉCU]` |
| Oublier les cas limites d'un data-flow | = tests manquants Phase 4 ; les lister |
| Présenter une `[Hypothèse]` comme une contrainte prouvée | labelliser honnêtement |
| Dévier alors que le framework le fait en natif | `WebSearch` avant de dévier |
| Écrire un secret dans un artefact | env only, jamais commité |

## Definition-of-Done (rappel — détail dans definition-of-done.md)
L'architecture est finie quand : matrice NFR sourcée · C4 (3 niveaux) · modèle de données + RLS · modules avec split réutiliser/custom · data-flow + points async · frontières de confiance · cas limites · stack où chaque ligne est `[Défaut]` ou ADR · ADR avec exigence motrice + réversibilité · taste decisions et `[SÉCU]` logués · **zéro secret** · HARD GATE tenu · et la DoD auto-vérifiée.
