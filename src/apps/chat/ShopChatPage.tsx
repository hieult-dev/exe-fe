import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { ProgressSpinner } from "primereact/progressspinner"
import { getConversationMessages, getConversations, markShopConversationRead, sendConversationMessage } from "@/apps/chat/api/chatApi"
import { createConversationReadSocket, createShopChatSocket } from "@/apps/chat/api/chatSocket"
import type { ConversationDTO, ConversationReadReceiptDTO, MessageDTO } from "@/apps/chat/model"
import { markNotificationRead } from "@/apps/notifications/api/notificationApi"
import { useNotificationStore } from "@/apps/notifications/store/NotificationStore"
import { useUserStore } from "@/apps/user/store/UserStore"
import { AvatarChip } from "@/common/component/AvatarChip"
import { notify } from "@/common/toast/ToastHelper"
import { resolveAvatarUrl } from "@/common/user/utils/profile"
import { formatDateTimeViVN } from "@/common/utils/format"

type ConversationView = {
  conversation: ConversationDTO
  messages: MessageDTO[]
  lastMessage: MessageDTO | null
  unreadCount: number
}

type MessagePaginationState = {
  nextCursor: number | null
  hasNext: boolean
  loadingInitial: boolean
  loadingOlder: boolean
}

type ConversationFilter = "all" | "unread"

const MESSAGE_PAGE_SIZE = 20
const MESSAGE_GROUP_WINDOW_MS = 5 * 60 * 1000

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function formatChatTime(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}

function getChatUserName(conversation: ConversationDTO) {
  return conversation.userFullName?.trim() || `Người dùng #${conversation.userId ?? conversation.id}`
}

function getChatUserSubtitle(conversation: ConversationDTO) {
  return conversation.userPhone?.trim() || conversation.userEmail?.trim() || "Chưa có thông tin liên hệ"
}

function getChatUserAvatarUrl(conversation: ConversationDTO) {
  return resolveAvatarUrl(conversation.userAvatarUrlPreview)
}

function getConversationPreview(conversation: ConversationDTO, message: MessageDTO | null) {
  if (!message && !conversation.lastMessageBody) return "Chưa có tin nhắn"
  if (!message) {
    return `${conversation.lastMessageSenderType === "SHOP" ? "Bạn: " : ""}${conversation.lastMessageBody}`
  }
  return `${message.senderType === "SHOP" ? "Bạn: " : ""}${message.body}`
}

function getConversationTime(conversation: ConversationDTO, message: MessageDTO | null) {
  return message?.createdAt ?? conversation.lastMessageCreatedAt ?? conversation.updatedAt ?? conversation.createdAt
}

function appendMessageIfMissing(messages: MessageDTO[], message: MessageDTO) {
  if (messages.some((item) => item.id === message.id)) return messages
  return [...messages, message]
}

function prependMessagesIfMissing(messages: MessageDTO[], olderMessages: MessageDTO[]) {
  const existingIds = new Set(messages.map((message) => message.id))
  return [...olderMessages.filter((message) => !existingIds.has(message.id)), ...messages]
}

function syncConversationWithMessage(conversation: ConversationDTO, message: MessageDTO, selectedConversationId: number | null) {
  const isActiveConversation = conversation.id === selectedConversationId
  const shouldIncreaseUnread = conversation.lastMessageId !== message.id && message.senderType === "USER" && !isActiveConversation

  return {
    ...conversation,
    lastMessageId: message.id,
    lastMessageBody: message.body,
    lastMessageSenderType: message.senderType,
    lastMessageCreatedAt: message.createdAt,
    updatedAt: message.createdAt,
    unreadCount: shouldIncreaseUnread ? (conversation.unreadCount ?? 0) + 1 : conversation.unreadCount,
  }
}

function getConversationLatestMessageId(conversation: ConversationDTO, messages: MessageDTO[]) {
  return messages.length > 0 ? messages[messages.length - 1].id : conversation.lastMessageId
}

function isGroupedMessage(message: MessageDTO, adjacentMessage: MessageDTO | undefined) {
  if (!adjacentMessage || adjacentMessage.senderType !== message.senderType) return false

  const messageTime = new Date(message.createdAt).getTime()
  const adjacentTime = new Date(adjacentMessage.createdAt).getTime()
  if (Number.isNaN(messageTime) || Number.isNaN(adjacentTime)) return true

  return Math.abs(messageTime - adjacentTime) <= MESSAGE_GROUP_WINDOW_MS
}

function getMessageBubbleRadius(fromShop: boolean, groupedWithPrevious: boolean, groupedWithNext: boolean) {
  if (fromShop) {
    return `rounded-2xl ${groupedWithPrevious ? "rounded-tr-md" : ""} ${groupedWithNext ? "rounded-br-md" : ""}`
  }

  return `rounded-2xl ${groupedWithPrevious ? "rounded-tl-md" : ""} ${groupedWithNext ? "rounded-bl-md" : ""}`
}

function getUserReadMessageId(messages: MessageDTO[], userLastReadMessageId: number | null | undefined) {
  if (!userLastReadMessageId) return null

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.senderType === "SHOP" && message.id <= userLastReadMessageId) {
      return message.id
    }
  }

  return null
}

function getConversationIdSearchParam(searchParams: URLSearchParams) {
  const conversationId = Number(searchParams.get("conversationId"))
  return Number.isFinite(conversationId) && conversationId > 0 ? conversationId : null
}

function getNotificationConversationId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }
  return null
}

export function ShopChatPage() {
  const { user, currentShopId } = useUserStore()
  const clearChatNotificationByConversationLocal = useNotificationStore((state) => state.clearChatNotificationByConversationLocal)
  const markNotificationReadLocal = useNotificationStore((state) => state.markNotificationReadLocal)
  const notifications = useNotificationStore((state) => state.notifications)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedConversationId = useMemo(() => getConversationIdSearchParam(searchParams), [searchParams])
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, MessageDTO[]>>({})
  const [messagePaginationByConversation, setMessagePaginationByConversation] = useState<Record<number, MessagePaginationState>>({})
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [activeConversationFilter, setActiveConversationFilter] = useState<ConversationFilter>("all")
  const [pinnedUnreadConversationId, setPinnedUnreadConversationId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageDraft, setMessageDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationsRef = useRef<ConversationDTO[]>([])
  const selectedConversationIdRef = useRef<number | null>(null)
  const syncedReadByConversationRef = useRef<Record<number, number>>({})
  const loadingOlderConversationRef = useRef<Record<number, boolean>>({})
  const previousSelectedConversationIdRef = useRef<number | null>(null)
  const previousSelectedLastMessageIdRef = useRef<number | null>(null)

  const conversationViews = useMemo<ConversationView[]>(() => {
    return conversations
      .map((conversation) => {
        const messages = messagesByConversation[conversation.id] ?? []
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
        const unreadCount = conversation.unreadCount ?? 0

        return {
          conversation,
          messages,
          lastMessage,
          unreadCount,
        }
      })
      .sort((left, right) => {
        const leftTime = new Date(getConversationTime(left.conversation, left.lastMessage)).getTime()
        const rightTime = new Date(getConversationTime(right.conversation, right.lastMessage)).getTime()
        return rightTime - leftTime
      })
  }, [conversations, messagesByConversation])

  const filteredConversationViews = useMemo(() => {
    const readFilteredViews =
      activeConversationFilter === "unread"
        ? conversationViews.filter((item) => item.unreadCount > 0 || item.conversation.id === pinnedUnreadConversationId)
        : conversationViews
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return readFilteredViews

    return readFilteredViews.filter(({ conversation, lastMessage }) => {
      const haystack = [
        getChatUserName(conversation),
        conversation.userPhone,
        conversation.userEmail,
        conversation.lastMessageBody,
        lastMessage?.body,
        `#${conversation.id}`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [activeConversationFilter, conversationViews, pinnedUnreadConversationId, searchQuery])

  const selectedView = useMemo(
    () => conversationViews.find((item) => item.conversation.id === selectedConversationId) ?? filteredConversationViews[0] ?? null,
    [conversationViews, filteredConversationViews, selectedConversationId]
  )

  const selectedMessages = selectedView?.messages ?? []
  const selectedPagination = selectedConversationId !== null ? messagePaginationByConversation[selectedConversationId] : undefined
  const selectedLastMessageId = selectedMessages.length > 0 ? selectedMessages[selectedMessages.length - 1].id : null
  const userReadMessageId = selectedView
    ? getUserReadMessageId(selectedMessages, selectedView.conversation.userLastReadMessageId)
    : null
  const selectedConversationUnreadNotificationIds = useMemo(() => {
    if (selectedConversationId === null) return []

    return notifications
      .filter((notification) => {
        if (notification.read || notification.type !== "CHAT_MESSAGE") return false
        return getNotificationConversationId(notification.metadata?.conversationId) === selectedConversationId
      })
      .map((notification) => notification.id)
  }, [notifications, selectedConversationId])

  const updateConversationSearchParam = (conversationId: number, replace = true) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set("conversationId", String(conversationId))
    setSearchParams(nextSearchParams, { replace })
  }

  const selectConversation = (item: ConversationView) => {
    setSelectedConversationId(item.conversation.id)
    setPinnedUnreadConversationId(activeConversationFilter === "unread" ? item.conversation.id : null)
    updateConversationSearchParam(item.conversation.id, false)
  }

  const markChatNotificationsRead = (conversationId: number, notificationIds: number[]) => {
    if (notificationIds.length === 0) return

    clearChatNotificationByConversationLocal(conversationId)
    notificationIds.forEach((notificationId) => {
      markNotificationRead(notificationId)
        .then((updatedNotification) => markNotificationReadLocal(notificationId, updatedNotification.readAt))
        .catch((error) => console.error("[NOTIFICATION READ]", error))
    })
  }

  const loadChatData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const conversationList = await getConversations()
      setConversations(conversationList)
      setSelectedConversationId((current) => {
        const hasCurrent = current !== null && conversationList.some((conversation) => conversation.id === current)
        const hasRequested = requestedConversationId !== null && conversationList.some((conversation) => conversation.id === requestedConversationId)
        if (hasCurrent) return current
        return hasRequested ? requestedConversationId : conversationList[0]?.id ?? null
      })
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh sách chat."))
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const loadConversationMessages = async (conversationId: number) => {
    setMessagePaginationByConversation((current) => ({
      ...current,
      [conversationId]: {
        nextCursor: current[conversationId]?.nextCursor ?? null,
        hasNext: current[conversationId]?.hasNext ?? false,
        loadingInitial: true,
        loadingOlder: false,
      },
    }))

    try {
      const response = await getConversationMessages(conversationId, MESSAGE_PAGE_SIZE)
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: response.content,
      }))
      setMessagePaginationByConversation((current) => ({
        ...current,
        [conversationId]: {
          nextCursor: response.nextCursor ?? null,
          hasNext: response.hasNext ?? false,
          loadingInitial: false,
          loadingOlder: false,
        },
      }))
    } catch (error) {
      setMessagePaginationByConversation((current) => ({
        ...current,
        [conversationId]: {
          nextCursor: current[conversationId]?.nextCursor ?? null,
          hasNext: current[conversationId]?.hasNext ?? false,
          loadingInitial: false,
          loadingOlder: false,
        },
      }))
      notify.error(getErrorMessage(error, "Không tải được nội dung chat."))
    }
  }

  const loadOlderMessages = async (conversationId: number) => {
    const pagination = messagePaginationByConversation[conversationId]
    if (!pagination?.hasNext || pagination.nextCursor === null || pagination.loadingInitial || pagination.loadingOlder) return
    if (loadingOlderConversationRef.current[conversationId]) return

    const scrollContainer = messagesScrollRef.current
    const previousScrollHeight = scrollContainer?.scrollHeight ?? 0
    const previousScrollTop = scrollContainer?.scrollTop ?? 0

    loadingOlderConversationRef.current[conversationId] = true
    setMessagePaginationByConversation((current) => ({
      ...current,
      [conversationId]: {
        ...current[conversationId],
        loadingOlder: true,
      },
    }))

    try {
      const response = await getConversationMessages(conversationId, MESSAGE_PAGE_SIZE, pagination.nextCursor)
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: prependMessagesIfMissing(current[conversationId] ?? [], response.content),
      }))
      setMessagePaginationByConversation((current) => ({
        ...current,
        [conversationId]: {
          nextCursor: response.nextCursor ?? null,
          hasNext: response.hasNext ?? false,
          loadingInitial: false,
          loadingOlder: false,
        },
      }))

      window.requestAnimationFrame(() => {
        if (!scrollContainer) return
        scrollContainer.scrollTop = scrollContainer.scrollHeight - previousScrollHeight + previousScrollTop
      })
    } catch (error) {
      setMessagePaginationByConversation((current) => ({
        ...current,
        [conversationId]: {
          nextCursor: current[conversationId]?.nextCursor ?? pagination.nextCursor,
          hasNext: current[conversationId]?.hasNext ?? pagination.hasNext,
          loadingInitial: false,
          loadingOlder: false,
        },
      }))
      notify.error(getErrorMessage(error, "Không tải được tin nhắn cũ."))
    } finally {
      loadingOlderConversationRef.current[conversationId] = false
    }
  }

  const handleMessagesScroll = () => {
    if (selectedConversationId === null) return

    const scrollContainer = messagesScrollRef.current
    if (!scrollContainer || scrollContainer.scrollTop > 48) return

    void loadOlderMessages(selectedConversationId)
  }

  const applyReadReceipt = (receipt: ConversationReadReceiptDTO) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === receipt.conversationId
          ? {
              ...conversation,
              shopLastReadMessageId: receipt.shopLastReadMessageId,
              userLastReadMessageId: receipt.userLastReadMessageId,
              unreadCount: receipt.readerType === "SHOP" ? 0 : conversation.unreadCount,
            }
          : conversation
      )
    )
  }

  const markConversationAsRead = (conversation: ConversationDTO) => {
    const conversationMessages = messagesByConversation[conversation.id]
    if (conversationMessages === undefined) return

    const latestMessageId = getConversationLatestMessageId(conversation, conversationMessages)
    if (!latestMessageId) return

    const alreadyRead = (conversation.shopLastReadMessageId ?? 0) >= latestMessageId && (conversation.unreadCount ?? 0) === 0
    if (alreadyRead) return

    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              unreadCount: 0,
              shopLastReadMessageId: latestMessageId,
            }
          : item
      )
    )

    if (syncedReadByConversationRef.current[conversation.id] === latestMessageId) return
    syncedReadByConversationRef.current[conversation.id] = latestMessageId

    markShopConversationRead(conversation.id, { lastReadMessageId: latestMessageId }).then((receipt) => {
      applyReadReceipt(receipt)
      clearChatNotificationByConversationLocal(conversation.id)
    }).catch((error) => {
      console.error("[CHAT READ]", error)
    })
  }

  useEffect(() => {
    loadChatData()
  }, [])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId
  }, [selectedConversationId])

  useEffect(() => {
    if (requestedConversationId === null || selectedConversationId === requestedConversationId) return
    const hasRequestedConversation = conversationViews.some((item) => item.conversation.id === requestedConversationId)
    if (hasRequestedConversation) {
      setSelectedConversationId(requestedConversationId)
    }
  }, [conversationViews, requestedConversationId, selectedConversationId])

  useEffect(() => {
    if (
      selectedConversationId === null ||
      requestedConversationId !== null ||
      searchParams.get("conversationId") === String(selectedConversationId)
    ) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set("conversationId", String(selectedConversationId))
    setSearchParams(nextSearchParams, { replace: true })
  }, [requestedConversationId, searchParams, selectedConversationId, setSearchParams])

  useEffect(() => {
    if (
      selectedConversationId === null ||
      messagesByConversation[selectedConversationId] !== undefined ||
      messagePaginationByConversation[selectedConversationId]?.loadingInitial
    ) {
      return
    }
    loadConversationMessages(selectedConversationId)
  }, [selectedConversationId, messagesByConversation, messagePaginationByConversation])

  useEffect(() => {
    if (!selectedView) return
    markConversationAsRead(selectedView.conversation)
  }, [selectedView?.conversation.id, selectedView?.conversation.lastMessageId, selectedMessages.length])

  useEffect(() => {
    if (!selectedView || selectedMessages.length === 0 || selectedConversationUnreadNotificationIds.length === 0) return
    markChatNotificationsRead(selectedView.conversation.id, selectedConversationUnreadNotificationIds)
  }, [selectedView?.conversation.id, selectedMessages.length, selectedConversationUnreadNotificationIds])

  const previousLoadingInitialRef = useRef<boolean>(true)

  useEffect(() => {
    const isNewConversation = previousSelectedConversationIdRef.current !== selectedConversationId
    const latestMessageChanged = previousSelectedLastMessageIdRef.current !== selectedLastMessageId
    const finishedInitialLoad = previousLoadingInitialRef.current === true && selectedPagination?.loadingInitial === false

    if (isNewConversation || latestMessageChanged || finishedInitialLoad) {
      // Use requestAnimationFrame to ensure React has updated the DOM
      window.requestAnimationFrame(() => {
        const scrollContainer = messagesScrollRef.current
        if (!scrollContainer) return

        // Instant scroll if it's a new conversation or we just finished loading it
        const shouldInstantScroll = isNewConversation || finishedInitialLoad
        
        if (shouldInstantScroll) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        } else {
          // Smooth scroll for new messages in the same conversation
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth"
          })
        }
      })
    }

    previousSelectedConversationIdRef.current = selectedConversationId
    previousSelectedLastMessageIdRef.current = selectedLastMessageId
    previousLoadingInitialRef.current = selectedPagination?.loadingInitial ?? false
  }, [selectedConversationId, selectedLastMessageId, selectedPagination?.loadingInitial])

  useEffect(() => {
    if (!currentShopId) return undefined

    const socket = createShopChatSocket(
      currentShopId,
      (message) => {
        const knownConversation = conversationsRef.current.some((conversation) => conversation.id === message.conversationId)
        if (!knownConversation) {
          void loadChatData(false)
          return
        }

        setMessagesByConversation((current) => {
          const currentMessages = current[message.conversationId]
          if (!currentMessages) return current

          return {
            ...current,
            [message.conversationId]: appendMessageIfMissing(currentMessages, message),
          }
        })

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === message.conversationId
              ? syncConversationWithMessage(conversation, message, selectedConversationIdRef.current)
              : conversation
          )
        )
      },
      {
        onRead: applyReadReceipt,
        onError: (error) => {
          console.error("[CHAT SOCKET]", error)
        },
      }
    )

    return () => {
      socket.disconnect()
    }
  }, [currentShopId])

  useEffect(() => {
    if (selectedConversationId === null) return undefined

    const socket = createConversationReadSocket(selectedConversationId, applyReadReceipt, {
      onError: (error) => {
        console.error("[CHAT READ SOCKET]", error)
      },
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedConversationId])

  const sendMessage = async () => {
    const body = messageDraft.trim()
    if (!body || !selectedView || sending) return

    setSending(true)
    try {
      const savedMessage = await sendConversationMessage(selectedView.conversation.id, {
        senderType: "SHOP",
        ...(user?.id ? { senderUserId: user.id } : {}),
        body,
      })
      setMessagesByConversation((current) => ({
        ...current,
        [selectedView.conversation.id]: appendMessageIfMissing(current[selectedView.conversation.id] ?? [], savedMessage),
      }))
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedView.conversation.id
            ? syncConversationWithMessage(conversation, savedMessage, selectedConversationIdRef.current)
            : conversation
        )
      )
      setMessageDraft("")
    } catch (error) {
      notify.error(getErrorMessage(error, "Không gửi được tin nhắn."))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <aside className="flex w-[22rem] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="shrink-0 border-b border-slate-100 px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="m-0 text-xl font-bold text-slate-950">Đoạn chat</h1>
            <div className="flex items-center gap-1.5">
              <Button type="button" icon="pi pi-refresh" rounded text className="!h-9 !w-9 !text-slate-600" onClick={() => void loadChatData()} />
              <Button type="button" icon="pi pi-pencil" rounded text className="!h-9 !w-9 !text-slate-600" />
            </div>
          </div>

          <div className="flex h-9 items-center gap-2 rounded-full bg-slate-100 px-3 text-slate-500">
            <i className="pi pi-search text-sm" />
            <InputText
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm trên Pawly"
              className="!w-full !border-0 !bg-transparent !p-0 !text-sm !shadow-none focus:!shadow-none"
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveConversationFilter("all")
                setPinnedUnreadConversationId(null)
              }}
              className={`rounded-full border-0 px-3 py-1.5 text-xs transition ${
                activeConversationFilter === "all"
                  ? "bg-[#e8f1ff] font-bold text-[#214388]"
                  : "bg-transparent font-semibold text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setActiveConversationFilter("unread")}
              className={`rounded-full border-0 px-3 py-1.5 text-xs transition ${
                activeConversationFilter === "unread"
                  ? "bg-[#e8f1ff] font-bold text-[#214388]"
                  : "bg-transparent font-semibold text-slate-600 hover:bg-slate-100"
              }`}
            >
              Chưa đọc
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <ProgressSpinner className="!h-9 !w-9" strokeWidth="4" />
            </div>
          ) : filteredConversationViews.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <i className="pi pi-comments mb-3 text-3xl text-slate-300" />
              <p className="m-0 text-sm font-semibold text-slate-700">Chưa có cuộc trò chuyện</p>
              <p className="m-0 mt-1 text-xs text-slate-400">Tin nhắn từ người dùng sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            filteredConversationViews.map((item) => {
              const name = getChatUserName(item.conversation)
              const active = selectedView?.conversation.id === item.conversation.id
              return (
                  <button
                    key={item.conversation.id}
                    type="button"
                    onClick={() => selectConversation(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition ${
                      active ? "bg-[#eef3fb]" : "hover:bg-slate-50"
                    }`}
                >
                  <AvatarChip name={name} avatarUrl={getChatUserAvatarUrl(item.conversation)} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`m-0 truncate text-sm ${item.unreadCount > 0 ? "font-bold text-slate-950" : "font-semibold text-slate-900"}`}>
                        {name}
                      </p>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatChatTime(getConversationTime(item.conversation, item.lastMessage))}
                      </span>
                    </div>
                    <p className={`m-0 mt-0.5 truncate text-xs ${item.unreadCount > 0 ? "font-bold text-slate-800" : "text-slate-500"}`}>
                      {getConversationPreview(item.conversation, item.lastMessage)}
                    </p>
                  </div>
                  {item.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#214388] px-1.5 text-[10px] font-bold text-white">
                      {item.unreadCount}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        {selectedView ? (
          <>
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
              <div className="flex min-w-0 items-center gap-3">
                <AvatarChip name={getChatUserName(selectedView.conversation)} avatarUrl={getChatUserAvatarUrl(selectedView.conversation)} size={42} />
                <div className="min-w-0">
                  <h2 className="m-0 truncate text-sm font-bold text-slate-950">{getChatUserName(selectedView.conversation)}</h2>
                  <p className="m-0 truncate text-xs text-slate-500">{getChatUserSubtitle(selectedView.conversation)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#214388]">
                <Button type="button" icon="pi pi-info-circle" rounded text className="!h-9 !w-9 !text-[#214388]" />
              </div>
            </header>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
              <div ref={messagesScrollRef} onScroll={handleMessagesScroll} className="relative flex h-full flex-col overflow-y-auto px-5 py-5">
                {selectedPagination?.loadingOlder && (
                  <div className="mb-2 flex justify-center">
                    <ProgressSpinner className="!h-5 !w-5" strokeWidth="5" />
                  </div>
                )}

                {!selectedPagination?.hasNext && (
                  <div className="mx-auto mb-3 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500">
                    {formatDateTimeViVN(selectedView.conversation.createdAt, "Cuộc trò chuyện")}
                  </div>
                )}

                {selectedPagination?.loadingInitial && (
                  <div className="flex flex-1 items-center justify-center">
                    <ProgressSpinner className="!h-8 !w-8" strokeWidth="4" />
                  </div>
                )}

                {!selectedPagination?.loadingInitial && selectedMessages.map((message, index) => {
                  const fromShop = message.senderType === "SHOP"
                  const previousMessage = selectedMessages[index - 1]
                  const nextMessage = selectedMessages[index + 1]
                  const groupedWithPrevious = isGroupedMessage(message, previousMessage)
                  const groupedWithNext = isGroupedMessage(message, nextMessage)
                  const showAvatar = !fromShop && !groupedWithNext
                  const showReadReceipt = fromShop && message.id === userReadMessageId
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${groupedWithPrevious ? "mt-1" : "mt-3"} ${
                        fromShop ? "items-end justify-end" : "items-end justify-start"
                      }`}
                    >
                      {!fromShop && showAvatar && (
                        <AvatarChip
                          name={getChatUserName(selectedView.conversation)}
                          avatarUrl={getChatUserAvatarUrl(selectedView.conversation)}
                          size={28}
                        />
                      )}
                      {!fromShop && !showAvatar && <div className="h-7 w-7 shrink-0" />}
                      <div className={`max-w-[62%] ${fromShop ? "items-end" : "items-start"} flex flex-col`}>
                        <div
                          title={formatChatTime(message.createdAt)}
                          className={`${getMessageBubbleRadius(fromShop, groupedWithPrevious, groupedWithNext)} px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                            fromShop ? "bg-[#214388] text-white" : "bg-[#f0f0f0] text-slate-950"
                          }`}
                        >
                          {message.body}
                        </div>
                        {showReadReceipt && (
                          <div className="mt-1 flex justify-end pr-0.5">
                            <AvatarChip
                              name={getChatUserName(selectedView.conversation)}
                              avatarUrl={getChatUserAvatarUrl(selectedView.conversation)}
                              size={18}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  icon="pi pi-image"
                  text
                  rounded
                  aria-label="Thêm ảnh"
                  className="!h-11 !w-11 !text-[#214388] !shadow-none [&_.p-button-icon]:!text-[1.35rem]"
                />
                <Button
                  type="button"
                  icon="pi pi-face-smile"
                  text
                  rounded
                  aria-label="Chọn emoji"
                  className="!h-11 !w-11 !text-[#214388] !shadow-none [&_.p-button-icon]:!text-[1.35rem]"
                />
                <div className="flex h-14 min-w-0 flex-1 items-center rounded-full bg-[#f1f5f9] px-7 shadow-[inset_0_1px_0_rgba(15,23,42,0.02)]">
                  <InputText
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Aa"
                    className="!w-full !border-0 !bg-transparent !p-0 !text-base !text-slate-800 !shadow-none placeholder:!text-slate-400 focus:!shadow-none"
                  />
                </div>
                <Button
                  type="button"
                  icon="pi pi-send"
                  rounded
                  text
                  loading={sending}
                  disabled={sending}
                  aria-label="Gửi tin nhắn"
                  className="!h-11 !w-11 !text-[#214388] !shadow-none [&_.p-button-icon]:!text-[1.35rem]"
                  onClick={sendMessage}
                />
              </div>
            </footer>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <i className="pi pi-comments mb-4 text-5xl text-slate-300" />
            <p className="m-0 text-lg font-bold text-slate-800">Chọn một cuộc trò chuyện</p>
            <p className="m-0 mt-1 text-sm text-slate-500">Nội dung chat sẽ hiển thị ở đây</p>
          </div>
        )}
      </section>
    </div>
  )
}
