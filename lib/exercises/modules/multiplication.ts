import type { Exercise } from '@/lib/types'
import type { ExerciseField, ExerciseModule, ExerciseOptions } from '../contracts'
import { fallbackHint, makeExercise, normalizeFields, orderedRange, randomInteger } from '../shared'

const fields: ExerciseField[] = [
  { key: 'tableMin', label: 'Première table', min: 0, max: 12 },
  { key: 'tableMax', label: 'Dernière table', min: 0, max: 12 },
  { key: 'multiplierMin', label: 'Multiplicateur minimum', min: 0, max: 12 },
  { key: 'multiplierMax', label: 'Multiplicateur maximum', min: 0, max: 12 },
]
const defaults: ExerciseModule['defaults'] = difficulty => ({ count: 10, difficulty, parameters: { tableMin: 2, tableMax: difficulty === 'easy' ? 5 : difficulty === 'hard' ? 12 : 10, multiplierMin: difficulty === 'hard' ? 0 : 1, multiplierMax: difficulty === 'easy' ? 5 : difficulty === 'hard' ? 12 : 10 } })
function normalize(options: ExerciseOptions) {
  const safe = normalizeFields(options, defaults(options.difficulty), fields)
  return { ...safe, parameters: orderedRange(orderedRange(safe.parameters, 'tableMin', 'tableMax'), 'multiplierMin', 'multiplierMax') }
}
const validFactor = (value: number) => Number.isSafeInteger(value) && value >= 0 && value <= 12
export function makeMultiplication(a: number, b: number): Exercise {
  if (!validFactor(a) || !validFactor(b)) throw new RangeError('Les tables et multiplicateurs doivent être des entiers entre 0 et 12.')
  return makeExercise({ kind: 'multiplication_tables', prompt: `${a} × ${b}`, operands: [a, b], expectedAnswer: a * b })
}
const isValidExercise: ExerciseModule['isValidExercise'] = exercise => exercise.kind === 'multiplication_tables' && Array.isArray(exercise.operands) && exercise.operands.length === 2 && exercise.operands.every(validFactor) && exercise.expectedAnswer === exercise.operands[0] * exercise.operands[1]

export const multiplicationModule: ExerciseModule = {
  kind: 'multiplication_tables', label: 'Tables de multiplication', shortLabel: 'Multiplications', fields, defaults, normalize, isValidExercise,
  generate: (options, random = Math.random) => {
    const safe = normalize(options), { tableMin, tableMax, multiplierMin, multiplierMax } = safe.parameters
    // The finite curriculum (at most 13 × 13 facts) is shuffled without replacement.
    // A pinned table covers all its requested multipliers before any repetition,
    // even with a constant RNG. Tiny custom pools cycle to fulfil the chosen count.
    const facts: [number, number][] = []
    for (let a = tableMin; a <= tableMax; a++) for (let b = multiplierMin; b <= multiplierMax; b++) facts.push([a, b])
    for (let i = facts.length - 1; i > 0; i--) {
      const j = randomInteger(0, i, random)
      ;[facts[i], facts[j]] = [facts[j], facts[i]]
    }
    return Array.from({ length: safe.count }, (_, index) => makeMultiplication(...facts[index % facts.length]))
  },
  hint: exercise => {
    if (!isValidExercise(exercise)) return fallbackHint
    const [a, b] = exercise.operands!
    if (a === 0 || b === 0) return 'Multiplier par zéro donne toujours zéro.'
    if (a === 1 || b === 1) return 'Multiplier par 1 garde le même nombre.'
    return `Tu peux partir de ${a} × ${b - 1}, puis ajouter encore ${a}.`
  },
}
