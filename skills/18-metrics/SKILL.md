---
name: 18-metrics
description: >-
  Étape 18 (Phase 6 · après) de SaaS Factory — Mesure & itération (rôles PM / CEO). Une fois le SaaS en ligne : lit les métriques d'activation (funnel AARRR via PostHog) + les erreurs/santé (Sentry), identifie où ça décroche vs l'attendu (PRD/pricing), et propose 1-3 pistes d'itération priorisées (pas un backlog). Se déclenche pour « métriques », « mesurer », « analytics », « qu'est-ce qui marche », après le déploiement.
allowed-tools: Read, Write, Edit, Bash, WebSearch, WebFetch
---

# SaaS Factory — Étape 18 : Mesure & itération (PM / CEO)

Le produit est en ligne. On **lit ce qu'il fait en vrai** → on décide **quoi itérer**. Pas d'opinions : de la donnée. C'est un **overlay maison** : tu ne « construis » rien ici, tu **observes**, tu **nommes honnêtement** où ça fuit, et tu proposes **1-3 pistes** testables — pas un backlog. L'output nourrit directement la porte kill/continue de l'étape 19.

## HARD GATE — périmètre : on observe, on ne construit pas
Cette étape est un **overlay de lecture**. On **n'écrit pas de code**, on ne modifie pas le produit, on ne relance pas de build : on lit la donnée et on propose des pistes. Et on **ne tranche pas kill/continue ici** — cette décision appartient à l'étape 19 ; le bilan **informe** la porte, il ne la franchit pas. Toute action qui sort de « lire + proposer 1-3 pistes » est hors périmètre.

## Garde type (si invoquée seule)
Lis `type` dans `.saas-factory/state.md` (défaut prudent : `public`) et calibre la lecture — la route canonique vit dans `skills/saas-factory/references/routing.md` :
- `public` → funnel **AARRR complet** (la procédure ci-dessous, telle quelle).
- `interne` → **adoption interne** : qui utilise, à quelle fréquence, sur le workflow cœur — pas d'acquisition ni de revenu marché.
- `perso` → **usage réel, allégé** : l'outil sert-il vraiment (fréquence, dernière utilisation) — pas de funnel, pas de %.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-6-after/references/conventions.md`. Puis les **inputs** : le PRD (`product/*`) + `product/pricing.md` (l'attendu) + le déploiement (étape 17, tracking actif).
**Pré-vol honnêteté** : on lit la donnée telle qu'elle est. On **ne moyenne pas** un mauvais signal avec un bon pour un tiède rassurant, on **ne comble pas** un trou de tracking par une estimation présentée comme un fait, et on distingue toujours **[Data]** (mesuré) / **[Estimate]** (extrapolé) / **[Assumption]** (inféré). Un bilan qui rassure à tort fait perdre à l'utilisateur son prochain sprint — c'est un échec.

## HARD GATE — assez de données pour lire ?
**Avant toute lecture de funnel**, vérifie que le volume est suffisant pour que les chiffres veuillent dire quelque chose. Un funnel à 6 visiteurs n'est pas un signal, c'est du bruit — en tirer une piste d'itération est une faute. Si le volume est sous le seuil : **dis-le**, produis un bilan « pré-signal » (santé Sentry + check que le tracking émet bien), et recommande d'attendre / de pousser l'acquisition avant d'itérer. Ne fabrique jamais une lecture statistique sur 3 events. → seuils exacts, check tracking-vivant, sorties possibles : `references/reading-procedure.md`.

## Le moteur (on dépend)
- **PostHog** (activation, funnel, rétention) — déjà activé à l'étape 17.
- **Sentry** (erreurs, crashs, santé).
- *(On s'inspire du skill PM `metrics-review` d'Anthropic pour la structure du bilan.)*

## Références (la profondeur — charge à l'usage)
Le SKILL reste l'aperçu scannable ; chaque étape de la procédure a sa version exhaustive en `references/` :
- `references/metrics-framework.md` — le **vocabulaire** : AARRR détaillé, définition opérationnelle du « moment magique », quoi lire dans PostHog / Sentry, **benchmarks micro-SaaS** (ordres de grandeur pour situer un chiffre).
- `references/reading-procedure.md` — étapes 1-2 : le **HARD GATE** de suffisance des données, comment tirer funnel / rétention / cohortes de PostHog puis la santé de Sentry, **dans quel ordre**, data-flow ASCII, catalogue de cas limites (zéro data, tracking cassé, pic d'un bot…).
- `references/gap-analysis.md` — étape 3 : **matrice de confrontation** métrique × attendu (PRD/pricing) → diagnostic, recette forcing pour **nommer les tensions** sans les adoucir, MOU→FORT.
- `references/iteration-engine.md` — étape 4 : matrice **impact × effort**, routage **fuite → levier**, discipline « 1-3 pistes, pas un backlog », red-flags (pistes à refuser), DoD d'une piste.
- `references/output-and-handoff.md` — la sortie : `metrics/review.md` section-par-section + DoD, MAJ `state.md`, passage de relais à l'étape 19, modes d'échec globaux.

## Contrat (lit / écrit)
| Lit | Écrit |
|---|---|
| `deploy/log.md` (déploiement étape 17 — tracking actif, URL en ligne) | `metrics/review.md` — **le bilan** (template `assets/templates/metrics-review.md`) |
| tracking **PostHog** (funnel, rétention, cohortes) | `.saas-factory/state.md` — étape 18 done, point qui décroche, piste n°1 |
| tracking **Sentry** (erreurs, crashs, santé) | |
| `product/*` (le PRD — le **workflow cœur** attendu) | |
| `product/pricing.md` (l'hypothèse de conversion de l'étape 6) | |

Si un input attendu manque (tracking absent, PRD introuvable, Stripe non branché), **dis-le** dans le bilan plutôt que de combler. Jamais de secret ni de clé dans ces fichiers (`_shared/safety-rails.md` §4).

## Procédure
### 1. Activation (funnel AARRR) — via PostHog
Acquisition → **Activation** (le « moment magique » atteint ?) → Rétention → Revenu → Référence. **Où ça décroche ?** L'activation est la métrique reine d'un micro-SaaS : si le workflow cœur n'est réalisé qu'une fois par une minorité, tout le reste est secondaire. → GATE de suffisance, requêtes exactes, ordre de lecture, cas limites : `references/reading-procedure.md` · définitions + benchmarks : `references/metrics-framework.md`.

### 2. Santé / erreurs — via Sentry
Taux d'erreur, crashs, endpoints/écrans fragiles, régressions post-deploy. Un décrochage de funnel a souvent une cause de santé (une erreur silencieuse sur l'écran d'activation). → quoi lire, comment relier une erreur à une marche de funnel : `references/reading-procedure.md`.

### 3. Écart à l'attendu — confronter à l'intention
Compare au PRD (le **workflow cœur** est-il vraiment utilisé, ou les gens font-ils autre chose ?) + au pricing (la conversion tient-elle l'hypothèse de l'étape 6 ?). **Nomme les tensions honnêtement** (façon opportunity-brief) : ne moyenne pas un bon et un mauvais signal. → matrice de confrontation + recette forcing (MOU→FORT) : `references/gap-analysis.md`.

### 4. Pistes d'itération — 1 à 3, priorisées
**1 à 3** pistes **priorisées** (impact × effort), **pas un backlog**. Chacune reliée à **une** métrique visée + **un** changement testable (falsifiable). Une piste sans métrique cible ou sans test est une opinion, pas une piste. → matrice impact×effort, routage fuite→levier, red-flags, DoD : `references/iteration-engine.md`.

## Garde-fous
- **Honnêteté avant réconfort** — on nomme les mauvais chiffres, on ne les lisse pas (`_shared/lessons.md`).
- **Pas de fausse précision** — pas de « conversion 7,4 % » sur 40 visiteurs ; un ordre de grandeur assumé vaut mieux qu'un chiffre faussement exact.
- **Pas de kill/continue ici** — cette décision appartient à l'étape 19. Le bilan **informe** la porte, il ne la franchit pas.
- **Budget de boucle** (`_shared/safety-rails.md` §7) — si les données sont trop minces pour trancher, ne boucle pas indéfiniment : dis-le et propose « attendre plus de trafic » vs « itérer sur une hypothèse ».

## Sortie & état
`metrics/review.md` (template). Mets à jour `.saas-factory/state.md`. Résume (activation + le point qui décroche + la piste n°1). Annonce l'**étape 19** (retro & kill/continue). → DoD + passage de relais : `references/output-and-handoff.md`.
