import type { NotificationScrollResponse, RealtimeNotificationDTO } from "@/apps/notifications/model"
import api, { initialClient } from "@/common/api/baseApi"

const NOTIFICATION_URL = `/notifications`

type UnreadCountResponse = number | { unreadCount?: number; count?: number }

function buildScrollParams(size: number, cursor?: number | null) {
  const params = new URLSearchParams({ size: String(size) })
  if (cursor !== null && cursor !== undefined) {
    params.set("cursor", String(cursor))
  }
  return params.toString()
}

export function normalizeUnreadCount(response: UnreadCountResponse) {
  if (typeof response === "number") return response
  if (typeof response.unreadCount === "number") return response.unreadCount
  if (typeof response.count === "number") return response.count
  return 0
}

async function patchWithoutBody<T>(url: string) {
  const response = await initialClient(false).patch<T>(url)
  return response.data
}

export const getUserNotifications = async (size = 20, cursor?: number | null) => {
  return api.get<NotificationScrollResponse>(`${NOTIFICATION_URL}/users/me?${buildScrollParams(size, cursor)}`)
}

export const getUserUnreadNotificationCount = async () => {
  return normalizeUnreadCount(await api.get<UnreadCountResponse>(`${NOTIFICATION_URL}/users/me/unread-count`))
}

export const markAllUserNotificationsRead = async () => {
  return patchWithoutBody<void>(`${NOTIFICATION_URL}/users/me/read-all`)
}

export const getShopNotifications = async (shopId: number, size = 20, cursor?: number | null) => {
  return api.get<NotificationScrollResponse>(`${NOTIFICATION_URL}/shops/${shopId}?${buildScrollParams(size, cursor)}`)
}

export const getShopUnreadNotificationCount = async (shopId: number) => {
  return normalizeUnreadCount(await api.get<UnreadCountResponse>(`${NOTIFICATION_URL}/shops/${shopId}/unread-count`))
}

export const markAllShopNotificationsRead = async (shopId: number) => {
  return patchWithoutBody<void>(`${NOTIFICATION_URL}/shops/${shopId}/read-all`)
}

export const markNotificationRead = async (notificationId: number) => {
  return patchWithoutBody<RealtimeNotificationDTO>(`${NOTIFICATION_URL}/${notificationId}/read`)
}
