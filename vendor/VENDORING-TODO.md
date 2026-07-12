# Vendoring — backlog (passe réseau)

Ces skills tiers **compléteraient** la flotte, mais leur récupération demande un accès réseau
(git/GitHub) indisponible dans la session où le squelette a été bâti. À exécuter dans une session
**avec réseau**. Rien de bloquant : les references natives (densifiées) couvrent déjà le fond ;
ces vendors sont du **renfort** (moteurs reconnus), pas des dépendances dures.

> Déjà vendorés (ne pas refaire) : `startup-skill` (MIT), `security-review` (MIT),
> `accessibility-review` (Apache-2.0), `superpowers` (MIT). Voir `README.md`.

## Procédure de vendoring (à appliquer pour chaque entrée)
Discipline **non négociable** (cf. `README.md`) : uniquement **MIT / Apache-2.0**, on garde le
`LICENSE` d'origine **+** un `PROVENANCE.md` (repo, SHA, date, licence, fichiers copiés).

```bash
# 0. Vérifier la licence AVANT toute copie (refuser si ni MIT ni Apache-2.0).
gh api repos/<owner>/<repo>/license -q .license.spdx_id   # attendu: MIT | Apache-2.0

# 1. Récupérer à un SHA figé (pas "latest" — un point fixe reproductible).
SHA=$(gh api repos/<owner>/<repo>/commits/main -q .sha)
git clone --depth 1 https://github.com/<owner>/<repo> /tmp/_vend && \
  git -C /tmp/_vend fetch --depth 1 origin "$SHA" && git -C /tmp/_vend checkout "$SHA"

# 2. Copier UNIQUEMENT le sous-dossier du skill + le LICENSE racine.
DEST=plugin/saas-factory/vendor/<nom-local>
mkdir -p "$DEST" && cp -R /tmp/_vend/<chemin-skill>/. "$DEST"/ && cp /tmp/_vend/LICENSE "$DEST"/

# 3. Écrire PROVENANCE.md (repo, SHA=$SHA, date, licence, arbre des fichiers copiés).
# 4. Corriger les chemins internes si le skill référençait sa position d'origine.
# 5. Re-pointer le(s) skill(s) SaaS Factory concerné(s) vers vendor/<nom-local>/ (section "moteur").
```

## Candidats (par valeur décroissante)
| Skill à vendorer | Source probable (à vérifier) | Licence attendue | Renforce | Apport concret |
|---|---|---|---|---|
| **webapp-testing** | `anthropics/skills` → `skills/webapp-testing` | à vérifier | **14-qa** | recettes E2E Playwright (parcours cœur, sélecteurs, artefacts) |
| **synthesize-research** | Anthropic knowledge-work → `product-management` | à vérifier | 05-opportunity | structure de synthèse recherche → insights |
| **write-spec** | idem product-management | à vérifier | 07-product-spec | ossature PRD reconnue |
| **metrics-review** | idem product-management | à vérifier | 18-metrics | trame de bilan métriques (déjà inspirée, pas vendorée) |
| **seo-audit** | Anthropic knowledge-work → `marketing` | à vérifier | 16-seo | check-list audit SEO on-page |
| **content-creation** | idem marketing | à vérifier | 16-seo | gabarits de contenu (landing, pages piliers) |
| **comprehensive-review** | `wshobson/*` | MIT probable | 13-reviews | grille de revue multi-dimension |
| **kata-verify-work** | à localiser | à vérifier | 13/14 | protocole de vérification-avant-fin |

> ⚠️ Les chemins/owner exacts ci-dessus sont **indicatifs** — les confirmer via `gh search repos`
> / `gh api` au moment du fetch, ne pas les copier en aveugle.

## PAS des vendors de skills — des dépendances npm du **moat**
Ceux-ci ne se vendorent pas comme skills ; ils entrent dans le `package.json` du template
micro-SaaS (`_shared/blocks/`) :
- **`schema-dts`** (google/schema-dts, Apache-2.0) — types TS pour le JSON-LD schema.org (SEO, bloc `ui-shell`/pages).
- **`unlighthouse`** (MIT) — scan Lighthouse multi-pages en CI (bloc `observability`/`repo-ci`, budget perf de l'étape 17).
