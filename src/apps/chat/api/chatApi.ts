import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type { ConversationDTO, MessageCreateRequest, MessageDTO } from "@/apps/chat/model"

const CONVERSATION_URL = `${GATEWAY_URL}/api/conversations`

export const getConversations = async () => {
  return api.get<ConversationDTO[]>(CONVERSATION_URL)
}

export const getConversationMessages = async (conversationId: number) => {
  return api.get<MessageDTO[]>(`${CONVERSATION_URL}/${conversationId}/messages`)
}

export const sendConversationMessage = async (conversationId: number, request: MessageCreateRequest) => {
  return api.post<MessageDTO>(`${CONVERSATION_URL}/${conversationId}/messages`, request)
}
