'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CreatureView } from '@/components/CreatureView'
import { NumericKeypad } from '@/components/NumericKeypad'
import { getCrossingTenHint } from '@/lib/exercises/additions'
import { addCreatureToGarden, getSession, upsertSession } from '@/lib/storage/app-state'
import type { HomeworkSession, MovementType } from '@/lib/types'

const movementLabels: Record<MovementType, string> = {
  walking: 'marche doucement',
  hopping: 'sautille',
  flying: 'vole tranquillement',
  floating: 'flotte dans l’air',
  swimming: 'nage',
  amphibious: 'va sur la terre et dans l’eau',
}

export default function PlayPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const sessionId = params.sessionId
  const [session, setSession] = useState<HomeworkSession | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [justRevealed, setJustRevealed] = useState<string | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    const found = getSession(sessionId)
    setSession(found ?? null)
  }, [sessionId])

  const currentExercise = useMemo(() => {
    if (!session) return null
    return session.exercises[session.currentExerciseIndex] ?? null
  }, [session])

  if (!session) {
    return (
      <main className="card panel stack">
        <h2>Session introuvable</h2>
        <p>Crée une nouvelle session pour commencer à révéler une créature.</p>
        <Link className="btn btn-primary" href="/parent">Créer une session</Link>
      </main>
    )
  }

  const completedCount = session.exercises.filter((exercise) => exercise.status === 'correct').length
  const total = session.exercises.length
  const complete = completedCount === total
  const revealedPartCount = session.creature.parts.filter((part) => part.revealed).length
  const totalPartCount = session.creature.parts.length
  const discoveryProgress = totalPartCount > 0 ? Math.round((revealedPartCount / totalPartCount) * 100) : 0

  const persist = (next: HomeworkSession) => {
    setSession(next)
    upsertSession(next)
  }

  const submit = () => {
    if (!currentExercise || !answer) return
    const numeric = Number(answer)
    const next: HomeworkSession = structuredClone(session)
    const exercise = next.exercises[next.currentExerciseIndex]
    exercise.attempts += 1
    exercise.childAnswer = numeric

    if (numeric === exercise.expectedAnswer) {
      exercise.status = 'correct'
      const part = next.creature.parts.find((candidate) => !candidate.revealed)
      if (part) {
        part.revealed = true
        exercise.revealedPartId = part.id
        setJustRevealed(part.label)
      }
      if (next.exercises.every((item) => item.status === 'correct')) next.creature.state = 'complete_static'
      setFeedback('Bravo !')
      setAnswer('')
      setAnswerState('correct')
      setIsAdvancing(true)
      if (navigator.vibrate) navigator.vibrate(35)
      persist(next)

      window.setTimeout(() => {
        const advanced: HomeworkSession = structuredClone(next)
        const nextIndex = advanced.exercises.findIndex((item) => item.status === 'pending')
        advanced.currentExerciseIndex = nextIndex === -1 ? advanced.exercises.length : nextIndex
        setAnswerState('idle')
        setIsAdvancing(false)
        persist(advanced)
      }, 850)
    } else {
      const hint = exercise.attempts >= 2 ? ` Indice : ${getCrossingTenHint(exercise)}` : ''
      setFeedback(`Presque, essaie encore.${hint}`)
      setAnswer('')
      setAnswerState('wrong')
      if (navigator.vibrate) navigator.vibrate([20, 30, 20])
      persist(next)
      window.setTimeout(() => setAnswerState('idle'), 420)
    }
  }

  const sendToGarden = () => {
    const next: HomeworkSession = structuredClone(session)
    next.status = 'completed'
    next.creature.state = 'alive_in_garden'
    addCreatureToGarden(next.creature)
    upsertSession(next)
    router.push('/garden')
  }

  return (
    <main className="grid grid-2 play-screen">
      <section className="card panel stack play-exercise-panel">
        <div className="spread">
          <h2>Additions</h2>
          <span className="badge">{completedCount}/{total}</span>
        </div>
        {complete ? (
          <div className="exercise-card card stack">
            <span className="badge">✨ Complète</span>
            <h2>{session.creature.name}</h2>
            <button className="btn btn-magic" type="button" onClick={sendToGarden}>Utiliser la baguette magique</button>
          </div>
        ) : currentExercise ? (
          <>
            <div className={`exercise-card card stack play-current-exercise answer-${answerState}`}>
              <div className="exercise-prompt">{currentExercise.prompt}</div>
              <div className="answer-display">{answer || ' '}</div>
              {feedback ? <p>{feedback}</p> : null}
            </div>
            <NumericKeypad value={answer} onChange={setAnswer} onSubmit={submit} disabled={isAdvancing} />
          </>
        ) : null}
      </section>

      <section className="card panel stack play-creature-panel">
        <div className="spread">
          <h2>{session.creature.name}</h2>
          <button className="info-button" type="button" aria-label="Infos sur la créature" onClick={() => setInfoOpen(true)}>ℹ️</button>
        </div>
        <div className="discovery-gauge" aria-label="Progression de découverte de la créature">
          <div className="discovery-gauge-label">
            <span>Créature</span>
          </div>
          <div className="progress-track"><div className="progress-bar" style={{ width: `${discoveryProgress}%` }} /></div>
        </div>
        <div className={`creature-stage ${justRevealed ? 'magic-burst' : ''}`} onAnimationEnd={() => setJustRevealed(null)}>
          {revealedPartCount === 0 ? (
            <div className="creature-seed-placeholder" aria-label="Graine magique pas encore révélée">🌱</div>
          ) : (
            <CreatureView creature={session.creature} alive={complete} />
          )}
        </div>
        {justRevealed ? <p className="badge">✨ Nouvelle partie découverte !</p> : null}
      </section>

      {infoOpen ? (
        <div className="info-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="creature-info-title" onClick={() => setInfoOpen(false)}>
          <div className="info-modal card panel stack" onClick={(event) => event.stopPropagation()}>
            <div className="spread">
              <h2 id="creature-info-title">{session.creature.name}</h2>
              <button className="info-close" type="button" aria-label="Fermer" onClick={() => setInfoOpen(false)}>×</button>
            </div>
            <p>{session.creature.description}</p>
            <div className="info-fact">🚶 {movementLabels[session.creature.movement.type]}</div>
            <div className="info-fact">✨ {session.creature.personality}</div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
