import type { ReactNode } from "react"
import { Bell, CalendarDays, ChevronDown, LayoutGrid, Package, Search, ShoppingCart, Store, Users, Wrench } from "lucide-react"
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom"
import { useUserStore } from "@/apps/user/store/UserStore"
import { ShopOwnerProvider } from "@/common/home/page/features/shop-owner/store/ShopOwnerContext"
import { formatProfileValue, resolveAvatarUrl } from "@/common/user/utils/profile"

const shopOwnerNav = [
  {
    to: "/shop-owner/profile",
    label: "Cửa hàng của tôi",
    railLabel: "Cửa hàng",
    icon: Store,
    description: "Thông tin cửa hàng",
  },
  {
    to: "/shop-owner/services",
    label: "Dịch vụ",
    railLabel: "Dịch vụ",
    icon: Wrench,
    description: "Giá, thời lượng, trạng thái",
  },
  {
    to: "/shop-owner/inventory",
    label: "Quản lý kho",
    railLabel: "Kho",
    icon: Package,
    description: "Sản phẩm, vật tư, tồn kho",
  },
  {
    to: "/shop-owner/members",
    label: "Thành viên",
    railLabel: "Thành viên",
    icon: Users,
    description: "Hội viên, quản lý, nhân viên",
  },
  {
    to: "/shop-owner/orders",
    label: "Yêu cầu mua hàng",
    railLabel: "Đơn hàng",
    icon: ShoppingCart,
    description: "Xác nhận, giao hàng, lịch sử",
  },
  {
    to: "/shop-owner/bookings",
    label: "Lịch dịch vụ",
    railLabel: "Lịch hẹn",
    icon: CalendarDays,
    description: "Quản lý lượt đặt lịch, hẹn khách",
  },
] as const

export function ShopOwnerLayout() {
  const navigate = useNavigate()
  const { user, authentication } = useUserStore()

  if (!user || !authentication) {
    return (
      <section className="min-h-screen bg-[#f1f5f9] p-6 md:p-10">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-800">Shop Owner Dashboard</h1>
          <p className="mt-2 text-slate-600">Vui lòng đăng nhập để truy cập khu quản trị cửa hàng.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-sm bg-[#ee4d2d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#de4322]"
          >
            Đăng nhập
          </button>
        </div>
      </section>
    )
  }

  const ownerKey = user.email?.trim().toLowerCase() || "default"
  const avatarUrl = resolveAvatarUrl(user.avatarUrlPreview)

  return (
    <ShopOwnerProvider ownerKey={ownerKey}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#eef2f6]">
        <header className="z-30 shrink-0 bg-[#214388] text-white shadow-sm">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
            <button
              type="button"
              onClick={() => navigate("/shop-owner/profile")}
              className="inline-flex items-center gap-3 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff9b3d] to-[#ef5c2c] shadow-[0_8px_16px_rgba(239,92,44,0.28)]">
                <span className="grid gap-1">
                  <span className="block h-1 w-5 rounded-full bg-white" />
                  <span className="block h-1 w-3 rounded-full bg-white/90" />
                  <span className="block h-1 w-4 rounded-full bg-white/90" />
                </span>
              </span>
              <div className="hidden sm:block">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">PetPees Admin</p>
                <p className="text-[1.9rem] font-semibold leading-none">PetPees</p>
              </div>
            </button>

            <div className="mx-auto hidden max-w-[520px] flex-1 md:block">
              <label className="flex h-10 items-center gap-3 rounded-lg bg-white px-4 text-slate-500">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ, thành viên, cửa hàng..."
                  className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="ml-auto flex items-center gap-2 lg:gap-3">
              <HeaderIconButton icon={<Search className="h-4 w-4" />} className="md:hidden" />
              <HeaderIconButton icon={<Bell className="h-4 w-4" />} />
              <HeaderIconButton icon={<LayoutGrid className="h-4 w-4" />} />

              <div className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1.5">
                <img src={avatarUrl} alt={user.fullName || "Avatar"} className="h-9 w-9 rounded-full object-cover" />
                <div className="hidden min-w-0 pr-1 sm:block">
                  <p className="truncate text-sm font-semibold text-white">{formatProfileValue(user.fullName)}</p>
                  <p className="truncate text-xs text-white/75">{formatProfileValue(user.email)}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-white/80 sm:block" />
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-[96px,1fr] overflow-hidden">
          <aside className="flex h-full flex-col overflow-y-auto border-r border-[#dfe5ee] bg-[#f7f8fb]">
            <nav className="pt-3">
              {shopOwnerNav.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative flex min-h-[98px] flex-col items-center justify-center gap-2 px-2 text-center transition ${isActive ? "bg-white text-[#214388]" : "text-[#4c5d74] hover:bg-white/70"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[#214388]" />}
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3fb] text-[#214388]">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="px-1 text-[12px] font-semibold leading-4">{item.railLabel}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>

            <div className="mt-auto px-3 py-4">
              <button
                onClick={() => navigate("/")}
                className="w-full rounded-xl bg-white px-3 py-2.5 text-[12px] font-semibold text-[#214388] shadow-sm hover:bg-[#f5f8fc]"
              >
                Về chợ
              </button>
            </div>
          </aside>

          <section className="flex h-full min-w-0 flex-col overflow-y-auto">
            <main className="flex flex-1 flex-col px-4 py-6 lg:px-8 lg:pb-8">
              <div className="flex flex-1 flex-col rounded-[24px] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-5">
                <Outlet />
              </div>
            </main>
          </section>
        </div>
      </div>
    </ShopOwnerProvider>
  )
}

function HeaderIconButton({ icon, className = "" }: { icon: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 ${className}`}
    >
      {icon}
    </button>
  )
}

export function ShopOwnerDefaultRedirect() {
  return <Navigate to="/shop-owner/profile" replace />
}
