# Hooks — le backstop mécanique de safety-rails

Ce dossier rend **exécutable** une partie de `_shared/safety-rails.md`. La prose des skills
reste la règle de conduite ; le hook est un **garde-fou de dernier recours**, appliqué par
Claude Code lui-même (pas par le jugement de l'agent) sur chaque commande **Bash**.

## Ce qu'il y a ici
- **`hooks.json`** — déclaration auto-découverte par Claude Code (chemin standard
  `hooks/hooks.json` du plugin). Un seul hook : `PreToolUse` avec `matcher: "Bash"` →
  lance `safety-guard.sh`.
- **`safety-guard.sh`** — le garde. Lit le JSON de l'appel d'outil sur **stdin**, décide, répond
  en **JSON sur stdout** (`permissionDecision`) puis `exit 0`.
- **`safety-guard.test.sh`** — la batterie de tests (80 cas : deny / ask / allow). À **relancer
  après toute modification** du garde : `bash hooks/safety-guard.test.sh`.

## Périmètre — ce que ce hook ne voit PAS (à savoir honnêtement)
Le matcher est `"Bash"` : le hook n'intercepte **que l'outil Bash**. Concrètement :
- Les **outils MCP** (`mcp__supabase__*`, `mcp__github__*`, `mcp__cloudflare__*`, MCP Vercel…)
  **ne passent PAS par ce hook**. Un `DROP TABLE` envoyé via le MCP Supabase, une suppression
  de repo via le MCP GitHub ou un delete DNS via le MCP Cloudflare ne déclenchent **rien** ici.
  Pour ces surfaces, les garde-fous restent la **prose** de `_shared/safety-rails.md` (sandbox,
  idempotence, sondes avant écriture) et les invariants des skills/provisioners — pas ce script.
- Les autres outils natifs (`Write`, `Edit`…) ne passent pas par ici non plus.
- Le hook ne voit **pas le chat** : il n'intercepte que les *tool calls* Bash.

## Trois niveaux (alignés sur safety-rails §5 et §4)
| Tier | Décision | Effet | Périmètre |
|---|---|---|---|
| **1 — catastrophique / irréversible SYSTÈME** | `deny` | **bloque** | `rm` récursif (flags **combinés `-rf` OU séparés `-r -f`**, `--recursive`) sur une **cible système uniquement** : `/`, `/*`, `*`, `~` entier, `$HOME` entier, `/etc`, `/usr`, `/bin`, `/System`, `/Library`…, un home entier (`/Users/<x>`, `/home/<x>`), un volume entier (`/Volumes/<x>`) · `mkfs…` · `dd of=/dev/…` · `> /dev/sda` · fork bomb · `chmod -R 777 /` |
| **2 — destructif contextuel** | `ask` | **force une double confirmation** (§5) sans bloquer un usage légitime | local : `DROP/TRUNCATE` · `dropdb` · `git push --force`/`-f` · `git reset --hard` · `git clean -f` · `terraform destroy` · `kubectl delete` · `supabase db reset` (dont `--linked`) · `curl … \| sh` — **distant (les vrais vecteurs)** : `gh repo delete` · `vercel remove`/`rm` · `wrangler … delete` · `flyctl … destroy` · `curl -X DELETE` sur `api.github.com` / `api.vercel.com` / `api.supabase.com` / `api.cloudflare.com` |
| **2 bis — secret en clair dans la commande** (§4) | `ask` | **force une confirmation** ; garde-fou **secondaire** contre un token/clé glissé dans une commande | `ghp_…`/`github_pat_…` · `sbp_…` · `sk_live_…`/`sk_test_…` · `sk-…`/`sk-ant-…`/`sk-proj-…` · `re_…` · `xoxb-…`/`xapp-…` · `AKIA…` · `AIza…` · JWT `eyJ….eyJ….` |

Tout le reste passe **silencieusement** (`exit 0`, aucune sortie). En particulier, un `rm -rf`
sur un **chemin de travail** — même absolu — n'est **pas** bloqué : `rm -rf node_modules`,
`rm -rf /Users/felix/Desktop/projet/dist`, `rm -rf /tmp/build-cache`, `rm -rf ~/projects/demo`
passent (les sous-agents en ont besoin). Idem `git push --force-with-lease`, `SELECT …`,
`supabase migration new …`, un simple **nom** de variable (`grep GITHUB_PERSONAL_ACCESS_TOKEN
.env`). Le hook vise le haut-signal, pas la gêne.

### Tier 1 — pourquoi « cibles système seulement »
Un `deny` sur tout `rm -rf` à chemin absolu bloquait le travail normal des sous-agents
(nettoyage de `node_modules`, de caches, de worktrees) tout en laissant passer `rm -r -f /`
(flags séparés). Le périmètre corrigé fait l'inverse : **flags séparés couverts**, chemins de
travail **libres**, et seul ce qui détruit le **système ou un espace entier** (racine, home
entier, volume entier, arbres `/etc`, `/usr`…) est refusé.

### Tier 2 bis — le secret ne fuit JAMAIS
La raison émise est **statique** : la valeur détectée n'est **jamais** recopiée dans la sortie, les
logs, ni nulle part (`grep -q`, aucun `echo` de la donnée). Ce hook est un **filet secondaire** :
il n'attrape qu'un secret déjà glissé **dans une commande**. La protection **principale** reste
la vigilance de l'assistant décrite dans `_shared/safety-rails.md` §4 (bandeaux d'avertissement à
chaque étape token + protocole « secret collé »). Les seuils de longueur (`{20,}`, `{24,}`) et les
bornes de mot évitent les faux positifs sur des noms de variables ou des chaînes à tirets.

## Pourquoi `ask` et pas `deny` au tier 2
safety-rails §5 demande une **double confirmation** sur le destructif, pas une interdiction. En
mode autonome (Phase 3), ces commandes ne surviennent pas dans le flux normal de provisioning
(le hook ne touche ni `create_project`, ni un UPSERT DNS, ni une migration `apply_migration`) —
il ne se déclenche que sur une vraie opération destructrice, où l'arrêt pour confirmation est le
comportement voulu.

## Robustesse (choix d'implémentation)
- **Dépendances minimales** : `bash` + `grep` seulement. `jq` est utilisé **s'il est présent**
  (extraction propre de `.tool_input.command`) ; sinon un fallback `sed` isole la commande, et en
  dernier recours on scanne le JSON brut (on préfère **sur-bloquer** que laisser passer).
- **Fail-open** : entrée illisible / vide / outil non-Bash → on **laisse passer** (ne jamais
  casser l'outil de l'utilisateur pour un souci de parsing).
- **`set -f`** : le glob est coupé dans le garde — les cibles comme `*` ou `/*` restent des
  littéraux à l'analyse, jamais expansées.
- **`${CLAUDE_PLUGIN_ROOT}`** : variable fournie par Claude Code pour localiser le script. ⚠️
  Elle n'est pas toujours injectée selon la version (issues connues) ; si le hook ne se déclenche
  pas, c'est la première chose à vérifier. Le script, lui, ne dépend d'aucun chemin de plugin.

## Étendre
Ajouter un pattern = une ligne `match '<regex ERE>' && emit deny|ask "<raison sans guillemet>"`
dans le bon tier. La raison est affichée telle quelle à l'agent/l'utilisateur : garde-la courte,
sans `"` ni `\`. Puis ajouter les cas (dangereux **ET** légitimes voisins) dans
`safety-guard.test.sh` et **relancer la batterie** — un pattern sans test = pas mergé.
