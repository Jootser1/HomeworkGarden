import tree from '@/plans/design/vector-lab/arbre-40.json'
import stump from '@/plans/design/vector-lab/souche-15.json'
import { vectorDrawingSchema, type VectorDrawing, type VectorShape } from '@/lib/rewards/vector'

// Preparation/provenance only, not a second source of truth or a build step.
// lib/rewards/art/decor.v1.json is the authoritative, versioned game content.
// Never automatically overwrite the published catalogue from this preparation.
// Helpers draw complete objects at final positions; they do not randomly
// assemble or recolour a reward at session creation.
const green = '#719472', light = '#b5c995', wood = '#916c52', cream = '#f1dfb5', pink = '#d89caa'
const path = (d: string, fill: string, stroke?: string, width = 3): VectorShape => ({ tag: 'path', attrs: { d, fill, ...(stroke ? { stroke, 'stroke-width': width, 'stroke-linecap': 'round' as const, 'stroke-linejoin': 'round' as const } : {}) } })
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string): VectorShape => ({ tag: 'ellipse', attrs: { cx, cy, rx, ry, fill } })
const line = (d: string, stroke: string, width = 3) => path(d, 'none', stroke, width)
type Part = VectorDrawing['parts'][number]
const part = (label: string, shapes: VectorShape[]): Part => ({ id: '', label, shapes })
const stone = (x: number, y: number, w = 35, h = 19): VectorShape[] => [ellipse(x, y, w, h, '#a7b9b2'), line(`M${x-w*.7} ${y-4}Q${x} ${y-h-5} ${x+w*.65} ${y-5}`, '#d9dec4', 4)]
const moss = (x: number, y: number): VectorShape[] => [path(`M${x-20} ${y}Q${x-24} ${y-16} ${x-9} ${y-13}Q${x} ${y-30} ${x+10} ${y-15}Q${x+31} ${y-18} ${x+25} ${y}Q${x+3} ${y+13} ${x-20} ${y}Z`, green), line(`M${x-10} ${y-3}Q${x} ${y-15} ${x+14} ${y-5}`, light)]
const fern = (x: number, y: number): VectorShape[] => [line(`M${x} ${y}Q${x-10} ${y-24} ${x+6} ${y-43}M${x} ${y}Q${x-21} ${y-32} ${x-31} ${y-22}M${x} ${y}Q${x+23} ${y-34} ${x+31} ${y-25}`, green, 4), path(`M${x-3} ${y-14}L${x-15} ${y-24}L${x-13} ${y-10}ZM${x+2} ${y-24}L${x+13} ${y-36}L${x+15} ${y-22}ZM${x-18} ${y-12}L${x-32} ${y-17}L${x-25} ${y-3}ZM${x+14} ${y-13}L${x+29} ${y-21}L${x+25} ${y-5}Z`, green)]
const flower = (x: number, y: number, color = pink): VectorShape[] => [line(`M${x} ${y}Q${x+5} ${y-17} ${x} ${y-35}`, green), path(`M${x} ${y-10}Q${x-24} ${y-32} ${x-17} ${y-9}ZM${x+2} ${y-18}Q${x+24} ${y-36} ${x+17} ${y-14}Z`, green), ...Array.from({ length: 5 }, (_, i) => ellipse(Math.round(x + Math.cos(i * Math.PI * 2 / 5) * 9), Math.round(y - 35 + Math.sin(i * Math.PI * 2 / 5) * 9), 8, 8, color)), ellipse(x, y-35, 5, 5, cream)]
const crystal = (x: number, y: number, h: number, color = '#8ab3bd'): VectorShape[] => [path(`M${x-14} ${y}L${x-19} ${y-h+17}L${x} ${y-h}L${x+19} ${y-h+17}L${x+14} ${y}Z`, color), path(`M${x} ${y-h}L${x+5} ${y-h+20}L${x+3} ${y}L${x+14} ${y}L${x+19} ${y-h+17}Z`, '#c1d7ce'), line(`M${x-11} ${y-h+23}L${x-8} ${y-10}`, '#e8ecd7', 3)]
const mushroom = (x: number, y: number, size = 1): VectorShape[] => [path(`M${x-5*size} ${y}L${x-4*size} ${y-29*size}L${x+5*size} ${y-29*size}L${x+8*size} ${y}Z`, cream), path(`M${x-26*size} ${y-25*size}Q${x-23*size} ${y-58*size} ${x} ${y-53*size}Q${x+25*size} ${y-53*size} ${x+28*size} ${y-25*size}Q${x} ${y-13*size} ${x-26*size} ${y-25*size}Z`, '#c49085'), ellipse(x-7*size, y-38*size, 6*size, 5*size, cream), ellipse(x+13*size, y-32*size, 4*size, 3*size, cream)]
function drawing(id: string, name: string, description: string, parts: Part[]): VectorDrawing {
  parts = parts.map((value, index) => ({ ...value, id: `part-${index+1}` }))
  const palette = [...new Set(parts.flatMap(part => part.shapes.flatMap(shape => [shape.attrs.fill, shape.attrs.stroke].filter((color): color is string => Boolean(color && color !== 'none')))))]
  return vectorDrawingSchema.parse({ version: 1, id, name, description, viewBox: [0, 0, 320, 300], palette, parts })
}

const bells = drawing('campanules-des-pierres-10', 'Les campanules des pierres', 'De grandes clochettes douces se dressent dans un petit jardin de pierres et de fougères.', [
  part('Le socle de pierres', [...stone(115, 258, 53, 17), ...stone(207, 255, 49, 19)]),
  ...[[90,220],[145,166],[210,206],[122,245],[239,240],[180,250]].map(([x,y], i) => part(`La campanule ${i+1}`, [line(`M${x} ${y}Q${x+10} ${y-30} ${x} ${y-67}`, green, 4), path(`M${x-19} ${y-60}Q${x-23} ${y-92} ${x} ${y-91}Q${x+25} ${y-92} ${x+20} ${y-60}Q${x} ${y-47} ${x-19} ${y-60}Z`, i%2 ? '#b6a3c8' : pink), ellipse(x,y-58,14,5,cream), path(`M${x} ${y-12}Q${x-30} ${y-40} ${x-25} ${y-15}Z`, green)])),
  part('La fougère de gauche', fern(58,270)), part('La fougère de droite', fern(270,264)), part('La fleur du premier plan', flower(167,278,cream)),
])
const orchard = drawing('pommier-trois-couronnes-10', 'Le pommier aux trois couronnes', 'Un pommier ramifié porte trois couronnes rondes et de gros fruits dorés.', [
  part('Le tronc', [path('M143 267Q157 212 147 137L174 135Q168 221 184 267Z', wood)]),
  part('Les racines', [path('M151 247L90 273Q119 282 159 267L224 273Q208 259 175 249Z',wood)]),
  part('La branche gauche', [line('M156 188Q109 162 85 113',wood,12)]), part('La branche droite', [line('M169 189Q221 159 238 117',wood,12)]),
  ...[[85,116,49,43],[161,76,55,48],[238,121,49,43]].map(([x,y,rx,ry], i) => part(`La couronne ${i+1}`, [ellipse(x,y,rx,ry,i===1?light:green), line(`M${x-25} ${y-10}Q${x} ${y-39} ${x+28} ${y-18}`, '#d1d9a6',5)])),
  ...[[85,116],[161,76],[238,121]].map(([x,y],i) => part(`Les fruits de la couronne ${i+1}`, [ellipse(x-20,y+5,9,11,'#e4b16f'),ellipse(x+16,y+15,10,12,'#e4b16f'),ellipse(x+3,y-15,8,10,'#d89178')])),
])
const arches = drawing('arches-jumelles-10', 'Les arches jumelles', 'Deux arches de pierre se rejoignent au-dessus d’un jardin miniature.', [
  part('Le pilier de gauche', stone(69,239,30,30)), part('Le pilier central', stone(160,237,30,31)), part('Le pilier de droite', stone(251,239,30,30)), part('La pierre centrale haute', stone(160,185,26,29)),
  part('L’arche gauche', [path('M43 223Q76 112 173 158L172 183Q97 149 68 234Z','#a7b9b2'),line('M55 216Q86 140 157 169','#d9dec4',6)]),
  part('L’arche droite', [path('M148 165Q239 107 277 225L250 234Q222 153 169 188Z','#91aaa8'),line('M173 170Q229 138 262 216','#d9dec4',6)]),
  part('La mousse de gauche', moss(81,225)), part('La mousse de droite', moss(239,223)), part('La fougère du pied',fern(112,279)), part('La fleur sous les arches',flower(202,279)),
])
const lotus = drawing('lotus-du-miroir-15', 'Les lotus du miroir', 'Des fleurs nacrées et leurs feuilles occupent un miroir d’eau, avec trois libellules.', [
  ...[[77,228],[146,203],[226,225],[118,265],[209,268]].map(([x,y],i)=>part(`La feuille flottante ${i+1}`, [ellipse(x,y,35,14,green),path(`M${x} ${y}L${x-23} ${y-12}L${x-9} ${y+3}Z`,light)])),
  ...[[77,223],[146,198],[226,220],[118,260],[209,263]].map(([x,y],i)=>part(`Le lotus ${i+1}`, [ellipse(x,y-18,11,23,pink),ellipse(x-15,y-9,17,13,cream),ellipse(x+15,y-9,17,13,cream),ellipse(x,y,19,8,'#d4b67c')])),
  ...[[83,132],[195,106],[260,165]].map(([x,y],i)=>part(`La libellule ${i+1}`, [ellipse(x-12,y,16,6,'#b5cbd1'),ellipse(x+12,y,16,6,'#b5cbd1'),line(`M${x} ${y-8}L${x} ${y+23}`,'#668a8c',4),ellipse(x,y-8,5,5,'#668a8c')])),
  ...[[43,255],[278,254]].map(([x,y],i)=>part(`Les roseaux ${i+1}`, [line(`M${x} ${y}L${x-8} ${y-69}M${x+10} ${y}L${x+13} ${y-51}`,green,4),line(`M${x-8} ${y-69}L${x-9} ${y-88}M${x+13} ${y-51}L${x+14} ${y-72}`,wood,7)])),
])
const willow = drawing('saule-lanternes-15', 'Le saule aux lanternes', 'Un tronc courbe porte une voûte retombante et six fleurs-lanternes.', [
  part('Les racines du saule',[path('M155 251Q118 251 86 277L153 268L217 279Q197 256 174 248Z',wood)]),
  part('Le tronc courbe',[path('M149 265Q182 209 156 164Q131 125 164 78L181 86Q154 125 176 158Q211 217 179 267Z',wood)]),
  part('La branche basse gauche',[line('M167 160Q104 155 66 111',wood,10)]),part('La branche droite',[line('M171 142Q237 121 256 83',wood,10)]),
  ...[[44,98,89,193],[86,65,128,176],[134,46,180,169],[181,54,229,181],[225,87,278,203]].map(([x,y,r,b],i)=>part(`Le rideau de feuilles ${i+1}`,[path(`M${x} ${y}Q${x-10} ${y-44} ${r} ${y-23}Q${r+23} ${y+5} ${r-3} ${b}Q${r-25} ${b-37} ${x+15} ${y+22}Q${x+2} ${y+72} ${x-1} ${b-2}Q${x-21} ${b-25} ${x} ${y}Z`,i%2?light:green)])),
  ...[[57,184],[100,165],[141,161],[187,163],[232,175],[269,202]].map(([x,y],i)=>part(`La lanterne fleurie ${i+1}`,[line(`M${x} ${y-18}L${x} ${y+6}`,green),path(`M${x-12} ${y+1}Q${x} ${y-17} ${x+12} ${y+1}L${x+14} ${y+21}Q${x} ${y+31} ${x-14} ${y+21}Z`,pink),ellipse(x,y+20,8,4,cream)])),
])
const crystals = drawing('grotte-lucioles-20', 'La grotte des lucioles', 'Une voûte minérale encadre des cristaux, des fougères et des fleurs lumineuses.', [
  part('Le socle de la grotte',[...stone(116,254,62,22),...stone(208,253,63,23)]),part('La voûte',[path('M52 225Q41 56 158 45Q279 51 270 225L239 230Q250 88 159 85Q79 94 84 231Z','#9caeaa'),line('M65 210Q61 74 158 65Q259 70 257 208','#c3cebb',7)]),
  ...[[98,242,69],[135,248,107],[179,251,66],[216,239,94],[77,250,43],[248,253,49]].map(([x,y,h],i)=>part(`Le cristal ${i+1}`,crystal(x,y,h,i%2?'#9f9fbd':'#8ab3bd'))),
  ...[[82,251],[129,255],[219,250],[257,258]].map(([x,y],i)=>part(`La mousse ${i+1}`,moss(x,y))),
  ...[[44,265],[102,282],[226,283],[281,266]].map(([x,y],i)=>part(`La fougère ${i+1}`,fern(x,y))),
  ...[[78,283],[147,285],[195,282],[258,284]].map(([x,y],i)=>part(`La fleur lumineuse ${i+1}`,flower(x,y,cream))),
])
const village = drawing('village-ombrelles-20', 'Le village des ombrelles', 'Une colonie de champignons étagés habite un grand bois couché, entre fleurs et fougères.', [
  part('Le bois couché',[path('M47 242Q93 206 260 228L279 260Q174 283 48 268Z',wood),ellipse(53,254,18,20,'#c5a47c'),ellipse(53,254,10,13,wood)]),
  ...[[71,224,.8],[119,219,1.1],[174,217,1.5],[231,228,1.05],[272,244,.6],[96,257,.55],[140,258,.6],[197,257,.65],[243,267,.5],[54,271,.5]].map(([x,y,s],i)=>part(`L’ombrelle ${i+1}`,mushroom(x,y,s))),
  ...[[82,260],[159,260],[240,274]].map(([x,y],i)=>part(`La mousse du bois ${i+1}`,moss(x,y))),
  ...[[36,265],[111,285],[286,279]].map(([x,y],i)=>part(`La fougère ${i+1}`,fern(x,y))),
  ...[[63,285],[213,285],[265,286]].map(([x,y],i)=>part(`La fleur ${i+1}`,flower(x,y,cream))),
])
const waterfall = drawing('cascade-cristal-40', 'La cascade de cristal', 'Une haute cascade traverse trois terrasses minérales, entourées de cristaux et d’un jardin luxuriant.', [
  ...[[99,250,58,22],[214,252,62,23],[111,194,46,25],[210,194,47,26],[139,133,39,22],[193,130,35,24]].map(([x,y,w,h],i)=>part(`La terrasse de pierre ${i+1}`,stone(x,y,w,h))),
  ...['M154 115Q138 146 153 175L168 186Q145 143 172 118Z','M171 177Q182 203 166 227L182 247Q201 203 189 177Z','M153 245Q109 239 88 257Q139 277 207 264L181 251Z','M158 105Q169 91 186 103L193 120L170 130L151 122Z'].map((d,i)=>part(`L’eau de la cascade ${i+1}`,[path(d,i%2?'#b6d8d7':'#8fbec9')])),
  ...[[75,238,56],[101,225,43],[229,233,59],[259,246,42],[103,174,42],[222,173,48],[133,119,56],[195,113,47]].map(([x,y,h],i)=>part(`Le cristal de rive ${i+1}`,crystal(x,y,h,i%2?'#b0a6bd':'#8ab3bd'))),
  ...[[41,264],[79,282],[128,280],[213,284],[260,281],[285,262]].map(([x,y],i)=>part(`La grande fougère ${i+1}`,fern(x,y))),
  ...[[54,220],[91,185],[228,185],[270,227],[117,133],[218,134],[119,278],[240,281]].map(([x,y],i)=>part(`La fleur de terrasse ${i+1}`,flower(x,y,i%2?pink:cream))),
  ...[[65,263],[102,272],[153,279],[202,277],[253,269],[95,194],[231,196],[166,119]].map(([x,y],i)=>part(`Le coussin de mousse ${i+1}`,moss(x,y))),
])

export const decorDrawings: VectorDrawing[] = [bells, orchard, arches, vectorDrawingSchema.parse(stump), lotus, willow, crystals, village, vectorDrawingSchema.parse(tree), waterfall]
