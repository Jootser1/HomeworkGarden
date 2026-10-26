import type { Exercise } from '@/lib/types'
import type { ExerciseField, ExerciseModule, ExerciseOptions } from '../contracts'
import { fallbackHint, generateBatch, makeExercise, normalizeFields, orderedRange, randomInteger } from '../shared'

const fields: ExerciseField[] = [
  { key: 'minimum', label: 'Nombre de départ minimum', min: 0, max: 999999 },
  { key: 'maximum', label: 'Nombre de départ maximum', min: 0, max: 999999 },
]
const defaults: ExerciseModule['defaults'] = difficulty => ({ count: 10, difficulty, parameters: difficulty === 'easy' ? { minimum: 1, maximum: 20 } : difficulty === 'hard' ? { minimum: 100, maximum: 1000 } : { minimum: 20, maximum: 100 } })
function normalize(options: ExerciseOptions) {
  const safe = normalizeFields(options, defaults(options.difficulty), fields)
  return { ...safe, parameters: orderedRange(safe.parameters, 'minimum', 'maximum') }
}
function validOperands(a: number, b: number) {
  return Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && a <= 999999 && b >= 0 && b <= a
}
export function makeSubtraction(a: number, b: number): Exercise {
  if (!validOperands(a, b)) throw new RangeError('Soustraction de deux entiers naturels, avec un résultat entre 0 et 999999.')
  return makeExercise({ kind: 'subtraction', prompt: `${a} − ${b}`, operands: [a, b], expectedAnswer: a - b })
}
const isValidExercise: ExerciseModule['isValidExercise'] = exercise => exercise.kind === 'subtraction' && Array.isArray(exercise.operands) && exercise.operands.length === 2 && validOperands(...exercise.operands) && exercise.expectedAnswer === exercise.operands[0] - exercise.operands[1]

export const subtractionModule: ExerciseModule = {
  kind: 'subtraction', label: 'Soustractions', shortLabel: 'Soustractions', fields, defaults, normalize, isValidExercise,
  generate: (options, random = Math.random) => {
    const safe = normalize(options), { minimum, maximum } = safe.parameters
    return generateBatch(safe.count, () => {
      const a = randomInteger(minimum, maximum, random)
      let b = 0
      if (safe.difficulty === 'easy') {
        // Pick each digit independently below the corresponding starting digit:
        // no rejection loop, no borrowing, even for restrictive custom ranges.
        for (let place = 1; place <= a; place *= 10) b += randomInteger(0, Math.floor(a / place) % 10, random) * place
      } else b = randomInteger(a === 0 ? 0 : 1, Math.min(a, safe.difficulty === 'hard' ? 99 : 20), random)
      return makeSubtraction(a, b)
    })
  },
  hint: exercise => {
    if (!isValidExercise(exercise)) return fallbackHint
    const [a, b] = exercise.operands!
    if (b === 0) return 'Retirer zéro ne change pas le nombre de départ.'
    if (a === b) return 'Quand on retire tout le nombre de départ, il ne reste rien.'
    const tens = Math.floor(b / 10) * 10, units = b % 10, toTen = a % 10
    if (tens && units) return `Retire d’abord ${tens}, puis encore ${units}.`
    if (b < 10 && toTen > 0 && b > toTen) return `Retire d’abord ${toTen} pour atteindre ${a - toTen}, puis encore ${b - toTen}.`
    return `Compte à reculons de ${b} à partir de ${a}.`
  },
}
