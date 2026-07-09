import { api } from './client'
import type { SupplierCatalogItemResponse, SupplierDetailsResponse, SupplierQuery, UpdateSupplierRequest } from '../types'

export const suppliersApi = {
  list: (query: SupplierQuery = {}) =>
    api
      .get<SupplierCatalogItemResponse[]>('/supplier', { params: query })
      .then((r) => r.data),

  getById: (id: string) => api.get<SupplierDetailsResponse>(`/supplier/${id}`).then((r) => r.data),

  getMyProfile: () => api.get<SupplierDetailsResponse>('/supplier/me').then((r) => r.data),

  updateMyProfile: (payload: UpdateSupplierRequest) =>
    api.put<SupplierDetailsResponse>('/supplier/me', payload).then((r) => r.data),

  uploadCertificate: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/supplier/certificate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  certificateUrl: (supplierId: string) => `/api/supplier/${supplierId}/certificate`,
}
