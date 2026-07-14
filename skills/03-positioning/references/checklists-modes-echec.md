# Checklists & modes d'échec — Étape 3 Positionnement

Definition-of-done, catalogue de cas limites, modes d'échec + parade, et hand-off. À passer avant de clôturer l'étape.

---

## Definition-of-Done (DoD) — cocher avant clôture

**Cadre & données**
- [ ] Moteur lu dans l'ordre (SKILL → frameworks → research-synthesis → honesty-protocol) avant toute synthèse.
- [ ] `idea-brief.md` **et** `market.md` (+ `raw/`) lus et branchés ; annonce « données session précédente » faite.
- [ ] Intake moteur **non** ré-ouvert sur des champs déjà couverts par les artefacts.
- [ ] Recherche lancée **uniquement** sur les trous réels (catégorie / JTBD) ; wave 1 skippée.

**Synthèse Dunford 5+1**
- [ ] Les 6 composants remplis **dans l'ordre** (alternatives d'abord, catégorie ensuite).
- [ ] Alternatives incluent directs **+ adjacents + statu quo/rien** (pas que les directs).
- [ ] ⏸ Pause founder sur les attributs faite et tracée.
- [ ] Aucun attribut « unique » partagé par ≥2 concurrents (filtre table stakes appliqué).
- [ ] Aucun attribut aspirationnel (roadmap) traité comme différenciateur.
- [ ] Value themes en langage client (mots de market.md), 2-3 thèmes max.
- [ ] Best-fit défini par **caractéristiques**, pas démographie.
- [ ] Catégorie : 3-5 candidats, 1 recommandée, type précisé, défaut existante respecté.
- [ ] Trend = réel ou explicitement « aucun ».

**Validation & honnêteté**
- [ ] Onliness basique convaincant ; Moore sans champ vague ; Ladder ≤10 mots — les 3 passent (sinon itéré).
- [ ] Confiance (Haute/Moyenne/Basse) sur chaque claim majeur ; avis = **Tier 3**, jamais seule source d'un « Haute ».
- [ ] Red flags / Yellow flags / Sources présents.

**Frontière & sortie**
- [ ] Angle candidat formalisé (jusqu'à l'Onliness candidate incluse) — **sans verdict edge, sans Go**.
- [ ] La ligne « Angle candidat — verdict edge = étape 4 » figure dans le fichier.
- [ ] **Un seul** fichier écrit : `research/positioning.md` (pas les 5 livrables épars du moteur).
- [ ] Aucun secret / clé dans le fichier.
- [ ] `.saas-factory/state.md` mis à jour (étape 3 faite, catégorie, angle candidat).

---

## Catalogue de cas limites (condition → conduite)

| Cas limite | Conduite |
|---|---|
| `market.md` absent ou vide | **Stop.** Renvoie à l'étape 2 ; ne fabrique pas de marché. |
| Produit non lancé, zéro client réel | Best-fit = **hypothèse** inférée des avis concurrents, marquée comme telle. |
| Un seul concurrent identifié à l'étape 2 | Alternatives faibles → appuie fort sur **statu quo / manuel / rien** comme ancres. |
| Aucun manque partagé dans market.md | Angle candidat = « aucun angle net » ; produit viable à features égales sur niche (dis-le), l'étape 4 tranchera. |
| WebSearch refusé / indisponible | Knowledge-Based Mode : tags + confiance −1 ; note le mode. |
| Founder pousse un edge « génial » non observé | Refuse d'inventer ; note « hypothèse founder à valider », ne bâtis pas l'angle dessus. |
| Type = **interne entreprise** (routage étape 1) | **Étape 03 SAUTÉE** (pas « allégée ») — `skills/saas-factory/references/routing.md` tranche : interne → 03 sautée, le fit outils/process passe par le lite-mode de 05. Ne pas exécuter. |
| Type = **perso** | Étape sautée (voir routage conventions) — ne pas exécuter. |
| Chiffres de market.md > 12-18 mois | Confiance **Basse** + Yellow flag « données datées ». |
| Deux catégories à égalité stricte | Règle « preuves les plus fortes aujourd'hui » ; à défaut, la plus **cherchable**. |
| Onliness ne passe jamais après 2 itérations | Écris « différenciateur faible » honnêtement ; ne force pas un « only ». L'étape 4 tranchera « pas d'edge ». |

---

## Modes d'échec + parade

| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Positionnement générique** | « Solution moderne et simple pour les PME » | Ordre Dunford imposé + filtre table stakes + spécificité best-fit |
| **Se comparer à soi-même** | Alternatives = seulement les directs | Ancre = ce que le client ferait *sans* toi ; statu quo obligatoire |
| **Category creation gratuite** | Catégorie inventée non cherchable | Défaut existante ; flag risque ; « le client peut-il la Googler ? » |
| **Flagornerie** | Tout attribut validé sans challenge | Filtre « ≥2 concurrents l'ont = table stakes » |
| **Positionnement aspirationnel** | « Nous serons le… » | On positionne sur ce qu'on EST ; roadmap hors scope |
| **Débordement sur l'edge** | « Edge réel, on fonce » | La règle unique : verdict edge = étape 4 (forcing-questions §4) |
| **Dérive documentaire** | Chiffres ≠ market.md | Ne relance pas les waves déjà couvertes ; réutilise les artefacts |
| **Import Phase 2** | 5 fichiers moteur déversés dans research/ | Un seul fichier, tranche validation uniquement |
| **Fausse certitude** | Claim « Haute » sur un seul avis | Tier des sources ; Tier 3 jamais seul pour un « Haute » |

---

## Passation vers l'étape 4

**Ce que l'étape 4 (`04-demand-edge`) consomme de ta sortie :**
- L'**angle candidat formalisé** (attribut → value theme → Onliness candidate) → elle reprend ta phrase, précise la niche et **tranche** le verdict.
- La **catégorie retenue** → cadre du statement final.
- Les **manques partagés** que tu as exprimés → recoupés avec le review-mining pour le verdict edge.

**Ce que tu ne lui laisses PAS faire à ta place (tu dois l'avoir fait) :** la synthèse Dunford, la catégorie, la formalisation de l'angle.
**Ce que tu ne fais PAS à sa place :** trancher le verdict edge (réel/faible/absent), inférer la demande, décider Go.

**Résumé de clôture (2 lignes) — gabarit :**
> Étape 3 faite. Catégorie retenue : {catégorie} ({type}). Angle candidat : {attribut → value theme → Onliness candidate}. Verdict edge → étape 4.
> Prochaine étape : `04-demand-edge` (demande par proxy + verdict edge).
