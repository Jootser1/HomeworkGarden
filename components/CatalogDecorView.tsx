import { createElement } from 'react'
import { catalogDecorArtSchema } from '@/lib/rewards/vector'
import type { GardenDecor } from '@/lib/types'

/** Restricted structured vectors only. No raw SVG, markup parser, external URLs,
 * event handlers, CSS, masks or clipping are accepted from a saved illustration.
 */
export function CatalogDecorView({ decor, complete = false, className = '' }: { decor: GardenDecor; complete?: boolean; className?: string }) {
  const parsed = catalogDecorArtSchema.safeParse(decor.catalogArt)
  if (!parsed.success || parsed.data.groups.length !== decor.stepCount) return <svg viewBox="0 0 320 300" className={`decor-svg ${className}`} role="img" aria-label="Illustration indisponible"/>
  const art = parsed.data
  const revealed = complete ? art.groups.length : Math.max(0, Math.min(art.groups.length, decor.revealedSteps))
  const visible = new Set(art.groups.slice(0, revealed).flat())
  const latest = new Set(art.groups[revealed-1] ?? [])
  return <svg viewBox={art.drawing.viewBox.join(' ')} data-composition-id={art.compositionId} className={`decor-svg catalog-reward-svg ${className}`} role="img" aria-label={complete || revealed >= decor.stepCount ? art.drawing.name : 'Un cadeau se construit'}>
    {art.drawing.parts.filter(part => visible.has(part.id)).map(part => <g key={part.id} data-reward-part={part.id} className={!complete && latest.has(part.id) ? 'decor-build-addition' : undefined}>
      {part.shapes.map((shape, index) => {
        const attributes = Object.fromEntries(Object.entries(shape.attrs).map(([key, value]) => [{ 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin' }[key] ?? key, value]))
        return createElement(shape.tag, { ...attributes, key: index })
      })}
    </g>)}
  </svg>
}
