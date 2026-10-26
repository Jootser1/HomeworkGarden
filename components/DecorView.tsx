import { useId } from 'react'
import { DecorBuildView } from '@/components/DecorBuildView'
import { CatalogDecorView } from '@/components/CatalogDecorView'
import type { ReactNode } from 'react'
import type { DecorRecipe, GardenDecor } from '@/lib/types'
import { decorDefinitions, decorName } from '@/lib/garden/decor'

const palettes = {
  sage: { leaf: '#86a56d', light: '#bdce94', accent: '#f2d6ae', cap: '#bd947e' },
  gold: { leaf: '#a7b477', light: '#d4d8a0', accent: '#edc88e', cap: '#c9a37b' },
  rose: { leaf: '#829b74', light: '#b7c68e', accent: '#e6b5b2', cap: '#b98e93' },
  lilac: { leaf: '#7e9e80', light: '#b3c8a0', accent: '#c9b8d6', cap: '#a89ab4' },
}

function Fern({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke="#628653" strokeLinecap="round"><path d="M0 0Q-6-23 12-35M0 0Q-15-25-29-23M0 0Q7-23 27-23" strokeWidth="3"/><path d="M-3-16L3-25L9-17M3-27L10-33L15-26M-11-15L-20-15L-17-24M10-13L21-13L20-23" strokeWidth="4"/></g>
}
function Stone({ x, y, scale = 1, tall = false }: { x: number; y: number; scale?: number; tall?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale} ${scale * (tall ? 1.9 : 1)})`}><path d="M-43-2L-32-37L-5-52L25-40L42-10L32 8L-10 11Z" fill="#a4b09f"/><path d="M-32-37L-5-52L25-40L3-20Z" fill="#c4ccb7"/><path d="M3-20L25-40L42-10L32 8L2 10Z" fill="#8e9e8d"/></g>
}
function Mushroom({ x, y, scale, color, bell = false, dots = true }: { x: number; y: number; scale: number; color: string; bell?: boolean; dots?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M-7 0Q-3-25-6-48H5Q3-22 8 0Z" fill="#e5d9b9"/><path d={bell ? 'M-29-44Q-21-103 0-104Q21-100 30-44Q0-32-29-44Z' : 'M-36-44Q-32-84 0-84Q33-82 37-44Q0-31-36-44Z'} fill={color}/><path d="M-31-43Q0-34 32-43" stroke="#e7cdb5" strokeWidth="4" fill="none" strokeLinecap="round"/>{dots && <g fill="#f4e5c9"><ellipse cx="-13" cy="-61" rx="5" ry="3"/><ellipse cx="10" cy="-70" rx="5" ry="3"/><ellipse cx="23" cy="-54" rx="4" ry="3"/></g>}</g>
}

export function DecorArtwork({ recipe }: { recipe: DecorRecipe }) {
  const { variant, seed } = recipe
  const p = palettes[recipe.palette]
  const family = decorDefinitions[variant].family
  const sway = (seed % 7) - 3
  const details: ReactNode[] = []
  for (let i = 0; i < 9; i++) {
    const x = 90 + ((seed + i * 37) % 132)
    const y = 202 + ((seed + i * 13) % 21)
    details.push(<path key={i} d={`M${x} ${y}l-3-6m3 6l4-4`} stroke={p.leaf} strokeWidth="2" fill="none" strokeLinecap="round"/> )
  }
  return <g transform={`rotate(${sway * .35} 160 220)`}>
    {family === 'tree' && <>
      {variant === 'birch' ? <><path d="M143 220L145 95M170 220L180 108" stroke="#dddac0" strokeWidth="12"/><path d="M141 181h10m-9-30h10m-8-33h9m18 61h10m-7-32h10" stroke="#98937b" strokeWidth="4"/><ellipse cx="139" cy="95" rx="43" ry="68" fill={p.light}/><ellipse cx="188" cy="124" rx="42" ry="61" fill={p.leaf}/></> : <>
      <path d="M151 220Q158 173 151 105L164 102Q164 174 173 220Z" fill="#91724f"/><path d="M159 159L131 123M159 141L190 110" stroke="#91724f" strokeWidth="7" strokeLinecap="round"/>
      {variant === 'willow' ? <><path d="M84 174Q62 97 106 65Q135 31 167 53Q222 40 237 101Q255 146 227 183Q220 123 204 112Q210 174 187 192Q184 129 164 110Q170 177 147 198Q137 128 121 115Q117 170 96 190L93 135Z" fill={p.leaf}/><path d="M99 105Q90 139 99 158M137 82Q126 112 132 143M183 79Q205 106 204 139M222 113l5 35" stroke={p.light} strokeWidth="6" fill="none" strokeLinecap="round"/></> : variant === 'pine' ? <><path d="M160 34Q140 63 117 88L134 90Q109 118 91 142L119 141Q95 169 81 182Q159 211 239 182L201 142L226 142L185 91H204Z" fill={p.leaf}/><path d="M119 141Q161 154 201 142M134 91Q162 101 185 91" fill="none" stroke={p.light} strokeWidth="6" strokeLinecap="round"/></> : variant === 'fan' ? <><path d="M160 159Q80 153 67 100Q88 39 160 41Q230 38 254 101Q239 154 160 159Z" fill={p.leaf}/><path d="M160 156L112 71M160 156V65M160 156L213 73" stroke={p.light} strokeWidth="5" opacity=".6"/></> : <><path d="M160 52Q115 31 101 70Q65 86 90 121Q80 160 123 160Q147 185 173 163Q220 184 232 143Q263 111 228 81Q229 45 190 48Z" fill={p.leaf}/><path d="M112 83Q123 60 143 68M187 142Q207 152 219 129" stroke={p.light} strokeWidth="8" fill="none" strokeLinecap="round"/><g fill={p.accent}>{[0,1,2,3,4].map((i) => <circle key={i} cx={108 + ((seed + i * 41) % 106)} cy={80 + ((seed + i * 23) % 66)} r={variant === 'fruit' ? 8 : 4}/>)}</g></>}
      </>}
      <Fern x={181} y={223} scale={.45}/>
    </>}
    {family === 'mushroom' && <>
      {variant === 'stump' ? <><path d="M120 218L126 136Q157 115 190 135L199 218Q164 234 120 218Z" fill="#997c5c"/><ellipse cx="158" cy="135" rx="32" ry="12" fill="#bda07b"/><ellipse cx="158" cy="135" rx="18" ry="6" fill="none" stroke="#a18561" strokeWidth="2"/><path d="M139 154v53m37-51l4 48" stroke="#806a4e" strokeWidth="4"/>{[0,1,2].map((i) => <path key={i} d={`M${i % 2 ? 181 : 128} ${156 + i * 23}q${i % 2 ? 53 : -53}-28 ${i % 2 ? 57 : -57} 0q-5 21 ${i % 2 ? -53 : 53} 15Z`} fill={i % 2 ? p.accent : p.cap}/>)}</> : variant === 'cluster' ? <>{Array.from({length:7}, (_,i) => <Mushroom key={i} x={160 + Math.cos(i * .9) * 58} y={202 + Math.sin(i * .9) * 15} scale={.5 + i % 3 * .12} color={i % 2 ? p.cap : p.accent}/>)}</> : variant === 'lantern' ? <><Mushroom x={148} y={214} scale={1.2} color={p.cap} bell/><Mushroom x={195} y={222} scale={.65} color={p.accent} bell/><path d="M122 158q24 17 49 0" stroke={p.accent} strokeWidth="5" fill="none"/></> : <><Mushroom x={143} y={212} scale={variant === 'bells' ? 1.15 : 1.1} color={p.cap} bell={variant === 'bells'} dots={variant !== 'bells'}/><Mushroom x={195} y={222} scale={.72} color={p.accent} bell={variant === 'bells'}/>{variant !== 'shelf' && <Mushroom x={106} y={225} scale={.5} color={p.cap}/>}</>}
      <Fern x={173} y={230} scale={.5}/>
    </>}
    {family === 'rock' && <>
      {variant === 'pebbles' ? <><ellipse cx="126" cy="205" rx="43" ry="19" fill="#b7c1ac"/><ellipse cx="183" cy="203" rx="44" ry="24" fill="#98ada3"/><ellipse cx="153" cy="225" rx="26" ry="10" fill="#c7cbb5"/><path d="M105 199q19-13 39-4m20-2q19-15 37-5" stroke="#d3d9c7" strokeWidth="5" fill="none" strokeLinecap="round"/></> : variant === 'arch' ? <><Stone x={119} y={214} scale={.65} tall/><Stone x={202} y={214} scale={.65} tall/><path d="M101 147Q153 111 217 146L218 165Q160 142 102 169Z" fill="#b1bca8"/></> : variant === 'slate' ? <>{[0,1,2].map((i) => <g key={i} transform={`translate(${i * 7} ${-i * 19})`}><ellipse cx="150" cy="215" rx={63 - i * 12} ry="14" fill={i % 2 ? '#b8c1ac' : '#9eaf9f'}/><path d={`M${91 + i * 12} 211q${59 - i * 12}-17 ${118 - i * 24} 0`} fill="none" stroke="#c5cebb" strokeWidth="4"/></g>)}</> : <><Stone x={151} y={210} scale={variant === 'standing' ? .9 : .95} tall={variant === 'standing'}/><Stone x={205} y={225} scale={.5}/><Stone x={105} y={227} scale={.36}/></>}
      <path d="M119 199q10-19 26-13q11-13 23 0l-7 12-17-2-15 8Z" fill={p.leaf}/><Fern x={184} y={231} scale={variant === 'fern' ? 1.4 : .65}/>
    </>}
    {family === 'flower' && <>
      {variant === 'lilies' || variant === 'lotus' ? <><ellipse cx="140" cy="211" rx="42" ry="13" fill={p.leaf}/><ellipse cx="193" cy="220" rx="25" ry="9" fill={p.light}/><path d="M140 211l-17-11 3 14Z" fill="#8bb8b4"/>{variant === 'lotus' && <g fill={p.accent}><ellipse cx="161" cy="197" rx="10" ry="21"/><ellipse cx="150" cy="202" rx="9" ry="17" transform="rotate(-42 150 202)"/><ellipse cx="173" cy="202" rx="9" ry="17" transform="rotate(42 173 202)"/></g>}</> : <>{Array.from({length: variant === 'lavender' ? 9 : 7}, (_,i) => {
        const x = 112 + i * 15, y = 174 - ((seed + i * 17) % 42)
        return <g key={i}><path d={`M${x} 224Q${x + sway} 196 ${x} ${y}`} stroke={p.leaf} strokeWidth="3" fill="none"/>{variant === 'reeds' ? <path d={`M${x} ${y}v-19`} stroke="#9d8463" strokeWidth="7" strokeLinecap="round"/> : variant === 'lavender' ? <>{[0,1,2,3].map((j) => <ellipse key={j} cx={x} cy={y + j * 6} rx={4 + j} ry="4" fill="#b4a6bb"/>)}</> : <><g fill={variant === 'daisies' ? '#f2e8c8' : p.accent}>{[0,1,2,3,4].map((j) => <circle key={j} cx={x + Math.cos(j * 1.257) * 7} cy={y + Math.sin(j * 1.257) * 7} r="6"/>)}</g><circle cx={x} cy={y} r="4" fill="#d8b971"/></>}</g>
      })}</>}
    </>}
    {details}
  </g>
}

export function DecorView({ decor, complete = false, className = '' }: { decor: GardenDecor; complete?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '')
  if (decor.catalogArt) return <CatalogDecorView decor={decor} complete={complete} className={className}/>
  if (decor.buildPlan) return <DecorBuildView decor={decor} complete={complete} className={className}/>
  const ratio = complete ? 1 : Math.min(1, Math.max(0, decor.revealedSteps / decor.stepCount))
  const family = decorDefinitions[decor.recipe.variant].family
  const height = family === 'tree' ? 205 : family === 'mushroom' ? 151 : family === 'rock' ? 135 : 145
  // Continuous spatial reveal: every answer opens another strip; no repeated/truncated part IDs.
  return <svg viewBox="0 0 320 260" className={`decor-svg ${className}`} role="img" aria-label={ratio >= 1 ? decorName(decor) : 'Un cadeau se découvre'}>
    <defs><clipPath id={id}><rect x="50" y={234 - height * ratio} width="230" height={height * ratio + (ratio ? 5 : 0)}/></clipPath></defs>
    {ratio > 0 && <><ellipse cx="160" cy="229" rx="66" ry="13" fill="#49663f" opacity=".14"/><g clipPath={`url(#${id})`}><DecorArtwork recipe={decor.recipe}/></g></>}
    {ratio > 0 && ratio < 1 && <path d={`M95 ${234-height*ratio}Q160 ${226-height*ratio} 225 ${234-height*ratio}`} stroke="#e9dcae" strokeWidth="3" fill="none" opacity=".7"/>}
  </svg>
}
