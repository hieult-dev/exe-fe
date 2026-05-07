export type MessageSenderType = "USER" | "SHOP"

export interface ConversationDTO {
  id: number
  shopId: number
  userId: number | null
  userFullName: string | null
  userPhone: string | null
  userEmail: string | null
  userAvatarUrlPreview: string | null
  lastMessageId: number | null
  lastMessageBody: string | null
  lastMessageSenderType: MessageSenderType | null
  lastMessageCreatedAt: string | null
  unreadCount: number | null
  shopLastReadMessageId: number | null
  userLastReadMessageId: number | null
  createdAt: string
  updatedAt: string
}

export interface MessageDTO {
  id: number
  conversationId: number
  shopId: number
  senderType: MessageSenderType
  senderUserId: number | null
  body: string
  createdAt: string
}

export interface MessageScrollResponse {
  content: MessageDTO[]
  size: number
  nextCursor: number | null
  hasNext: boolean
}

export type ConversationReaderType = "USER" | "SHOP"

export interface ConversationReadReceiptDTO {
  conversationId: number
  shopId: number
  readerType: ConversationReaderType
  readerUserId: number | null
  lastReadMessageId: number
  shopLastReadMessageId: number | null
  userLastReadMessageId: number | null
}

export type ConversationReadRequest = {
  lastReadMessageId: number
}

export type ConversationCreateRequest = {
  userId: number
}

export type MessageCreateRequest = {
  senderType: MessageSenderType
  senderUserId?: number | null
  body: string
}
