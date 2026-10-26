import { expect, test } from '@playwright/test'
import { canNavigateStep, chooseGardenRoute, findGardenPath } from '@/lib/garden/movement'
import { advanceGardenJourney, createGardenJourney, gardenJourneyFrame } from '@/lib/garden/journey'
import { gardenVisitors } from '@/lib/creatures/garden-visitors'
import { isoPosition, tileAt } from '@/lib/garden/map'
import type { AppState, GardenPlacement } from '@/lib/types'
import { createDecor } from '@/lib/garden/decor'
import { solvedSession } from './helpers/sessions'
import { writeFile } from 'node:fs/promises'

const movement = gardenVisitors[0].movement
const start: GardenPlacement = { creatureId: 'pompon', x: 12, y: 8, direction: 'right' }
const target = { x: 17, y: 8 }
const normalStepMs = Math.hypot(39, 21) / 22 * 1000

test('shortest full path detours around placed décor; unreachable destinations return no route', () => {
  const obstacles = [{ x: 14, y: 8 }, { x: 14, y: 9 }]
  const destination = { x: 16, y: 8 }
  const route = findGardenPath(start, destination, movement, obstacles)
  expect(route).toHaveLength(6)
  expect(route.at(-1)).toEqual(destination)
  let previous = start
  for (const cell of route) {
    expect(canNavigateStep(previous, cell, movement, obstacles)).toBe(true)
    previous = { ...previous, ...cell }
  }
  const enclosed = [{ x: 15, y: 8 }, { x: 17, y: 8 }, { x: 16, y: 7 }, { x: 16, y: 9 }]
  expect(findGardenPath(start, destination, movement, enclosed)).toEqual([])
  expect(findGardenPath(start, { x: -1, y: 8 }, movement, [])).toEqual([])
  expect(findGardenPath(start, { x: 12.5, y: 8 }, movement, [])).toEqual([])
})

test('routes obey ramp elevations and aquatic habitats; flyers may overfly obstacles', () => {
  const ramp = findGardenPath({ x: 14, y: 7 }, { x: 14, y: 2 }, movement, [])
  expect(ramp).toHaveLength(5)
  expect(ramp).toContainEqual({ x: 14, y: 4 })
  expect(ramp).toContainEqual({ x: 14, y: 5 })
  const water = { ...movement, type: 'swimming' as const, allowedTerrain: ['pond' as const] }
  const swimming = findGardenPath({ x: 6, y: 9 }, { x: 6, y: 12 }, water, [])
  expect(swimming.length).toBeGreaterThan(0)
  expect(swimming.every(cell => tileAt(cell.x, cell.y)?.terrain === 'pond')).toBe(true)
  expect(findGardenPath({ x: 6, y: 9 }, start, water, [])).toEqual([])
  const sky = gardenVisitors[1].movement
  expect(findGardenPath(start, { x: 16, y: 8 }, sky, [{ x: 14, y: 8 }])).toHaveLength(4)
})

test('autonomous routes choose a distant reachable destination without immediate reversal', () => {
  const route = chooseGardenRoute(start, movement, [], () => .8, { x: 11, y: 8 })
  expect(route.length).toBeGreaterThanOrEqual(4)
  expect(route.length).toBeLessThanOrEqual(10)
  expect(route[0]).not.toEqual({ x: 11, y: 8 })
  const blocks = [{ x: 13, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 7 }, { x: 12, y: 9 }]
  expect(chooseGardenRoute(start, movement, blocks, () => .8)).toEqual([])
})

test('time flows through intermediate cells with no idle frame or per-cell random stop', () => {
  const journey = createGardenJourney(start, movement, [], () => .5, target)
  const result = advanceGardenJourney(journey, movement, [], normalStepMs + 250, () => 0)
  expect(result.arrivals).toHaveLength(1)
  expect(result.journey.placement.x).toBe(13)
  expect(result.journey.progress).toBeCloseTo(250 / normalStepMs)
  expect(result.journey.pauseRemaining).toBe(0)
  expect(gardenJourneyFrame(result.journey).moving).toBe(true)
  const frame = gardenJourneyFrame(result.journey)
  expect(frame.left).toBeCloseTo(isoPosition(13, 8).left + 39 * 250 / normalStepMs)
  expect(journey.progress).toBe(0) // no mutation of the input
  expect(journey.placement).toEqual(start)
  let split = journey
  for (const dt of [500, 700, normalStepMs - 1200, 250]) split = advanceGardenJourney(split, movement, [], dt, () => 0).journey
  expect(gardenJourneyFrame(split)).toEqual(frame)
})

test('occasional pauses occur only at the chosen destination, not at each cell', () => {
  const journey = createGardenJourney(start, movement, [], () => .5, { x: 14, y: 8 })
  const atPause = advanceGardenJourney(journey, movement, [], normalStepMs * 2 + 400, () => 0).journey
  expect(atPause.placement).toMatchObject({ x: 14, y: 8 })
  expect(atPause.pauseRemaining).toBeCloseTo(600)
  expect(gardenJourneyFrame(atPause).moving).toBe(false)
  const resumed = advanceGardenJourney(atPause, movement, [], 700, () => .8).journey
  expect(resumed.pauseRemaining).toBe(0)
  expect(gardenJourneyFrame(resumed).moving).toBe(true)
  expect(resumed.progress).toBeGreaterThan(0)
  const noPause = advanceGardenJourney(journey, movement, [], normalStepMs * 2 + 400, () => .8).journey
  expect(noPause.pauseRemaining).toBe(0)
  expect(noPause.progress).toBeGreaterThan(0)
})

test('an obstacle added ahead causes replanning at the next node without teleporting', () => {
  let journey = createGardenJourney(start, movement, [], () => .5, target)
  journey = advanceGardenJourney(journey, movement, [], normalStepMs / 2, () => .8).journey
  const obstacles = [{ x: 14, y: 8 }]
  let previous = gardenJourneyFrame(journey)
  for (let tick = 0; tick < 90; tick++) {
    const result = advanceGardenJourney(journey, movement, obstacles, 100, () => .8)
    for (const arrival of result.arrivals) expect(arrival.x !== 14 || arrival.y !== 8).toBe(true)
    journey = result.journey
    const frame = gardenJourneyFrame(journey)
    expect(Math.hypot(frame.left - previous.left, frame.top - previous.top)).toBeLessThanOrEqual(2.201)
    previous = frame
  }
})

test('a newly blocked active endpoint causes a continuous retreat before replanning', () => {
  const journey = advanceGardenJourney(createGardenJourney(start, movement, [], () => .5, target), movement, [], normalStepMs / 2, () => .8).journey
  const before = gardenJourneyFrame(journey)
  const obstacles = [{ x: 13, y: 8 }]
  const retreat = advanceGardenJourney(journey, movement, obstacles, 100, () => .8)
  expect(retreat.journey.returning).toBe(true)
  expect(retreat.journey.progress).toBeLessThan(journey.progress)
  expect(retreat.arrivals).toEqual([])
  const frame = gardenJourneyFrame(retreat.journey)
  expect(Math.hypot(frame.left - before.left, frame.top - before.top)).toBeCloseTo(2.2)
  const replanned = advanceGardenJourney(retreat.journey, movement, obstacles, 1500, () => .8)
  expect(replanned.journey.returning).toBe(false)
  expect(replanned.journey.path).not.toContainEqual({ x: 13, y: 8 })
  expect(replanned.arrivals.some(cell => cell.x === 13 && cell.y === 8)).toBe(false)
})

test('projection interpolates ramp endpoints continuously instead of rounding grid elevation', () => {
  const placement = { ...start, x: 14, y: 5 }
  const journey = createGardenJourney(placement, movement, [], () => .5, { x: 14, y: 4 })
  const from = isoPosition(14, 5), to = isoPosition(14, 4)
  const duration = Math.hypot(to.left - from.left, to.top - from.top) / 22 * 1000
  const frame = gardenJourneyFrame(advanceGardenJourney(journey, movement, [], duration / 2, () => .8).journey)
  expect(frame.left).toBeCloseTo((from.left + to.left) / 2)
  expect(frame.top).toBeCloseTo((from.top + to.top) / 2)
})

test('live visitors cross several cells without the old cyclic stop and freeze exactly on pause', async ({ page }, info) => {
  await page.addInitScript(() => { Math.random = () => .8 }) // no intentional destination pause
  await page.goto('/garden?visitors=1')
  const pompon = page.locator('[data-visitor-id="pompon"]')
  await expect(pompon).toHaveAttribute('data-moving', 'true')
  await expect.poll(async () => Number(await pompon.getAttribute('data-progress'))).toBeGreaterThan(.05)
  const samples = await page.evaluate(async () => {
    const result: { time: number; left: number; top: number; cell: string; moving: string | null; destination: string | null }[] = []
    for (let i = 0; i < 40; i++) {
      const element = document.querySelector<HTMLElement>('[data-visitor-id="pompon"]')!
      result.push({ time: performance.now(), left: parseFloat(element.style.left), top: parseFloat(element.style.top), cell: `${element.dataset.x}:${element.dataset.y}`, moving: element.getAttribute('data-moving'), destination: element.getAttribute('data-destination') })
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    return result
  })
  await writeFile(info.outputPath('continuous-movement.json'), JSON.stringify(samples, null, 2))
  expect(new Set(samples.map(sample => sample.cell)).size).toBeGreaterThanOrEqual(3)
  expect(samples.every(sample => sample.moving === 'true')).toBe(true)
  for (let i = 1; i < samples.length; i++) {
    const distance = Math.hypot(samples[i].left - samples[i - 1].left, samples[i].top - samples[i - 1].top)
    expect(distance, `sample ${i}: no 600ms node stop`).toBeGreaterThan(.5)
    expect(distance, `sample ${i}: no teleport`).toBeLessThan((samples[i].time - samples[i - 1].time) * .03 + 1)
  }
  await page.getByRole('button', { name: 'Mettre les visiteurs en pause' }).click()
  await expect(pompon).toHaveAttribute('data-paused', 'true')
  const frozen = await pompon.getAttribute('style')
  await page.waitForTimeout(650)
  await expect(pompon).toHaveAttribute('style', frozen!)
  await page.getByRole('button', { name: 'Reprendre la promenade' }).click()
  await expect.poll(() => pompon.getAttribute('style')).not.toBe(frozen)
})

test('moving a real décor into an active visitor route triggers a smooth retreat and replanning', async ({ page }) => {
  const { creature: _creature, ...session } = solvedSession({ id: 'route-obstacle' })
  const decor = createDecor({ variant: 'daisies', palette: 'sage', seed: 1 }, 10)
  decor.revealedSteps = 10
  const state: AppState = { sessions: [{ ...session, decor }], garden: { placements: [], decorPlacements: [{ decorId: decor.id, x: 18, y: 14 }] } }
  await page.addInitScript(state => { localStorage.setItem('homework-garden-state-v1', JSON.stringify(state)); Math.random = () => .8 }, state)
  await page.goto('/garden?visitors=1')
  const pompon = page.locator('[data-visitor-id="pompon"]')
  await expect.poll(async () => Number(await pompon.getAttribute('data-progress'))).toBeGreaterThan(.25)
  const blocked = await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>('[data-visitor-id="pompon"]')!
    const x = Number(element.dataset.x), y = Number(element.dataset.y), direction = element.dataset.direction
    const cell = { x: x + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0), y: y + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0) }
    const state = JSON.parse(localStorage.getItem('homework-garden-state-v1')!)
    state.garden.decorPlacements[0] = { ...state.garden.decorPlacements[0], ...cell }
    localStorage.setItem('homework-garden-state-v1', JSON.stringify(state))
    window.dispatchEvent(new Event('homework-garden-state-change'))
    return { ...cell, initialProgress: Number(element.dataset.progress), left: parseFloat(element.style.left), top: parseFloat(element.style.top) }
  })
  await expect.poll(async () => Number(await pompon.getAttribute('data-progress'))).toBeLessThan(blocked.initialProgress)
  const samples = await page.evaluate(async () => {
    const result: { x: number; y: number; left: number; top: number }[] = []
    for (let i = 0; i < 35; i++) {
      const element = document.querySelector<HTMLElement>('[data-visitor-id="pompon"]')!
      result.push({ x: Number(element.dataset.x), y: Number(element.dataset.y), left: parseFloat(element.style.left), top: parseFloat(element.style.top) })
      await new Promise(resolve => setTimeout(resolve, 120))
    }
    return result
  })
  expect(samples.every(sample => sample.x !== blocked.x || sample.y !== blocked.y)).toBe(true)
  for (let i = 1; i < samples.length; i++) expect(Math.hypot(samples[i].left - samples[i - 1].left, samples[i].top - samples[i - 1].top)).toBeLessThan(7)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('homework-garden-state-v1')!).garden.decorPlacements[0])).toMatchObject({ x: blocked.x, y: blocked.y })
})

test('collected residents share continuous routing, merge node saves and cannot resurrect a reset', async ({ page }) => {
  const session = solvedSession({ id: 'walking-resident' })
  session.creature!.state = 'alive_in_garden'
  session.creature!.movement = movement
  const { creature: _creature, ...decorSession } = solvedSession({ id: 'preserved-decor' })
  const decor = createDecor({ variant: 'daisies', palette: 'sage', seed: 2 }, 10)
  decor.revealedSteps = 10
  const state: AppState = { sessions: [session, { ...decorSession, decor }], garden: { placements: [{ ...start, creatureId: session.creature!.id }], decorPlacements: [{ decorId: decor.id, x: 18, y: 14 }] } }
  await page.addInitScript(state => { localStorage.setItem('homework-garden-state-v1', JSON.stringify(state)); Math.random = () => .8 }, state)
  await page.goto('/garden')
  const resident = page.locator('.garden-creature')
  await expect(resident).toHaveAttribute('data-moving', 'true')
  await expect.poll(async () => Number(await resident.getAttribute('data-progress'))).toBeGreaterThan(.15)
  const initial = await resident.getAttribute('style')
  await expect.poll(() => resident.getAttribute('style')).not.toBe(initial)
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('homework-garden-state-v1')!).garden.placements[0].x)).not.toBe(start.x)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('homework-garden-state-v1')!))
  expect(stored.sessions).toEqual(state.sessions)
  expect(stored.garden.decorPlacements).toEqual(state.garden.decorPlacements)
  expect(Number.isInteger(stored.garden.placements[0].x)).toBe(true)
  expect(Number.isInteger(stored.garden.placements[0].y)).toBe(true)
  await page.evaluate(() => { localStorage.removeItem('homework-garden-state-v1'); window.dispatchEvent(new Event('homework-garden-state-change')) })
  await expect(resident).toHaveCount(0)
  await page.waitForTimeout(2200)
  expect(await page.evaluate(() => localStorage.getItem('homework-garden-state-v1'))).toBeNull()
})
