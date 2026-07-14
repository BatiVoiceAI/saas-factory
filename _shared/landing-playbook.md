# Playbook landing page

> Synthèse de recherche web 2026-07 — sources en bas de fichier.
> Référence normative pour la génération des landings. Appliquée dès la maquette de landing (étape 08), puis par les agents de build, la porte d'intégration (étape 12) et la QA (étape 14). Complément visuel : `design-doctrine.md`.

**Équation directrice** (Julian Shapiro) : `Taux de conversion = Désir − (Effort + Confusion)`. Chaque section existe pour augmenter le désir ou réduire l'effort/la confusion ; une section qui ne fait ni l'un ni l'autre est supprimée. La page entière doit pouvoir convaincre seule. 57 % du temps de lecture se passe above-the-fold (NN/g) : tout l'essentiel y tient.

---

## Sommaire

- Structure canonique
- Règles de copy
- Adaptation par type de projet
- Checklist landing (binaire)
- Sources

## Structure canonique

Ordre imposé. Chaque section répond à une objection précise.

| # | Section | Rôle | Contenu type | Longueur |
|---|---------|------|--------------|----------|
| 1 | **Navbar** | orientation | logo + 2-4 liens (fonctionnalités, tarifs, FAQ) + CTA primaire | 1 ligne |
| 2 | **Hero** | test des 5 secondes | headline bénéfice + sous-titre spécifique + CTA + **visuel produit RÉEL** | headline ≤ 10 mots ; sous-titre 1-2 phrases |
| 3 | **Micro-preuve sociale** | crédibilité immédiate | 1 ligne honnête sous le hero (stat sourcée du problème, badge de lancement, ligne fondateur) | 1 ligne |
| 4 | **Problème** | rappeler la douleur | 2-4 phrases + chiffres contextuels sourcés sur le problème du client | 1 court paragraphe |
| 5 | **Comment ça marche** | réduire la confusion | 3 étapes MAX ; chaque étape = action utilisateur (1 ligne) + ce que fait le produit + bénéfice ; screenshot réel par étape | 3 blocs courts |
| 6 | **Features orientées jobs** | prouver la promesse | 3-6 features, jamais plus ; header = résultat client, paragraphe = mécanisme + 1 objection adressée ; capture réelle | 2-3 phrases/feature |
| 7 | **Preuve détaillée / témoignages** | crédibilité | UNIQUEMENT si témoignages réels fournis en intake (nom + métier/structure + ville) ; sinon voir « preuve sociale honnête » ci-dessous | conditionnel |
| 8 | **Pricing transparent** | lever l'objection prix | prix toujours affichés (jamais « contactez-nous ») ; 1-3 tiers | voir recette pricing |
| 9 | **FAQ / objections** | dernières frictions | 3-5 questions réelles, réponses 1-2 phrases, en HTML visible (jamais image ou tab caché) + schema FAQ | 3-5 Q/R |
| 10 | **CTA final** | conversion | rappel de la promesse + CTA primaire + CTA alternatif moins engageant (« Voir la démo ») | court, fond teinté |
| 11 | **Footer complet** | signal produit fini + légal | 4 colonnes : logo+mission+ville / liens produit / **légal conditionné par `jurisdiction`/`locale`** (jeu de pages selon la juridiction — voir §Footer + légal) / contact (email réel) + barre © | pages légales GÉNÉRÉES, pas de liens morts |

Répétition du CTA : même label dans la navbar, le hero, après chaque 1-2 sections, et en final.

### Hero — règles bloquantes
- **Test des 5 secondes** : un visiteur qui ne lit QUE le headline comprend ce que le produit fait et pour qui. « Supercharge your workflow » = fail ; « Concevez des sites visuellement. Zéro code. » = pass.
- **Sous-titre** = CE QUE C'EST + COMMENT C'EST POSSIBLE : il rend le headline crédible en expliquant le mécanisme. Ex. : « Vos clients réservent en ligne 24h/24 ; vous recevez un SMS et votre agenda se met à jour tout seul. »
- **CTA** = verbe d'action spécifique au job (« Ouvrir mon agenda en ligne », « Essayer 30 jours gratuits ») ; jamais « Get started » / « En savoir plus » seuls. Un seul CTA primaire.
- **Visuel** = screenshot ou mockup RÉEL de l'app générée, l'écran le plus parlant (l'agenda rempli, la page de réservation), dans un cadre à bordure 1px. Jamais d'illustration abstraite, de stock photo, de faux dashboard. Le visuel réduit l'incertitude, il ne décore pas.

### Preuve sociale HONNÊTE (cas SaaS neuf, zéro client)
**INTERDICTION ABSOLUE** : faux témoignages, faux logos, fausses stats d'usage, faux avis, avatars stock/IA (risque légal + destruction de confiance). Pas de preuve réelle = pas de section testimonials — le template la marque **conditionnelle**, rendue uniquement si l'intake fournit des témoignages réels.

Alternatives crédibles jour 1 (bloc « preuve » de remplacement) :
1. **Stat sourcée du problème** : « 35 % des RDV se prennent hors horaires d'ouverture — [source] ».
2. **Garantie empilée** : essai 30 jours sans CB + annulation en 1 clic + « vos données restent les vôtres ».
3. **Badge de lancement honnête** : « Nouveau — offre fondateur : -50 % pour les 20 premiers salons ».
4. **Ligne fondateur** : « Développé avec des coiffeurs indépendants de Lyon ».
5. Démo / visite guidée du produit ; mention sécurité/RGPD si pertinente.

### Pricing — règles
- Toujours affiché (pricing caché = bounce massif).
- Micro-SaaS local : carte unique ou 3 tiers MAX, nommés par résultat (« Solo », « Salon », « Multi-salons »), tier du milieu « Recommandé ».
- 5-7 items concrets par tier (nombre de RDV, rappels SMS inclus…), prix en €/mois TTC, devise locale.
- Toggle annuel/mensuel avec remise visible (~2 mois offerts).
- Politique d'annulation explicite sous les cartes : « Sans engagement. Annulez en 1 clic. » (une clause floue = cause majeure d'abandon) + mini-FAQ billing (3 questions).

### Footer + légal (conditionné par juridiction/langue)
🚨 **Le jeu de pages légales est piloté par `jurisdiction`/`locale`, JAMAIS « FR » en dur.** La règle canonique (quelle juridiction → quelles pages, RTL, langue du légal) vit dans **`_shared/state-schema.md` (champs `locale` / `dir` / `jurisdiction`)** — ne pas la recopier ici. Rappel des cas courants :
- **FR** → **/legal/mentions-legales** (LCEN art. 6 : identité éditeur, hébergeur, directeur de publication) + **/legal/confidentialite** (RGPD, dès qu'un email est collecté) + **/legal/cgv** (document séparé, si vente aux particuliers).
- **US / EN** → **/legal/terms** (Terms of Service) + **/legal/privacy** (Privacy Policy) + CGV/refund policy si vente.
- **DE** → **/legal/impressum** + **/legal/datenschutz**. Autres juridictions : cf. state-schema.
- **Cookies** : bannière uniquement si traceurs non essentiels (inutile avec auth + cookies techniques seuls) ; le texte suit `locale`.
- Labels du footer, slugs et libellés des liens **dans la langue de `locale`** ; footer en **`dir`** (RTL pour ar/he/fa/ur). Liens présents sur toutes les pages ; pages GÉNÉRÉES, jamais des liens morts.
- 🚨 Le contrôle QA vérifie « pages légales **adaptées à la juridiction** présentes », pas « mentions légales FR » : un produit US avec Terms + Privacy est **conforme**.

### Tech / accessibilité (bloquant)
H1 unique ; hiérarchie de headings sans saut ; contraste ≥ 4.5:1 ; LCP < 2,5 s ; images WebP/AVIF + srcset ; parité mobile du contenu ; CTA visible sans scroll sur mobile ; FAQ en texte HTML + schema FAQ.

---

## Règles de copy

1. **Spécifique > générique** : chiffres (« réservation en 3 clics », « 68 % des réservations abandonnées à cause de la friction »), contexte métier (« fini les no-shows », pas « optimisez vos process »). Toute stat affichée est sourcée, sinon supprimée.
2. **Bénéfice avant fonctionnalité** : header de feature = le résultat (« Zéro rappel téléphonique »), le paragraphe = le comment.
3. **Langage du client final, jamais du dev.** Le copy est écrit dans la voix du produit, pour la persona (gérante de salon, pas CTO).
4. **Longueurs** : headline ≤ 10 mots ; sous-titre 1-2 phrases ; paragraphe de feature 2-3 phrases ; réponse FAQ 1-2 phrases ; étape « comment ça marche » = 1 ligne d'action + 1 bénéfice.
5. **Interdictions absolues** : lorem ipsum, `[placeholder]`, TODO ; **buzzwords/hedge interdits — liste canonique dans `design-doctrine.md` §marqueur 19 (lexique buzz/hedge) + son lint CI ; ne pas la recopier ici** ; en **complément FR spécifique landing** (explicitement marqué) : « révolutionnaire », « tout-en-un » (non justifié), « la meilleure plateforme » ; jargon technique dans une page grand public ; CTA générique (« Learn more », « Get started » seul) ; superlatif non prouvable.
6. Chaque headline contient un **objet concret + un bénéfice mesurable**.

### Formules de headline (8 patterns à instancier avec le métier du client)

| # | Formule | Exemple (booking salon) |
|---|---------|--------------------------|
| 1 | Bénéfice + anti-objection : « [Résultat] sans [douleur] » | « Un agenda plein, sans passer la journée au téléphone » |
| 2 | Résultat + temps : « [Outcome] en [durée] » | « Votre page de réservation en ligne, prête en 10 minutes » |
| 3 | How-to : « Comment [atteindre X] sans [Y] » | « Comment remplir vos créneaux creux sans promo agressive » |
| 4 | Agitator : « Marre de [problème précis] ? » | « Marre des no-shows ? » |
| 5 | Superlatif prouvable : « Le [outil] le plus [adj.] pour [cas précis] » (SEULEMENT si justifiable) | « L'agenda en ligne le plus simple pour les salons indépendants » |
| 6 | Action : verbe + résultat | « Remplissez votre agenda pendant que vous coiffez » |
| 7 | Avant/après : « [Ancienne méthode pénible] → [nouvelle] » | « Fini le cahier de rendez-vous. Vos clients réservent seuls, 24h/24 » |
| 8 | Objection frontale : adresser LE frein n°1 | « Aucune connaissance technique requise. Aucune installation. » |

### Recette « Comment ça marche » (3 étapes)
Chaque étape = [Action utilisateur en 1 ligne] + [Ce que fait le produit] + [Bénéfice]. Ex. salon :
1. « Créez votre page en 10 min » — vous listez vos prestations et horaires.
2. « Partagez le lien » — Instagram, Google, vitrine ; le produit encaisse les réservations.
3. « Recevez vos clients » — rappels SMS automatiques, moins de no-shows.

Visuel = screenshot réel de l'étape, pas d'icône générique. Éviter la numérotation nue « 1. 2. 3. » (préférer timeline ou labels descriptifs).

### Recette feature orientée job-to-be-done
- Header = résultat en langage client : « Ne perdez plus un client parce que vous étiez occupé ».
- Paragraphe = 2-3 phrases sur le mécanisme + 1 objection adressée : « Vos clientes réservent depuis Instagram même quand le salon est fermé. Vous validez ou le créneau se bloque automatiquement — vous gardez le contrôle de votre agenda. »
- Visuel = capture réelle de la feature. 3-6 features max, chacune reliée à la promesse du hero.

---

## Adaptation par type de projet

> Le playbook est **agnostique du produit**. Le booking local est **détaillé** ci-dessous parce qu'il concentre le plus de règles sectorielles, mais ce n'est **qu'un cas parmi d'autres** : les variantes SaaS horizontal / marketplace / landing-only suivent. Instancier la structure canonique avec le domaine du projet, jamais copier le vocabulaire salon tel quel.

### B2B niche locale (salon, resto, artisan, cabinet) — exemple détaillé (un cas parmi d'autres)
- **Registre design** : recette « Éditorial chaleureux » ou « Moderne à caractère » (voir `design-doctrine.md`) ; jamais de registre dev-tool.
- **Copy** : voix du métier (« fini les no-shows », « vos clientes »), zéro jargon SaaS ; prix TTC en euros.
- **Hero** : headline formule 1, 6 ou 7 ; visuel = la page de réservation ou l'agenda rempli.
- **Booking (règles sectorielles)** : CTA « Réserver » visible sur chaque écran ; flux de réservation ≤ 3 étapes se terminant sur une page de confirmation trackable ; mobile-first (majorité des réservations sur smartphone).
- **Contenu local obligatoire** : services avec prix + durée affichés (« Coupe femme — 45 € — 45 min ») ; adresse + horaires + téléphone cliquables (`tel:`) ; section équipe / à-propos = preuve sociale locale.
- **Preuve sociale** : blocs « jour 1 » ci-dessus ; dès qu'il y a de vrais avis Google, les intégrer avec nom + salon + ville.
- **Pricing** : 1 carte ou 3 tiers nommés par résultat, tier « Salon » recommandé, « Sans engagement. Annulez en 1 clic. »

### Outil dev / technique
- **Registre** : recette « Technique précis » ; densité assumée, mode sombre acceptable par défaut.
- **Hero** : le produit en action (terminal, éditeur, dashboard) ; un exemple de code ou une commande d'install (`npx …`) peut remplacer le sous-titre.
- **Preuve** : benchmark reproductible, lien GitHub/changelog, démo interactive — jamais de logos inventés.
- **Copy** : précision technique OK (l'audience est dev), mais toujours bénéfice avant mécanisme dans les headers.
- **Pricing** : tier gratuit/open-source explicite si pertinent ; limites chiffrées par tier.

### B2C
- **Registre** : « Moderne à caractère » (variante Sora) ou « Studio contemporain » ; ton direct, 2e personne.
- **Hero** : bénéfice émotionnel concret + visuel mobile du produit (le B2C se consomme sur téléphone).
- **Sections raccourcies** : problème + comment ça marche fusionnables ; FAQ centrée confiance (prix, données, annulation).
- **CTA** : friction minimale (essai sans CB), réassurance sous le bouton.

### SaaS horizontal (audience large, multi-secteur)
- **Registre** : « Studio contemporain » ou « Moderne à caractère » ; neutre, jamais le folklore d'un métier unique.
- **Copy** : bénéfice transversal (gagner du temps, réduire l'erreur, centraliser) illustré par 2-3 cas d'usage concrets ; le hero adresse l'usage n°1, les features couvrent les autres. Zéro jargon vertical.
- **Preuve** : logos clients réels si fournis, ou volumétrie honnête ; ROI chiffré > un témoignage sectoriel isolé.
- **Pricing** : 3 tiers par volume/sièges, self-serve, palier « nous contacter » réservé à l'entreprise ; free trial ou freemium fréquents.

### Marketplace (deux faces)
- **Enjeu** : la page sert DEUX personas (offre + demande) ; hero centré sur la face à activer en premier (souvent le côté rare, l'offre), lien explicite vers la seconde (« Vous êtes prestataire ? »).
- **Preuve** : liquidité + confiance (nombre d'annonces/pros actifs si réel, avis, paiement sécurisé/garantie) ; jamais de faux volume.
- **Comment ça marche** : décrire les deux parcours en parallèle, chacun ≤ 3 étapes.
- **Pricing** : commission/abonnement transparent côté offre ; gratuité côté demande explicitée.

### Landing-only (archétype landing : page seule + waitlist, pas de produit derrière)
- **Livrable** = page marketing seule, waitlist/CTA optionnelle, **sans auth, sans BDD produit, sans dashboard** — modèle complet dans `_shared/archetypes/landing.md`.
- **Structure** : sections canoniques allégées — **pas de pricing réel ni de flux signup/booking** ; le CTA final = inscription waitlist (email seul) vers une page `/merci`. Les items checklist « pricing » et « flux ≤ 3 étapes » ne s'appliquent pas (rien à vendre, rien à réserver).
- **Preuve** : ligne fondateur + stat sourcée du problème + badge « pré-lancement / accès anticipé » ; interdiction renforcée d'inventer traction, clients ou volume.
- **Objectif** : capter l'intérêt et mesurer la demande (go-test), pas convertir en achat ; succès = taux d'inscription, pas taux de paiement.

---

## Checklist landing (binaire)

Vérifiée par la porte d'intégration (étape 12) et la QA (étape 14). Trois passes ; tout échec « bloquant » = pas de merge.

### Passe A — Structure (bloquant)
1. Les 11 sections canoniques sont présentes, dans l'ordre (testimonials = conditionnelle) ?
2. H1 unique, hiérarchie de headings sans saut ?
3. Footer complet avec pages légales générées **adaptées à `jurisdiction`/`locale`** (FR : mentions légales + confidentialité + CGV si vente ; US/EN : Terms + Privacy ; etc. — cf. `state-schema.md`), libellés dans la langue de `locale`, footer en `dir`, et zéro lien mort ?
4. FAQ en HTML visible + schema FAQ ?
5. Flux de réservation/signup ≤ 3 étapes avec page de confirmation trackable ?
6. Parité mobile : contenu identique, CTA visible sans scroll, cibles tactiles ≥ 44px ?

### Passe B — Copy (bloquant)
7. Aucun « lorem », « placeholder », « [.*] », « TODO » dans la page ?
8. Headline ≤ 10 mots, contient le job concret + un bénéfice ?
9. Aucun buzzword interdit (**liste canonique : `design-doctrine.md` §marqueur 19**) ni équivalent FR spécifique landing (« révolutionnaire », « tout-en-un » non justifié, « la meilleure plateforme ») ?
10. Aucune stat sans source ; aucun témoignage/logo/avis non fourni en intake ?
11. CTA primaire = verbe d'action spécifique au job, identique partout (pas de « Get started » nu) ?
12. Prix affichés, TTC, devise locale, politique d'annulation explicite ?

### Passe C — Visuel et perf
13. Visuel hero = screenshot/mockup réel de l'app (pas d'illustration stock, pas d'image IA) ?
14. Checklist anti-slop de `design-doctrine.md` passée (0 marqueur coché) sur desktop + mobile ?
15. Contraste ≥ 4.5:1 ; LCP < 2,5 s ; images WebP/AVIF + srcset ?

### Validation finale — test LLM en persona (étape 14)
- **5-second test automatisé** : soumettre le screenshot above-the-fold seul à un LLM jouant la **persona cible du projet** — « `<persona cible>` pressé·e, non-expert du produit » (p. ex. gérante de salon, développeur back-end, responsable achats PME, particulier sur mobile) — avec 3 questions : *Que vend ce site ? Pour qui ? Que se passe-t-il si je clique le bouton ?* Une réponse fausse ou vague = régénérer le hero.
- **6 critères Shapiro** : clarté (qu'est-ce qui est ambigu ?), conversion (qu'est-ce qui manque pour signer ?), intérêt, crédibilité (qu'est-ce qui sonne faux/spam ?), brièveté (si on coupe 50 %, que garde-t-on ?), différenciation vs concurrents.

Note de maintenance : les patterns d'AI-slop évoluent vite — cette checklist landing est un fichier de config versionné, à réviser, pas des règles gravées. **Le lexique buzz/hedge interdit n'est pas maintenu ici : source unique = `design-doctrine.md` §marqueur 19 (+ son lint CI) ; landing n'ajoute que les équivalents FR spécifiques.**

---

## Sources

- https://www.julian.com/guide/startup/landing-pages
- https://www.demandcurve.com/playbooks/above-the-fold
- https://www.cortes.design/post/saas-landing-page-breakdown-example
- https://www.flow-agency.com/blog/b2b-saas-landing-page-best-practices/
- https://unbounce.com/landing-page-examples/formulas-for-landing-page-headlines-with-examples/
- https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/
- https://leadpages.com/blog/best-landing-page-copywriting-examples
- https://www.involve.me/blog/landing-page-structure
- https://cxl.com/blog/is-social-proof-really-that-important/
- https://www.mailerlite.com/blog/social-proof-examples-for-landing-pages
- https://www.zenoti.com/thecheckin/4-best-practices-for-online-booking-that-converts
- https://biz.booksy.com/blog/website-booking-system-guide-implement-optimize-for-your-salon
- https://www.authic.io/blog/online-booking-conversion-best-practices-for-salons
- https://www.webstacks.com/blog/saas-pricing-page-design
- https://www.pacepricing.com/blog/hidden-prices-lost-buyers-why-b2b-saas-companies-should-embrace-transparency
- https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- https://www.925studios.co/blog/ai-slop-web-design-guide
- https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- https://www.francenum.gouv.fr/guides-et-conseils/developpement-commercial/site-web/quelles-sont-les-mentions-legales-pour-un-site
- https://www.economie.gouv.fr/entreprises/site-internet-mentions-obligatoires
- https://www.legalplace.fr/guides/mentions-legales/
- https://martin.avocat.fr/cgv-cgu-mentions-legales-differences/
