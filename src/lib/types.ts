export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired'
export type PayMethod = 'qris' | 'va' | 'ewallet'
export type TicketStatus = 'valid' | 'used'

export interface Category {
  id: string
  eventId: string
  name: string
  price: number
  quota: number
  active: boolean
  perks: string[]
  base: { price: number; quota: number; active: boolean }
}

export interface DemoEvent {
  id: string
  name: string
  tagline: string
  description: string
  date: string // ISO
  doorsOpen: string
  venue: string
  city: string
  hue: number
  published: boolean
  categories: Category[]
}

export interface OrderItem {
  categoryId: string
  qty: number
  unitPrice: number
}

export interface Order {
  id: string
  eventId: string
  buyerName: string
  email: string
  phone: string
  holderName: string
  items: OrderItem[]
  subtotal: number
  fee: number
  total: number
  status: OrderStatus
  method: PayMethod
  createdAt: number
  paidAt?: number
  ticketIds: string[]
}

export interface Payment {
  id: string
  orderId: string
  method: PayMethod
  amount: number
  status: OrderStatus
  createdAt: number
  updatedAt: number
}

export interface Ticket {
  id: string
  code: string
  orderId: string
  eventId: string
  categoryId: string
  holderName: string
  seq: number
  of: number
  status: TicketStatus
  issuedAt: number
  usedAt?: number
}

export type ScanOutcome = 'valid' | 'used' | 'invalid' | 'wrong_event'

export interface ScanResult {
  id: number
  outcome: ScanOutcome
  raw: string
  at: number
  gateEventId: string
  ticketId?: string
  message: string
}

export interface Draft {
  eventId: string
  qty: Record<string, number>
}

export interface DemoState {
  version: number
  events: DemoEvent[]
  orders: Order[]
  payments: Payment[]
  tickets: Ticket[]
  scans: ScanResult[]
  draft: Draft | null
  myOrderIds: string[]
  lastOrderId: string | null
  counters: { order: number; ticket: number; payment: number; scan: number }
}
