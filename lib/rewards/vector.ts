import { z } from 'zod'

const coordinate = z.number().finite().min(-640).max(640)
const length = z.number().finite().min(0).max(640)
const color = z.string().regex(/^(none|#[0-9a-fA-F]{6})$/)
const paint = { fill: color.optional(), stroke: color.optional(), 'stroke-width': z.number().min(0).max(12).optional() }
const ends = { 'stroke-linecap': z.enum(['round', 'butt', 'square']).optional(), 'stroke-linejoin': z.enum(['round', 'miter', 'bevel']).optional() }
const boundedPath = z.string().max(4000).regex(/^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\-\s]+$/).refine(value => (value.match(/[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g) ?? []).every(number => Number.isFinite(Number(number)) && Math.abs(Number(number)) <= 640), 'Coordonnée hors limites')
export const vectorShapeSchema = z.discriminatedUnion('tag', [
  z.object({ tag: z.literal('path'), attrs: z.object({ d: boundedPath, ...paint, ...ends }).strict() }).strict(),
  z.object({ tag: z.literal('ellipse'), attrs: z.object({ cx: coordinate, cy: coordinate, rx: length, ry: length, ...paint }).strict() }).strict(),
  z.object({ tag: z.literal('circle'), attrs: z.object({ cx: coordinate, cy: coordinate, r: length, ...paint }).strict() }).strict(),
  z.object({ tag: z.literal('rect'), attrs: z.object({ x: coordinate, y: coordinate, width: length, height: length, rx: length.optional(), ...paint }).strict() }).strict(),
  z.object({ tag: z.literal('line'), attrs: z.object({ x1: coordinate, y1: coordinate, x2: coordinate, y2: coordinate, ...paint, ...ends }).strict() }).strict(),
  z.object({ tag: z.literal('polyline'), attrs: z.object({ points: z.string().max(2000).regex(/^[0-9.,+\-\s]+$/), ...paint, ...ends }).strict() }).strict(),
])
export const vectorDrawingSchema = z.object({
  version: z.literal(1), id: z.string().regex(/^[a-z0-9-]{1,80}$/), name: z.string().min(1).max(100), description: z.string().max(500),
  viewBox: z.tuple([z.literal(0), z.literal(0), z.literal(320), z.literal(300)]),
  palette: z.array(color).min(1).max(24),
  parts: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]{1,80}$/), label: z.string().min(1).max(150), shapes: z.array(vectorShapeSchema).min(1).max(30) }).strict()).min(1).max(40),
}).strict().superRefine((drawing, ctx) => {
  if (new Set(drawing.parts.map(part => part.id)).size !== drawing.parts.length) ctx.addIssue({ code: 'custom', message: 'Groupes dupliqués' })
  if (drawing.parts.reduce((sum, part) => sum + part.shapes.length, 0) > 500) ctx.addIssue({ code: 'custom', message: 'Dessin trop complexe' })
})
export type VectorShape = z.infer<typeof vectorShapeSchema>
export type VectorDrawing = z.infer<typeof vectorDrawingSchema>
export const rewardFormatSchema = z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(40)])
export type RewardFormat = z.infer<typeof rewardFormatSchema>
export const rewardFormats: RewardFormat[] = [10, 15, 20, 40]
export function formatForCount(count: number): RewardFormat {
  if (!Number.isSafeInteger(count) || count < 1 || count > 40) throw new Error('Choisis entre 1 et 40 exercices.')
  return rewardFormats.find(format => count <= format)!
}
/** Whole, ordered groups only. Custom short sessions combine groups, never slice art. */
export function revealGroups(partIds: string[], count: number): string[][] {
  if (!Number.isSafeInteger(count) || count < 1 || count > partIds.length) throw new Error('Nombre de groupes incompatible')
  const groups: string[][] = Array.from({ length: count }, () => [])
  partIds.forEach((id, index) => groups[Math.floor(index * count / partIds.length)].push(id))
  return groups
}
export const catalogDecorArtSchema = z.object({
  version: z.literal(1), compositionId: z.string().min(1).max(100), nativeFormat: rewardFormatSchema,
  drawing: vectorDrawingSchema, groups: z.array(z.array(z.string()).min(1)).min(1).max(40),
}).strict().superRefine((art, ctx) => {
  const ids = art.groups.flat()
  if (art.drawing.parts.length !== art.nativeFormat || ids.length !== art.drawing.parts.length || new Set(ids).size !== ids.length || ids.some(id => !art.drawing.parts.some(part => part.id === id))) ctx.addIssue({ code: 'custom', message: 'Plan de révélation incohérent' })
})
export type CatalogDecorArt = z.infer<typeof catalogDecorArtSchema>
export const catalogCreatureArtSchema = z.object({
  version: z.literal(1), compositionId: z.string().min(1).max(100), rig: z.enum(['pompon', 'raie', 'aurores']),
  nativeFormat: z.union([z.literal(10), z.literal(40)]), groups: z.array(z.array(z.string().regex(/^\d{1,2}$/)).min(1).max(40)).min(1).max(40),
}).strict().superRefine((art, ctx) => {
  const ids = art.groups.flat().map(Number)
  if (art.nativeFormat !== (art.rig === 'aurores' ? 40 : 10) || ids.length !== art.nativeFormat || new Set(ids).size !== ids.length || ids.some(id => id < 1 || id > art.nativeFormat)) ctx.addIssue({ code: 'custom', message: 'Plan de créature incohérent' })
})
export type CatalogCreatureArt = z.infer<typeof catalogCreatureArtSchema>
