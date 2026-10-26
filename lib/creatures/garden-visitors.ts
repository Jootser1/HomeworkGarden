import { gardenTiles, sceneryOccupied } from '@/lib/garden/map'
import type { CreatureMovement, GardenPlacement } from '@/lib/types'
import type { GardenCell } from '@/lib/garden/movement'

export type VisitorId = 'pompon' | 'raie' | 'aurores'
export type GardenVisitorDefinition = {
  id: VisitorId
  name: string
  description: string
  movement: CreatureMovement
  width: number
  height: number
  /** Foot / shadow anchor inside the illustration viewBox. */
  anchorY: number
  start: GardenCell
}
const land = ['grass', 'flower', 'forest', 'mushroom', 'dirt', 'stone', 'glow'] as const
const sky = [...land, 'pond'] as const

export const gardenVisitors: GardenVisitorDefinition[] = [
  { id: 'pompon', name: 'Pompon fouisseur', description: 'Il avance par petits bonds et remue ses grandes mains. Il reste sur la terre ferme et contourne les décors.', movement: { type: 'hopping', allowedTerrain: [...land], preferredBiomes: ['meadow'], speed: 'slow' }, width: 112, height: 98, anchorY: 248, start: { x: 12, y: 9 } },
  { id: 'raie', name: 'Raie-pétale', description: 'Elle plane tranquillement, ses ailes-pétales ondulent et sa queue accompagne le mouvement. Elle peut survoler la mare et les décors.', movement: { type: 'floating', allowedTerrain: [...sky], preferredBiomes: ['meadow', 'pond'], speed: 'slow' }, width: 146, height: 128, anchorY: 264, start: { x: 10, y: 9 } },
  { id: 'aurores', name: 'Oiseau des aurores', description: 'Ses deux rangées de plumes se soulèvent doucement. Sa longue queue suit ses changements de direction au-dessus du jardin.', movement: { type: 'flying', allowedTerrain: [...sky], preferredBiomes: ['meadow'], speed: 'medium' }, width: 164, height: 144, anchorY: 264, start: { x: 13, y: 8 } },
]

/** No session, reward, ID reservation or localStorage write: these are visitors. */
export function visitorPlacements(obstacles: GardenCell[]): GardenPlacement[] {
  return gardenVisitors.map<GardenPlacement | null>(visitor => {
    const flying = visitor.movement.type === 'flying' || visitor.movement.type === 'floating'
    const tile = gardenTiles
      .filter(tile => visitor.movement.allowedTerrain.includes(tile.terrain) && (flying || (!sceneryOccupied(tile.x, tile.y) && !obstacles.some(cell => cell.x === tile.x && cell.y === tile.y))))
      .sort((a, b) => (Math.abs(a.x - visitor.start.x) + Math.abs(a.y - visitor.start.y)) - (Math.abs(b.x - visitor.start.x) + Math.abs(b.y - visitor.start.y)))[0]
    return tile ? { creatureId: visitor.id, x: tile.x, y: tile.y, direction: 'down' as const } : null
  }).filter((placement): placement is GardenPlacement => placement !== null)
}
