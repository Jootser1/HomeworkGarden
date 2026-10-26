import { expect, test } from '@playwright/test'
import { gardenVisitors, visitorPlacements } from '@/lib/creatures/garden-visitors'
import { gardenTiles, canCreatureStep, sceneryOccupied, tileAt } from '@/lib/garden/map'
import { chooseGardenRoute, decorObstacles, findGardenPath } from '@/lib/garden/movement'
import { createDecor } from '@/lib/garden/decor'
import { solvedSession } from './helpers/sessions'
import type { AppState } from '@/lib/types'

const key = 'homework-garden-state-v1'

test('visitor walkers obey terrain, scenery, placed décor and elevations for every map tile', () => {
  const movement = gardenVisitors[0].movement
  for (const tile of gardenTiles) {
    if (!movement.allowedTerrain.includes(tile.terrain) || sceneryOccupied(tile.x, tile.y)) continue
    const obstacles = [{ x: tile.x + 1, y: tile.y }]
    const route = chooseGardenRoute(tile, movement, obstacles, () => .8)
    let previous = tile
    for (const result of route) {
      const to = tileAt(result.x, result.y)!
      expect(canCreatureStep(previous, to, movement.allowedTerrain)).toBe(true)
      expect(obstacles.some(cell => cell.x === result.x && cell.y === result.y)).toBe(false)
      expect(Math.abs(result.x - previous.x) + Math.abs(result.y - previous.y)).toBe(1)
      previous = to
    }
  }
})

test('visitors spawn on valid cells and flyers cross water but never leave the map', () => {
  const obstacles = [{ x: 12, y: 9 }]
  const starts = visitorPlacements(obstacles)
  expect(starts).toHaveLength(3)
  const pompon = starts.find(p => p.creatureId === 'pompon')!
  expect(pompon.x !== 12 || pompon.y !== 9).toBe(true)
  expect(gardenVisitors[0].movement.allowedTerrain).toContain(tileAt(pompon.x, pompon.y)!.terrain)
  for (const visitor of gardenVisitors.slice(1)) {
    for (const tile of gardenTiles) {
      const route = chooseGardenRoute(tile, visitor.movement, [tile], () => .8)
      expect(route.length).toBeGreaterThan(0)
      expect(route.every(cell => Boolean(tileAt(cell.x, cell.y)))).toBe(true)
    }
    const route = findGardenPath({ x: 7, y: 9 }, { x: 7, y: 12 }, visitor.movement, [])
    expect(route.length).toBe(3)
    expect(route.every(cell => tileAt(cell.x, cell.y)?.terrain === 'pond')).toBe(true)
  }
  const { creature: _creature, ...session } = solvedSession()
  const decor = createDecor({ variant: 'round', palette: 'sage', seed: 1 }, 10)
  const state: AppState = { sessions: [{ ...session, decor }], garden: { placements: [], decorPlacements: [{ decorId: decor.id, x: 12, y: 8 }] } }
  expect(decorObstacles(state)).toContainEqual({ x: 12, y: 8 })
  expect(decorObstacles({ ...state, garden: { placements: [] } })).toEqual([])
})

test('temporary visitors preserve the existing collection byte-for-byte and can be removed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const session = solvedSession({ id: 'existing-collection' })
  session.creature!.state = 'alive_in_garden'
  // Give the legacy resident a valid dry-land tile to avoid its normal startup repair.
  session.creature!.movement.allowedTerrain = ['grass', 'flower', 'forest', 'mushroom', 'dirt', 'stone', 'glow']
  const state: AppState = { sessions: [session], garden: { placements: [{ creatureId: session.creature!.id, x: 12, y: 8, direction: 'down' }], decorPlacements: [] } }
  const raw = JSON.stringify(state)
  await page.addInitScript(({ key, raw }) => { localStorage.setItem(key, raw); localStorage.setItem('homework-garden-used-local-creatures-v2', '["local-001"]') }, { key, raw })
  await page.goto('/garden')
  await expect(page.locator('.garden-creature')).toHaveCount(1)
  await page.getByRole('button', { name: 'Inviter les trois visiteurs' }).click()
  await expect(page.locator('.garden-visitor')).toHaveCount(3)
  await page.waitForTimeout(3200)
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw)
  expect(await page.evaluate(() => localStorage.getItem('homework-garden-used-local-creatures-v2'))).toBe('["local-001"]')
  await page.getByRole('button', { name: 'Retirer les visiteurs' }).click()
  await expect(page.locator('.garden-visitor')).toHaveCount(0)
  await expect(page.locator('.garden-creature')).toHaveCount(1)
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw)
})

test('visitors move in the actual garden, change views, pause and inspect with keyboard', async ({ page }, info) => {
  const errors: string[] = [], paidCalls: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', req => { if (req.url().includes('/api/')) paidCalls.push(req.url()) })
  await page.addInitScript(() => { Math.random = () => .8 })
  await page.goto('/garden?visitors=1')
  await expect(page.locator('.garden-visitor')).toHaveCount(3)
  const pompon = page.locator('[data-visitor-id="pompon"]')
  const wing = page.locator('.bird-wing-left')
  const initialWing = await wing.evaluate(element => getComputedStyle(element).transform)
  await expect.poll(() => wing.evaluate(element => getComputedStyle(element).transform)).not.toBe(initialWing)
  const before = await pompon.getAttribute('data-x') + ':' + await pompon.getAttribute('data-y')
  await expect.poll(async () => await pompon.getAttribute('data-x') + ':' + await pompon.getAttribute('data-y'), { timeout: 7000 }).not.toBe(before)
  for (const [name, direction] of [['Face', 'down'], ['Droite', 'right'], ['Dos', 'up'], ['Gauche', 'left']]) {
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.locator(`.garden-visitor-svg[data-view="${direction}"]`)).toHaveCount(3)
    await expect(pompon).toHaveAttribute('data-paused', 'true')
  }
  const stopped = await pompon.getAttribute('style')
  await page.waitForTimeout(3100)
  await expect(pompon).toHaveAttribute('style', stopped!)
  await page.getByRole('button', { name: 'Face', exact: true }).click()
  await page.screenshot({ path: info.outputPath('garden-visitors-mobile.png'), fullPage: true, scale: 'css' })
  await pompon.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.visitor-views figure')).toHaveCount(4)
  await expect(page.locator('.visitor-views [data-view="up"] .visitor-eyes')).toHaveCount(0)
  await expect(page.locator('.visitor-views [data-view="down"] .visitor-eyes')).toHaveCount(1)
  await expect(page.locator('.visitor-views [data-view="right"] .visitor-eyes')).toHaveCount(1)
  await page.screenshot({ path: info.outputPath('pompon-four-views.png'), fullPage: true, scale: 'css' })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(pompon).toBeFocused()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Recentrer', exact: true }).click()
  await page.screenshot({ path: info.outputPath('garden-visitors-desktop.png'), fullPage: true, scale: 'css' })
  for (const id of ['raie', 'aurores']) {
    await page.locator(`[data-visitor-id="${id}"]`).focus()
    await page.keyboard.press('Enter')
    await page.screenshot({ path: info.outputPath(`${id}-four-views.png`), fullPage: true, scale: 'css' })
    await page.getByRole('button', { name: 'Retour au jardin' }).click()
  }
  await page.getByRole('button', { name: 'Reprendre la promenade' }).click()
  await expect(pompon).toHaveAttribute('data-paused', 'false')
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull()
  expect(errors).toEqual([])
  expect(paidCalls).toEqual([])
})

test('reduced motion freezes logical positions and disables part animations, also offline', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/garden?visitors=1')
  await expect(page.locator('.garden-visitor')).toHaveCount(3)
  const positions = await page.locator('.garden-visitor').evaluateAll(items => items.map(item => item.getAttribute('style')))
  await page.waitForTimeout(3100)
  expect(await page.locator('.garden-visitor').evaluateAll(items => items.map(item => item.getAttribute('style')))).toEqual(positions)
  expect(await page.locator('.bird-wing-left').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  await context.setOffline(true)
  await page.goto('/offline#/garden')
  await expect(page.locator('.garden-camera')).toBeVisible()
  await page.getByRole('button', { name: 'Inviter les trois visiteurs' }).click()
  await expect(page.locator('.garden-visitor')).toHaveCount(3)
  await page.locator('[data-visitor-id="aurores"]').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
})
