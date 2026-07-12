import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Cpu,
  Leaf,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import clsx from 'clsx'
import styles from './home.module.css'
import { useAuth, homeRouteForRole } from '../context/AuthContext'
import { suppliersApi } from '../api/suppliers'
import { PRODUCT_CATEGORIES, type SupplierCatalogItemResponse } from '../types'
import type { TopSupplierEsgResponse } from '../types'

// Real backend categories (see types/index.ts PRODUCT_CATEGORIES) — no invented
// listing counts, since GET /api/products is Buyer-only and can't be called
// from this public page (see ProductsController.cs [Authorize(Roles="Buyer")]).
const CATEGORY_ICON: Record<string, typeof Leaf> = {
  RawMaterials: Leaf,
  Packaging: Package,
  Electronics: Cpu,
  Furniture: Wrench,
  Paper: Package,
  Other: Package,
}
const CATEGORY_GRADIENT: Record<string, string> = {
  RawMaterials: 'linear-gradient(155deg,#b08968,#8a6a4d)',
  Packaging: 'linear-gradient(155deg,#6b8f71,#41573f)',
  Electronics: 'linear-gradient(155deg,#4b5a63,#2b333a)',
  Furniture: 'linear-gradient(155deg,#c99a4a,#a3762f)',
  Paper: 'linear-gradient(155deg,#8fae6b,#557239)',
  Other: 'linear-gradient(155deg,#7c8c94,#4d5a61)',
}
const CATEGORY_LABEL: Record<string, string> = {
  RawMaterials: 'Raw Materials',
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}

const FAQS = [
  {
    q: 'What is the GreenRatio score?',
    a: 'GreenRatio is GreenVendor\u2019s composite score for every supplier, built from three weighted pillars — Environmental (40%), Social (35%), and Governance (25%). Suppliers earn it by completing a structured questionnaire, and buyers see the resulting grade (A through F) on every listing.',
  },
  {
    q: 'How does GreenVendor verify ESG claims?',
    a: 'Suppliers submit supporting documentation (certificates, policies) alongside their questionnaire answers. Our admin team reviews submissions and marks a supplier profile as verified once the evidence checks out, shown as a badge across the catalog.',
  },
  {
    q: 'Is GreenVendor free to use?',
    a: 'Creating an account, completing your ESG questionnaire, and browsing the catalog are all free. We plan to introduce optional paid tiers for advanced analytics and featured placement later.',
  },
  {
    q: 'What types of products can I find on GreenVendor?',
    a: 'The catalog spans raw materials, packaging, electronics components, and food & beverage inputs — anything a business sources in bulk from a vetted supplier.',
  },
  {
    q: 'How do I start selling on GreenVendor?',
    a: 'Register as a Supplier, complete your company profile and ESG questionnaire to get your GreenRatio score, then list your products. Buyers can find and order from you as soon as your listings go live.',
  },
  {
    q: 'Can I negotiate prices with suppliers?',
    a: 'Listed prices are a starting point. Once you place an order, the supplier can confirm, adjust, or decline it — larger volume conversations happen directly between buyer and supplier.',
  },
]

export function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const [product, setProduct] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [suppliers, setSuppliers] = useState<SupplierCatalogItemResponse[]>([])

  const [topSuppliers, setTopSuppliers] = useState<TopSupplierEsgResponse[]>([])
  const [topLoading, setTopLoading] = useState(true)

  const verifiedTopSuppliers = suppliers
  .filter((s) => s.isVerified && s.totalEsgScore != null)
  .sort((a, b) => (b.totalEsgScore ?? 0) - (a.totalEsgScore ?? 0))
  .slice(0, 3)

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // GET /api/supplier has no [Authorize] attribute, so it's safe to call from
  // this public page (unlike GET /api/products, which is Buyer-only).
  useEffect(() => {
    suppliersApi
      .list({ pageSize: 200 })
      .then(setSuppliers)
      .catch(() => setSuppliers([]))
  }, [])

  useEffect(() => {
  let cancelled = false

  suppliersApi
    .getTopSuppliersByEsg(3)
    .then((data) => {
      if (!cancelled) setTopSuppliers(data)
    })
    .catch(() => {
      if (!cancelled) setTopSuppliers([])
    })
    .finally(() => {
      if (!cancelled) setTopLoading(false)
    })

  return () => {
    cancelled = true
  }
}, [])


  const verifiedCount = suppliers.filter((s) => s.isVerified).length
  
  const handleSearch = () => {
    // Authenticated buyers go straight to the catalog with their query
    // applied — no more bouncing signed-in users to /register.
    if (isAuthenticated && role === 'Buyer') {
      navigate('/buyer', { state: { searchQuery: product } })
      return
    }
    if (isAuthenticated && role) {
      navigate(homeRouteForRole(role))
      return
    }
    navigate('/register', product ? { state: { intent: 'buyer', query: product } } : undefined)
  }

  return (
    <div className={styles.page}>
      {/* Hero ------------------------------------------------------------ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroEyebrow}>
            <b /> #1 B2B Sourcing Platform with ESG Ratings
          </span>

          <h1 className={styles.heroTitle}>
            Smart B2B Sourcing
            <span className={styles.heroTitleAccent}>with ESG Transparency</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Bulk sourcing that scores every listing on price competitiveness and sustainability.
            Connect with verified suppliers and make procurement decisions you can stand behind.
          </p>

          <div className={styles.heroSearch}>
            <div className={styles.heroSearchField}>
              <div style={{ width: '100%' }}>
                <span className={styles.heroSearchLabel}>Product</span>
                <input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="What are you looking for?"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className={styles.heroSearchField}>
              <div style={{ width: '100%' }}>
                <span className={styles.heroSearchLabel}>Category</span>
                <input placeholder="Any category" readOnly onClick={handleSearch} />
              </div>
            </div>
            <button className={styles.heroSearchBtn} onClick={handleSearch}>
              <Search size={16} /> Search
            </button>
          </div>
        </div>
      </section>


      
      <section className={styles.section} style={{ background: '#fff' }}>
        <div className={styles.sectionInner}>
          <span className={styles.eyebrow}>Top ESG suppliers</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <h2 className={styles.howTitle} style={{ marginBottom: 0 }}>
              Top 3 companies by ESG score
            </h2>
            <p className={styles.howBody} style={{ marginBottom: 0, maxWidth: '52rem' }}>
              We show the three strongest suppliers by their latest Total ESG score. Each card also explains the score with Environmental, Social, and Governance breakdowns.
            </p>
          </div>

          {topLoading ? (
            <div className={styles.topSuppliersEmpty}>Loading top ESG suppliers…</div>
          ) : topSuppliers.length > 0 ? (
            <div className={styles.topSuppliersGrid}>
              {topSuppliers.map((supplier, index) => (
                <article key={supplier.id} className={styles.topSupplierCard}>
                  <div className={styles.topSupplierHeader}>
                    <div className={styles.topSupplierRank}>#{index + 1}</div>
                    <div className={styles.topSupplierScore}>{supplier.totalEsgScore.toFixed(1)}</div>
                  </div>

                  <h3 className={styles.topSupplierName}>{supplier.companyName}</h3>

                  <div className={styles.topSupplierMeta}>
                    <span className={styles.topSupplierIndustry}>{supplier.industry}</span>
                    <span className={styles.topSupplierGrade}>Grade {supplier.esgGrade}</span>
                  </div>

                  <div className={styles.topSupplierPillars}>
                    <div className={styles.topPillarRow}>
                      <div className={styles.topPillarLabelRow}>
                        <span className={styles.topPillarLabel}>Environmental</span>
                        <span className={styles.topPillarValue}>{supplier.environmental.toFixed(1)}</span>
                      </div>
                      <div className={styles.topPillarTrack}>
                        <div
                          className={styles.topPillarFill}
                          style={{ width: `${Math.max(0, Math.min(100, supplier.environmental))}%` }}
                        />
                      </div>
                    </div>

                    <div className={styles.topPillarRow}>
                      <div className={styles.topPillarLabelRow}>
                        <span className={styles.topPillarLabel}>Social</span>
                        <span className={styles.topPillarValue}>{supplier.social.toFixed(1)}</span>
                      </div>
                      <div className={styles.topPillarTrack}>
                        <div
                          className={styles.topPillarFill}
                          style={{ width: `${Math.max(0, Math.min(100, supplier.social))}%` }}
                        />
                      </div>
                    </div>

                    <div className={styles.topPillarRow}>
                      <div className={styles.topPillarLabelRow}>
                        <span className={styles.topPillarLabel}>Governance</span>
                        <span className={styles.topPillarValue}>{supplier.governance.toFixed(1)}</span>
                      </div>
                      <div className={styles.topPillarTrack}>
                        <div
                          className={styles.topPillarFill}
                          style={{ width: `${Math.max(0, Math.min(100, supplier.governance))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.topSupplierFooter}>
                    <span>{supplier.isVerified ? 'Verified supplier' : 'Unverified supplier'}</span>
                    <span>Updated {new Date(supplier.calculatedTime).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.topSuppliersEmpty}>No rated suppliers yet.</div>
          )}
        </div>
      </section>





      {/* How it works ------------------------------------------------------ */}
      <section id="how-it-works" className={clsx(styles.section, styles.howSection)}>
        <div className={styles.sectionInner}>
          <div className={styles.howGrid}>
            <div>
              <span className={styles.eyebrow}>How GreenVendor Works</span>
              <h2 className={styles.howTitle}>
                From listing to deal
                <br />
                in three simple steps.
              </h2>
              <p className={styles.howBody}>
                We bring radical transparency to B2B sourcing. Every product gets a GreenRatio score so you know
                exactly what you&apos;re buying — and who you&apos;re buying from.
              </p>

              <Link to="/register" className={styles.heroSearchBtn} style={{ display: 'inline-flex' }}>
                Start Listing Free <ArrowRight size={16} />
              </Link>

              <div className={styles.howStatsRow}>
                <div>
                  <div className={styles.howStatValue}>{suppliers.length || '—'}</div>
                  <div className={styles.howStatLabel}>Registered Suppliers</div>
                </div>
                <div>
                  <div className={styles.howStatValue}>{verifiedCount || '—'}</div>
                  <div className={styles.howStatLabel}>Verified Suppliers</div>
                </div>
              </div>
            </div>

            <div className={styles.stepList}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>01</div>
                <div>
                  <div className={styles.stepTitle}>List Your Products</div>
                  <div className={styles.stepBody}>
                    Suppliers upload bulk product listings with pricing, quantities, and ESG compliance data in
                    minutes.
                  </div>
                </div>
              </div>

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>02</div>
                <div>
                  <div className={styles.stepTitle}>Scored Against ESG Criteria</div>
                  <div className={styles.stepBody}>
                    Each listing is scored with a GreenRatio based on price competitiveness and the supplier's
                    Environmental, Social, and Governance answers.
                  </div>
                </div>
              </div>

              <div className={styles.scorePanel}>
                <div className={styles.scorePanelBadge}>
                  <Sparkles size={13} /> GreenRatio Score
                </div>
                <div className={styles.scoreBars}>
                  <div className={styles.scoreBarRow}>
                    <span className={styles.scoreBarLabel}>Environmental</span>
                    <div className={styles.scoreBarTrack}>
                      <div className={styles.scoreBarFill} style={{ width: '92%' }} />
                    </div>
                    <span className={styles.scoreBarValue}>92</span>
                  </div>
                  <div className={styles.scoreBarRow}>
                    <span className={styles.scoreBarLabel}>Social</span>
                    <div className={styles.scoreBarTrack}>
                      <div className={styles.scoreBarFill} style={{ width: '84%' }} />
                    </div>
                    <span className={styles.scoreBarValue}>84</span>
                  </div>
                  <div className={styles.scoreBarRow}>
                    <span className={styles.scoreBarLabel}>Governance</span>
                    <div className={styles.scoreBarTrack}>
                      <div className={styles.scoreBarFill} style={{ width: '88%' }} />
                    </div>
                    <span className={styles.scoreBarValue}>88</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories -------------------------------------------------------- */}
      <section id="categories" className={clsx(styles.section, styles.categorySection)}>
        <div className={styles.sectionInner}>
          <div className={styles.categoryHeader}>
            <div>
              <span className={styles.eyebrow}>Featured Categories</span>
              <h2 className={styles.sectionTitle}>
                Explore trending
                <br />
                <span className={styles.sectionTitleAccent}>bulk product categories</span>
              </h2>
            </div>
          </div>

          <div className={styles.categoryGrid}>
            {PRODUCT_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICON[cat] ?? Package
              const target =
                isAuthenticated && role === 'Buyer'
                  ? { pathname: '/buyer', state: { category: cat } }
                  : { pathname: '/register' }
              return (
                <Link key={cat} to={target} className={styles.categoryCard}>
                  <div className={styles.categoryArt} style={{ background: CATEGORY_GRADIENT[cat] }}>
                    <Icon size={34} strokeWidth={1.5} />
                  </div>
                  <div className={styles.categoryBody}>
                    <div>
                      <div className={styles.categoryName}>{CATEGORY_LABEL[cat] ?? cat}</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Top-rated suppliers --------------------------------------------------- */}
      <section id="esg-spotlight" className={clsx(styles.section, styles.trendingSection)}>
        <div className={styles.sectionInner}>
          <span className={styles.eyebrow}>ESG Spotlight</span>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>
            Top-rated verified suppliers
          </h2>

          {topSuppliers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No verified suppliers with a completed ESG questionnaire yet — check back soon.
            </p>
          ) : (
            <div className={styles.listingGrid}>
              {topSuppliers.map((s) => (
                <Link key={s.id} to={isAuthenticated ? `/buyer/suppliers/${s.id}` : '/register'} className={styles.listingCard}>
                  <div className={styles.listingArt} style={{ background: CATEGORY_GRADIENT.Other }}>
                    <ShieldCheck size={30} strokeWidth={1.5} />
                    <div className={styles.listingRatio}>
                      {scoreToGrade(s.totalEsgScore ?? 0)}
                      <small>grade</small>
                    </div>
                  </div>
                  <div className={styles.listingBody}>
                    <div className={styles.listingName}>{s.companyName}</div>
                    <div className={styles.listingSupplier}>{s.industry}</div>
                    <div className={styles.listingScoreTrack}>
                      <div className={styles.listingScoreFill} style={{ width: `${Math.min(s.totalEsgScore ?? 0, 100)}%` }} />
                    </div>
                    <div className={styles.listingScoreLabel}>ESG {s.totalEsgScore}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA ------------------------------------------------------------------ */}
      <section className={clsx(styles.section, styles.ctaSection)}>
        <div className={clsx(styles.sectionInner, styles.ctaInner)}>
          <div>
            <h2 className={styles.ctaTitle}>Ready to source smarter and greener?</h2>
          </div>
          <p className={styles.ctaBody}>
            Join thousands of businesses already using GreenVendor to build transparent, sustainable supply chains.
          </p>
          <Link to="/register" className={styles.ctaButton}>
            <Plus size={16} /> Get Started Free
          </Link>
        </div>
      </section>

      {/* FAQ ------------------------------------------------------------------- */}
      <section id="pricing" className={clsx(styles.section, styles.faqSection)}>
        <div className={styles.sectionInner}>
          <div className={styles.faqHeader}>
            <span className={styles.eyebrow} style={{ justifyContent: 'center' }}>
              FAQ
            </span>
            <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.6rem' }}>
              Everything you need to know about GreenVendor and how it works.
            </p>
          </div>

          <div className={styles.faqList}>
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div key={faq.q} className={styles.faqItem}>
                  <button className={styles.faqQuestion} onClick={() => setOpenFaq(isOpen ? null : i)}>
                    {faq.q}
                    <Plus size={18} className={clsx(styles.faqIcon, isOpen && styles.faqIconOpen)} />
                  </button>
                  {isOpen && <div className={styles.faqAnswer}>{faq.a}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}