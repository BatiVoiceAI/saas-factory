# Schéma d'état — `.saas-factory/state.md`

Le fichier d'état global du projet, tenu par le master et chaque phase. **Jamais de secret dedans** (les accès vivent dans `~/.saas-factory/`).

## Sommaire

- Format
- Modèle à 3 axes orthogonaux — `archetype` / `type` / `tenancy` (🚨 SOURCE UNIQUE)
- Locale du livrable — `locale` / `dir` / `jurisdiction` (🚨 SOURCE UNIQUE)
- Règles

## Format
```markdown
# État — {nom du projet}

## Cadrage — 3 axes orthogonaux (🚨 champs de 1er rang · SOURCE = §Modèle à 3 axes ci-dessous)
- **archetype** : web-saas | landing | automation | **ecommerce**   (défaut `web-saas`) — forme **TECHNIQUE** du livrable ; **conditionne le socle de complétude (07)**. **Châssis A-à-Z clé-en-main : `web-saas` + `automation`.** `landing` (assemblage de blocs du châssis web-saas), `ecommerce` (`_shared/archetypes/ecommerce.md` — archétype de 1re classe **défini** : détection/socle EC1-EC5/routage/architecture ; châssis `blocks/ecommerce/` **à bâtir**) et `tenancy=multi-org` (substrat org) = châssis **différé / à assembler** : le run le **signale honnêtement** et n'en bluffe pas le build — `skills/saas-factory/references/routing.md` + `CONTRIBUTING.md`.
- **type / route** : public | interne | perso   (modèle d'**ACCÈS/commercial**, **orthogonal** à `archetype` — décide des étapes actives, cf. `routing.md`)
- **tenancy** : single | multi-org   (défaut `single` ; **web-saas** seulement ; `multi-org` = B2B → substrat org)
- **Ambition** : perso/interne (court) | public (complet)
- **Livrable — langue & juridiction** (🚨 champs de 1er rang, SOURCE UNIQUE = §Locale du livrable ci-dessous) :
  - **locale** : code BCP-47 de la langue du LIVRABLE (ex. `fr-FR`, `en-US`, `es-ES`, `ar`) — capté à l'intake, défaut = langue de l'utilisateur, overridable
  - **dir** : `ltr` | `rtl` (dérivé de `locale` ; `rtl` pour ar/he/fa/ur)
  - **jurisdiction** : juridiction légale du produit (`FR` | `US` | `EU` | `DE` | `intl`…) — pilote les pages légales
- **Critère de KILL** (écrit au lancement) : {…}

## Environnement
- **plugin_root** : chemin ABSOLU de la racine du plugin (résolu par le master au démarrage via `_shared/vendored-engine-protocol.md` §0). Toute référence `{PLUGIN_ROOT}/…` (moteurs `vendor/`, `_shared/`, `agents/`) se résout avec CE champ ; les briefs de sous-agents portent le chemin déjà résolu. **À re-vérifier à chaque reprise de session** (le plugin peut avoir bougé) : si le chemin enregistré n'existe plus, re-résoudre et mettre à jour.

## Phase & étape courantes
- **Phase** : 1..6
- **Étape** : 01..19
- **Statut** : en cours | porte en attente | fait

## Portes franchies
| Porte | Décision | Date |
|---|---|---|
| Opportunité (étape 5) | Go / Ajuster / Go-test / No-Go | … |
| PRD (étape 7) · Charte (étape 8) | validé | … |
| Client-review (étape 15) | Ship / Itérer / Stop | … |
| Déploiement (étape 17) | publié | … |
| Kill/Continue (étape 19) | continuer / kill | … |

## Décisions verrouillées
- Stack : {défaut / déviations ADR}
- Provisioning : {repo, sous-domaine, BDD, host}

## Budget d'itération
- Cascade (13) : {plafond / tours consommés}
- Client (15) : {plafond / tours}

## Features (build)
{renvoi à `status/NN-<feature>.md` — cran de cascade atteint par feature}
```

## Modèle à 3 axes orthogonaux — `archetype` / `type` / `tenancy` (🚨 SOURCE UNIQUE)

Trois axes **indépendants** cadrent tout livrable, **champs de 1er rang** de l'état du run **et** du `config.json` projet, **captés à l'intake** (`01-discover` / saas-factory), invariants. **C'est ici qu'ils vivent** (définition + valeurs + dérivation + règle de conditionnement) ; toutes les autres surfaces (07 socle, 09 data-model, 11 scaffold, 12 build, `routing.md`…) **y renvoient**, aucune copie locale. Les **combiner** (et non un enum plat `public|interne|perso`) est ce qui fait tenir les **6 livrables** de la vision — dont 3 ne tenaient pas structurellement avec un archétype unique.

| Axe | Valeurs | Défaut | Ce qu'il fixe |
|---|---|---|---|
| **`archetype`** | `web-saas` \| `landing` \| `automation` \| `ecommerce` | `web-saas` | **forme TECHNIQUE** du livrable → **conditionne le socle de complétude (07)** + le scaffold (11) |
| **`type`** | `public` \| `interne` \| `perso` | (capté) | modèle d'**ACCÈS/commercial** → **routage** cérémonie/étapes (`routing.md`). **ORTHOGONAL à `archetype`** : inchangé, il ne décide **plus** de la forme technique |
| **`tenancy`** | `single` \| `multi-org` | `single` | (**web-saas** seulement) granularité du tenant. `multi-org` = **B2B vendu à N entreprises** → active le **substrat org-tenancy** |

- **`archetype`** — forme technique du livrable :
  - `web-saas` (défaut, l'app actuelle) : auth + BDD + dashboard produit.
  - `landing` : page marketing seule + waitlist/CTA optionnelle. **PAS d'auth, PAS de BDD produit, PAS de dashboard.**
  - `automation` : worker / cron / bot / intégration **HEADLESS**. **PAS de socle UI produit** ; admin minimal optionnel.
- **`type`** (**orthogonal** à `archetype`) — `public` | `interne` | `perso` : modèle d'accès/commercial, **inchangé**. Il pilote la cérémonie du pipeline (`skills/saas-factory/references/routing.md`, table canonique), **jamais** la forme technique — un `landing` est en général `public`, un `automation` le plus souvent `interne`, etc.
- **`tenancy`** (web-saas) — `single` (défaut, mono-compte/mono-org) | `multi-org` (B2B vendu à N entreprises). `multi-org` active le **substrat org-tenancy** : entité **Org** + membres + invitations + switch d'org + rôles org (**l'entité Org est déjà le pattern par défaut du modèle de données** — `skills/09-architecture/references/data-model.md`) ; **SSO** et **billing PAR ORG** en options.

### Dérivation des 6 livrables de la vision

Les 6 types nommés par la vision ne sont **pas** un enum : ils se **dérivent** de la combinaison des 3 axes.

| Livrable (vision) | `archetype` | `type` | `tenancy` |
|---|---|---|---|
| SaaS **public** | `web-saas` | `public` | `single` |
| Outil **interne** | `web-saas` | `interne` | `single` |
| Outil / espace **perso** | `web-saas` | `perso` | `single` |
| **Landing page seule** | `landing` | `public` (en général) | — |
| **Automatisation** d'outils internes | `automation` | `interne` (le plus souvent) | — |
| **Site de vente** (boutique en ligne) | `ecommerce` | `public` (en général) | — |
| **SaaS B2B multi-entreprise** | `web-saas` | `public` | `multi-org` |

(`tenancy` ne s'applique qu'à `web-saas` ; `—` = sans objet pour `landing` / `automation` / `ecommerce`.)

### 🚨 RÈGLE — le socle de complétude (07) est CONDITIONNÉ PAR ARCHÉTYPE (plus « universel »)

Le socle de complétude (`skills/07-product-spec/references/completeness-baseline.md`) n'est **plus injecté d'office comme universel** : il **dépend de l'`archetype`**. La règle « existence des éléments non négociable » devient « existence des éléments **de l'archétype** ». Trois socles :

| `archetype` | Socle exigé (Must d'office, **adapté** — pas choisi — par le `type`) | Ce qui est retiré |
|---|---|---|
| **`web-saas`** | Socle UI actuel **S1-S8** : onboarding wizard qui **crée l'entité cœur**, dashboard non-vide, empty states, profil/settings, emails transactionnels, légal (par `jurisdiction`), 404, seed, metadata/favicon | — |
| **`landing`** | Socle **LANDING** : sections du landing-playbook (`_shared/landing-playbook.md`) + légal adapté `jurisdiction` + waitlist/CTA + métadonnées/OG | **PAS** d'onboarding wizard, **PAS** de dashboard, **PAS** d'entité cœur CRUD |
| **`automation`** | Socle **AUTOMATION** : config/secrets, historique de runs + logs, healthcheck, **boucle fermée** (alerte/rapport au propriétaire quand un run échoue/réussit — cf. `_shared/boucles-fermees.md`), idempotence | **PAS** d'onboarding wizard UI, **PAS** de dashboard produit |
| **`ecommerce`** | Socle **ECOMMERCE (EC1-EC5)** : catalogue produits (RLS lecture publique), panier, **checkout + paiement ONE-SHOT** (Stripe `mode:payment`, jamais abonnement), commandes + **boucle fermée** (confirmation client + notif marchand), inventaire/stock **décrément atomique**. Pièges durs : **survente/course stock · intégrité prix serveur · idempotence webhook** (`_shared/archetypes/ecommerce.md` §Pièges) | **PAS** le socle S1-S8 web-saas d'office (l'entité cœur = produit+commande, pas un CRUD générique ; le back-office admin ≠ dashboard SaaS) |

Le `type` continue d'**adapter** chaque socle (canal, mode d'entrée, ton) — il ne le **choisit** pas : c'est l'`archetype` qui choisit **quel** socle. Une porte de complétude (14/17) qui exige le socle `web-saas` d'un `landing`, d'un `automation` ou d'un `ecommerce` est un **faux-négatif** (le bug que ce modèle corrige), au même titre que « légal FR en dur ».

### Périmètre — modèle & conditionnement ici ; statut réel des SCAFFOLDS

Cette surface pose le **modèle**, la **dérivation** et le **conditionnement** du socle. Statut du **code châssis** par archétype/substrat (à jour) :
- **`web-saas` → LIVRÉ** : châssis `_shared/blocks/web-saas/`.
- **`automation` → LIVRÉ** : bloc `_shared/blocks/automation/` (socle **AU1-AU5** en `src/*` réels + migration + harness `node:test` + runner one-shot). Une route automation est **buildable aujourd'hui** — ne plus écrire « scaffold automation = Thème C ». Manifeste : `_shared/blocks/automation/README.md`.
- **`landing` → scaffold code encore DÉFÉRÉ (Thème C)** : archétype défini au modèle, pas de bloc assemblé. Briques réelles : landing+waitlist (`skills/05-opportunity/references/go-test-playbook.md`), composants `components/landing/*`.
- **substrat `org-tenancy` → scaffold code encore DÉFÉRÉ (Thème C)** : entité **Org** déjà en pattern par défaut (`data-model.md`), bloc assemblé non livré.

## Locale du livrable — `locale` / `dir` / `jurisdiction` (🚨 SOURCE UNIQUE)

Champs de **1er rang** de l'état du run **et** du `config.json` projet — **miroir conceptuel exact d'`email_from` / `git_author`** : une identité **captée à l'intake, propagée partout, invariante** (jamais devinée en cours de run). **C'est ici qu'ils vivent** (définition + valeurs + rôle + règle légale) ; toutes les autres couches (08/12/14/16/17…) **y renvoient**, aucune copie locale.

🚨 **INVARIANT — `locale` = la langue du LIVRABLE, DISTINCTE de la langue de travail du plugin.** La langue de travail **INTERNE** des skills reste le **FR** (instructions à Claude — OK, ne pas y toucher). Ce que **VOIT l'utilisateur** suit **`locale`**, jamais le FR par défaut, aux **deux niveaux** :
- **Niveau 1 — dialogue** : intake, portes Go/No-Go + PRD + revue + publication, synthèses, RUN-LOG conduits dans la langue de l'utilisateur (détectée dès son 1er message).
- **Niveau 2 — livrable** : copy UI, onboarding, **emails OTP + notifications**, **légal (adapté à la juridiction)**, landing, SEO, métadonnées, **RTL** pour ar/he/fa/ur.

| Champ | Type / valeurs | Rôle |
|---|---|---|
| `locale` | code **BCP-47** (`fr-FR`, `en-US`, `es-ES`, `de-DE`, `ar`…) | langue du **livrable** ; **capté à l'intake** (01-discover / saas-factory), **défaut = la langue dans laquelle l'utilisateur parle**, **overridable** (« Dans quelle langue le produit doit-il être ? ») |
| `dir` | `ltr` \| `rtl` | sens d'écriture, **dérivé de `locale`** : `rtl` pour **ar / he / fa / ur**, `ltr` sinon. Pilote `<html dir>` + layout |
| `jurisdiction` | `FR` \| `US` \| `EU` \| `DE` \| `intl`… | juridiction légale du produit ; **pilote le jeu de pages légales** (cf. Règle légale ↓) |

**Capté une fois, propagé à toutes les couches** :
- **08 design** — direction i18n + `dir` (miroir RTL) ;
- **12 build** — `<html lang={locale}>` + `dir`, copy UI/onboarding i18n, **emails OTP + notifications dans `locale`** ;
- **légal** — pages conditionnées par `jurisdiction` (Règle ↓) ;
- **16 SEO** — `hreflang` / `lang` / `og:locale` alignés sur `locale` ;
- **14 / 17 QA & deploy** — les portes vérifient l'alignement (langue produit = `locale`, `dir` correct, légal = `jurisdiction`).

### 🚨 Règle légale — conditionnée par `jurisdiction`/`locale`, JAMAIS « FR » en dur

Les pages légales dépendent de la **juridiction/langue**, pas d'un défaut FR :
- **FR** → Mentions légales + Politique de confidentialité (+ CGV si vente).
- **US / EN** → Terms of Service + Privacy Policy.
- **DE** → Impressum + Datenschutzerklärung. — etc.

La **PORTE QA** (14/17) vérifie « pages légales **adaptées à la juridiction** présentes », **jamais** « mentions légales **FR** présentes ». Un produit anglais/US avec **Terms + Privacy** est **conforme** — le recaler au motif « légal FR absent » est un **faux-négatif** (le bug que ce champ corrige).

## Règles
- Le **master** relit ce fichier au démarrage pour **reprendre** où on en était (reprenabilité).
- **`archetype` / `type` / `tenancy`** : 3 axes **orthogonaux**, champs de 1er rang définis en §Modèle à 3 axes ci-dessus (SOURCE UNIQUE) — captés à l'intake, invariants. `archetype` (web-saas|landing|automation|**ecommerce**) fixe la **forme technique** et **conditionne le socle de complétude (07)** ; `type` (public|interne|perso, orthogonal) route la cérémonie ; `tenancy` (single|multi-org, web-saas) active le substrat org. Les livrables de la vision s'en **dérivent**. **Scaffold code : `web-saas` + `automation` LIVRÉS** (`_shared/blocks/web-saas/` et `_shared/blocks/automation/`) ; `ecommerce` = archétype **défini** (`_shared/archetypes/ecommerce.md`), châssis `blocks/ecommerce/` **à bâtir** ; archétype `landing` (assemblage) + bloc org-tenancy = **à assembler / Thème C**. Les autres surfaces (07/09/11/12/routing) y renvoient, aucune copie.
- **`locale` / `dir` / `jurisdiction`** : champs de 1er rang définis en §Locale du livrable ci-dessus (SOURCE UNIQUE) — captés à l'intake, propagés à 08/12/14/16/17, invariants ; `locale` = langue du livrable, **distincte** du FR de travail interne. Les autres fichiers y renvoient, aucune copie.
- **Un seul écrivain : l'orchestrateur.** `state.md` est mis à jour par le **master** ou l'**orchestrateur de phase**, jamais par les experts/sous-agents. Un sous-agent **produit son artefact** (`research/*`, `status/*`, `tech/*`…) et le **rapporte** à l'orchestrateur ; c'est l'orchestrateur qui écrit `state.md` **en sortie de chaque étape** (et à la porte). Cela évite les MAJ concurrentes ou incohérentes quand plusieurs sous-agents tournent en parallèle : l'artefact fait foi, `state.md` a un seul auteur.
- **Aucun secret / clé** (cf. `safety-rails`). Les accès infra vivent dans `~/.saas-factory/`.
