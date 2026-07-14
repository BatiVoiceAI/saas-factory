# Référence — Cadre de métriques (AARRR + quoi lire)

Le **vocabulaire** de l'étape 18 : ce que chaque métrique veut dire, comment définir le « moment magique », quoi lire dans PostHog / Sentry, et des **benchmarks** micro-SaaS pour situer un chiffre (un « 4 % de conversion » est bon ou mauvais ?). C'est la réf de définitions ; la procédure de lecture est dans `reading-procedure.md`.

> **Défaut = AARRR (web-saas / landing).** Le funnel pirate ci-dessous suppose une surface applicative avec un **« moment magique »** (le workflow cœur activé une fois). Deux archétypes ont un **cadre différent** et ne se lisent PAS ainsi : `automation` (headless → **métriques de RUN**, cf. `SKILL.md` §Garde archétype) et **`ecommerce`** (funnel d'**achat**, ni activation ni moment magique → **§Variante ECOMMERCE** en bas de ce fichier). Lire un funnel d'activation SaaS pour une boutique = **faux-négatif d'archétype**.

## AARRR (le funnel pirate)
- **Acquisition** — d'où viennent les visiteurs (SEO / direct / referral) ? (PostHog + GSC)
- **Activation** — atteignent-ils le **« moment magique »** (le workflow cœur réalisé une fois) ? **La métrique la plus importante d'un micro-SaaS.**
- **Rétention** — reviennent-ils ? (D1 / D7 / D30, cohortes PostHog)
- **Revenu** — conversion free→payant, MRR (Stripe + PostHog).
- **Référence** — partagent-ils / invitent-ils ?

## Santé (Sentry)
Taux d'erreur, crashs, endpoints/écrans fragiles, régressions post-deploy.

## Lecture (le jugement PM / CEO)
- **Où le funnel fuit** le plus (le plus gros levier).
- **Écart PRD** : le workflow cœur est-il vraiment utilisé, ou les gens font autre chose ?
- **Écart pricing** : la conversion tient-elle l'hypothèse de l'étape 6 ?
- **Honnêteté** : nomme les mauvais signaux, ne les moyenne pas (`_shared/lessons.md`).

## Priorisation des pistes
Impact × effort. **1-3 pistes**, chacune reliée à **une** métrique et à **un** changement testable. Pas de backlog.

---

## Définir le « moment magique » (l'activation) — la seule chose à ne pas rater
L'activation ne se mesure que si on l'a **définie comme un event unique et non ambigu**. Procédure :

1. **Relis le PRD** : quel est le **workflow cœur** — la seule chose que le produit promet de faire (ex. « transcrire un mémo vocal », « générer une facture », « planifier un post ») ?
2. **Traduis-le en un event PostHog** qui prouve que la valeur a été *délivrée une fois*, pas juste tentée. Le bon niveau = **résultat**, pas **clic**.
3. **Écris la définition dans le bilan** noir sur blanc, pour que l'étape 19 lise la même chose.

| Produit (niche-agnostique) | ❌ Trop tôt (intention) | ✅ Moment magique (valeur livrée) |
|---|---|---|
| Outil de transcription | a cliqué « Uploader » | **transcript généré + affiché** |
| Générateur de factures | a ouvert l'éditeur | **facture exportée / envoyée** |
| Planificateur de posts | a connecté un compte | **1er post programmé** |
| Dashboard analytics | a vu l'onboarding | **1re source de données connectée + 1 chiffre affiché** |

**Règle** : si le moment magique est atteignable **sans** que l'utilisateur ait rien fait de réel (juste vu un écran), il est mal placé — remonte-le au premier résultat tangible.

## Ce qu'on lit vraiment, marche par marche

| Marche | Métrique concrète | Source | À côté de quoi la lire |
|---|---|---|---|
| Acquisition | visiteurs uniques, par canal | PostHog + GSC | volume suffisant pour le GATE (`reading-procedure.md`) |
| **Activation** | % des nouveaux qui atteignent le moment magique (**taux d'activation**) | PostHog funnel | délai médian signup→activation |
| Rétention | % actifs à D1 / D7 / D30 (cohortes) | PostHog cohortes | pente de la courbe (plate = accroché) |
| Revenu | conversion free→payant, MRR, churn | Stripe + PostHog | hypothèse de `pricing.md` |
| Référence | % qui invitent / partagent | PostHog event | souvent ~0 tôt — normal |

## Benchmarks micro-SaaS (ordres de grandeur, pas des vérités)
À utiliser pour **qualifier** un chiffre (« faible / correct / fort »), jamais comme objectif absolu. Toujours **[Estimate]** — le vrai repère est ta propre courbe dans le temps.

| Métrique | Faible | Correct | Fort |
|---|---|---|---|
| Taux d'activation (nouveaux → moment magique) | < 20 % | 25-40 % | > 40 % |
| Rétention D30 (B2B outil) | < 10 % | 15-25 % | > 30 % |
| Conversion free → payant | < 1 % | 2-4 % | > 5 % |
| Churn mensuel (payant) | > 8 % | 4-6 % | < 3 % |
| Taux d'erreur Sentry (sessions) | > 2 % | 0,5-1 % | < 0,5 % |

**Lecture** : la courbe de rétention doit **s'aplatir** (un plateau > 0 = un noyau accroché). Une rétention qui tend vers 0 = pas de product-market-fit, même si l'acquisition monte. Ce signal prime sur tous les autres.

## Anti-vanité — métriques à ne PAS mettre en avant
Les **vanity metrics** flattent sans informer une décision. Les nommer, ne pas les célébrer :

| Vanity (bruit) | Actionnable (signal) |
|---|---|
| pages vues, visiteurs cumulés | taux d'activation des nouveaux |
| inscrits totaux | rétention D7/D30 d'une cohorte |
| « likes » / impressions | conversion free→payant |
| temps total cumulé sur le site | délai signup→moment magique |

Une métrique n'est utile que si un chiffre **différent** aurait mené à une **décision différente**.

---

## Variante ECOMMERCE — funnel d'achat (remplace l'activation SaaS)

> 🛒 Pour `archetype = ecommerce`, tout ce qui précède (moment magique, taux d'activation, funnel AARRR) est **hors sujet**. La valeur d'une boutique n'est pas un workflow applicatif réalisé une fois, c'est **une vente conclue** : on lit un **funnel d'achat** et de la **rentabilité** (panier moyen, revenu), pas l'adoption d'un workflow. Exiger l'« activation » ou le « moment magique » SaaS d'une boutique = **faux-négatif d'archétype**. Canon : `_shared/archetypes/ecommerce.md` §Pipeline + §Socle EC1-EC5.

### Le funnel e-commerce (les 4 marches)
`vue produit → ajout au panier → checkout démarré → achat complété`. Chaque marche = **un event PostHog**, câblé au socle EC :

| Marche | Event | Call-site RÉEL (où le `capture()` doit vivre) | Socle |
|---|---|---|---|
| Vue produit | `view_product` | **fiche produit** (rendu de la page détail) | EC1 |
| Ajout au panier | `add_to_cart` | **handler du bouton « ajouter au panier »** (avec `product_id` + quantité) | EC2 |
| Checkout démarré | `begin_checkout` | **entrée de la page / étape checkout** | EC3 |
| **Achat complété** | `purchase` (**+ montant / AOV**) | **webhook Stripe de commande confirmée** (`checkout.session.completed` / `payment_intent.succeeded`) | EC4 |

**L'achat est la seule marche de vérité.** La commande n'existe qu'au **webhook confirmé** (source de vérité = Stripe, EC3/EC4) : `purchase` se `capture()` **au webhook**, jamais au clic « payer » (un clic n'est pas un paiement — le symétrique du « moment magique placé trop tôt »). Et `purchase` **porte le montant payé** (recalculé serveur, EC/P2) → c'est lui qui alimente l'AOV et le revenu côté PostHog.

### Instrumentation au call-site (NON négociable — sinon funnel non mesurable)
Point de vigilance connu du plugin : les events analytics sont trop souvent **laissés génériques** — déclarés dans un `events.ts`, **jamais `capture()`-és au call-site réel** — contrairement aux **notifications**, qui, elles, sont câblées à leur point d'émission. Un funnel e-commerce **déclaré mais non capturé au call-site est un funnel muet** : PostHog n'a rien à lire, chaque marche est un faux zéro, et **le funnel d'achat est non mesurable**. Exigence dure (portes 13/14) — les 4 events du funnel doivent être `capture()`-és à leur call-site :

- [ ] `view_product` — `capture()` **dans la fiche produit** (au rendu de la page détail), pas seulement listé dans `events.ts`.
- [ ] `add_to_cart` — `capture()` **dans le handler du bouton panier**, au vrai ajout (avec `product_id` + quantité).
- [ ] `begin_checkout` — `capture()` **à l'entrée du checkout** (page / step checkout).
- [ ] `purchase` — `capture()` **dans le webhook de commande confirmée**, **avec le montant** (AOV), **une seule fois** (idempotent sur l'id de session/intent — EC/P3).

Ces `capture()` se **codent en Phase 4** (12-build les câble au call-site, **exactement comme les notifs**), puis se re-déploient via l'étape 17 — jamais « déclaré = mesuré ». Si l'instrumentation call-site manque, le bilan est **« pré-signal »** et le fix se route vers **12-build** (cf. `reading-procedure.md` §Check tracking vivant), pas « vers 17 ».

### Métriques clés (à la place du taux d'activation / moment magique)
| Métrique | Définition | Source | À côté de quoi la lire |
|---|---|---|---|
| **Taux de conversion** | visiteurs (ou sessions) → **acheteurs** | PostHog funnel | le repère e-commerce — **PAS** le taux d'activation SaaS |
| **Panier moyen (AOV)** | revenu ÷ nombre de commandes | **Stripe (dashboard)** + `purchase.montant` | tendance dans le temps + marge |
| **Taux d'abandon de panier** | `1 − (achats ÷ paniers créés)` — ou `(begin_checkout − purchase) ÷ begin_checkout` au checkout | PostHog funnel | **le plus gros levier** (voir ci-dessous) |
| **Ré-achat / clients récurrents** | % de clients avec ≥ 2 commandes | Stripe + table `orders` | la **vraie rétention** e-commerce (pas D1/D7/D30) |
| **Revenu** | somme des ventes sur la fenêtre | **Stripe (dashboard)** | l'hypothèse de prix de l'étape 6 |

**Ni « taux d'activation » ni « moment magique »** ici : la rétention e-commerce se lit en **ré-achat** (un client qui revient acheter), pas en fréquence d'usage d'un workflow.

### Où lire — et où le funnel fuit
- **PostHog** : le **funnel d'achat** (`view_product → add_to_cart → begin_checkout → purchase`), le taux de conversion et l'abandon **marche par marche**.
- **Stripe (dashboard)** : le **revenu** et l'**AOV** font foi côté Stripe (source de vérité du paiement, EC3/EC4). PostHog sert le **funnel**, Stripe sert l'**argent** — croise les deux : un `purchase` PostHog **sans** paiement Stripe correspondant = bug d'instrumentation, pas une vente.
- **Où ça fuit — le plus gros levier** : dans une boutique, la fuite dominante est **l'abandon au checkout** (marche `begin_checkout → purchase`). C'est là que se joue le plus de revenu récupérable (friction de paiement, frais de port surprise, checkout invité cassé, champ obligatoire de trop, moyen de paiement manquant). Regarde **cette marche en premier**, avant même l'acquisition.

### Benchmarks e-commerce (ordres de grandeur — [Estimate], pas des objectifs)
À utiliser pour **qualifier** un chiffre (faible / correct / fort), jamais comme cible absolue — le vrai repère est ta propre courbe dans le temps.

| Métrique | Faible | Correct | Fort |
|---|---|---|---|
| Taux de conversion (visiteur → achat) | < 1 % | 1,5-3 % | > 3,5 % |
| Taux d'abandon de panier | > 80 % | 65-75 % | < 60 % |
| Part de clients récurrents | < 10 % | 20-30 % | > 30 % |

**Anti-vanité (e-commerce)** : « vues produit cumulées » et « paniers créés » sont du **bruit** tant qu'ils ne se convertissent pas — les métriques actionnables sont **conversion, AOV, abandon de panier, ré-achat**. Santé Sentry : universelle, inchangée (cf. §Santé plus haut).
