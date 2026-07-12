# Lessons — les règles d'or de la méthode (lues par chaque sous-skill au démarrage)

Signature méthodologique, extraite de projets réels (bativoice en prod, speechtoflow shippé macOS+Windows, evalprof, Spendly) + du premier run SaaS Factory déployé de bout en bout (2026-07). À appliquer partout.

## Règles d'or
1. **Git dès J0.** Jamais de versionnement par copie de dossier.
2. **Valider le marché avant de builder.** La porte Go/No-Go est bloquante. Ne pas « construire en stealth sans un seul retour cible ».
3. **Time-box la spec.** Un walking skeleton tôt > une doc parfaite. Sur-planification = gel.
4. **1 feature = 1 worktree = 1 agent**, zones de code disjointes, communication asynchrone par fichiers.
5. **Le Verifier resynchronise la doc**, pas seulement les tests (éviter que la doc décroche du code quand les agents itèrent vite).
6. **Vérification adversariale** sur toute sortie d'agent : sources en tiers (1/2/3), score de confiance, verdict honnête. Jamais de fausse certitude.
7. **Éval-driven pour l'IA** : jeux de tests « gold », télémétrie par version de prompt.
8. **Un seul standard** de specs/plans datés. Pas de conventions ad hoc qui divergent.
9. **Kill explicite.** Un critère écrit déclenche l'archivage d'une piste morte + un post-mortem de 5 lignes.
10. **La venture = 5 briques** (Produit, Infra, Marketing, Stratégie, Intel), pas un simple repo de code.
11. **(2026-07) La complétude est une exigence de spec, pas un polish.** Un SaaS aux features correctes mais sans onboarding, sans profil ni empty states paraît creux à l'usage. Le socle « produit complet » (onboarding qui crée l'entité cœur, profil/settings, empty states, emails brandés, légal FR, 404, seed data) entre en Must au PRD (étape 7) — il ne se rattrape pas en fin de build.
12. **(2026-07) Le design par défaut du châssis = AI slop perçu.** Sans contraintes imposées AVANT génération, le rendu régresse vers la médiane (gradient indigo, Inter partout, hero centré). `design-doctrine.md` + ses recettes sont obligatoires sur chaque page, pas optionnelles.
13. **(2026-07) Auth passwordless (OTP / magic link) par défaut.** Moins de friction à la création de compte et email vérifié par construction. Le couple email + mot de passe n'est jamais le défaut d'un SaaS neuf.

## Anti-patterns documentés (à prévenir activement)
- **Sur-planification → abandon** : trop de docs avant la première ligne de code.
- **Validation marché tardive** : MVP construit avant tout retour client.
- **Dérive documentaire** : le code change (ex. provider LLM), la doc ne suit pas.
- **Parallélisme non maîtrisé** : bugs à la jonction des features → prévoir une passe d'intégration.

## Profil d'exécution à respecter
Biais pour l'action et la vitesse (fort atout). Failure mode = perfectionnisme menant à l'évitement. Donc : **plafonner la phase de cadrage, montrer du concret vite, décider aux portes, itérer.**
