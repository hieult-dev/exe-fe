import { Building2, ChevronRight, ShieldCheck, Store, Users, Wrench } from "lucide-react"
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useUserStore } from "@/apps/user/store/UserStore"
import { ShopOwnerProvider } from "@/common/home/page/features/shop-owner/store/ShopOwnerContext"
import { formatProfileValue, resolveAvatarUrl } from "@/common/user/utils/profile"

const shopOwnerNav = [
  {
    to: "/shop-owner/profile",
    label: "Cửa hàng của tôi",
    icon: Store,
    description: "Thông tin cửa hàng",
  },
  {
    to: "/shop-owner/services",
    label: "Dịch vụ",
    icon: Wrench,
    description: "Giá, thời lượng, trạng thái",
  },
  {
    to: "/shop-owner/members",
    label: "Thành viên",
    icon: Users,
    description: "Hội viên, quản lý, nhân viên",
  },
] as const

function resolveDashboardTitle(pathname: string) {
  const matched = shopOwnerNav.find((item) => pathname.startsWith(item.to))
  return matched?.label || "Dashboard"
}

export function ShopOwnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, authentication } = useUserStore()

  if (!user || !authentication) {
    return (
      <section className="min-h-screen bg-[#f1f5f9] p-6 md:p-10">
        <div className="mx-auto max-w-xl rounded-xl border border-[#e5eaf0] bg-white p-8 text-center shadow-sm">
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
  const currentTitle = resolveDashboardTitle(location.pathname)

  return (
    <ShopOwnerProvider ownerKey={ownerKey}>
      <div className="min-h-screen bg-[#f3f5f8]">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px,1fr]">
          <aside className="flex flex-col border-r border-[#1e293b] bg-[#0f172a] text-slate-100">
            <div className="border-b border-white/10 px-5 py-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">PetPees Admin</p>
              <h1 className="mt-2 text-lg font-semibold">Shop Owner Dashboard</h1>
            </div>

            <div className="px-4 py-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <img src={avatarUrl} alt={user.fullName || "Avatar"} className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{formatProfileValue(user.fullName)}</p>
                    <p className="truncate text-xs text-slate-300">@{(user.email || "shopowner").toLowerCase()}</p>
                  </div>
                </div>

                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#1d4ed8]/20 px-2 py-1 text-[11px] text-sky-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Demo role: SHOP_OWNER
                </div>
              </div>

              <nav className="mt-4 space-y-1">
                {shopOwnerNav.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group block rounded-lg border px-3 py-2 transition ${
                          isActive
                            ? "border-[#334155] bg-[#1e293b] text-white"
                            : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5"
                        }`
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-sm font-medium">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            <div className="mt-auto border-t border-white/10 px-4 py-4">
              <button
                onClick={() => navigate("/")}
                className="w-full rounded-md border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                Về marketplace
              </button>
            </div>
          </aside>

          <section className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b border-[#e6ebf2] bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between px-5 py-4 md:px-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Shop Owner Workspace</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-800">{currentTitle}</h2>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-1.5 text-sm text-slate-700">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  {formatProfileValue(user.email)}
                </div>
              </div>
            </header>

            <main className="flex-1 p-4 md:p-6">
              <div className="rounded-xl border border-[#e5eaf0] bg-white p-5 shadow-sm md:p-6">
                <Outlet />
              </div>
            </main>
          </section>
        </div>
      </div>
    </ShopOwnerProvider>
  )
}

export function ShopOwnerDefaultRedirect() {
  return <Navigate to="/shop-owner/profile" replace />
}

