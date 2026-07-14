# Référence — Les 4 gates de revue (une lentille chacun)

Chaque cran applique le **même gabarit** (`code-reviewer.md` de superpowers) avec une **lentille** différente, et rend son verdict au **format `verdict-schema.md`** (`PASS/CONCERNS/FAIL/WAIVED` + confiance 1-10 + **preuve citée**).

> Ce fichier donne la **lentille** de chaque cran (le quoi). La **sous-procédure exhaustive** de chaque cran (ordre de lecture, critères de passage, forcing-question, DoD, cas limites, modes d'échec) est dans **`reviewer-playbooks.md`** — c'est là qu'on va pour *exécuter* un cran. Le contrat du rejet est dans `rejection-contract.md`, la conduite parallèle dans `orchestration.md`.

## Gabarit commun (superpowers `requesting-code-review/code-reviewer.md`)
Structure d'analyse : *Strengths · Critical · Important · Minor*. On le clone pour chaque cran en changeant la **lentille d'attention** — sans pré-juger les findings (le cran raise, la **preuve** tranche). Verdict final au format unifié.

## Cran 1 — Tech Lead (`agents/tech-lead.md`)
**Qualité code + intégration + fonctionnel** : DRY, lisibilité, patterns du projet, pas de sur-ingénierie ; cohérence avec le châssis (`_shared/blocks/`) et les autres features ; comportement conforme à la user story.
> Catégories « bug qui passe la CI mais casse en prod » (façon gstack `/review`) : races/concurrence, complétude d'enum, time-window, trust-boundary d'une sortie LLM.

## Cran 2 — CTO (`agents/cto.md`)
**Architecture + sécurité + fonctionnel** : respect de `tech/architecture.md`, couplage, perf, dette ; **sécurité** via le moteur vendoré `{PLUGIN_ROOT}/vendor/security-review/.claude/commands/security-review.md` (exécuté sur le diff — playbook CTO) + `owasp-cards.md` (OWASP / STRIDE / LLM / Agentic, **exploit concret par finding**, tag `[SÉCU]`) ; conformité comportementale. *(Cross-check `codex` optionnel ici.)*
> **Traçabilité `[SÉCU]` → registre de solde.** Tout `[SÉCU]` (levé ici ou hérité du plan `tech/execution-plan.md`) doit être **soldé**, jamais perdu : il atterrit dans le registre `tech/plan-ledger.md` (*fait (fichier) / repoussé (raison tracée + décision humaine)*, posé à la passe d'intégration de l'étape 12) et la **porte « plan soldé »** de l'étape 14 **ferme** si un `[SÉCU]` est sans ligne (`skills/14-qa/references/plan-solde-gate.md`, P0.1).

## Cran 3 — Designer (`agents/designer.md`)
> **`automation` (headless) → cran N/A** (verdict `N/A` tracé, la feature monte au CEO-persona qui porte l'edge boucle fermée + idempotence) — jamais un `FAIL` pour absence de surface. `web-saas` / `landing` → cran complet ci-dessous. Cf. `cascade-protocol.md` §Conditionnement + `agents/designer.md`.

**Conformité `DESIGN.md` + UX + accessibilité + anti-slop/convergence** : tokens / composants / hiérarchie visuelle, **états** (loading / vide / erreur / succès), parcours clair ; **a11y** via le moteur vendoré `{PLUGIN_ROOT}/vendor/accessibility-review/SKILL.md` (exécuté — playbook Designer ; WCAG 2.1 AA : contraste, clavier, cibles 44px, lecteur d'écran) ; **anti-slop + porte distinctiveness** via la checklist binaire de `_shared/design-doctrine.md` (**19 points**), passée **point par point** sur le rendu desktop + mobile — dont **rationale par page tenu** (18 : la surface correspond à sa ligne « intention » de `DESIGN.md`) et **`prefers-reduced-motion` respecté** (19). **Un marqueur coché = `FAIL`** → retour dev (pas de rustine ponctuelle).

## Cran 4 — CEO (`agents/ceo.md`)
**Fonctionnel / métier (final)** : la feature résout-elle le **vrai besoin** du PRD ? Respecte-t-elle le **workflow cœur** et l'**edge** ? A-t-elle du sens **pour la cible** ? Consomme les **critères d'acceptation** (du PRD) → verdict de **conformité PRD**. Dernière validation avant le faux-client (étape 14).

> Tous les crans sont **adversariaux** (chercher le défaut) et respectent le **gate anti-hallucination** (`verdict-schema.md` : pas de preuve citée → finding supprimée). Un `FAIL` = **retour dev avec le contexte du pourquoi**.
