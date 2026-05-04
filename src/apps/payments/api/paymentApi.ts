import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type { ManualPaymentConfirmDTO, ManualPaymentConfirmRequest } from "@/apps/payments/model"

const PAYMENT_URL = `${GATEWAY_URL}/api/payments`

export const manualConfirmPayment = async (data: ManualPaymentConfirmRequest) => {
  return api.post<ManualPaymentConfirmDTO>(`${PAYMENT_URL}/manual-confirm`, data)
}
