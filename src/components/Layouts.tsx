import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Watermark, DemoPill } from './Watermark'
import { useDemo } from '../lib/store'
import { SITE_URL, BRAND } from '../lib/constants'
import { btn } from './ui'
import { Credit } from './Credit'
import { Guide } from './Guide'

export function Logo({ dark = false, stack = false }: { dark?: boolean; stack?: boolean }) {
  return (
    <Link to="/" className={`flex ${stack ? 'flex-col items-start gap-1.5' : 'items-center gap-3'}`} aria-label="Kembali ke halaman awal demo">
      <img src={dark ? '/logo-light.png' : '/logo.png'} alt={BRAND} className={dark ? 'h-7 w-auto' : 'h-7 w-auto sm:h-8'} />
      <span className={`font-display text-sm font-bold leading-tight ${dark ? 'text-white/90' : stack ? 'text-ink' : 'border-l border-line pl-3 text-ink'}`}>
        Event Ticketing<span className="block text-[11px] font-medium opacity-70">Demo interaktif</span>
      </span>
    </Link>
  )
}

export function ModeSwitch() {
  const { pathname } = useLocation()
  const items = [
    { to: '/buyer', label: 'Pembeli', active: pathname.startsWith('/buyer') },
    { to: '/organizer', label: 'Penyelenggara', active: pathname.startsWith('/organizer') },
    { to: '/checkin', label: 'Check-in', active: pathname.startsWith('/checkin') },
  ]
  return (
    <nav aria-label="Pilih mode demo" className={`flex min-w-0 flex-1 basis-full rounded-xl p-1 sm:inline-flex sm:flex-none sm:basis-auto bg-white ring-1 ring-line`}>
      {items.map((i) => (
        <Link
          key={i.to} to={i.to} aria-current={i.active ? 'page' : undefined}
          className={`flex-1 whitespace-nowrap rounded-lg px-2 py-2 text-center sm:flex-none sm:px-3 sm:py-1.5 text-xs font-semibold transition sm:text-sm ${
            i.active ? 'bg-ink text-white' : 'text-mute hover:text-ink'}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  )
}

export function ConsultCta({ compact = false }: { compact?: boolean }) {
  return (
    <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className={compact ? btn.accent : `${btn.accent} w-full sm:w-auto`}>
      Konsultasi dengan {BRAND}
    </a>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Watermark />
      {children}
    </>
  )
}

/* ------------------------------- Buyer -------------------------------- */

export function BuyerLayout() {
  const { state } = useDemo()
  const { pathname } = useLocation()
  const mine = state.myOrderIds.length
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 [@media(max-height:500px)]:static border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 sm:py-3">
          <Logo />
          <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:w-auto sm:justify-end">
            <NavLink to="/buyer/orders" className={({ isActive }) => `whitespace-nowrap text-sm font-semibold ${isActive ? 'text-violet' : 'text-mute hover:text-ink'}`}>
              Pesanan saya{mine > 0 && <span className="ml-1.5 rounded-full bg-violet-soft px-1.5 py-0.5 text-[11px] text-violet">{mine}</span>}
            </NavLink>
            <ModeSwitch />
          </div>
        </div>
      </header>
      <div className="bg-amber px-4 py-1.5 text-center text-xs font-semibold text-ink">
        Demo interaktif. Semua pembayaran dan transaksi hanya simulasi, tidak ada uang sungguhan.
      </div>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10"><Guide /><div key={pathname} className="page-in"><Outlet /></div></main>
      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-bold">Ingin sistem tiket seperti ini untuk acara Anda?</p>
            <p className="text-sm text-mute">Diskusikan kebutuhan Anda dengan tim {BRAND}.</p>
          </div>
          <ConsultCta />
        </div>
      </footer>
      <Credit />
    </div>
  )
}

/* ----------------------------- Organizer ------------------------------ */

const nav: { to: string; label: string }[] = [
  { to: '/organizer', label: 'Dashboard' },
  { to: '/organizer/categories', label: 'Kategori tiket' },
  { to: '/organizer/orders', label: 'Pesanan' },
  { to: '/organizer/payments', label: 'Pembayaran' },
  { to: '/organizer/attendees', label: 'Peserta' },
  { to: '/organizer/checkin', label: 'QR check-in' },
  { to: '/organizer/reports', label: 'Laporan' },
  { to: '/organizer/about', label: 'Tentang demo' },
]

export function OrganizerLayout() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[65] w-64 transform border-r border-white/10 bg-ink p-4 shadow-xl transition-transform lg:shadow-none lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between"><Logo dark stack /><button className="rounded px-2 py-1 text-sm font-semibold text-white/70 lg:hidden" onClick={() => setOpen(false)}>Tutup</button></div>
        <nav className="space-y-1" aria-label="Menu penyelenggara">
          {nav.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.to === '/organizer'} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white/15 text-white shadow-[inset_3px_0_0_#ff7b00]' : 'text-white/75 hover:translate-x-0.5 hover:bg-white/10 hover:text-white'}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-white/75">
          Mode ini hanya tampilan, bukan login. Data hanya ada di browser Anda dan hilang saat tab ditutup.
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-[60] bg-ink/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 [@media(max-height:500px)]:static flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-line lg:hidden" onClick={() => setOpen(true)}>Menu</button>
            <DemoPill />
            <span className="hidden text-sm font-semibold text-mute sm:inline">Pratinjau penyelenggara</span>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <ModeSwitch />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6"><Guide /><div key={pathname} className="page-in"><Outlet /></div></main>
        <Credit />
      </div>
    </div>
  )
}

/* ------------------------- Standalone check-in ------------------------ */

export function CheckinLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 [@media(max-height:500px)]:static border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Logo />
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <ModeSwitch />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6"><Guide /><div key={pathname} className="page-in"><Outlet /></div></main>
      <Credit />
    </div>
  )
}
