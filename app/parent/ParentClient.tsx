'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdditionGenerationOptions, Creature, Exercise, ExerciseDifficulty, HomeworkSession } from '@/lib/types'
import { createLocalCatalogCreature } from '@/lib/creatures/factory'
import { defaultAdditionOptions, generateAdditionCrossingTen, parseManualAdditions } from '@/lib/exercises/additions'
import { recommendAdditionSession, type SessionRecommendation } from '@/lib/exercises/adaptive-session'
import { loadAppState, upsertSession } from '@/lib/storage/app-state'
import { loadSettings } from '@/lib/storage/settings'

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
const recommendationMessages: Record<SessionRecommendation['reason'], string> = {
  first: 'Un premier niveau pour commencer en douceur.',
  steady: 'Un niveau proche de la dernière session.',
  support: 'Des calculs plus accessibles pour consolider.',
  advance: 'Un cran de plus, après plusieurs sessions faciles.',
  custom: 'Les réglages de la dernière session sont conservés.',
}

type CreationState = 'idle' | 'invalid' | 'generating' | 'success' | 'fallback'
type CreationFeedback = { state: CreationState; title: string; detail: string }

function normalizeOptions(options: AdditionGenerationOptions): AdditionGenerationOptions {
  const defaults = defaultAdditionOptions(options.difficulty)
  const integer = (key: 'minBase' | 'maxBase' | 'addendMin' | 'addendMax') => Number.isFinite(options[key]) ? Math.floor(options[key]) : defaults[key]
  const minBase = Math.max(0, Math.min(integer('minBase'), integer('maxBase')))
  const maxBase = Math.max(minBase, integer('minBase'), integer('maxBase'))
  const addendMin = Math.max(1, Math.min(99, integer('addendMin'), integer('addendMax')))
  return {
    difficulty: options.difficulty,
    count: Math.max(1, Math.min(40, Math.floor(options.count) || 1)),
    minBase,
    maxBase,
    addendMin,
    addendMax: Math.max(addendMin, Math.min(99, Math.max(integer('addendMin'), integer('addendMax')))),
  }
}

async function generateCreature(exerciseCount: number, difficulty: ExerciseDifficulty): Promise<{ creature: Creature; source: string }> {
  const response = await fetch('/api/creatures/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ exerciseCount, exerciseKind: 'addition_crossing_ten', difficulty }),
  })
  if (!response.ok) throw new Error('Generation failed')
  return response.json()
}

function CreatureCreationOverlay({ feedback }: { feedback: CreationFeedback }) {
  if (feedback.state === 'idle') return null
  const icon = feedback.state === 'invalid' ? '🌧️' : feedback.state === 'success' ? '✨' : feedback.state === 'fallback' ? '🌱' : '🪄'
  return (
    <div className="creation-overlay" role="status" aria-live="polite">
      <div className={`creation-modal creation-${feedback.state}`}>
        <div className="creation-orbit" aria-hidden="true">
          <span className="creation-dot dot-a" />
          <span className="creation-dot dot-b" />
          <span className="creation-dot dot-c" />
          <div className="creation-seed">{icon}</div>
        </div>
        <div className="stack" style={{ textAlign: 'center' }}>
          <h2>{feedback.title}</h2>
          <p>{feedback.detail}</p>
          {feedback.state === 'generating' ? <div className="magic-loading"><span /></div> : null}
        </div>
      </div>
    </div>
  )
}

export default function ParentPage({ offline = false, onStart }: { offline?: boolean; onStart?: (sessionId: string) => void }) {
  const router = useRouter()
  const [options, setOptions] = useState(defaultAdditionOptions('medium'))
  const [countText, setCountText] = useState('10')
  const [recommendation, setRecommendation] = useState<SessionRecommendation>(() => recommendAdditionSession([]))
  const [personalized, setPersonalized] = useState(false)
  const [manual, setManual] = useState('')
  const [mode, setMode] = useState<'generate' | 'manual'>('generate')
  const [preview, setPreview] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [creationFeedback, setCreationFeedback] = useState<CreationFeedback>({ state: 'idle', title: '', detail: '' })
  const [clientReady, setClientReady] = useState(false)
  const [aiCreatureGeneration, setAiCreatureGeneration] = useState(false)

  useEffect(() => {
    const suggested = recommendAdditionSession(loadAppState().sessions)
    setRecommendation(suggested)
    setOptions(suggested.options)
    setCountText(String(suggested.options.count))
    setPreview(generateAdditionCrossingTen(suggested.options))
    setAiCreatureGeneration(loadSettings().aiCreatureGeneration)
    setClientReady(true)
  }, [])

  const parsedManual = useMemo(() => parseManualAdditions(manual), [manual])
  const selectedExercises = mode === 'manual' ? parsedManual : preview
  const validCount = countText.trim() !== '' && Number.isInteger(Number(countText)) && Number(countText) >= 1 && Number(countText) <= 40

  const applyOptions = (next: AdditionGenerationOptions) => {
    const safe = normalizeOptions(next)
    setOptions(safe)
    setPreview(generateAdditionCrossingTen(safe))
    setMessage(null)
  }

  const changeCount = (value: string) => {
    setCountText(value)
    const count = Number(value)
    if (value.trim() && Number.isInteger(count) && count >= 1 && count <= 40) applyOptions({ ...options, count })
  }

  const updateDifficulty = (difficulty: ExerciseDifficulty) => {
    applyOptions({ ...defaultAdditionOptions(difficulty), count: options.count })
    setPersonalized(true)
  }

  const updateOption = (key: 'minBase' | 'maxBase' | 'addendMin' | 'addendMax', value: number) => {
    applyOptions({ ...options, [key]: value })
    setPersonalized(true)
  }

  const startSession = async () => {
    if (loading || (mode === 'generate' && !validCount)) return
    if (selectedExercises.length === 0) {
      setCreationFeedback({ state: 'invalid', title: 'Ajoute une addition', detail: 'La créature a besoin d’au moins un calcul.' })
      await wait(1400)
      setCreationFeedback({ state: 'idle', title: '', detail: '' })
      return
    }

    setLoading(true)
    setCreationFeedback({ state: 'generating', title: 'Création...', detail: `${selectedExercises.length} addition${selectedExercises.length > 1 ? 's' : ''} pour une créature.` })
    try {
      let creature: Creature
      let usedFallback = false
      if (offline || !navigator.onLine || !aiCreatureGeneration) {
        creature = createLocalCatalogCreature(selectedExercises.length)
      } else {
        try {
          const generated = await generateCreature(selectedExercises.length, options.difficulty)
          creature = generated.creature
          usedFallback = generated.source === 'fallback'
        } catch {
          creature = createLocalCatalogCreature(selectedExercises.length)
          usedFallback = true
        }
      }
      setCreationFeedback({ state: usedFallback ? 'fallback' : 'success', title: usedFallback ? 'Créature créée' : `${creature.name} apparaît !`, detail: 'C’est parti.' })
      const session: HomeworkSession = {
        id: uid('session'),
        createdAt: new Date().toISOString(),
        status: 'active',
        title: 'Additions avec passage de dizaine',
        exerciseKind: 'addition_crossing_ten',
        generationOptions: mode === 'generate' ? { ...options } : undefined,
        exercises: selectedExercises.map((exercise, index) => ({ ...exercise, id: uid(`exercise_${index + 1}`), status: 'pending', attempts: 0, childAnswer: undefined, revealedPartId: undefined })),
        creature,
        currentExerciseIndex: 0,
      }
      upsertSession(session)
      await wait(950)
      if (onStart) onStart(session.id)
      // Use the precached document shell, not an uncached App Router RSC request.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      else if (!navigator.onLine) window.location.assign(`/offline#/play/${session.id}`)
      else router.push(`/play/${session.id}`)
    } finally {
      setLoading(false)
    }
  }

  if (!clientReady) return null

  return (
    <>
      <CreatureCreationOverlay feedback={creationFeedback} />
      <main className="session-setup">
        <section className="card panel stack">
          <div className="session-heading">
            <span aria-hidden="true" className="session-mark">🌱</span>
            <div className="stack">
              <h2>Créer une session</h2>
              <p className="session-recommendation" aria-live="polite">
                {mode === 'manual' ? 'Les devoirs du jour, à ton rythme.' : personalized ? 'Tes réglages personnalisés sont utilisés.' : recommendationMessages[recommendation.reason]}
              </p>
            </div>
          </div>

          {mode === 'generate' ? (
            <label className="form-row session-count">
              <span className="label">Nombre de calculs</span>
              <input className="input" type="number" inputMode="numeric" min={1} max={40} step={1} value={countText}
                aria-invalid={!validCount} aria-describedby={!validCount ? 'count-error' : undefined}
                onChange={(event) => changeCount(event.target.value)} />
              {!validCount ? <span id="count-error" className="small" role="status">Choisis entre 1 et 40 calculs.</span> : null}
            </label>
          ) : (
            <label className="form-row">
              <span className="label">Les calculs, un par ligne</span>
              <textarea className="textarea" value={manual} onChange={(event) => setManual(event.target.value)} placeholder={'115 + 9\n127 + 8\n136 + 7'} />
            </label>
          )}

          {message ? <p className="badge" role="status">{message}</p> : null}
          <button className="btn btn-magic session-start" type="button" disabled={loading || (mode === 'generate' && !validCount)} onClick={startSession}>
            {loading ? 'Préparation magique...' : 'Commencer'}
          </button>
          <button className="btn btn-ghost session-mode" type="button" disabled={loading} onClick={() => { setMode(mode === 'generate' ? 'manual' : 'generate'); setMessage(null) }}>
            {mode === 'generate' ? 'Saisir mes calculs' : 'Revenir aux calculs proposés'}
          </button>

          {mode === 'generate' ? (
            <details className="session-details">
              <summary>Réglages personnalisés</summary>
              <div className="stack session-details-content">
                <div className="form-row">
                  <label className="label" htmlFor="session-difficulty">Difficulté</label>
                  <select id="session-difficulty" className="select" value={options.difficulty} onChange={(event) => updateDifficulty(event.target.value as ExerciseDifficulty)}>
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Costaud</option>
                  </select>
                </div>
                <div className="grid grid-2">
                  <label className="form-row"><span className="label">Nombre minimum</span><input className="input" type="number" min={0} value={options.minBase} onChange={(event) => updateOption('minBase', Number(event.target.value))} /></label>
                  <label className="form-row"><span className="label">Nombre maximum</span><input className="input" type="number" min={0} value={options.maxBase} onChange={(event) => updateOption('maxBase', Number(event.target.value))} /></label>
                  <label className="form-row"><span className="label">Deuxième terme min.</span><input className="input" type="number" min={1} max={99} value={options.addendMin} onChange={(event) => updateOption('addendMin', Number(event.target.value))} /></label>
                  <label className="form-row"><span className="label">Deuxième terme max.</span><input className="input" type="number" min={1} max={99} value={options.addendMax} onChange={(event) => updateOption('addendMax', Number(event.target.value))} /></label>
                </div>
                {personalized ? <button className="btn btn-ghost" type="button" onClick={() => { applyOptions({ ...recommendation.options, count: options.count }); setPersonalized(false) }}>Revenir au niveau proposé</button> : null}
              </div>
            </details>
          ) : null}

          {selectedExercises.length > 0 ? (
            <details className="session-details">
              <summary>Voir les {selectedExercises.length} calculs</summary>
              <div className="stack session-details-content">
                {mode === 'generate' ? <button className="btn btn-ghost" type="button" onClick={() => { applyOptions(options); setMessage('De nouveaux calculs sont prêts.') }}>🎲 Autres calculs</button> : null}
                <div className="grid exercise-preview">
                  {selectedExercises.map((exercise, index) => (
                    <div className="spread" key={`${exercise.prompt}-${index}`}>
                      <strong>{index + 1}. {exercise.prompt}</strong>
                      <span className="badge">= {exercise.expectedAnswer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ) : null}
        </section>
      </main>
    </>
  )
}
