import api from "@/common/api/baseApi"
import type { CreateInvoiceRequest, InvoiceDTO, InvoiceDetailDTO } from "@/apps/invoices/model"

const INVOICE_URL = `/invoices`

export const createInvoice = async (data: CreateInvoiceRequest) => {
  return api.post<InvoiceDTO>(INVOICE_URL, data)
}

export const getInvoiceByOrderId = async (orderId: number) => {
  return api.get<InvoiceDetailDTO>(`${INVOICE_URL}/by-order/${orderId}`)
}
