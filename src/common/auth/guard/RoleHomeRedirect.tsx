import { Navigate } from "react-router-dom"
import { useUserStore } from "@/apps/user/store/UserStore"
import { canAccessShopOwnerPages, canAccessStaffPages, resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"

export function RoleHomeRedirect() {
  const { user, authentication, currentShopId, shops } = useUserStore()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  const currentShop = resolveCurrentAuthShop(shops, currentShopId)

  if (canAccessShopOwnerPages(currentShop)) {
    return <Navigate to="/shop-owner/dashboard" replace />
  }

  if (canAccessStaffPages(currentShop)) {
    return <Navigate to="/staff/sales" replace />
  }

  return <Navigate to="/unauthorized" replace />
}
