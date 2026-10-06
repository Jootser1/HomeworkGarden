import type { Creature, CreaturePartKind, Direction } from '@/lib/types'

type CreatureViewProps = {
  creature: Creature
  compact?: boolean
  alive?: boolean
  direction?: Direction
  className?: string
}

function isRevealed(creature: Creature, kind: CreaturePartKind) {
  return creature.parts.some((part) => part.kind === kind && part.revealed)
}

function partClass(visible: boolean) {
  return visible ? 'revealed-part' : 'hidden-part'
}

function bodyNode(creature: Creature, side: boolean) {
  const p = creature.palette
  if (side) {
    switch (creature.bodyShape) {
      case 'long': return <ellipse cx="150" cy="148" rx="86" ry="48" fill={p.primary} />
      case 'leaf': return <path d="M75 153 C101 81 182 65 228 126 C189 202 114 213 75 153Z" fill={p.primary} />
      case 'mushroom': return <path d="M82 132 C83 82 129 59 178 72 C217 83 238 112 226 143 C178 156 124 157 82 132Z" fill={p.secondary} />
      case 'droplet': return <path d="M112 71 C193 79 235 132 209 178 C184 222 107 209 86 165 C72 136 87 102 112 71Z" fill={p.primary} />
      case 'star': return <path d="M151 56 L174 111 L234 111 L187 148 L205 211 L151 176 L96 211 L115 148 L67 111 L128 111Z" fill={p.primary} />
      case 'pebble': return <path d="M76 149 C80 91 128 66 182 78 C232 89 242 166 197 197 C153 228 72 207 76 149Z" fill={p.primary} />
      case 'shell': return <path d="M76 165 C84 87 143 52 208 99 C229 137 218 191 168 208 C124 222 84 202 76 165Z" fill={p.primary} />
      case 'cloud': return <path d="M76 161 C61 128 91 99 124 109 C134 75 185 72 198 112 C233 105 250 149 224 174 C183 209 105 199 76 161Z" fill={p.primary} />
      default: return <ellipse cx="150" cy="145" rx="76" ry="66" fill={p.primary} />
    }
  }

  switch (creature.bodyShape) {
    case 'bean': return <path d="M84 143 C64 103 88 59 132 54 C188 47 232 89 222 143 C213 194 162 220 116 202 C101 196 93 181 84 143Z" fill={p.primary} />
    case 'leaf': return <path d="M64 147 C82 70 158 35 226 67 C223 151 172 218 95 205 C78 195 67 178 64 147Z" fill={p.primary} />
    case 'mushroom': return <path d="M78 126 C78 77 119 50 154 50 C196 50 229 81 229 126 C191 140 118 142 78 126Z" fill={p.secondary} />
    case 'droplet': return <path d="M150 42 C198 91 223 126 214 165 C206 203 178 224 144 219 C101 213 75 184 79 144 C82 109 112 80 150 42Z" fill={p.primary} />
    case 'star': return <path d="M150 42 L176 108 L244 105 L190 149 L209 218 L150 180 L90 218 L110 149 L56 105 L124 108Z" fill={p.primary} />
    case 'pebble': return <path d="M74 145 C80 84 129 54 181 67 C231 80 243 154 206 194 C164 238 77 213 74 145Z" fill={p.primary} />
    case 'long': return <ellipse cx="150" cy="145" rx="57" ry="91" fill={p.primary} />
    case 'shell': return <path d="M72 164 C77 93 119 54 163 59 C211 64 236 117 216 174 C194 233 105 225 72 164Z" fill={p.primary} />
    case 'cloud': return <path d="M70 163 C49 124 86 87 124 101 C137 59 196 58 211 105 C251 104 267 158 232 184 C184 222 101 208 70 163Z" fill={p.primary} />
    default: return <ellipse cx="150" cy="140" rx="76" ry="82" fill={p.primary} />
  }
}

function earsNode(creature: Creature, side: boolean, back: boolean) {
  const p = creature.palette
  if (creature.earShape === 'none') return null
  if (side) {
    if (creature.earShape === 'horns') return <path d="M134 83 L124 38 L158 73" fill={p.accent} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" />
    if (creature.earShape === 'fin') return <path d="M120 105 C80 84 88 139 122 133" fill={p.secondary} stroke={p.dark} strokeWidth="5" />
    if (creature.earShape === 'petal') return <path d="M126 84 C98 43 76 91 113 115" fill={p.secondary} stroke={p.dark} strokeWidth="5" />
    if (creature.earShape === 'tuft') return <path d="M126 82 L104 48 L137 69 L151 42 L153 78" fill={p.secondary} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" />
    return <path d="M128 83 C104 42 78 84 111 112" fill={p.secondary} stroke={p.dark} strokeWidth="5" />
  }

  const opacity = back ? 0.78 : 1
  if (creature.earShape === 'horns') return <g opacity={opacity}><path d="M112 72 L93 31 L129 61" fill={p.accent} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" /><path d="M188 72 L207 31 L171 61" fill={p.accent} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" /></g>
  if (creature.earShape === 'fin') return <g opacity={opacity}><path d="M98 94 C54 72 61 137 99 130" fill={p.secondary} stroke={p.dark} strokeWidth="5" /><path d="M202 94 C246 72 239 137 201 130" fill={p.secondary} stroke={p.dark} strokeWidth="5" /></g>
  if (creature.earShape === 'petal') return <g opacity={opacity}><path d="M101 76 C73 30 48 74 82 105" fill={p.secondary} stroke={p.dark} strokeWidth="5" /><path d="M199 76 C227 30 252 74 218 105" fill={p.secondary} stroke={p.dark} strokeWidth="5" /></g>
  if (creature.earShape === 'tuft') return <g opacity={opacity}><path d="M106 78 L83 42 L119 65 L132 38 L130 82" fill={p.secondary} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" /><path d="M194 78 L217 42 L181 65 L168 38 L170 82" fill={p.secondary} stroke={p.dark} strokeWidth="5" strokeLinejoin="round" /></g>
  return <g opacity={opacity}><circle cx="91" cy="82" r="26" fill={p.secondary} stroke={p.dark} strokeWidth="5" /><circle cx="209" cy="82" r="26" fill={p.secondary} stroke={p.dark} strokeWidth="5" /></g>
}

function eyesNode(creature: Creature, side: boolean) {
  const p = creature.palette
  if (side) {
    if (creature.visuals.eyeStyle === 'sleepy') return <path d="M172 126 C183 119 194 119 205 126" fill="none" stroke={p.dark} strokeWidth="6" strokeLinecap="round" />
    if (creature.visuals.eyeStyle === 'crescent') return <path d="M178 116 C199 122 201 145 181 151 C193 139 192 126 178 116Z" fill={p.dark} />
    return <><ellipse cx="188" cy="129" rx="13" ry="17" fill={p.dark} /><circle cx="192" cy="123" r="4" fill="#fff" /></>
  }
  if (creature.visuals.eyeStyle === 'sleepy') return <><path d="M110 128 C121 121 132 121 143 128" fill="none" stroke={p.dark} strokeWidth="6" strokeLinecap="round" /><path d="M165 128 C176 121 187 121 198 128" fill="none" stroke={p.dark} strokeWidth="6" strokeLinecap="round" /></>
  if (creature.visuals.eyeStyle === 'crescent') return <><path d="M115 116 C136 122 138 145 118 151 C130 139 129 126 115 116Z" fill={p.dark} /><path d="M170 116 C191 122 193 145 173 151 C185 139 184 126 170 116Z" fill={p.dark} /></>
  if (creature.visuals.eyeStyle === 'dot') return <><circle cx="123" cy="132" r="8" fill={p.dark} /><circle cx="177" cy="132" r="8" fill={p.dark} /></>
  if (creature.visuals.eyeStyle === 'glow') return <><circle cx="123" cy="129" r="15" fill={p.accent} opacity=".9" /><circle cx="177" cy="129" r="15" fill={p.accent} opacity=".9" /><circle cx="123" cy="129" r="8" fill={p.dark} /><circle cx="177" cy="129" r="8" fill={p.dark} /></>
  const rx = creature.visuals.eyeStyle === 'wide' ? 16 : 13
  return <><ellipse cx="123" cy="129" rx={rx} ry="17" fill={p.dark} /><ellipse cx="177" cy="129" rx={rx} ry="17" fill={p.dark} /><circle cx="127" cy="123" r="4" fill="#fff" /><circle cx="181" cy="123" r="4" fill="#fff" /></>
}

export function CreatureView({ creature, compact = false, alive = false, direction = 'down', className = '' }: CreatureViewProps) {
  const p = creature.palette
  const side = direction === 'left' || direction === 'right'
  const back = direction === 'up'
  const scaleX = direction === 'left' ? -1 : 1
  const sizeScale = compact ? 0.92 : creature.visuals.size === 'tiny' ? 0.88 : creature.visuals.size === 'large' ? 1.08 : 1

  const bodyVisible = isRevealed(creature, 'body')
  const eyesVisible = isRevealed(creature, 'eyes')
  const mouthVisible = isRevealed(creature, 'mouth')
  const earsVisible = isRevealed(creature, 'ears') || isRevealed(creature, 'horns')
  const legsVisible = isRevealed(creature, 'legs')
  const tailVisible = isRevealed(creature, 'tail')
  const wingsVisible = isRevealed(creature, 'wings') || creature.visuals.wingStyle !== 'none'
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
        : creature.movement.type === 'swimming'
          ? 'creature-swim'
          : 'creature-alive'
    : ''

  return (
    <svg viewBox="0 0 300 280" className={`creature-svg ${animation} ${className}`} role="img" aria-label={creature.name} style={{ transform: `scale(${sizeScale})` }}>
      <defs>
        <radialGradient id={`${creature.id}-shine`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.58" />
          <stop offset="55%" stopColor={p.secondary} stopOpacity="0.18" />
          <stop offset="100%" stopColor={p.primary} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <g transform={`translate(${direction === 'left' ? 300 : 0} 0) scale(${scaleX} 1) rotate(${creature.visuals.tilt} 150 145)`}>
        <g className={partClass(auraVisible)}>
          <ellipse cx="150" cy="145" rx="104" ry="104" fill={p.accent} opacity="0.12" />
          {creature.visuals.auraStyle !== 'none' ? <ellipse cx="150" cy="145" rx="88" ry="88" fill="none" stroke={p.accent} strokeWidth="3" strokeDasharray="5 12" opacity="0.55" /> : null}
        </g>
        <g className={partClass(tailVisible)}>
          {creature.tailShape === 'fin' ? <path d="M215 150 C264 120 271 184 221 180Z" fill={p.accent} stroke={p.dark} strokeWidth="5" /> : creature.tailShape === 'leaf' ? <path d="M215 147 C265 116 270 177 222 179 C235 165 235 153 215 147Z" fill={p.secondary} stroke={p.dark} strokeWidth="5" /> : creature.tailShape === 'curl' ? <path d="M217 154 C268 145 260 207 226 190 C207 180 230 159 244 175" fill="none" stroke={p.dark} strokeWidth="13" strokeLinecap="round" /> : creature.tailShape === 'star' ? <path d="M237 157 L248 174 L268 177 L255 191 L258 211 L239 202 L221 211 L224 191 L211 177 L231 174Z" fill={p.accent} stroke={p.dark} strokeWidth="4" /> : creature.tailShape === 'puff' ? <circle cx="236" cy="177" r="24" fill={p.secondary} stroke={p.dark} strokeWidth="5" /> : creature.tailShape === 'ribbon' ? <path d="M215 154 C250 130 261 168 288 151 C269 182 246 181 224 170" fill={p.accent} opacity=".78" stroke={p.dark} strokeWidth="4" /> : creature.tailShape === 'glow' ? <g><path d="M215 150 C255 132 266 168 231 184" fill="none" stroke={p.dark} strokeWidth="11" strokeLinecap="round" /><circle cx="238" cy="184" r="17" fill={p.accent} opacity=".85" /></g> : null}
        </g>
        <g className={partClass(wingsVisible)} opacity={compact ? 0.78 : 1}>
          {creature.visuals.wingStyle !== 'none' ? <><path d="M93 119 C40 84 37 159 89 157" fill={p.secondary} opacity=".72" stroke={p.dark} strokeWidth="4" /><path d="M207 119 C260 84 263 159 211 157" fill={p.secondary} opacity=".72" stroke={p.dark} strokeWidth="4" /></> : null}
        </g>
        <g className={partClass(earsVisible)}>{earsNode(creature, side, back)}</g>
        <g className={partClass(bodyVisible)}>{bodyNode(creature, side)}<ellipse cx="128" cy="101" rx="38" ry="30" fill={`url(#${creature.id}-shine)`} opacity=".38" /></g>
        <g className={partClass(bellyVisible)}>{!back ? <ellipse cx={side ? 156 : 150} cy="166" rx={side ? 34 : 43} ry="39" fill={p.secondary} opacity=".62" /> : <path d="M111 134 C130 118 174 118 194 134" fill="none" stroke={p.secondary} strokeWidth="9" opacity=".44" />}</g>
        <g className={partClass(antennaeVisible)}>{creature.visuals.antennaStyle !== 'none' ? <><path d="M126 71 C114 42 91 44 88 24" fill="none" stroke={p.dark} strokeWidth="5" strokeLinecap="round" /><path d="M174 71 C186 42 209 44 212 24" fill="none" stroke={p.dark} strokeWidth="5" strokeLinecap="round" /><circle cx="87" cy="22" r="9" fill={p.accent} /><circle cx="213" cy="22" r="9" fill={p.accent} /></> : null}</g>
        <g className={partClass(spotsVisible)}>
          {creature.pattern === 'stripes' || creature.pattern === 'waves' ? <><path d="M96 132 C131 147 169 148 205 132" stroke={p.dark} strokeWidth="7" opacity=".18" fill="none" /><path d="M92 158 C129 176 170 177 208 158" stroke={p.dark} strokeWidth="7" opacity=".18" fill="none" /></> : creature.pattern !== 'none' ? <><circle cx="113" cy="132" r="9" fill={p.accent} opacity=".68" /><circle cx="190" cy="146" r="7" fill={p.accent} opacity=".68" /><circle cx="145" cy="190" r="6" fill={p.accent} opacity=".68" /></> : null}
        </g>
        <g className={partClass(eyesVisible)}>{back ? <path d="M120 93 C140 82 163 82 184 93" fill="none" stroke={p.dark} strokeWidth="6" strokeLinecap="round" opacity=".28" /> : eyesNode(creature, side)}</g>
        <g className={partClass(cheeksVisible)}>{!back ? <><ellipse cx={side ? 170 : 101} cy="151" rx="15" ry="9" fill="#ff91b1" opacity=".42" />{!side ? <ellipse cx="199" cy="151" rx="15" ry="9" fill="#ff91b1" opacity=".42" /> : null}</> : null}</g>
        <g className={partClass(mouthVisible)}>{!back && creature.visuals.mouthStyle !== 'none' ? <path d={side ? 'M176 158 C184 166 194 166 202 158' : 'M134 158 C143 169 158 169 167 158'} fill="none" stroke={p.dark} strokeWidth="6" strokeLinecap="round" /> : null}</g>
        <g className={partClass(legsVisible)}>{creature.visuals.legStyle !== 'none' ? <><ellipse cx={side ? 126 : 117} cy="216" rx="24" ry="13" fill={p.dark} opacity=".82" /><ellipse cx={side ? 185 : 183} cy="216" rx="24" ry="13" fill={p.dark} opacity=".82" /></> : null}</g>
      </g>
    </svg>
  )
}
