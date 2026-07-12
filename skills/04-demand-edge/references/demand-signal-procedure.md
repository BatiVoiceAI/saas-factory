# BLOC 1 — Signal de demande · procédure exhaustive

Réf. de profondeur pour l'étape 4. Le SKILL.md donne l'aperçu ; **ici** la sous-procédure pas-à-pas, les matrices, les forcing-questions et les modes d'échec. Rappel du principe qui gouverne tout ce bloc : **signal par proxy → verdict humble.** L'IA ne fait pas d'interviews terrain. Les avis concurrents sont un **proxy Tier 3**. Conclusion possible : « demande *plausible* » — **jamais** « demande *prouvée* ». Toujours assorti de « à valider par toi ».

---

## 0. Data-flow du bloc

```
research/market.md ─┐
  (review-mining     │   ┌─ 1. Volume + notes ──┐
   étape 2, Wave 2)  ├──▶│  2. Douleurs partagées ├─▶ rubrique ──▶ verdict humble ──▶ vérif ──▶ bloc 1 de
research/raw/ ───────┘   │  3. Features réclamées │   déterministe   (plausiblement    adversariale  demand-signals.md
  (quotes brutes,        │  4. Signaux de churn ──┘   (§2)           fort/moyen/faible)  (§4 + réf.)
   dates, sources)       └── extraction ordonnée §1
```

Règle de lecture : on part **du volume** (le marché existe-t-il ?) et on descend **vers la douleur** (le problème est-il réel et partagé ?). Jamais l'inverse : un beau thème de douleur sur 4 avis n'est pas un signal.

---

## 1. Extraction ordonnée depuis `market.md` (+ `research/raw/`)

Fais les 4 passes **dans cet ordre**. Chaque passe a un critère de passage (« OK pour continuer si… »). Si une passe échoue son critère, tu ne l'inventes pas : tu notes le trou et tu le porteras au verdict.

### Passe 1 — Volume d'avis + notes moyennes
- **Quoi extraire** : nombre d'avis par concurrent (toutes plateformes confondues : stores, G2/Capterra, Trustpilot, Reddit, forums), puis agrégat ; note moyenne par concurrent + tendance si datée.
- **Comment lire** :
  - Volume **élevé** = marché actif, des gens paient déjà pour résoudre ce problème.
  - Volume **très faible** = deux hypothèses opposées → marché **immature** (personne n'a encore le réflexe d'acheter) **ou** faible **switching** (les gens restent, rien ne les pousse à écrire). **Dis laquelle** tu retiens, avec l'indice qui te fait pencher (ex. présence de discussions Reddit actives = plutôt immature ; silence total = plutôt niche minuscule). Ne devine pas en silence.
- **Bandes indicatives (« élevé » n'est jamais un feeling)** — retiens une bande selon le contexte marché et **écris la justification** de la bande retenue :

  | Contexte marché | Élevé | Moyen | Faible |
  |---|---|---|---|
  | Niche B2B FR (métier précis, 1 pays) | ≥100 avis <24 mois | 20-100 | <20 |
  | B2B international (catégorie établie) | ≥1 000 avis <24 mois | 200-1 000 | <200 |
  | B2C / prosumer large | ≥5 000 avis <24 mois | 500-5 000 | <500 |

  Règles : (1) on compte les avis **<24 mois** — le vieux stock ne dit rien de la demande actuelle ; (2) la bande retenue s'écrit dans `demand-signals.md` **avec sa justification** (ex. « bande niche B2B FR : cible = ~8 000 salons, 1 pays, 1 langue ») ; (3) contexte hors table → construis ta bande **par analogie** et justifie-la. Jamais un « volume élevé » nu.
- **Critère de passage** : chiffre agrégé + répartition sur les 2-3 concurrents principaux + **bande retenue avec justification écrite**. Sinon → trou de données déclaré.

### Passe 2 — Plaintes récurrentes (le cœur du signal)
- **Quoi extraire** : les *pain themes* qui reviennent chez **plusieurs** concurrents, chacun avec sa **sévérité**.
- **Échelle de sévérité (à appliquer strictement)** :

  | Niveau | Définition opérationnelle | Exemple générique |
  |---|---|---|
  | **Agacement** | Contourne-able ; l'utilisateur râle mais reste. | « L'export est lent. » |
  | **Bloquant** | Empêche une tâche clé ; workaround coûteux. | « Impossible de facturer en multi-devise, je le fais à la main. » |
  | **Rédhibitoire** | Cause documentée de départ / non-adoption. | « J'ai résilié : pas de conformité RGPD. » |

- **Test « partagé »** : un thème compte comme *partagé* s'il apparaît chez **≥2 concurrents distincts**. Une douleur partagée = problème **structurel** de la catégorie = vraie demande. Une douleur mono-concurrent = peut-être juste un mauvais produit, pas un besoin de marché (→ ça deviendra un *yellow flag*, cf. Passe côté edge).
- **Preuve obligatoire** : chaque thème retenu porte au moins **1 quote + source (avec URL) + date + statut de vérification** (verbatim vérifié ou `[snippet — non vérifié]`, selon le marqueur WebFetch de l'étape 2 — cf. `adversarial-verification.md` règle dure n°2). Pas de quote → le thème n'existe pas dans la sortie.
- **Critère de passage** : au moins les thèmes classés par sévérité et marqués partagé/isolé.

### Passe 3 — Features réclamées
- **Quoi extraire** : ce que les clients **demandent explicitement** et n'ont pas (« j'aimerais que… », « il manque… », « pourquoi pas de… »).
- **Pourquoi c'est le signal le plus direct** : une feature réclamée = une intention d'usage formulée, pas une déduction.
- **Comment scorer** : fréquence (combien d'avis distincts) + convergence (les mêmes demandes reviennent-elles ?). Convergence forte = demande nette.
- **Critère de passage** : liste + fréquence. Zéro feature réclamée sur un marché à fort volume est **en soi un signal** (produits déjà complets, peu d'espace) — note-le.

### Passe 4 — Signaux de churn
- **Quoi extraire** : les raisons **de départ** (« je suis passé à X parce que… », « annulé après 2 mois car… »).
- **Pourquoi ça vaut de l'or** : c'est le **seul comportement** observable par proxy (pas une opinion, une action). Un churn documenté et récurrent est le signal de demande le plus fort qu'un review-mining puisse produire.
- **Critère de passage** : chaque raison de churn portée par une preuve. Aucun churn observable → note-le, ça plafonne le verdict à « Moyen » au mieux (cf. rubrique).

---

## 2. Rubrique déterministe → verdict

**Source unique** de la rubrique (le SKILL.md n'en porte que les libellés + le renvoi ici). On l'applique **sans négocier** :

| Verdict | Conditions **toutes** requises |
|---|---|
| **Fort** | Volume élevé **ET** ≥1 douleur partagée *bloquante ou rédhibitoire* **ET** features réclamées convergentes **ET** churn documenté. |
| **Moyen** | Marché actif mais douleurs surtout « agacement », **OU** signaux réels mais concentrés sur **1 seul** concurrent. |
| **Faible** | Peu d'avis, pas de douleur partagée nette, peu/pas de features réclamées. |

### Matrice de départage (condition → verdict)

| Volume | Douleur partagée max | Features réclamées | Churn | → Verdict |
|---|---|---|---|---|
| Élevé | Rédhibitoire/bloquant | Convergentes | Documenté | **Fort** |
| Élevé | Bloquant | Éparses | Absent | **Moyen** (churn manquant plafonne) |
| Élevé | Agacement seul | Convergentes | Documenté | **Moyen** (pas de douleur assez sévère) |
| Moyen | Bloquant mais 1 concurrent | Oui | Oui | **Moyen** (signal isolé) |
| Faible | Aucune nette | Peu/aucune | — | **Faible** |
| Élevé | Rédhibitoire | Convergentes | Documenté **mais tous avis >18 mois** | **Moyen** + red flag « données périmées » |

**Garde-fou anti-optimisme** : au moindre doute entre deux crans, **descends** d'un cran. Le rôle CEO cherche la vérité, pas à rassurer. Un faux « Fort » envoie builder sur du vide.

### Formulation de sortie (imposée)
> « Demande **plausiblement** {forte / moyenne / faible} », suivie des preuves (quote + source + date), suivie de **« À valider par toi. »**

Interdits de vocabulaire : « demande prouvée », « le marché veut », « les utilisateurs ont besoin » (affirmatif sec). Autorisés : « plausible », « suggère », « indice de », « à confirmer par ».

---

## 3. Forcing-questions du bloc demande

Trois moments où tu dois te forcer à trancher plutôt que broder. Recette : **Ask exact / Push-until / Red-flags (réponses à refuser) / MOU-vs-FORT**.

### FQ-1 — « Est-ce une douleur ou juste une préférence ? »
- **Ask exact** : « Cette plainte empêche-t-elle une tâche, ou est-ce un inconfort qu'on contourne ? »
- **Push-until** : jusqu'à pouvoir la ranger dans agacement / bloquant / rédhibitoire avec une quote qui décrit un **effet concret** (temps perdu, argent, départ).
- **Red-flags (à refuser comme preuve)** : quotes vagues type « ce serait mieux si… », « pas ouf », « bof » sans conséquence décrite ; note d'étoile sans texte ; avis manifestement promo/faux.
- **MOU** : « Beaucoup d'utilisateurs semblent frustrés par l'UX. »
- **FORT** : « 3 concurrents, 11 avis datés <12 mois : "je perds 2 h/semaine à ressaisir les factures" — douleur *bloquante*, partagée. »

### FQ-2 — « Volume faible = immature ou mort ? »
- **Ask exact** : « Le faible volume vient-il d'un marché naissant ou d'un besoin qui n'existe pas ? »
- **Push-until** : jusqu'à un indice départageur (discussions actives ailleurs = naissant ; silence total + aucune recherche = mort).
- **Red-flags** : conclure « naissant donc opportunité » **sans** indice — c'est le biais du fondateur. Un marché « naissant » non prouvé se traite comme **Faible**.
- **MOU** : « Peu d'avis, sûrement un marché émergent à saisir tôt. »
- **FORT** : « 6 avis au total, mais un subreddit de 4 k membres avec 3 threads/mois qui décrivent le problème : plutôt *immature*, demande latente — à valider par interviews. »

### FQ-3 — « Ce signal tiendrait-il à un contre-interrogatoire ? »
- **Ask exact** : « Si un investisseur sceptique lisait mes preuves, où attaquerait-il ? »
- **Push-until** : jusqu'à avoir listé au moins un « ce qui infirmerait » par verdict (cf. `adversarial-verification.md`).
- **Red-flags** : un verdict « Fort » qui ne repose que sur **une** plateforme, **un** concurrent, ou des avis tous vieux.
- **MOU** : « Les preuves sont solides. »
- **FORT** : « Le point faible : 70 % des quotes viennent d'une seule plateforme (biais de recrutement). Je plafonne à Moyen tant que je n'ai pas croisé une 2e source. »

---

## 4. Vérification adversariale (obligatoire)

Détail complet dans `adversarial-verification.md`. En bref, ici : tag chaque source par **tier** (avis = Tier 3), écris **ce qui confirmerait** / **ce qui infirmerait**, déclare les **trous**. Un verdict « Fort » ne peut **pas** reposer sur une seule source Tier 3.

---

## 5. Definition-of-Done du bloc 1

- [ ] Volume agrégé **+** réparti par concurrent principal (ou trou déclaré).
- [ ] Volume qualifié via une **bande chiffrée** (contexte + justification écrite), pas au feeling.
- [ ] Interprétation du volume faible tranchée (immature vs. faible switching), avec l'indice.
- [ ] Douleurs classées par sévérité **et** marquées partagé (≥2 concurrents) / isolé.
- [ ] Chaque douleur retenue porte quote + source + date.
- [ ] Features réclamées listées avec fréquence (ou « aucune » assumé comme signal).
- [ ] Signaux de churn extraits (ou absence notée + effet sur le plafond de verdict).
- [ ] Verdict posé via la matrice §2, formulé « plausiblement {…} + À valider par toi ».
- [ ] Aucun mot interdit (« prouvée », « le marché veut »).
- [ ] Bloc vérif rempli (tiers, confirmerait/infirmerait, trous).

---

## 6. Catalogue de cas limites

| Cas | Traitement |
|---|---|
| **Un seul concurrent a des avis** | Pas de « partagé » possible → verdict plafonné **Moyen**, red flag « signal mono-source ». |
| **Avis massivement faux/promo** | Écarte-les ; si après nettoyage le volume s'effondre → **Faible** + note le nettoyage. |
| **Tous les avis > 18 mois** | Le signal peut être périmé → down-grade d'un cran + red flag « données datées ». |
| **Marché B2B sans avis publics** | Le review-mining rend peu ; bascule sur signaux GTM (Wave 3) et **assume le trou** ; verdict prudent. |
| **Douleur forte mais déjà résolue par un nouvel entrant** | La douleur n'est plus un espace ouvert → note-le, ça touche surtout l'edge (bloc 2), pas la demande. |
| **Langue/marché non couvert par le mining** | Déclare le trou géographique ; ne conclus pas au global depuis un seul pays. |
| **`market.md` incomplet / Wave 2 non faite** | **Ne fabrique pas** le signal. Stoppe, dis ce qui manque, renvoie à l'étape 2 (repli honnête). |

---

## 7. Modes d'échec (et parade)

| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Optimisme de fondateur** | Tout devient « Fort ». | Applique la matrice §2 sèchement + règle « au doute, descends d'un cran ». |
| **Douleur inventée** | Thème sans quote. | Règle : pas de quote → pas de thème. |
| **Interest ≠ demand** | « Ça a l'air demandé. » | Exige un comportement (churn, feature réclamée, argent), pas une opinion. |
| **Mono-source déguisée** | 20 quotes, 1 plateforme. | Tag tier + note biais de recrutement ; plafonne. |
| **Sur-affirmation** | « Le marché veut X. » | Reformule en « plausiblement » + « à valider par toi ». |
| **Faux plein** | Verdict rendu malgré `market.md` vide. | Repli honnête (§6, dernière ligne) : stoppe, renvoie à l'étape 2. |
