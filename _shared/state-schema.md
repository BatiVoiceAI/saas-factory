# Schéma d'état — `.saas-factory/state.md`

Le fichier d'état global du projet, tenu par le master et chaque phase. **Jamais de secret dedans** (les accès vivent dans `~/.saas-factory/`).

## Format
```markdown
# État — {nom du projet}

## Cadrage
- **Type / route** : public | interne | perso   (décide des étapes actives)
- **Archétype** : web-saas | …
- **Ambition** : perso/interne (court) | public (complet)
- **Critère de KILL** (écrit au lancement) : {…}

## Phase & étape courantes
- **Phase** : 1..6
- **Étape** : 01..19
- **Statut** : en cours | porte en attente | fait

## Portes franchies
| Porte | Décision | Date |
|---|---|---|
| Opportunité (étape 5) | Go / Ajuster / No-Go | … |
| PRD (étape 7) · Charte (étape 8) | validé | … |
| Client-review (étape 15) | Ship / Itérer / Stop | … |
| Déploiement (étape 17) | publié | … |
| Kill/Continue (étape 19) | continuer / kill | … |

## Décisions verrouillées
- Stack : {défaut / déviations ADR}
- Provisioning : {repo, sous-domaine, BDD, host}

## Budget d'itération
- Cascade (13) : {plafond / tours consommés}
- Client (15) : {plafond / tours}

## Features (build)
{renvoi à `status/NN-<feature>.md` — cran de cascade atteint par feature}
```

## Règles
- Le **master** relit ce fichier au démarrage pour **reprendre** où on en était (reprenabilité).
- **Un seul écrivain : l'orchestrateur.** `state.md` est mis à jour par le **master** ou l'**orchestrateur de phase**, jamais par les experts/sous-agents. Un sous-agent **produit son artefact** (`research/*`, `status/*`, `tech/*`…) et le **rapporte** à l'orchestrateur ; c'est l'orchestrateur qui écrit `state.md` **en sortie de chaque étape** (et à la porte). Cela évite les MAJ concurrentes ou incohérentes quand plusieurs sous-agents tournent en parallèle : l'artefact fait foi, `state.md` a un seul auteur.
- **Aucun secret / clé** (cf. `safety-rails`). Les accès infra vivent dans `~/.saas-factory/`.
