# Référence — Canary (health check) + Rollback

La preuve que la prod est **saine**, et le filet quand elle ne l'est pas. Inspiré des patterns gstack **`canary`** (santé post-deploy) et **`land-and-deploy`** (merge→CI→deploy→vérif) — **sans les vendorer** (couplés binaires). On réplique le *comportement*, pas le code.

Règle d'or : **pas de faux succès** (`safety-rails.md` §6). Un canary rouge → rollback + log honnête. On ne déclare jamais « déployé » sur une impression.

## Machine à états du canary

```
 [DÉPLOYÉ] ── lance le canary (fenêtre T)
      │
      ▼
 mesure: pages 200 · parcours cœur · erreurs Sentry · CWV
      │
 ┌────┴───────────────┬────────────────────┐
 tout dans seuils   dégradé (1 signal    échec (seuil dur
 │                   sous seuil mou)       franchi / parcours KO)
 ▼                   │                     │
[SAIN]           surveille + prolonge   [ROLLBACK: N-1, ou
 │               la fenêtre, diagnostique  dépublier au 1er ship]
 │                   │                     │
 ▼                   │                      ▼
[PHASE 6]        ┌───┴────┐            log + repli honnête
                récupère  persiste          │
                 │         │                ▼
                 ▼         ▼          (diagnostic avant re-tenter)
              [SAIN]   [ROLLBACK]
```

## Seuils (chiffrés — sinon ce n'est pas une mesure)

Seuils **absolus** : ils tiennent au **premier lancement** (aucune baseline de trafic prod n'existe encore) comme en redéploiement.

| Signal | Seuil « sain » | Seuil « dégradé » (surveiller) | Seuil « échec » (rollback) |
|---|---|---|---|
| Pages clés HTTP | toutes à **200**, TTFB p95 < **800 ms** | une 3xx inattendue, ou TTFB p95 **0,8–2 s** | une **4xx/5xx** sur page clé, ou TTFB p95 > **2 s** |
| Parcours cœur (activation) | complet, chaque étape < **3 s** | complet mais une étape **3–8 s** | **échoue** à une étape (ou > **8 s** = timeout ressenti) |
| Erreurs Sentry (fenêtre T) | **0** erreur sur le cœur · **< 1 erreur/min** hors-cœur · crash-free sessions **≥ 99 %** | **1–5 erreurs/min** hors-cœur · crash-free **95–99 %** | **toute** erreur sur le cœur · ou **> 5 erreurs/min** · ou crash-free **< 95 %** |
| Core Web Vitals (Lighthouse) | LCP < **2,5 s** · CLS < **0,1** · INP < **200 ms** | LCP **2,5–4 s** · CLS **0,1–0,25** · INP **200–500 ms** | LCP > **4 s** · CLS > **0,25** · INP > **500 ms** |

**Baseline (redéploiement uniquement).** Au **premier ship** il n'y a **pas de baseline** : on juge sur les chiffres absolus ci-dessus. En **redéploiement**, on ajoute un critère relatif : erreurs Sentry **> 5× la baseline N-1** = « échec », même si le taux absolu paraît bas.

Fenêtre T par défaut : **5–15 min** de surveillance active après le cutover (les premières minutes révèlent la majorité des régressions). Prolonger si « dégradé », clore si « sain » stable.

## Procédure canary (dans l'ordre)

1. **Smoke HTTP** : pages clés (landing, login, app, pricing si public) → attendre `200`. Une non-200 sur page clé = échec.
2. **Parcours cœur en prod** : dérouler *le* parcours d'activation réel (pas seulement charger le home). Ex. niche-agnostique : arriver → s'inscrire → première action de valeur → confirmation. Le parcours **inclut la réception réelle de l'email de connexion** (OTP / lien magique / confirmation) : statut Resend `delivered` **+** email arrivé dans une boîte réelle — une session créée sans email reçu (autoconfirm résiduel) est un **faux vert**, pas un passage.
3. **Erreurs Sentry** : lire le flux sur la fenêtre T. Au **premier lancement** (pas de baseline), juger sur les **seuils absolus** (0 sur le cœur, < 1 erreur/min hors-cœur, crash-free ≥ 99 %). En **redéploiement**, comparer aussi à la baseline N-1 (> 5× = échec). Toute erreur sur le parcours cœur = échec, baseline ou pas.
4. **Core Web Vitals** : Lighthouse / `unlighthouse` sur les pages clés. Un CWV hors cible franc = échec (dégrade la conversion **et** le SEO de l'étape 16).
5. **Verdict** : SAIN → Phase 6 · DÉGRADÉ → prolonger + diagnostiquer · ÉCHEC → rollback immédiat.

## Matrice de décision — verdict canary

| Observation | Verdict | Action |
|---|---|---|
| Tous signaux dans « sain » | SAIN | Logger, clore, → Phase 6. |
| Un signal en « dégradé », non-cœur | DÉGRADÉ | Prolonger T, diagnostiquer. Ne pas clore tant que non résolu. |
| Signal sur le parcours cœur en dégradé | traiter comme ÉCHEC | Rollback : le cœur prime. |
| Email de connexion jamais reçu (Resend muet, bounce, ou reçu nulle part) | ÉCHEC | Le parcours cœur **commence** à la connexion : sans email reçu, personne n'entre. Rollback ou fix config email (domaine/clé/redirect URLs) avant re-tenter. |
| Un seuil dur « échec » franchi | ÉCHEC | **Rollback immédiat** (re-promotion N-1, ou **dépublication** au 1er ship) + log + diagnostic avant re-tenter. |
| Tracking absent → canary aveugle | bloquant | Réparer le tracking (étape 4.4) avant de conclure ; ne pas déclarer sain à l'aveugle. |

## Runbook de rollback

Le rollback est **prévu, testé, documenté** — pas improvisé.

**Deux cas, deux repli différents :**
- **Redéploiement (une version N-1 sert déjà la prod)** → rollback = **re-promouvoir N-1** : on revient à un build public sain.
- **Premier lancement (aucune N-1 — l'étape 17 est le PREMIER cutover public)** → il n'y a **rien** à re-promouvoir. Le rollback est la **dépublication** : retirer le domaine du déploiement / restaurer le DNS pré-cutover, le produit **retourne en preview URL privée** (non indexée, non publique). Objectif : que le public ne voie **plus** le build cassé, pas de « revenir à l'ancien ».

Par sous-étape d'apply :

| Ce qui a basculé | Rollback — redéploiement (N-1 existe) | Rollback — premier lancement (pas de N-1) | Vérif post-rollback |
|---|---|---|---|
| Migration prod (Supabase) | jouer le `down` / restaurer le snapshot pré-migration | idem : `down` / snapshot pré-migration (la BDD prod est **neuve**) | schéma revenu à l'état d'avant l'apply |
| Promotion (Vercel/CF) | re-promouvoir la version **N-1** (une commande) | **dépublier** le déploiement (retirer l'alias prod → preview) | plus aucun build public cassé |
| DNS cutover (Cloudflare) | restaurer l'enregistrement précédent → N-1 (TTL bas → propagation rapide) | **retirer/repointer** l'enregistrement → le domaine ne sert plus la prod (TTL bas) | le domaine ne pointe plus le build cassé |
| Tracking (PostHog/Sentry) | désactiver / ignorer (non bloquant service) | idem | pas d'effet sur les users |

**Rollback total** (canary échec après cutover complet), ordre inverse de l'apply :
- **Redéploiement** : DNS → N-1, promotion → N-1, migration → `down` si le code N-1 l'exige.
- **Premier lancement** : DNS **retiré/repointé** (domaine ne sert plus la prod), promotion **dépubliée** (retour preview), migration → `down`/snapshot. Le public ne voit plus rien de cassé — le produit reste accessible en **preview URL privée** le temps du diagnostic.

Puis **log honnête** dans `deploy/log.md` : ce qui a basculé, ce qui est restauré (ou dépublié), la cause, l'état final.

### Micro-exemple (niche-agnostique)
> **Premier lancement.** Cutover fait. Minute 3 : erreur Sentry sur la route `/{action-cœur}` (500) → 1 erreur suffit sur le cœur. Verdict ÉCHEC.
> Rollback : pas de N-1 à re-promouvoir → **dépublication** — retrait de l'alias prod + DNS bas TTL repointé → le domaine ne sert plus le build cassé en < 2 min, le produit reste en **preview URL privée**.
> Log : « Régression sur `/{action-cœur}`, **dépubliée** (retour preview, aucun N-1 au 1er ship), cause = variable d'env manquante en prod. À corriger avant re-tenter. » Pas de « déployé ✅ » menteur.
>
> **Variante redéploiement** (une N-1 existe déjà) : même incident → **re-promotion N-1** (30 s) + DNS bas TTL → prod revenue sur N-1 en < 2 min.

## Modes d'échec (et prévention)

| Mode d'échec | Prévention |
|---|---|
| « Canary vert » alors que seul le home a été testé | Toujours dérouler le **parcours cœur** complet en prod, pas juste des 200. |
| « Canary vert » avec une session créée mais **aucun email parti** (autoconfirm résiduel) | Exiger la **réception réelle** de l'email de connexion : statut Resend `delivered` + boîte réelle — jamais la seule session. |
| TTL DNS haut → rollback DNS lent (heures) | **Abaisser le TTL avant** le cutover (ex. 60s), le remonter après stabilisation. |
| Rollback échoue car N-1 non redéployable (redéploiement) | Tester le rollback **en pré-vol** (`preflight-checklist.md`), pas le jour J. |
| Premier lancement : on cherche un « N-1 » qui n'existe pas | Au 1er ship le repli **n'est pas** une re-promotion : c'est la **dépublication** (retrait DNS/alias → preview URL privée). La tester en pré-vol comme le vrai plan de rollback. |
| Migration destructive sans snapshot | Snapshot **avant**, double confirm (§5) ; sinon le rollback data est impossible. |
| On déclare sain sans tracking actif | Le tracking (4.4) est **prérequis** du canary : pas de données = pas de verdict. |
| Fenêtre T trop courte | Garder 5–15 min de surveillance active ; les régressions arrivent souvent après la minute 1. |

## Sortie
Verdict consigné dans `deploy/log.md` (template). SAIN → mise à jour `state.md` (déployé, URL, version) → **Phase 6**. ÉCHEC → rollback loggé, cause identifiée, retour au point de correction — **jamais** un faux succès.
