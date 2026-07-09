import { AtSign, Globe, MessageCircle, Rss, Send } from 'lucide-react'
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
              Stay ahead with sustainable sourcing insights, market trends, and ESG compliance updates delivered to
              your inbox.
            </p>
            <div className={styles.newsletterRow}>
              <input className={styles.newsletterInput} placeholder="Enter your email" type="email" />
              <button className={styles.newsletterBtn}>
                <Send size={14} /> Subscribe
              </button>
            </div>
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

          <div>
            <div className={styles.footerColTitle}>Company</div>
            <ul className={styles.footerLinks}>
              <li>
                <span>About</span>
              </li>
              <li>
                <span>Careers</span>
              </li>
              <li>
                <span>Contact</span>
              </li>
              <li>
                <span>Partners</span>
              </li>
            </ul>
          </div>

          <div>
            <div className={styles.footerColTitle}>Legal</div>
            <ul className={styles.footerLinks}>
              <li>
                <span>Privacy</span>
              </li>
              <li>
                <span>Terms</span>
              </li>
              <li>
                <span>Cookies</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} GreenVendor. All rights reserved.</span>
          <div className={styles.footerSocials}>
            <a className={styles.footerSocialBtn} href="#" aria-label="Website">
              <Globe size={15} />
            </a>
            <a className={styles.footerSocialBtn} href="#" aria-label="Blog">
              <Rss size={15} />
            </a>
            <a className={styles.footerSocialBtn} href="#" aria-label="Community">
              <MessageCircle size={15} />
            </a>
            <a className={styles.footerSocialBtn} href="#" aria-label="Contact">
              <AtSign size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
