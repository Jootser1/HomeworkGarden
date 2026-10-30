'use client'

import { memo } from 'react'
import { CreatureView } from '@/components/CreatureView'
import { useGardenNavigation } from '@/components/useGardenNavigation'
import { saveGardenArrivals } from '@/lib/storage/app-state'
import { gardenVisitors } from '@/lib/creatures/garden-visitors'
import type { AppState, Creature } from '@/lib/types'

const ResidentArt = memo(CreatureView)
export function GardenResidents({ state, onInspect }: { state: AppState; onInspect(creature: Creature): void }) {
  const residents = state.garden.placements.flatMap(placement => {
    const creature = state.sessions.find(session => session.creature?.id === placement.creatureId)?.creature
    return creature ? [{ creature, placement, movement: creature.movement }] : []
  })
  const { frames, stopped } = useGardenNavigation(residents, false, saveGardenArrivals)
  return frames.map(frame => {
    const creature = residents.find(resident => resident.creature.id === frame.placement.creatureId)?.creature
    if (!creature) return null
    const art = creature.catalogArt
    const rig = art?.version === 1 ? gardenVisitors.find(visitor => visitor.id === art.rig) : undefined
    const width = rig ? rig.width : art?.version === 2 ? (art.nativeFormat === 50 ? 120 : 96) : 78
    const height = rig ? rig.height : art?.version === 2 ? width * 300 / 320 : 73
    const anchor = rig ? height * rig.anchorY / 280 : art?.version === 2 ? height * .9 : 63
    return <button key={creature.id} type="button" data-creature-id={creature.id} data-x={frame.placement.x} data-y={frame.placement.y} data-progress={frame.progress} data-moving={frame.moving && !stopped} className="garden-creature garden-traveller" style={{ left: frame.left - width / 2, top: frame.top - anchor, width, height, zIndex: Math.round(frame.top) }} aria-label={creature.name} onClick={event => { if (event.detail === 0) onInspect(creature) }}>
      <ResidentArt creature={creature} compact alive={frame.moving && !stopped} direction={frame.placement.direction}/>
    </button>
  })
}
