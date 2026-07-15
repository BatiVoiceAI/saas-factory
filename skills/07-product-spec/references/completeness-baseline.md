# Référence — Socle « produit complet » + aha moment (étapes 1, 2 et 3)

Retour du terrain (premier run réel déployé, 2026-07) : un SaaS aux **features correctes mais sans onboarding, sans profil, sans empty states paraît creux** — un squelette de features, pas un produit. La complétude est une **exigence de spec**, pas un polish de fin de build : si elle n'entre pas au PRD en Must, elle n'existera pas à la livraison. Cette référence définit le socle, son injection dans la procédure, et l'**aha moment** que le PRD doit nommer.

🚨 **Depuis l'audit v0.4.4 (thème TYPES), le socle n'est plus « universel aux 3 types » : il est CONDITIONNÉ PAR L'ARCHÉTYPE du livrable** (`web-saas` / `landing` / `automation` / `ecommerce`). Le retour du terrain ci-dessus décrit le socle **web-saas** ; `landing`, `automation` et `ecommerce` ont **leur propre socle** (ni onboarding, ni dashboard). Le modèle à 3 axes orthogonaux (`archetype` × `type` × `tenancy`) vit en **SOURCE UNIQUE** dans `_shared/state-schema.md` §socle-par-archétype — cf. §Champ d'application.

## Sommaire

- Champ d'application — conditionné par l'**ARCHÉTYPE** (plus « universel aux 3 types »)
- Le socle **web-saas** (8 éléments S1-S8 — Must d'office pour l'archétype `web-saas`)
- Le socle **landing** (4 éléments LP1-LP4 — Must d'office pour l'archétype `landing`)
- Le socle **automation** (5 éléments AU1-AU5 — Must d'office pour l'archétype `automation`)
- Le socle **ecommerce** (5 éléments EC1-EC5 — Must d'office pour l'archétype `ecommerce`)
- Aha moment (le PRD le nomme — étape 1)
- Intégration dans la procédure (pas une étape en plus)
- Checklist Definition-of-Done (socle + aha)
- Modes d'échec (et comment les gérer)

## Champ d'application — conditionné par l'**ARCHÉTYPE** (plus « universel aux 3 types »)

🚨 **Le socle n'est PLUS universel : il dépend de l'ARCHÉTYPE** (la forme **technique** du livrable), pas du type d'accès. Le modèle canonique à **3 axes orthogonaux** — `archetype` (forme technique) × `type` (accès : public|interne|perso) × `tenancy` (single|multi-org, web-saas) — vit en **SOURCE UNIQUE** dans `_shared/state-schema.md` §socle-par-archétype ; on y **renvoie**, on ne le recopie pas. Ici, une seule règle : **quel socle pour quel archétype**.

| Archétype | Socle injecté d'office | Ce qui est **explicitement absent** |
|---|---|---|
| **web-saas** (défaut : auth + BDD + dashboard) | **socle UI S1-S8** (↓) | — |
| **landing** (page marketing seule + waitlist/CTA) | **socle LANDING LP1-LP4** (↓) | **PAS** d'auth, **PAS** de BDD produit, **PAS** de dashboard, **PAS** d'onboarding wizard, **PAS** d'entité cœur CRUD |
| **automation** (worker / cron / bot / intégration headless) | **socle AUTOMATION AU1-AU5** (↓) | **PAS** d'onboarding wizard UI, **PAS** de dashboard produit, **PAS** d'entité cœur CRUD ; admin minimal **optionnel** |
| **ecommerce** (site de vente : catalogue + panier + checkout one-shot) | **socle ECOMMERCE EC1-EC5** (↓) | **PAS** le socle web-saas d'office : **PAS** d'onboarding wizard produit, **PAS** de dashboard applicatif (le back-office admin n'est **PAS** un dashboard SaaS), l'entité cœur = le **PRODUIT** + la **COMMANDE** |

🚨 **Périmètre — modèle, pas encore code.** L'archétype est défini **au MODÈLE** (ici + `state-schema.md`) ; le **scaffold code** des archétypes `landing` & `automation` est **DÉFÉRÉ au Thème C** — non buildable tel quel aujourd'hui. Réutiliser l'existant quand c'est vrai : la brique **landing + waitlist** existe (`_shared/go-test-playbook.md`), les composants `components/landing/*` du châssis existent, l'entité **Org** est déjà modélisée en pattern par défaut (09 `data-model.md`, pour `tenancy: multi-org`). Pour **ecommerce** : socle **défini au MODÈLE** (ici + `state-schema.md` + `_shared/archetypes/ecommerce.md`) **et châssis LIVRÉ** — le bloc `_shared/blocks/ecommerce/` **existe** (logique commerce + SQL + pièges P1/P2/P3, `verify:machine` + tests `node:test` verts, dependency-light comme `automation/`), l'**UI se dérivant du socle web-saas** (remplace `billing` abonnement par le checkout one-shot ; cf. `ecommerce.md`).

**Règle d'invariance (reformulée) :** ce qui **ne varie pas** = **l'existence des éléments DE L'ARCHÉTYPE** (le socle du bon archétype s'**ADAPTE**, il ne se **DÉBAT** pas). Ce qui **varie honnêtement** = à l'intérieur d'un archétype, le contenu / le canal / le mode d'entrée / le ton **selon le `type`** (axe orthogonal). Injecter un socle **du mauvais archétype** (dashboard sur une `automation`, onboarding wizard sur une `landing`) est un **défaut** — cf. Modes d'échec.

### web-saas — adaptation par **`type` d'accès** (public | interne | perso)
Le `type` est **orthogonal à l'archétype** : il n'ajoute ni ne retire aucun élément du socle web-saas, il en **adapte le contenu** (entrée signup public vs SSO vs usage direct, canal, légal par juridiction, ton). Le socle web-saas S1-S8 s'applique ; ce qui suit dit **comment** l'adapter au `type`.

| Type | Ce qui s'applique tel quel | Ce qui s'adapte honnêtement |
|---|---|---|
| **SaaS public** (B2B niche, B2C, outil dev public) | **Tout** le socle S1-S8 | Signup public ; pages légales pleines **adaptées à la juridiction `jurisdiction`** (cf. S5). `tenancy: multi-org` (B2B vendu à N entreprises) active en plus le substrat org — cf. `state-schema.md` |
| **Outil interne entreprise** (congés, achats, tickets) | S1 onboarding, S2 profil/rôles, S3 empty states, S4 emails/notifs, S6 404, S7 seed, S8 metadata | Entrée = **SSO / rôles** (pas signup public) ; S4 = email pro et/ou notif in-app/Slack ; S5 = **pages internes** (politique interne, mentions RGPD employeur) plutôt que CGV publiques ; S2 inclut une **trace d'audit** |
| **Outil perso** (suivi, journal, tracker) | S1 onboarding léger qui crée l'entité cœur, S3 empty states, S6 404, S7 seed, S8 metadata | S2 = compte + export/suppression de données ; S4 = emails **seulement** si échéance/contrepartie externe ; S5 = mentions minimales + confidentialité si données perso hébergées |

**Règle d'or (identique à boucles-fermees) :** « socle réduit » est une **décision justifiée par élément** (ex. outil perso mono-utilisateur → pas de gestion de rôles), **jamais** une dispense de type. Un outil interne n'est **pas** une excuse pour un produit creux : c'est souvent là que l'absence d'onboarding et d'empty states fait le plus mal (l'employé est lâché sans repère). Toute réduction se **documente** dans le PRD. (Cette règle vaut **à l'intérieur** de l'archétype web-saas ; elle ne permet jamais de retirer un socle d'archétype entier.)

## Le socle **web-saas** (8 éléments S1-S8 — Must d'office pour l'archétype `web-saas`)

| # | Élément | Exigence | Adaptation (exemple salon — SaaS public) |
|---|---|---|---|
| S1 | **Onboarding wizard court (2-4 écrans)** | À la première connexion, crée l'**entité cœur** du produit avec des **défauts intelligents modifiables**. L'utilisateur sort de l'onboarding avec un produit déjà utilisable — jamais face à un écran vide. | Nom, adresse, horaires du salon + **3 prestations types pré-remplies** modifiables (« Coupe femme — 45 € — 45 min »…) |
| S2 | **Page profil / settings complète** | Infos du compte et de l'entité cœur, changement d'email, préférences de base, **suppression de compte** (RGPD). Outil interne : + rôles + trace d'audit. | Profil salon éditable (infos, horaires, prestations) + compte gérant |
| S3 | **Empty states pédagogiques** | Chaque liste/écran vide explique **quoi faire** + CTA vers l'action. Jamais un tableau vide muet. | « Aucun rendez-vous — partagez votre lien de réservation » + bouton copier |
| S4 | **Emails / notifications transactionnels brandés** | Au minimum : vérification d'e-mail (code OTP à l'inscription / réinitialisation — plus de magic link), confirmation de l'action cœur, notification clé du workflow. Gabarit au thème du produit (étape 8), jamais le template par défaut du provider. Canal adapté au type (email client / email pro / in-app / webhook — cf. boucles-fermees). | Confirmation de RDV au client, notification de RDV au salon |
| S5 | **Pages légales adaptées à la juridiction** | SaaS public : pages légales **adaptées à la juridiction `jurisdiction`** (cf. `_shared/state-schema.md`) — FR → mentions légales + confidentialité RGPD (+ CGV si vente) ; US/EN → Terms of Service + Privacy Policy ; DE → Impressum + Datenschutz ; etc. Générées et liées au footer (voir `_shared/landing-playbook.md`), zéro lien mort. 🚨 Jamais « FR » en dur : un produit anglais avec Terms + Privacy est **conforme**, pas recalé. Interne/perso : équivalent adapté (politique interne / mentions minimales). | — (identique toutes niches, **contenu + juridiction adaptés**) |
| S6 | **404 brandée** | Page d'erreur au thème du produit + lien de retour vers l'app. | — |
| S7 | **Seed / demo data marquée et supprimable** | Données de démonstration identifiées visuellement (badge « exemple ») et supprimables en un clic. Jamais mêlées aux données réelles. | RDV d'exemple dans l'agenda, marqués et effaçables |
| S8 | **Metadata & favicon brandés** | `<title>` + meta description par page clé, **favicon** au thème, image Open Graph/partage (au moins l'accueil), langue = **`locale` du produit** (cf. `_shared/state-schema.md` — `<html lang>` + `og:locale`, jamais « fr » en dur). Le produit ne s'affiche jamais avec le favicon par défaut du framework ni un onglet « localhost ». Exécution visuelle = étape 8 ; le PRD **exige** l'élément. | Titre « \<Salon\> — Réservation en ligne », favicon logo, OG de la page publique |

L'**entité cœur** dépend du type de produit : profil salon + prestations (booking public), premier projet + clé API (outil dev), première demande + valideur (outil interne), premier suivi (outil perso). La règle est invariante : **l'onboarding la crée avec des défauts intelligents**, l'utilisateur ajuste au lieu de partir de zéro. (Notion propre à l'archétype **web-saas** : `landing` et `automation` **n'ont pas** d'entité cœur CRUD.)

## Le socle **landing** (4 éléments LP1-LP4 — Must d'office pour l'archétype `landing`)
Pour une **landing seule** (marketing + capture), le socle n'est **pas** S1-S8 : ni auth, ni BDD produit, ni dashboard, ni onboarding wizard, ni entité cœur CRUD. Les éléments **de l'archétype** :

| # | Élément | Exigence |
|---|---|---|
| LP1 | **Sections du landing** | Structure complète du landing-playbook (hero, problème→solution, preuve, offre, FAQ, CTA) — cf. `_shared/landing-playbook.md`. Jamais une section-fantôme. |
| LP2 | **Waitlist / CTA de capture** | Au moins une conversion : email → confirmation. **Brique existante** (`_shared/go-test-playbook.md`). **Boucle fermée** : notification au propriétaire à chaque inscription (cf. `_shared/boucles-fermees.md`). |
| LP3 | **Pages légales adaptées à la juridiction** | Idem S5 : jeu légal selon `jurisdiction` (cf. `_shared/state-schema.md` §Règle légale), liées au footer, zéro lien mort. |
| LP4 | **Métadonnées & favicon & OG** | Idem S8 : `<title>` + meta description, favicon au thème, image Open Graph, `<html lang>` = `locale`. Une landing **vit** de son partage social. |

🚨 Scaffold code de l'archétype `landing` = **Thème C** ; réutilise `components/landing/*` + brique waitlist existants (le modèle est posé ici, le build ne l'est pas encore).

## Le socle **automation** (5 éléments AU1-AU5 — Must d'office pour l'archétype `automation`)
Pour un livrable **headless** (worker / cron / bot / intégration), aucun socle UI produit : ni onboarding wizard, ni dashboard, ni entité cœur CRUD. Les éléments **de l'archétype** :

| # | Élément | Exigence |
|---|---|---|
| AU1 | **Config & secrets** | Paramètres du job + accès infra **hors code** (`~/.saas-factory/`, jamais en dur — cf. `safety-rails`). |
| AU2 | **Historique de runs + logs** | Chaque exécution tracée : horodatage, statut (OK/KO), durée, sortie/erreur consultables. |
| AU3 | **Healthcheck** | État de santé exposé (dernier run OK/KO, prochaine échéance) — vérifiable sans lire les logs bruts. |
| AU4 | **Boucle fermée (obligatoire)** | **Alerte / rapport au propriétaire** quand un run **échoue** (toujours) ou **réussit** (selon enjeu) — email / Slack / webhook, cf. `_shared/boucles-fermees.md`. Un worker muet qui échoue en silence est **recalé**. |
| AU5 | **Idempotence** | Un run **rejoué** (retry, doublon de trigger) ne **double pas** les effets. |

Admin minimal (lecture seule des runs) **optionnel**, jamais un dashboard produit. ✅ Scaffold code de l'archétype `automation` = **LIVRÉ** → bloc `_shared/blocks/automation/` (AU1-AU5 en `src/*` réels + migration + harness `node:test` + runner one-shot). Une route automation est **buildable aujourd'hui** ; le modèle est posé ici, le build est scaffoldé depuis ce bloc (manifeste : son `README.md`).

## Le socle **ecommerce** (5 éléments EC1-EC5 — Must d'office pour l'archétype `ecommerce`)
Pour une **boutique en ligne** (catalogue + panier + checkout **one-shot**), le socle n'est **pas** S1-S8 web-saas : pas d'onboarding wizard produit, pas de dashboard applicatif (le back-office admin n'est **pas** un dashboard SaaS), pas d'entité cœur CRUD générique — l'entité cœur est **le produit + la commande**. Le billing n'est **PAS** un abonnement Stripe mais un **paiement de panier one-shot**. Les éléments **de l'archétype** :

| # | Élément | Exigence |
|---|---|---|
| EC1 | **Catalogue produits** | Table `products` (+ `variants`, `categories`), page **liste** + page **détail** (nom, description, **prix**, images réelles, disponibilité). Lecture **publique** (RLS : `select` anon sur les produits **publiés** seulement). Back-office : CRUD produits (admin). |
| EC2 | **Panier** | État de panier (client + persistance : cookie / table `carts`), ajout/retrait/quantité, sous-totaux **recalculés côté serveur** — **jamais** un total envoyé par le client (piège **P2**). Vide → état vide avec CTA « continuer mes achats ». |
| EC3 | **Checkout + paiement ONE-SHOT** | **Stripe Checkout / Payment Intents** en `mode:payment` (**PAS** `subscription`). **Checkout invité par défaut** (email suffit). Montant **recalculé côté serveur** depuis le catalogue. Commande créée/confirmée **au webhook** (`checkout.session.completed` / `payment_intent.succeeded` — source de vérité = Stripe), **idempotent** sur l'id de session/intent (redelivery Stripe ⇒ pas de double commande — piège **P3**). |
| EC4 | **Commandes + boucle fermée** | Tables `orders` + `order_items` avec **snapshot** du prix payé (pas une FK vive vers le prix courant), statut (`paid`/`fulfilled`/`cancelled`/`refunded`). **Boucle fermée** (`_shared/boucles-fermees.md`) : confirmation de commande **au client** **ET** notification **au marchand** — **aucune vente muette**. Espace « mes commandes » (si compte) + back-office commandes (admin). |
| EC5 | **Inventaire / stock** | Suivi du stock par produit/variant, **décrément ATOMIQUE** à la commande (contrainte DB, jamais un check applicatif) — **anti-survente** : deux commandes concurrentes sur le dernier article ne peuvent réussir toutes les deux (piège **P1**). Rupture → produit **non achetable** + état « épuisé ». |

Back-office admin (produits + commandes) inclus au socle (EC1/EC4), jamais un dashboard SaaS. **Trois pièges DURS non négociables** (portes 13/14, détail `_shared/archetypes/ecommerce.md` §Pièges) : **P1** survente / course sur le stock (décrément atomique) · **P2** intégrité du prix (recalcul serveur, jamais un total client) · **P3** idempotence du webhook Stripe. ✅ Scaffold code de l'archétype `ecommerce` = **LIVRÉ** → châssis `_shared/blocks/ecommerce/` (logique commerce + SQL + pièges P1/P2/P3 : `lib/pricing` · `lib/inventory` · `lib/cart` / `lib/orders` · `webhook` + migrations RLS + RPC `fulfill_paid_order`, `verify:machine` + tests `node:test` verts, dependency-light comme `automation/`). L'**UI se dérive du socle web-saas** (remplace `billing` abonnement par le checkout one-shot ; documentée dans `_shared/blocks/ecommerce/BLOCKS.md`, pas compilée) — cf. `_shared/archetypes/ecommerce.md`.

## Aha moment (le PRD le nomme — étape 1)
- **Définition** : la **première action où l'utilisateur obtient la valeur promise** — jamais le signup, jamais « compléter son profil ». Ex. salon : « le gérant voit sa page de réservation en ligne avec ses vraies prestations » ; outil dev : « le premier appel API répond » ; outil interne : « la première demande de congé est soumise et le valideur notifié » ; outil perso : « le premier suivi est enregistré et apparaît dans l'historique ».
- **Chemin le plus court** : le PRD écrit la séquence `entrée (signup/SSO) → onboarding (2-4 écrans) → … → aha`, **étapes comptées**. Cible : **≤ 5 étapes** depuis l'entrée.
- **Règle de couplage** : l'onboarding wizard (S1) débouche **directement** sur l'aha moment, ou à une action près. Si l'aha est à 10 étapes, on raccourcit le chemin — pas l'ambition.
- **Par archétype** : `web-saas` = première action de valeur (ci-dessus) ; `automation` = **premier run réussi** + rapport de boucle fermée reçu par le propriétaire (AU4) ; `landing` = message reçu + **conversion CTA/waitlist** (LP2). Le socle du bon archétype **débouche** sur cet aha.
- **Où** : section « Aha moment » de `product-spec.md`. Le success criterion d'activation du MVP (`product-spec.md` § MVP, cf. fusion §5) doit pointer cette action, pas une vanity metric.
- **Event de mesure (câble la Phase 6)** : l'aha moment **déclare l'event analytics à émettre** — `activation_completed` (web-saas) · `waitlist_joined` (landing) · **métriques de run** AU2/AU3 (automation). C'est ce que **12-build câble en `capture()` au call-site** (jumeau de la boucle fermée, `skills/12-build/references/integration-pass.md` §Boucle de mesure) et ce que **18-metrics lit**. De même pour **chaque action de valeur du funnel** : elle nomme son event. Un aha moment / une action de valeur **sans event déclaré** = funnel non mesurable en Phase 6 (bug « AgencyDesk »).

## Intégration dans la procédure (pas une étape en plus)
| Étape | Ce que le socle y fait |
|---|---|
| **1 — Contexte** | Nommer l'aha moment + le chemin le plus court (ci-dessus). |
| **2 — Features** | Les éléments du socle **de l'archétype** (S1-S8 web-saas / LP1-LP4 landing / AU1-AU5 automation) entrent dans la liste comme **source (d)**, rattachement « **socle complétude** ». Ils ne sont **jamais** des features orphelines. |
| **3 — Priorisation** | Les éléments **du socle de l'archétype** sont **Must d'office, exemptés du test de retrait.** La seule discussion = l'adaptation au type/à la niche (quels champs, quels défauts, quel canal), jamais l'existence. |
| **5 — Specs** | **web-saas** : fiche feature complète pour **S1** (écrans, entité créée, défauts intelligents par niche) et **S2** ; les éléments mécaniques (S3-S8) groupés dans **une** fiche « socle produit complet ». Story + critères Given/When/Then comme tout Must (ex. « Étant donné un compte neuf, quand je termine l'onboarding, alors mon salon existe avec 3 prestations modifiables »). **landing / automation** : une fiche « socle de l'archétype » couvrant LP1-LP4 / AU1-AU5. |

## Checklist Definition-of-Done (socle + aha)
- [ ] **Le socle DE L'ARCHÉTYPE** est en **Must** dans `product-spec.md` § Priorisation, chaque élément **adapté au type/à la niche** (défauts nommés, pas « à définir ») : web-saas **S1-S8** / landing **LP1-LP4** / automation **AU1-AU5**.
- [ ] **Aucun élément d'un autre archétype injecté** : pas de dashboard/onboarding sur `automation`, pas d'onboarding/entité CRUD sur `landing`.
- [ ] *(web-saas)* S1 : 2-4 écrans, crée l'entité cœur, sortie = produit utilisable, débouche sur l'aha moment.
- [ ] *(web-saas)* S2 : la **suppression de compte** (RGPD) est explicitement spécifiée ; rôles + audit si outil interne.
- [ ] *(web-saas)* S7 : marquage visuel + suppression en un clic spécifiés.
- [ ] *(landing)* LP2 : waitlist/CTA + **boucle fermée** (notif propriétaire). *(automation)* AU4 : **boucle fermée** (alerte/rapport sur échec/succès) spécifiée.
- [ ] S8 / LP4 : titre + favicon + OG au thème spécifiés (jamais le favicon par défaut du framework).
- [ ] Aha moment nommé (action de valeur **observable**, par archétype) + chemin chiffré ≤ 5 étapes.
- [ ] Toute **réduction** du socle (à l'intérieur d'un archétype) est **documentée par élément**, jamais une dispense de socle d'archétype.
- [ ] Zéro élément du socle dégradé en Should/Could « faute de temps ».

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Squelette de features** | Features cœur correctes mais produit creux (pas d'onboarding, de profil, d'empty states) | Injecter le socle en Must dès l'étape 2 — la complétude se spécifie, elle ne se rattrape pas au build |
| **Socle débattu** | Le test de retrait appliqué au socle → éléments dégradés en Should | Le socle est **exempté** : Must d'office. On adapte à la niche, on ne débat pas |
| **Onboarding vitrine** | Wizard qui collecte des infos sans créer l'entité cœur | Chaque écran alimente l'entité ; à la sortie, le produit est utilisable |
| **Défauts muets** | Entité créée vide, tout à remplir à la main | Défauts intelligents pré-remplis **modifiables**, dérivés de la niche |
| **Aha lointain** | Première valeur à 8-10 étapes de l'entrée | Raccourcir le chemin : l'onboarding débouche sur l'aha, le reste attend |
| **Socle générique** | Socle recopié tel quel, sans adaptation (« nom, description ») | Chaque élément porte son adaptation type/niche dans le PRD — le socle est un gabarit, pas un contenu |
| **Socle du mauvais archétype** | Dashboard parasite sur une `automation` ; onboarding wizard sur une `landing` ; landing traitée en web-saas vide ; **exiger le socle web-saas S1-S8 d'une boutique `ecommerce`** (= faux-négatif d'archétype, comme injecter un dashboard sur une `automation`) | Le socle est **conditionné par l'archétype** : injecter le socle **de l'archétype** (S1-S8 / LP1-LP4 / AU1-AU5 / EC1-EC5), pas celui d'un autre — cf. `_shared/state-schema.md` §socle-par-archétype |
| **Dispense d'élément** | « C'est un outil interne, pas besoin d'onboarding/empty states » | À l'intérieur de l'archétype, on adapte le canal/mode d'entrée, on ne saute pas les éléments. Toute réduction se justifie **par élément**, documentée — jamais une dispense de socle d'archétype |
