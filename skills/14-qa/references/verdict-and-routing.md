# Référence — Verdict global & routage (étape 6)

Comment trancher le **verdict global** de l'étape 14 et router : conforme → étape 15 (client humain) · non conforme → retour cascade/dev, dans le **budget d'itération**. Verdict au format `skills/13-reviews/references/verdict-schema.md` (`PASS/CONCERNS/FAIL/WAIVED` + confiance + **preuve citée**).

## Machine à états du verdict global
```
          ┌──────────────────────────────────────────────┐
          │  Passe 1 (features seules) + Passe 2 (A→Z)    │
          │  + Éval IA + Sync-doc  → résultats consolidés  │
          └───────────────────────┬──────────────────────┘
                                   ▼
                        ┌──────────────────┐
                        │  Trancher chaque  │
                        │  constat (matrice)│
                        └───────┬───────────┘
              tous PASS/         │        ≥1 FAIL bloquant
              CONCERNS           │
             ┌───────────────────┴───────────────────┐
             ▼                                        ▼
     ┌───────────────┐                     ┌─────────────────────┐
     │  CONFORME     │                     │  NON CONFORME        │
     │  → étape 15   │                     │  → régressions +     │
     │ (client humain)│                     │  retour cascade/dev  │
     └───────────────┘                     └──────────┬───────────┘
                                                      ▼
                                        budget d'itération épuisé ?
                                     ┌─────────non─────┴────oui──────┐
                                     ▼                               ▼
                          re-boucle (dev→cascade→14)      DONE_WITH_CONCERNS :
                                                          logue l'état, remonte,
                                                          l'humain tranche (étape 15)
```

## Matrice de décision — verdict global
| État consolidé | Verdict global | Routage |
|---|---|---|
| Toutes features Must `PASS` seules + tous parcours cœur A→Z `PASS` + éval OK + doc synchro | **CONFORME** | → **étape 15** (client humain). Concerns loguées transmises. |
| Idem mais des `CONCERNS` non bloquants (cosmétique, mobile, micro-copy, edge rare) | **CONFORME avec réserves** | → étape 15 **avec la liste des réserves** (l'humain décide de leur poids). |
| ≥1 feature Must cassée seule, ou ≥1 parcours cœur A→Z cassé, ou régression de prompt critique | **NON CONFORME** | → régressions générées + **retour cascade/dev** (étapes 13/12) avec contexte. |
| Parcours #0 (arrivée réelle) en échec — OTP non reçu/non saisissable, onboarding qui ne crée pas l'entité cœur, dashboard vide — ou verdict « **démo creuse** » | **NON CONFORME** (bloquant) | → retour cascade/dev : un produit qui atterrit sur du vide ne se montre **jamais** au client (étape 15). |
| Bug **sécurité** (injection rendue, accès non autorisé, secret exposé) | **NON CONFORME** (bloquant) | → **retour dev via cran CTO** (tag `[SÉCU]`), jamais `WAIVED` sans décision humaine explicite. |
| Divergence doc/code trouvée | **corrigée sur place** (sync-doc) | Ne bloque pas le verdict si le code est bon ; documente la cause (`lessons.md`). |
| Budget d'itération épuisé, `FAIL` résiduels non critiques | **DONE_WITH_CONCERNS** | Logue l'état, remonte à l'étape 15 ; l'humain tranche « ship en l'état vs continuer ». |
| Dépendance manquante / flux non testable (KYC, paiement réel) | **BLOQUÉ honnêtement** | Repli honnête (`safety-rails` §6) : stoppe, documente, guide pas-à-pas. Pas de faux vert. |

## Définition — quand une non-conformité renvoie au dev
Un constat renvoie au dev **seulement si** :
1. Il touche un critère d'acceptation **Must** du PRD, **et**
2. Il est **reproductible** (pas un flaky), **et**
3. Il a une **preuve citée** (screenshot/trace/log — pas « ça semble fragile »), **et**
4. Le contexte du **pourquoi** est fourni (quoi / où / pourquoi-impact / quoi faire).

Sinon → au plus `CONCERNS` (logué pour l'humain), jamais un veto. *(Même gate anti-hallucination que la cascade : pas de preuve → pas de `FAIL`.)*

## Contextualiser le retour dev (rappel — ta règle)
Chaque non-conformité renvoyée porte :
- **quoi** (le défaut, gravité) · **où** (parcours + écran/route) · **pourquoi** (impact utilisateur concret) · **quoi faire** (correction attendue) · **régression** (chemin du test rouge qui reproduit).
- **Jamais « refais »** — sinon le dev ne peut rien corriger d'utile et la boucle tourne dans le vide.
- Bug de **jonction** → fournir le **parcours entier** (l'amont), pas juste l'écran d'arrivée.

## Budget d'itération (borne la boucle)
- Le budget est attaché par l'étape 10 (`_shared/validation-cascade.md`). Chaque tour dev→cascade→14 le décrémente.
- **Épuisé** → on **loge l'état**, on marque les résidus `DONE_WITH_CONCERNS`, on **remonte** à l'étape 15 (l'humain tranche « ship vs continuer vs stop »). **Pas de boucle infinie** (anti-pattern, `lessons.md`).
- **Exception dure** : un bug **sécurité** ou une **perte de données** ne se `WAIVE` pas sur épuisement de budget → escalade explicite à l'humain, même hors budget.

### Forcing-question — « conforme, vraiment ? »
- **Ask exact** : « Chaque parcours cœur passe-t-il **bout-en-bout avec preuve** ? Chaque `FAIL` est-il soit corrigé, soit tracé en `CONCERNS` avec l'accord de le remonter ? »
- **Push-until** : ne prononce **CONFORME** qu'une fois **toute** feature Must et **tout** parcours cœur au vert (ou réserve explicitement non bloquante et loguée).
- **Red-flags (à refuser)** :
  - « Globalement ça marche » sans preuve par parcours → pas un verdict.
  - Déclarer conforme alors qu'un parcours cœur est rouge → **interdit** (c'est le dernier filtre avant l'humain).
  - `WAIVED` sur un bug sécu/perte de données sans décision humaine → **interdit**.
  - Vouloir « juste corriger vite fait » un bug soi-même → non : le faux-client constate, la cascade corrige (HARD GATE).

### Exemplaire MOU vs FORT (verdict global)
- ❌ **MOU** : « Le produit a l'air conforme, quelques petits trucs à voir, on peut montrer au client. »
- ✅ **FORT** : « **Verdict : CONFORME avec 2 réserves.** Passe 1 : 7/7 features Must `PASS` (preuves : `qa/report.md`). Passe 2 : 3/3 parcours cœur A→Z `PASS` (traces jointes). Éval IA : gold set du résumé 18/20, aucune régression de prompt. Sync-doc : provider LLM corrigé dans `CLAUDE.md` (divergence loguée `lessons.md`). **Réserves (`CONCERNS`, non bloquantes, → étape 15)** : (1) CTA sous la ligne de flottaison en 375px ; (2) message d'erreur paiement un peu générique. 4 régressions ajoutées. → **Prêt pour l'étape 15**. »

## Definition-of-done de l'étape 14 (avant de prononcer le verdict)
- [ ] Passe 1 : toutes features Must jouées seules, 4 états balayés, verdict + preuve chacune.
- [ ] Passe 2 : tous parcours cœur A→Z joués bout-en-bout, jonctions vérifiées, ≥1 perturbation par parcours.
- [ ] Parcours #0 (arrivée réelle) joué en **premier** : OTP réellement reçu et saisi, entité cœur créée à l'onboarding, dashboard non-vide, verdict « **pro et complet** » prononcé (« démo creuse » = NON CONFORME).
- [ ] Cas limites transverses balayés (`edge-cases-catalog.md`).
- [ ] Éval IA : gold sets passés, aucune régression de prompt critique (si features IA).
- [ ] Sync-doc : `CLAUDE.md`/`README`/`state.md` confrontés au code, divergences corrigées + causes loguées.
- [ ] Chaque bug → **régression générée** + retour dev contextualisé.
- [ ] `qa/report.md` rempli (template) + livret `qa/test-booklet.md` alimenté (colonnes fonctionnel/intégration/global).
- [ ] Verdict global tranché (matrice) + réserves listées pour l'étape 15.
- [ ] `.saas-factory/state.md` mis à jour.

## Modes d'échec du verdict (et parade)
| Mode | Symptôme | Parade |
|---|---|---|
| **Faux CONFORME** | Prononcé sans preuve par parcours | Exige trace/screenshot par parcours cœur avant de conclure. |
| **Veto sans preuve** | `FAIL` « ça semble fragile » | Gate anti-hallucination : pas de ligne/écran cité → pas de veto. |
| **Boucle infinie** | On re-boucle sans fin sur des mineurs | Respecte le budget ; épuisé → `DONE_WITH_CONCERNS`, remonte à l'humain. |
| **Waiver silencieux d'un bug sécu** | Sécu classé « non bloquant » pour avancer | Interdit : sécu/perte de données → escalade humaine explicite. |
| **Correction en douce** | Le faux-client patche le bug lui-même | HARD GATE : constate, ne corrige pas. Retour cascade/dev. |
| **Concerns perdues** | Réserves non transmises à l'étape 15 | Toute `CONCERNS` va dans le rapport + le livret → suit jusqu'au client-review. |
