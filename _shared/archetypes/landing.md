# Archétype : landing (V1 — bloc partagé, lu à la demande)

Un archétype parmi 4 — le modèle **3 axes orthogonaux** (`archetype` / `type` / `tenancy`) et le **conditionnement du socle par archétype** vivent dans `../state-schema.md` §modèle 3 axes (SOURCE UNIQUE) ; voir aussi `web-saas.md`, `automation.md`, `ecommerce.md`. Ici : la fiche de l'archétype **landing**.

> ✅ **Landing buildable par sélection de blocs (Thème C / C2).** Pas de châssis séparé : une landing-only s'assemble en **sélectionnant un sous-ensemble** du châssis `web-saas` — `skeleton` (qui porte **déjà** `components/landing/*` + les gabarits légaux) + le bloc **`waitlist`** (la brique concrète de capture d'emails) + `notifications` + `repo-ci` + `hosting`, **SANS** auth/crud/dashboard/billing. Règle d'assemblage canonique : `../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype. Ce fichier pose le **modèle** (forme du livrable, socle, pipeline) ; le contrat du bloc = `../blocks/README.md` §waitlist.

Livrable = **page marketing seule** (une ou quelques pages statiques), avec **waitlist / CTA optionnelle**. **PAS d'auth, PAS de BDD produit, PAS de dashboard, PAS d'entité cœur CRUD.** Le plus souvent couplé à `type = public` (axe 2, orthogonal). Cas d'usage : test de demande (go-test), pré-lancement, vitrine, capture d'emails avant produit.

## Stack
Next.js 15 (App Router, TS strict) en **rendu statique / SSG** + Vercel (hébergement) + Cloudflare (DNS/CDN). **Pas de Supabase Auth, pas de schéma produit.** Email transactionnel via Resend **si** waitlist (accusé d'inscription). Stockage waitlist = **minimal** : une seule table `signups` (email + source + horodatage) ou un provider externe — jamais un schéma applicatif. **Aucun Stripe** (rien à vendre depuis une landing). Défauts et alternatives self-host : `../stack-defaults.md`.

## Structure de repo générée
```
app/            # routes statiques (page marketing, /legal/*, /merci)
components/     # sections landing (design system issu de la charte)
lib/            # brand ; client signups minimal si waitlist
tests/          # smoke (rendu, liens légaux, POST waitlist)
.saas-factory/  # état du pipeline
DESIGN.md · README.md
```
**PAS de** `app/(app)/` dashboard, **PAS de** `supabase/migrations` produit (auth/crud/billing), **PAS de** middleware d'auth. Le seul SQL = la table leads du bloc `waitlist` (+ `0004_notifications` pour l'accusé). Composition des blocs (sous-ensemble du châssis `web-saas`, sans arbre séparé) : `../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype.

## Socle inclus par défaut — socle **LANDING** (remplace le socle S1-S8 web-saas)
Le socle de complétude n'est **pas** universel : il dépend de l'**archétype** (règle canonique dans `../state-schema.md` §modèle 3 axes ; le socle S1-S8 de `../../skills/07-product-spec/references/completeness-baseline.md` est le socle **web-saas**). Pour landing, l'existence non négociable porte sur :
- **Sections du landing-playbook** — structure canonique (hero → preuve sociale honnête → problème → comment ça marche → features → pricing/CTA → FAQ → footer) ; règles bloquantes, formules de copy, passes A/B/C : `../landing-playbook.md` (SOURCE UNIQUE, ne pas recopier).
- **Légal adapté à la juridiction** — jeu de pages piloté par `jurisdiction` / `locale` (FR → mentions + confidentialité ; US → Terms + Privacy ; DE → Impressum + Datenschutz…), liés au footer, zéro lien mort. Règle canonique : `../state-schema.md` (champs `locale` / `dir` / `jurisdiction`) ; rappel des cas : `../landing-playbook.md` §Footer + légal. **Confidentialité obligatoire dès qu'un email est collecté** (waitlist).
- **Métadonnées / OG** — `<title>` + meta description, favicon au thème, image Open Graph, `<html lang={locale}>` + `dir`. Jamais le favicon par défaut du framework.
- **Waitlist / CTA (optionnelle mais par défaut si `public`)** — brique concrète = **bloc `waitlist`** (`../blocks/README.md` §waitlist) : **table leads** + champ email/bouton + **route POST** + accusé de réception (page `/merci` + email de confirmation **via le bloc `notifications`** — `enqueueJob`/`dispatchEntityJobs`, **jamais** un envoi Resend ad hoc). Seuil/fenêtre pré-enregistrés côté go-test : `../../skills/05-opportunity/references/go-test-playbook.md`.

**PAS d'onboarding wizard, PAS de dashboard, PAS d'entité cœur CRUD, PAS de profil/settings** — ces éléments du socle web-saas n'ont pas d'objet ici et ne doivent **pas** être injectés (le dashboard parasite est précisément le bug que le conditionnement par archétype corrige).

## Pipeline (allégé)
Chemin court, sans les étapes produit : **intake minimal** (le POURQUOI, la cible, la promesse, `locale`/`jurisdiction`) → **charte** (design system, étape 8) → **build landing** (sections + légal + OG + waitlist) → **deploy** (sandbox puis prod). Sautées vs web-saas : architecture/data-model produit, socle S1-S8, boucles fermées applicatives, billing. La seule boucle éventuelle = l'accusé d'inscription waitlist.

## Critères d'acceptation
Build vert (SSG, prod), smoke verts (rendu, hiérarchie de headings, liens légaux vivants, POST waitlist si présente), **contrôle légal = pages adaptées à `jurisdiction`** (jamais « FR » en dur), métadonnées + favicon + OG au thème, LCP < 2,5 s / contraste ≥ 4.5:1 (cf. `../landing-playbook.md` §Tech), déployé sur un sous-domaine sandbox, aucune clé en dur. Si waitlist : inscription de bout en bout OK (stockage + accusé).

## Clés API requises
Connectées **une fois, en amont, via `infra-setup`** (`~/.saas-factory/`) — jamais ad hoc. Minimal : Vercel (deploy), Cloudflare (token scoppé DNS). **Si waitlist** : Resend (accusé d'inscription) + le store de `signups`. **Pas de** Supabase Auth, **pas de** Stripe, **pas de** provider LLM produit. Chaque clé = un guide pas-à-pas ; jamais stockée par le plugin.
