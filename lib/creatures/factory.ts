import type { CreatureManifest } from '@/lib/creatures/schema'
import type { BiomeId, Creature, CreatureMovement, CreaturePartKind, TerrainType } from '@/lib/types'

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`

const namesA = ['Moussi', 'Brindi', 'Lumi', 'Ploof', 'Nébuli', 'Roseli', 'Bambou', 'Flori', 'Dodu', 'Zibou', 'Miro', 'Plumi']
const namesB = ['bulle', 'lune', 'mousse', 'pollen', 'doux', 'fleur', 'grelot', 'plume', 'saule', 'luciole', 'ronde', 'champi']
const personalities = [
  'douce, curieuse et un peu malicieuse',
  'timide, rêveuse et très attentive aux fleurs',
  'joyeuse, sautillante et rassurante',
  'calme, bizarre juste comme il faut, et jamais pressée',
  'nocturne, tendre et fascinée par les petites lumières',
]
const palettes = [
  { primary: '#8EE6C8', secondary: '#F7D6FF', accent: '#FFE66D', dark: '#315C55' },
  { primary: '#A5D86A', secondary: '#FFF1A8', accent: '#FF9FB2', dark: '#3C6134' },
  { primary: '#A4C8FF', secondary: '#F2E6FF', accent: '#FFD166', dark: '#334767' },
  { primary: '#D9A7FF', secondary: '#B8F2E6', accent: '#FFCF70', dark: '#4C3A68' },
  { primary: '#FFB7A3', secondary: '#FFF3C4', accent: '#8EE3EF', dark: '#70403B' },
]

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
    walking: ['grass', 'flower', 'forest', 'mushroom', 'dirt'],
    hopping: ['grass', 'flower', 'forest', 'mushroom', 'dirt'],
    flying: ['grass', 'flower', 'pond', 'forest', 'mushroom', 'dirt'],
    floating: ['grass', 'flower', 'pond', 'forest', 'mushroom', 'dirt'],
    swimming: ['pond'],
    amphibious: ['grass', 'flower', 'pond', 'dirt'],
  }
  return {
    type,
    allowedTerrain: byType[type],
    preferredBiomes,
    speed: type === 'flying' || type === 'floating' ? 'medium' : 'slow',
  }
}

export function creatureFromManifest(manifest: CreatureManifest, exerciseCount: number): Creature {
  const parts = normalizeParts(manifest.parts, exerciseCount)
  return {
    id: uid('creature'),
    name: manifest.name,
    description: manifest.description,
    personality: manifest.personality,
    biome: manifest.biome,
    bodyShape: manifest.bodyShape,
    earShape: manifest.earShape,
    tailShape: manifest.tailShape,
    pattern: manifest.pattern,
    palette: manifest.palette,
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

export function fallbackCreatureManifest(exerciseCount: number): CreatureManifest {
  const index = Math.floor(Math.random() * namesA.length)
  const movementTypes: CreatureManifest['movementType'][] = ['walking', 'hopping', 'flying', 'floating', 'amphibious']
  const biomes: CreatureManifest['biome'][] = ['meadow', 'pond', 'forest', 'mushroom_grove', 'moon_clearing']
  const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)]
  const biome = movementType === 'amphibious' ? 'pond' : biomes[Math.floor(Math.random() * biomes.length)]
  const parts = normalizeParts([...basePartOrder].sort(() => Math.random() - .5), exerciseCount)
  return {
    name: `${namesA[index]}${namesB[Math.floor(Math.random() * namesB.length)]}`,
    description: 'Une petite créature unique du Jardin des Devoirs, douce, expressive et impatiente de découvrir son écosystème.',
    personality: personalities[Math.floor(Math.random() * personalities.length)],
    biome,
    bodyShape: ['round', 'bean', 'leaf', 'mushroom', 'droplet'][Math.floor(Math.random() * 5)] as CreatureManifest['bodyShape'],
    earShape: ['leaf', 'round', 'horns', 'none'][Math.floor(Math.random() * 4)] as CreatureManifest['earShape'],
    tailShape: ['glow', 'leaf', 'curl', 'none'][Math.floor(Math.random() * 4)] as CreatureManifest['tailShape'],
    pattern: ['spots', 'moon', 'stripes', 'freckles', 'none'][Math.floor(Math.random() * 5)] as CreatureManifest['pattern'],
    movementType,
    palette: palettes[Math.floor(Math.random() * palettes.length)],
    parts,
  }
}

export function createFallbackCreature(exerciseCount: number): Creature {
  return creatureFromManifest(fallbackCreatureManifest(exerciseCount), exerciseCount)
}
