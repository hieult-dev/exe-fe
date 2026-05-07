import type { ReactNode, UIEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getShopNotifications,
  getUserNotifications,
  markAllShopNotificationsRead,
  markAllUserNotificationsRead,
  markNotificationRead as markNotificationReadApi,
} from "@/apps/notifications/api/notificationApi"
import type { StoredRealtimeNotification } from "@/apps/notifications/store/NotificationStore"
import { useNotificationStore } from "@/apps/notifications/store/NotificationStore"
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
  notificationBadgeCount?: number
}


export function AppHeader({
  user,
  homePath,
  eyebrow = "PetPees Admin",
  title = "PetPees",
  center,
  showActionButtons = true,
  notificationBadgeCount = 0,
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
              <NotificationBell badgeCount={notificationBadgeCount} />
            </>
          )}

          <UserDropdown user={user} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  )
}

function formatBadgeCount(count: number) {
  if (count <= 0) return null
  return count > 99 ? "99+" : String(count)
}

function HeaderIconButton({ icon, className = "", badgeCount = 0 }: { icon: string; className?: string; badgeCount?: number }) {
  const formattedBadgeCount = formatBadgeCount(badgeCount)

  return (
    <button
      type="button"
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 active:scale-95 ${className}`}
    >
      <i className={`${icon} text-[1.05rem]`}></i>
      {formattedBadgeCount && (
        <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-red-500 px-[3px] text-[10px] font-bold leading-[18px] text-white shadow-sm">
          {formattedBadgeCount}
        </span>
      )}
    </button>
  )
}

type NotificationFilter = "all" | "unread"

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }
  return null
}

function getOrderNotificationId(notification: StoredRealtimeNotification) {
  const metadataOrderId = getNumber(notification.metadata?.orderId)
  if (metadataOrderId !== null) return metadataOrderId

  if (
    notification.targetType === "ORDER" ||
    notification.type === "ORDER_CREATED" ||
    notification.type === "ORDER_STATUS_UPDATED"
  ) {
    return getNumber(notification.targetId)
  }

  return null
}

function getBookingNotificationId(notification: StoredRealtimeNotification) {
  const metadataBookingId = getNumber(notification.metadata?.bookingId)
  if (metadataBookingId !== null) return metadataBookingId

  if (
    notification.targetType === "BOOKING" ||
    notification.type === "BOOKING_CREATED" ||
    notification.type === "BOOKING_STATUS_UPDATED" ||
    (notification.type === "SERVICE_BOOKED" && notification.targetType !== "SERVICE")
  ) {
    return getNumber(notification.targetId)
  }

  return null
}

function getServiceNotificationId(notification: StoredRealtimeNotification) {
  const metadataServiceId = getNumber(notification.metadata?.serviceId)
  if (metadataServiceId !== null) return metadataServiceId

  if (notification.targetType === "SERVICE") {
    return getNumber(notification.targetId)
  }

  return null
}

function getNotificationPath(notification: StoredRealtimeNotification) {
  if (notification.type === "CHAT_MESSAGE") {
    const conversationId = getNumber(notification.metadata?.conversationId)
    return conversationId !== null ? `/shop/chat?conversationId=${conversationId}` : "/shop/chat"
  }

  const orderId = getOrderNotificationId(notification)
  if (
    notification.targetType === "ORDER" ||
    notification.type === "ORDER_CREATED" ||
    notification.type === "ORDER_STATUS_UPDATED" ||
    orderId !== null
  ) {
    return orderId !== null ? `/shop/orders?orderId=${orderId}` : "/shop/orders"
  }

  const bookingId = getBookingNotificationId(notification)
  if (
    notification.targetType === "BOOKING" ||
    notification.type === "BOOKING_CREATED" ||
    notification.type === "BOOKING_STATUS_UPDATED" ||
    (notification.type === "SERVICE_BOOKED" && notification.targetType !== "SERVICE") ||
    bookingId !== null
  ) {
    return bookingId !== null ? `/shop/bookings?bookingId=${bookingId}` : "/shop/bookings"
  }

  const serviceId = getServiceNotificationId(notification)
  if (notification.targetType === "SERVICE") {
    return serviceId !== null ? `/shop/services?serviceId=${serviceId}` : "/shop/services"
  }

  return null
}

function formatNotificationTime(value: string | null | undefined) {
  if (!value) return ""
  const createdTime = new Date(value).getTime()
  if (Number.isNaN(createdTime)) return ""

  const diffSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000))
  if (diffSeconds < 60) return "Vừa xong"

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} phút`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ngày`
}

function NotificationBell({ badgeCount }: { badgeCount: number }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const scope = useNotificationStore((state) => state.scope)
  const notifications = useNotificationStore((state) => state.notifications)
  const nextCursor = useNotificationStore((state) => state.nextCursor)
  const hasNext = useNotificationStore((state) => state.hasNext)
  const loadingInitial = useNotificationStore((state) => state.loadingInitial)
  const loadingMore = useNotificationStore((state) => state.loadingMore)
  const appendNotificationPage = useNotificationStore((state) => state.appendNotificationPage)
  const setLoadingMore = useNotificationStore((state) => state.setLoadingMore)
  const markNotificationReadLocal = useNotificationStore((state) => state.markNotificationReadLocal)
  const markAllNotificationsReadLocal = useNotificationStore((state) => state.markAllNotificationsReadLocal)
  const formattedBadgeCount = formatBadgeCount(badgeCount)
  const visibleNotifications = filter === "unread" ? notifications.filter((notification) => !notification.read) : notifications
  const newNotifications = visibleNotifications.filter((notification) => !notification.read)
  const previousNotifications = filter === "all" ? visibleNotifications.filter((notification) => notification.read) : []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const loadMoreNotifications = async () => {
    if (!scope || !hasNext || loadingMore || nextCursor === null) return

    setLoadingMore(true)
    try {
      const response =
        scope.type === "SHOP" && scope.shopId
          ? await getShopNotifications(scope.shopId, 20, nextCursor)
          : await getUserNotifications(20, nextCursor)
      appendNotificationPage(scope.key, response)
    } catch (error) {
      console.error("[NOTIFICATION LOAD MORE]", error)
      setLoadingMore(false)
    }
  }

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= 80) {
      void loadMoreNotifications()
    }
  }

  const openNotification = (notification: StoredRealtimeNotification) => {
    markNotificationReadLocal(notification.id)
    markNotificationReadApi(notification.id)
      .then((updatedNotification) => markNotificationReadLocal(notification.id, updatedNotification.readAt))
      .catch((error) => console.error("[NOTIFICATION READ]", error))
    setOpen(false)

    const path = getNotificationPath(notification)
    if (path) {
      navigate(path)
    }
  }

  const markAllRead = () => {
    if (!scope) return

    markAllNotificationsReadLocal()
    const request =
      scope.type === "SHOP" && scope.shopId
        ? markAllShopNotificationsRead(scope.shopId)
        : markAllUserNotificationsRead()
    request.catch((error) => console.error("[NOTIFICATION READ ALL]", error))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
        aria-label="Thông báo"
      >
        <i className="pi pi-bell"></i>
        {formattedBadgeCount && (
          <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
            {formattedBadgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[420px] overflow-hidden rounded-2xl border border-slate-100 bg-white text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <h2 className="m-0 text-xl font-bold tracking-tight text-slate-950">Thông báo</h2>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-slate-500 hover:bg-slate-100"
              aria-label="Tùy chọn thông báo"
            >
              <i className="pi pi-ellipsis-h text-sm" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold transition ${filter === "all" ? "bg-[#e8f1ff] text-[#214388]" : "bg-transparent text-slate-600 hover:bg-slate-100"
                }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold transition ${filter === "unread" ? "bg-[#e8f1ff] text-[#214388]" : "bg-transparent text-slate-600 hover:bg-slate-100"
                }`}
            >
              Chưa đọc
            </button>
          </div>

          <div className="max-h-[680px] overflow-y-auto px-2 pb-3" onScroll={handleScroll}>
            {loadingInitial ? (
              <div className="px-4 py-10 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                  <i className="pi pi-spin pi-spinner" />
                </span>
                <p className="m-0 mt-3 text-sm font-semibold text-slate-700">Đang tải thông báo</p>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                  <i className="pi pi-bell" />
                </span>
                <p className="m-0 mt-3 text-sm font-semibold text-slate-700">Chưa có thông báo</p>
                <p className="m-0 mt-1 text-xs text-slate-400">Thông báo realtime sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <>
                {newNotifications.length > 0 && (
                  <NotificationSection
                    title="Mới"
                    actionLabel={badgeCount > 0 ? "Đánh dấu đã đọc" : undefined}
                    onAction={badgeCount > 0 ? markAllRead : undefined}
                    notifications={newNotifications}
                    onOpen={openNotification}
                  />
                )}
                {previousNotifications.length > 0 && (
                  <NotificationSection title="Trước đó" notifications={previousNotifications} onOpen={openNotification} />
                )}
                {loadingMore && (
                  <div className="py-3 text-center text-xs font-semibold text-slate-400">Đang tải thêm...</div>
                )}
                {!loadingMore && hasNext && (
                  <div className="px-2 pt-2">
                    <button
                      type="button"
                      onClick={() => void loadMoreNotifications()}
                      className="w-full rounded-xl border-0 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationSection({
  title,
  actionLabel,
  onAction,
  notifications,
  onOpen,
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
  notifications: StoredRealtimeNotification[]
  onOpen: (notification: StoredRealtimeNotification) => void
}) {
  return (
    <section className="pt-1">
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="m-0 text-sm font-bold text-slate-800">{title}</h3>
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="border-0 bg-transparent text-xs font-semibold text-[#214388] hover:underline">
            {actionLabel}
          </button>
        )}
      </div>
      <div className="space-y-1">
        {notifications.map((notification) => (
          <NotificationItem key={notification.clientId} notification={notification} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

function NotificationItem({
  notification,
  onOpen,
}: {
  notification: StoredRealtimeNotification
  onOpen: (notification: StoredRealtimeNotification) => void
}) {
  const isChatMessage = notification.type === "CHAT_MESSAGE"
  const title = notification.title?.trim() || "Thông báo mới"
  const body = notification.body?.trim()
  const timeText = formatNotificationTime(notification.createdAt)

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`flex w-full items-center gap-3 rounded-xl border-0 px-2 py-2 text-left transition ${notification.read ? "bg-white hover:bg-slate-50" : "bg-[#f5f9ff] hover:bg-[#eef5ff]"
        }`}
    >
      <div className="relative shrink-0">
        {isChatMessage ? (
          <AvatarChip
            name={String(notification.metadata?.senderName || notification.metadata?.customerName || title)}
            avatarUrl={resolveAvatarUrl(notification.metadata?.senderAvatarUrl || null)}
            size={48}
          />
        ) : (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <i className="pi pi-bell text-xl" />
          </span>
        )}

        <span className={`absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-white ring-[2.5px] ring-white ${isChatMessage ? "bg-gradient-to-tr from-[#00c6ff] to-[#0072ff] shadow-sm" : "bg-[#214388]"
          }`}>
          <i className={`${isChatMessage ? "pi pi-comment" : "pi pi-bell"} text-[11px] font-bold`} />
        </span>
      </div>

      <span className="min-w-0 flex-1">
        <span className={`block line-clamp-2 text-sm leading-snug ${notification.read ? "font-medium text-slate-700" : "font-bold text-slate-950"}`}>
          {title}
        </span>
        {body && <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-slate-600">{body}</span>}
        {timeText && <span className="mt-1 block text-xs font-bold text-[#214388]">{timeText}</span>}
      </span>

      {!notification.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1877f2]" />}
    </button>
  )
}

type UserDropdownProps = {
  user: { fullName?: string | null; email?: string | null; avatarUrlPreview?: string | null }
  avatarUrl: string | null
}

function UserDropdown({ user, avatarUrl }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
    await logout().catch(() => { })
    resetStoreAndRedirectToLogin()
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button — Facebook style: avatar + short name */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white/10 pl-1 pr-2.5 py-1 transition hover:bg-white/20 active:scale-95"
      >
        <AvatarChip name={user.fullName || user.email || "User"} avatarUrl={avatarUrl} size={34} />
        <span className="hidden max-w-[120px] truncate text-sm font-semibold text-white sm:block">
          {(user.fullName || user.email || "User").split(" ").slice(-1)[0]}
        </span>
        <i
          className={`pi pi-chevron-down text-[10px] text-white/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-[0_4px_32px_rgba(0,0,0,0.22)]"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* User info card */}
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-xl p-2 cursor-default">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-200">
                <AvatarChip name={user.fullName || user.email || "User"} avatarUrl={avatarUrl} size={56} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-slate-900">{formatProfileValue(user.fullName)}</p>
                <p className="truncate text-xs text-slate-500">{formatProfileValue(user.email)}</p>
              </div>
            </div>
          </div>

          <hr className="mx-3 border-slate-200" />

          {/* Logout */}
          <div className="p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                <i className="pi pi-sign-out text-[0.9rem]" />
              </span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
