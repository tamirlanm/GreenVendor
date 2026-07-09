import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
// Import CSS Modules styling object
import styles from './Layout.module.css'

import logoImg from '../icons/logo.png'
import { Footer } from './Footer'
import { useAuth, homeRouteForRole } from '../context/AuthContext'

export function Layout() {
  const { isAuthenticated, role } = useAuth()

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logoGroup}>
            <img src={logoImg} alt="GreenVendor Logo" className={styles.logoImage} />
            <div className={styles.logoText}>
              Green<span>Vendor</span>
            </div>
          </Link>

          <nav className={styles.navMenu}>
            <a href="/#how-it-works" className={styles.navLink}>
              How It Works
            </a>
            <a href="/#categories" className={styles.navLink}>
              Categories
            </a>
            <a href="/#esg-spotlight" className={styles.navLink}>
              ESG Spotlight
            </a>
            <a href="/#pricing" className={styles.navLink}>
              Pricing
            </a>

            {isAuthenticated && role ? (
              <Link to={homeRouteForRole(role)} className={styles.btnSignin}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className={styles.btnSignin}>
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
