import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "./AuthLayout"
import { Mail, Lock } from "lucide-react"
import { notify } from "@/common/toast/ToastHelper"
import { login } from "@/common/auth/api/authApi"
import { applyAuthSession } from "@/common/auth/utils/session"
export function LoginPage() {
  const navigate = useNavigate()

  const onRegister = () => navigate("/register")
  const onForgotPassword = () => navigate("/forgot-password")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const _email = email.trim()
    if (!_email || !password) {
      notify.error("Vui lòng nhập email và mật khẩu.")
      return
    }

    setIsSubmitting(true)
    try {

      const res = await login(_email, password)
      applyAuthSession(
        {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          role: res.role,
          user: res.user,
        },
        rememberMe
      )

      notify.success("Đăng nhập thành công!")
      setTimeout(() => navigate("/", { replace: true }), 600)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        String(err) ??
        "Đăng nhập thất bại. Vui lòng thử lại."

      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }
  const loginAside = (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm">
        <img
          src="/cute-happy-dog-getting-spa-treatment-grooming.jpg"
          alt="Chó vui vẻ"
          className="h-48 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-[10px] uppercase tracking-[0.25em]">
            Chào mừng trở lại
          </div>
          <div className="text-lg font-semibold">
            Sẵn sàng cho một ngày spa?
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <img
          src="/placeholder-user.jpg"
          alt="Chủ thú cưng"
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
        />
        <div className="text-sm">
          <div className="font-semibold text-slate-900">
            Câu lạc bộ Chủ Thú Cưng
          </div>
          <div className="text-slate-600">
            Hồ sơ đã lưu, đặt lịch nhanh hơn.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">
          Mimi (mèo)
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
          Bun (chó)
        </span>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
          Snow (thỏ)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <img
          src="/cute-cat-after-grooming-spa.jpg"
          alt="Mèo"
          className="h-20 w-full rounded-xl object-cover ring-1 ring-white/70"
        />
        <img
          src="/fluffy-dog-grooming.jpg"
          alt="Chó"
          className="h-20 w-full rounded-xl object-cover ring-1 ring-white/70"
        />
        <img
          src="/pet-grooming-station.jpg"
          alt="Khu vực chăm sóc thú cưng"
          className="h-20 w-full rounded-xl object-cover ring-1 ring-white/70"
        />
      </div>
    </div>
  )

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Nhập thông tin để tiếp tục."
      badge="Chào mừng trở lại"
      aside={loginAside}
      footer={
        <div>
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={onRegister}
            className="text-primary font-semibold hover:underline"
          >
            Đăng ký
          </button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Mail className="h-4 w-4 text-slate-500" />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ban@email.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-2"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Lock className="h-4 w-4 text-slate-500" />
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            className="w-full rounded-lg border border-border bg-background px-4 py-2"
            autoComplete="current-password"
          />
          <p className="mt-1 text-xs text-slate-400">
            Mật khẩu tối thiểu 6 ký tự
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
          </label>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-primary font-semibold hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthLayout>
  )
}

