# Référence — Extraction des exigences techniques (mouvement 2)

Procédure **normée** : dériver de façon reproductible les **exigences non-fonctionnelles (NFR)** de chaque feature. C'est ce qui justifiera tous les choix de stack et d'architecture. Sans cette grille, l'archi serait « au feeling ».

## Principe
On ne devine pas les exigences : on passe une **grille fixe** sur chaque feature / user story. La grille = les caractéristiques **ISO/IEC 25010** (standard qualité logicielle) filtrées pour un micro-SaaS, croisées avec les piliers **Well-Architected** (AWS/Azure). Pour chaque case : l'exigence existe-t-elle ? à quel niveau ? d'où vient-elle (quelle US / quel élément du PRD) ?

## La grille — 8 axes
Pour **chaque feature Must / Should** du PRD, renseigne :

1. **Sécurité & données** — données sensibles / PII ? auth & rôles requis ? multi-tenant (isolation par client) ? conformité (RGPD, secteur régulé) ? surface d'attaque (upload, paiement, webhook, saisie libre) ?
2. **Performance / rapidité** — latence attendue (temps réel < 100 ms ? interactif < 1 s ? asynchrone OK ?) ; volumétrie (taille des données, nb d'éléments par écran) ; opérations lourdes (appel LLM, génération PDF, media).
3. **Efficacité / coût** — coût par opération (appels LLM, stockage, egress) ; quotas / rate-limits ; ce qui doit être caché ou mutualisé pour tenir le coût.
4. **Scalabilité** — charge attendue (utilisateurs concurrents, pics) ; ce qui doit scaler horizontalement ; travaux en arrière-plan (queues, jobs).
5. **Fiabilité / disponibilité** — criticité (une panne = perte de données ? d'argent ?) ; idempotence requise (paiement, webhooks) ; reprise sur erreur ; SLA implicite.
6. **Maintenabilité / évolutivité** — points d'extension prévisibles ; couplage à éviter ; ce qui changera souvent (provider LLM, intégration tierce).
7. **Intégrations / interopérabilité** — APIs tierces attendues (tirées de `idea-brief` : écosystème) ; formats d'échange ; webhooks entrants / sortants ; auth déléguée (OAuth).
8. **Contraintes plateforme** — web / mobile / desktop ? offline / local-first ? i18n ? accessibilité ? navigateurs / OS cibles.

## Procédure (déterministe)
1. Liste les features **Must + Should** depuis `product/mvp-definition.md` et `product/feature-prioritization.md`.
2. Pour chaque feature, parcours les **8 axes** ; note l'exigence **et sa source** (US / critère d'acceptation / élément du PRD). Pas de source → ce n'est pas une exigence, c'est une hypothèse (labellise `[Hypothèse]`).
3. **Agrège** au niveau produit : les exigences transverses qui reviennent partout (auth, multi-tenant, i18n, paiement) deviennent des **exigences socle** (elles cadrent l'archétype).
4. **Classe** chaque exigence : **dure** (contrainte non négociable → pilotera un choix de stack au mouvement 4) vs **molle** (souhait → n'impose rien).
5. Écris la **matrice des exigences** dans `tech/architecture.md` (section 2).

## Sortie — la matrice des exigences
| Feature | Sécurité/données | Perf | Coût | Scalab. | Fiabilité | Maintenab. | Intégrations | Plateforme |
|---|---|---|---|---|---|---|---|---|
| (feature) | (exigence + source + dur/mou) | … | … | … | … | … | … | … |

Puis, sous la matrice : la liste des **exigences socle** (transverses) et la liste des **exigences dures** (celles qui piloteront le mouvement 4).

## Honnêteté
- Labellise `[Exigence]` (tracée à une US), `[Hypothèse]` (déduite, à confirmer), `[Défaut]` (couvert par la stack par défaut sans exigence spéciale).
- Un axe sans exigence pour une feature = **case vide assumée** : ne fabrique pas un besoin qui n'existe pas. La sur-ingénierie naît des exigences inventées.

## Sous-questions de sondage (par axe)
Pour chaque axe, la question exacte à te poser sur la feature. Si aucune sous-question ne « mord », l'axe est **case vide assumée** pour cette feature. Recette d'auto-interrogation complète : `forcing-questions.md §2`.

| Axe | Sonde | Si ça mord → c'est une exigence |
|---|---|---|
| Sécurité/données | manipule-t-on des PII/paiement/secrets ? qui a le droit de lire/écrire ? d'où entrent les données non fiables ? | classe **dure** (souvent `[SÉCU]`) |
| Perf/rapidité | latence attendue (temps réel <100 ms / interactif <1 s / async OK) ? volumétrie par écran ? opération lourde (LLM/PDF/media) ? | dure si une latence-cible est sourcée |
| Coût | coût par opération (tokens LLM, egress, stockage) ? ce qui doit être caché/mutualisé ? | dure si le coût menace la viabilité |
| Scalabilité | charge/pics sourcés dans le PRD ? travail de fond (queues) ? | dure **seulement** si un signal de charge existe |
| Fiabilité | une panne = perte d'argent/de données ? idempotence requise (paiement/webhook) ? | dure pour tout ce qui touche argent/données |
| Maintenabilité | qu'est-ce qui changera souvent (provider LLM, intégration) ? couplage à éviter ? | oriente vers réversibilité, rarement « dure » |
| Intégrations | quels outils tiers **nommés** (idea-brief) ? webhooks entrants/sortants ? OAuth délégué ? | dure si une feature Must en dépend |
| Plateforme | web/mobile/desktop ? offline/local-first ? i18n ? a11y ? | dure si non-web ou offline imposé |

## Classer dur vs mou (matrice de tranche)
Voir `decision-matrices.md §1`. En bref : sourcé + non négociable → **dur** (pilote M4) ; souhait sourcé → **mou** (n'impose rien) ; non sourcé → `[Hypothèse]` ; PII sans ligne sécurité → **dur + `[SÉCU]`** (une omission de sécurité n'est jamais « case vide »).

## Micro-exemple de ligne de matrice (niche-agnostique)
Feature « génération de résumé » (US-12 : *un membre colle un texte, reçoit un résumé en < 5 s ; 50 gén./jour/plan*) :

| Axe | Exigence extraite |
|---|---|
| Sécurité | texte = donnée utilisateur, RLS par tenant · `[Exigence]` US-12 · **dure** |
| Perf | résultat < 5 s → appel LLM **async** avec statut · `[Exigence]` · **dure** |
| Coût | ~1 500 tokens out/gén ; cache des entrées identiques + quota 50/jour/plan · `[Exigence]` · **dure** |
| Scalab. | pas de charge concurrente sourcée → **case vide assumée** |
| Fiabilité | échec LLM → retry borné + message ; pas d'argent en jeu → mou |
| Intégrations | aucune tierce → case vide |
| Plateforme | web, i18n si public → `[Défaut]` |

Trois exigences **dures** en sortent (RLS, async, coût/quota) : ce sont elles qui piloteront M4.

## Modes d'échec (voir `edge-cases.md`)
- **Exigence inventée** (E2) : perf/scalabilité « au cas où » sans source → bruit, supprime.
- **Sécurité omise** : PII sans ligne sécurité → **remonte-la** taggée `[SÉCU]`, ce n'est jamais une case vide.
- **Tout coché « dur »** : si toutes tes cases sont dures, tu n'as pas trié → re-passe, garde « dur » pour le non-négociable sourcé.
