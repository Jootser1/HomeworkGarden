import { expect, test } from '@playwright/test'
import { exerciseRegistry } from '@/lib/exercises'
import { makeSubtraction } from '@/lib/exercises/modules/subtraction'
import { makeMultiplication } from '@/lib/exercises/modules/multiplication'
import { activeSession, numericAnswer } from './helpers/exercises'

test('subtraction hints bridge the ten and handle zero and equality without an addition hint', () => {
  const definition = exerciseRegistry.get('subtraction')!
  expect(makeSubtraction(42, 17).expectedAnswer).toBe(25)
  expect(makeSubtraction(12, 5).expectedAnswer).toBe(7)
  expect(definition.hint(makeSubtraction(12, 5))).toContain('Retire d’abord 2 pour atteindre 10, puis encore 3')
  expect(definition.hint(makeSubtraction(42, 17))).toContain('Retire d’abord 10, puis encore 7')
  expect(definition.hint(makeSubtraction(12, 0))).toContain('Retirer zéro')
  expect(definition.hint(makeSubtraction(12, 12))).toContain('il ne reste rien')
  for (const operands of [[3, 4], [-1, 0], [1.5, 1], [1000000, 0], [Infinity, 0]]) expect(() => makeSubtraction(...operands as [number, number])).toThrow()
  expect(definition.isValidExercise({ ...makeSubtraction(42, 17), expectedAnswer: 24 })).toBe(false)
})

test('one multiplication table covers every requested multiplier once before repeating', () => {
  const definition = exerciseRegistry.get('multiplication_tables')
  expect(definition, 'tables are available through the existing registry').toBeDefined()
  const exercises = definition!.generate({ count: 10, difficulty: 'medium', parameters: { tableMin: 7, tableMax: 7, multiplierMin: 1, multiplierMax: 10 } }, () => .8)
  expect(exercises).toHaveLength(10)
  expect(new Set(exercises.map(exercise => exercise.id)).size).toBe(10)
  expect(new Set(exercises.map(exercise => exercise.operands![1]))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
  for (const exercise of exercises) {
    const [a, b] = exercise.operands!
    expect(a).toBe(7)
    expect(exercise.prompt).toBe(`7 × ${b}`)
    expect(exercise.expectedAnswer).toBe(7 * b)
    expect(definition!.isValidExercise(exercise)).toBe(true)
  }
})

test('multiplication hints explain zero, identity and the previous fact in the selected table', () => {
  const definition = exerciseRegistry.get('multiplication_tables')!
  expect(makeMultiplication(7, 4).expectedAnswer).toBe(28)
  expect(makeMultiplication(12, 12).expectedAnswer).toBe(144)
  expect(definition.hint(makeMultiplication(7, 4))).toContain('7 × 3, puis ajouter encore 7')
  expect(definition.hint(makeMultiplication(7, 0))).toContain('zéro')
  expect(definition.hint(makeMultiplication(0, 7))).toContain('zéro')
  expect(definition.hint(makeMultiplication(7, 1))).toContain('Multiplier par 1')
  expect(definition.hint(makeMultiplication(1, 7))).toContain('Multiplier par 1')
  for (const operands of [[-1, 2], [13, 2], [2, 13], [1.5, 2], [Infinity, 0]]) expect(() => makeMultiplication(...operands as [number, number])).toThrow()
  expect(definition.isValidExercise({ ...makeMultiplication(7, 4), expectedAnswer: 27 })).toBe(false)
})

for (const kind of ['subtraction', 'multiplication_tables']) {
  test(`${kind}: bounds, constant randomness and tiny domains cannot produce invalid or missing exercises`, () => {
    const definition = exerciseRegistry.get(kind)!
    const defaults = definition.defaults('medium')
    const invalid = { ...defaults, count: Infinity, parameters: Object.fromEntries(definition.fields.map(field => [field.key, NaN])) }
    expect(definition.normalize(invalid)).toEqual(defaults)
    const reversed: Record<string, number> = kind === 'subtraction' ? { minimum: 50, maximum: 10 } : { tableMin: 12, tableMax: 0, multiplierMin: 12, multiplierMax: 0 }
    const normalized = definition.normalize({ ...defaults, count: 51, parameters: { ...reversed, unused: 1 } })
    expect(normalized.count).toBe(50)
    expect(normalized.parameters).not.toHaveProperty('unused')
    const keys = kind === 'subtraction' ? ['minimum', 'maximum'] : ['tableMin', 'tableMax']
    expect(normalized.parameters[keys[0]]).toBeLessThanOrEqual(normalized.parameters[keys[1]])
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (const roll of [0, .5, .99999]) {
        for (const boundary of [0, 1e12]) {
          const options = { ...defaults, difficulty, count: 40, parameters: Object.fromEntries(definition.fields.map(field => [field.key, boundary])) }
          const before = structuredClone(options)
          const exercises = definition.generate(options, () => roll)
          expect(exercises).toHaveLength(40)
          expect(exercises.every(definition.isValidExercise)).toBe(true)
          expect(new Set(exercises.map(exercise => exercise.id)).size).toBe(40)
          expect(options).toEqual(before)
        }
      }
    }
  })
}

const configuredCases: { name: string; kind: string; fields: [string, string][]; prompt: string; answer: number }[] = [
  { name: 'borrowing subtraction', kind: 'subtraction', fields: [['Nombre de départ minimum', '12'], ['Nombre de départ maximum', '12']], prompt: '12 − 5', answer: 7 },
  { name: 'pinned multiplication fact', kind: 'multiplication_tables', fields: [['Première table', '7'], ['Dernière table', '7'], ['Multiplicateur minimum', '4'], ['Multiplicateur maximum', '4']], prompt: '7 × 4', answer: 28 },
  { name: 'zero multiplication answer', kind: 'multiplication_tables', fields: [['Première table', '0'], ['Dernière table', '0'], ['Multiplicateur minimum', '7'], ['Multiplicateur maximum', '7']], prompt: '0 × 7', answer: 0 },
]
for (const configured of configuredCases) {
  test(`${configured.name}: custom fields drive the real preview, answer and saved session`, async ({ page }, info) => {
    await page.addInitScript(() => { Math.random = () => .34 })
    await page.goto('/parent')
    await page.getByLabel('Type d’exercice').selectOption(configured.kind)
    await page.getByLabel('Nombre de calculs').fill('2')
    await page.getByText('Réglages personnalisés', { exact: true }).click()
    for (const [label, value] of configured.fields) await page.getByLabel(label, { exact: true }).fill(value)
    await page.getByText('Voir les 2 calculs', { exact: true }).click()
    await expect(page.locator('.exercise-preview strong').first()).toHaveText(`1. ${configured.prompt}`)
    await page.getByRole('button', { name: 'Commencer', exact: true }).click()
    await expect(page.locator('.exercise-prompt')).toHaveText(configured.prompt)
    const before = await activeSession(page)
    await page.screenshot({ path: info.outputPath(`${configured.name.replaceAll(' ', '-')}-mobile.png`), fullPage: true })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await numericAnswer(page, configured.answer)
    await expect(page.getByText('Bravo !', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.locator('.exercise-prompt')).toBeVisible()
    const after = await activeSession(page)
    expect(after.generationOptions).toEqual(before.generationOptions)
    expect(after.exercises[0]).toMatchObject({ status: 'correct', childAnswer: configured.answer, attempts: 1 })
    expect(after.decor?.revealedSteps).toBe(1)
  })
}

// Public registry contract: the player and form should not need new branches.
test('subtractions generate nonnegative differences; easy exercises never borrow', () => {
  const definition = exerciseRegistry.get('subtraction')
  expect(definition, 'subtractions are available through the existing registry').toBeDefined()
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const exercises = definition!.generate({ ...definition!.defaults(difficulty), count: 40 })
    expect(exercises).toHaveLength(40)
    expect(new Set(exercises.map(exercise => exercise.id)).size).toBe(40)
    for (const exercise of exercises) {
      const [a, b] = exercise.operands!
      expect(Number.isSafeInteger(a) && Number.isSafeInteger(b)).toBe(true)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(a)
      expect(exercise.expectedAnswer).toBe(a - b)
      expect(definition!.isValidExercise(exercise)).toBe(true)
      if (difficulty === 'easy') {
        const digits = Math.max(String(a).length, String(b).length)
        for (let i = 0; i < digits; i++) expect(Math.floor(b / 10 ** i) % 10).toBeLessThanOrEqual(Math.floor(a / 10 ** i) % 10)
      }
    }
  }
})
