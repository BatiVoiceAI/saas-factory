# État, reprise & discipline `_shared` — Phase 5

Comment l'orchestrateur de phase tient `.saas-factory/state.md`, reprend une phase interrompue, et respecte la lecture **unique** de `_shared/*`. Format d'état : `_shared/state-schema.md`.

## Discipline « lire `_shared` une fois » (progressive disclosure)
- Le **master** a lu `_shared/*` au démarrage de la session — ils **priment** et sont déjà en contexte. L'orchestrateur de Phase 5 **ne les relit pas** et **ne les fait pas relire** par 16/17.
- Ce que l'orchestrateur (re)confirme au besoin : `references/conventions.md` (local à la phase), et les **§ précis** de `_shared/safety-rails.md` que la phase mobilise (§1 plan-then-apply, §1 bis autorisation durable, §2 sandbox, §4 secrets, §6 repli honnête) — par renvoi, pas par relecture intégrale.
- Le **détail d'une étape** (ses `references/`) se charge **au moment** où elle s'exécute, jamais en avance. 16 et 17 ont chacune ~4-7 fichiers de profondeur : ne les précharge pas.

## Démarrage de phase (séquence)
```
1. state.md existe (le master l'a créé/repris) ──▶ lire { Phase, Étape, Statut }
2. lire `Type / route` (déjà fixé en P1) ──▶ appliquer routing.md (NE PAS reposer le cadrage)
3. pré-vol infra : ~/.saas-factory/config.json présent ?
      oui ──▶ provisioning/déploiement pré-autorisé (safety §1 bis)
      non ──▶ mode local/fallback (jamais bloquant, §6) — le déploiement guidera
4. router : type=public ▶ 16 puis 17 · type=perso/interne ▶ 17 seul (16 sautée)
5. dérouler (pipeline.md)
```

## Mise à jour de l'état — quand & quoi
À **chaque transition** (fin d'étape, franchissement de porte, rollback), mets à jour `.saas-factory/state.md` :

| Événement | À écrire |
|---|---|
| entrée en Phase 5 | `Phase 5 · étape 16` (ou `17` si SEO sauté) · Statut `en cours` |
| `16` sauté (type≠public) | note « SEO sauté (type=<perso/interne>) » ; passe à `étape 17` |
| `16` fait | `étape 16 fait` + nb de clusters, nb de pages, **gate contenu OK** (date) |
| `17` porte publication | ajoute (porte publication, décision, date) — franchie ou en attente |
| `17` apply | version/SHA promue, cutover DNS fait, tracking activé |
| `17` canary | résultat (sain / rollback N-1) |
| `17` fait | `étape 17 fait` · **déployé** · URL live · version · Statut `fait` |
| porte **en attente** | Statut `porte en attente` (à la reprise : re-présenter, ne pas rejouer) |

**Écrivain unique** : seul **l'orchestrateur de phase** écrit `state.md` — jamais 16/17 ni un sous-agent. Ils produisent leur artefact (`seo/*`, `deploy/*`) et te le rapportent ; toi seul consignes, à chaque transition. Cela évite les MAJ concurrentes/incohérentes (cf. `_shared/state-schema.md`).

**Interdits d'état (sécurité)** : jamais de secret/clé/token dans `state.md` ni dans `deploy/log.md` ni collé en conversation (safety §4). Les accès infra vivent dans `~/.saas-factory/` (config + `.env` chmod 600) ou côté connecteur MCP/OAuth.

## Reprise — les cas
| Situation à l'ouverture de `state.md` | Action |
|---|---|
| `Statut = porte en attente` (porte publication 17) | **re-présente la porte** avec le plan à jour ; ne re-déploie pas, n'apply rien avant l'OK |
| `Statut = en cours` sur étape 16 | reprends 16 là où le pipeline SEO s'est arrêté (mécanismes 1→4) |
| `Statut = en cours` sur étape 17 | reprends 17 à sa sous-étape : pré-vol / plan / porte / apply / canary. **Si un apply a déjà eu lieu**, vérifie l'état réel (prod up ? DNS coupé ?) avant de continuer — ne rejoue pas un apply idempotent aveuglément |
| `16` marqué `fait` | enchaîne 17 |
| `17` marqué `fait` (déployé) | Phase 5 terminée → enchaîne **`phase-6-after`** |
| gate contenu / porte publication déjà inscrit(e) | **ne redemande pas** — c'est acquis, route selon la décision |
| rollback inscrit sans nouvelle passe | reprends au **re-plan** (diagnostic → nouveau plan → re-porte) |

La reprenabilité est un contrat : deux sessions successives sur le même projet produisent le **même** enchaînement déterministe à partir de l'état — surtout ici, où un apply mal repris peut publier deux fois ou couper la prod.

## Sortie de phase
`17` `fait` ⇒ résume en 2 lignes (URL live + santé), mets l'état à `Phase 5 fait`, et annonce **Phase 6** (mesure & rétro).
