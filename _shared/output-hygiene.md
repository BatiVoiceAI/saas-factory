# Output Hygiene — artefacts propres (lu par tout skill/sous-agent qui écrit un fichier)

Un artefact généré (fichier livré, doc, page, config) est vu par l'utilisateur **tel quel**. Une balise parasite en fin de fichier s'affiche littéralement et casse le rendu.

## Règle
1. **Ne jamais clore un artefact par une pseudo-balise XML/outil.** Un fichier se termine par son dernier contenu utile, pas par une balise de fermeture technique.
2. **Écrire du markdown (ou le format cible) propre** — pas de résidu d'appel d'outil ni de wrapper.
3. **En cas de doute : une passe de nettoyage post-écriture.** Relire les dernières lignes du fichier écrit et retirer toute balise parasite avant de passer à la suite.

## Balises interdites en fin de fichier (liste non exhaustive)
Aucun artefact ne doit se terminer par une balise de fermeture d'appel d'outil, notamment :
- `</content>`
- une fermeture de type `invoke` (pseudo-balise d'appel d'outil)
- une fermeture de type `parameter` / `antml:parameter`
- une fermeture de type `antml:invoke`
- toute balise commençant par `</` qui n'appartient pas au format légitime du fichier

> Piège méta : ces séquences sont interprétées par le harness au moment de l'écriture — si tu dois les citer dans un livrable, neutralise-les (décris-les, ou coupe la séquence) au lieu de les écrire brutes.
