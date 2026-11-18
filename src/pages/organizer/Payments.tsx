import { useMemo, useState } from 'react'
import { useDemo } from '../../lib/store'
import { Badge, Empty, Stat, input } from '../../components/ui'
import { PageTitle, Table, td } from '../../components/Table'
import { dateTime, methodLabel, rupiah } from '../../lib/format'

export default function Payments() {
  const { state } = useDemo()
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const rows = useMemo(() => state.payments.filter((p) => (!status || p.status === status) && (!method || p.method === method)), [state.payments, status, method])
  const sum = (s: string) => state.payments.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0)
  return (
    <div>
      <PageTitle title="Pembayaran" sub="Catatan pembayaran simulasi. Status selalu sama dengan status pesanan." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Diterima (simulasi)" value={rupiah(sum('paid'))} tone="ok" />
        <Stat label="Menunggu" value={rupiah(sum('pending'))} tone="warn" />
        <Stat label="Gagal" value={rupiah(sum('failed'))} tone="bad" />
        <Stat label="Kedaluwarsa" value={rupiah(sum('expired'))} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <select aria-label="Filter status" className={`${input} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option><option value="paid">Lunas</option><option value="pending">Menunggu</option><option value="failed">Gagal</option><option value="expired">Kedaluwarsa</option></select>
        <select aria-label="Filter metode" className={`${input} w-auto`} value={method} onChange={(e) => setMethod(e.target.value)}><option value="">Semua metode</option><option value="qris">QRIS Demo</option><option value="va">Virtual Account Demo</option><option value="ewallet">E-Wallet Demo</option></select>
      </div>
      {rows.length === 0 ? <Empty title="Tidak ada pembayaran yang cocok" /> : (
        <Table head={['Pembayaran', 'Order', 'Metode', 'Jumlah', 'Diperbarui', 'Status']} caption="Daftar pembayaran simulasi">
          {rows.slice(0, 100).map((p) => (
            <tr key={p.id}>
              <td className={`${td} font-mono text-xs font-semibold`}>{p.id}</td>
              <td className={`${td} font-mono text-xs`}>{p.orderId}</td>
              <td className={td}>{methodLabel(p.method)}</td>
              <td className={`${td} tabular-nums`}>{rupiah(p.amount)}</td>
              <td className={`${td} text-mute`}>{dateTime(p.updatedAt)}</td>
              <td className={td}><Badge status={p.status} /></td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  )
}
