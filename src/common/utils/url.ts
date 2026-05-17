export const SUPABASE_UPLOADS_PUBLIC_URL =
  "https://zwhhqsflmocntuvzbvqm.supabase.co/storage/v1/object/public/uploads"
export const NOT_FOUND_IMAGE_URL = "/image/not-found.jpg"

export function buildUploadPublicUrl(path: string | null | undefined) {
  const trimmedPath = path?.trim()
  if (!trimmedPath) return ""
  if (/^https?:\/\//i.test(trimmedPath)) return trimmedPath

  const uploadPath = trimmedPath.replace(/^\/+/, "").replace(/^uploads\/+/, "")
  return `${SUPABASE_UPLOADS_PUBLIC_URL}/${uploadPath}`
}

export function getImageUrlOrNotFound(path: string | null | undefined) {
  const url = buildUploadPublicUrl(path?.trim())
  return url || NOT_FOUND_IMAGE_URL
}
