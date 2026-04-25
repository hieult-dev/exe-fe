import { useRef, useState, type MouseEvent } from "react"
import { Avatar } from "primereact/avatar"
import { AvatarGroup } from "primereact/avatargroup"
import { OverlayPanel } from "primereact/overlaypanel"
import { resolveAvatarUrl } from "@/common/user/utils/profile"

export type StaffAvatarGroupItem = {
  id?: number | string | null
  userId?: number | string | null
  fullName?: string | null
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  avatarUrlPreview?: string | null
}

type StaffAvatarGroupProps = {
  staffs: StaffAvatarGroupItem[] | null | undefined
  maxVisible?: number
  size?: "normal" | "large" | "xlarge"
  shape?: "square" | "circle"
  defaultAvatarUrl?: string
  emptyLabel?: string
  className?: string
}

const DEFAULT_AVATAR_URL = "/image/avatar-mac-dinh.jpg"

function getStaffKey(staff: StaffAvatarGroupItem, index: number) {
  return staff.userId ?? staff.id ?? `${staff.fullName ?? staff.name ?? "staff"}-${index}`
}

function getStaffName(staff: StaffAvatarGroupItem, index: number) {
  return staff.fullName || staff.name || staff.email || `Nhân viên ${index + 1}`
}

function getStaffId(staff: StaffAvatarGroupItem) {
  return staff.userId ?? staff.id ?? null
}

export function StaffAvatarGroup({
  staffs,
  maxVisible = 4,
  size = "normal",
  shape = "circle",
  defaultAvatarUrl = DEFAULT_AVATAR_URL,
  emptyLabel = "Chưa gán",
  className = "",
}: StaffAvatarGroupProps) {
  const detailPanelRef = useRef<OverlayPanel>(null)
  const hideTimerRef = useRef<number | null>(null)
  const [hoveredStaff, setHoveredStaff] = useState<{ staff: StaffAvatarGroupItem; index: number } | null>(null)
  const normalizedStaffs = Array.isArray(staffs) ? staffs : []

  if (normalizedStaffs.length === 0) {
    return <span className="text-xs text-slate-400">{emptyLabel}</span>
  }

  const visibleStaffs = normalizedStaffs.slice(0, maxVisible)
  const hiddenCount = Math.max(normalizedStaffs.length - visibleStaffs.length, 0)
  const hoveredStaffName = hoveredStaff ? getStaffName(hoveredStaff.staff, hoveredStaff.index) : ""
  const hoveredStaffId = hoveredStaff ? getStaffId(hoveredStaff.staff) : null
  const hoveredStaffAvatarUrl = hoveredStaff
    ? resolveAvatarUrl(hoveredStaff.staff.avatarUrlPreview ?? hoveredStaff.staff.avatarUrl) ?? defaultAvatarUrl
    : defaultAvatarUrl

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  const showStaffDetail = (event: MouseEvent<HTMLElement>, staff: StaffAvatarGroupItem, index: number) => {
    clearHideTimer()
    setHoveredStaff({ staff, index })
    detailPanelRef.current?.show(event, event.currentTarget)
  }

  const hideStaffDetail = () => {
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      detailPanelRef.current?.hide()
      setHoveredStaff(null)
    }, 80)
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <AvatarGroup>
        {visibleStaffs.map((staff, index) => {
          const name = getStaffName(staff, index)
          const avatarUrl = resolveAvatarUrl(staff.avatarUrlPreview ?? staff.avatarUrl) ?? defaultAvatarUrl

          return (
            <Avatar
              key={getStaffKey(staff, index)}
              image={avatarUrl}
              imageFallback={defaultAvatarUrl}
              imageAlt={name}
              aria-label={name}
              onMouseEnter={(event) => showStaffDetail(event, staff, index)}
              onMouseLeave={hideStaffDetail}
              size={size}
              shape={shape}
              className="cursor-pointer"
            />
          )
        })}
        {hiddenCount > 0 && (
          <Avatar
            label={`+${hiddenCount}`}
            title={normalizedStaffs.slice(maxVisible).map((staff, index) => getStaffName(staff, maxVisible + index)).join(", ")}
            size={size}
            shape={shape}
            className="bg-slate-100 text-slate-600"
          />
        )}
      </AvatarGroup>

      <OverlayPanel
        ref={detailPanelRef}
        dismissable={false}
        showCloseIcon={false}
        onMouseEnter={clearHideTimer}
        onMouseLeave={hideStaffDetail}
      >
        {hoveredStaff && (
          <div className="w-64 rounded-lg bg-white text-left">
            <div className="flex items-center gap-3">
              <Avatar
                image={hoveredStaffAvatarUrl}
                imageFallback={defaultAvatarUrl}
                imageAlt={hoveredStaffName}
                size="large"
                shape="circle"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{hoveredStaffName}</p>
                <p className="truncate text-xs text-slate-500">{hoveredStaff.staff.email || "Chưa có email"}</p>
              </div>
            </div>
            {hoveredStaffId !== null && (
              <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="font-medium text-slate-500">Mã nhân viên</span>
                <span className="ml-2 font-semibold text-slate-800">{hoveredStaffId}</span>
              </div>
            )}
          </div>
        )}
      </OverlayPanel>
    </div>
  )
}
