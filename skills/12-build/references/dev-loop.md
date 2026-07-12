# Référence — Dev-loop (niveau DEV de la cascade)

Ce que fait **chaque dev-agent** sur sa feature, jusqu'à satisfaction.

## La boucle
1. **Test technique d'abord (TDD)** — écris le test qui échoue (`test-driven-development`, Iron Law : *NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST*). Regarde-le échouer pour la **bonne** raison.
2. **Implémente** le minimum pour passer au vert (YAGNI, pas de sur-ingénierie).
3. **Gate de compilation** — boucle `tsc` **avec le tsconfig STRICT du châssis** (`noUncheckedIndexedAccess` inclus) → **0 erreur** avant de rendre la feature. Le tsc **strict** n'est pas optionnel (voir « Gate de compilation » plus bas).
4. **Recette** — vérifie la feature contre **ses critères d'acceptation** (attachés par l'étape 10, issus des user stories) : comportement attendu + **cas limites**.
5. **Self-review** — relis ton diff (qualité, DRY, pas de secret, pas de sur-ingénierie).
6. **Boucle** : recette ou compilation KO → corrige → re-teste. **Jusqu'à ce que ta recette passe** (dans le budget d'itération).
7. **Commit** citant la tâche + écris `status/<feature>.md` (fait / reste / risques).

## Sortie du dev-loop
Une feature **dev-validée** : tests verts, recette OK, self-review OK. → prête à monter la cascade (**étape 13** : Tech Lead → CTO → Designer → CEO). **Le dev n'est PAS le juge final** : il livre ce qui passe **ses** critères ; les crans supérieurs valideront (et peuvent renvoyer en dev).

## Budget
Respecte le budget d'itération (`_shared/validation-cascade.md`) : épuisé → `DONE_WITH_CONCERNS` + remonte à l'orchestrateur (pas de boucle infinie — anti-pattern kairo).

---

## Machine à états du dev-loop
Ce que fait le dev-agent, cran par cran. Chaque flèche est franchie sur un **critère de passage** explicite, jamais « au feeling ».

```
        ┌──────────────────────────────────────────────┐
        │  RED   écris le test qui échoue (1 critère    │
        │        d'acceptation → 1+ test)               │
        └───────┬──────────────────────────────────────┘
                │ le test échoue pour la BONNE raison
                ▼                (pas erreur de compil / typo)
        ┌──────────────────────────────────────────────┐
        │ GREEN  implémente le minimum → test au vert    │
        └───────┬──────────────────────────────────────┘
                │ vert + suite complète verte (pas de régression)
                ▼
        ┌──────────────────────────────────────────────┐
        │ COMPILE  tsc STRICT (tsconfig châssis) → 0 err │
        └───────┬──────────────────────────────────────┘
                │ 0 erreur type (noUncheckedIndexedAccess inclus)
                ▼
        ┌──────────────────────────────────────────────┐
        │ RECETTE  passe la liste des critères + cas     │
        │          limites (voir catalogue plus bas)     │
        └───┬───────────────────────────┬──────────────┘
            │ tout OK                    │ un critère KO
            ▼                            ▼
        ┌────────────┐          budget restant ?
        │ SELF-REVIEW│           ├─ oui → retour RED/GREEN sur le trou
        └───┬────────┘           └─ non → DONE_WITH_CONCERNS (loge le trou)
            │ diff propre
            ▼
        ┌────────────────────────────────────────────┐
        │ COMMIT (cite la tâche) + status/<feature>.md│
        │ → état DEV-DONE                              │
        └────────────────────────────────────────────┘
```

Invariant : on ne passe jamais de RED directement à RECETTE (pas de code sans test rouge d'abord), ni de GREEN à RECETTE tant que le `tsc` **strict** n'est pas à 0 erreur, ni de RECETTE à COMMIT tant qu'un critère est KO **et** qu'il reste du budget.

## Critères de passage (condition → autorisé à avancer)
| Étape | Critère de passage vérifiable | Sinon |
|---|---|---|
| RED → GREEN | Le test échoue en s'exécutant, sur l'assertion visée (pas sur un import cassé) | Corrige le test, re-run. Un rouge « faux » ne prouve rien |
| GREEN → COMPILE | Test cible **vert** + **toute** la suite verte (0 régression) | Répare la régression avant de continuer |
| COMPILE → RECETTE | `tsc` avec le **tsconfig strict du châssis** → **0 erreur** (`noUncheckedIndexedAccess` inclus) | Corrige les erreurs de type avant de recetter — un tsc rouge n'avance pas |
| RECETTE → SELF-REVIEW | Chaque critère d'acceptation coché + catalogue de cas limites parcouru | Boucle sur le trou (budget permettant) |
| SELF-REVIEW → COMMIT | Aucun red-flag de la checklist DoD (secret, TODO bloquant, sur-ingénierie) | Corrige avant commit |

## Matrice de décision — pendant la boucle
| Condition observée | Action |
|---|---|
| Test rouge attendu passe **du premier coup** (sans code écrit) | Le test ne teste rien d'utile → réécris-le pour qu'il échoue vraiment |
| Critère d'acceptation **ambigu / contradictoire** dans le brief | Ne devine pas silencieusement : loge l'hypothèse dans `status/`, implémente la lecture la plus défendable, tag `[À-CLARIFIER]` |
| Il faut toucher une **zone hors de ta lane** pour finir | STOP. Ne franchis pas la frontière (collision). Loge la dépendance dans `status/`, marque `BLOCKED`, remonte au Tech Lead |
| Il manque une **clé / un accès** (BDD, API) | Repli honnête (`safety-rails` §6) : `BLOCKED` + guide pas-à-pas dans `status/`, ne bluffe pas un succès |
| La feature « marche » mais un **cas limite** casse | Reste dans la boucle : cas limite KO = recette KO |
| Tu es tenté d'ajouter une option « pour plus tard » | YAGNI : ne l'écris pas. Le plan (étape 10) est le périmètre |
| Budget d'itération **épuisé**, recette encore KO | `DONE_WITH_CONCERNS` : loge précisément le trou restant + remonte. Pas de tour supplémentaire silencieux |
| Un **secret** est nécessaire au code | Variable d'env, jamais en dur. Documente le nom de la variable dans `status/`, pas sa valeur |

## Gate de compilation (le tsc strict n'est pas optionnel)
Retour de run réel : des dev-agents ont **ignoré le tsconfig strict du châssis** → 19 erreurs concentrées dans un helper, invisibles tant qu'on ne compile pas avec les bons flags.

- **Compile avec le tsconfig du projet**, pas un tsc relâché à toi. Le châssis active `strict: true` **et** `noUncheckedIndexedAccess` (`tab[i]` est `T | undefined` → il faut le gérer) : lance `npm run typecheck` (= `tsc --noEmit`) **à la racine du projet**, jamais un `tsc` d'un dossier isolé qui masquerait les flags.
- **0 erreur, pas « moins d'erreurs »** : le gate est binaire. Un helper qui indexe un tableau/objet sans garde (`?.`, `if (x)`, `?? défaut`) échouera — c'est voulu, corrige-le.
- **Ne désactive rien pour passer** : pas de `// @ts-ignore`, pas de `any` de contournement, pas de `!` non-null gratuit, pas d'édition du tsconfig. Ce sont des red-flags de self-review.
- **Le vrai build reste au-dessus de toi** : ton gate `tsc` est le minimum par-feature ; la porte de compilation de l'org lance le **build réel de l'archétype** (`next build` + `lint` pour `web-saas`) après merge — un défaut qui **passe tsc mais casse `next build`** (ex. `export const` dans un fichier `"use server"`) y sera pris (cf. étape 14, `qa-engine.md`). N'attends pas la QA pour ce qui se voit ici.

## Recette — recette de forcing-question (comment trancher « c'est bon ? »)
La recette n'est pas « ça a l'air de marcher ». Contre chaque critère d'acceptation, force la preuve.

- **Ask exact** (à te poser, par critère) : *« Quel test/observation prouve que CE critère est satisfait, cas limites inclus ? »*
- **Push-until** (critère d'arrêt) : tu t'arrêtes quand **chaque** critère d'acceptation a une **preuve exécutée** (test vert ou observation reproductible) — pas avant.
- **Red-flags — réponses à refuser à toi-même** :
  - « le happy-path passe » (et les cas limites ?)
  - « je l'ai testé à la main une fois » (pas reproductible → pas une preuve)
  - « ça devrait marcher » (spéculation, pas exécution)
  - « le test est vert » alors que le test n'assure pas le critère (test tautologique / mocké à outrance)
- **MOU vs FORT** :
  - MOU : *« La validation du formulaire fonctionne. »*
  - FORT : *« Champ vide → message d'erreur inline ; email malformé → rejet ; 201 en succès ; doublon → 409. 4 tests verts, cités dans status. »*
- **Routage par cas** : critère prouvé → coche ; critère non prouvable en l'état (dépendance) → `BLOCKED` + remonte ; critère hors périmètre découvert → loge, ne l'implémente pas de ton propre chef.

## Definition-of-Done (checklist dev-loop, avant COMMIT)
- [ ] Chaque critère d'acceptation du brief a **≥ 1 test** qui le couvre, **vert**.
- [ ] La suite **complète** est verte (aucune régression introduite).
- [ ] **`tsc` strict du châssis** (`npm run typecheck`, `noUncheckedIndexedAccess` inclus) → **0 erreur**, sans `@ts-ignore`/`any`/`!` de contournement ni tsconfig modifié.
- [ ] Le **catalogue de cas limites** (ci-dessous) applicable a été parcouru et couvert.
- [ ] **Aucun secret** en dur, en log, ou commité (`safety-rails` §4).
- [ ] Diff **DRY**, pas de sur-ingénierie, pas de code mort ni `console.log`/`print` de debug.
- [ ] Pas de `TODO`/`FIXME` **bloquant** laissé sans être logué dans `status/`.
- [ ] Travail **confiné à la zone** de la lane (aucun fichier d'une autre feature touché).
- [ ] Respect de `tech/architecture.md`, `_shared/stack-defaults.md`, `DESIGN.md` ; surface UI → **0 marqueur** des interdits binaires de `_shared/design-doctrine.md` (landing : conformité `_shared/landing-playbook.md`).
- [ ] Commit(s) **citant la tâche** ; `status/<feature>.md` à jour (fait / reste / risques / `[SÉCU]`).

## Catalogue de cas limites (à balayer, niche-agnostique)
Le happy-path ne suffit jamais. Pour chaque feature, passe la liste et garde ce qui s'applique.
- **Entrée** : vide · trop longue · caractères spéciaux/unicode/emoji · injection (`'; --`, `<script>`) · nombres négatifs/zéro/overflow · date hors bornes · fichier vide/énorme/mauvais type.
- **Auth / autorisation** : non authentifié · authentifié mais non autorisé (ressource d'un autre user) · session expirée · rôle insuffisant.
- **État** : ressource inexistante (404) · doublon/conflit (409) · action déjà effectuée (idempotence) · liste vide (empty state) · pagination (page 0, au-delà de la fin).
- **Concurrence** : deux requêtes simultanées sur la même ressource · double-submit.
- **Réseau / dépendance** : timeout · API tierce en erreur/500 · réponse partielle · retry.
- **Frontière numérique** : 0, 1, N, N+1 ; premier/dernier élément.
- **Locale / i18n** (si public) : fuseau horaire, séparateur décimal, RTL, chaîne non traduite.

## Modes d'échec du dev-loop (et parade)
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Test tautologique** | Vert immédiat, prouve rien | Le test doit d'abord échouer pour la bonne raison (RED réel) |
| **Boucle infinie** | On re-corrige sans converger | Budget d'itération : épuisé → `DONE_WITH_CONCERNS`, on remonte |
| **Scope creep** | La feature grossit au-delà du brief | YAGNI + périmètre = plan étape 10 ; loge l'idée hors-scope, ne la code pas |
| **Franchissement de zone** | Tu édites le code d'une autre lane | STOP → `BLOCKED` + remonte ; jamais deux devs sur une zone |
| **Secret en dur** | Clé/API dans le diff | Variable d'env ; purge l'historique si déjà commité |
| **Régression cachée** | La feature passe, une autre casse | Toujours faire tourner la suite **complète**, pas seulement ton test |
| **tsconfig strict ignoré** | tsc local vert, mais 19 erreurs au typecheck racine (`noUncheckedIndexedAccess`) | Compile avec le **tsconfig du châssis** (`npm run typecheck`) ; gère les accès indexés, ne contourne pas |
| **Passe tsc, casse `next build`** | `export const` dans `"use server"`, import serveur en client… tsc OK, build KO | Le gate par-feature est tsc ; la **porte org lance `next build`** (étape 14). Anticipe les règles de build de l'archétype, ne les repousse pas à la QA |
| **Bluff de succès** | `DONE` alors qu'un critère est KO/bloqué | Repli honnête : `BLOCKED`/`DONE_WITH_CONCERNS` + le vrai état |
| **Flaky test** | Vert/rouge selon les runs (temps, ordre, réseau) | Rends-le déterministe (fake le temps/réseau) ou marque-le `[FLAKY]` dans status ; ne masque pas |

## Micro-exemple (niche-agnostique)
Critère d'acceptation : *« un utilisateur connecté peut créer une entrée ; une entrée vide est refusée. »*
1. **RED** : `test("crée une entrée valide → 201")` puis `test("entrée vide → 400")`. Les deux échouent (endpoint absent).
2. **GREEN** : route + persistance minimales → les deux verts.
3. **COMPILE** : `npm run typecheck` → le châssis strict signale `entries[0]` possiblement `undefined` → garde `?.`/`?? défaut`. 0 erreur.
4. **RECETTE** : + cas limites du catalogue → *non-authentifié → 401*, *entrée d'un autre user non lisible → 403/404*, *titre 10 000 chars → 400*. 3 tests de plus, verts.
5. **SELF-REVIEW** : pas de secret, pas de `console.log`, pas de `@ts-ignore`/`any` de contournement, DRY OK.
6. **COMMIT** « feat(entries): create + validation (T7) » + `status/07-entries.md` : *Fait : CRUD create + 5 tests. Reste : —. Risques : rate-limit non couvert (hors périmètre, logué).*
