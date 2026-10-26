# Jardin B — plan d’implémentation

## Périmètre autorisé

- Jardin illustré agrandi, sol continu sans dalles, grande mare, végétation et plateau relié par rampe ; conserver les coordonnées des anciens placements et les données locales.
- Sessions nouvelles : dix décors terminés et récupérés ouvrent droit à une créature. Les anciennes sessions restent jouables telles quelles et ne consomment pas le nouveau cycle. Un numéro de réservation est attribué à la création ; les sessions simplement commencées ne comptent pas comme décors gagnés, et le cadeau réservé ne change pas après interruption.
- Cadeau secret jusqu’à résolution ; un changement visible par bonne réponse, étapes déterministes enregistrées ; cadeau complet et plaçable après résolution. Pas de chrono.
- Placement sur grille invisible, empreinte multiple, collisions/terrain/altitude contrôlés ; appui long puis glissement pour déplacer ; annulation sans perte. Alternative accessible par boutons et clavier. Réserve pour les cadeaux non placés.
- Catalogue local varié sans répétition de recette avant épuisement ; IA facultative, recette contrainte et validée, repli local et aucun appel pendant les calculs.

## Séquence

1. Modèles compatibles, recettes et attribution des cadeaux ; règles de terrain/hauteur/placement et tests purs.
2. Moteur SVG partagé et révélation de 1 à 40 étapes ; création et résolution compatibles avec les anciennes sessions.
3. Paysage continu et décor de fond ; profondeur, déplacement des créatures et caméra ; placement tactile/clavier, réserve.
4. IA facultative désactivée côté serveur par défaut et réglage distinct ; documentation des limites de sécurité.
5. Tests production Chromium mobile : surprise, reprise, ratio, placement/déplacement/collisions, hors-ligne ; lint/build et tests existants adaptés au nouveau comportement.

## Garde-fous

Ne pas toucher aux secrets, installer de dépendances, effacer les données ou livrer. Préserver docs/PRD.md, plans/roadmap.md et docs/knowledge/ préexistants. Les maquettes restent des artefacts de référence. Pas de commit/push. Safari et téléphone physique ne seront pas prouvés par Chromium.
