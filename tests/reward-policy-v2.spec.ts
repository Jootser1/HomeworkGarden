import { expect, test } from '@playwright/test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CreatureView } from '@/components/CreatureView'
import { exerciseRegistry } from '@/lib/exercises'
import { selectCatalogReward, rewardAvailability, rewardCollection } from '@/lib/rewards/catalog'
import { catalogCreatureArtSchema, catalogDecorArtSchema } from '@/lib/rewards/vector'
import archives from './fixtures/reward-archives.v1.json'
import oldDecors from '@/lib/rewards/art/decor.v1.json'
import type { AppState } from '@/lib/types'

const blank = (): AppState => ({ sessions: [], garden: { placements: [] } })

test('length chooses the reward directly, without a ten-decor prerequisite', () => {
  for (const count of [10, 20, 30, 50]) {
    const reward = selectCatalogReward(blank(), count, () => 0)
    expect(Boolean(reward.decor)).toBe(count <= 20)
    expect(Boolean(reward.creature)).toBe(count >= 30)
    const art = reward.decor?.catalogArt ?? reward.creature!.catalogArt!
    expect(art.version).toBe(2)
    expect(art.groups).toHaveLength(count)
    if (reward.creature) expect(reward.creature.rarity).toBe(count === 50 ? 'wonder' : 'rare')
  }
  expect(rewardAvailability(blank()).formats).toEqual([10, 20, 30, 50])
})

test('all independent exercise families generate and retain fifty questions', () => {
  for (const family of exerciseRegistry.all) {
    const normalized = family.normalize({ ...family.defaults('easy'), count: 50 })
    expect(normalized.count, family.kind).toBe(50)
    const exercises = family.generate(normalized)
    expect(exercises, family.kind).toHaveLength(50)
    expect(new Set(exercises.map(e => e.id)).size).toBe(50)
  }
})

test('the published lot contains exactly 56 distinct new authored compositions', () => {
  expect(rewardCollection).toHaveLength(56)
  expect([10, 20, 30, 50].map(format => rewardCollection.filter(e => e.format === format).length)).toEqual([20, 20, 12, 4])
  expect(new Set(rewardCollection.map(e => e.compositionId)).size).toBe(56)
  expect(new Set(rewardCollection.map(e => JSON.stringify(e.drawing.parts.map(p => p.shapes)))).size).toBe(56)
})

test('new animated creatures render the saved groups in every direction', () => {
  for (const count of [30, 50]) {
    const creature = selectCatalogReward(blank(), count, () => 0).creature!
    creature.parts.forEach(p => { p.revealed = true })
    const views = ['down', 'up', 'right', 'left'].map(direction => renderToStaticMarkup(createElement(CreatureView, { creature, direction: direction as 'down', alive: true })))
    for (const svg of views) {
      expect(svg).toContain('data-composition-id=')
      expect(svg.match(/data-reward-part=/g)).toHaveLength(count)
      expect(svg).not.toMatch(/clipPath|<mask|<image|<script/)
    }
    expect(new Set(views).size).toBe(4)
  }
})

test('exhausting the first lot never blocks or recycles a composition in the new lot', () => {
  const state = { ...blank(), rewardHistory: [...oldDecors.map(e=>e.compositionId),'creature-pompon-v1','creature-raie-v1','creature-aurores-v1'] }
  const before = structuredClone(state)
  expect(rewardAvailability(state).formats).toEqual([10,20,30,50])
  for(const count of [10,20,30,50]) {
    const reward=selectCatalogReward(state,count,()=>0)
    expect(state.rewardHistory).not.toContain(reward.decor?.catalogArt?.compositionId ?? reward.creature!.catalogArt!.compositionId)
  }
  expect(state).toEqual(before)
})

test('new saved directional forms and motions reject executable or unbounded extensions', () => {
  const art=selectCatalogReward(blank(),50,()=>0).creature!.catalogArt!
  if(art.version!==2) throw new Error('Expected v2')
  for(const field of ['back','profile']) {
    const corrupted={...art,drawing:{...art.drawing,parts:art.drawing.parts.map((p,i)=>i===0?{...p,[field]:[{tag:'image',attrs:{href:'https://invalid.example/art.svg'}}]}:p)}}
    expect(catalogCreatureArtSchema.safeParse(corrupted).success).toBe(false)
  }
  const badMotion={...art,drawing:{...art.drawing,parts:art.drawing.parts.map((p,i)=>i===0?{...p,motion:'arbitrary-css'}:p)}}
  expect(catalogCreatureArtSchema.safeParse(badMotion).success).toBe(false)
  expect(catalogCreatureArtSchema.safeParse({...art,groups:art.groups.slice(1)}).success).toBe(false)
})

test('saved version-one drawings and forty-part rigs remain valid', () => {
  expect(catalogDecorArtSchema.safeParse(archives.decor15.decor.catalogArt).success).toBe(true)
  expect(catalogCreatureArtSchema.safeParse(archives.creature40.creature.catalogArt).success).toBe(true)
})
