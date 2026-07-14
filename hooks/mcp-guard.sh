#!/usr/bin/env bash
# SaaS Factory — mcp-guard (hook PreToolUse, matcher "mcp__.*")
# -----------------------------------------------------------------------------
# Referme l'angle mort MÉCANIQUE documenté par le plugin lui-même
# (hooks/README.md §Périmètre) : le garde `safety-guard.sh` a le matcher "Bash"
# et ne voit donc PAS les outils MCP. Une opération MCP DESTRUCTRICE — DROP/
# TRUNCATE en SQL via `mcp__…supabase…__execute_sql`, `DELETE FROM` sans WHERE,
# ou un outil dont le nom dénote une suppression de ressource distante
# (delete/destroy/remove : repo GitHub, projet Vercel, DNS/Worker Cloudflare) —
# échappait à tout backstop mécanique.
#
# DÉCISION : `ask` (double confirmation, safety-rails §5), JAMAIS `deny` : l'infra
# MCP est légitime (une migration en sandbox peut légitimement DROP un type) — on
# force un OK explicite, on ne bloque pas. Le provisioning normal (create/insert/
# upsert/select) n'est pas touché.
#
# Contrat (doc officielle) : entrée = JSON de l'appel d'outil sur STDIN
# (`tool_name`, `tool_input`) ; sortie = JSON permissionDecision + exit 0 ;
# laisser passer = exit 0 silencieux.
# Robustesse : bash + grep (jq si présent). Fail-open. Ne loggue JAMAIS le payload.
# Tests : hooks/mcp-guard.test.sh — à relancer après toute modification.
# -----------------------------------------------------------------------------
set -f

input="$(cat)"

tool=""
args=""
if command -v jq >/dev/null 2>&1; then
  tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
  args="$(printf '%s' "$input" | jq -c '.tool_input // {}' 2>/dev/null)"
fi
[ -z "$tool" ] && tool="$(printf '%s' "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
[ -z "$args" ] && args="$input"

# Ne s'occupe que des outils MCP (le matcher le garantit déjà, mais double-garde).
printf '%s' "$tool" | grep -Eqi -- '^mcp__' || exit 0

emit() { # $1 = raison (statique, sans " ni saut de ligne — le payload n'est JAMAIS recopié)
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}
tmatch() { printf '%s' "$tool" | grep -Eqi -- "$1"; }
amatch() { printf '%s' "$args" | grep -Eqi -- "$1"; }

# 1. SQL destructif dans le payload (DROP / TRUNCATE), quel que soit l'outil MCP.
amatch 'drop[[:space:]]+(table|database|schema|type|function|index|owned|role|policy)' \
  && emit "SaaS Factory - safety-rails 5 : operation SQL destructrice (DROP) via un outil MCP. Double confirmation ; sandbox only, jamais une prod existante."
amatch 'truncate[[:space:]]+(table[[:space:]]+)?[a-z_\"]' \
  && emit "SaaS Factory - safety-rails 5 : TRUNCATE via un outil MCP efface tout le contenu d'une table. Double confirmation ; sandbox only."

# 2. DELETE FROM sans clause WHERE (efface toute la table). Over-ask assumé (si un
#    autre statement du payload porte un WHERE, on confirme quand meme — cote sur).
if amatch 'delete[[:space:]]+from[[:space:]]+[a-z_."]'; then
  # `where` en mot entier uniquement (sinon un nom de table comme "elsewhere"
  # masquerait un DELETE sans WHERE). Bordure de mot portable (macOS/BSD grep).
  printf '%s' "$args" | grep -Eqi -- '(^|[^a-z])where([^a-z]|$)' \
    || emit "SaaS Factory - safety-rails 5 : DELETE FROM sans clause WHERE via MCP = efface toute la table. Double confirmation ; ajoute un WHERE ou confirme explicitement."
fi

# 3. Outil MCP dont le NOM denote une suppression de ressource distante.
tmatch 'mcp__.*(delete|destroy|remove|purge|wipe|drop)' \
  && emit "SaaS Factory - safety-rails 5 : outil MCP de suppression de ressource distante (delete/destroy/remove - repo, projet, DNS, worker...). Potentiellement irreversible. Double confirmation requise."

# 4. Reset destructif nomme explicitement (ex. supabase db reset via wrapper MCP).
tmatch 'mcp__.*reset' && amatch '(linked|prod|--force|database)' \
  && emit "SaaS Factory - safety-rails 5 : reset de base via MCP (potentiellement la base distante). Double confirmation ; sandbox only."

# Rien de destructif -> laisser passer (silencieux).
exit 0
