# Checklists, cas limites & modes d'échec

Filet de sécurité de l'étape 2. À passer avant de déclarer la photo marché terminée.

## Definition-of-Done — l'étape 2 est finie quand…

**Garde d'entrée**
- [ ] `research/idea-brief.md` lu ; `type` = **public** (sinon étape sautée)
- [ ] mode de recherche décidé et annoncé : **Live** ou **Knowledge-Based**
- [ ] tier de profondeur retenu (Light/Standard/Deep), inscrit dans `state.md`

**Couverture concurrents**
- [ ] 5-8 directs profilés + 2-3 adjacents
- [ ] **colonne Statu quo** présente (Excel / papier / rien / stagiaire)
- [ ] set de concurrents **validé au checkpoint** par l'utilisateur
- [ ] pour chaque acteur majeur : forces + faiblesses + prix (ou trou déclaré) + position

**Prix**
- [ ] modèle + paliers + **métrique de valeur** relevés par concurrent (ou data gap)
- [ ] **whitespace tarifaire** évalué (dessous/dessus/métrique/segment)

**Review-mining (le plus important pour l'aval)**
- [ ] `raw/review-mining.md` + `raw/forum-mining.md` **écrits et conservés bruts**
- [ ] verbatims + volume d'avis + note moyenne + dates présents
- [ ] carte de langage amorcée ; signaux de churn notés

**Synthèse**
- [ ] chaque **ouverture** est FORT (récurrente + plainte + prix) — les MOU sont en data gaps
- [ ] aucune faiblesse **souhaitée** ; aucune force concurrent minimisée (anti-cheerleading)
- [ ] contradictions entre sources tranchées et justifiées
- [ ] matrice comparative écrite, lignes « personne ne sert bien » surlignées
- [ ] `research/market.md` conforme au template

**Confiance**
- [ ] sources classées Tier 1/2/3
- [ ] score de confiance + confirme/infirme par affirmation structurante
- [ ] **data gaps déclarés** (aucun chiffre inventé pour combler un trou)
- [ ] `research/confidence.md` conforme au template
- [ ] affirmations Tier-3-seul marquées « basse confiance »

**Labels & fraîcheur**
- [ ] chaque affirmation labellisée `[Data]/[Estimate]/[Assumption]/[Opinion]`
- [ ] données > 12 mois flaggées

**Sortie & chaînage**
- [ ] `state.md` mis à jour (étape 2 faite, tier, mode)
- [ ] **résumé 2 lignes** : concentration marché + 1-2 ouvertures les plus nettes
- [ ] étape 3 (`03-positioning`) annoncée
- [ ] **HARD GATE respecté** : aucun positionnement, aucun verdict de demande, aucune décision Go/No-Go produits ici

## Catalogue de cas limites

| Cas | Traitement |
|---|---|
| **Aucun concurrent trouvé** | Vérifie d'abord le vocabulaire (mauvais mots-clés ?). Puis : soit marché naissant (opportunité **et** risque : personne ne valide la demande → note-le fort), soit statu quo = seul « concurrent ». Ne conclus pas « pas de concurrent = super » — c'est souvent un signal de non-demande, à creuser étape 4. |
| **Trop de concurrents (marché saturé)** | Monte le tier, mais profile en priorité les leaders + 2-3 challengers pertinents pour la **cible précise** ; regroupe le reste. Note la saturation comme lecture de concentration. |
| **Un géant domine (marché dominé)** | Dis-le franchement (anti-cheerleading). Cherche l'angle niche/segment mal servi par le géant — mais ne l'invente pas. |
| **Prix « nous contacter » partout** | Data gap prix, pas whitespace. Estime une fourchette `[Estimate]` si des indices existent, sinon déclare le trou. |
| **Peu d'avis (produit/marché jeune)** | Data gap de sentiment déclaré. Baisse la confiance des ouvertures. Signale que l'étape 4 aura peu de matière — l'aval devra en tenir compte. |
| **Avis anciens (>12 mois) uniquement** | Flag « daté » ; une plainte peut avoir été corrigée depuis. Confiance baissée d'un cran. |
| **Concurrent mort/pivoté** | Exclure de la matrice mais **noter** : pourquoi a-t-il échoué/pivoté ? Signal de marché précieux. |
| **WebSearch indisponible** | Knowledge-Based Mode : tout `[Knowledge-Based — à vérifier]`, confiance -1 cran, déclaré à l'utilisateur d'entrée. |
| **Le moteur produit du positionnement / un verdict** | Ne le consolide pas. Conserve la matière, laisse l'étape 3/4/5 trancher (HARD GATE). |
| **L'utilisateur demande la décision « on y va ? » ici** | Recadre : « la photo marché est neutre ; la décision est à l'étape 5, après demande (4) ». |

## Modes d'échec (symptôme → cause → parade)

| Symptôme | Cause probable | Parade |
|---|---|---|
| Résultats de recherche génériques, inexploitables | intake trop flou (catégorie au lieu de niche) | `intake-mapping.md` §Champ manquant : resserre AVANT de relancer |
| `market.md` lit comme une brochure pour l'idée | flagornerie : ouvertures souhaitées, forces concurrents minimisées | `forcing-questions.md` §Ouverture : ne garder que le FORT ; réécrire les forces honnêtement |
| Ouvertures nombreuses mais aucune reliée à une plainte | synthèse a empilé au lieu de relier | re-synthétise : manque ↔ verbatim ↔ prix, sinon → data gap |
| L'étape 4 doit re-scraper les avis | review/forum-mining résumés destructivement ou non conservés | garder `raw/*` bruts avec verbatims/volumes (`output-mapping.md`) |
| Affirmations structurantes sur du seul Tier 3 | pas de cross-référencement | vérif : marquer basse confiance, lister ce qui confirmerait ; pause si critique |
| Statu quo absent de la matrice | oublié comme « pas un vrai concurrent » | toujours l'ajouter — c'est le concurrent n°1 (`decision-matrices.md` §Inclusion) |
| Chiffres précis mais non sourcés | fabrication pour « faire complet » | remplacer par data gap ou fourchette `[Estimate]` sourcée |
| Étape déclenchée pour un outil perso/interne | routage ignoré | vérifier `type` en P0 ; sauter si ≠ public |
| Boucle de recherche qui n'en finit pas | pas de budget d'itération | respecter le tier ; à épuisement, présenter l'état et trancher (safety-rails §7) |

## Rappel des principes qui priment (source de vérité ailleurs)

- **Déterminisme** : suis la procédure du moteur telle quelle, ne réinvente pas la recherche (`conventions.md`).
- **Vérification adversariale** sur toute sortie (`lessons.md` §6).
- **Signal par proxy → verdict humble** : la demande s'infère des avis, jamais « prouvée » ici (`conventions.md`).
- **Anti-flagornerie** : si un concurrent est meilleur, dis-le (`honesty-protocol.md`).
- **Budget de boucle** : toute recherche a un plafond et un critère de sortie (`safety-rails.md` §7).
