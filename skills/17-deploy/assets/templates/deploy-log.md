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

## Canary (santé post-deploy)
- Fenêtre de surveillance : {5–15 min}
- Pages clés (200) : {…}
- Parcours cœur en prod : {OK / KO}
- Erreurs Sentry (fenêtre) : {seuils absolus — 0 sur le cœur · < 1/min hors-cœur · crash-free ≥ 99 % ; pas de baseline au 1er ship, > 5× baseline en redéploiement}
- Core Web Vitals : {LCP < 2,5 s / CLS < 0,1 / INP < 200 ms — valeurs mesurées}
- **Verdict** : {sain → Phase 6} | {échec → rollback effectué}

## Rollback (si déclenché)
- Déclencheur : {signal + seuil franchi}
- Ce qui a basculé → restauré : {DNS / promotion / migration}
- Cause identifiée : {…}
- État final : {prod sur N-1 / dépubliée → preview URL privée (1er ship) / à corriger avant re-tenter}

## URL live
{https://…}

## Concerns documentés (du livret)
{les `CONCERNS`/`WAIVED` restants, honnêtement}
