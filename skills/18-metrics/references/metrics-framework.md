# Référence — Cadre de métriques (AARRR + quoi lire)

Le **vocabulaire** de l'étape 18 : ce que chaque métrique veut dire, comment définir le « moment magique », quoi lire dans PostHog / Sentry, et des **benchmarks** micro-SaaS pour situer un chiffre (un « 4 % de conversion » est bon ou mauvais ?). C'est la réf de définitions ; la procédure de lecture est dans `reading-procedure.md`.

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
