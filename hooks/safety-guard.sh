#!/usr/bin/env bash
# SaaS Factory — safety-guard (hook PreToolUse, matcher "Bash")
# -----------------------------------------------------------------------------
# Backstop MÉCANIQUE de _shared/safety-rails.md. La prose des skills reste la
# règle ; ce hook la rend exécutable pour les cas détectables sur une commande :
#   • TIER 1 — DENY : catastrophique / irréversible sur une cible SYSTÈME (§5) :
#                      /, /etc, /usr, ~ entier, $HOME entier, *… Les chemins de
#                      TRAVAIL absolus (projet, /tmp/xxx, node_modules) ne sont
#                      PAS bloqués — les sous-agents en utilisent légitimement.
#   • TIER 2 — ASK  : destructif contextuel → double confirmation (§5), pour ne
#                      pas bloquer un usage légitime mais forcer un OK explicite.
#                      Couvre aussi les vecteurs distants : gh repo delete,
#                      vercel remove/rm, wrangler delete, flyctl destroy,
#                      curl -X DELETE sur les API providers, supabase db reset --linked.
#   • TIER 2 bis — ASK : valeur secret-shaped (token/clé) en clair dans une commande
#                      (§4) → confirmation forcée, SANS jamais loguer la valeur.
#
# PÉRIMÈTRE HONNÊTE : matcher "Bash" ⇒ ce hook ne voit QUE l'outil Bash. Les
# outils MCP (mcp__supabase__*, mcp__github__*, mcp__cloudflare__*, …) ne
# passent PAS par ici — pour eux, le garde-fou reste la prose de safety-rails
# et les sondes/invariants des skills (cf. hooks/README.md §Périmètre).
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
#   Tests : hooks/safety-guard.test.sh — à RELANCER après toute modification.
# -----------------------------------------------------------------------------

set -f  # pas de glob : les cibles comme * ou /* restent littérales à l'analyse

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

# ===== TIER 1 — DENY (catastrophique / irréversible SYSTÈME, §5) =============
# rm récursif : DENY seulement si une CIBLE est SYSTÈME. Flags combinés (-rf,
# -fr, -Rf) ET séparés (rm -r -f, rm --recursive --force) couverts : on extrait
# chaque invocation `rm …`, on vérifie le flag récursif, puis chaque cible.
# Cibles système (token exact, quotes retirées) :
#   /  /*  *  ~  ~/  ~/*  $HOME  ${HOME}  $HOME/*          → racine, home entier
#   /etc /usr /bin /sbin /lib(64) /boot /dev /proc /sys /root /srv /opt
#   /System /Library /Applications /private/etc            → arbres système (toute profondeur)
#   /var /home /Users /tmp /private /mnt /media /Volumes    → répertoire de tête ENTIER
#   /home/<user>  /Users/<user>  /Volumes/<disk> (± /*)     → home ou volume ENTIER
# Tout le reste (ex. /Users/x/projet/dist, /tmp/build, node_modules) PASSE.
SYS_TGT='^(/\*?|~/?(\.|\*|\.\*)?|\$\{?HOME\}?/?(\*|\.|\.\*)?|\*)$|^/(etc|usr|bin|sbin|lib|lib64|boot|dev|proc|sys|root|srv|opt|System|Library|Applications)(/.*)?$|^/private/etc(/.*)?$|^/private/var/?$|^/(var|home|Users|tmp|private|mnt|media|Volumes)/?$|^/(home|Users|Volumes|mnt|media)/[^/]+/?(\*|\.|\.\*)?$'

rm_hits="$(printf '%s\n' "$hay" | grep -oEi -- '(^|[[:space:];&|"(])rm[[:space:]]+[^;&|]+' 2>/dev/null || true)"
if [ -n "$rm_hits" ]; then
  while IFS= read -r hit; do
    [ -z "$hit" ] && continue
    # flag récursif présent (-r/-R, combiné -rf/-fr, ou --recursive) ?
    printf '%s' "$hit" | grep -Eq -- '(^|[[:space:]])-[A-Za-z]*[rR]|(^|[[:space:]])--recursive' || continue
    first=1
    for tok in $hit; do
      if [ "$first" = "1" ]; then first=0; continue; fi   # le mot « rm » lui-même
      case "$tok" in -*) continue ;; esac                  # les flags
      tok="${tok%\"}"; tok="${tok#\"}"; tok="${tok%\'}"; tok="${tok#\'}"
      printf '%s' "$tok" | grep -Eq -- "$SYS_TGT" \
        && emit deny "SaaS Factory - safety-rails 5 : rm recursif sur une cible SYSTEME (/, /etc, /usr, ~ entier, \$HOME, *). Irreversible, refuse. Les chemins de travail (projet, /tmp/xxx, node_modules) ne sont pas bloques : cible un chemin precis."
    done
  done <<EOF
$rm_hits
EOF
fi

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
# --- Base de données ---
match '(drop|truncate)[[:space:]]+(table|database|schema)' \
  && emit ask "SaaS Factory - safety-rails 5 : suppression destructrice en base (DROP/TRUNCATE). Double confirmation requise ; sandbox only, jamais une prod existante (2)."
match 'dropdb([[:space:]]|$)' \
  && emit ask "SaaS Factory - safety-rails 5 : suppression de base (dropdb). Double confirmation requise (sandbox only, 2)."
match 'supabase[[:space:]]+db[[:space:]]+reset([[:space:]][^;|&]*)?--linked' \
  && emit ask "SaaS Factory - safety-rails 5 : supabase db reset --linked reinitialise la base DISTANTE liee (potentiellement une prod). Double confirmation requise ; sandbox only (2)."
match 'supabase[[:space:]].*(db[[:space:]]+reset|[[:space:]]delete([[:space:]]|$)|--force)' \
  && emit ask "SaaS Factory - safety-rails 5 : operation Supabase destructrice (reset/delete). Double confirmation requise ; sandbox only (2)."
# --- Git / infra locale ---
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
# --- Ressources DISTANTES des providers (les vrais vecteurs destructifs) ---
match 'gh[[:space:]]+repo[[:space:]]+delete' \
  && emit ask "SaaS Factory - safety-rails 5 : gh repo delete supprime un repo GitHub distant (code + issues + historique). Double confirmation requise."
match 'vercel[[:space:]]+(projects?[[:space:]]+)?(remove|rm)([[:space:]]|$)' \
  && emit ask "SaaS Factory - safety-rails 5 : vercel remove/rm supprime un projet ou un deploiement Vercel. Double confirmation requise."
match 'wrangler[[:space:]]+([a-z:_-]+[[:space:]]+)*delete([[:space:]]|$)' \
  && emit ask "SaaS Factory - safety-rails 5 : wrangler delete supprime une ressource Cloudflare (worker, KV, pages...). Double confirmation requise."
match 'fly(ctl)?[[:space:]]+([a-z_-]+[[:space:]]+)*destroy([[:space:]]|$)' \
  && emit ask "SaaS Factory - safety-rails 5 : flyctl destroy detruit une app/machine Fly.io. Double confirmation requise."
match 'curl[^|;&]*(-X|--request)[[:space:]=]+["]?DELETE' && match 'api\.(github|vercel|supabase|cloudflare)\.com' \
  && emit ask "SaaS Factory - safety-rails 5 : curl -X DELETE sur une API provider (GitHub/Vercel/Supabase/Cloudflare) = suppression distante potentiellement irreversible. Double confirmation requise."
# --- Exécution de script téléchargé ---
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
