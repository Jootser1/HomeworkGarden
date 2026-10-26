# PRD v0.3 — Le Jardin des Devoirs

## Vision

Le Jardin des Devoirs est une PWA mobile qui transforme les devoirs ponctuels en jeu de collection. Le parent crée rapidement une session d'exercices. L'enfant répond sur téléphone. Chaque bonne réponse révèle une partie d'une créature issue du catalogue local, avec génération IA facultative. Une fois complète, elle rejoint un jardin isométrique où elle vit avec les autres créatures.

## Décisions validées

- PWA d'abord.
- Pas d'Electron.
- Pas de programme scolaire complet.
- Pas de streak, classement, boutique ou réseau social.
- Collection ludique uniquement.
- Générateur d'exercices inclus dès la V1.
- Catalogue local de 100 créatures par défaut, disponible hors ligne ; génération IA facultative via Settings.
- Rendu des créatures par un moteur SVG 2D procédural contrôlé.
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
2. Une créature locale est tirée sans répétition jusqu’à épuisement du catalogue ; si le parent a activé l’IA et que le réseau est disponible, l’API peut générer un manifest JSON.
3. L'enfant répond avec un clavier numérique intégré.
4. Chaque bonne réponse révèle une partie.
5. Quand tous les exercices sont réussis, la créature est complète.
6. L'enfant utilise la baguette magique.
7. La créature rejoint le jardin.

## Exercices V1

Type : additions avec passage de dizaine.

Le nombre de calculs (1–40) et le bouton **Commencer** sont immédiatement visibles. La liste est préparée automatiquement, sans étape Générer obligatoire. L’aperçu et les réglages personnalisés sont repliés : difficulté, nombres minimum/maximum et deuxième terme minimum/maximum. La saisie manuelle reste disponible.

La proposition reprend la dernière session entièrement résolue, conserve sa longueur et ignore les sessions inachevées. Elle utilise la proportion de calculs nécessitant plusieurs essais, pas le nombre brut d’erreurs. À partir de 5 calculs exploitables, au moins 40 % réessayés propose un palier plus accessible ; 3 sessions consécutives au même palier avec au plus 10 % chacune permettent un palier supérieur. Sinon, maintien. Les bornes personnalisées restent sous le contrôle du parent. Sans historique exploitable : Moyen, 10 calculs.

Cette adaptation est locale, facultative dans les faits puisque le parent peut modifier les réglages, et ne constitue ni un diagnostic scolaire ni un programme imposé.

Réponse enfant : numérique, via clavier dessiné dans l'application.

En cas d'erreur : réessai sans punition. Après plusieurs tentatives, indice doux.

## Créatures

Le catalogue local et, lorsqu’elle est activée, l’IA décrivent :

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

La génération IA est désactivée par défaut et peut être activée par le parent dans Settings. Elle nécessite Internet et une clé serveur ; sa sortie est structurée par Zod. Hors ligne, en absence de clé ou en cas d’erreur, l’app reste jouable avec le catalogue local. Ne pas exposer l’API payante publiquement sans protections d’accès et de débit.

## PWA et données locales

L’app est installable et fonctionne hors ligne après une première préparation du cache en ligne : création, calculs, reprise et jardin, y compris pour une nouvelle session jamais visitée en ligne. Une mise à jour du service worker nécessite une confirmation explicite ; le retour du réseau ne doit pas recharger automatiquement un calcul en cours.

Les données restent locales à l’origine et à l’appareil, sans sauvegarde distante ni synchronisation. Préserver les anciennes sessions et ne pas effacer le stockage pour appliquer une évolution. Les parcours Chromium sont testés ; installation réelle et mode avion restent à confirmer sur les téléphones cibles.

## Roadmap

1. Stabiliser la boucle V1.
2. Ajouter OCR pour transformer une fiche en session validée par le parent.
3. Ajouter l'écriture manuscrite avec feedback textuel.
4. Améliorer sprites directionnels 2D.
5. Explorer la 3D GLB + Three.js pour créatures orientables et animations réutilisables.
