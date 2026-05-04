import { Button } from "primereact/button"
import { logout } from "@/common/auth/api/authApi"
import { resetStoreAndRedirectToLogin } from "@/common/auth/store/ResetStore"

export function UnauthorizedPage() {
  const handleLogout = async () => {
    await logout().catch(() => {})
    resetStoreAndRedirectToLogin()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2f6] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl text-rose-600">
          <i className="pi pi-lock" />
        </span>
        <h1 className="mb-2 mt-4 text-xl font-semibold text-slate-800">Không có quyền truy cập</h1>
        <p className="mb-5 text-sm leading-6 text-slate-500">
          Tài khoản hiện tại không có quyền truy cập khu vực quản lý shop.
        </p>
        <Button
          type="button"
          label="Đăng xuất"
          icon="pi pi-sign-out"
          severity="danger"
          className="!px-5"
          onClick={handleLogout}
        />
      </div>
    </div>
  )
}
