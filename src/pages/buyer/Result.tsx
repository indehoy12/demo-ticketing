import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Steps } from '../../components/Steps'
import { btn, Mark } from '../../components/ui'
import { NotFound } from './Pay'
import { catName, eventName } from '../../lib/logic'
import { rupiah } from '../../lib/format'

export default function Result() {
  const { id } = useParams()
  const { state, dispatch } = useDemo()
  const nav = useNavigate()
  const order = state.orders.find((o) => o.id === id)
  if (!order) return <NotFound />
  if (order.status === 'pending') return <Navigate to={`/buyer/pay/${order.id}`} replace />

  const retry = () => {
    const qty: Record<string, number> = {}
    for (const i of order.items) qty[i.categoryId] = i.qty
    dispatch({ type: 'SET_DRAFT', draft: { eventId: order.eventId, qty } })
    nav(`/buyer/event/${order.eventId}`)
  }

  if (order.status === 'paid') {
    return (
      <div>
        <Steps current={4} />
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center ring-1 ring-line sm:p-8">
          <div className="mx-auto w-fit"><Mark kind="ok" size={64} /></div>
          <h1 className="mt-4 text-3xl font-extrabold">Pembayaran berhasil (simulasi)</h1>
          <p className="mt-2 text-mute">Pesanan <span className="font-mono font-semibold text-ink">{order.id}</span> lunas. {order.ticketIds.length} e-ticket demo sudah diterbitkan.</p>
          <p className="mt-1 text-sm text-mute">{eventName(state, order.eventId)} · {rupiah(order.total)}</p>
          <div className="mt-6 space-y-2 text-left">
            {order.ticketIds.map((tid) => {
              const t = state.tickets.find((x) => x.id === tid)
              if (!t) return null
              return (
                <Link key={tid} to={`/buyer/ticket/${tid}`} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 transition hover:border-violet hover:bg-violet-soft">
                  <span><span className="block text-sm font-bold">Tiket {t.seq} dari {t.of} · {catName(state, t.categoryId)}</span><span className="font-mono text-xs text-mute">{t.code}</span></span>
                  <span className="text-sm font-semibold text-violet">Buka</span>
                </Link>
              )
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={`/buyer/order/${order.id}`} className={btn.ghost}>Lihat ringkasan pesanan</Link>
            <Link to="/buyer" className={btn.primary}>Beli tiket lagi</Link>
          </div>
        </div>
      </div>
    )
  }

  const expired = order.status === 'expired'
  return (
    <div>
      <Steps current={3} />
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-center ring-1 ring-line sm:p-8">
        <div className="mx-auto w-fit"><Mark kind="bad" size={64} /></div>
        <h1 className="mt-4 text-3xl font-extrabold">{expired ? 'Waktu pembayaran habis' : 'Pembayaran gagal'}</h1>
        <p className="mt-2 text-mute">
          {expired ? 'Batas waktu simulasi terlewati.' : 'Simulasi pembayaran tidak berhasil.'} Tidak ada tiket yang diterbitkan dan kuota yang ditahan sudah dikembalikan.
        </p>
        <p className="mt-1 font-mono text-sm text-mute">{order.id}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button className={btn.accent} onClick={retry}>Coba lagi</button>
          <Link to="/buyer" className={btn.ghost}>Kembali ke acara</Link>
        </div>
      </div>
    </div>
  )
}
