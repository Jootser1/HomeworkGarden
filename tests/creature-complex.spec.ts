import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { writeFile } from 'node:fs/promises'

const url = pathToFileURL(resolve('plans/design/creature-lab/complex.html')).href

test('complex concepts: offline mobile controls and exact 20/20/40 formats', async ({ page }) => {
  const errors: string[] = [], requests: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('request', req => { if (/^https?:/.test(req.url())) requests.push(req.url()) })
  await page.goto(url)
  await expect(page.locator('.card')).toHaveCount(3)
  expect(await page.evaluate(() => window.CreatureConcepts.map(d => d.parts.length))).toEqual([20, 20, 40])
  expect(new Set(await page.evaluate(() => window.CreatureConcepts.map(d => d.id))).size).toBe(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.card button').nth(2).click()
  await expect(page.locator('#study-title')).toHaveText('Oiseau des aurores')
  await expect(page.locator('#study-count')).toHaveText('40')
  await page.getByRole('button', { name: 'Étape suivante' }).click()
  await expect(page.locator('#counter')).toHaveText('1 / 40')
  await page.getByRole('button', { name: 'Voir au complet' }).click()
  await expect(page.locator('#specimen > g')).toHaveCount(40)
  await expect(page.locator('#next')).toBeDisabled()
  await page.locator('#progress').fill('30')
  await expect(page.locator('#specimen > g')).toHaveCount(30)
  await page.getByRole('button', { name: 'Recommencer' }).click()
  await expect(page.locator('#specimen > g')).toHaveCount(0)
  await page.getByRole('button', { name: 'Voir les silhouettes' }).click()
  await expect(page.locator('#silhouette')).toHaveAttribute('aria-pressed', 'true')
  expect(errors).toEqual([])
  expect(requests).toEqual([])
})

test('80 complex additions change the artwork at 150px without clipping or masks', async ({ page }, info) => {
  await page.goto(url)
  await page.locator('#specimen').evaluate(svg => { svg.style.width = '150px' })
  const metrics: { id: string; step: number; label: string; changedPixels: number }[] = []
  for (let index = 0; index < 3; index++) {
    await page.evaluate(i => window.CreatureLab.select(i), index)
    const drawing = await page.evaluate(() => window.CreatureLab.getDrawing())
    let before = await page.locator('#specimen').screenshot()
    for (let step = 1; step <= drawing.parts.length; step++) {
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
      expect(changedPixels, `${drawing.id}, étape ${step}: ${drawing.parts[step - 1].label}`).toBeGreaterThan(20)
      before = after
    }
  }
  await expect(page.locator('#specimen mask, #specimen clipPath, #specimen image, #specimen script, #specimen foreignObject')).toHaveCount(0)
  await writeFile(info.outputPath('pixel-metrics.json'), JSON.stringify(metrics, null, 2))
})

test('capture complex colour, silhouettes, mobile and bird progression', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto(url)
  await page.screenshot({ path: info.outputPath('complex-couleurs.png'), fullPage: true, scale: 'css' })
  await page.getByRole('button', { name: 'Voir les silhouettes' }).click()
  await page.screenshot({ path: info.outputPath('complex-silhouettes.png'), fullPage: true, scale: 'css' })
  await page.getByRole('button', { name: 'Retrouver les couleurs' }).click()
  await page.setViewportSize({ width: 393, height: 851 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('complex-mobile.png'), fullPage: true, scale: 'css' })
  await page.setViewportSize({ width: 1200, height: 900 })
  await page.evaluate(() => {
    window.CreatureLab.select(2)
    const board = document.createElement('main')
    board.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:30px;max-width:1160px'
    for (const step of [1, 10, 20, 30, 35, 40]) {
      window.CreatureLab.setStep(step)
      const card = document.createElement('article'); card.style.cssText = 'background:#e9eddf;border-radius:18px;padding:20px'
      const label = document.createElement('p'); label.textContent = `Oiseau des aurores · ${step} / 40`
      const svg = document.querySelector('#specimen')!.cloneNode(true) as SVGElement
      svg.removeAttribute('id'); svg.style.cssText = 'display:block;width:100%'
      card.append(label, svg); board.append(card)
    }
    document.body.replaceChildren(board)
  })
  await page.screenshot({ path: info.outputPath('oiseau-progression.png'), fullPage: true, scale: 'css' })
})
