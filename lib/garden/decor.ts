import { z } from 'zod'
import { buildPebblePlan } from '@/lib/garden/decor-build'
import type { DecorRecipe, DecorVariant, GardenDecor, HomeworkSession, TerrainType } from '@/lib/types'

export const decorVariants = ['round', 'willow', 'birch', 'pine', 'fruit', 'fan', 'buttons', 'bells', 'stump', 'cluster', 'shelf', 'lantern', 'moss', 'pebbles', 'standing', 'arch', 'slate', 'fern', 'daisies', 'poppies', 'lavender', 'reeds', 'lilies', 'lotus'] as const
export const decorRecipeSchema = z.object({
  variant: z.enum(decorVariants),
  palette: z.enum(['sage', 'gold', 'rose', 'lilac']),
  seed: z.number().int().min(0).max(9999),
})

type Definition = { name: string; family: 'tree' | 'mushroom' | 'rock' | 'flower'; width: number; height: number; water?: boolean }
export const decorDefinitions: Record<DecorVariant, Definition> = {
  round: { name: 'Le pompon fleuri', family: 'tree', width: 2, height: 2 },
  willow: { name: 'Le saule de la rive', family: 'tree', width: 2, height: 2 },
  birch: { name: 'Les bouleaux jumeaux', family: 'tree', width: 2, height: 1 },
  pine: { name: 'Le sapin velours', family: 'tree', width: 2, height: 2 },
  fruit: { name: 'Le petit verger', family: 'tree', width: 2, height: 2 },
  fan: { name: 'L’arbre éventail', family: 'tree', width: 2, height: 1 },
  buttons: { name: 'Les boutons abricot', family: 'mushroom', width: 2, height: 1 },
  bells: { name: 'Les clochettes mauves', family: 'mushroom', width: 1, height: 1 },
  stump: { name: 'La souche aux éventails', family: 'mushroom', width: 2, height: 1 },
  cluster: { name: 'Le cercle des sous-bois', family: 'mushroom', width: 2, height: 2 },
  shelf: { name: 'Les ombrelles de mousse', family: 'mushroom', width: 1, height: 1 },
  lantern: { name: 'Les lanternes douces', family: 'mushroom', width: 1, height: 1 },
  moss: { name: 'Le refuge moussu', family: 'rock', width: 2, height: 1 },
  pebbles: { name: 'Les galets de berge', family: 'rock', width: 2, height: 1 },
  standing: { name: 'La sentinelle de mousse', family: 'rock', width: 1, height: 1 },
  arch: { name: 'La petite arche', family: 'rock', width: 2, height: 1 },
  slate: { name: 'Les pierres feuilletées', family: 'rock', width: 2, height: 1 },
  fern: { name: 'La fougère des pierres', family: 'rock', width: 1, height: 1 },
  daisies: { name: 'Le bouquet de marguerites', family: 'flower', width: 1, height: 1 },
  poppies: { name: 'Les fleurs de pêche', family: 'flower', width: 1, height: 1 },
  lavender: { name: 'Les épis lavande', family: 'flower', width: 2, height: 1 },
  reeds: { name: 'Les roseaux de la mare', family: 'flower', width: 1, height: 1 },
  lilies: { name: 'Les nénuphars', family: 'flower', width: 1, height: 1, water: true },
  lotus: { name: 'La fleur de lotus', family: 'flower', width: 1, height: 1, water: true },
}

export function decorName(decor: GardenDecor) { return decor.catalogArt?.drawing?.name ?? decorDefinitions[decor.recipe.variant].name }
export function decorTerrain(recipe: DecorRecipe): TerrainType[] {
  return decorDefinitions[recipe.variant].water ? ['pond'] : ['grass', 'flower', 'forest', 'mushroom', 'glow', 'stone']
}

export function nextReward(sessions: HomeworkSession[]) {
  const sequence = sessions.reduce((max, session) => Math.max(max, session.rewardSequence ?? 0), 0) + 1
  const current = sessions.filter((session) => session.rewardSequence !== undefined)
  const decors = current.filter((session) => session.status === 'completed' && session.decor).length
  // A creature already reserved by an unfinished session cannot be earned twice.
  const creatures = current.filter((session) => session.creature).length
  return { sequence, kind: decors >= (creatures + 1) * 10 ? 'creature' as const : 'decor' as const }
}

export function createDecor(recipe: DecorRecipe, count: number): GardenDecor {
  const validated = decorRecipeSchema.parse(recipe)
  const stepCount = Math.max(1, Math.floor(count))
  return {
    id: `decor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    recipe: validated,
    stepCount,
    revealedSteps: 0,
    ...(validated.variant === 'pebbles' && stepCount <= 2000 ? { buildPlan: buildPebblePlan(validated, stepCount) } : {}),
  }
}

export function localDecorRecipe(sessions: HomeworkSession[]): DecorRecipe {
  const palettes = ['sage', 'gold', 'rose', 'lilac'] as const
  // A rolling catalogue window also restarts fairly after the first complete cycle.
  const recentDecors = sessions.filter((session) => session.decor).slice(0, 95)
  const used = new Set(recentDecors.map((session) => `${session.decor!.recipe.variant}:${session.decor!.recipe.palette}`))
  const all = decorVariants.flatMap((variant) => palettes.map((palette) => ({ variant, palette })))
  const available = all.filter((recipe) => !used.has(`${recipe.variant}:${recipe.palette}`))
  const recent = sessions.filter((session) => session.decor).slice(0, 3).map((session) => decorDefinitions[session.decor!.recipe.variant].family)
  const pool = available.length ? available : all
  const varied = pool.filter((recipe) => !recent.includes(decorDefinitions[recipe.variant].family))
  const picked = (varied.length ? varied : pool)[Math.floor(Math.random() * (varied.length || pool.length))]
  return { ...picked, seed: Math.floor(Math.random() * 10000) }
}
