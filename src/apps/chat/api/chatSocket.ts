import type { ConversationReadReceiptDTO, MessageDTO } from "@/apps/chat/model"
import { GATEWAY_WEBSOCKET_URL } from "@/common/config/api"
import { SimpleStompClient } from "@/common/socket/simpleStompClient"

type ChatSocketOptions = {
  onRead?: (receipt: ConversationReadReceiptDTO) => void
  onError?: (error: Error) => void
}

export function createShopChatSocket(shopId: number, onMessage: (message: MessageDTO) => void, options: ChatSocketOptions = {}) {
  const client = new SimpleStompClient({
    url: GATEWAY_WEBSOCKET_URL,
    reconnectDelayMs: 3000,
    onError: options.onError,
  })

  const subscription = client.subscribe(`/topic/shops/${shopId}/messages`, (body) => {
    try {
      onMessage(JSON.parse(body) as MessageDTO)
    } catch {
      options.onError?.(new Error("Invalid chat WebSocket payload."))
    }
  })

  const readSubscription = client.subscribe(`/topic/shops/${shopId}/read`, (body) => {
    try {
      options.onRead?.(JSON.parse(body) as ConversationReadReceiptDTO)
    } catch {
      options.onError?.(new Error("Invalid chat read WebSocket payload."))
    }
  })

  client.connect()

  return {
    disconnect: () => {
      subscription.unsubscribe()
      readSubscription.unsubscribe()
      client.disconnect()
    },
  }
}

export function createConversationReadSocket(
  conversationId: number,
  onRead: (receipt: ConversationReadReceiptDTO) => void,
  options: ChatSocketOptions = {}
) {
  const client = new SimpleStompClient({
    url: GATEWAY_WEBSOCKET_URL,
    reconnectDelayMs: 3000,
    onError: options.onError,
  })

  const subscription = client.subscribe(`/topic/conversations/${conversationId}/read`, (body) => {
    try {
      onRead(JSON.parse(body) as ConversationReadReceiptDTO)
    } catch {
      options.onError?.(new Error("Invalid conversation read WebSocket payload."))
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
