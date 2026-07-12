# Référence — Forcing questions (points de décision de l'étape 8)

Cette étape est **volontairement pauvre en interaction** : **une seule** vraie question à l'utilisateur (la direction, Q1). Toutes les autres forcing questions sont des **auto-interrogations** — tu les poses **aux artefacts et à ton propre `DESIGN.md`/mockups** pour t'empêcher de bâcler ou de produire du « AI slop » (référence normative : `_shared/design-doctrine.md`). Tu n'ouvres une question **supplémentaire** à l'utilisateur que dans les cas de routage listés en R1.

Format de chaque recette :
- **Ask exact** — la question, mot pour mot (ou l'auto-question à te poser).
- **Push-until** — le critère qui autorise à passer à la suite.
- **Red-flags** — les réponses / états à **refuser**.
- **MOU vs FORT** — un exemplaire faible et un exemplaire solide.
- **Routage** — quoi faire selon la réponse.

---

## Q1 — La direction : la SEULE vraie question utilisateur (mouvement 1)
- **Ask exact :** « As-tu déjà une **charte graphique / un design system** (couleurs, police, logo) ? Si oui, dépose le fichier ou le dossier ; sinon je te propose 3 directions complètes (polices + couleurs + style de mise en page) à regarder. »
- **Push-until :** l'utilisateur a soit **déposé** quelque chose (couloir import), soit **retenu une** des 3 recettes rendues visuellement (couloir génération). Un seul choix, pas une discussion ouverte.
- **Red-flags :** demander le format du fichier avant qu'il dépose ; présenter des **palettes nues** ou des **hex bruts** au lieu de recettes rendues (typo display + composants + extrait de hero) ; proposer 3 recettes du **même registre** ; enchaîner une 2e question design (« et pour la police tu préfères ? ») — **interdit**, la recette embarque la police, tout le reste se dérive.
- **MOU :** « Quelles couleurs, quelle typo, quel radius, quel style tu veux ? » (5 questions déguisées en une) ; ou « Palette A / B / C » (3 palettes nues sans polices ni layout).
- **FORT :** « As-tu une charte ? [dépose] — sinon voici 3 directions (ex. éditorial chaleureux / studio contemporain / moderne à caractère), chacune rendue avec son titre en display, un bouton, une carte et un aperçu de hero : laquelle te parle ? »
- **Routage :** *oui* → couloir import (matrice M1). *non* → couloir génération (3 recettes doctrine rendues visuellement, M2 + M3). *« fais au mieux »* → choisir la recette prioritaire de M2 la plus alignée au positionnement, l'annoncer, `[Assumption]`, avancer (ne pas relancer).

---

## Auto-interrogations (aucune ne sort vers l'utilisateur)

### A1 — La direction est-elle vraiment choisie « en regardant » ? (mouvement 1.c)
- **Ask exact (à toi) :** « Ai-je rendu chaque recette **complète et visuelle** (titre en display réelle + échantillons + bouton + carte + extrait de hero), ou ai-je aligné des hex / des palettes nues ? »
- **Push-until :** 3 aperçus visuels distincts existent, chacun portant sa **paire de polices** et ses **motifs de layout** ; l'utilisateur a pu comparer des directions, pas des codes.
- **Red-flags :** liste de `#RRGGBB` ; palette sans polices ni layout (palette nue) ; 3 recettes du même registre ou 3 nuances de la même teinte ; aucun composant d'aperçu ; une recette qui coche un marqueur de slop (primary indigo/violet, gris purs).
- **MOU :** « Palette A : #1E40AF #F59E0B #E5E7EB. »
- **FORT :** 3 cartes rendues (ex. R1 éditorial chaleureux / R3 studio contemporain / R4 moderne à caractère), chacune avec son titre en display, bouton primaire, carte, extrait de hero dans son registre.
- **Routage :** hex bruts ou palette nue → re-rendre en recette complète avant de demander le choix.

### A2 — Les tokens sont-ils buildables (mappent la stack Phase 3) ? (mouvement 2)
- **Ask exact (à toi) :** « Chaque token de `DESIGN.md` se traduit-il **directement** en Tailwind/shadcn — ou est-ce du décoratif intraduisible ? »
- **Push-until :** chaque valeur (couleur, spacing, radius, police) a un **mapping** vers `tailwind.config` / variables CSS shadcn (voir `tokens-a11y.md`).
- **Red-flags :** couleurs nommées sans variable, échelle de spacing arbitraire non-4px, radius « au feeling », police hors Google Fonts sans plan de chargement.
- **MOU :** « Ombres douces, coins arrondis, vibe premium. » (non buildable).
- **FORT :** « `--radius: 0.5rem` ; spacing base 4px (échelle 4/8/12/16/24/32) ; `--font-display: Fraunces` + `--font-sans: Work Sans` via Google Fonts (paire de la recette). »
- **Routage :** token non buildable → le reformuler en valeur mappable, ou le retirer.

### A3 — Le contraste passe-t-il AA ? (mouvement 2.2 / 2.6)
- **Ask exact (à toi) :** « Chaque paire texte/fond atteint-elle **4.5:1** (corps) / **3:1** (grand texte, éléments UI) ? »
- **Push-until :** toutes les paires principales vérifiées (procédure `tokens-a11y.md`) ; cibles tactiles ≥ 44px.
- **Red-flags :** gris clair sur blanc, accent saturé en texte fin, « ça a l'air lisible » sans ratio calculé.
- **MOU :** texte `#9CA3AF` sur fond `#FFFFFF` (≈ 2.8:1, échoue).
- **FORT :** texte `#374151` sur `#FFFFFF` (≈ 10:1) ; bouton primaire au ratio ≥ 4.5:1 label/fond.
- **Routage :** paire qui échoue → assombrir/éclaircir jusqu'au seuil, re-vérifier ; ne pas livrer un token AA-KO.

### A4 — Les mockups respectent-ils le DESIGN.md ? (mouvement 3)
- **Ask exact (à toi) :** « Chaque écran utilise-t-il **exactement** les tokens et composants du `DESIGN.md`, ou a-t-il inventé une couleur/un radius ? »
- **Push-until :** zéro valeur hors système dans les mockups ; mêmes composants shadcn, même échelle.
- **Red-flags :** une couleur ad hoc dans un écran, un espacement hors échelle, un composant réinventé au lieu du shadcn.
- **MOU :** dashboard avec un bleu différent de la palette « parce que ça rendait mieux ».
- **FORT :** tous les écrans importent les mêmes tokens ; le dashboard et la landing sont visiblement du **même** système.
- **Routage :** dérive détectée → réaligner l'écran sur `DESIGN.md` (cohérence > originalité), pas l'inverse.

### A5 — Un visuel Nano Banana est-il vraiment utile ? (mouvement 4)
- **Ask exact (à toi) :** « Ce visuel sert-il un **écran réel** (favicon, logo, état vide) — ou est-ce de la décoration gratuite / un substitut de screenshot produit ? »
- **Push-until :** chaque image générée est référencée par un écran ; par défaut on n'en génère **aucune** ; jamais d'image IA là où le playbook exige un screenshot réel (hero, « comment ça marche »).
- **Red-flags :** illustrations « pour faire joli » sans emplacement ; image IA en guise de visuel produit ; générer avant d'avoir vérifié la clé Gemini.
- **MOU :** 6 illustrations décoratives éparpillées ; une image IA en guise de hero de landing (interdit doctrine n°17 — le hero est un screenshot réel du mouvement 3).
- **FORT :** 1 favicon + 1 illustration d'état vide, tous deux placés dans un mockup.
- **Routage :** visuel sans emplacement → ne pas le générer. Clé absente → repli honnête (guide), livrer le reste.

### A6 — Le design coche-t-il un marqueur d'AI slop ? (mouvements 2-3, AVANT la porte)
- **Ask exact (à toi) :** « En passant la **checklist anti-slop de `design-doctrine.md`** (15 points) sur `DESIGN.md` et sur chaque mockup : combien de OUI ? »
- **Push-until :** **0 marqueur coché** sur les tokens ET sur les écrans (desktop + mobile pour la landing). Un design qui coche un marqueur est **REFUSÉ avant la porte**.
- **Red-flags :** primary indigo/violet ou gradient bleu→violet ; Inter/system seule sans display ; gris purs en neutres ; hero centré générique ; 3 cartes features identiques ; ombres floues partout ; emojis en icônes ; thème shadcn zinc brut ; « ça passera, c'est un détail ».
- **MOU :** « Le design est propre dans l'ensemble, on verra les détails plus tard. »
- **FORT :** « Checklist doctrine passée sur DESIGN.md + 6 mockups : 0/15 marqueur. Éléments signature : Fraunces en display + neutres stone chauds. »
- **Routage :** 1+ marqueur → retour au mouvement concerné (1 si la recette est en cause, 2 pour les tokens, 3 pour un écran) et **re-dérivation** — pas de rustine ponctuelle, pas de présentation à la porte.

### A7 — La landing suit-elle le playbook ? (mouvement 3)
- **Ask exact (à toi) :** « La landing respecte-t-elle `_shared/landing-playbook.md` : les 11 sections canoniques dans l'ordre, un copy **spécifique** tiré de `positioning.md` + `product/pricing.md`, zéro contenu inventé ? »
- **Push-until :** structure canonique complète (testimonials conditionnels) ; headline instanciée sur le job du client (formules du playbook) ; prix réels affichés ; hero = screenshot réel de l'app ; zéro lorem/placeholder/buzzword interdit.
- **Red-flags :** hero nu (headline + 2 boutons sans la suite) ; lorem ipsum ou `[placeholder]` ; testimonials/logos/stats inventés ; pricing « contactez-nous » ou tiers non issus de `pricing.md` ; copy générique (« Supercharge your workflow »).
- **MOU :** hero centré « La plateforme tout-en-un » + 3 cartes + footer 2 liens.
- **FORT :** navbar → hero 2 colonnes (« Un agenda plein, sans passer la journée au téléphone » + screenshot agenda) → preuve honnête → problème → 3 étapes → features jobs → pricing réel 3 tiers → FAQ → CTA final → footer complet avec pages légales.
- **Routage :** section manquante ou copy générique → régénérer la landing depuis le playbook (structure + formules), pas de patch cosmétique.

---

## R1 — Les seuls cas où l'on interroge VRAIMENT l'utilisateur (au-delà de Q1)
Par défaut : **une seule** question (Q1). On **ouvre une question supplémentaire uniquement** dans ces cas :

| Cas | Condition déclenchante | Question minimale à poser |
|---|---|---|
| **Import ambigu / multi-charte** | Le dépôt contient **plusieurs** identités contradictoires (2 logos, 2 palettes) | Montrer les options, demander de trancher (choix binaire), documenter — ne pas fusionner à l'aveugle |
| **Import illisible** | Fichier corrompu / format inconnu **et** couleurs non extractibles | Demander une **liste de couleurs** ou un dépôt lisible ; à défaut, basculer en génération (couloir 1.c) |
| **PRD sans écrans exploitables** | `product-spec.md` absent ou sans features/écrans identifiables | Confirmer le **workflow cœur** en une question, puis dériver le minimum et `[Assumption]` |
| **Contrainte marque explicite** | L'utilisateur a une contrainte connue (couleur imposée, accessibilité renforcée AAA, dark-only) | Confirmer la contrainte **avant** de dériver, pour ne pas la violer |
| **Direction non tranchée** | L'utilisateur refuse de choisir parmi les 3 recettes | **Ne pas** reposer 3 fois : choisir la recette prioritaire de M2 alignée au positionnement, annoncer, `[Assumption]` |

**Règle d'or du routage :** une question ouverte à l'utilisateur est un **coût** (friction ; lessons.md : interaction minimale). Ne l'ouvre que si **aucune** relecture d'artefact ni dérivation ne peut y répondre. Sinon : branche la Phase 1/2, dérive, marque `[Assumption]`, avance.
