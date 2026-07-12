# État & portes — Phase 4 (build)

Comment tenir `.saas-factory/state.md`, **reprendre** un run interrompu, gérer la **porte 15**, et **revenir en arrière** quand un cran rejette. Schéma d'état de référence : `_shared/state-schema.md`. Budget : `_shared/validation-cascade.md` + `_shared/safety-rails.md` §7.

## Tenue de l'état, étape par étape
`.saas-factory/state.md` est ta mémoire de reprise. À chaque frontière d'étape, mets à jour :

| Après | Mets à jour dans state.md |
|---|---|
| Ouverture (QA Analyst) | Phase = 4, Étape = 12 (à venir), note « recette écrite : qa/test-plan.md » |
| 12 Build | Étape = 12→13 · pour chaque feature : cran atteint (`DEV-DONE`) dans la section Features (renvoi `status/<feature>.md`) |
| 13 Reviews | Étape = 13 · par feature : cran cascade atteint (Tech Lead/CTO/Designer/CEO) + verdict + **budget cascade consommé** |
| 14 QA | Étape = 14 · statut faux-client (passe 1 / passe 2 / conforme) + non-conformités routées |
| 15 Client-review | Étape = 15 · ligne « Client-review » dans **Portes franchies** (décision + date) + **budget client consommé** |

**Jamais de secret** dans state.md (les accès vivent dans `~/.saas-factory/`). Le détail par feature vit dans `status/<feature>.md` ; state.md n'en garde que le **renvoi + le cran atteint**.

**Écrivain unique — critique en Phase 4.** Les features tournent **en parallèle** (plusieurs sous-agents dev/reviewers) : chaque sous-agent écrit **son** `status/<feature>.md` (une feature = un fichier, pas de collision) et te rapporte son cran ; **toi seul** reportes le renvoi + le cran dans `state.md`, à la frontière d'étape. Règle canonique (+ l'unique exception `01-discover`) : `skills/saas-factory/references/state-resume.md` §Écrivain unique.

## Procédure de reprise (reprenabilité)
Au (re)démarrage de la Phase 4, **ne repars jamais de zéro**. Séquence :
1. **Relis `.saas-factory/state.md`** → Phase/Étape courante, `type` (calibrage), budgets consommés, portes franchies.
2. **Relis `status/*`** → cran atteint par feature (qui est `DEV-DONE`, qui est en cascade, qui est `DONE_WITH_CONCERNS`).
3. **Relis `qa/test-booklet.md`** (s'il existe) → ce qui est déjà testé/vert.
4. **Reprends au point exact** :
   - Recette absente (`qa/test-plan.md`) → (ré)ouvre avec le QA Analyst.
   - Features non `DEV-DONE` → reprends `12-build` **sur ces features seulement**.
   - Features `DEV-DONE` mais pas validées CEO → reprends `13-reviews` **au cran atteint** (pas au cran 1) pour chacune.
   - Toutes validées CEO, `qa/report.md` incomplet → reprends `14-qa`.
   - Produit prouvé, pas de décision au 15 → reprends `15-client-review`.
5. **Vérifie l'infra** : si le staging (URL étape 11) est down, c'est un pré-requis de 14/15 — relance-le avant, ne teste pas dans le vide.

## La porte 15 — ce qu'elle décide
Une **seule** porte utilisateur en Phase 4, portée par `15-client-review`. L'expert présente le produit (URL staging + résumé clair + « ce qui en ressort » du livret, `CONCERNS`/`WAIVED` inclus **honnêtement**), puis `AskUserQuestion`. Trois issues :

- **Ship** → Phase 4 terminée. Les `CONCERNS` restants sont **documentés** (pas cachés). On passe à la **Phase 5** (lancement). Écris la porte dans state.md.
- **Itérer** → on renvoie les tâches corrigeables dans le build (voir matrice ci-dessous), **dans le budget client**, puis on re-présente. Boucle bornée.
- **Stop / park** → arrêt propre : archive de l'état, **post-mortem court** (5 lignes façon `_shared/lessons.md` §9), rien de détruit. Pas de Phase 5.

**Ne franchis jamais cette porte sans décision explicite.** Bouton « ship en l'état » toujours offert (l'humain peut décider de partir avec les `CONCERNS`).

## Matrice de retour arrière
Deux natures de « retour » : les **rejets internes** (autonomes, sans porte) et la **décision Itérer** (humaine, au 15).

| Déclencheur | D'où | Vers | Contexte transmis | Borne |
|---|---|---|---|---|
| `FAIL` cran cascade (13) | Tech Lead / CTO / Designer / CEO | **étape 12** (dev) | quoi / où `fichier:ligne` / pourquoi-impact / quoi faire | budget cascade (par feature) |
| Non-conformité faux-client (14) | fake-client | **cascade (13) ou dev (12)** selon la nature | parcours cassé + attendu PRD + preuve | budget cascade |
| Régression détectée (14) | fake-client | **dev (12)** + test de régression généré | le test qui échoue | budget cascade |
| Sync-doc divergente (14) | verifier | resync doc **sur place** (pas de retour dev) | diff doc↔code | — |
| **Itérer** (15) | **humain** | **build complet 12→13→14** | tâches classées (`client-review-tasks.md`) | **budget client** |
| Feedback = expansion de scope (15) | client-liaison | **parqué** (pas dans ce cycle) | item marqué « expansion » | — |

Règles du retour :
- Un rejet cascade renvoie **toujours au dev (12)** et la feature **re-grimpe toute la cascade** — on ne « patche » pas à mi-hauteur.
- Le contexte est **actionnable**, jamais « refais ». Sans contexte, le dev reboucle à l'aveugle.
- Les features **indépendantes** ne sont pas bloquées par une feature en retour : elles continuent (parallélisme).

## Épuisement de budget (anti-boucle-infinie)
Quand un budget (cascade ou client) tombe à zéro sans satisfaction :
1. **On loge l'état** dans state.md + `status/<feature>.md`.
2. **Cascade** : feature marquée `DONE_WITH_CONCERNS`, le `CONCERNS` documenté remonte au livret ; on **continue** (l'humain tranchera au 15).
3. **Client (15)** : on **présente l'état** et on propose explicitement « ship en l'état » vs « continuer », on laisse l'humain trancher (`safety-rails` §7). Jamais de boucle silencieuse.

## Passation vers la Phase 5
Sur **Ship** : Phase 4 close. Vérifie que sont posés — porte 15 dans state.md, `qa/test-booklet.md` compilé, `CONCERNS`/`WAIVED` documentés, staging opérationnel. Résume en 2 lignes et **annonce la Phase 5** (`phase-5-launch` : SEO si public + déploiement prod). Le produit validé + le livret sont le contrat d'entrée de la Phase 5.
