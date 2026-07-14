#!/usr/bin/env bash
# Batterie de tests de hooks/mcp-guard.sh.
# ASK  = le hook doit émettre permissionDecision:"ask".
# ALLOW = le hook doit laisser passer (exit 0, AUCUNE sortie).
# À relancer après toute modification du garde : bash hooks/mcp-guard.test.sh
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="$HERE/mcp-guard.sh"
pass=0; fail=0

# $1 = ASK|ALLOW · $2 = libellé · $3 = tool_name · $4 = payload JSON (tool_input)
check() {
  local want="$1" label="$2" tool="$3" ti="$4"
  local input out
  input="$(printf '{"tool_name":"%s","tool_input":%s}' "$tool" "$ti")"
  out="$(printf '%s' "$input" | bash "$GUARD" 2>/dev/null)"
  local got="ALLOW"
  printf '%s' "$out" | grep -q '"permissionDecision":"ask"' && got="ASK"
  if [ "$got" = "$want" ]; then
    pass=$((pass+1))
  else
    fail=$((fail+1))
    printf '  ✗ [%s attendu, %s obtenu] %s\n' "$want" "$got" "$label"
  fi
}

echo "── Destructif → ASK ─────────────────────────────────────"
check ASK  "supabase execute_sql DROP TABLE"        "mcp__supabase__execute_sql"   '{"query":"DROP TABLE users"}'
check ASK  "supabase execute_sql TRUNCATE"          "mcp__supabase__execute_sql"   '{"query":"TRUNCATE TABLE orders"}'
check ASK  "supabase execute_sql DELETE sans WHERE" "mcp__supabase__execute_sql"   '{"query":"DELETE FROM users"}'
check ASK  "DELETE FROM elsewhere (table ~where)"   "mcp__supabase__execute_sql"   '{"query":"DELETE FROM elsewhere"}'
check ASK  "DROP SCHEMA public cascade"             "mcp__supabase__apply_migration" '{"sql":"DROP SCHEMA public CASCADE"}'
check ASK  "github delete_repository"               "mcp__github__delete_repository" '{"owner":"me","repo":"x"}'
check ASK  "cloudflare delete_dns_record"           "mcp__cloudflare__delete_dns_record" '{"id":"abc"}'
check ASK  "vercel remove_project"                  "mcp__vercel__remove_project"  '{"projectId":"p"}'
check ASK  "supabase reset --linked"                "mcp__supabase__reset_db"      '{"target":"linked"}'
check ASK  "DROP dans un outil au nom neutre"       "mcp__db__run"                 '{"sql":"drop table logs"}'

echo "── Légitime → ALLOW ─────────────────────────────────────"
check ALLOW "SELECT (lecture)"                      "mcp__supabase__execute_sql"   '{"query":"SELECT * FROM users"}'
check ALLOW "INSERT (provisioning)"                 "mcp__supabase__execute_sql"   '{"query":"INSERT INTO users (id) VALUES (1)"}'
check ALLOW "DELETE avec WHERE"                     "mcp__supabase__execute_sql"   '{"query":"DELETE FROM users WHERE id = 1"}'
check ALLOW "CREATE TABLE (migration)"              "mcp__supabase__apply_migration" '{"sql":"CREATE TABLE t (id int)"}'
check ALLOW "UPDATE avec WHERE"                     "mcp__supabase__execute_sql"   '{"query":"UPDATE users SET name = '\''x'\'' WHERE id = 1"}'
check ALLOW "github create_repository"              "mcp__github__create_repository" '{"name":"x"}'
check ALLOW "github list_repos (lecture)"           "mcp__github__list_repositories" '{}'
check ALLOW "supabase list_tables (lecture)"        "mcp__supabase__list_tables"   '{}'
check ALLOW "cloudflare create_dns_record"          "mcp__cloudflare__create_dns_record" '{"type":"A"}'
check ALLOW "outil non-MCP (Bash) ignoré"           "Bash"                         '{"command":"drop table x"}'
check ALLOW "select mentionnant le mot dropdown"    "mcp__supabase__execute_sql"   '{"query":"SELECT dropdown FROM ui_config"}'

echo "─────────────────────────────────────────────────────────"
printf 'Résultat : %d PASS · %d FAIL\n' "$pass" "$fail"
[ "$fail" -eq 0 ] && { echo "Batterie verte — le garde MCP couvre le destructif sans gêner le provisioning."; exit 0; }
echo "Batterie ROUGE — corrige avant de merger."; exit 1
