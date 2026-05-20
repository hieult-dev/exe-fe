export const NOT_FOUND_IMAGE_URL = "/image/not-found.jpg"

const DEFAULT_UPLOAD_PUBLIC_ORIGIN = "https://zwhhqsflmocntuvzbvqm.supabase.co/storage/v1/object/public"
const rawUploadPublicOrigin = import.meta.env.VITE_UPLOAD_PUBLIC_ORIGIN?.trim()

function normalizeHttpOrigin(value: string | undefined) {
  if (!value) return ""

  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return ""
    return url.toString().replace(/\/+$/, "")
  } catch {
    return ""
  }
}

const UPLOAD_PUBLIC_ORIGIN = normalizeHttpOrigin(rawUploadPublicOrigin) || DEFAULT_UPLOAD_PUBLIC_ORIGIN

function isUploadPath(path: string) {
  return path === "/uploads" || path.startsWith("/uploads/")
}

function toUploadPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return isUploadPath(normalizedPath) ? normalizedPath : ""
}

export function getImageUrl(path?: string | null) {
  const trimmedPath = path?.trim()
  if (!trimmedPath) return ""

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const url = new URL(trimmedPath)
      if (isUploadPath(url.pathname)) {
        return `${UPLOAD_PUBLIC_ORIGIN}${url.pathname}${url.search}${url.hash}`
      }
    } catch {
      return trimmedPath
    }

    return trimmedPath
  }

  const uploadPath = toUploadPath(trimmedPath)
  if (uploadPath) {
    return `${UPLOAD_PUBLIC_ORIGIN}${uploadPath}`
  }

  return trimmedPath
}

export const buildUploadPublicUrl = getImageUrl

export function getImageUrlOrNotFound(path: string | null | undefined) {
  const url = getImageUrl(path)
  return url || NOT_FOUND_IMAGE_URL
}
