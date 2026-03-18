import { useState, useRef, useEffect } from "react"
import { X, Send, User, Sparkles } from "lucide-react"

export function AIChatPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", content: "Miao! Xin chào sen. Tôi là trợ lý ảo của bạn đây. Hôm nay tôi có thể giúp gì cho boss nhà mình không nào?" }
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleSend = () => {
    if (!message.trim()) return

    const newHistory = [...chatHistory, { role: "user", content: message }]
    setChatHistory(newHistory)
    setMessage("")

    // Simulated AI response
    setTimeout(() => {
      setChatHistory([
        ...newHistory,
        { role: "ai", content: "Cảm ơn bạn đã quan tâm! Hiện tại tôi đang được nâng cấp để hỗ trợ bạn tốt hơn. Bạn có muốn tìm hiểu về dịch vụ spa hay các sản phẩm dinh dưỡng không?" }
      ])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div className={`mb-0 w-[400px] md:w-[500px] h-[650px] md:h-[750px] bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-slate-50 flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-20 pointer-events-none'
        }`}>
        {/* Header - Compact & Clean */}
        <div className="py-4 px-8 bg-gradient-to-br from-[#FF87A0] via-[#FF6B95] to-[#9D68EF] text-white flex items-center justify-between relative overflow-hidden shadow-sm shrink-0">
          <div className="absolute top-[-50%] left-[-20%] h-[200%] w-[100%] bg-white/10 blur-[60px] rotate-45 animate-pulse translate-x-[-50%] pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-inner group">
              <img src="/icon_chatbot.png" alt="AI Icon" className="h-9 w-9 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h4 className="font-black text-[14px] tracking-tight leading-none flex items-center gap-1.5 uppercase">
                PetPee AI Assistant
              </h4>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-black opacity-90 uppercase tracking-[0.1em]">Đang trực tuyến</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10">
            <button onClick={() => setIsOpen(false)} className="h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-90 border border-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Body - Improved Bubble Coverage */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-white">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-4 max-w-[90%] ${chat.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 duration-300 overflow-hidden mt-1 ${chat.role === 'user'
                    ? 'bg-slate-900 border border-slate-800'
                    : 'bg-rose-50 border border-rose-100 p-1.5'
                  }`}>
                  {chat.role === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <img src="/icon_chatbot.png" alt="AI" className="h-full w-full object-contain" />
                  )}
                </div>
                <div className={`p-5 rounded-[2rem] text-[15px] font-semibold leading-relaxed shadow-sm transition-all duration-300 ${chat.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none hover:bg-white hover:border-indigo-100 hover:shadow-indigo-50/20'
                  }`}>
                  {chat.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completely Redesigned Input Area - Unified & Clean */}
        <div className="p-8 bg-white border-t border-slate-50">
          <div className="flex items-center gap-2 mb-4">
             <button className="h-8 px-4 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 hover:bg-pink-50 hover:text-[#FF6B95] hover:border-pink-100 transition shadow-sm grayscale hover:grayscale-0">
               📦 Tra cứu đơn hàng
             </button>
             <button className="h-8 px-4 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100 transition shadow-sm grayscale hover:grayscale-0">
               🛁 Đặt dịch vụ Spa
             </button>
          </div>

          <div className="relative flex items-center bg-slate-100/80 rounded-[2rem] px-6 py-4 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#FF6B95]/5 border-2 border-transparent focus-within:border-[#FF6B95]/10 transition-all duration-500 group shadow-inner">
            <Sparkles className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6B95] mr-4 transition-colors shrink-0" />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Boss muốn hỏi gì sen nào?..."
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 font-bold text-[15px] text-slate-700 placeholder:text-slate-300 h-6"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="ml-4 h-11 px-5 rounded-2xl bg-gradient-to-br from-[#FF87A0] to-[#FF6B95] text-white flex items-center justify-center hover:shadow-[0_8px_25px_rgba(255,107,149,0.4)] disabled:opacity-20 disabled:grayscale transition-all active:scale-90 group/send shrink-0 shadow-lg shadow-pink-100"
            >
              <Send className="h-5 w-5 transition-transform group-hover/send:translate-x-1 group-hover/send:-translate-y-1" />
            </button>
          </div>
          
          <div className="mt-4 text-center">
             <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">PetPee Generative AI v2.5</p>
          </div>
        </div>
      </div>

      {/* Floating Toggle Icon - Hides when Chat is Open */}
      {!isOpen && (
        <div className="relative group/btn pointer-events-auto animate-in fade-in zoom-in duration-700">
          {/* Soft Glow */}
          <div className="absolute inset-[-10px] bg-gradient-to-br from-[#FF87A0] to-[#FF6B95] opacity-20 blur-[30px] rounded-full group-hover/btn:opacity-40 transition-opacity"></div>
          
          <button 
            onClick={() => setIsOpen(true)}
            className="h-24 w-24 flex items-center justify-center transition-all duration-700 hover:scale-110 active:scale-95 relative z-10"
          >
            <img 
              src="/icon_chatbot.png" 
              alt="Toggle Chat" 
              className="h-24 w-24 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover/btn:rotate-6" 
            />
            {/* Notification Pulse */}
            <div className="absolute top-2 right-2 h-6 w-6 bg-indigo-600 border-4 border-white rounded-full flex shadow-xl animate-bounce">
              <span className="h-full w-full rounded-full bg-indigo-600 animate-ping absolute"></span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
