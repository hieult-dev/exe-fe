import { Navigate } from "react-router-dom"
import { useUserStore } from "@/apps/user/store/UserStore"
import { canAccessAdminConsole } from "@/common/auth/utils/adminAccess"
import { canAccessShopConsolePages, resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"

export function RoleHomeRedirect() {
  const { user, authentication, currentShopId, shops, userRole } = useUserStore()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  if (canAccessAdminConsole(user, userRole)) {
    return <Navigate to="/admin/shops" replace />
  }

  const currentShop = resolveCurrentAuthShop(shops, currentShopId)

  if (canAccessShopConsolePages(currentShop)) {
    return <Navigate to="/shop/dashboard" replace />
  }

  return <Navigate to="/unauthorized" replace />
}
