import type { Exercise } from '@/lib/types'
import type { ExerciseField, ExerciseModule, ExerciseOptions } from '../contracts'
import { fallbackHint, generateBatch, makeExercise, normalizeFields, orderedRange, randomInteger } from '../shared'

const fields: ExerciseField[] = [
  { key: 'minimum', label: 'Premier nombre minimum', min: 0, max: 999000 },
  { key: 'maximum', label: 'Premier nombre maximum', min: 0, max: 999000 },
  { key: 'minStep', label: 'Pas minimum', min: 1, max: 100 },
  { key: 'maxStep', label: 'Pas maximum', min: 1, max: 100 },
]
const defaults: ExerciseModule['defaults'] = difficulty => ({ count: 10, difficulty, parameters: difficulty === 'easy' ? { minimum: 0, maximum: 20, minStep: 1, maxStep: 2 } : difficulty === 'hard' ? { minimum: 50, maximum: 500, minStep: 5, maxStep: 50 } : { minimum: 0, maximum: 80, minStep: 2, maxStep: 10 } })
function normalize(options: ExerciseOptions) {
  const safe = normalizeFields(options, defaults(options.difficulty), fields)
  return { ...safe, parameters: orderedRange(orderedRange(safe.parameters, 'minimum', 'maximum'), 'minStep', 'maxStep') }
}
export function makeSequence(start: number, step: number, missingIndex: number): Exercise {
  if (![start, step, missingIndex, start + 4 * step].every(Number.isSafeInteger) || start < 0 || step < 1 || missingIndex < 1 || missingIndex > 3) throw new RangeError('Suite croissante de cinq entiers, avec un trou intérieur.')
  return makeExercise({ kind: 'number_sequence', instruction: 'Quel nombre manque ?', prompt: Array.from({ length: 5 }, (_, index) => index === missingIndex ? '?' : String(start + index * step)).join(' – '), expectedAnswer: start + missingIndex * step, data: { start, step, missingIndex } })
}
function readSequence(exercise: Exercise) {
  const { start, step, missingIndex } = exercise.data ?? {}
  if (typeof start !== 'number' || typeof step !== 'number' || typeof missingIndex !== 'number' || ![start, step, missingIndex, start + 4 * step].every(Number.isSafeInteger) || start < 0 || step < 1 || missingIndex < 1 || missingIndex > 3) return null
  return { start, step, missingIndex }
}
export const sequenceModule: ExerciseModule = {
  kind: 'number_sequence', label: 'Suites numériques', shortLabel: 'Suites numériques', fields, defaults, normalize,
  generate: (options, random = Math.random) => {
    const safe = normalize(options), { minimum, maximum, minStep, maxStep } = safe.parameters
    return generateBatch(safe.count, () => makeSequence(randomInteger(minimum, maximum, random), randomInteger(minStep, maxStep, random), randomInteger(1, 3, random)))
  },
  isValidExercise: exercise => { const data = readSequence(exercise); return exercise.kind === 'number_sequence' && Boolean(data && exercise.expectedAnswer === data.start + data.step * data.missingIndex) },
  hint: exercise => { const data = readSequence(exercise); return data ? `On ajoute toujours le même nombre : ${data.step}. Avance de ${data.step} à chaque fois.` : fallbackHint },
}
