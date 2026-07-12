# Gates — Phase 5 : gestion des portes

La Phase 5 est la phase la plus sensible du pipeline : **elle publie et elle dépense**. Deux portes (une interne à 16, une majeure à 17) plus le canary. Ce fichier dit ce que chaque 🚪 **décide**, comment la présenter, et où renvoient les refus.

## Principe : une porte = une décision utilisateur, en clair + preuve
On ne fait **jamais** lire un artefact technique pour décider. On présente **quoi / où / coût / réversibilité** en langage business + une preuve (URL de preview, coût chiffré, checklist verte), puis on demande un **OK explicite** (`AskUserQuestion`). L'OK est **tracé** dans `state.md`. Aucune généralisation d'un OK à une action ultérieure.

## Porte 1 — Gate humain de publication du contenu (`16-seo`, interne)
- **Décide** : est-ce que ces pages SEO **peuvent être publiées** ? (On ne publie pas de contenu public sans OK — safety §1.)
- **Preuve présentée** : nombre de pages ≤ plafond dur, chaque page PASS au self-assessment Helpful Content / E-E-A-T, pas de cannibalisation, technique verte (`unlighthouse`).
- **Retour si refus** : corrige/retire les pages fautives (plafond, contenu creux, cannibalisation) **avant** d'enchaîner 17. Ne passe pas à 17 avec du contenu non validé.
- **Note** : l'**indexation réelle** ne se fait pas ici — elle se fait au **déploiement (17)**. Ce gate valide le *contenu*, pas la mise en ligne.

## Porte 2 — Porte de publication (`17-deploy`, majeure — plan-then-apply)
- **Décide** : **on met en ligne en production, maintenant, avec ce plan** ? C'est le feu vert **technique** au cutover (au-delà de la décision « ship » produit de l'étape 15 — les deux sont distincts).
- **Pré-condition** : pré-vol **vert** (build/tests OK, livret sans `FAIL` bloquant, secrets en env, migrations prod idempotentes, rollback testé). Pré-vol rouge ⇒ **la porte ne s'ouvre pas**.
- **Plan présenté** : domaine prod, promotion de la version staging (SHA figé), changement DNS, **coût chiffré**, réversibilité (rollback N-1 en une commande).
- **OK explicite requis** avant **tout** apply. Jamais de publication sans réponse.
- **Retour si refus / à ajuster** (coût, domaine, timing) : rester en **sandbox**, ajuster le plan, **re-présenter** la porte. Aucun apply tant que pas d'OK.

## Contrôle 3 — Canary (`17-deploy`, post-apply, pas une porte utilisateur)
- **Vérifie** : pages clés à 200, parcours cœur OK en prod, pas de pic d'erreurs Sentry, Core Web Vitals OK.
- **Sain** → la mise en ligne est confirmée : URL live + tracking actif → fin de phase.
- **Dégradé / échec** → **rollback** vers version N-1 + log honnête, diagnostic, re-plan. **Pas de faux succès** (safety §6). On ne laisse jamais la prod dégradée.

## Graphe des décisions & retours arrière

```
 15-client-review ──Ship──▶ [Phase 5]
        │
        ├─Itérer─▶ reboucle Phase 4        (hors P5)
        └─Stop───▶ archive + mémoire       (hors P5)

 16-seo · gate contenu
   OK tracé ──────────▶ 17-deploy
   Refus ─────────────▶ corriger/retirer pages ─▶ re-gate

 17-deploy · pré-vol
   vert ──────────────▶ porte publication
   rouge ─────────────▶ correctif (→ éventuellement Phase 4) ─▶ re-pré-vol

 17-deploy · porte publication
   OK explicite ──────▶ apply ─▶ canary
   Refus/Ajuster ─────▶ ajuster plan (sandbox) ─▶ re-présenter porte

 17-deploy · canary
   sain ──────────────▶ Fin Phase 5 ▶ Phase 6
   échec ─────────────▶ rollback N-1 + log ─▶ re-plan ─▶ re-apply
   accès manquant ────▶ repli honnête (guide pas-à-pas), pas de faux succès
```

## Traçabilité (obligatoire)
À chaque porte franchie, inscris dans `.saas-factory/state.md` : (porte, décision, date). Un OK de porte déjà inscrit **ne se redemande pas** à la reprise (state-resume.md). Jamais de secret/clé dans l'état ni dans les logs (safety §4).
