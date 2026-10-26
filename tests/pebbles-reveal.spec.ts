import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DecorView } from '@/components/DecorView'
import { buildPebblePlan, decorBuildPlanSchema } from '@/lib/garden/decor-build'
import { createDecor } from '@/lib/garden/decor'
import type { HomeworkSession } from '@/lib/types'
import { solvedSession } from './helpers/sessions'

const key = 'homework-garden-state-v1'

test('fifteen calculations reveal fifteen whole, visible additions, never a scanning mask', async ({ page }, info) => {
  test.setTimeout(60000)
  const { creature: _creature, ...base } = solvedSession({ id: 'pebbles-fifteen', count: 15 })
  const decor = createDecor({ variant: 'pebbles', palette: 'sage', seed: 42 }, 15)
  // Reproduce an already-created gift from the previous implementation too.
  const { buildPlan: _plan, ...legacyDecor } = decor
  const session: HomeworkSession = { ...base, status: 'active', currentExerciseIndex: 0, decor: legacyDecor, rewardSequence: 1, exercises: base.exercises.map((exercise) => ({ ...exercise, attempts: 0, status: 'pending' })) }
  await page.addInitScript(({ key, session }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ sessions: [session], garden: { placements: [] } }))
  }, { key, session })
  await page.goto('/play/pebbles-fifteen')
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const dpr = await page.evaluate(() => window.devicePixelRatio)
  let previous: Buffer | undefined
  for (let i = 0; i < 15; i++) {
    for (const digit of String(session.exercises[i].expectedAnswer)) await page.getByRole('button', { name: digit, exact: true }).click()
    await page.getByRole('button', { name: '✓', exact: true }).click()
    await expect(page.locator('.decor-svg [data-decor-part]')).toHaveCount(i + 1)
    await expect(page.locator('.decor-svg clipPath')).toHaveCount(0)
    await page.waitForTimeout(900)
    const current = await page.locator('.creature-stage .decor-svg').screenshot({ path: info.outputPath(`pebbles-${String(i + 1).padStart(2, '0')}.png`) })
    if (previous) {
      const changed = await page.evaluate(async ([before, after]) => {
        const read = async (png: string) => { const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode(); const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height; const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, img.width, img.height).data }
        const a = await read(before), b = await read(after)
        if (a.length !== b.length) throw new Error('Le cadrage a changé pendant la construction')
        let changed = 0
        for (let pixel = 0; pixel < a.length; pixel += 4) if (Math.max(Math.abs(a[pixel] - b[pixel]), Math.abs(a[pixel + 1] - b[pixel + 1]), Math.abs(a[pixel + 2] - b[pixel + 2])) > 20) changed++
        return changed
      }, [previous.toString('base64'), current.toString('base64')])
      expect(changed / (dpr * dpr), `Ajout visible à l’étape ${i + 1}`).toBeGreaterThan(35)
    }
    previous = current
    if (i === 7) {
      await page.reload()
      await expect(page.locator('.decor-svg [data-decor-part]')).toHaveCount(8)
    }
  }
  await expect(page.getByRole('button', { name: 'Installer dans le jardin' })).toBeVisible()
  const labels = ['Premier galet', 'Deuxième galet', 'Fougère de gauche', 'Petit galet clair', 'Première mousse', 'Fleur du centre', 'Galet du premier plan', 'Touffe d’herbe de gauche', 'Mousse du galet droit', 'Dernier petit galet', 'Fougère de droite', 'Fleur de droite', 'Dernière mousse', 'Touffe d’herbe de droite', 'Fleur du premier plan']
  const cards = labels.map((label, index) => `<article><header><b>${index + 1} / 15</b> · ${label}</header>${renderToStaticMarkup(createElement(DecorView, { decor: { ...decor, revealedSteps: index + 1 } }))}<p><a href="pebbles-${String(index + 1).padStart(2, '0')}.png">Capture réelle sur mobile</a></p></article>`).join('')
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Galets — quinze ajouts réels</title><style>body{font:15px system-ui;background:#f3f0e7;color:#344c39;margin:0;padding:25px}main{max-width:1200px;margin:auto}h1{font:38px Georgia}p{line-height:1.6}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}article{border:1px solid #d5dfc7;border-radius:16px;background:#e9efdb;padding:15px}header{font-size:13px}svg{width:100%;height:165px}article p{font-size:12px}a{color:#476b4f}@media(max-width:700px){.grid{grid-template-columns:1fr 1fr}svg{height:125px}}</style><main><h1>Les galets de berge, en 15 vrais ajouts.</h1><p>Cette planche utilise le moteur réel du jeu. Chaque carte conserve les éléments précédents et ajoute un élément entier. Aucun balayage ni tranche d’image. Les liens montrent les captures obtenues pendant les quinze réponses sur un profil mobile Chromium.</p><div class="grid">${cards}</div><p>Prototype ciblé à valider avant de généraliser aux autres familles ou de laisser l’IA composer les recettes.</p></main></html>`
  await writeFile(info.outputPath('galets-15-etapes.html'), html)
  await page.setContent(html)
  await page.setViewportSize({ width: 1200, height: 900 })
  await page.screenshot({ path: info.outputPath('galets-planche.png'), fullPage: true })
})

test('pebble construction allocates real nonempty groups for every supported generated count', () => {
  for (let count = 1; count <= 40; count++) {
    const plan = buildPebblePlan({ variant: 'pebbles', palette: 'sage', seed: 42 }, count)
    expect(decorBuildPlanSchema.safeParse(plan).success).toBe(true)
    expect(plan.steps).toHaveLength(count)
    expect(plan.steps.every((step) => step.elements.length > 0)).toBe(true)
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  }
  const plan = buildPebblePlan({ variant: 'pebbles', palette: 'sage', seed: 42 }, 15)
  expect(plan.steps.every((step) => step.elements.length === 1)).toBe(true)
  const all = plan.steps.flatMap((step) => step.elements)
  for (const [kind, count] of [['pebble', 5], ['moss', 3], ['fern', 2], ['flower', 3], ['grass', 2]] as const) expect(all.filter((part) => part.kind === kind)).toHaveLength(count)
})
