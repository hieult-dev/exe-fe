import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type { ShopDTO, ShopProfileUpdateRequest } from "@/apps/profile/model"

const SHOP_PROFILE_URL = `${GATEWAY_URL}/api/shop-owner/shop-profile`

export const getShopProfile = () => {
  return api.get<ShopDTO>(SHOP_PROFILE_URL)
}

function appendOptionalString(formData: FormData, key: string, value: string | undefined) {
  if (value !== undefined) formData.append(key, value)
}

function toShopProfileFormData(data: ShopProfileUpdateRequest) {
  const formData = new FormData()

  formData.append("name", data.name)
  appendOptionalString(formData, "addressText", data.addressText)
  appendOptionalString(formData, "imageUrl", data.imageUrl)
  if (data.avatar) formData.append("avatar", data.avatar, data.avatar.name)
  appendOptionalString(formData, "coverImageUrl", data.coverImageUrl)
  if (data.cover_img) formData.append("cover_img", data.cover_img, data.cover_img.name)
  appendOptionalString(formData, "phone", data.phone)
  appendOptionalString(formData, "email", data.email)
  appendOptionalString(formData, "description", data.description)
  appendOptionalString(formData, "openingHours", data.openingHours)
  appendOptionalString(formData, "closingHours", data.closingHours)
  appendOptionalString(formData, "facebookUrl", data.facebookUrl)
  formData.append("lat", String(data.lat))
  formData.append("lng", String(data.lng))
  formData.append("locationSource", data.locationSource)
  if (data.locationAccuracyM !== undefined) formData.append("locationAccuracyM", String(data.locationAccuracyM))

  return formData
}

export const updateShopProfile = (data: ShopProfileUpdateRequest) => {
  return api.putWithFile<ShopDTO>(SHOP_PROFILE_URL, toShopProfileFormData(data))
}
