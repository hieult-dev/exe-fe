import { useState, useRef, useEffect } from "react"
import { NavLink, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useUserStore } from "@/apps/user/store/UserStore"
import { ShopOwnerProvider, useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { formatProfileValue, resolveAvatarUrl } from "@/common/user/utils/profile"
import { logout } from "@/common/auth/api/authApi"
import { resetStoreAndRedirectToLogin } from "@/common/auth/store/ResetStore"
import { AvatarChip } from "@/common/component/AvatarChip"

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
const shopOwnerNav: NavEntry[] = [
  {
    type: "single",
    to: "/shop-owner/dashboard",
    railLabel: "Tổng quan",
    icon: "pi pi-chart-bar",
  },
  {
    type: "group",
    railLabel: "Kinh doanh",
    icon: "pi pi-briefcase",
    matchPrefix: ["/shop-owner/services", "/shop-owner/orders", "/shop-owner/bookings"],
    children: [
      { to: "/shop-owner/services", label: "Dịch vụ", icon: "pi pi-cog" },
      { to: "/shop-owner/orders", label: "Đơn hàng", icon: "pi pi-shopping-cart" },
      { to: "/shop-owner/bookings", label: "Lịch hẹn", icon: "pi pi-calendar" },
    ],
  },
  {
    type: "group",
    railLabel: "Quản lý",
    icon: "pi pi-th-large",
    matchPrefix: ["/shop-owner/inventory", "/shop-owner/members"],
    children: [
      { to: "/shop-owner/inventory", label: "Kho hàng", icon: "pi pi-box" },
      { to: "/shop-owner/members", label: "Thành viên", icon: "pi pi-users" },
    ],
  },
  {
    type: "single",
    to: "/shop-owner/tax",
    railLabel: "Thuế",
    icon: "pi pi-file",
  },
  {
    type: "single",
    to: "/shop-owner/profile",
    railLabel: "Thông tin",
    icon: "pi pi-info-circle",
  },
]

export function ShopOwnerLayout() {
  const navigate = useNavigate()
  const { user, authentication } = useUserStore()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  const ownerKey = user.email?.trim().toLowerCase() || "default"
  const avatarUrl = resolveAvatarUrl(user.avatarUrlPreview)

  return (
    <ShopOwnerProvider ownerKey={ownerKey}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#eef2f6]">
        <header className="z-30 shrink-0 bg-[#214388] text-white shadow-sm">
          <div className="relative flex h-16 items-center justify-between px-4 lg:px-6">
            <button
              type="button"
              onClick={() => navigate("/shop-owner/dashboard")}
              className="inline-flex items-center gap-3 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl">
                <img
                  src="/image/logo-petpees2.png"
                  alt="PetPees logo"
                  className="h-full w-full object-cover"
                />
              </span>
              <div className="hidden sm:block">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">PetPees Admin</p>
                <p className="text-[1.9rem] font-semibold leading-none">PetPees</p>
              </div>
            </button>

            <div className="absolute left-1/2 top-1/2 hidden w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2 md:block">
              <GlobalSearchBar />
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <HeaderIconButton icon="pi pi-search" className="md:hidden" />
              <HeaderIconButton icon="pi pi-bell" />
              <HeaderIconButton icon="pi pi-th-large" />

              <UserDropdown user={user} avatarUrl={avatarUrl} />
            </div>
          </div>
        </header>

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
    </ShopOwnerProvider>
  )
}

function GlobalSearchBar() {
  const { globalSearchQuery, setGlobalSearchQuery } = useShopOwnerContext()
  
  return (
    <label className="flex h-10 items-center gap-3 rounded-lg bg-white px-4 text-slate-500">
      <i className="pi pi-search"></i>
      <input
        type="text"
        value={globalSearchQuery}
        onChange={(e) => setGlobalSearchQuery(e.target.value)}
        className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
      />
    </label>
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
      {shopOwnerNav.map((entry) =>
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

function HeaderIconButton({ icon, className = "" }: { icon: string; className?: string }) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 ${className}`}
    >
      <i className={`${icon}`}></i>
    </button>
  )
}

type UserDropdownProps = {
  user: { fullName?: string | null; email?: string | null; avatarUrlPreview?: string | null }
  avatarUrl: string | null
}

function UserDropdown({ user, avatarUrl }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout().catch(() => { })
    resetStoreAndRedirectToLogin()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1.5 transition hover:bg-white/20"
      >
        <AvatarChip name={user.fullName || user.email || "User"} avatarUrl={avatarUrl} size={36} />
        <div className="hidden min-w-0 pr-1 sm:block">
          <p className="truncate text-sm font-semibold text-white">{formatProfileValue(user.fullName)}</p>
          <p className="truncate text-xs text-white/75">{formatProfileValue(user.email)}</p>
        </div>
        <i
          className={`pi pi-chevron-down hidden h-4 w-4 text-white/80 transition-transform duration-200 sm:block ${open ? "rotate-180" : ""
            }`}
        ></i>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{formatProfileValue(user.fullName)}</p>
            <p className="text-xs text-slate-500 truncate">{formatProfileValue(user.email)}</p>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <i className="pi pi-sign-out h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ShopOwnerDefaultRedirect() {
  return <Navigate to="/shop-owner/dashboard" replace />
}
