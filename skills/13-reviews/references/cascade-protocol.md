# Référence — Protocole de la cascade (rejet-qui-remonte)

La mécanique exacte de la boucle. Verdict au format `verdict-schema.md`.

> Compagnons : **`orchestration.md`** (conduite parallèle de N features, budget, data-flow vers le livret) · **`reviewer-playbooks.md`** (sous-procédure de chaque cran) · **`rejection-contract.md`** (format du `FAIL` actionnable).

## L'invariant
Une feature a un **cran courant** (dev → tech-lead → cto → designer → ceo). Elle **monte** d'un cran à chaque `PASS`. Elle **retombe au dev** à chaque `FAIL`, puis **re-grimpe depuis le premier cran de revue**.

> **Conditionnement par archétype (la chaîne ci-dessous est celle de `web-saas`, inchangée).** Le cran **Designer se juge sur une surface visuelle** ; pour un **`automation`** (headless, pas d'UI), il est **déclaré N/A** — verdict `N/A` tracé, **jamais un cran oublié en silence** — et l'edge (**boucle fermée + idempotence run ET entité**) est **porté par le CEO-persona**, exactement comme l'étape 10 l'a écrit dans la spec de validation de la feature (`skills/10-execution-plan/references/validation-spec.md` §Variante AUTOMATION). La chaîne automation est donc **Tech Lead → CTO → CEO-persona** (Designer = N/A). Un **`landing`** garde son cran Designer (il a des surfaces). Ne JAMAIS FAIL une feature automation pour « DESIGN.md non appliqué / pas d'empty-states / a11y » : c'est le **faux-négatif d'archétype** que ce conditionnement corrige (`_shared/state-schema.md` §socle-par-archétype).

> **`ecommerce` → chaîne COMPLÈTE + cran CTO renforcé.** Une boutique a des surfaces réelles (vitrine, fiche produit, panier, checkout) : chaîne **Tech Lead → CTO → Designer → CEO-persona** au complet — Designer **jamais** N/A (l'inverse du piège automation). **Et** le cran **CTO y est renforcé** : preuve exigée des 3 pièges de `_shared/archetypes/ecommerce.md` §Pièges — **P1** décrément stock atomique, **P2** prix recalculé serveur, **P3** webhook idempotent — un seul non prouvé = `FAIL`. Le **CEO-persona** y valide en plus le **workflow d'achat** et la **boucle fermée EC4** (confirmation client + notif marchand — aucune vente muette).

## Le cycle (par feature)
```
[dev-validée] → Tech Lead ─PASS→ CTO ─PASS→ Designer ─PASS→ CEO ─PASS→ ✅ VALIDÉE
                   │FAIL          │FAIL         │FAIL          │FAIL
                   └──────────────┴─────────────┴──────────────┘
                                  ▼
                   RETOUR DEV (étape 12, feature-dev)
                   + CONTEXTE du pourquoi (quoi / où fichier:ligne / pourquoi-impact / quoi faire)
                                  ▼
                   dev corrige → re-teste (recette) → DEV-DONE
                                  ▼
                   re-grimpe DEPUIS Tech Lead (cran 1)
```

## Règles
- **Retour dev** (ta règle) : un `FAIL`, où qu'il soit, renvoie au **développement** — sinon rien ne change. Le plus exigeant → qualité max.
- **Rejet contextualisé** : le cran qui `FAIL` écrit **le pourquoi** dans `status/<feature>.md` (quoi · où `fichier:ligne` · pourquoi/impact · quoi faire). **Jamais « refais »** — c'est ce qui permet au dev de corriger *utile* et fait converger la boucle.
- **Preuve obligatoire** (anti-hallucination, `verdict-schema.md`) : pas de ligne citée → pas de veto.
- **`CONCERNS` ≠ `FAIL`** : une réserve non bloquante **passe** (logue-la pour le client-review) ; seul `FAIL` renvoie au dev. `WAIVED` = dérogation tracée.
- **Adversarial** : chaque cran cherche le défaut (`_shared/lessons.md` — pas de complaisance).
- **Budget** : tours comptés → épuisé → `DONE_WITH_CONCERNS`, remonte (l'humain tranche au client-review, étape 15). Pas de boucle infinie.
- **Parallélisme** : les features montent indépendamment ; une feature en boucle ne bloque pas les autres.
- **Cross-modèle optionnel** : `codex` en cross-check (si présent + activé), jamais imposé.
