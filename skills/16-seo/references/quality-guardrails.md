# Référence — Garde-fous qualité (le moat anti-pénalité Google)

**Prime sur tout le reste de l'étape 16.** Ce qui distingue notre SEO d'une ferme de contenu — et ce que **personne d'autre n'encode**. Basé sur les politiques Google (sources primaires).

## 1. Plafond dur de pages
V1 : **landing + 3 à 8 pages** max. **Dépasser le plafond = refusé.** La génération de masse (dizaines/centaines de pages depuis une DB) = **`scaled content abuse`** (Spam Policies Google 2024, vise explicitement l'IA-de-masse manipulatoire) → **interdit**.

## 2. Helpful Content — self-assessment par page (bloquant)
Chaque page candidate répond **OUI** aux questions de Google (people-first content) **avant** d'être retenue :
- Apporte-t-elle une **valeur réelle** à un utilisateur (pas juste du texte pour Google) ?
- Reflète-t-elle une **expérience/expertise** de première main (E-E-A-T) ?
- L'utilisateur repart-il **satisfait** (pas besoin de re-chercher) ?
- Aurait-on **confiance** à la montrer à un expert du domaine ?
Une page qui échoue → **on ne la publie pas** (on l'améliore ou on la coupe).

## 3. E-E-A-T (Experience · Expertise · Authoritativeness · Trust)
Signaux concrets : source/auteur crédible · contenu **spécifique à la niche** (pas générique) · preuves/liens · pas de promesses creuses.

## 4. Anti-cannibalisation
Deux pages ne ciblent **jamais la même intention** (sinon elles se concurrencent dans les SERP).

## 5. Gate humain (obligatoire — pages éditoriales uniquement)
Avant publication des pages **éditoriales** (livrable b) : **`AskUserQuestion`** — l'humain voit les pages + les mots-clés visés, et **valide**. On ne publie pas de contenu public au nom de l'utilisateur sans son OK (`_shared/safety-rails.md`). **Périmètre :** le gate couvre le **contenu** ; le **socle technique** (livrable a — sitemap, robots, metadata, JSON-LD) n'est **pas** du contenu public : c'est du code, committé **sans gate**, immédiatement — le retenir « en attente » est un mode d'échec, pas de la prudence.

> **Qualité mesurée · valeur réelle · plafond dur · validation humaine.** C'est le frein que l'open-source n'a pas.

---

## Procédures d'application (comment ces garde-fous se vérifient concrètement)

### A. Détecter le scaled content abuse (garde-fou 1)
Trois signaux ⇒ **refus** immédiat :
1. **Nombre** : on dépasse landing + 8 pages (M4 de `decision-matrices.md`).
2. **Origine** : les pages sont générées depuis une **DB / un template varié en masse** (une page par ville / métier / variante) — c'est du programmatic SEO.
3. **Ressemblance** : les pages se ressemblent à ~80 %, seul le mot-clé change (duplication déguisée).
Un seul de ces signaux suffit à refuser. Correction : réduire au conforme, 1 page = 1 cluster = 1 rédaction soignée à la main.

### B. Self-assessment Helpful Content, page par page (garde-fou 2)
Forcing-checklist exacte (Ask / Push-until / Red-flags / MOU-vs-FORT) : `forcing-questions.md` §1. En résumé : les **quatre** questions Google répondent **OUI franc**, sinon on améliore ou on **coupe**. Un « oui mais c'est mince » = NON. Aucune page ne rejoint `seo/plan.md` sans **PASS** consigné.

### C. Vérifier E-E-A-T (garde-fou 3)
Par page, cocher des **signaux concrets**, pas des intentions :
- [ ] **Spécificité niche** : un exemple/cas réel du domaine, pas une paraphrase générique.
- [ ] **First-hand** : reflète une expérience/expertise réelle (le produit, le métier).
- [ ] **Preuves** : chiffres, captures, liens vers des sources — pas de promesses creuses.
- [ ] **Source/auteur crédible** si le format s'y prête.
Une page qui ne coche aucun signal E-E-A-T échoue le garde-fou 2 par construction.

### D. Anti-cannibalisation (garde-fou 4)
Procédure : pour chaque **paire** de pages retenues, appliquer M5 (`decision-matrices.md`) — même intention / SERP partagée ⇒ **fusionner** en une page. Recette d'auto-contrôle : `forcing-questions.md` §3.

### E. Gate humain (garde-fou 5)
Recette exacte de l'`AskUserQuestion` (ce qu'on montre, ce qui compte comme OK, ce qui n'en est pas un) : `forcing-questions.md` §4. Règle d'or : **validation ≠ ce lot**, et **pas de réponse = pas de publication** — des pages éditoriales seulement : le socle technique est déjà committé et n'entre pas dans ce lot. L'OK est explicite, porte sur le lot montré, et se trace (date) dans `seo/plan.md`.

## Micro-exemple — une page qui passe vs une qui échoue
- **Échoue :** « Qu'est-ce que {catégorie} ? » — 800 mots génériques, vrais nulle part, écrits pour le mot-clé. Aucun E-E-A-T, lecteur non satisfait ⇒ **coupée**.
- **Passe :** « Comment {métier} évite {douleur précise} en {contexte} » — un cas réel, une méthode concrète, une capture produit, réponse complète ⇒ **PASS**, retenue.

## Ce que ce garde-fou refuse, résumé
Générateur de masse · pages creuses « pour Google » · faux structured data (rating/FAQ inventés, voir M6) · deux pages même intention · publication sans OK humain · volume déguisé en « un cluster = une page » alors que le cluster ne tient pas. Détail des modes d'échec et corrections : `checklists-modes-echec.md`.
