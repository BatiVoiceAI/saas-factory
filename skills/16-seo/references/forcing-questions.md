# Forcing-questions — Étape 16 SEO

Recettes pour les points où le skill **interroge ou tranche**. Format constant :
- **Ask exact** — la question posée, mot pour mot.
- **Push-until** — le critère qui autorise à s'arrêter (sinon on re-questionne / on ne valide pas).
- **Red-flags** — les réponses (ou auto-jugements) à refuser, et pourquoi.
- **MOU vs FORT** — un exemple faible et un fort, niche-agnostiques.
- **Routage** — où va la réponse.

> Persona (conventions Phase 5) : rôle Marketing, sobre, orienté niche, anti-flagornerie. Le SEO ici est une **base saine et durable**, pas une campagne ni une ferme de contenu. La règle qui prime : **qualité mesurée, jamais du volume**. Sauf le gate de publication (§4), les « questions » sont des **auto-interrogations** : c'est le skill qui tranche, il ne délègue pas la rigueur à l'utilisateur.

---

## 1. Self-assessment Helpful Content — par page (auto-interrogation, bloquant)

Le point le plus important de l'étape. **Avant** de retenir une page (mécanisme 2.5), le skill se pose les questions people-first de Google. Une page qui échoue ne se publie pas : on l'améliore ou on la coupe.

**Ask exact (à te poser, page par page) :**
> « Cette page apporte-t-elle une **valeur réelle** à un humain de la niche (pas juste du texte pour Google) ? Reflète-t-elle une **expérience/expertise** de première main ? L'utilisateur repart-il **satisfait**, sans besoin de re-chercher ? Aurais-je **confiance** à la montrer à un expert du domaine ? »

**Push-until.** Les **quatre** réponses sont **OUI franc**. Un « oui mais c'est un peu mince » = **NON**. Stop seulement quand chaque page retenue est un OUI×4 ; sinon on améliore la page ou on la retire du lot.

**Red-flags (pages à refuser) :**
| Signal de la page | Pourquoi refuser | Correction |
|---|---|---|
| Paraphrase générique du sujet, vraie nulle part en particulier | Pas de valeur first-hand (E-E-A-T) | ré-écrire avec un angle niche concret, ou couper |
| Écrite « pour le mot-clé », pas pour un lecteur | Helpful Content la vise directement | ré-orienter people-first, exemples réels |
| « 8 pages parce que 8 clusters » alors que 3 seulement tiennent | Volume déguisé, plafond mal compris | produire moins (M4), le plafond est un maximum |
| Réponse incomplète : le lecteur devra re-chercher | Échoue au « satisfait » | compléter ou fusionner |
| Contenu qu'on n'oserait pas montrer à un expert | Échoue au « confiance » | remonter la spécificité, sinon couper |

**MOU vs FORT.**
- MOU : landing + 8 pages generic-SEO sur « qu'est-ce que {catégorie} », remplies pour ranker. ❌
- FORT : landing + 3 pages, chacune sur une douleur précise de la niche, avec un exemple concret et une réponse complète. ✅

**Routage.** Page PASS → retenue, tableau de `seo/plan.md`. Page qui échoue → améliorée ou coupée, **jamais** publiée telle quelle.

---

## 2. Est-ce qu'on dépasse le plafond ? (auto-interrogation, bloquant)

Point où le skill s'auto-contrôle contre le `scaled content abuse` (mécanisme 2.1, `quality-guardrails.md` §1).

**Ask exact (à te poser) :**
> « Combien de pages je m'apprête à produire ? Chacune est-elle **une rédaction soignée mappant un cluster unique**, ou suis-je en train de **décliner un template en masse** ? »

**Push-until.** N ≤ (landing + 8) **ET** chaque page est écrite à la main pour son cluster (pas générée depuis une DB/un template varié). Stop quand les deux tiennent.

**Red-flags :**
- « Je génère une page par {ville/métier/variante} depuis une liste » → **programmatic SEO de masse**, interdit. Refuse.
- « On monte à 12, il y a plein de mots-clés » → dépassement de plafond. Refuse, garde les 8 meilleurs (M3), le reste attend l'itération.
- « Ces pages se ressemblent à 80 %, seul le mot-clé change » → contenu dupliqué déguisé. Refuse.

**MOU vs FORT.**
- MOU : « 40 pages "logiciel {tâche} à {ville}" générées depuis un CSV. » ❌
- FORT : « 4 pages, 4 intentions distinctes, 4 rédactions spécifiques. » ✅

**Routage.** Sous plafond + artisanal → continue. Dépassement/masse → réduire au conforme avant tout le reste.

---

## 3. Anti-cannibalisation (auto-interrogation)

Avant de figer la liste des pages (mécanisme 2.3, M5).

**Ask exact (à te poser, pour chaque paire de pages) :**
> « Ces deux pages ciblent-elles **la même intention** ? Partagent-elles l'essentiel de leur SERP ? »

**Push-until.** Aucune paire de pages retenues ne partage la même intention. Stop quand chaque page a une intention distincte et unique.

**Red-flags :**
- Deux pages qui rankeraient sur les mêmes requêtes → fusionne-les en une.
- Une nouvelle page qui recouvre une page existante → enrichis l'existante, n'en crée pas une 2e.

**Routage.** Paires distinctes → OK. Paire cannibale → fusion (M5), une seule intention par page.

---

## 4. Gate humain de publication (la SEULE interaction utilisateur — `AskUserQuestion`)

Le mécanisme 4. On **ne publie pas** de contenu public au nom de l'utilisateur sans son OK explicite (`_shared/safety-rails.md` §1, `quality-guardrails.md` §5). C'est un vrai arrêt utilisateur, pas une auto-interrogation.

**Ask exact.**
> « Voici les **{n} pages** prêtes à être publiées, les **mots-clés visés** par chacune, et le résultat du self-assessment qualité. [récap : page → mot-clé → PASS]. Je publie **ces pages telles quelles** ? (oui / je veux revoir X / non) »

**Push-until.** Un **OK explicite** portant sur le lot exact montré. Un silence, un « on verra », un « je réfléchis » ≠ OK → **on ne publie pas**. Stop quand l'utilisateur a dit oui **ou** clairement non.

**Red-flags (à ne pas traiter comme un OK) :**
| Réponse | Interprétation correcte |
|---|---|
| « ça a l'air bien » (sans « publie ») | Pas un OK de publication — reformule la demande d'OK explicite |
| pas de réponse / hors sujet | **Ne pas publier**, livrer « prêt, en attente de validation » |
| « fais au mieux » | Ne **pas** l'étendre à la publication publique ; re-demander l'OK ciblé |
| « oui mais enlève la page 3 » | OK **partiel** : publier le reste, retirer la 3, tracer |

**MOU vs FORT.**
- MOU : publier parce que « l'utilisateur a validé le design la semaine dernière ». ❌ (validation ≠ ce lot, ≠ publication)
- FORT : montrer les 4 pages + mots-clés, obtenir « oui publie les 4 », tracer la date. ✅

**Routage.** OK explicite → publier (indexation réelle à l'étape 17), tracer la date dans `seo/plan.md`. Pas d'OK → ne pas publier, consigner l'état d'attente, laisser l'utilisateur trancher (safety-rails §7).

---

## 5. Garde de sortie — ne pas itérer sur du bruit (mécanisme 5)

Auto-contrôle avant toute « optimisation » post-lancement.

**Ask exact (à te poser) :**
> « Ai-je **assez de données GSC réelles** (plusieurs jours, un minimum d'impressions) pour tirer une conclusion, ou suis-je en train d'inventer une tendance sur 3 clics ? »

**Push-until.** Une action d'itération n'est décidée que sur un signal GSC **réel et suffisant** (M9). Sinon, la sortie honnête est « pas assez de données, on re-regarde dans X jours ».

**Red-flags :**
- « La position a bougé de 40 à 38, optimisons » sur 5 impressions → bruit, refuse.
- Inventer un chiffre d'impression/CTR non lu dans GSC → interdit (no bluff, safety-rails §6).
- Relancer une production de masse « parce que l'itération marche » → l'itération améliore l'existant, elle ne re-produit pas en masse.

**Routage.** Donnée suffisante → action M9 (améliorer l'existant). Donnée insuffisante → constat honnête + rappel, aucune modification.
