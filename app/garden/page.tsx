'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CreatureView } from '@/components/CreatureView'
import { gardenTiles, isoPosition, randomAllowedTile, tileAt } from '@/lib/garden/map'
import { loadAppState, resetAppState, saveAppState } from '@/lib/storage/app-state'
import type { AppState, Creature, Direction, GardenPlacement, MovementType } from '@/lib/types'

const movementLabels: Record<MovementType, string> = {
  walking: 'marche doucement',
  hopping: 'sautille',
  flying: 'vole tranquillement',
  floating: 'flotte dans l’air',
  swimming: 'nage',
  amphibious: 'va sur la terre et dans l’eau',
}

function directionFromDelta(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}

function nextPlacement(placement: GardenPlacement, creature: Creature): GardenPlacement {
  const deltas = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
  ].sort(() => Math.random() - .5)

  for (const [dx, dy] of deltas) {
    const target = tileAt(placement.x + dx, placement.y + dy)
    if (target && creature.movement.allowedTerrain.includes(target.terrain)) {
      return { ...placement, x: target.x, y: target.y, direction: directionFromDelta(dx, dy) }
    }
  }

  const fallback = randomAllowedTile(creature.movement.allowedTerrain, creature.movement.preferredBiomes)
  return { ...placement, x: fallback.x, y: fallback.y, direction: 'down' }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const distance = (a: PointerPoint, b: PointerPoint) => Math.hypot(a.x - b.x, a.y - b.y)
const midpoint = (a: PointerPoint, b: PointerPoint) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

type PointerPoint = { x: number; y: number }
type Camera = { x: number; y: number; zoom: number }

type GestureState =
  | { type: 'none' }
  | { type: 'drag'; pointerId: number; startPoint: PointerPoint; startCamera: Camera }
  | { type: 'pinch'; startDistance: number; startCamera: Camera; contentPoint: PointerPoint }

export default function GardenPage() {
  const [state, setState] = useState<AppState | null>(null)
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 20, zoom: 1 })
  const pointersRef = useRef(new Map<number, PointerPoint>())
  const gestureRef = useRef<GestureState>({ type: 'none' })
  const movedRef = useRef(false)

  useEffect(() => {
    const mobile = window.innerWidth < 760
    setCamera({ x: mobile ? -220 : 0, y: mobile ? 14 : 20, zoom: mobile ? 0.72 : 1 })
  }, [])

  useEffect(() => {
    const loaded = loadAppState()
    const completedCreatures = loaded.sessions.map((session) => session.creature).filter((creature) => creature.state === 'alive_in_garden')
    let changed = false
    for (const creature of completedCreatures) {
      if (!loaded.garden.placements.some((placement) => placement.creatureId === creature.id)) {
        const tile = randomAllowedTile(creature.movement.allowedTerrain, creature.movement.preferredBiomes)
        loaded.garden.placements.push({ creatureId: creature.id, x: tile.x, y: tile.y, direction: 'down' })
        changed = true
      }
    }
    if (changed) saveAppState(loaded)
    setState(loaded)
  }, [])

  const creaturesById = useMemo(() => {
    const map = new Map<string, Creature>()
    state?.sessions.forEach((session) => {
      if (session.creature.state === 'alive_in_garden') map.set(session.creature.id, session.creature)
    })
    return map
  }, [state])

  useEffect(() => {
    if (!state) return
    const timer = window.setInterval(() => {
      setState((current) => {
        if (!current) return current
        const next: AppState = structuredClone(current)
        next.garden.placements = next.garden.placements.map((placement) => {
          const creature = creaturesById.get(placement.creatureId)
          return creature ? nextPlacement(placement, creature) : placement
        })
        saveAppState(next)
        return next
      })
    }, 2200)
    return () => window.clearInterval(timer)
  }, [state, creaturesById])

  const placements = state?.garden.placements.filter((placement) => creaturesById.has(placement.creatureId)) ?? []

  const clearGarden = () => {
    if (!window.confirm('Effacer toutes les sessions et créatures locales ?')) return
    resetAppState()
    setState(loadAppState())
  }

  const pointFromEvent = (event: React.PointerEvent<HTMLElement>): PointerPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const startGesture = (pointers: Map<number, PointerPoint>, currentCamera: Camera) => {
    movedRef.current = false
    if (pointers.size === 1) {
      const [pointerId, startPoint] = [...pointers.entries()][0]
      gestureRef.current = { type: 'drag', pointerId, startPoint, startCamera: currentCamera }
      return
    }
    if (pointers.size >= 2) {
      const [first, second] = [...pointers.values()]
      const mid = midpoint(first, second)
      gestureRef.current = {
        type: 'pinch',
        startDistance: distance(first, second),
        startCamera: currentCamera,
        contentPoint: {
          x: (mid.x - currentCamera.x) / currentCamera.zoom,
          y: (mid.y - currentCamera.y) / currentCamera.zoom,
        },
      }
      return
    }
    gestureRef.current = { type: 'none' }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointersRef.current.set(event.pointerId, pointFromEvent(event))
    startGesture(pointersRef.current, camera)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, pointFromEvent(event))
    const gesture = gestureRef.current

    if (gesture.type === 'drag' && pointersRef.current.size === 1) {
      const point = pointersRef.current.get(gesture.pointerId)
      if (!point) return
      const dx = point.x - gesture.startPoint.x
      const dy = point.y - gesture.startPoint.y
      if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true
      setCamera({ ...gesture.startCamera, x: gesture.startCamera.x + dx, y: gesture.startCamera.y + dy })
      return
    }

    if (gesture.type === 'pinch' && pointersRef.current.size >= 2) {
      const [first, second] = [...pointersRef.current.values()]
      const mid = midpoint(first, second)
      const nextZoom = clamp(gesture.startCamera.zoom * (distance(first, second) / gesture.startDistance), 0.45, 1.85)
      movedRef.current = true
      setCamera({
        zoom: nextZoom,
        x: mid.x - gesture.contentPoint.x * nextZoom,
        y: mid.y - gesture.contentPoint.y * nextZoom,
      })
    }
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    pointersRef.current.delete(event.pointerId)
    startGesture(pointersRef.current, camera)
  }

  const handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const nextZoom = clamp(camera.zoom * (event.deltaY > 0 ? 0.92 : 1.08), 0.45, 1.85)
    const contentPoint = { x: (point.x - camera.x) / camera.zoom, y: (point.y - camera.y) / camera.zoom }
    setCamera({ zoom: nextZoom, x: point.x - contentPoint.x * nextZoom, y: point.y - contentPoint.y * nextZoom })
  }

  const openCreature = (creature: Creature) => {
    if (movedRef.current) return
    setSelectedCreature(creature)
  }

  return (
    <main className="stack">
      <section className="card panel spread">
        <h2>Jardin</h2>
        <div className="row">
          <Link className="btn btn-primary" href="/parent">Nouvelle session</Link>
          <button className="btn btn-danger" type="button" onClick={clearGarden}>Réinitialiser</button>
        </div>
      </section>

      <section
        className="garden-wrap card"
        aria-label="Jardin, fais glisser pour te déplacer. Écarte deux doigts pour zoomer."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={handleWheel}
      >
        <div className="garden-camera" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
        <div className="iso-world">
          {gardenTiles.map((tile) => {
            const pos = isoPosition(tile.x, tile.y)
            return <div key={`${tile.x}-${tile.y}`} className={`iso-tile tile-${tile.terrain}`} style={{ left: pos.left, top: pos.top }} title={tile.terrain} />
          })}
          <span className="garden-deco" style={{ left: 430, top: 72 }}>🌳</span>
          <span className="garden-deco" style={{ left: 668, top: 126 }}>🍄</span>
          <span className="garden-deco" style={{ left: 548, top: 262 }}>🌼</span>
          <span className="garden-deco" style={{ left: 786, top: 286 }}>🌲</span>
          <span className="garden-deco" style={{ left: 356, top: 342 }}>🌸</span>
          <span className="garden-deco" style={{ left: 908, top: 188 }}>🪨</span>
          <span className="garden-deco" style={{ left: 244, top: 238 }}>🌿</span>
          <span className="garden-deco" style={{ left: 626, top: 430 }}>🪷</span>
          <span className="garden-deco" style={{ left: 858, top: 420 }}>✨</span>

          {placements.map((placement) => {
            const creature = creaturesById.get(placement.creatureId)
            if (!creature) return null
            const pos = isoPosition(placement.x, placement.y)
            return (
              <button
                className="garden-creature"
                key={placement.creatureId}
                style={{ left: pos.left + 4, top: pos.top - 42 }}
                title={`${creature.name} · ${creature.movement.type}`}
                type="button"
                onClick={() => openCreature(creature)}
              >
                <CreatureView creature={creature} compact alive direction={placement.direction} />
              </button>
            )
          })}
        </div>
        </div>
      </section>

      {placements.length === 0 ? (
        <section className="card panel stack">
          <h2>Aucune créature</h2>
          <Link className="btn btn-magic" href="/parent">Créer une session</Link>
        </section>
      ) : null}

      {selectedCreature ? (
        <div className="info-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="garden-creature-info" onClick={() => setSelectedCreature(null)}>
          <div className="info-modal card panel stack" onClick={(event) => event.stopPropagation()}>
            <div className="spread">
              <h2 id="garden-creature-info">{selectedCreature.name}</h2>
              <button className="info-close" type="button" aria-label="Fermer" onClick={() => setSelectedCreature(null)}>×</button>
            </div>
            <CreatureView creature={selectedCreature} alive direction="down" />
            <p>{selectedCreature.description}</p>
            <div className="info-fact">🚶 {movementLabels[selectedCreature.movement.type]}</div>
            <div className="info-fact">✨ {selectedCreature.personality}</div>
            <div className="info-fact">💎 {selectedCreature.rarity}</div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
