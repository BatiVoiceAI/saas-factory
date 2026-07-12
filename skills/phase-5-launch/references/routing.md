# Routing — Phase 5 : appliquer la route (renvoi)

Le `type` a été capté à l'**étape 1** (discover) et propagé dans `.saas-factory/state.md` (`Type / route`). En Phase 5 tu **appliques** ce routage — tu ne reposes **jamais** le cadrage (state-resume.md).

**La table étape × type et la liste des portes actives par type sont CANONIQUES et vivent à UN seul endroit : `skills/saas-factory/references/routing.md` — route selon routing.md.** Pas de copie de matrice ici : pour savoir si 16 s'exécute, si la porte de 17 s'ouvre et sous quelle forme, ouvre la matrice canonique (§ Matrice canonique + § Portes actives par type). Ce fichier ne garde que les **règles d'application** locales à la phase.

## Règles d'application (calibrage local — jamais le skip-set)

1. **Le routage saute des ÉTAPES ; les portes suivent la liste réelle par type** (canonique, § Portes actives par type) : porte de publication complète en `public`, **conditionnelle** en `interne` (+ check « signup anonyme refusé »), **absente** en `perso` quand la cible est la preview URL du provider à **coût nul** — mais dès que ça touche un domaine public ou que ça dépense, `safety-rails.md` §1 s'applique et la porte revient.
2. **SEO sauté (type ≠ public)** : pas de pages publiques à référencer. Annonce explicitement « SEO sauté (type ≠ public) », pose le **noindex** (canonique : « Sauter + noindex ») et passe à 17. `seo/*` reste absent — 17 le gère sans bluff.
3. **Déploiement interne/perso ≠ déploiement bâclé** : pré-vol, plan chiffré, apply réversible, canary → identiques. Ce qui change : la **surface publique** (pas d'indexation, DNS/accès restreint) et la cérémonie de porte (règle 1), pas la rigueur.
4. **Le `type` prime sur la demande ponctuelle** : si l'utilisateur demande « fais-moi du SEO » sur un projet `perso`, propose-le mais rappelle que ça reste hors route par défaut — décision utilisateur explicite pour l'activer.
5. **`type` inconnu / non fixé** (cas anormal en P5) : ne devine pas → relis `state.md` ; si vraiment absent, traite comme **public** par prudence (route complète) et signale l'anomalie.

## Ambition (secondaire)

Le champ `Ambition` de l'état module l'**intensité** du SEO quand 16 est active (nombre de clusters/pages dans la limite du plafond dur), pas le fait de l'exécuter. L'ambition ne change **jamais** la rigueur de 17.

## Ce que le routage NE fait pas

- Il ne saute pas la mise à jour d'état ni la sortie de phase.
- Il ne saute pas le pré-vol ni le rollback de 17 (quel que soit le type).
- Il ne transforme pas un `public` en déploiement sans SEO au motif de « ship plus vite » — pour aller vite sur du public, on **réduit** le SEO au plancher (landing propre + technique verte), on ne le supprime pas.
