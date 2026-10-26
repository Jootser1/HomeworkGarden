# Huit rencontres — laboratoire de diversité des créatures

## Ouvrir les résultats

Ouvrir `index.html` dans ce dossier, directement dans le navigateur. Conserver `drawings.js` et `reader.js` à côté. Aucun serveur, dépendance à installer, réseau ou clé requis.

- Planche de huit concepts complets.
- Bouton **Voir les silhouettes** pour retirer les couleurs et détails intérieurs.
- **Explorer la découverte** pour sélectionner une créature.
- Curseur, étape suivante, recommencer et vue complète pour examiner dix ajouts.
- Captures locales facultatives, non versionnées : `planche-couleurs.png` et `planche-silhouettes.png`. Les tests les produisent dans leur dossier de résultats.

Décisions produit complètes : `../../../docs/REWARD-CATALOG.md`.

## Provenance et portée

Ces huit illustrations vectorielles ont été conçues directement par l’assistant dans cette session. Pas d’appel API de génération, pas de générateur d’images, pas de coût API mesuré. Les créatures ne réutilisent pas le corps du catalogue actuel. Des primitives SVG et le dessin des yeux sont partagés ; ce n’est pas un moteur de recombinaison d’anatomies.

Les fragments SVG sont des sources locales statiques de confiance. Le lecteur utilise `innerHTML` pour ces fragments uniquement ; il n’offre **aucun import de contenu utilisateur ou distant**. Il ne doit pas devenir un lecteur de réponses IA sans validation restrictive et changement du chemin de rendu. Ce prototype n’est pas le contrat de données de production.

Chaque concept possède dix groupes pour cette première comparaison. Cela ne signifie pas que huit places du futur catalogue 10 étapes sont validées. La répartition cible reste 12 / 10 / 10 / 8 créatures pour les formats 10 / 15 / 20 / 40.

Pas de changement de l’application, de collection, de stockage ou d’endpoint IA. Pas de nouvelles garanties de non-répétition implémentées. Pas de vues multidirectionnelles, de rig ni d’animations. Aucun commit, push ou déploiement.

## Contrôles exécutés

Commande autonome, sans serveur Next.js :

```sh
npx playwright test --config plans/design/creature-lab/playwright.config.ts --reporter=line
```

**Premier passage : 3 tests réussis** sur Chromium, profil mobile Pixel 7 :

1. Huit identifiants distincts, rendu sans requête HTTP ni erreur JS, absence de débordement horizontal à la largeur mobile, boutons et curseur, bascule des silhouettes.
2. Les 80 ajouts sont non vides et modifient chacun le dessin à 150 pixels CSS de largeur ; géométrie des groupes dans le cadre ; aucun masque ni clipPath. Minimum observé : environ **25 pixels CSS changés** (différence RGB > 20). Ce seuil vérifie une différence, pas un ajout intéressant pour l’enfant.
3. Captures couleur et silhouette sur grand écran, et capture mobile.

Lint ciblé réussi :

```sh
npx eslint plans/design/creature-lab/drawings.js plans/design/creature-lab/reader.js plans/design/creature-lab/playwright.config.ts tests/creature-lab.spec.ts
```

`git -c core.autocrlf=false diff --check` réussi pour les changements suivis ; les nouveaux fichiers ont aussi été lus et le JavaScript vérifié par ESLint. Pas de build ni de suite complète de l’application : laboratoire statique indépendant, aucune source applicative modifiée par cette session.

Les profils locaux frontend-design et dev-browser n’ont pas pu être chargés : erreur d’authentification `openai-codex`. La réalisation et les contrôles navigateur ont été effectués directement avec les outils disponibles, sans délégation.

## Évaluation visuelle et limites

Les deux planches ont été ouvertes et examinées : silhouettes horizontale, spiralée, sur échasses, en cloche, serpentine, trapue, en éventail et en carapace. L’objectif de départ est de montrer des directions différentes plutôt que huit variantes du même gabarit. La décision artistique reste au parent.

Le style est volontairement une esquisse vectorielle plate : relief 2.5D, intégration dans le jardin et comportement en mouvement non validés. Certains raccords du dragon sont anguleux ; les visages partagent encore le même langage graphique. Les étapes commencent parfois par des appendices, et plusieurs ajouts sont modestes : leur ordre narratif et leur intérêt demandent une reprise avant production. Les contrôles de pixels ne vérifient ni les attaches sémantiques, ni l’absence de toutes les superpositions, ni la qualité de chaque étape.

Prochaine décision : choisir les concepts à conserver, ceux à retravailler et le niveau de richesse graphique souhaité, avant de développer leurs vues directionnelles et le reste du catalogue.

## Étude 02 — créatures plus complexes

Après le retour positif du parent sur la diversité de la première planche, ajout de `complex.html`, accessible aussi depuis le bas de `index.html`.

| Concept original | Groupes | Intention |
| --- | ---: | --- |
| Cerf-cathédrale | 20 | Quadrupède élancé, ramures ramifiées, manteau de feuilles et fleurs suspendues |
| Hippocampe-corail | 20 | Anatomie verticale, queue enroulée, plaques de nacre et branches de corail |
| Oiseau des aurores | 40 | Ailes déployées, deux rangées de plumes, aigrettes et longue queue à ocelles |

Les trois dessins ont des anatomies distinctes des huit premiers. Le petit helper de plume sert à dessiner cet oiseau uniquement, pas à recombiner des corps de créatures. Les 40 étapes permettent un plumage développé ; plusieurs ajouts restent naturellement répétitifs (plumes d'une aile) : l’intérêt pédagogique et visuel de chaque étape reste à apprécier par le parent.

Mêmes limites : illustrations locales conçues par l’assistant, pas d'appel API, style d’esquisse plate, pas de vues directionnelles, pas d’animations ou d'intégration au jardin. La construction est progressive et additive, mais le validateur ne prouve pas la cohérence anatomique de chaque état intermédiaire. Les deux planches et la progression de l’oiseau ont été examinées visuellement.

### Vérifications après ajout

La même commande Playwright exécute maintenant les deux fichiers de tests : **6 tests réussis**, dont les trois tests initiaux rejoués et trois nouveaux. Les 80 nouveaux ajouts sont visibles à 150 pixels CSS, avec un minimum mesuré d’environ **40 pixels CSS modifiés**, sans masque ni découpage. Les dimensions mobiles, le fonctionnement hors ligne, les contrôles et les comptes exacts 20 / 20 / 40 sont vérifiés. Ce minimum n’est toujours pas une preuve d’intérêt artistique.

Lint ciblé réussi sur les deux fichiers de dessins, le lecteur partagé, la configuration et les deux fichiers de tests ; `git -c core.autocrlf=false diff --check` réussi. Aucun build applicatif ou test API payant.

Captures locales facultatives, non versionnées : `complex-couleurs.png`, `complex-silhouettes.png`, `oiseau-progression.png`. Les tests les produisent dans leur dossier de résultats. Les mesures détaillées et la capture mobile sont dans `test-results/creature-lab/` (temporaires).
