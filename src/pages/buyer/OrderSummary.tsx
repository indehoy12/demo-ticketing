import { Link, useParams } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Badge, btn, Empty } from '../../components/ui'
import { NotFound } from './Pay'
import { catName, eventName } from '../../lib/logic'
import { dateTime, methodLabel, rupiah } from '../../lib/format'

export default function OrderSummary() {
  const { id } = useParams()
  const { state } = useDemo()
  const o = state.orders.find((x) => x.id === id)
  if (!o) return <NotFound />
  const tickets = state.tickets.filter((t) => t.orderId === o.id)
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/buyer/orders" className="mb-4 inline-flex items-center text-sm font-semibold text-mute hover:text-ink">Kembali ke pesanan saya</Link>
      <div className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-medium text-mute">Ringkasan pesanan</p><h1 className="font-mono text-2xl font-bold">{o.id}</h1></div>
          <Badge status={o.status} />
        </div>
        <p className="mt-1 text-sm font-semibold text-violet">{eventName(state, o.eventId)}</p>
        <dl className="mt-4 space-y-2 text-sm">
          {o.items.map((i) => <div key={i.categoryId} className="flex justify-between"><dt>{i.qty}× {catName(state, i.categoryId)} @ {rupiah(i.unitPrice)}</dt><dd className="tabular-nums">{rupiah(i.qty * i.unitPrice)}</dd></div>)}
          <div className="flex justify-between text-mute"><dt>Biaya layanan simulasi</dt><dd className="tabular-nums">{rupiah(o.fee)}</dd></div>
          <div className="flex justify-between border-t border-dashed border-line pt-3 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{rupiah(o.total)}</dd></div>
        </dl>
        <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-mute">Pembeli</dt><dd className="font-semibold">{o.buyerName}</dd></div>
          <div><dt className="text-xs text-mute">Email</dt><dd className="font-semibold break-all">{o.email}</dd></div>
          <div><dt className="text-xs text-mute">Metode</dt><dd className="font-semibold">{methodLabel(o.method)}</dd></div>
          <div><dt className="text-xs text-mute">Dibuat</dt><dd className="font-semibold">{dateTime(o.createdAt)}</dd></div>
        </dl>
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-bold">E-ticket</h2>
          {o.status === 'paid' ? (
            <div className="space-y-2">
              {tickets.map((t) => (
                <Link key={t.id} to={`/buyer/ticket/${t.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 transition hover:border-violet hover:bg-violet-soft">
                  <span><span className="block text-sm font-bold">Tiket {t.seq} dari {t.of} · {catName(state, t.categoryId)}</span><span className="font-mono text-xs text-mute">{t.code}</span></span>
                  <Badge status={t.status} />
                </Link>
              ))}
            </div>
          ) : o.status === 'pending' ? (
            <Empty title="Menunggu pembayaran" hint="E-ticket terbit setelah pembayaran simulasi berhasil." action={<Link to={`/buyer/pay/${o.id}`} className={btn.accent}>Lanjut ke pembayaran</Link>} />
          ) : (
            <Empty title="Tidak ada tiket" hint="Pembayaran tidak berhasil, jadi tiket tidak diterbitkan." />
          )}
        </div>
      </div>
    </div>
  )
}
