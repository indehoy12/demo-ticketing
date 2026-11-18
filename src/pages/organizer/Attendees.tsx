import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { Badge, Empty, input } from '../../components/ui'
import { PageTitle, Table, td } from '../../components/Table'
import { catName, eventName } from '../../lib/logic'
import { dateTime } from '../../lib/format'

export default function Attendees() {
  const { state } = useDemo()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return [...state.tickets].reverse().filter((t) => (!status || t.status === status) &&
      (!s || t.holderName.toLowerCase().includes(s) || t.code.toLowerCase().includes(s)))
  }, [state.tickets, q, status])
  return (
    <div>
      <PageTitle title="Peserta" sub={`${rows.length.toLocaleString('id-ID')} tiket. Peserta muncul setelah pembayaran berhasil dan berubah saat check-in.`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input aria-label="Cari peserta" className={`${input} max-w-xs`} placeholder="Cari nama atau kode tiket" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Filter status" className={`${input} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua status</option><option value="valid">Belum check-in</option><option value="used">Sudah check-in</option></select>
      </div>
      {rows.length === 0 ? <Empty title="Tidak ada peserta yang cocok" /> : (
        <Table head={['Peserta', 'Acara', 'Kategori', 'Kode tiket', 'Check-in', 'Status']} caption="Daftar peserta">
          {rows.slice(0, 100).map((t) => (
            <tr key={t.id}>
              <td className={`${td} font-semibold`}>{t.holderName}</td>
              <td className={td}>{eventName(state, t.eventId)}</td>
              <td className={td}>{catName(state, t.categoryId)}</td>
              <td className={td}><Link to={`/buyer/ticket/${t.id}`} className="font-mono text-xs text-violet hover:underline">{t.code}</Link></td>
              <td className={`${td} text-mute`}>{t.usedAt ? dateTime(t.usedAt) : '—'}</td>
              <td className={td}><Badge status={t.status} /></td>
            </tr>
          ))}
        </Table>
      )}
      {rows.length > 100 && <p className="mt-2 text-xs text-mute">Menampilkan 100 tiket pertama. Gunakan pencarian untuk menemukan yang lain.</p>}
    </div>
  )
}
