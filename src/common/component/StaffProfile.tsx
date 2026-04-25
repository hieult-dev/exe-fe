import { Avatar } from "primereact/avatar"
import { resolveAvatarUrl } from "@/common/user/utils/profile"

export type StaffProfileItem = {
  id?: number | string | null
  userId?: number | string | null
  fullName?: string | null
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  avatarUrlPreview?: string | null
}

type StaffProfileProps = {
  staff: StaffProfileItem
  defaultAvatarUrl?: string
  size?: "normal" | "large" | "xlarge"
  className?: string
}

const DEFAULT_AVATAR_URL = "/image/avatar-mac-dinh.jpg"

function getStaffName(staff: StaffProfileItem) {
  return staff.fullName || staff.name || staff.email || "Nhân viên"
}

export function StaffProfile({
  staff,
  defaultAvatarUrl = DEFAULT_AVATAR_URL,
  size = "large",
  className = "",
}: StaffProfileProps) {
  const name = getStaffName(staff)
  const avatarUrl = resolveAvatarUrl(staff.avatarUrlPreview ?? staff.avatarUrl) ?? defaultAvatarUrl

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <Avatar
        image={avatarUrl}
        imageFallback={defaultAvatarUrl}
        imageAlt={name}
        size={size}
        shape="circle"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
        <p className="truncate text-xs text-slate-500">{staff.email || "Chưa có email"}</p>
      </div>
    </div>
  )
}
