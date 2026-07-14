# Référence — Étape 5 allégée (`type = perso` ou `interne`)

Pour ces routes, il n'y a **pas d'analyse de marché** (étapes 2·3·4 sautées, cf. `conventions.md` — routage par type). La question **change de nature** :

```
  type = public   →  « le marché en veut-il ? »       (verdict marché)
  type = interne  →  « ça FIT nos outils/process ? »   (verdict d'adoption)
  type = perso    →  « est-ce assez utile pour moi ? »  (verdict d'utilité)
```

On ne surdimensionne pas : la décision porte sur l'**utilité / le fit**, pas sur un TAM. Ne fabrique **jamais** un marché manquant pour « remplir » le brief.

## Livrables réduits

| Type | Ce qu'on écrit | Ce qu'on N'écrit PAS |
|---|---|---|
| **perso** | `opportunity-brief.md` **réduit à son bloc §Décision** : besoin réel + effort vs gain + non-goals + porte | Pas d'analyse marché, pas de concurrents, pas de taille |
| **interne** | `opportunity-brief.md` **réduit à son bloc §Décision**, centré **fit** : outils/process/sécurité + effort vs gain + non-goals + porte | Pas d'edge concurrentiel, pas de SAM/TAM |

Le **détaillé** de l'`opportunity-brief.md` est **optionnel** ici : s'il est écrit, il ne contient que ce qui existe réellement (besoin, contraintes, non-goals) — sections marché laissées explicitement « non applicable (route allégée) ». Le fichier reste **unique** (`opportunity-brief.md`).

## Recette forcing — route `perso` (« est-ce utile POUR TOI ? »)
- **Ask exact** : « Cet outil te sert à **toi**. Concrètement, tu t'en sers combien de fois par semaine, et qu'est-ce que tu fais aujourd'hui à la place ? »
- **Push jusqu'à** : un **usage concret et récurrent** (« 3× / semaine, aujourd'hui je bricole dans un tableur »). Un « ça pourrait être pratique » n'est pas un usage.
- **Red flags à refuser** : « ce serait cool », « un jour peut-être », « ça pourrait servir à d'autres » (si ça vise d'autres, ce n'est plus `perso` → re-router en `public`).
- **MOU** : « Ça m'aiderait à mieux m'organiser. »
- **FORT** : « Je relance mes factures à la main chaque lundi (~30 min) ; un outil qui le fait me rendrait ces 30 min/semaine. Effort de build estimé : 1 week-end. Gain récurrent net → ça vaut le coup. »

## Recette forcing — route `interne` (« ça FIT la boîte ? »)
- **Ask exact** : « Ça doit s'insérer dans vos outils et vos règles existantes. Ça remplace quoi, ça se branche sur quoi, et quelles contraintes de sécurité/données s'appliquent ? »
- **Push jusqu'à** : un **fit vérifié** sur les 3 dimensions — outils (intégrations), process (qui l'utilise, à quelle étape), sécurité (données, accès, conformité interne).
- **Red flags à refuser** : « on verra pour l'intégration », « la sécurité on gérera après » (un blocage sécurité/données est un **tueur** ici, comme un tueur marché en `public`).
- **MOU** : « Ça ferait gagner du temps à l'équipe. »
- **FORT** : « Remplace 2 exports manuels/semaine de l'équipe ops (~2 h) ; se branche sur l'outil X déjà en place ; données non sensibles, reste intra-SI → fit OK. Effort ~1 semaine. Gain net positif. »

## Recette forcing — archétype `automation` (« la boucle vaut-elle d'être fermée ? »)
<!-- 🚨 S'APPLIQUE quand `archetype = automation` (worker / cron / bot / intégration headless — le plus souvent `interne`, donc EN PLUS de la recette `interne` ci-dessus). C'est le recadrage AUTOMATION porté DANS le corps de la skill (pas seulement dans `routing.md`). Modèle des axes : `_shared/state-schema.md` §Modèle à 3 axes. -->
Le fit `interne` (outils/process/sécurité) reste requis, mais l'automation ajoute **trois exigences dures** que la porte ne peut pas laisser passer :
- **Ask exact** : « Ce worker tourne tout seul. Quel **temps/process** il remplace, **quelle boucle** rapporte le résultat à qui, et **qu'est-ce qui empêche qu'il double** ses effets s'il rejoue ? »
- **Push jusqu'à** les 4 dimensions, chacune concrète :
  1. **Fit process / temps gagné** — le process manuel remplacé (heures/mois, par qui), comme en `interne`.
  2. **Boucle fermée NOMMÉE** — 🚨 non négociable (`_shared/boucles-fermees.md`) : quels déclencheurs (échec · succès/rapport · action requise) → quel canal → quel **propriétaire**. Un worker qui échoue/réussit **en silence** n'est **pas** livrable. Le brief doit **nommer** la boucle, pas la promettre.
  3. **Idempotence = risque n°1** — 🚨 posé en risque de **1er rang** dès 05 (conception déférée 07/09, HARD GATE tenu). Toute automation qui **crée des entités** double ses effets si l'idempotence d'entité n'est pas conçue. Nommer le **grain** d'unicité pressenti (« un <X> = au plus un(e) <entité> ouverte »), **attributs mutables EXCLUS de l'identité**. Ne pas trancher la conception ici — la **poser comme risque tueur** à surveiller.
  4. **Fiabilité des sources** — d'où viennent les données (API, feed, webhook) : disponibilité, format stable, cadence réelle. Une source non fiable est un tueur d'automation au même titre qu'un blocage sécurité en `interne`.
- **Red flags à refuser** : « on verra pour les notifications » (= boucle non fermée, tueur), « l'idempotence on gérera après » (= risque n°1 repoussé, tueur), « la source est à peu près stable » (creuser : à peu près = pas fiable).
- **MOU** : « Ça automatiserait la synchro et m'enverrait un résumé. »
- **FORT** : « Remplace ~2 h/semaine de vérif manuelle de stock ; **boucle** = digest quotidien + alerte échec + alerte action-requise → moi par email ; **idempotence** = `(sku, fenêtre-de-besoin)` sans la quantité (risque n°1, à concevoir en 07/09) ; **source** = API Shopify (fiable) + feed fournisseur CSV (à valider). Effort ~1 semaine, gain net positif. »

## Ancrage de confiance hors route publique (lite / automation)
<!-- Finding : le plafond de confiance des livrables (verdict-engine / writing-deliverables / synthesis-and-confrontation) est hérité de `market.md §Fiabilité` — qui N'EXISTE PAS ici (02 sautée). Sans ancrage de rechange, la §Fiabilité du brief est orpheline. -->
En route allégée il n'y a **pas** de `market.md §Fiabilité` à hériter (02-04 sautées). La §Fiabilité du dossier **ne s'ancre donc PAS sur la recherche marché** — elle s'ancre sur :
- **perso / interne** : la **solidité du fit** (usage récurrent confirmé / fit 3-dimensions vérifié) — haute si l'usage est observé, basse si supposé.
- **automation** : deux ancres propres à l'archétype —
  1. **Faisabilité d'intégration** — accès source/cible réels, format & cadence confirmés (haute si testé, basse si « à peu près »).
  2. **Utilité NON prouvée** — par nature **basse** tant qu'aucun run réel n'a produit de résultat exploitable pour le propriétaire (l'utilité d'une automation interne ne se prouve qu'à l'usage, pas en amont). Le dire tel quel : « utilité plausible, non prouvée — à valider par le premier run réel. »
Ne jamais reporter un plafond « marché » sur une route où il n'y a pas de marché. Case absente = « non applicable (route allégée) » + ancrage ci-dessus, jamais un chiffre marché fabriqué.

## Variante d'annexe — checklist « hypothèses propriétaire » (pas le Mom-Test)
<!-- Le template `opportunity-brief.md` termine par « 5 questions d'interview à des PROSPECTS » (Mom-Test = valider une demande MARCHÉ). Sans objet en lite/automation (outil interne mono-utilisateur, pas de marché à interviewer). -->
En route allégée, **remplacer** l'annexe Mom-Test par une **checklist d'hypothèses à confirmer par le propriétaire/sponsor** (pas des prospects externes) — les inconnues qui, si fausses, tuent l'outil :
- **perso / interne** : accès aux outils/données à connecter · fréquence réelle d'usage · contraintes sécurité/conformité internes · qui utilise, à quelle étape.
- **automation** : accès source (auth, quotas) · format & stabilité du feed/API · cadence réelle vs supposée · seuils métier · **canal + propriétaire de la boucle** · grain d'idempotence pressenti. Chaque item = une hypothèse `[Assumption]` à confirmer (revue 15, persona propriétaire), pas une question de vente.

## La porte reste explicite (même protocole)

Même en allégé, la porte est **Go / Ajuster / No-Go** via `AskUserQuestion` (cf. `gate-and-routing.md`). Le HARD GATE tient. 🚨 **PAS de 4ᵉ issue « Go-test » ici** : le Go-test (landing + waitlist pour mesurer une demande marché) est **réservé à la route `public`** (`go-test-playbook.md` : « un outil interne/perso ne se waitlist pas »). En lite/automation il n'y a pas de marché à sonder → **3 issues seulement**. Adaptations :

| Issue | perso / interne |
|---|---|
| **Go** | On passe au build (Phase 2) — cadrage réduit à l'utile |
| **Ajuster** | Reboucle sur `01-discover` (le besoin/fit est mal cerné — pas de 02/03/04 à réviser) |
| **No-Go** | Post-mortem 5 lignes (l'utilité/le fit ne justifie pas l'effort) + `state.md` |

## Definition of Done — mode allégé
- [ ] `type` = perso ou interne confirmé depuis `idea-brief.md`.
- [ ] Question recadrée sur utilité (perso) ou fit (interne), **pas** sur le marché.
- [ ] Usage concret/récurrent (perso) ou fit 3-dimensions vérifié (interne) obtenu.
- [ ] Effort vs gain posé + non-goals nommés.
- [ ] §Fiabilité **ancrée hors marché** (fit / faisabilité d'intégration + utilité non prouvée), pas un plafond `market.md` hérité.
- [ ] Annexe = **checklist hypothèses propriétaire** (pas le Mom-Test prospects).
- [ ] Aucun marché fabriqué ; sections N/A dites explicitement.
- [ ] Porte explicite Go/Ajuster/No-Go posée — **3 issues, pas de Go-test** (public-only).
- [ ] **Si `archetype = automation`** : boucle fermée **NOMMÉE** (déclencheurs → canal → propriétaire) · idempotence posée en **risque n°1** (grain nommé, attributs mutables exclus) · fiabilité des sources évaluée. Ces trois manquants = porte non franchissable.

## Modes d'échec du mode allégé
- **Le surdimensionnement.** Sortir une analyse marché complète pour un outil perso. *Parade :* la question est l'utilité, pas le TAM.
- **Le faux perso.** L'idée vise en fait d'autres utilisateurs → devrait être `public`. *Parade :* si ça sert des tiers, re-router en `public`.
- **La sécurité repoussée (interne).** Traiter le fit sécurité « pour plus tard ». *Parade :* un blocage données/accès est un tueur — il tranche la porte.
- **Le marché fabriqué.** Combler l'absence de 02-04 par des chiffres inventés. *Parade :* case vide = « non applicable (route allégée) ».
