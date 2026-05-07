import { create } from "zustand"
import type { NotificationScrollResponse, RealtimeNotificationDTO } from "@/apps/notifications/model"

export type NotificationScope = {
  type: "USER" | "SHOP"
  key: string
  userId?: number
  shopId?: number
}

export type StoredRealtimeNotification = RealtimeNotificationDTO & {
  clientId: string
  read: boolean
}

type NotificationState = {
  scope: NotificationScope | null
  notifications: StoredRealtimeNotification[]
  unreadNotificationCount: number
  unreadChatNotificationCount: number
  latestNotification: RealtimeNotificationDTO | null
  nextCursor: number | null
  hasNext: boolean
  loadingInitial: boolean
  loadingMore: boolean
  setScopeLoading: (scope: NotificationScope) => void
  setNotificationSnapshot: (scope: NotificationScope, response: NotificationScrollResponse, unreadCount: number) => void
  appendNotificationPage: (scopeKey: string, response: NotificationScrollResponse) => void
  prependRealtimeNotification: (scopeKey: string, notification: RealtimeNotificationDTO) => void
  setLoadingMore: (loading: boolean) => void
  markNotificationReadLocal: (notificationId: number, readAt?: string | null) => void
  markAllNotificationsReadLocal: () => void
  clearChatNotifications: () => void
  clearChatNotificationByConversationLocal: (conversationId: number) => void
  clearAllNotifications: () => void
}

function getNotificationClientId(notification: RealtimeNotificationDTO) {
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

function toStoredNotification(notification: RealtimeNotificationDTO): StoredRealtimeNotification {
  return {
    ...notification,
    clientId: getNotificationClientId(notification),
    read: notification.readAt !== null,
  }
}

function mergeNotifications(existingNotifications: StoredRealtimeNotification[], incomingNotifications: RealtimeNotificationDTO[], mode: "prepend" | "append") {
  const existingIds = new Set(existingNotifications.map((notification) => notification.clientId))
  const storedIncomingNotifications = incomingNotifications.map(toStoredNotification).filter((notification) => !existingIds.has(notification.clientId))

  return mode === "prepend"
    ? [...storedIncomingNotifications, ...existingNotifications]
    : [...existingNotifications, ...storedIncomingNotifications]
}

function getUnreadChatCount(notifications: StoredRealtimeNotification[]) {
  return notifications.filter((notification) => !notification.read && notification.type === "CHAT_MESSAGE").length
}

function getUnreadCount(notifications: StoredRealtimeNotification[]) {
  return notifications.filter((notification) => !notification.read).length
}

function withReadState(notification: StoredRealtimeNotification, readAt = new Date().toISOString()) {
  return {
    ...notification,
    read: true,
    readAt: notification.readAt ?? readAt,
  }
}

export const useNotificationStore = create<NotificationState>((set) => ({
  scope: null,
  notifications: [],
  unreadNotificationCount: 0,
  unreadChatNotificationCount: 0,
  latestNotification: null,
  nextCursor: null,
  hasNext: false,
  loadingInitial: false,
  loadingMore: false,
  setScopeLoading: (scope) =>
    set((state) => ({
      scope,
      notifications: state.scope?.key === scope.key ? state.notifications : [],
      unreadNotificationCount: state.scope?.key === scope.key ? state.unreadNotificationCount : 0,
      unreadChatNotificationCount: state.scope?.key === scope.key ? state.unreadChatNotificationCount : 0,
      nextCursor: state.scope?.key === scope.key ? state.nextCursor : null,
      hasNext: state.scope?.key === scope.key ? state.hasNext : false,
      loadingInitial: true,
      loadingMore: false,
    })),
  setNotificationSnapshot: (scope, response, unreadCount) =>
    set(() => {
      const notifications = response.content.map(toStoredNotification)
      return {
        scope,
        notifications,
        unreadNotificationCount: unreadCount,
        unreadChatNotificationCount: getUnreadChatCount(notifications),
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        loadingInitial: false,
        loadingMore: false,
      }
    }),
  appendNotificationPage: (scopeKey, response) =>
    set((state) => {
      if (state.scope?.key !== scopeKey) return state

      const notifications = mergeNotifications(state.notifications, response.content, "append")
      return {
        notifications,
        unreadNotificationCount: state.unreadNotificationCount,
        unreadChatNotificationCount: getUnreadChatCount(notifications),
        nextCursor: response.nextCursor,
        hasNext: response.hasNext,
        loadingMore: false,
      }
    }),
  prependRealtimeNotification: (scopeKey, notification) =>
    set((state) => {
      if (state.scope?.key !== scopeKey) return state

      const notifications = mergeNotifications(state.notifications, [notification], "prepend").slice(0, 80)
      const isNewNotification = !state.notifications.some((item) => item.clientId === getNotificationClientId(notification))
      const shouldIncreaseUnread = isNewNotification && notification.readAt === null
      return {
        notifications,
        latestNotification: notification,
        unreadNotificationCount: shouldIncreaseUnread ? state.unreadNotificationCount + 1 : state.unreadNotificationCount,
        unreadChatNotificationCount:
          shouldIncreaseUnread && notification.type === "CHAT_MESSAGE"
            ? state.unreadChatNotificationCount + 1
            : state.unreadChatNotificationCount,
      }
    }),
  setLoadingMore: (loading) => set({ loadingMore: loading }),
  markNotificationReadLocal: (notificationId, readAt) =>
    set((state) => {
      const unreadNotification = state.notifications.find((notification) => notification.id === notificationId && !notification.read)
      const notifications = state.notifications.map((notification) =>
        notification.id === notificationId ? withReadState(notification, readAt ?? undefined) : notification
      )
      return {
        notifications,
        unreadNotificationCount: unreadNotification ? Math.max(0, state.unreadNotificationCount - 1) : state.unreadNotificationCount,
        unreadChatNotificationCount: getUnreadChatCount(notifications),
      }
    }),
  markAllNotificationsReadLocal: () =>
    set((state) => {
      const notifications = state.notifications.map((notification) => withReadState(notification))
      return {
        notifications,
        unreadNotificationCount: 0,
        unreadChatNotificationCount: 0,
      }
    }),
  clearChatNotifications: () =>
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.type === "CHAT_MESSAGE" ? withReadState(notification) : notification
      )
      return {
        notifications,
        unreadNotificationCount: getUnreadCount(notifications),
        unreadChatNotificationCount: 0,
      }
    }),
  clearChatNotificationByConversationLocal: (conversationId: number) =>
    set((state) => {
      let changed = false
      const notifications = state.notifications.map((notification) => {
        if (!notification.read && notification.type === "CHAT_MESSAGE") {
          const notifConversationId = typeof notification.metadata?.conversationId === "number" 
            ? notification.metadata.conversationId 
            : typeof notification.metadata?.conversationId === "string" 
              ? Number(notification.metadata.conversationId) 
              : null
          
          if (notifConversationId === conversationId) {
            changed = true
            return withReadState(notification)
          }
        }
        return notification
      })

      if (!changed) return state

      return {
        notifications,
        unreadNotificationCount: getUnreadCount(notifications),
        unreadChatNotificationCount: getUnreadChatCount(notifications),
      }
    }),
  clearAllNotifications: () =>
    set({
      scope: null,
      notifications: [],
      unreadNotificationCount: 0,
      unreadChatNotificationCount: 0,
      latestNotification: null,
      nextCursor: null,
      hasNext: false,
      loadingInitial: false,
      loadingMore: false,
    }),
}))
