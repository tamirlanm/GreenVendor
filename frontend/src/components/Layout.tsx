import { Link, Outlet } from 'react-router-dom'
// Import CSS Modules styling object
import styles from './Layout.module.css' 

export function Layout() {
  return (
    <div className={styles.appContainer}>
      
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logoGroup}>
            <div className={styles.logoIcon}>G</div>
            <div className={styles.logoText}>Green<span>Vendor</span></div>
          </Link>
          
          <nav className={styles.navMenu}>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/login" className={styles.btnSignin}>Sign In</Link>
          </nav>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Outlet /> 
      </main>

    </div>
  )
}