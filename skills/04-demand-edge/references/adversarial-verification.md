# Vérification adversariale — recette appliquée à l'étape 4

La vérif n'est pas une case à cocher en fin de course : c'est ce qui empêche un verdict de demande ou d'edge de reposer sur du vent. On applique les deux moteurs vendorés **tels quels**, calibrés pour cette étape :
- `{PLUGIN_ROOT}/vendor/startup-skill/startup-competitors/references/verification-agent.md` (tiers de sources, ce qui confirme / infirme).
- `{PLUGIN_ROOT}/vendor/startup-skill/startup-competitors/references/honesty-protocol.md` (« if your idea should die, it will tell you »).

Cette réf. dit **comment** les appliquer ici, sur les deux blocs (demande **et** edge).

---

## 1. Tags de tier (rappel + application)

```
Tier 1 ─ preuve directe forte : argent versé, inscription payante, willingness-to-pay explicite,
         liste d'attente qui convertit. (Rare par proxy — presque jamais dispo à l'étape 4.)
Tier 2 ─ preuve comportementale indirecte : churn documenté, volume de recherche, threads actifs
         qui décrivent le problème, désinstallations.
Tier 3 ─ opinion / déclaratif : avis clients, notes d'étoiles, commentaires. ◀── matière de base ici
```

**Règle dure** : les avis concurrents sont **Tier 3**. Un verdict « Fort » (demande) ou « Edge réel » **ne peut pas** reposer sur une seule source Tier 3. Il faut soit croiser plusieurs plateformes, soit remonter un signal Tier 2 (churn, recherche).

### Règle dure n°2 — authenticité des verbatims (anti-preuve-fabriquée)

L'étape 2 consigne **par verbatim** : l'URL de la page source + le marqueur « **ouvert via WebFetch : oui / non** » (`raw/review-mining.md`, `raw/forum-mining.md`). Ici, tu relis ce marqueur :

- Quote avec marqueur « **non** » (page jamais ouverte, texte issu d'un snippet de recherche) **ou sans URL** → étiquette-la **`[snippet — non vérifié]`** dans `demand-signals.md`.
- Un `[snippet — non vérifié]` peut **illustrer** un thème, mais **ne soutient ni « demande Forte » ni « Edge réel »** : toute preuve porteuse de ces deux verdicts est un verbatim **vérifié** (URL + ouvert via WebFetch = oui).
- Pas de re-scraping ici (l'étape 4 n'ouvre pas de pages) : si les preuves porteuses sont toutes des snippets → **descends le verdict**, ne « répare » pas la preuve.

Pourquoi si dur : un snippet paraphrasé qui passe pour un verbatim est une preuve fabriquée — exactement là où le biais d'optimisme s'exerce.

### Où trouver du Tier 2 dans le matériau existant
- **Churn** (Passe 4 du bloc demande) = Tier 2 : c'est un comportement.
- **Signaux GTM** de la Wave 3 (`research-wave-3-gtm-signals.md`) : volume de recherche, dynamique de contenu = Tier 2.
- Tout le reste (plaintes, features réclamées) reste Tier 3.

---

## 2. Le triptyque obligatoire : confirmerait / infirmerait / trous

Pour **chaque** verdict (demande ET edge), écris les trois. C'est le format que consomme l'étape 5.

### Ce qui **confirmerait** (à aller chercher plus tard, hors IA)
- Inscriptions / pré-commandes sur une landing page.
- Willingness-to-pay explicite (« je paierais X€ pour ça »).
- Liste d'attente qui se remplit.
- Interviews terrain qui rejouent la douleur mot pour mot.

### Ce qui **infirmerait** (les signaux qui doivent te faire douter)
- Avis **> 18 mois** (le besoin peut être comblé depuis).
- Signal concentré sur **un seul** concurrent (peut-être un mauvais produit, pas un besoin).
- Plaintes « **nice-to-have** » (agacement contournable, pas de douleur réelle).
- Quotes toutes issues d'**une seule plateforme** (biais de recrutement).
- Edge copiable en un sprint (défendabilité nulle).

### Les **trous** (déclare-les, ne les masque pas)
- Marché/langue non couvert par le mining.
- B2B sans avis publics.
- Wave 2 partielle.
- Aucune donnée de churn.

---

## 3. Matrice tier × verdict (garde-fou anti-fausse-certitude)

| Verdict visé | Exigence minimale de preuve |
|---|---|
| Demande **Forte** | ≥2 plateformes **ou** ≥1 signal Tier 2 (churn/recherche) + douleur partagée sévère. |
| Demande **Moyenne** | Tier 3 multi-avis mais mono-plateforme **ou** signal isolé toléré. |
| Demande **Faible** | Aucune exigence (c'est déjà le plancher). |
| **Edge réel** | Manque partagé **prouvé par avis** (Tier 3 multi-concurrents) + défendabilité argumentée. |
| **Edge faible / nul** | Aucune exigence de preuve — c'est le repli honnête. |

Si le matériau ne permet pas d'atteindre l'exigence → **descends le verdict**, ne force pas la preuve.

> Dans tous les cas : les preuves porteuses d'un « Forte » ou d'un « Edge réel » sont des **verbatims vérifiés** (URL + ouvert via WebFetch = oui) — les `[snippet — non vérifié]` ne comptent pas dans l'exigence (règle dure n°2, §1).

---

## 4. Passe honnêteté (honesty-protocol) — checklist de sortie

Avant d'écrire `demand-signals.md`, relis avec l'œil « cette idée devrait-elle mourir ? » :

- [ ] Ai-je un verdict que je **voudrais** vrai mais que la preuve ne soutient pas ? → corrige-le.
- [ ] Chaque affirmation forte porte-t-elle une preuve datée et sourcée ?
- [ ] Aucun `[snippet — non vérifié]` ne porte un « Forte » ni un « Edge réel » ?
- [ ] Ai-je écrit au moins un « ce qui infirmerait » par verdict ?
- [ ] Les trous sont-ils **visibles** (pas noyés) ?
- [ ] Le vocabulaire reste-t-il humble (« plausiblement », « à valider par toi ») ?
- [ ] Aucun edge affirmé sans manque partagé **et** réclamé ?
- [ ] Si demande faible / pas d'edge : l'ai-je dit **net**, sans maquillage ?

Un seul « non » = la sortie n'est pas prête.

---

## 5. Micro-exemple de bloc vérif bien rempli (niche-agnostique)

> **Verdict : demande plausiblement moyenne.**
> - **Sources & tiers** : 14 avis Trustpilot + 9 G2 (Tier 3, 2 plateformes) ; 1 thread Reddit de churn « passé à la concurrence faute d'API » (Tier 2). Aucun Tier 1.
> - **Confirmerait** : une landing « early access » qui convertit >3 % ; 5 interviews rejouant la douleur API.
> - **Infirmerait** : 40 % des avis datent de 2023 ; la douleur API n'apparaît que chez 1 concurrent.
> - **Trous** : marché DACH non couvert (avis FR/EN seulement) ; pas de willingness-to-pay observable.
> - **Pourquoi Moyen et pas Fort** : signal réel mais mono-concurrent sur le point clé + pas de Tier 1. **À valider par toi.**
