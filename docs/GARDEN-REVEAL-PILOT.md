# Révélation par éléments — pilote galets de berge

## Problème reproduit

Le rendu initial `DecorView` utilisait un `clipPath` rectangulaire progressant de bas en haut. Il ne construisait pas le décor. Pour les galets, de nombreux intervalles traversaient des zones vides après que le dessin bas était déjà révélé. Le test antérieur de 40 réponses ne vérifiait que l’avancée du masque et la persistance ; il a été renommé et ne prétend plus garantir une évolution visuelle.

Le nouveau test ciblé a d’abord échoué sur l’ancienne implémentation : après la première bonne réponse, aucun élément indépendant n’existait dans le SVG.

## Premier lot livré — pas une généralisation annoncée

- Pilote : `pebbles`, quinze calculs. Composition dirigée de quinze objets entiers : cinq galets, trois mousses, deux fougères, trois fleurs, deux touffes d’herbe.
- Chaque étape ajoute un élément entier à une position choisie. Pas de masque, de balayage, de découpage en tranches, ni d’animation qui ferait bouger tout le cadeau.
- Recette de construction additionnelle `GardenDecor.buildPlan` : version et étapes contenant des éléments typés, avec position, taille, inclinaison et teinte. Le moteur dessine des formes autorisées ; il n’exécute aucun code ou SVG externe.
- `lib/garden/decor-build.ts` contient la composition locale et son schéma ; `components/DecorBuildView.tsx` dessine les objets. Le schéma est une base de contrat pour le futur compositeur IA, pas la preuve qu’un générateur IA a été raccordé.
- Les petits nombres de calculs regroupent les éléments. La structure du générateur est testée de 1 à 40 : groupes non vides, nombre d’étapes exact. Les compositions plus denses au-delà de quinze restent à examiner visuellement ; les tests de structure seuls ne garantissent pas leur qualité esthétique ou leur lisibilité.
- Le pilote est cadré de plus près dans les calculs, avec le repère original conservé dans le jardin. Les éléments affichés proviennent du même plan enregistré.
- Les nouveaux galets enregistrent ce plan à la création. Les anciens galets en cours reçoivent le même plan déterministe à la lecture, sans perte des réponses ou des étapes acquises ; il est sauvegardé à la prochaine persistance. Les cadeaux déjà terminés restent inchangés visuellement.
- Les autres familles conservent encore l’ancien rendu. Elles ne sont pas présentées comme corrigées par ce lot. L’endpoint IA n’a pas été modifié : la composition détaillée par IA vient après validation du pilote et des contraintes graphiques.

## Preuves

- `npm run lint` : réussi.
- `npm run build` : réussi, TypeScript compris ; réutilisé après les derniers changements limités aux tests.
- `npm run test:pwa -- --reporter=line` : **53 tests réussis** (29 règles, 24 navigateur) sur Chromium / profil Pixel 7.
- Le test `tests/pebbles-reveal.spec.ts` résout les quinze calculs, vérifie quinze ajouts, l’absence de `clipPath`, une reprise après huit réponses depuis un ancien cadeau sans plan, et produit une capture de chaque état.
- Comparaison des images stabilisées après chaque ajout (animations terminées) : plus de 35 pixels CSS changent avec un écart de couleur supérieur à 20 entre deux états successifs. Ce seuil détecte les étapes vides ; ce n’est pas à lui seul une mesure universelle du plaisir ou de la lisibilité.
- Planche générée par le moteur réel, examinée visuellement : `plans/design/galets-15-etapes.html` (artefact local facultatif, non versionné). Les liens optionnels vers les PNG de test dépendent du dossier temporaire `test-results/`.
- Les tests de placement, de reprise, de cycle des cadeaux, d’historique et de PWA restent verts. Pas de test Safari/iOS ou appareil physique, ni d’appel IA payant.

## Étape suivante

Faire valider les quinze états et leur lisibilité, puis adapter les compositions aux autres nombres de calculs et aux familles. Ne pas remplacer la validation visuelle par un simple compte de pièces. Ensuite seulement, élargir l’endpoint IA au plan détaillé, avec validation des étapes, des dimensions, des superpositions et de la visibilité. Les protections d’accès public restent nécessaires.

Aucun commit, push, effacement de données ou modification des documents utilisateur préexistants (PRD, roadmap, KB). `next-env.d.ts`, généré par Next.js, figurait modifié au début du travail puis n’apparaît plus dans le diff après le build de production ; aucun reset ou édition manuelle n’a été effectué sur ce fichier. Le build peut le régénérer.
