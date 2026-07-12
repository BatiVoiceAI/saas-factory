# Référence — Go-test : landing + waitlist en 1 jour (le pont proxy → réel)

Playbook **court** de la 4e issue de la porte. Objectif : convertir « demande plausible, à valider par toi » en **test réel au coût minimal** — l'usine sait déjà construire des landings. Un Go-test réussi produit le premier signal **Tier 1/2** (inscriptions = comportement) de tout le pipeline ; tout ce qui précède est du proxy Tier 3.

**Périmètre** : route `public` uniquement (un outil interne/perso ne se waitlist pas). Ce n'est **pas** un démarrage de Phase 2 : zéro build produit, la landing ne promet que ce que l'`opportunity-summary` dit.

## HARD GATE — le seuil se pré-enregistre AVANT publication

Le seuil, la fenêtre et le canal de diffusion s'écrivent dans `research/go-test.md` **avant** que la landing soit en ligne. Un seuil posé (ou « ajusté ») après avoir vu les chiffres est du déplacement de poteaux — exactement ce que la porte combat. Un seuil raté se lit **raté**.

## Procédure (5 pas, 1 jour de ship + fenêtre de mesure)

1. **Pré-enregistre** dans `research/go-test.md` (gabarit ci-dessous) : métrique (inscriptions waitlist), **seuil** avec son raisonnement, **fenêtre** (7-14 jours), canal de diffusion prévu. Ordre de grandeur par défaut si rien de mieux : conversion visiteurs→inscrits ≥3 % **et** un plancher absolu d'inscrits cohérent avec la niche (ex. ≥15 inscrits pour une niche B2B FR) — adapte et justifie, ne recopie pas aveuglément.
2. **Ship la landing en 1 jour max** : le problème avec les mots des clients (carte de langage de l'étape 2), la promesse issue du POURQUOI, un champ email + bouton « rejoindre la liste d'attente ». Rien d'autre : pas de pricing détaillé, pas de fausses features, pas de « bientôt » inventé.
3. **Diffuse là où la cible parle déjà** : les canaux repérés par le forum-mining (subreddits, groupes, communautés de niche) + le réseau du fondateur. Note chaque canal utilisé dans `go-test.md` (le biais de canal se lit à la fin).
4. **Mesure sans toucher** pendant la fenêtre : visiteurs, inscrits, canal d'origine. Pas de prolongation de fenêtre parce que « ça frémit ».
5. **Retour à la porte** avec la donnée : résultat vs seuil écrit dans `go-test.md`, puis **repasse par l'étape 5** (la re-synthèse intègre le signal réel ; le verdict peut monter — un Tier 1/2 vaut plus que tout le proxy).

## Lecture du résultat (honnête)

| Résultat | Lecture | Retour à la porte |
|---|---|---|
| Seuil atteint | Demande **réelle observée** (comportement, pas opinion) | Recommandation **Go**, verdict consolidé |
| Seuil raté, trafic suffisant | Le marché a vu, n'a pas voulu — c'est une réponse | **No-Go tendanciel** ou Ajuster (angle/cible), sans renégocier le seuil |
| Trafic insuffisant (la cible n'a pas vu) | Test **non concluant** ≠ seuil raté — dis-le tel quel | Ajuster la diffusion et rejouer une fenêtre, **une seule fois** |

## Gabarit `research/go-test.md`

```
# Go-test — {produit}
- Pré-enregistré le : {date} (AVANT publication)
- Métrique : inscriptions waitlist
- Seuil : {N inscrits et/ou X % de conversion} — raisonnement : {pourquoi ce seuil pour cette niche}
- Fenêtre : {du … au …}
- Canaux prévus : {liste}
---  (rempli à la fin de la fenêtre, jamais avant)
- Résultat : {visiteurs / inscrits / conversion, par canal}
- Verdict vs seuil : {atteint / raté / non concluant}
- Décision à la re-porte : {Go / Ajuster / No-Go} + date
```

## Garde-fous

- **Interviews en parallèle** : l'annexe Mom-Test de l'`opportunity-summary` (5 questions dérivées des pain themes) se joue pendant la fenêtre — deux signaux réels valent mieux qu'un.
- Une waitlist qui convertit reste une **intention**, pas un revenu : le Go issu d'un Go-test reste un Go **prudent** (willingness-to-pay non prouvée).
- Jamais de secret/clé dans `go-test.md` ; landing sans collecte au-delà de l'email (pas de données sensibles).
