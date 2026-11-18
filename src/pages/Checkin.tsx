import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useDemo } from '../lib/store'
import { btn, input, Badge, Mark, Modal, NoticeModal } from '../components/ui'
import { catName, evaluateScan, eventName, eventStats } from '../lib/logic'
import { qrPayload } from '../lib/seed'
import { dateTime, clean } from '../lib/format'
import type { ScanOutcome } from '../lib/types'

const look: Record<ScanOutcome, { title: string; kind: 'ok' | 'bad'; box: string }> = {
  valid: { title: 'Check-in berhasil', kind: 'ok', box: 'bg-ok-soft text-ok' },
  used: { title: 'Tiket sudah digunakan', kind: 'bad', box: 'bg-bad-soft text-bad' },
  invalid: { title: 'Tiket tidak valid', kind: 'bad', box: 'bg-bad-soft text-bad' },
  wrong_event: { title: 'Salah acara', kind: 'bad', box: 'bg-bad-soft text-bad' },
}

export default function Checkin() {
  const { state, dispatch } = useDemo()
  const [params] = useSearchParams()
  const initialGate = state.events[0].id
  const [gate] = useState(initialGate)
  const [manual, setManual] = useState(params.get('code') ?? '')
  const [result, setResult] = useState<{ outcome: ScanOutcome; message: string; ticketId?: string } | null>(null)
  const [note, setNote] = useState('')
  const [showCamErr, setShowCamErr] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [cam, setCam] = useState<'off' | 'starting' | 'on' | 'error'>('off')
  const [camMsg, setCamMsg] = useState('')

  const stateRef = useRef(state); stateRef.current = state
  const gateRef = useRef(gate); gateRef.current = gate
  const lock = useRef(false)
  const scanner = useRef<Html5Qrcode | null>(null)

  const handle = useCallback((raw: string) => {
    const s = stateRef.current
    const r = evaluateScan(s, raw, gateRef.current)
    setResult({ outcome: r.outcome, message: r.message, ticketId: r.ticket?.id })
    setModalOpen(true)
    setNote('')
    dispatch({ type: 'SCAN', raw, gateEventId: gateRef.current, now: Date.now() })
  }, [dispatch])

  const stopCamera = useCallback(async () => {
    const sc = scanner.current
    scanner.current = null
    if (sc) { try { await sc.stop() } catch { /* not running */ } try { sc.clear() } catch { /* ignore */ } }
    setCam('off')
  }, [])

  const startCamera = async () => {
    setCam('starting'); setCamMsg('')
    try {
      const sc = new Html5Qrcode('qr-reader')
      scanner.current = sc
      await sc.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => { if (lock.current) return; lock.current = true; handle(text) },
        () => { /* no QR in frame: ignore */ },
      )
      setCam('on')
    } catch (e) {
      scanner.current = null
      setCam('error')
      const msg = String(e)
      setCamMsg(/Permission|NotAllowed/i.test(msg)
        ? 'Izin kamera ditolak. Izinkan kamera di pengaturan browser, atau gunakan simulasi cepat di bawah.'
        : /NotFound|Requested device/i.test(msg)
          ? 'Kamera tidak ditemukan di perangkat ini. Gunakan simulasi cepat atau masukkan kode tiket.'
          : 'Kamera tidak dapat dijalankan. Gunakan simulasi cepat atau masukkan kode tiket.')
      setShowCamErr(true)
    }
  }
  useEffect(() => () => { const sc = scanner.current; scanner.current = null; if (sc) sc.stop().then(() => sc.clear()).catch(() => {}) }, [])

  const next = () => { lock.current = false; setResult(null); setNote('') }
  const run = (raw: string) => { lock.current = true; handle(raw) }

  const quick = (kind: ScanOutcome) => {
    const tk = state.tickets
    let raw = ''
    if (kind === 'valid') {
      const t = tk.find((x) => x.eventId === gate && x.status === 'valid')
      if (!t) { setNote('Semua tiket acara ini sudah check-in. Beli tiket baru di mode pembeli.'); return }
      raw = qrPayload(t.code)
    } else if (kind === 'used') {
      const t = tk.find((x) => x.eventId === gate && x.status === 'used')
      if (!t) { setNote('Belum ada tiket yang check-in untuk acara ini. Jalankan "QR valid" dulu, lalu coba lagi.'); return }
      raw = qrPayload(t.code)
    } else if (kind === 'wrong_event') {
      const t = tk.find((x) => x.eventId !== gate && x.status === 'valid') ?? tk.find((x) => x.eventId !== gate)
      if (!t) { setNote('Tidak ada tiket dari acara lain.'); return }
      raw = qrPayload(t.code)
    } else raw = qrPayload('SRT-ZZZZ-0000X')
    run(raw)
  }

  const submitManual = (e: FormEvent) => {
    e.preventDefault()
    const c = clean(manual, 40)
    if (!c) { setNote('Masukkan kode tiket, misalnya SRT-XXXX-XXXXX.'); return }
    run(c.startsWith('DEMO-TICKET:') ? c : qrPayload(c))
  }

  const st = eventStats(state, gate)
  const t = result?.ticketId ? state.tickets.find((x) => x.id === result.ticketId) : undefined
  const L = result ? look[result.outcome] : null
  const scans = state.scans.slice(0, 6)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">QR check-in</h1>
        <p className="mt-1 text-sm text-mute">Pindai e-ticket demo dengan kamera, masukkan kode, atau pakai simulasi cepat. Validasi hanya berjalan di browser ini.</p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="mb-1 text-sm font-semibold">Pintu masuk untuk acara</p>
          <p className="rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold ring-1 ring-line">{state.events[0].name}</p>
        </div>
        <p className="rounded-xl bg-white px-4 py-2.5 text-sm ring-1 ring-line"><strong className="tabular-nums">{st.checkedIn}</strong> dari <strong className="tabular-nums">{st.ticketsSold}</strong> peserta sudah check-in</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 ring-1 ring-line" aria-label="Pemindai kamera">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Pemindai kamera</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-mute"><span className={`h-2 w-2 rounded-full ${cam === 'on' ? 'bg-ok' : cam === 'error' ? 'bg-bad' : 'bg-line'}`} />{cam === 'on' ? 'Kamera aktif' : cam === 'starting' ? 'Memulai…' : cam === 'error' ? 'Kamera bermasalah' : 'Kamera mati'}</span></div>
          <div className="relative overflow-hidden rounded-xl bg-ink">
            <div id="qr-reader" className="min-h-[240px] w-full" />
            {cam !== 'on' && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">Tekan "Nyalakan kamera" lalu arahkan ke QR pada e-ticket.</div>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {cam === 'on' || cam === 'starting'
              ? <button className={btn.ghost} onClick={stopCamera} disabled={cam === 'starting'}>Matikan kamera</button>
              : <button className={btn.primary} onClick={startCamera}>Nyalakan kamera</button>}
          </div>
          <form onSubmit={submitManual} className="mt-4 flex gap-2">
            <label htmlFor="manual" className="sr-only">Kode tiket</label>
            <input id="manual" className={`${input} font-mono`} placeholder="Kode tiket, mis. SRT-XXXX-XXXXX" value={manual} onChange={(e) => setManual(e.target.value)} maxLength={40} autoComplete="off" />
            <button className={btn.ghost} type="submit">Periksa</button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line" aria-label="Simulasi cepat">
            <h2 className="mb-3 text-lg font-bold">Simulasi cepat</h2>
            <div className="grid grid-cols-2 gap-2">
              <button className={btn.ok} onClick={() => quick('valid')}>QR valid</button>
              <button className={btn.warn} onClick={() => quick('used')}>QR sudah digunakan</button>
              <button className={btn.bad} onClick={() => quick('invalid')}>QR tidak valid</button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-line" aria-label="Hasil terakhir">
            <h2 className="mb-2 text-lg font-bold">Hasil terakhir</h2>
            {!result || !L ? <p className="text-sm text-mute">Belum ada pemindaian. Hasil akan muncul di jendela hasil.</p> : (
              <p className={`rounded-xl px-4 py-3 text-sm font-bold ${L.box}`}>{L.title}. {result.message}</p>
            )}
          </div>
        </section>
      </div>

      {scans.length > 0 && (
        <section className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-line" aria-label="Riwayat pemindaian">
          <h2 className="mb-2 text-lg font-bold">Riwayat pemindaian</h2>
          <ul className="divide-y divide-line text-sm">
            {scans.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate font-mono text-xs text-mute">{s.raw.replace('DEMO-TICKET:', '')}</span>
                <span className="flex shrink-0 items-center gap-2"><Badge status={s.outcome === 'valid' ? 'paid' : s.outcome === 'used' ? 'pending' : 'failed'} label={look[s.outcome].title} /><span className="text-xs text-mute">{dateTime(s.at)}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal open={!!result && modalOpen} onClose={() => { setModalOpen(false); next() }} title={L ? L.title : ''}
        footer={<button className={btn.primary} onClick={() => { setModalOpen(false); next() }}>Pindai berikutnya</button>}>
        {result && L && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Mark kind={L.kind} size={72} />
            <p className="text-base font-semibold">{result.message}</p>
            {t && (
              <dl className="grid w-full grid-cols-2 gap-2 rounded-xl bg-mist p-3 text-left text-sm">
                <div><dt className="text-xs text-mute">Peserta</dt><dd className="font-bold">{t.holderName}</dd></div>
                <div><dt className="text-xs text-mute">Kategori</dt><dd className="font-bold">{catName(state, t.categoryId)}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-mute">Acara pada tiket</dt><dd className="font-bold">{eventName(state, t.eventId)}</dd></div>
              </dl>
            )}
          </div>
        )}
      </Modal>
      <NoticeModal open={!!note} onClose={() => setNote('')} title="Simulasi belum bisa dijalankan" message={note} />
      <NoticeModal open={showCamErr} onClose={() => setShowCamErr(false)} kind="bad" title="Kamera tidak bisa dipakai" message={camMsg} />
    </div>
  )
}
