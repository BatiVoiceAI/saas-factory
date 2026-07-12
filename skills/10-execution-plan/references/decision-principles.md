# Référence — Principes de décision autonome (sans porte)

En Phase 3, **zéro intervention utilisateur** : le composer tranche seul et **loge**. Ces principes remplacent le jugement de l'utilisateur. Ce qui, ailleurs (Phase 1/2/5), serait une « taste decision » soumise à l'humain est ici **auto-décidé + logué**, récupérable a posteriori dans l'audit trail.

## Les 6 principes (ordre de priorité en contexte technique)
1. **Complétude** — choisis l'option qui couvre le plus de cas (l'IA rend la complétude quasi gratuite ; ne prends pas un raccourci qui coûterait cher plus tard).
2. **Coller aux patterns existants** — réutilise les conventions de l'archétype et du châssis (`_shared/blocks/`) plutôt que d'inventer.
3. **Réversibilité** — à valeur égale, choisis l'option la plus facile à défaire (feature flag, adaptateur).
4. **DRY** — si ça duplique une capacité existante (un bloc, une fonction), réutilise, ne recrée pas.
5. **Explicite > malin** — préfère 10 lignes lisibles à 200 lignes d'abstraction prématurée.
6. **Biais pour l'action** — ne bloque pas sur une ambiguïté mineure : tranche selon 1-5, loge, avance.

## Machine de décision — trancher une ambiguïté
```
Ambiguïté rencontrée pendant le plan
        │
        ├─ Un bloc / une convention du châssis couvre le cas ? ──oui──▶ l'utiliser (P2, P4) ─▶ LOG
        │                                                        non
        ├─ Une option couvre nettement plus de cas ? ──────────oui──▶ la prendre (P1) ─────▶ LOG
        │                                                        égalité
        ├─ Une option est nettement plus réversible ? ─────────oui──▶ la prendre (P3) ─────▶ LOG
        │                                                        égalité
        ├─ Une option est plus explicite/lisible ? ────────────oui──▶ la prendre (P5) ─────▶ LOG
        │                                                        égalité
        └─ Trancher au hasard raisonné, LOG, avancer (P6). Ne pas boucler.
                                                    │
                                                    └─ le choix touche-t-il auth / PII / paiement / permissions ?
                                                           └─ oui ─▶ tagger [SÉCU] dans le log
```

## Forcing-question — « ceci mérite-t-il d'être logué ? »
- **Ask exact** : « Un relecteur de la Phase 4, sans ce contexte, se demanderait-il *pourquoi ce choix* ? »
- **Push-until** : toute décision **non triviale** (déviation d'un défaut, arbitrage entre deux options plausibles, choix sécurité-sensible) est loguée. Les micro-choix évidents (nommer une variable) ne le sont pas.
- **Red-flags (à ne pas faire)** :
  - Trancher sans loger une déviation → autonomie **non auditable** = interdit.
  - Loger « choix par intuition » sans citer de principe → chaque ligne cite **un** principe (P1-P6).
  - Remonter la décision à l'utilisateur → **il n'y a pas de porte en Phase 3**.

## Journalisation (obligatoire)
Chaque décision non triviale → une ligne dans l'**audit trail** de `tech/execution-plan.md` : décision · principe appliqué · alternative écartée · réversibilité · `[SÉCU]?`. C'est ce qui rend l'autonomie **auditable** malgré l'absence de porte.

### Exemples de lignes d'audit (niche-agnostiques)
| Décision | Principe | Alternative écartée | Réversibilité | [SÉCU] |
|---|---|---|---|---|
| Câbler le bloc `notifications` plutôt qu'un envoi mail maison | P4 DRY / P2 patterns | SMTP custom | Élevée (adaptateur) | — |
| Mettre `export` en lane séquentielle après A+B | P1 complétude | Parallèle risqué | Élevée | — |
| Rôles via le bloc `auth` (RLS) pour la feature admin | P2 patterns | Check applicatif ad hoc | Moyenne | **[SÉCU]** |
| Feature flag sur la nouvelle verticale | P3 réversibilité | Livrer en dur | Élevée | — |

## Sécurité — signaler, pas escalader
Zéro porte en Phase 3 → on ne remonte pas à l'utilisateur. Mais un choix **sécurité-sensible** (auth, données personnelles, paiement, permissions) est **signalé en clair** dans l'audit trail, taggé `[SÉCU]`, pour être **repris par la revue sécurité de la Phase 4**. On ne masque jamais un risque sous prétexte d'autonomie.

### Catalogue — quand tagger [SÉCU]
- **Auth / authZ** : choix de mécanisme de rôles, de sessions, de multi-tenant (isolation par client / RLS).
- **PII / données personnelles** : où stocker, quoi chiffrer, quoi logger (ne jamais loguer de PII).
- **Paiement** : idempotence des webhooks, source de vérité du statut d'abonnement.
- **Permissions / partage** : qui peut lire/écrire quoi, escalade de privilèges possible.
- **Entrées non fiables** : uploads, webhooks, saisie libre → où se fait la validation.
- **Secrets** : jamais en dur, jamais dans un artefact projet (rappel `_shared/safety-rails.md` §4) — si un plan implique une clé, tagger et renvoyer au provisioning (étape 11).

> Un `[SÉCU]` n'est **pas** un blocage : on tranche, on loge, on tague, on avance. La revue sécu de la Phase 4 (CTO dans la cascade, `security-review` vendoré) prendra le relais.

## Modes d'échec (décision autonome)
| Mode d'échec | Symptôme | Correctif |
|---|---|---|
| Analysis paralysis | On boucle sur une ambiguïté mineure | Appliquer P6, loger, avancer |
| Faux « je demande à l'utilisateur » | Le plan contient une question ouverte | Trancher via P1-P6 ; il n'y a pas de porte |
| Audit vide | Déviations non loguées | Chaque décision non triviale = 1 ligne |
| Risque masqué | Choix auth/PII non tagué | Tagger `[SÉCU]`, laisser la Phase 4 revoir |
| Sur-ingénierie « au cas où » | Abstraction non justifiée par une exigence | P5 explicite ; revenir au défaut/bloc |
