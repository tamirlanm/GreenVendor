import { api } from './client'
import type { BuyerDetailsResponse, UpdateBuyerRequest } from '../types'

export const buyersApi = {
  getMyProfile: () => api.get<BuyerDetailsResponse>('/buyer/me').then((r) => r.data),

  updateMyProfile: (payload: UpdateBuyerRequest) =>
    api.put<BuyerDetailsResponse>('/buyer/me', payload).then((r) => r.data),
}
