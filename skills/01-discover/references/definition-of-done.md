# Référence — Definition-of-Done & porte de sortie

Le contrôle qualité avant de franchir la porte. Un brief « fini » n'est pas un brief « rempli » : c'est un brief dont chaque champ **tient le critère de qualité** ou est **honnêtement marqué « à préciser »**. Aucun champ inventé.

## Checklist du brief (`research/idea-brief.md`)
Chaque ligne : le champ, son critère de passage, le red-flag qui le recale.

| Champ | Passe si… | Recalé si… |
|---|---|---|
| **Idée reformulée** | 2 lignes, mots de l'utilisateur, **validée** en S1 | contient une solution/techno injectée, ou non confirmée |
| **Problème — Qui** | persona nommé qui souffre | « les gens », « tout le monde » |
| **Problème — Quand** | moment précis identifiable | absent / vague (« souvent ») |
| **Problème — Conséquence** | coût concret, si possible chiffré | « c'est pénible » sans impact |
| **Cible** | métier/segment **+ volume**, cherchable | catégorie (« les PME ») |
| **Alternative** | ≥1 alternative concrète ; **concurrents nommés extraits** | « rien » balancé sans creuser |
| **Type + route** | type tranché **et** route écrite | type mouvant non tranché |
| **Stade** | pré-produit / utilisateurs / payants | non déduit |
| **Écosystème** | secteur · géo/langue · réglementaire · intégrations (chacun rempli ou « rien de particulier ») | intégrations en survol non nommées |
| **Signal préliminaire** | noté **avec son poids** (fort/faible), ou « aucun » | enthousiasme poli compté comme demande |
| **Non-goals** | ≥1, ou déduits « à confirmer » | liste de rêve déguisée |
| **Archétype** | pressenti (défaut web-saas) + note si doute | absent |
| **Hygiène** | **zéro secret / clé** dans le fichier | un secret recopié |

**Règle du « à préciser »** : un champ sans réponse ferme se marque `à préciser`, jamais inventé. Si **problème** ou **cible** (les deux critiques) restent « à préciser », le brief est **fragile** → signale-le à la porte comme point à consolider (candidat « Ajuster » en étape 5).

## Auto-vérification avant la porte (l'agent se relit)
```
[ ] Reformulation confirmée par l'utilisateur (pas supposée)
[ ] Problème = qui + quand + conséquence (les trois)
[ ] Cible = persona précis + volume (cherchable par l'étape 2)
[ ] Concurrents/outils nommés extraits dans « Alternative »
[ ] type + route cohérents et écrits (brief ET state.md)
[ ] Écosystème : 4 sous-champs traités
[ ] Signal annoté avec son poids ; interest ≠ demand respecté
[ ] Contraintes fatales éventuelles remontées en gras
[ ] Stade + archétype déduits (pas re-demandés inutilement)
[ ] Aucun secret dans le brief ni l'état
[ ] Rien résolu : pas de solution/techno/code/teardown (HARD GATE tenu)
```

## Porte de sortie (légère mais bloquante)
1. **Récapitule** en clair : reformulation + type/route + cible + problème.
   > Exemple de formulation : « On part sur un SaaS **public**, cible **le plombier solo ~5 devis/semaine**, problème **la ressaisie des devis le soir (~1h, erreurs)** — c'est bien ça ? »
2. **Demande confirmation** (`AskUserQuestion`). **Ne franchis jamais sans réponse.**
3. **Route selon la décision** :

| Réponse à la porte | Action |
|---|---|
| Confirmé | écris/actualise `state.md`, annonce l'étape suivante selon la route |
| Correction mineure | intègre, re-récapitule d'une ligne, re-confirme |
| Remise en cause du cadrage | retour à l'état concerné (S1–S9), le retour arrière est autorisé à tout moment |

## Mise à jour de l'état (`.saas-factory/state.md`)
En sortie, renseigne au minimum :
- **Type / route** (décide des étapes actives)
- **Archétype**
- **Phase 1 · Étape 01** · statut `fait`
- **Ambition** (perso/interne court · public complet) — déductible du type

Jamais de secret dans `state.md` (safety-rails §4 ; schéma : `_shared/state-schema.md`).

## Sortie de l'étape
- **Artefact** : `research/idea-brief.md` (selon `assets/templates/idea-brief.md`), DoD passée.
- **État** : `.saas-factory/state.md` à jour.
- **Suite** : enchaîne l'étape suivante active **selon la route** (mapping type→route : `decision-matrices.md §1`).
- **Contrat de chaînage tenu** : l'aval (dont `office-hours` gstack) **relit le brief tel quel** et approfondit — il ne re-demande pas les bases.
