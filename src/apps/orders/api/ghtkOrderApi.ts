import api from "@/common/api/baseApi"
import type { SubmitGhtkOrderRequest, SubmitGhtkOrderResponse } from "@/apps/orders/model"

const GHTK_ORDER_URL = `/ghtk/orders`

export const submitGhtkOrder = async (orderId: number, data: SubmitGhtkOrderRequest) => {
  return api.post<SubmitGhtkOrderResponse>(`${GHTK_ORDER_URL}/${orderId}/submit`, data)
}
