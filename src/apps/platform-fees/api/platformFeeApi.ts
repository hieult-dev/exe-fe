import api from "@/common/api/baseApi"
import type {
  CommissionDTO,
  CommissionInvoiceDTO,
  CommissionInvoiceDetailDTO,
  CommissionListParams,
  CommissionPaymentInfoDTO,
  CommissionSummaryDTO,
  InvoiceListParams,
  PageResponse,
} from "@/apps/platform-fees/model"

const SHOP_COMMISSION_SUMMARY_URL = "/shop/commission-summary"
const SHOP_COMMISSION_INVOICES_URL = "/shop/commission-invoices"
const SHOP_COMMISSIONS_URL = "/shop/commissions"

export const platformFeeApi = {
  getSummary: () => api.get<CommissionSummaryDTO>(SHOP_COMMISSION_SUMMARY_URL),

  getInvoices: ({ status, page = 0, size = 10 }: InvoiceListParams = {}) =>
    api.get<PageResponse<CommissionInvoiceDTO>>(SHOP_COMMISSION_INVOICES_URL, {
      params: { status, page, size },
    }),

  getInvoiceDetail: (invoiceId: number) => api.get<CommissionInvoiceDetailDTO>(`${SHOP_COMMISSION_INVOICES_URL}/${invoiceId}`),

  getPaymentInfo: (invoiceId: number) => api.get<CommissionPaymentInfoDTO>(`${SHOP_COMMISSION_INVOICES_URL}/${invoiceId}/payment-info`),

  getCommissions: ({ status, sourceType, from, to, page = 0, size = 10 }: CommissionListParams = {}) =>
    api.get<PageResponse<CommissionDTO>>(SHOP_COMMISSIONS_URL, {
      params: { status, sourceType, from, to, page, size },
    }),
}

export const getCommissionSummary = platformFeeApi.getSummary
export const getCommissionInvoices = platformFeeApi.getInvoices
export const getCommissionInvoiceDetail = platformFeeApi.getInvoiceDetail
export const getCommissionPaymentInfo = platformFeeApi.getPaymentInfo
export const getCommissions = platformFeeApi.getCommissions
