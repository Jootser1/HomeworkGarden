import type { AppState, Creature, GardenPlacement, HomeworkSession } from '@/lib/types'
import { canNavigateStep, decorObstacles } from '@/lib/garden/movement'
import { canPlaceDecor, randomAllowedTile } from '@/lib/garden/map'
import { upgradePebbleDecor } from '@/lib/garden/decor-build'
import { reservedCompositions, sessionCompositionId } from '@/lib/rewards/catalog'
import { readRewardJournal, resetRewardJournal, writeRewardJournal } from '@/lib/storage/reward-journal'

const STORAGE_KEY = 'homework-garden-state-v1'

const initialState: AppState = {
  sessions: [],
  garden: { placements: [] },
}

export function loadAppState({ strict = false }: { strict?: boolean } = {}): AppState {
  if (typeof window === 'undefined') return structuredClone(initialState)
  let state = structuredClone(initialState)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (strict && (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.garden?.placements) || (parsed.rewardHistory !== undefined && (!Array.isArray(parsed.rewardHistory) || parsed.rewardHistory.some(id => typeof id !== 'string'))))) throw new Error('Sauvegarde corrompue : attribution refusée')
      state = {
        ...(Array.isArray(parsed.rewardHistory) ? { rewardHistory: parsed.rewardHistory.filter(id => typeof id === 'string') } : {}),
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions.map((session) => session.status !== 'completed' && session.decor ? { ...session, decor: upgradePebbleDecor(session.decor) } : session) : [],
        garden: { ...parsed.garden, placements: Array.isArray(parsed.garden?.placements) ? parsed.garden.placements : [], decorPlacements: Array.isArray(parsed.garden?.decorPlacements) ? parsed.garden.decorPlacements : [] },
      }
    }
  } catch (error) { if (strict) throw error }
  try {
    const journal = readRewardJournal(strict)
    for (const session of journal.sessions) {
      const index = state.sessions.findIndex(item => item.id === session.id)
      if (index >= 0) state.sessions[index] = session
      else state.sessions.unshift(session)
    }
    if (journal.reserved.length) state.rewardHistory = [...new Set([...reservedCompositions(state), ...journal.reserved])]
  } catch (error) { if (strict) throw error }
  return state
}

export function saveAppState(state: AppState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('homework-garden-state-change'))
}

export function upsertSession(session: HomeworkSession) {
  const compositionId = sessionCompositionId(session)
  const state = loadAppState({ strict: Boolean(compositionId) })
  const index = state.sessions.findIndex((item) => item.id === session.id)
  if (compositionId) {
    const reserved = reservedCompositions(state)
    if (reserved.has(compositionId) && (index < 0 || sessionCompositionId(state.sessions[index]) !== compositionId)) throw new Error('Cette composition est déjà réservée.')
    state.rewardHistory = [...new Set([...reserved, compositionId])]
  }
  if (index >= 0) state.sessions[index] = session
  else state.sessions.unshift(session)
  // The per-composition record is the commit point. A stale garden snapshot
  // cannot erase it; the aggregate is a backwards-compatible materialized view.
  if (compositionId) writeRewardJournal(session)
  try { saveAppState(state) }
  catch (error) {
    if (!compositionId) throw error
    window.dispatchEvent(new Event('homework-garden-state-change'))
  }
}

export function getSession(sessionId: string): HomeworkSession | undefined {
  return loadAppState().sessions.find((session) => session.id === sessionId)
}

export function addCreatureToGarden(creature: Creature) {
  const state = loadAppState()
  const existingSession = state.sessions.find((session) => session.creature?.id === creature.id)
  if (existingSession) {
    existingSession.creature = creature
    existingSession.status = 'completed'
    writeRewardJournal(existingSession)
  }
  if (!state.garden.placements.some((placement) => placement.creatureId === creature.id)) {
    const tile = randomAllowedTile(creature.movement.allowedTerrain, creature.movement.preferredBiomes)
    state.garden.placements.push({ creatureId: creature.id, x: tile.x, y: tile.y, direction: 'down' })
  }
  saveAppState(state)
}

/** Save completed route nodes only, merging into the latest authoritative state.
 * A stale journey cannot overwrite a relocation, reset, new décor or session.
 */
export function saveGardenArrivals(arrivals: { from: GardenPlacement; to: GardenPlacement }[]) {
  const state = loadAppState()
  const obstacles = decorObstacles(state)
  let changed = false
  state.garden.placements = state.garden.placements.map(placement => {
    const update = arrivals.find(item => item.to.creatureId === placement.creatureId)
    if (!update || placement.x !== update.from.x || placement.y !== update.from.y || placement.direction !== update.from.direction) return placement
    const creature = state.sessions.find(session => session.creature?.id === placement.creatureId)?.creature
    if (!creature || creature.state !== 'alive_in_garden' || !canNavigateStep(placement, update.to, creature.movement, obstacles)) return placement
    changed = true
    return { ...placement, x: update.to.x, y: update.to.y, direction: update.to.direction }
  })
  if (changed) saveAppState(state)
}

export function placeDecor(decorId: string, x: number, y: number): boolean {
  const state = loadAppState()
  const decors = state.sessions.flatMap((session) => session.status === 'completed' && session.decor ? [session.decor] : [])
  const decor = decors.find((item) => item.id === decorId)
  if (!decor || decor.revealedSteps < decor.stepCount || !canPlaceDecor(decor, x, y, state.garden.decorPlacements ?? [], decors)) return false
  state.garden.decorPlacements = [...(state.garden.decorPlacements ?? []).filter((item) => item.decorId !== decorId), { decorId, x, y }]
  saveAppState(state)
  return true
}

export function storeDecor(decorId: string) {
  const state = loadAppState()
  state.garden.decorPlacements = (state.garden.decorPlacements ?? []).filter((item) => item.decorId !== decorId)
  saveAppState(state)
}

export function resetAppState() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem('homework-garden-used-local-creatures-v2')
    resetRewardJournal()
    window.dispatchEvent(new Event('homework-garden-state-change'))
  }
}
