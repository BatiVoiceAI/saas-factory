#!/usr/bin/env bash
# SessionStart — publie {PLUGIN_ROOT} (racine absolue du plugin) dans le contexte de session.
# Sans cette annonce, les références `{PLUGIN_ROOT}/vendor/…` des skills ne pointent nulle part :
# au runtime, le cwd est le projet du client, pas le plugin. Protocole complet de résolution :
# _shared/vendored-engine-protocol.md §0.
set -u

# Une racine est valide si elle contient vendor/ et _shared/.
valid_root() { [ -n "$1" ] && [ -d "$1/vendor" ] && [ -d "$1/_shared" ]; }

# 1) Voie normale : Claude Code injecte CLAUDE_PLUGIN_ROOT pour les hooks de plugin.
# 2) Fallback (var absente OU invalide) : auto-localisation depuis ce script (hooks/ → racine).
ROOT="${CLAUDE_PLUGIN_ROOT:-}"
if ! valid_root "$ROOT"; then
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

# Toujours invalide → on n'annonce rien (fail-open, même doctrine que safety-guard.sh :
# ne jamais casser la session pour un souci de chemin).
if ! valid_root "$ROOT"; then
  exit 0
fi

cat <<EOF
[saas-factory] {PLUGIN_ROOT} = $ROOT
Règle SaaS Factory : toute référence \`{PLUGIN_ROOT}/…\` — et tout chemin \`vendor/…\`, \`_shared/…\`, \`agents/…\` lu dans un skill du plugin — se résout depuis cette racine, JAMAIS depuis le répertoire du projet. Avant de dispatcher un sous-agent vers un moteur vendoré : résoudre le chemin en ABSOLU ($ROOT/vendor/…), vérifier qu'il existe (Read), puis le passer tel quel dans le brief. Détail : $ROOT/_shared/vendored-engine-protocol.md §0.
EOF
exit 0
