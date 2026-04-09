import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "./AuthLayout"
import { notify } from "@/common/toast/ToastHelper"
import { login } from "@/common/auth/api/authApi"
import { applyAuthSession } from "@/common/auth/utils/session"

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()

  const onRegister = () => navigate("/register")
  const onForgotPassword = () => navigate("/forgot-password")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: LoginForm) => {
    setIsSubmitting(true)

    try {
      const res = await login(values.email.trim(), values.password)
      applyAuthSession(
        {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          role: res.role,
          user: res.user,
        },
        values.rememberMe ?? false
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

  const inputBase =
    "w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-blue-300/40 focus:ring-2 focus:ring-blue-500/60"
  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(74, 144, 217, 0.3)",
  }

  return (
    <AuthLayout
      title="Đăng nhập hệ thống"
      footer={
        <div className="space-y-2">
          <span className="block text-blue-200/60">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onRegister}
              className="font-semibold text-blue-300 hover:text-white transition"
            >
              Đăng ký shop
            </button>
          </span>
          <span className="block text-xs text-blue-200/50">
            Hoặc liên hệ quản trị viên để được hỗ trợ.
          </span>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div>
          <label className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
            <i className="pi pi-envelope h-4 w-4" />
            Hộp thư
          </label>
          <input
            type="email"
            {...register("email")}
            className={inputBase}
            style={inputStyle}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-200/70">
            <i className="pi pi-lock h-4 w-4" />
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`${inputBase} pr-10`}
              style={inputStyle}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition"
            >
              {showPassword ? <i className="pi pi-eye-slash h-4 w-4" /> : <i className="pi pi-eye h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-blue-200/60 hover:text-blue-200 transition">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="h-3.5 w-3.5 rounded"
            />
            Ghi nhớ đăng nhập
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-blue-300/70 hover:text-white transition"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: isSubmitting
              ? "rgba(74,144,217,0.5)"
              : "linear-gradient(90deg, #3b6fd4 0%, #4a90d9 100%)",
            boxShadow: "0 4px 16px rgba(74,144,217,0.3)",
          }}
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthLayout>
  )
}
