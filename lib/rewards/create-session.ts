import { selectCatalogReward } from './catalog'
import { loadAppState, upsertSession } from '@/lib/storage/app-state'
import type { HomeworkSession } from '@/lib/types'

type SessionDraft = Omit<HomeworkSession, 'decor' | 'creature' | 'rewardSequence'>
/** A same-origin browser lock serializes reservation across tabs. The fresh read,
 * selection and journal commit are synchronous inside that lock. Closing a
 * tab after commit leaves the gift reserved with its resumable session.
 */
export async function createCatalogSession(draft: SessionDraft): Promise<HomeworkSession> {
  if (typeof navigator === 'undefined' || !navigator.locks) throw new Error('La réservation sûre nécessite un navigateur compatible avec Web Locks.')
  return navigator.locks.request('homework-garden-reward-reservation-v1', () => {
    const state = loadAppState({ strict: true })
    const session: HomeworkSession = { ...draft, ...selectCatalogReward(state, draft.exercises.length) }
    upsertSession(session)
    return session
  })
}
