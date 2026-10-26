import type { ReactNode } from 'react'
import type { Direction } from '@/lib/types'
import type { VisitorId } from '@/lib/creatures/garden-visitors'

type Props = { id: VisitorId; direction?: Direction; paused?: boolean; moving?: boolean; label: string; visibleParts?: ReadonlySet<number>; compositionId?: string; className?: string }
type Show = (part: number, children: ReactNode) => ReactNode
type View = { side: boolean; back: boolean; show: Show }
function Eye({ x, y }: { x: number; y: number }) {
  return <g><ellipse cx={x} cy={y} rx="4" ry="5.5" fill="#263d3b"/><ellipse cx={x - 1} cy={y - 2} rx="1.3" ry="1.8" fill="#fff9ed"/></g>
}
function Pompon({ side, back, show }: View) {
  return <>
    {show(1, <g className="visitor-feet"><ellipse cx="105" cy="230" rx="27" ry="14" fill="#806d8b"/><ellipse cx="205" cy="230" rx="27" ry="14" fill="#806d8b"/></g>)}
    <g className="visitor-breath">
      {show(2, <path d={side ? 'M88 201L80 179L91 163L85 144L103 137L107 115L129 117L143 99L160 111L184 104L193 127L216 138L224 160L244 178L232 205Q170 246 108 225Z' : 'M65 189L59 165L74 159L69 137L87 133L87 110L110 112L119 90L141 101L159 86L177 102L201 97L208 118L230 124L228 146L248 159L237 180L246 202L222 215Q159 253 91 218L67 212Z'} fill="#a38caa"/>)}
      {show(3, back ? <path d="M129 117Q158 138 143 166Q132 196 161 217Q188 199 180 170Q165 136 183 117" fill="#bda6c2"/> : <ellipse cx={side ? 170 : 158} cy="191" rx={side ? 40 : 53} ry="40" fill="#c4b0c6"/>)}
      {show(4, <g className="visitor-hand visitor-hand-left"><path d="M83 178Q44 175 43 201L55 213L85 203L101 188Z" fill="#dfb6a1"/><path d="M54 198L63 206M65 191L74 201" fill="none" stroke="#a37d75" strokeWidth="3" strokeLinecap="round"/></g>)}
      {show(5, <g className="visitor-hand visitor-hand-right"><path d="M230 178Q267 177 272 202L260 213L229 203L214 188Z" fill="#dfb6a1"/><path d="M260 198L251 206M249 191L240 201" fill="none" stroke="#a37d75" strokeWidth="3" strokeLinecap="round"/></g>)}
      {!back && <>
        {show(6, <ellipse cx={side ? 213 : 157} cy="157" rx={side ? 33 : 45} ry="27" fill="#dfb6a1"/>)}
        {show(7, <ellipse cx={side ? 235 : 157} cy="145" rx={side ? 12 : 16} ry="10" fill="#6d5b73"/>)}
        {show(8, <><g className="visitor-eyes">{side ? <Eye x={199} y={130}/> : <><Eye x={126} y={130}/><Eye x={188} y={130}/></>}</g><path d={side ? 'M220 168Q231 171 237 164M234 153L234 163' : 'M157 156L157 166M142 168Q157 178 172 168'} fill="none" stroke="#6d5b73" strokeWidth="3" strokeLinecap="round"/></>)}
        {show(9, <path d={side ? 'M198 155L174 148M199 165L173 171' : 'M117 156L89 149M117 165L88 170M197 156L225 149M197 165L226 170'} fill="none" stroke="#765f7c" strokeWidth="3" strokeLinecap="round"/>)}
      </>}
      {show(10, <path className="visitor-tuft" d="M128 112Q120 73 147 67L148 91Q169 66 183 79L163 113Z" fill="#bba3bf"/>)}
      {back && show(9, <ellipse cx="160" cy="211" rx="22" ry="17" fill="#8d789b"/>)}
    </g>
  </>
}
function Raie({ side, back, show }: View) {
  return <>
    {show(1, <g className="visitor-tail raie-tail"><path d="M162 164Q178 224 247 233Q205 247 163 202L140 162Z" fill={back ? '#956c87' : '#af6d83'}/></g>)}
    <g className="visitor-wing raie-wing-left">
      {show(2, <path d={side ? 'M160 116Q119 81 76 102Q91 137 148 160Z' : 'M159 109Q92 49 24 112Q41 164 144 171Z'} fill={back ? '#bd8e9e' : '#d69aab'}/>)}
      {show(5, <path d={side ? 'M88 104Q121 111 145 148' : 'M42 112Q95 100 140 156Q89 143 42 112Z'} fill="#bd7c91"/>)}
      {!side && show(9, <path d="M62 104Q98 110 121 134M67 124L113 142" fill="none" stroke="#f3d6d1" strokeWidth="4" strokeLinecap="round"/>)}
    </g>
    <g className="visitor-wing raie-wing-right">
      {show(3, <path d={side ? 'M151 109Q222 39 292 86Q285 133 163 171Z' : 'M151 109Q224 46 298 112Q274 164 163 171Z'} fill={back ? '#bd8e9e' : '#d69aab'}/>)}
      {show(6, <path d={side ? 'M276 88Q222 85 172 156Q239 126 276 88Z' : 'M277 111Q222 100 172 156Q226 141 277 111Z'} fill="#bd7c91"/>)}
      {show(10, <path d={side ? 'M251 80Q217 90 194 124M250 103L202 136' : 'M251 102Q217 109 194 134M250 124L202 143'} fill="none" stroke="#f3d6d1" strokeWidth="4" strokeLinecap="round"/>)}
    </g>
    {show(4, <path d={side ? 'M157 81Q132 100 139 159Q161 185 190 147Q202 114 175 90Z' : 'M157 81Q124 100 129 159Q157 190 184 156Q190 106 157 81Z'} fill={back ? '#c48f9f' : '#eab8bc'}/>)}
    {show(7, <path d="M140 104Q117 72 133 58Q155 65 157 88Q170 58 188 65Q194 86 175 108Z" fill="#b6c8a2"/>)}
    {show(8, back ? <path d="M157 115L151 136L158 160L168 136Z" fill="#f0c7c4"/> : <><g className="visitor-eyes">{side ? <Eye x={176} y={121}/> : <><Eye x={146} y={126}/><Eye x={169} y={126}/></>}</g><path d={side ? 'M177 142Q184 146 190 139' : 'M151 145Q158 151 166 144'} fill="none" stroke="#79495d" strokeWidth="3" strokeLinecap="round"/></>)}
  </>
}
const featherCoordinates = [
  [88, 103, 32, 33, 17], [82, 110, 18, 53, 17], [80, 117, 14, 78, 17], [85, 126, 14, 105, 17],
  [94, 134, 22, 135, 16], [106, 140, 38, 160, 16], [119, 145, 61, 181, 16], [132, 147, 89, 192, 15],
] as const
const featherColors = ['#597f8f', '#729ba3', '#a0b8ad', '#c5b49d', '#be8f92', '#a87889', '#8c7894', '#767e99']
const coverCoordinates = [[132, 134, 59, 88, 14], [138, 141, 68, 112, 14], [142, 147, 83, 139, 14], [144, 154, 108, 167, 13]] as const
function Feather({ x, y, tx, ty, width, color }: { x: number; y: number; tx: number; ty: number; width: number; color: string }) {
  const dx = tx - x, dy = ty - y, length = Math.hypot(dx, dy)
  const nx = -dy / length * width, ny = dx / length * width
  const mx = x + dx * .55, my = y + dy * .55
  return <><path d={`M${x} ${y}Q${mx + nx} ${my + ny} ${tx} ${ty}Q${mx - nx} ${my - ny} ${x} ${y}Z`} fill={color}/><path d={`M${x} ${y}L${x + dx * .82} ${y + dy * .82}`} fill="none" stroke="#e5cdac" strokeWidth="1.8" strokeLinecap="round"/></>
}
function BirdWing({ right, side, show }: { right: boolean; side: boolean; show: Show }) {
  return <g transform={side && !right ? 'translate(160 0) scale(.48 1) translate(-160 0)' : undefined}><g className={`visitor-wing bird-wing-${right ? 'right' : 'left'}`}>
    {show(right ? 2 : 1, <path d={right ? 'M174 123Q209 82 257 87Q241 127 184 149Z' : 'M145 124Q115 83 64 87Q80 126 134 150Z'} fill="#658d91"/>)}
    {featherCoordinates.map(([x,y,tx,ty,width],i) => show(6+i+(right?8:0), <Feather x={right?320-x:x} y={y} tx={right?320-tx:tx} ty={ty} width={width} color={featherColors[i]}/>))}
    {coverCoordinates.map(([x,y,tx,ty,width],i) => show(22+i+(right?4:0), <Feather x={right?320-x:x} y={y} tx={right?320-tx:tx} ty={ty} width={width} color={['#d8c5a7','#c6bda2','#a4b9a3','#86a8a0'][i]}/>))}
  </g></g>
}
function Aurores({ side, back, show }: View) {
  return <>
    <BirdWing right={false} side={side} show={show}/><BirdWing right side={side} show={show}/>
    <g className="visitor-tail bird-tail">
      {show(30, <Feather x={160} y={174} tx={160} ty={266} width={19} color="#527d88"/>)}
      {show(31, <Feather x={153} y={174} tx={108} ty={256} width={17} color="#8ba9a3"/>)}
      {show(32, <Feather x={168} y={174} tx={212} ty={256} width={17} color="#8ba9a3"/>)}
      {[[123,231,8,11,3.5,5],[160,242,9,12,4,6],[197,231,8,11,3.5,5]].map(([x,y,rx,ry,irx,iry],i)=>show(33+i,<><ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#d8b477"/><ellipse cx={x} cy={y} rx={irx} ry={iry} fill="#597f8f"/></>))}
    </g>
    {show(3, <path d="M158 100Q125 109 131 150Q136 180 160 188Q187 174 188 145Q190 113 170 104Z" fill={back?'#628b93':'#739f9e'}/>)}
    {show(4, <path d="M145 121Q148 105 144 92Q126 83 137 65Q147 53 163 61Q186 70 174 90L170 119Z" fill={back?'#79a39e':'#8eb4ac'}/>)}
    {!back && <>
      {show(36, <path d={side?'M138 71L121 81L140 85Z':'M151 79L160 91L168 79Z'} fill="#d3ae73"/>)}
      {show(37, <><g className="visitor-eyes">{side?<Eye x={150} y={73}/>:<><Eye x={145} y={73}/><Eye x={169} y={73}/></>}</g>{side&&<path d="M159 69Q174 74 167 86Q160 88 158 82Z" fill="#dfc7a0"/>}</>)}
      {show(38, <><path d="M140 103Q158 119 177 102L178 120L168 115L160 129L150 116L140 121Z" fill="#eedabb"/><path d="M143 136Q151 126 158 139Q163 127 173 137L169 150L160 144L152 155L144 149ZM150 159L160 151L171 158L161 173Z" fill="#c4d1b4"/></>)}
    </>}
    {back&&show(38,<path d="M146 114L159 124L173 114L169 145L159 160L148 143Z" fill="#9db9a7"/>)}
    <g className="visitor-crest">{show(39,<Feather x={154} y={63} tx={154} ty={17} width={12} color="#d2ad78"/>)}{show(40,<><Feather x={150} y={63} tx={126} ty={28} width={12} color="#b98d8e"/><Feather x={159} y={63} tx={184} ty={28} width={12} color="#b98d8e"/></>)}</g>
    {show(5,<g className="visitor-feet"><path d="M148 174L135 195L122 199M135 195L139 202M174 174L188 195L201 197M188 195L184 203" fill="none" stroke="#ab875e" strokeWidth="5" strokeLinecap="round"/></g>)}
  </>
}
/** The reward and garden share these exact authored SVGs and articulation rigs. */
export function GardenVisitorView({ id, direction='down', paused=false, moving=false, label, visibleParts, compositionId, className='' }: Props) {
  const side = direction==='left'||direction==='right', back = direction==='up'
  const mirror = side&&(id==='aurores'?direction==='right':direction==='left')
  const show: Show = (part, children) => !visibleParts || visibleParts.has(part) ? <g key={part} data-reward-part={part}>{children}</g> : null
  return <svg viewBox="0 0 320 280" className={`garden-visitor-svg visitor-${id} ${className}`} data-composition-id={compositionId} data-revealed-groups={visibleParts?.size ?? (id==='aurores'?40:10)} data-view={direction} data-paused={paused} data-moving={moving} role="img" aria-label={`${label}, vue ${back?'de dos':side?'de profil':'de face'}`}>
    {(!visibleParts||visibleParts.size>0)&&<ellipse className="visitor-shadow" cx="160" cy={id==='pompon'?248:264} rx={id==='pompon'?65:54} ry="9" fill="#3d5b43" opacity=".14"/>}
    <g transform={mirror?'translate(320 0) scale(-1 1)':undefined}><g className="visitor-lift"><g className="visitor-anatomy">{id==='pompon'?<Pompon side={side} back={back} show={show}/>:id==='raie'?<Raie side={side} back={back} show={show}/>:<Aurores side={side} back={back} show={show}/>}</g></g></g>
  </svg>
}
