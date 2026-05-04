import type { AuthShopDTO, User } from "@/apps/user/model"
import { useUserStore } from "@/apps/user/store/UserStore"

type AuthSessionPayload = {
  accessToken: string
  refreshToken?: string | null
  role?: string | null
  user?: User | null
  currentShopId?: number | null
  shops?: AuthShopDTO[]
}

const TOKEN_KEYS = ["accessToken", "refreshToken", "role"] as const
const USER_STORE_KEY = "user-store"

function removeTokenKeys(storage: Storage) {
  for (const key of TOKEN_KEYS) {
    storage.removeItem(key)
  }
}

function normalizeBearerToken(accessToken: string) {
  return accessToken.startsWith("Bearer ") ? accessToken : `Bearer ${accessToken}`
}

export function clearStoredAuthTokens() {
  removeTokenKeys(localStorage)
  removeTokenKeys(sessionStorage)
}

export function clearPersistedUserStore() {
  localStorage.removeItem(USER_STORE_KEY)
  sessionStorage.removeItem(USER_STORE_KEY)
}

export function applyAuthSession(payload: AuthSessionPayload, rememberMe: boolean) {
  const authStore = useUserStore.getState()
  const bearer = normalizeBearerToken(payload.accessToken)

  authStore.setAuthentication(bearer)
  authStore.setRefreshToken(payload.refreshToken ?? "")
  authStore.setUserRole(payload.role ?? "")

  if (payload.user) {
    authStore.setUser(payload.user)
  }

  if (payload.currentShopId !== undefined) {
    authStore.setCurrentShopId(payload.currentShopId)
  }
  if (payload.shops !== undefined) {
    authStore.setShops(payload.shops)
  }

  clearStoredAuthTokens()
  const targetStorage = rememberMe ? localStorage : sessionStorage
  targetStorage.setItem("accessToken", bearer)
  targetStorage.setItem("refreshToken", payload.refreshToken ?? "")
  targetStorage.setItem("role", payload.role ?? "")
}
