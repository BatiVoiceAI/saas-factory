# Log de provisioning — {nom du projet}
> Écrit par l'étape 11. Trace tout ce qui a été créé automatiquement (auditabilité de l'autonomie). {AAAA-MM-JJ}

| Ressource | Provider | Détail | Coût éventuel | Réversible ? |
|---|---|---|---|---|
| Repo | GitHub | {org/repo} | — | oui (suppr. repo) |
| BDD | Supabase | {projet / ref} | free tier | oui |
| Sous-domaine | Cloudflare | {projet.tondomaine.com} | — | oui |
| Hébergement | {Vercel / CF / Coolify} | {projet} | free tier | oui |
| Email | Resend | {domaine vérifié} | — | oui |
| Billing | Stripe (test) | {si applicable, sinon —} | — | oui |
| Observabilité | Sentry / PostHog | {si configuré} | — | oui |

## Secrets
Injectés en variables d'environnement (depuis `~/.saas-factory/`), **jamais en dur, jamais commités**.

## Points [SÉCU] hérités du plan
{Reprendre les éléments taggés `[SÉCU]` dans l'audit trail de `tech/execution-plan.md` — à revoir en Phase 4 (revue sécurité).}
