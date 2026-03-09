import type { ReactNode } from "react"
import { Camera, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"
import { useUserStore } from "@/apps/user/store/UserStore"
import { formatProfileValue, resolveAvatarUrl } from "@/common/user/utils/profile"

export function ProfilePage() {
  const { user } = useUserStore()

  const avatarUrl = resolveAvatarUrl(user?.avatarUrlPreview)

  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Hồ sơ của tôi</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý thông tin hồ sơ để bảo mật tài khoản.</p>
      </div>

      <div className="grid gap-8 pt-6 md:grid-cols-[1fr,220px]">
        <div className="space-y-4">
          <ProfileRow label="Họ và tên" value={formatProfileValue(user?.fullName)} icon={<ShieldCheck className="h-4 w-4" />} />
          <ProfileRow label="Email" value={formatProfileValue(user?.email)} icon={<Mail className="h-4 w-4" />} />
          <ProfileRow label="Số điện thoại" value={formatProfileValue(user?.phone)} icon={<Phone className="h-4 w-4" />} />
          <ProfileRow label="Địa chỉ" value={formatProfileValue(user?.address)} icon={<MapPin className="h-4 w-4" />} />
          <ProfileRow label="Tuổi" value={formatProfileValue(user?.age)} icon={<ShieldCheck className="h-4 w-4" />} />
          <ProfileRow label="Vai trò" value={formatProfileValue(user?.role)} icon={<ShieldCheck className="h-4 w-4" />} />

          <p className="text-xs text-slate-500">
            * Dữ liệu tài khoản đang là mock FE để demo giao diện khi chưa có backend.
          </p>
        </div>

        <div className="flex flex-col items-center border-t border-[#f2f2f2] pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <img src={avatarUrl} alt={user?.fullName || "Avatar"} className="h-28 w-28 rounded-full object-cover" />
          <button className="mt-4 inline-flex items-center gap-2 rounded-sm border border-[#d9d9d9] px-3 py-2 text-sm text-slate-700 hover:bg-[#fafafa]">
            <Camera className="h-4 w-4" />
            Đổi ảnh đại diện
          </button>
        </div>
      </div>
    </>
  )
}

function ProfileRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="grid gap-2 rounded-sm border border-[#efefef] px-4 py-3 md:grid-cols-[160px,1fr] md:items-center">
      <div className="inline-flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  )
}


