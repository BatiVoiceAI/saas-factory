# Idea Brief — <nom court de l'idée>

<!-- Artefact de l'étape 1. Écrit pour être relu tel quel par l'étape 2 ET par les skills gstack aval (office-hours). Remplir avec les mots de l'utilisateur ; ne pas résoudre, seulement cadrer. Une case sans réponse = « à préciser », jamais inventée. -->

## Idée reformulée
<L'idée en 2 lignes, validée par l'utilisateur>

## Problème & douleur
<!-- Concret : un QUI + un QUAND + une CONSÉQUENCE. Red flag à refuser : abstrait (« gagner du temps »). -->
- **Qui :** <persona qui souffre>
- **Quand :** <le moment précis où ça fait mal>
- **Conséquence :** <ce que ça coûte, si possible chiffré>

## Cible
<!-- UNE personne précise (métier/segment + volume), pas une catégorie. Red flag : « les PME », « les artisans ». -->
<Persona précis>

## Alternative actuelle
<!-- Comment font-ils AUJOURD'HUI sans l'outil (Excel, papier, concurrent, rien) — c'est ça que le produit doit battre. -->
<Alternative(s)>

## Type + route
<!-- L'aiguilleur du pipeline. Cocher le type et acter les étapes activées/sautées.
     🚨 La route dépend du TRIPLET (archétype × type × tenancy), pas du seul `type` : c'est `skills/saas-factory/references/routing.md` qui FAIT FOI (table canonique étape × axes). Ne pas figer la route ici — renseigner le triplet (ce champ + §Archétype/tenancy) et RENVOYER à routing.md. -->
- **Type :** <public | interne entreprise | perso>
- **Route :** <route dérivée du triplet — **voir `routing.md`**. Repères par archétype :
  · **web-saas** → public : 2·3·4·5 · interne : fit-entreprise (03 sautée) puis 5 · perso : 5 allégée
  · **landing** → publique, allégée, **SEO conservé**, PAS d'auth/dashboard (05 lite « publier ? »)
  · **automation** → **headless**, 02·03·04 sautées, 05 lite (**boucle à nommer** + idempotence), 06 = **ROI** (pas de pricing), PAS de socle UI ; **boucle fermée obligatoire**>

## Stade
<pré-produit | a des utilisateurs | a des clients payants>

## Langue du livrable
<!-- Champ de 1er rang, DISTINCT de la langue de travail du plugin. Défaut = la langue dans laquelle l'utilisateur parle ; overridable. Définition + propagation : `_shared/state-schema.md` §Locale du livrable. -->
- **`locale` :** <code BCP-47 de la langue du produit, ex. `fr-FR`, `en-US`, `es-ES`, `ar`>
- **`dir` :** <`ltr` | `rtl` — `rtl` pour ar/he/fa/ur, sinon `ltr`>
- **`jurisdiction` :** <juridiction légale : `FR` | `US` | `EU` | `DE` | `intl`… — pilote les pages légales adaptées, jamais « FR » en dur>

## Écosystème
- **Secteur :** <secteur / métier>
- **Géo / langue :** <pays, langue(s)>
- **Réglementaire :** <RGPD, données sensibles, normes… ou « rien de particulier »>
- **Intégrations attendues :** <outils à connecter : WhatsApp, email, ERP, logiciel métier…>

## Signal préliminaire
<!-- Léger à ce stade : indices que des gens en veulent (plaintes, recherches, paient déjà pour un proche). Creusé vraiment à l'étape 4. -->
<Signal(s) évoqués par l'utilisateur, ou « aucun à ce stade »>

## Non-goals préliminaires
<!-- Ce que le produit NE fera PAS, au moins en v1. Déductible si l'utilisateur ne sait pas. -->
- <non-goal 1>
- <non-goal 2>

## Critère de KILL (pré-rempli)
<!-- Posé à la porte S12, AVANT d'avoir vu le moindre chiffre : « qu'est-ce qui te ferait abandonner ? ». Avec les mots de l'utilisateur — un signal concret, pas un ressenti. Converti en critère mesurable (métrique live + seuil + fenêtre) à la sortie de 17-deploy ; confronté aux chiffres par 19-retro.
     🚨 Le CADRE du KILL dépend de l'archétype × type — ce n'est PAS toujours « valider un marché » :
       · **public** (web-saas/landing publique) → KILL = **le marché ne répond pas** (pas d'adoption/de demande réelle sur la fenêtre).
       · **interne / perso / automation** → PAS de marché à valider : le KILL = **utilité/adoption par le PROPRIÉTAIRE** (l'outil n'est pas utilisé, les rapports/digests sont ignorés, la boucle n'apporte rien d'exploitable). Ex. automation : « si après ~2 semaines le worker ne produit aucun résultat exploitable OU le propriétaire ignore les digests → kill ». Ne pas écrire un critère « marché » pour une automation interne. -->
<La réponse de l'utilisateur, ou « à préciser »>

## Archétype + tenancy détectés
<!-- Deux des trois axes orthogonaux du modèle (`_shared/state-schema.md` §modèle 3 axes : archetype × type × tenancy) ; le 3ᵉ axe (type) est déjà capté en §« Type + route ». Pressenti, pas verrouillé. -->
- **`archetype` :** <`web-saas` | `landing` | `automation` — pilote le socle de complétude conditionné par archétype (web-saas S1-S8 / landing LP1-LP4 / automation AU1-AU5)>
- **`tenancy` :** <`single` (défaut) | `multi-org` — `multi-org` si B2B multi-clients/espaces isolés (RLS par org) ; sinon `single`>

## Intake spécifique — archétype `automation`
<!-- 🚨 À REMPLIR UNIQUEMENT si `archetype = automation` (worker / cron / bot / intégration headless). Sinon, RETIRER ce bloc (web-saas / landing ne l'utilisent pas — pas de case vide parasite).
     Ces champs sont des ENTRÉES DE 1er RANG des étapes aval (05 lite, 07 socle AUTOMATION AU1-AU5, 09 architecture, 11 provisioning scheduler) — cf. `_shared/archetypes/automation.md` §Pipeline. Sans eux, l'aval doit tout inventer. Remplir avec les mots de l'utilisateur ; une case sans réponse = « à préciser », jamais inventée. -->
- **Déclencheur & cadence :** <ce qui lance le worker + à quelle fréquence — ex. « cron toutes les 4 h » + « digest quotidien 8 h ». ⚠️ Toute cadence **sub-quotidienne** (< 24 h) est un signal fort pour 07/09 (fenêtre d'idempotence run à dériver de la cadence, pas le défaut 24 h). Noter s'il y a **plusieurs cadences** (travail périodique + rapport périodique distinct).>
- **Systèmes source → cible :** <d'où viennent les données (API, feed/CSV, webhook, DB…) et où va l'effet (créer une entité, écrire dans un système, notifier…). Nommer chaque système + le sens du flux.>
- **Boucle fermée — canal + propriétaire :** <🚨 OBLIGATOIRE en automation. QUI est notifié/rapporté (le propriétaire) et par QUEL canal (email, Slack, webhook…). Un worker qui échoue/réussit en silence n'est pas livrable. Nommer la boucle : quels déclencheurs → quel message → à qui.>
- **Seuils & règles de déclenchement :** <les paramètres métier qui décident qu'il « se passe quelque chose » — ex. seuil de réappro par SKU, delta minimal, fenêtre. Ceux qui varient par entité ou dans le temps.>
- **Unité d'idempotence (pressentie) :** <le grain d'unicité de l'EFFET — « un <X> = au plus un(e) <entité> ouverte ». 🚨 L'identité EXCLUT les attributs mutables (quantité, montant révisable) : ne mettre dans la clé que des composants STABLES (ex. `(sku, fenêtre-de-besoin)` sans la quantité). Conception physique (index unique partiel + upsert) **déférée à 07/09** — ici on nomme seulement le grain.>
