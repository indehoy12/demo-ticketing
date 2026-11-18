import { useEffect, useState } from 'react'
import { useDemo } from '../../lib/store'
import { btn, input, NoticeModal } from '../../components/ui'
import { cellCls, cellProps, rowCls } from '../../components/Table'
import { PageTitle, Table } from '../../components/Table'
import { catState, usage, validateCategoryPatch } from '../../lib/logic'
import { rupiah } from '../../lib/format'
import type { Category } from '../../lib/types'

function Row({ c, labels }: { c: Category; labels?: string[] }) {
  const { state, dispatch } = useDemo()
  const u = usage(state, c.id)
  const st = catState(state, c)
  const [price, setPrice] = useState(String(c.price))
  const [quota, setQuota] = useState(String(c.quota))
  const [err, setErr] = useState('')
  const [showErr, setShowErr] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => { setPrice(String(c.price)); setQuota(String(c.quota)) }, [c.price, c.quota])

  const save = () => {
    const p = Number(price), q = Number(quota)
    const e = validateCategoryPatch(state, c.id, { price: p, quota: q })
    if (e || price.trim() === '' || quota.trim() === '') { setErr(e || 'Isi harga dan kuota.'); setShowErr(true); setSaved(false); return }
    dispatch({ type: 'UPDATE_CATEGORY', categoryId: c.id, patch: { price: p, quota: q } })
    setErr(''); setSaved(true)
  }
  return (
    <tr className={rowCls}>
      <td {...cellProps(labels?.[0])} className={`font-bold ${cellCls}`}>{c.name}</td>
      <td {...cellProps(labels?.[1])} className={cellCls}><span className="min-w-0 md:contents"><label className="sr-only" htmlFor={`p-${c.id}`}>Harga {c.name}</label><input id={`p-${c.id}`} inputMode="numeric" className={`${input} w-32`} value={price} onChange={(e) => { setPrice(e.target.value); setSaved(false) }} /><span className="mt-1 block text-xs text-mute">{rupiah(Number(price) || 0)}</span></span></td>
      <td {...cellProps(labels?.[2])} className={cellCls}><span className="min-w-0 md:contents"><label className="sr-only" htmlFor={`q-${c.id}`}>Kuota {c.name}</label><input id={`q-${c.id}`} inputMode="numeric" className={`${input} w-24`} value={quota} onChange={(e) => { setQuota(e.target.value); setSaved(false) }} /></span></td>
      <td {...cellProps(labels?.[3])} className={`text-xs tabular-nums ${cellCls}`}><span className="min-w-0 md:contents">{u.sold} terjual<br />{u.reserved} ditahan<br /><strong>{u.remaining} sisa</strong></span></td>
      <td {...cellProps(labels?.[4])} className={cellCls}>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st === 'open' ? 'bg-ok-soft text-ok' : st === 'soldout' ? 'bg-bad-soft text-bad' : 'bg-line text-mute'}`}>{st === 'open' ? 'Tersedia' : st === 'soldout' ? 'Sold out' : 'Nonaktif'}</span>
      </td>
      <td {...cellProps(labels?.[5])} className={cellCls}>
        <div className="flex flex-wrap items-center justify-end gap-2 md:justify-start">
          <button className={btn.ghost} onClick={save}>Simpan</button>
          <button className={btn.ghost} onClick={() => dispatch({ type: 'UPDATE_CATEGORY', categoryId: c.id, patch: { active: !c.active } })}>{c.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
        </div>
        {saved && <p className="mt-1 text-xs font-semibold text-ok">✓ Tersimpan</p>}
        <NoticeModal open={showErr} onClose={() => setShowErr(false)} kind="bad" title="Perubahan belum tersimpan" message={err} />
      </td>
    </tr>
  )
}

export default function Categories() {
  const { state, dispatch } = useDemo()
  return (
    <div>
      <PageTitle title="Kategori tiket" sub="Ubah harga dan kuota, nonaktifkan kategori, atau buat kategori sold out. Cek hasilnya di sisi pembeli."
        right={<button className={btn.ghost} onClick={() => dispatch({ type: 'RESET_INVENTORY' })}>Kembalikan konfigurasi awal</button>} />
      <div className="space-y-6">
        {state.events.map((e) => (
          <section key={e.id}>
            <h2 className="mb-2 text-lg font-bold">{e.name}</h2>
            <Table head={['Kategori', 'Harga (Rp)', 'Kuota', 'Penggunaan', 'Status', 'Aksi']} caption={`Kategori tiket ${e.name}`}>
              {e.categories.map((c) => <Row key={c.id} c={c} />)}
            </Table>
          </section>
        ))}
      </div>
    </div>
  )
}
