import { Link } from 'react-router-dom'
import { Logo, ConsultCta } from '../components/Layouts'
import { QrImage } from '../components/QrImage'
import { LocalWatermark } from '../components/Watermark'
import { BRAND } from '../lib/constants'
import { Credit } from '../components/Credit'
import { FLOW } from '../components/Guide'
import { btn } from '../components/ui'

const choices = [
  { to: '/buyer', title: 'Coba sebagai pembeli', desc: 'Pilih tiket, beli, simulasikan pembayaran, dan terima e-ticket QR.', bar: 'bg-amber' },
  { to: '/organizer', title: 'Jelajahi dashboard penyelenggara', desc: 'Lihat penjualan, pesanan, pembayaran, peserta, dan laporan secara langsung.', bar: 'bg-violet' },
  { to: '/checkin', title: 'Coba QR check-in', desc: 'Pindai e-ticket dengan kamera atau pakai tombol simulasi cepat.', bar: 'bg-ok' },
]

export default function Welcome() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5"><Logo /><span className="rounded-full bg-amber px-3 py-1 text-xs font-bold">Demo interaktif</span></header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-10 pt-4 lg:grid-cols-[1.1fr_.9fr] lg:pt-10">
        <span aria-hidden className="blob-a pointer-events-none absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
        <span aria-hidden className="blob-b pointer-events-none absolute right-0 top-24 -z-10 h-72 w-72 rounded-full bg-amber/25 blur-3xl" />
        <div className="stagger">
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl xl:text-6xl">Event Ticketing &amp; Payment System</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
            Coba pengalaman menjual tiket, melakukan pembelian, menerima e-ticket, dan check-in dalam satu aplikasi.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/buyer" className={`${btn.accent} ring px-7 py-3.5 text-base`}>Mulai demo</Link>
            <Link to="/organizer" className={`${btn.ghost} px-6 py-3.5 text-base`}>Lihat dashboard</Link>
          </div>
          <p className="mt-5 inline-flex max-w-xl items-start rounded-xl bg-amber-soft px-4 py-3 text-sm font-medium text-ink">
            Ini adalah demo interaktif. Semua pembayaran dan transaksi hanya simulasi.
          </p>
        </div>

        {/* The memorable element: a real demo ticket that floats, with a scan line over the QR */}
        <div className="floaty relative z-[60] mx-auto w-full max-w-sm" aria-hidden>
          <div className="stub relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-ink/20 ring-1 ring-line" style={{ ['--stub-y' as string]: '62%' }}>
            <div className="hero-grad p-5 text-white">
              <p className="text-xs font-medium text-white/60">Tiket demo</p>
              <p className="font-display text-2xl font-bold leading-tight">Tech Innovation Festival 2026</p>
              <p className="mt-2 text-sm text-white/70">12 Desember 2026 · Jakarta</p>
            </div>
            <div className="p-5 pb-8">
              <div className="flex items-end justify-between">
                <div><p className="text-xs text-mute">Kategori</p><p className="font-bold">VIP</p></div>
                <div className="text-right"><p className="text-xs text-mute">Pemegang</p><p className="font-bold">Nadia Contoh</p></div>
              </div>
            </div>
            <div className="perf mx-5" />
            <div className="relative flex flex-col items-center p-5">
              <LocalWatermark />
              <div className="relative z-[60] overflow-hidden rounded-lg">
                <QrImage code="SRT-WLCM-DEMO0" size={150} />
                <span className="scanline absolute inset-x-0 h-0.5 bg-amber shadow-[0_0_12px_3px_rgba(255,123,0,.6)]" />
              </div>
              <p className="mt-2 font-mono text-xs text-mute">SRT-WLCM-DEMO0</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10" aria-label="Alur demo">
        <h2 className="mb-4 text-xl font-bold">Alur demo, sekitar 3 menit</h2>
        <ol className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {FLOW.map((f, n) => (
            <li key={f.label} className="lift rounded-2xl bg-white p-4 ring-1 ring-line">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${n === 0 ? 'bg-amber text-ink' : 'bg-violet-soft text-violet'}`}>{n + 1}</span>
              <p className="mt-3 text-sm font-bold">{f.label}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10" aria-label="Pilih cara mencoba demo">
        <div className="stagger grid gap-4 md:grid-cols-3">
          {choices.map((c) => (
            <Link key={c.to} to={c.to} className="group lift relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-line">
              <span className={`absolute inset-x-0 top-0 h-1.5 ${c.bar}`} />
              <h2 className="text-xl font-bold">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">{c.desc}</p>
              <p className="mt-4 text-sm font-bold text-violet transition group-hover:translate-x-1">Buka</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
          <p className="max-w-lg text-sm text-mute">
            Demo oleh {BRAND}. Data acara, harga, dan pembeli bersifat fiktif dan hanya tersimpan di browser Anda selama sesi ini.
          </p>
          <ConsultCta />
        </div>
      </footer>
      <Credit />
    </div>
  )
}
