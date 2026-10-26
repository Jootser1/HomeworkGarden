# Expérience : objets vectoriels composés par l’IA

## Ouvrir

Ouvrir `plans/design/vector-lab/index.html` directement dans un navigateur. Aucun serveur, installation, accès réseau ou clé nécessaire. Le lecteur contient les trois dessins ; `reader.js` est chargé depuis le même dossier. Ne pas déplacer seulement le fichier HTML.

- Choisir 5, 15 ou 40 étapes.
- Avancer une étape à la fois, utiliser le curseur, ou voir l’objet terminé.
- Comparer à 150, 240 et 360 px de largeur. À petite taille, vérifier les ajouts sans se fier à leur nom.
- Les planches PNG de toutes les étapes sont accessibles en bas de page et dans ce dossier.
- Un import JSON permet de tester d’autres dessins sans modifier le lecteur.

## Ce qui a réellement été fait

L’assistant IA a généré les données vectorielles de trois dessins pendant cette session :

| Source | Composition | Groupes | Formes |
| --- | --- | ---: | ---: |
| `arbre-5.json` | Petit arbre éventail fleuri | 5 | 16 |
| `souche-15.json` | Souche, champignons, mousse et végétation enracinée | 15 | 40 |
| `arbre-40.json` | Arbre ramifié, feuillage, fleurs, fruits, mousse et champignons | 40 | 65 |

Aucun appel au service IA de l’application ni à un modèle d’image. Les dessins ne sont pas des sorties brutes d’une API automatisée : ils ont été conçus par l’assistant dans le contexte de cette conversation et du développement du prototype. Cette provenance est également affichée dans le lecteur.

**Ce n’est pas une mesure du taux de réussite d’une génération à la demande**, ni une preuve de transfert à dix nouveaux sujets. Deux dessins sont des arbres ; ce n’est pas un essai sur trois familles indépendantes. Le format peut accueillir d’autres dessins, mais leur qualité reste à tester.

## Pas de moteur d’assemblage

Chaque groupe contient des formes graphiques complètes avec leurs coordonnées finales. Les raccords sont dans le dessin. Le lecteur affiche les groupes 1 à k dans leur ordre de peinture, et ne connaît aucune notion de souche, branche, champignon, support ou point d’attache. Aucun masque de balayage et aucune animation ne peuvent dissimuler une étape vide.

Les groupes restent au même endroit à toutes les étapes. L’objet terminé est la composition de tous les groupes. Ce prototype n’utilise pas de catalogue de pièces sémantiques préfabriquées.

`PROMPT.md` décrit le contrat du lecteur et une consigne réutilisable pour une future génération. Elle n’est pas présentée comme la trace d’un appel qui n’a pas eu lieu.

## Contrôles et limites

Le lecteur valide une liste blanche de données : formes path/circle/ellipse/rect/line/polyline, attributs graphiques autorisés, palette, taille des documents, nombre de groupes, identifiants uniques, dimensions numériques bornées, longueur des chemins. Le JSON est transformé en nœuds SVG avec `createElementNS` et `setAttribute` après validation ; il n’est jamais exécuté ni injecté comme HTML/SVG libre.

Sont notamment refusés : script, foreignObject, image, href, événements, style, filtres, masques et références externes. Les textes de métadonnées passent par `textContent` ou des attributs, pas par du HTML.

**Ce validateur expérimental n’est pas un pipeline de production** : il ne certifie ni la syntaxe complète des chemins SVG, ni la géométrie de tous les chemins importés, ni le contenu représenté. Les bornes visuelles des groupes des trois échantillons sont vérifiées par les tests navigateur. Les raccords, le style, la perspective et l’intérêt des ajouts demandent une évaluation visuelle. Un chemin valide peut être caché ou artistiquement médiocre.

## Résultat observé

- Les trois dessins se lisent avec le même lecteur et sans logique par type d’objet.
- Les 60 étapes produisent des changements mesurables à 150 px de largeur.
- Les planches montrent des ensembles raccordés plutôt que des objets dispersés.
- Le format 5 étapes donne de gros ajouts ; à 40 étapes, certaines additions restent modestes, notamment le rameau du sommet et de petites feuilles.
- Le style est une illustration vectorielle simplifiée. La correspondance exacte au relief 2.5D du jardin n’est pas validée.
- Ces constats ne suffisent pas à accepter la qualité artistique ni la génération automatique.

### Mesures sur Chromium, profil Pixel 7

Chaque état réel est capturé sans animation. Une différence de pixel est comptée si au moins un canal RGB change de plus de 20/255. Le compte est ramené à des pixels CSS via le ratio de l’écran émulé. Seul le dessin est comparé, pas le compteur ou les textes de l’interface.

| Dessin | Plus petit changement approximatif à 150 px |
| --- | ---: |
| 5 groupes | 718,5 pixels CSS |
| 15 groupes | 92,7 pixels CSS |
| 40 groupes | 61,0 pixels CSS |

Un seuil de pixels n’est pas une preuve d’ajout intéressant. Les tests n’affirment pas que les supports et raccords sont sémantiquement corrects.

## Vérification exécutée

- `npm run lint` : réussi.
- `npm run build` : réussi.
- `npx playwright test --reporter=line` : **57 tests réussis**, dont quatre nouveaux tests du laboratoire.
- Nouveaux contrôles : nombre de groupes, absence de masque, bornes des groupes, progression visuelle des 60 étapes à 150 px, refus des attributs/formes dangereux et affichage des métadonnées sans interprétation HTML.
- `git -c core.autocrlf=false diff --check` : réussi.

`tests/vector-lab.spec.ts` ouvre le lecteur en fichier local. Les captures et métriques détaillées sont dans les sous-dossiers `test-results/vector-lab-*`. Les trois planches sont recopiées ici pour les conserver hors des résultats temporaires.

## Périmètre inchangé

Aucune modification de l’application, du stockage, des cadeaux, du placement, de la PWA, du point d’entrée IA ou de sa configuration dans cette expérience. Les autres familles du jeu restent donc dans leur état précédent, dont les anciens masques de révélation. Aucune activation de génération publique, aucun commit ou push.

Les fichiers préexistants `docs/PRD.md`, `plans/roadmap.md` et `docs/knowledge/` n’ont pas été modifiés par cette expérience.

## Suite à décider après examen visuel

Si le résultat convient : tester une campagne **automatisée**, avec une consigne figée et des sujets nouveaux, en conservant les échecs, les demandes de correction, la latence et les coûts. Inclure plusieurs essais du même sujet et plusieurs nombres d’étapes : un échantillon réussi ne mesure pas la fiabilité.

Ensuite seulement : intégrer le format versionné dans le jeu, vérifier la recette exacte par rapport au nombre d’exercices, borner les coûts et les tentatives, conserver les protections de génération et un cadeau local de secours. L’accès de production reste fermé tant que les conditions existantes d’authentification parent et de quotas ne sont pas réunies.
