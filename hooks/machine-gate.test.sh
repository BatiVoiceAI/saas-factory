#!/usr/bin/env bash
# Batterie de tests de hooks/machine-gate.sh.
# BLOCK = le hook doit émettre {"decision":"block",…} (plancher rouge).
# ALLOW = le hook doit laisser finir (exit 0, AUCUNE sortie) — fail-open inclus.
# À relancer après toute modification : bash hooks/machine-gate.test.sh
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATE="$HERE/machine-gate.sh"
pass=0; fail=0

if ! command -v npm >/dev/null 2>&1; then
  echo "SKIP — npm indisponible dans cet environnement (le hook est fail-open sans npm)."; exit 0
fi

T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/proj-fail/src/deep" "$T/proj-pass" "$T/noproj"
printf '{"name":"f","scripts":{"verify:machine":"exit 1"}}\n' > "$T/proj-fail/package.json"
printf '{"name":"p","scripts":{"verify:machine":"exit 0"}}\n' > "$T/proj-pass/package.json"

# $1 = BLOCK|ALLOW · $2 = libellé · $3 = input JSON brut (STDIN du hook)
check() {
  local want="$1" label="$2" input="$3" out got
  out="$(printf '%s' "$input" | bash "$GATE" 2>/dev/null)"
  got="ALLOW"; printf '%s' "$out" | grep -q '"decision":"block"' && got="BLOCK"
  if [ "$got" = "$want" ]; then pass=$((pass+1)); else
    fail=$((fail+1)); printf '  ✗ [%s attendu, %s obtenu] %s\n' "$want" "$got" "$label"
  fi
}

echo "── verify:machine ROUGE → BLOCK ─────────────────────────"
check BLOCK "projet au plancher rouge"            "$(printf '{"hook_event_name":"SubagentStop","agent_type":"feature-dev","cwd":"%s"}' "$T/proj-fail")"
check BLOCK "sous-dossier profond (remonte l'arbre)" "$(printf '{"cwd":"%s"}' "$T/proj-fail/src/deep")"

echo "── verify:machine VERT / rien à vérifier → ALLOW ────────"
check ALLOW "projet au plancher vert"             "$(printf '{"cwd":"%s"}' "$T/proj-pass")"
check ALLOW "dossier sans package.json (fail-open)" "$(printf '{"cwd":"%s"}' "$T/noproj")"
check ALLOW "cwd inexistant (fail-open)"           "$(printf '{"cwd":"%s/nope"}' "$T")"
check ALLOW "JSON malformé (fail-open)"            "pas du json"
check ALLOW "cwd absent (fail-open)"               "{}"

echo "─────────────────────────────────────────────────────────"
printf 'Résultat : %d PASS · %d FAIL\n' "$pass" "$fail"
[ "$fail" -eq 0 ] && { echo "Batterie verte — le plancher machine bloque le rouge, laisse finir le vert, fail-open sinon."; exit 0; }
echo "Batterie ROUGE — corrige avant de merger."; exit 1
