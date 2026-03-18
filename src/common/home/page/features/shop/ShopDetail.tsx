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
      {/* Shop Header Banner */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-8">
           <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
             {/* Shop Profile Card */}
             <div className="relative w-full md:w-[400px] shrink-0">
                <div className="bg-slate-900 rounded-2xl overflow-hidden relative h-48 shadow-xl">
                  <img src={shop.image} alt={shop.name} className="w-full h-full object-cover opacity-60 blur-[2px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full border-2 border-white/30 p-1 bg-white shrink-0 shadow-lg">
                        <img src={shop.image} alt={shop.name} className="h-full w-full object-cover rounded-full" />
                      </div>
                      <div>
                        <h1 className="text-xl font-black text-white flex items-center gap-1.5">
                          {shop.name} 
                          <ShieldCheck className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                        </h1>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Hoạt động 5 phút trước</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                       <button className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[12px] font-bold py-2 rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-1.5">
                         <MessageSquare className="h-3.5 w-3.5" /> Chát ngay
                       </button>
                       <button className="flex-1 bg-primary text-white text-[12px] font-bold py-2 rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5">
                         Theo dõi
                       </button>
                    </div>
                  </div>
                </div>
             </div>

             {/* Shop Stats Grid */}
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 flex-1 w-full pt-4 md:pt-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Đánh giá shop</div>
                    <div className="text-sm font-black text-slate-700">{shop.rating} <span className="text-slate-400 font-medium font-sans">({shop.reviews})</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Sản phẩm</div>
                    <div className="text-sm font-black text-slate-700">{shopProducts.length}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Giờ mở cửa</div>
                    <div className="text-sm font-black text-slate-700">{shop.hours}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Hotline</div>
                    <div className="text-sm font-black text-slate-700">{shop.phone}</div>
                  </div>
                </div>

                <div className="col-span-2 lg:col-span-3 flex items-start gap-3 pt-4 border-t border-slate-50">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Địa chỉ chi tiết</div>
                    <div className="text-sm font-bold text-slate-600 leading-snug">{shop.address}</div>
                  </div>
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
                    onAction={() => {}} 
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
