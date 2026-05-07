export type RealtimeNotificationType = "CHAT_MESSAGE" | string
export type RealtimeNotificationRecipientType = "USER" | "SHOP" | string
export type RealtimeNotificationTargetType = "MESSAGE" | string
export type ChatNotificationSenderType = "USER" | "SHOP"

export type RealtimeNotificationMetadata = {
  conversationId?: number
  messageId?: number
  messageSenderType?: ChatNotificationSenderType
  senderUserId?: number
  senderAvatarUrl?: string
} & Record<string, unknown>

export interface RealtimeNotificationDTO {
  id: number
  type: RealtimeNotificationType
  recipientType: RealtimeNotificationRecipientType
  recipientUserId: number | null
  recipientShopId: number | null
  shopId: number | null
  targetType: RealtimeNotificationTargetType
  targetId: number | null
  actorUserId: number | null
  title: string
  body: string
  metadata: RealtimeNotificationMetadata | null
  readAt: string | null
  createdAt: string
}

export interface NotificationScrollResponse {
  content: RealtimeNotificationDTO[]
  size: number
  nextCursor: number | null
  hasNext: boolean
}
