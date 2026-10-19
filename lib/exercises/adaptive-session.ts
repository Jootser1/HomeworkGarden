import { defaultAdditionOptions } from '@/lib/exercises/additions'
import type { AdditionGenerationOptions, ExerciseDifficulty, HomeworkSession } from '@/lib/types'

export type SessionRecommendation = {
  options: AdditionGenerationOptions
  reason: 'first' | 'steady' | 'support' | 'advance' | 'custom'
  basedOnSessionId?: string
}

const levels: ExerciseDifficulty[] = ['easy', 'medium', 'hard']
const rangeKeys = ['minBase', 'maxBase', 'addendMin', 'addendMax'] as const
const minimumSample = 5
const supportRetryRate = 0.4
const advanceRetryRate = 0.1
const progressStreakLength = 3

function isFullySolved(session: HomeworkSession): boolean {
  return session?.exerciseKind === 'addition_crossing_ten'
    && Array.isArray(session.exercises)
    && session.exercises.length > 0
    && session.exercises.every((exercise) => exercise?.status === 'correct'
      && Array.isArray(exercise.operands)
      && exercise.operands.length === 2
      && exercise.operands.every(Number.isSafeInteger)
      && exercise.operands[0] >= 0
      && exercise.operands[1] >= 1
      && exercise.operands[1] <= 99)
}

function solvingTime(session: HomeworkSession): number {
  const solved = Date.parse(session.solvedAt ?? '')
  const created = Date.parse(session.createdAt)
  return Number.isFinite(solved) ? solved : Number.isFinite(created) ? created : 0
}

function isValidOptions(options: AdditionGenerationOptions | undefined): options is AdditionGenerationOptions {
  return Boolean(options
    && levels.includes(options.difficulty)
    && rangeKeys.every((key) => Number.isSafeInteger(options[key]))
    && options.minBase >= 0
    && options.maxBase >= options.minBase
    && options.maxBase <= Number.MAX_SAFE_INTEGER - 99
    && options.addendMin >= 1
    && options.addendMax >= options.addendMin
    && options.addendMax <= 99)
}

function optionsFor(session: HomeworkSession): AdditionGenerationOptions {
  const count = Math.min(40, Math.max(1, session.exercises.length))
  if (isValidOptions(session.generationOptions)) return { ...session.generationOptions, count }

  // Legacy/manual sessions did not record their generation settings.
  const maxBase = session.exercises.reduce((max, exercise) => Math.max(max, exercise.operands[0]), 0)
  const maxAddend = session.exercises.reduce((max, exercise) => Math.max(max, exercise.operands[1]), 0)
  const level = maxAddend > 9 || maxBase >= 250 ? 'hard' : maxBase <= 60 ? 'easy' : 'medium'
  return { ...defaultAdditionOptions(level), count }
}

function sameLevel(a: AdditionGenerationOptions, b: AdditionGenerationOptions): boolean {
  return a.difficulty === b.difficulty && rangeKeys.every((key) => a[key] === b[key])
}

function retryRate(session: HomeworkSession): number | null {
  if (session.exercises.length < minimumSample
    || session.exercises.some((exercise) => !Number.isSafeInteger(exercise.attempts) || exercise.attempts < 1)) return null
  return session.exercises.filter((exercise) => exercise.attempts > 1).length / session.exercises.length
}

export function recommendAdditionSession(sessions: HomeworkSession[]): SessionRecommendation {
  const history = sessions.filter(isFullySolved).sort((a, b) => solvingTime(b) - solvingTime(a))
  const latest = history[0]
  if (!latest) return { options: defaultAdditionOptions('medium'), reason: 'first' }

  const options = optionsFor(latest)
  const base: SessionRecommendation = { options, reason: 'steady', basedOnSessionId: latest.id }
  // Explicit numerical choices belong to the parent, not to the preset ladder.
  if (!sameLevel(options, defaultAdditionOptions(options.difficulty))) return { ...base, reason: 'custom' }

  const rate = retryRate(latest)
  if (rate === null) return base
  const levelIndex = levels.indexOf(options.difficulty)
  if (rate >= supportRetryRate && levelIndex > 0) {
    return { ...base, options: { ...defaultAdditionOptions(levels[levelIndex - 1]), count: options.count }, reason: 'support' }
  }

  const recent = history.slice(0, progressStreakLength)
  const readyToAdvance = recent.length === progressStreakLength && recent.every((session) => {
    const sessionRate = retryRate(session)
    return sessionRate !== null && sessionRate <= advanceRetryRate && sameLevel(optionsFor(session), options)
  })
  if (readyToAdvance && levelIndex < levels.length - 1) {
    return { ...base, options: { ...defaultAdditionOptions(levels[levelIndex + 1]), count: options.count }, reason: 'advance' }
  }
  return base
}
