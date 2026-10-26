import type { Exercise } from '@/lib/types'
import type { ExerciseModule } from './contracts'
import { fallbackHint } from './shared'

/** No imports of concrete exercise families: a registry is just an active set. */
export function createExerciseRegistry(modules: readonly ExerciseModule[]) {
  const byKind = new Map<string, ExerciseModule>()
  for (const definition of modules) {
    if (byKind.has(definition.kind)) throw new Error(`Module d’exercice en double : ${definition.kind}`)
    byKind.set(definition.kind, definition)
  }
  return {
    all: [...byKind.values()] as readonly ExerciseModule[],
    get: (kind: string) => byKind.get(kind),
    hint: (exercise: Exercise) => {
      const definition = byKind.get(exercise.kind)
      return definition?.isValidExercise(exercise) ? definition.hint(exercise) : fallbackHint
    },
  }
}
