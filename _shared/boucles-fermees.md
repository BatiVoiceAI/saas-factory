# Doctrine — Boucles fermées (aucune action de valeur sans accusé de réception)

> **Le principe.** L'utilisateur du plugin est **non-tech** : il ne pensera pas à dire « envoie un email de confirmation à la personne qui réserve ». C'est à la machine de dériver ces évidences métier — comme le ferait le produit de référence du marché. **Une action de valeur qui ne ferme pas sa boucle est un bug de spec**, pas un raffinement. Constat fondateur {2026-07} : le booking coiffeur déployé confirmait la résa à l'écran mais n'envoyait **aucun email** à la cliente et ne notifiait **jamais** le gérant — infrastructure email présente, boucle jamais câblée, personne ne l'avait exigée.

## La règle de dérivation (à exécuter par workflow, étape 07)
Pour **chaque action de valeur** du workflow cœur (créer / modifier / annuler l'entité métier : résa, commande, dossier, invitation…), répondre à 5 questions — chaque « oui » devient une exigence du PRD :

| Question | Exigence typique |
|---|---|
| 1. **L'acteur** reçoit-il une trace durable ? | email de confirmation (+ page de confirmation ≠ suffisant : l'écran se ferme) |
| 2. **La contrepartie** est-elle informée ? | notification à l'autre partie (le gérant apprend la nouvelle résa ; la cliente apprend l'annulation par le salon) |
| 3. L'action est-elle **réversible/modifiable** par celui qui l'a faite ? | lien annuler/déplacer (token signé, sans compte si l'action s'est faite sans compte) |
| 4. Un **rappel** a-t-il du sens avant l'échéance ? | rappel J-1/H-2 (email, SMS si bloc activé) |
| 5. L'action laisse-t-elle une **trace consultable** ? | historique côté acteur ET côté contrepartie |

## Les canons — mêmes boucles, trois contextes (la règle n'est PAS spécifique au booking)
- **SaaS public** *(ex. booking)* : résa créée → **email client** (récap + **.ics** + lien annuler/déplacer) **et notification gérant** · annulation → email **à l'autre partie** · déplacement → confirmation aux deux · rappel J-1 · trace/historique des deux côtés. *Planity/Fresha les ont toutes : baseline, pas polish.*
- **Outil interne entreprise** *(ex. demande de congé, validation d'achat, ticket)* : demande soumise → **accusé au demandeur ET notification au valideur** · décision (approuvée/refusée) → **demandeur notifié avec le motif** · en attente > X jours → **relance au valideur** · **trace d'audit** consultable (qui, quoi, quand). Canal adapté (email pro et/ou notification in-app, webhook Slack si l'entreprise vit dans Slack) — **la boucle existe toujours**. Les workflows d'approbation et les handoffs entre collègues sont précisément là où une boucle muette fait le plus de dégâts.
- **Outil perso** *(ex. suivi, journal, tracker)* : chaque action → **trace/historique** toujours ; email/notification quand l'action a une **échéance** (rappel) ou une **contrepartie externe** (partage, export envoyé). C'est la **dérivation** qui le décide action par action — jamais une exemption de type.

## Câblage dans le pipeline
- **07 (spec)** : le PRD contient une section **« Boucles fermées »** — le tableau ci-dessus rempli pour chaque action de valeur. Une action sans boucle documentée = spec incomplète (porte).
- **12 (build)** : chaque boucle est une exigence testable de la feature (l'email part **dans la même transaction logique** que l'action — pattern : job en `notification_jobs` + envoi immédiat best-effort ; jamais « TODO plus tard »). La passe d'intégration vérifie : **zéro action de valeur muette**.
- **14 (QA faux-client)** : le faux client joue les DEUX rôles — il réserve **et vérifie qu'il reçoit** l'email (boîte de test type Resend sandbox) ; il incarne le gérant **et vérifie qu'il est notifié**. Une boucle silencieuse = défaut bloquant.
- **Types de produit — la dérivation est UNIVERSELLE.** Les 5 questions se posent pour **chaque action de valeur de chaque produit**, SaaS public, outil interne **ou** perso. Ce qui varie honnêtement selon le type : le **canal** (email client / email pro / notification in-app / webhook interne) et le **ton** — **jamais l'existence de la boucle**. Règles dures : (a) dès qu'une **contrepartie** existe (client↔gérant, demandeur↔valideur, invité↔propriétaire), les questions 1-2 ne sont **jamais** sautables ; (b) « pas de boucle » est une **réponse justifiée par action** (ex. action solo instantanée dont la trace à l'écran + l'historique suffisent) — jamais un défaut de type ; (c) outil interne ≠ dispense : c'est souvent là que les boucles comptent le plus.

## Garde-fous
- Emails de boucle = bloc `notifications` (Resend, `EMAIL_FROM` générique) — **distincts** de l'auth (OTP), même domaine d'envoi.
- Best-effort honnête : si l'envoi échoue, l'action métier **reste valide** ; l'échec est logué et réessayé (`notification_jobs`), jamais silencieux, jamais bloquant pour l'utilisateur final.
- Pas de sur-notification : une action = un email par destinataire, digest si volume.
