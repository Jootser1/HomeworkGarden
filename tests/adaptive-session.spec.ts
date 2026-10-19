import { expect, test } from '@playwright/test'
import { recommendAdditionSession } from '@/lib/exercises/adaptive-session'
import { defaultAdditionOptions } from '@/lib/exercises/additions'
import { solvedSession } from './helpers/sessions'

const streak = () => [1, 2, 3].map((day) => solvedSession({ id: `session-${day}`, date: `2026-01-0${day}T12:00:00.000Z` }))

test('no history gives a ready-to-start default without changing history', () => {
  expect(recommendAdditionSession([])).toEqual({ options: defaultAdditionOptions('medium'), reason: 'first' })
})

test('uses the last fully solved session, not a newer unfinished or empty session', () => {
  const solved = solvedSession({ id: 'solved', count: 7 })
  const unfinished = solvedSession({ id: 'unfinished', date: '2026-01-03T12:00:00.000Z' })
  unfinished.status = 'active'
  unfinished.exercises[1].status = 'pending'
  const empty = solvedSession({ id: 'empty', date: '2026-01-04T12:00:00.000Z', count: 0 })
  const result = recommendAdditionSession([unfinished, empty, solved])
  expect(result.basedOnSessionId).toBe('solved')
  expect(result.options.count).toBe(7)
})

test('counts a fully solved session before the creature has been awakened', () => {
  const session = solvedSession({ count: 6 })
  session.status = 'active'
  expect(recommendAdditionSession([session]).options.count).toBe(6)
})

test('orders by actual solving date when available, not array order or creation only', () => {
  const earlierCreated = solvedSession({ id: 'last-solved', date: '2026-01-01T12:00:00.000Z', solvedAt: '2026-01-04T12:00:00.000Z', count: 8 })
  const laterCreated = solvedSession({ id: 'other', date: '2026-01-02T12:00:00.000Z', count: 12 })
  expect(recommendAdditionSession([laterCreated, earlierCreated]).basedOnSessionId).toBe('last-solved')
})

test('several difficult calculations soften one level but never add exercises', () => {
  const session = solvedSession({ count: 10, retried: 4 })
  const result = recommendAdditionSession([session])
  expect(result.reason).toBe('support')
  expect(result.options).toEqual({ ...defaultAdditionOptions('easy'), count: 10 })
})

test('repeated errors on just one calculation do not penalize the whole level', () => {
  const result = recommendAdditionSession([solvedSession({ retried: 1, retryAttempts: 12 })])
  expect(result.reason).toBe('steady')
  expect(result.options.difficulty).toBe('medium')
})

test('a session shorter than five calculations is insufficient to change level', () => {
  expect(recommendAdditionSession([solvedSession({ count: 3, retried: 3 })]).reason).toBe('steady')
})

test('one easy success does not immediately increase difficulty', () => {
  expect(recommendAdditionSession([solvedSession()]).reason).toBe('steady')
})

test('three consecutive easy sessions at the same level allow one step up, at the same length', () => {
  const result = recommendAdditionSession(streak())
  expect(result.reason).toBe('advance')
  expect(result.options).toEqual({ ...defaultAdditionOptions('hard'), count: 10 })
})

test('a struggling session or a different recent level interrupts the progress streak', () => {
  const sessions = streak()
  sessions[1] = solvedSession({ date: '2026-01-02T12:00:00.000Z', retried: 3 })
  expect(recommendAdditionSession(sessions).reason).toBe('steady')
  sessions[1] = solvedSession({ date: '2026-01-02T12:00:00.000Z', difficulty: 'easy' })
  expect(recommendAdditionSession(sessions).reason).toBe('steady')
})

test('bounds automatic difficulty at the easiest and hardest presets', () => {
  expect(recommendAdditionSession([solvedSession({ difficulty: 'easy', retried: 8 })]).options.difficulty).toBe('easy')
  expect(recommendAdditionSession(streak().map((session) => ({ ...session, generationOptions: defaultAdditionOptions('hard') }))).options.difficulty).toBe('hard')
})

test('preserves explicitly personalized numerical ranges rather than replacing them', () => {
  const session = solvedSession({ count: 9, retried: 7, options: { minBase: 30, maxBase: 90, addendMin: 3, addendMax: 8 } })
  expect(recommendAdditionSession([session]).options).toEqual(session.generationOptions)
})

test('legacy sessions without generation settings remain usable', () => {
  const session = solvedSession({ legacy: true, difficulty: 'easy', count: 8 })
  const result = recommendAdditionSession([session])
  expect(result.options).toEqual(defaultAdditionOptions('easy'))
  expect(result.basedOnSessionId).toBe(session.id)
})

test('missing attempt evidence cannot count as a successful progress streak', () => {
  const sessions = streak()
  sessions[1].exercises[0].attempts = 0
  expect(recommendAdditionSession(sessions).reason).toBe('steady')
})

test('very long legacy homework stays inside the supported generated count', () => {
  const result = recommendAdditionSession([solvedSession({ count: 45, legacy: true })])
  expect(result.options.count).toBe(40)
})

test('40 percent retries softens but just below the threshold preserves the level', () => {
  expect(recommendAdditionSession([solvedSession({ count: 10, retried: 4 })]).reason).toBe('support')
  expect(recommendAdditionSession([solvedSession({ count: 10, retried: 3 })]).reason).toBe('steady')
})

test('never increases the count, mutates history or uses impossible metadata', () => {
  const session = solvedSession({ count: 6, options: { maxBase: Number.NaN } })
  const before = structuredClone(session)
  const result = recommendAdditionSession([session])
  expect(result.options.count).toBe(6)
  expect(Number.isFinite(result.options.maxBase)).toBe(true)
  expect(session).toEqual(before)
})
