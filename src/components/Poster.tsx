/** Generated poster art per event (no external images, no real brands). */
export function Poster({ hue, kind, className = '' }: { hue: number; kind: string; className?: string }) {
  const a = `hsl(${hue} 85% 52%)`
  const b = `hsl(${(hue + 40) % 360} 90% 62%)`
  const c = `hsl(${(hue + 200) % 360} 70% 18%)`
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Ilustrasi poster acara">
      <defs>
        <linearGradient id={`g${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c} /><stop offset="1" stopColor={a} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#g${kind})`} />
      {kind === 'tech' && (
        <g fill="none" stroke={b} strokeWidth="2" opacity=".85">
          {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${-20 + i * 50} 240 L${60 + i * 50} 120 L${60 + i * 50} 40`} />)}
          {[60, 110, 160, 210, 260, 310].map((x, i) => <circle key={x} cx={x} cy={40 + (i % 3) * 35} r="6" fill={b} />)}
          <rect x="250" y="130" width="90" height="60" rx="8" stroke="#fff" opacity=".6" />
        </g>
      )}
      {kind === 'biz' && (
        <g>
          <circle cx="300" cy="70" r="70" fill={b} opacity=".55" />
          <circle cx="240" cy="110" r="50" fill="#fff" opacity=".2" />
          <rect x="40" y="130" width="40" height="90" rx="6" fill="#fff" opacity=".35" />
          <rect x="95" y="100" width="40" height="120" rx="6" fill="#fff" opacity=".5" />
          <rect x="150" y="150" width="40" height="70" rx="6" fill="#fff" opacity=".25" />
        </g>
      )}
      {kind === 'music' && (
        <g fill={b}>
          {Array.from({ length: 28 }).map((_, i) => {
            const h = 30 + Math.abs(Math.sin(i * 0.7)) * 110 + (i % 4) * 8
            return <rect key={i} x={14 + i * 13.5} y={200 - h} width="8" height={h} rx="4" opacity={0.45 + (i % 5) * 0.1} />
          })}
          <circle cx="320" cy="55" r="30" fill="#fff" opacity=".25" />
        </g>
      )}
    </svg>
  )
}
