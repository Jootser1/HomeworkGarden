# Roadmap — Le Jardin des Devoirs / Homework Garden

Ce document sert de référence pour les prochaines sessions de développement.

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

Base V0 jouable :

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

Après les additions avec passage de dizaine :

- additions sans passage ;
- soustractions simples ;
- soustractions avec passage ;
- compléments à 10 / 100 ;
- petites multiplications ;
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

- les anciennes sessions locales peuvent être perdues ;
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
