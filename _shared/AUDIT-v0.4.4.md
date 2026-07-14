# Audit adversarial complet — SaaS Factory v0.4.4 (2026-07)

> Verdict vs la vision « n'importe qui, sans compétence tech, toute langue, tout type, A→Z, autonomie ».
> Méthode : 6 dimensions × (find adversarial → verify réfutation) + synthèse CEO. 13 agents, 0 erreur.

## Verdict global : **capable A→Z = NON** (pour la vision complète)
Le plugin tient **très bien** une tranche : générateur de **SaaS applicatif FR** (public / interne
**mono-org** / perso), profondeur PM/design/archi/QA au-dessus du marché. Mais **3 des 6 types nommés
ne tiennent pas structurellement** et le **pilier « toutes les langues » est cassé au socle**.

### Couverture par type
| Type (vision) | Verdict |
|---|---|
| SaaS **public** (FR) | ✅ tient — route la plus complète (plafonné par hardcode FR) |
| Outil **interne** mono-org | ✅ tient — route dédiée, allègement cohérent |
| Outil / espace **perso** | ✅ tient — portes allégées (résidu : Critère de KILL hors-sujet) |
| SaaS **B2B commercial multi-org** | ⚠️ ne tient pas proprement — pas de substrat org/SSO/billing par org |
| **Automatisation** d'outils internes | ❌ ne tient pas — pas d'archétype non-UI, socle UI non retirable |
| **Landing page seule** | ❌ n'existe pas — enum fermé ; le cas le plus simple subit la cérémonie max |

## Gaps classés (confirmés après réfutation)

### 🔴 Bloquants
1. **Landing-only inexistante** (types/autonomie) — enum fermé `public|interne|perso` (`state-schema.md:10`).
2. **Automatisation sans archétype non-UI** — 1 seul archétype `web-saas`, socle UI S1-S8 injecté d'office.
3. **Langue du LIVRABLE jamais captée/propagée** — aucune variable de 1er rang « produis dans la langue du client ».
4. **Châssis FR-hardcodé, sans i18n** — + le PRD exige « langue fr » (`completeness-baseline.md:27`).
5. **« Légal FR » = PORTE QA BLOQUANTE** — un produit US/anglais correct est recalé (faux-négatif actif) (`integration-pass.md:52`, `fake-client-protocol.md:64`).
6. **Infra boucles fermées NON scaffoldée** — `notification_jobs`+dispatch+cron+`vercel.json` re-codés à chaque run (la mécanique qui a cassé Poser).

### 🟠 Majeurs
7. Socle complétude S1-S8 de 07 injecté d'office « universel aux 3 types » = verrou qui bloque tout livrable non-UI.
8. B2B commercial multi-org : pas de route dédiée (`routing.md` range « B2B fermé » dans l'interne mono-org).
9. Substrat multi-org : pas de bloc org-tenancy réutilisable, pas de SSO/SAML/OIDC (grep=0), pas de billing par org.
10. Anti-slop « automatisable » (grep lint CI) câblé nulle part — repose sur checklists LLM.
11. Must complétude (404/légal/loading) gatés bloquants mais ni scaffoldés ni vérifiés mécaniquement.
12. Gates qualité + preuve live-QA = auto-attestation de l'agent, aucun contre-check tiers / e2e CI.
13. RTL (arabe/hébreu) structurellement absent (rework, pas juste non testé).
14. SEO/metadata aveugle à la langue : pas de `hreflang`, `lang`, `og:locale`.
15. Emails (OTP + welcome) ne suivent pas la langue du produit (app FR + welcome EN + OTP FR).
16. `infra-setup` reste un mur technique pour un vrai non-tech.
17. Pas de garde-fou grep « anti-sentinelle » sur la copy de `app/page.tsx` (voie de fuite booking sur la landing publique).

### 🟡 Mineurs
18. Skip-set dupliqué dérivé (01-discover 03 omise ; 03-positioning foyer périmé).
19. `landing-playbook` érige le booking local en « cas principal » ; pas de bloc SaaS horizontal / marketplace / landing-only.
20. « 5-second test » (gate QA universel) nomme en dur « gérante de salon ».
21. Wrapper phase-2 liste des artefacts « fusion §5 » (pointeurs vides) comme livrables pleins.
22. Route perso sur-gatée (Critère de KILL demandé pour un usage perso).
23. Résumé rollback porte 5 incomplet (branche « premier ship » manquante dans gates.md).

## Plan de correction (séquencé)
- **Thème A — LANGUE (priorité, 2 niveaux)** : plugin communique dans la langue de l'utilisateur + livre le produit dans sa langue. Gaps 3,4,5,13,14,15 + niveau-1 (dialogue). *[le plus urgent, ask explicite Felix]*
  - ✅ **FAIT (v0.4.5)** au niveau doctrine + pipeline : champ `locale`/`dir`/`jurisdiction` de 1er rang (state-schema, source unique) ; capté à l'intake (01 + template + DoD) ; invariant dialogue niveau-1 au point d'entrée (saas-factory) ; **porte légale FR→juridiction** (faux-négatif tué : 12/14/07 + templates) ; SEO langue-aware (hreflang/lang/og:locale, 16) ; règle i18n/RTL/emails-en-locale documentée dans le châssis. **0 « FR » hardcodé en porte** (vérifié).
  - ⏳ **RESTE (code châssis, à faire en Thème C)** : rendre le châssis web-saas réellement i18n-ready — `welcome.tsx:77 lang="en"` en dur, textes centralisés, `dir` sur `<html>`, emails localisés. La doctrine le mandate ; le code starter doit suivre.
- **Thème B — TYPES** : ouvrir landing-only (4e route) + archétype automation non-UI + conditionner le socle S1-S8 par archétype ; route B2B + substrat org (bloc org-tenancy). Gaps 1,2,7,8,9.
  - ✅ **FAIT (v0.4.6)** au niveau modèle + doctrine + surfaces opérationnelles : **modèle à 3 axes** `archetype`(web-saas|landing|automation) × `type` × `tenancy`(single|multi-org) dans state-schema (source) ; **détection à l'intake** (01 + template + DoD + interview) ; **fiches** `archetypes/landing.md` + `automation.md` ; **routing par archétype** (les 2 routing.md) ; **socle S1-S8 conditionné par archétype** propagé aux surfaces opérationnelles (07 SKILL/procedure/template éclaté S1-S8/LP1-LP4/AU1-AU5, portes 12-build, **Parcours #0 de 14-qa** en 3 branches) → **faux-négatif landing/automation tué** ; substrat B2B org-tenancy posé comme contrat.
  - ⏳ **RESTE (code châssis, Thème C)** : scaffold réel des archétypes landing & automation, bloc org-tenancy (SSO + billing par org).
- **Thème C — BACKSTOP MACHINE** : scaffolder l'infra boucles fermées + pages complétude (404/légal/loading) dans le châssis ; grep lint anti-slop + anti-sentinelle ; e2e CI. Gaps 6,10,11,12,17.
  - ✅ **C1 FAIT (v0.4.7), BUILD VERT** : châssis web-saas doté de l'**infra boucle-fermée générique** (`0004_notifications.sql` + `lib/notifications/{service,enqueue,dispatch}.ts` avec **`dispatchEntityJobs(id)`** = le call-site immédiat manquant à Poser + cron protégé + `vercel.json` quotidien) ; **pages complétude** (404/error/global-error/loading + gabarits légaux par juridiction) ; **i18n code** (`lib/i18n.ts`, `lang`/`dir` depuis locale, welcome localisé, og:locale) ; **grep lint** `lint-slop.mjs` + `lint-sentinelle.mjs` + scripts npm + step CI. `tsc` 0 erreur + `next build` 16 routes, zéro fuite métier. Chaque produit en hérite.
  - ✅ **C2 FAIT (v0.5.0), BUILD VERT** : **bloc waitlist** (landing buildable — leads + confirmation via notifications, `tsc`+`next build` 17 pages) ; **bloc org-tenancy** (B2B multi-org buildable — orgs+membres+invitations+switch+RLS par org+billing par org, options SSO) ; **châssis automation** (worker headless, socle AU1-AU5 : config+runs/logs+healthcheck+**boucle fermée succès ET échec**+idempotence, `tsc` exit 0, dependency-light) ; **règles d'assemblage par archétype** (scaffold-procedure). **Les 6 types de la vision sont désormais BUILDABLES.**
- **Thème D — POLISH** : autonomie infra-setup, mineurs 18-23.
  - ✅ **FAIT (v0.4.8)** : skip-set dérivé → renvoi source unique (18) ; landing-playbook dé-booking-isé + variantes horizontal/marketplace/landing-only (19) ; 5-sec test persona générique (20) ; wrapper phase-2 pointeurs annotés (21) ; **Critère de KILL exempté en perso** de bout en bout — porte DoD bloquante incluse (22) ; rollback porte 5 branche « premier ship » (23).
  - ⏳ **RESTE** : autonomie `infra-setup` pour un vrai non-tech (gap 16, majeur) — non traité (à faire avec C2 ou dédié).
