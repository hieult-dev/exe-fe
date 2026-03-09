import { GATEWAY_URL } from "@/common/config/api"

export function formatProfileValue(value: string | number | null | undefined, fallback = "Chưa cập nhật") {
  if (value === null || value === undefined || value === "") {
    return fallback
  }

  return String(value)
}

export function resolveAvatarUrl(avatarPath: string | null | undefined, fallback = "/placeholder-user.jpg") {
  if (!avatarPath) {
    return fallback
  }

  if (avatarPath.startsWith("http") || avatarPath.startsWith("/")) {
    return avatarPath
  }

  return `${GATEWAY_URL}${avatarPath}`
}

