# BLOC 2 — Edge · procédure exhaustive

Réf. de profondeur pour l'étape 4. Principe qui gouverne tout ce bloc : **edge = bonus, jamais inventé.** Trouvé → on le nomme. Pas trouvé → on le dit franchement. Un produit à features égales, **bien exécuté sur une niche**, reste viable. Gonfler un edge inexistant envoie construire sur du vide.

**Rappel HARD GATE (anti-doublon).** L'étape 3 a livré l'angle candidat (Onliness candidate comprise) : tu le reprends, tu précises la niche, et **tu tranches — le verdict edge t'appartient**. Toi tu **produis** le verdict · l'étape 5 le **pèse** dans la décision. Ne décide **pas** Go ici.

---

## Sommaire

- 0. Machine à états du bloc
- 1. Sous-procédure pas-à-pas
- 2. Matrice de tranche (verdict edge)
- 3. « Pas d'edge » : la sortie honnête (non négociable)
- 4. Forcing-questions du bloc edge
- 5. Definition-of-Done du bloc 2
- 6. Catalogue de cas limites
- 7. Modes d'échec (et parade)

## 0. Machine à états du bloc

```
                       ┌────────────────────────────────────────┐
positioning.md ──▶ [REPRENDRE ANGLE] ──▶ [CROISER MANQUES] ──▶ [NOMMER L'AXE]
market.md (manques) ──────────┘                 │                     │
                                                 ▼                     ▼
                                          manque partagé ?      phrase orientée client
                                                 │                     │
                            ┌────────────────────┼─────────────────────┘
                            ▼                     ▼
                     [TRANCHER via critères §2]
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                    ▼
   EDGE RÉEL           EDGE FAIBLE          PAS D'EDGE
   (nomme + défends)   (nomme + averti)     (dis-le net → étape 5)
```

Le flux est **séquentiel** : on ne nomme pas un edge avant d'avoir vérifié qu'un manque **partagé** existe. Nommer d'abord, chercher la preuve ensuite = fabrication d'edge.

---

## 1. Sous-procédure pas-à-pas

### Étape 1.1 — Reprendre l'angle candidat
- **Source** : `positioning.md` (l'angle formalisé à l'étape 3).
- **Quoi faire** : extrais l'angle en une phrase telle qu'il est écrit. **Ne le ré-invente pas** — l'étape 3 l'a formalisé, ton job est de le tester contre le marché, pas de le refaire.
- **Critère de passage** : tu peux citer l'angle candidat verbatim.

### Étape 1.2 — Croiser avec les manques concurrents
- **Source** : `market.md` — les **§Dossiers concurrents détaillés** (forces/faiblesses réelles, features, position) + **§Matrice comparative** + **§Carte de langage** (verbatims) + **§Prix**. C'est le **paysage RÉEL détaillé** de l'étape 2 : l'edge se juge contre lui, pas contre une image floue de la concurrence.
- **Quoi faire** : liste les manques (features absentes, douleurs non résolues, segments mal servis) et marque chacun **partagé** (≥2 concurrents) ou **isolé** (1 concurrent). **Recoupe chaque manque candidat avec le dossier détaillé du concurrent** : un manque qu'un dossier dément (le concurrent le couvre en fait) n'est pas un manque.
- **Croisement** : l'angle candidat tombe-t-il sur un manque **partagé** ? C'est la question qui décide tout.
- **Critère de passage** : chaque manque porte une preuve (quote/matrice) + son marquage partagé/isolé.

### Étape 1.3 — Formuler l'axe
- **Format imposé** (orienté client, une phrase) :
  > « **le seul {catégorie} qui {différenciateur} pour {niche}** »
- Pars de la **phrase Onliness candidate de l'étape 3** : ajoute/précise la **niche** — c'est la même phrase, menée au bout, pas une réinvention.
- **Test de la phrase** : si tu peux remplacer le nom d'un concurrent dans « le seul … » sans que ce soit faux, l'axe n'est **pas** différenciant → ce n'est pas un edge.
- Si aucun axe ne tient → écris explicitement « **pas d'edge clair** » et saute à §3.

### Étape 1.4 — Trancher
Applique la table de critères (§2). Puis, selon le verdict, la sortie (§2 + §3).

---

## 2. Matrice de tranche (verdict edge)

**Source unique** des critères (le SKILL.md n'en porte que les libellés + le renvoi ici).

| Verdict edge | Les **trois** critères |
|---|---|
| **Edge réel** | ① Répond à un manque **partagé** (≥2 concurrents) · ② **réclamé** dans les avis (pas seulement déduit) · ③ **défendable** (pas copiable en un sprint). |
| **Edge faible** | Manque réel mais **isolé** (1 concurrent) **OU** facilement rattrapable (copiable vite). |
| **Pas d'edge** | Aucun manque partagé exploitable. |

### Matrice condition → verdict (départage fin)

| Manque | Réclamé dans les avis ? | Défendable (non copiable en 1 sprint) ? | → Verdict |
|---|---|---|---|
| Partagé (≥2) | Oui | Oui | **Edge réel** |
| Partagé (≥2) | Oui | Non (copiable) | **Edge faible** (rattrapable) |
| Partagé (≥2) | Non (seulement déduit) | Oui | **Edge faible** (demande non prouvée) |
| Isolé (1) | Oui | Oui | **Edge faible** (isolé) |
| Isolé (1) | — | — | **Edge faible** |
| Aucun | — | — | **Pas d'edge** |

### Le test de défendabilité (critère ③, souvent bâclé)
Pose 3 questions ; un « non » suffit à casser la défendabilité :
1. **Sprint-test** : un concurrent bien financé peut-il le copier en un sprint (~2 semaines) ? Si oui → pas défendable.
2. **Structurel vs. feature** : l'edge tient-il à quelque chose de structurel (données propriétaires, intégration profonde, focus niche extrême, distribution) ou à une simple feature ? Une feature seule = faiblement défendable.
3. **Pourquoi maintenant / pourquoi pas eux** : pourquoi les incumbents ne l'ont-ils pas déjà fait ? Si la réponse est « ils le feront dès qu'ils le voient » → pas défendable.

---

## 3. « Pas d'edge » : la sortie honnête (non négociable)

Si le verdict est **Pas d'edge** :
1. **Dis-le, net.** N'invente rien, ne maquille pas un manque isolé en avantage.
2. Écris que le produit reste **viable à features égales, bien exécuté sur une niche** — c'est un chemin légitime, pas un échec.
3. **Renvoie l'arbitrage** « on y va quand même ? » à l'**étape 5** (`05-opportunity`). Tu ne décides pas Go ici.

> Micro-exemple de bonne sortie « pas d'edge » :
> « Pas d'edge défendable : aucun manque n'est partagé par ≥2 concurrents. Les 3 acteurs couvrent les mêmes features. Le produit reste viable comme *meilleure exécution sur la niche {kinés libéraux}* (support FR, onboarding 5 min) — mais c'est de l'exécution, pas un moat. Arbitrage Go/No-Go → étape 5. »

---

## 4. Forcing-questions du bloc edge

Recette : **Ask exact / Push-until / Red-flags / MOU-vs-FORT**.

### FQ-1 — « Est-ce un vrai edge ou une feature de plus ? »
- **Ask exact** : « Cet axe répond-il à un manque *partagé et réclamé*, ou est-ce juste une case cochée en plus ? »
- **Push-until** : jusqu'à valider les 3 critères (partagé / réclamé / défendable) avec preuve pour chacun.
- **Red-flags** : « on fera mieux/plus joli/plus simple » sans manque documenté ; edge = « meilleure UX » sans quote de douleur UX.
- **MOU** : « Notre edge, c'est une meilleure expérience utilisateur. »
- **FORT** : « Le seul {logiciel de devis} qui gère le multi-devise nativement — réclamé dans 9 avis chez 2 concurrents, absent des deux, et défendable car adossé à notre moteur de taux. »

### FQ-2 — « Défendable combien de temps ? »
- **Ask exact** : « Combien de temps avant qu'un incumbent copie ça ? »
- **Push-until** : jusqu'à passer le test de défendabilité (§2, 3 questions).
- **Red-flags** : edge = une intégration API publique que n'importe qui branche ; edge = un prix plus bas (pas un edge, une érosion de marge).
- **MOU** : « C'est difficile à copier. »
- **FORT** : « Copiable en ~1 sprint (simple export) → je classe *edge faible, rattrapable*, pas edge réel. »

### FQ-3 — « Suis-je en train d'inventer un edge parce que j'en veux un ? »
- **Ask exact** : « Si je retire mes espoirs, reste-t-il une preuve de manque partagé ? »
- **Push-until** : jusqu'à pointer la quote/matrice précise, ou à écrire « pas d'edge ».
- **Red-flags** : manque « déduit » sans qu'aucun client ne l'ait réclamé ; extrapolation d'un seul avis.
- **MOU** : « Il doit bien y avoir un angle, cherchons-le. »
- **FORT** : « Après croisement, aucun manque partagé. Verdict honnête : pas d'edge. Viabilité par l'exécution niche → étape 5. »

---

## 5. Definition-of-Done du bloc 2

- [ ] Angle candidat repris **verbatim** de `positioning.md`.
- [ ] Manques concurrents listés, chacun marqué partagé/isolé + preuve.
- [ ] Axe nommé au format « le seul {catégorie} qui {différenciateur} pour {niche} » (ou « pas d'edge clair » assumé).
- [ ] Phrase passée au test « remplace le concurrent » (différenciant réel).
- [ ] Test de défendabilité appliqué (3 questions).
- [ ] Verdict posé via la matrice §2, justifié par la défendabilité.
- [ ] Si « pas d'edge » : sortie honnête + viabilité niche + arbitrage renvoyé à l'étape 5.
- [ ] Aucun edge affirmé sans preuve de manque partagé **et** réclamé.

---

## 6. Catalogue de cas limites

| Cas | Traitement |
|---|---|
| **Angle candidat ≠ aucun manque observé** | L'angle de l'étape 3 ne s'appuie sur rien de marché → edge faible/pas d'edge ; signale la tension à porter à l'étape 5. |
| **Manque partagé mais jamais réclamé** | Défendable mais demande non prouvée → **edge faible** (§2), red flag « manque déduit ». |
| **Edge = prix plus bas** | Ce n'est pas un edge défensif → refuse-le comme edge, note-le comme pari GTM pour l'étape 5. |
| **Edge = « meilleure UX » global** | Trop vague → exige un manque UX précis, réclamé et daté, sinon dégrade. |
| **Plusieurs edges candidats** | Retiens **le plus défendable**, note les autres en second rang ; ne gonfle pas la liste. |
| **Manque déjà comblé par un entrant récent** | L'espace se ferme → edge faible/nul + note la fenêtre temporelle. |
| **`positioning.md` absent/vide** | Ne fabrique pas l'angle. Stoppe, renvoie à l'étape 3 (repli honnête). |

---

## 7. Modes d'échec (et parade)

| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Edge inventé** | Axe nommé sans manque partagé derrière. | FQ-3 + règle « pas de preuve → pas d'edge ». |
| **Feature prise pour un moat** | « Notre edge = feature X. » | Test de défendabilité (§2) : feature seule = faiblement défendable. |
| **UX-hand-waving** | « Meilleure expérience » sans quote. | Exiger un manque UX précis, réclamé, daté. |
| **Prix confondu avec edge** | « On sera moins cher. » | Reclasser en pari GTM, pas en edge. |
| **Doublon avec l'étape 3** | Refaire la synthèse Dunford au lieu de trancher. | Reprends la phrase Onliness candidate de 03 telle quelle, précise la niche, **tranche** — la synthèse est déjà faite. |
| **Décision Go anticipée** | Conclure « on y va ». | Interdit ici. Arbitrage → étape 5. |
| **Refus de dire « pas d'edge »** | Maquiller un manque isolé en avantage. | §3 : la sortie « pas d'edge » est une issue légitime, écris-la net. |
