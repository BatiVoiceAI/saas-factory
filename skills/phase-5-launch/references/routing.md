# Routing — Phase 5 : calibrage `type` → route

Le `type` a été capté à l'**étape 1** (discover) et propagé dans `.saas-factory/state.md` (`Type / route`). En Phase 5 tu **appliques** ce routage — tu ne reposes **jamais** le cadrage (state-resume.md). Ce fichier dit exactement quelles étapes s'activent, se sautent, ou se calibrent.

## Matrice principale

| `type` | 16-seo | 17-deploy | Cible du déploiement |
|---|---|---|---|
| **public** (SaaS public sérieux) | ✅ **actif** — base SEO complète + gate humain | ✅ actif — plan-then-apply, DNS public, tracking, canary | domaine public + indexation |
| **interne** (outil d'équipe / B2B fermé) | ⏭️ **sauté** | ✅ actif — déploiement **privé/interne** (accès restreint), porte + canary maintenus | sous-domaine interne / accès protégé |
| **perso** (outil perso / one-off) | ⏭️ **sauté** | ✅ actif — déploiement **privé**, cérémonie allégée mais porte + canary maintenus | URL privée / non indexée |

## Règles de calibrage
1. **Le routage saute une ÉTAPE (16), jamais une PORTE.** La porte de publication de `17-deploy` et le canary restent **toujours** actifs, même en perso/interne : dès que ça publie ou dépense, `safety-rails.md` §1 s'applique.
2. **Perso / interne → SEO sauté** : pas de pages publiques à référencer. On annonce explicitement « SEO sauté (type ≠ public) » et on passe directement à 17. `seo/*` reste absent — 17 le gère sans bluff.
3. **Déploiement interne/perso ≠ déploiement bâclé** : pré-vol, plan chiffré, porte, apply réversible, canary → identiques. Ce qui change : la **surface publique** (pas d'indexation, DNS/accès restreint), pas la rigueur.
4. **Le `type` prime sur la demande ponctuelle** : si l'utilisateur demande « fais-moi du SEO » sur un projet `perso`, propose-le mais rappelle que ça reste hors route par défaut — décision utilisateur explicite pour l'activer.
5. **`type` inconnu / non fixé** (cas anormal en P5) : ne devine pas → relis `state.md` ; si vraiment absent, traite comme **public** par prudence (route complète) et signale l'anomalie.

## Ambition (secondaire)
Le champ `Ambition` de l'état module l'**intensité** du SEO quand 16 est active (nombre de clusters/pages dans la limite du plafond dur), pas le fait de l'exécuter. L'ambition ne change **jamais** la rigueur de 17.

## Ce que le routage NE fait pas
- Il ne saute pas la mise à jour d'état ni la sortie de phase.
- Il ne saute pas le pré-vol ni le rollback de 17.
- Il ne transforme pas un `public` en déploiement sans SEO au motif de « ship plus vite » — pour aller vite sur du public, on **réduit** le SEO au plancher (landing propre + technique verte), on ne le supprime pas.
