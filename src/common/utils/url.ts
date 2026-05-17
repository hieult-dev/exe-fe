import { DEFAULT_BACKEND_ORIGIN } from "@/common/config/api"

export const NOT_FOUND_IMAGE_URL = "/image/not-found.jpg"

function toRelativeAssetPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`
}

export function getImageUrl(path?: string | null) {
  const trimmedPath = path?.trim()
  if (!trimmedPath) return ""

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const url = new URL(trimmedPath)
      const backendOrigin = new URL(DEFAULT_BACKEND_ORIGIN).origin

      if (url.origin === backendOrigin && (url.pathname.startsWith("/uploads/") || url.pathname.startsWith("/files/"))) {
        return `${url.pathname}${url.search}`
      }
    } catch {
      return ""
    }

    return trimmedPath
  }

  return toRelativeAssetPath(trimmedPath)
}

export const buildUploadPublicUrl = getImageUrl

export function getImageUrlOrNotFound(path: string | null | undefined) {
  const url = getImageUrl(path)
  return url || NOT_FOUND_IMAGE_URL
}
