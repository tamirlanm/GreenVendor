import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Construction, Sparkles } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { EmptyState, ErrorBanner, Spinner } from '../../components/ui'
import { recommendationsApi } from '../../api/recommendations'
import { apiErrorMessage } from '../../api/client'
import type { RankedSupplier } from '../../types'

export function BuyerRecommendations() {
  const [items, setItems] = useState<RankedSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [notLive, setNotLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    recommendationsApi
      .getForMe()
      .then((r) => setItems(r.recommendations))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotLive(true)
        } else {
          setError(apiErrorMessage(err, 'Could not load recommendations.'))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Recommendations</h1>
          <p className={dash.pageSubtitle}>
            Suppliers our matching model thinks fit your sourcing profile, ranked by similarity.
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : notLive ? (
        <EmptyState
          icon={<Construction size={32} strokeWidth={1.5} />}
          title="Recommendations aren't live yet"
          body="This screen calls GET /api/buyer/me/recommendations, the planned proxy to the ML matching service. It will populate automatically once that endpoint ships."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={32} strokeWidth={1.5} />}
          title="No recommendations yet"
          body="Complete your buyer profile and place a few orders so the model has something to learn from."
        />
      ) : (
        <div className={dash.grid3}>
          {items.map((r) => (
            <Link key={r.supplierId} to={`/buyer/suppliers/${r.supplierId}`} style={{ textDecoration: 'none' }}>
              <div className={dash.card}>
                <div className={dash.cardHeader}>
                  <span className={dash.cardTitle} style={{ fontSize: '1rem' }}>
                    Supplier match
                  </span>
                  <span className={dash.chip}>{Math.round(r.similarityScore * 100)}% match</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>{r.reason}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
