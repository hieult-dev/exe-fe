import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type { GhtkConfigDTO, GhtkConfigRequest } from "@/apps/ghtk_config/model"

function getShopGhtkConfigUrl(shopId: number) {
  return `${GATEWAY_URL}/api/shops/${shopId}/ghtk-config`
}

export const getShopGhtkConfig = async (shopId: number) => {
  return api.get<GhtkConfigDTO>(getShopGhtkConfigUrl(shopId))
}

export const updateShopGhtkConfig = async (shopId: number, request: GhtkConfigRequest) => {
  return api.request<GhtkConfigDTO>("put", getShopGhtkConfigUrl(shopId), request)
}

export const testShopGhtkConfig = async (shopId: number) => {
  return api.post<void>(`${getShopGhtkConfigUrl(shopId)}/test`, undefined)
}
