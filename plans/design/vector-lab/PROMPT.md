# Consigne de génération — objet vectoriel en X groupes

Cette consigne est un contrat pour une prochaine génération, pas la trace d'un appel API : les trois échantillons du dossier ont été conçus par l'assistant dans la session de travail. Les compter comme trois réussites d'un service automatisé serait trompeur.

Remplacer `{X}` et `{SUJET}` avant utilisation. Pour la première campagne automatisée, figer la consigne, conserver toutes les sorties et tous les refus, enregistrer le modèle, ses paramètres, la latence et le coût. Ne pas sélectionner seulement les meilleurs résultats.

---

Tu es illustrateur pour un jardin miniature destiné aux enfants. Dessine **{SUJET}**, un seul cadeau cohérent composé d'exactement **{X} groupes d'apparition**, dans un document JSON. Ne renvoie aucun Markdown, code exécutable, SVG brut ou explication extérieure au JSON.

## Composer le tout

- Conçois d'abord mentalement l'objet terminé et ses raccords, puis répartis ses parties entre les groupes.
- Illustration douce et arrondie, couleurs naturelles et chaleureuses, léger volume 2.5D obtenu par des formes d'ombre et de lumière, pas par des filtres.
- Un seul ensemble posé sur le sol : pas X objets dispersés, pas de décor de fond, pas de texte ou numéro, pas de personnage.
- Le sol de l'objet se situe vers y = 275. Le dessin tient dans le repère x = 0 à 320, y = 0 à 300 avec une petite marge.
- Les pièces qui se raccordent se chevauchent légèrement pour éviter les interstices. La perspective et la lumière restent cohérentes.
- Les coordonnées des formes sont définitives et communes à tout l'objet. Aucun moteur ne calculera les attaches ou les proportions à ta place.

## Composer la progression

- Exactement {X} groupes, tous non vides, dans leur ordre d'apparition.
- À l'étape k, seuls les groupes 1 à k sont affichés. Aucun déplacement, redimensionnement, masque ou effacement des groupes précédents.
- À l'intérieur d'un groupe et entre les groupes, les dernières formes sont au premier plan.
- Un support apparaît avant ce qu'il porte. Aucun élément flottant dans un état intermédiaire.
- Chaque groupe ajoute un élément visuellement intéressant et perceptible à **150 px de largeur**. Un gros groupe peut contenir plusieurs formes graphiques pour représenter une seule partie.
- Ne pas atteindre le compte avec de minuscules points, des copies presque superposées ou des détails cachés. Pour un X élevé, concevoir un objet naturellement plus riche.
- Éviter qu'une grande pièce tardive cache tout l'intérêt d'une pièce précédente.

## Contrat JSON version 1

Structure exacte (la liste `parts` doit avoir {X} entrées) :

    {
      "version": 1,
      "id": "identifiant-ascii-unique",
      "name": "Nom du cadeau",
      "description": "Description de la composition",
      "viewBox": [0, 0, 320, 300],
      "palette": ["#8B6D4E", "#A9BE7B"],
      "parts": [
        {
          "id": "identifiant-du-groupe",
          "label": "Ce que cette étape ajoute",
          "shapes": [
            {"tag": "path", "attrs": {"d": "M140 270L150 150L170 150L180 270Z", "fill": "#8B6D4E"}}
          ]
        }
      ]
    }

- `id` et les identifiants de groupes : 1 à 60 caractères, minuscules ASCII, chiffres et tirets ; identifiants de groupes uniques.
- Nom : 1 à 100 caractères ; description : au plus 500 ; label de groupe : 1 à 150.
- Palette : 1 à 24 couleurs hexadécimales de six chiffres. Toute couleur utilisée doit être dans cette palette. `none` est autorisé.
- De 1 à 40 groupes pour ce lecteur expérimental. De 1 à 30 formes par groupe, au plus 500 formes au total.
- Formes autorisées et attributs géométriques requis :
  - `path` : `d` (commandes SVG et nombres uniquement, au plus 4000 caractères) ;
  - `circle` : `cx`, `cy`, `r` ;
  - `ellipse` : `cx`, `cy`, `rx`, `ry` ;
  - `rect` : `x`, `y`, `width`, `height`, éventuellement `rx` ;
  - `line` : `x1`, `y1`, `x2`, `y2` ;
  - `polyline` : `points` (nombres séparés par espaces ou virgules, au plus 2000 caractères).
- Apparence : `fill`, `stroke`, `stroke-width` ; `stroke-linecap` pour path/line/polyline ; `stroke-linejoin` pour path/polyline. Pas de `fill` pour line.
- Définir explicitement au moins `fill` ou `stroke` pour chaque forme. Pour un trait seul, utiliser `fill: "none"` quand la forme accepte fill.
- Attributs numériques : nombres JSON finis, pas chaînes, valeur absolue au plus 640. Rayons, dimensions et épaisseurs non négatifs ; épaisseur au plus 12. Extrémités : round/butt/square ; jonctions : round/miter/bevel.
- Rien d'autre : aucun script, style, lien, image externe, texte SVG, événement, filtre, masque, dégradé, transformation ou référence `url(...)`.

Vérifie le compte des groupes, les raccords, l'ordre des supports, les limites du dessin et l'intérêt de chaque ajout avant de rendre le JSON.
