import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Boxes,
  Cpu,
  Leaf,
  Package,
  Plus,
  Search,
  Sparkles,
  Wheat,
} from 'lucide-react'
import clsx from 'clsx'
import styles from './home.module.css'

const CATEGORIES = [
  { name: 'Raw Materials', count: '2,340 listings', icon: Leaf, gradient: 'linear-gradient(155deg,#b08968,#8a6a4d)' },
  { name: 'Packaging', count: '1,890 listings', icon: Package, gradient: 'linear-gradient(155deg,#6b8f71,#41573f)' },
  { name: 'Electronics', count: '3,120 listings', icon: Cpu, gradient: 'linear-gradient(155deg,#4b5a63,#2b333a)' },
  { name: 'Food & Beverage', count: '4,550 listings', icon: Wheat, gradient: 'linear-gradient(155deg,#c99a4a,#a3762f)' },
]

const LISTINGS = [
  {
    name: 'Organic Cotton Fabric Rolls',
    supplier: 'EcoTex Mills',
    price: '$2.40/kg',
    min: '500 kg min',
    tags: ['GOTS Certified', 'Fair Trade', 'Carbon Neutral'],
    ratio: 91,
    esg: 94,
    gradient: 'linear-gradient(155deg,#d9c9a3,#a6906a)',
  },
  {
    name: 'Recycled HDPE Pellets',
    supplier: 'GreenPoly Industries',
    price: '$1.15/kg',
    min: '1 ton min',
    tags: ['Post-Consumer', 'Low Carbon'],
    ratio: 86,
    esg: 88,
    gradient: 'linear-gradient(155deg,#7c8c94,#4d5a61)',
  },
  {
    name: 'Bamboo Packaging Trays',
    supplier: 'VerdePack Solutions',
    price: '$0.85/unit',
    min: '2,000 units min',
    tags: ['Biodegradable', 'FSC Certified'],
    ratio: 93,
    esg: 96,
    gradient: 'linear-gradient(155deg,#8fae6b,#557239)',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'GreenVendor transformed how we source raw materials. The GreenRatio score gives us instant confidence in every supplier we evaluate — it\u2019s become essential to our procurement workflow.',
    author: 'Maria Chen',
    role: 'Head of Procurement, NexGen Manufacturing',
  },
  {
    quote:
      'We cut supplier due-diligence time from weeks to days. Having Environmental, Social, and Governance scores side by side with pricing changed how our whole team shortlists vendors.',
    author: 'Daniyar Sultanov',
    role: 'Sourcing Lead, Aral Logistics',
  },
  {
    quote:
      'As a supplier, the questionnaire made it easy to show buyers exactly where we stand. Our GreenRatio score became a real sales asset, not just a compliance checkbox.',
    author: 'Aigerim Bekova',
    role: 'Founder, EcoPack Kazakhstan',
  },
]

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
  const [product, setProduct] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleSearch = () => {
    navigate('/register', product ? { state: { intent: 'buyer', query: product } } : undefined)
  }

  const testimonial = TESTIMONIALS[testimonialIdx]

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

          <div className={styles.heroStats}>
            <div>
              <div className={styles.heroStatValue}>50,000+</div>
              <div className={styles.heroStatLabel}>Verified Listings</div>
            </div>
            <div>
              <div className={styles.heroStatValue}>12,000+</div>
              <div className={styles.heroStatLabel}>Active Suppliers</div>
            </div>
            <div>
              <div className={styles.heroStatValue}>98%</div>
              <div className={styles.heroStatLabel}>ESG Compliant</div>
            </div>
          </div>
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
                  <div className={styles.howStatValue}>50K+</div>
                  <div className={styles.howStatLabel}>Active Listings</div>
                </div>
                <div>
                  <div className={styles.howStatValue}>12K+</div>
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
                  <div className={styles.stepTitle}>Scored Agains ESG criteria</div>
                  <div className={styles.stepBody}>
                    Each listing is scored with a GreenRatio based on price competitiveness and the supplier's
+                    Environmental, Social, and Governance answers.
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
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link key={cat.name} to="/register" className={styles.categoryCard}>
                  <div className={styles.categoryArt} style={{ background: cat.gradient }}>
                    <Icon size={34} strokeWidth={1.5} />
                  </div>
                  <div className={styles.categoryBody}>
                    <div>
                      <div className={styles.categoryName}>{cat.name}</div>
                      <div className={styles.categoryCount}>{cat.count}</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trending listings --------------------------------------------------- */}
      <section id="esg-spotlight" className={clsx(styles.section, styles.trendingSection)}>
        <div className={styles.sectionInner}>
          <span className={styles.eyebrow}>ESG Spotlight</span>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>
            Trending green listings
          </h2>

          <div className={styles.listingGrid}>
            {LISTINGS.map((item) => (
              <div key={item.name} className={styles.listingCard}>
                <div className={styles.listingArt} style={{ background: item.gradient }}>
                  <Boxes size={30} strokeWidth={1.5} />
                  <div className={styles.listingRatio}>
                    {item.ratio}
                    <small>ratio</small>
                  </div>
                </div>
                <div className={styles.listingBody}>
                  <div className={styles.listingName}>{item.name}</div>
                  <div className={styles.listingSupplier}>{item.supplier}</div>
                  <div className={styles.listingMeta}>
                    <span className={styles.listingPrice}>{item.price}</span>
                    <span className={styles.listingMin}>{item.min}</span>
                  </div>
                  <div className={styles.listingTags}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={styles.listingTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.listingScoreTrack}>
                    <div className={styles.listingScoreFill} style={{ width: `${item.esg}%` }} />
                  </div>
                  <div className={styles.listingScoreLabel}>ESG {item.esg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial -------------------------------------------------------- */}
      <section className={clsx(styles.section, styles.testimonialSection)}>
        <div className={styles.sectionInner}>
          <div className={styles.testimonialCard}>
            <div>
              <span className={styles.eyebrow}>Trusted by industry leaders</span>
              <p className={styles.testimonialQuote}>&ldquo;{testimonial.quote}&rdquo;</p>
              <div className={styles.testimonialAuthor}>{testimonial.author}</div>
              <div className={styles.testimonialRole}>{testimonial.role}</div>

              <div className={styles.testimonialDots}>
                {TESTIMONIALS.map((t, i) => (
                  <button
                    key={t.author}
                    className={clsx(styles.testimonialDot, i === testimonialIdx && styles.testimonialDotActive)}
                    onClick={() => setTestimonialIdx(i)}
                    aria-label={`Show testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className={styles.testimonialPortrait}>
              <Sparkles size={40} strokeWidth={1} />
            </div>
          </div>
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
