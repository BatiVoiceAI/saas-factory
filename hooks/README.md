# Hooks — le backstop mécanique de safety-rails

Ce dossier rend **exécutable** une partie de `_shared/safety-rails.md`. La prose des skills
reste la règle de conduite ; le hook est un **garde-fou de dernier recours**, appliqué par
Claude Code lui-même (pas par le jugement de l'agent) sur chaque commande Bash.

## Ce qu'il y a ici
- **`hooks.json`** — déclaration auto-découverte par Claude Code (à la racine du plugin). Un
  seul hook : `PreToolUse` avec `matcher: "Bash"` → lance `safety-guard.sh`.
- **`safety-guard.sh`** — le garde. Lit le JSON de l'appel d'outil sur **stdin**, décide, répond
  en **JSON sur stdout** (`permissionDecision`) puis `exit 0`.

## Trois niveaux (alignés sur safety-rails §5 et §4)
| Tier | Décision | Effet | Exemples attrapés |
|---|---|---|---|
| **1 — catastrophique / irréversible système** | `deny` | **bloque** | `rm -rf /` · `rm -rf ~` · `rm -rf $HOME/…` · `mkfs…` · `dd of=/dev/…` · `> /dev/sda` · fork bomb · `chmod -R 777 /` |
| **2 — destructif contextuel** | `ask` | **force une double confirmation** (§5) sans bloquer un usage légitime | `DROP/TRUNCATE TABLE` · `dropdb` · `git push --force`/`-f` · `git reset --hard` · `git clean -f` · `terraform destroy` · `kubectl delete` · `supabase … reset/delete` · `curl … \| sh` |
| **2 bis — secret en clair dans la commande** (§4) | `ask` | **force une confirmation** ; garde-fou **secondaire** contre un token/clé glissé dans une commande | `ghp_…`/`github_pat_…` · `sbp_…` · `sk_live_…`/`sk_test_…` · `sk-…`/`sk-ant-…`/`sk-proj-…` · `re_…` · `xoxb-…`/`xapp-…` · `AKIA…` · `AIza…` · JWT `eyJ….eyJ….` |

Tout le reste passe **silencieusement** (`exit 0`, aucune sortie). `git push --force-with-lease`,
`rm -rf node_modules`, `SELECT …`, `supabase migration new …`, un simple **nom** de variable
(`grep GITHUB_PERSONAL_ACCESS_TOKEN .env`) ne sont **pas** attrapés — le hook vise le haut-signal,
pas la gêne.

### Tier 2 bis — le secret ne fuit JAMAIS
La raison émise est **statique** : la valeur détectée n'est **jamais** recopiée dans la sortie, les
logs, ni nulle part (`grep -q`, aucun `echo` de la donnée). Ce hook est un **filet secondaire** :
il ne voit **pas** ce que l'utilisateur tape dans le chat (il n'intercepte que les *tool calls*),
donc il n'attrape qu'un secret déjà glissé **dans une commande**. La protection **principale** reste
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
- **`${CLAUDE_PLUGIN_ROOT}`** : variable fournie par Claude Code pour localiser le script. ⚠️
  Elle n'est pas toujours injectée selon la version (issues connues) ; si le hook ne se déclenche
  pas, c'est la première chose à vérifier. Le script, lui, ne dépend d'aucun chemin de plugin.

## Étendre
Ajouter un pattern = une ligne `match '<regex ERE>' && emit deny|ask "<raison sans guillemet>"`
dans le bon tier. La raison est affichée telle quelle à l'agent/l'utilisateur : garde-la courte,
sans `"` ni `\`. Teste toujours contre des cas **légitimes** voisins pour éviter les faux positifs
(cf. la batterie de tests utilisée au build : dangereux → deny/ask, dev courant → allow).
