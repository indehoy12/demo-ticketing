/**
 * SATU-SATUNYA ACARA pada demo ini.
 * Ubah isi file ini sesuai permintaan klien (nama, tanggal, lokasi, harga, kuota).
 * Jangan menambah acara kedua: aplikasi sengaja dibuat untuk satu acara saja.
 */
export const EVENT = {
  id: 'tech',
  name: 'Tech Innovation Festival 2026',
  tagline: 'Dua hari ide, produk, dan kolaborasi teknologi.',
  description:
    'Festival teknologi fiktif dengan panggung utama, demo produk, dan sesi jejaring. Seluruh konten, pembicara, dan lokasi pada demo ini adalah data contoh.',
  date: '2026-12-12T09:00:00+07:00',
  doorsOpen: '08:00 WIB',
  venue: 'Nusantara Convention Hall (contoh)',
  city: 'Jakarta',
  hue: 218, // warna poster (0-360)
  tiers: [
    { name: 'Regular', price: 75000, quota: 300 },
    { name: 'VIP', price: 150000, quota: 120 },
    { name: 'VVIP', price: 250000, quota: 40 },
  ],
} as const
