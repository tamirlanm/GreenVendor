import React from 'react'

interface FooterProps {
  companyName?: string
}

export default function Footer({ companyName = 'GreenVendor' }: FooterProps) {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-top" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div className="subscribe" style={{ minWidth: 280 }}>
          <h3>Subscribe</h3>
          <p>Get product updates and ESG insights.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const input = form.elements.namedItem('email') as HTMLInputElement | null
              if (!input) return
              // placeholder: handle subscription (send to API)
              alert(`Subscribed: ${input.value}`)
              input.value = ''
            }}
          >
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input
              id="footer-email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              aria-label="Email address"
              style={{ padding: '8px 10px', width: '100%', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ marginTop: 8, padding: '8px 12px' }}>
              Submit
            </button>
          </form>
        </div>

        <nav className="footer-links" aria-label="Footer navigation" style={{ display: 'flex', gap: 32 }}>
          <div className="col">
            <h4>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="/about">About</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          <div className="col">
            <h4>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/docs">Docs</a></li>
              <li><a href="/help">Help Center</a></li>
            </ul>
          </div>

          <div className="col">
            <h4>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/cookies">Cookies</a></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="footer-bottom" style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 12 }}>
        <small>© {new Date().getFullYear()} {companyName}</small>
      </div>
    </footer>
  )
}
