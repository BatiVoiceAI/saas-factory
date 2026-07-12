# Exemples de bout en bout — étape 4

Deux runs complets, **niche-agnostiques**, pour montrer la procédure en action : de l'extraction au fichier `demand-signals.md`. Les niches sont fictives ; ce qui compte est la **mécanique** (matrices, tiers, formulation).

---

## Run A — « Signal fort + edge réel »

**Contexte fictif** : outil de planification de tournées pour livreurs indépendants. `market.md` (Wave 2) mine 3 concurrents.

### Bloc 1 — extraction
- **Volume** : 210 avis agrégés (A: 120 / B: 60 / C: 30). Note moyenne 3,4/5. → marché **actif**.
- **Douleurs partagées** :
  - « Le recalcul d'itinéraire plante dès 20 arrêts » — **bloquant** — A + B (partagé). Quote datée <6 mois.
  - « Pas de mode hors-ligne » — **rédhibitoire** — A + B + C (partagé). « J'ai résilié, je livre en zone blanche » (churn).
- **Features réclamées** : mode hors-ligne (37 avis), export tournée (12), notifications client (9). **Convergence forte** sur le hors-ligne.
- **Churn** : « passé à la feuille papier faute d'offline » ×5 → **Tier 2**, documenté.

### Bloc 1 — verdict (matrice §2 de `demand-signal-procedure.md`)
Volume élevé ✔ · douleur partagée rédhibitoire ✔ · features convergentes ✔ · churn documenté ✔ → **Fort**.
Exigence de preuve (`adversarial-verification.md` §3) : churn Tier 2 + 2 plateformes ✔.

> Formulation : « Demande **plausiblement forte** : offline réclamé (37 avis, 3 concurrents), churn documenté vers le papier. **À valider par toi.** »

### Bloc 2 — edge
- Angle candidat (positioning.md) : « le seul planificateur *offline-first* pour livreurs solo ».
- Manque « hors-ligne » : **partagé** (3 concurrents) · **réclamé** (37 avis) · **défendable** ? Sprint-test : un vrai moteur offline (sync, cache carto) ≠ un sprint → **oui**.
- Verdict : **Edge réel**. Trois critères remplis.

> « Le seul planificateur de tournées **offline-first** pour **livreurs indépendants** — manque partagé par 3 concurrents, réclamé 37 fois, défendable (moteur de sync non trivial). »

---

## Run B — « Signal faible + pas d'edge » (l'issue honnête)

**Contexte fictif** : générateur de signatures e-mail pour PME. `market.md` mine 4 concurrents.

### Bloc 1 — extraction
- **Volume** : 640 avis, note 4,3/5. Marché **actif et satisfait**.
- **Douleurs partagées** : surtout « le choix de templates est limité » — **agacement** (contournable). Rien de bloquant partagé.
- **Features réclamées** : éparses, aucune convergence (1-2 avis chacune).
- **Churn** : quasi nul, ou « j'ai arrêté, plus besoin » (fin d'usage, pas insatisfaction).

### Bloc 1 — verdict
Volume élevé mais douleur max = **agacement**, features éparses, churn non exploitable → matrice : **Moyen** plafonné vers **Faible** (aucune douleur sévère). Au doute, on descend : **Faible/Moyen bas**.

> « Demande **plausiblement faible à moyenne** : marché actif mais mûr et satisfait, aucune douleur bloquante partagée. **À valider par toi.** »

### Bloc 2 — edge
- Angle candidat : « signatures plus jolies ». Croisement : aucun manque **partagé** ; les 4 acteurs couvrent les mêmes features ; « plus joli » = pas un manque documenté.
- Test de la phrase « le seul … qui … » : remplaçable par n'importe quel concurrent → **pas différenciant**.
- Verdict : **Pas d'edge**.

> Sortie honnête : « **Pas d'edge défendable** : aucun manque partagé, marché saturé et satisfait. Le produit resterait viable seulement en *meilleure exécution sur une niche* (ex. {notaires} : gabarits conformes) — mais c'est de l'exécution, pas un moat. Arbitrage Go/No-Go → **étape 5**. »

---

## Ce que les deux runs illustrent

| Point | Run A | Run B |
|---|---|---|
| Volume élevé garantit-il la demande ? | Non — c'est la **sévérité partagée** qui décide. | 640 avis, pourtant demande faible. |
| Edge = feature ? | Non — c'est la **défendabilité** (moteur offline). | « Plus joli » ≠ edge. |
| Rôle de la formulation humble | « plausiblement », « à valider » même quand Fort. | Idem, et « pas d'edge » dit **net**. |
| Qui décide Go ? | Pas ici → étape 5. | Pas ici → étape 5. |
