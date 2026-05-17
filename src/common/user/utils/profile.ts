import { buildUploadPublicUrl } from "@/common/utils/url"

export function formatProfileValue(value: string | number | null | undefined, fallback = "Chưa cập nhật") {
  if (value === null || value === undefined || value === "") {
    return fallback
  }

  return String(value)
}

export function resolveAvatarUrl(avatarPath: string | null | undefined) {
  if (!avatarPath) {
    return null
  }

  return buildUploadPublicUrl(avatarPath)
}
