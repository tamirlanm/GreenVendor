import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { Spinner } from './components/ui'

import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { NotFound } from './pages/NotFound'

// Role workspaces are code-split so the public marketing site (the page most
// visitors and search engines actually hit) doesn't pay for Supplier/Buyer/Admin JS.
const SupplierDashboard = lazy(() => import('./pages/supplier/SupplierDashboard').then((m) => ({ default: m.SupplierDashboard })))
const Questionnaire = lazy(() => import('./pages/supplier/Questionnaire').then((m) => ({ default: m.Questionnaire })))
const SupplierProducts = lazy(() => import('./pages/supplier/SupplierProducts').then((m) => ({ default: m.SupplierProducts })))
const SupplierOrders = lazy(() => import('./pages/supplier/SupplierOrders').then((m) => ({ default: m.SupplierOrders })))
const SupplierProfile = lazy(() => import('./pages/supplier/SupplierProfile').then((m) => ({ default: m.SupplierProfile })))

const BuyerCatalog = lazy(() => import('./pages/buyer/BuyerCatalog').then((m) => ({ default: m.BuyerCatalog })))
const SupplierDetail = lazy(() => import('./pages/buyer/SupplierDetail').then((m) => ({ default: m.SupplierDetail })))
const BuyerOrders = lazy(() => import('./pages/buyer/BuyerOrders').then((m) => ({ default: m.BuyerOrders })))
const BuyerRecommendations = lazy(() =>
  import('./pages/buyer/BuyerRecommendations').then((m) => ({ default: m.BuyerRecommendations })),
)
const BuyerProfile = lazy(() => import('./pages/buyer/BuyerProfile').then((m) => ({ default: m.BuyerProfile })))

const AdminSuppliers = lazy(() => import('./pages/admin/AdminSuppliers').then((m) => ({ default: m.AdminSuppliers })))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics })))

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Public marketing + auth pages ------------------------------- */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Supplier workspace -------------------------------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['Supplier']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/supplier" element={<SupplierDashboard />} />
              <Route path="/supplier/questionnaire" element={<Questionnaire />} />
              <Route path="/supplier/products" element={<SupplierProducts />} />
              <Route path="/supplier/orders" element={<SupplierOrders />} />
              <Route path="/supplier/profile" element={<SupplierProfile />} />
            </Route>
          </Route>

          {/* Buyer workspace ------------------------------------------------ */}
          <Route element={<ProtectedRoute allowedRoles={['Buyer']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/buyer" element={<BuyerCatalog />} />
              <Route path="/buyer/suppliers/:id" element={<SupplierDetail />} />
              <Route path="/buyer/orders" element={<BuyerOrders />} />
              <Route path="/buyer/recommendations" element={<BuyerRecommendations />} />
              <Route path="/buyer/profile" element={<BuyerProfile />} />
            </Route>
          </Route>

          {/* Admin workspace ------------------------------------------------ */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminSuppliers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
