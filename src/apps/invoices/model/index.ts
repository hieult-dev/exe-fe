export type InvoiceStatus = "ISSUED" | "PAID" | "CANCELLED"
export type InvoicePaymentMethod = "CASH" | "BANK_TRANSFER"
export type InvoiceLineType = "PRODUCT" | "SERVICE" | "PACKAGE_REDEEM" | "ADJUSTMENT"

export interface InvoiceLineDTO {
  id: number
  invoiceId: number
  lineType: InvoiceLineType
  refId: number
  itemName: string
  qty: number
  unitPrice: number
  amount: number
}

export interface InvoiceDTO {
  id: number
  shopId: number
  customerId: number | null
  bookingId: number | null
  orderId: number | null
  totalAmount: number
  status: InvoiceStatus
  paymentMethod: InvoicePaymentMethod | null
  issuedAt: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceDetailDTO extends InvoiceDTO {
  lines: InvoiceLineDTO[]
}

export type CreateInvoiceRequest = {
  customerId: number | null
  bookingId: number | null
  orderId: number | null
  totalAmount: number
  status: InvoiceStatus
  issuedAt: string
}
