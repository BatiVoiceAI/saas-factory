# Mapping Intake — brancher l'idea-brief sur le moteur (ne ré-interroge pas)

Le moteur `startup-competitors` démarre par une interview d'intake. **On la court-circuite** : l'utilisateur a été interviewé à l'étape 1, tout est dans `research/idea-brief.md`. Ré-interroger, c'est casser le contrat de chaînage (« l'aval challenge, il ne re-demande pas les bases »). Ce fichier dit **exactement** quoi extraire, où, et quoi faire quand un champ manque.

## Table de correspondance champ-par-champ

| Champ attendu par le moteur | Champ source dans `idea-brief.md` | Traitement |
|---|---|---|
| Produit / idée (1 phrase) | **Idée reformulée** | copie directe |
| Problème + pour qui | **Problème & douleur** (qui/quand/conséquence) + **Cible** (persona précis) | copie directe |
| Marché / catégorie | déduit de **Problème** + **Écosystème** (secteur) | déduis ; si trop flou → resserre (voir §Champ manquant) |
| Concurrents connus (noms/URLs) | **Alternative actuelle** (dont concurrents nommés) + **Signal préliminaire** | liste ; inclus le statu quo (Excel/papier/rien) comme « alternative » |
| Géographie / marché ciblé | **Écosystème** (géo/langue) | copie directe |
| Modèle/fourchette de prix | **Écosystème** / **Contraintes** si mentionné | souvent absent en amont → OK, la recherche le trouvera |
| Différenciateur clé supposé | **Signal préliminaire** / **Idée reformulée** | note-le comme **hypothèse à tester**, jamais comme acquis |
| Langue de sortie | langue de l'utilisateur | français par défaut |

## Ce qu'on écrit — `research/raw/intake.md`

Une note d'amorçage courte, pas une interview reconstituée :
- Produit (1 phrase)
- Problème + persona cible
- Catégorie/marché
- Concurrents connus (directs nommés + statu quo)
- Géo / langue
- Mode de recherche : **Live** ou **Knowledge-Based** (selon dispo WebSearch)
- Source : « amorcé depuis `research/idea-brief.md`, étape 1 »

## Diagramme — d'où vient quoi

```
research/idea-brief.md
   ├─ Idée reformulée ─────────────► produit
   ├─ Problème & douleur ──────────► problème (+ ancre du review-mining W2)
   ├─ Cible (persona précis) ──────► pour qui (+ filtre de pertinence des plaintes W2)
   ├─ Alternative actuelle ────────► concurrents connus + statu quo
   ├─ Signal préliminaire ─────────► concurrents indirects + hypothèse de diff (à TESTER)
   ├─ Écosystème (secteur) ────────► catégorie/marché
   ├─ Écosystème (géo/langue) ─────► portée géo + langue de sortie
   └─ Contraintes ─────────────────► filtres (ex. RGPD → concurrents FR/EU prioritaires)
                    │
                    ▼
         research/raw/intake.md  ──►  amorce W1/W2/W3
```

## §Champ manquant — quand (et seulement quand) reposer une question

**Règle :** ne repose une question que si le champ est **absent** ou **trop flou pour cadrer une recherche**. Un persona précis existe déjà → tu ne le re-demandes pas.

Recette forcing-question pour un champ manquant (détail complet dans `forcing-questions.md`) :

- **Ask exact** : « Pour cadrer la recherche il me manque *{champ}*. {rappel d'une phrase de pourquoi ça compte}. Précise : {options}. »
- **Push-until** : le champ est assez précis pour lancer une requête ciblée (une catégorie « les PME » ne l'est pas ; « cabinets comptables FR <10 salariés » l'est).
- **Red-flags** (réponses à refuser) : réponse-catégorie (« tout le monde », « les entreprises »), non-réponse (« je ne sais pas, cherche »), ou une **solution** au lieu du champ demandé.

### Matrice de routage — champ manquant → action

| Champ manquant | Bloquant pour lancer les vagues ? | Action |
|---|---|---|
| Produit | OUI | STOP, re-demande — on ne cherche pas sans savoir quoi |
| Problème / cible | OUI | re-demande avec push-until (spécificité) |
| Catégorie/marché | OUI si aucun concurrent connu non plus | déduis d'abord ; si impossible, re-demande |
| Concurrents connus | NON | OK : la Wave 1 en découvre — on ne bloque pas là-dessus |
| Géo / langue | NON (défaut = marché de l'utilisateur, français) | assume le défaut, note l'hypothèse |
| Prix supposé | NON | la recherche le trouve |
| Différenciateur | NON | note comme hypothèse à tester, jamais comme fait |

**Principe :** on ne bloque que sur produit + problème/cible + (catégorie OU ≥1 concurrent). Le reste, la recherche le comble ou on assume un défaut déclaré.

## Anti-pattern à prévenir

- **Ré-interviewer par confort** : reposer des questions déjà répondues à l'étape 1. → Relis le brief AVANT de demander quoi que ce soit.
- **Prendre le différenciateur supposé pour acquis** : le fonder dans la recherche comme s'il était vérifié. → C'est une hypothèse ; la Wave 2 la confirme ou l'enterre.
- **Lancer une recherche sur une catégorie floue** : « les artisans » → résultats génériques inexploitables. → Resserre d'abord.
