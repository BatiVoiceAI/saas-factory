#!/usr/bin/env bash
# SaaS Factory — suite d'ÉVALS (la source de vérité de l'efficacité des mécanismes).
# -----------------------------------------------------------------------------
# Best-practice officielle Claude Code : « Evaluations are your source of truth for
# measuring Skill effectiveness » — mais « there is not currently a built-in way to
# run these evaluations ». Ce runner comble ce trou côté MÉCANIQUE : il agrège en
# UNE commande toutes les vérifs déterministes du plugin (planchers, gardes, audit).
# Les évals de COMPORTEMENT (prompt-level, non automatisables) sont des rubriques
# dans `evals/scenarios/*.json` — à évaluer à la main ou en run réel.
#
# Ces checks sont zéro-dépendance (pas besoin de `npm install`) : ils constituent
# le socle exécutable AVANT tout jugement d'agent (doctrine « la machine est le
# plancher », _shared/lessons.md §18).  Usage : bash evals/run.sh
# -----------------------------------------------------------------------------
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
total=0; failed=0

run() { # $1 = libellé · $2 = commande shell
  local label="$1" cmd="$2" out
  total=$((total+1))
  printf '▶ %s\n' "$label"
  if out="$(bash -c "$cmd" 2>&1)"; then
    printf '  ✓ PASS\n'
  else
    failed=$((failed+1))
    printf '  ✗ FAIL\n'
    printf '%s\n' "$out" | tail -6 | sed 's/^/    /'
  fi
}

echo "═══ Évals mécaniques — SaaS Factory ═══"
echo
echo "── Gardes (hooks) ──────────────────────────────────────"
run "safety-guard (Bash, 80 cas)"        "bash '$ROOT/hooks/safety-guard.test.sh'"
run "mcp-guard (MCP, 21 cas)"            "bash '$ROOT/hooks/mcp-guard.test.sh'"
run "machine-gate (plancher, 7 cas)"    "bash '$ROOT/hooks/machine-gate.test.sh'"
echo "── Auto-audit du plugin ────────────────────────────────"
run "couverture archétype (12/13/14/18/19)" "node '$ROOT/scripts/audit-archetype-coverage.mjs'"
echo "── Planchers des châssis (verify:machine) ──────────────"
run "châssis web-saas (5 lints)"        "cd '$ROOT/_shared/blocks/web-saas' && npm run --silent verify:machine"
run "châssis automation (2 lints)"      "cd '$ROOT/_shared/blocks/automation' && node scripts/verify-machine.mjs"

echo
echo "═══════════════════════════════════════════════════════"
printf 'Évals : %d exécutées · %d échec(s)\n' "$total" "$failed"
if [ "$failed" -eq 0 ]; then
  echo "✓ Suite verte — les mécanismes du plugin tiennent. (Voir scenarios/ pour les évals de comportement.)"
  exit 0
fi
echo "✗ Suite ROUGE — un mécanisme du plugin a régressé. Corrige avant de taguer la vague."
exit 1
