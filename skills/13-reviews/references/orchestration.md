# Référence — Orchestration de la cascade (parallèle, par fichiers, bornée)

Comment **toi, orchestrateur** (`Task`), pilotes N features montant leur cascade **en parallèle**, sans mémoire (tout se lit dans les `status/`), sous **budget**. La mécanique du cran-par-cran est dans `cascade-protocol.md` ; ici c'est la **conduite d'ensemble**.

## Principe : tu ne juges pas, tu achemines
Tu ne rends **aucun verdict** toi-même. Tu :
1. Repères les features `DEV-DONE` (`status/<feature>.md`).
2. Lances le **cran courant** de chaque feature via `Task` (l'agent-persona du cran).
3. **Lis le verdict** écrit dans `status/` (jamais en mémoire, jamais dans la conversation).
4. **Achemines** selon la décision (voir matrice).
5. Décrémentes le **budget** à chaque retour dev.
6. Reportes au **livret de test** (`_shared/test-dossier.md`).

## Machine à états de l'orchestrateur (par feature)
```
                 lit status/<feature>.md
                          │
              ┌───────────┴───────────┐
              │ état == DEV-DONE ?     │
              └───────────┬───────────┘
                          │ oui
                          ▼
        ┌─────────────────────────────────────────┐
        │  lance le CRAN COURANT (Task → persona)  │◄─────────────┐
        └───────────────┬─────────────────────────┘              │
                        │ lit le verdict écrit dans status/       │
          ┌─────────────┼───────────────┬──────────────┐         │
          ▼             ▼               ▼              ▼         │
        PASS         CONCERNS          FAIL          WAIVED       │
          │             │               │              │         │
   cran suivant   loge + monte    budget ?        loge + monte    │
   (ou VALIDÉE     (comme PASS)     ├─ reste → RETOUR DEV ────────┘
    si CEO)                          │            (re-grimpe cran 1)
                                     └─ épuisé → DONE_WITH_CONCERNS
                                                  (remonte, ne boucle pas)
```

## Matrice d'acheminement (verdict → action orchestrateur)
| Verdict au cran N | Action | Cran résultant |
|---|---|---|
| `PASS` (cran < CEO) | monte | cran N+1 |
| `PASS` au **CEO** | **feature validée** | ✅ fin de cascade |
| `CONCERNS` | loge la réserve (pour client-review) + **monte** (non bloquant) | cran N+1 |
| `WAIVED` | loge la dérogation (justifiée) + **monte** | cran N+1 |
| `FAIL` (budget restant) | écris le rejet (`rejection-contract.md`) → **retour dev (12)** | re-grimpe cran 1 |
| `FAIL` (budget épuisé) | `DONE_WITH_CONCERNS` + loge le trou → **remonte** | sort de la boucle |
| Feature `BLOCKED` (dépendance/accès) | ne lance pas le cran ; loge + remonte | en attente |

## Budget d'itération (anti-boucle-infinie)
- Le **plafond** vient de l'étape 10 (attaché par feature) et vit dans `.saas-factory/state.md` (« Budget d'itération · Cascade (13) »).
- **Une unité de budget = un retour dev** (un `FAIL` qui renvoie à l'étape 12). Les montées `PASS/CONCERNS/WAIVED` ne coûtent rien.
- À **chaque** retour dev : décrémente + note le tour dans `status/`.
- **Épuisé** : la feature est marquée `DONE_WITH_CONCERNS`, le trou restant est logué précisément, on **remonte** (l'humain tranchera au client-review, étape 15). **Jamais** de tour silencieux supplémentaire (anti-pattern kairo, `_shared/lessons.md`).

## Parallélisme (features indépendantes)
- Chaque feature monte **sa** cascade indépendamment ; une feature en boucle **ne bloque pas** les autres.
- **Zones disjointes** (`_shared/lessons.md` §4 : 1 feature = 1 lane). Deux features ne se corrigent jamais dans la même zone en même temps.
- Tu suis l'avancement **en lisant les `status/`**, pas en mémorisant — c'est ce qui rend la Phase 4 **reprenable** (le master relit l'état et repart où on en était).

## Data-flow — de la cascade au livret de test
Chaque verdict de cran **alimente** le livret tenu par le QA Analyst (`_shared/test-dossier.md`) :
```
status/<feature>.md  ──(verdicts par cran)──►  qa/test-booklet.md
   tech-lead  → type "fonctionnel"
   cto        → types "sécuritaire" + "technique"   [SÉCU] tracé
   designer   → type "design / UX / a11y"
   ceo        → type "métier / conformité PRD"
```
Le QA Analyst lit les `status/*` et **consolide** dans `qa/test-booklet.md`. Traçabilité BMAD : chaque verdict ↔ un critère d'acceptation du PRD.

## Sortie de l'orchestrateur (fin d'étape 13)
1. **Liste** les features par état final : ✅ *validées CEO* · 🔁 *encore en boucle* · ⚠️ *`DONE_WITH_CONCERNS`* (avec le trou logué).
2. Mets à jour `.saas-factory/state.md` (cran atteint par feature + budget consommé).
3. **Résume** honnêtement (validées / en boucle / concerns) — pas de succès simulé (`safety-rails` §6).
4. Annonce l'**étape 14** (faux-client, test global A→Z).

## Modes d'échec de l'orchestration
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Suivi en mémoire** | tu « te souviens » du cran d'une feature | Relis toujours `status/` — source de vérité unique, reprenable |
| **Boucle infinie** | une feature re-grimpe sans fin | Budget décrémenté à chaque retour dev → `DONE_WITH_CONCERNS` à épuisement |
| **Blocage global** | une feature bloque toutes les autres | Parallélisme : features indépendantes, zones disjointes |
| **Correction au cran** | un cran « corrige » au lieu de renvoyer | HARD GATE : ici on valide ; corrections → étape 12 uniquement |
| **Concerns perdus** | réserves non tracées | Loguer chaque `CONCERNS`/`WAIVED` pour le client-review (étape 15) |
| **Succès simulé** | tout marqué validé alors qu'il reste des trous | Repli honnête : lister les `DONE_WITH_CONCERNS` avec le trou réel |
