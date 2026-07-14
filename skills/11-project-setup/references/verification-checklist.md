# Référence — Vérif finale & Definition of Done de l'étape 11 (étape 8)

La passe qui décide si l'étape 11 sort `DONE`, `DONE_WITH_CONCERNS`, ou reste ouverte. On **re-teste chaque ressource réelle** (pas les fichiers de statut) : un `status/DONE` ne suffit pas, on sonde l'artefact. Le **cutover production** reste au déploiement (Phase 5) — ici on vérifie que l'usine est prête à builder, pas qu'elle est en prod.

## Sonde par ressource (le health-check réel)
| Ressource | Sonde | Vert si | Sinon |
|---|---|---|---|
| Repo | `get repo` + dernier commit distant | arbre poussé, commit visible | `FAILED` (repo cœur) |
| CI | statut du dernier run Actions | workflow présent, pas rouge au 1er run | logguer (non-bloquant si juste "no run yet") |
| BDD | `list tables` / requête légère | tables présentes, **RLS active** | `FAILED` (BDD cœur) |
| Sous-domaine | résolution DNS de `<slug>.<domaine>` | résout vers le host | `DONE_WITH_CONCERNS` (propagation possible) |
| Host | statut projet + lien repo | projet lié, deploy déclenchable | `FAILED` si non lié |
| Email | domain status Resend | `verified` | `DONE_WITH_CONCERNS` (propagation) |
| Secrets | présence par **nom** (pas la valeur) | tous les noms requis présents | `[SÉCU]` + `DONE_WITH_CONCERNS` |
| Billing *(si activé)* | list products (metadata slug) | produits en mode test présents | non-applicable ≠ échec |

> **Propagation ≠ échec.** DNS/email lents à propager → la ressource **est créée**, elle propage : son état reste **`DONE` + `concerns`** (pas `FAILED`). Le déploiement (Phase 5) reverifiera.
> **403/1010/challenge sur la sonde HTTP = signal WAF (Cloudflare), pas un échec.** Vérifier l'état réel via l'**API du host** (statut du dernier deploy) : deploy vert → loguer le WAF en `concerns` — **jamais de faux `FAILED`** (`mcp-map.md` §modes d'échec).
> **Niveau de `DONE_WITH_CONCERNS`.** Dans la colonne « Sinon » ci-dessus, `DONE_WITH_CONCERNS` désigne la **contribution au verdict de run**, jamais un état de ressource (la ressource reste `DONE` + `concerns` ou `FAILED`) — **définition canonique : `provisioning-plan.md` §machine à états**.
> **Type ≠ public : sondes ajustées.** Les sondes suivent la matrice `provisioning-plan.md` §« Routage par type de produit » — `perso` : pas de sous-domaine, sonde sur l'**URL par défaut du provider** + compte unique seedé présent ; `interne` : signup désactivé + invitations opérationnelles attendus. Chaque allègement doit apparaître dans `tech/provisioning-log.md` : **un allègement non logué = échec de la vérif** (jamais silencieux).

## Sondes AUTOMATION (archétype `automation` — remplace les sondes web-saas retirées)
> **Actives UNIQUEMENT si `archetype = automation`.** En `web-saas`, la table de sondes ci-dessus s'applique telle quelle. En automation, les sondes **sous-domaine / host / email** sont **sans objet** (ressources retirées, `provisioning-plan.md` §« Chemin de provisioning AUTOMATION ») et sont **remplacées** par :

| Ressource automation | Sonde | Vert si | Sinon |
|---|---|---|---|
| **Repo + scheduler** | `get repo` + présence de `.github/workflows/<slug>.yml` avec `on: schedule:` | workflow présent, **≥ 2 crons (sync + digest) + `workflow_dispatch`**, arbre poussé | `FAILED` (cœur — sans scheduler, l'automation ne tourne jamais) |
| **Run one-shot journalisé + notifié** | déclencher `workflow_dispatch` (smoke-test) → observer un run | run terminé, **une ligne d'historique** (Actions rouge=échec via exit 1), **boucle fermée déclenchée** (alerte/rapport au propriétaire) | `FAILED` si le run n'écrit aucun log OU ne notifie pas (boucle fermée = non négociable, `routing.md` archétype automation) |
| **BDD durable (service-role)** | `list tables` / requête légère | tables du store de runs + entités présentes, **RPC d'idempotence présent** | `FAILED` (cœur) |
| **RLS 0 policy tenant** | inspecter les policies des tables métier | **aucune policy `anon`/JWT-utilisateur** (accès service-role only, RLS activée sans policy = deny-all) | `[SÉCU]` si une policy tenant traîne (surface d'accès inattendue) OU si une table est ouverte sans service-role |
| **État durable sur runner éphémère** | ordonnanceur = GitHub Actions ? ET `SUPABASE_URL` (Variables) posé ? | base durable câblée (pas de fallback fichier sur éphémère) | **BLOQUANT** — I1 cassé (`provisioning-plan.md` §RÈGLE DURE) ; jamais `DONE` |
| **Secrets d'intégration source/cible** | présence par **nom** des tokens des systèmes intégrés | tous les tokens source+cible présents (Secrets) | `[SÉCU]` + `DONE_WITH_CONCERNS` (worker ne pourra lire/écrire) |

> **`git_author` en automation : PAS une sonde de déploiement.** Host = GitHub Actions, pas Vercel → aucun `readyState = BLOCKED` possible. On ne vérifie **pas** l'appartenance à une team Vercel (invariant scopé `hosting = vercel`, `provisioning-plan.md` §Ordre step 1).
> **Retraits tracés = condition de vérif.** Comme pour les allègements de type, **chaque retrait automation** (hosting-web, DNS, email-domaine, Auth, billing) doit apparaître dans `tech/provisioning-log.md` : un retrait non logué = **échec de la vérif** (jamais silencieux).

## Definition of Done — étape 11 complète
### Bloquant (sinon l'étape ne peut pas sortir `DONE`)
- [ ] Scaffold local complet (arbre + blocs câblés + `CLAUDE.md` rempli). Voir `scaffold-procedure.md`.
- [ ] Repo distant existe, arbre poussé, CI présente.
- [ ] BDD provisionnée, migrations appliquées, **RLS sur toute table multi-tenant**.
- [ ] Host lié au repo (auto-deploy possible).
- [ ] Secrets injectés (GitHub + host), **zéro secret** en dur/logué/commité.
- [ ] `tech/provisioning-log.md` renseigné (une ligne par ressource + points `[SÉCU]`).
- [ ] `.saas-factory/state.md` mis à jour (décisions verrouillées : repo, sous-domaine, BDD, host).

### Non-bloquant (peut être `DONE_WITH_CONCERNS`)
- [ ] Sous-domaine résout (sinon propagation → à reverifier Phase 5).
- [ ] Email vérifié (sinon propagation / à câbler Phase 4-5).
- [ ] Billing en mode test (si `billing = stripe`).

### Interdits (échec dur si présents)
- [ ] Un secret en dur / commité / logué → **bloquant**.
- [ ] Une table multi-tenant sans RLS → **bloquant** `[SÉCU]`.
- [ ] Une feature métier pré-buildée → viole le HARD GATE.
- [ ] Un `status/DONE` sans artefact réel correspondant → faux `DONE`, re-tester.

## Machine à états de sortie
```
        toutes ressources cœur vertes ?
                │
        ┌───────┴────────┐
       oui              non (une cœur FAILED)
        │                │
   concerns ?       ETAPE OUVERTE
   (périph. lentes)  (retry borné / fallback / escalade log)
   ┌────┴─────┐
  non        oui
   │          │
  DONE   DONE_WITH_CONCERNS
   │          │
   └────┬─────┘
        ▼
  résumé 2 lignes + Phase 4 (build)
```
- **cœur** = repo + BDD + host + secrets. Une cœur `FAILED` non réparable → l'étape ne sort pas `DONE` : on loge, on présente l'état (`safety-rails.md` §6 repli honnête), on ne simule pas.
- **périphérie** = DNS/email/billing. Lentes/absentes → `DONE_WITH_CONCERNS`, on continue.

## Sortie & handoff
- **Loger** l'état final de chaque ressource dans `tech/provisioning-log.md`.
- **Mettre à jour** `.saas-factory/state.md` (Phase 3 close, décisions provisioning verrouillées).
- **Résumé 2 lignes** : URL du sous-domaine + ce qui est câblé (cf. SKILL.md « Sortie & état »).
- **Reporter les `[SÉCU]`** vers la revue sécurité Phase 4.
- Handoff → **Phase 4 (build)** : le `CLAUDE.md` racine est la source de vérité des agents de build.

## Modes d'échec de la vérif + traitement

| Mode | Symptôme | Traitement |
|---|---|---|
| Confiance aveugle au statut | `DONE` accepté sans sonde | toujours re-tester l'artefact réel |
| `FAILED` cœur masqué | sortie `DONE` alors qu'une cœur manque | interdit — repli honnête, présenter l'état |
| Propagation traitée en échec | DNS/email lents → `FAILED` | `DONE_WITH_CONCERNS`, reverif Phase 5 |
| RLS non vérifiée | tables OK mais isolation non testée | sonder la RLS explicitement, `[SÉCU]` si absente |
| State non mis à jour | reprise/master perd le fil | toujours écrire `.saas-factory/state.md` en sortie |
| Cutover tenté ici | promotion prod dans l'étape 11 | STOP — le cutover est Phase 5, pas ici |
