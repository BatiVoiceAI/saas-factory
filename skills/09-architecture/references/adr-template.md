# Référence — Template ADR (Architecture Decision Record)

Format d'enregistrement d'une décision d'architecture, dérivé de Michael Nygard / MADR (reformulé, libre de droits). **Une décision structurante = un ADR.** Les ADR vivent dans `tech/decisions.md` (journal numéroté).

## Quand écrire un ADR
- Toute **déviation** de la stack par défaut.
- Tout choix structurant **irréversible** ou coûteux à changer (modèle de données central, stratégie multi-tenant, choix d'un provider critique).
- Tout compromis à **impact produit** (→ à remonter aussi en *taste decision* à l'étape 10).

Ce qui **ne mérite pas** d'ADR : les choix couverts par le défaut, les détails d'implémentation réversibles en 5 minutes.

## Le template
```
### ADR-NNNN — <titre court de la décision>
- **Statut** : proposé | accepté | remplacé par ADR-XXXX | déprécié
- **Date** : AAAA-MM-JJ
- **Exigence motrice** : <l'exigence dure de la matrice qui force ce choix> (ou « edge produit »)
- **Contexte** : <le problème, les contraintes, ce qui est en jeu — 2-4 lignes>
- **Décision** : <ce qu'on a choisi, en une phrase claire>
- **Alternatives considérées** : <option A / option B — pourquoi écartées (fit / coût / complexité)>
- **Conséquences** : <ce que ça implique — le bon (+) et le mauvais (−)>
- **Réversibilité** : facile | moyenne | difficile — <comment on reviendrait en arrière si besoin>
```

## Règles
- **Numérotation continue** : ADR-0001, ADR-0002…
- Un ADR n'est **jamais supprimé** : s'il est remplacé, passe son statut à « remplacé par ADR-XXXX » (traçabilité).
- **Langage clair** : un ADR doit être compréhensible par un futur toi — ou un autre agent — dans 6 mois. Pas de jargon non défini.
- Chaque ADR se **rattache à une exigence** (ou à l'edge produit). Un ADR sans motivation traçable = un choix arbitraire à revoir.

## Exemple travaillé (niche-agnostique)
```
### ADR-0003 — Upload direct vers le storage pour les gros fichiers
- Statut : accepté
- Date : 2026-07-10
- Exigence motrice : US-8 — le workflow import traite des fichiers jusqu'à 200 Mo (exigence dure, matrice §Perf)
- Contexte : le défaut (route API Next.js) plafonne le body à ~4 Mo ; passer 200 Mo par le serveur sature la mémoire et déclenche des timeouts.
- Décision : le client uploade directement vers le storage (URL signée), un worker traite le fichier en async ; l'API ne reçoit que l'id.
- Alternatives considérées : (A) route API + streaming — reste fragile au-delà de ~50 Mo, écartée sur le fit ; (B) service d'upload tiers dédié — coût/complexité pour un gain nul vs le storage déjà présent, écartée.
- Conséquences : + tient la volumétrie, décharge le serveur ; − ajoute un flux async à surveiller (statut, échec à mi-parcours) et une URL signée à sécuriser [SÉCU].
- Réversibilité : moyenne — un adaptateur d'upload isole le client ; revenir à la route API se fait sans migration de données.
```

## Checklist qualité d'un ADR
```
[ ] Titre = la décision, pas le problème (« Upload direct storage », pas « Problème d'upload »)
[ ] Exigence motrice nommée (US/critère) OU « edge produit » explicite
[ ] Décision tenable en une phrase claire
[ ] ≥ 2 alternatives, chacune écartée pour une raison (fit/coût/complexité)
[ ] Conséquences : le bon (+) ET le mauvais (−) — jamais que des +
[ ] Réversibilité honnête (multi-tenant/modèle de données = « difficile », pas « facile »)
[ ] Points sécurité taggés [SÉCU] dans les conséquences si pertinent
[ ] Indexé dans decisions.md (# · décision · statut · exigence)
```

## Catalogue d'ADR fréquents pour un web-saas
Les déviations qui reviennent le plus (aide-mémoire — **aucune n'est automatique**, chacune exige son exigence dure) :

| ADR type | Exigence typique qui le déclenche | Réversibilité |
|---|---|---|
| Stratégie multi-tenant non-défaut (schema/base par tenant) | conformité imposant l'isolation physique | **difficile** |
| Upload direct storage + worker | fichiers volumineux (>~4 Mo) | moyenne |
| File/queue dédiée hors worker par défaut | débit de jobs sourcé, ordre garanti | moyenne |
| Provider LLM ≠ défaut (GPT-4o…) | qualité/format/latence imposée par une US | facile (adaptateur) |
| Hébergement self-host (Coolify) ou edge (CF Workers) | souveraineté/coût, ou latence edge globale dure | difficile |
| Cache/CDN applicatif explicite | coût LLM/egress prouvé par la volumétrie | facile |
| Recherche full-text / vectorielle | feature de recherche sourcée | moyenne |

> Si tu n'as **aucun** ADR, ce n'est pas suspect : ça veut dire que le défaut couvrait toutes les exigences dures (le cas idéal). Si tu en as **3+ hors edge produit**, re-challenge : tu sur-ingénieres probablement (`edge-cases.md E4`).
