'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Exercise, ExerciseDifficulty } from '@/lib/types'
import type { ExerciseModule, ExerciseOptions, Recommendation } from '@/lib/exercises/contracts'
import { createCatalogSession } from '@/lib/rewards/create-session'
import { CatalogUnavailableError, rewardAvailability } from '@/lib/rewards/catalog'
import { exerciseRegistry } from '@/lib/exercises'
import { recommendModuleSession } from '@/lib/exercises/recommendation'
import { loadAppState } from '@/lib/storage/app-state'

const uid = (prefix: string) => `${prefix}_${crypto.randomUUID()}`
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
const initialModule = exerciseRegistry.all[0]
const initialOptions: ExerciseOptions = initialModule?.defaults('medium') ?? { count: 10, difficulty: 'medium', parameters: {} }
const recommendationMessages: Record<Recommendation<ExerciseOptions>['reason'], string> = {
  first: 'Un premier niveau pour commencer en douceur.',
  steady: 'Un niveau proche de la dernière session.',
  support: 'Des calculs plus accessibles pour consolider.',
  advance: 'Un cran de plus, après plusieurs sessions faciles.',
  custom: 'Les réglages de la dernière session sont conservés.',
}

type CreationState = 'idle' | 'invalid' | 'generating' | 'success'
type CreationFeedback = { state: CreationState; title: string; detail: string }

function CreatureCreationOverlay({ feedback }: { feedback: CreationFeedback }) {
  if (feedback.state === 'idle') return null
  const icon = feedback.state === 'invalid' ? '🌧️' : feedback.state === 'success' ? '✨' : '🪄'
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

export default function ParentPage({ onStart }: { offline?: boolean; onStart?: (sessionId: string) => void }) {
  const router = useRouter()
  const [kind, setKind] = useState(initialModule?.kind ?? '')
  const activeModule = exerciseRegistry.get(kind)
  const [options, setOptions] = useState(initialOptions)
  const [countText, setCountText] = useState('10')
  const [recommendation, setRecommendation] = useState<Recommendation<ExerciseOptions>>({ options: initialOptions, reason: 'first' })
  const [personalized, setPersonalized] = useState(false)
  const [manual, setManual] = useState('')
  const [mode, setMode] = useState<'generate' | 'manual'>('generate')
  const [preview, setPreview] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [creationFeedback, setCreationFeedback] = useState<CreationFeedback>({ state: 'idle', title: '', detail: '' })
  const [clientReady, setClientReady] = useState(false)
  const [rewardStatus, setRewardStatus] = useState<ReturnType<typeof rewardAvailability> | null>(null)

  useEffect(() => {
    if (!initialModule) { setClientReady(true); return }
    const saved = loadAppState()
    setRewardStatus(rewardAvailability(saved))
    const suggested = recommendModuleSession(initialModule, saved.sessions)
    const safe = initialModule.normalize(suggested.options)
    setRecommendation({ ...suggested, options: safe })
    setOptions(safe)
    setCountText(String(safe.count))
    setPreview(initialModule.generate(safe))
    setClientReady(true)
  }, [])

  const parsedManual = useMemo(() => activeModule?.manual?.parse(manual) ?? [], [manual, activeModule])
  const selectedExercises = mode === 'manual' ? parsedManual : preview
  const validCount = countText.trim() !== '' && Number.isInteger(Number(countText)) && Number(countText) >= 1 && Number(countText) <= 40

  const applyOptions = (next: ExerciseOptions, definition: ExerciseModule | undefined = activeModule) => {
    if (!definition) return
    const safe = definition.normalize(next)
    setOptions(safe)
    setPreview(definition.generate(safe))
    setMessage(null)
  }

  const changeModule = (nextKind: string) => {
    const nextModule = exerciseRegistry.get(nextKind)
    if (!nextModule) return
    const suggested = recommendModuleSession(nextModule, loadAppState().sessions)
    setKind(nextKind)
    setRecommendation(suggested)
    setPersonalized(false)
    setMode('generate')
    setManual('')
    applyOptions({ ...suggested.options, count: options.count }, nextModule)
    setCountText(String(options.count))
  }

  const changeCount = (value: string) => {
    setCountText(value)
    const count = Number(value)
    if (value.trim() && Number.isInteger(count) && count >= 1 && count <= 40) applyOptions({ ...options, count })
  }

  const updateDifficulty = (difficulty: ExerciseDifficulty) => {
    if (!activeModule) return
    applyOptions({ ...activeModule.defaults(difficulty), count: options.count })
    setPersonalized(true)
  }

  const updateOption = (key: string, value: number) => {
    applyOptions({ ...options, parameters: { ...options.parameters, [key]: value } })
    setPersonalized(true)
  }

  const startSession = async () => {
    if (!activeModule || loading || (mode === 'generate' && !validCount)) return
    if (selectedExercises.length === 0) {
      setCreationFeedback({ state: 'invalid', title: 'Ajoute un exercice', detail: 'Un petit lot de calculs pour découvrir un cadeau.' })
      await wait(1400)
      setCreationFeedback({ state: 'idle', title: '', detail: '' })
      return
    }

    if (selectedExercises.length > 40) { setMessage('Choisis entre 1 et 40 exercices pour ce catalogue.'); return }
    setMessage(null)
    setLoading(true)
    setCreationFeedback({ state: 'generating', title: 'Création...', detail: `${selectedExercises.length} exercice${selectedExercises.length > 1 ? 's' : ''} et un cadeau à découvrir.` })
    try {
      const session = await createCatalogSession({
        id: uid('session'),
        createdAt: new Date().toISOString(),
        status: 'active',
        title: activeModule.label,
        exerciseKind: activeModule.kind,
        generationOptions: mode === 'generate' ? { ...options, parameters: { ...options.parameters } } : undefined,
        exercises: selectedExercises.map((exercise, index) => ({ ...exercise, id: uid(`exercise_${index + 1}`), status: 'pending', attempts: 0, childAnswer: undefined, revealedPartId: undefined })),
        currentExerciseIndex: 0,
      })
      setCreationFeedback({ state: 'success', title: 'Un cadeau se cache ici…', detail: 'Chaque bonne réponse ajoute un élément entier.' })
      await wait(950)
      if (onStart) onStart(session.id)
      // Use the precached document shell, not an uncached App Router RSC request.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      else if (!navigator.onLine) window.location.assign(`/offline#/play/${session.id}`)
      else router.push(`/play/${session.id}`)
    } catch (error) {
      if (error instanceof CatalogUnavailableError) setRewardStatus({ kind: error.kind, formats: error.availableFormats })
      setCreationFeedback({ state: 'idle', title: '', detail: '' })
      setMessage(error instanceof CatalogUnavailableError ? error.message : 'Impossible de réserver et d’enregistrer ce cadeau. Vérifie le stockage et la compatibilité du navigateur, puis réessaie.')
    } finally {
      setLoading(false)
    }
  }

  if (!clientReady) return null
  if (!activeModule) return <main className="card panel"><h2>Aucun exercice disponible</h2><p>Les sessions enregistrées restent accessibles depuis l’accueil.</p></main>

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

          <p className="hint-text">Premier lot local : 10 décors et 3 créatures, sans génération payante. Les longueurs intermédiaires regroupent des éléments entiers ; une composition réservée n’est jamais réattribuée.</p>
          {rewardStatus && <p className="hint-text" aria-live="polite">Prochain cadeau : {rewardStatus.kind === 'decor' ? 'décor' : 'créature'}. Formats disponibles : {rewardStatus.formats.length ? rewardStatus.formats.join(' / ') : 'lot épuisé'}.</p>}
          <label className="form-row">
            <span className="label">Type d’exercice</span>
            <select className="select" value={kind} disabled={loading} onChange={event => changeModule(event.target.value)}>
              {exerciseRegistry.all.map(definition => <option key={definition.kind} value={definition.kind}>{definition.label}</option>)}
            </select>
          </label>

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
              <span className="label">{activeModule.manual?.label}</span>
              <textarea className="textarea" value={manual} onChange={(event) => setManual(event.target.value)} placeholder={activeModule.manual?.placeholder} />
            </label>
          )}

          {message ? <p className="badge" role="status">{message}</p> : null}
          <button className="btn btn-magic session-start" type="button" disabled={loading || (mode === 'generate' && !validCount)} onClick={startSession}>
            {loading ? 'Préparation magique...' : 'Commencer'}
          </button>
          {activeModule.manual && <button className="btn btn-ghost session-mode" type="button" disabled={loading} onClick={() => { setMode(mode === 'generate' ? 'manual' : 'generate'); setMessage(null) }}>
            {mode === 'generate' ? 'Saisir mes calculs' : 'Revenir aux calculs proposés'}
          </button>}

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
                  {activeModule.fields.map(field => <label className="form-row" key={field.key}><span className="label">{field.label}</span><input className="input" type="number" min={field.min} max={field.max} value={options.parameters[field.key]} onChange={event => updateOption(field.key, Number(event.target.value))}/></label>)}
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
