# Référence — Décision de stack & architecture (mouvement 4)

Procédure normée pour trancher la stack **en autonomie**, sans jamais poser de question technique à l'utilisateur.

## La règle d'or — « défaut sauf exigence contraire »
Point de départ **obligé** : `_shared/stack-defaults.md` + `_shared/archetypes/web-saas.md`. Ce sont des choix éprouvés (Next.js 15, Supabase, Cloudflare, Stripe, Gemini 2.5 Flash…). **On ne les rejoue pas à chaque projet.** On ne dévie **que** si une **exigence dure** (matrice du mouvement 2) prouve que le défaut ne suffit pas. Toute déviation = un **ADR**.

Cette règle rend l'archi **reproductible** (deux projets aux exigences proches obtiennent la même stack) et protège de la sur-ingénierie (aucune techno ajoutée « au cas où »).

## Procédure (déterministe)
1. **Poser le défaut.** Écris la stack par défaut de l'archétype comme hypothèse de travail.
2. **Confronter aux exigences dures.** Pour chaque exigence dure de la matrice : le défaut la satisfait-il ?
   - **Oui** → verrouille (label `[Défaut]`). La majorité des lignes tombent ici.
   - **Non** → passe à l'étape 3 pour cette exigence seulement.
3. **Scenario Compare** (uniquement pour ce que le défaut ne couvre pas). Compare 2-3 options sur 4 critères :

   | Option | Fit exigence | Coût | Complexité | Réversibilité |
   |---|---|---|---|---|
   | … | … | … | … | … |

   Choisis la mieux-disante ; **à fit égal, préfère la plus réversible**.
4. **Vérifier (Search Before Building).** Avant d'acter une déviation, `WebSearch` : « {besoin} {framework} built-in » (souvent le framework fait déjà le job → pas de déviation), « {techno} best practice {année} », « {techno} pitfalls ». Annote **[éprouvé]** / **[récent à surveiller]** / **[premiers principes]**.
5. **Acter par un ADR** (`references/adr-template.md`) chaque déviation : décision, exigence motrice, alternatives, conséquences, réversibilité. Écris-le dans `tech/decisions.md`.
6. **Verrouiller la stack finale** dans `tech/architecture.md` (section 4) : chaque ligne rattachée soit à `[Défaut]`, soit à un `ADR-NNNN`.

## Jetons d'innovation
Un micro-SaaS a droit à **très peu** de choix « non-boring ». Réserve-les à l'**edge produit** (le cœur métier différenciant, identifié en Phase 1). Partout ailleurs : défaut. Si tu comptes plus de **1-2 déviations** hors du cœur métier, tu sur-ingénieres — reviens au défaut.

## Recette du Scenario Compare (comment remplir la table)
La table à 4 critères n'est utile que remplie honnêtement. Barème :

| Critère | 0 (mauvais) | … | 3 (excellent) |
|---|---|---|---|
| **Fit exigence** | ne couvre pas l'exigence dure | | couvre pleinement, marge |
| **Coût** | cher/imprévisible (egress, licence) | | quasi nul au stade micro-SaaS |
| **Complexité** | nouvelle infra + ops à gérer | | dans la stack déjà présente |
| **Réversibilité** | migration de données pour défaire | | feature-flag / adaptateur, défait en heures |

- Somme non pondérée → l'option gagnante. **À somme égale, la réversibilité tranche** (biais anti-verrouillage).
- Le **défaut** est toujours une des options comparées (colonne implicite) : si aucune alternative ne bat le défaut sur le fit, tu ne dévies pas.

### Micro-exemple (niche-agnostique)
Exigence dure : *le workflow import traite des fichiers de 200 Mo (US-8)*. Le défaut (route API Next.js, body ~4 Mo) ne fit pas.

| Option | Fit | Coût | Complexité | Réversibilité | Σ |
|---|---|---|---|---|---|
| Route API Next.js (défaut) | 0 | 3 | 3 | 3 | 9 |
| Upload direct → storage + worker | 3 | 3 | 2 | 2 | 10 |
| Service d'upload tiers dédié | 3 | 1 | 1 | 1 | 6 |

→ Upload direct vers le storage gagne (fit décisif). ADR-0003, réversibilité « moyenne » (adaptateur d'upload). Le tiers dédié est écarté : coût/complexité pour un gain nul vs le storage déjà présent.

## Recettes WebSearch (Search-Before-Building)
Avant d'acter **toute** déviation, trois requêtes, dans cet ordre :
1. `"{besoin} {framework par défaut} built-in"` → **le plus important** : souvent Next.js/Supabase le fait déjà → **pas de déviation** (`edge-cases.md E9`).
2. `"{techno envisagée} best practice {année}"` → confirme l'usage idiomatique.
3. `"{techno envisagée} pitfalls"` / `"{techno} vs {défaut}"` → les pièges connus.

Annote la source : **[éprouvé]** (techno mainstream, doc stable) · **[récent à surveiller]** (sorti < 12 mois, API mouvante) · **[premiers principes]** (aucune source claire, raisonnement maison — le plus fragile, à confirmer en Phase 4).

## Matrices défaut-vs-déviation (par catégorie)
La table complète condition → action est dans `decision-matrices.md §4` (web full-stack, BDD/auth, hébergement, email, IA, transcription, backend edge, paiement, obs, jobs). Applique-la ligne par ligne : chaque case « déviation » cochée = **un ADR**.

## Note archétype — ecommerce : Stripe en PAIEMENT one-shot (pas d'abonnement)
Quand `archetype = ecommerce` (fiche : `_shared/archetypes/ecommerce.md`), le défaut **paiement** dévie du bloc `billing` de web-saas — non pas vers une autre techno, mais vers un **autre mode du même Stripe**. Ce n'est **pas** un ADR : c'est le **défaut de l'archétype ecommerce**, au même titre que l'abonnement récurrent est le défaut de web-saas.
- **Stripe en mode PAIEMENT ONE-SHOT** — **Checkout** ou **Payment Intents** en **`mode:payment`** (achat de panier). **Jamais `mode:subscription`** : c'est la **différence dure** avec le `billing` récurrent de web-saas. Pas de `prices` récurrents, pas de customer portal d'abonnement, pas d'`invoice.paid` cyclique — **un** `checkout.session.completed` / `payment_intent.succeeded` par commande.
- **Checkout invité par défaut** — l'email suffit pour acheter ; **un compte client (historique de commandes) est une OPTION, jamais un prérequis à l'achat**. Ne pas gater le checkout derrière un signup (perte de conversion + faux-négatif d'archétype).
- Le **webhook** (signature vérifiée, idempotent sur l'id de session/intent) est la **source de vérité** de la commande. Patterns DB (idempotence P3, décrément atomique P1, prix serveur P2, RLS catalogue public) : `references/data-model.md §Variante ECOMMERCE`.

## Quand écrire un ADR
Décision : `decision-matrices.md §6`. En bref — ADR pour : toute déviation, tout choix structurant/irréversible, tout compromis à impact produit (+ taste decision). Pas d'ADR pour : ce que le défaut couvre, les détails réversibles en 5 min (implémentation Phase 4).

## Definition-of-Done de la décision de stack
```
[ ] Chaque ligne de la stack finale = [Défaut] OU rattachée à un ADR-NNNN (zéro orphelin)
[ ] Chaque déviation pointe une exigence dure nommée de la matrice M2
[ ] Chaque déviation a survécu à un Scenario Compare + un WebSearch built-in
[ ] ≤ 1-2 déviations hors edge produit (sinon sur-ingénierie → re-challenge)
[ ] Chaque ADR : exigence motrice + réversibilité honnête (data-model = « difficile »)
[ ] Aucune techno « au cas où » ; aucune question technique posée à l'utilisateur
```

## Modes d'échec (voir `edge-cases.md`)
- **Choix orphelin** (E2) : techno sans exigence → supprime ou ADR.
- **Jetons gaspillés** (E4) : 3+ déviations → re-challenge chacune.
- **Déviation inutile** (E9) : le framework le fait en natif → `WebSearch` built-in d'abord.

## Ce qui n'est PAS de ton ressort ici
- Provisionner l'infra, créer les comptes, générer les clés → **étape 11**.
- Écrire le code → **Phase 4**.
- Changer le périmètre produit → **Phase 2**.
