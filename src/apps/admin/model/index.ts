export type AdminShopStatus = "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "INACTIVE" | "SUSPENDED"

export type AdminShopLocationSource = "MANUAL" | "BROWSER_GEO" | "PLACE_PICKER"

export interface AdminShopOwnerDTO {
  id: number
  email: string | null
  fullName: string | null
  phone: string | null
  address: string | null
  age: number | null
  avatarUrlPreview: string | null
  role: string | null
}

export interface AdminShopDTO {
  id: number
  name: string
  addressText: string | null
  imageUrl: string | null
  coverImageUrl: string | null
  phone: string | null
  email: string | null
  description: string | null
  openingHours: string | null
  closingHours: string | null
  facebookUrl: string | null
  lat: number | null
  lng: number | null
  locationSource: AdminShopLocationSource | null
  locationAccuracyM: number | null
  status: AdminShopStatus
  createdAt: string | null
  updatedAt: string | null
  owner: AdminShopOwnerDTO | null
}

export interface AdminShopEmailRequest {
  title: string
  content: string
}

export type AdminShopListStatus = "PENDING_APPROVAL"

export const ADMIN_SHOP_STATUS_LABEL: Record<AdminShopStatus, string> = {
  PENDING_APPROVAL: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Đã từ chối",
  INACTIVE: "Tạm dừng",
  SUSPENDED: "Bị khóa",
}

export function adminShopStatusLabel(status: string) {
  return ADMIN_SHOP_STATUS_LABEL[status as AdminShopStatus] ?? status
}
