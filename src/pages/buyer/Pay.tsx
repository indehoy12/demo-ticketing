import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Steps } from '../../components/Steps'
import { Badge, btn } from '../../components/ui'
import { catName, eventName } from '../../lib/logic'
import { methodLabel, rupiah } from '../../lib/format'
import { PAY_WINDOW_MS } from '../../lib/seed'
import type { PayMethod } from '../../lib/types'

/** Non-payable illustration. Deliberately not a QR code, not a real VA number. */
export function MethodIllustration({ method }: { method: PayMethod }) {
  if (method === 'qris') {
    return (
      <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-mute/50 bg-mist text-center"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 10px, rgba(20,18,59,.05) 10px 20px)' }}>
        <p className="font-display text-lg font-bold">QRIS Demo</p>
        <p className="mt-1 px-3 text-xs font-semibold text-bad">Ilustrasi. Tidak dapat dipindai atau dibayar.</p>
      </div>
    )
  }
  if (method === 'va') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-mute/50 bg-mist p-5 text-center">
        <p className="font-display text-lg font-bold">Virtual Account Demo</p>
        <p className="mt-2 font-mono text-xl tracking-widest text-mute">•••• •••• ••••</p>
        <p className="mt-2 text-xs font-semibold text-bad">Nomor tidak tersedia pada demo. Tidak ada transfer uang.</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border-2 border-dashed border-mute/50 bg-mist p-5 text-center">
      <p className="font-display text-lg font-bold">E-Wallet Demo</p>
      <p className="mt-2 text-xs font-semibold text-bad">Ilustrasi. Tidak terhubung ke dompet digital apa pun.</p>
    </div>
  )
}

function Countdown({ deadline, onEnd }: { deadline: number; onEnd: () => void }) {
  const [left, setLeft] = useState(Math.max(0, deadline - Date.now()))
  useEffect(() => {
    const t = setInterval(() => {
      const l = Math.max(0, deadline - Date.now())
      setLeft(l)
      if (l === 0) { clearInterval(t); onEnd() }
    }, 1000)
    return () => clearInterval(t)
  }, [deadline, onEnd])
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return <span className="font-mono font-bold tabular-nums">{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
}

export default function Pay() {
  const { id } = useParams()
  const { state, dispatch } = useDemo()
  const order = state.orders.find((o) => o.id === id)
  if (!order) return <NotFound />
  if (order.status !== 'pending') return <Navigate to={`/buyer/result/${order.id}`} replace />

  const set = (outcome: 'paid' | 'failed' | 'expired') =>
    dispatch({ type: 'SET_PAYMENT', orderId: order.id, outcome, now: Date.now() })

  return (
    <div>
      <Steps current={3} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-mute">Nomor order demo</p>
              <h1 className="font-mono text-2xl font-bold">{order.id}</h1>
            </div>
            <Badge status="pending" />
          </div>
          <p className="mt-2 text-sm text-mute">Selesaikan dalam <Countdown deadline={order.createdAt + PAY_WINDOW_MS} onEnd={() => set('expired')} /> (simulasi). Kuota tiket Anda sedang ditahan.</p>

          <div className="mt-6"><p className="mb-3 text-sm font-semibold">Metode: {methodLabel(order.method)}</p><MethodIllustration method={order.method} /></div>

          <div className="mt-6 rounded-xl bg-amber-soft p-4 text-sm leading-relaxed">
            <p className="font-bold">Ini simulasi. Tidak ada uang yang diproses.</p>
            <p className="mt-1 text-ink-2">Pilih hasil pembayaran yang ingin Anda coba. Status pesanan, kuota, tiket, dan dashboard akan ikut berubah.</p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button className={btn.ok} onClick={() => set('paid')}>Simulasikan pembayaran berhasil</button>
            <button className={btn.bad} onClick={() => set('failed')}>Simulasikan pembayaran gagal</button>
            <button className={btn.warn} onClick={() => set('expired')}>Simulasikan pembayaran kedaluwarsa</button>
          </div>
        </section>

        <aside className="h-fit rounded-2xl bg-white p-5 ring-1 ring-line" aria-label="Ringkasan tiket">
          <h2 className="text-lg font-bold">Ringkasan tiket</h2>
          <p className="mt-1 text-sm font-semibold text-violet">{eventName(state, order.eventId)}</p>
          <dl className="mt-3 space-y-2 text-sm">
            {order.items.map((i) => <div key={i.categoryId} className="flex justify-between gap-2"><dt>{i.qty}× {catName(state, i.categoryId)}</dt><dd className="tabular-nums">{rupiah(i.qty * i.unitPrice)}</dd></div>)}
            <div className="flex justify-between gap-2 text-mute"><dt>Biaya layanan simulasi</dt><dd className="tabular-nums">{rupiah(order.fee)}</dd></div>
            <div className="flex justify-between gap-2 border-t border-dashed border-line pt-3 text-base font-bold"><dt>Total pembayaran</dt><dd className="tabular-nums">{rupiah(order.total)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-mute">Pemegang tiket: {order.holderName}</p>
        </aside>
      </div>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-line">
      <h1 className="text-2xl font-bold">Pesanan tidak ditemukan</h1>
      <p className="mt-1 text-mute">Pesanan tidak ditemukan pada sesi ini.</p>
      <Link to="/buyer" className={`${btn.primary} mt-4`}>Kembali ke acara</Link>
    </div>
  )
}
