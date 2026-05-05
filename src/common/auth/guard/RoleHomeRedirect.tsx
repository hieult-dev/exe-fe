import { Navigate } from "react-router-dom"
import { useUserStore } from "@/apps/user/store/UserStore"
import { canAccessShopConsolePages, resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"

export function RoleHomeRedirect() {
  const { user, authentication, currentShopId, shops } = useUserStore()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  const currentShop = resolveCurrentAuthShop(shops, currentShopId)

  if (canAccessShopConsolePages(currentShop)) {
    return <Navigate to="/shop/dashboard" replace />
  }

  return <Navigate to="/unauthorized" replace />
}
