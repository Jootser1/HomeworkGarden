import { z } from 'zod'
import publishedCollection from './art/collection.v2.json'
import { collectionDrawingSchema, formatForCount, revealGroups, rewardFormats, rewardKindForCount, type RewardFormat } from './vector'
import { decorRecipeSchema } from '@/lib/garden/decor'
import { movementSchema, terrainSchema, biomeSchema } from '@/lib/creatures/schema'
const creatureMovementSchema = z.object({ type: movementSchema, allowedTerrain: z.array(terrainSchema).min(1).max(8), preferredBiomes: z.array(biomeSchema).max(5), speed: z.enum(['slow', 'medium']) }).strict()
import type { AppState, Creature, GardenDecor, HomeworkSession } from '@/lib/types'

const base = { compositionId: z.string().regex(/^[a-z0-9-]{1,100}$/), drawing: collectionDrawingSchema }
const entrySchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('decor'), format: z.union([z.literal(10), z.literal(20)]), variant: decorRecipeSchema.shape.variant }).strict(),
  z.object({ ...base, kind: z.enum(['creature', 'exceptional']), format: z.union([z.literal(30), z.literal(50)]), movement: creatureMovementSchema }).strict(),
]).superRefine((entry, ctx) => {
  if (entry.drawing.parts.length !== entry.format || (entry.kind === 'exceptional') !== (entry.format === 50)) ctx.addIssue({ code: 'custom', message: 'Catégorie ou format incohérent' })
})
export const rewardCollection = z.array(entrySchema).superRefine((entries, ctx) => {
  if (new Set(entries.map(entry => entry.compositionId)).size !== entries.length) ctx.addIssue({ code: 'custom', message: 'Identifiants de composition dupliqués' })
}).parse(publishedCollection)
export const decorCatalog = rewardCollection.filter(entry => entry.kind === 'decor')
export const creatureCatalog = rewardCollection.filter(entry => entry.kind !== 'decor')

export function sessionCompositionId(session: HomeworkSession): string | undefined {
  return session.decor?.catalogArt?.compositionId ?? session.creature?.catalogArt?.compositionId
}
export function reservedCompositions(state: AppState) {
  return new Set([...(state.rewardHistory ?? []), ...state.sessions.flatMap(session => { const id = sessionCompositionId(session); return id ? [id] : [] })])
}
export function availableRewardFormats(state: AppState, kind?: 'decor' | 'creature') {
  const used = reservedCompositions(state)
  return rewardFormats.filter(format => rewardCollection.some(entry => entry.format === format && (!kind || (kind === 'decor') === (entry.kind === 'decor')) && !used.has(entry.compositionId)))
}
export function rewardAvailability(state: AppState) {
  return { formats: availableRewardFormats(state) }
}
export class CatalogUnavailableError extends Error {
  constructor(public kind: 'decor' | 'creature', public format: RewardFormat, public availableFormats: RewardFormat[]) {
    super(`Le catalogue n’a plus ${kind === 'decor' ? 'de décor' : format === 50 ? 'de créature exceptionnelle' : 'de créature'} disponible pour le format ${format}. ${availableFormats.length ? `Formats encore disponibles : ${availableFormats.join(', ')} exercices.` : 'Le lot est épuisé : il faut ajouter de nouvelles compositions.'} Aucun cadeau déjà réservé ne sera réattribué.`)
    this.name = 'CatalogUnavailableError'
  }
}
const uid = (prefix: string) => `${prefix}_${globalThis.crypto.randomUUID()}`
/** New attribution depends only on length, never on a historical ten-decor cycle.
 * Stable composition reservations still include all historical versions.
 */
export function selectCatalogReward(state: AppState, count: number, random: () => number = Math.random): { decor?: GardenDecor; creature?: Creature; rewardSequence: number } {
  const format = formatForCount(count), kind = rewardKindForCount(count), used = reservedCompositions(state)
  const candidates = rewardCollection.filter(entry => entry.format === format && !used.has(entry.compositionId))
  if (!candidates.length) throw new CatalogUnavailableError(kind, format, availableRewardFormats(state))
  const picked = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))]
  const groups = revealGroups(picked.drawing.parts.map(part => part.id), count)
  const drawing = structuredClone(picked.drawing)
  const rewardSequence = state.sessions.reduce((n, session) => Math.max(n, session.rewardSequence ?? 0), 0) + 1
  if (picked.kind === 'decor') {
    return { rewardSequence, decor: { id: uid('decor'), recipe: { variant: picked.variant, palette: 'sage', seed: 0 }, stepCount: count, revealedSteps: 0,
      catalogArt: { version: 2, compositionId: picked.compositionId, nativeFormat: picked.format, drawing, groups } } }
  }
  return { rewardSequence, creature: {
    id: uid('creature'), catalogId: picked.compositionId,
    catalogArt: { version: 2, compositionId: picked.compositionId, nativeFormat: picked.format, drawing, groups },
    name: drawing.name, description: drawing.description, personality: 'Une présence douce et curieuse dans le jardin.',
    rarity: picked.kind === 'exceptional' ? 'wonder' : 'rare', biome: 'meadow', movement: structuredClone(picked.movement),
    // Metadata for compatibility only: the saved authored drawing is the renderer.
    bodyShape: 'round', earShape: 'none', tailShape: 'none', pattern: 'none',
    palette: { primary: '#87B7BC', secondary: '#C7DDCC', accent: '#D9B875', dark: '#41554F' },
    visuals: { eyeStyle: 'round', mouthStyle: 'none', wingStyle: 'none', antennaStyle: 'none', legStyle: 'none', auraStyle: 'none', size: picked.kind === 'exceptional' ? 'large' : 'medium', tilt: 0 },
    parts: groups.map((ids, index) => ({ id: `catalog-group-${index+1}`, kind: 'catalog_group', label: drawing.parts.find(part => part.id === ids[0])!.label, revealOrder: index+1, revealed: false })),
    state: 'revealing', createdAt: new Date().toISOString(),
  } }
}
