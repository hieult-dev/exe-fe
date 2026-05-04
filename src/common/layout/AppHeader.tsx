import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { User } from "@/apps/user/model"
import { logout } from "@/common/auth/api/authApi"
import { resetStoreAndRedirectToLogin } from "@/common/auth/store/ResetStore"
import { AvatarChip } from "@/common/component/AvatarChip"
import { formatProfileValue, resolveAvatarUrl } from "@/common/user/utils/profile"

type AppHeaderProps = {
  user: User
  homePath: string
  eyebrow?: string
  title?: string
  center?: ReactNode
  showActionButtons?: boolean
  userMenuItems?: AppHeaderUserMenuItem[]
}

export type AppHeaderUserMenuItem = {
  label: string
  icon: string
  to: string
}

export function AppHeader({
  user,
  homePath,
  eyebrow = "PetPees Admin",
  title = "PetPees",
  center,
  showActionButtons = true,
  userMenuItems = [],
}: AppHeaderProps) {
  const navigate = useNavigate()
  const avatarUrl = resolveAvatarUrl(user.avatarUrlPreview)

  return (
    <header className="z-30 shrink-0 bg-[#214388] text-white shadow-sm">
      <div className="relative flex h-16 items-center justify-between px-4 lg:px-6">
        <button
          type="button"
          onClick={() => navigate(homePath)}
          className="inline-flex items-center gap-3 text-left"
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl">
            <img src="/image/logo-petpees2.png" alt="PetPees logo" className="h-full w-full object-cover" />
          </span>
          <div className="hidden sm:block">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">{eyebrow}</p>
            <p className="text-[1.9rem] font-semibold leading-none">{title}</p>
          </div>
        </button>

        {center && (
          <div className="absolute left-1/2 top-1/2 hidden w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2 md:block">
            {center}
          </div>
        )}

        <div className="flex items-center gap-2 lg:gap-3">
          {showActionButtons && (
            <>
              <HeaderIconButton icon="pi pi-search" className="md:hidden" />
              <HeaderIconButton icon="pi pi-bell" />
              <HeaderIconButton icon="pi pi-th-large" />
            </>
          )}

          <UserDropdown user={user} avatarUrl={avatarUrl} menuItems={userMenuItems} />
        </div>
      </div>
    </header>
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
  menuItems: AppHeaderUserMenuItem[]
}

function UserDropdown({ user, avatarUrl, menuItems }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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
    await logout().catch(() => {})
    resetStoreAndRedirectToLogin()
  }

  const handleNavigate = (to: string) => {
    setOpen(false)
    navigate(to)
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
          className={`pi pi-chevron-down hidden h-4 w-4 text-white/80 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{formatProfileValue(user.fullName)}</p>
            <p className="truncate text-xs text-slate-500">{formatProfileValue(user.email)}</p>
          </div>

          {menuItems.length > 0 && (
            <div className="border-b border-slate-100 p-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => handleNavigate(item.to)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#eef3fb] hover:text-[#214388]"
                >
                  <i className={`${item.icon} h-4 w-4`} />
                  {item.label}
                </button>
              ))}
            </div>
          )}

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
