const labels = ['Pilih tiket', 'Data pembeli', 'Pembayaran', 'E-ticket']
export function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Langkah pembelian">
      {labels.map((l, i) => {
        const n = i + 1
        const done = n < current
        const on = n === current
        return (
          <li key={l} className="flex flex-1 items-center gap-2" aria-current={on ? 'step' : undefined}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${done ? 'bg-ok text-white' : on ? 'bg-ink text-white' : 'bg-line text-mute'}`}>
              {done ? '✓' : n}
            </span>
            <span className={`hidden sm:inline ${on ? 'text-ink' : 'text-mute'}`}>{l}</span>
            {n < 4 && <span className={`h-0.5 flex-1 rounded ${done ? 'bg-ok' : 'bg-line'}`} />}
          </li>
        )
      })}
    </ol>
  )
}
