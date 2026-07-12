# Référence — Contrats des sous-agents de provisioning

Le gabarit exact du prompt de délégation (`Task`) de chaque provisioner. L'orchestrateur ne provisionne **jamais** à la main : il dispatche ces contrats. Chaque sous-agent est **idempotent** (`idempotence-rollback.md`), **compétent** (`reference-skills.md`), et écrit son verdict dans `status/provision-<resource>.md`.

## Anatomie d'un contrat (tous les provisioners)
Chaque prompt de délégation contient **exactement** ces sections :
```
OBJECTIF     : la ressource à obtenir (1 phrase, résultat, pas moyen).
CONFIG       : providers connectés + domaine + hébergeur (depuis ~/.saas-factory/config.json).
CONTEXTE     : nom, slug, + (pour db) modèle de données.
IDEMPOTENCE  : sonde exacte à faire AVANT création (cf. matrice idempotence-rollback.md).
COMPÉTENCE   : skill de référence à consulter avant l'artefact risqué (SQL/DNS).
DoD          : la checklist de done (ci-dessous, par ressource).
ROLLBACK     : quoi défaire sur échec (ne toucher que ce que CE run crée).
RED-FLAGS    : réponses/états à refuser (ne pas simuler un succès).
STATUT       : écrire status/provision-<resource>.md (format ci-dessous).
```

## Format de sortie `status/provision-<resource>.md`
```markdown
# provision-<resource> — <slug>
- état : PENDING | DONE | FAILED | ROLLED_BACK
- identifiants : { ref/id/url créés — JAMAIS de secret ici }
- idempotence : créé | réutilisé (existant détecté)
- vérif : <ce qui a été re-testé pour confirmer le DONE>
- concerns : <vide, ou ce qui manque / reste à propager — remonté au niveau run>
- horodatage : AAAA-MM-JJ
```
> **Aucun secret dans le statut** (`safety-rails.md` §4). Les clés vont en env au câblage (`secrets-wiring.md`).
> **État de ressource ≠ verdict de run.** Le champ `état` ne prend **que** `PENDING | DONE | FAILED | ROLLED_BACK` ; une ressource créée avec réserve reste **`DONE`** + `concerns` non vide. `DONE_WITH_CONCERNS` = verdict de **run** uniquement, jamais dans un `status/` — **définition canonique : `provisioning-plan.md` §machine à états** (ne pas la redéfinir ici).

---

## `provisioner-repo` (GitHub + CI) — parallélisable
- **OBJECTIF** : repo `org/<slug>` privé, arbre scaffané poussé, workflows CI présents. Le nom du repo est **dérivé du slug projet** (`<slug>`, règle de dérivation : `scaffold-procedure.md`) — **jamais un autre nom**.
- **IDEMPOTENCE** : `get repo org/<slug>` → existe : réutilise, ne push que si distant vide ; absent : `create repository`.
- **DoD** :
  - [ ] repo existe, privé, arbre poussé (dernier commit visible distant).
  - [ ] remote `origin` du repo local = `org/<slug>` (cohérence slug ↔ remote vérifiée **avant** tout push).
  - [ ] `.github/workflows/*` présents (lint/test/build/deploy).
  - [ ] aucun secret dans l'historique poussé.
  - [ ] `status/provision-repo.md` = `DONE` + URL.
- **ROLLBACK** : repo créé mais push échoué → garder le repo, retry le push (ne pas supprimer si réparable).
- **RED-FLAGS** : repo au bon nom dans une **autre org** → conflit, ne pas pousser. Remote `origin` déjà configuré vers un repo **incohérent avec le slug** (repo d'un autre projet) → **refuser de pousser**, loguer le conflit — leçon `speechflow-booking` : un exemple a été poussé sous l'identité d'un autre projet faute de ce check. Refuser de pousser si un secret est détecté dans l'arbre.

## `provisioner-db` (Supabase + migrations + RLS) — parallélisable
- **OBJECTIF** : projet Supabase pour `<slug>`, migrations appliquées (tables + **RLS**).
- **TYPE** : réglages d'enrollment par type de produit — `interne` : `disable_signup=true` + invitations (`auth.admin.inviteUserByEmail`) **ou** allowlist de domaine ; `perso` : compte unique seedé (`auth.admin.createUser`) ; `public` : signup ouvert + confirmation exigée. Matrice unique (QUOI) : `provisioning-plan.md` §« Routage par type de produit » ; COMMENT opératoire (endpoints API) : §« Enrollment par type ». Log des allègements obligatoire.
- **COMPÉTENCE** : consulter `supabase` + `supabase-postgres-best-practices` **avant** d'écrire/valider une policy RLS.
- **IDEMPOTENCE** : `list projects` match `<slug>` → réutilise `ref` ; migrations **par nom** (saute celles déjà passées). `confirm_cost` **auto** avant `create_project`. Enrollment : lire la config Auth + `list users` avant de poser (ne pas ré-inviter / re-seeder).
- **DoD** :
  - [ ] projet créé/réutilisé, `ref` + URL logués.
  - [ ] toutes les migrations du modèle de données (étape 9) appliquées, dans l'ordre.
  - [ ] **RLS activée sur chaque table multi-tenant** (sinon `[SÉCU]` bloquant).
  - [ ] **enrollment posé selon le type** — `interne`/`perso` : `disable_signup=true` **vérifié** (config Auth relue) + invitations envoyées **ou** compte fondateur présent (`list users`) ; `public` : signup ouvert. **Logué** dans `tech/provisioning-log.md` (jamais silencieux).
  - [ ] clés (anon, service_role) récupérées → transmises au câblage secrets, **pas** dans le statut.
  - [ ] `status/provision-db.md` = `DONE` + ref.
- **ROLLBACK** : migration échouée à mi-parcours → **ne pas supprimer le projet**, re-jouer les migrations restantes (par nom).
- **RED-FLAGS** : table multi-tenant **sans RLS** → refuser de marquer `DONE`. Projet au bon slug contenant des tables métier **inconnues** → conflit, ne pas migrer par-dessus. **`type` = `interne`/`perso` avec `disable_signup=false`** (signup resté ouvert) → **refuser `DONE`** : le « déploiement privé » n'est pas réel, un inconnu peut créer un compte (cf. P0.5). Marquer `verified` sans relire la config Auth → interdit (simulation).

## `provisioner-email` (Resend) — parallélisable, non-bloquant
- **OBJECTIF** : domaine d'envoi vérifié + config transactionnel.
- **OUTILS** : Resend **n'a pas de MCP** → appels à son **API HTTP via `Bash`/curl**, clé lue dans `~/.saas-factory/.env`. Pour publier ses records DNS, cet agent appelle **lui-même le MCP Cloudflare** (il ne délègue pas à `provisioner-hosting`).
- **IDEMPOTENCE** : `get domain status` → `verified` : réutilise ; sinon `add domain` → Resend renvoie **ses** records de vérification (DKIM/SPF/DMARC/MX), que l'agent publie en appelant **directement le MCP Cloudflare**. Ces records sont **distincts** du record de routage `<slug>.<domaine>` (possédé par `provisioner-hosting`) → **aucune** dépendance envers hosting, **pas de cycle**.
- **DoD** :
  - [ ] domaine ajouté, records de vérification (DKIM/SPF/DMARC/MX) publiés via Cloudflare (par cet agent).
  - [ ] statut `verified` → ressource `DONE`. **Poll de vérification BORNÉ : max 10 tentatives / 5 min au total** (~30 s d'intervalle), jamais au-delà. À la borne sans `verified`, solde **honnête** : domaine ajouté + records publiés (propagation en cours) → ressource **`DONE` + `concerns`** ; `add domain`/API réellement en échec → **`FAILED`** franc. Dans les deux cas **NON bloquant** (hosting n'attend jamais l'email) ; le verdict `DONE_WITH_CONCERNS` reste au niveau run (`provisioning-plan.md`).
  - [ ] clé Resend consommée depuis `~/.saas-factory/.env`, jamais logée.
  - [ ] `status/provision-email.md` renseigné.
- **ROLLBACK** : domaine ajouté mais non vérifié → garder (re-jouable), état `DONE` + `concerns` (ou `FAILED` si l'`add domain` lui-même a échoué).
- **RED-FLAGS** : marquer `verified` sans confirmation réelle du provider → interdit (pas de simulation).

## `provisioner-hosting` (DNS routage + host + lie le repo) — après repo+db (email non-bloquant)
- **OBJECTIF** : `<slug>.<domaine>` résout vers l'hébergeur, projet host lié au repo (auto-deploy).
- **TYPE** : `perso` → **pas de record DNS public**, host sur l'URL par défaut du provider ; `interne` → sous-domaine **optionnel selon config**. Matrice unique + obligation de log des allègements : `provisioning-plan.md` §« Routage par type de produit ».
- **COMPÉTENCE** : consulter `cloudflare` (+ `wrangler` si CF Pages) **avant** la config DNS.
- **IDEMPOTENCE** : DNS `get record` sur le **record de routage `<slug>.<domaine>`** → **UPSERT** ; host `list projects` → réutilise ; lien repo idempotent. Ne touche **que** le record de routage — **pas** aux records de vérification email (DKIM/SPF/DMARC/MX), qui appartiennent à `provisioner-email`.
- **DÉPENDANCES** : ne démarre que si `repo` **et** `db` sont `DONE`. **`email` n'est PAS une dépendance** : qu'il soit `DONE`, `DONE` + `concerns` ou `FAILED`, hosting démarre quand même (email non-bloquant pour le déploiement).
- **DoD** :
  - [ ] record DNS `<slug>.<domaine>` en place (UPSERT, pas de doublon) — **si le type le prévoit** (`perso` : pas de DNS public, URL par défaut du provider, allègement logué).
  - [ ] projet host créé/réutilisé, **repo GitHub lié** (deploy auto sur push) — app GitHub absente côté Vercel → repli **deploy-hook + step CI** (séquence : `mcp-map.md` §Hébergement), `concerns` logué.
  - [ ] env vars host posées à l'étape câblage (pas ici).
  - [ ] `status/provision-hosting.md` = `DONE` + URL du sous-domaine + host id.
- **ROLLBACK** : sous-domaine créé mais host non lié → garder (orphelin bénin) ou supprimer si sûr ; jamais bloquant.
- **RED-FLAGS** : record DNS existant pointant vers une **cible tierce vivante** → ne pas UPSERT à l'aveugle, loguer conflit. Domaine absent de la config → host sur URL par défaut + `[SÉCU]`. Sonde HTTP du domaine renvoyant `403`/`1010`/challenge → **signal WAF, pas un échec** : vérifier via l'API du host, loguer en `concerns` (`mcp-map.md` §modes d'échec), jamais de faux `FAILED`.

---

## Comment l'orchestrateur dispatche (rappel)
- **repo + db + email** en **un seul message** (zones indépendantes → 3 `Task` en parallèle).
- **hosting** ensuite, seul, une fois repo+db `DONE`.
- Après chaque retour : **relire le `status/`**, ne jamais croire le sous-agent sur parole (cf. faux `DONE`, `provisioning-plan.md`).

## Recette forcing — accepter ou refuser un `DONE` d'un sous-agent
- **Ask exact** : « la ressource existe-t-elle réellement, vérifiée par une sonde, et la DoD est-elle cochée ? »
- **Push-until** : preuve d'existence réelle (URL qui répond, ref renvoyée par `list`), pas une affirmation.
- **Red-flags — refuser le `DONE`** :
  - statut `DONE` mais `status/` sans identifiants → traiter `FAILED`.
  - `DONE` mais RLS absente sur table multi-tenant → renvoyer à corriger.
  - `verified`/`deployed` affirmé sans sonde → refuser (simulation).
- **Routage** : DoD cochée + sonde OK → accepter `DONE`. DoD partielle mais réparable → 1 retry. Irréparable → ressource `FAILED`/`ROLLED_BACK`, continuer les indépendantes ; le **run** sortira `DONE_WITH_CONCERNS` (verdict niveau étape, jamais dans le `status/` de la ressource).

## Catalogue de cas limites

| Cas | Traitement |
|---|---|
| org GitHub absente de la config | repo cœur manquant → fallback scaffold local + guide |
| modèle de données vide (arch minimale) | db : créer le projet + auth, pas de table métier, loguer |
| domaine multi-projets (sous-domaines partagés) | UPSERT strict sur `<slug>.<domaine>`, ne pas toucher les frères |
| email non requis (projet sans envoi) | sauter `provisioner-email`, non-applicable ≠ échec |
| hosting alt (Coolify self-host) | suivre `stack-defaults.md`, même contrat, sonde adaptée |
| 2 provisioners écrivent le même fichier | impossible (statuts distincts par ressource) — sinon bug de dispatch |
