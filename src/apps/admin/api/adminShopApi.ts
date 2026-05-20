import api from "@/common/api/baseApi"
import type { AdminShopDTO, AdminShopEmailRequest, AdminShopListStatus } from "@/apps/admin/model"

const ADMIN_SHOP_URL = "/admin/shops"

export const getAdminShops = (status: AdminShopListStatus = "PENDING_APPROVAL") => {
  return api.get<AdminShopDTO[]>(ADMIN_SHOP_URL, {
    params: { status },
  })
}

export const getAdminShopById = (shopId: number) => {
  return api.get<AdminShopDTO>(`${ADMIN_SHOP_URL}/${shopId}`)
}

export const approveAdminShop = (shopId: number) => {
  return api.put<AdminShopDTO>(`${ADMIN_SHOP_URL}/${shopId}/approve`, undefined)
}

export const rejectAdminShop = (shopId: number) => {
  return api.put<AdminShopDTO>(`${ADMIN_SHOP_URL}/${shopId}/reject`, undefined)
}

export const sendAdminShopEmail = (shopId: number, request: AdminShopEmailRequest) => {
  return api.post<void>(`${ADMIN_SHOP_URL}/${shopId}/email`, request)
}
