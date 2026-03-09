const rawGateway = import.meta.env.VITE_GATEWAY?.trim()

const GATEWAY_URL = rawGateway ? rawGateway.replace(/\/+$/, "") : ""
const isGatewayConfigured = Boolean(GATEWAY_URL)

function assertGatewayConfigured() {
  if (isGatewayConfigured) {
    return
  }

  throw new Error(
    "Missing VITE_GATEWAY. Tao file .env hoac .env.local voi dong VITE_GATEWAY=http://localhost:8080 va khoi dong lai dev server."
  )
}

if (!isGatewayConfigured && import.meta.env.DEV) {
  console.error(
    "[API CONFIG] VITE_GATEWAY dang bi thieu. Duong dan API se loi. Can them VITE_GATEWAY vao file .env/.env.local."
  )
}

const AUTH_URL = `${GATEWAY_URL}/api/auth`
const USER_URL = `${GATEWAY_URL}/api/user`
const REFRESH_TOKEN_URL = `${GATEWAY_URL}/api/auth/refreshToken`

export {
  GATEWAY_URL,
  AUTH_URL,
  USER_URL,
  REFRESH_TOKEN_URL,
  isGatewayConfigured,
  assertGatewayConfigured,
}
