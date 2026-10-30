import { expect, test } from '@playwright/test'
import { exerciseRegistry } from '@/lib/exercises'
import { comparisonModule, makeComparison } from '@/lib/exercises/modules/comparison'
import { makeSequence, sequenceModule } from '@/lib/exercises/modules/sequence'
import { createExerciseRegistry } from '@/lib/exercises/registry'
import { recommendModuleSession } from '@/lib/exercises/recommendation'
import { fallbackHint, isCorrectAnswer } from '@/lib/exercises/shared'
import type { ExerciseModule } from '@/lib/exercises/contracts'
import type { HomeworkSession } from '@/lib/types'
import { solvedSession } from './helpers/sessions'
import { activeSession, numericAnswer } from './helpers/exercises'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

function completed(definition: ExerciseModule, id: string, retried = 0): HomeworkSession {
  return { id, createdAt: `2026-01-0${id}T12:00:00Z`, status: 'completed', title: definition.label, exerciseKind: definition.kind, generationOptions: definition.defaults('medium'), currentExerciseIndex: 10,
    exercises: definition.generate(definition.defaults('medium')).map((exercise, index) => ({ ...exercise, status: 'correct', attempts: index < retried ? 2 : 1 })) }
}
test('comparison has two distinct natural choices and one unambiguous largest number', () => {
  expect(makeComparison(18, 28)).toMatchObject({ choices: [18, 28], expectedAnswer: 28 })
  expect(makeComparison(28, 18).expectedAnswer).toBe(28)
  expect(() => makeComparison(18, 18)).toThrow()
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const samples = comparisonModule.generate({ ...comparisonModule.defaults(difficulty), count: 40 })
    expect(samples).toHaveLength(40)
    expect(new Set(samples.map(exercise => exercise.id)).size).toBe(40)
    for (const exercise of samples) expect(comparisonModule.isValidExercise(exercise)).toBe(true)
    expect(samples.some(exercise => exercise.choices![0] === exercise.expectedAnswer)).toBe(true)
    expect(samples.some(exercise => exercise.choices![1] === exercise.expectedAnswer)).toBe(true)
  }
})

test('the requested sequence has answer 48; every generated sequence has one interior blank', () => {
  expect(makeSequence(18, 10, 3)).toMatchObject({ prompt: '18 – 28 – 38 – ? – 58', expectedAnswer: 48 })
  expect(() => makeSequence(18, 0, 3)).toThrow()
  expect(() => makeSequence(18, 10, 5)).toThrow()
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const samples = sequenceModule.generate({ ...sequenceModule.defaults(difficulty), count: 40 })
    for (const exercise of samples) {
      expect(sequenceModule.isValidExercise(exercise)).toBe(true)
      const data = exercise.data as { start: number; step: number; missingIndex: number }
      const terms = exercise.prompt.split(' – ')
      expect(terms).toHaveLength(5)
      expect(terms.filter(term => term === '?')).toHaveLength(1)
      expect(data.missingIndex).toBeGreaterThan(0)
      expect(data.missingIndex).toBeLessThan(4)
      terms.forEach((term, index) => { if (term !== '?') expect(Number(term)).toBe(data.start + index * data.step) })
      expect(exercise.expectedAnswer).toBe(data.start + data.missingIndex * data.step)
    }
  }
})

test('shared normalization handles invalid ranges and a constant RNG cannot hang generation', () => {
  for (const definition of [comparisonModule, sequenceModule]) {
    const defaults = definition.defaults('medium')
    const parameters = Object.fromEntries(definition.fields.map(field => [field.key, Number.NaN]))
    const safe = definition.normalize({ ...defaults, count: Infinity, parameters })
    expect(safe).toEqual(defaults)
    const reversed = definition.normalize({ ...defaults, count: 51, parameters: { ...defaults.parameters, minimum: 100, maximum: 1, minStep: 10, maxStep: 1 } })
    expect(reversed.count).toBe(50)
    expect(reversed.parameters.minimum).toBeLessThanOrEqual(reversed.parameters.maximum)
    for (const roll of [0, .5, .99999]) {
      const exercises = definition.generate(reversed, () => roll)
      expect(exercises).toHaveLength(50)
      expect(exercises.every(definition.isValidExercise)).toBe(true)
      expect(new Set(exercises.map(exercise => exercise.id)).size).toBe(50)
    }
  }
  const equal = comparisonModule.generate({ count: 10, difficulty: 'easy', parameters: { minimum: 999999, maximum: 999999 } }, () => 0)
  expect(equal.every(comparisonModule.isValidExercise)).toBe(true)
})

test('progression is shared but histories, custom ranges and retries are independent per family', () => {
  const comparisons = [1, 2, 3].map(id => completed(comparisonModule, String(id)))
  const addition = solvedSession({ count: 8, retried: 8 })
  expect(recommendModuleSession(comparisonModule, [...comparisons, addition])).toMatchObject({ reason: 'advance', options: { difficulty: 'hard', count: 10 } })
  expect(recommendModuleSession(sequenceModule, [...comparisons, addition])).toMatchObject({ reason: 'first', options: { difficulty: 'medium' } })
  expect(recommendModuleSession(comparisonModule, [completed(comparisonModule, '4', 4)])).toMatchObject({ reason: 'support', options: { difficulty: 'easy', count: 10 } })
  const custom = completed(sequenceModule, '5', 8)
  custom.generationOptions = { ...sequenceModule.defaults('medium'), parameters: { minimum: 18, maximum: 18, minStep: 10, maxStep: 10 } }
  expect(recommendModuleSession(sequenceModule, [custom])).toMatchObject({ reason: 'custom', options: custom.generationOptions })
})

test('subtraction and multiplication have separate progression and preserve pinned tables', () => {
  const subtraction = exerciseRegistry.get('subtraction')!
  const multiplication = exerciseRegistry.get('multiplication_tables')!
  const history = [1, 2, 3].map(id => completed(subtraction, String(id)))
  expect(recommendModuleSession(subtraction, history)).toMatchObject({ reason: 'advance', options: { difficulty: 'hard' } })
  expect(recommendModuleSession(multiplication, history)).toMatchObject({ reason: 'first', options: { difficulty: 'medium' } })
  history.push(completed(multiplication, '4', 4))
  expect(recommendModuleSession(multiplication, history)).toMatchObject({ reason: 'support', options: { difficulty: 'easy', count: 10 } })
  const pinned = completed(multiplication, '5', 8)
  pinned.generationOptions = { ...multiplication.defaults('medium'), parameters: { tableMin: 7, tableMax: 7, multiplierMin: 1, multiplierMax: 10 } }
  expect(recommendModuleSession(multiplication, [...history, pinned])).toMatchObject({ reason: 'custom', options: pinned.generationOptions })
})

test('each family can be unregistered without breaking others or historical answer snapshots', () => {
  for (const removed of exerciseRegistry.all) {
    const snapshot = JSON.parse(JSON.stringify(removed.generate(removed.defaults('medium'))[0]))
    const registry = createExerciseRegistry(exerciseRegistry.all.filter(definition => definition.kind !== removed.kind))
    expect(registry.get(removed.kind)).toBeUndefined()
    expect(registry.hint(snapshot)).toBe(fallbackHint)
    expect(isCorrectAnswer(snapshot, snapshot.expectedAnswer)).toBe(true)
    expect(isCorrectAnswer(snapshot, snapshot.expectedAnswer + 1)).toBe(false)
    for (const remaining of registry.all) expect(remaining.generate(remaining.defaults('easy')).every(remaining.isValidExercise)).toBe(true)
  }
  expect(createExerciseRegistry([]).all).toEqual([])
  expect(() => createExerciseRegistry([comparisonModule, comparisonModule])).toThrow()
})

test('dependency graph: concrete families are independent; core imports no family or UI/storage', () => {
  const root = path.resolve('lib/exercises')
  const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile)
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd()).options
  function dependencies(filename: string, visited = new Set<string>()): Set<string> {
    filename = path.normalize(filename)
    if (visited.has(filename)) return visited
    visited.add(filename)
    const source = ts.createSourceFile(filename, readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest)
    for (const node of source.statements) {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue
      const resolved = ts.resolveModuleName(node.moduleSpecifier.text, filename, options, ts.sys).resolvedModule?.resolvedFileName
      if (resolved && !resolved.includes('node_modules')) dependencies(resolved, visited)
    }
    return visited
  }
  const families = readdirSync(path.join(root, 'modules')).filter(name => name.endsWith('.ts')).map(name => path.join(root, 'modules', name))
  for (const filename of [...families, ...['contracts', 'shared', 'registry', 'recommendation'].map(name => path.join(root, `${name}.ts`))]) {
    const graph = dependencies(filename)
    for (const other of families) if (other !== filename) expect(graph.has(other), `${filename} depends on ${other}`).toBe(false)
    for (const dependency of graph) {
      expect(dependency.includes(`${path.sep}components${path.sep}`)).toBe(false)
      expect(dependency.includes(`${path.sep}storage${path.sep}`)).toBe(false)
    }
  }
})

for (const definition of exerciseRegistry.all.filter(definition => !definition.manual)) {
  test(`${definition.kind}: create, retry with own hint, reveal, reload and finish a real reward`, async ({ page }, info) => {
    await page.goto('/parent')
    await page.getByLabel('Type d’exercice').selectOption(definition.kind)
    await page.getByLabel('Nombre de calculs').fill('2')
    await expect(page.getByRole('button', { name: 'Saisir mes calculs' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Commencer', exact: true }).click()
    await expect(page.locator('.exercise-prompt')).toBeVisible()
    const initial = await activeSession(page), exercise = initial.exercises[0]
    expect(initial.exerciseKind).toBe(definition.kind)
    expect(initial.title).toBe(definition.label)
    const wrong = exercise.choices?.find(value => value !== exercise.expectedAnswer) ?? (exercise.expectedAnswer === 0 ? 1 : 0)
    for (let attempt = 0; attempt < 2; attempt++) {
      if (exercise.choices) await page.getByRole('button', { name: String(wrong), exact: true }).click()
      else await numericAnswer(page, wrong)
    }
    await expect(page.getByText(/Indice :/)).toBeVisible()
    await expect(page.getByText(/atteindre une dizaine/)).toHaveCount(0)
    expect((await activeSession(page)).decor?.revealedSteps).toBe(0)
    await page.screenshot({ path: info.outputPath(`${definition.kind}-mobile.png`), fullPage: true })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    if (exercise.choices) await page.getByRole('button', { name: String(exercise.expectedAnswer), exact: true }).click()
    else await numericAnswer(page, exercise.expectedAnswer)
    await expect(page.getByText('Bravo !', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.locator('.exercise-prompt')).toBeVisible()
    const resumed = await activeSession(page)
    expect(resumed.exercises[0]).toMatchObject({ status: 'correct', attempts: 3 })
    expect(resumed.decor?.revealedSteps).toBe(1)
    const second = resumed.exercises[1]
    if (second.choices) await page.getByRole('button', { name: String(second.expectedAnswer), exact: true }).click()
    else await numericAnswer(page, second.expectedAnswer)
    await page.getByRole('button', { name: 'Installer dans le jardin' }).click()
    await expect(page.locator('.garden-camera')).toBeVisible()
  })

  test(`${definition.kind}: sessions start and resume offline without generation API calls`, async ({ page, context }) => {
    const requests: string[] = []
    page.on('request', request => { if (request.url().includes('/api/')) requests.push(request.url()) })
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
    await context.setOffline(true)
    await page.goto('/offline')
    await page.getByRole('button', { name: 'Créer une session', exact: true }).click()
    await page.getByLabel('Type d’exercice').selectOption(definition.kind)
    await page.getByLabel('Nombre de calculs').fill('2')
    await page.getByRole('button', { name: 'Commencer', exact: true }).click()
    await expect(page.locator('.exercise-prompt')).toBeVisible()
    const initial = await activeSession(page)
    await page.reload()
    await expect(page.locator('.exercise-prompt')).toHaveText(initial.exercises[0].prompt)
    expect((await activeSession(page)).generationOptions).toEqual(initial.generationOptions)
    expect(requests).toEqual([])
  })
}

test('an unregistered historical family remains playable with choices and a neutral hint', async ({ page }) => {
  const session = solvedSession({ count: 1 })
  session.id = 'retired-family'
  session.status = 'active'
  session.exerciseKind = 'retired_comparison'
  session.title = 'Anciennes comparaisons'
  session.exercises = [{ ...makeComparison(18, 28), kind: 'retired_comparison' }]
  session.creature!.state = 'revealing'
  session.creature!.parts.forEach(part => { part.revealed = false })
  await page.addInitScript(session => localStorage.setItem('homework-garden-state-v1', JSON.stringify({ sessions: [session], garden: { placements: [] } })), session)
  await page.goto(`/play/${session.id}`)
  await expect(page.locator('.play-exercise-panel h2')).toHaveText(session.title)
  await page.getByRole('button', { name: '18', exact: true }).click()
  await page.getByRole('button', { name: '18', exact: true }).click()
  await expect(page.getByText(`Presque, essaie encore. Indice : ${fallbackHint}`, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '28', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Utiliser la baguette magique' })).toBeVisible()
})
