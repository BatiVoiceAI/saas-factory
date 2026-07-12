# Référence — Idempotence & rollback

Le provisioning doit être **re-jouable** (un run interrompu se reprend sans doublon) et **réversible** (un échec ne laisse pas un demi-état).

## Idempotence — détecter avant de créer
Chaque sous-agent, avant de créer, **vérifie l'existant** :
- **Repo** : `org/<slug>` existe déjà ? → réutilise, ne recrée pas.
- **BDD** : projet Supabase pour ce slug existant ? → réutilise. Migrations appliquées **par nom** : une migration déjà passée n'est pas rejouée.
- **DNS** : `<slug>.<domaine>` existe ? → réutilise / UPSERT.
- **Host** : projet Vercel existant ? → réutilise.
- **Email** : domaine déjà vérifié ? → réutilise.

Chaque sous-agent écrit l'état dans `status/provision-<resource>.md` : `PENDING` / `DONE` / `FAILED` + identifiants créés.

## Reprise
Au démarrage de l'étape 11, lis tous les `status/provision-*.md` : saute les `DONE`, reprends aux autres. **Ne redemande jamais rien** (zéro intervention).

## Rollback partiel (sur échec)
Si une ressource échoue **et** n'est pas réparable en la re-jouant :
1. **Loge** l'échec précis dans `tech/provisioning-log.md` (`FAILED` + raison).
2. **Défais** ce que **ce run** a créé pour cette ressource si c'est sûr (ex. supprimer un sous-domaine créé mais orphelin) — sinon laisse un **état re-jouable** documenté.
3. **Ne masque jamais** un demi-provisioning : marque le run `DONE_WITH_CONCERNS` et liste ce qui manque. L'humain tranchera au déploiement.

## Sécurité
Les actions destructives (supprimer une ressource) ne concernent **que** les ressources créées par **ce run** (rollback), **jamais** une ressource préexistante (`_shared/safety-rails.md` §2 sandbox, §5 destructif). En cas de doute → laisser en l'état + loguer, ne pas supprimer.

---

## Matrice de détection d'existant (le check idempotent, par ressource)
La sonde exacte à exécuter **avant** toute création, et la décision qui en découle.

| Ressource | Sonde (MCP/API) | Existe → | N'existe pas → |
|---|---|---|---|
| Repo | list/get repo `org/<slug>` | réutilise l'URL, ne push que si l'arbre distant est vide | `create repository` |
| CI | lister `.github/workflows/` distant | ne réécrase pas un workflow présent | pousse les workflows du scaffold |
| BDD (projet) | list projects, match slug | réutilise la `ref` | `confirm_cost` → `create_project` |
| Migrations | table `supabase_migrations` (nom de migration) | saute les noms déjà présents | `apply_migration` par nom, dans l'ordre |
| DNS | get DNS record `<slug>.<domaine>` | **UPSERT** (met à jour la cible, ne duplique pas) | crée le record |
| Host | list projects, match nom | réutilise le project id | crée le projet + lie le repo |
| Email domaine | get domain status Resend | `verified` → réutilise ; `pending` → attend/relance | ajoute le domaine + publie les DNS |
| Secrets | get secret par **nom** | overwrite (valeur idempotente) | crée le secret |
| Stripe | list products par metadata `slug` | réutilise | crée produits/prix (mode test) |

**Règle d'or de l'idempotence** : la clé de détection est **déterministe** (le `slug`, le nom de migration, le nom de secret). Jamais de détection par « le dernier créé » ni par timestamp — ça casse la reprise.

## Recette forcing — trancher réutiliser vs recréer
Point de décision interne au sous-agent (aucune question à l'utilisateur — Phase 3).

- **Check exact** : « une ressource porte-t-elle exactement ma clé déterministe (`<slug>`, nom de migration, nom de record) ? »
- **Décider jusqu'à** : identité **certaine** (id/ref/nom exact), pas « ça y ressemble ».
- **Red-flags — refuser de réutiliser** (traiter comme conflit, pas comme match) :
  - ressource au bon nom mais dans une **autre org / un autre compte** que la config → ne pas toucher, loguer conflit.
  - projet Supabase au bon slug mais **contenant déjà des tables métier inconnues** → ne pas migrer par-dessus, `[SÉCU]` + STOP cette ressource.
  - record DNS existant pointant vers une **cible tierce vivante** → ne pas UPSERT à l'aveugle, loguer.
- **Routage** :
  - match certain + ressource vide/cohérente → **réutilise**.
  - match certain + contenu inattendu → **conflit** : ne crée pas, ne détruit pas, loge `FAILED (conflict)`.
  - pas de match → **crée**.

Exemple MOU (à refuser) : « il y a un repo `dashboard` chez l'utilisateur, c'est sûrement le mien » → non, mon slug est `quietinbox`.
Exemple FORT : « `list repos` renvoie exactement `acme/quietinbox`, arbre vide → je réutilise et je push ».

## Matrice de rollback (échec → quoi défaire)
Sur `FAILED`, décider ressource par ressource. **On ne défait que ce que CE run a créé.**

| Ce que ce run a créé avant l'échec | Réparable en re-jouant ? | Rollback |
|---|---|---|
| Rien (échec au 1er appel) | oui | aucun, retry |
| Projet Supabase créé, migration échouée à mi-parcours | **oui** (migrations par nom, reprend) | **ne pas supprimer le projet**, re-jouer les migrations restantes |
| Sous-domaine DNS créé, host pas encore lié | oui | garder le record (orphelin bénin) OU le supprimer si sûr ; loguer |
| Repo créé, push échoué | oui | garder le repo vide, retry le push |
| Secret partiellement injecté | oui | overwrite complet au retry (idempotent) |
| Ressource dans un état incohérent non re-jouable | non | rollback de ce que ce run a créé **si sûr**, sinon état re-jouable documenté |

**Jamais de suppression d'une ressource préexistante** (détectée à l'étape idempotence), même sur échec : elle n'appartient pas à ce run.

## Definition of Done — idempotence & reprise
- [ ] Chaque sous-agent sonde l'existant **avant** de créer (clé déterministe).
- [ ] Chaque ressource a un `status/provision-<resource>.md` avec état + identifiants.
- [ ] Un 2ᵉ run complet ne crée **aucune** ressource neuve (tout est `DONE`, tout sauté).
- [ ] Une migration déjà passée n'est pas rejouée (détection par nom).
- [ ] Aucun rollback n'a touché une ressource préexistante.
- [ ] Tout demi-état est **logué** et le run marqué `DONE_WITH_CONCERNS`, jamais `DONE` silencieux.

## Modes d'échec (idempotence/rollback) + traitement

| Mode d'échec | Cause typique | Traitement |
|---|---|---|
| Double création | détection par timestamp au lieu du slug | toujours détecter par clé déterministe |
| Migration rejouée | détection par « dernière migration » au lieu du nom | `apply_migration` idempotent **par nom** |
| Orphelin DNS | sous-domaine créé, host jamais lié | UPSERT au retry, ou suppression sûre ; jamais bloquant |
| Rollback trop large | suppression d'une ressource préexistante | interdit — ne défaire que ce que ce run a créé |
| Faux `DONE` | statut écrit avant vérif de l'artefact | le statut `DONE` n'est écrit qu'après confirmation de l'existence réelle |
| Boucle de retry | re-jouer sans limite | 1 seule retry auto (`safety-rails.md` §7), puis `DONE_WITH_CONCERNS` |
