import type { DecorBuildElement, DecorRecipe, GardenDecor } from '@/lib/types'
import { visibleBuildElements } from '@/lib/garden/decor-build'
import { decorName } from '@/lib/garden/decor'

const palettes = {
  sage: { green: '#71944e', light: '#aec47b', flower: '#f0d8a7' },
  gold: { green: '#8a9b4e', light: '#c6cf87', flower: '#e6b478' },
  rose: { green: '#739261', light: '#a9bf85', flower: '#d996a8' },
  lilac: { green: '#6f9272', light: '#aec69c', flower: '#b89acb' },
}

/** Each primitive is an entire identifiable object, never a fragment cut by a mask. */
export function DecorBuildElementView({ part, recipe }: { part: DecorBuildElement; recipe: DecorRecipe }) {
  const p = palettes[recipe.palette]
  const stones = ['#acbba8', '#91aaa4', '#c3c5aa']
  return <g transform={`translate(${part.x} ${part.y}) rotate(${part.angle}) scale(${part.size})`}>
    {part.kind === 'pebble' && <>
      <path d="M-33 0C-41-15-21-24-3-23C16-25 37-14 34-1C30 14-21 18-33 0Z" fill={stones[part.tone]}/>
      <path d="M-27-8Q-7-24 20-10" fill="none" stroke="#d4dec9" strokeWidth="4" strokeLinecap="round"/>
      <path d="M-25 5Q0 15 26 4" fill="none" stroke="#697e76" strokeOpacity=".22" strokeWidth="3" strokeLinecap="round"/>
    </>}
    {part.kind === 'moss' && <>
      <path d="M-16 3Q-20-5-11-8Q-6-18 1-10Q12-17 17-6Q25 5 9 8Q-4 13-16 3Z" fill={p.green}/>
      <path d="M-10-1Q-5-8 1-4M6 1l5-3" stroke={p.light} strokeWidth="3" fill="none" strokeLinecap="round"/>
    </>}
    {part.kind === 'fern' && <g fill="none" strokeLinecap="round">
      <path d="M0 2Q-7-24 9-39M0 2Q-10-25-26-23M0 2Q8-25 25-27" stroke={p.green} strokeWidth="3"/>
      <path d="M-3-16L3-25L9-16M1-28L9-35L14-27M-10-14L-21-14L-18-24M10-15L21-15L20-26" stroke={p.green} strokeWidth="5"/>
      <path d="M0-5L7-12M-9-8L-16-8" stroke={p.light} strokeWidth="3"/>
    </g>}
    {part.kind === 'flower' && <>
      <path d="M0 1Q3-13 0-30" fill="none" stroke={p.green} strokeWidth="3"/>
      <path d="M1-10Q-15-19-13-8Q-8-1 1-7M1-16Q16-27 15-16Q10-8 1-12" fill={p.green}/>
      <g fill={part.tone === 2 ? '#f4ead0' : p.flower}>{Array.from({ length: 5 }, (_, index) => <circle key={index} cx={Math.cos(index * Math.PI * 2 / 5) * 7} cy={-30 + Math.sin(index * Math.PI * 2 / 5) * 7} r="6.5"/>)}</g>
      <circle cy="-30" r="4" fill="#c39e56"/>
    </>}
    {part.kind === 'grass' && <>
      <path d="M0 3Q-26-3-20-22Q-6-15 0 3M0 3Q-8-19 2-32Q13-17 0 3M0 3Q9-22 23-21Q25-6 0 3Z" fill={p.green}/>
      <path d="M0 0L1-19M3 0l11-12" stroke={p.light} strokeWidth="2" strokeLinecap="round"/>
    </>}
  </g>
}

export function DecorBuildView({ decor, complete = false, className = '' }: { decor: GardenDecor; complete?: boolean; className?: string }) {
  const elements = visibleBuildElements(decor, complete)
  const finished = complete || decor.revealedSteps >= decor.stepCount
  // Close framing in the calculation screen makes the small flowers and moss readable.
  // In the garden the original coordinate system keeps the same foot/placement anchor.
  const frame = complete ? '0 0 320 260' : decor.stepCount <= 15 ? '40 110 245 140' : '35 20 250 230'
  return <svg viewBox={frame} className={`decor-svg decor-build-svg ${className}`} role="img" aria-label={finished ? decorName(decor) : 'Un cadeau se construit'}>
    {elements.length > 0 && <ellipse cx="165" cy="229" rx="107" ry="13" fill="#536f49" opacity=".1"/>}
    {elements.map(({part,id,step}) => <g key={id} data-decor-part={id} data-build-step={step} data-part-kind={part.kind} className={!complete && step === decor.revealedSteps ? 'decor-build-addition' : undefined}>
      <DecorBuildElementView part={part} recipe={decor.recipe}/>
    </g>)}
  </svg>
}
