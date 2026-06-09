export type CommissionInvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELED"

export type CommissionStatus = "PENDING" | "INVOICED" | "COLLECTED" | "REFUNDED" | "CANCELED"

export type CommissionSourceType = "ORDER" | "SERVICE_BOOKING" | "VET_BOOKING"

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type CommissionSummaryDTO = {
  hasUnpaidInvoice: boolean
  unpaidInvoiceAmount: number
  unpaidInvoiceCount: number
  pendingCommissionAmount: number
  pendingCommissionCount: number
  paidInvoiceAmount: number
  paidInvoiceCount: number
  overdueInvoiceAmount: number
  overdueInvoiceCount: number
  nextDueDate?: string | null
  nearestUnpaidInvoiceId?: number | null
  currentPeriodFrom?: string | null
  currentPeriodTo?: string | null
  nextInvoiceDate?: string | null
  message?: string | null
}

export type CommissionInvoiceDTO = {
  id: number
  shopId: number
  invoiceCode: string
  periodFrom: string
  periodTo: string
  totalGrossAmount: number
  totalCommissionAmount: number
  status: CommissionInvoiceStatus
  createdAt: string
  dueAt: string
  paidAt?: string | null
}

export type CommissionInvoiceItemDTO = {
  commissionId: number
  sourceType: CommissionSourceType
  sourceId: number
  sourceCode?: string | null
  completedAt?: string | null
  grossAmount: number
  discountAmount: number
  shippingFee: number
  commissionBase: number
  commissionRateBps: number
  commissionAmount: number
}

export type CommissionInvoiceDetailDTO = CommissionInvoiceDTO & {
  items: CommissionInvoiceItemDTO[]
}

export type CommissionPaymentInfoDTO = {
  invoiceId: number
  invoiceCode: string
  amount: number
  bankCode: string
  accountNumber: string
  accountName: string
  transferContent: string
  qrUrl: string
  dueAt: string
}

export type CommissionDTO = {
  id: number
  shopId: number
  sourceType: CommissionSourceType
  sourceId: number
  sourceCode?: string | null
  invoiceId?: number | null
  invoiceCode?: string | null
  grossAmount: number
  discountAmount: number
  shippingFee: number
  commissionBase: number
  commissionRateBps: number
  commissionAmount: number
  status: CommissionStatus
  completedAt?: string | null
  createdAt: string
  invoicedAt?: string | null
  collectedAt?: string | null
}

export type InvoiceListParams = {
  status?: CommissionInvoiceStatus
  page?: number
  size?: number
}

export type CommissionListParams = {
  status?: CommissionStatus
  sourceType?: CommissionSourceType
  from?: string
  to?: string
  page?: number
  size?: number
}
