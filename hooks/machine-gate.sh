#!/usr/bin/env bash
# SaaS Factory — machine-gate (hook SubagentStop, matcher "feature-dev")
# -----------------------------------------------------------------------------
# Rend MÉCANIQUE le "plancher machine" que le plugin THÉORISE mais invoque en
# prose (_shared/lessons.md §18 : « la machine est le plancher, l'agent le
# plafond — le plancher précède tout jugement d'agent »). Quand un agent
# `feature-dev` finit sa lane, on exécute `verify:machine` (lints slop /
# sentinelle / secrets / sql / i18n — rapide, zéro-dépendance) dans SON projet ;
# si ROUGE → `block` : le feature-dev **continue et corrige** avant que son
# DEV-DONE ne remonte la cascade (étape 13). C'est la porte des étapes 12/14/17,
# rendue exécutable au lieu d'être « priée ».
#
# FAIL-OPEN PARTOUT (jamais faux-bloquer un travail légitime) :
#   cwd illisible · pas de npm · aucun projet `verify:machine` trouvé en remontant
#   (Phases 1-3, non-code) · exécution impossible  →  on laisse finir (exit 0).
# Le blocage n'arrive QUE si `verify:machine` a réellement tourné et rendu rouge.
# Les violations qu'il détecte sont dans le code du feature-dev → corrigeables par
# lui (la boucle converge). Le budget d'itération (prose 13) borne le reste.
#
# Contrat (doc officielle) : SubagentStop reçoit `cwd`/`agent_type` sur STDIN ;
# `{"decision":"block","reason":"…"}` force la continuation ; exit 0 sans sortie
# = laisser finir. Tests : hooks/machine-gate.test.sh.
# -----------------------------------------------------------------------------
set -u

input="$(cat)"

cwd=""
if command -v jq >/dev/null 2>&1; then
  cwd="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
fi
[ -z "$cwd" ] && cwd="$(printf '%s' "$input" | sed -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
[ -z "$cwd" ] && cwd="${PWD:-}"
[ -n "$cwd" ] && [ -d "$cwd" ] || exit 0        # cwd illisible → fail-open
command -v npm >/dev/null 2>&1 || exit 0          # pas de npm → fail-open

# Projet le plus proche exposant un script "verify:machine" (remonte l'arbre).
dir="$cwd"; proj=""
while [ -n "$dir" ] && [ "$dir" != "/" ] && [ "$dir" != "." ]; do
  if [ -f "$dir/package.json" ] && grep -q '"verify:machine"' "$dir/package.json" 2>/dev/null; then
    proj="$dir"; break
  fi
  parent="$(dirname "$dir")"
  [ "$parent" = "$dir" ] && break
  dir="$parent"
done
[ -z "$proj" ] && exit 0                          # pas de projet buildable → fail-open

# Exécuter le plancher (rapide). Vert → laisser finir (silencieux).
if ( cd "$proj" && npm run --silent verify:machine ) >/dev/null 2>&1; then
  exit 0
fi

# Rouge → block : feature-dev continue et corrige avant DEV-DONE. Raison STATIQUE
# (aucune sortie de lint recopiee → JSON toujours valide ; l'agent relance pour voir).
printf '{"decision":"block","reason":"Porte machine ROUGE dans %s : `npm run verify:machine` echoue (plancher lint slop/sentinelle/secrets/sql/i18n). Ce plancher precede tout jugement d agent (lessons 18). Relance `npm run verify:machine` dans ce dossier, corrige les violations listees, puis termine. Ne fais pas remonter un DEV-DONE avec un plancher rouge (etape 13)."}\n' "$proj"
exit 0
