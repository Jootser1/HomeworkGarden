import type { Creature, CreaturePartKind } from '@/lib/types'

type CreatureViewProps = {
  creature: Creature
  compact?: boolean
  alive?: boolean
  className?: string
}

function isRevealed(creature: Creature, kind: CreaturePartKind) {
  return creature.parts.some((part) => part.kind === kind && part.revealed)
}

function partClass(visible: boolean) {
  return visible ? 'revealed-part' : 'hidden-part'
}

export function CreatureView({ creature, compact = false, alive = false, className = '' }: CreatureViewProps) {
  const p = creature.palette
  const bodyVisible = isRevealed(creature, 'body')
  const eyesVisible = isRevealed(creature, 'eyes')
  const mouthVisible = isRevealed(creature, 'mouth')
  const earsVisible = isRevealed(creature, 'ears') || isRevealed(creature, 'horns')
  const legsVisible = isRevealed(creature, 'legs')
  const tailVisible = isRevealed(creature, 'tail')
  const wingsVisible = isRevealed(creature, 'wings') || creature.movement.type === 'flying'
  const spotsVisible = isRevealed(creature, 'spots') || isRevealed(creature, 'sparkles') || isRevealed(creature, 'shadow_glow')
  const auraVisible = isRevealed(creature, 'aura')
  const bellyVisible = isRevealed(creature, 'belly')
  const antennaeVisible = isRevealed(creature, 'antennae') || isRevealed(creature, 'crest')
  const cheeksVisible = isRevealed(creature, 'cheeks')

  const animation = alive
    ? creature.movement.type === 'hopping'
      ? 'creature-hop'
      : creature.movement.type === 'flying' || creature.movement.type === 'floating'
        ? 'creature-fly'
        : 'creature-alive'
    : ''

  const bodyShape = creature.bodyShape === 'bean'
    ? <path d="M84 143 C64 103 88 59 132 54 C188 47 232 89 222 143 C213 194 162 220 116 202 C101 196 93 181 84 143Z" fill={p.primary} />
    : creature.bodyShape === 'leaf'
      ? <path d="M64 147 C82 70 158 35 226 67 C223 151 172 218 95 205 C78 195 67 178 64 147Z" fill={p.primary} />
      : creature.bodyShape === 'mushroom'
        ? <path d="M78 126 C78 77 119 50 154 50 C196 50 229 81 229 126 C191 140 118 142 78 126Z" fill={p.secondary} />
        : creature.bodyShape === 'droplet'
          ? <path d="M150 42 C198 91 223 126 214 165 C206 203 178 224 144 219 C101 213 75 184 79 144 C82 109 112 80 150 42Z" fill={p.primary} />
          : <ellipse cx="150" cy="140" rx="76" ry="82" fill={p.primary} />

  return (
    <svg viewBox="0 0 300 280" className={`creature-svg ${animation} ${className}`} role="img" aria-label={creature.name}>
      <defs>
        <radialGradient id={`${creature.id}-shine`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.58" />
          <stop offset="55%" stopColor={p.secondary} stopOpacity="0.18" />
          <stop offset="100%" stopColor={p.primary} stopOpacity="0.4" />
        </radialGradient>
      </defs>

      <g className={partClass(auraVisible)}>
        <ellipse cx="150" cy="145" rx="104" ry="104" fill={p.accent} opacity="0.12" />
        <ellipse cx="150" cy="145" rx="88" ry="88" fill="none" stroke={p.accent} strokeWidth="3" strokeDasharray="5 12" opacity="0.55" />
      </g>

      <g className={partClass(tailVisible)}>
        {creature.tailShape === 'leaf' ? (
          <path d="M215 147 C265 116 270 177 222 179 C235 165 235 153 215 147Z" fill={p.secondary} stroke={p.dark} strokeWidth="5" strokeLinecap="round" />
        ) : creature.tailShape === 'curl' ? (
          <path d="M217 154 C268 145 260 207 226 190 C207 180 230 159 244 175" fill="none" stroke={p.dark} strokeWidth="13" strokeLinecap="round" />
        ) : creature.tailShape === 'glow' ? (
          <g><path d="M215 150 C255 132 266 168 231 184" fill="none" stroke={p.dark} strokeWidth="11" strokeLinecap="round" /><circle cx="238" cy="184" r="17" fill={p.accent} opacity=".85" /></g>
        ) : null}
      </g>

      <g className={partClass(wingsVisible)} opacity={compact ? 0.78 : 1}>
        <path d="M93 119 C40 84 37 159 89 157" fill={p.secondary} opacity=".72" stroke={p.dark} strokeWidth="4" />
        <path d="M207 119 C260 84 263 159 211 157" fill={p.secondary} opacity=".72" stroke={p.dark} strokeWidth="4" />
      </g>

      <g className={partClass(bodyVisible)}>
        {bodyShape}
        <ellipse cx="128" cy="101" rx="38" ry="30" fill={`url(#${creature.id}-shine)`} opacity=".58" />
      </g>

      <g className={partClass(bellyVisible)}>
        <ellipse cx="150" cy="166" rx="43" ry="39" fill={p.secondary} opacity=".62" />
      </g>

      <g className={partClass(earsVisible)}>
        {creature.earShape === 'leaf' ? (
          <><path d="M101 76 C73 30 48 74 82 105" fill={p.secondary} stroke={p.dark} strokeWidth="5" /><path d="M199 76 C227 30 252 74 218 105" fill={p.secondary} stroke={p.dark} strokeWidth="5" /></>
        ) : creature.earShape === 'horns' ? (
          <><path d="M112 72 L93 31 L129 61" fill={p.accent} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" /><path d="M188 72 L207 31 L171 61" fill={p.accent} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" /></>
        ) : creature.earShape === 'round' ? (
          <><circle cx="91" cy="82" r="26" fill={p.secondary} stroke={p.dark} strokeWidth="5" /><circle cx="209" cy="82" r="26" fill={p.secondary} stroke={p.dark} strokeWidth="5" /></>
        ) : null}
      </g>

      <g className={partClass(antennaeVisible)}>
        <path d="M126 71 C114 42 91 44 88 24" fill="none" stroke={p.dark} strokeWidth="5" strokeLinecap="round" />
        <path d="M174 71 C186 42 209 44 212 24" fill="none" stroke={p.dark} strokeWidth="5" strokeLinecap="round" />
        <circle cx="87" cy="22" r="9" fill={p.accent} />
        <circle cx="213" cy="22" r="9" fill={p.accent} />
      </g>

      <g className={partClass(spotsVisible)}>
        {creature.pattern === 'stripes' ? (
          <><path d="M96 132 C131 147 169 148 205 132" stroke={p.dark} strokeWidth="7" opacity=".18" fill="none" /><path d="M92 158 C129 176 170 177 208 158" stroke={p.dark} strokeWidth="7" opacity=".18" fill="none" /></>
        ) : (
          <><circle cx="113" cy="132" r="9" fill={p.accent} opacity=".68" /><circle cx="190" cy="146" r="7" fill={p.accent} opacity=".68" /><circle cx="145" cy="190" r="6" fill={p.accent} opacity=".68" /></>
        )}
      </g>

      <g className={partClass(eyesVisible)}>
        <ellipse cx="123" cy="129" rx="13" ry="17" fill={p.dark} />
        <ellipse cx="177" cy="129" rx="13" ry="17" fill={p.dark} />
        <circle cx="127" cy="123" r="4" fill="#fff" />
        <circle cx="181" cy="123" r="4" fill="#fff" />
      </g>

      <g className={partClass(cheeksVisible)}>
        <ellipse cx="101" cy="151" rx="15" ry="9" fill="#ff91b1" opacity=".42" />
        <ellipse cx="199" cy="151" rx="15" ry="9" fill="#ff91b1" opacity=".42" />
      </g>

      <g className={partClass(mouthVisible)}>
        <path d="M134 158 C143 169 158 169 167 158" fill="none" stroke={p.dark} strokeWidth="6" strokeLinecap="round" />
      </g>

      <g className={partClass(legsVisible)}>
        <ellipse cx="117" cy="216" rx="24" ry="13" fill={p.dark} opacity=".82" />
        <ellipse cx="183" cy="216" rx="24" ry="13" fill={p.dark} opacity=".82" />
      </g>
    </svg>
  )
}
