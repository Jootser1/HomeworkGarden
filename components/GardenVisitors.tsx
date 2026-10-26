'use client'

import { memo, useState } from 'react'
import { GardenVisitorView } from '@/components/GardenVisitorView'
import { useGardenNavigation } from '@/components/useGardenNavigation'
import { gardenVisitors, visitorPlacements, type GardenVisitorDefinition } from '@/lib/creatures/garden-visitors'
import { decorObstacles } from '@/lib/garden/movement'
import { loadAppState } from '@/lib/storage/app-state'
import type { Direction } from '@/lib/types'

const VisitorArt = memo(GardenVisitorView)
export function GardenVisitors({ paused, direction, onInspect }: { paused: boolean; direction: Direction | null; onInspect(visitor: GardenVisitorDefinition): void }) {
  const [actors] = useState(() => visitorPlacements(decorObstacles(loadAppState())).map(placement => ({ placement, movement: gardenVisitors.find(visitor => visitor.id === placement.creatureId)!.movement })))
  // No arrival callback: visitors never write a position or reward to storage.
  const { frames, stopped } = useGardenNavigation(actors, paused)
  return frames.map(frame => {
    const visitor = gardenVisitors.find(visitor => visitor.id === frame.placement.creatureId)!
    return <button key={visitor.id} type="button" className="garden-visitor" data-visitor-id={visitor.id} data-x={frame.placement.x} data-y={frame.placement.y} data-direction={direction ?? frame.placement.direction} data-paused={stopped} data-moving={frame.moving && !stopped} data-progress={frame.progress} data-destination={frame.destination ? `${frame.destination.x}:${frame.destination.y}` : ''}
      style={{ left: frame.left - visitor.width / 2, top: frame.top - visitor.height * visitor.anchorY / 280, width: visitor.width, height: visitor.height, zIndex: Math.round(frame.top) }}
      aria-label={`${visitor.name}, visiteur temporaire`} onPointerDown={event => event.stopPropagation()} onClick={() => onInspect(visitor)}>
      <VisitorArt id={visitor.id} direction={direction ?? frame.placement.direction} paused={stopped} moving={frame.moving && !stopped} label={visitor.name}/>
    </button>
  })
}
