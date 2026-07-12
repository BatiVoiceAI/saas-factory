# Référence — Moteur QA (navigateur, régression, éval, sync-doc)

Les mécaniques d'exécution derrière le faux-client : navigateur réel, génération de régression, éval IA, resynchro doc. *(Le « quoi tester » est dans `fake-client-protocol.md` + `integration-journeys.md` + `edge-cases-catalog.md` ; le « comment l'outillage marche » est ici.)*

## Gate de compilation — BUILD RÉEL de l'archétype (avant tout test navigateur)
Premier filtre, avant d'ouvrir un navigateur : **le produit doit se builder pour de vrai**. Retour de run réel : un `export const` dans un fichier `"use server"` **passe `tsc --noEmit`** mais **casse `next build`** — un gate limité à `tsc` l'aurait laissé filer jusqu'au client.

- **Lance le build de l'archétype, pas `tsc` seul** : pour `web-saas`, `npm run build` (= `next build`) **+** `npm run lint` (= `next lint`). `tsc --noEmit` reste utile mais **ne suffit pas** — le bundler applique des règles que le typecheck ignore (`"use server"`/`"use client"`, imports serveur en client, exports interdits, résolution des routes).
- **Avec le tsconfig STRICT du châssis** (`noUncheckedIndexedAccess`) : si un `feature-dev` l'a contourné à l'étape 12, ça ressort ici. Ne relâche pas les flags pour « faire passer ».
- **Binaire, bloquant** : build ou lint KO = **`FAIL` produit** → retour dev (via cascade) **avant** la QA navigateur. Inutile de cliquer une app qui ne build pas.
- **Régression** : un build cassé se documente comme un bug (test/vérif de non-régression = le build lui-même dans la CI) ; note la cause (`_shared/lessons.md`, dérive « passe tsc / casse build »).

## Navigateur — Playwright (via `webapp-testing`)
Le faux-client teste dans un **vrai navigateur headless** via **Playwright**, en s'appuyant sur le skill **`webapp-testing`** (Anthropic, **Apache-2.0**) — la brique officielle pour écrire/exécuter des tests UI. *(À vendorer dans `vendor/webapp-testing/` — Apache-2.0, conserver LICENSE + PROVENANCE.)*
- Lance l'app en **staging** (sous-domaine provisionné à l'étape 11) ou en local.
- Clics, formulaires, navigation, assertions d'état, responsive, **screenshots sur échec**.

### Cible de test — matrice de décision (staging vs local)
| Situation | Cible | Pourquoi |
|---|---|---|
| Sous-domaine staging provisionné (étape 11) + déploiement à jour | **Staging** | Le plus proche du réel (build de prod, vrai réseau, vraie BDD sandbox). Défaut. |
| Staging indisponible / pas encore déployé | **Local** (`npm run dev` ou build local) | Ne pas bloquer la QA ; noter que staging reste à re-tester avant étape 17. |
| Feature dépend d'un service externe (paiement, mail) en mode test | Staging **avec clés sandbox** du provider | Le mode test du provider évite les vraies dépenses (`safety-rails` §2). |
| Écart staging vs local suspecté (bug d'env) | **Les deux** | Un bug qui n'apparaît qu'en staging = bug d'env → à documenter (sync-doc). |

### Ce que le navigateur doit capturer à chaque test
- **Screenshot** de l'écran clé (et **sur échec**, systématique).
- **Trace Playwright** (`trace.zip`) pour les parcours A→Z — rejouable, c'est la preuve la plus forte.
- **Console + réseau** : une erreur JS ou une réponse HTTP ≥ 400 non gérée = signal de bug même si l'UI « a l'air ok » (cf. mode d'échec « bug avalé »).
- **Viewport responsive** : au moins **mobile (375)** + **desktop** ; un breakpoint cassé est au minimum `CONCERNS`.

## Test de régression par bug (façon gstack `/qa`)
Tout bug trouvé → un **test automatisé** qui le reproduit est **ajouté** à la suite. Le bug corrigé ne peut plus revenir silencieusement.

### Sous-procédure (par bug, dans l'ordre)
1. **Reproduire à la main** dans le navigateur → confirmer le bug (pas d'hypothèse : un bug non reproduit ne se corrige pas).
2. **Écrire le test *rouge*** : un test Playwright qui **échoue** sur le comportement actuel et **passerait** sur le comportement attendu (issu du critère PRD). Le test encode l'attendu, pas le bug.
3. **Nommer + ranger** : `tests/regression/<feature>-<symptome>.spec.ts` (convention stable, retrouvable). Une ligne de commentaire = lien vers le critère d'acceptation PRD.
4. **Joindre au retour dev** : le chemin du test rouge fait partie du contexte envoyé à la cascade — le dev sait qu'il a corrigé quand le test passe **vert**.
5. **La suite s'accumule** : chaque bug laisse un test permanent. La régression grossit à chaque run — c'est voulu (mémoire qui compound).

### Matrice — quel test de régression écrire ?
| Type de bug | Niveau du test | Exemple |
|---|---|---|
| Comportement UI (bouton, formulaire, navigation) | **E2E Playwright** (parcours) | « Après double-clic sur *Payer*, une seule charge est créée. » |
| Jonction entre features (état qui transite mal) | **E2E multi-features** | « Le plan choisi à l'onboarding arrive correct sur la page billing. » |
| Sortie IA de mauvaise qualité | **Éval / gold set** (voir plus bas) | « Résumé d'un texte de 5 lignes reste ≤ 2 phrases. » |
| Régression de données / logique métier | **Test d'intégration** (API/service) | « Un devis à 0 € ne génère pas de facture. » |

## Éval-driven (features IA)
Pour les features à base de LLM : **gold sets** (entrées → sorties attendues), on vérifie que la qualité tient (pas de régression de prompt). Cf. `_shared/lessons.md` (éval-driven).

### Sous-procédure
1. **Identifie les features IA** : toute feature dont la sortie est générée par un LLM (résumé, classification, extraction, génération, chat).
2. **Constitue/charge le gold set** : 5-20 cas `entrée → sortie attendue (ou critère de qualité)`. Inclure des cas **limites** (entrée vide, hostile, ambiguë, très longue) — pas seulement des cas faciles.
3. **Barème par cas** : soit **exact** (classification → label attendu), soit **critère** (résumé → « ≤ N phrases, mentionne X, n'invente pas Y »). Un juge-LLM peut noter les critères flous, mais **adversarialement** (cherche l'échec).
4. **Compare à la baseline** : la version de prompt actuelle tient-elle le niveau de la précédente ? Toute **régression de prompt** (un cas qui passait et qui échoue) = bug → régression + retour dev.
5. **Trace la télémétrie par version de prompt** (`_shared/lessons.md` §7) : quel prompt, quel score, quelle date — pour détecter une dérive silencieuse.

### Red-flags éval (à refuser)
- Gold set **uniquement** de cas faciles → n'apporte aucune garantie. Exige des cas hostiles.
- Sortie IA jugée « bonne » **au feeling** sans critère écrit → pas un verdict.
- Hallucination / invention de fait dans la sortie → `FAIL` (même si « bien écrit »).
- Régression de prompt masquée par une moyenne : un cas critique qui casse **bloque** même si la moyenne monte.

## Sync-doc (crucial)
Vérifie que `CLAUDE.md` / `README` / `.saas-factory/state.md` **reflètent le code réel**. Si le code a divergé (ex. provider changé), **corrige la doc**. La dérive doc est une cause d'échec documentée (`_shared/lessons.md`). *(Support : l'agent `verifier`.)*

### Checklist sync-doc (ce qu'on confronte au code réel)
- **`README`** : commandes de lancement/test réelles ? URLs (staging/prod) à jour ? feature list = features livrées ?
- **`CLAUDE.md`** : stack réelle (provider LLM, BDD, framework) = ce qui tourne ? conventions décrites = conventions appliquées ?
- **`.saas-factory/state.md`** : étape courante, features `DONE`/`CONCERNS`, décisions de porte — cohérents avec la réalité ?
- **Variables d'env / config** : la doc liste-t-elle les vraies clés attendues (sans les valeurs, `safety-rails` §4) ?
- **Cause d'échec** : si une divergence est trouvée, **documente la cause** dans `_shared/lessons.md` (dérive doc = anti-pattern connu).

### Matrice — divergence doc/code
| Divergence détectée | Action |
|---|---|
| Doc décrit un comportement que le code n'a plus (ex. ancien provider) | **Corriger la doc** vers le code réel. Ne pas changer le code. |
| Code fait un truc que la doc n'annonce pas | **Ajouter à la doc**. Vérifier au passage que c'est voulu (sinon → bug). |
| Doc et code d'accord mais tous deux contredisent le PRD | **Ni l'un ni l'autre n'est l'attendu** → `FAIL` produit, retour dev (le PRD gagne). |
| Commande de lancement dans le README ne marche pas | Bug de doc **bloquant** (personne ne peut lancer le projet) → corriger + tester la commande. |

## Dépendance
Playwright doit être disponible (`npx playwright`). Absent → l'installer (dev dependency) ou signaler proprement (`_shared/safety-rails.md` — repli honnête, pas de faux succès).

### Modes d'échec outillage (et parade)
| Mode | Symptôme | Parade |
|---|---|---|
| **Gate de compilation sauté** | On teste le navigateur sans avoir buildé → `next build` casse plus tard | Lance le **build réel** (`next build` + lint) **avant** le navigateur ; build KO = `FAIL`, retour dev. |
| **Passe `tsc`, casse `next build`** | Typecheck vert, mais `export const` en `"use server"`, import serveur en client, etc. | Le gate doit être le **build de l'archétype**, pas `tsc --noEmit` seul. |
| **Playwright absent** | `npx playwright` échoue | L'installer en dev-dep ; si impossible → repli honnête (`safety-rails` §6), stoppe, documente, ne simule pas. |
| **Staging down** | Timeouts / 502 | Bascule local (matrice cible), note que staging reste à re-tester. |
| **Test flaky** | Passe/échoue aléatoirement | N'est pas une preuve. Rends-le déterministe (attentes explicites, état propre) avant de conclure. Un flaky masque un vrai bug de course. |
| **Données non isolées** | Un test pollue le suivant | Compte/état neuf par run (`fake-client-protocol.md` → « Données de test »). |
| **Secret en dur pour tester** | Tentation de coller une clé | Interdit (`safety-rails` §4). Env vars / clés sandbox uniquement. |
