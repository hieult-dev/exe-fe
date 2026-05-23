import type { InvoiceDetailDTO } from "@/apps/invoices/model"

/**
 * Booking status enum matching backend BookingStatus.
 */
export type BookingStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"

/**
 * Booking source enum matching backend BookingSource.
 */
export type BookingSource = "STAFF" | "CUSTOMER" | "SYSTEM"
export type BookingItemType = "SERVICE" | "PRODUCT" | "PACKAGE_REDEEM" | "ADJUSTMENT"

/**
 * Line item within a booking.
 */
export interface BookingLineItemDTO {
  id?: number
  bookingItemId?: number
  itemType: BookingItemType
  refId: number
  productId?: number | null
  serviceId?: number | null
  petId?: number | null
  petName?: string | null
  name: string
  serviceType?: "GENERAL" | "VETERINARY" | null
  veterinaryServiceType?: "VACCINATION" | "EXAMINATION" | "TREATMENT" | "TEST" | "SURGERY" | "CONSULTATION" | "OTHER" | null
  vaccineId?: number | null
  vaccineName?: string | null
  quantity: number
  unitPrice: number
  amount: number
}

export type BookingCheckoutItemRequest = {
  itemType: BookingItemType
  refId: number
  petId?: number | null
  qty: number
  unitPrice: number
}

export type BookingCheckoutRequest = {
  items: BookingCheckoutItemRequest[]
  issuedAt: string
}

/**
 * Data Transfer Object matching backend BookingDTO.
 */
export interface BookingDTO {
  id: number
  bookingCode: string
  shopId: number
  userId: number | null
  userFullName: string | null
  userPhone: string | null
  userEmail: string | null
  userAvatarUrlPreview: string | null
  customerId: number | null
  customerFullName?: string | null
  customerName: string | null
  customerPhone: string | null
  petId?: number | null
  petName?: string | null
  startAt: string
  endAt: string
  items: BookingLineItemDTO[]
  totalAmount: number
  status: BookingStatus
  statusLabel: string
  source: BookingSource
  note: string | null
  createdBy: number | null
  time: string
  createdAt: string
  updatedAt: string
}

/**
 * Cursor-based paginated response from backend.
 */
export interface BookingCursorPage {
  content: BookingDTO[]
  size: number
  nextCursor: number | null
  hasNext: boolean
}

export type BookingCheckoutResponse = {
  booking: BookingDTO
  invoice: InvoiceDetailDTO
}

export type BookingStatusFilter = "ALL" | BookingStatus
