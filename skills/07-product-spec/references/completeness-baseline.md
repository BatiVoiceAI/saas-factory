# Référence — Socle « produit complet » + aha moment (étapes 1, 2 et 3)

Retour du terrain (premier run réel déployé, 2026-07) : un SaaS aux **features correctes mais sans onboarding, sans profil, sans empty states paraît creux** — un squelette de features, pas un produit. La complétude est une **exigence de spec**, pas un polish de fin de build : si elle n'entre pas au PRD en Must, elle n'existera pas à la livraison. Cette référence définit le socle, son injection dans la procédure, et l'**aha moment** que le PRD doit nommer.

## Champ d'application — les 3 types (adapter honnêtement, pas mécaniquement)
Le socle est **universel aux 3 types de produit** (comme la doctrine `_shared/boucles-fermees.md`). Ce qui **varie honnêtement** = le contenu, le canal, le mode d'entrée (signup public vs SSO vs usage direct) et le ton ; ce qui ne varie **pas** = l'existence des éléments. Le socle s'**ADAPTE**, il ne se **DÉBAT** pas.

| Type | Ce qui s'applique tel quel | Ce qui s'adapte honnêtement |
|---|---|---|
| **SaaS public** (B2B niche, B2C, outil dev public) | **Tout** le socle S1-S8 | Signup public ; pages légales FR pleines (mentions, confidentialité, CGV si vente) |
| **Outil interne entreprise** (congés, achats, tickets) | S1 onboarding, S2 profil/rôles, S3 empty states, S4 emails/notifs, S6 404, S7 seed, S8 metadata | Entrée = **SSO / rôles** (pas signup public) ; S4 = email pro et/ou notif in-app/Slack ; S5 = **pages internes** (politique interne, mentions RGPD employeur) plutôt que CGV publiques ; S2 inclut une **trace d'audit** |
| **Outil perso** (suivi, journal, tracker) | S1 onboarding léger qui crée l'entité cœur, S3 empty states, S6 404, S7 seed, S8 metadata | S2 = compte + export/suppression de données ; S4 = emails **seulement** si échéance/contrepartie externe ; S5 = mentions minimales + confidentialité si données perso hébergées |

**Règle d'or (identique à boucles-fermees) :** « socle réduit » est une **décision justifiée par élément** (ex. outil perso mono-utilisateur → pas de gestion de rôles), **jamais** une dispense de type. Un outil interne n'est **pas** une excuse pour un produit creux : c'est souvent là que l'absence d'onboarding et d'empty states fait le plus mal (l'employé est lâché sans repère). Toute réduction se **documente** dans le PRD.

## Le socle (8 éléments — Must d'office)

| # | Élément | Exigence | Adaptation (exemple salon — SaaS public) |
|---|---|---|---|
| S1 | **Onboarding wizard court (2-4 écrans)** | À la première connexion, crée l'**entité cœur** du produit avec des **défauts intelligents modifiables**. L'utilisateur sort de l'onboarding avec un produit déjà utilisable — jamais face à un écran vide. | Nom, adresse, horaires du salon + **3 prestations types pré-remplies** modifiables (« Coupe femme — 45 € — 45 min »…) |
| S2 | **Page profil / settings complète** | Infos du compte et de l'entité cœur, changement d'email, préférences de base, **suppression de compte** (RGPD). Outil interne : + rôles + trace d'audit. | Profil salon éditable (infos, horaires, prestations) + compte gérant |
| S3 | **Empty states pédagogiques** | Chaque liste/écran vide explique **quoi faire** + CTA vers l'action. Jamais un tableau vide muet. | « Aucun rendez-vous — partagez votre lien de réservation » + bouton copier |
| S4 | **Emails / notifications transactionnels brandés** | Au minimum : connexion (OTP/magic link), confirmation de l'action cœur, notification clé du workflow. Gabarit au thème du produit (étape 8), jamais le template par défaut du provider. Canal adapté au type (email client / email pro / in-app / webhook — cf. boucles-fermees). | Confirmation de RDV au client, notification de RDV au salon |
| S5 | **Pages légales FR** | SaaS public : mentions légales, confidentialité RGPD, CGV si vente — générées et liées au footer (voir `_shared/landing-playbook.md`), zéro lien mort. Interne/perso : équivalent adapté (politique interne / mentions minimales). | — (identique toutes niches, contenu adapté) |
| S6 | **404 brandée** | Page d'erreur au thème du produit + lien de retour vers l'app. | — |
| S7 | **Seed / demo data marquée et supprimable** | Données de démonstration identifiées visuellement (badge « exemple ») et supprimables en un clic. Jamais mêlées aux données réelles. | RDV d'exemple dans l'agenda, marqués et effaçables |
| S8 | **Metadata & favicon brandés** | `<title>` + meta description par page clé, **favicon** au thème, image Open Graph/partage (au moins l'accueil), langue `fr`. Le produit ne s'affiche jamais avec le favicon par défaut du framework ni un onglet « localhost ». Exécution visuelle = étape 8 ; le PRD **exige** l'élément. | Titre « \<Salon\> — Réservation en ligne », favicon logo, OG de la page publique |

L'**entité cœur** dépend du type de produit : profil salon + prestations (booking public), premier projet + clé API (outil dev), première demande + valideur (outil interne), premier suivi (outil perso). La règle est invariante : **l'onboarding la crée avec des défauts intelligents**, l'utilisateur ajuste au lieu de partir de zéro.

## Aha moment (le PRD le nomme — étape 1)
- **Définition** : la **première action où l'utilisateur obtient la valeur promise** — jamais le signup, jamais « compléter son profil ». Ex. salon : « le gérant voit sa page de réservation en ligne avec ses vraies prestations » ; outil dev : « le premier appel API répond » ; outil interne : « la première demande de congé est soumise et le valideur notifié » ; outil perso : « le premier suivi est enregistré et apparaît dans l'historique ».
- **Chemin le plus court** : le PRD écrit la séquence `entrée (signup/SSO) → onboarding (2-4 écrans) → … → aha`, **étapes comptées**. Cible : **≤ 5 étapes** depuis l'entrée.
- **Règle de couplage** : l'onboarding wizard (S1) débouche **directement** sur l'aha moment, ou à une action près. Si l'aha est à 10 étapes, on raccourcit le chemin — pas l'ambition.
- **Où** : section « Aha moment » de `product-spec.md`. Le success criterion d'activation du MVP (`product-spec.md` § MVP, cf. fusion §5) doit pointer cette action, pas une vanity metric.

## Intégration dans la procédure (pas une étape en plus)
| Étape | Ce que le socle y fait |
|---|---|
| **1 — Contexte** | Nommer l'aha moment + le chemin le plus court (ci-dessus). |
| **2 — Features** | Les éléments S1-S8 entrent dans la liste comme **source (d)**, rattachement « **socle complétude** ». Ils ne sont **jamais** des features orphelines. |
| **3 — Priorisation** | **Must d'office, exemptés du test de retrait.** La seule discussion = l'adaptation au type/à la niche (quels champs, quels défauts, quel canal), jamais l'existence. |
| **5 — Specs** | Fiche feature complète pour **S1** (écrans, entité créée, défauts intelligents par niche) et **S2**. Les éléments mécaniques (S3-S8) peuvent être groupés dans **une** fiche « socle produit complet ». Story + critères Given/When/Then comme tout Must (ex. « Étant donné un compte neuf, quand je termine l'onboarding, alors mon salon existe avec 3 prestations modifiables »). |

## Checklist Definition-of-Done (socle + aha)
- [ ] Les 8 éléments du socle sont en **Must** dans `product-spec.md` § Priorisation, chacun **adapté au type/à la niche** (défauts intelligents nommés, pas « à définir »).
- [ ] S1 : 2-4 écrans, crée l'entité cœur, sortie = produit utilisable, débouche sur l'aha moment.
- [ ] S2 : la **suppression de compte** (RGPD) est explicitement spécifiée ; rôles + audit si outil interne.
- [ ] S7 : marquage visuel + suppression en un clic spécifiés.
- [ ] S8 : titre + favicon + OG au thème spécifiés (jamais le favicon par défaut du framework).
- [ ] Aha moment nommé (action de valeur **observable**) + chemin chiffré ≤ 5 étapes.
- [ ] Toute **réduction** du socle (outil interne/perso) est **documentée par élément**, jamais une dispense de type.
- [ ] Zéro élément du socle dégradé en Should/Could « faute de temps ».

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Squelette de features** | Features cœur correctes mais produit creux (pas d'onboarding, de profil, d'empty states) | Injecter le socle en Must dès l'étape 2 — la complétude se spécifie, elle ne se rattrape pas au build |
| **Socle débattu** | Le test de retrait appliqué au socle → éléments dégradés en Should | Le socle est **exempté** : Must d'office. On adapte à la niche, on ne débat pas |
| **Onboarding vitrine** | Wizard qui collecte des infos sans créer l'entité cœur | Chaque écran alimente l'entité ; à la sortie, le produit est utilisable |
| **Défauts muets** | Entité créée vide, tout à remplir à la main | Défauts intelligents pré-remplis **modifiables**, dérivés de la niche |
| **Aha lointain** | Première valeur à 8-10 étapes de l'entrée | Raccourcir le chemin : l'onboarding débouche sur l'aha, le reste attend |
| **Socle générique** | S1-S8 recopiés tels quels, sans adaptation (« nom, description ») | Chaque élément porte son adaptation type/niche dans le PRD — le socle est un gabarit, pas un contenu |
| **Dispense de type** | « C'est un outil interne, pas besoin d'onboarding/empty states » | Le socle est **universel** : on adapte le canal/mode d'entrée, on ne saute pas les éléments. Toute réduction se justifie **par élément**, documentée |
