import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardCheck, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Spinner, GradeBadge, VerifiedPill, Button } from '../../components/ui'
import { suppliersApi } from '../../api/suppliers'
import { questionnaireApi } from '../../api/questionnaire'
import { productsApi } from '../../api/products'
import { ordersApi } from '../../api/orders'
import type { QuestionnaireStatusDTO, SupplierDetailsResponse } from '../../types'

export function SupplierDashboard() {
  const [profile, setProfile] = useState<SupplierDetailsResponse | null>(null)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireStatusDTO | null>(null)
  const [productCount, setProductCount] = useState<number | null>(null)
  const [pendingOrders, setPendingOrders] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.allSettled([
      suppliersApi.getMyProfile(),
      questionnaireApi.getMyStatus(),
      productsApi.listMine({ page: 1, pageSize: 1 }),
      ordersApi.incoming(1, 50),
    ]).then(([profileR, qR, productsR, ordersR]) => {
      if (!active) return
      if (profileR.status === 'fulfilled') setProfile(profileR.value)
      if (qR.status === 'fulfilled') setQuestionnaire(qR.value)
      if (productsR.status === 'fulfilled') setProductCount(productsR.value.totalCount)
      if (ordersR.status === 'fulfilled') {
        setPendingOrders(ordersR.value.items.filter((o) => o.status === 'Pending').length)
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  if (loading) return <Spinner />

  const needsQuestionnaire = !questionnaire || questionnaire.status !== 'Submitted'

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Welcome back{profile ? `, ${profile.companyName}` : ''}</h1>
          <p className={dash.pageSubtitle}>
            Here&apos;s a snapshot of your GreenVendor presence — score, listings, and orders in one place.
          </p>
        </div>
      </div>

      {needsQuestionnaire && (
        <div
          className={dash.card}
          style={{
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'var(--primary-light)',
            borderColor: '#bfe6d5',
          }}
        >
          <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <ClipboardCheck size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                {questionnaire?.status === 'InProgress'
                  ? 'Finish your ESG questionnaire'
                  : 'Complete your ESG questionnaire'}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Buyers filter suppliers by ESG grade — you need a submitted questionnaire to appear with a score.
              </p>
            </div>
          </div>
          <Link to="/supplier/questionnaire">
            <Button>
              Start now <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
      )}

      <div className={dash.statGrid}>
        <div className={dash.statCard}>
          <div className={dash.statLabel}>ESG Grade</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GradeBadge grade={profile?.esgGrade} size="lg" />
            <span className={dash.statValue}>{profile?.totalEsgScore != null ? `${profile.totalEsgScore}` : '—'}</span>
          </div>
        </div>

        <div className={dash.statCard}>
          <div className={dash.statLabel}>Verification</div>
          <div style={{ marginTop: '0.35rem' }}>
            <VerifiedPill verified={profile?.isVerified ?? false} />
          </div>
          <div className={dash.statHint}>Admin-reviewed status</div>
        </div>

        <div className={dash.statCard}>
          <div className={dash.statLabel}>Active Products</div>
          <div className={dash.statValue}>{productCount ?? '—'}</div>
          <div className={dash.statHint}>
            <Link to="/supplier/products" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Manage products
            </Link>
          </div>
        </div>

        <div className={dash.statCard}>
          <div className={dash.statLabel}>Pending Orders</div>
          <div className={dash.statValue}>{pendingOrders ?? '—'}</div>
          <div className={dash.statHint}>
            <Link to="/supplier/orders" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Review orders
            </Link>
          </div>
        </div>
      </div>

      <div className={dash.grid2}>
        <Link to="/supplier/products" style={{ textDecoration: 'none' }}>
          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <span className={dash.cardTitle}>
                <Package size={18} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                My Products
              </span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Add, edit, and deactivate the bulk listings buyers see in the catalog.
            </p>
          </div>
        </Link>

        <Link to="/supplier/orders" style={{ textDecoration: 'none' }}>
          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <span className={dash.cardTitle}>
                <ShoppingBag size={18} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                Incoming Orders
              </span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Confirm or reject orders placed by buyers against your listings.
            </p>
          </div>
        </Link>

        <Link to="/supplier/questionnaire" style={{ textDecoration: 'none' }}>
          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <span className={dash.cardTitle}>
                <TrendingUp size={18} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
                ESG Questionnaire
              </span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Review your Environmental, Social, and Governance answers and score.
            </p>
          </div>
        </Link>

        <Link to="/supplier/profile" style={{ textDecoration: 'none' }}>
          <div className={dash.card}>
            <div className={dash.cardHeader}>
              <span className={dash.cardTitle}>Company Profile</span>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Update your company details and upload a certification PDF.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
