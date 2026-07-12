import { Link } from 'react-router-dom'
import logoImg from '../icons/logo.png'
import styles from '../pages/home.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div>
            <div className={styles.footerBrand}>
              <img src={logoImg} alt="GreenVendor" className={styles.footerBrandLogo} />
              Green<span style={{ color: '#4ade8a' }}>Vendor</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '20rem' }}>
              Bulk sourcing with transparent ESG scoring for every supplier and listing.
            </p>
          </div>

          <div>
            <div className={styles.footerColTitle}>Platform</div>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="/#categories">Products</a>
              </li>
              <li>
                <a href="/#pricing">Pricing</a>
              </li>
              <li>
                <Link to="/register">Enterprise</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className={styles.footerColTitle}>Resources</div>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/#esg-spotlight">Blog</a>
              </li>
              <li>
                <a href="/#how-it-works">ESG Guide</a>
              </li>
              <li>
                <span>API Docs</span>
              </li>
              <li>
                <span>Help Center</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} GreenVendor. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}