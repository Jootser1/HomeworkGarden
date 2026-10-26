# Récompenses du catalogue — premier raccord local

## État livré

Les **nouvelles sessions** passent désormais par le catalogue de compositions, dans la vraie application. Ce n’est plus seulement un laboratoire graphique : attribution → exercices → révélation par groupes entiers → installation / éveil dans le jardin.

Le lot intégré comporte **10 décors originaux et 3 créatures**. Ce n’est **pas** le catalogue cible de 240 décors / 40 créatures, ni une acceptation artistique définitive de chaque nouvelle composition par le parent. Les illustrations restent à apprécier en usage réel. Aucun déploiement public, commit, push, changement de dépendance ou appel de génération payant n’a été effectué pour ce raccord.

| Format natif | Décors | Créatures |
| --- | --- | --- |
| 10 | Campanules des pierres, Pommier aux trois couronnes, Arches jumelles | Pompon fouisseur, Raie-pétale |
| 15 | Souche aux ombrelles, Lotus du miroir, Saule aux lanternes | Pas encore dans ce lot |
| 20 | Grotte des lucioles, Village des ombrelles | Pas encore dans ce lot |
| 40 | Arbre aux petites ombrelles, Cascade de cristal | Oiseau des aurores |

Un format ne bénéficie pas de recolorations de secours. Après trois réservations de décors au format 10, par exemple, ce format est épuisé pour ce lot : le parent peut choisir un autre format encore disponible. Après dix décors terminés, le prochain cadeau est une créature ; une créature déjà réservée par une session inachevée compte aussi pour ne pas en réserver deux au même palier. Les créatures 15 / 20 étapes sont encore à produire, pas silencieusement remplacées par le même oiseau regroupé autrement.

## Révélation et conservation

- Une réponse juste révèle un groupe complet. Une erreur n’ajoute rien.
- Les formats natifs 10 / 15 / 20 / 40 ont exactement autant de groupes, tous non vides. Les compositions longues sont des dessins distincts, pas les versions courtes découpées plus finement.
- Le formulaire garde sa compatibilité avec les longueurs personnalisées de 1 à 40 : 1–10 utilise un dessin natif 10, 11–15 un natif 15, 16–20 un natif 20, 21–40 un natif 40. Des groupes entiers sont regroupés, jamais tranchés ; changer la longueur ne crée pas une nouvelle identité.
- Les nouveaux décors n’utilisent aucun masque, `clipPath`, découpage en bande ou SVG libre. Le dessin final est le même dans l’exercice, la réserve et le jardin.
- Les créatures réutilisent **les mêmes composants dessinés et articulés** que les visiteurs, avec des groupes numérotés. Pompon et Raie : 10 ; Oiseau : 40. Les vues de profil / dos et le mouvement suivent ensuite l’orientation dans le jardin.
- Le décalage vertical de vol, propre au jardin, est désactivé dans le cadre de découverte. Le dessin entier tient sur téléphone, y compris la huppe et la queue de l’oiseau. Pas de secousse du cadeau entier à chaque bonne réponse pour les illustrations du catalogue.
- Les anciens cadeaux et sessions ne sont ni supprimés ni remplacés. Ils gardent leur dessin et leur ancien lecteur, y compris le balayage historique pour les anciens décors non convertis. Les galets déjà pris en charge gardent leur construction par éléments.

**Pour voir le nouveau parcours : créer une nouvelle session.** Reprendre une vieille session peut donc encore montrer son ancien mode de révélation, volontairement conservé.

## Identité et réservation

- `compositionId` stable par dessin / personnage ; aucune nouvelle identité pour une nouvelle palette, une session plus courte ou une autre vue.
- Sélection et réservation réalisées localement au démarrage, avant navigation vers les exercices. Les préférences historiques de génération IA ne sont plus utilisées dans ce parcours ; leurs valeurs sauvegardées sont conservées et les commandes correspondantes sont désactivées dans Réglages.
- Un verrou Web Locks de même origine sérialise la création dans plusieurs onglets. Sans cette capacité, la création est refusée plutôt que de prétendre garantir une réservation concurrente.
- `AppState.rewardHistory` garde les identifiants réservés, y compris cadeaux en cours et rangés. Les sessions sauvegardées sont aussi consultées pour reconstruire les identités déjà attribuées.
- Un journal par composition, sous `homework-garden-catalog-reward-v1:<compositionId>`, conserve le **snapshot complet de sa session** et sa progression. Cette écriture est le point de validation de la réservation. L’agrégat existant `homework-garden-state-v1` reste présent pour la compatibilité.
- À la lecture, les snapshots du journal priment sur leur copie dans l’agrégat. Une vieille sauvegarde de positions du jardin provenant d’un autre onglet ne peut donc pas effacer une nouvelle réservation ni réattribuer le même dessin. Les lectures répétées utilisent un cache du JSON validé, puis des copies indépendantes.
- Une session abandonnée reste réservée ; ranger un cadeau ne libère jamais sa composition. Il n’y a pas de remboursement automatique ni de recyclage à l’épuisement.
- Une sauvegarde corrompue bloque la création au lieu d’être remplacée par un état vide. Un quota plein lors de l’écriture de la réservation ne donne pas de cadeau non sauvegardé.
- `resetAppState()` enlève aussi ce journal. Supprimer seulement l’ancienne clé agrégée ne constitue plus une réinitialisation complète : le journal permet justement de récupérer les récompenses.

**Portée de la garantie : ce jardin local, pour cette origine et ces données de navigateur.** Pas de synchronisation entre appareils, entre `localhost` et `127.0.0.1`, ni entre ports. L’effacement volontaire de toutes les données du navigateur / du jardin supprime aussi l’historique. Ce travail n’introduit pas de moteur collaboratif d’édition simultanée du même exercice dans plusieurs onglets.

## Données publiées et sécurité

- `lib/rewards/art/decor.v1.json` : **ressource source de référence, à versionner**, contenant les dix compositions publiées et leur métadonnée de placement. Ce contenu éditorial préparé à l’avance n’est ni un cache ni une sortie de build. L’application le charge directement et n’importe pas ses dessins depuis les laboratoires. Toute future modification doit préserver les identités et archives existantes et repasser la validation artistique et technique.
- `plans/design/reward-catalog/author-decor.ts` : provenance et aide à la préparation des dessins, avec réemploi des deux illustrations vectorielles précédemment essayées. Ce fichier n’est **pas une seconde référence** et ne doit pas réécrire automatiquement le catalogue publié. Aucune génération à la création d’une session ou au build. Les captures et mesures de tests restent des artefacts de vérification, à ne pas confondre avec les ressources source du jeu.
- `lib/rewards/catalog.ts` : catalogue validé, sélection, cadence, formats encore disponibles et message d’épuisement.
- `lib/rewards/vector.ts` : validation restrictive des formes, couleurs, coordonnées, budgets, versions et plans de révélation. Pas de scripts, gestionnaires d’événements, URLs, images distantes, styles ou masques dans les dessins sauvegardés.
- `lib/rewards/create-session.ts` : réservation sous verrou et persistance du snapshot.
- `lib/storage/reward-journal.ts`, `lib/storage/app-state.ts` : journal, reprise et compatibilité de l’agrégat.
- `components/CatalogDecorView.tsx` : lecteur de primitives structurées, sans injection HTML / SVG brut.
- `components/CatalogCreatureView.tsx`, `components/GardenVisitorView.tsx` : groupes de découverte et dessins articulés propres aux trois personnages.
- `components/GardenResidents.tsx` : dimensions et ancrages des personnages gagnés, navigation continue commune aux résidents.

Les décors archivés sont autonomes : retirer une entrée du catalogue de sélection n’empêche pas de dessiner le snapshot déjà gagné. Pour les créatures, le moteur de dessin du rig `version: 1` doit rester disponible pour les archives ; une refonte de rendu devra conserver le lecteur de cette version. Ne pas attribuer deux identités à la même composition lors d’un prochain lot.

## Vérification finale

Sur les sources de ce raccord, après correction du cadrage mobile :

- `npm run lint` : réussi.
- `npx tsc --noEmit --incremental false` : réussi.
- `npm run build` : réussi, Next.js **16.4.3** observé dans l’environnement ; aucune dépendance modifiée par ce travail.
- `npx playwright test --reporter=line` : **122 tests réussis**, dont **18 nouveaux** pour ce raccord, sur Chromium profil Pixel 7 ; captures grand écran et test de cadrage à 412×839, 360×640 et 1280×1000.
- Les parcours historiques, les cinq familles d’exercices, les galets, la navigation, les visiteurs et les parcours PWA passent toujours.
- Nouveau parcours complet d’un décor : erreur sans révélation, dix réponses, reprise au milieu, placement clavier, comparaison du SVG final avec le SVG posé.
- Nouvelle créature après dix décors : dix réponses, éveil, comparaison du dessin frontal dans le dialogue du jardin avec celui des exercices.
- Oiseau : **40 réponses réellement soumises**, passage hors ligne et rechargement après vingt réponses, poursuite, éveil hors ligne, même dessin final. La fixture contient dix anciens décors identiques pour tester la conservation de l’historique : les répétitions visibles dans sa réserve ne sont pas de nouvelles attributions du catalogue.
- Créations simultanées dans deux onglets, sauvegarde de jardin périmée, épuisement explicite, ancien cadeau conservé, données corrompues et quota plein couverts.
- Les **255 ajouts natifs** des treize illustrations changent les pixels à 150 px de large, sans étape vide ; plus petit ajout mesuré : **25 pixels** (le bec de l’oiseau). Le test utilise un seuil de 12 et joint les mesures. Cela ne remplace pas l’appréciation humaine de la beauté et de la lisibilité.
- Quatre boucles rouge / vert observées : nouvelle attribution sans masque ; véritable créature révélable ; résistance à une sauvegarde périmée ; huppe initialement coupée sur mobile puis cadrage corrigé.

Limites : pas de recette sur Safari/iOS réel ou téléphone physique, pas de synchronisation distante et pas de validation artistique individuelle définitive du parent. Les vues directionnelles restent les premières adaptations 2D déjà présentes, pas quatre peintures isométriques finales.

## Essayer localement

[Créer une nouvelle session](http://localhost:3000/parent). Le serveur a été relancé sur la même origine, lié à `127.0.0.1:3000`, après vérification du processus précédent. PID actuel : **19064**. Aucun reset de collection. Pour une PWA déjà ouverte sur une ancienne version, accepter la proposition de mise à jour plutôt que d’effacer ses données.

Captures conservées sous `plans/design/reward-catalog/` : planche du lot, exercice à mi-parcours, décor réellement posé, oiseau après quarante réponses et dans le jardin. Les tests et mesures complets restent dans `test-results/` et sont régénérés à chaque passage.

## Suite prioritaire

1. Retour visuel du parent sur ce premier lot dans les exercices et le jardin.
2. Élargir réellement le catalogue, surtout les formats qui s’épuisent vite et les créatures 15 / 20 étapes ; ne pas réintroduire les anciennes recettes comme raccourci de quantité.
3. Continuer vers les objectifs de diversité 240 / 40 en conservant IDs, archives, validation de chaque étape, vues et animation.
4. Concevoir sauvegarde / export et identité partagée du jardin avant toute promesse d’unicité entre appareils.
