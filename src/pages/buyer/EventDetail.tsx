import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Poster } from '../../components/Poster'
import { Steps } from '../../components/Steps'
import { btn, NoticeModal } from '../../components/ui'
import { dateLong, rupiah } from '../../lib/format'
import { catState, draftTotals, maxSelectable, usage, validateDraft } from '../../lib/logic'
import { MAX_PER_CATEGORY, MAX_PER_ORDER, FEE_PER_TICKET } from '../../lib/seed'

export default function EventDetail() {
  const { id } = useParams()
  const { state, dispatch } = useDemo()
  const nav = useNavigate()
  const ev = state.events.find((e) => e.id === id)
  const [qty, setQty] = useState<Record<string, number>>(() => (state.draft && state.draft.eventId === id ? state.draft.qty : {}))
  const [error, setError] = useState<string | null>(null)

  const draft = useMemo(() => (ev ? { eventId: ev.id, qty } : null), [ev, qty])
  if (!ev || !ev.published) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-line">
        <h1 className="text-2xl font-bold">Acara tidak ditemukan</h1>
        <p className="mt-1 text-mute">Acara tidak tersedia.</p>
        <Link to="/" className={`${btn.primary} mt-4`}>Kembali ke halaman awal</Link>
      </div>
    )
  }
  const totals = draftTotals(state, draft)

  const change = (catId: string, delta: number, max: number) => {
    const cur = qty[catId] ?? 0
    const total = Object.values(qty).reduce((a, b) => a + b, 0)
    if (delta > 0 && total >= MAX_PER_ORDER) { setError(`Maksimal ${MAX_PER_ORDER} tiket per pesanan.`); return }
    const next = Math.max(0, Math.min(max, cur + delta))
    setError(null)
    setQty({ ...qty, [catId]: next })
  }

  const go = () => {
    const err = validateDraft(state, draft)
    if (err) { setError(err); return }
    dispatch({ type: 'SET_DRAFT', draft })
    nav('/buyer/checkout')
  }

  return (
    <div>
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-line">
        <div className="relative">
          <Poster hue={ev.hue} kind={ev.id} className="h-48 w-full sm:h-64" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-16 text-white sm:p-8">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{ev.name}</h1>
            <p className="mt-1 text-white/85">{ev.tagline}</p>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-8">
          <Info label="Tanggal" value={dateLong(ev.date)} />
          <Info label="Pintu dibuka" value={ev.doorsOpen} />
          <Info label="Lokasi" value={`${ev.venue}, ${ev.city}`} />
        </div>
        <p className="border-t border-line px-5 py-5 leading-relaxed text-ink-2 sm:px-8">{ev.description}</p>
      </div>

      <div className="mt-8">
        <Steps current={1} />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section aria-label="Kategori tiket" className="space-y-4">
            <h2 className="text-2xl font-bold">Pilih tiket</h2>
            {ev.categories.map((c) => {
              const st = catState(state, c)
              const u = usage(state, c.id)
              const max = maxSelectable(state, c)
              const q = qty[c.id] ?? 0
              const disabled = st !== 'open'
              return (
                <div key={c.id} className={`stub relative rounded-2xl bg-white p-5 ring-1 ring-line ${disabled ? 'opacity-60' : ''}`} style={{ ['--stub-y' as string]: '50%', ['--notch' as string]: '9px' }}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">{c.name}</h3>
                        {st === 'soldout' && <span className="rounded-full bg-bad-soft px-2.5 py-0.5 text-xs font-bold text-bad">Sold out</span>}
                        {st === 'inactive' && <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-bold text-mute">Tidak tersedia</span>}
                        {st === 'open' && u.remaining <= 10 && <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-xs font-bold text-warn">Tinggal {u.remaining}</span>}
                      </div>
                      <p className="font-display text-xl font-bold text-violet">{rupiah(c.price)}</p>
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mute">
                        {c.perks.map((p) => <li key={p} className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-amber" />{p}</li>)}
                      </ul>
                      {st === 'open' && <p className="mt-2 text-xs text-mute">Sisa kuota: {u.remaining.toLocaleString('id-ID')} · maks. {MAX_PER_CATEGORY} per pesanan</p>}
                    </div>
                    <div className="flex items-center gap-3" role="group" aria-label={`Jumlah tiket ${c.name}`}>
                      <button className="h-10 w-10 rounded-full border border-line text-lg font-bold transition hover:bg-mist disabled:opacity-40" onClick={() => change(c.id, -1, max)} disabled={disabled || q === 0} aria-label={`Kurangi tiket ${c.name}`}>−</button>
                      <span className="w-6 text-center text-lg font-bold tabular-nums" aria-live="polite">{q}</span>
                      <button className="h-10 w-10 rounded-full bg-ink text-lg font-bold text-white transition hover:bg-ink-2 disabled:bg-line disabled:text-mute" onClick={() => change(c.id, 1, max)} disabled={disabled || q >= max} aria-label={`Tambah tiket ${c.name}`}>+</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </section>

          <aside className="sticky bottom-2 z-30 [@media(max-height:500px)]:static h-fit rounded-2xl bg-white p-4 shadow-lg shadow-ink/10 ring-1 ring-line sm:p-5 lg:bottom-auto lg:top-28 lg:shadow-none" aria-label="Ringkasan pesanan">
            <h2 className="text-lg font-bold">Ringkasan</h2>
            {totals.qty === 0 ? (
              <p className="mt-3 text-sm text-mute">Belum ada tiket dipilih. Tambahkan tiket dari daftar di samping.</p>
            ) : (
              <dl className="mt-3 space-y-2 text-sm">
                {totals.lines.map((l) => (
                  <div key={l.cat.id} className="flex justify-between gap-2"><dt>{l.qty}× {l.cat.name}</dt><dd className="tabular-nums">{rupiah(l.line)}</dd></div>
                ))}
                <div className="flex justify-between gap-2 text-mute"><dt>Biaya layanan (simulasi, {rupiah(FEE_PER_TICKET)}/tiket)</dt><dd className="tabular-nums">{rupiah(totals.fee)}</dd></div>
                <div className="flex justify-between gap-2 border-t border-dashed border-line pt-3 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{rupiah(totals.total)}</dd></div>
              </dl>
            )}
            <button className={`${btn.accent} mt-4 w-full`} onClick={go} disabled={totals.qty === 0}>Lanjut ke checkout</button>
          </aside>
        </div>
      </div>
      <NoticeModal open={!!error} onClose={() => setError(null)} kind="bad" title="Pesanan belum bisa dilanjutkan" message={error} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-mute">{label}</p><p className="font-semibold">{value}</p></div>
}
