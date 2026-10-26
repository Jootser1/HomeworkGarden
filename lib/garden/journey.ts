import { isoPosition } from '@/lib/garden/map'
import { canNavigateStep, chooseGardenRoute, findGardenPath, sameCell, type GardenCell } from '@/lib/garden/movement'
import type { CreatureMovement, Direction, GardenPlacement } from '@/lib/types'

export type GardenJourney = {
  placement: GardenPlacement
  path: GardenCell[]
  destination: GardenCell | null
  progress: number
  pixelsPerSecond: number
  returning: boolean
  replan: boolean
  pauseRemaining: number
  previousCell?: GardenCell
}
export type GardenJourneyFrame = {
  placement: GardenPlacement
  left: number
  top: number
  moving: boolean
  destination: GardenCell | null
  progress: number
}
const facing = (from: GardenCell, to: GardenCell): Direction => to.x > from.x ? 'right' : to.x < from.x ? 'left' : to.y > from.y ? 'down' : 'up'
const routeDestination = (path: GardenCell[]) => path[path.length - 1] ?? null

export function createGardenJourney(placement: GardenPlacement, movement: CreatureMovement, obstacles: GardenCell[], random: () => number = Math.random, destination?: GardenCell): GardenJourney {
  const path = destination ? findGardenPath(placement, destination, movement, obstacles) : chooseGardenRoute(placement, movement, obstacles, random)
  return { placement: { ...placement }, path, destination: routeDestination(path), progress: 0, pixelsPerSecond: (movement.speed === 'medium' ? 30 : 22) * (.9 + random() * .2), returning: false, replan: false, pauseRemaining: path.length ? 0 : 1000 }
}

function retarget(journey: GardenJourney, movement: CreatureMovement, obstacles: GardenCell[], random: () => number) {
  const sameDestination = journey.destination && !sameCell(journey.placement, journey.destination)
    ? findGardenPath(journey.placement, journey.destination, movement, obstacles) : []
  journey.path = sameDestination.length ? sameDestination : chooseGardenRoute(journey.placement, movement, obstacles, random, journey.previousCell)
  journey.destination = routeDestination(journey.path)
  journey.progress = 0
  journey.returning = false
  journey.replan = false
  journey.pauseRemaining = journey.path.length ? 0 : 1000
}

/** Pure, elapsed-time-based navigation. Unused time crosses node boundaries;
 * there is no timer, easing restart or random stop at an intermediate cell.
 */
export function advanceGardenJourney(source: GardenJourney, movement: CreatureMovement, obstacles: GardenCell[], elapsedMs: number, random: () => number = Math.random): { journey: GardenJourney; arrivals: GardenPlacement[] } {
  const journey = { ...source, placement: { ...source.placement } }
  const arrivals: GardenPlacement[] = []
  let remaining = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0
  if (!remaining) return { journey, arrivals }

  // Revalidate a saved route against the current scene. If its active endpoint
  // becomes blocked, return along the already-travelled edge before replanning.
  const invalid = journey.path.findIndex((cell, index) => !canNavigateStep(index ? journey.path[index - 1] : journey.placement, cell, movement, obstacles))
  if (invalid >= 0 && !journey.returning) {
    if (journey.progress === 0) retarget(journey, movement, obstacles, random)
    else if (invalid === 0) journey.returning = true
    else journey.replan = true
  }

  for (let iteration = 0; remaining > 0 && iteration < 128; iteration++) {
    if (journey.pauseRemaining > 0) {
      const used = Math.min(remaining, journey.pauseRemaining)
      remaining -= used
      journey.pauseRemaining -= used
      if (journey.pauseRemaining > 0) break
      retarget(journey, movement, obstacles, random)
      if (journey.pauseRemaining > 0) break // enclosed habitat: retry later, no busy loop
    }
    if (!journey.path.length) {
      retarget(journey, movement, obstacles, random)
      if (!journey.path.length) break
    }
    const next = journey.path[0]
    const fromPoint = isoPosition(journey.placement.x, journey.placement.y), toPoint = isoPosition(next.x, next.y)
    const duration = Math.hypot(toPoint.left - fromPoint.left, toPoint.top - fromPoint.top) / journey.pixelsPerSecond * 1000
    journey.placement.direction = journey.returning ? facing(next, journey.placement) : facing(journey.placement, next)
    const distanceToEnd = journey.returning ? journey.progress : 1 - journey.progress
    const used = Math.min(remaining, distanceToEnd * duration)
    journey.progress += (journey.returning ? -1 : 1) * used / duration
    remaining -= used
    if (used + .00001 < distanceToEnd * duration) break
    if (journey.returning) {
      retarget(journey, movement, obstacles, random)
      continue
    }
    journey.previousCell = { x: journey.placement.x, y: journey.placement.y }
    journey.placement = { ...journey.placement, x: next.x, y: next.y }
    journey.progress = 0
    journey.path = journey.path.slice(1)
    arrivals.push({ ...journey.placement })
    if (journey.replan) retarget(journey, movement, obstacles, random)
    else if (!journey.path.length) {
      journey.destination = null
      // Pause only at a destination, occasionally, with an independent duration.
      if (random() < .2) journey.pauseRemaining = 1000 + random() * 3000
      else retarget(journey, movement, obstacles, random)
    }
    if (journey.path.length && !journey.returning) journey.placement.direction = facing(journey.placement, journey.path[0])
  }
  return { journey, arrivals }
}

/** Interpolate projected endpoints, not fractional grid elevation (ramp-safe). */
export function gardenJourneyFrame(journey: GardenJourney): GardenJourneyFrame {
  const from = isoPosition(journey.placement.x, journey.placement.y)
  const to = journey.path.length ? isoPosition(journey.path[0].x, journey.path[0].y) : from
  return { placement: journey.placement, left: from.left + (to.left - from.left) * journey.progress, top: from.top + (to.top - from.top) * journey.progress, moving: journey.path.length > 0 && journey.pauseRemaining === 0, destination: journey.destination, progress: journey.progress }
}
