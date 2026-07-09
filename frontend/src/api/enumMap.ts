// The backend does not register a JsonStringEnumConverter (see Program.cs), so
// System.Text.Json serializes C# enums as their numeric ordinal by default —
// e.g. AuthResponse.Role comes back as `0` for Supplier, not `"Supplier"`.
// A handful of DTOs already convert enums to strings manually in the service
// layer (Industry, ProductCategory, EsgGrade) and don't need this. The ones
// that don't (UserRole, QuestionCategory, QuestionnaireStatus, OrderStatus)
// are normalized here so the rest of the app can just use the string unions
// from src/types. If the backend later adds a JsonStringEnumConverter, these
// helpers keep working unchanged (the `typeof value === 'number'` check just
// stops matching).

import type { OrderStatus, QuestionCategory, QuestionnaireStatus, UserRole } from '../types'

function normalizeEnum<T extends string>(value: T | number, table: readonly T[]): T {
  return typeof value === 'number' ? table[value] : value
}

const USER_ROLES: readonly UserRole[] = ['Supplier', 'Buyer', 'Admin']
const QUESTION_CATEGORIES: readonly QuestionCategory[] = ['Environmental', 'Social', 'Governance']
const QUESTIONNAIRE_STATUSES: readonly QuestionnaireStatus[] = ['Draft', 'InProgress', 'Submitted']
const ORDER_STATUSES: readonly OrderStatus[] = ['Pending', 'Confirmed', 'Rejected', 'Completed']

export const normalizeUserRole = (v: UserRole | number) => normalizeEnum(v, USER_ROLES)
export const normalizeQuestionCategory = (v: QuestionCategory | number) => normalizeEnum(v, QUESTION_CATEGORIES)
export const normalizeQuestionnaireStatus = (v: QuestionnaireStatus | number) => normalizeEnum(v, QUESTIONNAIRE_STATUSES)
export const normalizeOrderStatus = (v: OrderStatus | number) => normalizeEnum(v, ORDER_STATUSES)
