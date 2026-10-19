import { createLocalCatalogCreature } from '@/lib/creatures/factory'
import { defaultAdditionOptions, makeAdditionExercise } from '@/lib/exercises/additions'
import type { AdditionGenerationOptions, ExerciseDifficulty, HomeworkSession } from '@/lib/types'

type SessionFixtureOptions = {
  id?: string
  date?: string
  solvedAt?: string
  difficulty?: ExerciseDifficulty
  count?: number
  retried?: number
  retryAttempts?: number
  legacy?: boolean
  options?: Partial<AdditionGenerationOptions>
}

export function solvedSession({
  id = 'history', date = '2026-01-01T12:00:00.000Z', solvedAt,
  difficulty = 'medium', count = 10, retried = 0, retryAttempts = 2,
  legacy = false, options,
}: SessionFixtureOptions = {}): HomeworkSession {
  const base = difficulty === 'easy' ? 25 : difficulty === 'hard' ? 285 : 115
  const creature = createLocalCatalogCreature(count)
  creature.state = 'complete_static'
  creature.parts.forEach((part) => { part.revealed = true })
  return {
    id,
    createdAt: date,
    solvedAt,
    status: 'completed',
    title: 'Additions avec passage de dizaine',
    exerciseKind: 'addition_crossing_ten',
    generationOptions: legacy ? undefined : { ...defaultAdditionOptions(difficulty), ...options, count },
    currentExerciseIndex: count,
    creature,
    exercises: Array.from({ length: count }, (_, index) => ({
      ...makeAdditionExercise(base + (index % 3) * 10, 8),
      status: 'correct' as const,
      attempts: index < retried ? retryAttempts : 1,
    })),
  }
}
