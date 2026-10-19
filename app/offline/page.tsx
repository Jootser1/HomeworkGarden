'use client'

import { useEffect, useState } from 'react'
import ParentClient from '@/app/parent/ParentClient'
import GardenPage from '@/app/garden/page'
import SettingsPage from '@/app/settings/page'
import { PlaySession } from '@/components/PlaySession'
import { loadAppState } from '@/lib/storage/app-state'

// This whole shell and its chunks are precached. A new locally-created session
// therefore works offline even when its /play/<id> URL has never been visited.
export default function OfflinePage() {
  const [path, setPath] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => {
      setPath(window.location.hash.slice(1) || (window.location.pathname === '/offline' ? '/' : window.location.pathname))
      setActiveId(loadAppState().sessions.find((session) => session.status === 'active')?.id ?? null)
    }
    refresh()
    window.addEventListener('hashchange', refresh)
    window.addEventListener('homework-garden-state-change', refresh)
    return () => {
      window.removeEventListener('hashchange', refresh)
      window.removeEventListener('homework-garden-state-change', refresh)
    }
  }, [])

  const navigate = (nextPath: string) => {
    window.location.hash = nextPath
    setPath(nextPath)
  }

  if (!path) return <p role="status">Ouverture du jardin…</p>

  let content
  if (path === '/parent') content = <ParentClient offline onStart={(id) => navigate(`/play/${id}`)} />
  else if (path === '/garden') content = <GardenPage />
  else if (path === '/settings') content = <SettingsPage />
  else if (/^\/play\/[^/]+$/.test(path)) content = <PlaySession key={path} sessionId={path.split('/')[2]} onGarden={() => navigate('/garden')} />
  else content = (
    <section className="card panel stack">
      <h2>Le jardin, même hors ligne</h2>
      <div className="row">
        <button className="btn btn-primary" onClick={() => navigate('/parent')}>Créer une session</button>
        {activeId ? <button className="btn btn-ghost" onClick={() => navigate(`/play/${activeId}`)}>Reprendre le calcul</button> : null}
        <button className="btn btn-ghost" onClick={() => navigate('/garden')}>Jardin</button>
      </div>
    </section>
  )

  return (
    <div data-offline-shell onClickCapture={(event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null
      if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === '_blank') return
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin) return
      event.preventDefault()
      event.stopPropagation()
      navigate(url.pathname)
    }}>
      {path === '/' ? <p className="badge">🌱 Mode local</p> : null}
      {content}
    </div>
  )
}
