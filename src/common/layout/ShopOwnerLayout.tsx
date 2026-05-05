import { useState, useRef, useEffect } from "react"
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { StaffSaleHeaderSearch } from "@/apps/staff/components/StaffSaleHeaderSearch"
import { StaffSalesSearchProvider } from "@/apps/staff/context/StaffSalesSearchContext"
import { useUserStore } from "@/apps/user/store/UserStore"
import { ShopOwnerProvider, useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { canAccessShopConsolePages, resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { AppHeader } from "@/common/layout/AppHeader"

/* ── Types ── */
type NavChild = {
  to: string
  label: string
  icon: string
}

type NavItemSingle = {
  type: "single"
  to: string
  railLabel: string
  icon: string
}

type NavItemGroup = {
  type: "group"
  railLabel: string
  icon: string
  matchPrefix: string[]
  children: NavChild[]
}

type NavEntry = NavItemSingle | NavItemGroup

/* ── Nav config ── */
const shopConsoleNav: NavEntry[] = [
  {
    type: "single",
    to: "/shop/dashboard",
    railLabel: "Tổng quan",
    icon: "pi pi-chart-bar",
  },
  {
    type: "single",
    to: "/shop/chat",
    railLabel: "Tin nhắn",
    icon: "pi pi-comments",
  },
  {
    type: "group",
    railLabel: "Kinh doanh",
    icon: "pi pi-briefcase",
    matchPrefix: ["/shop/sales", "/shop/services", "/shop/orders", "/shop/bookings"],
    children: [
      { to: "/shop/sales", label: "Bán hàng", icon: "pi pi-calculator" },
      { to: "/shop/services", label: "Dịch vụ", icon: "pi pi-cog" },
      { to: "/shop/orders", label: "Đơn hàng", icon: "pi pi-shopping-cart" },
      { to: "/shop/bookings", label: "Lịch hẹn", icon: "pi pi-calendar" },
    ],
  },
  {
    type: "group",
    railLabel: "Quản lý",
    icon: "pi pi-th-large",
    matchPrefix: ["/shop/product"],
    children: [
      { to: "/shop/product", label: "Sản phẩm", icon: "pi pi-box" },
    ],
  },
  {
    type: "group",
    railLabel: "Cấu hình",
    icon: "pi pi-cog",
    matchPrefix: ["/shop/profile", "/shop/payment-config", "/shop/ghtk-config"],
    children: [
      { to: "/shop/profile", label: "Thông tin", icon: "pi pi-info-circle" },
      { to: "/shop/payment-config", label: "Ngân hàng", icon: "pi pi-credit-card" },
      { to: "/shop/ghtk-config", label: "GHTK", icon: "pi pi-truck" },
    ],
  },
]

export function ShopConsoleLayout() {
  const { user, authentication, currentShopId, shops } = useUserStore()
  const location = useLocation()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  const currentShop = resolveCurrentAuthShop(shops, currentShopId)

  if (!canAccessShopConsolePages(currentShop)) {
    return <Navigate to="/unauthorized" replace />
  }

  const ownerKey = user.email?.trim().toLowerCase() || "default"
  const isSalesPage = location.pathname.startsWith("/shop/sales")
  const isChatPage = location.pathname.startsWith("/shop/chat")

  return (
    <ShopOwnerProvider ownerKey={ownerKey}>
      <StaffSalesSearchProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-[#eef2f6]">
          <AppHeader
            user={user}
            homePath="/shop/dashboard"
            title={currentShop?.name ?? "PetPees"}
            center={isSalesPage ? <StaffSaleHeaderSearch /> : isChatPage ? null : <GlobalSearchBar />}
          />

          <div className="grid flex-1 grid-cols-[96px,1fr] overflow-hidden">
            <aside className="flex h-full flex-col border-r border-[#dfe5ee] bg-[#f7f8fb]">
              <SidebarNav />

            </aside>

            <section className="flex h-full min-w-0 flex-col overflow-y-auto">
              <main className="flex flex-1 flex-col px-2 py-2 lg:px-3 lg:pb-3">
                <Outlet />
              </main>
            </section>
          </div>
        </div>
      </StaffSalesSearchProvider>
    </ShopOwnerProvider>
  )
}

function GlobalSearchBar() {
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

/* ── Sidebar nav with shared flyout state ── */
function SidebarNav() {
  const location = useLocation()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  const openImmediately = (groupLabel: string) => {
    clearHideTimer()
    setOpenGroup(groupLabel)
  }

  const scheduleClose = () => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => setOpenGroup(null), 350)
  }

  const closeImmediately = () => {
    clearHideTimer()
    setOpenGroup(null)
  }

  useEffect(() => {
    return () => clearHideTimer()
  }, [])

  return (
    <nav className="pt-3">
      {shopConsoleNav.map((entry) =>
        entry.type === "single" ? (
          <SingleNavItem key={entry.to} item={entry} onHover={closeImmediately} />
        ) : (
          <GroupNavItem
            key={entry.railLabel}
            item={entry}
            isOpen={openGroup === entry.railLabel}
            currentPath={location.pathname}
            onEnter={() => openImmediately(entry.railLabel)}
            onLeave={scheduleClose}
          />
        )
      )}
    </nav>
  )
}

/* ── Single nav item (no children) ── */
function SingleNavItem({ item, onHover }: { item: NavItemSingle; onHover: () => void }) {
  return (
    <NavLink
      to={item.to}
      onMouseEnter={onHover}
      className={({ isActive }) =>
        `relative flex min-h-[80px] flex-col items-center justify-center gap-1.5 px-2 text-center transition ${
          isActive ? "bg-white text-[#214388]" : "text-[#4c5d74] hover:bg-white/70"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[#214388]" />}
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3fb] text-[#214388] ${item.icon}`}></span>
          <span className="px-1 text-[11px] font-semibold leading-tight">{item.railLabel}</span>
        </>
      )}
    </NavLink>
  )
}

/* ── Grouped nav item with hover flyout ── */
function GroupNavItem({
  item,
  isOpen,
  currentPath,
  onEnter,
  onLeave,
}: {
  item: NavItemGroup
  isOpen: boolean
  currentPath: string
  onEnter: () => void
  onLeave: () => void
}) {
  const isGroupActive = item.matchPrefix.some((prefix) => currentPath.startsWith(prefix))

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* Main rail button */}
      <div
        className={`relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-1.5 px-2 text-center transition ${
          isGroupActive ? "bg-white text-[#214388]" : "text-[#4c5d74] hover:bg-white/70"
        }`}
      >
        {isGroupActive && <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[#214388]" />}
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3fb] text-[#214388] ${item.icon}`}></span>
        <span className="px-1 text-[11px] font-semibold leading-tight">{item.railLabel}</span>
      </div>

      {/* Flyout popover */}
      {isOpen && (
        <div className="absolute left-full top-0 z-50 min-w-[180px]">
          <div className="rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {item.railLabel}
            </div>
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#eef3fb] text-[#214388]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                <i className={`${child.icon} text-[13px]`} />
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ShopConsoleDefaultRedirect() {
  return <Navigate to="/shop/dashboard" replace />
}
