# Référence — Porte « le plan est soldé, prouvé par exécution » (P0.1)

> **PROBLÈME (constat fondateur {2026-07}).** Le pipeline **perd des exigences entre le plan et le code sans trace** : sur le booking coiffeur, les 2 items **[SÉCU]** du plan (purge RGPD, rate-limit) ont **disparu** avec une passe d'intégration jamais exécutée, et la « validation » s'est faite **par lecture** (1 fichier de test, **0 E2E** du parcours cœur, tests rouges du plan jamais committés). Résultat : un produit déclaré fini que personne n'a fait tourner de bout en bout.

**Cette référence est la SOURCE UNIQUE des critères de la porte « plan soldé ».** L'étape **12** (passe d'intégration, Tech Lead) **produit et pré-remplit** le registre ; l'étape **14** (faux-client / QA) le **vérifie, l'exécute et le signe** avant le verdict global. Ni 12 ni 14 ne redéfinissent les critères ailleurs — ils **renvoient ici**.

## Le registre de solde — `tech/plan-ledger.md`
Un artefact court, à haute densité de preuve. **Écrit par l'étape 12** (au moment de la passe d'intégration), **relu + signé par l'étape 14**. Frontière propre (comme `status/*` entre 12 et 13) : 12 pose les lignes, 14 les **exécute** et appose son verdict — 14 n'invente pas les lignes, 12 ne s'auto-signe pas conforme.

Une ligne **par item `[SÉCU]`** ET **par tâche d'intégration** de `tech/execution-plan.md`, plus les **tests exigés par le plan** :

| Item (réf. plan) | Type | Statut | Preuve (fichier:ligne / commit / test) | Si repoussé : raison tracée + où |
|---|---|---|---|---|
| T12 — purge RGPD | `[SÉCU]` | fait | `supabase/migrations/00xx_purge.sql` + test `tests/security/purge.spec.ts` vert | — |
| T12 — rate-limit anon | `[SÉCU]` | repoussé | — | hors budget MVP → **décision humaine** loguée `state.md` + `CONCERNS` (jamais silencieux) |
| Passe d'intégration A→Z | intégration | fait | trace `e2e/parcours-coeur.zip` verte sur `main` | — |
| Tests T5 (rouges TDD) | test | fait | `git ls-files tests/` → présents et committés | — |

## Les 3 conditions de la porte (binaires, bloquantes)
La porte est **FERMÉE** (→ `NON CONFORME`, retour build) si **une seule** de ces conditions échoue :

1. **Aucun `[SÉCU]` perdu.** Chaque item `[SÉCU]` du plan a **une ligne** dans le registre. `fait` **exige** une référence fichier (et, pour un `[SÉCU]` testable, un test qui le prouve — pas une simple relecture du diff). `repoussé` **exige** une raison tracée **et une décision humaine** consignée (`state.md` + `CONCERNS`). Un `[SÉCU]` **sans ligne**, ou `fait` **sans fichier**, ou `repoussé` **sans trace** = porte **FERMÉE**. *(Rappel : un `[SÉCU]` ne se `WAIVE` jamais sur épuisement de budget sans décision humaine explicite — `verdict-and-routing.md`.)*
2. **Tests du plan committés (fichiers, pas prose).** Les tests que le plan nomme (rouges du TDD à l'étape 10/12, recettes) existent comme **fichiers versionnés** — vérifié par `git ls-files`, pas par « c'est décrit ». Un plan qui exigeait des tests et n'en a **aucun** committé = porte FERMÉE.
3. **≥1 E2E du parcours cœur réellement exécuté.** Au moins **un** test E2E (Playwright) qui joue le **parcours cœur** de bout en bout est **exécuté et vert** sur `main` à jour **avant** la porte — trace jointe. La preuve est l'**exécution**, jamais la lecture du code.

## La règle d'or — preuve par exécution, pas par relecture
« Fait » n'est **jamais** coché sur lecture d'un diff. On coche `fait` quand : (a) le fichier existe (référencé), **et** (b) pour tout ce qui est exécutable, un test/parcours le **prouve en tournant**. C'est la parade directe au péché du booking coiffeur (« la logique semble correcte » → produit inerte en prod).

Commandes de vérification (à joindre au registre) :
```
git ls-files tests/ e2e/ supabase/migrations/   # les tests/migrations du plan sont-ils committés ?
npx playwright test e2e/parcours-coeur.spec.ts   # l'E2E du parcours cœur tourne-t-il VERT ?
```

## Conditionnement par type (renvoi, pas de copie)
Le **parcours cœur** existe pour **tous** les types — un outil interne/perso a lui aussi un job cœur à prouver par E2E. Ce qui **varie** (E2E « upgrade/billing » exigé seulement si public + billing ; pas de landing marketing en interne/perso) suit la **matrice canonique** : **route selon `skills/saas-factory/references/routing.md`** (lignes `12-build` et `14-qa`). Ne recopie pas la matrice ici — seul le calibrage de profondeur est local.

## Forcing-question — « le plan est-il vraiment soldé ? »
- **Ask exact** : « Chaque `[SÉCU]` du plan a-t-il une ligne *fait (fichier) / repoussé (raison tracée)* ? Les tests du plan sont-ils des **fichiers committés** ? Le parcours cœur a-t-il **tourné vert** (trace), pas seulement été relu ? »
- **Push-until** : la porte n'ouvre que quand les **3 conditions** sont vertes avec **preuve d'exécution** — registre complet, `git ls-files` non vide sur les tests du plan, trace E2E cœur verte sur `main`.
- **Red-flags (à refuser)** :
  - « Le rate-limit, on le fera au deploy » sans ligne `repoussé` tracée → `[SÉCU]` perdu, porte FERMÉE.
  - « Les tests sont écrits » alors que `git ls-files` ne les trouve pas → non committés, ne comptent pas.
  - « J'ai relu le parcours, il est bon » sans trace Playwright → relecture ≠ exécution.
  - Registre auto-signé par 12 sans exécution en 14 → la frontière producteur/vérificateur est cassée.

## Exemplaire MOU vs FORT
- ❌ **MOU** : « Le plan est implémenté, tout est là, la sécu est gérée. »
- ✅ **FORT** : « **Plan soldé : porte OUVERTE.** Registre `tech/plan-ledger.md` : 2/2 `[SÉCU]` tracés (purge RGPD *fait* → `migrations/0007_purge.sql` + `tests/security/purge.spec.ts` vert ; rate-limit anon *repoussé* → décision humaine `state.md`, logué `CONCERNS`). Tests du plan : `git ls-files tests/` = 11 fichiers committés. E2E cœur : `e2e/reserver-vers-agenda.spec.ts` **vert** sur `main` (trace jointe). »

## Modes d'échec (et parade)
| Mode | Symptôme | Parade |
|---|---|---|
| **`[SÉCU]` évaporé** | Un item sécu du plan absent du code, aucune trace | Registre exhaustif : **une ligne par `[SÉCU]`**, sans ligne = porte FERMÉE. |
| **Report silencieux** | « on le fera plus tard » jamais consigné | `repoussé` **exige** raison tracée + décision humaine (`state.md` + `CONCERNS`). |
| **Faux « testé »** | Tests décrits dans le plan, aucun fichier committé | `git ls-files` fait foi ; prose ≠ fichier versionné. |
| **Vérif par lecture** | « la logique est bonne » sans exécution | ≥1 E2E cœur **exécuté vert** (trace) avant la porte ; on ne coche pas `fait` sur un diff lu. |
| **Auto-signature** | 12 se déclare soldé sans passe 14 | Frontière : 12 pose, 14 **exécute et signe**. |

## Definition-of-Done de la porte (portée en 14, avant le verdict global)
- [ ] `tech/plan-ledger.md` existe et couvre **chaque** `[SÉCU]` + **chaque** tâche d'intégration du plan (aucune ligne manquante).
- [ ] Chaque `[SÉCU]` : `fait (fichier)` **ou** `repoussé (raison tracée + décision humaine)` — zéro `[SÉCU]` sans ligne, zéro `fait` sans fichier.
- [ ] Tests du plan **committés** (`git ls-files` non vide là où le plan en exigeait).
- [ ] ≥1 **E2E du parcours cœur exécuté vert** sur `main` (trace jointe) — preuve par exécution.
- [ ] Calibrage par type respecté (E2E upgrade/billing si public+billing) — **selon `skills/saas-factory/references/routing.md`**.
