import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Package, Search, ShoppingCart, Users, X } from 'lucide-react'
import clsx from 'clsx'
import dash from '../../components/ui/dashboard.module.css'
import { Button, EmptyState, ErrorBanner, GradeBadge, Spinner, VerifiedPill } from '../../components/ui'
import { suppliersApi } from '../../api/suppliers'
import { productsApi } from '../../api/products'
import { ordersApi } from '../../api/orders'
import { apiErrorMessage } from '../../api/client'
import { INDUSTRIES, PRODUCT_CATEGORIES, type ProductsCatalog, type SupplierCatalogItemResponse } from '../../types'

type Tab = 'suppliers' | 'products'

export function BuyerCatalog() {
  const location = useLocation()
  const navState = (location.state ?? {}) as { searchQuery?: string; category?: string }
  const [tab, setTab] = useState<Tab>('products')

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Catalog</h1>
          <p className={dash.pageSubtitle}>Browse verified suppliers and their bulk product listings.</p>
        </div>
      </div>

      <div className={dash.tabs}>
        <button className={clsx(dash.tab, tab === 'products' && dash.tabActive)} onClick={() => setTab('products')}>
          <Package size={14} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />
          Products
        </button>
        <button className={clsx(dash.tab, tab === 'suppliers' && dash.tabActive)} onClick={() => setTab('suppliers')}>
          <Users size={14} style={{ verticalAlign: '-2px', marginRight: '0.35rem' }} />
          Suppliers
        </button>
      </div>

      {tab === 'products' ? (
        <ProductsTab initialSearch={navState.searchQuery} initialCategory={navState.category} />
      ) : (
        <SuppliersTab />
      )}
    </div>
  )
}

//Suppliers ----------------------------------------------------------------

function SuppliersTab() {
  const [items, setItems] = useState<SupplierCatalogItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [minScore, setMinScore] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    setLoading(true)
    setError(null)
    suppliersApi
      .list({
        companyName: companyName || undefined,
        industry: industry || undefined,
        latestEsgScore: minScore ? Number(minScore) : undefined,
        page,
        pageSize,
      })
      .then(setItems)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load suppliers.')))
      .finally(() => setLoading(false))
  }, [companyName, industry, minScore, page])

  return (
    <div>
      <div className={dash.filterBar}>
        <div className={dash.filterField}>
          <span className={dash.filterLabel}>Company</span>
          <input
            className={dash.input}
            placeholder="Search by name…"
            value={companyName}
            onChange={(e) => {
              setPage(1)
              setCompanyName(e.target.value)
            }}
          />
        </div>
        <div className={dash.filterField}>
          <span className={dash.filterLabel}>Industry</span>
          <select
            className={dash.select}
            value={industry}
            onChange={(e) => {
              setPage(1)
              setIndustry(e.target.value)
            }}
          >
            <option value="">Any industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className={dash.filterField}>
          <span className={dash.filterLabel}>Min ESG Score</span>
          <input
            type="number"
            min={0}
            max={100}
            className={dash.input}
            placeholder="e.g. 70"
            value={minScore}
            onChange={(e) => {
              setPage(1)
              setMinScore(e.target.value)
            }}
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon={<Users size={32} strokeWidth={1.5} />} title="No suppliers match those filters" />
      ) : (
        <>
          <div className={dash.grid3}>
            {items.map((s) => (
              <Link key={s.id} to={`/buyer/suppliers/${s.id}`} style={{ textDecoration: 'none' }}>
                <div className={dash.card}>
                  <div className={dash.cardHeader}>
                    <span className={dash.cardTitle}>{s.companyName}</span>
                    <GradeBadge grade={s.latestEsgScore != null ? scoreToGrade(s.latestEsgScore) : null} />
                  </div>
                  <span className={dash.chip}>{s.industry}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.75rem 0' }}>
                    {s.description || 'No description provided.'}
                  </p>
                  <VerifiedPill verified={s.isVerified} />
                </div>
              </Link>
            ))}
          </div>

          <div className={dash.pagination}>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} /> Prev
            </Button>
            <span className={dash.pageIndicator}>Page {page}</span>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={items.length < pageSize}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

/** Best-effort client-side grade estimate for supplier cards where only a raw score is available. */
function scoreToGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}

//Products ------------------------------------------------------------------ 

function ProductsTab({ initialSearch, initialCategory }: { initialSearch?: string; initialCategory?: string }) {
  const [items, setItems] = useState<ProductsCatalog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState(initialSearch ?? '')
  const [category, setCategory] = useState(initialCategory ?? '')
  const [minGrade, setMinGrade] = useState('')
  const pageSize = 12

  const [orderTarget, setOrderTarget] = useState<ProductsCatalog | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const timeout = setTimeout(() => {
      productsApi
        .list({
          page,
          pageSize,
          name: search || undefined,
          category: (category || undefined) as never,
          minEsgGrade: (minGrade || undefined) as never,
        })
        .then((res) => {
          setItems(res.items)
          setTotalPages(res.totalPages)
        })
        .catch((err) => setError(apiErrorMessage(err, 'Could not load products.')))
        .finally(() => setLoading(false))
    }, 300) // debounce so typing in the search box doesn't fire a request per keystroke
    return () => clearTimeout(timeout)
  }, [page, search, category, minGrade])

  const filtered = items

  return (
    <div>
      <div className={dash.filterBar}>
        <div className={dash.filterField}>
          <span className={dash.filterLabel}>
            <Search size={11} style={{ verticalAlign: '-1px' }} /> Search this page
          </span>
          <input
            className={dash.input}
            placeholder="Product name…"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />
        </div>
        <div className={dash.filterField}>
          <span className={dash.filterLabel}>Category</span>
          <select
            className={dash.select}
            value={category}
            onChange={(e) => {
              setPage(1)
              setCategory(e.target.value)
            }}
          >
            <option value="">Any category</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className={dash.filterField}>
          <span className={dash.filterLabel}>Min ESG Grade</span>
          <select
            className={dash.select}
            value={minGrade}
            onChange={(e) => {
              setPage(1)
              setMinGrade(e.target.value)
            }}
          >
            <option value="">Any grade</option>
            {['A', 'B', 'C', 'D', 'F'].map((g) => (
              <option key={g} value={g}>
                {g}+
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Package size={32} strokeWidth={1.5} />} title="No products match" />
      ) : (
        <>
          <div className={dash.grid3}>
            {filtered.map((p) => (
              <div key={p.id} className={dash.card}>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{
                      width: '100%',
                      height: '9rem',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.85rem',
                    }}
                  />
                )}
                <div className={dash.cardHeader}>
                  <span className={dash.cardTitle} style={{ fontSize: '1rem' }}>
                    {p.name}
                  </span>
                </div>
                <Link to={`/buyer/suppliers/${p.supplierId}`} style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {p.companyName}
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.9rem 0' }}>
                  <span className={dash.chip}>{p.productCategory}</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>${p.price.toFixed(2)}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
+                  {p.quantity > 0 ? `${p.quantity} in stock` : 'Out of stock'}
+                </p>
+                <Button full size="sm" onClick={() => setOrderTarget(p)} disabled={p.quantity <= 0}>
                  <ShoppingCart size={14} /> Order
                </Button>
              </div>
            ))}
          </div>

          <div className={dash.pagination}>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} /> Prev
            </Button>
            <span className={dash.pageIndicator}>
              Page {page} of {totalPages}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </>
      )}

      {orderTarget && <OrderModal product={orderTarget} onClose={() => setOrderTarget(null)} />}
    </div>
  )
}

function OrderModal({ product, onClose }: { product: ProductsCatalog; onClose: () => void }) {
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await ordersApi.create({ productId: product.id, quantity })
      setSuccess(true)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not place this order.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={dash.modalBackdrop} onClick={onClose}>
      <div className={dash.modal} onClick={(e) => e.stopPropagation()}>
        <div className={dash.modalHeader}>
          <span className={dash.modalTitle}>Order {product.name}</span>
          <button className={dash.modalCloseBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Order placed</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {product.companyName} will confirm or reject it — track progress from My Orders.
            </p>
            <Button onClick={onClose} full>
              Done
            </Button>
          </div>
        ) : (
          <>
            {error && <ErrorBanner message={error} />}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', marginBottom: '1rem' }}>
              From {product.companyName} · ${product.price.toFixed(2)} / unit
            </p>
            <div className={dash.formRow}>
              <label className={dash.formLabel}>Quantity</label>
              <input
                type="number"
                min={1}
                className={dash.input}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Total: ${(quantity * product.price).toFixed(2)}</p>
            <div className={dash.modalActions}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Placing…' : 'Place Order'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
