# Event Ticketing & Payment System — Demo Publik (Sumber Rejeki Tech)

Demo interaktif penjualan tiket. Semua pembayaran dan transaksi hanya **simulasi**.
Tanpa login, tanpa backend, tanpa database, tanpa kredensial. Data hanya di `sessionStorage` browser pengunjung.

## Menjalankan lokal
```
npm install
npm run dev        # pengembangan
npm run build      # build produksi -> dist/
npm run preview    # uji hasil build
```

## Deploy ke Netlify
- Build command: `npm run build`  ·  Publish directory: `dist`
- `public/_redirects` (dan `netlify.toml`) sudah mengatur SPA fallback `/* /index.html 200`.
- Atau tanpa Git: seret folder `dist` ke https://app.netlify.com/drop
- Domain contoh: `demo-ticketing.sumberrejekitech.web.id` (tambahkan di Domain settings Netlify, lalu buat CNAME di DNS).

## Menautkan dari website utama
```html
<a href="https://URL-NETLIFY-ANDA" target="_blank" rel="noopener noreferrer">Lihat Demo</a>
```

## Struktur
- `src/lib/seed.ts` data fiktif (1 acara, Regular/VIP/VVIP) · `src/lib/logic.ts` reducer & aturan kuota/pembayaran/check-in
- `src/pages/buyer/*` alur pembeli · `src/pages/organizer/*` dashboard · `src/pages/Checkin.tsx` pemindai QR
- Tombol konsultasi mengarah ke `src/lib/constants.ts` (`SITE_URL`) — ubah bila perlu.


## Menyesuaikan untuk klien (satu acara saja)

Demo ini sengaja hanya memiliki **satu acara**. Tidak ada fitur menambah acara.
Untuk menyesuaikan dengan permintaan klien, ubah `src/config/event.ts` (nama, tanggal, lokasi, harga, kuota).
Tampilan halaman awal ada di `src/pages/Welcome.tsx`, halaman penjualan di `src/pages/buyer/EventDetail.tsx`.
Setelah diubah jalankan `npm run build` lalu unggah folder `dist`.
