# Exercices indépendants et moteur commun — 26 octobre 2026

## Décisions et livraison

Lecture, écriture et reconnaissance de devoirs restent pour un second temps. Quatre familles ajoutées à l’addition existante :

- **Comparaison de nombres** : choisir le plus grand parmi deux entiers naturels distincts. Réponse par boutons, sans avoir à ressaisir le nombre.
- **Suites numériques** : cinq nombres à pas positif constant, un trou intérieur. Exemple contractuel : `18 – 28 – 38 – ? – 58`, réponse `48`. Réponse avec le clavier numérique existant. Les positions du trou varient.
- **Soustractions** : résultats naturels, positifs ou nuls ; niveau facile sans emprunt, puis passages de dizaine possibles. Bornes du nombre de départ personnalisables.
- **Tables de multiplication** : une table précise ou une plage de tables et multiplicateurs, entre 0 et 12. Calculs mélangés sans répétition d’un même couple tant que la plage choisie n’est pas épuisée.

Les niveaux facile/moyen/costaud et les bornes personnalisées appartiennent à chaque module. Le parent choisit le type dans le formulaire de création ; les réglages et l’aperçu suivent ce choix. Chaque bonne réponse utilise la même mécanique de cadeau. Génération et correction des exercices entièrement locales, sans IA, y compris hors ligne.

Restent à réaliser notamment les additions sans passage de dizaine, les compléments à 10/100 et les calculs à trous. Les séries décroissantes, décimales, négatives ou à règle variable ne sont pas incluses. La longueur de session 1–40 actuelle est conservée : cette modification ne réalise pas encore le catalogue de récompenses 10/15/20/40.

## Frontières d’architecture

```text
lib/exercises/
  contracts.ts       contrat des modules et options neutres
  shared.ts          bornes, tirage, identifiants, lots, correction numérique
  recommendation.ts politique de progression commune, historique par kind
  registry.ts        registre générique, sans import de familles concrètes
  index.ts           seul point de composition des modules actifs
  modules/
    addition.ts      adaptateur de l’addition historique
    comparison.ts   comparaison, indépendante des autres familles
    sequence.ts     suites, indépendantes des autres familles
    subtraction.ts  soustractions, sans branche dans le joueur
    multiplication.ts tables, sélection et mélange des faits
  additions.ts        API historique d’addition préservée
  adaptive-session.ts adaptateur de l’historique et options d’addition

components/ExerciseAnswer.tsx : modes de réponse communs (choix / nombre)
app/parent/ParentClient.tsx   : formulaire, aperçu et lancement génériques
components/PlaySession.tsx   : session, essais, révélation et sauvegarde communs
```

### Le module possède

Identité stable, libellés, niveaux et valeurs par défaut, champs numériques, normalisation des relations entre champs, génération, validation de ses données et indices pédagogiques. La saisie manuelle est une capacité facultative ; seule l’addition existante la propose actuellement.

Un module n’importe ni un autre module concret, ni React, ni l’UI, ni le stockage, ni le jardin. L’adaptateur d’addition réutilise les fonctions historiques ; elles ne dépendent pas des nouvelles familles.

### Le socle possède

Compteur, tentatives, statut, correction d’une réponse numérique, clavier et boutons de choix, progression/réessais, sessions, sauvegarde, chronologie et cadeaux. Pas de `if (kind === ...)` dans le formulaire ou le joueur pour reconnaître les nouvelles familles. Les champs du formulaire viennent de métadonnées, pas de formulaires recopiés.

Les paramètres sont un dictionnaire numérique propre au module, dans `ExerciseOptions`. Les bornes communes sont normalisées et les paramètres inconnus éliminés. Les règles spécifiques (deux nombres distincts, pas positif, ordre min/max) restent dans leur module. Les bornes générées restent compatibles avec le clavier à six chiffres.

### Progression

Une seule politique conserve les seuils existants : au moins cinq exercices exploitables, aide dès 40 % d’exercices réessayés, progression après trois sessions à au plus 10 % de réessais, sans augmenter la longueur. Les historiques sont filtrés par l’identité du module **avant** l’application de cette politique. Les paramètres personnalisés sont préservés. Les résultats en addition ne changent pas le niveau de comparaison ou de suites.

Le changement de famille conserve la longueur choisie, mais recharge le niveau et les paramètres propres à cette famille. Une session ne mélange pas encore les familles.

## Données historiques et retrait d’un module

Chaque exercice sauvegarde une présentation et une correction autonomes : `kind`, `prompt`, éventuelle `instruction`, éventuels `choices`, `expectedAnswer`, puis essais/statut. `data` contient les données numériques locales au module quand nécessaires. `operands` est désormais facultatif : on n’impose pas à une suite de prétendre être une addition à deux opérandes.

Les identifiants persistés sont volontairement ouverts (`ExerciseKind = string`) : un ancien identifiant reste lisible après retrait du module. Le registre est l’autorité pour proposer de nouvelles sessions, pas pour effacer l’histoire. Ne jamais réaffecter un ancien identifiant à une pédagogie incompatible.

Pour retirer une famille :

1. Retirer son import et son entrée dans `lib/exercises/index.ts`.
2. Son fichier peut ensuite être retiré, ainsi que ses tests spécifiques.
3. Ne pas supprimer ou migrer les sessions de cette famille.

Le formulaire ne la propose plus ; les autres familles ne changent pas. Les anciennes sessions restent jouables depuis leurs données de présentation et réponse. Le titre enregistré est conservé ; si le module manque, l’indice devient neutre, jamais un indice d’addition par défaut. Cette garantie concerne les modes nombre/choix actuels, pas des futurs formats audio ou manuscrits encore inexistants.

L’ancienne forme plate de `generationOptions` pour les additions reste reconnue, sans migration destructive. Les nouvelles sessions utilisent les options normalisées. Le cycle dix décors puis une créature et la collection sont inchangés.

## Récompenses découplées

L’API de créature n’exige plus que l’exercice soit une addition. Elle utilise uniquement la quantité et la difficulté ; les anciens clients peuvent encore envoyer leur champ supplémentaire, ignoré. Les options IA de récompense préexistantes ne sont pas modifiées ou activées. Aucun appel API payant effectué par ce travail.

## Dernier lot : soustractions et tables

Deux nouveaux modules et leur inscription dans `lib/exercises/index.ts`, sans modification du formulaire, du joueur, du stockage ou du contrat de module pour ce lot. Aucun module concret ne dépend d’un autre.

### Soustractions

- Facile : départ 1–20, chaque chiffre retiré inférieur ou égal au chiffre correspondant du départ. Pas d’emprunt, même sur une plage personnalisée.
- Moyen : départ 20–100, nombre retiré de 1 à 20 au plus, sans dépasser le départ.
- Costaud : départ 100–1000, nombre retiré de 1 à 99 au plus, sans dépasser le départ.
- Bornes de départ personnalisables de 0 à 999999 ; `0 − 0` reste valide. Pas de résultats négatifs ou décimaux.
- Indices : zéro, retrait du nombre entier, décomposition dizaines/unités, passage à la dizaine inférieure ou compte à reculons.

### Multiplications

- Facile : tables 2–5, multiplicateurs 1–5.
- Moyen : tables 2–10, multiplicateurs 1–10.
- Costaud : tables 2–12, multiplicateurs 0–12.
- Personnalisation : « Première table », « Dernière table », « Multiplicateur minimum », « Multiplicateur maximum ». Pour travailler uniquement la table de 7, mettre 7 aux deux bornes de table.
- Le module énumère les couples possibles (169 maximum), les mélange puis les utilise sans remise. Une table de 7 avec multiplicateurs 1–10 et dix exercices couvre exactement ses dix faits, même avec un aléatoire constant. Si le nombre demandé dépasse la plage disponible, les couples sont réutilisés après couverture de toute la plage.
- Indices spécifiques : multiplication par zéro, par un, ou fait précédent de la même table suivi d’une addition du nombre de la table.

### Validation de ce lot

- Quatre cycles RED/GREEN observés : absence de soustractions dans le registre, indice de soustraction sans passage guidé, absence de tables dans le registre, puis indice de table sans recours au fait précédent. Échecs attendus suivis de tests ciblés réussis.
- `tests/arithmetic-modules.spec.ts` : neuf tests, dont les cas réels `12 − 5 = 7`, `7 × 4 = 28` et `0 × 7 = 0` configurés via le formulaire, avec aperçu, réponse et rechargement.
- `tests/exercise-modules.spec.ts` : parcours commun étendu automatiquement aux familles sans saisie manuelle ; création, réessais, indice propre, révélation, jardin et hors ligne. Progressions soustraction/multiplication séparées, table personnalisée conservée.
- Graphe de dépendances vérifié sur tous les fichiers présents dans `modules/`, pas seulement une liste historique de trois familles. Désinscription testée pour les cinq familles, avec conservation de leurs présentations/réponses sauvegardées.
- Helpers de test `activeSession` et `numericAnswer` mutualisés dans `tests/helpers/exercises.ts`. Cas de mauvaise réponse adapté pour qu’il ne prenne pas zéro lorsqu’il est justement la bonne réponse.
- `npm run lint` et `npx tsc --noEmit --incremental false` : réussis.
- `npm run build` : relance réussie avec avertissement Next.js 16.4.0 préexistant ; première tentative arrêtée par `SecurityFatalError` après compilation. Aucune mise à niveau, dépendance ou option IA modifiée. Mise à niveau de sécurité toujours recommandée avant exposition publique.
- Tests ciblés : **25 réussis**. Suite complète `npx playwright test --reporter=line` : **104 réussis**, contre 90 précédemment, en 3,7 minutes.
- `git -c core.autocrlf=false diff --check` : réussi. Aucun reset de dépôt, commit, migration ou déploiement. Les fichiers générés Next.js, notamment `next-env.d.ts`, peuvent être réécrits par le build.
- Captures soustraction et multiplication examinées sur Chromium profil Pixel 7 ; questions, indices et clavier visibles, pas de débordement horizontal. Pas de validation sur téléphone physique.
- Application locale relancée sur `http://localhost:3000/parent`, PID **1312**. Contrôle navigateur isolé sur les deux nouveaux types : réponses acceptées et cadeaux terminés, sans erreur navigateur ni appel API. Aucune donnée du profil navigateur du parent modifiée.
- Revue locale du périmètre : aucun défaut bloquant identifié ; pas de revue déléguée ou d’affirmation d’absence générale de bugs.

## Historique : validation du premier lot comparaison/suites

Suite précédente : 79 tests. Suite finale : **90 tests réussis**, dont 11 nouveaux dans `tests/exercise-modules.spec.ts` :

- comparaison sans égalité, bonne réponse unique, positions variées ;
- exemple 48, suites à pas constant et un seul trou ;
- paramètres invalides/inversés, tirage constant borné, identifiants distincts ;
- recommandations et réglages séparés par famille ;
- désinscription successive de chaque module dans un registre de test ;
- graphe de dépendances : absence d’imports croisés, d’UI et de stockage dans les modules et le socle ;
- parcours réel pour chaque nouveau type : création, deux erreurs, indice propre, révélation, rechargement, cadeau et jardin ;
- création/reprise hors ligne pour les deux types, sans requête API ;
- session d’une famille non enregistrée jouable avec choix, correction et indice neutre.

Les tests historiques d’addition, la conservation du jardin, les déplacements et la PWA passent également. Un test existant vérifie explicitement la présence des opérandes avant d’y accéder, car ce champ n’est plus universel. Une assertion initiale de titre visible a été corrigée : le titre du panneau est masqué par le CSS mobile existant ; le test vérifie le contenu du titre DOM sans exiger sa visibilité.

- `npm run lint` : réussi.
- `npx tsc --noEmit --incremental false` : réussi.
- `npm run build` : relance finale réussie avec rappel de vulnérabilité Next.js 16.4.0 préexistante. Premier passage arrêté par `SecurityFatalError` après compilation. Aucune mise à niveau ou dépendance modifiée ; correction de sécurité recommandée avant exposition publique.
- `npx playwright test --reporter=line` : **90 réussis**, 3,3 minutes.
- Captures des deux nouveaux exercices sur Chromium profil Pixel 7 examinées : questions, indices et contrôles visibles, pas de débordement horizontal. Captures temporaires sous `test-results/exercise-modules-*/`.
- `git -c core.autocrlf=false diff --check` : réussi.
- Serveur local relancé sur `http://localhost:3000/parent`, PID 35008. Contrôle navigateur isolé sur cette instance : type suite, départ 18, pas 10, trou à la quatrième position ; le prompt exact `18 – 28 – 38 – ? – 58` accepte 48 et termine le cadeau, sans erreur navigateur ni requête API. Aucun accès à la collection du profil navigateur du parent.

Pas de déploiement, commit, effacement de collection ou modification de services payants. Les modifications préexistantes du dépôt sont conservées. Skill implementation-plan indisponible (authentification openai-codex) : exploration et revue effectuées directement, sans délégation prétendue.
