# Référence — Catalogue de cas limites (transverse, niche-agnostique)

La checklist exhaustive des cas limites à balayer côté utilisateur, en passe 1 (par feature) **et** passe 2 (par parcours). Niche-agnostique : applique ce qui a du sens pour le produit, ignore le hors-sujet — mais **justifie** un « non applicable », ne le saute pas par paresse.

> Principe : un happy path qui marche ne prouve presque rien. **La qualité se voit aux bords** — entrée hostile, état vide, réseau qui lâche, utilisateur pressé qui double-clique. C'est exactement ce qu'un vrai client fera.

## Les 4 états obligatoires (par écran)
Aucun écran n'est `PASS` sans avoir balayé ses **4 états** :
```
  LOADING ──▶ SUCCÈS
     │            
     ├──▶ VIDE (0 donnée : CTA d'amorçage ? message clair ?)
     │
     └──▶ ERREUR (message actionnable ? récupération possible ?)
```
| État | Ce qu'on force | Ce qu'on exige |
|---|---|---|
| **Loading** | Réseau lent (throttle Playwright) | Indicateur visible, pas d'écran figé/blanc, pas de double-soumission possible pendant. |
| **Vide** | Compte/liste sans donnée | Message clair + **CTA d'amorçage** (pas un écran mort). |
| **Erreur** | Entrée invalide, action refusée, 500 | Message **actionnable** (quoi faire), pas de stack trace brute, état récupérable. |
| **Succès** | Action nominale | Confirmation **visible et sans ambiguïté** (l'utilisateur sait que c'est fait). |

## Catalogue des cas limites (par famille)

### Entrées / formulaires
- [ ] **Vide** : champ requis laissé vide → message clair, pas de crash.
- [ ] **Trop long** : coller 10 000 caractères dans un champ → tronqué/refusé proprement.
- [ ] **Caractères spéciaux / unicode / emoji** : `’ " < > & \ /`, accents, RTL, emoji → pas de casse d'affichage, pas d'injection.
- [ ] **Hostile (injection)** : `<script>`, `'; DROP`, `{{7*7}}` → **échappé**, jamais exécuté/rendu (au moindre doute → `FAIL` + tag sécu, remonte au CTO via cascade).
- [ ] **Type inattendu** : lettres dans un champ nombre, date impossible (30 févr.), négatif là où interdit.
- [ ] **Limites numériques** : 0, valeur max, dépassement (montant énorme, quantité négative).
- [ ] **Espaces / casse** : email avec espaces, `USER@X.COM` vs `user@x.com` → normalisé.

### Interaction / timing
- [ ] **Double-clic** sur l'action finale (payer, soumettre, créer) → **une seule** exécution (idempotent).
- [ ] **Clics rapides répétés** / spam d'un bouton → pas d'état incohérent.
- [ ] **Soumission pendant loading** → bloquée ou mise en file, pas de doublon.
- [ ] **Retour navigateur** au milieu d'un flux à étapes → état cohérent, pas de donnée fantôme.
- [ ] **Refresh (F5)** au milieu d'une action → reprise propre ou message clair, pas de perte silencieuse.
- [ ] **Navigation directe par URL** vers une étape profonde sans passer par l'amont → redirigé ou géré, pas de page cassée.

### Session / auth
- [ ] **Session expirée** pendant un flux long → re-login propre, données du flux préservées ou message clair.
- [ ] **Déconnexion dans un autre onglet** → l'onglet courant réagit (pas d'action fantôme sous une session morte).
- [ ] **Accès non autorisé** : URL d'une ressource d'un autre utilisateur → **refusé** (au moindre doute → `FAIL` sécu, remonte).
- [ ] **Rôles/permissions** : un utilisateur sans droit voit-il/atteint-il une action premium/admin ?

### Réseau / infra
- [ ] **Offline** : couper le réseau pendant une action → message clair, pas de perte silencieuse, reprise au retour.
- [ ] **Lenteur / timeout** : réponse très lente → l'UI ne fige pas, timeout géré.
- [ ] **Erreur serveur (5xx)** : provoquer une 500 → message utilisateur propre (pas de page blanche/stack).
- [ ] **Requête qui échoue à mi-parcours** (webhook, job async) → l'UI ne ment pas (« prêt » alors que non).

### Données / volume
- [ ] **Zéro donnée** (déjà couvert : état vide).
- [ ] **Une seule donnée** (cas dégénéré des listes/paginations).
- [ ] **Gros volume** : 1 000+ éléments → pagination/virtualisation OK, pas de gel de page.
- [ ] **Données longues** : nom/titre très long → pas de débordement de layout, ellipsis propre.
- [ ] **Caractères exotiques dans les données affichées** → rendu correct partout où elles apparaissent.

### Responsive / accessibilité (côté utilisateur)
- [ ] **Mobile (375px)** : chaque parcours cœur jouable au doigt, CTA au-dessus de la ligne de flottaison.
- [ ] **Desktop large** : pas de contenu étiré/cassé.
- [ ] **Clavier seul** : parcours cœur atteignable au clavier (Tab/Entrée), focus visible.
- [ ] **Zoom 200%** : lisible, pas de contenu coupé.

> L'a11y fine (WCAG 2.1 AA) a déjà été validée au cran Designer (étape 13). Ici, le faux-client vérifie **le vécu utilisateur** de ces dimensions dans un vrai navigateur — un régression visible, pas un audit exhaustif.

### Paiement / argent (si applicable)
- [ ] **Mode test uniquement** (clés sandbox du provider — jamais de vraie carte, `safety-rails` §2/§4).
- [ ] **Carte refusée** → message clair, pas de charge, retour propre.
- [ ] **Double-charge** : double-clic sur payer → une seule charge.
- [ ] **Upgrade/downgrade** → features (dé)verrouillées immédiatement et correctement.
- [ ] **Webhook de confirmation** traité → premium débloqué (tester l'async, pas juste le clic).
- [ ] **KYC / vérification non simulable** → **repli honnête** (`safety-rails` §6) : stoppe, documente, n'invente pas un succès.

## Recette forcing-question — « ai-je assez balayé les bords ? »
- **Ask exact** : « Pour cet écran, ai-je testé les **4 états** ? Pour ce champ, ai-je testé **vide + hostile + trop long** ? »
- **Push-until** (critère d'arrêt) : ne conclus pas `PASS` tant que, pour chaque famille **applicable**, au moins un cas hostile a été joué **avec preuve**.
- **Red-flags** :
  - « Non applicable » sans raison → suspect ; justifie ou teste.
  - Un `<script>` rendu à l'écran ou une 500 crue affichée → **jamais `PASS`**, tag sécu, remonte.
  - « L'utilisateur ne fera jamais ça » → si, il le fera (double-clic, coller un roman, couper le wifi).

## Definition-of-done du balayage cas-limites (par feature/parcours)
- [ ] 4 états couverts sur chaque écran clé.
- [ ] Familles **entrées** + **interaction/timing** testées systématiquement.
- [ ] Familles **session**, **réseau**, **volume**, **paiement** testées **si applicables** (sinon : raison notée).
- [ ] Mobile 375 + clavier joués sur le parcours cœur.
- [ ] Tout cas limite qui casse → régression + retour dev (ou tag sécu → cascade CTO si sécurité).
- [ ] Preuve (screenshot/trace/console) pour chaque cas limite en échec.
