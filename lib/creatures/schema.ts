import { z } from 'zod'

export const terrainSchema = z.enum(['grass', 'flower', 'pond', 'forest', 'mushroom', 'dirt'])
export const biomeSchema = z.enum(['meadow', 'pond', 'forest', 'mushroom_grove', 'moon_clearing'])
export const movementSchema = z.enum(['walking', 'hopping', 'flying', 'floating', 'swimming', 'amphibious'])
export const bodyShapeSchema = z.enum(['round', 'bean', 'leaf', 'mushroom', 'droplet'])
export const earShapeSchema = z.enum(['leaf', 'round', 'horns', 'none'])
export const tailShapeSchema = z.enum(['glow', 'leaf', 'curl', 'none'])
export const patternSchema = z.enum(['spots', 'moon', 'stripes', 'freckles', 'none'])
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
  parts: z.array(partKindSchema).min(1).max(40),
})

export type CreatureManifest = z.infer<typeof creatureManifestSchema>
