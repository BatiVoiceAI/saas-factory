# Référence — Playbooks par cran (Tech Lead · CTO · Designer · CEO)

La **profondeur** de la cascade. `review-gates.md` donne la lentille de chaque cran ; **ici** on donne, pour chaque cran, la **sous-procédure exhaustive** : quoi lire → dans quel ordre → avec quels critères de passage → forcing-question pour trancher → checklist DoD → cas limites → modes d'échec.

Chaque cran clone le **gabarit superpowers** (`requesting-code-review/code-reviewer.md` : *Strengths · Critical · Important · Minor*) mais **change la lentille** et rend un **verdict** au format `verdict-schema.md`. Un cran **raise** ; la **preuve** tranche (`fichier:ligne` + impact concret). Tous les crans sont **adversariaux** (`_shared/lessons.md` §6 — chercher à réfuter, pas à complaire).

> **Invariant transverse** : un cran ne lit **que le diff de la feature** + ses artefacts de référence. Il ne re-teste pas comme un dev (c'est fait à l'étape 12), il **valide** (lit + cite). Corrections → **retour dev (étape 12)**. Voir `rejection-contract.md` pour le format du rejet.

---

## Ordre de lecture commun (avant tout cran)
1. `status/<feature>.md` — état dev, tests, recette, cran atteint, `[SÉCU]` éventuels.
2. Le **diff** de la feature (`feature/<slug>`) — la matière à juger.
3. Les **critères d'acceptation** de la feature (attachés par l'étape 10, issus du PRD étape 7).
4. La **référence propre au cran** (voir chaque section ci-dessous).

Sortie de tout cran : un **bloc verdict** (voir `assets/templates/cascade-verdict.md`) **ajouté** à `status/<feature>.md`, jamais dans la conversation.

---

# Cran 1 — Tech Lead (`agents/tech-lead.md`)
**Lentille : qualité code + intégration + fonctionnel.** Premier filtre. Il tient la barre « ça tient en prod et ça s'intègre au châssis », pas seulement « ça compile ».

### Sous-procédure (dans l'ordre)
1. **Fonctionnel d'abord** — le diff implémente-t-il la user story ? Recoupe chaque critère d'acceptation avec un bout de code ou un test cité.
2. **Qualité de code** — DRY, lisibilité, nommage, patterns du projet (`_shared/blocks/`), pas de sur-ingénierie (YAGNI), pas de code mort / `console.log` / `print` de debug.
3. **Intégration / châssis** — cohérence avec le châssis partagé et les autres features ; pas de duplication d'un bloc existant ; contrats d'interface respectés aux jonctions.
4. **Classes de bug « passe la CI, casse en prod »** (façon gstack `/review`) — passe explicitement les 4 :
   - **races / concurrence** : double-submit, deux requêtes sur la même ressource, ordre non garanti.
   - **complétude d'enum / switch** : un cas d'énum non géré (défaut manquant, nouveau membre oublié).
   - **time-window** : hypothèse « ça arrive dans l'ordre / dans la seconde » ; expiration, TTL, horloge.
   - **trust-boundary d'une sortie LLM** : une sortie de modèle consommée sans validation/parse défensif.
5. **Verdict** au format `verdict-schema.md` + preuve citée.

### Critères de passage (PASS autorisé si…)
| Sous-check | PASS si | Sinon |
|---|---|---|
| Fonctionnel | chaque critère d'acceptation ↔ code/test cité | `FAIL` (critère non couvert) ou `CONCERNS` (couvert mais fragile) |
| Qualité | 0 red-flag DoD ci-dessous | `CONCERNS` (mineur) / `FAIL` (duplication structurante, sur-ingénierie coûteuse) |
| Intégration | contrats aux jonctions tenus, pas de collision | `FAIL` si une jonction casse un autre bloc |
| 4 classes de bug | aucune démontrée exploitable | `FAIL` si une est démontrée (`fichier:ligne` + scénario) |

### Forcing-question — « est-ce vraiment intégré, pas juste vert ? »
- **Ask exact** : *« Montre-moi la ligne qui prouve que ce critère est tenu, et la jonction avec le châssis existant. »*
- **Push-until** : chaque critère d'acceptation a un ancrage `fichier:ligne` **et** aucune des 4 classes de bug n'est ouverte.
- **Red-flags (réponses à refuser)** :
  - « ça compile / la CI est verte » (la CI ne teste pas les races ni l'enum incomplet).
  - « c'est comme l'autre feature » (sans vérifier le contrat de jonction).
  - « le happy-path marche » (et le cas limite du catalogue ?).
- **MOU vs FORT** :
  - MOU : *« Le code est un peu dupliqué. »*
  - FORT : *« `handlers/a.ts:40-58` et `handlers/b.ts:12-30` sont identiques à 3 lignes près → extraire dans `_shared/blocks/`. Impact : double correction à chaque évolution. → CONCERNS (confiance 7). »*
- **Routage** : critère non couvert → `FAIL` ; couvert mais dupliqué/fragile → `CONCERNS` ; jonction cassée → `FAIL` ; sur-ingénierie assumée et tracée → `WAIVED`.

### DoD Tech Lead (checklist)
- [ ] Chaque critère d'acceptation est **ancré** (`fichier:ligne` ou test cité).
- [ ] Aucune des **4 classes de bug** (race / enum / time-window / trust-boundary LLM) n'est ouverte et démontrable.
- [ ] Pas de **duplication structurante** d'un bloc existant.
- [ ] Contrats d'**interface aux jonctions** respectés (pas de collision inter-feature).
- [ ] Diff **DRY**, lisible, sans code mort / debug résiduel / sur-ingénierie.
- [ ] Verdict rendu au format + **preuve citée** pour chaque finding important.

---

# Cran 2 — CTO (`agents/cto.md`)
**Lentille : architecture + sécurité + fonctionnel.** Le cran le plus dense. Deux passes : archi/perf/dette **puis** sécurité outillée.

### Sous-procédure (dans l'ordre)
1. **Conformité archi** — respect de `tech/architecture.md` (couches, dépendances, frontières de confiance §3.6), couplage, pas de contournement de la structure décidée.
2. **Perf / dette** — requêtes N+1, boucles non bornées, allocation dans un chemin chaud, dette introduite (raccourci non tracé → doit devenir un `CONCERNS` logué, pas un secret).
3. **Sécurité outillée** — lance le **`security-review` vendoré** (diff-aware) **puis** ouvre la/les carte(s) pertinente(s) de `owasp-cards.md` selon la nature de la feature (routage : voir `owasp-cards.md`). **Exploit concret par finding**, tag `[SÉCU]`.
4. **STRIDE par frontière** — pour chaque frontière de confiance touchée (de `tech/architecture.md` §3.6), passe les 6 lettres.
5. **Fonctionnel** — comme les autres crans, la feature fait-elle ce que dit la story (angle système).
6. **Cross-check `codex` (OPTIONNEL)** — si `codex` présent + activé par l'utilisateur, lance-le en vérification indépendante **ici** (seule vraie sortie du biais mono-modèle). Jamais imposé, aucune API forcée.
7. **Verdict** + preuve + `[SÉCU]` reporté dans `status/`.

### Critères de passage
| Sous-check | PASS si | Sinon |
|---|---|---|
| Archi | 0 violation de `tech/architecture.md` | `FAIL` (contournement structurant) / `CONCERNS` (entorse mineure tracée) |
| Perf/dette | pas de régression démontrée dans un chemin chaud | `CONCERNS` en général ; `FAIL` seulement si impact prouvé |
| Sécurité | 0 exploit **démontré** (pas théorique) | `FAIL` **uniquement** si exploit concret cité ; sinon `CONCERNS` (voir exclusions dures) |
| STRIDE | chaque frontière passée, 0 menace exploitable ouverte | `FAIL` si menace démontrée `fichier:ligne` + scénario |

### Forcing-question — « exploit concret ou rien »
- **Ask exact** : *« Quelle est la ligne vulnérable, et quel est l'exploit concret pas-à-pas (entrée → effet) ? »*
- **Push-until** : un `FAIL` sécu **exige** entrée non fiable identifiée + chemin d'exploit + impact. Sans ça → au plus `CONCERNS`.
- **Red-flags (réponses à refuser)** :
  - « lib outdated » sans **CVE exploitable** dans ce contexte → au plus `CONCERNS` (exclusion dure).
  - « pas de rate-limiting » générique, sans entrée non fiable amplifiable → `CONCERNS`.
  - « ça semble fragile / risque théorique » → **supprimé** (gate anti-hallucination).
  - « race possible » sans exploit démontré → `CONCERNS`.
- **MOU vs FORT** :
  - MOU : *« Possible injection quelque part dans la couche data. »*
  - FORT : *« `db/query.ts:22` concatène `req.query.sort` dans le SQL → `sort=id;DROP TABLE users--` s'exécute. OWASP Injection. → FAIL (confiance 9), tag [SÉCU]. Correction : requête paramétrée / allow-list de colonnes. »*
- **Routage** : exploit démontré → `FAIL` [SÉCU] ; risque réel non exploitable en l'état → `CONCERNS` [SÉCU] ; entorse archi tracée et assumée → `WAIVED` ; exclusion dure → **jamais** `FAIL`.

### DoD CTO (checklist)
- [ ] `security-review` vendoré **lancé** sur le diff.
- [ ] Carte(s) `owasp-cards.md` pertinente(s) ouverte(s) selon la nature de la feature (web / LLM / agentique).
- [ ] **STRIDE** passé sur chaque frontière de confiance touchée.
- [ ] Chaque finding sécu = **exploit concret** cité (`fichier:ligne` + scénario), pas « risque théorique ».
- [ ] **Exclusions dures** (`verdict-schema.md`) appliquées → pas de `FAIL` faux positif.
- [ ] Conformité à `tech/architecture.md` vérifiée (couches, frontières, couplage).
- [ ] Perf : N+1 / boucle non bornée / chemin chaud vérifiés.
- [ ] `[SÉCU]` reporté dans `status/` ; cross-check `codex` mentionné (fait / absent / non activé).

---

# Cran 3 — Designer (`agents/designer.md`)
**Lentille : conformité `DESIGN.md` + UX + accessibilité + anti-slop.** Il ne juge pas « joli » au feeling : il **compare au système** (DESIGN.md), passe la **checklist anti-slop** de `_shared/design-doctrine.md` (binaire, pas d'interprétation) et **audite l'a11y** avec l'outil vendoré.

### Sous-procédure (dans l'ordre)
1. **Conformité `DESIGN.md`** — tokens (couleur / espacement / typo), composants du système (pas de one-off réinventé), hiérarchie visuelle décidée.
2. **Checklist anti-slop** — passe la **checklist de review de `_shared/design-doctrine.md` point par point, en binaire**, sur le rendu réel des surfaces touchées (screenshot **desktop + mobile**). **Un marqueur coché (OUI) = `FAIL`** → retour dev avec le numéro du point + le screenshot comme preuve. Pas de rustine ponctuelle : un marqueur systémique (gradient interdit, gris purs, 3 cartes identiques…) se corrige au **thème/pattern**, pas à l'écran isolé.
3. **États UI** — vérifie les **4 états** de chaque surface : *loading · vide (empty) · erreur · succès*. Un état manquant = trou UX. L'état **vide** doit porter un **CTA d'amorçage** (pas une liste nue).
4. **Parcours / clarté** — le flux de la feature est-il compréhensible sans notice ? Affordances, libellés, feedback d'action.
5. **Accessibilité outillée** — lance l'**`accessibility-review` vendoré** (WCAG 2.1 AA) : contraste, navigation clavier, cibles ≥ 44px, sémantique lecteur d'écran (labels, rôles, focus visible).
6. **Verdict** + preuve citée (composant/écran + règle DESIGN.md, point de checklist anti-slop ou critère WCAG violé).

### Critères de passage
| Sous-check | PASS si | Sinon |
|---|---|---|
| DESIGN.md | tokens + composants du système, 0 one-off injustifié | `CONCERNS` (écart mineur) / `FAIL` (composant hors système structurant) |
| Anti-slop | **0 marqueur** de la checklist `design-doctrine.md` coché (desktop + mobile) | `FAIL` dès **1 marqueur** coché (le point de checklist + le screenshot = la preuve) |
| États UI | les 4 états présents là où pertinent | `FAIL` si un état critique manque (ex. pas d'état erreur sur un submit, liste vide sans CTA) |
| a11y | 0 violation WCAG AA bloquante | `FAIL` sur bloquant (contraste illisible, piège clavier) ; `CONCERNS` sur mineur |

### Forcing-question — « conforme au système, pas juste presentable »
- **Ask exact** : *« Quel token/composant DESIGN.md couvre ça, où sont les états vide/erreur, et la checklist anti-slop est-elle passée point par point ? »*
- **Push-until** : chaque surface a ses **4 états**, **0 marqueur anti-slop** coché (desktop + mobile) et **0 violation WCAG AA bloquante** citée par l'outil.
- **Red-flags (réponses à refuser)** :
  - « c'est joli » (subjectif, non ancré au système → pas un verdict).
  - « le happy-path est stylé » (et l'état erreur / vide ?).
  - « le contraste a l'air ok » (sans le ratio de l'`accessibility-review`).
  - « globalement ça ne fait pas slop » (sans avoir coché la checklist **point par point** — l'impression d'ensemble n'est pas le protocole).
  - « c'est le style du châssis/template » (un marqueur de slop reste un marqueur, quelle qu'en soit l'origine).
- **MOU vs FORT** :
  - MOU : *« L'accessibilité pourrait être améliorée. »*
  - FORT : *« `Button.tsx:14` texte #9AA sur fond #EEE = ratio 1.9:1 < 4.5:1 (WCAG 1.4.3). Illisible pour basse vision. → FAIL (confiance 9). Corriger le token de couleur. »*
- **Routage** : violation WCAG bloquante / état critique manquant → `FAIL` ; écart mineur au système → `CONCERNS` ; déviation design assumée et tracée → `WAIVED`.

### DoD Designer (checklist)
- [ ] Tokens `DESIGN.md` respectés (couleur / espacement / typo).
- [ ] **Checklist anti-slop** de `_shared/design-doctrine.md` passée **point par point** (binaire), sur screenshot **desktop + mobile** — **0 marqueur coché** (1 marqueur = `FAIL` → retour dev).
- [ ] Composants du **système** réutilisés (pas de one-off réinventé sans raison).
- [ ] Les **4 états** (loading / vide / erreur / succès) présents sur chaque surface pertinente (état vide = avec CTA).
- [ ] `accessibility-review` vendoré **lancé** ; contraste, clavier, cibles 44px, lecteur d'écran vérifiés.
- [ ] Chaque finding = composant/écran + **règle DESIGN.md ou critère WCAG** cité.
- [ ] Verdict au format + preuve citée.

---

# Cran 4 — CEO (`agents/ceo.md`)
**Lentille : conformité métier / produit (final).** *Agent-persona, pas l'humain.* Dernier filtre avant le faux-client (étape 14). Il ne relit pas le code : il juge que la feature **résout le vrai besoin** du PRD pour la **cible**.

### Sous-procédure (dans l'ordre)
1. **Vrai besoin** — la feature adresse-t-elle le problème du PRD (étape 7), pas une version dévoyée ? (« technically correct » ≠ « résout le besoin ».)
2. **Workflow cœur** — le parcours principal de la cible est-il servi de bout en bout ?
3. **Edge métier** — les cas limites **métier** du PRD sont-ils honorés (pas les cas limites techniques — c'est le Tech Lead / dev) ?
4. **Sens pour la cible** — un utilisateur cible comprendrait-il et voudrait-il ça ? (utilité, pas esthétique.)
5. **Consomme les critères d'acceptation** du PRD → **verdict de conformité PRD**.
6. **Verdict** + preuve (critère d'acceptation PRD ↔ comportement observé).

### Critères de passage
| Sous-check | PASS si | Sinon |
|---|---|---|
| Vrai besoin | la feature adresse le problème PRD, pas un proxy | `FAIL` (résout le mauvais problème) |
| Workflow cœur | parcours principal servi A→Z | `FAIL` si le cœur est incomplet |
| Edge métier | cas limites **métier** du PRD honorés | `CONCERNS` (edge secondaire) / `FAIL` (edge cœur) |
| Conformité PRD | chaque critère d'acceptation métier ↔ comportement | `FAIL` si un critère cœur non tenu |

### Forcing-question — « résout le vrai besoin de la cible ? »
- **Ask exact** : *« Quel critère d'acceptation du PRD cette feature satisfait-elle, et pour quel moment du workflow de la cible ? »*
- **Push-until** : chaque critère d'acceptation **métier** du PRD est ancré à un comportement observable de la feature.
- **Red-flags (réponses à refuser)** :
  - « techniquement c'est correct » (mais ça résout le mauvais problème → `FAIL`).
  - « c'est ce que j'aurais fait » (préférence, pas conformité PRD).
  - « la cible aimera sûrement » (spéculation sans ancrage PRD → au plus `CONCERNS`).
- **MOU vs FORT** :
  - MOU : *« Ça ne répond pas tout à fait au besoin. »*
  - FORT : *« PRD critère A3 : "l'utilisateur exporte son rapport en 1 clic". La feature exige 4 étapes (`flow.md`). Le workflow cœur n'est pas servi. → FAIL (confiance 8). Ramener à 1 action. »*
- **Routage** : mauvais problème / workflow cœur cassé / edge cœur → `FAIL` ; edge secondaire → `CONCERNS` ; écart PRD assumé (décidé à une porte antérieure) → `WAIVED`.

### DoD CEO (checklist)
- [ ] La feature adresse le **problème du PRD**, pas un proxy technique.
- [ ] Le **workflow cœur** de la cible est servi de bout en bout.
- [ ] Les **cas limites métier** du PRD sont honorés (ou logués si secondaires).
- [ ] Chaque **critère d'acceptation métier** du PRD est ancré à un comportement observable.
- [ ] Verdict = conformité PRD, format unifié + preuve citée.
- [ ] `PASS` → feature **validée** (prête pour l'étape 14, faux-client A→Z).

---

## Récap — qui juge quoi (anti-recouvrement)
| Cran | Juge | Ne juge PAS |
|---|---|---|
| Tech Lead | qualité code, intégration, 4 classes de bug, fonctionnel-code | sécurité outillée, a11y, conformité métier |
| CTO | archi, perf/dette, **sécurité** (OWASP/STRIDE), fonctionnel-système | tokens design, besoin métier |
| Designer | DESIGN.md, **checklist anti-slop** (`design-doctrine.md`), états UI, **a11y** WCAG | archi, sécurité serveur, métier |
| CEO | vrai besoin, workflow cœur, edge **métier**, conformité PRD | code, tokens, sécurité |

> Chevauchement volontaire : **le fonctionnel** est vu sous 3 angles (code / système / métier). C'est voulu — c'est la redondance qui attrape le défaut. Ce qui est **interdit**, c'est qu'un cran bloque hors de sa lentille sans preuve dans son domaine.

## Modes d'échec transverses (tous crans)
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Veto sans preuve** | `FAIL` « ça semble fragile » | Gate anti-hallucination : pas de `fichier:ligne` + impact → finding supprimée |
| **Rejet non actionnable** | « refais ça » | `rejection-contract.md` : quoi / où / pourquoi / quoi faire, sinon le dev tourne à vide |
| **Faux positif sécu** | `FAIL` sur lib outdated sans CVE | Exclusions dures (`verdict-schema.md`) → au plus `CONCERNS` |
| **Complaisance** | tout `PASS` sans avoir cherché le défaut | Posture adversariale obligatoire (`_shared/lessons.md`) |
| **Cran hors lentille** | Designer bloque sur l'archi | Chaque cran reste dans sa lentille ; l'angle voisin est couvert par le cran voisin |
| **Boucle infinie** | la feature re-grimpe sans converger | Budget d'itération → `DONE_WITH_CONCERNS`, on remonte (`cascade-protocol.md`) |
| **Verdict en mémoire** | décision non écrite dans `status/` | Async par fichier obligatoire (`validation-cascade.md`) |
