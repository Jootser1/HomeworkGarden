import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { vectorShapeSchema } from '@/lib/rewards/vector'
import { writeFile } from 'node:fs/promises'

type PilotDrawing = { id: string; name: string; kind: string; format: number; parts: { id: string; label: string; motion?: string; shapes: { tag: string; attrs: Record<string, string | number> }[] }[] }
declare global {
  interface Window {
    RewardFormatsPilot: { drawings: PilotDrawing[]; select(index: number): void; setStep(step: number): void }
  }
}
const url = pathToFileURL(resolve('plans/design/reward-formats-lab/index.html')).href

test('four original pilot compositions have exact 10/20/30/50 whole groups, offline controls and no garden writes', async ({ page }) => {
  const errors: string[] = [], network: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (/^https?:/.test(request.url())) network.push(request.url()) })
  await page.addInitScript(() => {
    for (const method of ['setItem', 'removeItem', 'clear']) Object.defineProperty(Storage.prototype, method, { value: () => { throw new Error('The art pilot must not write browser storage') } })
  })
  await page.goto(url)
  await expect(page.locator('[data-specimen]')).toHaveCount(4)
  const drawings = await page.evaluate(() => window.RewardFormatsPilot.drawings)
  expect(drawings.map(d => d.format)).toEqual([10, 20, 30, 50])
  expect(drawings.map(d => d.kind)).toEqual(['decor', 'decor', 'creature', 'exceptional'])
  expect(new Set(drawings.map(d => d.id)).size).toBe(4)
  for (const drawing of drawings) {
    expect(drawing.parts).toHaveLength(drawing.format)
    expect(new Set(drawing.parts.map(part => part.id)).size).toBe(drawing.format)
    for (const part of drawing.parts) {
      expect(part.label.length).toBeGreaterThan(0)
      expect(part.shapes.length).toBeGreaterThan(0)
      for (const shape of part.shapes) expect(vectorShapeSchema.safeParse(shape).success).toBe(true)
    }
  }
  await page.locator('[data-specimen]').nth(3).click()
  await expect(page.locator('#study-title')).toHaveText('Tortue-archipel céleste')
  await page.getByRole('button', { name: 'Tout révéler' }).click()
  await expect(page.locator('#specimen > g')).toHaveCount(50)
  await page.getByRole('slider', { name: 'Réponses justes' }).fill('30')
  await expect(page.locator('#counter')).toHaveText('30 / 50')
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await expect(page.locator('#specimen > g')).toHaveCount(0)
  await page.getByRole('button', { name: 'Ajout suivant' }).click()
  await expect(page.locator('#specimen > g')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(errors).toEqual([])
  expect(network).toEqual([])
})

test('all 110 additions change visible pixels at 150px and remain inside the frame', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url)
  const geometry = await page.evaluate(() => {
    const result = []
    for (const [index, drawing] of window.RewardFormatsPilot.drawings.entries()) {
      window.RewardFormatsPilot.select(index)
      for (let step = 1; step <= drawing.format; step++) {
        window.RewardFormatsPilot.setStep(step)
        const group = document.querySelector('#specimen > g:last-child') as SVGGElement
        const box = group.getBBox()
        result.push({ id: drawing.id, step, count: document.querySelectorAll('#specimen > g').length, x: box.x, y: box.y, right: box.x + box.width, bottom: box.y + box.height })
      }
    }
    return result
  })
  expect(geometry).toHaveLength(110)
  for (const row of geometry) {
    expect(row.count).toBe(row.step)
    expect(row.x, `${row.id}, ${row.step}`).toBeGreaterThanOrEqual(1)
    expect(row.y, `${row.id}, ${row.step}`).toBeGreaterThanOrEqual(1)
    expect(row.right, `${row.id}, ${row.step}`).toBeLessThanOrEqual(319)
    expect(row.bottom, `${row.id}, ${row.step}`).toBeLessThanOrEqual(299)
  }
  const changes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 150; canvas.height = 141
    const context = canvas.getContext('2d')!
    const metrics = []
    for (const [index, drawing] of window.RewardFormatsPilot.drawings.entries()) {
      window.RewardFormatsPilot.select(index)
      let previous: Uint8ClampedArray | undefined
      for (let step = 0; step <= drawing.format; step++) {
        window.RewardFormatsPilot.setStep(step)
        const root = document.querySelector('#specimen')!.cloneNode(true) as SVGSVGElement
        root.setAttribute('width', '150'); root.setAttribute('height', '141')
        const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(root)); await image.decode()
        context.clearRect(0, 0, 150, 141); context.drawImage(image, 0, 0)
        const pixels = context.getImageData(0, 0, 150, 141).data
        if (previous) {
          let changed = 0
          for (let i = 0; i < pixels.length; i += 4) if (Math.max(...[0,1,2,3].map(offset => Math.abs(pixels[i+offset] - previous![i+offset]))) > 20) changed++
          metrics.push({ id: drawing.id, step, label: drawing.parts[step-1].label, changed })
        }
        previous = pixels
      }
    }
    return metrics
  })
  await writeFile(info.outputPath('visible-additions.json'), JSON.stringify(changes, null, 2))
  for (const change of changes) expect(change.changed, `${change.id}, ${change.step}: ${change.label}`).toBeGreaterThan(20)
  await expect(page.locator('svg mask, svg clipPath, svg image, svg script, svg foreignObject, svg use')).toHaveCount(0)
})

test('keyboard, pause and system reduced motion work without visual overflow', async ({ page }) => {
  await page.goto(url)
  await page.locator('[data-specimen]').nth(2).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#study-title')).toBeFocused()
  await page.getByRole('button', { name: 'Tout révéler' }).click()
  await page.getByRole('button', { name: 'Mettre au repos' }).click()
  expect(await page.locator('#specimen [data-motion]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationPlayState === 'paused'))).toBe(true)
  await page.getByRole('button', { name: 'Animer', exact: true }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await page.locator('#specimen [data-motion]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).animationName === 'none'))).toBe(true)
  for (const width of [360, 412, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('capture colour, silhouettes, compact view and exceptional progression for review', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto(url)
  await page.evaluate(() => window.RewardFormatsPilot.setStep(10))
  await page.screenshot({ path: info.outputPath('four-formats-colour.png'), fullPage: true, scale: 'css' })
  await page.getByRole('button', { name: 'Voir les silhouettes' }).click()
  await page.screenshot({ path: info.outputPath('four-formats-silhouettes.png'), fullPage: true, scale: 'css' })
  await page.getByRole('button', { name: 'Retrouver les couleurs' }).click()
  await page.evaluate(() => { window.RewardFormatsPilot.select(3); window.RewardFormatsPilot.setStep(50) })
  await page.setViewportSize({ width: 393, height: 851 })
  await page.screenshot({ path: info.outputPath('exceptional-mobile.png'), fullPage: true, scale: 'css' })
  await page.setViewportSize({ width: 1200, height: 1000 })
  await page.evaluate(() => {
    const sheet = document.createElement('main'); sheet.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:30px;max-width:1160px'
    for (const count of [5, 10, 20, 30, 40, 50]) {
      window.RewardFormatsPilot.setStep(count)
      const card = document.createElement('article'); card.style.cssText = 'background:#e5ebdc;padding:16px;border-radius:10px'
      const caption = document.createElement('p'); caption.textContent = `Tortue-archipel · ${count} / 50`
      const root = document.querySelector('#specimen')!.cloneNode(true) as SVGSVGElement; root.removeAttribute('id'); root.style.cssText = 'display:block;width:100%'
      card.append(caption, root); sheet.append(card)
    }
    document.body.replaceChildren(sheet)
  })
  await page.screenshot({ path: info.outputPath('exceptional-progression.png'), fullPage: true, scale: 'css' })
})
