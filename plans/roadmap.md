# Roadmap — Le Jardin des Devoirs / Homework Garden

Ce document sert de référence pour les prochaines sessions de développement.

## État le plus récent — premier lot de récompenses raccordé, local uniquement

- **10 décors et 3 créatures** désormais attribuables dans les vraies sessions ; nouvelles attributions exclusivement par groupes entiers, sans balayage vertical ni génération payante.
- Formats natifs décors 10 / 15 / 20 / 40 ; créatures du premier lot : Pompon et Raie en 10, Oiseau en 40. Créatures 15 / 20 encore absentes. Pas de prétention à un catalogue 240 / 40 terminé.
- Identités réservées au démarrage, historique des cadeaux en cours / rangés, verrou de création entre onglets et journal par composition résistant aux anciennes sauvegardes du jardin. Épuisement signalé sans recyclage ni retour aux anciennes recettes.
- Collection et sessions historiques préservées avec leur ancien lecteur ; reprendre une ancienne session peut encore montrer son ancien balayage. Pour voir le nouveau parcours, **créer une nouvelle session**.
- Même dessin à la fin des calculs et au jardin ; les trois nouveaux personnages gagnables utilisent leurs propres dessins animés / vues, pas le moteur anatomique historique. Cadrage de l’oiseau corrigé sur petit écran.
- Vérification finale : **122 tests réussis**, lint, TypeScript et build réussis ; Next.js 16.4.3 observé, aucune dépendance modifiée pendant ce raccord. Captures mobile / bureau et parcours complet de quarante réponses avec reprise hors ligne.
- Application locale : `http://localhost:3000/parent` ; serveur relancé après vérification, PID **19064**, sur la même origine, sans reset de données. Aucun commit, push ou déploiement public.
- Détails / sources / limites : `docs/REWARD-CATALOG-INTEGRATION.md`. Décisions cibles : `docs/REWARD-CATALOG.md`.
- Suite prioritaire : retour visuel du parent, vrais nouveaux lots pour les formats épuisés et créatures 15 / 20, puis progression vers 240 / 40. Pas de nouveaux exercices comme diversion à cette priorité.

Les sections suivantes conservent l’historique ; leurs mentions de génération IA facultative, de catalogue procédural ou d’intégration restant à faire ne décrivent plus le parcours des **nouvelles** sessions.

## Reprise de travail — 2026-10-19

### Objectif et état de livraison

La dernière tâche est **terminée et publiée** : simplifier la création de session et proposer une difficulté à partir des erreurs des sessions résolues, sans augmenter automatiquement la charge. Critères implémentés : nombre de calculs visible, démarrage immédiat, réglages et aperçu repliés, saisie manuelle préservée, adaptation locale utilisable hors ligne.

- Projet : `D:/Playground/HomeworkGarden` ; Next.js App Router, React, TypeScript, Tailwind, npm et PWA mobile. Pas d’Electron.
- Branche : `main`.
- Dernier commit : `2a60c4c7586089a2eae6dd1feede492bfa9b426c` — `feat(sessions): simplify setup with adaptive difficulty`.
- Tree du commit : `25bb9220958c917c9369e0f4d4b89a93b5bce08f`.
- Push vers `origin/main` effectué ; égalité du SHA distant avec ce commit vérifiée après publication. Aucun merge ni PR.
- L’utilisateur a autorisé explicitement le push direct sur `main` pour cette livraison. **Ce n’est pas une autorisation permanente pour de futurs commits/pushs.**
- Aucun nouveau développement n’est demandé à ce stade. Le déploiement Vercel, son URL et la recette sur téléphone ne sont pas vérifiés.

### Lire d’abord

1. Cette section de reprise et les sections Avancement en fin de document.
2. `docs/PRD.md` — contraintes produit, alignées lors du handoff sur le mode local par défaut.
3. `docs/knowledge/2026-10-19-2a60c4c-session-adaptive.md` — règles d’adaptation, décisions, piège du timer et limites des tests. Document local non committé, à préserver.
4. `app/parent/ParentClient.tsx`, `lib/exercises/adaptive-session.ts`, `lib/types.ts`, `components/PlaySession.tsx`.
5. `tests/adaptive-session.spec.ts`, `tests/session-creation.spec.ts`, `tests/helpers/sessions.ts`, puis les tests PWA et `playwright.config.ts`.

### État local à préserver

Avant ce handoff, `git status --short` ne montrait que `?? docs/knowledge/`. Aucun changement de code/index n’était en attente.

Le handoff modifie uniquement `plans/roadmap.md` et `docs/PRD.md`. Ces modifications documentaires et la capture KB restent **non committées et non poussées**. Aucun fichier utilisateur préexistant n’a été supprimé. Recontrôler l’état Git au début de la reprise et préserver tout changement supplémentaire.

### Décisions et invariants à conserver

- Interface française, concise et utilisable sur smartphone. Devoirs ponctuels, pas un cursus, une compétition, des streaks, une monnaie ou une boutique.
- Mode local par défaut : 100 créatures sans répétition avant épuisement, SVG procédural, frontal pendant les calculs et quatre directions au jardin. L’IA reste facultative dans Settings ; hors ligne, toujours utiliser le local.
- 1–40 calculs générés ; une session donne une créature. Réponse numérique avec clavier dédié, réessais et indices doux. Une bonne réponse révèle une partie et avance après une courte pause ; pas de bouton Continuer.
- Parties non révélées invisibles, pas de liste des parties restantes. Une seule barre de découverte de créature, sans compteur numérique de créature ; le compteur d’exercices reste distinct.
- Adaptation : proportion de calculs avec `attempts > 1`, pas somme des erreurs ; au moins 5 calculs exploitables pour changer de palier. Au moins 40 % réessayés : descendre d’un palier. Trois sessions consécutives au même palier/bornes avec au plus 10 % chacune : monter d’un palier. Sinon, maintenir. Bornes personnalisées conservées ; longueur reprise, limitée à 40, jamais augmentée automatiquement.
- `solvedAt` est enregistré à la dernière bonne réponse, avant la baguette. Les sessions inachevées sont ignorées ; l’ancien historique sans réglages reçoit une estimation de palier. Ce n’est pas une évaluation scolaire.
- Préserver l’annulation du timer d’avancement avant le jardin et au démontage : une ancienne copie de session ne doit pas écraser son état final. Reprendre au premier calcul en attente.
- Persistance existante : `homework-garden-state-v1`, `homework-garden-used-local-creatures-v2`, `homework-garden-settings-v1`. Données locales à l’origine/appareil, sans sync ni sauvegarde distante ; aucun reset automatique.
- PWA : `app/sw.ts`, `components/PwaManager.tsx`, coquille `/offline` avec routes hash pour les nouvelles sessions. Serwist en production seulement, inscription manuelle, `reloadOnOnline: false`, activation des mises à jour sur confirmation. Ne pas réintroduire de rechargement à la reconnexion ni dépendre de routes RSC non cachées.
- OCR futur : extraction puis validation parent éditable obligatoire, suppression des photos après analyse, pas de stockage durable par défaut. Pas encore implémenté.

### Vérifications déjà obtenues

Sur les sources de `2a60c4c`, avant commit :

- `npm run lint` : réussi.
- `npm run build` : réussi, TypeScript inclus.
- `npm run test:pwa` : **30 tests réussis** (17 règles, 13 navigateur).
- Production Playwright sur Chromium/profil Pixel 7, service worker autorisé, un worker, serveur `http://localhost:3100`. Un passage ne prouve pas Safari/iOS ni les appareils physiques.
- Ces résultats ont été réutilisés pour le commit après vérification des empreintes du contenu et du tree ; ils n’ont pas été rejoués au seul motif du commit/push.
- Garde-fous worktree/index/commit et `git diff --cached --check` réussis avant publication ; seul le commit attendu partait vers la base distante inchangée.
- Versions observées : Node `v22.21.1`, Next `16.4.0`, React `19.3.0`, TypeScript `6.0.3`, ESLint `9.39.5`, Playwright `1.64.1`.

Après ces contrôles, seuls des documents ont été ajoutés/modifiés. Ne pas annoncer de nouveau passage lint/build/tests pour le handoff. Réutiliser les preuves si contenu testé, commande, périmètre et contexte sont équivalents ; sinon exécuter uniquement les contrôles manquants/invalidés. Les hooks et la CI distante restent indépendants.

### Questions ouvertes et prochaines étapes

1. Demander ce que l’utilisateur veut faire ensuite : aucune nouvelle fonctionnalité n’est implicitement approuvée.
2. Si recette souhaitée, obtenir l’URL Vercel, vérifier que le déploiement correspond à `2a60c4c`, puis tester sur les téléphones cibles : installation, cache initial, mode avion, création automatique/manuelle, reprise, baguette, jardin et mise à jour sans perte de données.
3. Recueillir le retour sur la création simplifiée et la proposition de difficulté. N’ajuster les règles ou l’interface qu’après validation du besoin.
4. Pour la suite produit, choisir avec l’utilisateur entre robustesse de la saisie, polish/fiabilité et OCR maths V1. Les phases ci-dessous sont une feuille de route, **pas une autorisation de commencer**.
5. Si audit demandé, reproduire avant correction les pistes anciennes non confirmées : ailes potentiellement visibles avant révélation, parties répétées/tronquées sans effet visuel, diversité réelle du catalogue, fidélité des biomes/directions et gestes/centrage mobile. Ces pistes ne sont pas des bugs actuellement démontrés.
6. Si les documents locaux doivent être livrés, proposer leur périmètre et message avant un nouveau commit ; ne pas les intégrer silencieusement à un changement de code.

### Points d’arrêt et sécurité

- Aucun nouveau commit/push/changement de branche/merge/PR/déploiement manuel sans demande ou accord approprié. Préserver l’index et les changements utilisateur ; pas de stash, reset destructif, rebase, force-push ou contournement des hooks/signatures.
- Ne jamais lire/copier ni ajouter `.env*` (même `.env.example`), secrets, identifiants réels, credentials, clés, fichiers générés ou lockfiles générés. Ne pas installer de dépendances automatiquement. Si une exclusion rend la livraison incohérente, arrêter et expliquer.
- Laisser la clé IA serveur non configurée sur une exposition publique tant que les protections d’accès et de débit ne sont pas établies. Un abonnement ChatGPT n’est pas une clé API ; aucun appel IA payant nécessaire au fonctionnement local.
- Skills globales disponibles sous `%USERPROFILE%/.agents/skills/` : `commit`, `kb-capture`, `ship`. Elles sont hors du dépôt applicatif ; lire leurs contrats si invoquées. Les raccourcis Pi ne sont pas des exécutables shell.
- `commit` possède les contrôles locaux lorsqu’il y a des changements à committer ; `ship` réutilise les preuves au lieu de relancer les mêmes tests. `kb-capture` laisse ses documents non committés et ne lance pas de livraison récursive.
- Certains chargements de skills ont échoué pour authentification ; la dernière review a été manuelle et annoncée comme telle. Aucun outil GitHub de création de PR n’était disponible lors de la dernière livraison ; redécouvrir les capacités si une PR devient nécessaire.

---

## Vision complète

**Le Jardin des Devoirs** est une PWA mobile où :

1. le parent crée ou scanne les devoirs ;
2. l’enfant fait les exercices ;
3. chaque réussite révèle une partie de créature ;
4. la créature complète rejoint un jardin vivant ;
5. les créatures sont mignonnes, variées, parfois étranges, jamais effrayantes ;
6. le système reste centré sur les devoirs du soir, pas sur un programme scolaire complet.

---

## État actuel

Base jouable, avec PWA hors ligne et création adaptative livrées. Les phases ci-dessous conservent des objectifs historiques, dont certains sont déjà réalisés : consulter les sections Avancement et la reprise ci-dessus avant de traiter un item comme restant à faire.

Fonctionnalités :

- PWA Next.js ;
- génération d’additions avec passage de dizaine ;
- saisie manuelle ;
- clavier numérique ;
- révélation progressive ;
- créatures locales procédurales ;
- jardin 2D isométrique ;
- settings pour activer/désactiver l’IA créature ;
- code IA conservé mais désactivé par défaut ;
- GitHub initialisé.

---

## Phase 1 — Stabiliser la boucle addition + créature 2D

Objectif : rendre l’expérience enfant agréable et fluide.

À faire :

- polir l’écran calcul ;
- améliorer l’animation de bonne réponse ;
- améliorer l’animation de mauvaise réponse ;
- rendre la révélation de partie plus magique ;
- améliorer les créatures locales ;
- améliorer le jardin 2D ;
- cliquer sur une créature dans le jardin pour voir sa fiche ;
- garder la PWA simple et rapide.

Pourquoi : si cette boucle n’est pas fun, OCR/IA/3D ne serviront pas beaucoup.

---

## Phase 2 — Créatures locales V2

Objectif : avoir un système fiable de créatures procédurales avant de dépendre de l’IA.

À faire :

- plus de morphologies : rondes, feuilles, champignons, gouttes, petits dragons doux, lucioles, aquatiques, nocturnes ;
- plus de parties révélables : yeux, bouche, oreilles, cornes douces, queue, ailes, motifs, aura, accessoires, ventre, antennes ;
- plus de mouvements : marche, sautille, vole, flotte, nage, amphibie ;
- plus d’animations 2D ;
- règles par biome ;
- créatures plus reconnaissables entre elles.

Cette phase prépare la 3D et l’IA.

---

## Phase 3 — IA de créature contrôlée

Objectif : utiliser l’IA pour imaginer la créature, pas encore pour générer une image libre.

Pipeline recommandé :

```text
OpenAI
→ manifest JSON
→ validation Zod
→ rendu local procédural
```

L’IA génère :

- nom ;
- personnalité ;
- description ;
- biome ;
- mode de déplacement ;
- palette ;
- choix de parties ;
- style général.

Le moteur local reste responsable de :

- rendre la créature ;
- garantir le style enfant ;
- éviter les monstres ratés ;
- révéler les parties ;
- animer.

Pourquoi pas image IA tout de suite : une image générée librement est difficile à découper, animer, contrôler, rendre cohérente en vue isométrique et afficher sous plusieurs angles.

---

## Phase 4 — Saisie devoirs V2

Objectif : rendre la saisie manuelle robuste avant l’OCR.

Formats à accepter :

```text
115+9
115 + 9 =
115 + 9 = 124
1. 115 + 9
a) 127 + 8
```

À faire :

- parser plus de formats ;
- afficher le nombre de calculs détectés ;
- afficher les lignes ignorées ;
- permettre au parent de corriger avant de lancer.

Exemple :

```text
8 calculs détectés
2 lignes ignorées
```

---

## Phase 5 — OCR des devoirs

Objectif : permettre au parent de prendre une photo de la fiche de devoirs.

Pipeline :

```text
photo de la fiche
→ OCR
→ LLM de structuration
→ extraction des exercices
→ validation parent
→ création de session
```

Contraintes :

- validation parent obligatoire avant que l’enfant commence ;
- les photos sont utilisées pour l’analyse ;
- les photos ne sont pas affichées à l’enfant ;
- les photos sont supprimées après traitement ;
- pas de stockage durable par défaut.

Première cible OCR :

- additions ;
- additions avec passage de dizaine ;
- puis soustractions plus tard.

---

## Phase 6 — Autres exercices de maths

**Livré le 26 octobre 2026 :** comparaison de deux nombres (« lequel est le plus grand ? »), suites croissantes à pas constant avec un nombre manquant, soustractions (sans emprunt au niveau facile) et tables de multiplication personnalisables de 0 à 12. Moteur de session commun, modules indépendants, progression séparée par type et historique jouable après désinscription. Voir `docs/EXERCISE-MODULES.md`. Lecture et écriture restent différées.

Restent notamment, après les additions avec passage de dizaine :

- additions sans passage ;
- compléments à 10 / 100 ;
- calculs à trous.

Exemples :

```text
8 + __ = 12
120 - 7
6 × 4
```

Toujours avec la même logique :

```text
session courte → créature → jardin
```

Pas de programme scolaire complet.

---

## Phase 7 — Écriture manuscrite

Objectif : l’enfant écrit une lettre, un mot ou une phrase, et l’IA donne un feedback doux.

Pipeline :

```text
consigne d’écriture
→ enfant écrit sur écran ou photo du cahier
→ analyse IA
→ feedback textuel doux
```

Feedback souhaité :

```text
Ton mot est lisible.
Essaie de faire le “t” un peu plus grand.
```

À éviter :

```text
Mauvais.
Raté.
Illisible.
```

Contraintes données :

- analyse ;
- feedback ;
- suppression de l’image après traitement.

---

## Phase 8 — Lecture

Objectif : étendre l’app aux devoirs de lecture.

Idées possibles :

### Lecture de mots

```text
chat
maison
lune
```

### Lecture de phrases courtes

```text
Le chat dort.
La lune brille.
```

### Compréhension simple

```text
Qui dort ?
- Le chat
- Le chien
- L’oiseau
```

### Lecture à voix haute avec IA

Pipeline futur :

```text
phrase affichée
→ enfant lit à voix haute
→ transcription audio
→ comparaison douce
→ feedback
```

Exemple feedback :

```text
Tu as bien lu presque toute la phrase.
Essaie encore le mot “brille”.
```

À traiter prudemment :

- reconnaissance vocale enfant imparfaite ;
- validation parent possible ;
- feedback très doux ;
- pas de sanction automatique.

---

## Phase 9 — Jardin V2

Objectif : rendre le jardin plus vivant.

À faire :

- meilleur centrage mobile ;
- créatures qui restent dans leur biome ;
- cliquer sur une créature pour ouvrir sa fiche ;
- petites animations idle ;
- déplacements plus naturels ;
- différences visibles selon mouvement : marche, nage, vole, sautille ;
- zones : prairie, mare, forêt, champignons, clairière nocturne.

Pas encore :

- décoration manuelle ;
- boutique ;
- monnaie ;
- streak ;
- compétition.

---

## Phase 10 — 2D multi-directionnelle

Objectif : faire le pont entre la 2D actuelle et la 3D.

Pour chaque créature :

```text
front
back
left
right
```

Avec animations :

```text
idle
walk
hop
fly
sleep
```

Limite : si les créatures sont très génératives, créer automatiquement 4 vues cohérentes devient difficile. C’est là que la 3D devient intéressante.

---

## Phase 11 — 3D

Objectif : avoir des créatures qui se déplacent naturellement dans le jardin isométrique.

Approche recommandée :

```text
kit 3D modulaire
→ assemblage de parties
→ animations par archétype
→ rendu Three.js
```

Pipeline :

```text
base body
+ yeux
+ oreilles
+ queue
+ ailes
+ motifs
+ couleur
+ rig/mouvement
→ modèle vivant
```

Formats :

- `.glb` / `.gltf` ;
- Three.js ;
- éventuellement React Three Fiber plus tard.

Animations par archétype :

- marcheur ;
- sauteur ;
- volant ;
- nageur ;
- flottant ;
- amphibie.

Pourquoi plus tard :

- modélisation ;
- rigging ;
- animation ;
- performance mobile ;
- pipeline d’assets ;
- cohérence visuelle.

---

## Phase 12 — IA visuelle plus avancée

Options futures :

### A. IA génère concept 2D

L’IA génère une image conceptuelle, mais le jeu utilise toujours le rendu local.

### B. IA génère des sprites

Plus difficile, car il faut :

- transparence ;
- cohérence entre vues ;
- découpage en parties ;
- style stable.

### C. IA aide à produire modèle 3D

Prometteur, mais pas encore assez fiable pour une app enfant propre.

---

## Ordre recommandé

### Court terme

1. Polish gameplay actuel
   - animation réponse juste/fausse ;
   - meilleure révélation ;
   - meilleur écran fin ;
   - meilleur jardin mobile.

2. Créatures locales V2
   - plus de diversité ;
   - plus d’animations ;
   - meilleurs biomes ;
   - fiche info dans jardin.

3. Saisie devoirs V2
   - parser plus de formats ;
   - montrer lignes invalides ;
   - validation parent plus claire.

### Moyen terme

4. OCR maths
   - photo ;
   - extraction ;
   - validation parent ;
   - suppression image.

5. Nouveaux types de calculs
   - soustractions ;
   - compléments ;
   - calculs à trous ;
   - multiplications simples.

6. IA créature contrôlée
   - réactiver le toggle ;
   - améliorer prompts ;
   - manifest JSON ;
   - rendu local sécurisé.

### Long terme

7. Écriture manuscrite
   - capture ;
   - analyse lisibilité ;
   - feedback doux.

8. Lecture
   - lecture de mots ;
   - phrases courtes ;
   - compréhension ;
   - voix plus tard.

9. 2D multi-directionnelle
   - avant/arrière/gauche/droite ;
   - animations directionnelles.

10. 3D
    - Three.js ;
    - modèles GLB ;
    - kit modulaire ;
    - animations par archétype.

---

## Prochaine étape recommandée

Pour rester aligné avec la vision originale tout en avançant utilement :

1. **Saisie devoirs V2**
   - utile tout de suite ;
   - prépare l’OCR ;
   - reste aligné avec “devoirs du soir à la volée”.

2. **Créatures locales V2**
   - améliore le plaisir immédiat ;
   - prépare la 2D multi-directionnelle et la 3D.

3. **OCR maths V1**
   - idée centrale du produit ;
   - plus complexe, donc à aborder après une base plus robuste.

---

## Avancement — créatures locales V2 / polish gameplay

Décisions prises :

- la perte des anciennes sessions avait été acceptée pour la refonte initiale ; les évolutions suivantes ont ajouté la compatibilité avec l’historique, à préserver désormais sans reset automatique ;
- les créatures locales deviennent la source par défaut ;
- le code IA reste présent et activable via Settings ;
- les créatures locales sont tirées sans répétition jusqu’à épuisement du catalogue ;
- la page Calcul garde une vue frontale ;
- le jardin utilise les directions 2D ;
- le jardin devient plus grand que l’écran et navigable par swipe/scroll ;
- les créatures du jardin ouvrent une fiche info au tap/clic.

Implémenté :

- catalogue local typé de 100 créatures ;
- modèle créature enrichi : rareté, traits visuels, styles d’yeux, ailes, antennes, pattes, aura, taille, inclinaison ;
- rendu SVG procédural enrichi ;
- directions 2D `down`, `up`, `left`, `right` utilisées dans le jardin ;
- animations selon mouvement : marche/flotte/vole/sautille/nage ;
- jardin agrandi avec nouveaux terrains `stone` et `glow` ;
- créatures contraintes par terrain et biomes préférés ;
- fiche créature dans le jardin ;
- polish bonne réponse / mauvaise réponse : vibration si disponible, animation visuelle, courte pause après révélation.

## Avancement — PWA installable et hors ligne

Implémenté :

- manifeste complet, icônes PNG et Apple, zones de sécurité mobile ;
- aide d’installation Android/Chrome et Safari/iOS ;
- service worker Serwist en production, précache des ressources et coquille locale `/offline` ;
- création, calculs, reprise et jardin disponibles sans réseau après préparation initiale du cache ;
- navigation hors ligne dédiée, y compris pour les nouveaux identifiants de session ;
- génération locale automatique hors ligne, API IA non mise en cache ;
- proposition de mise à jour avec activation explicite, sans rechargement automatique au retour du réseau ;
- tests navigateur de production pour installation/métadonnées, parcours hors ligne et mise à jour conservant les données locales.

Limites : première ouverture avec Internet nécessaire ; IA et futur OCR nécessitent le réseau ; persistance locale uniquement. Installation native et mode avion à confirmer sur les téléphones cibles après déploiement.

## Avancement — création rapide et difficulté proposée

- Écran simplifié : nombre de calculs visible, bouton Commencer ; difficulté/bornes numériques et aperçu repliés.
- Aucun clic Générer obligatoire : la liste est prête dès l’ouverture et suit les changements du nombre choisi.
- Saisie manuelle toujours disponible ; réglages personnalisés facultatifs et retour à la proposition.
- Proposition basée sur la dernière session entièrement résolue, en ignorant les sessions inachevées ; longueur conservée, jamais augmentée automatiquement.
- À partir de 5 calculs avec données d’essais exploitables : au moins 40 % de calculs réessayés propose un palier plus doux ; 3 sessions consécutives au même palier avec au plus 10 % chacune permettent un palier supérieur. Sinon, maintien.
- Une difficulté isolée ne pèse qu’un calcul, quel que soit le nombre de nouvelles tentatives ; les bornes personnalisées restent sous le contrôle du parent.
- Réglages de génération et date de résolution enregistrés pour les nouvelles sessions ; lecture compatible de l’ancien historique, avec estimation du palier quand les réglages manquent.
- Adaptation entièrement locale, sans appel IA, disponible hors ligne. Heuristique V1 à ajuster selon l’usage, pas un diagnostic scolaire ni un parcours imposé.
- Tests des règles, de l’interface mobile, du parcours manuel et de la persistance hors ligne. Protection de la résolution lors d’un retour immédiat au jardin après la dernière réponse.
