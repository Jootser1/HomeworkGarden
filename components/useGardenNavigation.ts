'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { advanceGardenJourney, createGardenJourney, gardenJourneyFrame, type GardenJourney, type GardenJourneyFrame } from '@/lib/garden/journey'
import { decorObstacles, type GardenCell } from '@/lib/garden/movement'
import { loadAppState } from '@/lib/storage/app-state'
import type { CreatureMovement, GardenPlacement } from '@/lib/types'

export type NavigationActor = { placement: GardenPlacement; movement: CreatureMovement }
export type NavigationArrival = { from: GardenPlacement; to: GardenPlacement }
type RecordState = { journey: GardenJourney; lastExternal: string; lastCommitted: GardenPlacement; movementKey: string }
const placementKey = (placement: GardenPlacement) => `${placement.x}:${placement.y}:${placement.direction}`

/** One independent journey per creature, one RAF loop per group. Route planning
 * and storage happen at decisions / cell arrivals, not on every paint.
 */
export function useGardenNavigation(actors: NavigationActor[], paused = false, onArrive?: (arrivals: NavigationArrival[]) => void) {
  const records = useRef(new Map<string, RecordState>())
  const [frames, setFrames] = useState<GardenJourneyFrame[]>([])
  const [reducedMotion, setReducedMotion] = useState(false)
  const onFrame = useEffectEvent((elapsedMs: number, obstacles: GardenCell[]) => {
    const active = new Set(actors.map(actor => actor.placement.creatureId))
    let changed = false
    for (const id of records.current.keys()) if (!active.has(id)) { records.current.delete(id); changed = true }
    const arrivals: NavigationArrival[] = []
    for (const actor of actors) {
      const id = actor.placement.creatureId, external = placementKey(actor.placement), movementKey = JSON.stringify(actor.movement)
      let record = records.current.get(id)
      // Preserve an in-flight journey across our own storage acknowledgements;
      // reset it only for a genuinely external relocation or changed habitat.
      if (!record || record.movementKey !== movementKey || (external !== record.lastExternal && external !== placementKey(record.lastCommitted))) {
        record = { journey: createGardenJourney(actor.placement, actor.movement, obstacles), lastExternal: external, lastCommitted: actor.placement, movementKey }
        records.current.set(id, record)
        changed = true
      }
      record.lastExternal = external
      if (paused || reducedMotion || elapsedMs <= 0) continue
      const result = advanceGardenJourney(record.journey, actor.movement, obstacles, elapsedMs)
      record.journey = result.journey
      if (result.arrivals.length) {
        const last = result.arrivals[result.arrivals.length - 1]
        arrivals.push({ from: record.lastCommitted, to: last })
        record.lastCommitted = last
      }
      changed = true
    }
    if (changed) setFrames([...records.current.values()].map(record => gardenJourneyFrame(record.journey)))
    if (arrivals.length) onArrive?.(arrivals)
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const preference = () => setReducedMotion(media.matches)
    preference()
    media.addEventListener('change', preference)
    let obstacles = decorObstacles(loadAppState())
    const refresh = () => { obstacles = decorObstacles(loadAppState()) }
    window.addEventListener('homework-garden-state-change', refresh)
    window.addEventListener('storage', refresh)
    let previous: number | null = null, frame = 0, disposed = false
    const resetClock = () => { previous = null }
    document.addEventListener('visibilitychange', resetClock)
    const tick = (now: number) => {
      if (disposed) return
      if (document.hidden) previous = null
      else if (previous === null || now - previous >= 30) {
        // Discard long stalls / background time: never fast-forward a creature.
        const elapsed = previous === null ? 0 : Math.min(100, now - previous)
        previous = now
        onFrame(elapsed, obstacles)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      media.removeEventListener('change', preference)
      window.removeEventListener('homework-garden-state-change', refresh)
      window.removeEventListener('storage', refresh)
      document.removeEventListener('visibilitychange', resetClock)
    }
  }, [])
  return { frames, stopped: paused || reducedMotion }
}
