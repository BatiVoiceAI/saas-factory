# Synthèse Dunford 5+1 — procédure fine par composant

Détail actionnable de l'Étape 4 (`procedure-detaillee.md`). Un composant = une sous-procédure : quoi produire · comment le tester · critère de rejet · exemple **MOU vs FORT** niche-agnostique.

> Règle transverse (honesty-protocol) : **on positionne sur ce qu'on EST, pas sur le roadmap.** Un attribut « bientôt » n'existe pas. La recherche gagne contre la narration : si market.md contredit une croyance interne, market.md gagne.

---

## [1] Alternatives concurrentes — l'ancre

**Produire.** La liste **complète** de ce que le client ferait sans le produit : directs · adjacents (autre budget, même job) · manuel (Excel, papier) · embaucher quelqu'un · **ne rien faire / statu quo**. Pour chacune : job « embauché », force, où elle casse.

**Source.** `market.md` (concurrents nommés + statu quo) + `raw/`. Le founder connaît déjà les directs ; ta valeur = les **non-évidents** (adjacents et « ne rien faire »).

**Tester chaque alternative.** « Si notre produit disparaît demain, un client best-fit basculerait-il vers ça ? » Si oui → c'est une vraie alternative. Si personne n'y basculerait → c'est du bruit, retire.

**Critère de rejet.** Une liste qui ne contient **que** des concurrents directs. Le statu quo manquant = ancre fausse = tout le positionnement dérive.

| | Exemple |
|---|---|
| **MOU** | « Nos concurrents : Outil A, Outil B. » (2 directs, rien d'autre) |
| **FORT** | « Directs : A, B. Adjacent : la suite bureautique qu'ils détournent. Manuel : un tableur partagé + relances email. Statu quo : ne rien tracker et absorber les ratés. → 60% des avis négatifs de A viennent d'ex-utilisateurs de tableur, pas de B. » |

---

## [2] Attributs uniques — ⏸ pause founder

**Produire.** 5-10 candidats de ce qu'on a que les alternatives n'ont **pas** : capacité produit, archi technique, expertise équipe, business model, vitesse, intégration, accès data. Spécifique et factuel.

**⏸ PAUSE FOUNDER — obligatoire.** Présente les attributs *dérivés de la recherche*, demande de confirmer / ajouter / retirer. Le founder connaît des capacités que la recherche ne voit pas. **Recette de forcing-question complète : `forcing-questions.md` § Pause attributs.**

**Filtre anti-flagornerie (le plus important).** Pour chaque attribut : « une alternative l'a-t-elle aussi ? » Si **≥1 concurrent** l'a → ce n'est **pas** un attribut de positionnement, c'est du *table stakes*. Marque-le tel quel, ne le compte pas comme différenciateur.

**Critère de rejet.** « Meilleure UX », « plus simple », « plus rapide » sans mesure = flou. Reformule en fait vérifiable ou jette.

| | Exemple |
|---|---|
| **MOU** | « On est plus facile à utiliser et plus moderne. » |
| **FORT** | « Import en 1 clic depuis le format que 3 concurrents sur 4 ne lisent pas (vérifié dans leurs docs) — table stakes chez le 4e, donc à surveiller, pas un pilier. » |

---

## [3] Value themes — attribut → « so what ? » → bénéfice

**Produire.** Pour chaque attribut unique, la chaîne : attribut → « ce qui veut dire que… » → **outcome client**. Regroupe en **2-3 thèmes maximum** (au-delà, le message se dilue).

**Langage.** Utilise **les mots de market.md / du review-mining** (le « language map »). Le client ne parle pas « features », il parle douleur et résultat.

**Tester.** « Un client best-fit paierait-il pour ce thème ? » Si le thème ne se rattache à **aucune** douleur réelle de market.md → jette-le.

**Piège langage catégorie vs langage client.** Parfois le mot que le client tape (verbe) positionnerait le produit dans la mauvaise catégorie (nom). Documente les deux : verbe-client pour l'action, nom-catégorie pour l'outcome. (Détail : `research-synthesis.md` du moteur.)

**Critère de rejet.** Rester au niveau feature (« IA intégrée ») au lieu d'outcome (« la réponse en 3 secondes au lieu d'une heure »).

| | Exemple |
|---|---|
| **MOU** | « Value theme : synchronisation temps réel. » (c'est une feature) |
| **FORT** | « Thème *Zéro double-saisie* : la synchro temps réel → l'équipe arrête de recopier entre 2 outils → 3h/semaine récupérées (plainte n°1 dans les avis de A et C). » |

---

## [4] Best-fit clients — par caractéristiques

**Produire.** Le profil de qui **tient le plus** aux value themes, défini par **caractéristiques qui les font tenir** : situation, comportement, contrainte, stade — **jamais** démographie.

**Tester.** « Ce client vit-il réellement les douleurs que nos value themes adressent ? » Cross-check avec le review-mining. Le bon best-fit : obtient la valeur vite, ne marchande pas le prix, devient prescripteur.

**Critère de rejet.** « Les PME », « 25-34 ans », « entreprises de 50-200 salariés » = démographie ou trop large. Re-questionne jusqu'à une caractéristique comportementale.

| | Exemple |
|---|---|
| **MOU** | « Cible : les PME françaises. » |
| **FORT** | « Best-fit : équipes de 5-15 pers. qui ont dépassé le tableur partagé mais ne peuvent pas payer l'outil entreprise — elles sentent la douleur chaque semaine et changent d'outil sans process d'achat long. » |

---

## [5] Catégorie de marché — le cadre

**Produire.** 3-5 candidats catégorie, chacun avec : ce que l'acheteur attend de cette catégorie, les leaders, la maturité. **Recommande-en une.** La bonne catégorie rend la valeur **évidente sans explication**.

**Matrice type de catégorie (défaut = existante) :**

| Type | Quand le choisir | Coût / risque | Exemple de forme |
|---|---|---|---|
| **Existante (head-to-head)** | Un cadre existant rend déjà la valeur lisible ; acheteurs cherchent déjà le terme | Faible — **défaut** | « {catégorie connue} pour {niche} » |
| **Sous-catégorie (big fish/small pond)** | Catégorie existante + qualificatif où on est premier/seul | Moyen | « {catégorie} {qualificatif} » |
| **Création** | **Rien** d'existant ne cadre la valeur, preuve écrasante | Élevé — éduquer un marché coûte des millions | nouveau terme (à éviter) |

**Règle d'arbitrage.** Entre deux candidats à égalité : prends celui où le produit a **les preuves les plus fortes** aujourd'hui. En cas de doute entre existante et création → **existante**.

**Critère de rejet.** Inventer une catégorie que personne ne cherche (« si le client ne peut pas la Googler, il ne te trouve pas »). Flag « category creation risk » si tu proposes une création.

| | Exemple |
|---|---|
| **MOU** | « On crée la catégorie du *workflow intelligence augmenté*. » (personne ne cherche ça) |
| **FORT** | « Catégorie existante : *outil de suivi de {tâche}* — les acheteurs cherchent déjà ce terme ; on y entre par la niche {best-fit}, où les leaders sont absents. » |

---

## [6] Trend overlay — optionnel

**Produire.** *Au plus* un trend qui **amplifie réellement** le positionnement. « Aucun » est valide et souvent supérieur.

**Test décisif.** « Le positionnement tient-il **sans** ce trend ? » Oui → le trend est un bonus, garde-le léger. Non → le positionnement est trop dépendant du hype, **retire le trend et renforce les composants 2-3**.

**Critère de rejet.** Un trend collé pour faire moderne rend le positionnement gadget.

---

## Validation — les 3 tests (barrière de sortie)

Lance les 3 sur le positionnement synthétisé. **Un échec = reboucle sur [2]-[3]**, on ne ship pas un positionnement faible.

**Routage par résultat :**

```
 Onliness basique convaincant ? ──non──▶ différenciateur trop faible
   │ oui                                  → re-travaille [2] attributs
   ▼
 Moore : tous les champs remplis      ──champ vague──▶ le composant source
   sans champ vague ?                                  est faible → re-travaille
   │ oui                                               ce composant
   ▼
 Ladder : 1 rung clair, dispo,        ──non──▶ rung déjà pris / trop
   mémorable en ≤10 mots ?                      complexe → change de ladder
   │ oui                                        (autre catégorie/angle)
   ▼
   POSITIONNEMENT VALIDÉ → passe à l'angle candidat (Étape 5)
```

**Test 1 — Onliness (Neumeier).** « Notre {produit} est le seul {catégorie} qui {différenciateur}. » Si « seul » sonne faux → itère.
**Test 2 — Moore.** « Pour {cible} qui {besoin}, {produit} est un {catégorie} qui {bénéfice}. Contrairement à {alternative}, nous {différenciateur}. » Chaque champ rempli avec confiance, aucun flou.
**Test 3 — Ladder (Ries & Trout).** Énonçable en ≤10 mots · une seule marche revendiquée · marche disponible (pas déjà à un concurrent plus fort) · un client te décrirait avec ces mots.

**Confiance sur chaque claim majeur** (research-synthesis) : **Haute** (≥2 sources Tier 1/2, récent, colle à la voix client) · **Moyenne** (preuves + trous, ou sources en partie divergentes) · **Basse** (peu de data, surtout inféré, ou >12 mois). Les avis concurrents = **Tier 3** : un claim « Haute » ne repose jamais sur eux seuls.
