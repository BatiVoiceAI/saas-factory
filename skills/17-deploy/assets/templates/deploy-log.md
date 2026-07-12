# Log de déploiement — {nom du projet}
> Étape 17. Trace du plan-then-apply + santé. {date}

## Plan validé
- Domaine prod : {…}
- Version : {SHA figé — l'artefact testé à l'étape 15, pas un rebuild}
- Coût acté : {montant / « aucun coût nouveau »}
- Réversibilité : {rollback en une commande — re-promotion N-1, ou dépublication → preview URL privée au 1er ship — + DNS restaurable (TTL)}
- **Porte humaine** : validée le {…} (OK explicite référençant domaine + SHA + coût)
- **Critère de KILL** validé à la même porte : {métrique live + seuil + fenêtre — écrit dans state.md}

## Apply (ce qui a été fait)
| Action | Provider | Résultat | Réversible ? |
|---|---|---|---|
| Migrations prod | Supabase | … | oui |
| Promotion prod | Vercel / CF | … | oui (re-promotion N-1 / dépublier au 1er ship) |
| DNS cutover | Cloudflare | … | oui |
| Tracking | PostHog + Sentry | actif | oui |

## Filet post-launch
- Alert rule Sentry (erreur sur les routes du parcours cœur → email) : {créée — nom/lien | absente, acté parce que…}
- Backups Supabase : {état réel acté — quotidien/PITR, rétention}
- Uptime monitor : {URL du check si `type=public` | N/A (interne/perso), acté}

## Canary (santé post-deploy)
> Seuils chiffrés : source unique `references/canary-rollback.md` — on consigne ici les **valeurs mesurées** et le verdict par rapport à ces seuils.
- Fenêtre de surveillance : {…}
- Pages clés (200) : {…}
- Parcours cœur en prod : {OK / KO — incl. réception réelle de l'email de connexion (statut Resend)}
- Erreurs Sentry (fenêtre) : {valeurs mesurées vs seuils canary-rollback.md}
- Core Web Vitals : {valeurs mesurées vs seuils canary-rollback.md}
- **Verdict** : {sain → Phase 6} | {échec → rollback effectué}

## Rollback (si déclenché)
- Déclencheur : {signal + seuil franchi}
- Ce qui a basculé → restauré : {DNS / promotion / migration}
- Cause identifiée : {…}
- État final : {prod sur N-1 / dépubliée → preview URL privée (1er ship) / à corriger avant re-tenter}

## URL live
{https://…}

## Concerns documentés (du livret)
{les `CONCERNS`/`WAIVED` restants, honnêtement — y compris toute décision « déférée » re-portée au pré-vol, avec sa raison}
