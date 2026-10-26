import type { BiomeId, DecorPlacement, GardenDecor, TerrainType } from '@/lib/types'
import { decorDefinitions, decorTerrain } from '@/lib/garden/decor'

export type GardenTile = { x: number; y: number; terrain: TerrainType; biome: BiomeId; walkable: boolean; elevation: number }
export const gardenWidth = 22
export const gardenHeight = 18
export const worldSize = { width: 1800, height: 1080 }
export const projection = { x: 800, y: 76, halfWidth: 39, halfHeight: 21 }

export function elevationAt(x: number, y: number) {
  if (y <= 3) return 64
  if (x === 14 && y <= 6) return Math.max(0, 64 - (y - 3) * 21.34)
  return 0
}

function terrainAt(x: number, y: number): TerrainType {
  if (((x - 7) / 4.1) ** 2 + ((y - 10) / 3.2) ** 2 < 1) return 'pond'
  if (x === 14 && y >= 3 && y <= 15) return 'dirt'
  if (y <= 3 || x <= 1 || x >= 20) return 'forest'
  if (x >= 17 && y >= 12) return 'glow'
  if (x <= 4 && y >= 5 && y <= 7) return 'mushroom'
  if ((x + y * 3) % 13 === 0) return 'flower'
  return 'grass'
}

export const gardenTiles: GardenTile[] = Array.from({ length: gardenWidth * gardenHeight }, (_, index) => {
  const x = index % gardenWidth, y = Math.floor(index / gardenWidth)
  const terrain = terrainAt(x, y)
  const biome: BiomeId = terrain === 'pond' ? 'pond' : terrain === 'forest' ? 'forest' : terrain === 'mushroom' ? 'mushroom_grove' : terrain === 'glow' ? 'moon_clearing' : 'meadow'
  return { x, y, terrain, biome, walkable: true, elevation: elevationAt(x, y) }
})

/** Coordinates denote the foot/centre of an object, not a CSS tile corner. */
export function isoPosition(x: number, y: number) {
  return { left: projection.x + (x - y) * 39, top: projection.y + (x + y) * 21 - elevationAt(x, y) }
}
export function tileAt(x: number, y: number) {
  return x >= 0 && y >= 0 && x < gardenWidth && y < gardenHeight ? gardenTiles[y * gardenWidth + x] : undefined
}

export function tileFromPoint(left: number, top: number): GardenTile | undefined {
  // Height-aware nearest centre. On the ramp, projected diamonds can overlap:
  // picking the highest one first made neighbouring ground cells unselectable.
  return gardenTiles.map((tile) => {
    const point = isoPosition(tile.x, tile.y)
    return { tile, distance: Math.abs(left - point.left) / 39 + Math.abs(top - point.top) / 21 }
  }).filter((item) => item.distance <= 1).sort((a, b) => a.distance - b.distance || b.tile.elevation - a.tile.elevation)[0]?.tile
}

export function randomAllowedTile(allowed: TerrainType[], preferredBiomes: BiomeId[] = []) {
  const available = gardenTiles.filter((tile) => allowed.includes(tile.terrain) && !sceneryOccupied(tile.x, tile.y))
  const preferred = available.filter((tile) => preferredBiomes.includes(tile.biome))
  const pool = preferred.length ? preferred : available
  return pool[Math.floor(Math.random() * pool.length)] ?? gardenTiles[0]
}

// Fixed scenery gives a living garden from the first visit, without consuming rewards.
export const scenery = [
  ...[1, 4, 7, 10, 17, 20].map((x, index) => ({ id: `tree-${index}`, x, y: index % 2 ? 1 : 2, variant: (['round', 'birch', 'pine', 'fan', 'willow', 'fruit'] as const)[index], scale: 1.1 })),
  { id: 'tree-west', x: 1, y: 7, variant: 'round' as const, scale: 1.15 },
  { id: 'tree-east', x: 20, y: 7, variant: 'willow' as const, scale: 1.2 },
  { id: 'tree-east2', x: 20, y: 13, variant: 'birch' as const, scale: 1 },
  { id: 'mush-west', x: 3, y: 6, variant: 'stump' as const, scale: .85 },
  { id: 'mush-north', x: 11, y: 2, variant: 'buttons' as const, scale: .85 },
  { id: 'rock-bank', x: 11, y: 11, variant: 'moss' as const, scale: .85 },
  { id: 'rock-north', x: 17, y: 4, variant: 'standing' as const, scale: .8 },
  { id: 'flower-east', x: 18, y: 15, variant: 'lavender' as const, scale: 1 },
  { id: 'flower-west', x: 2, y: 14, variant: 'daisies' as const, scale: 1 },
  { id: 'reeds', x: 3, y: 10, variant: 'reeds' as const, scale: 1 },
  { id: 'lotus', x: 7, y: 10, variant: 'lotus' as const, scale: 1 },
  { id: 'lily', x: 8, y: 11, variant: 'lilies' as const, scale: .8 },
]
export function footprint(x: number, y: number, width: number, height: number) {
  return Array.from({ length: width * height }, (_, index) => ({ x: x + index % width, y: y + Math.floor(index / width) }))
}
export function sceneryOccupied(x: number, y: number) {
  return scenery.some((item) => footprint(item.x, item.y, decorDefinitions[item.variant].width, decorDefinitions[item.variant].height).some((cell) => cell.x === x && cell.y === y))
}

export function canPlaceDecor(decor: GardenDecor, x: number, y: number, placements: DecorPlacement[], decors: GardenDecor[]): boolean {
  const definition = decorDefinitions[decor.recipe.variant]
  const cells = footprint(x, y, definition.width, definition.height)
  const tiles = cells.map((cell) => tileAt(cell.x, cell.y))
  if (tiles.some((tile) => !tile || !decorTerrain(decor.recipe).includes(tile.terrain) || tile.elevation !== tiles[0]?.elevation)) return false
  if (cells.some((cell) => sceneryOccupied(cell.x, cell.y))) return false
  const others = placements.filter((placement) => placement.decorId !== decor.id).flatMap((placement) => {
    const other = decors.find((item) => item.id === placement.decorId)
    if (!other) return []
    const def = decorDefinitions[other.recipe.variant]
    return footprint(placement.x, placement.y, def.width, def.height)
  })
  return !cells.some((cell) => others.some((other) => cell.x === other.x && cell.y === other.y))
}

export function canCreatureStep(from: GardenTile, to: GardenTile, allowed: TerrainType[]) {
  return allowed.includes(to.terrain) && Math.abs(from.elevation - to.elevation) <= 23 && !sceneryOccupied(to.x, to.y)
}
