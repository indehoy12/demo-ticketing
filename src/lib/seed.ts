import { EVENT } from '../config/event'
import type { Category, DemoEvent, DemoState, Order, Payment, Ticket, OrderStatus, PayMethod } from './types'

export const SESSION_KEY = 'srt-ticketing-demo-v2'
export const STATE_VERSION = 2
export const FEE_PER_TICKET = 2500
export const MAX_PER_CATEGORY = 5
export const MAX_PER_ORDER = 10
export const PAY_WINDOW_MS = 15 * 60 * 1000

// Deterministic PRNG so seed statistics are the same on every reset.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Unique, non-guessable-looking demo code from a counter (bijective mixing). */
export function ticketCode(n: number): string {
  const x = (Math.imul(n + 7919, 2654435761) >>> 0).toString(36).toUpperCase().padStart(7, '0')
  const y = (Math.imul(n + 104729, 40503) >>> 0).toString(36).toUpperCase().padStart(4, '0').slice(-4)
  return `SRT-${x.slice(0, 4)}-${x.slice(4)}${y.slice(0, 1)}`
}

export const QR_PREFIX = 'DEMO-TICKET:'
export const qrPayload = (code: string) => QR_PREFIX + code

const perks = {
  Regular: ['Akses area utama', 'Sesi panggung utama', 'E-ticket QR'],
  VIP: ['Area prioritas', 'Merchandise demo', 'Lounge & snack', 'Check-in jalur cepat'],
  VVIP: ['Kursi terdepan', 'Meet & greet', 'Merchandise eksklusif', 'Lounge privat', 'Check-in jalur cepat'],
}

function cat(eventId: string, name: 'Regular' | 'VIP' | 'VVIP', price: number, quota: number): Category {
  return {
    id: `${eventId}-${name.toLowerCase()}`,
    eventId, name, price, quota, active: true, perks: perks[name],
    base: { price, quota, active: true },
  }
}

export function seedEvents(): DemoEvent[] {
  const e = EVENT
  return [
    {
      id: e.id, name: e.name, tagline: e.tagline, description: e.description,
      date: e.date, doorsOpen: e.doorsOpen, venue: e.venue, city: e.city, hue: e.hue, published: true,
      categories: e.tiers.map((t) => cat(e.id, t.name, t.price, t.quota)),
    },
  ]
}

const FIRST = ['Andi', 'Bella', 'Citra', 'Dimas', 'Eka', 'Farhan', 'Gita', 'Hendra', 'Indah', 'Joko', 'Kirana', 'Lukman', 'Maya', 'Nadia', 'Omar', 'Putri', 'Raka', 'Sinta', 'Tegar', 'Wulan']
const LAST = ['Contoh', 'Sampel', 'Demo', 'Fiktif', 'Uji', 'Latihan']

// Target paid tickets per category (to show healthy but varied sales + one near sold-out)
const TARGET_PAID: Record<string, number> = {
  'tech-regular': 142, 'tech-vip': 71, 'tech-vvip': 26,
}

export function createSeedState(now = Date.now()): DemoState {
  const rnd = mulberry32(20261115)
  const events = seedEvents()
  const orders: Order[] = []
  const payments: Payment[] = []
  const tickets: Ticket[] = []
  const c = { order: 1000, ticket: 0, payment: 5000, scan: 0 }
  const methods: PayMethod[] = ['qris', 'va', 'ewallet']
  const DAY = 86400000

  const mk = (eventId: string, categoryId: string, qty: number, status: OrderStatus, createdAt: number) => {
    const ev = events.find((e) => e.id === eventId)!
    const category = ev.categories.find((x) => x.id === categoryId)!
    const nm = `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`
    const method = methods[Math.floor(rnd() * 3)]
    c.order += 1
    const id = `ORD-DEMO-${c.order}`
    const subtotal = category.price * qty
    const fee = qty * FEE_PER_TICKET
    const order: Order = {
      id, eventId, buyerName: nm,
      email: `${nm.toLowerCase().replace(/\s/g, '.')}@contoh.test`,
      phone: '', holderName: nm,
      items: [{ categoryId, qty, unitPrice: category.price }],
      subtotal, fee, total: subtotal + fee, status, method, createdAt, ticketIds: [],
    }
    const payAt = status === 'pending' ? createdAt : createdAt + Math.floor(rnd() * 8 + 1) * 60000
    if (status === 'paid') order.paidAt = payAt
    c.payment += 1
    payments.push({ id: `PAY-DEMO-${c.payment}`, orderId: id, method, amount: order.total, status, createdAt, updatedAt: payAt })
    if (status === 'paid') {
      for (let i = 0; i < qty; i++) {
        c.ticket += 1
        const tid = `TKT-${c.ticket}`
        tickets.push({
          id: tid, code: ticketCode(c.ticket), orderId: id, eventId, categoryId,
          holderName: nm, seq: i + 1, of: qty, status: 'valid', issuedAt: payAt,
        })
        order.ticketIds.push(tid)
      }
    }
    orders.push(order)
  }

  for (const ev of events) {
    for (const category of ev.categories) {
      let remaining = TARGET_PAID[category.id]
      while (remaining > 0) {
        const qty = Math.min(remaining, 1 + Math.floor(rnd() * 4))
        // Sales skew to recent days
        const ageDays = Math.floor(Math.pow(rnd(), 1.6) * 14)
        const createdAt = now - ageDays * DAY - Math.floor(rnd() * 12 * 3600000) - 3600000
        mk(ev.id, category.id, qty, 'paid', createdAt)
        remaining -= qty
      }
    }
  }
  // Failed / expired / pending orders (no tickets issued)
  const extras: [string, string, number, OrderStatus][] = [
    ['tech', 'tech-regular', 2, 'failed'], ['tech', 'tech-vip', 1, 'expired'], ['tech', 'tech-regular', 3, 'expired'],
    ['tech', 'tech-vip', 2, 'pending'], ['tech', 'tech-vvip', 1, 'failed'], ['tech', 'tech-regular', 2, 'failed'],
  ]
  extras.forEach(([e, k, q, s], i) => {
    const age = s === 'pending' ? 120000 + i * 40000 : (i + 1) * 0.6 * DAY
    mk(e, k, q, s, now - age)
  })

  // Pre-checked-in attendees (deterministic) for each event
  const perEvent: Record<string, number> = { tech: 38 }
  for (const [eid, n] of Object.entries(perEvent)) {
    let done = 0
    for (const t of tickets) {
      if (t.eventId === eid && done < n) {
        t.status = 'used'; t.usedAt = t.issuedAt + 3600000; done++
      }
    }
  }

  orders.sort((a, b) => b.createdAt - a.createdAt)
  payments.sort((a, b) => b.updatedAt - a.updatedAt)
  return { version: STATE_VERSION, events, orders, payments, tickets, scans: [], draft: null, myOrderIds: [], lastOrderId: null, counters: c }
}
