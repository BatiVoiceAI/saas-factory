# Carte d'intégration — le moteur `startup-skill` (vendoré) dans le pipeline

**SOURCE UNIQUE** de la façon dont le moteur tiers `startup-skill` (vendoré, MIT) est **piloté tranche par tranche** par les étapes de SaaS Factory. Chaque étape ci-dessous **exécute la tranche de moteur** au lieu de réinventer la méthode, **redirige ses sorties vers nos chemins** (`research/`, `product/`, `DESIGN.md`), et **calibre** pour un micro-SaaS. Le protocole d'exécution (résoudre `{PLUGIN_ROOT}`, Option A/B, cadrer la sortie) vit dans `vendored-engine-protocol.md` **§0**. Ici : **qui pilote quoi, avec quel intrant, vers quelle sortie, pour quel aval**.

> **Le moteur est GELÉ en local — ne PAS re-synchroniser vers une install plus récente.** La copie vendorée (`vendor/startup-skill/`, commit `92ba4788`, `vendor/startup-skill/PROVENANCE.md`) porte des references dont le pipeline **dépend** — notamment `startup-competitors/references/verification-agent.md` (utilisé par 04-demand-edge) — **absentes des versions upstream plus récentes**. Un `claude plugin install startup@startup-skill` par l'utilisateur installe une copie **indépendante** que le plugin **n'utilise pas** : SaaS Factory lit **toujours** `vendor/startup-skill/`. Rafraîchir = régression. La discipline « gelé, ne pas refaire » (`vendor/VENDORING-TODO.md`) est intentionnelle.

## Règles transverses (valent pour TOUTES les tranches)
- **Cap d'intake respecté.** Les moteurs ont leur propre « Phase 1 Intake » (parfois longue) : on ne la relance JAMAIS. On leur **passe notre brief** (`research/idea-brief.md`, produit par 01-discover sous le cap DUR de 7 questions) — les moteurs sont conçus pour **sauter leur intake** quand les artefacts amont existent (« Check for Prior Work »). Zéro double interrogatoire.
- **Langue de l'utilisateur.** Les moteurs défaultent en anglais MAIS respectent « if the user writes in another language, use that ». On leur passe **explicitement la langue du produit** (`state.md` `locale`) : toutes les sorties (rapports, copy, pitch) sont dans **SA** langue.
- **Honnêteté prime.** `startup-*/references/honesty-protocol.md` prime partout : labels `[Data]/[Estimate]/[Assumption]/[Opinion]`, flags remontés, rien de fabriqué, verdict clair. Un résumé faussement rassurant = échec.
- **Les personas PILOTENT, ne sont pas remplacés.** Le moteur fournit la **matière** (recherche, frameworks, livrables) ; le persona (CEO/PM/Designer) **branche, calibre, décide**. On garde phases + personas.

## Table de pilotage — étape × tranche moteur × intrant → sortie → aval

| Étape | Tranche de moteur pilotée | Consomme | Produit (nos chemins) | Aval qui s'en sert |
|---|---|---|---|---|
| **01-discover** | *(alimente)* — écrit le brief au format attendu par les moteurs | intake 0-7 Q | `research/idea-brief.md` | tout le pipeline (= le « brief » des moteurs) |
| **02-market** | `startup-competitors` (3 vagues → synthèse → vérif) | idea-brief | `research/market.md` + `research/raw/` | 03, 04, 06, 07 |
| **03-positioning** | `startup-positioning` (Dunford 5+1 + Moore + Onliness + Ries) | market, idea-brief | `research/positioning.md` (dont §messaging) | 08, 16 |
| **04-demand-edge** | `startup-competitors` (`verification-agent.md` + `honesty-protocol.md`) | market §raw (review/forum) | `research/demand-signals.md` | 05 |
| **05-opportunity** | `startup-competitors` (honesty) **+ `startup-design` Ph8 « Validation »** (scorecard 7-dim + **kill-criteria** mesurables + assumptions) | les 4 inputs Phase 1 | `research/opportunity-brief.md` (dont **§kill-criteria pré-enregistrés**) | porte humaine, **19** |
| **06-business-model** | `startup-design` Ph4 « Strategy » (lean canvas + value prop + BM) | opportunity, market | `product/business-model.md` | 07, 18 |
| **07-product-spec** | `startup-design` Ph6 « Product » (MVP + prioritisation RICE/MoSCoW + user-journey + aha) | BM, market, positioning | `product/*` (PRD) | 08→ |
| **08-design-system** | **`startup-design` Ph5 « Brand »** (mission-vision-values + tone-of-voice + brand-personality/archétype + direction visuelle en adjectifs) | positioning §messaging, PRD | `DESIGN.md` §Direction + §Voix | 12, landing |
| **16-seo** | *(consomme)* positioning §messaging + `startup-competitors` §GTM (content pillars, carte d'opportunité canal) | positioning, market | plan SEO/contenu | 17 |
| **19-retro** | *(consomme)* `startup-design` Ph8 **kill-criteria** pré-enregistrés + scorecard | opportunity §kill-criteria, métriques (18) | décision kill/continue | — |
| **(optionnel, sur demande)** | `startup-pitch` (10/5/2/1-min + email + Q&A + scoring) | tous les artefacts Phase 1-2 | pitch investisseur *(hors pipeline standard)* | fondateur qui lève/présente |

## Notes de calibration par tranche
- **05 ← Ph8 Validation.** On ne garde de la Phase 8 que ce qui sert la **porte de décision** : le **scorecard** (dimensions → enrichit la cotation `verdict-engine.md`) et surtout les **kill-criteria** mesurables (5-7 conditions d'arrêt liées à un seuil/une expérience), **pré-enregistrés** dans l'`opportunity-brief` pour que **19** les relève au lieu de réinventer un seuil a posteriori. Le risk-analysis/experiment-design complets restent hors périmètre micro-SaaS (le Go-test de 05 couvre déjà l'expérimentation légère).
- **08 ← Ph5 Brand.** La Brand donne la **matière marque** (archétype de marque, adjectifs de direction, tone-of-voice) qui **nourrit** la recherche de direction de 08 et la **voix de la copy** — SANS remplacer la discipline anti-slop / anti-convergence structurelle / porte distinctiveness (la Brand est un **intrant**, pas un template). Mission-vision-values : **légers** (micro-SaaS, pas un brand-book d'agence). Voix + copy dans la **langue de l'utilisateur**.
- **`startup-pitch` = optionnel, sur demande.** Investor-facing (lever/demo-day/accélérateur) : **hors pipeline standard** d'une usine à micro-SaaS. Proposé en option après un Go (05) ou en Phase 6 (après-lancement) pour un fondateur qui veut pitcher ; consomme tous les artefacts déjà produits (saute son intake). Le **one-liner/elevator** utile à la landing est déjà couvert par `startup-positioning` §positioning-statement — pitch n'ajoute que le **narratif investisseur multi-format**.

## Mapping des sorties (par étape, le détail)
Chaque étape qui pilote une tranche garde son propre **output-mapping** local (quelle sortie native du moteur alimente quelle section de notre livrable), p.ex. `skills/02-market/references/output-mapping.md`. Cette carte est l'**index** ; les output-mappings locaux sont le **détail**.
