import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DemoProvider, useDemo } from './lib/store'
import { AppShell, BuyerLayout, CheckinLayout, OrganizerLayout } from './components/Layouts'
import Welcome from './pages/Welcome'
import EventDetail from './pages/buyer/EventDetail'
import Checkout from './pages/buyer/Checkout'
import Pay from './pages/buyer/Pay'
import Result from './pages/buyer/Result'
import Ticket from './pages/buyer/Ticket'
import OrderSummary from './pages/buyer/OrderSummary'
import MyOrders from './pages/buyer/MyOrders'
const Dashboard = lazy(() => import('./pages/organizer/Dashboard'))
const Categories = lazy(() => import('./pages/organizer/Categories'))
const Orders = lazy(() => import('./pages/organizer/Orders'))
const Payments = lazy(() => import('./pages/organizer/Payments'))
const Attendees = lazy(() => import('./pages/organizer/Attendees'))
const Reports = lazy(() => import('./pages/organizer/Reports'))
const About = lazy(() => import('./pages/organizer/About'))
const Checkin = lazy(() => import('./pages/Checkin'))

function BuyerHome() {
  const { state } = useDemo()
  return <Navigate to={`/buyer/event/${state.events[0].id}`} replace />
}

export default function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <AppShell>
          <Suspense fallback={<p className="p-8 text-center text-sm text-mute" role="status">Memuat…</p>}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/buyer" element={<BuyerLayout />}>
              <Route index element={<BuyerHome />} />
              <Route path="event/:id" element={<EventDetail />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="pay/:id" element={<Pay />} />
              <Route path="result/:id" element={<Result />} />
              <Route path="ticket/:id" element={<Ticket />} />
              <Route path="order/:id" element={<OrderSummary />} />
              <Route path="orders" element={<MyOrders />} />
            </Route>
            <Route path="/organizer" element={<OrganizerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="attendees" element={<Attendees />} />
              <Route path="checkin" element={<Checkin />} />
              <Route path="reports" element={<Reports />} />
              <Route path="about" element={<About />} />
            </Route>
            <Route path="/checkin" element={<CheckinLayout />}><Route index element={<Checkin />} /></Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </DemoProvider>
  )
}
