import { useEffect, useRef, useState, type ReactNode } from 'react'
import { statusLabel } from '../lib/format'

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-2 not-disabled:hover:-translate-y-0.5 not-disabled:hover:shadow-lg not-disabled:hover:shadow-ink/20 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-mute',
  accent:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-bold text-ink transition hover:brightness-95 not-disabled:hover:-translate-y-0.5 not-disabled:hover:shadow-lg not-disabled:hover:shadow-amber/30 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-mist not-disabled:hover:-translate-y-0.5 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
  ok: 'inline-flex items-center justify-center gap-2 rounded-xl bg-ok px-5 py-3 text-sm font-semibold text-white transition not-disabled:hover:-translate-y-0.5 hover:brightness-95 active:scale-[.98] disabled:opacity-50',
  bad: 'inline-flex items-center justify-center gap-2 rounded-xl bg-bad px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 active:scale-[.98] disabled:opacity-50',
  warn: 'inline-flex items-center justify-center gap-2 rounded-xl bg-warn-soft px-5 py-3 text-sm font-semibold text-warn ring-1 ring-warn/30 transition hover:brightness-95 active:scale-[.98] disabled:opacity-50',
}

export const input =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-mute/70 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/25'

const tones: Record<string, string> = {
  paid: 'bg-ok-soft text-ok',
  used: 'bg-violet-soft text-violet',
  valid: 'bg-ok-soft text-ok',
  pending: 'bg-warn-soft text-warn',
  failed: 'bg-bad-soft text-bad',
  expired: 'bg-line text-mute',
}

export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status] ?? 'bg-line text-mute'}`}>
      {label ?? statusLabel(status)}
    </span>
  )
}

export function Modal({
  open, onClose, title, children, footer,
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-3 sm:items-center" onMouseDown={onClose}>
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="pop max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-xl outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="-mr-2 -mt-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-mute hover:bg-mist hover:text-ink">Tutup</button>
        </div>
        {children}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-mute">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'ok' | 'warn' | 'bad' | 'violet' }) {
  const bar = { ok: 'bg-ok', warn: 'bg-amber', bad: 'bg-bad', violet: 'bg-violet' }[tone ?? 'violet']
  return (
    <div className="lift relative overflow-hidden rounded-2xl border border-line bg-white p-4">
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <p className="text-xs font-medium text-mute">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-mute">{sub}</p>}
    </div>
  )
}


/** The only two icons used in the app: green check and red cross. */
export function Mark({ kind, size = 56 }: { kind: 'ok' | 'bad'; size?: number }) {
  const ok = kind === 'ok'
  return (
    <span
      role="img" aria-label={ok ? 'Berhasil' : 'Gagal'}
      className={`pop relative inline-flex shrink-0 items-center justify-center rounded-full ${ok ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}
      style={{ width: size, height: size }}
    >
      <span aria-hidden className={`burst absolute inset-0 rounded-full ${ok ? 'bg-ok/30' : 'bg-bad/30'}`} />
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="relative">
        <path className="draw" pathLength={1} d={ok ? 'M5 12.5l4.5 4.5L19 7' : 'M6 6l12 12M18 6L6 18'} />
      </svg>
    </span>
  )
}

/** Number that counts up from its previous value (0 on first show). */
export function CountUp({ to, format = (n: number) => n.toLocaleString('id-ID'), ms = 800 }: { to: number; format?: (n: number) => string; ms?: number }) {
  const [v, setV] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { from.current = to; setV(to); return }
    const a = from.current, t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms)
      const e = 1 - Math.pow(1 - k, 3)
      const cur = Math.round(a + (to - a) * e)
      from.current = cur
      setV(cur)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, ms])
  return <>{format(v)}</>
}

/** Replaces inline alert banners and browser alert(): a message in a modal with one button. */
export function NoticeModal({
  open, onClose, title, message, kind, button = 'Mengerti',
}: { open: boolean; onClose: () => void; title: string; message: ReactNode; kind?: 'ok' | 'bad'; button?: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} footer={<button className={btn.primary} onClick={onClose}>{button}</button>}>
      <div className="flex items-start gap-4">
        {kind && <Mark kind={kind} size={44} />}
        <div className="text-sm leading-relaxed text-ink-2">{message}</div>
      </div>
    </Modal>
  )
}
