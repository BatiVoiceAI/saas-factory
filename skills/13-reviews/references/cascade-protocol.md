# Référence — Protocole de la cascade (rejet-qui-remonte)

La mécanique exacte de la boucle. Verdict au format `verdict-schema.md`.

> Compagnons : **`orchestration.md`** (conduite parallèle de N features, budget, data-flow vers le livret) · **`reviewer-playbooks.md`** (sous-procédure de chaque cran) · **`rejection-contract.md`** (format du `FAIL` actionnable).

## L'invariant
Une feature a un **cran courant** (dev → tech-lead → cto → designer → ceo). Elle **monte** d'un cran à chaque `PASS`. Elle **retombe au dev** à chaque `FAIL`, puis **re-grimpe depuis le premier cran de revue**.

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
