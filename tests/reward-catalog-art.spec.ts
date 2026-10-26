import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DecorView } from '@/components/DecorView'
import { CreatureView } from '@/components/CreatureView'
import { availableRewardFormats, CatalogUnavailableError, creatureCatalog, decorCatalog, selectCatalogReward, sessionCompositionId } from '@/lib/rewards/catalog'
import { catalogCreatureArtSchema, catalogDecorArtSchema, formatForCount, revealGroups } from '@/lib/rewards/vector'
import { createDecor } from '@/lib/garden/decor'
import type { AppState } from '@/lib/types'
import { solvedSession } from './helpers/sessions'

const blank = (): AppState => ({ sessions: [], garden: { placements: [] } })
const entries = [...decorCatalog, ...creatureCatalog]
function history() {
  return Array.from({ length: 10 }, (_, index) => {
    const { creature: _old, ...base } = solvedSession({ id: `old-${index}`, count: 1 })
    return { ...base, rewardSequence: index+1, decor: createDecor({ variant: 'round', palette: 'sage', seed: index }, 1) }
  })
}
function rewardFor(entry: typeof entries[number]) {
  return selectCatalogReward({ ...blank(), sessions: 'visitor' in entry ? history() : [], rewardHistory: entries.filter(other => other.compositionId !== entry.compositionId).map(other => other.compositionId) }, entry.format, () => 0)
}
function frame(reward: ReturnType<typeof selectCatalogReward>, revealed: number, complete = false) {
  if (reward.decor) return renderToStaticMarkup(createElement(DecorView, { decor: { ...reward.decor, revealedSteps: revealed }, complete }))
  const creature = reward.creature!
  return renderToStaticMarkup(createElement(CreatureView, { creature: { ...creature, parts: creature.parts.map((part, index) => ({ ...part, revealed: index < revealed })) } }))
}

test('the first real lot has ten unique decor compositions and the three authored animated creatures', () => {
  expect(decorCatalog).toHaveLength(10)
  expect(creatureCatalog).toHaveLength(3)
  expect(new Set(entries.map(entry => entry.compositionId)).size).toBe(13)
  expect(new Set(decorCatalog.map(entry => JSON.stringify(entry.drawing.parts.map(part => part.shapes)))).size).toBe(10)
  expect([...new Set(decorCatalog.map(entry => entry.format))]).toEqual([10, 15, 20, 40])
})

test('every native answer adds exactly one whole group and the final archived art is identical', () => {
  for (const entry of entries) {
    const reward = rewardFor(entry)
    const art = reward.decor?.catalogArt ?? reward.creature!.catalogArt!
    expect(('drawing' in art ? catalogDecorArtSchema : catalogCreatureArtSchema).safeParse(art).success).toBe(true)
    expect(art.groups).toHaveLength(entry.format)
    expect(art.groups.every(group => group.length === 1)).toBe(true)
    expect(new Set(art.groups.flat()).size).toBe(entry.format)
    for (let count = 0; count <= entry.format; count++) {
      const svg = frame(reward, count)
      expect(svg.match(/data-reward-part=/g) ?? [], `${entry.compositionId}, réponse ${count}`).toHaveLength(count)
      expect(svg).not.toMatch(/clipPath|<mask|dangerouslySetInnerHTML|<image|href=/)
    }
    const restored = JSON.parse(JSON.stringify(reward))
    expect(frame(restored, entry.format)).toBe(frame(reward, entry.format))
    if (reward.decor) expect(frame(reward, entry.format).replaceAll(' class="decor-build-addition"', '')).toBe(frame(reward, entry.format, true))
  }
})

test('custom lengths from one to forty combine complete groups without empty answers or changing identity', () => {
  for (let count = 1; count <= 40; count++) {
    const reward = selectCatalogReward(blank(), count, () => 0)
    const art = reward.decor!.catalogArt!
    expect(art.nativeFormat).toBe(formatForCount(count))
    expect(art.groups).toHaveLength(count)
    expect(art.groups.every(group => group.length > 0)).toBe(true)
    expect(art.groups.flat()).toEqual(art.drawing.parts.map(part => part.id))
  }
  expect(selectCatalogReward(blank(), 1, () => 0).decor!.catalogArt!.compositionId).toBe(selectCatalogReward(blank(), 10, () => 0).decor!.catalogArt!.compositionId)
  expect(() => revealGroups(['one'], 2)).toThrow()
  expect(() => selectCatalogReward(blank(), 41)).toThrow()
})

test('pending, completed, stored and ledger-only compositions all stay unavailable', () => {
  const state = blank()
  for (let index = 0; index < 3; index++) {
    const reward = selectCatalogReward(state, index+1, () => 0)
    const { creature: _old, ...base } = solvedSession({ id: `new-${index}`, count: index+1 })
    state.sessions.push({ ...base, ...reward, status: index === 0 ? 'active' : 'completed' })
  }
  expect(new Set(state.sessions.map(sessionCompositionId)).size).toBe(3)
  expect(state.garden.placements).toEqual([])
  expect(() => selectCatalogReward(state, 10, () => 0)).toThrow(CatalogUnavailableError)
  expect(availableRewardFormats(state, 'decor')).toEqual([15, 20, 40])
  state.rewardHistory = state.sessions.map(session => sessionCompositionId(session)!)
  state.sessions = []
  expect(() => selectCatalogReward(state, 10)).toThrow(CatalogUnavailableError)
})

test('a removed catalogue entry still renders from its saved drawing, not a live recipe lookup', () => {
  const reward = selectCatalogReward(blank(), 15, () => 0)
  reward.decor!.catalogArt!.compositionId = 'retired-illustration-v1'
  reward.decor!.catalogArt!.drawing.name = 'Une composition archivée'
  const markup = frame(JSON.parse(JSON.stringify(reward)), 15, true)
  expect(markup).toContain('Une composition archivée')
  expect(markup.match(/data-reward-part=/g)).toHaveLength(15)
})

test('saved drawings reject executable markup, external resources, clipping and damaged reveal plans', () => {
  const reward = selectCatalogReward(blank(), 10, () => 0)
  for (const shape of [
    { tag: 'script', attrs: { d: 'M0 0', fill: '#ffffff' } },
    { tag: 'image', attrs: { href: 'https://invalid.example/image.svg' } },
    { tag: 'path', attrs: { d: 'M0 0', fill: 'url(https://invalid.example/paint)' } },
    { tag: 'path', attrs: { d: 'M0 0', fill: '#ffffff', onclick: 'alert(1)' } },
    { tag: 'path', attrs: { d: 'M0 0', fill: '#ffffff', style: 'animation:none' } },
    { tag: 'path', attrs: { d: 'M0 0', fill: '#ffffff', 'clip-path': 'url(#mask)' } },
    { tag: 'path', attrs: { d: 'M1e999 0', fill: '#ffffff' } },
  ]) {
    const corrupted = JSON.parse(JSON.stringify(reward))
    corrupted.decor.catalogArt.drawing.parts[0].shapes = [shape]
    expect(catalogDecorArtSchema.safeParse(corrupted.decor.catalogArt).success).toBe(false)
    const markup = frame(corrupted, 10)
    expect(markup).toContain('Illustration indisponible')
    expect(markup).not.toMatch(/<script|<image|href=|data-reward-part=/)
  }
  const art = structuredClone(reward.decor!.catalogArt!)
  art.groups[0] = []
  expect(catalogDecorArtSchema.safeParse(art).success).toBe(false)
  expect(catalogCreatureArtSchema.safeParse({ version: 1, compositionId: 'invalid', rig: 'aurores', nativeFormat: 10, groups: [['1']] }).success).toBe(false)
})

test('every addition changes visible pixels at real collection size, with a first-lot contact sheet', async ({ page }, info) => {
  const drawings = entries.map(entry => {
    const reward = rewardFor(entry)
    return { id: entry.compositionId, name: reward.decor?.catalogArt?.drawing.name ?? reward.creature!.name, count: entry.format, height: reward.decor ? 141 : 131, frames: Array.from({ length: entry.format+1 }, (_, count) => frame(reward, count)) }
  })
  const changes = await page.evaluate(async drawings => {
    const result = []
    for (const drawing of drawings) {
      const canvas = document.createElement('canvas'); canvas.width = 150; canvas.height = drawing.height
      const context = canvas.getContext('2d')!
      let previous: Uint8ClampedArray | undefined
      for (const [step, svg] of drawing.frames.entries()) {
        const image = new Image(); image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="${drawing.height}" `))}`; await image.decode()
        context.clearRect(0,0,150,drawing.height); context.drawImage(image,0,0)
        const pixels = context.getImageData(0,0,150,drawing.height).data
        if (previous) {
          let changed = 0
          for (let index=0;index<pixels.length;index+=4) if (Math.max(...[0,1,2,3].map(offset=>Math.abs(previous![index+offset]-pixels[index+offset])))>20) changed++
          result.push({ id: drawing.id, step, changed })
        }
        previous = pixels
      }
    }
    return result
  }, drawings)
  await writeFile(info.outputPath('visible-additions-at-150px.json'), JSON.stringify(changes,null,2))
  await info.attach('visible-additions-at-150px', { path: info.outputPath('visible-additions-at-150px.json'), contentType: 'application/json' })
  for (const change of changes) expect(change.changed, `${change.id}, étape ${change.step}`).toBeGreaterThan(12)
  await page.setViewportSize({ width: 1400, height: 1000 })
  await page.setContent(`<html lang="fr"><style>body{background:#f2f0e7;font:16px Georgia;color:#344c39;padding:25px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}article{background:#e4ebd6;border-radius:20px;padding:16px;text-align:center}svg{width:100%;height:215px}h1{font-size:30px}h2{font-size:18px}p{font:14px system-ui}</style><h1>Premier lot raccordé aux exercices et au jardin</h1><main>${drawings.map(drawing=>`<article><h2>${drawing.name}</h2>${drawing.frames.at(-1)}<p>${drawing.count} groupes entiers · ${drawing.id}</p></article>`).join('')}</main></html>`)
  await page.screenshot({ path: info.outputPath('first-lot.png'), fullPage: true })
})
