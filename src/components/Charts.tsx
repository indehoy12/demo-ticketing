import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { rupiah } from '../lib/format'

// Validated categorical palette (colorblind-safe, >=3:1 on white). Fixed order: Regular, VIP, VVIP.
export const CAT_COLORS: Record<string, string> = { Regular: '#1d4f9f', VIP: '#0c8f6d', VVIP: '#b86e00' }
const axis = { fontSize: 12, fill: '#54617e' }

export function SalesChart({ data }: { data: { day: string; tickets: number; revenue: number }[] }) {
  const total = data.reduce((a, d) => a + d.tickets, 0)
  return (
    <div role="img" aria-label={`Grafik tiket terjual per hari, total ${total} tiket dalam 14 hari terakhir`}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f3" vertical={false} />
          <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
          <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: '#f8faff' }} formatter={(v, n) => (n === 'revenue' ? rupiah(Number(v)) : v)} labelFormatter={(l) => `Tanggal ${l}`}
            content={({ active, payload, label }) => active && payload?.length ? (
              <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg">
                <p className="font-bold">{label}</p>
                <p>{payload[0].payload.tickets} tiket</p>
                <p className="text-mute">{rupiah(payload[0].payload.revenue)}</p>
              </div>) : null} />
          <Bar dataKey="tickets" name="Tiket terjual" animationDuration={900} animationEasing="ease-out" fill="#1d4f9f" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryChart({ data }: { data: { name: string; tickets: number; revenue: number }[] }) {
  return (
    <div role="img" aria-label="Grafik tiket terjual per kategori">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f3" vertical={false} />
          <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
          <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: '#f8faff' }}
            content={({ active, payload }) => active && payload?.length ? (
              <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg">
                <p className="font-bold">{payload[0].payload.name}</p>
                <p>{payload[0].payload.tickets} tiket</p>
                <p className="text-mute">{rupiah(payload[0].payload.revenue)}</p>
              </div>) : null} />
          <Legend content={() => (
            <ul className="mt-2 flex justify-center gap-4 text-xs text-ink">
              {data.map((d) => <li key={d.name} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CAT_COLORS[d.name] }} />{d.name}: {d.tickets}</li>)}
            </ul>)} />
          <Bar dataKey="tickets" name="Tiket" animationDuration={900} animationEasing="ease-out" radius={[4, 4, 0, 0]} maxBarSize={72}>
            {data.map((d) => <Cell key={d.name} fill={CAT_COLORS[d.name]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
