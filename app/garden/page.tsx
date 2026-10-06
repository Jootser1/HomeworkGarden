'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CreatureView } from '@/components/CreatureView'
import { gardenTiles, isoPosition, randomAllowedTile, tileAt } from '@/lib/garden/map'
import { loadAppState, resetAppState, saveAppState } from '@/lib/storage/app-state'
import type { AppState, Creature, Direction, GardenPlacement } from '@/lib/types'

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
  ].sort(() => Math.random() - .5)

  for (const [dx, dy] of deltas) {
    const target = tileAt(placement.x + dx, placement.y + dy)
    if (target && creature.movement.allowedTerrain.includes(target.terrain)) {
      return { ...placement, x: target.x, y: target.y, direction: directionFromDelta(dx, dy) }
    }
  }

  const fallback = randomAllowedTile(creature.movement.allowedTerrain)
  return { ...placement, x: fallback.x, y: fallback.y, direction: 'down' }
}

export default function GardenPage() {
  const [state, setState] = useState<AppState | null>(null)

  useEffect(() => {
    const loaded = loadAppState()
    const completedCreatures = loaded.sessions.map((session) => session.creature).filter((creature) => creature.state === 'alive_in_garden')
    let changed = false
    for (const creature of completedCreatures) {
      if (!loaded.garden.placements.some((placement) => placement.creatureId === creature.id)) {
        const tile = randomAllowedTile(creature.movement.allowedTerrain)
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

  return (
    <main className="stack">
      <section className="card panel spread">
        <h2>Jardin</h2>
        <div className="row">
          <Link className="btn btn-primary" href="/parent">Nouvelle session</Link>
          <button className="btn btn-danger" type="button" onClick={clearGarden}>Réinitialiser</button>
        </div>
      </section>

      <section className="garden-wrap card">
        <div className="iso-world">
          {gardenTiles.map((tile) => {
            const pos = isoPosition(tile.x, tile.y)
            return <div key={`${tile.x}-${tile.y}`} className={`iso-tile tile-${tile.terrain}`} style={{ left: pos.left, top: pos.top }} title={tile.terrain} />
          })}
          <span className="garden-deco" style={{ left: 378, top: 72 }}>🌳</span>
          <span className="garden-deco" style={{ left: 618, top: 126 }}>🍄</span>
          <span className="garden-deco" style={{ left: 500, top: 262 }}>🌼</span>
          <span className="garden-deco" style={{ left: 702, top: 286 }}>🌲</span>
          <span className="garden-deco" style={{ left: 356, top: 342 }}>🌸</span>

          {placements.map((placement) => {
            const creature = creaturesById.get(placement.creatureId)
            if (!creature) return null
            const pos = isoPosition(placement.x, placement.y)
            const transform = placement.direction === 'left' ? 'scaleX(-1)' : 'none'
            return (
              <div
                className="garden-creature"
                key={placement.creatureId}
                style={{ left: pos.left + 4, top: pos.top - 42, transform }}
                title={`${creature.name} · ${creature.movement.type}`}
              >
                <CreatureView creature={creature} compact alive />
              </div>
            )
          })}
        </div>
      </section>

      {placements.length === 0 ? (
        <section className="card panel stack">
          <h2>Aucune créature</h2>
          <Link className="btn btn-magic" href="/parent">Créer une session</Link>
        </section>
      ) : null}
    </main>
  )
}
