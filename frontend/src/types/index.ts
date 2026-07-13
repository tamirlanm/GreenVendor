// ============================================================================
// Types mirror the backend C# DTOs/enums exactly (see backend/GreenVendor.Application/DTOs)
// Keep in sync with GreenVendor.Domain.Enums and GreenVendor.Application.DTOs
// ============================================================================

export type UserRole = 'Supplier' | 'Buyer' | 'Admin'

export type Industry =
  | 'Manufacturing'
  | 'Technology'
  | 'Agriculture'
  | 'Construction'
  | 'Logistics'
  | 'Retail'
  | 'Other'

export const INDUSTRIES: Industry[] = [
  'Manufacturing',
  'Technology',
  'Agriculture',
  'Construction',
  'Logistics',
  'Retail',
  'Other',
]

export type ProductCategory =
  | 'Paper'
  | 'Furniture'
  | 'Electronics'
  | 'RawMaterials'
  | 'Packaging'
  | 'Other'

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Paper',
  'Furniture',
  'Electronics',
  'RawMaterials',
  'Packaging',
  'Other',
]

export type QuestionCategory = 'Environmental' | 'Social' | 'Governance'

export type QuestionnaireStatus = 'Draft' | 'InProgress' | 'Submitted'

export type OrderStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Completed'

export type EsgGrade = 'A' | 'B' | 'C' | 'D' | 'F'

// ----- Auth ------------------------------------------------------------

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: UserRole
  companyName: string
  industry: Industry
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  role: UserRole
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// ----- Supplier ----------------------------------------------------------

export interface TopSupplierEsgResponse {
  id: string
  companyName: string
  industry: string
  isVerified: boolean
  environmental: number
  social: number
  governance: number
  totalEsgScore: number
  esgGrade: string
  calculatedTime: string
}

export interface SupplierCatalogItemResponse {
  id: string
  companyName: string
  industry: string
  description: string
  isVerified: boolean
  latestEsgScore: number | null
}

export interface SupplierDetailsResponse {
  id: string
  companyName: string
  industry: string
  description: string | null
  isVerified: boolean
  email: string
  phone: string | null
  totalEsgScore: number | null
  esgGrade: string | null
}

export interface UpdateSupplierRequest {
  companyName: string
  industry: string
  description?: string
  email: string
  phone?: string
}

export interface SupplierQuery {
  companyName?: string
  industry?: string
  latestEsgScore?: number
  page?: number
  pageSize?: number
}

// ----- Buyer ---------------------------------------------------------------

export interface BuyerDetailsResponse {
  id: string
  companyName: string
  industry: string
  email: string
  preferredMinGrade: string | null
}

export interface UpdateBuyerRequest {
  companyName: string
  industry: string
  email: string
  preferredMinGrade?: string
}

// ----- Products --------------------------------------------------------

// Query params for GET /api/products and GET /api/suppliers/me/products.
// NOTE: ProductsCatalog.companyName is currently always "" — ProductService
// .GetProductsAsync's projection dropped `CompanyName = p.Supplier.CompanyName`
// in the latest backend update, so the frontend enriches it client-side
// (see api/products.ts).
export interface ProductQuery {
  name?: string
  companyName?: string
  category?: ProductCategory | ''
  minPrice?: number
  maxPrice?: number
  minEsgGrade?: EsgGrade | ''
  page?: number
  pageSize?: number
}

export interface ProductsCatalog {
  id: string
  supplierId: string
  name: string
  companyName: string
  productCategory: string
  price: number
  quantity: number
  imageUrl: string | null
}

export interface SupplierProductsCatalog {
  id: string
  supplierId: string
  name: string
  productCategory: string
  price: number
  quantity: number
  imageUrl: string | null
}

export interface ProductResponse {
  id: string
  supplierId: string
  name: string
  description: string | null
  category: string
  price: number
  quantity: number
  isActive: boolean
  createdAt: string
  supplier: string
  imageUrl: string | null
}

export interface CreateProductRequest {
  name: string
  description?: string
  category: ProductCategory
  price: number
  quantity: number
  isActive: boolean
}

export interface UpdateProductRequest {
  name: string
  description?: string
  category: ProductCategory
  price: number
  quantity: number
  isActive: boolean
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// ----- Questionnaire -----------------------------------------------------

export interface QuestionDTO {
  id: number
  text: string
  category: QuestionCategory
  options: string[]
}

export interface QuestionnaireStatusDTO {
  status: QuestionnaireStatus
  createdAt: string
  submittedAt: string | null
  totalScore: number | null
  esgGrade: string | null
}

export interface UserAnswerDTO {
  questionId: number
  selectedOption: string
}

export interface SubmitQuestionnaireRequest {
  answers: UserAnswerDTO[]
}

export interface EsgScoreResultDTO {
  totalScore: number
  esgGrade: string
}

export interface EsgScoreResult {
  environmental: number
  social: number
  governance: number
  total: number
  grade: string
}

// ----- Admin ------------------------------------------------------------

export interface PlatformAnalyticsDTO {
  totalSuppliers: number
  verifiedSuppliersCount: number
  submittedQuestionnairesCount: number
  averageEsgScore: number
}

// ----- Orders (live: OrdersController / OrderService) -----------------

// Returned by POST /api/orders and PATCH /api/suppliers/me/orders/{id}
export interface OrderResponse {
  id: string
  buyerId: string
  productId: string
  productName: string
  quantity: number
  totalPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string | null
}

// Returned by GET /api/orders/my (buyer's own order history). No supplier
// name/id field exists on this DTO — only productId, so the supplier can only
// be shown by cross-referencing the product (see api/orders.ts enrichment).
export interface ShortOrderResponse {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  status: OrderStatus
  createdAt: string
}

// Returned by GET /api/suppliers/me/orders (supplier's incoming orders).
// NOTE: backend bug — OrderService.GetMySupplierOrdersAsync sets `Id` to
// `o.Product.Id` instead of `o.Id`, so this is actually the PRODUCT id, not
// the order id. PATCH /api/suppliers/me/orders/{id} expects the order id, so
// confirm/reject will 404 until that's fixed server-side. There is also no
// buyerId/buyerCompanyName field at all, so the buyer can't be shown.
export interface SupplierOrdersResponse {
  id: string
  productName: string
  quantity: number
  totalPrice: number
  status: OrderStatus
  createAt: string
}

export interface CreateOrderRequest {
  productId: string
  quantity: number
}

export interface UpdateOrderRequest {
  status: Extract<OrderStatus, 'Confirmed' | 'Rejected'>
}


