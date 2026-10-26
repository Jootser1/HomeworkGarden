import type { ExerciseDifficulty, HomeworkSession } from '@/lib/types'
import type { ExerciseModule, ExerciseOptions, Recommendation } from './contracts'
import { difficulties } from './shared'

type LevelOptions = { count: number; difficulty: ExerciseDifficulty }
export type RecommendationPolicy<T extends LevelOptions> = {
  kind: string
  defaults(difficulty: ExerciseDifficulty): T
  isSolved(session: HomeworkSession): boolean
  optionsFor(session: HomeworkSession): T
  sameLevel(a: T, b: T): boolean
}
const solvingTime = (session: HomeworkSession) => {
  const solved = Date.parse(session.solvedAt ?? ''), created = Date.parse(session.createdAt)
  return Number.isFinite(solved) ? solved : Number.isFinite(created) ? created : 0
}
const retryRate = (session: HomeworkSession) => session.exercises.length < 5 || session.exercises.some(exercise => !Number.isSafeInteger(exercise.attempts) || exercise.attempts < 1)
  ? null : session.exercises.filter(exercise => exercise.attempts > 1).length / session.exercises.length

/** One progression policy; histories are always partitioned by module identity. */
export function recommendSession<T extends LevelOptions>(sessions: HomeworkSession[], policy: RecommendationPolicy<T>): Recommendation<T> {
  const history = sessions.filter(session => session.exerciseKind === policy.kind && policy.isSolved(session)).sort((a, b) => solvingTime(b) - solvingTime(a))
  const latest = history[0]
  if (!latest) return { options: policy.defaults('medium'), reason: 'first' }
  const options = policy.optionsFor(latest)
  const base: Recommendation<T> = { options, reason: 'steady', basedOnSessionId: latest.id }
  if (!policy.sameLevel(options, policy.defaults(options.difficulty))) return { ...base, reason: 'custom' }
  const rate = retryRate(latest), levelIndex = difficulties.indexOf(options.difficulty)
  if (rate === null) return base
  if (rate >= .4 && levelIndex > 0) return { ...base, options: { ...policy.defaults(difficulties[levelIndex - 1]), count: options.count }, reason: 'support' }
  const recent = history.slice(0, 3)
  const advance = recent.length === 3 && recent.every(session => {
    const rate = retryRate(session)
    return rate !== null && rate <= .1 && policy.sameLevel(policy.optionsFor(session), options)
  })
  if (advance && levelIndex < difficulties.length - 1) return { ...base, options: { ...policy.defaults(difficulties[levelIndex + 1]), count: options.count }, reason: 'advance' }
  return base
}

export function recommendModuleSession(module: ExerciseModule, sessions: HomeworkSession[]): Recommendation<ExerciseOptions> {
  if (module.recommend) return module.recommend(sessions)
  return recommendSession(sessions, {
    kind: module.kind,
    defaults: module.defaults,
    isSolved: session => session.exercises.length > 0 && session.exercises.every(exercise => exercise.kind === module.kind && exercise.status === 'correct' && module.isValidExercise(exercise)),
    optionsFor: session => {
      const stored = session.generationOptions
      const difficulty = stored && difficulties.includes(stored.difficulty) ? stored.difficulty : 'medium'
      const defaults = module.defaults(difficulty)
      const parameters = stored && 'parameters' in stored && stored.parameters && typeof stored.parameters === 'object' ? stored.parameters : defaults.parameters
      return module.normalize({ ...defaults, parameters, count: session.exercises.length })
    },
    sameLevel: (a, b) => a.difficulty === b.difficulty && module.fields.every(field => a.parameters[field.key] === b.parameters[field.key]),
  })
}
