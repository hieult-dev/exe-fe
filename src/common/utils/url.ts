export const SUPABASE_UPLOADS_PUBLIC_URL =
  "https://zwhhqsflmocntuvzbvqm.supabase.co/storage/v1/object/public/uploads"
export const NOT_FOUND_IMAGE_URL = "/image/not-found.jpg"

export function buildUploadPublicUrl(path: string | null | undefined) {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path

  return `${SUPABASE_UPLOADS_PUBLIC_URL}/${path.replace(/^\/+/, "")}`
}

export function getImageUrlOrNotFound(path: string | null | undefined) {
  const url = buildUploadPublicUrl(path?.trim())
  return url || NOT_FOUND_IMAGE_URL
}
