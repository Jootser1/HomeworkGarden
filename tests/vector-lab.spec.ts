import { expect, test, type Page } from '@playwright/test'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readFile, writeFile } from 'node:fs/promises'

type VectorDrawing = { version: number; id: string; name: string; description: string; viewBox: number[]; palette: string[]; parts: { id: string; label: string; shapes: { tag: string; attrs: Record<string, string | number> }[] }[] }
declare global {
  interface Window {
    VectorLab: { validateDrawing(value: unknown): VectorDrawing; show(index: number): void; setStep(step: number): void; setSize(width: number): void; getDrawing(): VectorDrawing }
    vectorLabFrames: { label: string; svg: SVGElement }[]
  }
}
const url = pathToFileURL(resolve('plans/design/vector-lab/index.html')).href
async function open(page: Page) {
  await page.goto(url)
  await expect(page.locator('#art svg')).toBeVisible()
}
async function changedPixels(page: Page, before: Buffer, after: Buffer) {
  return page.evaluate(async ([a64, b64]) => {
    const decode = async (base64: string) => {
      const img = new Image(); img.src = `data:image/png;base64,${base64}`; await img.decode()
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height
      const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0)
      return ctx.getImageData(0, 0, img.width, img.height).data
    }
    const a = await decode(a64), b = await decode(b64)
    if (a.length !== b.length) throw new Error('Le dessin change de cadrage')
    let count = 0
    for (let p = 0; p < a.length; p += 4) if (Math.max(Math.abs(a[p] - b[p]), Math.abs(a[p + 1] - b[p + 1]), Math.abs(a[p + 2] - b[p + 2])) > 20) count++
    return count / (window.devicePixelRatio ** 2)
  }, [before.toString('base64'), after.toString('base64')])
}

for (const [index, count] of [[0, 5], [1, 15], [2, 40]]) {
  test(`standalone vector drawing: ${count} whole additions at 150px, no assembly engine`, async ({ page }, info) => {
    await open(page)
    await page.evaluate((index) => { window.VectorLab.show(index); window.VectorLab.setSize(150); window.vectorLabFrames = [] }, index)
    let previous = await page.locator('#art svg').screenshot()
    const metrics: { step: number; changedCssPixels: number; label: string }[] = []
    const drawing = await page.evaluate(() => window.VectorLab.getDrawing())
    expect(drawing.parts).toHaveLength(count)
    const sourceName = ['arbre-5', 'souche-15', 'arbre-40'][index]
    expect(drawing).toEqual(JSON.parse(await readFile(resolve(`plans/design/vector-lab/${sourceName}.json`), 'utf8')))
    for (let step = 1; step <= count; step++) {
      await page.evaluate((step) => window.VectorLab.setStep(step), step)
      await expect(page.locator('#art svg > g')).toHaveCount(step)
      await expect(page.locator('#art clipPath, #art mask')).toHaveCount(0)
      const bounds = await page.locator('#art svg > g').last().evaluate((group) => { const b = (group as SVGGElement).getBBox(); return { x: b.x, y: b.y, width: b.width, height: b.height } })
      expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.y).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(320); expect(bounds.y + bounds.height).toBeLessThanOrEqual(300)
      expect(Math.max(bounds.width, bounds.height)).toBeGreaterThan(10)
      const current = await page.locator('#art svg').screenshot({ path: info.outputPath(`step-${String(step).padStart(2, '0')}.png`) })
      const changed = await changedPixels(page, previous, current)
      metrics.push({ step, changedCssPixels: changed, label: drawing.parts[step - 1].label })
      // A measurable addition is necessary, not proof of visual interest or a correct joint.
      expect(changed, `Étape ${step}: ${drawing.parts[step - 1].label}`).toBeGreaterThan(20)
      previous = current
      await page.evaluate((label) => window.vectorLabFrames.push({ label, svg: document.querySelector('#art svg')!.cloneNode(true) as SVGElement }), `${step}/${count} · ${drawing.parts[step - 1].label}`)
    }
    await writeFile(info.outputPath('pixel-metrics.json'), JSON.stringify(metrics, null, 2))
    await page.setViewportSize({ width: 1200, height: 900 })
    await page.evaluate(() => {
      const main = document.createElement('main'); main.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:15px;max-width:1160px;margin:20px auto;padding:0'
      for (const { label, svg } of window.vectorLabFrames) {
        const card = document.createElement('article'); card.style.cssText = 'background:#e9efdc;border:1px solid #d1dcc4;border-radius:14px;padding:14px'
        const title = document.createElement('p'); title.textContent = label; title.style.cssText = 'font:12px system-ui;min-height:36px;margin:0'
        svg.style.cssText = 'width:100%;height:220px;display:block'
        card.append(title, svg); main.append(card)
      }
      document.body.replaceChildren(main)
    })
    await page.screenshot({ path: info.outputPath(`contact-${count}.png`), fullPage: true })
  })
}

test('vector reader rejects executable markup, external references and unbounded data', async ({ page }) => {
  await open(page)
  const rejected = await page.evaluate(() => {
    const attempts = [
      (d: VectorDrawing) => { d.parts[0].shapes[0].tag = 'script' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].tag = 'foreignObject' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].tag = 'image' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].attrs.onclick = 'alert(1)' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].attrs.href = 'https://example.com' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].attrs.fill = 'url(https://example.com)' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].attrs.style = 'background:url(https://example.com)' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].attrs.d = 'not-a-path<script>' },
      (d: VectorDrawing) => { d.parts[0].shapes[0].attrs['stroke-width'] = 10000 },
      (d: VectorDrawing) => { d.parts[0].shapes = [] },
      (d: VectorDrawing) => { d.parts[1].id = d.parts[0].id },
      (d: VectorDrawing) => { d.parts = Array.from({ length: 1000 }, () => d.parts[0]) },
    ]
    return attempts.map((change) => { const d = window.VectorLab.getDrawing(); change(d); try { window.VectorLab.validateDrawing(d); return false } catch { return true } })
  })
  expect(rejected.every(Boolean)).toBe(true)
  const drawing = await page.evaluate(() => window.VectorLab.getDrawing())
  drawing.name = '<img src=x onerror=alert(1)>'
  await page.locator('details').click()
  await page.getByLabel('Document JSON').fill(JSON.stringify(drawing))
  await page.getByRole('button', { name: 'Vérifier et ouvrir' }).click()
  await expect(page.locator('#title')).toHaveText(drawing.name)
  await expect(page.locator('img')).toHaveCount(0)
})
