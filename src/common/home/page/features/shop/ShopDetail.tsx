import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Star, MapPin, Phone, Clock, MessageSquare, ShieldCheck, ShoppingCart, Filter, Search } from "lucide-react"
import { mockSpas, mockProducts } from "@/common/utils/mock-data"
import { ProductCard } from "./ProductCard"

export function ShopDetail() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const shop = mockSpas.find(s => s.id === shopId)
  const [activeTab, setActiveTab] = useState<"all" | "service" | "product">("all")

  if (!shop) return <div className="p-10 text-center">Shop không tồn tại</div>

  const shopProducts = mockProducts.filter(p => p.spaId === shop.id)
  const filteredProducts = shopProducts.filter(p => {
    if (activeTab === "all") return true
    if (activeTab === "service") return p.category === "Spa" || p.category === "Thú y"
    return p.category !== "Spa" && p.category !== "Thú y"
  })

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Shop Header Banner - Full Width */}
      <div className="relative h-[300px] md:h-[500px] bg-slate-900 overflow-hidden">
        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Shop Info Section */}
      <div className="bg-white border-b border-slate-100 shadow-sm relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 -mt-20 md:-mt-32 pb-8">
            {/* Shop Avatar */}
            <div className="h-32 w-32 md:h-48 md:w-48 rounded-[2.5rem] border-[6px] border-white p-1 bg-white shrink-0 shadow-2xl overflow-hidden group">
              <img src={shop.image} alt={shop.name} className="h-full w-full object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-110" />
            </div>

            {/* Shop Profile Detail */}
            <div className="flex-1 space-y-5 text-center md:text-left pb-2">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                  {shop.name}
                  <ShieldCheck className="h-7 w-7 text-emerald-500 fill-emerald-500/10" />
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Hoạt động 5 phút trước</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button 
                  onClick={() => navigate('/messages')}
                  className="px-8 py-3 bg-slate-900 text-white text-[13px] font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-2 group"
                >
                  <MessageSquare className="h-4 w-4 transition-transform group-hover:-rotate-12" /> Chát ngay
                </button>
                <button className="px-8 py-3 bg-primary text-white text-[13px] font-black rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-2 group">
                  Theo dõi
                </button>
              </div>
            </div>

            {/* Shop Stats Grid - Desktop Right side */}
            <div className="hidden lg:grid grid-cols-2 gap-x-12 gap-y-4 pb-2 border-l border-slate-100 pl-10">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Đánh giá shop</div>
                  <div className="text-sm font-black text-slate-700">{shop.rating} <span className="text-slate-400 font-medium font-sans">({shop.reviews})</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Giờ mở cửa</div>
                  <div className="text-sm font-black text-slate-700">{shop.hours}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4 w-4 text-emerald-500" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Sản phẩm</div>
                  <div className="text-sm font-black text-slate-700">{shopProducts.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-rose-500" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hotline</div>
                  <div className="text-sm font-black text-slate-700">{shop.phone}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Bar & Mobile Stats Grid */}
          <div className="py-5 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-3 max-w-2xl px-2">
              <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <MapPin className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Địa chỉ chi tiết</div>
                <div className="text-sm font-bold text-slate-600 leading-snug">{shop.address}</div>
              </div>
            </div>

            {/* Mobile/Tablet Stats Grid */}
            <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-6 px-2">
              {/* Symmetrical to Desktop version but for smaller screens */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Đánh giá</div>
                <div className="text-xs font-black text-slate-700">{shop.rating} ({shop.reviews})</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Sản phẩm</div>
                <div className="text-xs font-black text-slate-700">{shopProducts.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Mở cửa</div>
                <div className="text-xs font-black text-slate-700">{shop.hours}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Hotline</div>
                <div className="text-xs font-black text-slate-700">{shop.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm sticky top-24">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                <Filter className="h-4 w-4 text-primary" /> Danh mục dịch vụ
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between group ${activeTab === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Tất cả sản phẩm
                  {activeTab === 'all' && <ShieldCheck className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setActiveTab("service")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between group ${activeTab === 'service' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Spa & Thú y
                  {activeTab === 'service' && <ShieldCheck className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setActiveTab("product")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between group ${activeTab === 'product' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Hàng tiêu dùng
                  {activeTab === 'product' && <ShieldCheck className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-2 px-1">TÌM KIẾM TRONG SHOP</div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-primary transition group">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Cát vệ sinh..."
                    className="bg-transparent border-none text-xs focus:ring-0 w-full p-0 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 space-y-8">
            <div className="flex items-end justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                  {activeTab === 'all' ? 'Toàn bộ cửa hàng' : activeTab === 'service' ? 'Dịch vụ chuyên biệt' : 'Sản phẩm nổi bật'}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  {filteredProducts.length} kết quả được tìm thấy
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAction={() => { }}
                    onCardClick={(item) => {
                      if (item.category === 'Spa' || item.category === 'Thú y') {
                        navigate(`/booking?productId=${item.id}`)
                      } else {
                        navigate(`/products/${item.id}`)
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 py-32 text-center shadow-sm">
                <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-slate-600 font-black text-lg">Chưa có kết quả!</p>
                <p className="text-slate-400 text-sm mt-1">Danh mục này hiện đang được cập nhật thêm hàng mới.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
