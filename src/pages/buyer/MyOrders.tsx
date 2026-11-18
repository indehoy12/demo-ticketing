import { Link } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Badge, Empty, btn } from '../../components/ui'
import { eventName } from '../../lib/logic'
import { dateTime, rupiah } from '../../lib/format'

export default function MyOrders() {
  const { state } = useDemo()
  const mine = state.myOrderIds.map((id) => state.orders.find((o) => o.id === id)).filter(Boolean) as typeof state.orders
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold">Pesanan saya</h1>
      <p className="mb-6 mt-1 text-mute">Pesanan yang Anda buat pada sesi demo ini.</p>
      {mine.length === 0 ? (
        <Empty title="Belum ada pesanan" hint="Beli tiket untuk mencoba alurnya." action={<Link to="/buyer" className={btn.primary}>Beli tiket</Link>} />
      ) : (
        <div className="space-y-3">
          {mine.map((o) => (
            <Link key={o.id} to={o.status === 'pending' ? `/buyer/pay/${o.id}` : `/buyer/order/${o.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition hover:ring-violet">
              <div className="min-w-0"><p className="font-mono text-sm font-bold">{o.id}</p><p className="truncate text-sm text-mute">{eventName(state, o.eventId)} · {dateTime(o.createdAt)}</p></div>
              <div className="text-right"><p className="font-bold tabular-nums">{rupiah(o.total)}</p><Badge status={o.status} /></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
