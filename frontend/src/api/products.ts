import { api } from './client'
import { suppliersApi } from './suppliers'
import type {
  CreateProductRequest,
  PagedResult,
  ProductQuery,
  ProductResponse,
  ProductsCatalog,
  SupplierProductsCatalog,
  UpdateProductRequest,
} from '../types'

// Module-scoped cache: ProductsCatalog.companyName is currently always "" (see
// types/index.ts ProductQuery comment) because the backend projection dropped
// it. We backfill it here from GET /api/supplier/{id}, once per supplier.
const companyNameCache = new Map<string, string>()

async function enrichCompanyNames(items: ProductsCatalog[]): Promise<ProductsCatalog[]> {
  const missingIds = [...new Set(items.filter((p) => !p.companyName).map((p) => p.supplierId))].filter(
    (id) => !companyNameCache.has(id),
  )
  await Promise.all(
    missingIds.map(async (id) => {
      try {
        const supplier = await suppliersApi.getById(id)
        companyNameCache.set(id, supplier.companyName)
      } catch {
        companyNameCache.set(id, '')
      }
    }),
  )
  return items.map((p) => (p.companyName ? p : { ...p, companyName: companyNameCache.get(p.supplierId) || '' }))
}

export const productsApi = {
  // Buyer catalog — real server-side filtering (name/category/price/ESG grade)
  list: (query: ProductQuery = {}) =>
    api
      .get<PagedResult<ProductsCatalog>>('/products', { params: { page: 1, pageSize: 12, ...query } })
      .then(async (r) => ({ ...r.data, items: await enrichCompanyNames(r.data.items) })),

  getById: (id: string) => api.get<ProductResponse>(`/products/${id}`).then((r) => r.data),

  // Supplier's own products
  listMine: (query: ProductQuery = {}) =>
    api
      .get<PagedResult<SupplierProductsCatalog>>('/suppliers/me/products', { params: { page: 1, pageSize: 20, ...query } })
      .then((r) => r.data),

  create: (payload: CreateProductRequest) =>
    api.post<ProductResponse>('/suppliers/me/products', payload).then((r) => r.data),

  update: (id: string, payload: UpdateProductRequest) =>
    api.put<ProductResponse>(`/suppliers/me/products/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/suppliers/me/products/${id}`),
}
