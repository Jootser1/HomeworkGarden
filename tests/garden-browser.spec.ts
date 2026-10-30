import { expect, test, type Page } from '@playwright/test'
import { createDecor, decorName } from '@/lib/garden/decor'
import { canPlaceDecor, gardenTiles, isoPosition, worldSize } from '@/lib/garden/map'
import type { AppState, DecorPlacement, HomeworkSession } from '@/lib/types'
import { solvedSession } from './helpers/sessions'

const key='homework-garden-state-v1'
const fixedDecor = () => { const decor=createDecor({variant:'round',palette:'sage',seed:42},2);decor.revealedSteps=2;return decor }
function decorSession(id='gift'): HomeworkSession {
  const {creature:_creature,...base}=solvedSession({id,count:2})
  return {...base,decor:fixedDecor(),rewardSequence:1}
}
async function seed(page:Page,state:AppState){
  await page.addInitScript(({key,state})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state))},{key,state})
}
async function saved(page:Page):Promise<AppState>{return page.evaluate((key)=>JSON.parse(localStorage.getItem(key)!),key)}
async function answer(page:Page,value:number){
  for(const digit of String(value))await page.getByRole('button',{name:digit,exact:true}).click()
  await page.getByRole('button',{name:'✓',exact:true}).click()
}
async function startManual(page:Page,manual='115 + 9\n127 + 8'){
  await page.goto('/parent')
  await page.getByRole('button',{name:'Saisir mes calculs'}).click()
  await page.getByLabel('Les calculs, un par ligne').fill(manual)
  await page.getByRole('button',{name:'Commencer',exact:true}).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
}
async function visibleTargets(page:Page,session:HomeworkSession,placements:DecorPlacement[]=[],decors=[session.decor!]){
  const rect=await page.locator('.garden-camera').boundingBox(),view=await page.locator('.garden-v2').boundingBox()
  if(!rect||!view)throw new Error('Camera missing')
  const zoom=rect.width/worldSize.width
  return gardenTiles.filter((tile)=>canPlaceDecor(session.decor!,tile.x,tile.y,placements,decors)).map((tile)=>{
    const pos=isoPosition(tile.x,tile.y)
    return {tile,x:rect.x+pos.left*zoom,y:rect.y+pos.top*zoom}
  }).filter((item)=>item.x>view.x+50&&item.x<view.x+view.width-50&&item.y>view.y+90&&item.y<view.y+view.height-50)
}

test('surprise, one reveal per right answer, retry and reload preserve the recipe',async({page})=>{
  await startManual(page)
  const first=(await saved(page)).sessions[0]
  expect(first.creature).toBeUndefined()
  expect(first.decor?.stepCount).toBe(2)
  await expect(page.locator('main').filter({has:page.locator('.play-creature-panel')})).not.toContainText(decorName(first.decor!))
  await expect(page.getByRole('button',{name:'Infos sur la créature'})).toHaveCount(0)
  await answer(page,0)
  expect((await saved(page)).sessions[0].decor?.revealedSteps).toBe(0)
  await answer(page,124)
  await expect(page.locator('.exercise-prompt')).toHaveText('127 + 8')
  const partial=(await saved(page)).sessions[0]
  expect(partial.decor?.revealedSteps).toBe(1)
  expect(partial.exercises[0].attempts).toBe(2)
  await page.reload()
  await expect(page.locator('.exercise-prompt')).toHaveText('127 + 8')
  expect((await saved(page)).sessions[0].decor).toEqual(partial.decor)
  await answer(page,135)
  await expect(page.getByRole('heading',{name:decorName(first.decor!),exact:true})).toHaveCount(2)
  await page.getByRole('button',{name:'Installer dans le jardin'}).click()
  await expect(page.locator('.garden-v2')).toBeVisible()
  await page.waitForTimeout(1100)
  const final=(await saved(page)).sessions[0]
  expect(final.status).toBe('completed')
  expect(final.decor?.revealedSteps).toBe(2)
  expect(final.solvedAt).toBeTruthy()
})

test('tap to place, long press to move, invalid drop preserves the original, reload persists',async({page},info)=>{
  const session=decorSession()
  await seed(page,{sessions:[session],garden:{placements:[]}})
  await page.goto('/garden')
  await expect(page.locator('.placement-panel')).toBeVisible()
  const targets=await visibleTargets(page,session)
  expect(targets.length).toBeGreaterThan(2)
  const first=targets[0]
  await page.touchscreen.tap(first.x,first.y)
  await expect(page.locator('.garden-placed')).toHaveCount(1)
  await expect(page.locator('.placement-panel')).toHaveCount(0)
  expect((await saved(page)).garden.decorPlacements?.[0]).toMatchObject({x:first.tile.x,y:first.tile.y})
  await page.waitForTimeout(3000)
  expect((await saved(page)).garden.decorPlacements?.[0]).toMatchObject({x:first.tile.x,y:first.tile.y})
  const second=targets.find((item)=>Math.hypot(item.x-first.x,item.y-first.y)>80)!
  await page.mouse.move(first.x,first.y-20)
  await page.mouse.down()
  await page.waitForTimeout(600)
  await expect(page.locator('.garden-placed')).toHaveClass(/is-lifted/)
  await page.mouse.move(second.x,second.y,{steps:8})
  await page.mouse.up()
  await expect.poll(async()=> (await saved(page)).garden.decorPlacements?.[0].x).toBe(second.tile.x)
  await page.mouse.move(second.x,second.y-20);await page.mouse.down();await page.waitForTimeout(600)
  const rect=await page.locator('.garden-camera').boundingBox(), water=isoPosition(7,10)
  const zoom=rect!.width/worldSize.width
  await page.mouse.move(rect!.x+water.left*zoom,rect!.y+water.top*zoom);await page.mouse.up()
  expect((await saved(page)).garden.decorPlacements?.[0]).toEqual({decorId:session.decor!.id,x:second.tile.x,y:second.tile.y})
  await page.reload()
  await expect(page.locator('.garden-placed')).toHaveCount(1)
  await page.screenshot({path:info.outputPath('garden-mobile.png'),fullPage:true})
  await page.setViewportSize({width:1280,height:1000})
  await page.getByRole('button',{name:'Recentrer'}).click()
  await page.screenshot({path:info.outputPath('garden-desktop.png'),fullPage:true})
})

test('panning before the long press does not move a décor; cancellation loses nothing',async({page})=>{
  const session=decorSession(),placement={decorId:session.decor!.id,x:12,y:8}
  await seed(page,{sessions:[session],garden:{placements:[],decorPlacements:[placement]}})
  await page.goto('/garden')
  await expect(page.locator('.garden-placed')).toBeVisible()
  const target=(await visibleTargets(page,session)).find((item)=>item.tile.x===12&&item.tile.y===8)!
  await page.mouse.move(target.x,target.y-20);await page.mouse.down()
  await page.mouse.move(target.x+60,target.y+30,{steps:5});await page.waitForTimeout(550);await page.mouse.up()
  expect((await saved(page)).garden.decorPlacements?.[0]).toEqual(placement)
  await expect(page.locator('.placement-panel')).toHaveCount(0)
  const button=page.locator('.garden-placed')
  await button.focus();await page.keyboard.press('Enter')
  await page.getByRole('button',{name:'Déplacer',exact:true}).click()
  await page.locator('.garden-v2').dispatchEvent('pointercancel',{pointerId:1,clientX:0,clientY:0})
  expect((await saved(page)).garden.decorPlacements?.[0]).toEqual(placement)
})

test('keyboard placement and reserve allow reversible organisation',async({page})=>{
  const session=decorSession()
  await seed(page,{sessions:[session],garden:{placements:[]}})
  await page.goto('/garden')
  await expect(page.locator('.placement-panel')).toBeVisible()
  await page.locator('.garden-v2').focus()
  await page.keyboard.press('ArrowUp') // 12,8, free ground
  await page.keyboard.press('Enter')
  await expect(page.locator('.garden-placed')).toHaveCount(1)
  await page.locator('.garden-placed').focus();await page.keyboard.press('Enter')
  await page.getByRole('button',{name:'Ranger',exact:true}).click()
  await expect(page.locator('.garden-placed')).toHaveCount(0)
  await expect(page.locator('.reserve-item')).toHaveCount(1)
  expect((await saved(page)).sessions[0].decor).toEqual(session.decor)
})

test('legacy creature sessions can still finish and join the garden',async({page})=>{
  const session=solvedSession({id:'legacy',count:1})
  session.status='active';session.exercises[0].status='pending';session.exercises[0].attempts=0
  session.creature!.state='revealing';session.creature!.parts.forEach((part)=>{part.revealed=false})
  await seed(page,{sessions:[session],garden:{placements:[]}})
  await page.goto('/play/legacy')
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  await answer(page,session.exercises[0].expectedAnswer)
  await page.getByRole('button',{name:'Utiliser la baguette magique'}).click()
  await expect(page.locator('.garden-creature')).toHaveCount(1)
  await page.waitForTimeout(1000)
  expect((await saved(page)).sessions[0].creature?.state).toBe('alive_in_garden')
})

test('ten historical decor gifts no longer override a short session reward',async({page})=>{
  const history=Array.from({length:10},(_,i)=>({...decorSession(`reward-${i}`),rewardSequence:i+1}))
  await seed(page,{sessions:history,garden:{placements:[]}})
  await startManual(page,'115 + 9')
  const session=(await saved(page)).sessions[0]
  expect(session.decor).toBeDefined();expect(session.creature).toBeUndefined();expect(session.rewardSequence).toBe(11)
  await expect(page.locator('.play-creature-panel')).not.toContainText(session.decor!.catalogArt!.drawing.name)
  await answer(page,124)
  await expect(page.getByRole('button',{name:'Installer dans le jardin'})).toBeVisible()
})

test('historical AI preferences do not generate rewards at runtime and production rejects paid generation',async({page})=>{
  const calls:string[]=[]
  page.on('request',request=>{if(request.url().includes('/api/decor/generate'))calls.push(request.url())})
  await page.addInitScript(()=>localStorage.setItem('homework-garden-settings-v1',JSON.stringify({aiDecorGeneration:true,aiCreatureGeneration:false})))
  await startManual(page,'115 + 9')
  expect((await saved(page)).sessions[0].decor?.catalogArt).toBeDefined()
  expect(calls).toEqual([])
  const response=await page.request.post('/api/decor/generate',{data:{}})
  expect(response.status()).toBe(403)
})

test('forty answers persist progress and finish a legacy willow gift (not a visual-reveal guarantee)',async({page},info)=>{
  test.setTimeout(90000)
  const {creature:_creature,...base}=solvedSession({id:'forty',count:40})
  const decor=createDecor({variant:'willow',palette:'sage',seed:12},40)
  const session:HomeworkSession={...base,status:'active',decor,rewardSequence:1,currentExerciseIndex:0,exercises:base.exercises.map((exercise)=>({...exercise,status:'pending',attempts:0}))}
  await seed(page,{sessions:[session],garden:{placements:[]}})
  await page.goto('/play/forty')
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  for(let i=0;i<40;i++){
    await answer(page,session.exercises[i].expectedAnswer)
    const savedSession=(await saved(page)).sessions[0]
    expect(savedSession.decor?.revealedSteps).toBe(i+1)
    expect(savedSession.decor?.recipe).toEqual(decor.recipe)
  }
  await expect(page.getByRole('button',{name:'Installer dans le jardin'})).toBeVisible()
  expect(new Set((await saved(page)).sessions[0].exercises.map((exercise)=>exercise.revealedPartId)).size).toBe(40)
  await page.waitForTimeout(900)
  const svg=await page.locator('.creature-stage .decor-svg').boundingBox(),stage=await page.locator('.creature-stage').boundingBox()
  expect(svg!.y).toBeGreaterThanOrEqual(stage!.y-1)
  expect(svg!.y+svg!.height).toBeLessThanOrEqual(stage!.y+stage!.height+1)
  await page.screenshot({path:info.outputPath('gift-willow-complete.png'),fullPage:true})
})

test('offline gift placement and reload need no generation request',async({page,context})=>{
  const session=decorSession('offline-gift')
  await seed(page,{sessions:[session],garden:{placements:[]}})
  const calls:string[]=[]
  page.on('request',(request)=>{if(request.url().includes('/api/'))calls.push(request.url())})
  await page.goto('/')
  await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>undefined))
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true)
  await context.setOffline(true)
  await page.goto('/offline#/garden')
  await expect(page.locator('.placement-panel')).toBeVisible()
  const target=(await visibleTargets(page,session))[0]
  await page.touchscreen.tap(target.x,target.y)
  await expect(page.locator('.garden-placed')).toHaveCount(1)
  const before=await saved(page)
  await page.reload()
  await expect(page.locator('.garden-placed')).toHaveCount(1)
  expect((await saved(page)).garden.decorPlacements).toEqual(before.garden.decorPlacements)
  expect(calls).toEqual([])
})

test('a two-finger gesture cancels a lifted décor instead of depositing it',async({page,context})=>{
  const session=decorSession('touch-gift'),placement={decorId:session.decor!.id,x:12,y:8}
  await seed(page,{sessions:[session],garden:{placements:[],decorPlacements:[placement]}})
  await page.goto('/garden')
  await expect(page.locator('.garden-placed')).toBeVisible()
  const target=(await visibleTargets(page,session)).find((item)=>item.tile.x===12&&item.tile.y===8)!
  const cdp=await context.newCDPSession(page)
  const a={x:target.x,y:target.y-20,id:1},b={x:target.x+50,y:target.y+20,id:2}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]})
  await page.waitForTimeout(600)
  await expect(page.locator('.garden-placed')).toHaveClass(/is-lifted/)
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x-15},{...b,x:b.x+15}]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await expect(page.locator('.garden-placed')).not.toHaveClass(/is-lifted/)
  expect((await saved(page)).garden.decorPlacements).toEqual([placement])
  await cdp.detach()
})
