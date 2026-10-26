'use client'

import { useEffect, useRef } from 'react'
import { GardenVisitorView } from '@/components/GardenVisitorView'
import type { GardenVisitorDefinition } from '@/lib/creatures/garden-visitors'
import type { Direction } from '@/lib/types'

const views: { direction: Direction; label: string }[] = [
  { direction: 'down', label: 'De face' }, { direction: 'right', label: 'Profil droit' },
  { direction: 'up', label: 'De dos' }, { direction: 'left', label: 'Profil gauche' },
]
export function GardenVisitorInspector({ visitor, onClose }: { visitor: GardenVisitorDefinition; onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    return () => { element.close(); previousFocus?.focus() }
  }, [])
  return <dialog ref={dialog} className="visitor-dialog card panel" aria-labelledby="visitor-name" onCancel={onClose} onClose={onClose}>
    <div className="spread"><div><span className="garden-eyebrow">Visiteur temporaire · essai local</span><h2 id="visitor-name">{visitor.name}</h2></div><button type="button" className="info-close" aria-label="Fermer les vues" onClick={onClose}>×</button></div>
    <p>{visitor.description}</p>
    <div className="visitor-views">{views.map(view => <figure key={view.direction}><GardenVisitorView id={visitor.id} direction={view.direction} paused label={visitor.name}/><figcaption>{view.label}</figcaption></figure>)}</div>
    <p className="small">Ces visiteurs ne sont pas des cadeaux gagnés : ils ne modifient ni ta collection, ni tes sessions. Les vues et animations sont une première adaptation des dessins validés.</p>
    <button type="button" className="btn btn-primary" onClick={onClose}>Retour au jardin</button>
  </dialog>
}
