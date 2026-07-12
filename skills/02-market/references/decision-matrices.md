# Matrices de décision — condition → action

Toutes les décisions tranchées de l'étape 2, sous forme **condition → action**. À consulter dès qu'un choix se présente : pas d'impro, un chemin déterministe.

---

## §Routage — que fait-on selon le `type` du brief

| `type` (idea-brief) | Étape 2 (marché) | Action |
|---|---|---|
| **public** | **exécutée** en entier | continue la procédure |
| **interne entreprise** | **sautée** | pas de marché public ; dis-le, passe la main (le fit outils/sécurité est ailleurs), route vers étape 5 |
| **perso** | **sautée** | dis « outil perso → pas de marché », passe directement vers l'aval allégé |
| absent / ambigu | — | STOP : renvoie à l'étape 1 pour fixer le type |

> Cette étape ne s'auto-déclenche que pour `public`. Ne « fais pas quand même » un teardown pour un outil perso : c'est du travail jeté.

---

## §Profondeur — calibrer le tier de recherche

Score chaque axe 1-3, somme = tier.

| Axe | 1 point | 2 points | 3 points |
|---|---|---|---|
| **Largeur de marché** | niche étroite, 1 usage | segment moyen | marché large / transverse |
| **Concurrents connus** | 0-2 | 3-6 | 7+ ou inconnu-mais-dense |
| **Portée géo** | 1 pays / 1 langue | 2-3 pays ou EU | multi-régions / mondial |

| Somme | Tier | Effort moteur |
|---|---|---|
| 3-4 | **Light** | moins d'agents/rounds par vague |
| 5-7 | **Standard** | config par défaut |
| 8-9 | **Deep** | plus d'agents/rounds, recherche étendue |

**Défaut = accepte la reco.** Override seulement si un signal contredit le score (ex. brief niche mais concurrents géants connus → monte d'un cran). Présente en 1 ligne, laisse l'utilisateur dire *light / deep / ok*.

---

## §Inclusion d'un concurrent — direct, adjacent, ou hors-scope

Pour chaque acteur candidat :

| Condition | Classement | Action |
|---|---|---|
| Résout le **même problème** pour la **même cible** | **Direct** | profile en priorité (viser 5-8) |
| Plateforme plus large qui **absorbe le budget**, ou outil d'une catégorie **voisine** utilisé « good enough » | **Adjacent** | inclus (viser 2-3) — les clients arbitrent contre ça |
| Ce que la cible fait **aujourd'hui sans outil** (Excel, papier, rien, un stagiaire) | **Statu quo** | **toujours** inclure comme colonne — c'est le vrai concurrent à battre |
| Même mot-clé mais **autre cible / autre job** | Hors-scope | exclure, mais **noter** l'exclusion (data gap si doute) |
| Mort / abandonné / plus commercialisé | Hors-scope | exclure, noter (utile : pourquoi a-t-il échoué ?) |

**Piège :** ignorer le statu quo parce qu'il n'a « pas de site ». Le concurrent n°1 d'un SaaS est souvent « rien / Excel ». Sans cette colonne, la matrice ment.

---

## §Détection du whitespace tarifaire

| Observation dans le paysage prix | Whitespace ? | Note |
|---|---|---|
| Tous groupés sur un même palier (ex. 30-50 $/mois) | OUI, en dessous ET au-dessus | positions candidates : entrée low-cost, premium |
| Modèle unique partout (ex. tous par siège) | OUI, sur la **métrique** | métrique alternative (à l'usage, forfait) = ouverture |
| Un palier « entreprise » toujours « nous contacter » | Trou d'info, pas whitespace | **data gap** (prix non public), pas une ouverture |
| Un segment (ex. solo/TPE) sans offre adaptée | OUI, segment | ouverture — relier à une plainte pour confirmer |

> Whitespace ≠ ouverture prouvée. Un trou tarifaire n'est une ouverture que **relié à une plainte** (W2) et un besoin de la cible. Sinon → simple observation.

---

## §Faiblesse → ouverture (le filtre anti-invention)

| La faiblesse concurrent est… | Retenir comme ouverture ? |
|---|---|
| citée dans **plusieurs avis** (W2) **et** partagée par **plusieurs concurrents** | OUI — ouverture forte, reliée plainte+prix |
| citée dans quelques avis mais **isolée** à un concurrent | Faible — noter, ne pas surinterpréter |
| **déduite** par toi (« ils pourraient rater X ») sans trace dans les données | NON — c'est une hypothèse, → data gap |
| **souhaitée** (« ce serait bien qu'il manque X ») | NON, jamais — anti-pattern flagornerie |

Recette détaillée MOU-vs-FORT : `forcing-questions.md` §Ouverture.

---

## §Contradiction entre sources — laquelle croire

| Situation | Règle |
|---|---|
| Tier 1 (officiel) vs Tier 3 (forum) se contredisent | croire **Tier 1**, noter la divergence |
| Deux Tier 2 se contredisent | chercher un Tier 1 arbitre ; sinon → data gap + « fourchette » |
| Une seule source, citée deux fois (repost) | **une** source, pas deux — pas de fausse corroboration |
| Donnée > 12 mois | flag « daté » ; baisse la confiance d'un cran |
| Aucune source fiable | **data gap déclaré** — jamais un chiffre inventé |

---

## §Découpage inter-étapes — ce qui sort du moteur mais N'EST PAS notre livrable

Le moteur produit plus que notre tranche. Redirige, ne conclus pas :

| Sortie native du moteur | Chez nous, à l'étape 2 |
|---|---|
| Profils, prix, matrice comparative | **GARDER** → `market.md` |
| Review-mining / forum-mining brut | **GARDER en `raw/`** → réutilisé étape 4 |
| Vérif adversariale / tiers | **GARDER** → `market.md` §Fiabilité & confiance |
| Battle-cards par concurrent | **IGNORER** ici (pas notre livrable) |
| Positionnement / catégorie / alternatives (Dunford) | **NE PAS produire** → c'est l'**étape 3** |
| Verdict de demande, edge concurrentiel formalisé | **NE PAS produire** → c'est l'**étape 4** |
| Décision Go/No-Go | **NE PAS produire** → c'est l'**étape 5** |
| Cartes GTM opérationnelles, plan SEO fin | IGNORER (Phases 5-6) |
| Produit / brand / financials | IGNORER (Phase 2 aval) |

**Règle d'or du HARD GATE :** si une sortie du moteur ressemble à une conclusion sur *comment se positionner*, *si la demande existe*, ou *faut-il y aller* → tu ne l'écris pas ici. Tu conserves la matière brute et tu laisses l'étape concernée trancher.
