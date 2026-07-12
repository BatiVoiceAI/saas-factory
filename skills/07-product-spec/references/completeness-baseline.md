# Référence — Socle « produit complet » + aha moment (étapes 1, 2 et 4)

Retour du terrain (premier run réel déployé, 2026-07) : un SaaS aux **features correctes mais sans onboarding, sans profil, sans empty states paraît creux** — un squelette de features, pas un produit. La complétude est une **exigence de spec**, pas un polish de fin de build : si elle n'entre pas au PRD en Must, elle n'existera pas à la livraison. Cette référence définit le socle, son injection dans la procédure, et l'**aha moment** que le PRD doit nommer.

## Champ d'application
**Tout SaaS public** — produit destiné à de vrais utilisateurs finaux (B2B niche locale, B2C, outil dev public). Le socle s'**ADAPTE** à la niche (quels champs, quels défauts, quel ton), il ne se **DÉBAT** pas (son existence n'est pas une option). Seule exception : un POC/outil interne explicitement demandé par l'utilisateur → documenter dans le PRD pourquoi le socle est réduit.

## Le socle (7 éléments — Must d'office)

| # | Élément | Exigence | Adaptation à la niche (exemple salon) |
|---|---|---|---|
| S1 | **Onboarding wizard court (2-4 écrans)** | À la première connexion, crée l'**entité cœur** du produit avec des **défauts intelligents modifiables**. L'utilisateur sort de l'onboarding avec un produit déjà utilisable — jamais face à un écran vide. | Nom, adresse, horaires du salon + **3 prestations types pré-remplies** modifiables (« Coupe femme — 45 € — 45 min »…) |
| S2 | **Page profil / settings complète** | Infos du compte et de l'entité cœur, changement d'email, préférences de base, **suppression de compte** (RGPD). | Profil salon éditable (infos, horaires, prestations) + compte gérant |
| S3 | **Empty states pédagogiques** | Chaque liste/écran vide explique **quoi faire** + CTA vers l'action. Jamais un tableau vide muet. | « Aucun rendez-vous — partagez votre lien de réservation » + bouton copier |
| S4 | **Emails transactionnels brandés** | Au minimum : connexion (OTP/magic link), confirmation de l'action cœur, notification clé du workflow. Gabarit au thème du produit (étape 8), jamais le template par défaut du provider. | Confirmation de RDV au client, notification de RDV au salon |
| S5 | **Pages légales FR** | Mentions légales, confidentialité RGPD, CGV si vente — générées et liées au footer (voir `_shared/landing-playbook.md`), zéro lien mort. | — (identique toutes niches, contenu adapté) |
| S6 | **404 brandée** | Page d'erreur au thème du produit + lien de retour vers l'app. | — |
| S7 | **Seed / demo data marquée et supprimable** | Données de démonstration identifiées visuellement (badge « exemple ») et supprimables en un clic. Jamais mêlées aux données réelles. | RDV d'exemple dans l'agenda, marqués et effaçables |

L'**entité cœur** dépend du type de produit : profil salon + prestations (booking), premier projet + clé API (outil dev), premier contenu (B2C). La règle est invariante : **l'onboarding la crée avec des défauts intelligents**, l'utilisateur ajuste au lieu de partir de zéro.

## Aha moment (le PRD le nomme — étape 1)
- **Définition** : la **première action où l'utilisateur obtient la valeur promise** — jamais le signup, jamais « compléter son profil ». Ex. salon : « le gérant voit sa page de réservation en ligne avec ses vraies prestations » ; outil dev : « le premier appel API répond ».
- **Chemin le plus court** : le PRD écrit la séquence `signup → onboarding (2-4 écrans) → … → aha`, **étapes comptées**. Cible : **≤ 5 étapes** depuis le signup.
- **Règle de couplage** : l'onboarding wizard (S1) débouche **directement** sur l'aha moment, ou à une action près. Si l'aha est à 10 étapes, on raccourcit le chemin — pas l'ambition.
- **Où** : section « Aha moment » de `product-spec.md`. Le success criterion d'activation du MVP (`mvp-definition.md`) doit pointer cette action, pas une vanity metric.

## Intégration dans la procédure (pas une étape en plus)
| Étape | Ce que le socle y fait |
|---|---|
| **1 — Contexte** | Nommer l'aha moment + le chemin le plus court (ci-dessus). |
| **2 — Features** | Les éléments S1-S7 entrent dans la liste comme **source (d)**, rattachement « **socle complétude** ». Ils ne sont **jamais** des features orphelines. |
| **3 — Specs** | Fiche feature complète pour **S1** (écrans, entité créée, défauts intelligents par niche) et **S2**. Les éléments mécaniques (S3-S7) peuvent être groupés dans **une** fiche « socle produit complet ». |
| **4 — Priorisation** | **Must d'office, exemptés du test de retrait.** La seule discussion = l'adaptation à la niche (quels champs, quels défauts), jamais l'existence. |
| **5 — Stories** | Stories + critères Given/When/Then comme tout Must (ex. « Étant donné un compte neuf, quand je termine l'onboarding, alors mon salon existe avec 3 prestations modifiables »). |

## Checklist Definition-of-Done (socle + aha)
- [ ] Les 7 éléments du socle sont en **Must** dans `feature-prioritization.md`, chacun **adapté à la niche** (défauts intelligents nommés, pas « à définir »).
- [ ] S1 : 2-4 écrans, crée l'entité cœur, sortie = produit utilisable, débouche sur l'aha moment.
- [ ] S2 : la **suppression de compte** est explicitement spécifiée.
- [ ] S7 : marquage visuel + suppression en un clic spécifiés.
- [ ] Aha moment nommé (action de valeur **observable**) + chemin chiffré ≤ 5 étapes.
- [ ] Zéro élément du socle dégradé en Should/Could « faute de temps ».

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Squelette de features** | Features cœur correctes mais produit creux (pas d'onboarding, de profil, d'empty states) | Injecter le socle en Must dès l'étape 2 — la complétude se spécifie, elle ne se rattrape pas au build |
| **Socle débattu** | Le test de retrait appliqué au socle → éléments dégradés en Should | Le socle est **exempté** : Must d'office. On adapte à la niche, on ne débat pas |
| **Onboarding vitrine** | Wizard qui collecte des infos sans créer l'entité cœur | Chaque écran alimente l'entité ; à la sortie, le produit est utilisable |
| **Défauts muets** | Entité créée vide, tout à remplir à la main | Défauts intelligents pré-remplis **modifiables**, dérivés de la niche |
| **Aha lointain** | Première valeur à 8-10 étapes du signup | Raccourcir le chemin : l'onboarding débouche sur l'aha, le reste attend |
| **Socle générique** | S1-S7 recopiés tels quels, sans adaptation (« nom, description ») | Chaque élément porte son adaptation niche dans le PRD — le socle est un gabarit, pas un contenu |
