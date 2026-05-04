import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type { ShopPaymentConfigDTO, ShopPaymentConfigRequest } from "@/apps/payment_config/model"

const SHOP_PAYMENT_CONFIG_URL = `${GATEWAY_URL}/api/shop-payment-configs`

type GetShopPaymentConfigsParams = {
  active?: boolean | null
}

export const getShopPaymentConfigs = async ({ active = null }: GetShopPaymentConfigsParams = {}) => {
  const params: Record<string, boolean> = {}
  if (typeof active === "boolean") params.active = active

  return api.get<ShopPaymentConfigDTO[]>(SHOP_PAYMENT_CONFIG_URL, { params })
}

export const getDefaultShopPaymentConfig = async () => {
  return api.get<ShopPaymentConfigDTO>(`${SHOP_PAYMENT_CONFIG_URL}/default`)
}

export const getShopPaymentConfigById = async (id: number) => {
  return api.get<ShopPaymentConfigDTO>(`${SHOP_PAYMENT_CONFIG_URL}/${id}`)
}

export const createShopPaymentConfig = async (request: ShopPaymentConfigRequest) => {
  return api.post<ShopPaymentConfigDTO>(SHOP_PAYMENT_CONFIG_URL, request)
}

export const updateShopPaymentConfig = async (id: number, request: ShopPaymentConfigRequest) => {
  return api.request<ShopPaymentConfigDTO>("put", `${SHOP_PAYMENT_CONFIG_URL}/${id}`, request)
}

export const deleteShopPaymentConfig = async (id: number) => {
  return api.del<void>(`${SHOP_PAYMENT_CONFIG_URL}/${id}`, undefined)
}
