import api from "@/common/api/baseApi"
import type {
  ShopMemberCreateRequest,
  ShopMemberDTO,
  ShopMemberResetPasswordRequest,
  ShopMemberRole,
  ShopMemberStatus,
  ShopMemberUpdateRequest,
} from "@/apps/members/model"

export type {
  ShopMemberCreateRequest,
  ShopMemberDTO,
  ShopMemberResetPasswordRequest,
  ShopMemberRole,
  ShopMemberStatus,
  ShopMemberUpdateRequest,
}

type ShopMemberListParams = {
  role?: ShopMemberRole | null
  status?: ShopMemberStatus | null
  keyword?: string
}

const SHOP_MEMBER_URL = `/shop-members`
const SHOP_URL = `/shops`

export const getShopMembers = async ({ role, status, keyword }: ShopMemberListParams = {}) => {
  const params: Record<string, string> = {}
  const normalizedKeyword = keyword?.trim()

  if (role) params.role = role
  if (status) params.status = status
  if (normalizedKeyword) params.keyword = normalizedKeyword

  return api.get<ShopMemberDTO[]>(SHOP_MEMBER_URL, { params })
}

export const getShopMemberById = async (userId: number) => {
  return api.get<ShopMemberDTO>(`${SHOP_MEMBER_URL}/${userId}`)
}

export const createShopMember = async (request: ShopMemberCreateRequest) => {
  return api.post<ShopMemberDTO>(SHOP_MEMBER_URL, request)
}

export const updateShopMember = async (userId: number, request: ShopMemberUpdateRequest) => {
  return api.request<ShopMemberDTO>("patch", `${SHOP_MEMBER_URL}/${userId}`, request)
}

export const resetShopMemberPassword = async (userId: number, request: ShopMemberResetPasswordRequest) => {
  return api.request<void>("patch", `${SHOP_MEMBER_URL}/${userId}/password`, request)
}

export const deleteShopMember = async (userId: number) => {
  return api.del<void>(`${SHOP_MEMBER_URL}/${userId}`, undefined)
}

export const getActiveStaff = async () => {
  return api.get<ShopMemberDTO[]>(`${SHOP_URL}/staff`)
}
