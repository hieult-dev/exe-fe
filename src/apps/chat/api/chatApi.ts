import api from "@/common/api/baseApi"
import type {
  ConversationCreateRequest,
  ConversationDTO,
  ConversationReadReceiptDTO,
  ConversationReadRequest,
  MessageCreateRequest,
  MessageDTO,
  MessageScrollResponse,
} from "@/apps/chat/model"

const CONVERSATION_URL = `/conversations`

export const getConversations = async () => {
  return api.get<ConversationDTO[]>(CONVERSATION_URL)
}

export const getConversationMessages = async (conversationId: number, size = 20, cursor: number | null = null) => {
  const params: Record<string, number> = { size }
  if (cursor !== null) params.cursor = cursor
  return api.get<MessageScrollResponse>(`${CONVERSATION_URL}/${conversationId}/messages`, { params })
}

export const createConversation = async (request: ConversationCreateRequest) => {
  return api.post<ConversationDTO>(CONVERSATION_URL, request)
}

export const updateConversation = async (conversationId: number, request: ConversationDTO) => {
  return api.request<ConversationDTO>("put", `${CONVERSATION_URL}/${conversationId}`, request)
}

export const markUserConversationRead = async (conversationId: number, request: ConversationReadRequest) => {
  return api.request<ConversationReadReceiptDTO>("patch", `${CONVERSATION_URL}/${conversationId}/user-read`, request)
}

export const markShopConversationRead = async (conversationId: number, request: ConversationReadRequest) => {
  return api.request<ConversationReadReceiptDTO>("patch", `${CONVERSATION_URL}/${conversationId}/shop-read`, request)
}

export const sendConversationMessage = async (conversationId: number, request: MessageCreateRequest) => {
  return api.post<MessageDTO>(`${CONVERSATION_URL}/${conversationId}/messages`, request)
}
