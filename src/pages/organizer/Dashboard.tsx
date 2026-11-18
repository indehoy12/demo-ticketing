import { Link } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Badge, CountUp, Stat } from '../../components/ui'
import { PageTitle, Table, td } from '../../components/Table'
import { CategoryChart, SalesChart } from '../../components/Charts'
import { catName, eventName, eventStats, salesByCategory, salesByDay } from '../../lib/logic'
import { dateTime, rupiah } from '../../lib/format'

export default function Dashboard() {
  const { state } = useDemo()
  const eid = undefined
  const st = eventStats(state, eid)
  const recent = state.orders.filter((o) => !eid || o.eventId === eid).slice(0, 8)
  return (
    <div>
      <PageTitle title="Dashboard" sub="Ringkasan penjualan simulasi. Angka berubah saat Anda membeli tiket, mensimulasikan pembayaran, atau check-in." />
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Belum check-in" value={<CountUp to={st.ticketsSold - st.checkedIn} />} sub="Tiket terjual yang belum dipindai" />
        <Stat label="Tiket terjual" value={<CountUp to={st.ticketsSold} />} tone="violet" />
        <Stat label="Pendapatan simulasi" value={<CountUp to={st.revenue} format={rupiah} />} sub="Tanpa biaya layanan" tone="ok" />
        <Stat label="Tiket sudah check-in" value={<CountUp to={st.checkedIn} />} sub={`${(st.attendanceRate * 100).toFixed(1)}% dari tiket terjual`} tone="violet" />
        <Stat label="Pesanan pending" value={<CountUp to={st.byStatus.pending} />} tone="warn" />
        <Stat label="Pesanan paid" value={<CountUp to={st.byStatus.paid} />} tone="ok" />
        <Stat label="Pesanan failed" value={<CountUp to={st.byStatus.failed} />} sub={`+ ${st.byStatus.expired} kedaluwarsa`} tone="bad" />
        <Stat label="Total pesanan" value={<CountUp to={st.orders} />} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-3 text-lg font-bold">Tiket terjual, 14 hari terakhir</h2><SalesChart data={salesByDay(state, eid)} /></section>
        <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-3 text-lg font-bold">Penjualan per kategori</h2><CategoryChart data={salesByCategory(state, eid)} /></section>
      </div>
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Transaksi terbaru</h2><Link to="/organizer/orders" className="text-sm font-semibold text-violet">Lihat semua pesanan</Link></div>
        <Table head={['Order', 'Acara', 'Tiket', 'Total', 'Waktu', 'Status']} caption="Transaksi terbaru">
          {recent.map((o) => (
            <tr key={o.id}>
              <td className={`${td} font-mono text-xs font-semibold`}>{o.id}</td>
              <td className={td}>{eventName(state, o.eventId)}</td>
              <td className={td}>{o.items.map((i) => `${i.qty}× ${catName(state, i.categoryId)}`).join(', ')}</td>
              <td className={`${td} tabular-nums`}>{rupiah(o.total)}</td>
              <td className={`${td} text-mute`}>{dateTime(o.createdAt)}</td>
              <td className={td}><Badge status={o.status} /></td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  )
}
