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
export type BookingSource = "ONLINE" | "WALK_IN" | "PHONE"

/**
 * Line item within a booking.
 */
export interface BookingLineItemDTO {
  id?: number
  serviceId?: number
  serviceName?: string
  quantity?: number
  unitPrice?: number
  subtotal?: number
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
  customerId?: number | null
  customerName: string
  customerPhone: string
  items: BookingLineItemDTO[]
  totalAmount: number
  status: BookingStatus
  statusLabel?: string
  source?: BookingSource
  assigneeId?: number | null
  assigneeName?: string | null
  assignedStaffIds?: number[] | null
  assignedStaffs?: BookingStaffDTO[] | null
  time?: string | null
  createdAt: string
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

export type BookingStatusFilter = "ALL" | BookingStatus
