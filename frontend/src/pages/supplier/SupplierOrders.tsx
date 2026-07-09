import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, ShoppingBag, XCircle } from 'lucide-react'
import dash from '../../components/ui/dashboard.module.css'
import { Button, EmptyState, ErrorBanner, Spinner, StatusPill } from '../../components/ui'
import { ordersApi } from '../../api/orders'
import { apiErrorMessage } from '../../api/client'
import type { SupplierOrdersResponse } from '../../types'

export function SupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrdersResponse[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    ordersApi
      .incoming(page, 10)
      .then((res) => {
        setOrders(res.items)
        setTotalPages(res.totalPages)
      })
      .catch((err) => setError(apiErrorMessage(err, 'Could not load incoming orders.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const act = async (id: string, status: 'Confirmed' | 'Rejected') => {
    setActingId(id)
    setError(null)
    try {
      await ordersApi.updateStatus(id, { status })
      load()
    } catch (err) {
      // Most likely cause right now: the backend's GetMySupplierOrdersAsync
      // returns the product id in place of the order id, so this id won't
      // match any order and the PATCH 404s. See types/index.ts SupplierOrdersResponse.
      setError(apiErrorMessage(err, 'Could not update this order.'))
    } finally {
      setActingId(null)
    }
  }

  return (
    <div>
      <div className={dash.pageHeader}>
        <div>
          <h1 className={dash.pageTitle}>Incoming Orders</h1>
          <p className={dash.pageSubtitle}>Confirm or reject orders buyers have placed against your products.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={32} strokeWidth={1.5} />}
          title="No orders yet"
          body="Once a buyer orders one of your products, it will show up here for you to confirm or reject."
        />
      ) : (
        <>
          <div className={dash.card}>
            <div className={dash.tableWrap}>
              <table className={dash.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Placed</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.productName}</td>
                      <td>{o.quantity}</td>
                      <td>${o.totalPrice.toFixed(2)}</td>
                      <td>{o.createAt}</td>
                      <td>
                        <StatusPill status={o.status} />
                      </td>
                      <td>
                        {o.status === 'Pending' ? (
                          <div className={dash.tableActions}>
                            <Button size="sm" onClick={() => act(o.id, 'Confirmed')} disabled={actingId === o.id}>
                              <CheckCircle2 size={14} /> Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => act(o.id, 'Rejected')}
                              disabled={actingId === o.id}
                            >
                              <XCircle size={14} /> Reject
                            </Button>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</div>
                        )}
                      </td>
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
