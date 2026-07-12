# Référence — Écrire les deux livrables (procédure des étapes 2 & 3)

Deux fichiers, **une seule vérité**, deux missions. Ne les confonds jamais : le brief est **la matière** (aval Phase 2), le résumé est **la décision** (l'humain lit). Le résumé n'est pas une version « adoucie » du brief.

```
opportunity-brief.md      opportunity-summary.md
   (le DÉTAILLÉ)              (le POURQUOI)
   qui le lit : Phase 2      qui le lit : l'HUMAIN, à la porte
   longueur : autant         longueur : 1-2 pages MAX
     qu'il faut, traçable       zéro jargon
   ─────────  MÊME VÉRITÉ, pas deux tons  ─────────
```

**Test de cohérence (obligatoire avant la porte) :** relis les deux. Si le résumé est plus optimiste que le brief, il ment → réaligne. Si le résumé oblige à ouvrir le brief pour trancher, il a raté → réécris-le pour qu'il se suffise.

---

## A. `opportunity-brief.md` — section par section

Template : `assets/templates/opportunity-brief.md`. Labellise **chaque affirmation forte** : `[Data]` (source vérifiable) · `[Estimate]` (calcul assumé) · `[Assumption]` (hypothèse) · `[Opinion]` (ta lecture). Cite la source. Rien de fabriqué.

| Section | Ce qu'on y met | MOU (à bannir) → FORT (viser) |
|---|---|---|
| **Problème** | Repris de l'idea-brief, **resserré** par ce que 02-04 ont confirmé/démenti | « Les PME veulent gagner du temps. » → « [Data] Les cabinets compta <5 pers. perdent ~1 j/mois à relancer les impayés (avis concurrents récurrents). » |
| **Cible** | Persona précis + segment retenu | « Les indépendants. » → « Freelances facturant >10 clients/mois, déjà sur un outil de facturation. » |
| **Marché** | Taille **avec** hypothèse de calcul, segment, dynamique | « Marché de plusieurs millions. » → « [Estimate] ~12 000 cabinets FR × 30€/mois = 4,3 M€/an SAM ; dynamique stagnante — source X. » |
| **Concurrents** | Menace honnête + **ce qu'ils font bien** | « Concurrents faibles. » → tableau : force réelle + faille exploitable + menace High/Med/Low |
| **Demande** | Signal **par proxy**, toujours « plausible » | « Forte demande. » → « [Assumption] Demande *plausible* : 200+ avis réclamant la relance auto sur 3 concurrents. » |
| **Edge** | L'axe différenciant **ou son absence assumée** | « On sera meilleurs. » → « Pas d'edge net → pari exécution + niche cabinets compta (reste viable). » |
| **Risques** | Les **vrais tueurs d'abord** | « Quelques risques classiques. » → « Tueur #1 : incumbent gratuit bundlé dans l'outil compta dominant. » |
| **Pertinence** | Ta lecture argumentée : vaut le coup / pas / à conditions | — |
| **Verdict** | Croise marché × edge × demande × risques + « ce qui le ferait basculer » | cf. `verdict-engine.md` |
| **Flags** | **Ne jamais sauter.** Red / Yellow, ou « No flags identified » | — |

**DoD brief :**
- [ ] Chaque affirmation forte porte un label `[Data]/[Estimate]/[Assumption]/[Opinion]`.
- [ ] Aucun chiffre nu : toute taille a son hypothèse de calcul.
- [ ] Le tableau concurrents dit ce qu'ils font **bien**, pas seulement leurs manques.
- [ ] La demande est « plausible », **jamais** « prouvée ».
- [ ] Les risques sont ordonnés : tueur d'abord.
- [ ] Section Flags présente (même si « No flags identified »).
- [ ] Les tensions de `synthesis-and-confrontation.md` apparaissent, pas dissoutes.

---

## B. `opportunity-summary.md` — le POURQUOI, 1-2 pages

Template : `assets/templates/opportunity-summary.md`. Lisible par un **non-technique qui n'a pas suivi la recherche**. Quatre blocs, dans l'ordre :

1. **Le problème en 1 phrase** — qui souffre, quand, de quoi. Une phrase, pas trois.
2. **Ce qu'on a trouvé** — marché / concurrents / demande **en clair**. Dire la mauvaise nouvelle sans la maquiller. Ex. : « Il existe déjà 5 outils solides, les gens se plaignent surtout du prix, mais personne ne domine. »
3. **Le POURQUOI** — LE CŒUR. *Pourquoi* continuer, ou *pourquoi pas*. Un **raisonnement**, pas un score. Rappelle que le signal est inféré (« à valider par toi »).
4. **Recommandation** — Go / Ajuster / No-Go, une position claire, puis **rends la main** (« à toi de décider »).

### Recette forcing — le bloc « Le POURQUOI »
- **Vise** : un enchaînement causal en 3-5 phrases qui *tient tout seul* (« parce que A, et que B malgré C, alors D »).
- **Push jusqu'à** : quelqu'un qui n'a rien lu comprend la décision **sans** ouvrir le brief.
- **Red flags à refuser** : « intéressant », « ça peut marcher », « prometteur », « à creuser », tout jargon (SAM/TAM, CAC, moat…), tout score chiffré déguisé en raisonnement.
- **MOU** : « Le marché est intéressant, la demande semble présente, ça vaut le coup de tenter. »
- **FORT** : « Le besoin est réel et récurrent, mais cinq outils corrects l'adressent déjà et aucun n'est mauvais. Sans angle net, tu te battrais sur le prix — le pire terrain. Je pencherais No-Go, sauf si tu vises une niche qu'aucun ne sert (les cabinets compta), où l'exécution peut suffire. »

**DoD résumé :**
- [ ] 1-2 pages MAX, zéro jargon.
- [ ] Se suffit : trancher sans ouvrir le brief.
- [ ] Même vérité que le brief (test de cohérence passé), pas plus optimiste.
- [ ] Recommandation nette (Go/Ajuster/No-Go), pas de mot-valise.
- [ ] La main est explicitement rendue à l'utilisateur.

## Modes d'échec de l'écriture
- **Le résumé adouci.** Brief lucide, résumé qui rassure. *Parade :* test de cohérence.
- **Le jargon qui exclut.** Le non-technique décroche. *Parade :* relire à voix haute « comme à un ami hors du métier ».
- **Le chiffre nu.** Une taille sans hypothèse. *Parade :* label `[Estimate]` obligatoire + calcul visible.
- **Le résumé-dépendant.** Il faut ouvrir le brief pour décider. *Parade :* le résumé porte le POURQUOI en entier.
