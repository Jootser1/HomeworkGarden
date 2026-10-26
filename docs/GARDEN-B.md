# Jardin B — décors et petit monde illustré

## Fonctionnement implémenté

- Carte 22 × 18, contre 12 × 10 auparavant. Sol SVG continu, mare elliptique avec berges et rides animées, plateau de 64 unités de hauteur et rampe ; arbres, fleurs, plantes aquatiques et sous-bois dessinés localement, sans ressources externes.
- Grille logique invisible. Les positions sont des coordonnées de pieds d’objets. Chaque décor occupe une empreinte de 1 à 4 cases suivant son modèle ; altitude homogène, terrain, limites, décor de fond et occupation sont vérifiés avant écriture.
- Le jardin est végétalisé dès le départ. Les nouveaux cadeaux personnalisent ce paysage ; ils ne débloquent pas les besoins fondamentaux du jardin.
- Chaque nouvelle session crée un seul cadeau secret. Les bonnes réponses dévoilent le décor par portions ; les erreurs ne retirent rien. Le nom n’apparaît qu’à la résolution. Recette et progression sont enregistrées pour une reprise identique.
- Génération automatique : 1–40 calculs inchangée. La saisie manuelle existante n’est pas tronquée ; un décor manuel reprend le nombre réel de calculs.
- Après dix cadeaux décors terminés et récupérés, une session de créature est proposée. Une créature déjà réservée dans une session en cours ne peut pas être attribuée une seconde fois à partir du même seuil. Les anciennes sessions sans `rewardSequence` ne consomment pas le nouveau cycle. Le cadeau d’une session en cours ne change jamais.
- Une session terminée signifie ici : tous les calculs résolus puis action « Installer dans le jardin » ou baguette. Les cadeaux en réserve comptent ; il n’est pas nécessaire de les placer pour avancer dans le rythme.
- Pas de chrono, de loterie, de monnaie ou de récompense liée à la vitesse. Les réglages adaptatifs existants ne changent pas.

## Catalogue et dessin

`lib/garden/decor.ts` définit 24 modèles : six arbres, six compositions de champignons, six ensembles de pierres et six fleurs/plantes. Quatre palettes autorisées et une graine déterministe produisent des variations. Les 95 dernières combinaisons modèle/palette sont évitées, soit un catalogue roulant de 96 combinaisons avant répétition ; la graine fait varier les petits détails sans prétendre garantir une infinité de silhouettes.

`components/DecorView.tsx` est le moteur SVG partagé entre calculs, réserve et jardin. La découverte V1 est un masque spatial progressif avec front lumineux, pas une simulation botanique ni un assemblage indépendant animé de toutes les pièces. Les 1–40 étapes sont distinctes ; une session longue ne donne pas un objet plus gros. Une simulation de croissance plus élaborée reste un enrichissement visuel possible, non nécessaire au placement.

## Gestes et accessibilité

- Toucher le terrain pour poser le cadeau sélectionné.
- Appui long de 500 ms sur un décor posé, glissement puis relâchement pour le déplacer. Destination invalide ou annulation : ancienne position conservée.
- Un glissement avant l’appui long déplace la caméra, pas l’objet. Deux doigts servent au zoom ; un second doigt annule un déplacement d’objet en cours.
- Toucher un décor pour afficher les actions Déplacer/Ranger ; la réserve conserve tous les cadeaux non posés.
- Alternative clavier : sélectionner dans la réserve ou activer un objet avec Entrée, choisir Déplacer, puis flèches et Entrée dans le jardin. Échap annule. Boutons de zoom et de recentrage disponibles.
- Les créatures restent autonomes. Elles respectent les terrains, évitent les empreintes des décors et empruntent la rampe au lieu des falaises. Les objets et créatures sont ordonnés selon la position de leurs pieds pour la profondeur.
- Les animations du jardin sont neutralisées si le système demande des mouvements réduits.

## Persistance et compatibilité

Même clé `homework-garden-state-v1`. `creature` devient facultative pour les nouvelles sessions de décor ; `decor`, `rewardSequence` et `garden.decorPlacements` sont additionnels. Les anciennes créatures, sessions, exercices et clés de stockage restent en place. Les positions de créatures ne sont ajustées à l’ouverture que si leur nouveau terrain est incompatible. Aucun effacement ou migration destructive.

Le timer d’avancement des calculs reste annulé avant navigation et au démontage. Le déplacement périodique des créatures relit l’état courant avant sauvegarde pour ne pas écraser un décor récemment posé.

Les composants sont importés par la coquille `/offline` existante : nouvelles sessions, découverte, réserve, placement et reprise ne nécessitent pas le réseau après préparation du cache. L’IA n’est jamais appelée pendant les réponses ou le placement.

## IA facultative — limite explicite

Réglage distinct « Décors composés par IA », désactivé par défaut. L’IA fournit uniquement une recette `variant/palette/seed`, validée par Zod côté serveur et client. Aucun code, SVG libre, terrain, empreinte ou nombre d’étapes fourni par l’IA n’est accepté. Une combinaison récente répétée, une réponse invalide, une erreur ou un délai dépassé conserve la recette locale déjà prête.

**L’endpoint de décors est bloqué en production**, même si le réglage client est activé. En développement, il nécessite une activation serveur `GARDEN_DECOR_AI_ENABLED=true` et la configuration OpenAI existante ; aucun secret n’a été ajouté ou lu pour cette livraison. Origine vérifiée, six requêtes maximum par minute et une seule simultanée dans le processus, délai serveur de neuf secondes, aucune relance automatique.

Ce quota en mémoire est un garde-fou de développement, pas une protection distribuée. Avant toute activation publique : authentification parent, quotas persistants/distribués et contrôle des coûts. Aucun appel IA payant réel n’est nécessaire aux tests et aucun n’a été utilisé pour vérifier cette implémentation. L’ancien endpoint de créatures n’est pas modifié par ce travail.

## Vérification et limites

Dernier passage sur les sources finales : `npm run lint` réussi ; `npm run build` réussi (TypeScript inclus) ; `npm run test:pwa -- --reporter=line` : **51 tests réussis**, dont 28 tests de règles et 23 tests navigateur. `git diff --check` sans erreur de whitespace. La review a été manuelle, les skills locales étant indisponibles pour authentification.

Tests ajoutés dans `tests/garden-rules.spec.ts` et `tests/garden-browser.spec.ts`. Les anciens tests PWA/création sont adaptés pour la première récompense devenue un décor ; un test explicite conserve le parcours d’une ancienne créature.

Navigateur testé : Chromium, profil Pixel 7, serveur de production local, service worker autorisé ; captures mobile et grande fenêtre produites dans `test-results/` (non destinées à être committées). Ce n’est pas une validation Safari/iOS ou téléphone physique, ni une mesure de performances avec des centaines de décors. Le paysage est illustré 2,5D, pas un monde 3D à caméra libre. Les données restent propres à l’appareil et à l’origine.

Les documents locaux préexistants `docs/PRD.md`, `plans/roadmap.md` et `docs/knowledge/` sont préservés, sans réécriture silencieuse. Cette note décrit la nouvelle implémentation ; l’ancienne roadmap peut encore mentionner les invariants antérieurs. Aucun commit, push ou déploiement n’est inclus.
