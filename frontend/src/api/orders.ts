import { api } from './client'
import { productsApi } from './products'
import type { CreateOrderRequest, OrderResponse, PagedResult, ShortOrderResponse, SupplierOrdersResponse, UpdateOrderRequest } from '../types'

// Orders are live (OrdersController). Two known backend quirks, not fixed here:
// 1. SupplierOrdersResponse.id is actually the PRODUCT id (backend bug in
//    GetMySupplierOrdersAsync), so confirm/reject will 404 until that's a
//    real order id server-side.
// 2. Neither ShortOrderResponse nor SupplierOrdersResponse expose the
//    counterparty (no supplier name for buyers, no buyer name for suppliers).
//    We enrich the buyer's own-orders list with supplier name via a product
//    lookup below; there's no equivalent lookup available for the supplier
//    side (no buyerId on the DTO at all).

export interface EnrichedShortOrder extends ShortOrderResponse {
  supplierName: string
}

export const ordersApi = {
  create: (payload: CreateOrderRequest) => api.post<OrderResponse>('/orders', payload).then((r) => r.data),

  myOrders: async (page = 1, pageSize = 10) => {
    const res = await api
      .get<PagedResult<ShortOrderResponse>>('/orders/my', { params: { pageNumber: page, pageSize } })
      .then((r) => r.data)

    const productIds = [...new Set(res.items.map((o) => o.productId))]
    const products = await Promise.all(
      productIds.map((id) => productsApi.getById(id).catch(() => null)),
    )
    const supplierNameByProduct = new Map(products.map((p, i) => [productIds[i], p?.supplier ?? 'Unknown supplier']))

    return {
      ...res,
      items: res.items.map((o) => ({ ...o, supplierName: supplierNameByProduct.get(o.productId) ?? 'Unknown supplier' })),
    } satisfies PagedResult<EnrichedShortOrder>
  },

  incoming: (page = 1, pageSize = 10) =>
    api
      .get<PagedResult<SupplierOrdersResponse>>('/suppliers/me/orders', { params: { pageNumber: page, pageSize } })
      .then((r) => r.data),

  updateStatus: (id: string, payload: UpdateOrderRequest) =>
    api.patch<OrderResponse>(`/suppliers/me/orders/${id}`, payload).then((r) => r.data),
}
