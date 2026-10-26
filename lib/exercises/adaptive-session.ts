import { defaultAdditionOptions } from '@/lib/exercises/additions'
import { recommendSession } from '@/lib/exercises/recommendation'
import type { Recommendation } from '@/lib/exercises/contracts'
import { difficulties } from '@/lib/exercises/shared'
import type { AdditionGenerationOptions, HomeworkSession } from '@/lib/types'

/** Compatibility adapter for historical addition sessions and callers. */
export type SessionRecommendation = Recommendation<AdditionGenerationOptions>
const rangeKeys = ['minBase', 'maxBase', 'addendMin', 'addendMax'] as const
function isFullySolved(session: HomeworkSession): boolean {
  return Array.isArray(session.exercises) && session.exercises.length > 0
    && session.exercises.every(exercise => exercise?.kind === 'addition_crossing_ten' && exercise.status === 'correct'
      && Array.isArray(exercise.operands) && exercise.operands.length === 2
      && exercise.operands.every(Number.isSafeInteger) && exercise.operands[0] >= 0
      && exercise.operands[1] >= 1 && exercise.operands[1] <= 99)
}
function isValidOptions(options: HomeworkSession['generationOptions']): options is AdditionGenerationOptions {
  if (!options || typeof options !== 'object' || 'parameters' in options) return false
  return difficulties.includes(options.difficulty)
    && rangeKeys.every(key => Number.isSafeInteger(options[key]))
    && options.minBase >= 0 && options.maxBase >= options.minBase
    && options.maxBase <= Number.MAX_SAFE_INTEGER - 99
    && options.addendMin >= 1 && options.addendMax >= options.addendMin && options.addendMax <= 99
}
function optionsFor(session: HomeworkSession): AdditionGenerationOptions {
  const count = Math.min(40, Math.max(1, session.exercises.length))
  const stored = session.generationOptions
  const candidate = stored && 'parameters' in stored ? {
    count, difficulty: stored.difficulty, minBase: stored.parameters.minBase, maxBase: stored.parameters.maxBase,
    addendMin: stored.parameters.addendMin, addendMax: stored.parameters.addendMax,
  } : stored
  if (isValidOptions(candidate)) return { ...candidate, count }
  const maxBase = session.exercises.reduce((max, exercise) => Math.max(max, exercise.operands?.[0] ?? 0), 0)
  const maxAddend = session.exercises.reduce((max, exercise) => Math.max(max, exercise.operands?.[1] ?? 0), 0)
  const level = maxAddend > 9 || maxBase >= 250 ? 'hard' : maxBase <= 60 ? 'easy' : 'medium'
  return { ...defaultAdditionOptions(level), count }
}
export function recommendAdditionSession(sessions: HomeworkSession[]): SessionRecommendation {
  return recommendSession(sessions, {
    kind: 'addition_crossing_ten', defaults: defaultAdditionOptions, isSolved: isFullySolved, optionsFor,
    sameLevel: (a, b) => a.difficulty === b.difficulty && rangeKeys.every(key => a[key] === b[key]),
  })
}
