import { api } from './client'
import type { RecommendResponse } from '../types'

// NOTE: GET /api/buyers/me/recommendations is the planned proxy endpoint to the
// Python ML service (see GreenVendor_Plan_new.md). Not yet exposed by BuyerController
// at the time this frontend was built — the Recommendations page shows a graceful
// "coming soon" state if this 404s.

export const recommendationsApi = {
  getForMe: () => api.get<RecommendResponse>('/buyer/me/recommendations').then((r) => r.data),
}
