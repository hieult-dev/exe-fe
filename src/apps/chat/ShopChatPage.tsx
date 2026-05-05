import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { ProgressSpinner } from "primereact/progressspinner"
import { getConversationMessages, getConversations, sendConversationMessage } from "@/apps/chat/api/chatApi"
import type { ConversationDTO, MessageDTO } from "@/apps/chat/model"
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

function getCustomerName(conversation: ConversationDTO) {
  return conversation.customerFullName?.trim() || `Khách hàng #${conversation.customerId ?? conversation.id}`
}

function getCustomerSubtitle(conversation: ConversationDTO) {
  return conversation.customerPhone?.trim() || "Chưa có số điện thoại"
}

function getCustomerAvatarUrl(conversation: ConversationDTO) {
  return resolveAvatarUrl(conversation.customerAvatarUrlPreview)
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

export function ShopChatPage() {
  const { user } = useUserStore()
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, MessageDTO[]>>({})
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageDraft, setMessageDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return conversationViews

    return conversationViews.filter(({ conversation, lastMessage }) => {
      const haystack = [
        getCustomerName(conversation),
        conversation.customerPhone,
        conversation.lastMessageBody,
        lastMessage?.body,
        `#${conversation.id}`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [conversationViews, searchQuery])

  const selectedView = useMemo(
    () => conversationViews.find((item) => item.conversation.id === selectedConversationId) ?? filteredConversationViews[0] ?? null,
    [conversationViews, filteredConversationViews, selectedConversationId]
  )

  const selectedMessages = selectedView?.messages ?? []

  const loadChatData = async () => {
    setLoading(true)
    try {
      const conversationList = await getConversations()
      setConversations(conversationList)
      setSelectedConversationId((current) => {
        const hasCurrent = current !== null && conversationList.some((conversation) => conversation.id === current)
        return hasCurrent ? current : conversationList[0]?.id ?? null
      })
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh sách chat."))
    } finally {
      setLoading(false)
    }
  }

  const loadConversationMessages = async (conversationId: number) => {
    try {
      const messages = await getConversationMessages(conversationId)
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: messages,
      }))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được nội dung chat."))
    }
  }

  useEffect(() => {
    loadChatData()
  }, [])

  useEffect(() => {
    if (selectedConversationId === null || messagesByConversation[selectedConversationId]) return
    loadConversationMessages(selectedConversationId)
  }, [selectedConversationId, messagesByConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [selectedConversationId, selectedMessages.length])

  const sendMessage = async () => {
    const body = messageDraft.trim()
    if (!body || !selectedView || sending) return

    setSending(true)
    try {
      const savedMessage = await sendConversationMessage(selectedView.conversation.id, {
        senderType: "SHOP",
        senderUserId: user?.id ?? null,
        body,
      })
      setMessagesByConversation((current) => ({
        ...current,
        [selectedView.conversation.id]: [...(current[selectedView.conversation.id] ?? []), savedMessage],
      }))
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedView.conversation.id
            ? {
                ...conversation,
                lastMessageId: savedMessage.id,
                lastMessageBody: savedMessage.body,
                lastMessageSenderType: savedMessage.senderType,
                lastMessageCreatedAt: savedMessage.createdAt,
                updatedAt: savedMessage.createdAt,
              }
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
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <aside className="flex w-[22rem] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="shrink-0 border-b border-slate-100 px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="m-0 text-xl font-bold text-slate-950">Đoạn chat</h1>
            <div className="flex items-center gap-1.5">
              <Button type="button" icon="pi pi-refresh" rounded text className="!h-9 !w-9 !text-slate-600" onClick={loadChatData} />
              <Button type="button" icon="pi pi-pencil" rounded text className="!h-9 !w-9 !text-slate-600" />
            </div>
          </div>

          <div className="flex h-9 items-center gap-2 rounded-full bg-slate-100 px-3 text-slate-500">
            <i className="pi pi-search text-sm" />
            <InputText
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm trên PetPees"
              className="!w-full !border-0 !bg-transparent !p-0 !text-sm !shadow-none focus:!shadow-none"
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-[#e8f1ff] px-3 py-1.5 text-xs font-bold text-[#214388]">Tất cả</span>
            <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600">Chưa đọc</span>
            <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600">Khách hàng</span>
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
              <p className="m-0 mt-1 text-xs text-slate-400">Tin nhắn từ khách sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            filteredConversationViews.map((item) => {
              const name = getCustomerName(item.conversation)
              const active = selectedView?.conversation.id === item.conversation.id
              return (
                <button
                  key={item.conversation.id}
                  type="button"
                  onClick={() => setSelectedConversationId(item.conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition ${
                    active ? "bg-[#eef3fb]" : "hover:bg-slate-50"
                  }`}
                >
                  <AvatarChip name={name} avatarUrl={getCustomerAvatarUrl(item.conversation)} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="m-0 truncate text-sm font-bold text-slate-900">{name}</p>
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
                <AvatarChip name={getCustomerName(selectedView.conversation)} avatarUrl={getCustomerAvatarUrl(selectedView.conversation)} size={42} />
                <div className="min-w-0">
                  <h2 className="m-0 truncate text-sm font-bold text-slate-950">{getCustomerName(selectedView.conversation)}</h2>
                  <p className="m-0 truncate text-xs text-slate-500">{getCustomerSubtitle(selectedView.conversation)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#214388]">
                <Button type="button" icon="pi pi-info-circle" rounded text className="!h-9 !w-9 !text-[#214388]" />
              </div>
            </header>

            <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
              <div className="relative flex h-full flex-col gap-2 overflow-y-auto px-5 py-5">
                <div className="mx-auto mb-3 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500">
                  {formatDateTimeViVN(selectedView.conversation.createdAt, "Cuộc trò chuyện")}
                </div>

                {selectedMessages.map((message) => {
                  const fromShop = message.senderType === "SHOP"
                  return (
                    <div key={message.id} className={`flex gap-2 ${fromShop ? "items-end justify-end" : "items-center justify-start"}`}>
                      {!fromShop && (
                        <AvatarChip
                          name={getCustomerName(selectedView.conversation)}
                          avatarUrl={getCustomerAvatarUrl(selectedView.conversation)}
                          size={28}
                        />
                      )}
                      <div className={`group max-w-[62%] ${fromShop ? "items-end" : "items-start"} flex flex-col`}>
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                            fromShop
                              ? "rounded-br-md bg-[#214388] text-white"
                              : "rounded-bl-md bg-slate-100 text-slate-900"
                          }`}
                        >
                          {message.body}
                        </div>
                        <span className="mt-1 text-[10px] font-medium text-slate-400 opacity-0 transition group-hover:opacity-100">
                          {formatChatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-100 bg-white px-3 py-3">
              <div className="flex items-center gap-2">
                <Button type="button" icon="pi pi-microphone" text rounded className="!h-9 !w-9 !text-[#214388]" />
                <Button type="button" icon="pi pi-image" text rounded className="!h-9 !w-9 !text-[#214388]" />
                <Button type="button" icon="pi pi-face-smile" text rounded className="!h-9 !w-9 !text-[#214388]" />
                <div className="flex h-10 min-w-0 flex-1 items-center rounded-full bg-slate-100 px-4">
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
                    className="!w-full !border-0 !bg-transparent !p-0 !text-sm !text-slate-800 !shadow-none focus:!shadow-none"
                  />
                </div>
                <Button
                  type="button"
                  icon={messageDraft.trim() ? "pi pi-send" : "pi pi-heart-fill"}
                  rounded
                  text
                  loading={sending}
                  disabled={sending || !messageDraft.trim()}
                  className="!h-9 !w-9 !text-[#214388]"
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
