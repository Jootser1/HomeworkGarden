import { gardenHeight, gardenWidth, isoPosition, projection, worldSize } from '@/lib/garden/map'

/** One continuous painted surface: logical cells never render as separate slabs. */
export function GardenLandscape() {
  const matrix = `matrix(39 21 -39 21 ${projection.x} ${projection.y})`
  return <svg className="garden-landscape" width={worldSize.width} height={worldSize.height} viewBox={`0 0 ${worldSize.width} ${worldSize.height}`} aria-hidden="true">
    <defs>
      <linearGradient id="garden-grass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b5ca8b"/><stop offset="1" stopColor="#98b57a"/></linearGradient>
      <linearGradient id="garden-water" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9bc5bd"/><stop offset="1" stopColor="#6fa3af"/></linearGradient>
      <radialGradient id="garden-glow"><stop stopColor="#b7b8bf" stopOpacity=".45"/><stop offset="1" stopColor="#9fb583" stopOpacity="0"/></radialGradient>
    </defs>
    <g transform={matrix}>
      <path d={`M-.5-.5H${gardenWidth-.5}V${gardenHeight-.5}H-.5Z`} fill="#758c60" transform="translate(.22 .22)"/>
      <path d={`M-.5-.5H${gardenWidth-.5}V${gardenHeight-.5}H-.5Z`} fill="url(#garden-grass)"/>
      <ellipse cx="18" cy="14" rx="4" ry="4" fill="url(#garden-glow)"/>
      <path d="M14 6V13Q14 15 16 16L18 17.5" stroke="#d3c296" strokeWidth="1.05" strokeLinecap="round" fill="none"/>
      <ellipse cx="7" cy="10" rx="4.38" ry="3.47" fill="#c7c89a"/>
      <ellipse cx="7" cy="10" rx="4.1" ry="3.2" fill="url(#garden-water)"/>
      <g fill="none" stroke="#c4ded1" strokeWidth=".055" strokeLinecap="round" className="pond-ripples"><path d="M4.3 9q.6-.3 1.2 0M7 11.6q.8.3 1.6-.1M8.5 8.7q.7-.2 1.2.1"/><ellipse cx="6.5" cy="9.6" rx=".8" ry=".35" opacity=".5"/></g>
      {Array.from({ length: 70 }, (_, i) => {
        const x = ((i * 73) % 210) / 10, y = 4.5 + ((i * 41) % 120) / 10
        if (((x-7)/4.6)**2 + ((y-10)/3.7)**2 < 1 || Math.abs(x-14)<1) return null
        return <path key={i} d={`M${x} ${y}l-.05-.17m.05.17l.16-.07`} stroke={i%3 ? '#829f65' : '#c0d092'} strokeWidth=".045" fill="none"/>
      })}
    </g>
    {/* Plateau front face and a lowered ramp are real height cues, not tile shadows. */}
    <g transform={matrix}><path d="M-.5 3.5H13.5L11.976 1.976H-2.024ZM14.5 3.5H21.5L19.976 1.976H12.976Z" fill="#a1845b"/></g>
    <g transform={`translate(0 -64)`}><g transform={matrix}>
      <path d="M-.5-.5H21.5V3.5H-.5Z" fill="#b8cd91"/>
      <path d="M-.5 3.5H13.5M14.5 3.5H21.5" stroke="#d1dba4" strokeWidth=".1" fill="none"/>
    </g></g>
    <g transform={matrix}>
      <path d="M11.976 1.976H12.976L14.5 6.5H13.5Z" fill="#d8c79c"/>
      <path d="M12.08 2.1L13.6 6.4M12.88 2.1L14.4 6.4" stroke="#e6d5ac" strokeWidth=".045"/>
    </g>
    {/* Low undergrowth belongs to the natural background; tall scenery is depth-sorted separately. */}
    {[[0,5],[1,12],[2,16],[5,1],[8,2],[12,1],[18,2],[20,5],[21,9],[20,16],[17,16],[4,15]].map(([x,y],index) => {
      const pos=isoPosition(x,y)
      return <g key={`${x}:${y}`} transform={`translate(${pos.left} ${pos.top})`}>
        <ellipse cx="0" cy="4" rx="35" ry="10" fill="#496743" opacity=".12"/>
        <path d="M-38 0Q-46-24-23-29Q-11-49 6-31Q34-42 43-17Q52 8 12 8Q-15 16-38 0Z" fill={index%2?'#86a36b':'#789862'}/>
        <path d="M-26-18Q-18-29-7-24M15-22Q27-27 32-17" fill="none" stroke="#acc28a" strokeWidth="4" strokeLinecap="round"/>
        {index%3===0 && <g fill="#e6d3ae"><circle cx="-18" cy="-12" r="3"/><circle cx="17" cy="-6" r="3"/></g>}
      </g>
    })}
  </svg>
}
