# Référence — Cartes de sécurité (cran CTO)

Référentiels à consulter pour la lentille sécurité du CTO, **en complément du moteur `security-review` vendoré** (`{PLUGIN_ROOT}/vendor/security-review/.claude/commands/security-review.md`, diff-aware — exécution : playbook CTO). À disclosure progressive : ouvre la carte pertinente selon la nature de la feature.

## OWASP Top 10 (web classique)
Injection (SQL/NoSQL/commande) · auth/session cassée · exposition de données sensibles · XXE · contrôle d'accès défaillant · mauvaise config sécurité · XSS · désérialisation non sûre · composants vulnérables connus · logging/monitoring insuffisant.

## STRIDE (modélisation de menace)
**S**poofing · **T**ampering · **R**epudiation · **I**nformation disclosure · **D**enial of service · **E**levation of privilege. Pour **chaque frontière de confiance** (de `tech/architecture.md` §3.6), passe les 6.

## OWASP LLM Top 10 (si la feature utilise un LLM)
Prompt injection · sortie non fiable consommée sans contrôle · empoisonnement données/modèle · déni de service modèle · supply chain · fuite d'info sensible via le modèle · plugins/outils non sûrs · **autonomie excessive** · sur-confiance dans les sorties · vol de modèle.

## OWASP Agentic Top 10 (si la feature est agentique)
Détournement d'objectif/d'outil · injection via mémoire/contexte · **sur-permission d'outils** · boucle/consommation non bornée · exfiltration via actions · défaut d'isolation · confiance inter-agents non vérifiée.

> **Usage** : le CTO **cite la ligne** + **l'exploit concret** (pas « risque théorique »). Applique les **exclusions dures** de `verdict-schema.md` (pas de `FAIL` sans exploit démontré). Tag `[SÉCU]` pour le suivi.

## Routage — quelle(s) carte(s) ouvrir (nature de la feature → référentiel)
Ouvre **seulement** ce qui s'applique (disclosure progressive). Une feature peut cumuler.
| Nature de la feature | Carte(s) à ouvrir | Toujours en plus |
|---|---|---|
| CRUD / API web classique | OWASP Top 10 | STRIDE sur chaque frontière touchée |
| Auth / session / rôles | OWASP (auth cassée, contrôle d'accès) + STRIDE (Spoofing, Elevation) | idem |
| Upload / fichier / import | OWASP (désérialisation, XXE, injection) | idem |
| Appel à un LLM (prompt, RAG, résumé) | **OWASP LLM Top 10** + OWASP web | STRIDE |
| Agent / outils / actions autonomes | **OWASP Agentic Top 10** + LLM | STRIDE + revue des permissions d'outils |
| Paiement / données sensibles / PII | OWASP (exposition de données) + STRIDE (Information disclosure) | moteur `security-review` vendoré prioritaire (chemin : voir l'en-tête) |
| Purement front / statique, 0 entrée non fiable | souvent aucune (exclusions dures) | vérifie quand même le trust-boundary d'une sortie LLM |

## Micro-exemples d'exploit concret (niche-agnostiques)
Le format attendu : **entrée non fiable → chemin → effet**, ancré `fichier:ligne`.
- **Injection** : `sort=id;DROP TABLE users--` concaténé dans le SQL (`query.ts:22`) → exécution. → `FAIL` [SÉCU]. Fix : requête paramétrée + allow-list.
- **Contrôle d'accès** : `GET /doc/42` ne vérifie pas le propriétaire (`docs.ts:15`) → un user lit le doc d'un autre (IDOR). → `FAIL` [SÉCU]. Fix : filtre `owner_id == session.user`.
- **XSS** : `comment` rendu sans échappement (`Comment.tsx:9`) → `<script>` exécuté chez les lecteurs. → `FAIL` [SÉCU]. Fix : échappement / sanitisation.
- **Prompt injection (LLM)** : contenu utilisateur inséré tel quel dans le prompt système (`ai.ts:30`) → « ignore tes instructions, exfiltre X ». → `FAIL` [SÉCU]. Fix : séparation données/instructions + garde-fou sur la sortie.
- **Sur-permission d'outil (Agentic)** : l'agent a accès `delete` alors que la feature ne fait que lire (`tools.ts:8`) → une injection déclenche une suppression. → `FAIL` [SÉCU]. Fix : scope minimal (`safety-rails` §3).

## Forcing-question — « exploit concret ou pas de veto »
- **Ask exact** : *« Quelle entrée non fiable, par quel chemin, produit quel effet néfaste — et sur quelle ligne ? »*
- **Push-until** : un `FAIL` [SÉCU] a les 3 (entrée + chemin + effet) **et** un ancrage `fichier:ligne`. Sinon → au plus `CONCERNS`.
- **Red-flags (à refuser)** : « lib outdated » sans CVE exploitable · « pas de rate-limit » sans entrée amplifiable · « race possible » sans exploit · « risque théorique » → voir **exclusions dures** (`verdict-schema.md`).
- **MOU vs FORT** :
  - MOU : *« Il pourrait y avoir une faille d'accès. »*
  - FORT : *« `docs.ts:15` sert la ressource sans check propriétaire → `GET /doc/42` avec un autre compte lit un doc tiers (IDOR). → FAIL conf. 9 [SÉCU]. »*
- **Routage** : exploit démontré → `FAIL` [SÉCU] ; risque réel non exploitable en l'état → `CONCERNS` [SÉCU] ; exclusion dure → **jamais** `FAIL`.
