# ROI : {automation}
*SaaS Factory — Phase 2, étape 6 · archétype `automation` · rapport ROI plein · {date}*
> 🚨 Livrable **exclusif de l'archétype `automation`** (le plus souvent `interne`). **Remplace** `business-model.md` ET `pricing.md` : le lean canvas 9 blocs est sans objet (≥ 4/9 N/A — Canaux · Segments-marché · Avantage déloyal · UVP mono-utilisateur). Ce n'est **pas** un ROI « ~10 lignes » (ça, c'est le mode `interne` d'un `web-saas`) : ici le ROI **est** l'étape → **rapport plein**, doctrine « qualité avant vitesse / vrais rapports comme base ».
> **Interdits :** paliers/freemium/free-trial, benchmark concurrent, `pricing.md`, `business-model.md`. Ne **pas** chercher `positioning.md` (03 sautée) ni `market.md` (02 sautée) — un fichier absent par routage n'est pas un manque.

> **Canvas 9 blocs sans objet** — automation interne : voir ci-dessous. *(ligne à recopier là où un lecteur chercherait `business-model.md`.)*

## 1. Cadre & profil
{← `idea-brief.md §Intake automation`} — Le **process actuel remplacé** (ce qui se fait à la main aujourd'hui), **qui le subit** (le propriétaire / l'équipe concernée) et à **quelle cadence** (par ex. « vérif stock manuelle ~2×/jour »). Rappeler le **déclencheur & la cadence** du worker et les **systèmes source → cible**. C'est l'assiette du calcul : sans process nommé, aucun levier n'est chiffrable.

## 2. Leviers de valeur (CHIFFRÉS)
> Chaque levier **isolé** et **estimé**, avec son **hypothèse écrite** et son label `[Estimate]`/`[Assumption]` — **jamais un chiffre nu**.

| Levier | Grandeur estimée | Hypothèse de calcul | Label |
|---|---|---|---|
| **Temps gagné** | {N h/mois × taux horaire interne} | {qui, combien de fois, durée unitaire} | `[Estimate]` |
| **Pertes / erreurs évitées** | {€ ou événements/trimestre} | {coût unitaire d'un raté × fréquence} | `[Estimate]` |
| **Coûts portés hors P&L** | {licences/outils remplacés, retards} | {ce que l'ancienne solution coûtait} | `[Assumption]` |
| … | … | … | … |

## 3. Coût récurrent
Ordre de grandeur des postes **portés par l'automation** : infra (scheduler + base durable si runner éphémère) + maintenance (temps de garde/évolution) + **coût des systèmes source-cible** (quotas/API des intégrations). Pas de financials détaillés — un ordre de grandeur honnête suffit.

## 4. Seuil de rentabilité (FALSIFIABLE)
Une **phrase vérifiable**, pas un ressenti :
> « L'automation se paie si **≥ {N} h/mois économisées** OU **≥ 1 {événement coûteux} évité / trimestre}**. »

🔗 **Relié au critère de KILL** de `idea-brief.md` — le KILL automation = **utilité / adoption par le propriétaire** (pas un marché) : le seuil ci-dessus doit pouvoir se **lire raté** au premier run réel (worker sans résultat exploitable OU digests ignorés ⇒ sous le seuil ⇒ vers le KILL).

## 5. Convention de prudence
Chiffrer **bénéfices bas / coûts hauts** : si le ROI reste positif même au croisement défavorable, la décision est robuste. Sinon, le dire — un ROI qui ne tient qu'au scénario optimiste est un flag, pas un feu vert.

## 6. Hypothèses à confirmer par le propriétaire
> Chaque item = un `[Assumption]` à confirmer par le **propriétaire / sponsor** (revue étape 15, persona propriétaire) — pas un prospect externe.
- {accès & quotas des systèmes source-cible}
- {cadence réelle vs supposée du process manuel remplacé}
- {taux horaire interne retenu}
- {fréquence réelle des événements coûteux évités}
- …
