import type { BiomeId, TerrainType } from '@/lib/types'

export type GardenTile = {
  x: number
  y: number
  terrain: TerrainType
  biome: BiomeId
  walkable: boolean
}

const rows: TerrainType[][] = [
  ['forest', 'forest', 'grass', 'flower', 'grass', 'mushroom', 'mushroom', 'forest'],
  ['forest', 'grass', 'flower', 'grass', 'grass', 'mushroom', 'grass', 'forest'],
  ['grass', 'flower', 'grass', 'dirt', 'grass', 'grass', 'flower', 'grass'],
  ['grass', 'grass', 'dirt', 'dirt', 'pond', 'pond', 'grass', 'flower'],
  ['flower', 'grass', 'grass', 'dirt', 'pond', 'pond', 'grass', 'grass'],
  ['grass', 'mushroom', 'grass', 'grass', 'grass', 'flower', 'forest', 'forest'],
  ['mushroom', 'mushroom', 'grass', 'flower', 'grass', 'forest', 'forest', 'forest'],
]

function biomeForTerrain(terrain: TerrainType): BiomeId {
  if (terrain === 'pond') return 'pond'
  if (terrain === 'forest') return 'forest'
  if (terrain === 'mushroom') return 'mushroom_grove'
  if (terrain === 'flower') return 'meadow'
  return 'meadow'
}

export const gardenTiles: GardenTile[] = rows.flatMap((row, y) =>
  row.map((terrain, x) => ({
    x,
    y,
    terrain,
    biome: biomeForTerrain(terrain),
    walkable: true,
  })),
)

export const gardenWidth = rows[0]?.length ?? 0
export const gardenHeight = rows.length

export function isoPosition(x: number, y: number) {
  const tileW = 78
  const tileH = 42
  const originX = 410
  const originY = 28
  return {
    left: originX + (x - y) * (tileW / 2),
    top: originY + (x + y) * (tileH / 2),
  }
}

export function tileAt(x: number, y: number) {
  return gardenTiles.find((tile) => tile.x === x && tile.y === y)
}

export function randomAllowedTile(allowed: TerrainType[]) {
  const candidates = gardenTiles.filter((tile) => allowed.includes(tile.terrain))
  return candidates[Math.floor(Math.random() * candidates.length)] ?? gardenTiles[0]
}
