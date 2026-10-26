# Trois nouvelles créatures dans le vrai jardin — essai local

## Mise à jour — personnages désormais gagnables aussi

Le mode visiteur décrit ici reste disponible, sans récompense ni écriture de collection. Les **mêmes trois dessins** sont maintenant aussi raccordés aux vraies sessions comme récompenses du premier lot : Pompon et Raie en 10 groupes, Oiseau en 40. Les résidents gagnés utilisent leurs dimensions, ancrages, vues et navigation continue. Réservations, distinction avec les anciennes sessions et état du catalogue : `docs/REWARD-CATALOG-INTEGRATION.md` (122 tests réussis). Le catalogue cible 240 / 40 et la validation artistique finale ne sont pas terminés.

## Livré lors de l’essai initial

Intégration de **Pompon fouisseur**, **Raie-pétale** et **Oiseau des aurores** à la vraie route `/garden`, et non à une planche HTML séparée.

- Visiteurs temporaires, activés explicitement, sans création de session ou de cadeau.
- Disponibles dans l’interface sur `localhost`, `127.0.0.1` et `[::1]`. Cette restriction est un choix de présentation pour l’essai, pas un contrôle d’authentification.
- `/garden?visitors=1` les invite à l’ouverture, uniquement sur ces hôtes locaux. Sur `/garden` ordinaire, utiliser « Inviter les trois visiteurs ».
- « Retirer les visiteurs » les démonte ; aucune position de visiteur n’est enregistrée. Une nouvelle invitation les replace aux points de départ libres les plus proches.
- Les anciennes créatures et décorations continuent d’utiliser leurs données existantes.

## Mouvement et dessin

- Même projection et même moteur logique que les créatures collectées. Désormais : destination atteignable, chemin BFS, déplacement continu entre cases et pauses occasionnelles à destination. Voir `docs/GARDEN-NAVIGATION.md` pour la correction des arrêts cycliques.
- Pompon : terre ferme, obstacles fixes, empreintes des décors posés et passages de hauteur autorisés. Petits bonds en déplacement, respiration, mains et clignement au repos.
- Raie : survol autorisé de la mare et des décors, ondulation indépendante des ailes, de la queue et du corps.
- Oiseau : deux ailes articulées, plumage propre au concept, queue et aigrettes animées ; survol autorisé comme la raie.
- Les positions sont bornées à la carte. Les obstacles suivent les changements de scène et les routes sont revalidées ; un décor déplacé provoque un recalcul sans téléportation. Aucune réécriture du stockage par les visiteurs.
- Profondeur par point d’ancrage, même convention que le jardin existant. Une empreinte de déplacement est une cellule logique ; ce n’est pas une simulation de collisions géométriques des ailes ou de tout le volume du personnage.
- Quatre orientations : face, dos, deux profils. Les profils sont une paire miroir, avec anatomie de profil distincte de la face et visage absent au dos. C’est une première adaptation 2D, pas quatre illustrations isométriques finales ou un modèle 3D.
- SVG écrit en composants React, sans injection de SVG brut, script généré ou dépendance ajoutée.

## Examiner les visiteurs

- Pause / reprise de leur promenade.
- Boutons Face / Droite / Dos / Gauche : arrêt et orientation des trois visiteurs.
- Toucher ou activer au clavier un visiteur : dialogue natif avec quatre vues.
- Échap / fermeture : retour du focus au visiteur.
- `prefers-reduced-motion` : animations désactivées et positions logiques figées, pour les visiteurs et désormais aussi les déplacements automatiques des créatures existantes. Changer cette préférence est pris en compte par les visiteurs.

La pause des visiteurs n’arrête pas les créatures déjà collectées. Elle conserve désormais le point exact d’interpolation, sans terminer brusquement le segment ; la reprise continue le trajet.

## Fichiers de cette intégration

- `app/garden/page.tsx` : activation locale, commandes, insertion dans la vraie scène.
- `app/garden/visitors.css` : animations segmentées et interface.
- `components/GardenVisitorView.tsx` : les trois dessins et leurs vues.
- `components/GardenVisitors.tsx` : positions temporaires, profondeur et interactions.
- `components/GardenResidents.tsx`, `components/useGardenNavigation.ts`, `lib/garden/journey.ts` : navigation continue commune aux visiteurs et résidents, boucle RAF nettoyée au retrait.
- `components/GardenVisitorInspector.tsx` : dialogue et focus.
- `lib/creatures/garden-visitors.ts` : définitions et départs valides.
- `lib/garden/movement.ts` : déplacement logique partagé et lecture des obstacles.
- `tests/garden-visitors.spec.ts` : cinq tests ajoutés.

Les autres changements présents avant ce travail ont été préservés. Aucun effacement, reset, migration, changement de dépendance, commit, push ou déploiement public.

## Vérification de l’intégration initiale

Mise à jour navigation : **79 tests réussis**, lint et build réussis (avertissement de sécurité toujours présent). Le détail et les 11 nouveaux tests figurent dans `docs/GARDEN-NAVIGATION.md`. Les résultats initiaux ci-dessous sont conservés comme historique.

- `npm run lint` : réussi.
- `npm run build` : réussi lors du dernier passage, **avec avertissement de sécurité Next.js**. Plusieurs passages précédents ont été interrompus après compilation/TypeScript par `SecurityFatalError` concernant la version Next.js 16.4.0. La relance finale a continué après le rappel, avec code de sortie 0. Cela ne corrige pas la vulnérabilité : mise à niveau de sécurité recommandée avant exposition publique. Aucune installation ou modification de dépendances effectuée.
- `npx playwright test --reporter=line` : **68 tests réussis**, dont cinq nouveaux tests, sur Chromium profil Pixel 7 et captures grand écran. Contrôles : marcheurs sur toutes les cellules terrestres pertinentes, carte/eau pour les volants, obstacles, activation/retrait, collection et historique d’identifiants conservés à l’octet sur une fixture existante valide, mouvement réel, animation d’aile, orientations, pause, dialogue clavier/retour du focus, préférence de mouvement réduit et accès hors ligne.
- Le test de conservation fige les résidents existants avec la préférence de mouvement réduit ; leur déplacement ordinaire reste naturellement enregistré par le système préexistant.
- Les tests n’effectuent aucun appel API payant. Les 63 autres tests, dont les parcours hérités, décors, PWA et laboratoires graphiques, passent aussi.
- `git -c core.autocrlf=false diff --check` : réussi.
- Revue manuelle et captures examinées. Les skills locales implementation-plan, frontend-design et code-review étaient indisponibles pour authentification `openai-codex` ; aucune revue déléguée prétendue.

Référence React consultée pour les intervalles, mises à jour fonctionnelles et nettoyage : https://react.dev/reference/react/useEffect . Le code utilise les hooks existants, sans nouvelle bibliothèque.

## Voir le résultat

Application locale : `http://localhost:3000/garden?visitors=1`.

Lancement reproductible après compilation :

```sh
npm run start -- --hostname 127.0.0.1 --port 3000
```

L’essai est volontairement lié à la boucle locale, pas au réseau local ou à Internet. Le processus local a été relancé après le dernier build du raccord aux récompenses : PID **19064**, port 3000, après vérification du processus précédent. Journal temporaire : `%TEMP%/homework-garden-visitors-3000.log`. Les données restent propres à l’origine du navigateur ; ce lancement ne copie pas une collection d’un autre domaine ou port.

Captures conservées localement (artefacts facultatifs, non versionnés) :

- `plans/design/creature-lab/jardin-visiteurs.png`
- `plans/design/creature-lab/aurores-quatre-vues.png`

Les captures mobile, autres vues et traces sont dans `test-results/` (temporaires).

## Reste à faire

Validation visuelle finale par le parent des déplacements, tailles, étapes et vues ; vues isométriques plus travaillées si nécessaire ; extension du catalogue jusqu’aux 240 décors / 40 créatures. Le premier raccord de ces trois personnages aux récompenses et la réservation locale durable sont livrés ; ils ne constituent pas une validation artistique définitive ni une synchronisation d’identité entre appareils.
