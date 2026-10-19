'use client'

import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)')
    const check = () => setInstalled(media.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    check()
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPromptEvent)
    }
    const onInstalled = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    media.addEventListener('change', check)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      media.removeEventListener('change', check)
    }
  }, [])

  if (installed) return null

  const install = async () => {
    if (!prompt) { setHelpOpen(!helpOpen); return }
    try {
      await prompt.prompt()
      const choice = await prompt.userChoice
      setPrompt(null)
      if (choice.outcome === 'accepted') setInstalled(true)
    } catch {
      setPrompt(null)
      setHelpOpen(true)
    }
  }

  return (
    <div className="pwa-install">
      <button className="btn btn-ghost" type="button" onClick={install} aria-expanded={!prompt ? helpOpen : undefined} aria-controls={!prompt ? 'install-help' : undefined}>Installer l’app</button>
      {helpOpen ? <p id="install-help" className="small">
        {isIOS
          ? 'Dans Safari : Partager → Sur l’écran d’accueil → Ajouter.'
          : 'Dans le menu de ton navigateur : Installer l’application ou Ajouter à l’écran d’accueil. Si cette option manque, ouvre l’app dans un navigateur compatible en HTTPS.'}
      </p> : null}
    </div>
  )
}
