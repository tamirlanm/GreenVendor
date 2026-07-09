import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3 } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { ErrorBanner, Spinner } from '../../components/ui'
import { adminApi } from '../../api/admin'
import { apiErrorMessage } from '../../api/client'
import type { PlatformAnalyticsDTO } from '../../types'

export function AdminAnalytics() {
  const [data, setData] = useState<PlatformAnalyticsDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(apiErrorMessage(err, 'Could not load analytics.')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error || !data) return <ErrorBanner message={error ?? 'Analytics unavailable.'} />

  const chartData = [
    { name: 'Total Suppliers', value: data.totalSuppliers },
    { name: 'Verified', value: data.verifiedSuppliersCount },
    { name: 'Questionnaires Submitted', value: data.submittedQuestionnairesCount },
  ]

  const verifiedRate = data.totalSuppliers > 0 ? Math.round((data.verifiedSuppliersCount / data.totalSuppliers) * 100) : 0
  const submissionRate =
    data.totalSuppliers > 0 ? Math.round((data.submittedQuestionnairesCount / data.totalSuppliers) * 100) : 0

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Analytics</h1>
          <p className={dash.pageSubtitle}>Platform-wide supplier verification and ESG participation.</p>
        </div>
      </div>

      <div className={dash.statGrid}>
        <div className={dash.statCard}>
          <div className={dash.statLabel}>Total Suppliers</div>
          <div className={dash.statValue}>{data.totalSuppliers}</div>
        </div>
        <div className={dash.statCard}>
          <div className={dash.statLabel}>Verified</div>
          <div className={dash.statValue}>{data.verifiedSuppliersCount}</div>
          <div className={dash.statHint}>{verifiedRate}% of all suppliers</div>
        </div>
        <div className={dash.statCard}>
          <div className={dash.statLabel}>Questionnaires Submitted</div>
          <div className={dash.statValue}>{data.submittedQuestionnairesCount}</div>
          <div className={dash.statHint}>{submissionRate}% completion rate</div>
        </div>
        <div className={dash.statCard}>
          <div className={dash.statLabel}>Average ESG Score</div>
          <div className={dash.statValue}>{data.averageEsgScore.toFixed(1)}</div>
          <div className={dash.statHint}>out of 100</div>
        </div>
      </div>

      <div className={dash.card}>
        <div className={dash.cardHeader}>
          <span className={dash.cardTitle}>
            <BarChart3 size={18} style={{ verticalAlign: '-3px', marginRight: '0.4rem' }} />
            Supplier Funnel
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0ed" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#f7f5f0' }} contentStyle={{ borderRadius: 8, border: '1px solid #e7e3d6', fontSize: 13 }} />
            <Bar dataKey="value" fill="#02a073" radius={[6, 6, 0, 0]} maxBarSize={64} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
