import { useEffect, useState } from 'react'
import { ClipboardPlus, ShieldCheck, Users } from 'lucide-react'
import { ClipboardPlus, FileText, ShieldCheck, Users } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Button, EmptyState, ErrorBanner, GradeBadge, Spinner, VerifiedPill } from '../../components/ui'
import { adminApi } from '../../api/admin'
import { suppliersApi } from '../../api/suppliers'
import { apiErrorMessage } from '../../api/client'
import type { SupplierCatalogItemResponse } from '../../types'

export function AdminSuppliers() {
  const [items, setItems] = useState<SupplierCatalogItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({})
  const [assigned, setAssigned] = useState<Record<string, boolean>>({})

  const load = () => {
    setLoading(true)
    adminApi
      .getSuppliers()
      .then(setItems)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load suppliers.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const verify = async (id: string) => {
    setRowBusy((p) => ({ ...p, [id]: true }))
    setRowError((p) => ({ ...p, [id]: '' }))
    try {
      const updated = await adminApi.verifySupplier(id)
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, isVerified: updated.isVerified } : s)))
    } catch (err) {
      setRowError((p) => ({ ...p, [id]: apiErrorMessage(err, 'Could not verify this supplier.') }))
    } finally {
      setRowBusy((p) => ({ ...p, [id]: false }))
    }
  }

  const assignQuestionnaire = async (id: string) => {
    setRowBusy((p) => ({ ...p, [id]: true }))
    setRowError((p) => ({ ...p, [id]: '' }))
    try {
      await adminApi.createQuestionnaireForSupplier(id)
      setAssigned((p) => ({ ...p, [id]: true }))
    } catch (err) {
      setRowError((p) => ({ ...p, [id]: apiErrorMessage(err, 'Could not assign a questionnaire.') }))
    } finally {
      setRowBusy((p) => ({ ...p, [id]: false }))
    }
  }

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Suppliers</h1>
          <p className={dash.pageSubtitle}>Verify supplier accounts and assign ESG questionnaires.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon={<Users size={32} strokeWidth={1.5} />} title="No suppliers registered yet" />
      ) : (
        <div className={dash.card}>
          <div className={dash.tableWrap}>
            <table className={dash.table}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>ESG Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.companyName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '20rem' }}>
                        {s.description}
                      </div>
                      {rowError[s.id] && (
                        <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '0.3rem', fontWeight: 600 }}>
                          {rowError[s.id]}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={dash.chip}>{s.industry}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GradeBadge grade={s.latestEsgScore != null ? scoreToGrade(s.latestEsgScore) : null} />
                        {s.latestEsgScore ?? '—'}
                      </div>
                    </td>
                    <td>
                      <VerifiedPill verified={s.isVerified} />
                    </td>
                    <td>
                      <div className={dash.tableActions}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => assignQuestionnaire(s.id)}
                          disabled={rowBusy[s.id] || assigned[s.id]}
                        >
                          <ClipboardPlus size={14} /> {assigned[s.id] ? 'Assigned' : 'Assign Questionnaire'}
                        </Button>
                        <Button size="sm" onClick={() => verify(s.id)} disabled={rowBusy[s.id] || s.isVerified}>
                          <ShieldCheck size={14} /> {s.isVerified ? 'Verified' : 'Verify'}
                        </Button>
                        <a href={suppliersApi.certificateUrl(s.id)} target="_blank" rel="noreferrer">
+                          <Button size="sm" variant="ghost" type="button">
+                            <FileText size={14} /> Certificate
+                          </Button>
+                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}
