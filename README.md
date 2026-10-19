# Le Jardin des Devoirs / Homework Garden

PWA Next.js qui transforme les devoirs en jeu de collection : le parent crée une session d'additions, l'enfant répond avec un clavier numérique intégré, chaque bonne réponse révèle une partie d'une créature locale (ou générée par IA en option), puis la créature rejoint un jardin isométrique vivant.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4 + CSS custom
- Vercel AI SDK + OpenAI pour les manifests de créatures
- Persistance locale via `localStorage`

## Lancer en local

```bash
npm install
cp .env.example .env.local
# ajoute OPENAI_API_KEY dans .env.local pour activer la vraie génération IA
npm run dev
```

Par défaut, l’app utilise un catalogue local de 100 créatures, sans clé ni appel IA. La génération IA est optionnelle, activable dans les réglages, et nécessite Internet.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
# Une fois par machine pour les tests navigateur :
npx playwright install chromium
# Après npm run build :
npm run test:pwa
```

## Installation et mode hors ligne

- Déployer sur Vercel en HTTPS avec la commande standard `npm run build`.
- Ouvrir une première fois l’accueil avec Internet et attendre le chargement du service worker et du cache.
- Android/Chrome : utiliser « Installer l’app » ou l’option d’installation du navigateur.
- iPhone/iPad : dans Safari, **Partager → Sur l’écran d’accueil**.
- Une fois le cache prêt, la création locale, les calculs, la reprise et le jardin fonctionnent sans réseau. Les nouvelles sessions créées hors ligne sont prises en charge.
- La génération IA reste en ligne ; hors connexion, la création utilise automatiquement le catalogue local.
- Une nouvelle version affiche une proposition de mise à jour, sans rechargement automatique au retour du réseau. Cliquer « Mettre à jour » recharge l’application en conservant `localStorage`.

Le service worker est **désactivé en développement**. Pour tester la PWA : `npm run build`, puis `npm start`. Utiliser `localhost` ou HTTPS ; une URL locale `http://192.168.…` ne permet généralement pas le service worker sur téléphone. Le build et le serveur de développement utilisent Webpack pour l’intégration Serwist.

Les données restent sur l’appareil et pour l’origine utilisée : ni synchronisation ni sauvegarde distante. Changer de domaine, effacer les données du navigateur ou supprimer l’app peut rendre le jardin indisponible. Le comportement exact entre Safari et l’app installée dépend du système ; vérifier sur l’appareil cible.

Les tests couvrent les règles d’adaptation et, dans Chromium, la création rapide/personnalisée/manuelle, la persistance des essais et de la résolution, manifeste/icônes, contrôle du service worker, parcours complet hors ligne après une seule visite initiale, liens et absence d’appels IA en mode local, aide d’installation avec user-agent iPhone et activation explicite d’une mise à jour. Ils ne remplacent pas un essai réel sur Safari/iOS.

## Création rapide et adaptation locale

L’écran propose directement une session : seul le nombre de calculs est visible (1–40), avec un bouton **Commencer**. Modifier ce nombre actualise immédiatement les calculs. La difficulté et les bornes numériques restent disponibles dans **Réglages personnalisés**, la liste dans **Voir les calculs**, et la saisie des devoirs dans **Saisir mes calculs**.

La proposition utilise la dernière session dont tous les calculs sont résolus, même si la créature n’a pas encore été réveillée. Elle conserve sa longueur ; une session inachevée ne sert pas à ajuster le niveau. Les sessions récentes enregistrent leurs réglages et la date de résolution ; pour l’ancien historique sans réglages, le palier est estimé à partir des opérandes.

Heuristique V1, locale et sans IA (pas une évaluation scolaire) :
- au moins 5 calculs et des compteurs d’essais exploitables pour ajuster le niveau ;
- au moins 40 % de calculs ayant nécessité plusieurs essais : un palier plus accessible, sans descendre sous Facile ;
- au plus 10 % sur chacune des 3 dernières sessions résolues au même palier : un palier supérieur, sans dépasser Costaud ;
- sinon, niveau conservé. Les répétitions d’erreurs sur un seul calcul ne sont pas additionnées comme autant de calculs en difficulté ;
- les bornes numériques explicitement personnalisées sont conservées plutôt que remplacées par un palier automatique ;
- le nombre de calculs n’augmente jamais automatiquement (les anciennes listes de plus de 40 sont limitées à 40 pour la génération).

Sans historique exploitable, le réglage de départ est Moyen / 10 calculs. L’ensemble fonctionne aussi dans la coquille hors ligne et ne nécessite aucune migration des anciennes sessions.

## Fonctionnalités V1

- Génération de 1 à 40 additions avec passage de dizaine.
- Saisie manuelle alternative des calculs.
- Une créature par session ; catalogue local par défaut, génération optionnelle via `/api/creatures/generate`.
- Schéma Zod strict pour contrôler la sortie IA.
- Révélation d'une partie par bonne réponse.
- Clavier numérique dessiné dans l'app.
- Réessai en cas d'erreur avec indice progressif.
- Jardin isométrique 2D avec terrains et déplacements autonomes.
- Règles de terrain par créature : eau, herbe, forêt, champignons, etc.

## Variables d'environnement

| Variable | Utilisation |
| --- | --- |
| `OPENAI_API_KEY` | Facultative, uniquement pour la génération IA ; laisser vide en mode local. |
| `OPENAI_MODEL` | Modèle de génération, `gpt-4.1-mini` par défaut. |

La clé reste côté serveur dans la route Next.js. Ne pas utiliser `NEXT_PUBLIC_`.

## Prochaines étapes possibles

1. OCR photo de devoirs → validation parent → session.
2. Améliorer la génération visuelle avec sprites multi-directions.
3. Ajouter l'évaluation d'écriture avec feedback textuel.
4. Remplacer/compléter le rendu 2D par des assets 3D GLB + Three.js.
