# Référence — Sortie & passage de relais

Écrire `metrics/review.md` (le bilan), clôturer `.saas-factory/state.md`, et **passer proprement le relais à l'étape 19** (retro & porte kill/continue). Le bilan n'est pas un rapport pour l'archive : c'est **l'input direct** de la décision kill/continue. Il doit se lire seul.

## `metrics/review.md` — section par section (via le template)
Le template est `assets/templates/metrics-review.md`. Remplis chaque bloc avec la donnée réelle, labellisée.

| Bloc du template | Ce qu'on y met | Piège à éviter |
|---|---|---|
| **Funnel AARRR** (table) | chaque marche : valeur + **vs attendu** | ne pas laisser une case vide sans « non mesuré » |
| **Santé (Sentry)** | taux d'erreur, top erreurs par users touchés, écrans fragiles | mettre en avant « users touchés », pas « occurrences » |
| **Où ça décroche** | **le plus gros levier** + l'écart PRD/pricing, **honnêtement** | pas de lissage « globalement positif » |
| **Pistes (1-3)** | gabarit à 4 éléments (levier→métrique→test→impact×effort) | pas de backlog, pas de piste molle |

**Labels obligatoires** dans le bilan : **[Data]** (mesuré), **[Estimate]** (extrapolé), **[Assumption]** (inféré). Un chiffre non mesuré (ex. conversion si Stripe non branché) est explicitement **[Estimate]** ou « non instrumenté », jamais présenté comme mesuré.

## Le bilan doit contenir 3 choses (test de suffisance)
1. **La définition du moment magique** (event exact) — pour que l'étape 19 lise la même activation.
2. **Le point qui décroche le plus** (un seul, nommé) + sa nature (PRD/pricing/santé/acquisition/fond).
3. **La piste n°1** (ou « 0 piste, attendre trafic » assumé).

Si un lecteur non-technique ne peut pas dire, après lecture, « ça marche / ça ne marche pas et pourquoi », le bilan a raté sa mission.

## Clôturer `.saas-factory/state.md`
- Étape 18 **done** + date.
- Le **point qui décroche** (une ligne).
- La **piste n°1** (une ligne).
- **Jamais** de secret, clé ou token dans l'état (`_shared/safety-rails.md` §4).

## Passage de relais à l'étape 19 (le chaînage)
L'étape 18 **n'a pas de porte de décision** : elle **informe** la porte kill/continue que **19-retro** portera. Ce qui doit transiter, propre, vers 19 :

```
   18-metrics                         19-retro
   ┌─────────────┐                    ┌──────────────────────┐
   │ review.md   │ ── lit ──────────► │ confronte au critère │
   │ + state.md  │                    │ de kill (écrit à J0) │
   │ (point qui  │                    │ → porte kill/continue│
   │  décroche,  │                    │ → mémoire qui        │
   │  piste n°1) │                    │   compound           │
   └─────────────┘                    └──────────────────────┘
```

- **Transmets clairement** un éventuel **écart PRD de fond** (« rétention → 0, pas de fit ») : c'est le signal le plus lourd pour le kill/continue. Ne l'adoucis pas.
- **Ne tranche pas** kill/continue toi-même. Tu peux exposer le signal, pas décider.
- Annonce l'étape 19 dans ton résumé de fin.

## Résumé de fin (ce que tu dis à l'utilisateur)
Trois lignes, pas plus :
1. **Activation** : le chiffre + qualification (faible/correct/fort).
2. **Le point qui décroche** le plus + sa nature.
3. **La piste n°1** (ou « données trop minces, on attend/pousse l'acquisition »).
Puis : « → étape 19 : rétro & décision kill/continue. »

## Definition of Done — sortie
- [ ] `metrics/review.md` rempli, chaque marche avec valeur/vs-attendu ou « non mesuré ».
- [ ] Moment magique **défini** dans le bilan (event exact).
- [ ] Point qui décroche **unique et nommé** + sa nature.
- [ ] 1-3 pistes (ou 0 assumé), chacune au gabarit falsifiable.
- [ ] Labels [Data]/[Estimate]/[Assumption] posés ; trous de mesure nommés.
- [ ] `state.md` mis à jour, **sans secret**.
- [ ] Étape 19 annoncée ; écart PRD de fond transmis sans lissage.

## Modes d'échec globaux de l'étape
- **Le bilan qui rassure.** Ton positif, fuite masquée. *Parade :* honnêteté avant réconfort (`_shared/lessons.md`), section « où ça décroche » obligatoire.
- **La lecture sur du bruit.** Taux sur n minuscule. *Parade :* HARD GATE (`reading-procedure.md`).
- **Le faux zéro.** « Personne n'active » alors que le tracking est muet. *Parade :* check tracking vivant.
- **Le backlog.** 10 pistes non priorisées. *Parade :* plafond 1-3 (`iteration-engine.md`).
- **Franchir la porte de 19.** Décider kill/continue ici. *Parade :* 18 informe, 19 décide.
- **Le secret dans l'état.** Clé/token écrit dans `state.md` ou `review.md`. *Parade :* safety-rails §4.
