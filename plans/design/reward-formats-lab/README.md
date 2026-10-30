# Quatre pilotes pour les formats 10 / 20 / 30 / 50

Ouvrir `index.html` directement dans un navigateur. Conserver `drawings.js`, `pilot.js` et `pilot.css` à côté. Aucun serveur, réseau, stockage du jardin ou clé. Les deux autres liens du pied de page pointent sur les sources et cette méthode, pas sur des captures absentes.

## Ce qui est réalisé

- **Le puits des capucines** : décor à 10 ajouts.
- **La serre des fougères** : décor à 20 ajouts.
- **Axolotl des nénuphars** : créature à 30 ajouts, queue et branchies animées.
- **Tortue-archipel céleste** : exceptionnelle à 50 ajouts, nageoires, queue et lune animées.

Ces dessins ont été préparés par l’assistant dans cette session, avec géométrie et ordre d’apparition explicites. Les helpers du fichier de dessins abrègent des primitives graphiques ; ce n’est pas un catalogue issu de permutations de corps/oreilles/queues ou de recolorations. Aucun appel à une API de génération ou à un modèle d’image n’a été effectué pour ces pilotes.

Choisir une composition, révéler les ajouts au curseur, examiner à 150 ou 300 px, retirer les couleurs, mettre les animations au repos. Les contrôles fonctionnent au clavier et respectent le mouvement réduit. La galerie conserve ses vues frontales d’étude. Les adaptations directionnelles, animations et lecteurs du vrai jardin sont décrits dans `../../../docs/REWARD-CATALOG-V2.md`.

**Le parent a validé cette direction.** Les quatre pilotes font désormais partie du lot de 56 compositions raccordé à l’application. Le laboratoire reste indépendant des sauvegardes et ne crée aucun cadeau.

## Contrôles observés

```sh
npx playwright test --config plans/design/reward-formats-lab/playwright.config.ts --reporter=line
```

Quatre tests réussis sur Chromium profil Pixel 7 :

1. Identités, groupes exacts 10/20/30/50, primitives du schéma existant, contrôles hors ligne ; les écritures du stockage navigateur sont interdites dans le test.
2. **110 ajouts** dans le cadre 320 × 300. À 150 px, chacun change plus de 20 pixels avec un écart de canal supérieur à 20. Minimum observé : **44 pixels**, sourire/joue de la tortue. Ce seuil ne juge pas la beauté ni l’intérêt pédagogique.
3. Clavier, pause, mouvement réduit et absence de débordement horizontal à 360/412/1280 px.
4. Captures couleur, silhouettes, mobile et progression de la tortue.

Les captures et mesures sont générées sous `test-results/reward-formats-pilot/`, pas livrées comme ressources du jeu. La galerie fonctionne sans elles. Elles ont été examinées visuellement, et le parent a approuvé la direction avant la réalisation du reste du lot.

Les quatre tests de laboratoire ne prouvent pas à eux seuls l’intégration dans les vraies sessions, la sauvegarde de cinquante réponses ni les vues/mouvements du jardin : ces parcours ont leurs propres tests applicatifs (`tests/reward-catalog*.spec.ts`, `tests/reward-continuity-v2.spec.ts`, `tests/reward-policy-v2.spec.ts`). Safari/iPhone physique reste non vérifié. Le lecteur du laboratoire consomme seulement les dessins auteurs fournis ; ce n’est pas un nouvel importateur de documents utilisateur ni un schéma de persistance de production.

## Publication éditoriale du lot de 56

`lib/rewards/art/collection.v2.json` est l’autorité publiée. `art-primitives.mjs`, `decors-small.mjs`, `decors-large.mjs`, `creatures.mjs` et `exceptionals.mjs` conservent la provenance des dessins supplémentaires. `publish-catalogue.mjs` est une commande de préparation explicite, jamais appelée par un build ou une session ; toute nouvelle sérialisation doit être revue et validée. Les corrections de poses sont publiées comme formes structurées, pas comme CSS/SVG libre. Aucun générateur anatomique, clé ou dépendance ajoutée.

## Suite

Voir `../../rewards-10-20-30-50.md` pour les décisions confirmées, la conservation de l’historique et les étapes du raccord. Les anciennes décisions sont conservées dans `../../../docs/REWARD-CATALOG.md`, avec la nouvelle règle explicitement prioritaire.
