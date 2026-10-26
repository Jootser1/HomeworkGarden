import { canCreatureStep, footprint, gardenTiles, tileAt } from '@/lib/garden/map'
import { decorDefinitions } from '@/lib/garden/decor'
import type { AppState, CreatureMovement } from '@/lib/types'

export type GardenCell = { x: number; y: number }
export const sameCell = (a: GardenCell, b: GardenCell) => a.x === b.x && a.y === b.y
const cellKey = (cell: GardenCell) => `${cell.x}:${cell.y}`

/** Call when the stored scene changes, not on every animation frame. */
export function decorObstacles(state: AppState): GardenCell[] {
  return (state.garden.decorPlacements ?? []).flatMap((placement) => {
    const decor = state.sessions.find((session) => session.decor?.id === placement.decorId)?.decor
    if (!decor) return []
    const definition = decorDefinitions[decor.recipe.variant]
    return footprint(placement.x, placement.y, definition.width, definition.height)
  })
}

export function canNavigateStep(from: GardenCell, to: GardenCell, movement: CreatureMovement, obstacles: GardenCell[]) {
  if (![from.x, from.y, to.x, to.y].every(Number.isInteger) || Math.abs(from.x - to.x) + Math.abs(from.y - to.y) !== 1) return false
  const start = tileAt(from.x, from.y), end = tileAt(to.x, to.y)
  if (!start || !end || !end.walkable) return false
  if (movement.type === 'flying' || movement.type === 'floating') return movement.allowedTerrain.includes(end.terrain)
  return canCreatureStep(start, end, movement.allowedTerrain) && !obstacles.some(cell => sameCell(cell, to))
}

type SearchNode = { cell: GardenCell; parent: SearchNode | null; distance: number }
/** Uniform cardinal edge costs: BFS produces a shortest legal route, including ramps. */
function reachable(start: GardenCell, movement: CreatureMovement, obstacles: GardenCell[], maxDistance: number) {
  if (!Number.isInteger(start.x) || !Number.isInteger(start.y) || !tileAt(start.x, start.y)) return []
  const queue: SearchNode[] = [{ cell: start, parent: null, distance: 0 }]
  const seen = new Set([cellKey(start)])
  for (let index = 0; index < queue.length; index++) {
    const node = queue[index]
    if (node.distance >= maxDistance) continue
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const cell = { x: node.cell.x + dx, y: node.cell.y + dy }
      if (seen.has(cellKey(cell)) || !canNavigateStep(node.cell, cell, movement, obstacles)) continue
      seen.add(cellKey(cell))
      queue.push({ cell, parent: node, distance: node.distance + 1 })
    }
  }
  return queue
}
function reconstruct(node: SearchNode) {
  const path: GardenCell[] = []
  for (let current: SearchNode | null = node; current?.parent; current = current.parent) path.push(current.cell)
  return path.reverse()
}
/** Excludes the start cell; [] means already there, invalid target, or unreachable. */
export function findGardenPath(start: GardenCell, destination: GardenCell, movement: CreatureMovement, obstacles: GardenCell[]): GardenCell[] {
  const target = reachable(start, movement, obstacles, gardenTiles.length).find(node => sameCell(node.cell, destination))
  return target ? reconstruct(target) : []
}

/** Choose a reachable destination FIRST, then use its complete shortest route.
 * Prefer 4–10 edges; accept a shorter route in small enclosed habitats.
 */
export function chooseGardenRoute(start: GardenCell, movement: CreatureMovement, obstacles: GardenCell[], random: () => number = Math.random, previousCell?: GardenCell): GardenCell[] {
  const nodes = reachable(start, movement, obstacles, 10).filter(node => node.distance > 0)
  const distant = nodes.filter(node => node.distance >= 4)
  let candidates = distant.length ? distant : nodes
  if (previousCell) {
    const forwards = candidates.filter(node => !sameCell(reconstruct(node)[0], previousCell))
    if (forwards.length) candidates = forwards
  }
  if (!candidates.length) return []
  const index = Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))
  return reconstruct(candidates[index])
}
