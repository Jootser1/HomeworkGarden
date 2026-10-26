import { defaultAdditionOptions, generateAdditionCrossingTen, getCrossingTenHint, parseManualAdditions } from '../additions'
import { recommendAdditionSession } from '../adaptive-session'
import type { ExerciseField, ExerciseModule, ExerciseOptions } from '../contracts'
import { normalizeFields, orderedRange } from '../shared'
import type { AdditionGenerationOptions } from '@/lib/types'

const fields: ExerciseField[] = [
  { key: 'minBase', label: 'Nombre minimum', min: 0, max: 999000 },
  { key: 'maxBase', label: 'Nombre maximum', min: 0, max: 999000 },
  { key: 'addendMin', label: 'Deuxième terme min.', min: 1, max: 99 },
  { key: 'addendMax', label: 'Deuxième terme max.', min: 1, max: 99 },
]
function fromLegacy(options: AdditionGenerationOptions): ExerciseOptions {
  const { count, difficulty, ...parameters } = options
  return { count, difficulty, parameters }
}
const defaults: ExerciseModule['defaults'] = difficulty => fromLegacy(defaultAdditionOptions(difficulty))
function normalize(options: ExerciseOptions) {
  const safe = normalizeFields(options, defaults(options.difficulty), fields)
  return { ...safe, parameters: orderedRange(orderedRange(safe.parameters, 'minBase', 'maxBase'), 'addendMin', 'addendMax') }
}
export const additionModule: ExerciseModule = {
  kind: 'addition_crossing_ten', label: 'Additions avec passage de dizaine', shortLabel: 'Additions', fields, defaults, normalize,
  generate: options => {
    const safe = normalize(options)
    return generateAdditionCrossingTen({ count: safe.count, difficulty: safe.difficulty, minBase: safe.parameters.minBase, maxBase: safe.parameters.maxBase, addendMin: safe.parameters.addendMin, addendMax: safe.parameters.addendMax })
  },
  hint: getCrossingTenHint,
  isValidExercise: exercise => exercise.kind === 'addition_crossing_ten' && Array.isArray(exercise.operands) && exercise.operands.length === 2 && exercise.operands.every(Number.isSafeInteger) && exercise.operands[0] >= 0 && exercise.operands[1] >= 1 && exercise.operands[1] <= 99,
  recommend: sessions => {
    const recommendation = recommendAdditionSession(sessions)
    return { ...recommendation, options: fromLegacy(recommendation.options) }
  },
  manual: { label: 'Les calculs, un par ligne', placeholder: '115 + 9\n127 + 8\n136 + 7', parse: parseManualAdditions },
}
