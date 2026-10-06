import { z } from 'zod'

export const terrainSchema = z.enum(['grass', 'flower', 'pond', 'forest', 'mushroom', 'dirt', 'stone', 'glow'])
export const biomeSchema = z.enum(['meadow', 'pond', 'forest', 'mushroom_grove', 'moon_clearing'])
export const movementSchema = z.enum(['walking', 'hopping', 'flying', 'floating', 'swimming', 'amphibious'])
export const raritySchema = z.enum(['common', 'uncommon', 'rare', 'wonder'])
export const bodyShapeSchema = z.enum(['round', 'bean', 'leaf', 'mushroom', 'droplet', 'star', 'pebble', 'long', 'shell', 'cloud'])
export const earShapeSchema = z.enum(['leaf', 'round', 'horns', 'fin', 'petal', 'tuft', 'none'])
export const tailShapeSchema = z.enum(['glow', 'leaf', 'curl', 'fin', 'star', 'puff', 'ribbon', 'none'])
export const patternSchema = z.enum(['spots', 'moon', 'stripes', 'freckles', 'stars', 'rings', 'leaf_veins', 'waves', 'none'])
export const eyeStyleSchema = z.enum(['round', 'sleepy', 'sparkle', 'wide', 'crescent', 'dot', 'glow'])
export const mouthStyleSchema = z.enum(['smile', 'tiny', 'cat', 'beak', 'none'])
export const wingStyleSchema = z.enum(['none', 'small', 'leaf', 'butterfly', 'moth', 'bubble'])
export const antennaStyleSchema = z.enum(['none', 'dots', 'leaves', 'stars', 'curl'])
export const legStyleSchema = z.enum(['none', 'tiny', 'webbed', 'boots', 'leafy'])
export const auraStyleSchema = z.enum(['none', 'sparkles', 'moon_glow', 'mist', 'bubbles', 'pollen'])
export const partKindSchema = z.enum([
  'body',
  'eyes',
  'mouth',
  'ears',
  'legs',
  'tail',
  'wings',
  'spots',
  'aura',
  'belly',
  'antennae',
  'cheeks',
  'sparkles',
  'horns',
  'crest',
  'shadow_glow',
])

export const creatureManifestSchema = z.object({
  name: z.string().min(3).max(28),
  description: z.string().min(20).max(190),
  personality: z.string().min(8).max(90),
  rarity: raritySchema,
  biome: biomeSchema,
  bodyShape: bodyShapeSchema,
  earShape: earShapeSchema,
  tailShape: tailShapeSchema,
  pattern: patternSchema,
  movementType: movementSchema,
  palette: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    dark: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
  visuals: z.object({
    eyeStyle: eyeStyleSchema,
    mouthStyle: mouthStyleSchema,
    wingStyle: wingStyleSchema,
    antennaStyle: antennaStyleSchema,
    legStyle: legStyleSchema,
    auraStyle: auraStyleSchema,
    size: z.enum(['tiny', 'small', 'medium', 'large']),
    tilt: z.union([z.literal(-2), z.literal(-1), z.literal(0), z.literal(1), z.literal(2)]),
  }),
  parts: z.array(partKindSchema).min(1).max(40),
})

export type CreatureManifest = z.infer<typeof creatureManifestSchema>
