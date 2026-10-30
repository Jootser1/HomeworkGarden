# Catalogue de récompenses — décisions du 26 octobre 2026

## Statut et périmètre

Document de référence des décisions prises avec le parent dans la conversation du 26 octobre 2026. Le premier lot de 10 décors et 3 créatures a été publié par `9e4e28b`. Le lot suivant de **56 nouvelles compositions 10/20/30/50 est raccordé dans le code** : contrat, réservations, validation et limites dans `REWARD-CATALOG-V2.md`. L’état d’une publication Git/Vercel se vérifie séparément ; ce n’est pas encore le catalogue cible complet 240 / 40. Les essais ci-dessous conservent leur contexte historique.

## Nouvelle décision après usage — 10 / 20 / 30 / 50

Le parent confirme que la longueur d’une session détermine directement le cadeau : **10 et 20 bonnes réponses → décor ; 30 → créature ; 50 → créature exceptionnelle**. La session peut être interrompue puis reprise ; ce ne sont pas des points cumulés entre sessions. Cette règle remplace la cadence dix décors puis une créature pour les nouvelles attributions, sans modifier les anciennes récompenses ni effacer leurs réservations.

Volume approuvé et réalisé dans le code : **20 décors à 10 + 20 décors à 20 + 12 créatures à 30 + 4 exceptionnelles à 50 = 56 nouvelles compositions**. Les quatre pilotes ont été approuvés avant les 52 dessins suivants. Le lot comprend 1 160 ajouts natifs et utilise `lib/rewards/art/collection.v2.json`, ressource éditoriale canonique préparée avant les devoirs. Plan et état exact : `plans/rewards-10-20-30-50.md`.

Les formats 15/40 restent lisibles dans les archives ; ils ne sont plus la cible des nouvelles compositions. Le sélecteur des nouvelles sessions utilise la règle par longueur, sans modifier les anciens cadeaux ; une mise en production n’est déclarée qu’après vérification de son SHA et de son statut. Les décisions antérieures ci-dessous sont conservées pour leur historique, pas comme politique d’attribution à réimplémenter.

## Historique — boucle du premier lot

- Formats initialement retenus : **10 / 15 / 20 / 40 calculs**, soit exactement autant de groupes de révélation. L’option 50 avait alors été abandonnée.
- Chaque bonne réponse ajoute quelque chose de visible et intéressant. Pas de balayage « imprimante », de masque spatial ou d’étape vide.
- Le cadeau est une composition cohérente : supports avant éléments portés, positions définitives, pas d’objets arbitrairement dispersés.
- Une session longue produit un cadeau plus impressionnant : silhouette, composition et richesse. Pas seulement le même dessin découpé plus finement, ni des détails insignifiants pour atteindre le compte.
- Les petits cadeaux restent désirables. Pas de hiérarchie de valeur affective entre les créatures.
- Rythme retenu : dix décors récupérés, puis une créature. Le jardin est déjà habitable au départ.
- Production **à l’avance** assistée par IA, validation avant publication, puis sélection dans le catalogue. Pas de génération payante pendant que l’enfant attend.

## Objectif : 240 décors originaux

| Famille | 10 étapes | 15 étapes | 20 étapes | 40 étapes | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Arbres et arbustes | 20 | 15 | 15 | 10 | 60 |
| Fleurs et plantes | 20 | 15 | 15 | 10 | 60 |
| Champignons, souches et bois | 20 | 15 | 15 | 10 | 60 |
| Rochers, cristaux et berges | 20 | 15 | 15 | 10 | 60 |
| **Total** | **80** | **60** | **60** | **40** | **240** |

Chaque entrée est une composition distincte, pas une simple recoloration. Le laboratoire vectoriel précédent a déjà été jugé concluant par le parent ; ne pas conditionner à nouveau le principe à un pilote identique. Les futurs objets restent à contrôler individuellement.

## Objectif : 40 créatures réellement distinctes

| Format | Nombre |
| --- | ---: |
| 10 étapes | 12 |
| 15 étapes | 10 |
| 20 étapes | 10 |
| 40 étapes | 8 |
| **Total** | **40** |

### Exigence de diversité

Le catalogue procédural existant est jugé trop répétitif : recombiner les mêmes corps, oreilles et ailes n’est pas suffisant. Les 40 nouvelles créatures doivent être conçues chacune comme un tout original.

- Cohérence de monde : douceur, lumière, perspective et langage graphique communs.
- Diversité de silhouettes, proportions, anatomies, matières, visages et mouvements.
- Une planche en silhouettes noires doit permettre de distinguer les personnages sans couleurs, noms ou petits accessoires. Ce contrôle nécessite un avis humain : un test informatique de différence ne prouve pas la qualité de la diversité.
- Les profils terrestres, sauteurs, volants, aquatiques et amphibies sont des comportements, pas des gabarits à recolorer.
- Chaque format accueille des personnages originaux. Une créature de 40 étapes ne doit pas être une créature de 10 simplement couverte d’accessoires.
- Les 100 créatures locales actuelles ne comptent pas automatiquement parmi les 40 nouvelles. Aucun effacement de la collection existante n’est autorisé par ce document.

### Livrables nécessaires pour chaque créature de production

1. Illustration de découverte dans le nombre exact de groupes.
2. Vues cohérentes pour les directions visibles dans le jardin.
3. Éléments graphiques séparés adaptés à une animation douce.
4. Profil de mouvement, terrains autorisés et dimensions de placement.
5. Validation visuelle de la composition finale et de chaque étape, notamment à petite taille.

Réutiliser les comportements techniques reste possible. Ne pas imposer un squelette graphique unique. Le prototype de décors ne démontre pas la qualité des vues multiples ni des animations de créatures.

## Unicité à l’échelle du jardin

- Identifiant de composition permanent, partagé entre vues, palettes et éventuelles déclinaisons du même personnage.
- Réserver l’identité dès la création d’une session ; deux sessions en cours ne doivent pas recevoir la même composition.
- Historique permanent des cadeaux attribués, y compris cadeaux rangés. Retirer/ranger un cadeau ne libère pas son identité.
- Pas de contournement par recoloration, nouveau nom ou découpage différent.
- Préférer des compositions propres à chaque format.
- À épuisement d’un format, ne jamais recycler silencieusement : informer le parent et proposer un format disponible, ou ajouter un nouveau lot.
- Le premier raccord garantit les réservations dans le jardin local de cette origine : journal par composition, historique et verrou entre créations d’onglets. Une session abandonnée conserve son identité. La synchronisation entre appareils et une identité partagée de jardin restent à concevoir ; effacer volontairement les données locales efface aussi l’historique. Le laboratoire seul n’apporte pas ces garanties.

## Format et sécurité

Données vectorielles structurées, groupes ordonnés et coordonnées finales ; un lecteur, pas un moteur universel d’assemblage. Pas de PNG plat à découper après génération. Pas d’exécution de code ou d’injection de SVG libre reçu d’un service. La production doit conserver validation restrictive, versionnement, budget, traçabilité et revue humaine.

## Premiers essais visuels de cette session

Voir `plans/design/creature-lab/index.html` et `README.md` dans le même dossier.

Huit concepts distincts, dessinés par l’assistant dans cette session, chacun avec une esquisse de découverte en dix groupes. Ce nombre est un format de comparaison expérimental : ce ne sont pas huit entrées acceptées pour le catalogue 10 étapes. Le test vise d’abord la diversité de silhouettes. Pas d’appel API, pas de benchmark de modèles, pas de coût API mesuré, pas de vues directionnelles ni d’animation de production. L’acceptation artistique et le choix des concepts appartiennent au parent.

### Retour du parent et deuxième étude

Le parent a apprécié la première planche : « Très sympa. C’est beaucoup plus différencié. » Cela confirme la direction de diversité, pas l’acceptation définitive des huit concepts ou de leurs étapes.

À sa demande, une deuxième planche explore des compositions plus complexes : `plans/design/creature-lab/complex.html`. Cerf-cathédrale et Hippocampe-corail : 20 groupes chacun ; Oiseau des aurores : 40 groupes. Ce sont trois nouvelles conceptions, pas des versions enrichies des huit précédentes. Même provenance et mêmes limites : dessins de l’assistant, pas d’appel API, pas de vues directionnelles ou d’animations, pas d’intégration dans le jeu. Leur complexité ne les rend pas automatiquement acceptables : elle reste à juger par le parent.

### Retour et premier essai dans l’application — historique avant le raccord

Le parent a validé aussi cette direction plus complexe (« Super. Ça me va très bien. »), puis autorisé l’intégration locale de trois créatures dans la vraie page Jardin. Pompon fouisseur, Raie-pétale et Oiseau des aurores y sont maintenant essayables comme visiteurs temporaires, avec mouvement, animation par parties et quatre orientations. Ils ne créent aucune récompense et ne remplacent pas la collection existante. Détails, limites, captures et vérifications : `docs/GARDEN-VISITORS.md`. Le raccord au parcours de récompense a ensuite été livré pour ce premier lot : `docs/REWARD-CATALOG-INTEGRATION.md`. Le mode visiteur temporaire reste disponible pour les essais, distinct des personnages gagnés. L’enrichissement du catalogue et la validation artistique finale des vues restent à faire.
