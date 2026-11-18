import { useDemo } from '../../lib/store'
import { btn, Stat } from '../../components/ui'
import { PageTitle, Table, td } from '../../components/Table'
import { CategoryChart, SalesChart } from '../../components/Charts'
import { catName, eventName, eventStats, salesByCategory, salesByDay } from '../../lib/logic'
import { rupiah, statusLabel } from '../../lib/format'

const safe = (v: string | number) => {
  const s = String(v)
  const guarded = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s // block spreadsheet formula injection
  return `"${guarded.replace(/"/g, '""')}"`
}

export default function Reports() {
  const { state } = useDemo()
  const st = eventStats(state)

  const exportCsv = () => {
    const lines = [
      [safe('DEMO — SUMBER REJEKI TECH'), safe('Data simulasi, bukan laporan keuangan')].join(','),
      ['Order', 'Acara', 'Kategori', 'Jumlah', 'Subtotal', 'Biaya layanan simulasi', 'Total', 'Status'].map(safe).join(','),
      ...state.orders.map((o) => [o.id, eventName(state, o.eventId), o.items.map((i) => `${i.qty}x ${catName(state, i.categoryId)}`).join(' + '),
        o.items.reduce((a, i) => a + i.qty, 0), o.subtotal, o.fee, o.total, statusLabel(o.status)].map(safe).join(',')),
    ]
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'DEMO-laporan-penjualan.csv'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div>
      <PageTitle title="Laporan penjualan" sub="Semua angka berasal dari data simulasi sesi ini."
        right={<button className={btn.ghost} onClick={exportCsv}>Unduh CSV demo</button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total tiket terjual" value={st.ticketsSold.toLocaleString('id-ID')} tone="violet" />
        <Stat label="Pendapatan simulasi" value={rupiah(st.revenue)} tone="ok" />
        <Stat label="Biaya layanan simulasi" value={rupiah(st.fees)} sub="Dibayar pembeli" />
        <Stat label="Tingkat check-in" value={`${(st.attendanceRate * 100).toFixed(1)}%`} sub={`${st.checkedIn} dari ${st.ticketsSold} tiket`} tone="violet" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-3 text-lg font-bold">Tiket terjual per hari</h2><SalesChart data={salesByDay(state)} /></section>
        <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-3 text-lg font-bold">Per kategori</h2><CategoryChart data={salesByCategory(state)} /></section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section><h2 className="mb-2 text-lg font-bold">Status transaksi</h2>
          <Table head={['Status', 'Pesanan']} caption="Status transaksi">
            {(['paid', 'pending', 'failed', 'expired'] as const).map((k) => <tr key={k}><td className={td}>{statusLabel(k)}</td><td className={`${td} tabular-nums`}>{st.byStatus[k]}</td></tr>)}
          </Table></section>
        <section><h2 className="mb-2 text-lg font-bold">Check-in per acara</h2>
          <Table head={['Acara', 'Check-in', 'Terjual']} caption="Check-in per acara">
            {state.events.map((e) => { const s = eventStats(state, e.id); return <tr key={e.id}><td className={td}>{e.name}</td><td className={`${td} tabular-nums`}>{s.checkedIn}</td><td className={`${td} tabular-nums`}>{s.ticketsSold}</td></tr> })}
          </Table></section>
      </div>
    </div>
  )
}
