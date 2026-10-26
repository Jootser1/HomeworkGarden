import { expect, test } from '@playwright/test'
import { activeSession, appStateKey, numericAnswer } from './helpers/exercises'
import { solvedSession } from './helpers/sessions'
import { createDecor } from '@/lib/garden/decor'
import { decorCatalog, selectCatalogReward } from '@/lib/rewards/catalog'
import type { AppState, HomeworkSession } from '@/lib/types'

test('a new session receives a saved composition, reveals whole groups, and installs the exact same art', async ({ page }, info) => {
  const requests: string[] = [], errors: string[] = []
  page.on('request', request => { if (/\/api\/(creatures|decor)\//.test(request.url())) requests.push(request.url()) })
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => localStorage.setItem('homework-garden-settings-v1', JSON.stringify({ aiDecorGeneration: true, aiCreatureGeneration: true })))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/parent')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const session = await activeSession(page)
  expect(session.decor).toHaveProperty('catalogArt')
  await numericAnswer(page, 0)
  await expect(page.locator('[data-reward-part]')).toHaveCount(0)
  for (let index = 0; index < 10; index++) {
    await numericAnswer(page, session.exercises[index].expectedAnswer)
    await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(index+1)
    await expect(page.locator('.creature-stage clipPath, .creature-stage mask')).toHaveCount(0)
    if (index === 4) {
      await page.reload()
      await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(5)
      expect((await activeSession(page)).decor!.catalogArt).toEqual(session.decor!.catalogArt)
      await page.screenshot({ path: info.outputPath('five-real-answers-mobile.png'), fullPage: true })
    }
  }
  const completeArt = await page.locator('.creature-stage .decor-svg').evaluate(svg => svg.innerHTML.replaceAll(' class="decor-build-addition"', ''))
  await page.getByRole('button', { name: 'Installer dans le jardin' }).click()
  await expect(page.locator('.placement-panel')).toBeVisible()
  await page.locator('.garden-v2').focus()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(page.locator('.garden-placed [data-reward-part]')).toHaveCount(10)
  expect(await page.locator('.garden-placed .decor-svg').evaluate(svg => svg.innerHTML)).toBe(completeArt)
  await page.screenshot({ path: info.outputPath('real-earned-decor-garden-mobile.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(requests).toEqual([])
  expect(errors).toEqual([])
})

const tenFinishedDecors = () => Array.from({ length: 10 }, (_, index) => {
  const { creature: _oldCreature, ...base } = solvedSession({ id: `old-decor-${index}`, count: 1 })
  return { ...base, decor: createDecor({ variant: 'round', palette: 'sage', seed: index }, 1), rewardSequence: index+1 }
})

test('the eleventh gift is a genuinely animated catalogue creature, revealed by whole anatomical groups', async ({ page }) => {
  await page.addInitScript(({ key, sessions }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ sessions, garden: { placements: [] } })) }, { key: appStateKey, sessions: tenFinishedDecors() })
  const requests: string[] = []
  page.on('request', request => { if (/\/api\/(creatures|decor)\//.test(request.url())) requests.push(request.url()) })
  await page.goto('/parent')
  await page.getByLabel('Nombre de calculs').fill('10')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const session = await activeSession(page)
  expect(session.creature).toHaveProperty('catalogArt')
  expect(session.rewardSequence).toBe(11)
  for (let index = 0; index < 10; index++) {
    await numericAnswer(page, session.exercises[index].expectedAnswer)
    await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(index+1)
    await expect(page.locator('.creature-stage clipPath, .creature-stage mask')).toHaveCount(0)
  }
  const completedArt = await page.locator('.creature-stage .garden-visitor-svg').evaluate(svg => svg.innerHTML)
  await page.getByRole('button', { name: 'Utiliser la baguette magique' }).click()
  const resident = page.locator(`[data-creature-id="${session.creature!.id}"]`)
  await expect(resident.locator('.garden-visitor-svg')).toBeVisible()
  await expect(resident.locator('.garden-visitor-svg')).toHaveAttribute('data-revealed-groups', '10')
  await resident.press('Enter')
  await expect(page.locator('.info-modal .garden-visitor-svg [data-reward-part]')).toHaveCount(10)
  expect(await page.locator('.info-modal .garden-visitor-svg').evaluate(svg => svg.innerHTML)).toBe(completedArt)
  expect(requests).toEqual([])
})

test('a stale garden save cannot erase a reservation or recycle its composition', async ({ page }) => {
  await page.goto('/parent')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const first = await activeSession(page)
  await numericAnswer(page, first.exercises[0].expectedAnswer)
  await expect(page.locator('.exercise-prompt')).toHaveText(first.exercises[1].prompt)
  // Reproduce another tab saving a garden snapshot read before this reservation.
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ sessions: [], garden: { placements: [] } })), appStateKey)
  await page.reload()
  await expect(page.locator('.exercise-prompt')).toHaveText(first.exercises[1].prompt)
  await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(1)
  await page.goto('/parent')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), appStateKey)
  expect(state.sessions).toHaveLength(2)
  expect(new Set(state.sessions.map((session: { decor: { catalogArt: { compositionId: string } } }) => session.decor.catalogArt.compositionId)).size).toBe(2)
})

for (const count of [15, 20]) test(`a real new ${count}-answer session keeps its authored groups after reload`, async ({ page }) => {
  await page.goto('/parent')
  await page.getByLabel('Nombre de calculs').fill(String(count))
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const session = await activeSession(page)
  expect(session.decor!.catalogArt!.nativeFormat).toBe(count)
  await numericAnswer(page, session.exercises[0].expectedAnswer)
  await page.reload()
  await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(1)
  expect((await activeSession(page)).decor!.catalogArt).toEqual(session.decor!.catalogArt)
})

test('two tabs reserve different compositions and save both unfinished sessions', async ({ page, context }) => {
  const other = await context.newPage()
  await Promise.all([page.goto('/parent'), other.goto('/parent')])
  await Promise.all([page.getByRole('button', { name: 'Commencer', exact: true }).click(), other.getByRole('button', { name: 'Commencer', exact: true }).click()])
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  await expect(other.locator('.exercise-prompt')).toBeVisible()
  const state: AppState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), appStateKey)
  expect(state.sessions).toHaveLength(2)
  expect(new Set(state.sessions.map(session => session.id)).size).toBe(2)
  expect(new Set(state.sessions.map(session => session.decor!.catalogArt!.compositionId)).size).toBe(2)
  expect(state.rewardHistory).toHaveLength(2)
  expect(state.sessions.every(session => session.status === 'active')).toBe(true)
  await other.close()
})

test('exhaustion refuses creation without changing old gifts or falling back to a masked reward', async ({ page }) => {
  const legacy = tenFinishedDecors()[0]
  const state: AppState = { sessions: [legacy], garden: { placements: [] }, rewardHistory: decorCatalog.filter(entry => entry.format === 10).map(entry => entry.compositionId) }
  await page.addInitScript(({ key, state }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(state)) }, { key: appStateKey, state })
  await page.goto('/parent')
  const before = await page.evaluate(key => localStorage.getItem(key), appStateKey)
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.getByText(/Ce premier lot n’a aucun décor disponible/)).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(key), appStateKey)).toBe(before)
  await expect(page.getByRole('button', { name: 'Commencer', exact: true })).toBeEnabled()
  await expect(page.locator('.creation-overlay')).toHaveCount(0)
  await page.getByLabel('Nombre de calculs').fill('15')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const saved: AppState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), appStateKey)
  expect(saved.sessions.find(session => session.id === legacy.id)).toEqual(legacy)
  expect((await activeSession(page)).decor!.catalogArt!.nativeFormat).toBe(15)
})

test('corrupted storage is not reset or overwritten to make room for a new reward', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '{corrupted-save'), appStateKey)
  await page.goto('/parent')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.getByText(/Impossible de réserver et d’enregistrer/)).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(key), appStateKey)).toBe('{corrupted-save')
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('homework-garden-catalog-reward-v1:')))).toEqual([])
})

test('a full storage quota refuses reservation rather than granting an unsaved gift', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('homework-garden-catalog-reward-v1:')) throw new DOMException('Simulated full storage', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await page.goto('/parent')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.getByText(/Impossible de réserver et d’enregistrer/)).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(key), appStateKey)).toBeNull()
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('homework-garden-catalog-reward-v1:')))).toEqual([])
})

test('forty actual answers reveal the aurora bird, survive an offline reload, and awaken the same drawing', async ({ page, context }, info) => {
  test.setTimeout(120000)
  const errors: string[] = [], requests: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (/\/api\/(creatures|decor)\//.test(request.url())) requests.push(request.url()) })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(({ key, sessions }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ sessions, garden: { placements: [] } })) }, { key: appStateKey, sessions: tenFinishedDecors() })
  await page.goto('/parent')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  await page.getByRole('button', { name: 'Saisir mes calculs' }).click()
  await page.getByLabel('Les calculs, un par ligne').fill(Array.from({ length: 40 }, () => '1 + 1').join('\n'))
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toHaveText('1 + 1')
  const session = await activeSession(page)
  expect(session.creature!.catalogArt!.rig).toBe('aurores')
  for (let index = 0; index < 40; index++) {
    await numericAnswer(page, 2)
    await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(index+1)
    await expect(page.locator('.creature-stage clipPath, .creature-stage mask')).toHaveCount(0)
    if (index === 19) {
      await context.setOffline(true)
      await page.reload()
      await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(20)
      expect((await activeSession(page)).creature!.catalogArt).toEqual(session.creature!.catalogArt)
    }
  }
  await page.screenshot({ path: info.outputPath('aurora-earned-by-forty-answers-mobile.png'), fullPage: true })
  const completeArt = await page.locator('.creature-stage .garden-visitor-svg').evaluate(svg => svg.innerHTML)
  await page.getByRole('button', { name: 'Utiliser la baguette magique' }).click()
  const resident = page.locator(`[data-creature-id="${session.creature!.id}"]`)
  await expect(resident.locator('.garden-visitor-svg')).toHaveAttribute('data-revealed-groups', '40')
  await expect(resident.locator('[data-reward-part]')).toHaveCount(40)
  await page.getByRole('button', { name: 'Plus tard / Annuler' }).click()
  await page.screenshot({ path: info.outputPath('aurora-earned-in-real-garden-mobile.png'), fullPage: true })
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.getByRole('button', { name: 'Recentrer' }).click()
  await page.screenshot({ path: info.outputPath('aurora-earned-in-real-garden-desktop.png'), fullPage: true })
  await resident.press('Enter')
  expect(await page.locator('.info-modal .garden-visitor-svg').evaluate(svg => svg.innerHTML)).toBe(completeArt)
  expect(errors).toEqual([])
  expect(requests).toEqual([])
})

test('the entire earned bird fits its discovery frame on compact phones and desktop, without a clipped crest', async ({ page }) => {
  const history = tenFinishedDecors()
  const reward = selectCatalogReward({ sessions: history, garden: { placements: [] } }, 40)
  const session: HomeworkSession = { ...solvedSession({ id: 'complete-bird-fit', count: 40 }), ...reward, status: 'active' }
  session.creature!.state = 'complete_static'
  session.creature!.parts.forEach(part => { part.revealed = true })
  await page.addInitScript(({ key, session }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ sessions: [session], garden: { placements: [] } })) }, { key: appStateKey, session })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`/play/${session.id}`)
  await expect(page.locator('.creature-stage .garden-visitor-svg')).toBeVisible()
  for (const size of [{ width: 412, height: 839 }, { width: 360, height: 640 }, { width: 1280, height: 1000 }]) {
    await page.setViewportSize(size)
    const geometry = await page.locator('.creature-stage').evaluate(stage => {
      const box = stage.getBoundingClientRect(), panel = stage.closest('.play-creature-panel')!.getBoundingClientRect()
      const shapes = [...stage.querySelectorAll('svg path, svg ellipse')].map(shape => shape.getBoundingClientRect())
      return { top: Math.max(box.top, panel.top), bottom: Math.min(box.bottom, panel.bottom), left: Math.max(box.left, panel.left), right: Math.min(box.right, panel.right), minX: Math.min(...shapes.map(box=>box.left)), maxX: Math.max(...shapes.map(box=>box.right)), minY: Math.min(...shapes.map(box=>box.top)), maxY: Math.max(...shapes.map(box=>box.bottom)) }
    })
    expect(geometry.minY, `${size.width} × ${size.height}: crest`).toBeGreaterThanOrEqual(geometry.top-2)
    expect(geometry.maxY, `${size.width} × ${size.height}: tail`).toBeLessThanOrEqual(geometry.bottom+2)
    expect(geometry.minX).toBeGreaterThanOrEqual(geometry.left-2)
    expect(geometry.maxX).toBeLessThanOrEqual(geometry.right+2)
  }
})
