'use client'

import { useEffect, useState } from 'react'

export function PwaManager() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    let disposed = false
    let registration: ServiceWorkerRegistration | undefined
    let installing: ServiceWorker | null = null
    let applyingUpdate = false

    const onStateChange = () => {
      if (installing?.state === 'installed' && navigator.serviceWorker.controller && !disposed) {
        setWaiting(registration?.waiting ?? null)
      }
    }
    const onUpdate = () => {
      installing = registration?.installing ?? null
      installing?.addEventListener('statechange', onStateChange)
    }
    const onControllerChange = () => {
      if (applyingUpdate) window.location.reload()
    }
    const applyUpdate = () => { applyingUpdate = true }
    const refresh = () => {
      if (navigator.onLine) void registration?.update().catch(() => {})
    }
    // Native document navigation avoids uncached App Router RSC requests offline.
    const offlineNavigation = (event: MouseEvent) => {
      if (navigator.onLine || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (target instanceof Element && target.closest('[data-offline-shell]')) return
      const anchor = target instanceof Element ? target.closest('a') : null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin) return
      event.preventDefault()
      event.stopPropagation()
      // Full document loads are deliberate: App Router RSC requests may not be cached.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/offline#${url.pathname}`)
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    window.addEventListener('pwa-apply-update', applyUpdate)
    window.addEventListener('online', refresh)
    document.addEventListener('click', offlineNavigation, true)
    void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((value) => {
        if (disposed) return
        registration = value
        setWaiting(value.waiting)
        value.addEventListener('updatefound', onUpdate)
      })
      .catch((error) => console.error('Service worker registration failed:', error))

    return () => {
      disposed = true
      registration?.removeEventListener('updatefound', onUpdate)
      installing?.removeEventListener('statechange', onStateChange)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      window.removeEventListener('pwa-apply-update', applyUpdate)
      window.removeEventListener('online', refresh)
      document.removeEventListener('click', offlineNavigation, true)
    }
  }, [])

  if (!waiting) return null

  return (
    <aside className="pwa-update" role="status">
      <span>Une nouvelle version est prête.</span>
      <button type="button" className="btn btn-primary" onClick={() => {
        window.dispatchEvent(new Event('pwa-apply-update'))
        waiting.postMessage({ type: 'SKIP_WAITING' })
      }}>Mettre à jour</button>
    </aside>
  )
}
