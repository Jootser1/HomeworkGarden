import { expect, test } from '@playwright/test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFile } from 'node:fs/promises'
import { CreatureView } from '@/components/CreatureView'
import { rewardCollection, selectCatalogReward, sessionCompositionId } from '@/lib/rewards/catalog'
import { gardenTiles, sceneryOccupied } from '@/lib/garden/map'
import { exerciseRegistry } from '@/lib/exercises'
import type { AppState, HomeworkSession, Direction } from '@/lib/types'
import archives from './fixtures/reward-archives.v1.json'
import { activeSession, appStateKey, numericAnswer } from './helpers/exercises'
import { solvedSession } from './helpers/sessions'

const blank = (): AppState => ({ sessions: [], garden: { placements: [] } })
function exclusive(entry: typeof rewardCollection[number]) {
  return selectCatalogReward({ ...blank(), rewardHistory: rewardCollection.filter(e => e.compositionId !== entry.compositionId).map(e => e.compositionId) }, entry.format, () => 0)
}

for (const count of [15, 40]) test(`an archived version-one ${count}-answer session still reveals, journals and resumes unchanged`, async ({ page }) => {
  const reward = structuredClone(count === 15 ? archives.decor15 : archives.creature40)
  const { creature: _old, ...base } = solvedSession({ id: `archive-${count}`, count })
  const session = { ...base, ...reward, status: 'active', currentExerciseIndex: 0, exercises: base.exercises.map(e => ({ ...e, status: 'pending', attempts: 0, childAnswer: undefined, revealedPartId: undefined })) } as HomeworkSession
  await page.addInitScript(({ key, session }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ sessions: [session], garden: { placements: [] } })) }, { key: appStateKey, session })
  await page.goto(`/play/${session.id}`)
  for (let i=0;i<3;i++) await numericAnswer(page, session.exercises[i].expectedAnswer)
  await page.reload()
  await expect(page.locator('.creature-stage [data-reward-part]')).toHaveCount(3)
  expect((await activeSession(page)).exercises.filter(e=>e.status==='correct')).toHaveLength(3)
  expect((await activeSession(page)).decor?.catalogArt ?? (await activeSession(page)).creature!.catalogArt).toEqual(session.decor?.catalogArt ?? session.creature!.catalogArt)
  const journal = await page.evaluate(id => JSON.parse(localStorage.getItem(`homework-garden-catalog-reward-v1:${id}`)!), sessionCompositionId(session)!)
  expect(journal.exercises.filter((e: {status:string})=>e.status==='correct')).toHaveLength(3)
  await page.goto('/parent')
  await page.getByLabel('Nombre de calculs').fill('30')
  await page.getByRole('button', { name: 'Commencer', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  const state: AppState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), appStateKey)
  expect(state.sessions.find(s=>s.id===session.id)).toEqual(journal)
  expect((await activeSession(page)).creature!.catalogArt!.version).toBe(2)
})

test('all 56 complete snapshots fit together in real browser storage without freeing any reservations', async ({ page }) => {
  const family = exerciseRegistry.all[0]
  const state = blank()
  state.sessions = rewardCollection.map((entry,index) => ({
    id: `entire-lot-${index}`, createdAt: '2026-01-01T00:00:00Z', status: 'active', title: family.label, exerciseKind: family.kind,
    generationOptions: { ...family.defaults('medium'), count: entry.format }, exercises: family.generate({ ...family.defaults('medium'), count: entry.format }),
    currentExerciseIndex: 0, ...exclusive(entry),
  }))
  for(const session of state.sessions) {
    session.status='completed';session.currentExerciseIndex=session.exercises.length;session.solvedAt='2026-01-01T00:00:00Z'
    session.exercises.forEach((e,i)=>{e.status='correct';e.attempts=1;e.childAnswer=e.expectedAnswer;e.revealedPartId=session.creature?.parts[i].id??`decor-${i+1}`})
    if(session.decor) session.decor.revealedSteps=session.decor.stepCount
    if(session.creature) {session.creature.state='complete_static';session.creature.parts.forEach(p=>{p.revealed=true})}
  }
  state.rewardHistory = state.sessions.map(s=>sessionCompositionId(s)!)
  await page.goto('/parent')
  const size = await page.evaluate(({state,key}) => {
    const payload = JSON.stringify(state)
    localStorage.setItem(key,payload)
    for(const s of state.sessions) localStorage.setItem('homework-garden-catalog-reward-v1:'+(s.decor?.catalogArt?.compositionId ?? s.creature!.catalogArt!.compositionId),JSON.stringify(s))
    return Object.keys(localStorage).reduce((n,k)=>n+(localStorage.getItem(k)?.length??0)*2,0)
  }, { state, key: appStateKey })
  expect(size).toBeLessThan(5*1024*1024)
  await test.info().attach('complete-lot-storage.json',{body:JSON.stringify({sessions:state.sessions.length,utf16Bytes:size}),contentType:'application/json'})
  await page.reload()
  await expect(page.getByText(/Formats disponibles : lot épuisé/)).toBeVisible()
  await page.getByRole('button',{name:'Commencer',exact:true}).click()
  await expect(page.getByText(/Le lot est épuisé/)).toBeVisible()
  const after: AppState = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),appStateKey)
  expect(after).toEqual(state)
})

test('all sixteen creatures have bounded directional art, paused discovery and reduced-motion animation', async ({ page }, info) => {
  const css = await readFile('app/garden/collection.css','utf8')
  const samples = rewardCollection.filter(e=>e.kind!=='decor').map(entry=>{
    const creature = exclusive(entry).creature!
    creature.parts.forEach(p=>{p.revealed=true})
    return { name: creature.name, frames: (['down','up','right','left'] as Direction[]).map(direction=>renderToStaticMarkup(createElement(CreatureView,{creature,direction,alive:true}))) }
  })
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.setViewportSize({width:1280,height:1000})
  await page.setContent(`<html lang="fr"><style>${css}body{font:16px Georgia;background:#f2f0e7;color:#41554f;margin:28px}section{display:grid;grid-template-columns:160px repeat(4,1fr);align-items:center;gap:10px;margin:12px 0;padding:12px;border-radius:16px;background:#e4ebd6}svg{width:100%;height:180px}</style><h1>Seize créatures · face, dos, droite, gauche</h1>${samples.map(s=>`<section><h2>${s.name}</h2>${s.frames.join('')}</section>`).join('')}</html>`)
  const bounds = await page.locator('svg').evaluateAll(svgs=>svgs.map(svg=>{
    const box=svg.getBoundingClientRect();const shapes=[...svg.querySelectorAll('path,ellipse,circle,rect,line,polyline')].map(s=>s.getBoundingClientRect())
    return {name:svg.getAttribute('aria-label'),direction:svg.getAttribute('data-direction'),fit:shapes.every(s=>s.left>=box.left-2&&s.top>=box.top-2&&s.right<=box.right+2&&s.bottom<=box.bottom+2),animations:[...svg.querySelectorAll('.collection-motion')].map(n=>getComputedStyle(n).animationName)}
  }))
  expect(bounds).toHaveLength(64)
  for(const result of bounds){expect(result.fit,`${result.name} ${result.direction}`).toBe(true);expect(result.animations.length).toBeGreaterThan(0);expect(result.animations.every(n=>n==='none')).toBe(true)}
  await page.screenshot({path:info.outputPath('sixteen-creatures-four-directions.png'),fullPage:true})
  await page.emulateMedia({reducedMotion:'no-preference'})
  expect(await page.locator('.collection-motion').first().evaluate(n=>getComputedStyle(n).animationName)).not.toBe('none')
  for(const phase of [0,.25,.5,.75,.999]) {
    await page.evaluate(phase=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=Number(a.effect!.getTiming().duration)*phase}),phase)
    const overflow=await page.locator('svg').evaluateAll(svgs=>svgs.flatMap(svg=>{
      const b=svg.getBoundingClientRect()
      return [...svg.querySelectorAll('path,ellipse,circle,rect,line,polyline')].filter(s=>{const r=s.getBoundingClientRect();return r.left<b.left-2||r.right>b.right+2||r.top<b.top-2||r.bottom>b.bottom+2}).map(()=>`${svg.getAttribute('aria-label')} ${svg.getAttribute('data-direction')}`)
    }))
    expect(overflow,`animated phase ${phase}`).toEqual([])
  }
  await page.locator('svg').evaluateAll(svgs=>svgs.forEach(svg=>{svg.classList.remove('is-alive');svg.classList.add('is-paused')}))
  expect(await page.locator('.collection-motion').first().evaluate(n=>getComputedStyle(n).animationPlayState)).toBe('paused')
})

test('all sixteen new creatures coexist and navigate the real garden with their saved drawings', async ({page},info)=>{
  const state=blank()
  const used=new Set<string>()
  for(const [index,entry] of rewardCollection.filter(e=>e.kind!=='decor').entries()){
    const reward=exclusive(entry),creature=reward.creature!
    creature.parts.forEach(p=>{p.revealed=true});creature.state='alive_in_garden'
    const base=solvedSession({id:`resident-v2-${index}`,count:entry.format})
    state.sessions.push({...base,...reward})
    const tile=gardenTiles.find(t=>creature.movement.allowedTerrain.includes(t.terrain)&&!sceneryOccupied(t.x,t.y)&&!used.has(`${t.x},${t.y}`)&&t.x>=8&&t.x<=16&&t.y>=6&&t.y<=13)!
    used.add(`${tile.x},${tile.y}`)
    state.garden.placements.push({creatureId:creature.id,x:tile.x,y:tile.y,direction:'down'})
  }
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(({state,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state))},{state,key:appStateKey})
  await page.goto('/garden')
  await expect(page.locator('.garden-creature .collection-creature')).toHaveCount(16)
  await expect.poll(()=>page.locator('.garden-creature[data-moving="true"]').count()).toBeGreaterThan(0)
  await page.screenshot({path:info.outputPath('sixteen-new-garden-residents-mobile.png'),fullPage:true})
  await page.setViewportSize({width:1280,height:1000})
  await page.getByRole('button',{name:'Recentrer'}).click()
  await page.screenshot({path:info.outputPath('sixteen-new-garden-residents-desktop.png'),fullPage:true})
  expect(errors).toEqual([])
})
