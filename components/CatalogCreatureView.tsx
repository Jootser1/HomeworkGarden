import { createElement } from 'react'
import { GardenVisitorView } from '@/components/GardenVisitorView'
import { catalogCreatureArtSchema } from '@/lib/rewards/vector'
import type { Creature, Direction } from '@/lib/types'

export function CatalogCreatureView({ creature, alive = false, direction = 'down', className = '', label }: { creature: Creature; alive?: boolean; direction?: Direction; className?: string; label?: string }) {
  const parsed = catalogCreatureArtSchema.safeParse(creature.catalogArt)
  if (!parsed.success || parsed.data.groups.length !== creature.parts.length) return <svg viewBox="0 0 320 280" className={`creature-svg ${className}`} role="img" aria-label="Illustration indisponible"/>
  const art = parsed.data
  if (art.version === 2) {
    const visible = new Set(art.groups.flatMap((group, index) => creature.parts[index]?.revealed ? group : []))
    const profile = direction === 'left' || direction === 'right'
    const flip = profile && (art.drawing.facing === 'left' ? direction === 'right' : direction === 'left')
    const transform = profile ? (flip ? 'translate(296 0) scale(-.85 1)' : 'translate(24 0) scale(.85 1)') : direction === 'up' ? 'translate(6 12) scale(.96 .94)' : undefined
    return <svg viewBox="0 0 320 300" className={`garden-visitor-svg creature-svg catalog-reward-svg collection-creature ${alive ? 'is-alive' : 'is-paused'} ${className}`} data-composition-id={art.compositionId} data-direction={direction} data-revealed-groups={creature.parts.filter(part => part.revealed).length} role="img" aria-label={label ?? creature.name}>
      <g transform={transform}>{art.drawing.parts.filter(part => visible.has(part.id)).map(part => <g key={part.id} data-reward-part={part.id}>
        <g className={part.motion ? `collection-motion motion-${part.motion}` : undefined}>
          {(direction === 'up' ? part.back ?? part.shapes : profile ? part.profile ?? part.shapes : part.shapes).map((shape, index) => createElement(shape.tag, { ...Object.fromEntries(Object.entries(shape.attrs).map(([key, value]) => [{ 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin' }[key] ?? key, value])), key: index }))}
        </g>
      </g>)}</g>
    </svg>
  }
  const visible = new Set(art.groups.flatMap((group, index) => creature.parts[index]?.revealed ? group.map(Number) : []))
  return <GardenVisitorView id={art.rig} visibleParts={visible} compositionId={art.compositionId} direction={direction} paused={!alive} moving={alive} label={label ?? creature.name} className={`creature-svg ${className}`}/>
}
