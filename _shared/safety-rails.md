# Safety Rails — autonomie bornée (lu par tout skill qui touche l'infra)

Ce plugin agit dans l'infrastructure et les comptes de l'utilisateur. Ces règles ne sont pas négociables — un skill qui provisionne, déploie, ou dépense DOIT les appliquer.

## 1. Plan-then-apply
Pour toute action qui **dépense de l'argent, publie publiquement, ou modifie DNS / base de données / clés** :
1. Présenter le **plan** exact (quoi, où, coût estimé, réversibilité).
2. Obtenir un **OK explicite** de l'utilisateur.
3. Puis seulement exécuter.
Jamais d'exécution directe sur ces catégories.

## 1 bis. Autorisation durable (setup global, one-time)
Le plan-then-apply peut être **donné une fois pour toutes** via `infra-setup` : en connectant ses outils au 1er lancement, l'utilisateur **autorise durablement** le provisioning automatique par projet (repo, BDD, sous-domaine, emails). Cette autorisation vaut « OK explicite » pour les projets suivants — **à condition** de garder : sandbox only (ressources neuves, §2), dépense **visible et loguée** (`tech/provisioning-log.md`), secrets en env/OAuth (§4), repli honnête si un accès manque (§6). C'est ce qui concilie « zéro intervention par projet » (Phase 3) avec le plan-then-apply.

## 2. Sandbox par défaut
Opérer dans un projet / namespace / sous-domaine **neuf**. **Ne jamais toucher une prod existante** de l'utilisateur. En cas de doute sur l'environnement cible → demander.

## 3. Tokens à portée minimale
Demander des clés/API scoppées au strict nécessaire. Expliquer en une phrase pourquoi chaque accès est requis.

## 4. Secrets
Jamais en dur, jamais loggés, jamais commités, jamais écrits dans le fichier d'état. Toujours via variables d'environnement côté utilisateur : une clé/token se dépose **uniquement** dans `~/.saas-factory/.env` (chmod 600), **jamais dans la conversation**. L'assistant ne manipule que le **nom** de la variable, jamais sa valeur — il n'a jamais besoin de voir une clé en clair.

### 4 bis. Protocole « secret collé dans le chat » (comportement OBLIGATOIRE de l'assistant)
Le chat n'est **pas** un canal sûr : ce qui y est écrit reste dans l'historique et les logs. Un secret collé dans la conversation est donc **compromis, définitivement**. Si l'utilisateur colle malgré tout une valeur **secret-shaped** (voir signatures ci-dessous), l'assistant **DOIT**, dans cet ordre :

1. **S'ARRÊTER** — ne pas poursuivre l'étape en cours avec cette valeur.
2. **NE PAS l'utiliser NI l'écrire** — jamais l'injecter dans une commande, un fichier, `.env`, `config.json`, un appel d'outil, ni ailleurs. La valeur est traitée comme brûlée.
3. **PRÉVENIR de la compromission** — dire clairement que, du fait de son passage dans le chat, ce token/cette clé est **exposé** et doit être considéré **compromis**, et **recommander une rotation immédiate** (révoquer/régénérer le secret chez le provider).
4. **RAPPELER la bonne méthode** — le secret **régénéré** se dépose **uniquement** dans `~/.saas-factory/.env`, jamais dans la conversation.

**Interdit absolu** : ne **jamais recopier la valeur** (même tronquée, même partiellement masquée) dans la réponse, un résumé, un log, un nom de fichier ou une commande. Pour en parler, la désigner par son **type** (« ton PAT GitHub », « ton access token Supabase »), jamais par ses caractères.

**Signatures secret-shaped à reconnaître** (liste indicative, non exhaustive) :
- **GitHub** : `ghp_…`, `github_pat_…`, `gho_…`, `ghu_…`, `ghs_…`, `ghr_…`
- **Supabase** : `sbp_…` (access token), clés `service_role` / `anon` (JWT `eyJ…`)
- **Resend** : `re_…`
- **OpenAI / Anthropic** : `sk-…`, `sk-proj-…`, `sk-ant-…`
- **Google** : `AIza…`
- **Slack** : `xoxb-…`, `xoxp-…`, `xapp-…`
- **Stripe** : `sk_live_…`, `sk_test_…`, `rk_live_…`
- **AWS** : `AKIA…`
- **Générique** : toute chaîne **longue à haute entropie** (≥ ~24 caractères mêlant maj/min/chiffres/symboles), ou un JWT (`eyJ…`), ou une valeur qui suit un `TOKEN=` / `KEY=` / `SECRET=` — même sans préfixe connu → traiter comme un secret.

> **Backstop mécanique** : le hook `hooks/safety-guard.sh` (PreToolUse) attrape en plus une valeur secret-shaped qui apparaîtrait **dans une commande Bash** (ex. token en clair passé à `echo`/`curl`) et force une confirmation — **sans jamais loguer la valeur**. C'est un filet **secondaire** : le hook ne voit pas ce que l'utilisateur tape dans le chat, donc la vigilance de l'assistant (ce §4) reste la protection **principale**.

## 5. Actions destructives
Suppression de ressource, écrasement, migration non réversible → **double confirmation** + rappel de l'irréversibilité.
> **Backstop mécanique** : le hook `hooks/safety-guard.sh` (PreToolUse) applique cette règle sur les commandes Bash — `deny` sur le catastrophique/irréversible système, `ask` (double confirmation forcée) sur le destructif contextuel. La prose reste la règle ; le hook est le filet de sécurité. Détail : `hooks/README.md`.

## 6. Repli honnête (no bluff)
Si l'agent ne peut pas accomplir une étape (vérif KYC paiement, review App Store, clé API indisponible, capacité manquante) : **s'arrêter, le dire clairement, produire un guide pas-à-pas**. Ne jamais simuler un succès ni fabriquer un résultat plausible.

## 7. Budget de boucle
Toute boucle (build/test/correction, revue client) a un **budget d'itérations** et un critère de sortie. À l'épuisement du budget : présenter l'état, proposer « ship en l'état » vs « continuer », laisser l'utilisateur trancher. (Anti-pattern à éviter : itération infinie.)

## 8. Hygiène de sortie
Tout artefact généré doit être **propre** : jamais de pseudo-balise XML/outil parasite en fin de fichier. Règle + liste des balises interdites : `_shared/output-hygiene.md`.
