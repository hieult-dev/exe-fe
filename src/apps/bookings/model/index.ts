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
export type BookingSource = "ONLINE" | "WALK_IN" | "PHONE" | "STAFF"
export type BookingItemType = "SERVICE" | "PRODUCT" | "PACKAGE_REDEEM" | "ADJUSTMENT"

/**
 * Line item within a booking.
 */
export interface BookingLineItemDTO {
  id: number
  itemType: BookingItemType
  refId: number
  petId?: number | null
  name: string
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

export interface BookingStaffDTO {
  bookingId?: number
  userId: number
  fullName?: string | null
  email?: string | null
  avatarUrlPreview?: string | null
}

/**
 * Data Transfer Object matching backend BookingDTO.
 */
export interface BookingDTO {
  id: number
  bookingCode: string
  shopId: number
  customerId: number | null
  customerName: string
  customerPhone: string
  startAt: string
  endAt: string
  items: BookingLineItemDTO[]
  totalAmount: number
  status: BookingStatus
  statusLabel: string
  source: BookingSource
  note: string | null
  createdBy: number | null
  assigneeId: number | null
  assigneeName: string | null
  assignedStaffIds: number[]
  assignedStaffs: BookingStaffDTO[]
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
