# Cascade de validation — convention partagée

La boucle de validation multi-niveaux, **100 % agent-à-agent**. Signature de la méthode : chaque feature monte une cascade de validation, chaque niveau **boucle jusqu'à satisfaction** avant de passer au suivant. **Zéro intervention utilisateur** — tous les rôles sont des agents-personas. L'humain ne voit le produit qu'à la toute fin (client-review / déploiement).

> **Paramétrée** par l'étape 10 (`10-execution-plan` : critères d'acceptation + budget par feature). **Exécutée** en Phase 4 (build + reviews + validation métier).

## Les niveaux (de bas en haut)
1. **Développeur** (agent `feature-dev`) — développe la feature en **TDD**, la teste contre ses **critères d'acceptation** (issus du PRD, attachés par l'étape 10). Boucle : pas satisfait → re-développe / corrige / re-teste. Satisfait → monte d'un cran.
2. **Tech Lead** (agent) — vérifie qualité de code, cohérence d'intégration, respect de l'architecture. Pas satisfait → **loop-back** au développeur (avec commentaires **actionnables**, pas « refais »). Satisfait → monte.
3. **CTO** (agent) — vérifie architecture, **sécurité** (OWASP/STRIDE, `security-review` vendoré), performance, dette. `FAIL` → **retour dev**. `PASS` → monte.
4. **Designer** (agent) — vérifie la **conformité `DESIGN.md`** (tokens, composants, hiérarchie), l'**UX** (états) et l'**accessibilité** (WCAG 2.1 AA, `accessibility-review` vendoré). `FAIL` → **retour dev**. `PASS` → monte.
5. **CEO** (agent) — vérifie la **conformité métier / produit** au PRD : la feature résout-elle le vrai besoin, respecte-t-elle le workflow cœur et l'edge ? `FAIL` → **retour dev**. `PASS` → feature **validée**.

> Verdict de chaque cran au format unifié `PASS / CONCERNS / FAIL / WAIVED` + confiance 1-10 + **preuve citée** (voir `skills/13-reviews/references/verdict-schema.md`). Vérif cross-modèle `codex` **optionnelle** (opt-in, jamais imposée).

## Règles
- **Chaque niveau boucle jusqu'à satisfaction** avant de monter.
- **Rejet → retour dev** : un `FAIL` à **n'importe quel cran** (Tech Lead, CTO, Designer ou CEO) renvoie la feature au **développement** (étape 12) avec le **contexte du pourquoi** — quoi / où `fichier:ligne` / pourquoi-impact / quoi faire (jamais « refais ») ; elle **re-grimpe ensuite toute la cascade**. Règle exigeante = qualité maximale (protocole : `skills/13-reviews/references/cascade-protocol.md`).
- **Budget d'itération** (attaché par l'étape 10) : chaque boucle a un plafond + un critère de sortie. Budget épuisé → on **loge l'état**, on marque la feature `DONE_WITH_CONCERNS` et on continue (pas de blocage infini ; l'humain tranchera au client-review final).
- **Agent-à-agent.** Le CEO ici = un **agent-persona** qui juge la conformité métier, **pas l'utilisateur**. Toute la cascade tourne **sans charge utilisateur**.
- **Communication async par fichiers** : chaque niveau écrit son verdict dans `status/NN-<feature>.md` (niveau, verdict, commentaires, n° d'itération). Jamais par la conversation.
- **Vérification adversariale** : chaque validateur cherche à **réfuter**, pas à valider par complaisance (cf. `_shared/lessons.md`).

## Où c'est utilisé
- **Étape 10** attache, par feature : critères d'acceptation + DoD + budget d'itération.
- **Phase 4** exécute : dev-loop (build+test, **étape 12**) · cascade **Tech Lead → CTO → Designer → CEO** (**étape 13**) · **faux-client A→Z** (étape 14) · **client humain** (étape 15).
