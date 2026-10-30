// Explicit preparation command, never run by the app, a session or the build.
// Publishes a reviewed editorial snapshot; inspect the JSON diff before shipping.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { smallDecors } from './decors-small.mjs'
import { largeDecors } from './decors-large.mjs'
import { creatures } from './creatures.mjs'
import { exceptionalCreatures } from './exceptionals.mjs'
import { P, E, L, cream, sand, ink } from './art-primitives.mjs'
// Authored pose corrections: the owl has a turned facial disc and beak; the fox
// has a real side muzzle. These are not extra compositions or selectable variants.
const poses = {
  'chouette-camelias': {
    'le-disque-facial-gauche': { back: [], profile: [] },
    'le-disque-facial-droit': { back: [], profile: [E(187,117,25,31,cream)] },
    'le-bec-de-cuivre': { back: [], profile: [P('M204 118L224 126L203 136Z','#D9B875')] },
  },
  'fennec-lanternes': {
    'le-museau-fin': { back: [], profile: [P('M177 145L204 151L202 165L178 177Z',sand),P('M199 151L210 155L201 162Z',ink),L('M190 167L201 166',ink,2)] },
  },
}
const context = { window: {} }
vm.runInNewContext(await readFile(new URL('./drawings.js', import.meta.url), 'utf8'), context)
const originals = context.window.RewardPilotDrawings
const all = [...originals, ...smallDecors, ...largeDecors, ...creatures, ...exceptionalCreatures]
const collection = all.map(d => {
  if (d.parts.length !== d.format || new Set(d.parts.map(p => p.id)).size !== d.format) throw new Error(`Wrong group count: ${d.id} (${d.parts.length})`)
  const facing = /pangolin|herisson|hippocampe|cerf|baleine/.test(d.id) ? 'left' : /limace|tortue|phenix/.test(d.id) ? 'right' : 'front'
  const parts = d.parts.map(p => {
    const face = /oeil|eye|yeux|sourire|visage|facade|facial|joue|interieur-de-l-oreille|ventre|poitrail|plastron|museau|bec/.test(p.id)
    const far = /oeil-gauche|eye-left|premier-oeil|premier-grand-oeil/.test(p.id) || (facing === 'front' && /gauche/.test(p.id) && !(d.id === 'mante-verrieres' && /bras|pinces/.test(p.id)))
    const motion = d.id === 'herisson-bourgeons' && /tige-du-grand/.test(p.id) ? 'sway' : p.motion
    return { ...p, ...(motion ? { motion } : {}), ...(d.kind !== 'decor' && face && !p.back ? { back: [] } : {}), ...(d.kind !== 'decor' && far && !p.profile ? { profile: [] } : {}), ...(d.kind !== 'decor' && /yeux/.test(p.id) ? { profile: p.shapes.filter((_,i) => i === 1 || i === 3) } : {}), ...(poses[d.id]?.[p.id] ?? {}) }
  })
  return { compositionId: `${d.kind}-${d.id}-v2`, kind: d.kind, format: d.format,
    ...(d.kind === 'decor' ? { variant: d.format === 20 ? 'arch' : 'standing' } : { movement: { type: /cerf/.test(d.id) ? 'walking' : d.kind === 'exceptional' ? 'floating' : /chauve-souris|cigale/.test(d.id) ? 'flying' : /axolotl|crabe|hippocampe/.test(d.id) ? 'amphibious' : 'walking', allowedTerrain: ['grass','flower','pond','forest','mushroom','dirt','stone','glow'].filter(t => (d.kind === 'exceptional' && !/cerf/.test(d.id)) || /axolotl|crabe|hippocampe|chauve-souris|cigale/.test(d.id) || t !== 'pond'), preferredBiomes: ['meadow','forest'], speed: 'slow' } }),
    drawing: { version: 2, id: d.id, name: d.name, description: d.description, viewBox: [0,0,320,300], palette: d.palette, facing, parts } }
})
const target = new URL('../../../lib/rewards/art/collection.v2.json', import.meta.url)
await writeFile(target, '[\n' + collection.map(e => JSON.stringify(e)).join(',\n') + '\n]\n')
console.log(`Published ${collection.length} authored compositions to ${fileURLToPath(target)}`)
