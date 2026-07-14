# Référence — Sourcing de STRUCTURE (anti-convergence composants)

Le problème que ce fichier résout : la recherche de direction (mvt 1) fait varier la **peau** (couleur/typo/motion/tokens), mais si tous les projets **dérivent du même shadcn de base** (mêmes composants, mêmes silhouettes de section), le rendu **converge** malgré la recherche. La parade : **sourcer de la STRUCTURE variée par projet** depuis l'écosystème de registres — sur ta stack (React + Tailwind + shadcn), donc buildable, jamais un template HTML à porter.

## Sommaire

- Le principe
- Où sourcer — l'écosystème de registres shadcn
- Comment pull (par ordre de préférence)
- Porte licence (non négociable)
- Re-thématisation (obligatoire)
- Repli honnête
- v0 (upgrade optionnel — génératif)

## Le principe
shadcn/ui n'est plus une lib mais un **écosystème** : ~88 registres externes, chacun avec des **structures de blocs différentes** (pas juste des couleurs). On **choisit par projet** les blocs dont la **forme** sert la direction recherchée (mvt 1) et l'archétype de structure de landing (`_shared/landing-playbook.md` §Menu d'archétypes), puis on les **pull** (code réel, possédé, re-thémable) et on les **re-thème** aux tokens de `DESIGN.md`. Deux métiers → deux jeux de blocs → deux silhouettes.

## Où sourcer — l'écosystème de registres shadcn
Registres à structure marquée (à matcher à la direction) :
- **Aceternity UI** — hero riches, **bento**, parallax, cartes à effets, sections « in-house team » (idéal Product-led / Statement).
- **Tailark** — pages/sections **marketing** prêtes (idéal Conversion-dense / landing).
- **Magic UI**, **Cult UI** — animés, bold.
- **Origin UI**, **ReUI**, **MynaUI** — primitives système, denses, sobres (idéal Éditorial / interne).
- **shadcnblocks / shadcn.io / 21st.dev** — grosses marketplaces de blocs (structures variées).

Découverte : `https://ui.shadcn.com/r/registries.json` (index communautaire) · `registry.directory` (explorateur). **Choisir selon la forme**, pas selon la popularité — c'est la diversité de STRUCTURE qu'on cherche.

## Comment pull (par ordre de préférence)
1. **MCP shadcn officiel** (si configuré — `infra-setup` / `.mcp.json`) : l'agent **cherche / parcourt / installe** des blocs depuis n'importe quel registre par langage naturel (« hero éditorial chaleureux », « bento features »). C'est le chemin natif et programmatique.
2. **`npx shadcn@latest add <url-de-registre>`** : pull direct d'un bloc/registre compatible, sans MCP. Marche partout où la CLI shadcn tourne.
3. **Composants `components/landing/*` du châssis** (déjà présents) : le socle de départ — mais **ne PAS s'y limiter** (c'est justement ce qui converge).

## Porte licence (non négociable — discipline de vendoring du plugin)
Avant de pull un bloc : **vérifier la licence — uniquement MIT / Apache-2.0 / ISC.** Un registre à licence propriétaire/payante (ex. tiers « pro ») ou sans licence claire = **on ne pull pas** (cf. `vendor/README.md`). Conserver la provenance (registre + licence) dans un commentaire ou `PROVENANCE`. Beaucoup sont MIT (Magic UI, Origin UI, Tailark…) ; certains ont un tier pro — s'en tenir au libre.

## Re-thématisation (obligatoire)
Un bloc pull aux **couleurs/polices/radius d'origine = slop** (marqueur convergence). Après pull : remplacer systématiquement tokens + polices + radius + contenu par ceux de `DESIGN.md`, au point que le bloc **ne ressemble plus à son origine** (même règle que l'Arsenal §DUPLIQUER). La structure vient du registre ; l'identité vient de `DESIGN.md`.

## Repli honnête
- **MCP absent + pas de réseau** → utilise `components/landing/*` du châssis, **mais choisis quand même un archétype de structure distinct** (menu du playbook) et **signale** que le sourcing externe était indisponible (le risque de convergence est plus élevé — à noter, pas à masquer).
- Jamais bloquer le build sur l'indisponibilité du sourcing : la structure varie **au minimum** via le choix d'archétype (Part A) ; le sourcing de blocs (Part B) l'amplifie quand il est là.

## v0 (upgrade optionnel — génératif)
Pour une adaptation **maximale** par marque, la **v0 Platform API** (Vercel, SDK `v0-sdk`) **génère** une landing/écran depuis un prompt (brand audit + direction), rend du React/Next/Tailwind/shadcn, et peut être **seedée avec le châssis**. Clé posée à `infra-setup` (comme Nano Banana) ; **repli honnête** si absente. Génératif = moins déterministe : à réserver quand on veut du frais plutôt qu'assembler.
