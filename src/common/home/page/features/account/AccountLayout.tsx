import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { useUserStore } from "@/apps/user/store/UserStore"
import { formatProfileValue, resolveAvatarUrl } from "@/common/user/utils/profile"

const accountNav = [
  { to: "/profile", label: "Tài khoản của tôi" },
  { to: "/my-pets", label: "Thú cưng của tôi" },
  { to: "/orders", label: "Đơn mua" },
  { to: "/notifications", label: "Thông báo" },
  { to: "/vouchers", label: "Kho voucher" },
]

export function AccountLayout() {
  const navigate = useNavigate()
  const { user, authentication } = useUserStore()
  const isLoggedIn = Boolean(user && authentication)

  const avatarUrl = resolveAvatarUrl(user?.avatarUrlPreview)

  if (!isLoggedIn) {
    return (
      <section className="min-h-screen bg-[#f5f5f5] py-8">
        <div className="mx-auto max-w-7xl rounded-sm bg-white p-10 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Tài khoản của tôi</h1>
          <p className="mt-2 text-slate-600">Vui lòng đăng nhập để xem và cập nhật thông tin cá nhân.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-5 rounded-sm bg-[#ee4d2d] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Đăng nhập
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#f5f5f5] py-6">
      <div className="mx-auto grid max-w-7xl gap-4 px-3 md:px-4 lg:grid-cols-[260px,1fr]">
        <aside className="space-y-3">
          <div className="rounded-sm bg-white p-4">
            <div className="flex items-center gap-3 border-b border-[#f2f2f2] pb-4">
              <img src={avatarUrl} alt={user?.fullName || "Avatar"} className="h-14 w-14 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{formatProfileValue(user?.fullName)}</p>
                <p className="truncate text-xs text-slate-500">@{(user?.email || "petowner").toLowerCase()}</p>
              </div>
            </div>

            <nav className="pt-3 text-sm">
              {accountNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `mt-1 flex items-center justify-between rounded-sm px-3 py-2 transition ${
                      isActive
                        ? "bg-[#fff3ef] font-semibold text-[#ee4d2d]"
                        : "text-slate-700 hover:bg-[#fafafa]"
                    }`
                  }
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4" />
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="rounded-sm bg-white p-6">
          <Outlet />
        </div>
      </div>
    </section>
  )
}

