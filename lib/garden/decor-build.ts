import { z } from 'zod'
import type { DecorBuildElement, DecorBuildPlan, DecorRecipe, GardenDecor } from '@/lib/types'

export const decorBuildElementSchema = z.object({
  kind: z.enum(['pebble', 'moss', 'fern', 'flower', 'grass']),
  x: z.number().min(40).max(280),
  y: z.number().min(45).max(235),
  size: z.number().min(.6).max(1.3),
  angle: z.number().min(-12).max(12),
  tone: z.union([z.literal(0), z.literal(1), z.literal(2)]),
})
export const decorBuildPlanSchema = z.object({
  version: z.literal(1),
  steps: z.array(z.object({ elements: z.array(decorBuildElementSchema).min(1).max(15) })).min(1).max(2000),
})

function element(kind: DecorBuildElement['kind'], x: number, y: number, size: number, tone: 0 | 1 | 2 = 0): DecorBuildElement {
  return { kind, x, y, size, tone, angle: 0 }
}

/** Art-directed pilot: 5 stones, 3 patches of moss, 2 ferns, 3 flowers, 2 grasses.
 * The order deliberately alternates locations and materials; it never scans a picture.
 * Moss lands on a stone that already exists; stems and petals are one whole flower.
 */
const bankElements: DecorBuildElement[] = [
  element('pebble', 137, 180, 1.1),
  element('pebble', 207, 174, .92, 1),
  element('fern', 69, 206, .9),
  element('pebble', 98, 215, .68, 2),
  element('moss', 124, 177, 1.05),
  element('flower', 170, 177, .8),
  element('pebble', 171, 217, .85, 1),
  element('grass', 106, 154, .9),
  element('moss', 207, 170, .9, 1),
  element('pebble', 237, 213, .62),
  element('fern', 262, 194, .9, 1),
  element('flower', 215, 230, .75, 1),
  element('moss', 170, 212, .9, 2),
  element('grass', 240, 149, .9, 1),
  element('flower', 130, 235, .85, 2),
]

export function buildPebblePlan(recipe: DecorRecipe, count: number): DecorBuildPlan {
  if (!Number.isSafeInteger(count) || count < 1 || count > 2000) throw new Error('Nombre de calculs non pris en charge pour la construction')
  const parts = bankElements.map((part, i) => ({
    ...part,
    // Keep the validated positions; only small bounded tilts and colours vary.
    angle: ((recipe.seed + i * 17) % 7) - 3,
    tone: ((part.tone + recipe.seed % 3) % 3) as 0 | 1 | 2,
  }))
  // Longer sessions get more real plants/stones, not empty slices of a fixed image.
  // The 15-step art-directed composition is the visual pilot; denser beds need review.
  const extras = Math.max(0, count - parts.length)
  const kinds = ['flower', 'moss', 'pebble', 'grass', 'fern'] as const
  for (let i = 0; i < extras; i++) {
    const columns = Math.min(8, Math.ceil(Math.sqrt(extras * 2)))
    const rows = Math.ceil(extras / columns)
    parts.push(element(kinds[(i + recipe.seed) % kinds.length], 58 + (i % columns) * (204 / Math.max(1, columns - 1)), 65 + Math.floor(i / columns) * (65 / Math.max(1, rows - 1)), .62, (i % 3) as 0 | 1 | 2))
  }
  const steps: DecorBuildPlan['steps'] = Array.from({ length: count }, () => ({ elements: [] }))
  // For short sessions each success adds a group; for 15+ sessions one whole element.
  parts.forEach((part, index) => steps[Math.floor(index * count / parts.length)].elements.push(part))
  return { version: 1, steps }
}

export function visibleBuildElements(decor: GardenDecor, complete = false) {
  return decor.buildPlan?.steps.slice(0, complete ? decor.buildPlan.steps.length : decor.revealedSteps).flatMap((step, stepIndex) => step.elements.map((part, index) => ({ part, id: `${stepIndex + 1}:${index + 1}`, step: stepIndex + 1 }))) ?? []
}

/** Deterministic read compatibility: only unfinished pilot gifts change construction.
 * Finished gifts retain their original appearance and placements. No reset, no network.
 */
export function upgradePebbleDecor(decor: GardenDecor): GardenDecor {
  if (decor.recipe.variant !== 'pebbles' || decor.buildPlan || decor.catalogArt) return decor
  if (!Number.isSafeInteger(decor.stepCount) || decor.stepCount < 1 || decor.stepCount > 2000) return decor
  return { ...decor, buildPlan: buildPebblePlan(decor.recipe, decor.stepCount) }
}
