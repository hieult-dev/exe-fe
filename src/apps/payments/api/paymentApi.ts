import api from "@/common/api/baseApi"
import type { ManualPaymentConfirmDTO, ManualPaymentConfirmRequest } from "@/apps/payments/model"

const PAYMENT_URL = `/payments`

export const manualConfirmPayment = async (data: ManualPaymentConfirmRequest) => {
  return api.post<ManualPaymentConfirmDTO>(`${PAYMENT_URL}/manual-confirm`, data)
}
