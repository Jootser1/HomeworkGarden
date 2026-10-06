# Le Jardin des Devoirs / Homework Garden

PWA Next.js qui transforme les devoirs en jeu de collection : le parent crée une session d'additions, l'enfant répond avec un clavier numérique intégré, chaque bonne réponse révèle une partie d'une créature générée par IA, puis la créature rejoint un jardin isométrique vivant.

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

Sans `OPENAI_API_KEY`, l'app fonctionne avec une créature procédurale locale de secours.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Fonctionnalités V1

- Génération d'un nombre libre d'additions avec passage de dizaine.
- Saisie manuelle alternative des calculs.
- Créature unique par session, générée via `/api/creatures/generate`.
- Schéma Zod strict pour contrôler la sortie IA.
- Révélation d'une partie par bonne réponse.
- Clavier numérique dessiné dans l'app.
- Réessai en cas d'erreur avec indice progressif.
- Jardin isométrique 2D avec terrains et déplacements autonomes.
- Règles de terrain par créature : eau, herbe, forêt, champignons, etc.

## Variables d'environnement

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

La clé reste côté serveur dans la route Next.js. Ne pas utiliser `NEXT_PUBLIC_`.

## Prochaines étapes possibles

1. OCR photo de devoirs → validation parent → session.
2. Améliorer la génération visuelle avec sprites multi-directions.
3. Ajouter l'évaluation d'écriture avec feedback textuel.
4. Remplacer/compléter le rendu 2D par des assets 3D GLB + Three.js.
