import { BACKEND_ORIGIN } from "@/common/config/api"

export const NOT_FOUND_IMAGE_URL = "/image/not-found.jpg"

function toRelativeAssetPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`
}

export function getImageUrl(path?: string | null) {
  const trimmedPath = path?.trim()
  if (!trimmedPath) return ""

  if (/^https?:\/\//i.test(trimmedPath)) {
    return trimmedPath
  }

  return `${BACKEND_ORIGIN}${toRelativeAssetPath(trimmedPath)}`
}

export const buildUploadPublicUrl = getImageUrl

export function getImageUrlOrNotFound(path: string | null | undefined) {
  const url = getImageUrl(path)
  return url || NOT_FOUND_IMAGE_URL
}
