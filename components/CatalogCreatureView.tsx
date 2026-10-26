import { GardenVisitorView } from '@/components/GardenVisitorView'
import { catalogCreatureArtSchema } from '@/lib/rewards/vector'
import type { Creature, Direction } from '@/lib/types'

export function CatalogCreatureView({ creature, alive = false, direction = 'down', className = '', label }: { creature: Creature; alive?: boolean; direction?: Direction; className?: string; label?: string }) {
  const parsed = catalogCreatureArtSchema.safeParse(creature.catalogArt)
  if (!parsed.success || parsed.data.groups.length !== creature.parts.length) return <svg viewBox="0 0 320 280" className={`creature-svg ${className}`} role="img" aria-label="Illustration indisponible"/>
  const art = parsed.data
  const visible = new Set(art.groups.flatMap((group, index) => creature.parts[index]?.revealed ? group.map(Number) : []))
  return <GardenVisitorView id={art.rig} visibleParts={visible} compositionId={art.compositionId} direction={direction} paused={!alive} moving={alive} label={label ?? creature.name} className={`creature-svg ${className}`}/>
}
