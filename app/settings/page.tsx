'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { defaultSettings, loadSettings, saveSettings } from '@/lib/storage/settings'

export default function SettingsPage() {
  const [ready, setReady] = useState(false)
  const [aiCreatureGeneration, setAiCreatureGeneration] = useState(defaultSettings.aiCreatureGeneration)

  useEffect(() => {
    const settings = loadSettings()
    setAiCreatureGeneration(settings.aiCreatureGeneration)
    setReady(true)
  }, [])

  const toggleAi = () => {
    const next = !aiCreatureGeneration
    setAiCreatureGeneration(next)
    saveSettings({ aiCreatureGeneration: next })
  }

  if (!ready) return null

  return (
    <main className="card panel stack settings-page">
      <h2>Réglages</h2>

      <section className="settings-row">
        <div>
          <h3>Créatures par IA</h3>
          <p>{aiCreatureGeneration ? 'Activé' : 'Désactivé'}</p>
        </div>
        <button className={`toggle ${aiCreatureGeneration ? 'toggle-on' : ''}`} type="button" onClick={toggleAi} aria-pressed={aiCreatureGeneration}>
          <span />
        </button>
      </section>

      <Link className="btn btn-primary" href="/">Retour</Link>
    </main>
  )
}
