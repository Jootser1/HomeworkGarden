// Four authored compositions, not a combinatorial creature generator.
// Geometry and reveal order are explicit. Helpers only abbreviate SVG primitives.
(() => {
  const ink = '#41554F', cream = '#F2E5C8', sand = '#C9AE83', stone = '#A7B5AA'
  const green = '#6B956F', light = '#ADC796', dark = '#476D5C', rose = '#C88789'
  const coral = '#DEAB93', blue = '#87B7BC', pale = '#C7DDCC', gold = '#D9B875'
  const plum = '#8E7E9B', bark = '#94765D', white = '#FFF6DF'
  const P = (d, fill, stroke = ink, width = 2) => ({ tag: 'path', attrs: { d, fill, stroke, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } })
  const E = (cx, cy, rx, ry, fill, stroke = ink) => ({ tag: 'ellipse', attrs: { cx, cy, rx, ry, fill, stroke, 'stroke-width': 2 } })
  const C = (cx, cy, r, fill, stroke = ink) => ({ tag: 'circle', attrs: { cx, cy, r, fill, stroke, 'stroke-width': 2 } })
  const L = (d, stroke = ink, width = 2) => P(d, 'none', stroke, width)
  const part = (id, label, ...shapes) => ({ id, label, shapes })
  const moving = (value, motion) => ({ ...value, motion })
  const flower = (x, y, color) => [P(`M${x} ${y-5}C${x-20} ${y-24} ${x-23} ${y-2} ${x-9} ${y+3}C${x-23} ${y+17} ${x-5} ${y+27} ${x+2} ${y+11}C${x+14} ${y+26} ${x+27} ${y+10} ${x+12} ${y+2}C${x+30} ${y-11} ${x+10} ${y-24} ${x} ${y-5}Z`, color), C(x+2,y+3,5,gold)]
  const palette = [ink,cream,sand,stone,green,light,dark,rose,coral,blue,pale,gold,plum,bark,white]
  const drawing = (id, name, kind, format, description, parts) => ({ id, name, kind, format, description, viewBox: [0,0,320,300], palette, parts })

  const well = drawing('puits-capucines-10', 'Le puits des capucines', 'decor', 10,
    'Un petit puits de pierre, son toit de tuiles et deux capucines débordantes. Dix ajouts construisent un seul lieu.', [
    part('socle', 'La dalle de pierre arrondie', E(160,259,108,22,stone), L('M73 259Q154 284 245 258',cream,3)),
    part('margelle', 'Le corps maçonné du puits', P('M105 202Q161 179 215 202L215 249Q165 273 105 249Z',sand), E(160,202,55,17,cream), E(160,202,40,10,dark), L('M105 225Q162 246 215 225M133 216L133 235M185 233L185 258',bark,3)),
    part('montant-gauche', 'Le montant en bois de gauche', P('M95 211L91 100L103 97L109 213Z',bark), L('M99 116L104 198',sand,3)),
    part('montant-droit', 'Le montant en bois de droite', P('M211 212L216 97L229 99L224 214Z',bark), L('M221 112L216 198',sand,3)),
    part('charpente', 'La charpente relie les deux montants', P('M85 107L160 60L236 106L229 119L160 78L94 121Z',bark), L('M105 108L217 108',bark,7)),
    part('toit', 'Le toit de tuiles en éventail', P('M63 111Q102 76 159 49Q216 72 258 111L244 125Q196 117 160 90Q118 116 76 126Z',rose), L('M95 111L151 62M126 106L160 62M175 75L226 112M187 70L246 111',coral,4)),
    part('treuil', 'Le treuil et sa manivelle', L('M102 147L219 147',bark,9), C(224,147,17,sand), C(224,147,7,bark), L('M236 146L250 157L250 170',bark,5), L('M150 141L150 155M157 141L157 155M164 141L164 155',cream,3)),
    part('seau', 'Le seau suspendu à sa corde', L('M157 155L157 184',sand,3), P('M142 184L173 184L168 211Q155 220 145 210Z',blue), P('M143 187Q155 168 172 187','none'), L('M149 192L151 207M164 191L162 210',pale,2)),
    part('capucine-gauche', 'Une capucine pousse au pied gauche', L('M92 262Q79 240 69 220M83 246Q105 232 112 220',dark,4), P('M80 246Q53 250 49 231Q65 216 80 246M89 250Q104 264 119 242Q106 223 89 250Z',green), ...flower(65,215,coral)),
    part('capucine-droite', 'Une seconde capucine enlace le montant', L('M226 264Q243 234 232 206M236 234Q261 232 265 209',dark,4), P('M235 249Q257 257 269 238Q249 222 235 249M235 222Q211 217 220 202Q239 204 235 222Z',light), ...flower(266,205,rose)),
  ])

  const greenhouse = drawing('serre-fougeres-20', 'La serre des fougères', 'decor', 20,
    'Une serre de poche en cuivre et verre tendre, avec ses plantes, sa table et son arrosoir. Une composition plus ample, pas un puits redécoupé.', [
    part('dalle', 'La terrasse de la serre', P('M39 245L201 218L285 253L121 285Z',stone), L('M121 285L121 273M49 246L122 273L275 250',cream,3)),
    part('soubassement', 'Le soubassement en briques', P('M63 218L187 195L256 222L256 247L132 270L63 245Z',sand), L('M65 232L132 254L254 232M94 229L94 241M157 250L157 261M205 241L205 252',bark,2)),
    part('paroi-gauche', 'La paroi vitrée de gauche', P('M65 220L65 134L133 157L133 246Z',pale), L('M99 146L99 231M65 183L132 204',dark,3)),
    part('paroi-droite', 'La grande paroi arrière', P('M133 157L254 132L254 222L133 247Z',pale), L('M173 150L173 237M213 142L213 229M134 202L254 178',dark,3)),
    part('toit-gauche', 'La première verrière du toit', P('M53 134L118 74L190 96L133 162Z',blue), L('M82 139L143 82M108 149L166 89',pale,3)),
    part('toit-droit', 'La seconde verrière du toit', P('M133 162L190 96L264 130Z',blue), L('M174 153L211 105M214 143L235 117',pale,3)),
    part('faitage', 'Le faîtage de cuivre', L('M117 74L190 96L264 130M53 134L133 162L264 130',bark,6), C(118,74,5,gold), C(190,96,5,gold)),
    part('porte', 'La porte arrondie, ouverte sur le jardin', P('M146 245L146 190Q166 162 185 183L185 237Z',cream), P('M152 231L152 194Q165 175 178 189L178 226Z',pale), C(178,214,3,bark)),
    part('lucarne', 'La lucarne à croisillons', P('M84 164L118 175L118 199L84 188Z',cream), L('M101 172L101 193M88 178L115 187',bark,3)),
    part('corniche', 'La corniche et ses trois consoles', L('M61 215L132 242L258 217',bark,5), L('M77 220L77 208M200 230L200 218M238 222L238 211',bark,4)),
    part('fougere-gauche', 'La grande fougère arborescente', P('M78 224L84 192L94 191L94 228Z',coral), L('M87 198L87 156',dark,3), P('M87 174Q59 161 65 147Q85 145 87 174M87 172Q97 145 113 149Q117 163 87 172M87 185Q63 179 65 166Q81 165 87 185Z',green)),
    part('bananier', 'Le bananier abrité au fond', P('M215 225L217 199L238 195L240 221Z',bark), L('M228 204L228 155',dark,3), P('M228 176Q202 164 205 147Q222 139 228 176M228 165Q235 133 250 141Q257 159 228 165M228 187Q249 164 257 178Q253 192 228 187Z',light)),
    part('suspension-gauche', 'La fougère suspendue à la charpente', L('M121 102L109 130L132 135L121 102',bark,2), P('M105 129Q121 122 137 131L133 145Q118 152 109 143Z',coral), P('M118 135Q96 130 96 151Q110 151 118 135M122 135Q133 149 126 168Q111 154 122 135M127 134Q149 135 146 155Q131 149 127 134Z',green)),
    part('suspension-droite', 'Le lierre retombe de son panier', L('M195 112L182 135L205 135L195 112',bark,2), P('M178 135L208 135L203 150L184 151Z',sand), P('M189 144Q172 160 181 180Q199 167 189 144M197 146Q216 157 211 178Q192 167 197 146Z',dark)),
    part('table', 'La table de rempotage', P('M114 226L165 216L198 231L147 242Z',bark), L('M121 230L121 247M148 240L148 255M191 232L191 246',bark,5)),
    part('pot-central', 'Un pot de pousses sur la table', P('M147 221L169 219L165 233L151 235Z',coral), L('M157 225L157 201',dark,3), P('M157 214Q139 211 142 199Q156 198 157 214M157 209Q169 188 177 200Q176 212 157 209Z',light)),
    part('arrosoir', 'Le petit arrosoir posé sur la terrasse', P('M76 250L94 245L105 258L87 267Z',blue), L('M94 249Q106 234 114 246Q117 253 102 257',dark,4), P('M81 253L65 244L61 247L81 262Z',blue), L('M61 247L57 244',ink,5)),
    part('caissette', 'Une caissette de semis', P('M193 257L231 249L252 259L216 269Z',sand), L('M199 258L218 263L245 258',bark,3), L('M213 260L209 243M227 257L230 240',dark,3), P('M209 250Q194 245 200 237Q211 237 209 250M230 247Q242 232 248 241Q246 251 230 247Z',green)),
    part('pas-jardin', 'Les pierres du chemin devant la porte', E(153,274,17,7,cream), E(191,279,14,6,cream), E(224,280,12,5,cream)),
    part('grimpante', 'La clématite enlace le flanc de la serre', L('M57 245Q38 190 58 153Q68 138 57 132',dark,4), P('M48 220Q26 211 35 197Q51 196 48 220M45 187Q60 163 72 178Q68 194 45 187M52 158Q32 151 38 137Q55 135 52 158Z',green), ...flower(43,170,rose)),
  ])

  const axolotl = drawing('axolotl-nenuphars-30', 'Axolotl des nénuphars', 'creature', 30,
    'Un amphibien doux aux six branchies plumeuses, coiffé d’un jardin de nénuphars. Sa queue et ses branchies respirent sans déplacement du dessin entier.', [
    moving(part('queue', 'La longue queue recourbée', P('M171 215Q227 220 245 171Q252 144 280 146Q304 165 278 196Q247 241 190 247Z',blue)), 'tail'),
    moving(part('nageoire', 'La voile souple de la queue', P('M217 217Q253 186 258 165Q274 152 283 158Q269 195 242 218Z',pale), L('M245 205L270 171',blue,3)), 'tail'),
    part('corps', 'Le corps arrondi de l’axolotl', P('M105 194Q124 161 177 181Q209 195 207 231Q173 263 116 240Z',blue)),
    part('ventre', 'Le ventre nacré', P('M120 215Q152 196 190 216L190 239Q153 254 122 235Z',pale)),
    part('patte-arriere-gauche', 'La patte arrière gauche et ses doigts', P('M176 232Q188 242 185 258L172 265L165 260L169 252L161 244Z',blue), L('M174 253L172 260M180 253L179 260',ink,2)),
    part('patte-arriere-droite', 'La patte arrière droite', P('M199 220Q221 227 221 243L212 251L202 249L205 240L192 235Z',blue), L('M212 240L211 246',ink,2)),
    part('patte-avant-gauche', 'La patte avant gauche tendue', P('M120 221Q109 244 93 247L84 239L86 231L98 231L103 216Z',blue), L('M91 236L91 241M98 236L97 243',ink,2)),
    part('patte-avant-droite', 'La patte avant droite', P('M157 226Q159 248 149 257L137 257L133 249L143 242L142 225Z',blue), L('M140 249L141 254M147 247L146 253',ink,2)),
    part('tete', 'La tête large aux joues douces', P('M74 170Q77 133 125 130Q172 131 180 170Q183 205 130 214Q77 210 74 170Z',blue)),
    moving(part('branchie-gauche-basse', 'La branche inférieure gauche', L('M79 179Q51 187 41 173',plum,7)), 'gill-left'),
    moving(part('branchie-gauche-milieu', 'La branche centrale gauche', L('M79 165Q48 162 41 144',plum,7)), 'gill-left'),
    moving(part('branchie-gauche-haute', 'La branche supérieure gauche', L('M87 148Q57 130 66 110',plum,7)), 'gill-left'),
    moving(part('branchie-droite-basse', 'La branche inférieure droite', L('M174 180Q204 190 216 173',plum,7)), 'gill-right'),
    moving(part('branchie-droite-milieu', 'La branche centrale droite', L('M175 164Q206 159 211 141',plum,7)), 'gill-right'),
    moving(part('branchie-droite-haute', 'La branche supérieure droite', L('M166 146Q191 128 182 108',plum,7)), 'gill-right'),
    moving(part('plume-gauche-basse', 'Le panache inférieur gauche', P('M46 181Q27 188 24 176Q28 168 38 174Q24 157 35 153Q46 153 47 168Q53 156 60 164Q65 178 46 181Z',rose)), 'gill-left'),
    moving(part('plume-gauche-milieu', 'Le panache médian gauche', P('M44 151Q20 151 23 139Q28 132 37 140Q23 121 35 118Q46 121 44 135Q53 122 61 132Q65 145 44 151Z',rose)), 'gill-left'),
    moving(part('plume-gauche-haute', 'Le panache supérieur gauche', P('M64 121Q43 112 48 101Q56 96 62 109Q56 87 68 88Q78 94 72 108Q86 99 91 111Q89 125 64 121Z',coral)), 'gill-left'),
    moving(part('plume-droite-basse', 'Le panache inférieur droit', P('M213 183Q233 190 239 178Q236 168 223 174Q237 158 227 154Q215 153 214 168Q204 156 197 165Q194 180 213 183Z',rose)), 'gill-right'),
    moving(part('plume-droite-milieu', 'Le panache médian droit', P('M211 150Q233 148 232 135Q223 128 217 138Q230 118 217 116Q206 121 210 133Q199 123 192 135Q190 147 211 150Z',rose)), 'gill-right'),
    moving(part('plume-droite-haute', 'Le panache supérieur droit', P('M184 120Q203 111 199 99Q191 94 185 107Q190 86 178 87Q168 93 175 107Q161 98 157 110Q159 124 184 120Z',coral)), 'gill-right'),
    part('oeil-gauche', 'Le premier œil brillant', E(101,174,7,10,ink), C(103,171,2,white,white)),
    part('oeil-droit', 'Le second œil brillant', E(155,174,7,10,ink), C(157,171,2,white,white)),
    part('sourire', 'Le sourire et les joues roses', L('M118 186Q128 196 139 186',ink,3), E(89,187,9,5,coral,coral), E(167,187,9,5,coral,coral)),
    part('nenuphar', 'La feuille de nénuphar sur la tête', P('M101 134Q89 116 113 109Q137 103 150 123L128 126L133 139Z',green), L('M107 122L127 126L119 113',light,3)),
    part('fleur-centrale', 'Le lotus central de la couronne', P('M125 119Q108 106 114 91Q127 93 128 110Q132 88 143 96Q146 111 125 119Z',rose), P('M123 119Q107 122 103 111Q113 104 123 119Z',coral)),
    part('bouton-gauche', 'Le bouton de fleur à gauche', L('M101 129L91 112',dark,3), P('M91 113Q76 109 80 96Q93 91 99 103Z',coral), L('M86 101L91 111',rose,2)),
    part('bouton-droit', 'Le bouton de fleur à droite', L('M144 131L153 114',dark,3), P('M152 116Q145 101 156 94Q170 98 166 112Z',rose), L('M158 101L155 112',coral,2)),
    part('col-feuillu', 'Le col de feuilles au creux du cou', P('M108 211Q125 213 138 209L148 216Q141 234 129 222Q117 239 108 224Z',green), L('M121 220L124 226M138 216L139 223',light,2)),
    part('pendentif', 'Le pendentif en graine dorée', L('M125 219L128 237',sand,3), P('M128 231Q141 241 130 251Q115 244 128 231Z',gold), C(129,239,3,cream)),
  ])

  const turtle = drawing('tortue-archipel-50', 'Tortue-archipel céleste', 'exceptional', 50,
    'Une grande tortue porte un archipel habité : cascades, serre miniature, pont et phare. Cinquante ajouts pour un diorama exceptionnel, pas cinquante écailles.', [
    part('corps', 'Le grand corps de la tortue', P('M54 203Q77 164 172 176Q232 177 253 212Q222 259 119 258Q66 247 54 203Z',blue)),
    part('ventre', 'Le plastron nacré', P('M69 222Q151 246 237 219L226 237Q143 275 83 243Z',cream), L('M108 239L109 253M153 244L155 258M196 237L201 248',sand,3)),
    part('carapace', 'La carapace en forme d’île', P('M48 210Q47 128 144 117Q231 115 254 205Q162 246 48 210Z',dark)),
    part('rebord', 'Le rebord de la carapace', P('M46 204Q149 234 254 198L258 212Q156 253 47 220Z',gold), L('M59 211Q152 239 243 207',cream,3)),
    moving(part('nageoire-arriere-gauche', 'La nageoire arrière gauche', P('M74 225Q53 236 26 226Q32 251 65 256L88 243Z',blue), L('M44 240L72 245',pale,3)), 'flipper'),
    moving(part('nageoire-arriere-droite', 'La nageoire arrière droite', P('M191 240Q195 269 171 281Q209 287 222 252L215 235Z',blue), L('M202 254L190 275',pale,3)), 'flipper'),
    moving(part('nageoire-avant-gauche', 'La nageoire avant gauche', P('M111 245Q96 264 64 270Q88 291 129 271L140 250Z',blue), L('M91 274L116 260',pale,3)), 'flipper'),
    moving(part('nageoire-avant-droite', 'La nageoire avant droite', P('M223 229Q250 245 267 265Q279 244 249 218Z',blue), L('M249 238L263 253',pale,3)), 'flipper'),
    part('cou', 'Le cou sort de la carapace', P('M230 208Q248 191 269 197L276 224Q255 242 234 228Z',blue)),
    part('tete', 'La tête tranquille de la gardienne', P('M256 201Q269 174 292 187Q314 205 302 226Q278 245 259 221Z',blue)),
    part('oeil', 'Le grand œil de la tortue', E(287,203,6,9,ink), C(288,200,2,white,white)),
    part('visage', 'Le sourire et la joue dorée', L('M289 218Q299 222 304 214',ink,2), E(274,216,7,4,coral,coral)),
    moving(part('queue', 'La queue se recourbe derrière l’île', P('M53 211Q29 201 19 212Q11 225 30 228Q41 225 38 218Q49 230 60 225Z',blue)), 'tail'),
    part('prairie', 'La prairie épouse la carapace', P('M54 198Q49 158 80 143Q96 155 119 138Q146 153 170 139Q190 154 222 152Q243 168 246 198Q149 234 54 198Z',green)),
    part('rocher-gauche', 'Le premier îlot de roche', P('M62 177L78 130L104 122L123 148L110 192Z',stone), L('M78 133L90 163L77 177',cream,3)),
    part('rocher-droit', 'L’îlot du phare', P('M181 170L193 128L220 128L239 162L226 188Z',stone), L('M198 142L217 164L224 178',cream,3)),
    part('rocher-central', 'Le rocher central de l’archipel', P('M119 160L133 116L157 110L181 147L166 175Z',stone), L('M138 128L151 149L144 167',cream,3)),
    part('cascade-gauche', 'Une cascade descend de l’îlot gauche', P('M92 159L103 159Q96 177 102 198Q97 209 86 205Q91 182 92 159Z',blue), L('M96 168L94 196',white,3)),
    part('cascade-droite', 'La cascade du phare', P('M211 161L221 159Q214 177 224 192L213 199Q204 185 211 161Z',blue), L('M215 170L216 189',white,3)),
    part('riviere', 'La rivière relie les cascades', P('M86 204Q109 188 134 201Q160 217 186 204L216 191L223 200Q187 228 159 223Q118 202 91 212Z',blue), L('M113 204Q138 200 161 215',pale,3)),
    part('colline-gauche', 'La butte moussue au-dessus du rocher', P('M68 141Q67 110 89 110Q110 111 114 141Q90 155 68 141Z',light)),
    part('colline-droite', 'La colline du phare', P('M184 143Q186 113 207 116Q226 117 235 144Q211 153 184 143Z',light)),
    part('arbre-central', 'Un saule miniature sur le sommet', L('M155 126L153 88',bark,5), P('M153 93Q125 102 127 84Q126 68 143 69Q163 57 173 79Q190 96 167 104L166 89L158 108Z',green)),
    part('sapin-gauche', 'Le sapin de la rive gauche', P('M63 155L48 155L56 137L49 137L62 115L73 137L67 137L77 155Z',dark), L('M63 154L63 170',bark,4)),
    part('sapin-droit', 'Le sapin de la rive droite', P('M238 160L226 160L233 143L226 143L239 124L251 143L245 143L255 160Z',dark), L('M239 159L239 173',bark,4)),
    part('maison', 'La maisonnette de l’îlot gauche', P('M75 132L75 102L105 102L108 133Z',cream), L('M79 132L104 132',bark,3)),
    part('toit-maison', 'Le toit en champignon de la maisonnette', P('M65 104Q69 80 88 80Q108 80 116 103Q88 115 65 104Z',rose), L('M72 103Q90 109 109 103',coral,3)),
    part('facade', 'La porte ronde et la fenêtre de la maison', P('M80 132L80 121Q86 112 92 121L92 132Z',bark), C(100,119,5,blue)),
    part('phare-base', 'La base du phare de l’autre rive', P('M194 139L196 107L217 107L221 140Z',cream), L('M199 135L201 113',sand,3)),
    part('phare-tour', 'La tour rayée du phare', P('M196 109L197 80L214 80L217 109Z',cream), P('M197 88L215 93L216 101L196 96Z',rose)),
    part('lanterne-phare', 'La lanterne dorée du phare', P('M191 81L191 64L220 64L220 81Z',blue), C(205,72,7,gold), L('M196 65L196 80M214 65L214 80',bark,2)),
    part('toit-phare', 'Le chapeau de cuivre du phare', P('M185 64L205 49L225 64Z',bark), C(205,49,3,gold)),
    part('socle-sanctuaire', 'Le socle du petit sanctuaire', P('M131 136L133 123L159 121L166 135L151 143Z',sand)),
    part('arche-sanctuaire', 'L’arche de lune du sanctuaire', P('M136 125L136 105Q147 90 158 105L159 123L151 124L151 109Q146 104 143 110L144 125Z',cream)),
    part('pont', 'Le tablier du pont entre les îlots', P('M104 145Q146 169 192 146L194 154Q147 178 103 154Z',bark), L('M116 151L116 159M128 157L128 163M141 160L141 167M155 160L155 167M171 156L171 164M183 152L184 159',sand,2)),
    part('cordages', 'Les deux cordages du pont', L('M104 142L104 130M192 144L192 132M105 132Q147 158 192 134M110 145L110 136M181 149L181 140',sand,3)),
    part('cerisier', 'Le cerisier au bord de la rivière', L('M121 190L122 167',bark,4), P('M120 174Q101 175 105 162Q99 151 113 149Q128 140 137 155Q149 166 134 175Z',rose), C(115,160,4,coral,coral)),
    part('lanterne-pont', 'Une lanterne éclaire l’entrée du pont', L('M110 146L110 124L121 124',bark,2), P('M116 127L127 127L125 140L117 140Z',gold), L('M121 127L121 140',cream,2)),
    part('horloge', 'La grande horloge sur le rebord de l’île', C(164,223,13,sand), C(164,223,9,cream), L('M164 217L164 224L169 227',ink,2)),
    part('cloche', 'La cloche de voyage sous le cou', L('M246 223L245 238',bark,2), P('M237 248Q236 237 245 236Q254 239 252 249Z',gold), C(245,251,3,sand)),
    part('fanion-phare', 'Le fanion du phare', L('M224 119L226 90',bark,2), P('M227 91L242 98L227 104Z',coral)),
    part('fanion-sanctuaire', 'La bannière de l’arche', L('M129 124L126 98',bark,2), P('M125 99L112 104L127 110Z',plum)),
    part('barque', 'Une barque navigue sur la rivière', P('M172 202L192 197Q191 212 176 214Z',cream), L('M180 201L178 190L187 195Z',bark,2)),
    part('perron', 'Le perron fleuri de la maisonnette', P('M76 135L93 135L95 141L72 143Z',sand), L('M75 139L92 138',cream,2)),
    part('fougere-gauche', 'La fougère sur le flanc gauche', L('M68 192L58 175',dark,3), P('M62 183Q45 184 48 172Q59 171 62 183M64 186Q79 168 83 181Q79 193 64 186Z',light)),
    part('fougere-droite', 'La fougère sur le flanc droit', L('M232 191L242 176',dark,3), P('M236 184Q224 171 230 165Q244 166 236 184M239 184Q252 174 258 184Q253 196 239 184Z',light)),
    part('mousses', 'Le jardin de mousse à l’avant de l’île', P('M110 213Q103 199 115 197Q121 187 130 199Q141 192 145 206L139 217Z',light), L('M117 205L122 212M132 203L133 213',green,3)),
    part('clochettes', 'Les clochettes accrochées au rebord', L('M67 214L67 225M80 219L80 229',dark,2), P('M62 227Q65 219 71 225L72 233L61 233Z',rose), P('M75 231Q79 222 84 229L85 237L74 237Z',coral)),
    part('ruban-queue', 'Le ruban de voyage noué à la queue', P('M36 220Q20 207 17 220Q23 228 36 220M36 220Q37 203 47 209Q51 221 36 220Z',plum), C(36,220,3,gold)),
    moving(part('lune', 'Le croissant veille sur tout l’archipel', P('M163 13Q141 22 147 43Q155 58 176 52Q155 75 138 53Q124 28 151 14Z',gold), C(180,34,3,gold,gold), C(122,56,3,gold,gold)), 'moon'),
  ])

  window.RewardPilotDrawings = [well, greenhouse, axolotl, turtle]
})()
