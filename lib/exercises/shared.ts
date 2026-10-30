import type { Exercise, ExerciseDifficulty } from '@/lib/types'
import type { ExerciseField, ExerciseOptions } from './contracts'

export const difficulties: ExerciseDifficulty[] = ['easy', 'medium', 'hard']
export const boundedInteger = (value: number, fallback: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback
export const randomInteger = (min: number, max: number, random: () => number) => min + Math.min(max - min, Math.max(0, Math.floor(random() * (max - min + 1))))
let serial = 0
export function makeExercise(content: Pick<Exercise, 'kind' | 'prompt' | 'expectedAnswer'> & Partial<Pick<Exercise, 'choices' | 'instruction' | 'data' | 'operands'>>): Exercise {
  return { ...content, id: `exercise_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${++serial}`}`, attempts: 0, status: 'pending' }
}

/** Shared bounds/whitelisting, with module-specific relationships kept in modules. */
export function normalizeFields(options: ExerciseOptions, defaults: ExerciseOptions, fields: readonly ExerciseField[]): ExerciseOptions {
  return {
    count: boundedInteger(options.count, defaults.count, 1, 50),
    difficulty: difficulties.includes(options.difficulty) ? options.difficulty : defaults.difficulty,
    parameters: Object.fromEntries(fields.map(field => [field.key, boundedInteger(options.parameters[field.key], defaults.parameters[field.key], field.min, field.max)])),
  }
}

export function orderedRange(parameters: Record<string, number>, lower: string, upper: string) {
  const [min, max] = [Math.min(parameters[lower], parameters[upper]), Math.max(parameters[lower], parameters[upper])]
  return { ...parameters, [lower]: min, [upper]: max }
}

/** Bounded unique sampling; deterministic/randomly unlucky sources cannot hang.
 * Tiny custom domains may necessarily repeat to fulfil the requested count.
 */
export function generateBatch(count: number, sample: (index: number) => Exercise): Exercise[] {
  const result: Exercise[] = [], seen = new Set<string>()
  for (let attempt = 0; result.length < count && attempt < count * 20; attempt++) {
    const exercise = sample(attempt)
    if (seen.has(exercise.prompt + JSON.stringify(exercise.choices))) continue
    seen.add(exercise.prompt + JSON.stringify(exercise.choices))
    result.push(exercise)
  }
  while (result.length < count) result.push(sample(result.length))
  return result
}

export function isCorrectAnswer(exercise: Exercise, answer: number) {
  return Number.isSafeInteger(answer) && answer === exercise.expectedAnswer
}
export const fallbackHint = 'Prends ton temps et regarde bien les nombres.'
