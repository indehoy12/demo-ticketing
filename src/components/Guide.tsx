import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { btn } from './ui'

export const FLOW = [
  { label: 'Pilih tiket', hint: 'Atur jumlah tiket Regular, VIP, atau VVIP, lalu tekan tombol lanjut ke checkout.', to: '/buyer' },
  { label: 'Checkout', hint: 'Isi data pembeli. Tekan "Isi data dummy" supaya lebih cepat.' },
  { label: 'Bayar', hint: 'Ini simulasi. Pilih "berhasil" untuk menerbitkan e-ticket, atau coba gagal dan kedaluwarsa.' },
  { label: 'E-ticket', hint: 'Setiap tiket punya QR unik. Buka satu tiket, lalu lanjut ke check-in.', next: { to: '/checkin', label: 'Lanjut ke check-in' } },
  { label: 'Check-in', hint: 'Pakai simulasi cepat: QR valid, sudah dipakai, atau tidak valid.', to: '/checkin', next: { to: '/organizer', label: 'Lihat dashboard' } },
  { label: 'Dashboard', hint: 'Lihat angka penjualan dan check-in berubah sesuai yang baru Anda lakukan.', to: '/organizer', next: { to: '/buyer', label: 'Ulangi dari awal' } },
] as const

export function stepIndex(path: string): number | null {
  if (path.startsWith('/buyer/event')) return 0
  if (path.startsWith('/buyer/checkout')) return 1
  if (path.startsWith('/buyer/pay')) return 2
  if (path.startsWith('/buyer/result') || path.startsWith('/buyer/ticket') || path.startsWith('/buyer/order/')) return 3
  if (path === '/checkin' || path === '/organizer/checkin') return 4
  if (path.startsWith('/organizer')) return 5
  return null
}

const KEY = 'srt-guide-hidden'
const read = () => { try { return sessionStorage.getItem(KEY) === '1' } catch { return false } }
const write = (v: boolean) => { try { sessionStorage.setItem(KEY, v ? '1' : '0') } catch { /* ignore */ } }

/** "Panduan demo": where the visitor is in the story, what to do here, and the next stop. */
export function Guide() {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(read)
  const i = stepIndex(pathname)
  if (i === null) return null
  const step = FLOW[i]
  const next = 'next' in step ? step.next : undefined

  if (hidden) {
    return (
      <div className="mb-4">
        <button className="rounded-full bg-violet-soft px-3.5 py-1.5 text-xs font-bold text-violet transition hover:bg-violet hover:text-white" onClick={() => { setHidden(false); write(false) }}>
          Tampilkan panduan demo
        </button>
      </div>
    )
  }

  return (
    <section aria-label="Panduan demo" className="rise mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
      <div className="h-1 bg-line"><div key={i} className="grow h-full rounded-r bg-amber" style={{ width: `${((i + 1) / FLOW.length) * 100}%` }} /></div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-bold text-violet">Panduan demo, langkah {i + 1} dari {FLOW.length}</p>
          <p key={i} className="rise mt-0.5 font-display text-lg font-bold leading-snug">{step.label}</p>
          <p key={`h${i}`} className="rise mt-0.5 max-w-2xl text-sm leading-relaxed text-mute">{step.hint}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {next && <Link to={next.to} className={`${btn.accent} ring`}>{next.label}</Link>}
          <button className="rounded-lg px-3 py-2 text-xs font-semibold text-mute transition hover:bg-mist hover:text-ink" onClick={() => { setHidden(true); write(true) }}>Sembunyikan</button>
        </div>
      </div>
      <ol className="hidden gap-1 border-t border-line bg-mist/70 px-4 py-2.5 sm:flex" aria-label="Alur demo">
        {FLOW.map((f, n) => {
          const done = n < i
          const on = n === i
          const dot = (
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${done ? 'bg-ok text-white' : on ? 'bg-amber text-ink' : 'bg-white text-mute ring-1 ring-line'}`}>{done ? '✓' : n + 1}</span>
          )
          const inner = (<>{dot}<span className={`truncate text-xs font-semibold ${on ? 'text-ink' : 'text-mute'}`}>{f.label}</span></>)
          return (
            <li key={f.label} className="min-w-0 flex-1" aria-current={on ? 'step' : undefined}>
              {'to' in f && !on
                ? <Link to={f.to} className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-white">{inner}</Link>
                : <span className="flex items-center gap-1.5 px-1.5 py-1">{inner}</span>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
