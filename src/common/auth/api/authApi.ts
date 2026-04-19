import { AUTH_URL, REFRESH_TOKEN_URL, assertGatewayConfigured } from "@/common/config/api"
import { useUserStore } from "@/apps/user/store/UserStore"
import baseApi from "@/common/api/baseApi"
import type { User } from "@/apps/user/model/index"
import { clearPersistedUserStore, clearStoredAuthTokens } from "@/common/auth/utils/session"

type TokenRefresh = {
  accessToken: string
  refreshToken: string
  role: string
  user: User
}

type AuthenticationResponse = {
  accessToken: string
  refreshToken: string
  role: string
  user: User
}

function login(email: string, password: string) {
  assertGatewayConfigured()
  return baseApi.post<AuthenticationResponse>(`${AUTH_URL}/shop/login`, {
    email,
    password,
  })
}

function register(data: FormData) {
  assertGatewayConfigured()
  return baseApi.postWithFile<AuthenticationResponse>(`${AUTH_URL}/shop-owner/register`, data)
}

function logout() {
  const currentRefreshToken = useUserStore.getState().refreshToken

  clearStoredAuthTokens()
  clearPersistedUserStore()

  if (!currentRefreshToken || !AUTH_URL) {
    return Promise.resolve()
  }

  return baseApi.post<void>(`${AUTH_URL}/logout`, {
    refreshToken: currentRefreshToken,
  })
}

let refreshPromise: Promise<void> | null = null

async function refreshToken(): Promise<void> {
  const authStore = useUserStore.getState()

  if (!authStore.refreshToken) {
    return Promise.reject("No refresh token")
  }

  assertGatewayConfigured()

  if (refreshPromise) {
    return refreshPromise
  }

  authStore.setRefreshingToken(true)

  refreshPromise = (async () => {
    try {
      const rs = await baseApi.post<TokenRefresh>(REFRESH_TOKEN_URL, {
        refreshToken: authStore.refreshToken,
      })

      if (rs) {
        authStore.setAuthentication(`Bearer ${rs.accessToken}`)
        authStore.setRefreshToken(rs.refreshToken)
        authStore.setUserRole(rs.role)
      }
    } finally {
      authStore.setRefreshingToken(false)
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export { login, logout, refreshToken, register }
