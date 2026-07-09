import { api } from './client'
import type { PlatformAnalyticsDTO, SupplierCatalogItemResponse, SupplierDetailsResponse } from '../types'

export const adminApi = {
  getSuppliers: () => api.get<SupplierCatalogItemResponse[]>('/admin/suppliers').then((r) => r.data),

  verifySupplier: (id: string) =>
    api.patch<SupplierDetailsResponse>(`/admin/suppliers/${id}/verify`).then((r) => r.data),

  getAnalytics: () => api.get<PlatformAnalyticsDTO>('/admin/analytics').then((r) => r.data),

  createQuestionnaireForSupplier: (supplierId: string) =>
    api.post(`/admin/suppliers/${supplierId}/questionnaire`),
}
