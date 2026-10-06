import type { Exercise, ExerciseDifficulty } from '@/lib/types'

export type AdditionGenerationOptions = {
  count: number
  minBase: number
  maxBase: number
  addendMin: number
  addendMax: number
  difficulty: ExerciseDifficulty
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`

export function defaultAdditionOptions(difficulty: ExerciseDifficulty = 'medium'): AdditionGenerationOptions {
  if (difficulty === 'easy') {
    return { count: 8, minBase: 10, maxBase: 60, addendMin: 2, addendMax: 9, difficulty }
  }
  if (difficulty === 'hard') {
    return { count: 12, minBase: 100, maxBase: 500, addendMin: 4, addendMax: 19, difficulty }
  }
  return { count: 10, minBase: 80, maxBase: 200, addendMin: 2, addendMax: 9, difficulty }
}

export function generateAdditionCrossingTen(options: AdditionGenerationOptions): Exercise[] {
  const count = clamp(Math.floor(options.count || 1), 1, 40)
  const minBase = Math.floor(Math.min(options.minBase, options.maxBase))
  const maxBase = Math.floor(Math.max(options.minBase, options.maxBase))
  const addendMin = clamp(Math.floor(Math.min(options.addendMin, options.addendMax)), 1, 99)
  const addendMax = clamp(Math.floor(Math.max(options.addendMin, options.addendMax)), addendMin, 99)
  const exercises: Exercise[] = []
  const seen = new Set<string>()
  let guard = 0

  while (exercises.length < count && guard < count * 200) {
    guard++
    const base = randomInt(minBase, maxBase)
    const ones = Math.abs(base) % 10
    const minimumToCross = ones === 0 ? 10 : 10 - ones
    const lowerAddend = Math.max(addendMin, minimumToCross)
    if (lowerAddend > addendMax) continue
    const addend = randomInt(lowerAddend, addendMax)
    const key = `${base}+${addend}`
    if (seen.has(key)) continue
    seen.add(key)
    exercises.push(makeAdditionExercise(base, addend))
  }

  while (exercises.length < count) {
    const base = randomInt(minBase, maxBase)
    const ones = Math.abs(base) % 10
    const addend = Math.max(ones === 0 ? 10 : 10 - ones, addendMin)
    exercises.push(makeAdditionExercise(base, clamp(addend, addendMin, addendMax)))
  }

  return exercises
}

export function makeAdditionExercise(a: number, b: number): Exercise {
  return {
    id: uid('exercise'),
    kind: 'addition_crossing_ten',
    prompt: `${a} + ${b}`,
    operands: [a, b],
    expectedAnswer: a + b,
    attempts: 0,
    status: 'pending',
  }
}

export function parseManualAdditions(input: string): Exercise[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(-?\d+)\s*\+\s*(-?\d+)(?:\s*=\s*(-?\d+))?\s*$/)
      if (!match) return null
      const a = Number(match[1])
      const b = Number(match[2])
      const expected = match[3] ? Number(match[3]) : a + b
      return {
        ...makeAdditionExercise(a, b),
        expectedAnswer: expected,
      }
    })
    .filter((exercise): exercise is Exercise => Boolean(exercise))
}

export function getCrossingTenHint(exercise: Exercise): string {
  const [a, b] = exercise.operands
  const ones = Math.abs(a) % 10
  const toNextTen = ones === 0 ? 0 : 10 - ones
  if (toNextTen <= 0 || toNextTen >= b) {
    return `Essaie de découper ${b} en deux petits morceaux pour atteindre une dizaine ronde.`
  }
  const rest = b - toNextTen
  return `${a} + ${toNextTen} = ${a + toNextTen}. Il reste ${rest}. Donc ${a + toNextTen} + ${rest} = ${a + b}.`
}
