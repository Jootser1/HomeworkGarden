import { expect, test, type Page } from '@playwright/test'
import type { HomeworkSession } from '@/lib/types'
import { solvedSession } from './helpers/sessions'

async function seedHistory(page: Page, sessions: HomeworkSession[]) {
  await page.addInitScript((history) => {
    const key = 'homework-garden-state-v1'
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ sessions: history, garden: { placements: [] } }))
  }, sessions)
}

async function activeSession(page: Page): Promise<HomeworkSession> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('homework-garden-state-v1')!).sessions.find((session: HomeworkSession) => session.status === 'active'))
}

test('one visible parameter, ready immediately, count changes need no generation step', async ({ page }, testInfo) => {
  await page.goto('/parent')
  await expect(page.getByLabel('Nombre de calculs')).toHaveValue('10')
  await expect(page.getByRole('spinbutton')).toHaveCount(1)
  await expect(page.getByLabel('Difficulté', { exact: true })).not.toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('session-mobile.png'), fullPage: true })
  await page.getByLabel('Nombre de calculs').fill('6')
  await page.getByText('Voir les 6 calculs', { exact: true }).click()
  await expect(page.locator('.exercise-preview strong')).toHaveCount(6)
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const session = await activeSession(page)
  expect(session.exercises).toHaveLength(6)
  expect(session.generationOptions?.count).toBe(6)
})

test('automatically softens a struggling finished session and keeps its length', async ({ page }) => {
  await seedHistory(page, [solvedSession({ count: 8, retried: 4 })])
  await page.goto('/parent')
  await expect(page.getByLabel('Nombre de calculs')).toHaveValue('8')
  await expect(page.locator('.session-recommendation')).toContainText('plus accessibles')
  await page.getByText('Réglages personnalisés', { exact: true }).click()
  await expect(page.getByLabel('Difficulté', { exact: true })).toHaveValue('easy')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const session = await activeSession(page)
  expect(session.generationOptions?.difficulty).toBe('easy')
  expect(session.exercises).toHaveLength(8)
  expect(session.exercises.every((exercise) => exercise.operands && exercise.operands[0] >= 10 && exercise.operands[0] <= 60)).toBe(true)
})

test('three easy finished sessions allow progression without adding exercises', async ({ page }) => {
  await seedHistory(page, [1, 2, 3].map((day) => solvedSession({ id: `day-${day}`, count: 8, date: `2026-01-0${day}T12:00:00.000Z` })))
  await page.goto('/parent')
  await expect(page.getByLabel('Nombre de calculs')).toHaveValue('8')
  await expect(page.locator('.session-recommendation')).toContainText('Un cran de plus')
  await page.getByText('Réglages personnalisés', { exact: true }).click()
  await expect(page.getByLabel('Difficulté', { exact: true })).toHaveValue('hard')
})

test('custom difficulty preserves chosen count and can return to the recommendation', async ({ page }) => {
  await page.goto('/parent')
  await page.getByLabel('Nombre de calculs').fill('6')
  await page.getByText('Réglages personnalisés', { exact: true }).click()
  await page.getByLabel('Difficulté', { exact: true }).selectOption('hard')
  await expect(page.getByLabel('Nombre de calculs')).toHaveValue('6')
  await expect(page.locator('.session-recommendation')).toHaveText('Tes réglages personnalisés sont utilisés.')
  await page.getByRole('button', { name: 'Revenir au niveau proposé' }).click()
  await expect(page.getByLabel('Difficulté', { exact: true })).toHaveValue('medium')
  await expect(page.getByLabel('Nombre de calculs')).toHaveValue('6')
})

test('manual homework remains available, without inheriting a generated count', async ({ page }) => {
  await page.goto('/parent')
  await page.getByRole('button', { name: 'Saisir mes calculs' }).click()
  await page.getByLabel('Les calculs, un par ligne').fill('115 + 9\n127 + 8')
  await expect(page.getByLabel('Nombre de calculs')).not.toBeVisible()
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toHaveText('115 + 9')
  const session = await activeSession(page)
  expect(session.exercises).toHaveLength(2)
  expect(session.generationOptions).toBeUndefined()
})

test('errors and solving date survive immediate awakening and drive the next session length', async ({ page }) => {
  await page.goto('/parent')
  await page.getByLabel('Nombre de calculs').fill('1')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const initial = await activeSession(page)
  await page.getByRole('button', { name: '0', exact: true }).click()
  await page.getByRole('button', { name: '✓', exact: true }).click()
  await expect(page.getByText('Presque, essaie encore.', { exact: true })).toBeVisible()
  for (const digit of String(initial.exercises[0].expectedAnswer)) await page.getByRole('button', { name: digit, exact: true }).click()
  await page.getByRole('button', { name: '✓', exact: true }).click()
  await page.getByRole('button', { name: 'Installer dans le jardin' }).click()
  await expect(page.locator('.garden-camera')).toBeVisible()
  // The reveal timer must not overwrite the completed session after navigation.
  await page.waitForTimeout(1000)
  const saved = await page.evaluate((id) => JSON.parse(localStorage.getItem('homework-garden-state-v1')!).sessions.find((session: HomeworkSession) => session.id === id), initial.id) as HomeworkSession
  expect(saved.status).toBe('completed')
  expect(saved.exercises[0].attempts).toBe(2)
  expect(Number.isFinite(Date.parse(saved.solvedAt ?? ''))).toBe(true)
  await page.goto('/parent')
  await expect(page.getByLabel('Nombre de calculs')).toHaveValue('1')
  await expect(page.locator('.session-recommendation')).toContainText('Un niveau proche')
})

test('invalid or cleared counts cannot silently start a different session', async ({ page }) => {
  await page.goto('/parent')
  const input = page.getByLabel('Nombre de calculs')
  const start = page.getByRole('button', { name: 'Commencer', exact: true })
  await input.fill('')
  await expect(start).toBeDisabled()
  await input.fill('41')
  await expect(start).toBeDisabled()
  await expect(page.getByText('Choisis entre 1 et 40 calculs.')).toBeVisible()
  await input.fill('40')
  await expect(start).toBeEnabled()
  await expect(page.getByText('Voir les 40 calculs', { exact: true })).toBeVisible()
})

test('history-based setup and persistence work offline without any generation API', async ({ page, context }) => {
  const requests: string[] = []
  page.on('request', (request) => { if (request.url().includes('/api/creatures/')) requests.push(request.url()) })
  await seedHistory(page, [solvedSession({ count: 8, retried: 4 })])
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  await context.setOffline(true)
  await page.goto('/offline')
  await page.getByRole('button', { name: 'Créer une session', exact: true }).click()
  await expect(page.getByLabel('Nombre de calculs')).toHaveValue('8')
  await expect(page.locator('.session-recommendation')).toContainText('plus accessibles')
  await page.getByLabel('Nombre de calculs').fill('7')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const before = await activeSession(page)
  await page.reload()
  await expect(page.locator('.exercise-prompt')).toHaveText(before.exercises[0].prompt)
  expect((await activeSession(page)).generationOptions).toEqual(before.generationOptions)
  expect(before.exercises).toHaveLength(7)
  expect(requests).toEqual([])
})
