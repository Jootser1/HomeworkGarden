import type { BiomeId, TerrainType } from '@/lib/types'

export type GardenTile = {
  x: number
  y: number
  terrain: TerrainType
  biome: BiomeId
  walkable: boolean
}

const rows: TerrainType[][] = [
  ['forest', 'forest', 'grass', 'flower', 'grass', 'mushroom', 'mushroom', 'forest', 'forest', 'grass', 'glow', 'glow'],
  ['forest', 'grass', 'flower', 'grass', 'grass', 'mushroom', 'grass', 'forest', 'grass', 'grass', 'glow', 'flower'],
  ['grass', 'flower', 'grass', 'dirt', 'grass', 'grass', 'flower', 'grass', 'grass', 'stone', 'grass', 'flower'],
  ['grass', 'grass', 'dirt', 'dirt', 'pond', 'pond', 'grass', 'flower', 'stone', 'stone', 'grass', 'forest'],
  ['flower', 'grass', 'grass', 'dirt', 'pond', 'pond', 'grass', 'grass', 'grass', 'stone', 'forest', 'forest'],
  ['grass', 'mushroom', 'grass', 'grass', 'pond', 'pond', 'flower', 'grass', 'mushroom', 'grass', 'forest', 'forest'],
  ['mushroom', 'mushroom', 'grass', 'flower', 'grass', 'grass', 'dirt', 'dirt', 'mushroom', 'grass', 'grass', 'flower'],
  ['forest', 'mushroom', 'mushroom', 'grass', 'flower', 'grass', 'dirt', 'pond', 'pond', 'grass', 'glow', 'glow'],
  ['forest', 'forest', 'grass', 'grass', 'stone', 'grass', 'flower', 'pond', 'pond', 'grass', 'glow', 'flower'],
  ['forest', 'grass', 'flower', 'stone', 'stone', 'grass', 'grass', 'grass', 'flower', 'mushroom', 'grass', 'grass'],
]

function biomeForTerrain(terrain: TerrainType): BiomeId {
  if (terrain === 'pond') return 'pond'
  if (terrain === 'forest') return 'forest'
  if (terrain === 'mushroom') return 'mushroom_grove'
  if (terrain === 'glow') return 'moon_clearing'
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
  const originX = 520
  const originY = 22
  return {
    left: originX + (x - y) * (tileW / 2),
    top: originY + (x + y) * (tileH / 2),
  }
}

export function tileAt(x: number, y: number) {
  return gardenTiles.find((tile) => tile.x === x && tile.y === y)
}

export function randomAllowedTile(allowed: TerrainType[], preferredBiomes: BiomeId[] = []) {
  const allowedTiles = gardenTiles.filter((tile) => allowed.includes(tile.terrain))
  const preferred = allowedTiles.filter((tile) => preferredBiomes.includes(tile.biome))
  const candidates = preferred.length > 0 ? preferred : allowedTiles
  return candidates[Math.floor(Math.random() * candidates.length)] ?? gardenTiles[0]
}
