# Guide — accès à fournir (fallback sans config globale)
> Généré par l'étape 11 quand `infra-setup` n'a pas été fait. Renseigne ces accès **ou** lance `infra-setup` (recommandé) pour débloquer le provisioning 100 % automatique.

Pour chaque outil requis par ce projet (dérivé de `tech/architecture.md` + `_shared/stack-defaults.md`) :

| Outil | À quoi ça sert | Où créer le compte / la clé | Où la déposer |
|---|---|---|---|
| GitHub | repo + CI | github.com | connexion OAuth (via `infra-setup`) |
| Supabase | BDD + auth | supabase.com | connexion OAuth (via `infra-setup`) |
| Cloudflare | DNS + sous-domaine | dash.cloudflare.com | connexion OAuth (via `infra-setup`) |
| Hébergement | déploiement | Vercel / CF / Coolify | connexion via `infra-setup` |
| Resend | emails | resend.com/api-keys | `~/.saas-factory/.env` (jamais en dur) |
| LLM | features IA + visuels | (provider) | `~/.saas-factory/.env` |
| Stripe *(si vente)* | paiement | dashboard.stripe.com | connexion via `infra-setup` |

> **Jamais** de clé en dur dans le code ni commitée. Le plus simple : lancer `infra-setup` une fois — tout devient automatique ensuite.
