import { z } from 'zod'
import publishedDecor from './art/decor.v1.json'
import { formatForCount, revealGroups, rewardFormats, rewardFormatSchema, vectorDrawingSchema, type RewardFormat } from './vector'
import { decorRecipeSchema, nextReward } from '@/lib/garden/decor'
import { gardenVisitors, type VisitorId } from '@/lib/creatures/garden-visitors'
import type { AppState, Creature, GardenDecor, HomeworkSession } from '@/lib/types'

const decorEntrySchema = z.object({ compositionId: z.string().regex(/^[a-z0-9-]{1,100}$/), format: rewardFormatSchema, variant: decorRecipeSchema.shape.variant, drawing: vectorDrawingSchema }).strict().refine(entry => entry.drawing.parts.length === entry.format, 'Format incompatible avec le dessin')
export const decorCatalog = z.array(decorEntrySchema).superRefine((entries, ctx) => {
  if (new Set(entries.map(entry => entry.compositionId)).size !== entries.length) ctx.addIssue({ code: 'custom', message: 'Identifiants de composition dupliqués' })
}).parse(publishedDecor)
export const creatureCatalog = gardenVisitors.map(visitor => ({ compositionId: `creature-${visitor.id}-v1`, format: (visitor.id === 'aurores' ? 40 : 10) as 10 | 40, visitor }))

export function sessionCompositionId(session: HomeworkSession): string | undefined {
  return session.decor?.catalogArt?.compositionId ?? session.creature?.catalogArt?.compositionId
}
export function reservedCompositions(state: AppState) {
  return new Set([...(state.rewardHistory ?? []), ...state.sessions.flatMap(session => { const id = sessionCompositionId(session); return id ? [id] : [] })])
}
export function availableRewardFormats(state: AppState, kind: 'decor' | 'creature') {
  const used = reservedCompositions(state), entries = kind === 'decor' ? decorCatalog : creatureCatalog
  return rewardFormats.filter(format => entries.some(entry => entry.format === format && !used.has(entry.compositionId)))
}
export function rewardAvailability(state: AppState) {
  const kind = nextReward(state.sessions).kind
  return { kind, formats: availableRewardFormats(state, kind) }
}
export class CatalogUnavailableError extends Error {
  constructor(public kind: 'decor' | 'creature', public format: RewardFormat, public availableFormats: RewardFormat[]) {
    super(`Ce premier lot n’a ${kind === 'decor' ? 'aucun décor' : 'aucune créature'} disponible pour le format ${format}. ${availableFormats.length ? `Choisis un autre format : ${availableFormats.join(', ')} exercices.` : 'Le lot est épuisé : il faut ajouter de nouvelles compositions.'} Aucun cadeau déjà réservé ne sera réattribué.`)
    this.name = 'CatalogUnavailableError'
  }
}
const uid = (prefix: string) => `${prefix}_${globalThis.crypto.randomUUID()}`
function createCreature(rig: VisitorId, compositionId: string, count: number): Creature {
  const visitor = gardenVisitors.find(visitor => visitor.id === rig)!
  const nativeFormat = rig === 'aurores' ? 40 : 10
  const groups = revealGroups(Array.from({ length: nativeFormat }, (_, index) => String(index + 1)), count)
  return {
    id: uid('creature'), catalogId: compositionId, catalogArt: { version: 1, compositionId, rig, nativeFormat, groups },
    name: visitor.name, description: visitor.description, personality: 'Une présence douce et curieuse dans le jardin.',
    rarity: rig === 'aurores' ? 'wonder' : 'rare', biome: 'meadow', movement: structuredClone(visitor.movement),
    // Compatibility metadata only. Catalogue creatures are drawn by their own rig,
    // never assembled from these historical anatomical fields.
    bodyShape: 'round', earShape: 'none', tailShape: 'none', pattern: 'none',
    palette: { primary: '#a38caa', secondary: '#dfb6a1', accent: '#b5c995', dark: '#263d3b' },
    visuals: { eyeStyle: 'round', mouthStyle: 'none', wingStyle: 'none', antennaStyle: 'none', legStyle: 'none', auraStyle: 'none', size: 'medium', tilt: 0 },
    parts: groups.map((_, index) => ({ id: `catalog-group-${index+1}`, kind: 'catalog_group', label: `Découverte ${index+1}`, revealOrder: index+1, revealed: false })),
    state: 'revealing', createdAt: new Date().toISOString(),
  }
}
/** Pure allocation. The caller must reserve the returned snapshot atomically.
 * There is no paid generation, recolour fallback, or wrapping catalogue window.
 */
export function selectCatalogReward(state: AppState, count: number, random: () => number = Math.random): { decor?: GardenDecor; creature?: Creature; rewardSequence: number } {
  const format = formatForCount(count), reward = nextReward(state.sessions), used = reservedCompositions(state)
  const candidates = (reward.kind === 'decor' ? decorCatalog : creatureCatalog).filter(entry => entry.format === format && !used.has(entry.compositionId))
  if (!candidates.length) throw new CatalogUnavailableError(reward.kind, format, availableRewardFormats(state, reward.kind))
  const picked = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))]
  if ('drawing' in picked) {
    const decor: GardenDecor = { id: uid('decor'), recipe: { variant: picked.variant, palette: 'sage', seed: 0 }, stepCount: count, revealedSteps: 0,
      catalogArt: { version: 1, compositionId: picked.compositionId, nativeFormat: picked.format, drawing: structuredClone(picked.drawing), groups: revealGroups(picked.drawing.parts.map(part => part.id), count) } }
    return { decor, rewardSequence: reward.sequence }
  }
  return { creature: createCreature(picked.visitor.id, picked.compositionId, count), rewardSequence: reward.sequence }
}
