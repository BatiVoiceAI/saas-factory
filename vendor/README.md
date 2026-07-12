# vendor/ — skills tiers figés localement

Copies **gelées** des skills tiers que le plugin réutilise. Objectif : être **indépendant** de leurs évolutions — notre plugin embarque une version stable, on re-synchronise **seulement quand on le décide**.

## Règle de licence (non négociable)
Chaque skill vendoré conserve **son `LICENSE` d'origine** + un **`PROVENANCE.md`** (repo source, commit/sha, date de récupération, licence). MIT/Apache autorisent la copie **avec attribution** — on la garde toujours.

## Ce qui est gelable vs pas
- **Gelable (markdown auto-contenu)** : startup-skill, security-review, accessibility-review, superpowers (sous-ensemble), coreyhaines (sous-ensemble), spec-kit (templates/commandes), skills éditeurs markdown (Supabase/Cloudflare/Clerk…).
- **NON gelable (reste une dépendance runtime, on orchestre)** : serveurs MCP (Stripe, Supabase, Cloudflare, Vercel, Playwright), GitHub Action security-review (CI).

## Skills vendorés
| Skill | Source | Licence | Zone pipeline | Statut |
|---|---|---|---|---|
| startup-skill (design/competitors/positioning/pitch) | ferdinandobons/startup-skill | MIT ✓ | Amont (marché, positionnement, pitch) | ✅ vendoré (46 fichiers) |
| security-review (command + docs) | anthropics/claude-code-security-review | MIT ✓ | Sécurité | ✅ vendoré · moteur SAST = Action Python (dépendance runtime, non gelée) |
| accessibility-review _(remplace web-design-guidelines)_ | anthropics — plugin `design` | Apache-2.0 ✓ | Design-review (a11y) | ✅ vendoré |

> `web-design-guidelines` (Vercel) a été **retiré** : pas de licence upstream (non redistribuable) + loader live. Remplacé par `accessibility-review` (licence claire, vendorable).
| _(coreyhaines subset, superpowers subset, spec-kit, éditeurs…)_ | — | — | — | à venir (par batch) |

> Ce plugin n'appartient à personne d'autre : ces dossiers sont des **dépendances vendorées**, pas notre code. Notre valeur = l'orchestrateur + la surcouche + la glue, à la racine du plugin.
