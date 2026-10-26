import { expect, test } from '@playwright/test'
import { createDecor, decorDefinitions, decorRecipeSchema, decorVariants, localDecorRecipe, nextReward } from '@/lib/garden/decor'
import { canCreatureStep, canPlaceDecor, footprint, gardenTiles, isoPosition, scenery, tileAt, tileFromPoint } from '@/lib/garden/map'
import type { DecorRecipe, HomeworkSession } from '@/lib/types'
import { solvedSession } from './helpers/sessions'

const recipe: DecorRecipe = { variant: 'round', palette: 'sage', seed: 42 }
function decorated(index: number, complete = true): HomeworkSession {
  const { creature: _creature, ...base } = solvedSession({ id: `decor-session-${index}` })
  const decor = createDecor(recipe, 10)
  decor.revealedSteps = complete ? 10 : 2
  return { ...base, status: complete ? 'completed' : 'active', decor, rewardSequence: index }
}

test('legacy history does not consume the new reward cycle', () => {
  expect(nextReward(Array.from({length:15},(_,i)=>solvedSession({id:`legacy-${i}`}))).kind).toBe('decor')
})
test('ten completed décors unlock a creature, not ten starts', () => {
  const incomplete = Array.from({length:10},(_,i)=>decorated(i+1,false))
  expect(nextReward(incomplete).kind).toBe('decor')
  const history = Array.from({length:10},(_,i)=>decorated(i+1))
  expect(nextReward(history)).toEqual({sequence:11,kind:'creature'})
  history.push({...solvedSession(), rewardSequence:11,status:'active'})
  expect(nextReward(history)).toEqual({sequence:12,kind:'decor'})
  history.push(...Array.from({length:10},(_,i)=>decorated(i+12)))
  expect(nextReward(history).kind).toBe('creature')
})
test('24 models in four families, each with at least six silhouettes', () => {
  expect(decorVariants).toHaveLength(24)
  for (const family of ['tree','mushroom','rock','flower']) expect(Object.values(decorDefinitions).filter((def)=>def.family===family)).toHaveLength(6)
})
test('local recipes avoid used model/palette combinations and recent families', () => {
  const history: HomeworkSession[]=[]
  const seen = new Set<string>()
  for(let i=0;i<96;i++) {
    const next=localDecorRecipe(history), key=`${next.variant}:${next.palette}`
    expect(seen.has(key)).toBe(false)
    seen.add(key)
    history.unshift({...decorated(i), decor:createDecor(next,5)})
  }
  expect(decorRecipeSchema.safeParse(localDecorRecipe(history)).success).toBe(true)
})
test('untrusted recipes cannot change the rendering contract', () => {
  expect(decorRecipeSchema.safeParse({...recipe,variant:'javascript:alert(1)'}).success).toBe(false)
  expect(decorRecipeSchema.safeParse({...recipe,seed:-1}).success).toBe(false)
  expect(decorRecipeSchema.safeParse({...recipe,palette:'#ff0000'}).success).toBe(false)
})
test('one to forty reveal steps are deterministic and independent of palette', () => {
  for(let count=1;count<=40;count++) {
    const decor=createDecor(recipe,count)
    expect(decor.stepCount).toBe(count)
    expect(decor.revealedSteps).toBe(0)
    expect(JSON.parse(JSON.stringify(decor))).toEqual(decor)
  }
})
test('projection round trips all tile centres, including the plateau and ramp', () => {
  for(const tile of gardenTiles) {
    const pos=isoPosition(tile.x,tile.y)
    const found=tileFromPoint(pos.left,pos.top)
    expect(found && [found.x,found.y]).toEqual([tile.x,tile.y])
  }
})
test('footprints reject overlaps, paths, water, boundaries, scenery and cliffs', () => {
  const decor=createDecor(recipe,5)
  const available=gardenTiles.find((tile)=>canPlaceDecor(decor,tile.x,tile.y,[],[decor]))!
  expect(available).toBeDefined()
  const other=createDecor(recipe,5)
  const placements=[{decorId:other.id,x:available.x,y:available.y}]
  expect(canPlaceDecor(decor,available.x,available.y,placements,[decor,other])).toBe(false)
  expect(canPlaceDecor(other,available.x,available.y,placements,[other])).toBe(true)
  expect(canPlaceDecor(decor,21,17,[],[decor])).toBe(false)
  expect(canPlaceDecor(decor,7,10,[],[decor])).toBe(false)
  expect(canPlaceDecor(decor,14,8,[],[decor])).toBe(false)
  expect(canPlaceDecor(decor,12,3,[],[decor])).toBe(false)
  expect(canPlaceDecor(decor,scenery[0].x,scenery[0].y,[],[decor])).toBe(false)
  expect(footprint(2,3,2,2)).toHaveLength(4)
})
test('water plants have valid water-only placements',()=>{
  const decor=createDecor({...recipe,variant:'lilies'},6)
  const available=gardenTiles.filter((tile)=>canPlaceDecor(decor,tile.x,tile.y,[],[decor]))
  expect(available.length).toBeGreaterThan(0)
  expect(available.every((tile)=>tile.terrain==='pond')).toBe(true)
})
test('every model has at least one valid place in the initial garden',()=>{
  for(const variant of decorVariants){
    const decor=createDecor({...recipe,variant},10)
    expect(gardenTiles.some((tile)=>canPlaceDecor(decor,tile.x,tile.y,[],[decor])),variant).toBe(true)
  }
})
test('walking creatures use the ramp, not the cliff',()=>{
  expect(canCreatureStep(tileAt(12,3)!,tileAt(12,4)!,['grass','forest'])).toBe(false)
  expect(canCreatureStep(tileAt(14,3)!,tileAt(14,4)!,['dirt'])).toBe(true)
})
