import { NumericKeypad } from '@/components/NumericKeypad'
import type { Exercise } from '@/lib/types'

/** Answer-mode renderer, not a renderer per exercise family. Historical snapshots
 * keep working even if their original module is no longer registered.
 */
export function ExerciseAnswer({ exercise, answer, onChange, onSubmit, disabled }: { exercise: Exercise; answer: string; onChange(value: string): void; onSubmit(value: string): void; disabled: boolean }) {
  const choices = Array.isArray(exercise.choices) ? [...new Set(exercise.choices.filter(Number.isSafeInteger))] : []
  if (choices.length) return <div className="grid grid-2" role="group" aria-label="Choisir une réponse">
    {choices.map(choice => <button className="btn btn-primary" style={{ minHeight: 76, fontSize: '1.7rem' }} key={choice} type="button" disabled={disabled} onClick={() => onSubmit(String(choice))}>{choice}</button>)}
  </div>
  return <NumericKeypad value={answer} onChange={onChange} onSubmit={() => onSubmit(answer)} disabled={disabled}/>
}
