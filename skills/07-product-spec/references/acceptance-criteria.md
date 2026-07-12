# Référence — User stories + critères d'acceptation (étape 5)

Procédure exhaustive pour rendre le PRD **exécutable**. **Fusion §5 :** la story et ses critères vivent **dans la fiche feature** (`product/features/NN-*.md` § User story + § Critères d'acceptation) — décision « fiches, pas `user-stories.md` séparé » (cf. `procedure.md` et `feature-spec-depth.md`). Cette référence est la **méthode** (format story, Given/When/Then, catalogue de cas limites) que la fiche applique. Une **story sans critère d'acceptation testable n'est PAS finie** : ce sont les critères qui permettent au build (Phase 3) d'implémenter et au Verifier de vérifier. Une story par feature **Must/Should** (par rôle si plusieurs personas agissent).

## Ce qui rend le PRD exécutable

```
  Feature (fiche NN-*.md)           User story                     Critères d'acceptation
  ─────────────────────    ─▶   En tant que <persona>      ─▶   Given / When / Then
  comportement + cas limites     je veux <action>                (nominal + chaque cas limite)
                                 afin de <bénéfice←Phase 1>       = ce que le build code et
                                                                    ce que le Verifier coche
```

Le comportement nominal de la fiche → **le critère nominal**. Chaque cas limite de la fiche → **un critère de cas limite**. Rien ne se perd entre la fiche et la story.

## Partie A — La user story

### Format imposé (ne pas dévier)
> **En tant que** \<persona\>, **je veux** \<action\>, **afin de** \<bénéfice\>.

- **persona** — le même que la cible Phase 1 (pas un persona inventé).
- **action** — observable, concrète (« exporter au format Z », pas « gérer mes données »).
- **bénéfice** — se rattache à un **besoin validé en Phase 1**. Un bénéfice orphelin = une story orpheline → couper ou revoir la feature. **Exception :** les stories du socle « produit complet » se rattachent à `socle complétude` (`completeness-baseline.md`) — leur bénéfice reste concret (ex. « afin de démarrer avec un salon déjà configuré »), jamais tautologique.

### Recette forcing-question (voir aussi `forcing-questions.md` Q7)
- **Ask exact :** « Le "afin de" se rattache-t-il à un besoin de `research/`, et l'action est-elle observable ? »
- **Push-until :** format respecté + bénéfice rattaché Phase 1 + action observable.
- **Red-flags :** bénéfice tautologique (« afin de pouvoir le faire ») ; persona générique (« un utilisateur ») quand la cible est précise ; action = fonctionnalité floue.
- **MOU :** « En tant qu'utilisateur, je veux un bon tableau de bord, afin d'avoir de la visibilité. »
- **FORT :** « En tant que \<persona précis\>, je veux voir mes 30 derniers livrables triés par date, afin de retrouver un document sans le régénérer. »

## Partie B — Les critères d'acceptation (Given/When/Then)

### Format imposé
> **Étant donné** \<contexte\>, **quand** \<action\>, **alors** \<résultat attendu\>.

Chaque critère = **une** condition cochable oui/non. Couvrir **le nominal ET les cas limites** de la fiche feature.

### Sous-procédure (par story)
1. **Critère nominal** — traduire le comportement attendu de la fiche en un premier Given/When/Then (le « happy path »).
2. **Critères de cas limites** — pour **chaque** cas limite de la fiche, un critère dédié (voir catalogue Partie C).
3. **Critère de frontière** — quand pertinent, un critère qui **vérifie une exclusion** (« N'inclut pas » de la fiche) : *« quand l'utilisateur tente \<hors-scope\>, alors le produit ne le propose pas / renvoie un message clair »*.
4. Vérifier que chaque critère est **vérifiable sans ambiguïté** (une machine ou un testeur peut trancher oui/non).

### Critères de passage (par story)
- **≥1** critère nominal + **1 critère par cas limite** de la fiche.
- Aucun critère non vérifiable (« alors c'est fluide » ✗).
- Résultat attendu **concret** (valeur, message, état, tri, count), pas une impression.

### Micro-exemple (niche-agnostique) — feature « Export au format Z »
> **Story :** En tant que \<persona\>, je veux exporter mon livrable au format Z, afin de le transmettre sans ressaisie.

- **Nominal :** Étant donné un livrable finalisé, quand l'utilisateur clique « Exporter en Z », alors un fichier Z valide est téléchargé et contient tout le contenu du livrable.
- **Entrée vide :** Étant donné un livrable **vide**, quand l'utilisateur clique « Exporter », alors l'action est désactivée (ou un message « rien à exporter » s'affiche), aucun fichier n'est généré.
- **Volume :** Étant donné un livrable de \<taille max supportée\>, quand l'utilisateur exporte, alors le fichier est généré en < N s sans troncature.
- **Frontière (exclusion) :** Étant donné l'écran d'export, quand l'utilisateur cherche « envoyer par email », alors l'option n'existe pas en v1 (hors-scope assumé).

## Partie C — Catalogue de cas limites (à balayer pour CHAQUE feature)

À l'étape 5 (fiche feature — les états §5) **et** ici, passe cette grille : il y a **toujours** des cas limites. Ne cocher que ceux **pertinents** pour la feature — mais les avoir tous **considérés**.

| Famille | Question à se poser | Exemple de critère |
|---|---|---|
| **Entrée vide / absente** | Que se passe-t-il si le champ / la donnée est vide ? | action désactivée ou message clair, pas de crash |
| **Entrée invalide / malformée** | Format inattendu, caractères spéciaux, valeur hors bornes | rejet explicite + message, pas d'état corrompu |
| **Volume / limite** | Très gros input, très nombreux éléments, pagination | comportement borné (limite, pagination, timeout géré) |
| **Vide initial (empty state)** | Premier usage, aucune donnée encore | écran d'accueil utile, pas une page blanche |
| **Accès concurrent** | Deux actions en même temps sur la même ressource | dernier gagnant / verrou / message, pas de perte silencieuse |
| **Permissions / propriété** | L'utilisateur a-t-il le droit sur cette ressource ? | accès refusé proprement si non autorisé |
| **Authentification / session** | Non connecté, session expirée en cours d'action | redirection/relogin sans perte de travail |
| **Panne dépendance** | L'intégration / le service externe est indisponible | échec géré + message, pas de blocage muet (cf. safety-rails §6 : repli honnête) |
| **Idempotence / double-clic** | L'utilisateur répète l'action (double soumission) | pas de doublon / pas de double débit d'une unité |
| **État transitoire** | Action longue en cours (génération, upload) | feedback de progression, annulation possible |
| **Reprise / annulation** | L'utilisateur quitte au milieu | reprise possible ou sauvegarde d'état, pas de perte |
| **Quota / plan** | La limite du palier de pricing est atteinte | message + invite claire (recoupe le pricing étape 6, pas de duplication ici) |

**Règle :** une feature Must/Should **sans aucun** cas limite dans sa story est suspecte — repasser le catalogue. Inversement, ne pas **inventer** des cas limites non pertinents pour gonfler : pertinence > exhaustivité aveugle.

## Checklist Definition-of-Done (§ story + § critères de chaque fiche)
- [ ] Une story par feature **Must/Should** (par rôle si plusieurs personas), dans sa fiche.
- [ ] Format « En tant que / je veux / afin de » respecté partout.
- [ ] Chaque bénéfice rattaché à un **besoin Phase 1** (ou `socle complétude`).
- [ ] Couverture des critères (cf. `feature-spec-depth.md` §8) : **1 nominal** + **1 par état** (§5) + **1 par règle métier** (§6) + **1 par boucle fermée** (§7) + **≥1 frontière** (§11).
- [ ] Critères en Given/When/Then, **vérifiables** oui/non, résultat **concret**.
- [ ] Cas limites issus du **catalogue** (Partie C), pertinents (pas inventés pour « faire riche »).
- [ ] Aucune story orpheline (toutes rattachées à une feature du PRD).

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Story sans critère** | « En tant que… je veux… » sans Given/When/Then | Non finie : ajouter au moins le critère nominal |
| **Critère non vérifiable** | « alors l'expérience est agréable » | Réécrire en résultat concret (valeur, message, état, count) |
| **Cas limites oubliés** | Que le happy path | Balayer le catalogue Partie C ; ajouter les critères pertinents |
| **Bénéfice orphelin** | « afin de pouvoir le faire » / sans lien Phase 1 | Rattacher à un besoin `research/` ou reconsidérer la feature |
| **Persona générique** | « un utilisateur » alors que la cible est précise | Reprendre le persona exact de la Phase 1 |
| **Fiche ↔ story désynchro** | Un cas limite de la fiche absent des critères | Répercuter : chaque cas limite fiche = un critère |
| **Débordement implémentation** | Critère décrivant le *comment* technique | Rester sur le *quoi* observable ; le comment = Phase 3 |
| **Cas limites inventés** | Critères hors-sujet pour « faire riche » | Ne garder que les cas pertinents pour la feature |
