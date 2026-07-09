import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Sparkles,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import { suppliersApi } from '../api/suppliers'
import { buyersApi } from '../api/buyers'
import logoImg from '../icons/logo.png'
import styles from './DashboardLayout.module.css'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

const NAV_BY_ROLE: Record<'Supplier' | 'Buyer' | 'Admin', NavItem[]> = {
  Supplier: [
    { to: '/supplier', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/supplier/questionnaire', label: 'ESG Questionnaire', icon: <ClipboardList size={18} /> },
    { to: '/supplier/products', label: 'My Products', icon: <Package size={18} /> },
    { to: '/supplier/orders', label: 'Incoming Orders', icon: <ShoppingBag size={18} /> },
    { to: '/supplier/profile', label: 'Company Profile', icon: <UserCog size={18} /> },
  ],
  Buyer: [
    { to: '/buyer', label: 'Catalog', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/buyer/orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
    { to: '/buyer/recommendations', label: 'Recommendations', icon: <Sparkles size={18} /> },
    { to: '/buyer/profile', label: 'Company Profile', icon: <UserCog size={18} /> },
  ],
  Admin: [
    { to: '/admin', label: 'Suppliers', icon: <Users size={18} />, end: true },
    { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ],
}

const WORKSPACE_LABEL: Record<'Supplier' | 'Buyer' | 'Admin', string> = {
  Supplier: 'Supplier Workspace',
  Buyer: 'Buyer Workspace',
  Admin: 'Admin Workspace',
}

export function DashboardLayout() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [company, setCompany] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (role === 'Supplier') {
      suppliersApi
        .getMyProfile()
        .then((p) => active && setCompany(p.companyName))
        .catch(() => {})
    } else if (role === 'Buyer') {
      buyersApi
        .getMyProfile()
        .then((p) => active && setCompany(p.companyName))
        .catch(() => {})
    }
    return () => {
      active = false
    }
  }, [role])

  if (!role) return null

  const items = NAV_BY_ROLE[role]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <button className={styles.mobileToggle} onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={clsx(styles.sidebar, mobileOpen && styles.sidebarOpen)}>
        <div>
          <NavLink to="/" className={styles.brand}>
            <img src={logoImg} alt="GreenVendor" className={styles.brandLogo} />
            <span>
              Green<b>Vendor</b>
            </span>
          </NavLink>

          <div className={styles.workspaceLabel}>{WORKSPACE_LABEL[role]}</div>

          <nav className={styles.nav}>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => clsx(styles.navLink, isActive && styles.navLinkActive)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.footer}>
          <div className={styles.userCapsule}>
            <div className={styles.userAvatar}>{(company ?? role).charAt(0).toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{company ?? role}</div>
              <div className={styles.userRole}>{role}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
