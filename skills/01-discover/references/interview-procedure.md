# Référence — Procédure d'entretien (machine à états)

La conduite exacte de la Découverte, étape par étape. Le SKILL.md donne l'aperçu ; ici, la sous-procédure exhaustive de chaque cran : **quoi faire · dans quel ordre · critère de passage avant de monter d'un cran**. Rien n'est improvisé.

## Sommaire

- Invariant
- Machine à états
- Sous-procédures (par état)
- Data-flow (ce que la Découverte alimente en aval)
- Règle des questions

## Invariant
L'entretien a un **état courant**. Il ne **monte** d'un cran qu'une fois le **critère de passage** de l'état atteint. Il peut **retomber** (l'utilisateur se contredit, on découvre un manque) — dans ce cas on re-questionne le point, on ne fabrique jamais la réponse. Un champ sans réponse ferme = « à préciser », jamais inventé.

## Machine à états
```
 [S0 ACCUEIL]
     │  question ouverte posée, l'utilisateur a parlé
     ▼
 [S1 REFORMULATION] ──non validé──┐
     │  reformulation confirmée    │ (re-formule avec ses mots à lui)
     ▼                             │
 [S2 TYPE/ROUTE] ◀────────────────┘
     │  type tranché + route écrite + impact annoncé
     ▼
 [S3 PROBLÈME] ──flou (abstrait)──┐
     │  qui + quand + conséquence  │ push-until (forcing-questions.md §2)
     ▼                             │
 [S4 CIBLE] ◀─────────────────────┘
     │  persona précis (métier + volume)  ──catégorie── push-until (§3)
     ▼
 [S5 ALTERNATIVE] → note les concurrents nommés (input étape 2)
     │
     ▼
 [S6 ÉCOSYSTÈME] → secteur · géo/langue · réglementaire · intégrations
     │
     ▼
 [S7 SIGNAL] (léger) → [S8 CONTRAINTES] → [S9 NON-GOALS (opt.)]
     │
     ▼
 [S10 DÉDUCTIONS] stade + archétype + tenancy + locale (déduits, pas re-demandés si l'amont suffit)
     │
     ▼
 [S11 ÉCRITURE idea-brief]
     │
     ▼
 [S12 PORTE DE SORTIE] récap + Critère de KILL pré-rempli + confirmation → state.md → étape 2 (ou route)
```

## Sous-procédures (par état)

### S0 — Accueil + question ouverte
- **Fais** : une seule question ouverte (« Qu'est-ce que tu veux créer ? Décris l'idée et le problème, avec tes mots. »). Puis **écoute** — ne meuble pas, ne propose rien.
- **But** : capter les **mots exacts** de l'utilisateur (ils serviront à tout l'aval et à `office-hours`).
- **Passage** : l'utilisateur a livré une description brute, même désordonnée.

### S1 — Reformulation + validation
- **Fais** : reformule l'idée en **2 lignes**, avec SON vocabulaire, et **fais valider explicitement**.
- **Interdit** : reformuler en y injectant une solution ou une techno (« donc une app mobile qui… ») — tu cadres, tu ne résous pas.
- **Passage** : « oui, c'est ça » (ou correction intégrée puis re-validée). Tant que non validé, **ne monte pas** : tout le reste reposerait sur du sable.

### S2 — Type / destination (l'aiguilleur — voir decision-matrices.md §1)
- **Fais** : pose le type via `AskUserQuestion` (public / interne entreprise / perso), **explique l'impact de chaque choix** (étapes faites ou sautées), puis écris `type` **et** `route` dans le brief.
- **Pourquoi ici** : c'est ce que l'orchestrateur relira pour router — le poser tôt évite de dérouler des questions inutiles (un `perso` n'a pas besoin d'un teardown marché).
- **Passage** : type tranché + route écrite + impact annoncé à voix haute.

### S3 — Problème & douleur (forcing — forcing-questions.md §2)
- **Fais** : applique le patron de spécificité, colonne Problème. Cherche un **qui + quand + conséquence**.
- **Passage** : les trois composants présents. **Rejette** l'abstrait (« gagner du temps ») → push-until.

### S4 — Cible (forcing — forcing-questions.md §3)
- **Fais** : patron de spécificité, colonne Cible. Un métier/segment **précis + volume**.
- **Passage** : persona nommé (« le plombier solo, ~5 devis/semaine »). Une réponse-catégorie (« les artisans ») se re-questionne.

### S5 — Alternative actuelle
- **Fais** : « Comment font-ils **aujourd'hui**, sans ton outil ? » (Excel, papier, concurrent, rien).
- **Extrait critique** : **note tout outil/concurrent nommé** — ce sont les « concurrents nommés » que l'étape 2 branchera sur sa recherche. Data-flow : `S5 → research/market.md`.
- **Passage** : au moins une alternative identifiée (« rien » est une réponse valide et forte).

### S6 — Écosystème métier
- **Fais** : secteur · pays/langue · réglementaire (RGPD, données sensibles) · **intégrations attendues** (WhatsApp, email, ERP, logiciel métier).
- **Pourquoi** : les intégrations cadrent la faisabilité **avant** le build ; le réglementaire remonte tôt (pas de surprise en Phase 3).
- **Passage** : les 4 sous-champs remplis ou marqués « rien de particulier ».

### S7 — Signal préliminaire (léger ici)
- **Fais** : « As-tu des **signes** que des gens en veulent (plaintes, recherches, paient déjà pour un proche) ? »
- **Garde-fou** : **interest ≠ demand**. On **note**, on ne sur-interprète pas. Le creusé réel = étape 4.
- **Passage** : signal noté, ou « aucun à ce stade » (réponse valide).

### S8 — Contraintes
- **Fais** : « Des contraintes à connaître dès maintenant ? Budget, données sensibles, technique, légal. »
- **Passage** : contraintes listées ou « aucune connue ».

### S9 — Non-goals (optionnel)
- **Fais** : « Qu'est-ce que ça **ne fera pas**, au moins en v1 ? » Si l'utilisateur ne sait pas, **déduis** 1-2 non-goals raisonnables et marque-les « déduit, à confirmer ».
- **Passage** : au moins tenté ; cadre le scope dès le départ.

### S10 — Déductions (stade + archétype + tenancy + locale)
- **Fais** : déduis le **stade** (decision-matrices.md §2) et les **trois axes orthogonaux** du modèle (`_shared/state-schema.md` §modèle 3 axes) à partir de ce qui a déjà été dit. **Ne re-demande pas** si l'amont suffit — déduis et **fais confirmer d'un mot** si ambigu.
  - **`archetype`** (§3) : `web-saas` | `landing` | `automation` — verrouille le socle de complétude **conditionné par archétype** (web-saas S1-S8 / landing LP1-LP4 / automation AU1-AU5).
  - **`tenancy`** : `single` par défaut ; `multi-org` si le cadrage est B2B (plusieurs clients/espaces isolés, RLS par org). L'axe `type` (public/interne/perso), lui, est déjà tranché en S2.
  - **`locale`** : déjà captée via l'écosystème S6 (géo/langue) — la **confirmer** ici (code BCP-47 + `dir` + `jurisdiction`), défaut = langue parlée par l'utilisateur, distincte de la langue de travail du plugin.
- **Passage** : stade + archétype + tenancy posés (locale confirmée), avec note d'incertitude si doute.

### S11 — Écriture de l'idea-brief
- **Fais** : écris `research/idea-brief.md` selon `assets/templates/idea-brief.md`, tous champs remplis ou marqués « à préciser ». Jamais de secret/clé.
- **Passage** : voir `definition-of-done.md` (checklist complète avant la porte).

### S12 — Porte de sortie
- **Fais d'abord (pré-enregistrement du KILL — `public`/`interne` uniquement)** : le Critère de KILL valide un **marché** ; il ne s'applique donc **qu'aux types `public`/`interne`**. Pour un usage **`perso`** (l'utilisateur construit pour lui-même, pas de marché à abandonner), **saute** cette question et marque la section « **sans objet (perso)** ». Sinon, pose la question « **Qu'est-ce qui te ferait abandonner ce projet ?** » — un signal concret, pas un ressenti (« si personne ne s'inscrit en X semaines », « si la cible n'a pas ce budget », « si l'intégration Y est impossible »). Note la réponse **avec ses mots** dans le brief, section « Critère de KILL (pré-rempli) ». Pourquoi maintenant : posé **avant** d'avoir vu le moindre chiffre, ce critère ne pourra pas être déplacé après coup — 17-deploy le convertira en critère mesurable (métrique live + seuil + fenêtre) et 19-retro le confrontera aux chiffres réels.
- **Fais ensuite** : récap (reformulation + type/route + cible + problème) + **demande confirmation** (`AskUserQuestion`). Puis mets à jour `.saas-factory/state.md`.
- **Passage** : Critère de KILL noté (ou « à préciser » assumé) **pour `public`/`interne`** — **sans objet** en `perso` — + décision explicite reçue. **Ne franchis jamais sans réponse.**

## Data-flow (ce que la Découverte alimente en aval)
```
 idée brute
   │
   ▼
 idea-brief.md ──┬─→ 02-market   : produit + problème + cible + concurrents nommés (S5)
                 ├─→ 03-positioning : cible + alternative
                 ├─→ 04-demand-edge : qui + quand (ancre du signal)
                 └─→ office-hours (gstack) : problème + cible + douleur + alternative + stade + contraintes
 type/route ─────→ .saas-factory/state.md → orchestrateur (aiguillage des étapes)
```
> Les consommateurs **02 · 03 · 04** ne sont sollicités que **selon la route** (`public` : les trois ; `interne`/`perso` : une partie est sautée — voir `decision-matrices.md §1`). `office-hours` et `state.md` valent pour **toute route**.

Objectif de chaînage : l'aval **challenge et approfondit**, il ne **re-demande pas** les bases.

## Règle des questions
Conduite transverse à **chaque** cran ci-dessus — une question à la fois (`AskUserQuestion`) · chaque question pédagogique · ne poser que ce qui manque (saute et dis-le) · pousser la spécificité sur problème/cible. Détail : *Principe des questions* dans `SKILL.md`.
