import type {
  Category, DemoState, Draft, Order, OrderStatus, PayMethod, Payment, ScanOutcome, ScanResult, Ticket,
} from './types'
import {
  FEE_PER_TICKET, MAX_PER_CATEGORY, MAX_PER_ORDER, QR_PREFIX, STATE_VERSION, ticketCode,
} from './seed'
import { dayKey, clean } from './format'

/* ------------------------------ selectors ------------------------------ */

export function allCategories(s: DemoState): Category[] {
  return s.events.flatMap((e) => e.categories)
}

export function usage(s: DemoState, categoryId: string) {
  let sold = 0
  let reserved = 0
  for (const t of s.tickets) if (t.categoryId === categoryId) sold++
  for (const o of s.orders) {
    if (o.status !== 'pending') continue
    for (const it of o.items) if (it.categoryId === categoryId) reserved += it.qty
  }
  const cat = allCategories(s).find((c) => c.id === categoryId)
  const quota = cat?.quota ?? 0
  const remaining = Math.max(0, quota - sold - reserved)
  return { sold, reserved, quota, remaining, soldOut: remaining === 0 }
}

export type CatState = 'open' | 'soldout' | 'inactive'
export function catState(s: DemoState, c: Category): CatState {
  if (!c.active) return 'inactive'
  return usage(s, c.id).soldOut ? 'soldout' : 'open'
}

export function maxSelectable(s: DemoState, c: Category): number {
  if (!c.active) return 0
  return Math.min(MAX_PER_CATEGORY, usage(s, c.id).remaining)
}

export function draftTotals(s: DemoState, d: Draft | null) {
  const lines: { cat: Category; qty: number; line: number }[] = []
  let qty = 0
  let subtotal = 0
  if (d) {
    const ev = s.events.find((e) => e.id === d.eventId)
    for (const c of ev?.categories ?? []) {
      const q = d.qty[c.id] ?? 0
      if (q > 0) {
        lines.push({ cat: c, qty: q, line: q * c.price })
        qty += q
        subtotal += q * c.price
      }
    }
  }
  const fee = qty * FEE_PER_TICKET
  return { lines, qty, subtotal, fee, total: subtotal + fee }
}

export function validateDraft(s: DemoState, d: Draft | null): string | null {
  if (!d) return 'Belum ada tiket yang dipilih.'
  const ev = s.events.find((e) => e.id === d.eventId)
  if (!ev || !ev.published) return 'Acara tidak tersedia.'
  const t = draftTotals(s, d)
  if (t.qty === 0) return 'Pilih minimal 1 tiket.'
  if (t.qty > MAX_PER_ORDER) return `Maksimal ${MAX_PER_ORDER} tiket per pesanan.`
  for (const l of t.lines) {
    if (!l.cat.active) return `Kategori ${l.cat.name} sedang tidak tersedia.`
    if (l.qty > MAX_PER_CATEGORY) return `Maksimal ${MAX_PER_CATEGORY} tiket per kategori.`
    if (l.qty > usage(s, l.cat.id).remaining) return `Kuota ${l.cat.name} tidak mencukupi. Kurangi jumlah tiket.`
  }
  return null
}

export function eventStats(s: DemoState, eventId?: string) {
  const orders = s.orders.filter((o) => !eventId || o.eventId === eventId)
  const tickets = s.tickets.filter((t) => !eventId || t.eventId === eventId)
  const paid = orders.filter((o) => o.status === 'paid')
  const revenue = paid.reduce((a, o) => a + o.subtotal, 0)
  const fees = paid.reduce((a, o) => a + o.fee, 0)
  const byStatus = { pending: 0, paid: 0, failed: 0, expired: 0 } as Record<OrderStatus, number>
  for (const o of orders) byStatus[o.status]++
  const checkedIn = tickets.filter((t) => t.status === 'used').length
  return {
    events: eventId ? 1 : s.events.length,
    ticketsSold: tickets.length,
    revenue, fees, gross: revenue + fees,
    byStatus, orders: orders.length,
    checkedIn,
    attendanceRate: tickets.length ? checkedIn / tickets.length : 0,
  }
}

export function salesByDay(s: DemoState, eventId?: string, days = 14, now = Date.now()) {
  const keys: string[] = []
  const labels: Record<string, string> = {}
  for (let i = days - 1; i >= 0; i--) {
    const t = now - i * 86400000
    const k = dayKey(t)
    keys.push(k)
    labels[k] = new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }
  const map: Record<string, { tickets: number; revenue: number }> = {}
  for (const k of keys) map[k] = { tickets: 0, revenue: 0 }
  for (const o of s.orders) {
    if (o.status !== 'paid') continue
    if (eventId && o.eventId !== eventId) continue
    const k = dayKey(o.paidAt ?? o.createdAt)
    if (!map[k]) continue
    map[k].tickets += o.items.reduce((a, i) => a + i.qty, 0)
    map[k].revenue += o.subtotal
  }
  return keys.map((k) => ({ day: labels[k], ...map[k] }))
}

export function salesByCategory(s: DemoState, eventId?: string) {
  const rows: { name: string; tickets: number; revenue: number }[] = [
    { name: 'Regular', tickets: 0, revenue: 0 },
    { name: 'VIP', tickets: 0, revenue: 0 },
    { name: 'VVIP', tickets: 0, revenue: 0 },
  ]
  for (const o of s.orders) {
    if (o.status !== 'paid') continue
    if (eventId && o.eventId !== eventId) continue
    for (const it of o.items) {
      const cat = allCategories(s).find((c) => c.id === it.categoryId)
      const row = rows.find((r) => r.name === cat?.name)
      if (row) { row.tickets += it.qty; row.revenue += it.qty * it.unitPrice }
    }
  }
  return rows
}

export function catName(s: DemoState, id: string) {
  return allCategories(s).find((c) => c.id === id)?.name ?? '—'
}
export function eventName(s: DemoState, id: string) {
  return s.events.find((e) => e.id === id)?.name ?? '—'
}

export function evaluateScan(s: DemoState, raw: string, gateEventId: string): {
  outcome: ScanOutcome; ticket?: Ticket; message: string
} {
  const text = raw.trim()
  if (!text.startsWith(QR_PREFIX)) {
    return { outcome: 'invalid', message: 'Tiket tidak dikenali. QR ini bukan tiket demo.' }
  }
  const code = text.slice(QR_PREFIX.length)
  const ticket = s.tickets.find((t) => t.code === code)
  if (!ticket) return { outcome: 'invalid', message: 'Tiket tidak dikenali. Kode tidak ditemukan.' }
  if (ticket.eventId !== gateEventId) {
    return { outcome: 'wrong_event', ticket, message: 'Tiket tidak berlaku untuk acara ini.' }
  }
  if (ticket.status === 'used') {
    return { outcome: 'used', ticket, message: 'Tiket sudah digunakan.' }
  }
  return { outcome: 'valid', ticket, message: 'Check-in berhasil.' }
}

/* ------------------------------ reducer -------------------------------- */

export type Action =
  | { type: 'SET_DRAFT'; draft: Draft | null }
  | {
      type: 'CREATE_ORDER'
      now: number
      buyerName: string; email: string; phone: string; holderName: string; method: PayMethod
    }
  | { type: 'SET_PAYMENT'; orderId: string; outcome: Exclude<OrderStatus, 'pending'>; now: number }
  | { type: 'SCAN'; raw: string; gateEventId: string; now: number }
  | { type: 'UPDATE_CATEGORY'; categoryId: string; patch: Partial<Pick<Category, 'price' | 'quota' | 'active'>> }
  | { type: 'RESET_INVENTORY' }

export function validateCategoryPatch(
  s: DemoState, categoryId: string, patch: Partial<Pick<Category, 'price' | 'quota' | 'active'>>,
): string | null {
  if (patch.price !== undefined) {
    if (!Number.isInteger(patch.price) || patch.price < 0 || patch.price > 100_000_000) {
      return 'Harga harus berupa angka bulat antara 0 dan 100.000.000.'
    }
  }
  if (patch.quota !== undefined) {
    const u = usage(s, categoryId)
    if (!Number.isInteger(patch.quota) || patch.quota < 0 || patch.quota > 100_000) {
      return 'Kuota harus berupa angka bulat antara 0 dan 100.000.'
    }
    if (patch.quota < u.sold + u.reserved) {
      return `Kuota tidak boleh di bawah ${u.sold + u.reserved} (tiket terjual + dipesan).`
    }
  }
  return null
}

function mapCategory(s: DemoState, id: string, fn: (c: Category) => Category): DemoState {
  return {
    ...s,
    events: s.events.map((e) => ({ ...e, categories: e.categories.map((c) => (c.id === id ? fn(c) : c)) })),
  }
}

export function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case 'SET_DRAFT':
      return { ...s, draft: a.draft }

    case 'CREATE_ORDER': {
      if (validateDraft(s, s.draft)) return s
      const d = s.draft!
      const t = draftTotals(s, d)
      const num = s.counters.order + 1
      const id = `ORD-DEMO-${num}`
      const pnum = s.counters.payment + 1
      const holder = clean(a.holderName, 60)
      const order: Order = {
        id, eventId: d.eventId,
        buyerName: clean(a.buyerName, 60), email: clean(a.email, 80), phone: clean(a.phone, 20),
        holderName: holder,
        items: t.lines.map((l) => ({ categoryId: l.cat.id, qty: l.qty, unitPrice: l.cat.price })),
        subtotal: t.subtotal, fee: t.fee, total: t.total,
        status: 'pending', method: a.method, createdAt: a.now, ticketIds: [],
      }
      const pay: Payment = {
        id: `PAY-DEMO-${pnum}`, orderId: id, method: a.method, amount: t.total,
        status: 'pending', createdAt: a.now, updatedAt: a.now,
      }
      return {
        ...s,
        orders: [order, ...s.orders],
        payments: [pay, ...s.payments],
        draft: null,
        myOrderIds: [id, ...s.myOrderIds],
        lastOrderId: id,
        counters: { ...s.counters, order: num, payment: pnum },
      }
    }

    case 'SET_PAYMENT': {
      const o = s.orders.find((x) => x.id === a.orderId)
      if (!o || o.status !== 'pending') return s // idempotent: only pending orders change
      let tickets = s.tickets
      let tcount = s.counters.ticket
      const ids: string[] = []
      if (a.outcome === 'paid') {
        const total = o.items.reduce((x, i) => x + i.qty, 0)
        const made: Ticket[] = []
        let seq = 0
        for (const it of o.items) {
          for (let i = 0; i < it.qty; i++) {
            tcount += 1; seq += 1
            const tid = `TKT-${tcount}`
            ids.push(tid)
            made.push({
              id: tid, code: ticketCode(tcount), orderId: o.id, eventId: o.eventId,
              categoryId: it.categoryId, holderName: o.holderName, seq, of: total,
              status: 'valid', issuedAt: a.now,
            })
          }
        }
        tickets = [...s.tickets, ...made]
      }
      return {
        ...s,
        tickets,
        orders: s.orders.map((x) =>
          x.id === o.id
            ? { ...x, status: a.outcome, paidAt: a.outcome === 'paid' ? a.now : undefined, ticketIds: ids }
            : x),
        payments: s.payments.map((p) =>
          p.orderId === o.id ? { ...p, status: a.outcome, updatedAt: a.now } : p),
        counters: { ...s.counters, ticket: tcount },
      }
    }

    case 'SCAN': {
      const r = evaluateScan(s, a.raw, a.gateEventId)
      const n = s.counters.scan + 1
      const entry: ScanResult = {
        id: n, outcome: r.outcome, raw: clean(a.raw, 60), at: a.now, gateEventId: a.gateEventId,
        ticketId: r.ticket?.id, message: r.message,
      }
      return {
        ...s,
        tickets: r.outcome === 'valid'
          ? s.tickets.map((t) => (t.id === r.ticket!.id ? { ...t, status: 'used', usedAt: a.now } : t))
          : s.tickets,
        scans: [entry, ...s.scans].slice(0, 100),
        counters: { ...s.counters, scan: n },
      }
    }

    case 'UPDATE_CATEGORY': {
      if (validateCategoryPatch(s, a.categoryId, a.patch)) return s
      return mapCategory(s, a.categoryId, (c) => ({ ...c, ...a.patch }))
    }

    case 'RESET_INVENTORY':
      return {
        ...s,
        events: s.events.map((e) => ({
          ...e,
          published: true,
          categories: e.categories.map((c) => ({ ...c, ...c.base })),
        })),
      }

  }
}

export function isValidState(x: unknown): x is DemoState {
  const o = x as DemoState
  return !!o && o.version === STATE_VERSION && Array.isArray(o.events) && Array.isArray(o.orders) &&
    Array.isArray(o.tickets) && Array.isArray(o.payments) && !!o.counters
}
