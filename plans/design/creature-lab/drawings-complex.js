/* Étude 02 : dessins locaux originaux, pas de réponse API ni moteur d'anatomie. */
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const ellipse = (x, y, rx, ry, fill) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const line = (d, color, width = 4) => path(d, 'none', `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`);
const part = (label, svg) => ({ label, svg });
const eye = (x, y) => ellipse(x, y, 4, 5, '#263d3b') + ellipse(x - 1, y - 2, 1.4, 1.8, '#fff9e9');

const deer = { id: 'cerf-cathedrale', name: 'Cerf-cathédrale', material: 'Bois vivant · 20 étapes', note: 'Une silhouette haute et asymétrique : de longues pattes, un manteau feuillu et des ramures comme les voûtes d’un sous-bois.', parts: [
  part('Corps élancé', path('M101 153Q137 125 184 145Q210 163 186 195Q147 207 109 188Q97 177 101 153Z', '#9ba887')),
  part('Poitrail et cou dressé', path('M174 182Q183 152 180 118L170 103L184 91Q215 105 212 135L204 182L190 200Z', '#b9c09b')),
  part('Tête de profil', path('M180 111Q165 102 171 86Q179 74 201 82L226 98Q240 102 236 112Q214 124 193 113Z', '#c5caa6')),
  part('Patte arrière éloignée', path('M122 181L133 215L119 251L109 251L119 215L108 190Z', '#728673') + path('M109 246L120 246L119 255L105 255Z', '#4a665c')),
  part('Patte avant éloignée', path('M184 185L192 217L189 252L179 252L181 216L174 192Z', '#728673') + path('M179 247L190 247L193 256L178 256Z', '#4a665c')),
  part('Patte arrière proche', path('M111 178Q98 195 108 213L96 247L108 250L123 214L124 187Z', '#a5b291') + path('M96 246L108 247L108 257L92 257Z', '#4a665c')),
  part('Patte avant proche', path('M197 176L208 184L208 220L220 249L210 252L196 222Z', '#b9c09b') + path('M209 247L221 247L224 256L209 256Z', '#4a665c')),
  part('Queue en feuille', path('M105 164Q66 173 61 145Q88 136 105 164Z', '#6c8e77') + line('M72 150L100 163', '#bad0a1', 3)),
  part('Oreilles en amande', path('M179 91Q150 90 149 70Q173 65 187 87ZM197 84Q204 61 218 66Q223 84 202 94Z', '#8ba583') + path('M178 86L158 75L181 91Z', '#d9c9a5')),
  part('Visage et museau', eye(207, 99) + ellipse(231, 106, 5, 3.5, '#4a665c') + line('M214 113Q224 117 229 112', '#69836d', 2.5)),
  part('Ramure gauche maîtresse', line('M184 86Q166 64 157 35L138 19M157 35L154 14', '#8e7154', 7)),
  part('Ramure droite maîtresse', line('M197 83Q219 62 228 38L248 23M228 38L225 14', '#8e7154', 7)),
  part('Voûtes de la ramure gauche', line('M169 61Q139 63 125 39L111 31M145 58L142 33M159 39L177 24', '#a18a64', 5)),
  part('Voûtes de la ramure droite', line('M211 67Q247 67 263 43L274 37M244 63L249 43M225 44L207 27', '#a18a64', 5)),
  part('Feuilles des bois gauches', path('M126 40Q102 49 97 35Q108 20 126 40ZM142 35Q124 19 139 15Q152 17 142 35ZM175 27Q171 7 188 15Q194 24 175 27Z', '#7d9d7e')),
  part('Feuilles des bois droits', path('M248 27Q253 6 267 18Q267 30 248 27ZM262 46Q279 26 288 42Q282 55 262 46ZM209 30Q190 29 192 14Q209 11 209 30Z', '#9fb78b')),
  part('Manteau de grandes feuilles', path('M115 142Q104 166 122 181Q137 169 134 143ZM138 140Q126 170 146 190Q164 167 156 141ZM160 143Q154 169 172 181Q191 160 179 145Z', '#698d77') + line('M123 151L124 169M145 150L147 178M170 151L170 170', '#aec39c', 3)),
  part('Collerette du poitrail', path('M185 127Q200 140 210 128L208 149L197 143L191 160L183 144L176 145Z', '#e7d8ac')),
  part('Fleurs suspendues aux ramures', line('M126 43L123 64M264 46L266 67', '#78927a', 2.5) + path('M112 64Q121 49 132 63L134 74Q123 81 111 74ZM255 68Q265 53 276 66L279 78Q265 86 253 78Z', '#cf9b91') + ellipse(122, 73, 5, 3, '#f0d19b') + ellipse(266, 77, 5, 3, '#f0d19b')),
  part('Motifs de lumière sur le flanc', ellipse(117, 184, 4, 5, '#e9dcaf') + ellipse(140, 191, 4, 5, '#e9dcaf') + ellipse(163, 188, 4, 5, '#e9dcaf') + line('M188 162Q185 177 188 185', '#dfd7ad', 4)),
]};

const sea = { id: 'hippocampe-corail', name: 'Hippocampe-corail', material: 'Nacre & corail · 20 étapes', note: 'Un corps vertical sculpté, une queue enroulée et une couronne de corail. La richesse vient de son anatomie, pas d’un petit animal déguisé.', parts: [
  part('Tronc et queue spiralée', path('M151 91Q180 106 161 133Q145 154 154 171Q165 184 185 190Q229 193 224 226Q220 258 184 258Q153 257 156 230Q158 209 177 214Q187 219 177 229Q174 234 184 237Q202 241 204 226Q207 214 174 212Q114 212 107 169Q99 130 130 104Z', '#78a9aa')),
  part('Cou en arche', path('M145 136Q163 116 151 98L143 87L159 72Q182 87 177 109Q172 129 157 144Z', '#8dbbb7')),
  part('Tête et museau tubulaire', path('M161 99Q141 109 122 93L96 94Q85 88 91 76L120 73Q136 54 159 65Q181 80 161 99Z', '#a6c9bc')),
  part('Ventre nacré', path('M148 129Q126 155 148 177Q159 187 181 189L177 208Q140 207 121 184Q101 155 130 125Z', '#e5d6ae')),
  part('Grande nageoire dorsale', path('M113 130Q72 113 64 140L85 151L61 166L88 179L76 201Q113 208 123 184Q106 159 113 130Z', '#c794a1') + line('M107 148L77 139M106 162L76 164M111 178L90 190', '#e9bdba', 3)),
  part('Visage et joue', eye(137, 81) + ellipse(149, 94, 8, 5, '#d3a4a4') + line('M93 86L109 84', '#557e83', 3)),
  part('Crête du front', path('M139 65L134 45L146 50L151 32L160 52L175 43L173 67Z', '#d4b274')),
  part('Branche de corail arrière', line('M170 84L198 64L208 39M195 66L221 67M204 49L191 31', '#bd858d', 8)),
  part('Branches du corail supérieur', line('M207 41L225 26M218 66L238 49M218 66L236 84M191 34L175 24', '#ce9ba0', 6)),
  part('Polypes du corail', ellipse(225, 25, 8, 9, '#e6b5aa') + ellipse(238, 48, 8, 9, '#e6b5aa') + ellipse(237, 84, 8, 9, '#e6b5aa') + ellipse(174, 24, 8, 9, '#e6b5aa')),
  part('Première plaque de nacre', path('M128 137Q136 128 148 130L143 145Q133 149 124 145Z', '#f3e9cb')),
  part('Deuxième plaque de nacre', path('M123 151Q132 151 140 150L141 163Q130 167 122 160Z', '#f3e9cb')),
  part('Troisième plaque de nacre', path('M128 171L145 169L154 179L140 187Z', '#f3e9cb')),
  part('Quatrième plaque de nacre', path('M149 187L162 183L176 189L172 203L157 199Z', '#f3e9cb')),
  part('Nageoire pectorale', path('M161 125Q197 109 204 126Q194 148 162 145Z', '#c794a1') + line('M169 135L193 127', '#f0c8b6', 3)),
  part('Épines du dos', path('M111 135L92 123L105 151ZM111 171L94 183L120 187ZM132 196L122 216L148 206Z', '#4e8c94')),
  part('Aileron de la boucle', path('M215 218Q244 211 249 232Q240 253 217 241Z', '#c794a1') + line('M222 231L240 232', '#f0c8b6', 3)),
  part('Gravure de la queue', line('M188 201Q220 204 214 231Q210 247 191 248', '#b9d5c6', 5)),
  part('Couronne de petites branchies', line('M169 103L184 94M172 112L191 108M167 121L186 123', '#4f8c93', 5)),
  part('Écailles du cou', path('M158 91L170 85L173 96L163 104ZM155 106L166 102L165 114L154 119Z', '#d3e4c9') + ellipse(155, 74, 4, 5, '#e8d3a3')),
]};

// Les coordonnées de chaque plume sont composées pour CET oiseau uniquement.
// Le helper dessine une plume, pas un gabarit de créature partagé entre personnages.
function feather(x, y, tx, ty, width, color) {
  const dx = tx - x, dy = ty - y, length = Math.hypot(dx, dy);
  const nx = -dy / length * width, ny = dx / length * width;
  const mx = x + dx * .55, my = y + dy * .55;
  return path(`M${x} ${y}Q${mx + nx} ${my + ny} ${tx} ${ty}Q${mx - nx} ${my - ny} ${x} ${y}Z`, color)
    + line(`M${x} ${y}L${x + dx * .82} ${y + dy * .82}`, '#e5cdac', 1.8);
}
const birdParts = [
  part('Corps en amande', path('M158 100Q125 109 131 150Q136 180 160 188Q187 174 188 145Q190 113 170 104Z', '#739f9e')),
  part('Cou et tête relevée', path('M145 121Q148 105 144 92Q126 83 137 65Q147 53 163 61Q186 70 174 90L170 119Z', '#8eb4ac')),
  part('Visage et bec', path('M138 71L121 81L140 85Z', '#d3ae73') + eye(150, 73) + path('M159 69Q174 74 167 86Q160 88 158 82Z', '#dfc7a0')),
  part('Attache de l’aile gauche', path('M145 124Q115 83 64 87Q80 126 134 150Z', '#658d91')),
  part('Attache de l’aile droite', path('M174 123Q209 82 257 87Q241 127 184 149Z', '#658d91')),
  part('Patte gauche', line('M148 174L135 195L122 199M135 195L139 202', '#ab875e', 5)),
  part('Patte droite', line('M174 174L188 195L201 197M188 195L184 203', '#ab875e', 5)),
  part('Longue plume de queue centrale', feather(160, 174, 160, 266, 19, '#527d88')),
  part('Longue plume de queue gauche', feather(153, 174, 108, 256, 17, '#8ba9a3')),
  part('Longue plume de queue droite', feather(168, 174, 212, 256, 17, '#8ba9a3')),
];
const leftPrimaries = [
  [88, 103, 32, 33, 17], [82, 110, 18, 53, 17], [80, 117, 14, 78, 17], [85, 126, 14, 105, 17],
  [94, 134, 22, 135, 16], [106, 140, 38, 160, 16], [119, 145, 61, 181, 16], [132, 147, 89, 192, 15],
];
const colors = ['#597f8f', '#729ba3', '#a0b8ad', '#c5b49d', '#be8f92', '#a87889', '#8c7894', '#767e99'];
leftPrimaries.forEach(([x, y, tx, ty, w], i) => birdParts.push(part(`Grande plume gauche ${i + 1}`, feather(x, y, tx, ty, w, colors[i]))));
leftPrimaries.forEach(([x, y, tx, ty, w], i) => birdParts.push(part(`Grande plume droite ${i + 1}`, feather(320 - x, y, 320 - tx, ty, w, colors[i]))));
[
  [132, 134, 59, 88, 14], [138, 141, 68, 112, 14], [142, 147, 83, 139, 14], [144, 154, 108, 167, 13],
].forEach(([x, y, tx, ty, w], i) => birdParts.push(part(`Couverture de l’aile gauche ${i + 1}`, feather(x, y, tx, ty, w, ['#d8c5a7', '#c6bda2', '#a4b9a3', '#86a8a0'][i]))));
[
  [132, 134, 59, 88, 14], [138, 141, 68, 112, 14], [142, 147, 83, 139, 14], [144, 154, 108, 167, 13],
].forEach(([x, y, tx, ty, w], i) => birdParts.push(part(`Couverture de l’aile droite ${i + 1}`, feather(320 - x, y, 320 - tx, ty, w, ['#d8c5a7', '#c6bda2', '#a4b9a3', '#86a8a0'][i]))));
birdParts.push(
  part('Aigrette centrale', feather(154, 63, 154, 17, 12, '#d2ad78')),
  part('Aigrette gauche', feather(150, 63, 126, 28, 12, '#b98d8e')),
  part('Aigrette droite', feather(159, 63, 184, 28, 12, '#b98d8e')),
  part('Collerette du cou', path('M140 103Q158 119 177 102L178 120L168 115L160 129L150 116L140 121Z', '#eedabb')),
  part('Plumes du poitrail', path('M143 136Q151 126 158 139Q163 127 173 137L169 150L160 144L152 155L144 149ZM150 159L160 151L171 158L161 173Z', '#c4d1b4')),
  part('Trois ocelles de la queue', ellipse(123, 231, 8, 11, '#d8b477') + ellipse(160, 242, 9, 12, '#d8b477') + ellipse(197, 231, 8, 11, '#d8b477') + ellipse(123, 231, 3.5, 5, '#597f8f') + ellipse(160, 242, 4, 6, '#597f8f') + ellipse(197, 231, 3.5, 5, '#597f8f')),
);
const bird = { id: 'oiseau-aurores', name: 'Oiseau des aurores', material: 'Plumage irisé · 40 étapes', note: 'Une silhouette en éventail ouvert, des ailes à deux rangées de plumes et une queue à ocelles. Quarante étapes pour construire un véritable grand plumage.', parts: birdParts };
window.CreatureConcepts = [deer, sea, bird];
