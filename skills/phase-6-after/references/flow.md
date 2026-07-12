# Flux de la Phase 6 — séquence & calibrage

La carte détaillée de la phase : l'ordre exact d'invocation, ce que chaque étape **lit** et **produit**, et comment le `type` du projet **route** la cérémonie. À ouvrir au démarrage de la phase.

## Diagramme du flux
```
   ENTRÉE : produit EN LIGNE (fin P5), tracking actif, fenêtre de mesure ouverte
        │
        ▼
 ┌───────────────────────────────────────────────────────────────┐
 │ 18-metrics  (PM / CEO)                                         │
 │  lit  : PostHog (funnel, rétention), Sentry (santé),          │
 │         product/*, product/pricing.md                         │
 │  fait : sépare « n'activent pas » de « ça casse »,            │
 │         chiffre le funnel, prioris. 1-3 pistes d'itération    │
 │  écrit: metrics/review.md                                     │
 └───────────────────────────────┬───────────────────────────────┘
                                 │  metrics/review.md  (chaînage disque)
                                 ▼
 ┌───────────────────────────────────────────────────────────────┐
 │ 19-retro  (Eng Manager / CEO)                                 │
 │  lit  : metrics/review.md, _shared/lessons.md,               │
 │         state.md (Critère de KILL écrit au lancement)        │
 │  fait : rétro honnête, extrait les leçons, CONFRONTE le      │
 │         critère de kill aux chiffres                          │
 │  écrit: retro/retro.md, ~/.saas-factory/learnings.jsonl,     │
 │         MAJ _shared/lessons.md                                │
 │  🚪 PORTE : KILL / CONTINUE                                    │
 └───────────────────────────────┬───────────────────────────────┘
                                 ▼
                    (voir gate-and-state.md : retours arrière)
```

## Séquence exacte
1. **Pré-vol** — vérifier que le tracking a **des données réelles** (fenêtre de mesure suffisante depuis `17-deploy`). Sans données : ne pas fabriquer de funnel — le dire, proposer d'attendre (repli honnête, `safety-rails.md` §6).
2. **Invoquer `18-metrics`** — produit `metrics/review.md`. Ne pas enchaîner tant qu'il n'existe pas.
3. **Invoquer `19-retro`** — lit `metrics/review.md`, produit la rétro + la mémoire, **présente la porte** kill/continue.
4. **Router selon la décision** de la porte (`gate-and-state.md`), mettre à jour l'état, résumer en 2 lignes.

L'ordre est **déterministe** : jamais `19` avant `18`, jamais de build inséré au milieu (HARD GATE de la phase).

## Calibrage par `type` (routage)
Le `type` a été capté à l'étape 1 et propagé dans `state.md` (`Type / route`). Il ne se **re-demande pas** ici — on applique la route enregistrée.

| Aspect | Public (SaaS sérieux) | Interne | Perso |
|---|---|---|---|
| `18-metrics` funnel d'activation | **complet** (activation, rétention, pricing) | **allégé** (usage réel, adoption interne) | **allégé** (est-ce que je m'en sers ?) |
| `18-metrics` santé Sentry | oui | oui | oui (léger) |
| `18-metrics` pistes d'itération | 1-3 priorisées | 1-3 priorisées | 0-3, best-effort |
| `19-retro` rétro | oui | oui | oui |
| `19-retro` mémoire (lessons/learnings) | **oui** | **oui** | **oui** |
| `19-retro` porte kill/continue | argumentée, formelle | oui | oui (peut être informelle) |

**Invariant** : quel que soit le `type`, on **traverse les 2 étapes** — on n'en saute **aucune**. Le routage **allège** le contenu, il ne supprime pas d'étape. La **rétro et la mémoire tournent toujours** : c'est l'actif qui compound, il ne se sacrifie jamais, même sur un throwaway perso.

## Fenêtre de mesure
`18-metrics` n'a de sens qu'avec du signal. Repères (indicatifs, l'étape 18 tranche) :
- **Public** : viser une fenêtre où le funnel a assez de passages pour être lisible ; sinon marquer « mesure prématurée » et planifier une relecture.
- **Interne / perso** : quelques jours d'usage réel suffisent ; l'important est le *fait d'usage*, pas le volume.
Ne jamais **inventer** de chiffres pour remplir `metrics/review.md`.
