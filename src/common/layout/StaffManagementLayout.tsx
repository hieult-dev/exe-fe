import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { useUserStore } from "@/apps/user/store/UserStore"
import { canAccessStaffPages, resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { ShopOwnerProvider, useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { AppHeader, type AppHeaderUserMenuItem } from "@/common/layout/AppHeader"

export const STAFF_MANAGEMENT_MENU_ITEMS: AppHeaderUserMenuItem[] = [
  { to: "/staff/bookings", label: "Quản lý lịch hẹn", icon: "pi pi-calendar" },
  { to: "/staff/orders", label: "Quản lý đơn hàng", icon: "pi pi-shopping-cart" },
]

export function StaffManagementLayout() {
  const { user, authentication, currentShopId, shops } = useUserStore()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  const currentShop = resolveCurrentAuthShop(shops, currentShopId)

  if (!canAccessStaffPages(currentShop)) {
    return <Navigate to="/unauthorized" replace />
  }

  const staffKey = user.email?.trim().toLowerCase() || "staff"

  return (
    <ShopOwnerProvider ownerKey={staffKey}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#eef2f6]">
        <AppHeader
          user={user}
          homePath="/staff/sales"
          eyebrow="PetPees Staff"
          title={currentShop?.name ?? "PetPees"}
          center={<StaffManagementSearchBar />}
          userMenuItems={STAFF_MANAGEMENT_MENU_ITEMS}
        />

        <section className="min-h-0 flex-1 overflow-y-auto">
          <main className="flex min-h-full flex-col px-2 py-2 lg:px-3 lg:pb-3">
            <Outlet />
          </main>
        </section>
      </div>
    </ShopOwnerProvider>
  )
}

function StaffManagementSearchBar() {
  const { globalSearchQuery, setGlobalSearchQuery } = useShopOwnerContext()
  const [searchDraft, setSearchDraft] = useState(globalSearchQuery)

  useEffect(() => {
    setSearchDraft(globalSearchQuery)
  }, [globalSearchQuery])

  const commitSearch = () => {
    setGlobalSearchQuery(searchDraft.trim())
  }

  return (
    <div className="flex h-10 items-center gap-3 rounded-lg bg-white px-4 text-slate-500">
      <button
        type="button"
        aria-label="Tìm kiếm"
        onClick={commitSearch}
        className="m-0 inline-flex h-6 w-6 items-center justify-center border-none bg-transparent p-0 text-slate-500"
      >
        <i className="pi pi-search"></i>
      </button>
      <InputText
        type="text"
        value={searchDraft}
        onChange={(event) => setSearchDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitSearch()
        }}
        className="!w-full !border-0 !bg-transparent !p-0 !text-sm !text-slate-700 !shadow-none !outline-none focus:!shadow-none"
      />
    </div>
  )
}
