'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { defaultSettings, loadSettings, saveSettings } from '@/lib/storage/settings'

export default function SettingsPage() {
  const [ready, setReady] = useState(false)
  const [aiCreatureGeneration, setAiCreatureGeneration] = useState(defaultSettings.aiCreatureGeneration)
  const [aiDecorGeneration, setAiDecorGeneration] = useState(defaultSettings.aiDecorGeneration)

  useEffect(() => {
    const settings = loadSettings()
    setAiCreatureGeneration(settings.aiCreatureGeneration)
    setAiDecorGeneration(settings.aiDecorGeneration)
    setReady(true)
  }, [])

  const toggleAi = () => {
    const next = !aiCreatureGeneration
    setAiCreatureGeneration(next)
    saveSettings({ ...loadSettings(), aiCreatureGeneration: next })
  }

  if (!ready) return null

  return (
    <main className="card panel stack settings-page">
      <h2>Réglages</h2>
      <p>Les nouvelles sessions utilisent uniquement les compositions déjà dessinées du catalogue local, sans génération payante. Les préférences IA historiques ci-dessous sont conservées, mais inactives dans ce parcours.</p>

      <section className="settings-row">
        <div>
          <h3>Créatures par IA</h3>
          <p>{aiCreatureGeneration ? 'Activé' : 'Désactivé'}</p>
        </div>
        <button className={`toggle ${aiCreatureGeneration ? 'toggle-on' : ''}`} type="button" disabled aria-label="Créatures par IA — ancienne préférence inactive" onClick={toggleAi} aria-pressed={aiCreatureGeneration}>
          <span />
        </button>
      </section>

      <section className="settings-row">
        <div><h3>Décors composés par IA</h3><p>{aiDecorGeneration ? 'Activé, avec repli local' : 'Désactivé : catalogue local'}</p><p className="small">Ancienne option expérimentale, non utilisée pour attribuer les nouveaux cadeaux.</p></div>
        <button className={`toggle ${aiDecorGeneration ? 'toggle-on' : ''}`} type="button" disabled aria-label="Décors composés par IA — ancienne préférence inactive" aria-pressed={aiDecorGeneration} onClick={() => { const next = !aiDecorGeneration; setAiDecorGeneration(next); saveSettings({ ...loadSettings(), aiDecorGeneration: next }) }}><span /></button>
      </section>
      <Link className="btn btn-primary" href="/">Retour</Link>
    </main>
  )
}
