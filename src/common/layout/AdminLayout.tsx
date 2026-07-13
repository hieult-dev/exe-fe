import { NavLink, Navigate, Outlet } from "react-router-dom"
import { AppHeader } from "@/common/layout/AppHeader"
import { useUserStore } from "@/apps/user/store/UserStore"
import { canAccessAdminConsole } from "@/common/auth/utils/adminAccess"

type AdminNavItem = {
  to: string
  label: string
  icon: string
}

const adminNav: AdminNavItem[] = [
  {
    to: "/admin/commissions",
    label: "Hoa hồng",
    icon: "pi pi-chart-bar",
  },
  {
    to: "/admin/shops",
    label: "Duyệt shop",
    icon: "pi pi-building",
  },
]

export function AdminLayout() {
  const { user, authentication, userRole } = useUserStore()

  if (!user || !authentication) {
    return <Navigate to="/login" replace />
  }

  if (!canAccessAdminConsole(user, userRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef2f6]">
      <AppHeader
        user={user}
        homePath="/admin/shops"
        eyebrow="Pawly System"
        title="Quản trị hệ thống"
        showActionButtons={false}
      />

      <div className="grid flex-1 grid-cols-[96px,1fr] overflow-hidden">
        <aside className="flex h-full flex-col border-r border-[#dfe5ee] bg-[#f7f8fb]">
          <nav className="pt-3">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex min-h-[80px] flex-col items-center justify-center gap-1.5 px-2 text-center transition ${
                    isActive ? "bg-white text-[#214388]" : "text-[#4c5d74] hover:bg-white/70"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[#214388]" />}
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3fb] text-[#214388] ${item.icon}`} />
                    <span className="px-1 text-[11px] font-semibold leading-tight">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="flex h-full min-w-0 flex-col overflow-y-auto">
          <main className="flex flex-1 flex-col px-2 py-2 lg:px-3 lg:pb-3">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  )
}

export function AdminDefaultRedirect() {
  return <Navigate to="/admin/shops" replace />
}
