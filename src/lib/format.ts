export const rupiah = (n: number) =>
  'Rp' + Math.round(n).toLocaleString('id-ID')

export const dateLong = (iso: string | number) =>
  new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

export const dateShort = (iso: string | number) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export const dateTime = (ts: number) =>
  new Date(ts).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

export const timeOnly = (ts: number) =>
  new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const dayKey = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const methodLabel = (m: string) =>
  m === 'qris' ? 'QRIS Demo' : m === 'va' ? 'Virtual Account Demo' : 'E-Wallet Demo'

export const statusLabel = (s: string) =>
  ({ pending: 'Menunggu', paid: 'Lunas', failed: 'Gagal', expired: 'Kedaluwarsa', valid: 'Belum check-in', used: 'Sudah check-in' } as Record<string, string>)[s] ?? s

// Only allow plain text to reach the DOM from user inputs (React escapes output;
// this also trims control characters and limits length).
export const clean = (s: string, max = 80) =>
  s.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
