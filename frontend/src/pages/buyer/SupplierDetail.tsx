import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Mail, Phone } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { ErrorBanner, GradeBadge, Spinner, VerifiedPill } from '../../components/ui'
import { suppliersApi } from '../../api/suppliers'
import { apiErrorMessage } from '../../api/client'
import type { SupplierDetailsResponse } from '../../types'

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>()
  const [supplier, setSupplier] = useState<SupplierDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    suppliersApi
      .getById(id)
      .then(setSupplier)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load this supplier.')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error || !supplier) return <ErrorBanner message={error ?? 'Supplier not found.'} />

  return (
    <div>
      <Link
        to="/buyer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', textDecoration: 'none' }}
      >
        <ArrowLeft size={15} /> Back to catalog
      </Link>

      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>{supplier.companyName}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={dash.chip}>{supplier.industry}</span>
            <VerifiedPill verified={supplier.isVerified} />
          </div>
        </div>
      </div>

      <div className={dash.grid2}>
        <div className={dash.card}>
          <div className={dash.cardHeader}>
            <span className={dash.cardTitle}>About</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {supplier.description || 'This supplier has not added a description yet.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
              <Mail size={15} color="var(--text-muted)" /> {supplier.email}
            </div>
            {supplier.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <Phone size={15} color="var(--text-muted)" /> {supplier.phone}
              </div>
            )}
            <button
              type="button"
              onClick={() => suppliersApi.viewCertificate(supplier.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <FileText size={15} /> View sustainability certificate
            </button>
          </div>
        </div>

        <div className={dash.card}>
          <div className={dash.cardHeader}>
            <span className={dash.cardTitle}>GreenRatio Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <GradeBadge grade={supplier.esgGrade} size="lg" />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {supplier.totalEsgScore != null ? supplier.totalEsgScore : '—'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {supplier.totalEsgScore != null ? 'Total ESG score, out of 100' : 'Questionnaire not submitted yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
        Browse this supplier&apos;s listings from the{' '}
        <Link to="/buyer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Products tab
        </Link>{' '}
        in the catalog.
      </p>
    </div>
  )
}
