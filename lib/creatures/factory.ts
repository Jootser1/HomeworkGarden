import type { CreatureManifest } from '@/lib/creatures/schema'
import { localCreatureCatalog, type LocalCreatureBlueprint } from '@/lib/creatures/local-catalog'
import type { BiomeId, Creature, CreatureMovement, CreaturePartKind, TerrainType } from '@/lib/types'

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
const USED_CREATURES_KEY = 'homework-garden-used-local-creatures-v2'

const partLabels: Record<CreaturePartKind, string> = {
  body: 'Corps',
  eyes: 'Yeux',
  mouth: 'Sourire',
  ears: 'Oreilles',
  legs: 'Petites pattes',
  tail: 'Queue',
  wings: 'Ailes',
  spots: 'Motifs',
  aura: 'Aura magique',
  belly: 'Ventre',
  antennae: 'Antennes',
  cheeks: 'Joues',
  sparkles: 'Étincelles',
  horns: 'Cornes douces',
  crest: 'Crête',
  shadow_glow: 'Lueur de nuit',
}

const basePartOrder: CreaturePartKind[] = [
  'body',
  'eyes',
  'mouth',
  'ears',
  'legs',
  'tail',
  'wings',
  'spots',
  'belly',
  'antennae',
  'cheeks',
  'aura',
  'sparkles',
  'horns',
  'crest',
  'shadow_glow',
]

export function normalizeParts(parts: CreaturePartKind[], count: number): CreaturePartKind[] {
  const target = Math.max(1, Math.min(40, Math.floor(count)))
  const unique = [...new Set<CreaturePartKind>(['body', 'eyes', ...parts])]
  const expanded = [...unique]
  for (const part of basePartOrder) {
    if (expanded.length >= target) break
    if (!expanded.includes(part)) expanded.push(part)
  }
  while (expanded.length < target) expanded.push(basePartOrder[expanded.length % basePartOrder.length])
  return expanded.slice(0, target)
}

function movementFor(type: CreatureManifest['movementType'], biome: BiomeId): CreatureMovement {
  const preferredBiomes: BiomeId[] = [biome]
  const byType: Record<CreatureManifest['movementType'], TerrainType[]> = {
    walking: ['grass', 'flower', 'forest', 'mushroom', 'dirt', 'stone', 'glow'],
    hopping: ['grass', 'flower', 'forest', 'mushroom', 'dirt', 'stone', 'glow'],
    flying: ['grass', 'flower', 'pond', 'forest', 'mushroom', 'dirt', 'stone', 'glow'],
    floating: ['grass', 'flower', 'pond', 'forest', 'mushroom', 'dirt', 'stone', 'glow'],
    swimming: ['pond'],
    amphibious: ['grass', 'flower', 'pond', 'dirt', 'glow'],
  }
  return {
    type,
    allowedTerrain: byType[type],
    preferredBiomes,
    speed: type === 'flying' || type === 'floating' ? 'medium' : 'slow',
  }
}

function readUsedCreatureIds() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(USED_CREATURES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeUsedCreatureIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(USED_CREATURES_KEY, JSON.stringify(ids))
}

export function pickLocalCreatureBlueprint(): LocalCreatureBlueprint {
  const used = readUsedCreatureIds()
  const available = localCreatureCatalog.filter((creature) => !used.includes(creature.catalogId))
  const pool = available.length > 0 ? available : localCreatureCatalog
  const picked = pool[Math.floor(Math.random() * pool.length)]
  const nextUsed = available.length > 0 ? [...used, picked.catalogId] : [picked.catalogId]
  writeUsedCreatureIds(nextUsed)
  return picked
}

export function creatureFromManifest(manifest: CreatureManifest, exerciseCount: number, catalogId?: string): Creature {
  const parts = normalizeParts(manifest.parts, exerciseCount)
  return {
    id: uid('creature'),
    catalogId,
    name: manifest.name,
    description: manifest.description,
    personality: manifest.personality,
    rarity: manifest.rarity,
    biome: manifest.biome,
    bodyShape: manifest.bodyShape,
    earShape: manifest.earShape,
    tailShape: manifest.tailShape,
    pattern: manifest.pattern,
    palette: manifest.palette,
    visuals: manifest.visuals,
    movement: movementFor(manifest.movementType, manifest.biome),
    parts: parts.map((kind, index) => ({
      id: `${kind}_${index + 1}`,
      kind,
      label: partLabels[kind],
      revealOrder: index + 1,
      revealed: false,
    })),
    state: 'revealing',
    createdAt: new Date().toISOString(),
  }
}

export function createLocalCatalogCreature(exerciseCount: number): Creature {
  const blueprint = pickLocalCreatureBlueprint()
  return creatureFromManifest(blueprint, exerciseCount, blueprint.catalogId)
}

export function fallbackCreatureManifest(): CreatureManifest {
  return localCreatureCatalog[Math.floor(Math.random() * localCreatureCatalog.length)]
}

export function createFallbackCreature(exerciseCount: number): Creature {
  return createLocalCatalogCreature(exerciseCount)
}
