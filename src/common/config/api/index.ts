const rawGateway = import.meta.env.VITE_GATEWAY?.trim()

const API_BASE_URL = "/api"

// Backend thật chỉ dùng cho local/dev hoặc các chỗ cần so sánh origin.
const DEFAULT_BACKEND_ORIGIN = "http://103.107.182.64:8080"

function normalizeHttpUrl(value: string | undefined) {
  if (!value) return ""

  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return ""
    return url.toString().replace(/\/+$/, "")
  } catch {
    return ""
  }
}

const BACKEND_ORIGIN = import.meta.env.PROD ? "" : normalizeHttpUrl(rawGateway) || DEFAULT_BACKEND_ORIGIN

function toWebSocketUrl(httpUrl: string) {
  const url = new URL(httpUrl)
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  return url.toString().replace(/\/+$/, "")
}

function assertGatewayConfigured() {
  return true
}

if (rawGateway && !normalizeHttpUrl(rawGateway)) {
  console.error("[API CONFIG] VITE_GATEWAY không hợp lệ. Giá trị cần có dạng http://localhost:8080 hoặc https://domain.")
}

const AUTH_URL = "/auth"
const USER_URL = "/user"
const REFRESH_TOKEN_URL = "/auth/refreshToken"
const GATEWAY_WEBSOCKET_URL =
  !import.meta.env.PROD && BACKEND_ORIGIN ? `${toWebSocketUrl(BACKEND_ORIGIN)}/ws` : ""

export {
  API_BASE_URL,
  DEFAULT_BACKEND_ORIGIN,
  BACKEND_ORIGIN,
  GATEWAY_WEBSOCKET_URL,
  AUTH_URL,
  USER_URL,
  REFRESH_TOKEN_URL,
  assertGatewayConfigured,
}
