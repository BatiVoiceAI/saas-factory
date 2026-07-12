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

**HARD GATE / frontière (anti-doublon).** L'étape 3 **formalise** l'angle · toi tu **nommes + tranches**. Toi tu **produis** le verdict edge · l'étape 5 le **pèse** dans la décision. Ne décide **pas** Go ici.

## Entrées / sortie (contrat)
- **Lit :** `research/market.md` (le **review-mining** de l'étape 2, dont `research/raw/`) + `research/positioning.md` (l'angle candidat formalisé).
- **Écrit :** `research/demand-signals.md` (template `assets/templates/demand-signals.md`) — sortie **unique**, deux blocs — + `.saas-factory/state.md` (verdict demande, verdict edge).

## Deux principes qui gouvernent cette étape
- **Signal par proxy → verdict humble.** L'IA ne fait pas d'interviews. Les avis concurrents sont un **proxy** (Tier 3). Conclusion possible : « demande **plausible** » — **jamais** « demande prouvée ». Toujours « à valider par toi ».
- **Edge = bonus, jamais inventé.** Trouvé → on le nomme. Pas trouvé → on le dit franchement. Un produit à features égales, **bien exécuté sur une niche**, reste viable. Gonfler un edge inexistant envoie construire sur du vide.

## BLOC 1 — Signal de demande
> Procédure exhaustive (passes, matrices, forcing-questions, DoD, cas limites, modes d'échec) → `references/demand-signal-procedure.md`.

### Quoi extraire de `market.md`, dans cet ordre (du volume vers la douleur)
1. **Volume d'avis + notes moyennes** — par concurrent puis agrégé. Beaucoup d'avis = marché actif ; très peu = immature **ou** faible switching — dis lequel, ne devine pas.
2. **Plaintes récurrentes** — les *pain themes* partagés par **plusieurs** concurrents + leur **sévérité** (agacement / bloquant / rédhibitoire). Une douleur partagée = problème **structurel** = vraie demande.
3. **Features réclamées** — ce que les clients demandent et n'ont pas. Signal le plus direct.
4. **Signaux de churn** — pourquoi les gens **partent**. Le seul « comportement » observable par proxy.

### Verdict de demande (rubrique déterministe)
| Verdict | Ce qu'il faut voir |
|---|---|
| **Fort** | Volume élevé **et** ≥1 douleur partagée bloquante/rédhibitoire **et** features réclamées convergentes **et** churn documenté. |
| **Moyen** | Marché actif mais douleurs surtout « agacement », **ou** signaux réels mais concentrés sur 1 seul concurrent. |
| **Faible** | Peu d'avis, pas de douleur partagée nette, peu ou pas de features réclamées. |

Formule **humble** : « demande **plausiblement** {forte/moyenne/faible} », preuves à l'appui (quote + source + date).

### Vérif adversariale (obligatoire)
Applique `vendor/startup-skill/startup-competitors/references/verification-agent.md` + `honesty-protocol.md` : **tag chaque source par tier** (avis = **Tier 3** ; un verdict « Fort » ne peut pas reposer sur une seule source Tier 3) ; **écris ce qui confirmerait** (inscriptions, willingness-to-pay, liste d'attente) **et ce qui infirmerait** (avis >18 mois, un seul concurrent, plaintes « nice-to-have ») ; **déclare les trous**.
> Recette détaillée (matrice tier × verdict, triptyque, passe honnêteté, exemple rempli) → `references/adversarial-verification.md`.

## BLOC 2 — Edge
> Procédure exhaustive (machine à états, matrice de tranche, test de défendabilité, forcing-questions, sortie « pas d'edge », DoD, modes d'échec) → `references/edge-procedure.md`.

1. **Reprends l'angle candidat** de `positioning.md` + les **manques concurrents** de `market.md`.
2. **Nomme l'axe** en une phrase orientée client : *le seul {catégorie} qui {différenciateur} pour {niche}*. C'est **ici** qu'on nomme.
3. **Tranche** avec des critères :

| Verdict edge | Critères |
|---|---|
| **Edge réel** | Répond à un manque **partagé** par plusieurs concurrents · **réclamé** dans les avis · **défendable** (pas copiable en un sprint). |
| **Edge faible** | Manque réel mais **isolé** (1 concurrent) **ou** facilement rattrapable. |
| **Pas d'edge** | Aucun manque partagé exploitable. |

4. **Si pas d'edge : dis-le, net.** N'invente rien. Écris que le produit reste **viable à features égales, bien exécuté sur une niche** — et renvoie l'arbitrage « on y va quand même ? » à l'étape 5.

## Clôture d'étape
Mets à jour `.saas-factory/state.md` (verdict demande, verdict edge). Résume en 2 lignes, puis annonce l'**étape 5 (`05-opportunity`)**, qui pèsera demande × edge × marché × risques pour la porte Go / Ajuster / No-Go.
