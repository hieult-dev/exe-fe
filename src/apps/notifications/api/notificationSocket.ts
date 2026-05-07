import type { RealtimeNotificationDTO } from "@/apps/notifications/model"
import { GATEWAY_WEBSOCKET_URL } from "@/common/config/api"
import { SimpleStompClient } from "@/common/socket/simpleStompClient"

type NotificationSocketOptions = {
  onError?: (error: Error) => void
}

function createNotificationSocket(destination: string, onNotification: (notification: RealtimeNotificationDTO) => void, options: NotificationSocketOptions) {
  const client = new SimpleStompClient({
    url: GATEWAY_WEBSOCKET_URL,
    reconnectDelayMs: 3000,
    onError: options.onError,
  })

  const subscription = client.subscribe(destination, (body) => {
    try {
      onNotification(JSON.parse(body) as RealtimeNotificationDTO)
    } catch {
      options.onError?.(new Error("Invalid notification WebSocket payload."))
    }
  })

  client.connect()

  return {
    disconnect: () => {
      subscription.unsubscribe()
      client.disconnect()
    },
  }
}

export function createUserNotificationSocket(userId: number, onNotification: (notification: RealtimeNotificationDTO) => void, options: NotificationSocketOptions = {}) {
  return createNotificationSocket(`/topic/users/${userId}/notifications`, onNotification, options)
}

export function createShopNotificationSocket(shopId: number, onNotification: (notification: RealtimeNotificationDTO) => void, options: NotificationSocketOptions = {}) {
  return createNotificationSocket(`/topic/shops/${shopId}/notifications`, onNotification, options)
}
