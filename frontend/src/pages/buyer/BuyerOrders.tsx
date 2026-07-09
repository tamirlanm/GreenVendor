import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Button, EmptyState, ErrorBanner, Spinner, StatusPill } from '../../components/ui'
import { ordersApi, type EnrichedShortOrder } from '../../api/orders'
import { apiErrorMessage } from '../../api/client'

export function BuyerOrders() {
  const [orders, setOrders] = useState<EnrichedShortOrder[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    ordersApi
      .myOrders(page, 10)
      .then((res) => {
        setOrders(res.items)
        setTotalPages(res.totalPages)
      })
      .catch((err) => setError(apiErrorMessage(err, 'Could not load your orders.')))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>My Orders</h1>
          <p className={dash.pageSubtitle}>Track every order you&apos;ve placed and its confirmation status.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={32} strokeWidth={1.5} />}
          title="No orders yet"
          body="Orders you place from the catalog will show up here."
        />
      ) : (
        <>
          <div className={dash.card}>
            <div className={dash.tableWrap}>
              <table className={dash.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.name}</td>
                      <td>{o.supplierName}</td>
                      <td>{o.quantity}</td>
                      <td>${o.price.toFixed(2)}</td>
                      <td>
                        <StatusPill status={o.status} />
                      </td>
                      <td>{o.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </div>
  )
}
