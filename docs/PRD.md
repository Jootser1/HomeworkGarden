# PRD v0.3 — Le Jardin des Devoirs

## Vision

Le Jardin des Devoirs est une PWA mobile qui transforme les devoirs ponctuels en jeu de collection. Le parent crée rapidement une session d'exercices. L'enfant répond sur téléphone. Chaque bonne réponse révèle une partie d'une créature unique générée par IA. Une fois complète, elle rejoint un jardin isométrique où elle vit avec les autres créatures.

## Décisions validées

- PWA d'abord.
- Pas d'Electron.
- Pas de programme scolaire complet.
- Pas de streak, classement, boutique ou réseau social.
- Collection ludique uniquement.
- Générateur d'exercices inclus dès la V1.
- Créatures générées dynamiquement par IA, mais rendues par un moteur 2D procédural contrôlé.
- 2D animée d'abord, 3D plus tard.
- OCR plus tard, avec validation parent.
- Photos supprimées après analyse quand l'OCR/l'écriture seront ajoutés.
- Interface française.

## Unités produit

- **Exercice** : une question unique, par exemple `115 + 9`.
- **Session** : un lot d'exercices lancé par le parent. Pas de notion de journée.
- **Créature** : récompense révélée partie par partie pendant une session.
- **Jardin** : environnement naturel figé où les créatures complétées se déplacent seules.

## Boucle V1

1. Le parent génère ou saisit des additions.
2. L'API IA génère un manifest JSON de créature.
3. L'enfant répond avec un clavier numérique intégré.
4. Chaque bonne réponse révèle une partie.
5. Quand tous les exercices sont réussis, la créature est complète.
6. L'enfant utilise la baguette magique.
7. La créature rejoint le jardin.

## Exercices V1

Type : additions avec passage de dizaine.

Paramètres parent :

- nombre d'additions libre, borné techniquement à 1–40 pour éviter les sessions trop longues ;
- difficulté ;
- nombre minimum ;
- nombre maximum ;
- deuxième terme minimum ;
- deuxième terme maximum.

Réponse enfant : numérique, via clavier dessiné dans l'application.

En cas d'erreur : réessai sans punition. Après plusieurs tentatives, indice doux.

## Créatures

L'IA génère :

- nom ;
- description ;
- personnalité ;
- biome ;
- mode de déplacement ;
- palette ;
- formes ;
- liste des parties à révéler.

Contraintes : mignonnes, variées, parfois malicieuses, parfois étranges ou un peu sombres, jamais effrayantes.

Interdits : gore, armes, menace, jumpscare, horreur, dents agressives.

## Jardin

Le jardin est isométrique et naturel : herbe, fleurs, mare, forêt, champignons, terre.

Les créatures :

- se déplacent automatiquement ;
- respectent leur terrain autorisé ;
- ne sont pas déplaçables par l'enfant ;
- n'ont pas encore d'interactions entre elles.

## Architecture

- `app/parent` : création de session.
- `app/play/[sessionId]` : expérience enfant.
- `app/garden` : jardin vivant.
- `app/api/creatures/generate` : génération IA server-only.
- `lib/exercises` : génération/parsing/indices.
- `lib/creatures` : schéma, fallback, factory.
- `lib/garden` : carte isométrique.
- `lib/storage` : persistance locale.

## IA

Provider V1 : OpenAI via Vercel AI SDK.

La sortie est structurée par Zod. En absence de clé ou en cas d'erreur, l'app utilise une créature locale de secours pour rester jouable.

## Roadmap

1. Stabiliser la boucle V1.
2. Ajouter OCR pour transformer une fiche en session validée par le parent.
3. Ajouter l'écriture manuscrite avec feedback textuel.
4. Améliorer sprites directionnels 2D.
5. Explorer la 3D GLB + Three.js pour créatures orientables et animations réutilisables.
