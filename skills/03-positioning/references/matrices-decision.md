# Matrices de décision — Étape 3 Positionnement

Toutes les décisions condition → action de l'étape, en tables. Quand une situation matche une ligne, applique l'action. Pas d'improvisation.

---

## Mapping artefacts → moteur (Étape 2 de la procédure)

Chaque champ que l'intake du moteur réclame, et d'où le tirer sans re-questionner.

| Champ réclamé par le moteur | Source dans nos artefacts | Action si absent |
|---|---|---|
| Description produit / problème | `idea-brief.md` | Trou réel → demande **une** phrase au founder |
| Alternatives / workarounds actuels | `market.md` (concurrents + statu quo) + `raw/` | Rare : lance wave 1 partielle |
| Meilleurs clients existants | `market.md` (profils best-fit **inférés**) | Non lancé → branche comme **hypothèse**, ne demande pas |
| Concurrents comparés | `market.md` (concurrents nommés) | — (toujours présent après étape 2) |
| Prix / paliers | `market.md` (paysage prix + whitespace) | — |
| Voix client / plaintes / langage | `market.md` (review-mining) + `raw/` | — |
| Catégorie de marché | *souvent absent de market.md* | **Trou réel → wave 2 ciblée** |
| Job émotionnel / social (JTBD) | partiellement dans les avis | **Trou réel → wave 2 ciblée** |

**Règle.** Une case « demande au founder » n'est légitime que si **aucun** artefact ne la couvre. Sinon, branche l'artefact.

---

## Recherche : run ou skip (Étape 3 de la procédure)

| Wave moteur | Couvert par market.md ? | Décision |
|---|---|---|
| **Wave 1A — mapping alternatives** | Oui (concurrents + statu quo + adjacents) | **SKIP** |
| **Wave 1B — customer intelligence / voix client** | Oui (review-mining + `raw/`) | **SKIP** (réutilise) |
| **Wave 2A — catégorie de marché** | Généralement **non** | **RUN ciblé** (3-5 candidats) |
| **Wave 2B — trends & timing** | Non | **RUN léger** — seulement si un trend paraît réel ; sinon « aucun » |

**Garde-fou WebSearch indisponible.** → **Knowledge-Based Mode** : tag `[Knowledge-Based — à vérifier]` sur chaque finding, confiance **−1 cran**, note le mode. Ne fabrique jamais un chiffre.

---

## Type de catégorie à retenir (composant 5)

| Condition observée | Type à choisir | Note |
|---|---|---|
| Un cadre connu rend déjà la valeur lisible, acheteurs cherchent le terme | **Existante** | Défaut. Le plus sûr. |
| Catégorie existante + un qualificatif où on est premier/seul | **Sous-catégorie** | OK si le qualificatif est *vrai* |
| Deux candidats existants à égalité | Celui avec **les preuves les plus fortes** aujourd'hui | Pas le plus « sexy » |
| Rien d'existant ne cadre + preuve écrasante + budget d'éducation | **Création** | Rare, cher, flag obligatoire |
| Tentation de créer une catégorie pour éviter la comparaison | **Refuse → catégorie existante** | Anti-pattern « category-of-one » |

---

## Attribut : unique ou table stakes (composant 2)

| Situation | Verdict | Action |
|---|---|---|
| Aucune alternative ne l'a | **Unique** | Candidat différenciateur |
| 1 concurrent l'a | **Fragile** | Garde comme secondaire, surveille |
| ≥2 concurrents l'ont | **Table stakes** | **Ne compte pas** comme différenciateur |
| Formulé sans fait mesurable (« plus simple ») | **Flou** | Reformule en fait vérifiable ou jette |
| N'existe pas encore (roadmap) | **Aspirationnel** | **Interdit** — on positionne sur ce qu'on EST |

---

## Angle candidat : formaliser ou laisser (Étape 5)

| Manque observé dans market.md | Action à l'étape 3 |
|---|---|
| Partagé par **plusieurs** concurrents + relié à une plainte | **Formalise** en attribut → value theme → Onliness candidate |
| Isolé sur **1** concurrent | Mentionne comme piste **faible**, ne bâtis pas l'angle dessus |
| Souhaité mais **non observé** dans les données | **Ignore** — jamais d'angle inventé |
| Tenté de trancher « edge réel » / « c'est notre edge » | **STOP** — verdict edge = étape 4 |

---

## Frontière anti-doublon (la seule règle)

02 **observe** les manques · 03 **formalise** l'angle candidat (chaîne Dunford jusqu'à l'Onliness candidate) · 04 **tranche** le verdict edge (réel / faible / absent) en reprenant ta phrase et en précisant la niche · 05 **pèse** dans la décision Go/Ajuster/Go-test/No-Go.

Interdit en étape 3 — rien d'autre : le **verdict edge**, le **Go**, l'inférence de demande (étape 4), les taglines/messaging canal (Phase 2).
