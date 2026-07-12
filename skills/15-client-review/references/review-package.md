# Référence — Le paquet de revue (étape 1)

Ce qu'on présente à l'humain pour qu'il teste — **digeste, non-technique, honnête**. C'est la **première image** que l'humain a du produit depuis le Go de la Phase 1. Il ne verra jamais le code : il verra **ce paquet**. S'il est confus, verbeux ou malhonnête, toute l'étape 15 démarre mal.

## Objectif de passage
L'humain doit pouvoir **juger et tester en ~10 min**, sans être expert, avec une idée honnête de ce qui est solide et de ce qui ne l'est pas. Critère de sortie : le paquet tient sur un écran, zéro terme technique, et le « ce qu'on sait imparfait » n'est pas vide **si** le livret contient des `CONCERNS`/`WAIVED`.

## Contenu (template `assets/templates/review-package.md`)
1. **L'URL staging** (le sous-domaine provisionné à l'étape 11) + un **accès de test** (compte de démo si besoin, données de démo pré-remplies).
2. **Résumé en langage clair** : ce qui a été construit (les features, le **workflow cœur**), en 5-8 lignes, **zéro jargon**. *(Ton de `stakeholder-update` vendoré.)*
3. **« Ce qui en ressort »** : la synthèse du **livret de test** (`qa/test-booklet.md`) — santé globale, ce qui est solide.
4. **Ce qu'on sait imparfait** : les `CONCERNS`/`WAIVED` du livret, **honnêtement**, en langage clair (« ça marche, mais X est basique pour l'instant »). *(gstack `document-release` : known issues.)*

## Sous-procédure (dans l'ordre)
1. **Vérifier que le staging est vivant.** Charge l'URL provisionnée (étape 11). Si elle 404 / erreur / démo vide → **STOP**, on ne présente rien de cassé à l'humain (repli honnête, `safety-rails` §6). Note l'incident, renvoie au build/déploiement staging avant de continuer.
2. **Préparer l'accès de test.** Compte de démo prêt, mot de passe partagé hors artefact (jamais dans le fichier d'état — `safety-rails` §4), données de démo réalistes (pas de « lorem ipsum » ni de compte vide qui donne une fausse impression de produit mort).
3. **Extraire « ce qui en ressort » du livret.** Lis `qa/test-booklet.md` : santé globale, ce qui est `PASS`, ce qui est `CONCERNS`/`WAIVED`. **Ne recopie pas** le livret (technique) → **traduis** en 3-5 lignes de langage clair.
4. **Rédiger le résumé produit.** 5-8 lignes : le problème résolu + le workflow cœur + l'edge (la différenciation). Ton `stakeholder-update` : ce que le produit **fait pour l'utilisateur**, pas comment il est bâti.
5. **Rédiger le « ce qu'on sait imparfait ».** Traduis chaque `CONCERNS`/`WAIVED` en une phrase honnête et non-alarmante. Voir la matrice ci-dessous.
6. **Passer le paquet au filtre « zéro jargon ».** Voir la checklist de jargon. Un seul terme technique = échec, on réécrit.
7. **Écrire** dans `product/review-package.md` (à partir du template `assets/templates/review-package.md`). Prêt pour l'étape 2 (guider le test).

## Matrice de décision — quoi inclure / quoi exclure
| Élément candidat | Décision | Pourquoi |
|---|---|---|
| URL staging vivante + accès démo | **Inclure** | C'est le produit à tester |
| Workflow cœur en langage clair | **Inclure** | L'humain doit savoir quoi essayer |
| `CONCERNS`/`WAIVED` du livret | **Inclure**, traduits | Honnêteté (`lessons.md`) — jamais caché |
| Score de santé du livret | **Inclure**, en clair (« stable », pas « 8/10 ») | Contexte de confiance |
| Nom de stack, framework, provider | **Exclure** | Jargon, sans valeur pour l'humain |
| `status/*`, verdicts de cascade, logs | **Exclure** | Artefact technique |
| Détails d'archi / schéma BDD | **Exclure** | Le code n'est jamais montré |
| Bug déjà corrigé et re-testé | **Exclure** | Bruit, non pertinent |
| `CONCERNS` sur une feature **non montrée** dans les parcours | **Mentionner brièvement** | Honnête sans surcharger |

## Matrice de traduction — `CONCERNS`/`WAIVED` → langage honnête
| Verdict livret (technique) | Ce qu'on écrit à l'humain (clair, honnête) |
|---|---|
| `CONCERNS: perf p95 lente sur export` | « L'export marche, mais peut mettre quelques secondes sur un gros volume. » |
| `WAIVED: pas de dark mode` | « Interface en clair uniquement pour l'instant — le mode sombre viendra plus tard. » |
| `CONCERNS: a11y — contraste faible zone X` | « Une zone a un contraste un peu léger, on l'a noté à améliorer. » |
| `WAIVED: intégration Y reportée post-MVP` | « L'intégration avec Y n'est pas là au lancement, c'est prévu ensuite. » |
| `CONCERNS: message d'erreur générique` | « Si une erreur survient, le message reste basique — on l'affinera. » |

**Règle** : on **nomme** la limite, on donne le **contour** (ça marche quand même / ça viendra), on **ne minimise pas** et on **ne dramatise pas**.

## Checklist zéro-jargon (chaque ligne du paquet doit passer)
- [ ] Aucun nom de techno, framework, langage, provider, service cloud.
- [ ] Aucun chemin de fichier, aucun `fichier:ligne`, aucun verdict `PASS/FAIL`.
- [ ] Aucun acronyme non expliqué (API, CI, p95, WCAG, OWASP…).
- [ ] Aucune référence à « la cascade », « le faux-client », « les agents ».
- [ ] Chaque feature décrite par **ce qu'elle fait pour l'utilisateur**, pas son nom de code.
- [ ] Un non-technique lirait tout sans buter. Test : le lire à voix haute comme à un ami.

## Definition of Done (étape 1)
- [ ] URL staging **testée vivante** + accès de démo prêt (secret hors artefact).
- [ ] Résumé produit : 5-8 lignes, workflow cœur + edge, zéro jargon.
- [ ] « Ce qui en ressort » : santé traduite du livret, 3-5 lignes.
- [ ] « Ce qu'on sait imparfait » : **tous** les `CONCERNS`/`WAIVED` du livret traduits (ou explicitement « rien de notable »).
- [ ] Checklist zéro-jargon passée intégralement.
- [ ] Le paquet tient sur un écran.

## Data-flow (ce qui alimente le paquet)
```
qa/test-booklet.md ─┐   (santé + CONCERNS/WAIVED)
product/product-spec ─┤─► TRADUCTION langage clair ─► review-package.md ─► étape 2 (guider)
URL staging (étape 11)┘   (zéro jargon, honnête)          │
                                                          └─ secret d'accès → hors artefact (env/oral)
```

## Modes d'échec + parade
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Staging mort** | 404 / démo vide / erreur au chargement | STOP, ne rien présenter, renvoyer au déploiement staging (repli honnête) |
| **Paquet-brochure** | On vend, on cache les défauts | Réinjecter les `CONCERNS`/`WAIVED` du livret ; l'honnêteté prime |
| **Jargon résiduel** | Un terme technique a survécu | Repasser la checklist zéro-jargon, réécrire |
| **Surcharge** | Le paquet fait 3 écrans, l'humain décroche | Couper : garder cœur + edge + top 3 limites |
| **Démo vide** | Compte sans données → produit paraît mort | Pré-remplir des données de démo réalistes |
| **Secret dans l'artefact** | Mot de passe démo écrit dans le fichier | Le sortir vers l'env / le canal oral (`safety-rails` §4) |

## Micro-exemple (niche-agnostique)
> **Ce qu'on a construit.** Tu décris ton besoin en une phrase, l'outil génère un premier livrable prêt à envoyer, tu l'ajustes en deux clics, tu l'exportes. Le tout sans quitter une seule page.
> **Essaie ça.** Crée un livrable → ajuste-le → exporte-le.
> **Ce qui marche bien.** Le parcours principal est stable de bout en bout.
> **Ce qu'on sait imparfait.** L'export d'un très gros volume peut prendre quelques secondes ; on l'accélérera.

## Principe
On **montre le produit, pas le code**. Aucun artefact technique. Objectif : que l'humain puisse **juger et tester en ~10 min**, sans être expert.

## Matériau (vendoré / à vendorer)
- gstack `document-release` → known issues / changelog.
- gstack `qa` → health score + screenshots du staging.
- PM `stakeholder-update` (Anthropic, Apache) → le résumé adapté au founder.
