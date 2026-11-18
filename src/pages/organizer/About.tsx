import { PageTitle, Table, td } from '../../components/Table'
import { ConsultCta } from '../../components/Layouts'
import { BRAND } from '../../lib/constants'

const rows: [string, string][] = [
  ['Login', 'Tidak ada. Mode hanya pilihan tampilan.'],
  ['Pembayaran', 'Simulasi. Tidak terhubung ke payment gateway.'],
  ['QRIS dan virtual account', 'Ilustrasi, tidak dapat dibayar. Tidak ada nomor rekening nyata.'],
  ['Harga dan kuota', 'Data contoh, bukan harga layanan ' + BRAND + '.'],
  ['E-ticket dan QR check-in', 'Tiket demo, divalidasi di browser Anda.'],
  ['Email dan WhatsApp otomatis', 'Nonaktif.'],
  ['Database dan data klien', 'Tidak terhubung dan tidak digunakan.'],
  ['Penyimpanan data', 'Hanya di browser Anda (sessionStorage), terpisah untuk setiap pengunjung dan hilang saat tab ditutup.'],
]

export default function About() {
  return (
    <div>
      <PageTitle title="Tentang demo" sub={`Demo interaktif Event Ticketing & Payment System dari ${BRAND}.`} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Table head={['Fitur', 'Ketentuan demo']} caption="Batasan demo">
          {rows.map(([a, b]) => <tr key={a}><td className={`${td} font-semibold`}>{a}</td><td className={td}>{b}</td></tr>)}
        </Table>
        <aside className="h-fit rounded-2xl bg-ink p-6 text-white">
          <h2 className="text-2xl font-bold">Ingin sistem seperti ini untuk acara Anda?</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">Ceritakan jenis acara, jumlah peserta, dan kebutuhan pembayaran Anda. Tim kami akan membantu menyesuaikannya.</p>
          <div className="mt-5"><ConsultCta /></div>
        </aside>
      </div>
    </div>
  )
}
