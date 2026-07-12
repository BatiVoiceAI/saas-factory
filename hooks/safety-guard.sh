#!/usr/bin/env bash
# SaaS Factory — safety-guard (hook PreToolUse, matcher "Bash")
# -----------------------------------------------------------------------------
# Backstop MÉCANIQUE de _shared/safety-rails.md. La prose des skills reste la
# règle ; ce hook la rend exécutable pour les cas détectables sur une commande :
#   • TIER 1 — DENY : catastrophique / irréversible système (§5).
#   • TIER 2 — ASK  : destructif contextuel → double confirmation (§5), pour ne
#                      pas bloquer un usage légitime mais forcer un OK explicite.
#   • TIER 2 bis — ASK : valeur secret-shaped (token/clé) en clair dans une commande
#                      (§4) → confirmation forcée, SANS jamais loguer la valeur.
#
# Contrat du hook (doc officielle Claude Code) :
#   entrée  : le JSON de l'appel d'outil sur STDIN (clés tool_name, tool_input…).
#   sortie  : JSON sur STDOUT + exit 0 →
#             {"hookSpecificOutput":{"hookEventName":"PreToolUse",
#              "permissionDecision":"deny|ask","permissionDecisionReason":"…"}}
#   laisser passer = exit 0 SANS rien émettre (silencieux).
#
# Robustesse : bash + grep seulement (jq utilisé s'il existe, sinon fallback).
#   Fail-open : entrée illisible → on laisse passer (ne jamais casser l'outil).
# -----------------------------------------------------------------------------

input="$(cat)"

# --- Extraire la commande Bash (best-effort, sans dépendance dure) -----------
cmd=""
if command -v jq >/dev/null 2>&1; then
  cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
fi
if [ -z "$cmd" ]; then
  # Fallback grossier : la valeur de "command" (peut sur-capturer → on préfère
  # sur-bloquer que sous-bloquer, c'est un garde-fou de sécurité).
  cmd="$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)"[^"]*/\1/p')"
fi
hay="${cmd:-$input}"

emit() { # $1 = deny|ask   $2 = raison (sans " ni \ ni saut de ligne)
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"%s","permissionDecisionReason":"%s"}}\n' "$1" "$2"
  exit 0
}
match() { printf '%s' "$hay" | grep -Eqi -- "$1"; }

# ===== TIER 1 — DENY (catastrophique / irréversible système, §5) =============
match 'rm[[:space:]]+-[a-z]*(rf|fr)[a-z]*[[:space:]]+(/([[:space:]]|$|[a-z]|\*)|~([[:space:]/]|$)|\$\{?HOME|\*([[:space:]]|$))' \
  && emit deny "SaaS Factory - safety-rails 5 : rm recursif/force sur une cible systeme (/, ~, \$HOME, *). Irreversible, refuse. Cible un chemin de projet precis si c'est voulu."
match 'mkfs(\.[a-z0-9]+)?[[:space:]]' \
  && emit deny "SaaS Factory - safety-rails 5 : formatage de systeme de fichiers (mkfs). Irreversible, refuse."
match 'dd[[:space:]].*of=/dev/' \
  && emit deny "SaaS Factory - safety-rails 5 : ecriture disque brute (dd of=/dev/...). Irreversible, refuse."
match '>[[:space:]]*/dev/(sd|nvme|disk|hd)[a-z0-9]*' \
  && emit deny "SaaS Factory - safety-rails 5 : redirection vers un peripherique bloc. Irreversible, refuse."
match ':\(\)[[:space:]]*\{[[:space:]]*:[[:space:]]*\|[[:space:]]*:' \
  && emit deny "SaaS Factory - safety-rails 5 : fork bomb detectee. Refuse."
match 'chmod[[:space:]]+-R[[:space:]]+0*777[[:space:]]+/([[:space:]]|$|[a-z])' \
  && emit deny "SaaS Factory - safety-rails 4/5 : chmod -R 777 sur une racine systeme. Refuse."

# ===== TIER 2 — ASK (destructif contextuel -> double confirmation, §5) =======
match '(drop|truncate)[[:space:]]+(table|database|schema)' \
  && emit ask "SaaS Factory - safety-rails 5 : suppression destructrice en base (DROP/TRUNCATE). Double confirmation requise ; sandbox only, jamais une prod existante (2)."
match 'dropdb([[:space:]]|$)' \
  && emit ask "SaaS Factory - safety-rails 5 : suppression de base (dropdb). Double confirmation requise (sandbox only, 2)."
match 'git[[:space:]]+push[[:space:]].*--force([[:space:]]|$)' \
  && emit ask "SaaS Factory - safety-rails 5 : git push --force reecrit l'historique distant. Double confirmation ; prefere --force-with-lease."
match 'git[[:space:]]+push[[:space:]]+([^|&;]*[[:space:]])?-[a-z]*f[a-z]*([[:space:]]|$)' \
  && emit ask "SaaS Factory - safety-rails 5 : git push -f reecrit l'historique distant. Double confirmation ; prefere --force-with-lease."
match 'git[[:space:]]+reset[[:space:]].*--hard' \
  && emit ask "SaaS Factory - safety-rails 5 : git reset --hard perd les modifs non commitees. Double confirmation."
match 'git[[:space:]]+clean[[:space:]].*-[a-z]*f' \
  && emit ask "SaaS Factory - safety-rails 5 : git clean -f supprime les fichiers non suivis. Double confirmation."
match 'terraform[[:space:]]+destroy' \
  && emit ask "SaaS Factory - safety-rails 5 : terraform destroy detruit l'infra provisionnee. Double confirmation."
match 'kubectl[[:space:]]+delete' \
  && emit ask "SaaS Factory - safety-rails 5 : kubectl delete supprime des ressources. Double confirmation."
match 'supabase[[:space:]].*(db[[:space:]]+reset|[[:space:]]delete([[:space:]]|$)|--force)' \
  && emit ask "SaaS Factory - safety-rails 5 : operation Supabase destructrice (reset/delete). Double confirmation ; sandbox only (2)."
match '(curl|wget)[[:space:]].*\|[[:space:]]*(sudo[[:space:]]+)?(ba)?sh([[:space:]]|$)' \
  && emit ask "SaaS Factory - securite : execution d'un script telecharge (curl|wget ... | sh). Source non verifiee ; inspecte le script avant, double confirmation."

# ===== TIER 2 bis — SECRET EN CLAIR dans la commande (garde-fou secondaire, §4) =
# Filet SECONDAIRE : une valeur secret-shaped (token/cle) ne devrait JAMAIS arriver
# dans une commande Bash — le plugin ne manipule que des NOMS de variables, les cles
# vivent en ~/.saas-factory/.env, deposees par l'utilisateur (safety-rails §4). Si une
# valeur en clair apparait ici, on force une confirmation.
#   ⚠️ La raison emise est STATIQUE : la valeur matchee n'est JAMAIS recopiee (grep -q,
#      aucun echo). Ce hook ne voit PAS le chat : la vigilance de l'assistant (§4) reste
#      la protection principale ; ceci n'attrape que les secrets glisses dans une commande.
secret_ask() { emit ask "SaaS Factory - safety-rails 4 : une valeur ressemblant a un secret (token/cle) apparait EN CLAIR dans cette commande. Un secret ne transite jamais par une commande ni par le chat - il se depose dans ~/.saas-factory/.env. Considere-le compromis : revoque/regenere-le et ne l'ecris nulle part. Ne confirme que si tu es certain que ce n'est PAS un vrai secret." ; }
match 'gh[oprsu]_[A-Za-z0-9]{20,}'                 && secret_ask   # GitHub PAT/OAuth/app tokens
match 'github_pat_[A-Za-z0-9_]{20,}'               && secret_ask   # GitHub fine-grained PAT
match 'sbp_[A-Za-z0-9]{20,}'                        && secret_ask   # Supabase access token
match '(sk|rk)_(live|test)_[A-Za-z0-9]{16,}'        && secret_ask   # Stripe secret/restricted key
match '(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}'       && secret_ask   # OpenAI / Anthropic (sk-, sk-ant-, sk-proj-)
match '(^|[^A-Za-z0-9])re_[A-Za-z0-9]{24,}'         && secret_ask   # Resend API key
match 'xox[baprs]-[A-Za-z0-9-]{10,}'                && secret_ask   # Slack bot/user/app tokens
match 'xapp-[0-9]-[A-Za-z0-9-]{10,}'                && secret_ask   # Slack app-level token
match 'AKIA[0-9A-Z]{16}'                            && secret_ask   # AWS access key id
match 'AIza[0-9A-Za-z_-]{35}'                       && secret_ask   # Google API key
match 'eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.' && secret_ask  # JWT (Supabase service_role/anon, etc.)

# Rien de dangereux -> laisser passer (silencieux)
exit 0
