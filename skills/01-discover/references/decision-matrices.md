# Référence — Matrices de décision

Les tables *condition → action* de la Découverte. Quand un cas rentre dans une ligne, applique l'action sans improviser.

## §1 — Type → route (l'aiguillage du pipeline)
Capté en S2. Écrit dans `idea-brief.md` (`type` + `route`) **et** `.saas-factory/state.md`. C'est ce que l'orchestrateur relit pour router.

| Type | Route (étapes) | Ce qu'on FAIT | Ce qu'on SAUTE | À dire à l'utilisateur |
|---|---|---|---|---|
| **public** | 2 · 3 · 4 · 5 complètes | marché, positionnement, demande/edge, opportunité, + aval SEO/billing | rien | « on valide le marché avant de builder » |
| **interne entreprise** | fit-entreprise → 5 | vérif du **fit** (outils/process/sécurité de la boîte), décision d'utilité interne | marché public (2), edge concurrentiel (4) | « pas de marché à étudier ; on vérifie que ça colle à vos outils/contraintes » |
| **perso** | 5 allégée | une étape 5 allégée (« ça te sert à toi — on build ? ») | 2 · 3 · 4 | « c'est pour toi : on saute l'étude de marché, on va vite au build » |

**Cas ambigus** :
- *public « mais d'abord pour moi »* → route **perso** en v1 ; note l'ambition public en non-goal/ambition. Ne route pas sur un futur hypothétique.
- *interne « qu'on vendra peut-être »* → route **interne** ; note l'option produit.
- *doute franc* → demande, ne devine pas (le type change tout le pipeline).

## §2 — Détection du stade
Déduit de ce qui a été dit (S3–S7), **pas re-demandé** si l'amont suffit. Sert au routage aval et aux forcing-questions réutilisées ensuite.

| Indice observé | Stade |
|---|---|
| Idée seule, rien de construit, aucun utilisateur | **pré-produit** |
| Un proto / des gens l'utilisent, mais personne ne paie | **a des utilisateurs** |
| Au moins un client paie (même 1, même petit) | **a des clients payants** |

Ambigu (« quelques amis testent un bout ») → retiens **pré-produit** et note l'incertitude ; fais confirmer d'un mot.

## §3 — Détection de l'archétype de build
Défaut = **web-saas** (`_shared/archetypes/`). Le nommer ici pré-charge les defaults de stack réutilisés en aval et évite de reposer la question. En cas de doute → `web-saas` + note d'incertitude.

| Signaux dans l'entretien | Archétype pressenti |
|---|---|
| App web multi-utilisateurs, compte, données en base, facturation | **web-saas** (défaut) |
| Rien de ce qui précède ne colle clairement | **web-saas** + note « à confirmer en Phase 3 » |

> L'archétype est **pressenti, pas verrouillé** : la Phase 3 (architecture) tranche pour de bon. Ici on évite juste de reposer la question plus tard.

## §4 — Sauter une question (ne pose que ce qui manque)
| Condition | Action |
|---|---|
| S0 (accueil) a déjà couvert le point clairement | **saute** la question, dis-le (« tu as déjà couvert X, je passe ») |
| Le point est couvert mais **flou** | ne saute pas : re-questionne juste ce qui manque (pas tout) |
| Type = perso | saute le forcing marché sur la cible (persona = l'utilisateur) |
| Type = interne | allège Signal (§6) — la demande publique n'est pas le sujet |

## §5 — Quand arrêter de pousser (budget d'insistance)
Anti-boucle-infinie : le forcing a une limite.

| Situation | Action |
|---|---|
| Réponse forte obtenue (critère de passage atteint) | **arrête**, monte d'un cran |
| 2 relances et toujours flou | propose **2-3 candidats concrets** et fais choisir/corriger (co-construction) |
| L'utilisateur ne sait vraiment pas (ex. non-goals) | **déduis** une valeur plausible, marque « déduit, à confirmer », avance |
| L'utilisateur bloque / se braque | note le champ « à préciser », avance, reviens-y à la porte si critique |

Champ **critique non résolu** (problème ou cible reste flou) → ne le maquille pas : écris-le « à préciser » dans le brief et **signale-le à la porte** comme point faible à consolider (potentiel « Ajuster » en étape 5).

## §6 — Force du signal préliminaire (pour l'annoter)
| Nature du signal | Poids à noter |
|---|---|
| Ils **paient** déjà pour un proche / **cherchent** activement / **se plaignent** spontanément | **fort** (comportemental) |
| « les gens aiment l'idée » / enthousiasme poli d'amis | **faible** (déclaratif — interest ≠ demand) |
| Aucun | « aucun à ce stade » (valide, sans jugement) |

Ne sur-interprète jamais : le verdict de demande appartient à l'étape 4/5, pas ici.
