import type { Exercise, ExerciseDifficulty, HomeworkSession } from '@/lib/types'

/** Module-owned numerical parameters; the session shell never interprets keys. */
export type ExerciseOptions = { count: number; difficulty: ExerciseDifficulty; parameters: Record<string, number> }
export type ExerciseField = { key: string; label: string; min: number; max: number }
export type Recommendation<T> = { options: T; reason: 'first' | 'steady' | 'support' | 'advance' | 'custom'; basedOnSessionId?: string }

export type ExerciseModule = {
  kind: string
  label: string
  shortLabel: string
  fields: readonly ExerciseField[]
  defaults(difficulty: ExerciseDifficulty): ExerciseOptions
  normalize(options: ExerciseOptions): ExerciseOptions
  generate(options: ExerciseOptions, random?: () => number): Exercise[]
  hint(exercise: Exercise): string
  isValidExercise(exercise: Exercise): boolean
  recommend?(sessions: HomeworkSession[]): Recommendation<ExerciseOptions>
  manual?: { label: string; placeholder: string; parse(input: string): Exercise[] }
}
