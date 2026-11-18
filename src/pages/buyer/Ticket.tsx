import { Link, useParams } from 'react-router-dom'
import { useDemo } from '../../lib/store'
import { QrImage } from '../../components/QrImage'
import { LocalWatermark } from '../../components/Watermark'
import { Badge, btn } from '../../components/ui'
import { catName } from '../../lib/logic'
import { dateLong } from '../../lib/format'

export default function Ticket() {
  const { id } = useParams()
  const { state } = useDemo()
  const t = state.tickets.find((x) => x.id === id)
  const ev = t && state.events.find((e) => e.id === t.eventId)
  if (!t || !ev) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-line">
        <h1 className="text-2xl font-bold">Tiket tidak ditemukan</h1>
        <p className="mt-1 text-mute">Tiket hanya terbit setelah pembayaran simulasi berhasil.</p>
        <Link to="/buyer/orders" className={`${btn.primary} mt-4`}>Lihat pesanan saya</Link>
      </div>
    )
  }
  const hue = ev.hue
  return (
    <div className="mx-auto max-w-sm">
      <Link to={`/buyer/order/${t.orderId}`} className="mb-4 inline-flex items-center text-sm font-semibold text-mute hover:text-ink">Kembali ke ringkasan pesanan</Link>
      <article className="stub relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-ink/10 ring-1 ring-line" style={{ ['--stub-y' as string]: '58%', ['--notch' as string]: '12px' }} aria-label={`E-ticket ${ev.name}`}>
        <LocalWatermark />
        <div className="relative p-5 text-white" style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 16%), hsl(${hue} 80% 42%))` }}>
          <p className="text-xs font-semibold text-white/70">E-ticket demo</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight">{ev.name}</h1>
        </div>
        <div className="relative space-y-3 p-5 pb-9">
          <Row k="Nama peserta" v={t.holderName} />
          <div className="grid grid-cols-2 gap-3">
            <Row k="Kategori" v={catName(state, t.categoryId)} />
            <Row k="Tiket" v={`${t.seq} dari ${t.of}`} />
          </div>
          <Row k="Tanggal" v={dateLong(ev.date)} />
          <Row k="Lokasi" v={`${ev.venue}, ${ev.city}`} />
        </div>
        <div className="perf mx-5" />
        <div className="relative flex flex-col items-center px-5 pb-6 pt-5">
          <QrImage code={t.code} size={190} />
          <p className="relative z-[60] mt-3 font-mono text-sm font-semibold">{t.code}</p>
          <div className="relative z-[60] mt-2"><Badge status={t.status} /></div>
          <p className="relative z-[60] mt-3 text-center text-xs text-mute">Tiket demo. Tidak berlaku untuk acara sungguhan.</p>
        </div>
      </article>
      <div className="mt-5 flex flex-col gap-2 no-print">
        <Link to={`/checkin?code=${encodeURIComponent(t.code)}&event=${t.eventId}`} className={btn.accent}>Coba check-in dengan tiket ini</Link>
        <button className={btn.ghost} onClick={() => window.print()}>Cetak atau simpan sebagai PDF</button>
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return <div><p className="text-xs font-medium text-mute">{k}</p><p className="font-bold leading-snug">{v}</p></div>
}
