import api from "@/common/api/baseApi"
import type { CancelGhtkOrderResponse, SubmitGhtkOrderRequest, SubmitGhtkOrderResponse } from "@/apps/orders/model"

const GHTK_ORDER_URL = `/ghtk/orders`
const SHOP_ORDER_URL = `/shop/orders`

export const submitGhtkOrder = async (orderId: number, data: SubmitGhtkOrderRequest) => {
  return api.post<SubmitGhtkOrderResponse>(`${GHTK_ORDER_URL}/${orderId}/submit`, data)
}

export const cancelGhtkOrder = async (orderId: number) => {
  return api.del<CancelGhtkOrderResponse>(`${SHOP_ORDER_URL}/${orderId}/ghtk-cancel`, undefined)
}
