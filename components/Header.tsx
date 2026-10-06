'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { loadAppState } from '@/lib/storage/app-state'

function findActiveSessionId() {
  const state = loadAppState()
  const active = state.sessions.find((session) => session.status === 'active')
  return active?.id ?? null
}

export function Header() {
  const pathname = usePathname()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => setActiveSessionId(findActiveSessionId())
    refresh()
    window.addEventListener('homework-garden-state-change', refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('homework-garden-state-change', refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="Accueil Le Jardin des Devoirs">
        <span className="logo-mark">🌱</span>
        <span>Le Jardin des Devoirs</span>
      </Link>
      <nav className="nav-links" aria-label="Navigation principale">
        {activeSessionId && !pathname.startsWith('/play') ? (
          <Link className="nav-link" href={`/play/${activeSessionId}`}>Calcul</Link>
        ) : (
          <Link className="nav-link" href="/garden">Jardin</Link>
        )}
      </nav>
    </header>
  )
}
