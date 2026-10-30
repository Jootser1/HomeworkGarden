# Catalogue 10 / 20 / 30 / 50

## État fonctionnel

Le parent a approuvé les quatre pilotes et demandé leur généralisation jusqu’au raccord complet. Le nouveau lot comprend **56 compositions inédites : 20 décors natifs 10, 20 décors natifs 20, 12 créatures natives 30 et 4 créatures exceptionnelles natives 50**. Les 13 compositions du premier lot ne sont pas recomptées dans ces 56. La cible historique 240 décors / 40 créatures n’est pas déclarée atteinte.

Les nouvelles sessions utilisent ce lot. Les anciennes conservent leur illustration et leur progression ; aucune collection, réservation ou préférence n’est réinitialisée. L’état Git et la publication doivent être vérifiés séparément : l’implémentation locale ne prouve pas à elle seule un déploiement.

## Règle et charge de travail

| Longueur proposée | Récompense | Nombre de compositions |
| --- | --- | --- |
| 10 bonnes réponses | Décor | 20 |
| 20 bonnes réponses | Décor plus riche | 20 |
| 30 bonnes réponses | Créature, rareté `rare` | 12 |
| 50 bonnes réponses | Créature exceptionnelle, rareté `wonder` | 4 |

Les nombres désignent **une session reprenable**, pas un cumul de points entre sessions. L’ancien cycle dix décors puis une créature n’intervient plus dans la sélection. `rewardSequence` est conservé comme métadonnée, sans rôle dans cette règle.

- Les quatre raccourcis du formulaire ne changent ni famille d’exercices ni difficulté.
- Les longueurs personnalisées restent possibles : 1–10 → natif 10 ; 11–20 → natif 20 ; 21–30 → natif 30 ; 31–50 → natif 50. Par exemple, 15 conserve quinze calculs et regroupe les vingt éléments d’un décor ; 40 conserve quarante calculs et regroupe les cinquante éléments d’une exceptionnelle.
- Aucun calcul supplémentaire n’est ajouté silencieusement. Chaque réponse révèle un ou plusieurs groupes **entiers** ; une erreur n’ajoute rien.
- Cinquante est un défi facultatif. Le défaut d’un nouveau profil reste dix, et l’adaptation ne rallonge jamais automatiquement une session.
- Les cinq familles indépendantes génèrent et conservent jusqu’à cinquante exercices. Les contraintes mathématiques et historiques par famille restent inchangées.

## Ressource publiée et provenance

**`lib/rewards/art/collection.v2.json` est la ressource éditoriale canonique du lot.** Le runtime importe et valide uniquement ce JSON. Il ne lit pas le laboratoire, ne reconstruit pas des modèles depuis des paramètres anatomiques, ne recolore pas les récompenses et n’appelle aucun service de génération pendant les devoirs.

Les sources de préparation sont dans `plans/design/reward-formats-lab/` : les quatre pilotes approuvés, `art-primitives.mjs`, `decors-small.mjs`, `decors-large.mjs`, `creatures.mjs`, `exceptionals.mjs` et `publish-catalogue.mjs`. Les formes des animaux et des architectures sont explicitement dessinées ; les objets botaniques communs réutilisent un vocabulaire de matériaux et de motifs, sans produire une identité par permutation.

La commande explicite `node plans/design/reward-formats-lab/publish-catalogue.mjs` sérialise une proposition éditoriale. **Elle n’est ni un script de build ni une source d’écrasement automatique du JSON.** Toute republication demande revue du diff, validation des vues et ajouts, et maintien des identités. Changer une vue ou une longueur ne crée pas une nouvelle composition.

Les captures et mesures sous `test-results/` sont des preuves jetables, pas des ressources embarquées. Le laboratoire frontal initial reste consultable hors ligne dans `index.html`.

## Créatures du lot

**30 :** Axolotl des nénuphars ; Pangolin des glands ; Scarabée de l’observatoire ; Crabe des coraux fleuris ; Chouette des camélias ; Limace des orchidées ; Hérisson des bourgeons ; Hippocampe de l’herbier ; Mante des verrières ; Chauve-souris des pavots ; Fennec des lanternes ; Cigale des vitraux.

**50 :** Tortue-archipel céleste ; Baleine des aérostats ; Cerf des jardins des saisons ; Phénix des quatre jardins. Leurs éléments construisent des dioramas distincts : îles habitées et cascades, station de voyage à trois ballons, quatre jardins dans une ramure, pavillons et jardins portés par un plumage déployé. Pas cinquante écailles ou points de remplissage.

## Lecteurs, vues et animation

- Les schémas version 1 restent strictement lisibles pour les décors 10/15/20/40 et les anciens rigs Pompon/Raie/Oiseau. Les snapshots ne sont pas convertis en version 2.
- Les nouvelles illustrations version 2 portent leur dessin, leurs groupes et leurs adaptations directionnelles dans la sauvegarde. Retirer ultérieurement une entrée du catalogue ne retire pas son lecteur.
- Chaque créature a une vue canonique, une adaptation de dos et des profils orientés à gauche/droite. Il s’agit de **vues vectorielles 2,5D adaptées**, avec masquage de groupes de la face éloignée, remplacement de formes de visage et symétrie des profils, pas de quatre peintures indépendantes ni d’un modèle 3D. Le sens natif des animaux de profil est pris en compte afin qu’ils regardent dans le bon sens.
- Les ailes, queues, branchies, nageoires ou tiges bougent via un petit ensemble d’animations CSS locales. Pendant les réponses, le cadeau incomplet reste au repos ; une fois complet il peut s’animer. Les préférences système de mouvement réduit désactivent ces animations. Les lecteurs n’acceptent pas de CSS fourni par une sauvegarde.
- Les nouveaux résidents utilisent la navigation continue existante, leurs habitats et des ancrages adaptés. Les exceptionnelles sont plus grandes, sans changer la grille ni ajouter un moteur externe.
- Les règles antérieures de collision et de navigation sont conservées : pas de collision complète entre silhouettes/ailes de créatures. Une foule peut visuellement se chevaucher ; le test à seize résidents est un test de coexistence, pas une promesse d’espacement automatique.

## Données structurées et réservation

Primitives limitées aux chemins, ellipses, cercles, rectangles, lignes et polylignes validés. Pas de SVG libre, HTML, script, lien externe, événement, masque ou découpage dans les nouveaux dessins. Couleurs, coordonnées, nombres de groupes/formes et identités sont bornés. Les variantes de dos/profil passent les mêmes validations que la vue canonique.

`selectCatalogReward` choisit la catégorie selon la longueur puis une composition disponible de ce format. Les identités déjà réservées, y compris celles de l’ancien lot, restent consommées. Un format épuisé donne une erreur explicite et les autres formats disponibles, sans mutation, recyclage ou retour au moteur historique.

La création conserve le verrou Web Locks de même origine et le journal durable `homework-garden-catalog-reward-v1:<compositionId>`. La limite de snapshot est étendue à cinquante, sans affaiblir la cohérence groupes/exercices. Le suffixe historique `v1` de la clé de stockage ne désigne pas la version du dessin : le journal contient des snapshots des deux versions. Les écritures périmées du jardin, quota plein et entrées corrompues gardent les mêmes protections.

La garantie de non-répétition est locale au navigateur et à l’origine. Pas de synchronisation entre appareils ; vider volontairement toutes les données efface aussi la collection. Ne pas conseiller de vider les données pour recevoir ce nouveau lot.

## Vérification et limites

Commandes du projet : `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build`, `npx playwright test --reporter=line`.

Couverture nouvelle et adaptée :

- Attribution directe 10/20/30/50, 56 IDs et compositions distincts, inventaire 20/20/12/4, épuisement et réservations en cours/rangées.
- **1 160 ajouts natifs** rendus à 150 px : aucun ajout vide ; contrôles de pixels et planche complète. Un score de pixels détecte une étape vide, il ne remplace pas l’appréciation artistique. Cinq ajouts initialement trop discrets ont été corrigés avant validation.
- Erreur sans révélation, groupe entier par bonne réponse, persistance et dessin final identique.
- Trente réponses réelles jusqu’à l’éveil d’une créature ; cinquante réponses réelles jusqu’à l’éveil d’une exceptionnelle, avec passage hors ligne et rechargement après vingt.
- Reprise réelle d’archives version 1 à quinze et quarante réponses, journal de leur progression et création d’un nouveau cadeau sans les modifier.
- Deux onglets, écriture périmée de l’agrégat, corruption et quota plein ; stockage simultané des 56 snapshots complets dans le journal et l’agrégat sans libérer de réservation.
- **64 vues** des seize créatures : géométrie bornée, mouvement réduit et pause. Seize résidents dans le vrai jardin, sans erreur navigateur. Captures mobile/bureau et planches examinées.

Validation finale de ce lot : **139 tests réussis**, lint, TypeScript sans émission et build production réussis. Les **1 160 ajouts** modifient au minimum **24 pixels à 150 px**. Les preuves et empreintes de contenu sont conservées séparément des ressources embarquées ; l’état Git/Vercel est vérifié au moment de la publication. Les tests sont exécutés avec Chromium/profil Pixel 7 et tailles bureau, pas sur un iPhone/Safari physique. La recette du parent dans son vrai jardin reste utile après publication ; aucune sauvegarde de production n’est créée pour la vérifier.
