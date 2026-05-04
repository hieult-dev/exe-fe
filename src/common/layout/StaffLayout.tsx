import { Navigate, Outlet } from "react-router-dom"
import { StaffSaleHeaderSearch } from "@/apps/staff/components/StaffSaleHeaderSearch"
import { StaffSalesSearchProvider } from "@/apps/staff/context/StaffSalesSearchContext"
import { useUserStore } from "@/apps/user/store/UserStore"
import { canAccessStaffPages, resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { AppHeader } from "@/common/layout/AppHeader"
import { STAFF_MANAGEMENT_MENU_ITEMS } from "@/common/layout/StaffManagementLayout"

export function StaffLayout() {
  const { user, authentication, currentShopId, shops } = useUserStore()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  const currentShop = resolveCurrentAuthShop(shops, currentShopId)

  if (!canAccessStaffPages(currentShop)) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <StaffSalesSearchProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#eef2f6]">
        <AppHeader
          user={user}
          homePath="/staff/sales"
          eyebrow="PetPees Staff"
          title={currentShop?.name ?? "PetPees"}
          center={<StaffSaleHeaderSearch />}
          userMenuItems={STAFF_MANAGEMENT_MENU_ITEMS}
        />

        <main className="min-h-0 flex-1 overflow-hidden p-2 lg:p-3">
          <Outlet />
        </main>
      </div>
    </StaffSalesSearchProvider>
  )
}

export function StaffDefaultRedirect() {
  return <Navigate to="/staff/sales" replace />
}
