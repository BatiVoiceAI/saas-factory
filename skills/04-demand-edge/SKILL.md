---
name: 04-demand-edge
description: >-
  Étape 4 (Phase 1 · validation) de SaaS Factory — Demande & edge (rôle CEO, surcouche maison). Infère le signal de demande à partir des avis clients des concurrents (signal par proxy → verdict humble), puis nomme et tranche l'axe différenciant (edge réel / faible / pas d'edge), et produit demand-signals.md. Se déclenche pour « y a-t-il de la demande », « quel est notre edge / différenciateur », après positioning.md.
allowed-tools: Read, Write, Edit, Bash
---

# SaaS Factory — Étape 4 : Demande & edge (rôle CEO)

Pas de moteur tiers dédié ici : **c'est ta surcouche**. Elle transforme un signal *par proxy* en verdict *humble*, et tranche l'edge une bonne fois.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-1-validation/references/conventions.md`.

## Références de profondeur (progressive disclosure)
Ce SKILL.md est le **chef d'orchestre scannable**. La procédure exhaustive vit dans `references/` — ouvre le fichier utile au moment d'exécuter le bloc correspondant :
- `references/demand-signal-procedure.md` — **BLOC 1** pas-à-pas : 4 passes d'extraction (critères de passage), matrice de départage du verdict, forcing-questions, DoD, catalogue de cas limites, modes d'échec.
- `references/edge-procedure.md` — **BLOC 2** pas-à-pas : machine à états, matrice de tranche, test de défendabilité, forcing-questions, sortie « pas d'edge », DoD, cas limites, modes d'échec.
- `references/adversarial-verification.md` — recette de vérif appliquée ici (tiers, confirmerait/infirmerait/trous, matrice tier × verdict, passe honnêteté) — applique les moteurs vendorés `verification-agent.md` + `honesty-protocol.md`.
- `references/worked-examples.md` — deux runs de bout en bout (« fort + edge réel », « faible + pas d'edge »), niche-agnostiques.

## Ce que fait cette étape (et pourquoi)
Deux jobs, un seul fichier :
1. **Signal de demande** — est-ce que quelqu'un veut vraiment ça ? Tu l'**infères des avis clients des concurrents** (le review-mining de l'étape 2), faute d'interviews terrain.
2. **Edge** — y a-t-il un axe différenciant réel ? Tu le **nommes** et tu **tranches**, à partir de l'angle formalisé à l'étape 3 et des manques concurrents.

Pourquoi une surcouche maison : les moteurs produisent de la **matière** ; le **jugement** (« demande plausible ? edge réel ? ») t'appartient. C'est le rôle CEO ; on ne le sous-traite pas.

**HARD GATE / frontière (anti-doublon).** L'étape 3 a formalisé l'angle candidat (phrase Onliness candidate comprise) : tu la **reprends**, tu la **précises** (la niche) et tu **tranches** — LA frontière qui compte : **le verdict edge (réel / faible / absent) t'appartient**. Toi tu **produis** le verdict · l'étape 5 le **pèse** dans la décision. Ne décide **pas** Go ici.

## Entrées / sortie (contrat)
- **Lit :** `research/market.md` (le dossier marché détaillé de l'étape 2) + `research/raw/` (review/forum-mining brut) + `research/positioning.md` (l'angle candidat formalisé). Dans `market.md`, tu **hérites** directement de : **§Carte de langage** (verbatims sourcés — tu ne re-mines pas), **§Dossiers concurrents détaillés** + **§Matrice** + **§Prix** (le paysage concurrentiel RÉEL contre lequel l'edge se juge), **§Fiabilité** (plafond de confiance).
- **Écrit :** `research/demand-signals.md` (template `assets/templates/demand-signals.md`) — sortie **unique**, deux blocs — + `.saas-factory/state.md` (verdict demande, verdict edge).

> **Anti-re-mining (non négociable) :** l'étape 2 a déjà miné les avis et bâti la carte de langage. Tu la **reprends telle quelle** ; tu n'ouvres pas de nouvelles pages. Un verbatim marqué WebFetch=non reste `[snippet — non vérifié]` (il n'étaie ni « demande Forte » ni « edge réel »).

## Deux principes qui gouvernent cette étape
- **Signal par proxy → verdict humble.** L'IA ne fait pas d'interviews. Les avis concurrents sont un **proxy** (Tier 3). Conclusion possible : « demande **plausible** » — **jamais** « demande prouvée ». Toujours « à valider par toi ».
- **Edge = bonus, jamais inventé.** Trouvé → on le nomme. Pas trouvé → on le dit franchement. Un produit à features égales, **bien exécuté sur une niche**, reste viable. Gonfler un edge inexistant envoie construire sur du vide.

## BLOC 1 — Signal de demande
> Procédure exhaustive (passes, matrices, forcing-questions, DoD, cas limites, modes d'échec) → `references/demand-signal-procedure.md`.

### Quoi extraire de `market.md`, dans cet ordre (du volume vers la douleur)
Tu pars de la **§Carte de langage** (déjà rangée en problème / solution désirée / frustrations / churn) + du volume d'avis consigné en `raw/` — pas de re-mining.
1. **Volume d'avis + notes moyennes** — par concurrent puis agrégé (`raw/review-mining.md`). Beaucoup d'avis = marché actif ; très peu = immature **ou** faible switching — dis lequel, ne devine pas.
2. **Plaintes récurrentes** — les *pain themes* partagés par **plusieurs** concurrents + leur **sévérité** (agacement / bloquant / rédhibitoire), lus dans §Carte de langage « frustrations ». Une douleur partagée = problème **structurel** = vraie demande.
3. **Features réclamées** — §Carte de langage « solution désirée » : ce que les clients demandent et n'ont pas. Signal le plus direct.
4. **Signaux de churn** — §Carte de langage « déclencheurs de churn » : pourquoi les gens **partent**. Le seul « comportement » observable par proxy.

### Verdict de demande (libellés — source unique en référence)
Trois verdicts possibles : **Fort / Moyen / Faible**. La rubrique déterministe complète (conditions exhaustives, matrice de départage, bandes de volume) vit dans `references/demand-signal-procedure.md` §2 — **source unique**, à appliquer sans négocier. En un mot : Fort exige volume élevé + douleur partagée sévère + features convergentes + churn ; au moindre doute entre deux crans, **descends**.

Formule **humble** : « demande **plausiblement** {forte/moyenne/faible} », preuves à l'appui (quote + source + date).

### Vérif adversariale (obligatoire)
Applique `{PLUGIN_ROOT}/vendor/startup-skill/startup-competitors/references/verification-agent.md` + `honesty-protocol.md` : **tag chaque source par tier** (avis = **Tier 3** ; un verdict « Fort » ne peut pas reposer sur une seule source Tier 3) ; **vérifie l'authenticité des quotes** (verbatim dont la page n'a pas été ouverte à l'étape 2 = `[snippet — non vérifié]`, il ne soutient ni « demande Forte » ni « Edge réel ») ; **écris ce qui confirmerait** (inscriptions, willingness-to-pay, liste d'attente) **et ce qui infirmerait** (avis >18 mois, un seul concurrent, plaintes « nice-to-have ») ; **déclare les trous**.
> **Résolution du chemin** : `{PLUGIN_ROOT}` se résout en chemin ABSOLU avant tout accès (hook SessionStart ou échelle de fallback), Read de vérification avant dispatch, jamais de `vendor/…` relatif dans un brief de sous-agent — `_shared/vendored-engine-protocol.md` **§0**.
> Recette détaillée (matrice tier × verdict, triptyque, passe honnêteté, exemple rempli) → `references/adversarial-verification.md`.

## BLOC 2 — Edge
> Procédure exhaustive (machine à états, matrice de tranche, test de défendabilité, forcing-questions, sortie « pas d'edge », DoD, modes d'échec) → `references/edge-procedure.md`.

1. **Reprends l'angle candidat** de `positioning.md` (phrase Onliness candidate comprise) + les **manques concurrents** de `market.md` — jugés contre le **paysage RÉEL détaillé** (§Dossiers concurrents détaillés + §Matrice + §Prix), pas contre une idée vague de la concurrence. Un « manque » qu'un dossier détaillé contredit n'en est pas un.
2. **Formule l'axe** : reprends la phrase de l'étape 3, précise la niche — une phrase orientée client : *le seul {catégorie} qui {différenciateur} pour {niche}*.
3. **Tranche** : trois verdicts possibles — **Edge réel / Edge faible / Pas d'edge**. Les critères des trois, la matrice de départage et le test de défendabilité vivent dans `references/edge-procedure.md` §2 — **source unique**. En un mot : Edge réel = manque **partagé** (≥2 concurrents) + **réclamé** dans les avis + **défendable** (pas copiable en un sprint).
4. **Si pas d'edge : dis-le, net.** N'invente rien. Écris que le produit reste **viable à features égales, bien exécuté sur une niche** — et renvoie l'arbitrage « on y va quand même ? » à l'étape 5.

## Clôture d'étape
Mets à jour `.saas-factory/state.md` (verdict demande, verdict edge). Résume en 2 lignes, puis annonce l'**étape 5 (`05-opportunity`)**, qui pèsera demande × edge × marché × risques pour la porte Go / Ajuster / Go-test / No-Go.
