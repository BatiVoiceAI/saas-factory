# Référence — Matrices de décision

Les tables *condition → action* du cadrage technique. Quand un cas rentre dans une ligne, applique l'action sans improviser. C'est ce qui rend l'architecture **reproductible** : deux projets aux exigences proches obtiennent la même stack.

## §0 — Renvoyer à la Phase 2 (le PRD n'est pas architecturable)
Déclenché en M1. Le HARD GATE interdit de combler un trou côté produit : si le PRD est cassé, on **s'arrête et on renvoie**, on ne re-spécifie pas.

| Condition observée dans le PRD | Bloquant ? | Action |
|---|---|---|
| Feature Must sans US ni critère d'acceptation | **oui** | renvoi Phase 2 : « la feature X n'a pas de comportement défini » |
| Workflow cœur sans entrée/sortie exploitables | **oui** | renvoi Phase 2 : nomme le workflow |
| Deux artefacts se contredisent (scope, paiement, plateforme) | **oui** | renvoi Phase 2 : cite les deux passages |
| Intégration citée sans nom d'outil | **oui** si feature Must en dépend | renvoi Phase 2 (sinon `[Hypothèse]` + avance) |
| Détail cosmétique manquant (libellé, micro-copy) | non | note `[Hypothèse]`, avance, ne bloque pas |
| Entité centrale nommable par déduction évidente | non | déduis, note `[Hypothèse]`, avance |

Règle : on renvoie **une fois, précisément** (liste des trous), on ne renvoie pas en boucle pour des vétilles. Le renvoi cite l'artefact fautif, pas « le PRD est flou ».

## §1 — Classer une exigence (dure vs molle)
Décide si une ligne de la matrice NFR pilotera un choix de stack (M4).

| Nature | Classe | Effet en M4 |
|---|---|---|
| Contrainte non négociable, sourcée à une US (latence-cible, PII, conformité, volumétrie prouvée) | **dure** | entre dans la liste qui pilote M4 (peut forcer un ADR) |
| Souhait/confort sourcé (« ce serait mieux si… ») | **molle** | n'impose **rien** — reste au défaut |
| Non sourcé (déduit sans preuve) | `[Hypothèse]` | n'impose rien ; à confirmer |
| Omission de sécurité (PII manipulées, aucune ligne sécu) | **dure + `[SÉCU]`** | remontée obligatoire, jamais « case vide » |

## §2 — Stratégie multi-tenant (choix structurant, high-stakes)
L'un des rares choix difficiles à défaire. Détail complet : `data-model.md`.

| Signal dans les exigences | Stratégie | ADR ? |
|---|---|---|
| Micro-SaaS B2B/B2C standard, isolation par client | **shared-table + `tenant_id` + RLS** (défaut) | non (défaut de l'archétype) |
| Exigence de conformité imposant une isolation physique (santé, secteur régulé) | **schema-per-tenant** ou base dédiée | **oui** (réversibilité difficile) |
| Données non tenantées (contenu public, référentiel partagé) | pas de RLS tenant sur ces tables | note dans le modèle |
| Doute | **shared-table + RLS** (défaut) + note d'incertitude | non |

## §3 — Réutiliser un bloc vs custom (le split 80/20)
Décidé en M3 pour **chaque** module. Alimente directement l'ordre du graphe de tâches (étape 10).

| Capacité du module | Décision | Bloc |
|---|---|---|
| Authentification, sessions, rôles, multi-tenant | **réutiliser** | `auth` |
| Repo + CI (lint/test/build/deploy) | **réutiliser** | `repo-ci` |
| Déploiement + sous-domaine + SSL | **réutiliser** | `hosting` |
| Layout, nav, tokens (mappe `DESIGN.md`), composants | **réutiliser** | `ui-shell` |
| CRUD standard sur une entité (+ RLS) | **réutiliser** | `crud` |
| Email transactionnel / notifs | **réutiliser** | `notifications` |
| Erreurs + activation | **réutiliser** | `observability` |
| Paiement (checkout/webhooks/portail) | **réutiliser** *(si le projet vend)* | `billing` |
| **Cœur métier différenciant (l'edge produit)** | **custom** | — (là va l'effort) |
| Une variation métier d'un CRUD (règles spécifiques) | **réutiliser `crud` + extension custom** | `crud` + custom |
| Doute | réutiliser si un bloc existe, custom sinon | — |

Règle du parallélisme (pour l'étape 10) : modules à **zones de code disjointes** = agents en parallèle ; modules **couplés** = même lane séquentielle. Le tableau réutiliser/custom **est** la carte de parallélisation.

## §4 — Défaut vs déviation, par catégorie de stack
Point de départ : `_shared/stack-defaults.md`. On ne dévie **que** si une exigence dure (§1) le prouve. Sinon → `[Défaut]`.

| Catégorie | Défaut | Déviation seulement si… | Sinon |
|---|---|---|---|
| Web full-stack | Next.js 15 (App Router, TS strict) | exigence non-web dure (desktop natif, offline-first) | `[Défaut]` |
| BDD + Auth | Supabase (Postgres, RLS, Auth) | isolation physique imposée · besoin non-relationnel prouvé | `[Défaut]` |
| Hébergement | Vercel | edge global dur · self-host imposé (coût/souveraineté) → Coolify/CF | `[Défaut]` |
| DNS + CDN | Cloudflare | — | `[Défaut]` |
| Email | Resend | délivrabilité/volume imposant Postmark | `[Défaut]` |
| IA structuration/vision | Gemini 2.5 Flash | qualité/format imposant GPT-4o · exigence de latence | `[Défaut]` |
| Transcription | Whisper / gpt-4o-transcribe | temps réel (Azure) · débit (Groq) | `[Défaut]` |
| Backend edge | Route API Next.js | latence edge globale dure → CF Workers + D1/KV | `[Défaut]` |
| Paiement | Stripe (web) | mobile natif → RevenueCat | `[Défaut]` (ou pas de paiement si le projet ne vend pas) |
| Obs / analytics | Sentry + PostHog | — | `[Défaut]` |
| Jobs/async | Worker (queue) déclenché par webhook/cron | — (le besoin async vient du data-flow, pas d'une techno) | modélise le job, reste sur l'infra par défaut |

Toute case « déviation » cochée = **un ADR** (`adr-template.md`). Budget : ≤ 1-2 déviations hors edge produit.

## §5 — Synchrone vs asynchrone (par opération du data-flow)
Décidé en M3 pour chaque opération lourde d'un workflow cœur.

| Caractéristique de l'opération | Traitement | Conséquence archi |
|---|---|---|
| < ~1 s, résultat attendu immédiatement | **synchrone** (route/handler) | rien de spécial |
| Lourde/longue (LLM, PDF, media, gros import) ou dépend d'un tiers lent | **asynchrone** (job + statut) | table de statut, worker, polling/realtime côté UI |
| Déclenchée par un événement externe (paiement, webhook tiers) | **asynchrone idempotent** | dédup par id d'événement, retries |
| Périodique (rappel, nettoyage, agrégat) | **cron** | job planifié, borne de charge |

Toute opération asynchrone **doit** apparaître comme point async explicite dans le data-flow **et** générer ses cas limites (double déclenchement, échec à mi-parcours, ordre des webhooks).

## §6 — Quand écrire un ADR (vs laisser à la Phase 4)
| Situation | ADR ? |
|---|---|
| Déviation de la stack par défaut | **oui** |
| Choix structurant irréversible/coûteux (modèle de données central, multi-tenant, provider critique) | **oui** |
| Compromis à impact produit | **oui** + taste decision (étape 10) |
| Détail réversible en 5 min (nom d'un dossier, lib utilitaire) | **non** (implémentation, Phase 4) |
| Choix entièrement couvert par le défaut | **non** (label `[Défaut]` suffit) |

## §7 — Quand arrêter de challenger (budget d'auto-interrogation)
Anti-boucle-infinie : le forcing sur soi-même a une limite (biais pour l'action, `lessons.md`).

| Situation | Action |
|---|---|
| Le défaut couvre l'exigence | **arrête**, verrouille `[Défaut]`, passe |
| Scenario Compare tranche nettement | acte l'ADR, avance |
| Deux options quasi équivalentes | choisis la **plus réversible**, logue le pourquoi, avance |
| Choix à goût produit non tranchable techniquement | **taste decision** loguée (étape 10 tranche), n'y reste pas |
| Inconnue qui dépend d'une donnée absente du PRD | `[Hypothèse]` + note « à confirmer en Phase 4 », avance |
