# Référence — Kill/Continue + mémoire qui compound

Le job « décider ». La rétro (`retro-procedure.md`) a produit les faits ; ici on **tranche** : itérer, tuer, ou parquer — sur un critère écrit, jamais au feeling. C'est l'application directe de la règle d'or (`_shared/lessons.md` §9 : « Kill explicite. Un critère écrit déclenche l'archivage d'une piste morte + un post-mortem de 5 lignes »).

## Sommaire

- Le critère de KILL (écrit, pas au feeling)
- Continue
- Post-mortem (si Kill) — exactement 5 lignes
- Mémoire qui compound (l'actif long terme)
- Machine à états de la décision
- Matrice de décision (condition → action)
- Recette forcing-question — la porte kill/continue
- La porte — `AskUserQuestion` (options exactes)
- Checklist definition-of-done (porte)
- Modes d'échec (porte) + parade

## Le critère de KILL (écrit, pas au feeling)
Un projet se tue sur un **critère explicite**, décidé d'avance (règle d'or §9 de `_shared/lessons.md` : kill explicite sur critère écrit). Exemples (à calibrer par projet) :
- **Pas de signal d'activation** après X semaines en ligne (personne n'atteint le moment magique).
- **Rétention nulle** (les gens essaient une fois et ne reviennent pas).
- **0 conversion** malgré du trafic qualifié.
- **Coût > valeur** durablement (le CAC dépasse la valeur).
Le critère est **écrit dans `state.md` au lancement** ; à l'étape 19, on le **confronte** aux métriques (étape 18).

## Continue
Signal présent (activation, rétention, premières conversions) → **itère** : les 1-3 pistes (déjà produites en 18) partent en **Phase 4** (build de la piste) — ou en **Phase 5** si c'est une simple relance/correctif déployable — puis re-déploiement via 17, et **re-mesure (18) après**. Jamais « réamorcer 18 » directement : re-mesurer sans avoir rien changé est une boucle à vide (routage canonique : `phase-6-after/references/gate-and-state.md`).

## Post-mortem (si Kill) — exactement 5 lignes
1. Le produit en une phrase.
2. Le **fait qui tue** (le critère atteint).
3. Ce qu'on a appris (le point non évident).
4. Ce qui **aurait pu** changer la donne.
5. Statut : `Kill` + date.
Archive propre (façon dossier `Echec/`). Sans dramatiser.

## Mémoire qui compound (l'actif long terme)
Chaque leçon → une ligne dans `~/.saas-factory/learnings.jsonl` :
`{leçon, confiance (1-10), source (ce projet), date, transverse ?}`.
Si **transverse** (vaut pour tout projet futur) → **remonte-la dans `~/.saas-factory/lessons-learned.md`** (lue au démarrage par le master, en plus de `_shared/lessons.md` livré avec le plugin — jamais d'écriture dans le répertoire du plugin). C'est le mécanisme qui rend SaaS Factory **meilleur à chaque cycle**. (Procédure détaillée : `memory-compound.md`.)

---

## Machine à états de la décision

```
                 ┌──────────────────────────────────────────────┐
                 │  Confronter le critère (state.md) aux chiffres │
                 │            (metrics/review.md)                 │
                 └───────────────────────┬──────────────────────┘
                                         ▼
                     ┌───────────────────────────────────┐
                     │  Critère de KILL atteint ?         │
                     └───────┬───────────────────┬───────┘
                    OUI, net │                   │ NON, signal présent
                             ▼                   ▼
                     ┌──────────────┐    ┌────────────────┐
             ambigu →│  Zone grise  │    │   CONTINUE     │
                     │ (ni l'un ni  │    │ budget d'itér. │
                     │  l'autre)    │    │ borné → P4/P5  │
                     └──────┬───────┘    └────────────────┘
                            ▼
                     ┌──────────────┐
                     │ PAUSE / PARK │  (ressources ailleurs, réévaluer à date fixe)
                     └──────────────┘
                            │
        toutes branches ────┴───> AskUserQuestion (décision explicite) ──> MAJ state.md
```

## Matrice de décision (condition → action)

| Confrontation critère × métriques | Décision par défaut | Action concrète |
|---|---|---|
| Critère de kill **atteint**, sans ambiguïté | **Kill** | post-mortem 5 lignes + archive `Echec/` + leçons dans `learnings.jsonl` |
| Signal clair (activation OK, rétention qui plafonne > 0, 1res conversions) | **Continue** | repartir en **Phase 4** (nouvelle piste) ou **Phase 5** (relance/correctif) avec **budget d'itérations borné** (`safety-rails` §7) et 1-3 pistes ; re-mesure (18) après re-déploiement |
| Signal faible mais **une piste testable non essayée** reste | **Continue borné** (1 cycle) | tester la piste, re-confronter au prochain passage ; noter que c'est le dernier essai |
| Zone grise durable, énergie/ressources requises ailleurs | **Pause/park** | geler proprement, fixer une **date de réévaluation**, écrire l'état dans `state.md` |
| Critère jamais écrit au lancement | **Ne pas trancher à l'aveugle** | écrire le critère *maintenant* (honnête), l'appliquer, noter la leçon « critère manquant » |
| Métriques insuffisantes (trop peu de trafic pour juger) | **Continue** (mesurer plus) | prolonger la fenêtre de mesure ; ne pas killer sur un échantillon vide |
| Coût récurrent > valeur, durablement | **Kill** | même si l'ego résiste : le fait tue, cf. red-flags |

## Recette forcing-question — la porte kill/continue

- **Ask exact** : « Le critère de kill écrit au lancement était : *{cite `state.md`}*. Les chiffres actuels sont *{cite `metrics/review.md`}*. Le critère est-il atteint : **oui / non / ambigu** ? »
- **Push-until** (critère d'arrêt) : ne pas clore tant qu'il n'y a pas **une décision nommée** (Continue / Kill / Pause) **adossée au critère écrit**. « On verra » n'est pas une décision.
- **Red-flags — réponses à refuser** :
  - « On continue, ça va finir par marcher. » sans piste testable ni signal → acharnement ; renvoyer au critère.
  - « Le critère était trop sévère, en fait il n'est pas atteint. » → **déplacement des poteaux** (mode d'échec) : le critère se juge tel qu'écrit, pas réécrit après coup.
  - « On kill, c'est nul. » ton dramatique → un kill est une **libération d'énergie**, pas un échec ; documenter froidement.
  - Continue **sans** budget d'itérations → viole `safety-rails` §7 (boucle infinie) ; imposer un plafond.
- **Routage par cas** :
  - Utilisateur veut Continue mais critère atteint → présenter l'écart noir sur blanc, laisser trancher (`AskUserQuestion`), mais **acter** que c'est contre le critère.
  - Utilisateur veut Kill mais un signal réel existe → vérifier qu'on ne tue pas un début de PMF ; proposer un dernier cycle borné avant Kill.
  - Indécision → **Pause/park** avec date de réévaluation, plutôt qu'un faux Continue mou.

**Exemplaire MOU vs FORT** (même situation : rétention D30 ≈ 0 après 8 semaines, critère de kill = « rétention nulle ») :
- ❌ MOU : « La rétention est basse mais on a des idées, continuons encore un peu. »
- ✅ FORT : « Critère de kill (state.md) : *rétention nulle à 8 semaines*. Mesure : D30 ≈ 0, courbe qui tend vers 0 (pas de plateau → pas de PMF). **Critère atteint → Kill.** Post-mortem rédigé, 3 leçons capitalisées (dont 1 transverse). Décision froide : ça libère l'énergie pour le prochain. »

## La porte — `AskUserQuestion` (options exactes)

Présenter **bilan + critère + décision par défaut recommandée**, puis proposer :
- **Continuer** — itérer avec budget borné, 1-3 pistes reliées chacune à une métrique (build en Phase 4 ou relance en Phase 5 ; re-mesure en 18 après re-déploiement).
- **Kill** — arrêter proprement : post-mortem 5 lignes + archive `Echec/`.
- **Pause / park** — geler avec date de réévaluation.

Ne jamais franchir sans réponse explicite. La recommandation par défaut vient de la matrice ci-dessus ; l'utilisateur tranche.

## Checklist definition-of-done (porte)

- [ ] Critère de kill **cité tel qu'écrit** dans `state.md` (pas reformulé pour arranger).
- [ ] Métriques de `metrics/review.md` **confrontées** au critère, à l'écrit.
- [ ] Décision **nommée** (Continue / Kill / Pause) obtenue via `AskUserQuestion`.
- [ ] Si **Continue** : budget d'itérations défini + 1-3 pistes reliées à une métrique + **cible du retour** notée (Phase 4 nouvelle piste / Phase 5 relance — jamais un retour direct en 18).
- [ ] Si **Kill** : post-mortem 5 lignes écrit + archive `Echec/` + leçons appendées.
- [ ] Si **Pause** : date de réévaluation fixée.
- [ ] `.saas-factory/state.md` mis à jour avec la décision + la date.
- [ ] Leçons de la rétro appendées à `learnings.jsonl` **quelle que soit** la décision.

## Modes d'échec (porte) + parade

| Mode d'échec | Symptôme | Parade |
|---|---|---|
| Déplacement des poteaux | on réécrit le critère après coup pour éviter le kill | juger le critère **tel qu'écrit** au lancement ; noter la leçon |
| Acharnement | Continue répété sans signal ni piste neuve | exiger une piste testable + un budget ; sinon Kill |
| Kill impulsif | tuer un début de PMF sur une mauvaise journée | vérifier le signal réel ; proposer un dernier cycle borné |
| Faux Continue | « on verra » déguisé en Continue | forcer un vrai choix ; à défaut, Pause avec date |
| Décision non actée | décision prise mais `state.md` pas mis à jour | la DoD exige la MAJ de `state.md` + date |
| Boucle infinie | Continue sans plafond d'itérations | `safety-rails` §7 : budget obligatoire |
| Critère absent | rien n'a été écrit au lancement | l'écrire maintenant, honnêtement, avant de trancher |
