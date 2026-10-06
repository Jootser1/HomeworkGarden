'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Creature, Exercise, ExerciseDifficulty, HomeworkSession } from '@/lib/types'
import { createLocalCatalogCreature } from '@/lib/creatures/factory'
import { defaultAdditionOptions, generateAdditionCrossingTen, parseManualAdditions } from '@/lib/exercises/additions'
import { upsertSession } from '@/lib/storage/app-state'
import { loadSettings } from '@/lib/storage/settings'

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
const initialPreviewExercises: Exercise[] = [
  { id: 'initial_1', kind: 'addition_crossing_ten', prompt: '115 + 9', operands: [115, 9], expectedAnswer: 124, attempts: 0, status: 'pending' },
  { id: 'initial_2', kind: 'addition_crossing_ten', prompt: '127 + 8', operands: [127, 8], expectedAnswer: 135, attempts: 0, status: 'pending' },
  { id: 'initial_3', kind: 'addition_crossing_ten', prompt: '136 + 7', operands: [136, 7], expectedAnswer: 143, attempts: 0, status: 'pending' },
  { id: 'initial_4', kind: 'addition_crossing_ten', prompt: '148 + 6', operands: [148, 6], expectedAnswer: 154, attempts: 0, status: 'pending' },
  { id: 'initial_5', kind: 'addition_crossing_ten', prompt: '159 + 8', operands: [159, 8], expectedAnswer: 167, attempts: 0, status: 'pending' },
  { id: 'initial_6', kind: 'addition_crossing_ten', prompt: '172 + 9', operands: [172, 9], expectedAnswer: 181, attempts: 0, status: 'pending' },
  { id: 'initial_7', kind: 'addition_crossing_ten', prompt: '184 + 7', operands: [184, 7], expectedAnswer: 191, attempts: 0, status: 'pending' },
  { id: 'initial_8', kind: 'addition_crossing_ten', prompt: '196 + 5', operands: [196, 5], expectedAnswer: 201, attempts: 0, status: 'pending' },
  { id: 'initial_9', kind: 'addition_crossing_ten', prompt: '208 + 6', operands: [208, 6], expectedAnswer: 214, attempts: 0, status: 'pending' },
  { id: 'initial_10', kind: 'addition_crossing_ten', prompt: '219 + 4', operands: [219, 4], expectedAnswer: 223, attempts: 0, status: 'pending' },
]

type CreationState = 'idle' | 'invalid' | 'generating' | 'success' | 'fallback'

type CreationFeedback = {
  state: CreationState
  title: string
  detail: string
}

async function generateCreature(exerciseCount: number, difficulty: ExerciseDifficulty): Promise<{ creature: Creature; source: string; warning?: string }> {
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

export default function ParentPage() {
  const router = useRouter()
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('medium')
  const [options, setOptions] = useState(defaultAdditionOptions('medium'))
  const [manual, setManual] = useState('')
  const [mode, setMode] = useState<'generate' | 'manual'>('generate')
  const [preview, setPreview] = useState<Exercise[]>(initialPreviewExercises)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [generationFlash, setGenerationFlash] = useState(0)
  const [creationFeedback, setCreationFeedback] = useState<CreationFeedback>({ state: 'idle', title: '', detail: '' })
  const [clientReady, setClientReady] = useState(false)
  const [aiCreatureGeneration, setAiCreatureGeneration] = useState(false)
  const lastGenerateTapRef = useRef(0)

  useEffect(() => {
    setAiCreatureGeneration(loadSettings().aiCreatureGeneration)
    setClientReady(true)
  }, [])

  const parsedManual = useMemo(() => parseManualAdditions(manual), [manual])
  const selectedExercises = mode === 'manual' ? parsedManual : preview

  const updateDifficulty = (value: ExerciseDifficulty) => {
    const next = defaultAdditionOptions(value)
    setDifficulty(value)
    setOptions(next)
    setPreview(generateAdditionCrossingTen(next))
  }

  const updateOption = (key: keyof typeof options, value: number) => {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  const regenerate = () => {
    const safeOptions = {
      ...options,
      count: Math.max(1, Math.min(40, Math.floor(options.count))),
      minBase: Math.floor(options.minBase),
      maxBase: Math.floor(options.maxBase),
      addendMin: Math.max(1, Math.floor(options.addendMin)),
      addendMax: Math.max(1, Math.floor(options.addendMax)),
      difficulty,
    }
    const nextExercises = generateAdditionCrossingTen(safeOptions)
    setOptions(safeOptions)
    setPreview(nextExercises)
    setGenerationFlash((value) => value + 1)
    setMessage(`${nextExercises.length} nouvelles additions générées ✨`)
  }

  const handleRegenerateTap = () => {
    const now = Date.now()
    if (now - lastGenerateTapRef.current < 350) return
    lastGenerateTapRef.current = now
    regenerate()
  }

  const startSession = async () => {
    if (selectedExercises.length === 0) {
      setMessage('Ajoute ou génère au moins une addition valide.')
      setCreationFeedback({
        state: 'invalid',
        title: 'Ajoute une addition',
        detail: 'La créature a besoin d’au moins un calcul.',
      })
      await wait(1400)
      setCreationFeedback({ state: 'idle', title: '', detail: '' })
      return
    }

    setLoading(true)
    setMessage('Création de la créature...')
    setCreationFeedback({
      state: 'generating',
      title: 'Création...',
      detail: `${selectedExercises.length} addition${selectedExercises.length > 1 ? 's' : ''} pour une créature.`,
    })

    try {
      let creature: Creature
      let usedFallback = false

      if (!aiCreatureGeneration) {
        creature = createLocalCatalogCreature(selectedExercises.length)
      } else {
        try {
          const generated = await generateCreature(selectedExercises.length, difficulty)
          creature = generated.creature
          usedFallback = generated.source === 'fallback'
        } catch {
          creature = createLocalCatalogCreature(selectedExercises.length)
          usedFallback = true
        }
      }

      setCreationFeedback({
        state: usedFallback ? 'fallback' : 'success',
        title: usedFallback ? 'Créature créée' : `${creature.name} apparaît !`,
        detail: 'C’est parti.',
      })

      const session: HomeworkSession = {
        id: uid('session'),
        createdAt: new Date().toISOString(),
        status: 'active',
        title: 'Additions avec passage de dizaine',
        exerciseKind: 'addition_crossing_ten',
        exercises: selectedExercises.map((exercise, index) => ({ ...exercise, id: uid(`exercise_${index + 1}`), status: 'pending', attempts: 0, childAnswer: undefined, revealedPartId: undefined })),
        creature,
        currentExerciseIndex: 0,
      }

      upsertSession(session)
      await wait(950)
      router.push(`/play/${session.id}`)
    } finally {
      setLoading(false)
    }
  }

  if (!clientReady) {
    return null
  }

  return (
    <>
      <CreatureCreationOverlay feedback={creationFeedback} />
      <main className="grid grid-2">
        <section className="card panel stack">
          <div className="spread">
            <div>
              <h2>Créer une session</h2>
            </div>
            <select className="select" style={{ width: 150 }} value={mode} onChange={(event) => setMode(event.target.value as 'generate' | 'manual')}>
              <option value="generate">Générer</option>
              <option value="manual">Saisir</option>
            </select>
          </div>

          {mode === 'generate' ? (
            <div className="stack">
              <div className="grid grid-2">
                <label className="form-row">
                  <span className="label">Difficulté</span>
                  <select className="select" value={difficulty} onChange={(event) => updateDifficulty(event.target.value as ExerciseDifficulty)}>
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Costaud</option>
                  </select>
                </label>
                <label className="form-row">
                  <span className="label">Nombre d&apos;additions</span>
                  <input className="input" type="number" min={1} max={40} value={options.count} onChange={(event) => updateOption('count', Number(event.target.value))} />
                </label>
                <label className="form-row">
                  <span className="label">Nombre minimum</span>
                  <input className="input" type="number" value={options.minBase} onChange={(event) => updateOption('minBase', Number(event.target.value))} />
                </label>
                <label className="form-row">
                  <span className="label">Nombre maximum</span>
                  <input className="input" type="number" value={options.maxBase} onChange={(event) => updateOption('maxBase', Number(event.target.value))} />
                </label>
                <label className="form-row">
                  <span className="label">Deuxième terme min.</span>
                  <input className="input" type="number" min={1} value={options.addendMin} onChange={(event) => updateOption('addendMin', Number(event.target.value))} />
                </label>
                <label className="form-row">
                  <span className="label">Deuxième terme max.</span>
                  <input className="input" type="number" min={1} value={options.addendMax} onChange={(event) => updateOption('addendMax', Number(event.target.value))} />
                </label>
              </div>
              <button
                className="btn btn-primary generate-button"
                type="button"
                onClick={handleRegenerateTap}
                onPointerUp={handleRegenerateTap}
                onTouchEnd={(event) => {
                  event.preventDefault()
                  handleRegenerateTap()
                }}
              >
                <span>🎲 Générer les additions</span>
                {generationFlash > 0 ? <small>Liste mise à jour</small> : null}
              </button>
            </div>
          ) : (
            <label className="form-row">
              <span className="label">Colle les calculs, un par ligne</span>
              <textarea className="textarea" value={manual} onChange={(event) => setManual(event.target.value)} placeholder={'115 + 9\n127 + 8\n136 + 7'} />
            </label>
          )}

          {message ? <p className="badge">{message}</p> : null}
          <button className="btn btn-magic" type="button" disabled={loading} onClick={startSession}>
            {loading ? 'Préparation magique...' : `Lancer avec ${selectedExercises.length} addition${selectedExercises.length > 1 ? 's' : ''}`}
          </button>
        </section>

        <section className="card panel stack">
          <h2>{selectedExercises.length} addition{selectedExercises.length > 1 ? 's' : ''}</h2>
          {message ? <p className="badge">{message}</p> : null}
          <div className={`grid exercise-preview ${generationFlash > 0 ? 'preview-flash' : ''}`} key={generationFlash} style={{ maxHeight: 520, overflow: 'auto', paddingRight: 4 }}>
            {selectedExercises.map((exercise, index) => (
              <div className="card panel spread" key={`${exercise.prompt}-${index}`}>
                <strong>{index + 1}. {exercise.prompt}</strong>
                <span className="badge">= {exercise.expectedAnswer}</span>
              </div>
            ))}
            {selectedExercises.length === 0 ? <p>Aucune addition valide pour l&apos;instant.</p> : null}
          </div>
        </section>
      </main>
    </>
  )
}
