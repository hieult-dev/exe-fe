import type { CommissionDTO, CommissionInvoiceDTO } from "@/apps/platform-fees/model"

export type AdminCommissionCollectionStatus = "OUTSTANDING" | "OVERDUE" | "PAID"

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type AdminShopMonthlyCommissionDTO = {
  shopId: number
  shopName: string
  shopImageUrl?: string | null
  transactionCount: number
  invoiceCount: number
  grossAmount: number
  commissionBase: number
  commissionAmount: number
  pendingAmount: number
  invoicedAmount: number
  collectedAmount: number
  outstandingAmount: number
  overdueAmount: number
  status: AdminCommissionCollectionStatus
}

export type AdminCommissionMonthlySummaryDTO = {
  shopCount: number
  transactionCount: number
  outstandingShopCount: number
  overdueShopCount: number
  grossAmount: number
  commissionBase: number
  commissionAmount: number
  pendingAmount: number
  invoicedAmount: number
  collectedAmount: number
  outstandingAmount: number
  overdueAmount: number
}

export type AdminCommissionMonthlyReportDTO = {
  periodFrom: string
  periodTo: string
  summary: AdminCommissionMonthlySummaryDTO
  shops: PageResponse<AdminShopMonthlyCommissionDTO>
}

export type AdminShopMonthlyCommissionDetailDTO = {
  periodFrom: string
  periodTo: string
  shop: AdminShopMonthlyCommissionDTO
  commissions: CommissionDTO[]
  invoices: CommissionInvoiceDTO[]
}

export type AdminMonthlyCommissionListParams = {
  month: string
  keyword?: string
  status?: AdminCommissionCollectionStatus
  page?: number
  size?: number
}
