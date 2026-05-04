import type { InvoiceStatus } from "@/apps/invoices/model"
import type { OrderStatus } from "@/apps/orders/model"
import type { BookingStatus } from "@/apps/bookings/model"

export type ManualPaymentMethod = "CASH" | "BANK_TRANSFER"

type ManualPaymentConfirmBaseRequest = {
  invoiceId: number
  paidAmount: number
  paymentMethod: ManualPaymentMethod
  note?: string
}

export type ManualPaymentConfirmRequest =
  | (ManualPaymentConfirmBaseRequest & { orderId: number; bookingId?: never })
  | (ManualPaymentConfirmBaseRequest & { bookingId: number; orderId?: never })

export interface ManualPaymentConfirmDTO {
  invoiceId: number
  orderId?: number
  bookingId?: number
  paidAmount: number
  invoiceStatus: InvoiceStatus
  orderStatus?: OrderStatus
  bookingStatus?: BookingStatus
  confirmedAt: string
}
