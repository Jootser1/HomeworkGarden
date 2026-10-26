'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CreatureView } from '@/components/CreatureView'
import { GardenVisitors } from '@/components/GardenVisitors'
import { GardenResidents } from '@/components/GardenResidents'
import { GardenVisitorInspector } from '@/components/GardenVisitorInspector'
import type { GardenVisitorDefinition } from '@/lib/creatures/garden-visitors'
import './visitors.css'
import { DecorView } from '@/components/DecorView'
import { GardenLandscape } from '@/components/GardenLandscape'
import { decorDefinitions, decorName } from '@/lib/garden/decor'
import { canPlaceDecor, footprint, isoPosition, randomAllowedTile, scenery, tileAt, tileFromPoint, worldSize } from '@/lib/garden/map'
import { loadAppState, placeDecor, saveAppState, storeDecor } from '@/lib/storage/app-state'
import type { AppState, Creature, Direction, GardenDecor } from '@/lib/types'

type Point = { x: number; y: number }
type Camera = Point & { zoom: number }
type Gesture = { type: 'pan'; start: Point; camera: Camera; decorId?: string; creatureId?: string } | { type: 'pinch'; distance: number; mid: Point; camera: Camera } | { type: 'decor' } | null
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max))
const midpoint = (a: Point, b: Point) => ({ x: (a.x+b.x)/2, y: (a.y+b.y)/2 })
const distance = (a: Point, b: Point) => Math.hypot(a.x-b.x, a.y-b.y)
function sceneryDecor(index: number): GardenDecor {
  const item = scenery[index]
  return { id: item.id, recipe: { variant: item.variant, palette: index % 3 ? 'sage' : 'gold', seed: index * 173 }, stepCount: 1, revealedSteps: 1 }
}

export default function GardenPage() {
  const [state, setState] = useState<AppState | null>(null)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: .8 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inspectedId, setInspectedId] = useState<string | null>(null)
  const [creatureInfo, setCreatureInfo] = useState<Creature | null>(null)
  const [localPreview, setLocalPreview] = useState(false)
  const [showVisitors, setShowVisitors] = useState(false)
  const [visitorsPaused, setVisitorsPaused] = useState(false)
  const [visitorDirection, setVisitorDirection] = useState<Direction | null>(null)
  const [visitorInfo, setVisitorInfo] = useState<GardenVisitorDefinition | null>(null)
  const [preview, setPreview] = useState<Point>({ x: 12, y: 9 })
  const [message, setMessage] = useState('Explore ton jardin. Maintiens un décor pour le déplacer.')
  const viewport = useRef<HTMLElement | null>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moved = useRef(false)
  const cancelHold = () => { if (holdTimer.current) clearTimeout(holdTimer.current); holdTimer.current = null }

  const centre = () => {
    const rect = viewport.current?.getBoundingClientRect()
    if (!rect) return
    const zoom = rect.width < 760 ? .65 : .9
    const target = isoPosition(12, 9)
    setCamera({ x: rect.width/2-target.left*zoom, y: rect.height*.5-target.top*zoom, zoom })
  }

  useEffect(() => {
    const loaded = loadAppState()
    // Local trial only. Visitors never enter the reward history or saved collection.
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
    setLocalPreview(local)
    if (local && new URLSearchParams(window.location.search).get('visitors') === '1') setShowVisitors(true)
    let changed = false
    for (const session of loaded.sessions) {
      const creature = session.creature
      if (!creature || creature.state !== 'alive_in_garden') continue
      const existing = loaded.garden.placements.find((item) => item.creatureId === creature.id)
      const tile = existing && tileAt(existing.x, existing.y)
      if (!tile || !creature.movement.allowedTerrain.includes(tile.terrain)) {
        const next = randomAllowedTile(creature.movement.allowedTerrain, creature.movement.preferredBiomes)
        if (existing) { existing.x = next.x; existing.y = next.y }
        else loaded.garden.placements.push({ creatureId: creature.id, x: next.x, y: next.y, direction: 'down' })
        changed = true
      }
    }
    if (changed) saveAppState(loaded)
    setState(loaded)
    const unplaced = loaded.sessions.find((session) => session.status === 'completed' && session.decor && !(loaded.garden.decorPlacements ?? []).some((item) => item.decorId === session.decor!.id))
    if (unplaced?.decor) {
      setSelectedId(unplaced.decor.id)
      setMessage('Touche le sol pour installer ton cadeau, ou garde-le pour plus tard.')
    }
    centre()
    const refresh = () => setState(loadAppState())
    window.addEventListener('homework-garden-state-change', refresh)
    window.addEventListener('storage', refresh)
    const observer = new ResizeObserver(() => centre())
    if (viewport.current) observer.observe(viewport.current)
    return () => { window.removeEventListener('homework-garden-state-change', refresh); window.removeEventListener('storage', refresh); observer.disconnect(); if (holdTimer.current) clearTimeout(holdTimer.current) }
  }, [])

  const decors = state?.sessions.flatMap((session) => session.status === 'completed' && session.decor ? [session.decor] : []) ?? []
  const placements = state?.garden.decorPlacements ?? []
  const selected = decors.find((decor) => decor.id === selectedId)
  const inspected = decors.find((decor) => decor.id === inspectedId)
  const valid = selected ? canPlaceDecor(selected, preview.x, preview.y, placements, decors) : false
  const reserve = decors.filter((decor) => !placements.some((item) => item.decorId === decor.id))
  const point = (event: React.PointerEvent<HTMLElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX-rect.left, y: event.clientY-rect.top }
  }
  const worldPoint = (p: Point) => ({ x: (p.x-camera.x)/camera.zoom, y: (p.y-camera.y)/camera.zoom })
  const previewAt = (p: Point) => {
    const world = worldPoint(p), tile = tileFromPoint(world.x, world.y)
    if (tile) setPreview({ x: tile.x, y: tile.y })
    return tile
  }
  const commit = (x: number, y: number) => {
    if (!selected) return
    if (placeDecor(selected.id, x, y)) {
      setSelectedId(null); setInspectedId(null)
      setMessage(`${decorName(selected)} a trouvé sa place. Maintiens-le pour le déplacer.`)
    } else setMessage('Essaie un peu plus loin : il faut un terrain adapté et assez de place.')
  }
  const beginPinch = () => {
    cancelHold()
    if (gesture.current?.type === 'decor') {
      setSelectedId(null)
      setMessage('Déplacement annulé. Ton décor reste à sa place.')
    }
    const [a,b] = [...pointers.current.values()]
    gesture.current = { type: 'pinch', distance: Math.max(1,distance(a,b)), mid: midpoint(a,b), camera }
    moved.current = true
  }
  const down = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const p = point(event)
    pointers.current.set(event.pointerId,p)
    if (pointers.current.size > 1) { beginPinch(); return }
    moved.current = false
    const target = event.target instanceof Element ? event.target.closest('[data-decor-id]') : null
    const decorId = target?.getAttribute('data-decor-id') ?? undefined
    const creatureTarget = event.target instanceof Element ? event.target.closest('[data-creature-id]') : null
    const creatureId = creatureTarget?.getAttribute('data-creature-id') ?? undefined
    gesture.current = { type: 'pan', start: p, camera, decorId, creatureId }
    if (selected) previewAt(p)
    if (decorId && !selected) {
      holdTimer.current = setTimeout(() => {
        gesture.current = { type: 'decor' }
        moved.current = true
        setSelectedId(decorId); setInspectedId(null)
        const old = placements.find((item) => item.decorId === decorId)
        if (old) setPreview({x:old.x,y:old.y})
        setMessage('Fais glisser le décor, puis relâche pour le poser.')
      }, 500)
    }
  }
  const move = (event: React.PointerEvent<HTMLElement>) => {
    const p = point(event)
    if (selected && !pointers.current.has(event.pointerId)) previewAt(p)
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId,p)
    const g = gesture.current
    if (g?.type === 'decor') { previewAt(p); return }
    if (g?.type === 'pinch' && pointers.current.size > 1) {
      const [a,b] = [...pointers.current.values()], mid = midpoint(a,b)
      const zoom = clamp(g.camera.zoom * distance(a,b)/g.distance,.4,1.8)
      setCamera({ zoom, x: mid.x-(g.mid.x-g.camera.x)/g.camera.zoom*zoom, y: mid.y-(g.mid.y-g.camera.y)/g.camera.zoom*zoom })
    } else if (g?.type === 'pan') {
      const dx = p.x-g.start.x, dy = p.y-g.start.y
      if (Math.hypot(dx,dy)>7) { moved.current = true; cancelHold() }
      if (moved.current) setCamera({ ...g.camera, x: g.camera.x+dx, y:g.camera.y+dy })
    }
  }
  const end = (event: React.PointerEvent<HTMLElement>, cancelled = false) => {
    cancelHold()
    const g = gesture.current, p = point(event)
    pointers.current.delete(event.pointerId)
    if (cancelled) { gesture.current = null; if(g?.type==='decor') setSelectedId(null); setMessage('Déplacement annulé. Ton décor reste à sa place.'); return }
    if (g?.type === 'pinch') {
      if (pointers.current.size === 1) { const remaining=[...pointers.current.values()][0]; gesture.current={type:'pan',start:remaining,camera}; moved.current=true }
      else gesture.current=null
      return
    }
    if (g?.type === 'decor') {
      const tile = previewAt(p)
      if (tile && selected && placeDecor(selected.id,tile.x,tile.y)) setMessage('Décor déplacé. Tu peux le reprendre à tout moment.')
      else setMessage('Cet endroit ne convient pas. Ton décor reste à sa place.')
      setSelectedId(null)
    } else if (g?.type === 'pan' && !moved.current) {
      if (selected) { const tile = previewAt(p); if(tile) commit(tile.x,tile.y); else setMessage('Choisis un endroit dans le jardin.') }
      else if (g.decorId) setInspectedId(g.decorId)
      else {
        const creature = g.creatureId ? state?.sessions.find((session) => session.creature?.id === g.creatureId)?.creature : undefined
        if(creature) setCreatureInfo(creature)
      }
    }
    gesture.current = null
  }
  const zoomBy = (factor: number) => {
    const rect = viewport.current?.getBoundingClientRect(); if(!rect) return
    const zoom=clamp(camera.zoom*factor,.4,1.8)
    setCamera({zoom,x:rect.width/2-(rect.width/2-camera.x)/camera.zoom*zoom,y:rect.height/2-(rect.height/2-camera.y)/camera.zoom*zoom})
  }

  return <main className="stack garden-page">
    <section className="card panel spread garden-heading"><div><span className="garden-eyebrow">Ton petit monde</span><h2>Le jardin</h2></div><Link className="btn btn-primary" href="/parent">Nouvelle session</Link></section>
    {localPreview && <section className="card panel stack visitor-panel" aria-label="Essai local des créatures">
      <div><span className="garden-eyebrow">Nouvelles rencontres · essai local</span><h3>Trois visiteurs dans ton jardin</h3></div>
      <p>{showVisitors ? 'Visiteurs temporaires : ta collection reste intacte. Touche-les pour les voir de près.' : 'Pompon fouisseur, Raie-pétale et Oiseau des aurores viennent se promener sans ajouter de cadeaux ni modifier ta collection.'}</p>
      <div className="row">
        <button className="btn btn-primary" type="button" aria-pressed={showVisitors} onClick={() => { setShowVisitors(!showVisitors); setVisitorInfo(null); centre() }}>{showVisitors ? 'Retirer les visiteurs' : 'Inviter les trois visiteurs'}</button>
        {showVisitors && <button className="btn btn-ghost" type="button" aria-label={visitorsPaused ? 'Reprendre la promenade' : 'Mettre les visiteurs en pause'} onClick={() => { setVisitorsPaused(!visitorsPaused); setVisitorDirection(null) }}>{visitorsPaused ? 'Reprendre' : 'Pause'}</button>}
      </div>
      {showVisitors && <div className="visitor-view-controls" aria-label="Observer les orientations"><span>Vues :</span>{([{ direction: 'down', label: 'Face' }, { direction: 'right', label: 'Droite' }, { direction: 'up', label: 'Dos' }, { direction: 'left', label: 'Gauche' }] as const).map(view => <button key={view.direction} type="button" className="btn btn-ghost" aria-pressed={visitorDirection === view.direction} onClick={() => { setVisitorsPaused(true); setVisitorDirection(view.direction) }}>{view.label}</button>)}</div>}
    </section>}
    <section ref={viewport} className="garden-wrap card garden-v2" aria-label="Jardin, fais glisser pour explorer. Maintiens un décor pour le déplacer." tabIndex={0}
      onPointerDown={down} onPointerMove={move} onPointerUp={(event)=>end(event)} onPointerCancel={(event)=>end(event,true)} onContextMenu={(event)=>event.preventDefault()}
      onKeyDown={(event)=>{
        if(event.target !== event.currentTarget) return
        const delta: Record<string,Point>={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}}
        if(event.key==='Escape'){setSelectedId(null);setMessage('Placement annulé. Le cadeau est conservé.');return}
        if(selected && event.key==='Enter'){event.preventDefault();commit(preview.x,preview.y);return}
        if(delta[event.key]){event.preventDefault();const d=delta[event.key];if(selected)setPreview({x:clamp(preview.x+d.x,0,21),y:clamp(preview.y+d.y,0,17)});else setCamera({...camera,x:camera.x-d.x*50,y:camera.y-d.y*50})}
      }}
      onWheel={(event)=>{ if(event.ctrlKey){event.preventDefault();zoomBy(event.deltaY>0?.92:1.08)}else setCamera({...camera,x:camera.x-event.deltaX,y:camera.y-event.deltaY}) }}>
      <div className="garden-camera" style={{ width:worldSize.width,height:worldSize.height,transform:`translate(${camera.x}px,${camera.y}px) scale(${camera.zoom})` }}>
        <div className="iso-world garden-world" style={{width:worldSize.width,height:worldSize.height}}>
          <GardenLandscape/>
          {scenery.map((item,index)=>{const pos=isoPosition(item.x,item.y);return <div key={item.id} className="garden-object garden-scenery" style={{left:pos.left,top:pos.top,zIndex:Math.round(pos.top),scale:item.scale}}><DecorView decor={sceneryDecor(index)} complete/></div>})}
          {placements.map((placement)=>{const decor=decors.find((item)=>item.id===placement.decorId);if(!decor)return null;const pos=isoPosition(placement.x,placement.y);return <button key={decor.id} data-decor-id={decor.id} className={`garden-object garden-placed ${selectedId===decor.id?'is-lifted':''}`} style={{left:pos.left,top:pos.top,zIndex:Math.round(pos.top)}} aria-label={`${decorName(decor)}, maintenir pour déplacer`} onClick={(event)=>{if(event.detail===0)setInspectedId(decor.id)}}><DecorView decor={decor} complete/></button>})}
          {state && <GardenResidents state={state} onInspect={setCreatureInfo}/>}
          {showVisitors && <GardenVisitors paused={visitorsPaused} direction={visitorDirection} onInspect={setVisitorInfo}/>}
          {selected && <><svg className="garden-footprint" width={worldSize.width} height={worldSize.height} aria-hidden="true">{footprint(preview.x,preview.y,decorDefinitions[selected.recipe.variant].width,decorDefinitions[selected.recipe.variant].height).map((cell)=>{const pos=isoPosition(cell.x,cell.y);return <path key={`${cell.x}:${cell.y}`} d={`M${pos.left} ${pos.top-20}l38 20-38 20-38-20Z`} fill={valid?'#e8edc0':'#e6c2ac'} stroke={valid?'#648454':'#a4745e'} strokeWidth="2" strokeDasharray="5 5"/>})}</svg><div className="garden-object garden-preview" style={{left:isoPosition(preview.x,preview.y).left,top:isoPosition(preview.x,preview.y).top,zIndex:1100}}><DecorView decor={selected} complete/></div></>}
        </div>
      </div>
    </section>
    <div className="garden-toolbar"><div className="row"><button className="btn btn-ghost" onClick={()=>zoomBy(1/1.2)} aria-label="Dézoomer">−</button><button className="btn btn-ghost" onClick={centre}>Recentrer</button><button className="btn btn-ghost" onClick={()=>zoomBy(1.2)} aria-label="Zoomer">+</button></div><p role="status" aria-live="polite">{message}</p></div>
    {selected && <section className="card panel stack placement-panel"><h3>{decorName(selected)}</h3><p>Touche une place libre. Au clavier : flèches puis Entrée dans le jardin.</p><div className="row"><button className="btn btn-primary" disabled={!valid} onClick={()=>commit(preview.x,preview.y)}>Poser ici</button><button className="btn btn-ghost" onClick={()=>{setSelectedId(null);setMessage('Ton cadeau est conservé. Tu pourras le placer plus tard.')}}>Plus tard / Annuler</button></div></section>}
    <section className="card panel stack garden-reserve"><div><span className="garden-eyebrow">Les cadeaux à installer</span><h3>Ta réserve</h3></div>{reserve.length ? <div className="reserve-items">{reserve.map((decor)=><button className="reserve-item" key={decor.id} onClick={()=>{setSelectedId(decor.id);setInspectedId(null);setMessage('Touche le sol pour installer ton cadeau.');viewport.current?.focus()}}><DecorView decor={decor} complete/><span>{decorName(decor)}</span></button>)}</div> : <p>Chaque session fait grandir ton jardin. Les cadeaux non placés restent ici.</p>}</section>
    {inspected && <section className="card panel stack" aria-label="Actions du décor"><h3>{decorName(inspected)}</h3><div className="row"><button className="btn btn-primary" onClick={()=>{setSelectedId(inspected.id);const old=placements.find((item)=>item.decorId===inspected.id);if(old)setPreview(old);setInspectedId(null);viewport.current?.focus()}}>Déplacer</button><button className="btn btn-ghost" onClick={()=>{storeDecor(inspected.id);setInspectedId(null);setMessage('Décor rangé dans la réserve.')}}>Ranger</button><button className="btn btn-ghost" onClick={()=>setInspectedId(null)}>Fermer</button></div></section>}
    {visitorInfo && <GardenVisitorInspector visitor={visitorInfo} onClose={() => setVisitorInfo(null)}/>}
    {creatureInfo && <div className="info-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="garden-creature-info" onClick={()=>setCreatureInfo(null)}><div className="info-modal card panel stack" onClick={(event)=>event.stopPropagation()}><div className="spread"><h2 id="garden-creature-info">{creatureInfo.name}</h2><button className="info-close" aria-label="Fermer" onClick={()=>setCreatureInfo(null)}>×</button></div><CreatureView creature={creatureInfo} alive/><p>{creatureInfo.description}</p><p>{creatureInfo.personality}</p></div></div>}
  </main>
}
