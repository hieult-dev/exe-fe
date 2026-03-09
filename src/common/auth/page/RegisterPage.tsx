import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthLayout } from "./AuthLayout"
import { User, Phone, Mail, Lock, MapPin, Calendar, Image } from "lucide-react"
import { notify } from "@/common/toast/ToastHelper"
import { register } from "@/common/auth/api/authApi"
import { applyAuthSession } from "@/common/auth/utils/session"

export function RegisterPage() {
  const navigate = useNavigate()
  const onLogin = () => {
    navigate("/login")
  }

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [age, setAge] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agree, setAgree] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requiredMark = <span className="ml-1 text-red-500">*</span>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const _fullName = fullName.trim()
    const _phone = phone.trim()
    const _email = email.trim()
    const _password = password

    if (!_fullName || !_phone || !_email || !_password || !confirmPassword) {
      notify.error("Vui lòng nhập đầy đủ các trường bắt buộc.")
      return
    }

    if (_password.length < 6) {
      notify.error("Mật khẩu phải tối thiểu 6 ký tự.")
      return
    }

    if (confirmPassword !== _password) {
      notify.error("Xác nhận mật khẩu phải khớp với mật khẩu.")
      return
    }

    if (!agree) {
      notify.error("Bạn cần đồng ý với điều khoản và chính sách bảo mật.")
      return
    }

    const _address = address.trim()
    const ageNumber =
      age.trim() === "" ? null : Number(age)

    if (ageNumber !== null && (Number.isNaN(ageNumber) || ageNumber < 0)) {
      notify.error("Tuổi không hợp lệ.")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("fullName", _fullName)
      formData.append("phone", _phone)
      formData.append("email", _email)
      formData.append("password", _password)

      if (_address) formData.append("address", _address)
      if (ageNumber !== null) formData.append("age", String(ageNumber))
      if (avatarFile) formData.append("avatarUrlPreview", avatarFile)

      const res = await register(formData)

      applyAuthSession(
        {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          role: res.role,
          user: res.user,
        },
        true
      )

      notify.success("Đăng ký thành công!")
      setTimeout(() => navigate("/", { replace: true }), 600)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        String(err) ??
        "Đăng ký thất bại. Vui lòng thử lại."

      notify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const registerAside = (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm">
        <img
          src="/luxury-pet-spa.png"
          alt="Spa thú cưng"
          className="h-48 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-[10px] uppercase tracking-[0.25em]">
            Tham gia cùng chúng tôi
          </div>
          <div className="text-lg font-semibold">
            Hơn 2.000 chủ thú cưng
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <img
          src="/professional-pet-groomer-with-dog.jpg"
          alt="Nhân viên chăm sóc thú cưng"
          className="h-24 w-full rounded-xl object-cover ring-1 ring-white/70"
        />
        <img
          src="/modern-pet-grooming-salon.png"
          alt="Salon thú cưng"
          className="h-24 w-full rounded-xl object-cover ring-1 ring-white/70"
        />
      </div>

      <div className="rounded-xl border border-white/70 bg-white/80 p-4 text-sm text-slate-700">
        <div className="font-semibold text-slate-900">Vì sao nên tham gia?</div>
        <div>Lưu hồ sơ thú cưng, theo dõi đơn hàng, đặt lịch nhanh hơn.</div>
      </div>
    </div>
  )

  return (
    <AuthLayout
      title="Đăng ký"
      subtitle="Tạo tài khoản mới để bắt đầu."
      badge="Bắt đầu ngay"
      aside={registerAside}
      footer={
        <div>
          Đã có tài khoản?{" "}
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
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Họ và tên (bắt buộc) */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 text-slate-500" />
            Họ và tên {requiredMark}
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full rounded-lg border border-border bg-background px-4 py-2"
          />
        </div>

        {/* SĐT + Email (bắt buộc) */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4 text-slate-500" />
              Số điện thoại {requiredMark}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0900000000"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4 text-slate-500" />
              Email {requiredMark}
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ban@email.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
          </div>
        </div>

        {/* Địa chỉ + Tuổi (tuỳ chọn) */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-slate-500" />
              Địa chỉ
            </label>
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Ví dụ: 123 Nguyễn Trãi, Quận 1"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-slate-500" />
              Tuổi
            </label>
            <input
              type="number"
              min={0}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="Ví dụ: 20"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
            <p className="mt-1 text-xs text-slate-400">
              Bạn có thể bỏ trống nếu chưa muốn cập nhật.
            </p>
          </div>
        </div>

        {/* Ảnh đại diện (upload từ máy, tuỳ chọn) */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Image className="h-4 w-4 text-slate-500" />
            Ảnh đại diện
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setAvatarFile(file)
            }}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          />

          <p className="mt-1 text-xs text-slate-400">
            Chọn ảnh từ máy (PNG/JPG). Bạn có thể bỏ qua và cập nhật sau.
            {avatarFile ? <span className="ml-1 text-slate-500">({avatarFile.name})</span> : null}
          </p>
        </div>

        {/* Mật khẩu + Xác nhận (bắt buộc) */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-slate-500" />
              Mật khẩu {requiredMark}
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tạo mật khẩu"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
            <p className="mt-1 text-xs text-slate-400">Mật khẩu tối thiểu 6 ký tự.</p>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4 text-slate-500" />
              Xác nhận mật khẩu {requiredMark}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
            />
            <p
              className={`mt-1 text-xs ${confirmPassword && password && confirmPassword !== password
                ? "text-red-500"
                : "text-slate-400"
                }`}
            >
              Phải khớp với mật khẩu.
            </p>
          </div>
        </div>

        {/* Đồng ý điều khoản (bắt buộc) */}
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-muted-foreground">
            Tôi đồng ý với điều khoản và chính sách bảo mật.{requiredMark}
          </span>
        </label>

        {/* Chú thích dấu sao */}
        <p className="text-xs text-slate-400">
          Các ô có dấu <span className="font-semibold text-red-500">*</span> màu đỏ là bắt buộc.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>
    </AuthLayout>
  )
}

