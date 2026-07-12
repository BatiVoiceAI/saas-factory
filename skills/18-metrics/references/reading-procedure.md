# Référence — Procédure de lecture (étapes 1-2 + HARD GATE)

Comment **tirer** la donnée de PostHog puis de Sentry, dans le bon ordre, sans se faire piéger par un volume trop faible ou un tracking cassé. La lecture précède toute interprétation : ici on **collecte proprement**, on interprète en étape 3 (`gap-analysis.md`).

## Data-flow — de l'event brut au bilan

```
   [ Produit en prod ]
          │  émet des events
          ▼
   ┌──────────────┐        ┌──────────────┐
   │   PostHog    │        │    Sentry    │
   │ funnel/reten │        │ erreurs/santé│
   └──────┬───────┘        └──────┬───────┘
          │                       │
          ▼                       ▼
   [ GATE suffisance ]     [ santé lue en //]
          │ assez ?
     non ─┤──── oui
          │        │
          ▼        ▼
   bilan       lecture funnel → écart PRD/pricing (étape 3)
  "pré-signal"          │
   + attendre           ▼
                 1-3 pistes (étape 4) → metrics/review.md
```

## HARD GATE — suffisance des données (à passer AVANT toute lecture de funnel)

Un funnel sur un volume minuscule n'est pas un signal, c'est du bruit. **Vérifie d'abord le volume**, ensuite seulement lis les taux.

### Seuils (repères, pas dogme)
| Signal | Sous ce seuil = bruit | Lecture prudente | Lecture fiable |
|---|---|---|---|
| Nouveaux visiteurs (fenêtre analysée) | < 30 | 30-100 | > 100 |
| Nouveaux inscrits | < 15 | 15-50 | > 50 |
| Événements d'activation | < 10 | 10-30 | > 30 |
| Payants | < 5 | 5-20 | > 20 (sinon parler en absolu, pas en %) |

**Règle d'or** : sous le seuil « bruit », **n'exprime pas de pourcentage** — parle en valeurs absolues (« 3 des 8 inscrits ont activé »), et **ne bâtis aucune piste** sur ce ratio.

### Machine à états du GATE
```
        volume mesuré
             │
   ┌─────────┼─────────────┐
   ▼         ▼             ▼
 < bruit   prudent       fiable
   │         │             │
   ▼         ▼             ▼
bilan     lecture en    lecture
"pré-     absolu +      complète
signal"   flag "à       (taux OK)
   │      confirmer"
   ▼
recommander:
attendre trafic
OU pousser acquisition (retour Phase 5)
```

### Recette forcing — le GATE (à te poser à toi-même)
- **Ask exact** : « Combien de nouveaux utilisateurs distincts sur la fenêtre ? Assez pour qu'un taux veuille dire quelque chose ? »
- **Push-until** : un **nombre** est posé pour chaque marche (pas « quelques-uns »).
- **Red-flags (à refuser)** : exprimer « 33 % d'activation » quand n=3 ; comparer deux cohortes de 4 personnes ; tirer une tendance de 2 jours de data.
- **MOU** : « L'activation est autour de 30 %. » (sur 9 users) → **FORT** : « **[Data]** 3 des 9 premiers inscrits ont activé. Trop peu pour un taux — bilan pré-signal, on attend ~50 inscrits avant d'itérer. »

## Check « tracking vivant » (à faire même si le volume est bon)
Avant de conclure « personne n'active », élimine la cause n°1 de faux zéro : **le tracking ne remonte pas**.
- [ ] L'event d'activation **existe** dans PostHog et a été reçu **récemment** (au moins 1 fois depuis le deploy).
- [ ] Les events clés du funnel apparaissent dans le live-events / activity de PostHog.
- [ ] Sentry reçoit bien des events (au moins les sessions), sinon la « bonne santé » est peut-être un angle mort.
- [ ] Pas de rupture évidente post-deploy (un event qui s'arrête net à la date du dernier déploiement = régression de tracking, pas de comportement).

Un « 0 % d'activation » avec un tracking muet est un **bug de mesure**, pas un signal produit — dis-le et route le fix correctement : le tracking se **code en Phase 4** (12-build instrumente les `capture()`), puis se **re-déploie via l'étape 17**. Jamais « vers 17 » directement : 17 ship, il n'écrit pas de code.

## Étape 1 — lire PostHog (ordre imposé)
1. **Acquisition** : volume de nouveaux visiteurs + répartition par canal. Sert d'abord le GATE.
2. **Activation** : construis (ou lis) le funnel `signup → … → moment magique`. Note le **taux d'activation** et la **marche où ça chute le plus** (le plus gros levier).
3. **Rétention** : cohortes D1/D7/D30. Regarde la **pente** : plateau > 0 (noyau accroché) ou chute vers 0 (pas de fit).
4. **Revenu** : conversion free→payant, MRR, churn (croise avec Stripe si branché).
5. **Référence** : events d'invitation/partage — souvent ~0 tôt, c'est normal, ne pas sur-interpréter.

Pour chaque marche, **écris le chiffre + sa qualification** (faible/correct/fort via benchmarks `metrics-framework.md`) et **la source** (PostHog/Stripe/GSC).

## Étape 2 — lire Sentry (en parallèle, puis croiser)
1. **Taux d'erreur** global (par session) et tendance depuis le deploy.
2. **Top erreurs** par fréquence et par nombre d'utilisateurs touchés (privilégie « users touchés » à « occurrences »).
3. **Écrans/endpoints fragiles** : où les erreurs se concentrent-elles ?
4. **Croisement clé** : l'écran fragile est-il **sur le chemin d'activation** ? Une erreur silencieuse juste avant le moment magique explique souvent une chute de funnel — c'est un candidat piste n°1.

## Catalogue de cas limites (mode d'échec → conduite)
| Cas | Symptôme | Conduite |
|---|---|---|
| **Zéro data** | rien dans PostHog | check tracking vivant → si muet, tracking jamais câblé : **fix Phase 4 (12-build) puis re-deploy via 17** ; si vraiment 0 visiteur, problème d'acquisition (Phase 5), pas de métrique à lire |
| **Volume sous le bruit** | n très faible | bilan pré-signal, valeurs absolues, aucune piste sur les ratios |
| **Tracking cassé** | event s'arrête à la date d'un deploy | régression de tracking → **fix Phase 4 (12-build) puis re-deploy via 17** ; ne pas conclure au comportement |
| **Pic de bot / spam** | acquisition qui explose sans activation | isole/exclut le trafic non humain avant de lire les taux ; sinon tous les ratios sont faux |
| **Funnel incomplet** | une marche n'est pas trackée | dis-le explicitement (« marche X non mesurée »), n'infère pas la valeur manquante |
| **Stripe non branché** | pas de revenu mesurable | note « revenu non instrumenté » ; ne déduis pas la conversion des inscrits |
| **Fenêtre trop courte** | 1-2 jours post-deploy | élargis la fenêtre ou attends ; une tendance sur 48 h n'en est pas une |
| **Saisonnalité / weekend** | creux régulier | compare semaine à semaine, pas jour à jour |

## Definition of Done — lecture
- [ ] GATE de suffisance passé : un volume est posé pour chaque marche.
- [ ] Tracking vérifié vivant (pas de faux zéro).
- [ ] Chaque marche AARRR a un chiffre **+ source + qualification**.
- [ ] Santé Sentry lue, top erreurs par **users touchés**.
- [ ] Croisement fait : les erreurs sur le chemin d'activation sont repérées.
- [ ] Les trous de mesure sont **nommés**, pas comblés.
