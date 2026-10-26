import type { Exercise } from '@/lib/types'
import type { ExerciseField, ExerciseModule, ExerciseOptions } from '../contracts'
import { fallbackHint, generateBatch, makeExercise, normalizeFields, orderedRange, randomInteger } from '../shared'

const fields: ExerciseField[] = [
  { key: 'minimum', label: 'Nombre minimum', min: 0, max: 999999 },
  { key: 'maximum', label: 'Nombre maximum', min: 0, max: 999999 },
]
const defaults: ExerciseModule['defaults'] = difficulty => ({ count: 10, difficulty, parameters: { minimum: 0, maximum: difficulty === 'easy' ? 20 : difficulty === 'hard' ? 1000 : 100 } })
function normalize(options: ExerciseOptions) {
  const safe = normalizeFields(options, defaults(options.difficulty), fields)
  const parameters = orderedRange(safe.parameters, 'minimum', 'maximum')
  if (parameters.minimum === parameters.maximum) {
    if (parameters.maximum < 999999) parameters.maximum++
    else parameters.minimum--
  }
  return { ...safe, parameters }
}
export function makeComparison(a: number, b: number): Exercise {
  if (![a, b].every(Number.isSafeInteger) || Math.min(a, b) < 0 || a === b) throw new RangeError('Deux entiers naturels distincts sont nécessaires.')
  return makeExercise({ kind: 'number_comparison', prompt: 'Lequel est le plus grand ?', choices: [a, b], expectedAnswer: Math.max(a, b) })
}
export const comparisonModule: ExerciseModule = {
  kind: 'number_comparison', label: 'Comparaison de nombres', shortLabel: 'Comparaisons', fields, defaults, normalize,
  generate: (options, random = Math.random) => {
    const safe = normalize(options), { minimum, maximum } = safe.parameters
    return generateBatch(safe.count, () => {
      const a = randomInteger(minimum, maximum, random)
      let b = randomInteger(minimum, maximum - 1, random)
      if (b >= a) b++
      return makeComparison(a, b)
    })
  },
  isValidExercise: exercise => exercise.kind === 'number_comparison' && Array.isArray(exercise.choices) && exercise.choices.length === 2 && exercise.choices.every(value => Number.isSafeInteger(value) && value >= 0) && exercise.choices[0] !== exercise.choices[1] && exercise.expectedAnswer === Math.max(...exercise.choices),
  hint: exercise => exercise.choices?.length === 2 ? 'Compare le nombre de chiffres. S’il est identique, compare les chiffres de gauche à droite.' : fallbackHint,
}
