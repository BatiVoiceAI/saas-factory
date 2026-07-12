# Design System — <Produit>

> Source de vérité visuelle. Toujours lire ce fichier avant toute décision UI, en Phase 2 comme en Phase 3. Ne pas dévier sans accord explicite.

## Product context
<!-- Ce que c'est, pour qui, type (public/interne/perso) — hérité de research/idea-brief.md -->
<...>

## Aesthetic direction
<!-- Recette retenue (`_shared/design-doctrine.md` §Recettes : registre NOMMÉ — éditorial / technique / chaleureux / premium / brutal) ou identité importée · mood · 3 références réelles (ex. « hero split comme Stripe, bordures comme Linear ») -->
<...>

### Éléments signature (1-2)
<!-- Ce qui rend le produit reconnaissable, pas médian (ex. serif éditoriale en display, neutres chauds, section sombre de rupture) — exigé par l'étape 08 -->
<...>

## Typography
<!-- Paire déclarée (display à caractère H1-H3 + sans neutre corps), via next/font, exposée en --font-display / --font-sans / --font-mono · échelle · poids · chiffres en tabular-nums/mono -->
<...>

## Color
<!-- 1 seule couleur de marque (OKLCH) + neutres TEINTÉS (jamais gris purs) : primary · accent · neutrals · sémantique (succès/erreur/alerte) · dark mode. Noter le contraste a11y (ratios texte/fond conformes WCAG AA, light ET dark). Interdits binaires : `_shared/design-doctrine.md` §Marqueurs. -->
<...>

## Spacing
<!-- Base (ex. 4px) · échelle (xs/sm/md/lg/xl) -->
<...>

## Layout / Geometry
<!-- Grille · radius (coins) · élévation / ombres -->
<...>

## Motion
<!-- Durées · easing · transitions clés -->
<...>

## Components (shadcn/ui + Tailwind)
<!-- Composants clés utilisés + leurs variantes/états. Ils mappent la stack de la Phase 3. Icônes : Lucide, un seul style (taille/stroke uniformes). -->
<...>

## Tokens → code (mapping exact `app/globals.css`)
<!-- Bloc `:root` + `.dark` PRÊT À COLLER (valeurs HSL/OKLCH) : la Phase 4 l'applique en ÉCRASANT les défauts du châssis (garde-fou « charte appliquée », étape 12). Un DESIGN.md sans ce bloc reste un document mort. -->
```css
:root { <...> }
.dark { <...> }
```

## Decisions log
| Date | Décision | Rationale |
|------|----------|-----------|
| <date> | <décision> | <pourquoi> |
