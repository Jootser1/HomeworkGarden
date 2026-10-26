import type { HomeworkSession } from '@/lib/types'
import { sessionCompositionId } from '@/lib/rewards/catalog'
import { catalogCreatureArtSchema, catalogDecorArtSchema } from '@/lib/rewards/vector'

const prefix = 'homework-garden-catalog-reward-v1:'
const cache = new Map<string, { raw: string; session: HomeworkSession }>()
function validate(session: HomeworkSession, compositionId: string) {
  if (!session || typeof session.id !== 'string' || typeof session.createdAt !== 'string' || !['active', 'completed'].includes(session.status) || !Array.isArray(session.exercises) || session.exercises.length < 1 || session.exercises.length > 40 || sessionCompositionId(session) !== compositionId) throw new Error('Réservation corrompue')
  if (session.decor) {
    const art = catalogDecorArtSchema.parse(session.decor.catalogArt)
    if (art.groups.length !== session.exercises.length || session.decor.stepCount !== session.exercises.length) throw new Error('Réservation incohérente')
  } else if (session.creature) {
    const art = catalogCreatureArtSchema.parse(session.creature.catalogArt)
    if (!Array.isArray(session.creature.parts) || art.groups.length !== session.creature.parts.length || art.groups.length !== session.exercises.length) throw new Error('Réservation incohérente')
  } else throw new Error('Cadeau manquant')
  return session
}
function keys() {
  return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)!).filter(key => key?.startsWith(prefix))
}
/** Each composition has its own durable key. A stale garden write cannot erase
 * another tab's reservation or progress. The aggregate state remains compatible.
 */
export function readRewardJournal(strict = false) {
  const sessions: HomeworkSession[] = [], reserved: string[] = []
  if (typeof window === 'undefined') return { sessions, reserved }
  for (const key of keys()) {
    const id = key.slice(prefix.length)
    reserved.push(id) // Even a damaged entry remains reserved, never silently reused.
    try {
      const raw = localStorage.getItem(key)!
      const cached = cache.get(key)
      const session = cached?.raw === raw ? cached.session : validate(JSON.parse(raw), id)
      cache.set(key, { raw, session })
      sessions.push(structuredClone(session))
    } catch (error) { if (strict) throw error }
  }
  return { sessions, reserved }
}
export function writeRewardJournal(session: HomeworkSession) {
  const id = sessionCompositionId(session)
  if (!id || typeof window === 'undefined') return
  validate(session, id)
  localStorage.setItem(prefix + id, JSON.stringify(session))
}
export function resetRewardJournal() {
  for (const key of keys()) localStorage.removeItem(key)
  cache.clear()
}
