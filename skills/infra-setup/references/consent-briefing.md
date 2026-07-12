# Référence — Briefing de consentement durable (le « plan-then-apply, une fois »)

Le moment le plus important du skill. En connectant ses outils ici, l'utilisateur **autorise durablement** le plugin à provisionner automatiquement — par projet, sans redemander — un repo, une BDD, un sous-domaine, des emails. Cette autorisation vaut « OK explicite » pour tous les projets suivants (`_shared/safety-rails.md` §1 bis). Donc : **elle doit être donnée en connaissance de cause, une fois, avant toute collecte.**

Ne collecte **rien** (pas même le domaine) avant d'avoir présenté ce briefing et obtenu un OK clair.

## ⚠️ Consigne de comportement — l'utilisateur colle un secret dans le chat
Tout au long de ce skill, **aucune clé ni token ne doit transiter par la conversation** : ils se déposent uniquement dans `~/.saas-factory/.env`. Répète-le à chaque étape token (bandeaux dans `SKILL.md` et `connection-procedure.md`). Mais un utilisateur pressé peut coller quand même — **c'est arrivé** (PAT GitHub + token Supabase collés en plein run). Dans ce cas, ton comportement est **imposé, non négociable** (protocole canonique : `_shared/safety-rails.md` §4) :

1. **Stop.** N'enchaîne pas l'étape avec cette valeur.
2. **Ne l'utilise ni ne l'écris nulle part** (pas de commande, pas de `.env`, pas de `config.json`, pas d'appel d'outil). Elle est brûlée.
3. **Préviens que le token est désormais exposé/compromis** (le chat n'est pas sûr : historique + logs) et **recommande une rotation immédiate** — révoquer/régénérer la clé chez le provider.
4. **Rappelle la bonne méthode** : la clé **régénérée** se dépose **uniquement** dans `~/.saas-factory/.env`.

**Ne recopie jamais le secret** dans ta réponse (même tronqué/masqué) ; désigne-le par son type (« ton PAT GitHub »), jamais par ses caractères. Déclencheurs à reconnaître : préfixes `ghp_`, `github_pat_`, `sbp_`, `re_`, `sk-`, `sk-ant-`, `xoxb-`, `AIza`, `AKIA`, `sk_live_`… ou toute **chaîne longue à haute entropie** / JWT `eyJ…` (liste complète : `safety-rails.md` §4).

## Ce que le briefing DOIT couvrir (les 4 obligatoires)
1. **QUOI sera créé automatiquement**, par futur projet : 1 repo GitHub (privé) + CI, 1 BDD Supabase (tables + RLS), 1 sous-domaine `projet.tondomaine.com`, des emails transactionnels, 1 déploiement.
2. **OÙ** : dans **tes** comptes/organisations (ceux que tu connectes ici), en **ressources neuves** à chaque fois (sandbox — jamais une prod existante, `safety-rails.md` §2).
3. **COMBIEN ça peut coûter** : les créations de ressources peuvent être **facturables** (ex. projet Supabase, VPS Coolify). Chaque dépense sera **visible et loguée** (`tech/provisioning-log.md`). Le plugin ne dépense que dans le cadre d'un projet que tu lances.
4. **COMMENT revenir en arrière** : rien n'est verrouillé — tu peux révoquer un accès OAuth côté provider, supprimer une ressource, ou relancer `infra-setup` pour reconfigurer. Un projet peut aussi tourner en **mode local** (aucun provisioning réel).

## Script de référence (à adapter, ton maison, zéro fluff)
> « Avant de connecter quoi que ce soit, le deal, clairement. Tu connectes tes outils **une seule fois**. En échange, chaque futur SaaS se provisionne **tout seul** : je créerai, **dans tes comptes**, un repo privé + CI, une base Supabase, un sous-domaine `projet.tondomaine.com`, des emails, un déploiement — **sans jamais te redemander ces accès**.
>
> Trois garanties : (1) toujours des **ressources neuves**, jamais une prod à toi ; (2) toute dépense est **visible et loguée** ; (3) tes clés vivent en OAuth ou dans un `.env` local — **je ne les vois jamais en clair**. Tu peux tout révoquer côté provider quand tu veux.
>
> Tu peux aussi **sauter** : dans ce cas les projets tournent en **mode local** (pas de provisioning réel), et je te fournis un guide pour tout faire à la main. Mais tant que tu ne l'as pas fait, rien n'est automatique — et c'est franchement le point qui fait gagner le plus de temps.
>
> On y va ? »

## Recette forcing — obtenir (ou pas) l'autorisation durable
- **Ask exact** : « Tu m'autorises à provisionner automatiquement, pour chaque futur projet, repo + BDD + sous-domaine + emails dans **tes** comptes, en ressources neuves, dépense loguée ? Oui / Non / Explique-moi X d'abord. »
- **Push-until (critère d'arrêt)** : l'utilisateur a **compris les 4 obligatoires** (quoi/où/coût/rollback) **et** répond un **oui non-ambigu**. Un « oui » pressé alors qu'il n'a pas percuté le volet coût → re-clarifier le coût, pas foncer.
- **Red-flags — réponses à NE PAS traiter comme un OK durable** :
  - « ouais vas-y » quand la question portait sur autre chose (consentement non informé) → reformuler l'enjeu, redemander.
  - « oui mais ne dépense rien » → **contradiction** : le provisioning réel peut coûter. Clarifier : soit il accepte la dépense loguée, soit c'est **mode local** (pas d'automatisation). Ne pas promettre « auto **et** gratuit ».
  - « oui, connecte le compte de mon entreprise / de prod » → **danger sandbox**. Rappeler §2 : ressources neuves uniquement ; préférer un compte/orga dédié aux SaaS.
  - hésitation / « je ne suis pas sûr » → **ne pas forcer**. Proposer le mode local, dire que c'est réversible, laisser décider (`safety-rails.md` — autonomie bornée, l'utilisateur tranche).
- **Routage selon la réponse** :
  - OUI informé → procéder à la connexion outil par outil (`connection-procedure.md`).
  - NON / hésitation → **SKIP** : `config.json {setup_complete:false, mode:"local"}`, expliquer que l'étape 11 tournera en fallback (scaffold local + `tech/api-keys-guide.md`), et qu'`infra-setup` reste relançable à tout moment.
  - OUI mais périmètre restreint (« pas de paiement », « pas d'obs ») → OK, connecter le socle + ce qu'il veut, marquer le reste `"none"`.

## Exemplaire — MOU (à re-challenger) vs FORT (à accepter)
- **MOU** : « oui oui comme tu veux, je regarde pas » → consentement non informé sur une autorisation **durable** qui dépense. Re-challenger : « Deux choses avant : ça peut coûter (je logue tout) et ça touche **tes** comptes. Tu es OK avec ça précisément ? »
- **FORT** : « OK. Je comprends : tu crées repo + BDD + sous-domaine dans mes comptes à chaque projet, ça peut coûter, c'est logué, et je peux révoquer. Vas-y, mais **pas de Stripe** pour l'instant. » → autorisation informée + périmètre net → **accepter**, connecter le socle + email + LLM, `billing = "none"`.

## La décision SKIP (sauter le setup)
Sauter est **légitime**, pas un échec. Guider **fortement** à le faire (c'est le levier temps n°1), mais **ne jamais bloquer** dessus.

| Signal utilisateur | Action |
|---|---|
| « je veux juste tester / bidouiller » | SKIP → mode local, dire qu'`infra-setup` se relance quand il voudra du vrai |
| « je n'ai pas encore de domaine / de comptes » | SKIP partiel possible : connecter ce qu'il a, laisser le reste `"none"` |
| « je ne veux pas que tu touches mes comptes » | SKIP → mode local + `tech/api-keys-guide.md` (tout à la main) |
| « OK mais explique le coût d'abord » | rester sur le briefing, détailler §3, **ne pas** connecter tant que pas clair |
| oui informé | procéder |

## Modes d'échec du consentement + traitement
| Mode | Symptôme | Traitement |
|---|---|---|
| Consentement présumé | on collecte le domaine/les clés sans avoir briefé | interdit — briefing **avant** toute collecte |
| « Auto ET gratuit » promis | on laisse croire zéro coût | corriger : dépense possible + loguée, sinon mode local |
| Sandbox ignorée | connecter un compte de prod sur insistance | rappeler §2, proposer un compte dédié, ne pas foncer |
| Skip vécu comme échec | culpabiliser l'utilisateur qui saute | non — SKIP = mode local valide + relançable |
| Autorisation sur-large | « oui à tout » interprété comme oui au live billing/KYC | le live paiement reste `safety-rails.md` §6 (jamais simulé, guidé) — l'autorisation durable couvre le provisioning **sandbox**, pas les actions KYC |
