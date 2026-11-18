import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Badge, Empty, Modal, btn, input } from '../../components/ui'
import { PageTitle, Table, td } from '../../components/Table'
import { catName, eventName } from '../../lib/logic'
import { dateTime, methodLabel, rupiah } from '../../lib/format'

export default function Orders() {
  const { state, dispatch } = useDemo()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return state.orders.filter((o) =>
      (!status || o.status === status) &&
      (!s || o.id.toLowerCase().includes(s) || o.buyerName.toLowerCase().includes(s) || o.email.toLowerCase().includes(s)))
  }, [state.orders, q, status])
  const open = state.orders.find((o) => o.id === openId)
  const tickets = open ? state.tickets.filter((t) => t.orderId === open.id) : []
  const set = (outcome: 'paid' | 'failed' | 'expired') => open && dispatch({ type: 'SET_PAYMENT', orderId: open.id, outcome, now: Date.now() })

  return (
    <div>
      <PageTitle title="Pesanan" sub={`${rows.length.toLocaleString('id-ID')} dari ${state.orders.length.toLocaleString('id-ID')} pesanan. Klik baris untuk melihat detail.`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input aria-label="Cari pesanan" className={`${input} max-w-xs`} placeholder="Cari nomor order, nama, atau email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Filter status" className={`${input} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option><option value="paid">Lunas</option><option value="pending">Menunggu</option><option value="failed">Gagal</option><option value="expired">Kedaluwarsa</option>
        </select>
      </div>
      {rows.length === 0 ? <Empty title="Tidak ada pesanan yang cocok" hint="Ubah kata kunci atau filter." action={<button className={btn.ghost} onClick={() => { setQ(''); setStatus('') }}>Hapus filter</button>} /> : (
        <Table head={['Order', 'Pembeli', 'Acara', 'Tiket', 'Total', 'Status', '']} caption="Daftar pesanan">
          {rows.slice(0, 100).map((o) => (
            <tr key={o.id} className="hover:bg-mist/60">
              <td className={`${td} font-mono text-xs font-semibold`}>{o.id}</td>
              <td className={td}>{o.buyerName}</td>
              <td className={td}>{eventName(state, o.eventId)}</td>
              <td className={td}>{o.items.map((i) => `${i.qty}× ${catName(state, i.categoryId)}`).join(', ')}</td>
              <td className={`${td} tabular-nums`}>{rupiah(o.total)}</td>
              <td className={td}><Badge status={o.status} /></td>
              <td className={td}><button className="text-sm font-semibold text-violet hover:underline" onClick={() => setOpenId(o.id)}>Detail</button></td>
            </tr>
          ))}
        </Table>
      )}
      {rows.length > 100 && <p className="mt-2 text-xs text-mute">Menampilkan 100 pesanan pertama. Persempit pencarian untuk melihat yang lain.</p>}

      <Modal open={!!open} onClose={() => setOpenId(null)} title={open ? `Pesanan ${open.id}` : ''}>
        {open && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2"><Badge status={open.status} /><span className="text-mute">{eventName(state, open.eventId)}</span></div>
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-xs text-mute">Pembeli</dt><dd className="font-semibold">{open.buyerName}</dd></div>
              <div><dt className="text-xs text-mute">Email</dt><dd className="break-all font-semibold">{open.email}</dd></div>
              <div><dt className="text-xs text-mute">Metode</dt><dd className="font-semibold">{methodLabel(open.method)}</dd></div>
              <div><dt className="text-xs text-mute">Dibuat</dt><dd className="font-semibold">{dateTime(open.createdAt)}</dd></div>
            </dl>
            <div className="space-y-1 border-t border-line pt-3">
              {open.items.map((i) => <div key={i.categoryId} className="flex justify-between"><span>{i.qty}× {catName(state, i.categoryId)}</span><span className="tabular-nums">{rupiah(i.qty * i.unitPrice)}</span></div>)}
              <div className="flex justify-between text-mute"><span>Biaya layanan simulasi</span><span className="tabular-nums">{rupiah(open.fee)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span className="tabular-nums">{rupiah(open.total)}</span></div>
            </div>
            <div className="border-t border-line pt-3">
              <p className="mb-1 font-semibold">Tiket terkait</p>
              {tickets.length === 0 ? <p className="text-mute">Belum ada tiket diterbitkan.</p> : (
                <ul className="space-y-1">{tickets.map((t) => <li key={t.id} className="flex items-center justify-between gap-2"><Link to={`/buyer/ticket/${t.id}`} className="font-mono text-xs text-violet hover:underline">{t.code}</Link><Badge status={t.status} /></li>)}</ul>
              )}
            </div>
            {open.status === 'pending' && (
              <div className="border-t border-line pt-3">
                <p className="mb-2 font-semibold">Simulasikan pembayaran</p>
                <div className="flex flex-wrap gap-2">
                  <button className={btn.ok} onClick={() => set('paid')}>Berhasil</button>
                  <button className={btn.bad} onClick={() => set('failed')}>Gagal</button>
                  <button className={btn.warn} onClick={() => set('expired')}>Kedaluwarsa</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
