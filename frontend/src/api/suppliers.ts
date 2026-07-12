import { api } from './client'

import type {
  SupplierCatalogItemResponse,
  SupplierDetailsResponse,
  SupplierQuery,
  UpdateSupplierRequest,
  TopSupplierEsgResponse,
} from '../types'

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

  viewCertificate: async (supplierId: string) => {
    const response = await api.get(`/supplier/${supplierId}/certificate`, {
      responseType: 'blob',
    })

    const contentType = (response.headers['content-type'] as string) || 'application/pdf'
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)

    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.click()
    }

    setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
  },

  getTopSuppliersByEsg: (take = 3) =>
    api.get<TopSupplierEsgResponse[]>('/supplier/top-esg', { params: { take } }).then((r) => r.data),
}
