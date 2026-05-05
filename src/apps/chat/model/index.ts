export type MessageSenderType = "CUSTOMER" | "SHOP"

export interface ConversationDTO {
  id: number
  shopId: number
  customerId: number | null
  customerFullName: string | null
  customerPhone: string | null
  customerEmail: string | null
  customerAvatarUrlPreview: string | null
  lastMessageId: number | null
  lastMessageBody: string | null
  lastMessageSenderType: MessageSenderType | null
  lastMessageCreatedAt: string | null
  unreadCount: number | null
  shopLastReadMessageId: number | null
  customerLastReadMessageId: number | null
  createdAt: string
  updatedAt: string
}

export interface MessageDTO {
  id: number
  conversationId: number
  shopId: number
  senderType: MessageSenderType
  senderCustomerId: number | null
  senderUserId: number | null
  body: string
  createdAt: string
}

export type MessageCreateRequest = {
  senderType: MessageSenderType
  senderCustomerId?: number | null
  senderUserId?: number | null
  body: string
}
