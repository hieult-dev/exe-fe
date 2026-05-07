import { useCallback, useEffect, useRef, type MutableRefObject } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  getShopNotifications,
  getShopUnreadNotificationCount,
  getUserNotifications,
  getUserUnreadNotificationCount,
  markNotificationRead,
} from "@/apps/notifications/api/notificationApi"
import { createShopNotificationSocket, createUserNotificationSocket } from "@/apps/notifications/api/notificationSocket"
import type { RealtimeNotificationDTO } from "@/apps/notifications/model"
import type { NotificationScope } from "@/apps/notifications/store/NotificationStore"
import { useNotificationStore } from "@/apps/notifications/store/NotificationStore"
import { useUserStore } from "@/apps/user/store/UserStore"

const ORDER_NOTIFICATION_TOAST_ID = "order-notification-batch"
const SERVICE_NOTIFICATION_TOAST_ID = "service-notification-batch"

type BatchedNotificationToastState = {
  count: number
  path: string
  title: string
  body: string
  resetTimer: number | null
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }
  return null
}

function getConversationId(notification: RealtimeNotificationDTO) {
  return getNumber(notification.metadata?.conversationId)
}

function getOrderNotificationId(notification: RealtimeNotificationDTO) {
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

function isOrderNotification(notification: RealtimeNotificationDTO) {
  return (
    notification.targetType === "ORDER" ||
    notification.type === "ORDER_CREATED" ||
    notification.type === "ORDER_STATUS_UPDATED" ||
    getNumber(notification.metadata?.orderId) !== null
  )
}

function getBookingNotificationId(notification: RealtimeNotificationDTO) {
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

function getServiceNotificationId(notification: RealtimeNotificationDTO) {
  const metadataServiceId = getNumber(notification.metadata?.serviceId)
  if (metadataServiceId !== null) return metadataServiceId

  if (notification.targetType === "SERVICE") {
    return getNumber(notification.targetId)
  }

  return null
}

function isServiceNotification(notification: RealtimeNotificationDTO) {
  return (
    notification.targetType === "BOOKING" ||
    notification.targetType === "SERVICE" ||
    notification.type === "BOOKING_CREATED" ||
    notification.type === "BOOKING_STATUS_UPDATED" ||
    notification.type === "SERVICE_BOOKED" ||
    getNumber(notification.metadata?.bookingId) !== null
  )
}

function getNotificationPath(notification: RealtimeNotificationDTO) {
  const orderId = getOrderNotificationId(notification)
  if (isOrderNotification(notification) || orderId !== null) {
    return orderId !== null ? `/shop/orders?orderId=${orderId}` : "/shop/orders"
  }

  const bookingId = getBookingNotificationId(notification)
  if (
    bookingId !== null ||
    notification.targetType === "BOOKING" ||
    notification.type === "BOOKING_CREATED" ||
    notification.type === "BOOKING_STATUS_UPDATED" ||
    (notification.type === "SERVICE_BOOKED" && notification.targetType !== "SERVICE")
  ) {
    return bookingId !== null ? `/shop/bookings?bookingId=${bookingId}` : "/shop/bookings"
  }

  const serviceId = getServiceNotificationId(notification)
  if (notification.targetType === "SERVICE" || serviceId !== null) {
    return serviceId !== null ? `/shop/services?serviceId=${serviceId}` : "/shop/services"
  }

  if (isServiceNotification(notification)) {
    return "/shop/bookings"
  }

  return null
}

function getActiveChatConversationId(pathname: string, search: string) {
  if (!pathname.startsWith("/shop/chat")) return null
  return getNumber(new URLSearchParams(search).get("conversationId"))
}

function getNotificationKey(notification: RealtimeNotificationDTO) {
  if (notification.id !== null && notification.id !== undefined) {
    return `id:${notification.id}`
  }

  return [
    notification.type,
    notification.recipientType,
    notification.recipientUserId ?? "",
    notification.recipientShopId ?? "",
    notification.targetType,
    notification.targetId ?? "",
    notification.createdAt,
  ].join(":")
}

function getActiveNotificationScope(userId: number | undefined, currentShopId: number | null, shopConsoleOpen: boolean): NotificationScope | null {
  if (shopConsoleOpen && currentShopId) {
    return { type: "SHOP", key: `shop:${currentShopId}`, shopId: currentShopId }
  }

  if (userId) {
    return { type: "USER", key: `user:${userId}`, userId }
  }

  return null
}

function ChatNotificationToast({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-sm font-semibold text-slate-900">{title}</p>
      {body && <p className="m-0 mt-1 line-clamp-2 text-xs text-slate-600">{body}</p>}
    </div>
  )
}

function BatchedNotificationToast({
  count,
  title,
  body,
  pluralTitle,
}: {
  count: number
  title: string
  body: string
  pluralTitle: string
}) {
  const displayTitle = count > 1 ? `${count} ${pluralTitle}` : title
  const displayBody = count > 1 ? `Mới nhất: ${body || title}` : body

  return (
    <div className="min-w-0">
      <p className="m-0 text-sm font-semibold text-slate-900">{displayTitle}</p>
      {displayBody && <p className="m-0 mt-1 line-clamp-2 text-xs text-slate-600">{displayBody}</p>}
    </div>
  )
}

export function NotificationRealtimeBridge() {
  const { user, authentication, currentShopId } = useUserStore()
  const setScopeLoading = useNotificationStore((state) => state.setScopeLoading)
  const setNotificationSnapshot = useNotificationStore((state) => state.setNotificationSnapshot)
  const prependRealtimeNotification = useNotificationStore((state) => state.prependRealtimeNotification)
  const markNotificationReadLocal = useNotificationStore((state) => state.markNotificationReadLocal)
  const clearAllNotifications = useNotificationStore((state) => state.clearAllNotifications)
  const navigate = useNavigate()
  const location = useLocation()
  const shopConsoleOpen = location.pathname.startsWith("/shop")
  const activeScope = getActiveNotificationScope(user?.id, currentShopId, shopConsoleOpen)
  const locationRef = useRef(location)
  const activeScopeRef = useRef<NotificationScope | null>(activeScope)
  const seenNotificationKeysRef = useRef<Set<string>>(new Set())
  const orderToastBatchRef = useRef<BatchedNotificationToastState>({
    count: 0,
    path: "/shop/orders",
    title: "",
    body: "",
    resetTimer: null,
  })
  const serviceToastBatchRef = useRef<BatchedNotificationToastState>({
    count: 0,
    path: "/shop/bookings",
    title: "",
    body: "",
    resetTimer: null,
  })

  useEffect(() => {
    seenNotificationKeysRef.current.clear()
  }, [activeScope?.key, authentication])

  useEffect(() => {
    locationRef.current = location
  }, [location])

  useEffect(() => {
    activeScopeRef.current = activeScope
  }, [activeScope])

  useEffect(() => {
    return () => {
      if (orderToastBatchRef.current.resetTimer !== null) {
        window.clearTimeout(orderToastBatchRef.current.resetTimer)
      }
      if (serviceToastBatchRef.current.resetTimer !== null) {
        window.clearTimeout(serviceToastBatchRef.current.resetTimer)
      }
    }
  }, [])

  const showBatchedNotificationToast = useCallback(
    (
      batchRef: MutableRefObject<BatchedNotificationToastState>,
      toastId: string,
      defaultPath: string,
      pluralTitle: string,
      path: string,
      title: string,
      body: string
    ) => {
      const currentBatch = batchRef.current
      if (currentBatch.resetTimer !== null) {
        window.clearTimeout(currentBatch.resetTimer)
      }

      const nextBatch: BatchedNotificationToastState = {
        count: currentBatch.count + 1,
        path,
        title,
        body,
        resetTimer: window.setTimeout(() => {
          batchRef.current = {
            count: 0,
            path: defaultPath,
            title: "",
            body: "",
            resetTimer: null,
          }
        }, 5000),
      }
      batchRef.current = nextBatch

      const content = <BatchedNotificationToast count={nextBatch.count} title={title} body={body} pluralTitle={pluralTitle} />
      const options = {
        autoClose: 4500,
        onClick: () => navigate(path),
      }

      if (toast.isActive(toastId)) {
        toast.update(toastId, {
          render: content,
          ...options,
        })
        return
      }

      toast.info(content, {
        toastId,
        ...options,
      })
    },
    [navigate]
  )

  useEffect(() => {
    if (!authentication || !activeScope) {
      clearAllNotifications()
      return undefined
    }

    let cancelled = false
    const scope = activeScope
    setScopeLoading(scope)

    async function loadNotificationCenter() {
      try {
        const [notificationPage, unreadCount] =
          scope.type === "SHOP" && scope.shopId
            ? await Promise.all([getShopNotifications(scope.shopId), getShopUnreadNotificationCount(scope.shopId)])
            : await Promise.all([getUserNotifications(), getUserUnreadNotificationCount()])

        if (!cancelled) {
          setNotificationSnapshot(scope, notificationPage, unreadCount)
        }
      } catch (error) {
        console.error("[NOTIFICATION CENTER]", error)
        if (!cancelled) {
          setNotificationSnapshot(scope, { content: [], size: 20, nextCursor: null, hasNext: false }, 0)
        }
      }
    }

    void loadNotificationCenter()

    return () => {
      cancelled = true
    }
  }, [activeScope?.key, authentication, clearAllNotifications, setNotificationSnapshot, setScopeLoading])

  const handleNotification = useCallback(
    (notification: RealtimeNotificationDTO) => {
      const notificationKey = getNotificationKey(notification)
      if (seenNotificationKeysRef.current.has(notificationKey)) return
      seenNotificationKeysRef.current.add(notificationKey)

      const scope = activeScopeRef.current
      if (!scope) return

      const conversationId = notification.type === "CHAT_MESSAGE" ? getConversationId(notification) : null
      const activeConversationId = getActiveChatConversationId(locationRef.current.pathname, locationRef.current.search)
      const isActiveChatConversation = conversationId !== null && activeConversationId === conversationId

      if (isActiveChatConversation) {
        markNotificationRead(notification.id)
          .then((updatedNotification) => markNotificationReadLocal(notification.id, updatedNotification.readAt))
          .catch((error) => console.error("[NOTIFICATION READ]", error))
        return
      }

      prependRealtimeNotification(scope.key, notification)

      const title = notification.title?.trim() || "Thông báo mới"
      const body = notification.body?.trim() || ""

      if (notification.type === "CHAT_MESSAGE" && conversationId !== null) {
        toast.info(<ChatNotificationToast title={title} body={body} />, {
          autoClose: 4500,
          onClick: () => navigate(`/shop/chat?conversationId=${conversationId}`),
        })
        return
      }

      const notificationPath = getNotificationPath(notification)
      if (notificationPath && isOrderNotification(notification)) {
        showBatchedNotificationToast(
          orderToastBatchRef,
          ORDER_NOTIFICATION_TOAST_ID,
          "/shop/orders",
          "thông báo đơn hàng mới",
          notificationPath,
          title,
          body
        )
        return
      }

      if (notificationPath && isServiceNotification(notification)) {
        showBatchedNotificationToast(
          serviceToastBatchRef,
          SERVICE_NOTIFICATION_TOAST_ID,
          "/shop/bookings",
          "thông báo dịch vụ mới",
          notificationPath,
          title,
          body
        )
        return
      }

      toast.info(<ChatNotificationToast title={title} body={body} />, {
        autoClose: 4500,
        onClick: notificationPath ? () => navigate(notificationPath) : undefined,
      })
    },
    [markNotificationReadLocal, navigate, prependRealtimeNotification, showBatchedNotificationToast]
  )

  useEffect(() => {
    if (!authentication || !activeScope || activeScope.type !== "USER" || !activeScope.userId) return undefined

    const socket = createUserNotificationSocket(activeScope.userId, handleNotification, {
      onError: (error) => console.error("[USER NOTIFICATION SOCKET]", error),
    })

    return () => socket.disconnect()
  }, [activeScope?.key, authentication, handleNotification])

  useEffect(() => {
    if (!authentication || !activeScope || activeScope.type !== "SHOP" || !activeScope.shopId) return undefined

    const socket = createShopNotificationSocket(activeScope.shopId, handleNotification, {
      onError: (error) => console.error("[SHOP NOTIFICATION SOCKET]", error),
    })

    return () => socket.disconnect()
  }, [activeScope?.key, authentication, handleNotification])

  return null
}
