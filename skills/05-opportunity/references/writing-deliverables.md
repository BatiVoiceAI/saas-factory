# Référence — Écrire le livrable (procédure des étapes 2 & 3)

**UN fichier** (`opportunity-brief.md`), **une seule vérité**, **deux registres** (fusion poids mort §5 — plus d'`opportunity-summary` ni de `confidence` séparés). Ne confonds jamais les deux registres : le bloc **§Décision** est **la décision** (l'humain lit), le reste est **la matière** (aval Phase 2). Le POURQUOI n'est pas une version « adoucie » du détail.

```
                 opportunity-brief.md  (UN fichier)
   ┌──────────────────────────────────────────────────────────┐
   │ §Décision — le POURQUOI      ← qui le lit : l'HUMAIN, à la porte
   │   (en TÊTE, non-technique)      longueur : 1-2 écrans MAX, zéro jargon, auto-suffisant
   │ ─────────────────────────────────────────────────────────
   │ Le détaillé (Problème…Verdict) ← qui le lit : Phase 2
   │   + §Fiabilité du dossier         longueur : autant qu'il faut, traçable
   │   + Annexe Mom-Test
   └──────────────────────────────────────────────────────────┘
           ───────  MÊME VÉRITÉ, deux registres  ───────
```

**Test de cohérence (obligatoire avant la porte) :** relis le bloc §Décision **et** le détaillé. Si le POURQUOI est plus optimiste que le détaillé, il ment → réaligne. Si le POURQUOI oblige à descendre dans le détail pour trancher, il a raté → réécris-le pour qu'il se suffise.

---

## A. Le détaillé de `opportunity-brief.md` — section par section

Template : `assets/templates/opportunity-brief.md` (les sections **sous** le bloc §Décision). Labellise **chaque affirmation forte** : `[Data]` (source vérifiable) · `[Estimate]` (calcul assumé) · `[Assumption]` (hypothèse) · `[Opinion]` (ta lecture). Cite la source (concurrents nommés + prix + verbatim de `market.md`). Rien de fabriqué.

| Section | Ce qu'on y met | MOU (à bannir) → FORT (viser) |
|---|---|---|
| **Problème** | Repris de l'idea-brief, **resserré** par ce que 02-04 ont confirmé/démenti | « Les PME veulent gagner du temps. » → « [Data] Les cabinets compta <5 pers. perdent ~1 j/mois à relancer les impayés (avis concurrents récurrents). » |
| **Cible** | Persona précis + segment retenu | « Les indépendants. » → « Freelances facturant >10 clients/mois, déjà sur un outil de facturation. » |
| **Marché** | Taille **avec** hypothèse de calcul, segment, dynamique — **hérités de `market.md` § « Taille servable & dynamique »** (étape 2), jamais recalculés | « Marché de plusieurs millions. » → « [Estimate] ~12 000 cabinets FR × 30€/mois = 4,3 M€/an SAM ; dynamique stagnante — source X. » |
| **Concurrents** | Menace honnête + **ce qu'ils font bien** | « Concurrents faibles. » → tableau : force réelle + faille exploitable + menace High/Med/Low |
| **Demande** | Signal **par proxy**, toujours « plausible » | « Forte demande. » → « [Assumption] Demande *plausible* : 200+ avis réclamant la relance auto sur 3 concurrents. » |
| **Edge** | L'axe différenciant **ou son absence assumée** | « On sera meilleurs. » → « Pas d'edge net → pari exécution + niche cabinets compta (reste viable). » |
| **Risques** | Les **vrais tueurs d'abord** — énumérés via les 5 familles (`synthesis-and-confrontation.md` § Risques) | « Quelques risques classiques. » → « Tueur #1 : incumbent gratuit bundlé dans l'outil compta dominant. » |
| **Fiabilité du dossier** | Héritée de `market.md` §Fiabilité (ex-`confidence.md`) : confiance globale + data gaps + preuves `[snippet — non vérifié]`. **Plafond du verdict.** | « Recherche solide. » → « [Data] Confiance moyenne : prix Tier 1 mais demande sur Tier 3 mono-plateforme → verdict plafonné. » |
| **Pertinence** | Ta lecture argumentée : vaut le coup / pas / à conditions | — |
| **Verdict** | Croise marché × edge × demande × risques + « ce qui le ferait basculer » | cf. `verdict-engine.md` |
| **Flags** | **Ne jamais sauter.** Red / Yellow, ou « No flags identified » | — |

**DoD détaillé :**
- [ ] Chaque affirmation forte porte un label `[Data]/[Estimate]/[Assumption]/[Opinion]`.
- [ ] Aucun chiffre nu : toute taille a son hypothèse de calcul.
- [ ] Le tableau concurrents **cite les concurrents nommément** (+ prix + preuve) et dit ce qu'ils font **bien**, pas seulement leurs manques.
- [ ] La demande est « plausible », **jamais** « prouvée ».
- [ ] Les risques sont ordonnés : tueur d'abord.
- [ ] **§Fiabilité du dossier** remplie (héritée de `market.md` §Fiabilité) — le verdict est plafonné par elle.
- [ ] Section Flags présente (même si « No flags identified »).
- [ ] Les tensions de `synthesis-and-confrontation.md` apparaissent, pas dissoutes.

---

## B. Le bloc **§Décision — le POURQUOI** (en tête du même fichier)

Template : `assets/templates/opportunity-brief.md`, bloc **§Décision** en tête. Lisible par un **non-technique qui n'a pas suivi la recherche**, **auto-suffisant** (on décide sans descendre dans le détaillé). Quatre parties, dans l'ordre :

1. **Le problème en 1 phrase** — qui souffre, quand, de quoi. Une phrase, pas trois.
2. **Ce qu'on a trouvé** — marché / concurrents / demande **en clair**. Dire la mauvaise nouvelle sans la maquiller. Ex. : « Il existe déjà 5 outils solides, les gens se plaignent surtout du prix, mais personne ne domine. »
3. **Le POURQUOI** — LE CŒUR. *Pourquoi* continuer, ou *pourquoi pas*. Un **raisonnement**, pas un score. Rappelle que le signal est inféré (« à valider par toi »).
4. **Recommandation** — Go / Ajuster / No-Go, une position claire, puis **rends la main** (« à toi de décider »).

### Recette forcing — le bloc « Le POURQUOI »
- **Vise** : un enchaînement causal en 3-5 phrases qui *tient tout seul* (« parce que A, et que B malgré C, alors D »).
- **Push jusqu'à** : quelqu'un qui n'a rien lu comprend la décision **sans** descendre dans le détaillé.
- **Red flags à refuser** : « intéressant », « ça peut marcher », « prometteur », « à creuser », tout jargon (SAM/TAM, CAC, moat…), tout score chiffré déguisé en raisonnement.
- **MOU** : « Le marché est intéressant, la demande semble présente, ça vaut le coup de tenter. »
- **FORT** : « Le besoin est réel et récurrent, mais cinq outils corrects l'adressent déjà et aucun n'est mauvais. Sans angle net, tu te battrais sur le prix — le pire terrain. Je pencherais No-Go, sauf si tu vises une niche qu'aucun ne sert (les cabinets compta), où l'exécution peut suffire. »

### Recette — l'annexe Mom-Test (kit interviews, hors pagination)

Le brief se termine par une annexe : **5 questions dérivées des pain themes** de `demand-signals.md`, pour que « à valider par toi » devienne actionnable dès la sortie de la porte (et pendant la fenêtre d'un éventuel Go-test).

- **Dérivation** : prends les 3 douleurs les plus sévères (bloquant/rédhibitoire d'abord) → une question **au passé** par douleur (« raconte-moi la dernière fois que… », « qu'est-ce que ça t'a coûté ? ») ; + 1 question sur l'**alternative actuelle** ; + 1 question de **comportement** (« qu'as-tu déjà essayé/payé ? »).
- **Interdits (Mom Test)** : pitcher l'idée ; le futur hypothétique (« est-ce que tu utiliserais… ? ») ; compter un compliment comme un signal. On cherche des faits et des comportements passés, pas des opinions.
- L'annexe est **hors pagination** : elle ne compte pas dans le bloc §Décision (POURQUOI).

**DoD §Décision :**
- [ ] 1-2 écrans MAX, zéro jargon.
- [ ] Se suffit : trancher **sans descendre dans le détaillé**.
- [ ] Même vérité que le détaillé (test de cohérence passé), pas plus optimiste.
- [ ] Recommandation nette (Go/Ajuster/Go-test/No-Go), pas de mot-valise.
- [ ] La main est explicitement rendue à l'utilisateur.
- [ ] Annexe Mom-Test : 5 questions dérivées des pain themes, au passé/comportement — aucune question hypothétique, aucun pitch.

## Modes d'échec de l'écriture
- **Le POURQUOI adouci.** Détaillé lucide, §Décision qui rassure. *Parade :* test de cohérence.
- **Le jargon qui exclut.** Le non-technique décroche. *Parade :* relire à voix haute « comme à un ami hors du métier ».
- **Le chiffre nu.** Une taille sans hypothèse. *Parade :* label `[Estimate]` obligatoire + calcul visible.
- **Le POURQUOI-dépendant.** Il faut descendre dans le détaillé pour décider. *Parade :* le bloc §Décision porte le POURQUOI en entier.
