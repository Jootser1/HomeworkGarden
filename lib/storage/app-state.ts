import type { AppState, Creature, HomeworkSession } from '@/lib/types'

const STORAGE_KEY = 'homework-garden-state-v1'

const initialState: AppState = {
  sessions: [],
  garden: { placements: [] },
}

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return initialState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as AppState
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      garden: parsed.garden?.placements ? parsed.garden : { placements: [] },
    }
  } catch {
    return initialState
  }
}

export function saveAppState(state: AppState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('homework-garden-state-change'))
}

export function upsertSession(session: HomeworkSession) {
  const state = loadAppState()
  const index = state.sessions.findIndex((item) => item.id === session.id)
  if (index >= 0) state.sessions[index] = session
  else state.sessions.unshift(session)
  saveAppState(state)
}

export function getSession(sessionId: string): HomeworkSession | undefined {
  return loadAppState().sessions.find((session) => session.id === sessionId)
}

export function addCreatureToGarden(creature: Creature) {
  const state = loadAppState()
  const existingSession = state.sessions.find((session) => session.creature.id === creature.id)
  if (existingSession) {
    existingSession.creature = creature
    existingSession.status = 'completed'
  }
  if (!state.garden.placements.some((placement) => placement.creatureId === creature.id)) {
    state.garden.placements.push({
      creatureId: creature.id,
      x: Math.floor(Math.random() * 6) + 1,
      y: Math.floor(Math.random() * 5) + 1,
      direction: 'down',
    })
  }
  saveAppState(state)
}

export function resetAppState() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('homework-garden-state-change'))
  }
}
