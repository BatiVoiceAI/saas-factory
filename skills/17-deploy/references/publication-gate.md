# Référence — Porte de publication (forcing-questions + routage)

La porte de l'étape 3. **On publie publiquement et ça peut dépenser** → `_shared/safety-rails.md` §1 plan-then-apply : plan → **OK explicite** → apply. Cette référence outille la porte pour qu'elle ne soit **jamais** franchie sur un malentendu.

Rappel : l'autorisation durable d'`infra-setup` (§1 bis) couvre le **provisioning** automatique. Le **cutover production** garde, lui, une **porte explicite** — c'est le dernier point où l'humain voit exactement ce qui va devenir public et combien ça coûte.

## Ce que la porte présente (avant de demander l'OK)

Le plan de l'étape 2, rendu lisible d'un coup d'œil : domaine cible, version promue (SHA), changement DNS, tracking activé, **coût chiffré**, et **comment on revient en arrière**. Pas d'apply avant que l'humain ait vu ces 6 lignes.

## Recette forcing-question — l'OK de cutover

- **Ask exact** (via `AskUserQuestion`) :
  « Je vais rendre **{app.domaine.com}** public sur la version **`{SHA}`**, basculer le DNS, activer le tracking. Coût : **{montant}**. Rollback : **{une commande vers N-1}**. **On publie ?** »
- **Push-until (critère de sortie)** : on ne quitte la porte vers l'apply **que** sur un **oui non ambigu qui référence le bon périmètre**. Tant que la réponse est floue/conditionnelle/hors-sujet → on reste à la porte et on reformule.
- **Red-flags (réponses à NE PAS traiter comme un OK)** :
  - « Vas-y » sans avoir vu le plan / le coût → re-présenter le plan d'abord.
  - « Oui mais change d'abord {X} » → **c'est un NON** : on traite {X}, on re-présente, on redemande.
  - « Je pense que oui » / « probablement » → pas explicite, repousser.
  - « OK pour tout, ne me redemande plus » → l'autorisation durable ne couvre pas le cutover ; on garde **cette** porte. Expliquer poliment.
  - Silence / réponse à côté → **ne pas** interpréter comme un accord.
  - OK obtenu, puis le périmètre change (domaine, coût, version) → **l'OK est caduc**, redemander.
- **MOU-vs-FORT** :
  - MOU : « Oui on peut lancer. » (ne dit pas *quoi*, ni conscience du coût)
  - FORT : « Oui, publie `app.domaine.com` sur `abc123`, je sais que c'est ~{montant}/mois, rollback OK. »
  - Un MOU ne suffit pas si le coût ou le périmètre n'est pas acté par l'humain — reformuler en FORT avant d'appliquer.

## Machine à états de la porte

```
        ┌───────────────────────────────────────┐
        ▼                                        │
   [PLAN PRÉSENTÉ] ── AskUserQuestion            │ périmètre/coût
        │                                        │ a changé
   ┌────┴─────┬──────────────┬─────────────┐     │
  OUI-FORT  OUI-conditionnel  NON        FLOU    │
   │           │               │           │     │
   ▼           ▼               ▼           ▼      │
 [APPLY]   traite la      STOP publica-  reformule┘
           condition ─────┐ tion         (re-demande)
           puis re-plan ──┘ (guide si
                             repli)
```

## Matrice de routage — par réponse

| Réponse humaine | Route |
|---|---|
| OK explicite + périmètre correct | → **APPLY** (étape 4). |
| OK mais « change X d'abord » | Traiter X → re-présenter le plan mis à jour → **redemander**. |
| NON / pas maintenant | STOP. Rester en staging/preview. Proposer quoi débloquer. |
| Flou / à côté | Reformuler l'Ask exact, ne pas avancer. |
| OK obtenu, puis coût/domaine/version change | **OK caduc** → nouveau plan → nouvelle porte. |
| Accès manquant révélé à ce moment (KYC, domaine) | Repli honnête (§6) : STOP, guide pas-à-pas, pas de faux cutover. |

## Cas de dépense — cadrage du coût

Le coût doit être **acté**, pas subi. Micro-exemples (niche-agnostiques) :

| Situation | Ce qu'on dit à la porte |
|---|---|
| Hébergement passe d'un plan gratuit à payant au cutover | « Ce cutover fait passer l'hébergement au plan {X} à {montant}/mois. » |
| Domaine à renouveler / add-on facturé | « Le domaine coûte {montant}/an, facturé maintenant. » |
| Coût réellement nul (reste dans le gratuit) | « Aucun coût nouveau : on reste dans le plan gratuit {X}. » (le dire, ça rassure et c'est honnête) |
| Coût inconnu | « Je ne peux pas chiffrer {poste} avant apply — veux-tu que je vérifie d'abord, ou tu valides à l'aveugle ? » |

## Modes d'échec de la porte (à prévenir)
- **Sur-interprétation d'un signal faible** en OK → toujours exiger un OUI-FORT référencé.
- **OK périmé** appliqué après changement de plan → re-porter dès que quoi/où/coût bouge.
- **Confusion autorisation durable ↔ cutover** → le durable couvre le provisioning, pas la publication ; garder la porte.
- **Porte sautée « parce que c'est interne »** → même interne, si ça dépense, la porte reste (voir table de routage de `deploy-procedure.md`).
