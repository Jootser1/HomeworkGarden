# Promenades par destination et chemin — 26 octobre 2026

## Demande et correction

Le parent a observé un mouvement cyclique : déplacement de 2,2 s, puis arrêt jusqu’au prochain tick de 2,8 s. Décision : **choisir une case de destination, calculer un chemin évitant les obstacles, parcourir ce chemin sans pause à chaque case**, puis faire occasionnellement une vraie pause.

Ce comportement remplace le moteur de pas aléatoires, pour les trois visiteurs locaux **et pour les créatures déjà collectées**. Les dessins, le catalogue et les récompenses ne changent pas.

## Fonctionnement

- Grille existante 22 × 18, déplacements cardinaux. Recherche en largeur (BFS) : plus court chemin en nombre de cases, adapté à cette petite grille à coûts uniformes. Pas de dépendance ajoutée.
- Destination autonome atteignable, à 4–10 pas de préférence. Une petite zone fermée peut proposer un trajet plus court. Éviter de repartir immédiatement vers la case précédente quand une autre option existe.
- Les terrestres contournent la mare, les obstacles fixes et les empreintes des décors posés ; les différences de hauteur et la rampe sont respectées. Les nageurs restent dans leurs terrains autorisés.
- Les volants peuvent survoler eau et décor, conformément à leur profil existant ; les limites de la carte et les terrains autorisés restent obligatoires.
- Chaque créature conserve son propre chemin, sa destination, son avancement et sa vitesse. Base de 22 unités projetées/s pour `slow`, 30 pour `medium`, variation individuelle de ±10 %.
- Boucle `requestAnimationFrame`, rafraîchissement de l’état de rendu à environ 30 Hz. Temps restant transmis au segment suivant : **aucun délai artificiel au passage d’une case**.
- Interpolation des coordonnées projetées des deux centres de cases, sans arrondi de terrain intermédiaire. La profondeur suit la position interpolée.
- À une destination : 20 % de chances de pause, de 1 à 4 secondes. Sinon, nouveau trajet immédiatement. Pas de décision aléatoire d’arrêt aux cases intermédiaires.
- Pause manuelle et mouvement réduit : maintien du point exact d’interpolation, puis reprise du trajet. Les longues suspensions et retours d’un onglet caché ne sont pas rattrapés en accéléré.

## Obstacles déplacés en cours de route

La scène est relue à ses événements de changement, pas depuis localStorage à chaque frame. Les chemins sont revalidés contre la scène courante :

- Un obstacle plus loin : terminer le segment légal en cours, puis recalculer depuis ce nœud vers la même destination si elle reste accessible.
- Le prochain centre de case devient bloqué pendant qu’on s’en approche : revenir **continûment** sur le segment déjà parcouru, jusqu’au dernier centre sûr, puis recalculer. Pas de téléportation.
- Destination inaccessible : en choisir une autre atteignable.
- Créature entièrement enfermée : attendre et réessayer sans boucle active de recherche infinie.

## Persistance et compatibilité

Les visiteurs restent en mémoire : aucune création de session, de cadeau ou de position sauvegardée.

Pour les créatures collectées :

- Enregistrer uniquement les centres de cases effectivement atteints, jamais les fractions à chaque frame.
- Fusionner ces positions dans l’état le plus récent, en préservant sessions, récompenses et décors.
- Vérifier l’ancien point et la légalité du pas avant écriture. Un déplacement externe ou un reset ne doit pas être écrasé par un trajet devenu obsolète.
- Une suppression des données arrête les résidents concernés sans les recréer.
- Un rechargement reprend au dernier centre enregistré ; le chemin et la fraction de trajet restent transitoires. Aucun changement de schéma ou migration.

## Implémentation

- `lib/garden/movement.ts` : accès aux obstacles, validation d’un pas, BFS et choix de destination.
- `lib/garden/journey.ts` : moteur temporel pur et testable, interpolation, pauses et recalcul.
- `components/useGardenNavigation.ts` : boucle RAF partagée, préférences système, scène courante et cycle de vie.
- `components/GardenVisitors.tsx` et `components/GardenResidents.tsx` : rendu des deux populations avec le même moteur. Dessins mémorisés pour ne pas redessiner tous leurs chemins SVG à chaque frame.
- `lib/storage/app-state.ts` : fusion protégée des arrivées.
- `app/garden/page.tsx` : suppression de l’intervalle global de 2,8 s, insertion des résidents navigants.
- `app/garden/visitors.css` : suppression des transitions de position concurrentes à l’interpolation.

Les dessins et les profils autorisés existants sont conservés. Les autres changements préexistants du dépôt sont préservés. Aucun commit, push, déploiement, appel IA payant ou changement de dépendance.

## Vérifications sur les sources finales

- `npm run lint` : réussi.
- `npx tsc --noEmit --incremental false` : réussi.
- `npm run build` : premier passage compilé puis arrêté par le rappel de vulnérabilité Next.js préexistant ; relance finale réussie **avec avertissement de sécurité**. La mise à niveau de Next.js reste recommandée avant exposition publique ; aucune mise à niveau effectuée.
- Tests ciblés navigation + visiteurs : **16 réussis**.
- `npx playwright test --reporter=line` : **79 tests réussis**, dont 11 nouveaux tests de navigation, les tests de visiteurs adaptés et les parcours hérités/PWA.
- `git -c core.autocrlf=false diff --check` : réussi.

Les tests couvrent : détours de longueur minimale, destinations inaccessibles, rampes, nage et survol, cibles distantes, transmission du temps entre cases, pauses uniquement à destination, obstacle ajouté plus loin ou sur le segment actif, continuité géométrique du retour, conservation des données, sauvegardes entières, reset sans résurrection, pause/reprise exacte, mouvement réduit et hors ligne.

Test navigateur de continuité, sans pause volontaire (aléatoire fixé) : 40 échantillons espacés d’environ 200 ms, cinq centres de cases parcourus, tous en déplacement. Différence de position minimale mesurée : environ 3,15 unités projetées entre échantillons ; aucune séquence d’arrêt de 600 ms. Mesures : `test-results/garden-navigation-live-*/continuous-movement.json` (temporaires).

## Limites

Chemins polygonaux continus sur la grille, pas encore courbes ou virages arrondis. Les collisions restent celles des cases et empreintes logiques : pas des contours SVG complets ni d’évitement des autres créatures mobiles. Le test de continuité démontre l’absence des arrêts cycliques, pas la validation artistique de tous les trajets. Testé sur Chromium profil Pixel 7 et captures grand écran, pas sur téléphone physique/Safari.

Référence consultée pour le cycle d’animation et le nettoyage React : https://react.dev/learn/reusing-logic-with-custom-hooks . La skill diagnose n’a pas pu être chargée (authentification `openai-codex` indisponible) ; investigation et revue effectuées directement.
