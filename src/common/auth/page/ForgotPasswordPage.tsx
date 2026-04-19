import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "@/common/auth/page/AuthLayout"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const onLogin = () => {
    navigate("/login")
  }
  const [email, setEmail] = useState("")

  const forgotAside = (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm">
        <img
          src="/zen-pet-spa-relaxation.jpg"
          alt="Thú cưng thư giãn"
          className="h-44 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em]">
            <i className="pi pi-refresh h-3 w-3" />
            Đặt lại
          </div>
          <div className="text-lg font-semibold">Bọn mình sẽ hỗ trợ bạn</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-slate-700">
        <div className="rounded-xl border border-white/70 bg-white/80 p-3 text-center">
          <div className="flex items-center justify-center gap-1 font-semibold">
            <i className="pi pi-shield h-4 w-4 text-slate-500" />
            Bước 1
          </div>
          <div className="text-slate-500">Xác minh email</div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/80 p-3 text-center">
          <div className="flex items-center justify-center gap-1 font-semibold">
            <i className="pi pi-key h-4 w-4 text-slate-500" />
            Bước 2
          </div>
          <div className="text-slate-500">Tạo mật khẩu mới</div>
        </div>

        <div className="rounded-xl border border-white/70 bg-white/80 p-3 text-center">
          <div className="flex items-center justify-center gap-1 font-semibold">
            <i className="pi pi-sign-in h-4 w-4 text-slate-500" />
            Bước 3
          </div>
          <div className="text-slate-500">Đăng nhập lại</div>
        </div>
      </div>
    </div>
  )

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận liên kết đặt lại."
      badge="Khôi phục"
      aside={forgotAside}
      footer={
        <div>
          Đã nhớ mật khẩu?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="text-primary font-semibold hover:underline"
          >
            Đăng nhập
          </button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <i className="pi pi-envelope h-4 w-4 text-slate-500" />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2"
          />
        </div>

        <button className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-primary/90">
          Gửi liên kết đặt lại
        </button>
      </form>
    </AuthLayout>
  )
}
