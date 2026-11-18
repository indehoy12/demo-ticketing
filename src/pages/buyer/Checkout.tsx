import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Steps } from '../../components/Steps'
import { btn, input, NoticeModal } from '../../components/ui'
import { draftTotals, validateDraft } from '../../lib/logic'
import { rupiah, clean, methodLabel } from '../../lib/format'
import { FEE_PER_TICKET } from '../../lib/seed'
import type { PayMethod } from '../../lib/types'

const DUMMY = [
  { buyerName: 'Rina Contoh', email: 'rina.contoh@contoh.test', phone: '081200000001', holderName: 'Rina Contoh' },
  { buyerName: 'Budi Sampel', email: 'budi.sampel@contoh.test', phone: '081200000002', holderName: 'Budi Sampel' },
  { buyerName: 'Sari Demo', email: 'sari.demo@contoh.test', phone: '', holderName: 'Sari Demo' },
]

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const phoneOk = (v: string) => v === '' || /^[0-9+\-\s]{8,16}$/.test(v)

export default function Checkout() {
  const { state, dispatch } = useDemo()
  const nav = useNavigate()
  const [f, setF] = useState({ buyerName: '', email: '', phone: '', holderName: '' })
  const [method, setMethod] = useState<PayMethod>('qris')
  const [touched, setTouched] = useState(false)
  const [showErr, setShowErr] = useState(false)
  const [dummyIdx, setDummyIdx] = useState(0)
  const submitted = useRef(false)

  const draftError = validateDraft(state, state.draft)
  // After a successful submit the draft is cleared while we navigate to the payment page; don't bounce to /buyer.
  if (!state.draft) return submitted.current ? null : <Navigate to="/buyer" replace />
  const ev = state.events.find((e) => e.id === state.draft!.eventId)
  const totals = draftTotals(state, state.draft)

  const errs = {
    buyerName: clean(f.buyerName).length < 2 ? 'Isi nama minimal 2 karakter.' : '',
    email: emailOk(f.email.trim()) ? '' : 'Isi email dengan format yang benar, misalnya nama@contoh.test.',
    phone: phoneOk(f.phone.trim()) ? '' : 'Nomor telepon hanya boleh angka, spasi, + atau -, 8–16 karakter.',
    holderName: clean(f.holderName).length < 2 ? 'Isi nama pemegang tiket minimal 2 karakter.' : '',
  }
  const hasErr = Object.values(errs).some(Boolean)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (draftError) { setShowErr(true); return }
    if (hasErr) return
    const nextId = `ORD-DEMO-${state.counters.order + 1}`
    submitted.current = true
    dispatch({ type: 'CREATE_ORDER', now: Date.now(), ...f, method })
    nav(`/buyer/pay/${nextId}`)
  }

  const fill = () => { setF(DUMMY[dummyIdx % DUMMY.length]); setDummyIdx(dummyIdx + 1); setTouched(false) }
  const field = (k: keyof typeof f) => ({
    value: f[k],
    onChange: (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value }),
    'aria-invalid': touched && !!errs[k],
    'aria-describedby': `err-${k}`,
  })
  const Err = ({ k }: { k: keyof typeof f }) => <p id={`err-${k}`} className="mt-1 min-h-[1rem] text-xs font-medium text-bad">{touched ? errs[k] : ''}</p>

  const methods: { id: PayMethod; hint: string }[] = [
    { id: 'qris', hint: 'Ilustrasi, tidak dapat dibayar' },
    { id: 'va', hint: 'Tanpa nomor rekening nyata' },
    { id: 'ewallet', hint: 'Simulasi saja' },
  ]

  return (
    <div>
      <Link to={`/buyer/event/${ev?.id}`} className="mb-4 inline-flex items-center text-sm font-semibold text-mute hover:text-ink">Kembali: ubah tiket</Link>
      <Steps current={2} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} noValidate className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Data pembeli</h1>
              <p className="mt-1 text-sm text-mute">Gunakan data contoh saja. Jangan isi data pribadi sungguhan.</p>
            </div>
            <button type="button" className={btn.ghost} onClick={fill}>Isi data dummy</button>
          </div>

          <div className="mt-5 grid gap-x-4 gap-y-2 sm:grid-cols-2">
            <div><label htmlFor="buyerName" className="mb-1 block text-sm font-semibold">Nama pembeli</label><input id="buyerName" className={input} autoComplete="off" maxLength={60} placeholder="Nama contoh" {...field('buyerName')} /><Err k="buyerName" /></div>
            <div><label htmlFor="email" className="mb-1 block text-sm font-semibold">Email</label><input id="email" type="email" className={input} autoComplete="off" maxLength={80} placeholder="nama@contoh.test" {...field('email')} /><Err k="email" /></div>
            <div><label htmlFor="phone" className="mb-1 block text-sm font-semibold">Nomor telepon <span className="font-normal text-mute">(opsional)</span></label><input id="phone" inputMode="tel" className={input} autoComplete="off" maxLength={16} placeholder="08xxxxxxxxxx" {...field('phone')} /><Err k="phone" /></div>
            <div><label htmlFor="holderName" className="mb-1 block text-sm font-semibold">Nama pemegang tiket</label><input id="holderName" className={input} autoComplete="off" maxLength={60} placeholder="Nama pada e-ticket" {...field('holderName')} /><Err k="holderName" /></div>
          </div>

          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-semibold">Metode pembayaran (simulasi)</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {methods.map((m) => (
                <label key={m.id} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${method === m.id ? 'border-violet bg-violet-soft' : 'border-line hover:bg-mist'}`}>
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                  <span className="block font-semibold">{methodLabel(m.id)}</span>
                  <span className="text-xs text-mute">{m.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="mt-5 rounded-xl bg-mist px-4 py-3 text-xs leading-relaxed text-mute">
            Demo ini tidak meminta kartu, rekening, atau OTP, dan tidak mengirim data ke server. Data hanya ada di browser Anda.
          </p>
          <button type="submit" className={`${btn.accent} mt-5 w-full sm:w-auto`}>Lanjut ke pembayaran simulasi</button>
        </form>

        <aside className="h-fit rounded-2xl bg-white p-5 ring-1 ring-line lg:sticky lg:top-28 [@media(max-height:500px)]:static" aria-label="Ringkasan pesanan">
          <h2 className="text-lg font-bold">Ringkasan pesanan</h2>
          <p className="mt-1 text-sm font-semibold text-violet">{ev?.name}</p>
          <dl className="mt-3 space-y-2 text-sm">
            {totals.lines.map((l) => <div key={l.cat.id} className="flex justify-between gap-2"><dt>{l.qty}× {l.cat.name}</dt><dd className="tabular-nums">{rupiah(l.line)}</dd></div>)}
            <div className="flex justify-between gap-2 text-mute"><dt>Biaya layanan simulasi ({rupiah(FEE_PER_TICKET)}/tiket)</dt><dd className="tabular-nums">{rupiah(totals.fee)}</dd></div>
            <div className="flex justify-between gap-2 border-t border-dashed border-line pt-3 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{rupiah(totals.total)}</dd></div>
          </dl>
        </aside>
      </div>
      <NoticeModal open={showErr} onClose={() => setShowErr(false)} kind="bad" title="Tiket tidak bisa dipesan" message={draftError} button="Ubah tiket" />
    </div>
  )
}
