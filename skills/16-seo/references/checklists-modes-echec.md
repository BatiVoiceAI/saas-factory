# Référence — Checklists Definition-of-Done, cas limites & modes d'échec (étape 16)

Les critères d'acceptation par artefact, le catalogue de cas limites, et les modes d'échec de l'étape avec leur correction. À passer **avant** le gate humain (mécanisme 4) et **avant** la clôture d'étape. Ce qui prime sur tout : **qualité mesurée, jamais du volume** + **rien de public sans OK humain**.

---

## Definition-of-Done — `seo/topic-cluster-map.md`
- [ ] **Ancré niche** : dérivé de `positioning.md` + `idea-brief.md` + PRD (pas d'invention).
- [ ] **1 pillar** (thème cœur + mot-clé pilier) identifiée.
- [ ] **Clusters priorisés** : chacun avec intention (M2) · difficulté · volume · opportunité (M3).
- [ ] Chaque cluster retenu a un **« pourquoi on peut gagner ici »** (longue traîne accessible).
- [ ] Volumes **mesurés** (source M1) ou explicitement `[estimé, non mesuré]` — **jamais** un faux chiffre.
- [ ] **Mapping** cluster clé → une page + **maillage interne** (pillar ↔ clusters, anti-orphelins).
- [ ] Génériques concurrentiels **écartés** (on ne se place pas dessus).

## Definition-of-Done — `seo/plan.md` + pages
- [ ] **Plafond respecté** : landing + **≤ 8** pages (M4). N est un maximum, pas un quota.
- [ ] **1 page = 1 cluster = 1 intention** (aucune paire cannibale, M5).
- [ ] Chaque page a un **PASS Helpful Content** consigné (self-assessment, `forcing-questions.md` §1).
- [ ] Rédaction **spécifique niche / first-hand** (via `content-creation` vendoré), zéro remplissage.
- [ ] **Aucune génération de masse** depuis une DB/template (pas de programmatic SEO).
- [ ] Tableau `seo/plan.md` rempli : page · cluster/intention · mot-clé principal · PASS.
- [ ] **Gate humain** : OK explicite tracé (date) **avant** publication.

## Definition-of-Done — On-page + technique
- [ ] **Meta uniques** par page : title ≤ 60c, description ≤ 155c.
- [ ] **Un seul H1** par page + hiérarchie Hn logique.
- [ ] **URL** propre, courte, avec le mot-clé.
- [ ] **Open Graph / Twitter Card** présents.
- [ ] **Maillage interne** conforme à la carte de clusters.
- [ ] **JSON-LD** via `schema-dts`, type correct (M6), **aucun faux markup** (pas de rating/FAQ inventés).
- [ ] **Sitemap + robots** natifs du framework (M7) + **canonical sur chaque page**.
- [ ] **`unlighthouse`** lancé, **CWV verts** (LCP/CLS/INP dans les seuils M8) + SEO + a11y OK.
- [ ] Mobile responsive vérifié (hérité de l'étape 8, pas re-designé).

## Definition-of-Done — Clôture d'étape
- [ ] `seo/topic-cluster-map.md` + `seo/plan.md` écrits ; optimisations dans le code.
- [ ] **Gate humain OK et tracé** (rien de public sans OK).
- [ ] **Aucun secret / clé** dans le repo, l'état, les logs (safety-rails §4).
- [ ] `.saas-factory/state.md` mis à jour (étape 16 faite, nb de clusters, nb de pages, gate OK).
- [ ] Résumé en 2 lignes (clusters + nb de pages).
- [ ] Annonce **étape 17 (déploiement)**.

---

## Catalogue de cas limites (condition → traitement)

| Cas limite | Traitement |
|---|---|
| **`type != public`** (perso/interne) | **Sauter l'étape 16** entièrement, annoncer l'étape 17 |
| **Doute sur le type** | Lire `idea-brief.md` ; sinon 1 question binaire, ne pas supposer |
| **`positioning.md` absent** | S'arrêter : la niche vient de la Phase 1, ne pas fabriquer une niche |
| **Aucune source data (pas de MCP)** | Fallback gratuit (Suggest+PAA+concurrents), volumes `[estimé]` (M1) |
| **< 3 clusters défendables** | Produire **moins** de pages (landing + 1-2), ne pas gonfler jusqu'à 3 |
| **> 8 clusters intéressants** | Garder les 8 meilleurs (M3), le reste attend l'itération (M9) |
| **Deux clusters même intention** | Fusionner en une page (M5), pas deux |
| **Page ne passe pas Helpful Content** | Améliorer ou **couper** — jamais publier « pour faire nombre » |
| **Landing déjà existante (étape 8)** | Optimiser l'existante (meta/schema/maillage), ne pas la refaire |
| **Framework non couvert par M7** | Sitemap/robots au standard + documenter |
| **`unlighthouse` échoue à s'installer** | Lighthouse simple, 3 métriques consignées à la main, ne pas sauter le check |
| **CWV rouge** | Corriger (image/layout/JS) puis re-mesurer, ne pas publier rouge |
| **Utilisateur ne valide pas le gate** | **Ne pas publier**, livrer « prêt, en attente », consigner |
| **Utilisateur valide partiellement** | Publier le sous-lot OK, retirer le reste, tracer |
| **Pas encore de données GSC** | Ne rien inventer, fixer un rappel, s'arrêter (mécanisme 5) |
| **Demande d'ajouter des pages en masse** | Refuser : plafond dur + anti scaled-content-abuse |

---

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Scaled content abuse** | dizaines/centaines de pages générées depuis une DB/template | STOP : plafond landing + 8, 1 page = 1 rédaction (M4, `quality-guardrails.md` §1) |
| **Volume déguisé** | 8 pages « parce que 8 clusters » alors que 3 tiennent | produire moins ; le plafond est un maximum, pas un quota |
| **Contenu creux** | pages génériques écrites « pour Google » | self-assessment Helpful Content, ré-écrire niche/first-hand ou couper |
| **Cannibalisation** | 2 pages ciblent la même intention/SERP | fusionner en une (M5), une intention par page |
| **Faux structured data** | `aggregateRating`/`FAQPage` sans avis/FAQ réels | retirer le faux markup (Google pénalise), ne coder que le vrai |
| **Mots-clés génériques** | on vise « logiciel {catégorie} » ultra-concurrentiel | rabattre sur la longue traîne accessible (M3) |
| **Volume inventé** | chiffres de volume précis sans source mesurée | marquer `[estimé]` ou brancher une source (M1), ne pas bluffer |
| **CWV ignorés** | landing lente/instable publiée | `unlighthouse` en gate, corriger avant publication (M8) |
| **Publication sans OK** | pages mises en ligne sur validation implicite/ancienne | **interdit** : gate humain explicite tracé (safety-rails §1, mécanisme 4) |
| **Secret committé** | clé API DataForSEO/Ahrefs en dur | retirer, passer en env (safety-rails §4), purger l'historique si commité |
| **Itération sur bruit** | « optimisation » sur 3 impressions GSC | attendre des données suffisantes, sinon constat honnête (mécanisme 5) |
| **SEO sur produit non public** | crawl/indexation d'un outil interne | garde d'entrée : `type != public` ⇒ sauter |
| **Débordement de phase** | on déploie/indexe réellement ici | l'indexation réelle est l'étape 17 ; ici on prépare + on valide |
| **Boucle infinie d'optimisation** | itérations SEO sans fin | budget de boucle (safety-rails §7) : présenter l'état, laisser trancher |

---

## Diagramme — la porte de sortie de l'étape 16

```
topic-cluster-map ─┐  (ancré niche)
                   │
pages ≤ plafond ───┼─ toutes PASS Helpful Content
                   │
technique verte ───┼─ (unlighthouse: CWV + SEO + a11y)
                   │
                   ▼
        [ Checklist bloquante 100% ? ]
             │                  │
         NON │              OUI │
             ▼                  ▼
   retour méca. 2 (contenu)  [ GATE HUMAIN : AskUserQuestion ]
   ou méca. 3 (technique)         │              │
                              non/silence │   OK explicite tracé │
                                  ▼              ▼
                       « prêt, en attente »   PUBLIÉ (indexation réelle = étape 17)
                       ne pas publier              │
                                                   ▼
                                        étape 17 · déploiement
```
**Fin du bloc SEO :** carte de clusters + pages de qualité mesurée, validées humainement, techniquement vertes → l'étape 17 déploie et rend l'indexation réelle. L'itération (mécanisme 5) s'ouvre **après**, sur données GSC réelles, **sous le même plafond**.
