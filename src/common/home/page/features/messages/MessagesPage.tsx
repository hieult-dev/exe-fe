import { useState, useRef, useEffect } from "react"
import { Search, Info, Paperclip, Image as ImageIcon, Smile, Send, Check, CheckCheck, MoreHorizontal, ArrowLeft } from "lucide-react"

// Mock Data
const MOCK_CONVERSATIONS = [
  { id: 1, name: "PetSpa Central", avatar: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=200", lastMessage: "Chào bạn, lịch hẹn của bạn đã được xác nhận nhé!", time: "10:30", unread: 2, isOnline: true },
  { id: 2, name: "Happy Tails Clinic", avatar: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200", lastMessage: "Cảm ơn bạn đã sử dụng dịch vụ.", time: "Hôm qua", unread: 0, isOnline: false },
  { id: 3, name: "Meow Kingdom", avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200", lastMessage: "Sản phẩm pate cá ngừ đang có khuyến mãi giảm 20% đấy ạ.", time: "T2", unread: 0, isOnline: true },
  { id: 4, name: "Poodle World", avatar: "https://images.unsplash.com/photo-1537151608804-ea6f117ce366?auto=format&fit=crop&q=80&w=200", lastMessage: "Vâng, size M vẫn còn hàng nha bạn.", time: "T7 tuần trước", unread: 0, isOnline: false },
]

const INITIAL_MESSAGES = [
  { id: 1, sender: "shop", text: "Chào bạn, PetSpa Central xin nghe ạ. Mình có thể giúp gì cho bạn?", time: "10:15", status: "read" },
  { id: 2, sender: "user", text: "Dạ em mới đặt lịch tắm cho pé Corgi nhà em lúc 14:00 chiều nay. Shop xác nhận giúp em với ạ.", time: "10:18", status: "read" },
  { id: 3, sender: "shop", text: "Dạ vâng, bên mình đã nhận được yêu cầu trên hệ thống rồi ạ. Lịch 14:00 chiều nay hoàn toàn trống nhé.", time: "10:25", status: "read" },
  { id: 4, sender: "shop", text: "Bạn nhớ mang bé đến trước 10 phút để bên mình chuẩn bị nha.", time: "10:25", status: "read" },
  { id: 5, sender: "user", text: "Tuyệt quá, em cám ơn shop nhiều ạ!", time: "10:28", status: "read" },
  { id: 6, sender: "shop", text: "Chào bạn, lịch hẹn của bạn đã được xác nhận nhé!", time: "10:30", status: "sent" },
]

export function MessagesPage() {
  const [activeChat, setActiveChat] = useState(MOCK_CONVERSATIONS[0])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Fake shop reply after 1 second
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: "shop",
        text: "Cảm ơn bạn đã phản hồi! Cửa hàng sẽ ghi nhận thông tin này.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "sent"
      }
      setMessages(prev => [...prev, reply])
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white border-t border-slate-200 h-[calc(100vh-80px)] flex w-full overflow-hidden lg:flex-row flex-col">
        
        {/* Left Sidebar - Chat List */}
        <div className={`lg:w-96 w-full flex-shrink-0 flex flex-col border-r border-slate-100 ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tin nhắn</h2>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <MoreHorizontal className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition" />
              <input 
                type="text" 
                placeholder="Tìm kiếm cuộc trò chuyện..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition font-medium text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2">
            {MOCK_CONVERSATIONS.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all mb-1
                  ${activeChat?.id === chat.id ? 'bg-primary/5 border border-primary/10' : 'hover:bg-slate-50 border border-transparent'}
                `}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-bold truncate text-[15px] ${activeChat?.id === chat.id ? 'text-primary' : 'text-slate-800'}`}>{chat.name}</h4>
                    <span className="text-xs font-semibold text-slate-400 shrink-0">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-2 ${chat.unread ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area - Active Chat */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${!activeChat ? 'hidden lg:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-20 px-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button className="lg:hidden w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center" onClick={() => setActiveChat(null as any)}>
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100">
                      <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
                    </div>
                    {activeChat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight">{activeChat.name}</h3>
                    <p className="text-xs font-semibold text-emerald-600">{activeChat.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="text-center">
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Hôm nay</span>
                </div>

                {messages.map((msg, index) => {
                  const isMe = msg.sender === "user"
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].sender !== "shop")

                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-8 shrink-0 flex flex-col justify-end">
                          {showAvatar ? (
                            <img src={activeChat.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] lg:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed relative ${
                            isMe 
                              ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20' 
                              : 'bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 px-1">
                          <span className="text-[11px] font-bold text-slate-400">{msg.time}</span>
                          {isMe && (
                            msg.status === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-sky-500" /> : <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                  <div className="flex items-center gap-1 pb-2 shrink-0">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-center pr-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Nhập tin nhắn của bạn..."
                      className="w-full bg-transparent py-3.5 px-4 outline-none resize-none max-h-32 min-h-[52px] font-medium text-[15px]"
                      rows={1}
                    />
                    <button className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-amber-500 transition">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

                  <button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="w-14 h-[52px] bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition shadow-md shadow-primary/20 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                <Send className="w-10 h-10 text-slate-300 ml-1" />
              </div>
              <p className="font-bold text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
    </div>
  )
}
