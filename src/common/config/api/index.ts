const rawGateway = import.meta.env.VITE_GATEWAY?.trim()

const DEFAULT_BACKEND_ORIGIN = "https://api.pawply.site"

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

const GATEWAY_URL = normalizeHttpUrl(rawGateway) || DEFAULT_BACKEND_ORIGIN

const API_BASE_URL = `${GATEWAY_URL}/api`

const BACKEND_ORIGIN = GATEWAY_URL

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
const GATEWAY_WEBSOCKET_URL = `${toWebSocketUrl(GATEWAY_URL)}/ws`

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