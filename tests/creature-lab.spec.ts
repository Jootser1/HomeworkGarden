import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { writeFile } from 'node:fs/promises'

type Concept = { id: string; name: string; parts: { label: string; svg: string }[] }
declare global {
  interface Window {
    CreatureConcepts: Concept[]
    CreatureLab: { select(index: number): void; setStep(step: number): void; getDrawing(): Concept }
  }
}
const url = pathToFileURL(resolve('plans/design/creature-lab/index.html')).href

test('eight distinct concept documents, offline rendering and mobile controls', async ({ page }) => {
  const errors: string[] = [], requests: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('request', req => { if (/^https?:/.test(req.url())) requests.push(req.url()) })
  await page.goto(url)
  await expect(page.locator('.card')).toHaveCount(8)
  const ids = await page.evaluate(() => window.CreatureConcepts.map(d => d.id))
  expect(new Set(ids).size).toBe(8)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Voir les silhouettes' }).click()
  await expect(page.locator('#silhouette')).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Retrouver les couleurs' }).click()
  await page.locator('.card button').nth(7).click()
  await expect(page.locator('#study-title')).toHaveText('Crabe-nénuphar')
  await page.getByRole('button', { name: 'Étape suivante' }).click()
  await expect(page.locator('#counter')).toHaveText('1 / 10')
  await page.getByRole('button', { name: 'Voir au complet' }).click()
  await expect(page.locator('#specimen > g')).toHaveCount(10)
  await expect(page.locator('#next')).toBeDisabled()
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await expect(page.locator('#specimen > g')).toHaveCount(0)
  await page.locator('#progress').fill('5')
  await expect(page.locator('#specimen > g')).toHaveCount(5)
  expect(errors).toEqual([])
  expect(requests).toEqual([])
})

test('80 visible additions at 150 CSS pixels, bounded geometry and no masks', async ({ page }, info) => {
  await page.goto(url)
  await page.locator('#specimen').evaluate(svg => { svg.style.width = '150px' })
  const metrics: { id: string; step: number; label: string; changedPixels: number }[] = []
  for (let index = 0; index < 8; index++) {
    await page.evaluate(i => window.CreatureLab.select(i), index)
    const drawing = await page.evaluate(() => window.CreatureLab.getDrawing())
    expect(drawing.parts).toHaveLength(10)
    let before = await page.locator('#specimen').screenshot()
    for (let step = 1; step <= 10; step++) {
      await page.evaluate(k => window.CreatureLab.setStep(k), step)
      await expect(page.locator('#specimen > g')).toHaveCount(step)
      const bounds = await page.locator('#specimen > g').last().evaluate(g => {
        const b = (g as SVGGElement).getBBox(); return { x: b.x, y: b.y, right: b.x + b.width, bottom: b.y + b.height }
      })
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.y).toBeGreaterThanOrEqual(0)
      expect(bounds.right).toBeLessThanOrEqual(320)
      expect(bounds.bottom).toBeLessThanOrEqual(280)
      const after = await page.locator('#specimen').screenshot()
      const changedPixels = await page.evaluate(async ([a, b]) => {
        async function decode(value: string) {
          const img = new Image(); img.src = `data:image/png;base64,${value}`; await img.decode()
          const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height
          const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0)
          return ctx.getImageData(0, 0, img.width, img.height).data
        }
        const x = await decode(a), y = await decode(b)
        if (x.length !== y.length) throw new Error('Cadrage instable')
        let count = 0
        for (let p = 0; p < x.length; p += 4) if (Math.max(Math.abs(x[p] - y[p]), Math.abs(x[p + 1] - y[p + 1]), Math.abs(x[p + 2] - y[p + 2])) > 20) count++
        return count / (devicePixelRatio ** 2)
      }, [before.toString('base64'), after.toString('base64')])
      metrics.push({ id: drawing.id, step, label: drawing.parts[step - 1].label, changedPixels })
      expect(changedPixels, `${drawing.id}, étape ${step}`).toBeGreaterThan(20)
      before = after
    }
  }
  await expect(page.locator('#specimen mask, #specimen clipPath, #specimen image, #specimen script, #specimen foreignObject')).toHaveCount(0)
  await writeFile(info.outputPath('pixel-metrics.json'), JSON.stringify(metrics, null, 2))
})

test('capture full colour and silhouette contact sheets', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.goto(url)
  await page.screenshot({ path: info.outputPath('planche-couleurs.png'), fullPage: true })
  await page.getByRole('button', { name: 'Voir les silhouettes' }).click()
  await page.screenshot({ path: info.outputPath('planche-silhouettes.png'), fullPage: true })
  await page.setViewportSize({ width: 393, height: 851 })
  await page.getByRole('button', { name: 'Retrouver les couleurs' }).click()
  await page.screenshot({ path: info.outputPath('apercu-mobile.png'), fullPage: true })
})
