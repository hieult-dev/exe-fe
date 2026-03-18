import { useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Phone, Clock, MapPin, Star, MessageSquare, ThumbsUp, Plus, Bolt, ShieldCheck, ShoppingCart } from "lucide-react"
import { mockSpas, mockProducts, mockReviews, mockUserPets, UserPet } from "@/common/utils/mock-data"
import { AppDialog } from "@/common/component/AppDialog"

const TIME_SLOTS = {
  morning: ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45"],
  afternoon: ["12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45"],
  evening: ["18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45"],
}

export function BookService() {
  const navigate = useNavigate()
  const location = useLocation()
  const onBack = () => {
    navigate(`/products${location.search}`)
  }

  const [searchParams] = useSearchParams()
  const productId = searchParams.get("productId")

  const initialProduct = mockProducts.find(p => p.id === productId)
  const initialSpa = mockSpas.find(s => s.id === initialProduct?.spaId) || mockSpas[0]

  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [totalGuests, setTotalGuests] = useState("1")
  const selectedSpa = initialSpa
  const selectedService = initialProduct?.name || ""
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  // Pet info

  const [showPetModal, setShowPetModal] = useState(false)
  const [selectedUserPet, setSelectedUserPet] = useState<UserPet | null>(null)

  const handleSelectPet = (pet: UserPet) => {
    setSelectedUserPet(pet)

    setShowPetModal(false)
  }

  const [discount] = useState(0)

  // Find reviews for this service/spa
  const relevantReviews = mockReviews.filter(r =>
    initialProduct?.name.toLowerCase().includes("mèo") ? r.comment.toLowerCase().includes("mèo") :
      initialProduct?.name.toLowerCase().includes("chó") ? r.comment.toLowerCase().includes("chó") : true
  )

  const servicePrice = selectedService ? 500000 : 0
  const totalPrice = servicePrice - discount

  const spa = selectedSpa

  const otherServices = mockProducts.filter(p =>
    p.spaId === spa.id &&
    p.id !== productId &&
    (p.category === "Spa" || p.category === "Thú y")
  )

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Bolt className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Xác nhận đặt lịch</h2>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                <span>Thông tin</span>
                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                <span>Dịch vụ</span>
                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                <span className="text-primary">Xác nhận</span>
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="group flex items-center gap-2 rounded-full px-6 py-2.5 border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
          >
            Quay lại
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-8 shadow-sm">
              {/* Customer Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Thông tin khách hàng</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">Số điện thoại *</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">Họ và tên *</label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Họ và tên khách hàng"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tổng số khách</label>
                    <div className="relative group">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="number"
                        value={totalGuests}
                        onChange={(e) => setTotalGuests(e.target.value)}
                        min="1"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Info */}
              <div className="border-t border-slate-100 pt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center animate-pulse">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Thông tin thú cưng</h3>
                  </div>
                  {selectedUserPet && (
                    <button
                      onClick={() => setShowPetModal(true)}
                      className="text-sm font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      Thay đổi
                    </button>
                  )}
                </div>

                {!selectedUserPet ? (
                  <button
                    onClick={() => setShowPetModal(true)}
                    className="w-full group relative overflow-hidden rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                  >
                    <div className="relative z-10 space-y-3">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 transition group-hover:bg-primary/10 group-hover:rotate-12 duration-500">
                        <Plus className="h-8 w-8 text-slate-400 transition group-hover:text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black text-slate-700">Chọn thú cưng của bạn</p>
                        <p className="text-sm font-medium text-slate-400">Chọn từ danh sách để đặt lịch nhanh hơn</p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </button>
                ) : (
                  <div className="group relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-center gap-5">
                      <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-white shadow-md transition-transform group-hover:scale-105 duration-500">
                        <img src={selectedUserPet.image} alt={selectedUserPet.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-black text-slate-800">{selectedUserPet.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-black text-primary border border-primary/10 uppercase tracking-tighter">
                            {selectedUserPet.type}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                          {selectedUserPet.breed} • {selectedUserPet.weight}kg
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="border-t border-slate-100 pt-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Thông tin dịch vụ</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2 items-stretch">
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Dịch vụ đang chọn *</label>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group h-[52px]">
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Bolt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-700 leading-tight truncate text-sm">{selectedService} <span className="text-slate-400 font-medium text-xs">tại</span> {spa.name}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày đặt lịch *</label>
                    <div className="relative group h-[52px]">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="date"
                        value={selectedDate || ""}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-slate-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="border-t border-slate-100 pt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Chọn khung giờ dịch vụ *</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Mở cửa {spa.hours}</span>
                </div>

                <div className="space-y-6">
                  {(Object.entries(TIME_SLOTS) as [keyof typeof TIME_SLOTS, string[]][]).map(([key, slots]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-2 py-0.5 rounded">
                          {key === 'morning' ? 'Buổi Sáng' : key === 'afternoon' ? 'Buổi Chiều' : 'Buổi Tối'}
                        </span>
                        <div className="h-[1px] flex-1 bg-slate-100"></div>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                        {slots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`h-10 rounded-xl text-xs font-black transition-all duration-300 transform active:scale-95 ${selectedTime === time
                              ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10"
                              : "bg-slate-50 border border-slate-100 text-slate-600 hover:border-primary/30 hover:bg-white hover:shadow-sm"
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Spa Info Card */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div
                className="h-40 bg-slate-100 relative group cursor-pointer"
                onClick={() => navigate(`/shop/${spa.id}`)}
              >
                <img
                  src={spa.image}
                  alt={spa.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[13px] font-bold flex items-center gap-1.5 shadow-sm border border-slate-100">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-slate-700">{spa.rating}</span>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h3
                    className="text-xl font-bold text-slate-800 leading-tight cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/shop/${spa.id}`)}
                  >
                    {spa.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {spa.reviews} đánh giá từ cộng đồng
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hotline hỗ trợ</div>
                      <div className="text-[13px] font-bold text-slate-700">{spa.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời gian làm việc</div>
                      <div className="text-[13px] font-bold text-slate-700">{spa.hours}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
                      <MapPin className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ chi tiết</div>
                      <div className="text-[13px] font-bold text-slate-700 leading-tight">{spa.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary Card */}
            <div className="bg-white rounded-2xl border-2 border-primary/10 p-6 space-y-5 sticky top-6 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Chi tiết dịch vụ</h4>
              </div>

              {selectedService ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Tên dịch vụ</span>
                      <span className="font-bold text-slate-800 text-right max-w-[150px] line-clamp-1">{selectedService}</span>
                    </div>
                    {selectedUserPet && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Thú cưng</span>
                        <span className="font-bold text-slate-800">{selectedUserPet.name}</span>
                      </div>
                    )}
                    {(selectedDate || selectedTime) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Thời gian</span>
                        <span className="font-bold text-slate-800 text-right">
                          {selectedTime && `${selectedTime}`}
                          {selectedTime && selectedDate && ", "}
                          {selectedDate && `${selectedDate}`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Đơn giá niêm yết</span>
                      <span className="font-bold text-slate-800">{servicePrice.toLocaleString()}đ</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm text-rose-500">
                        <span className="font-medium">Ưu đãi giảm giá</span>
                        <span className="font-bold">-{discount.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-50 pt-2">
                      <span>Thời gian thực hiện</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 60 phút</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                    <span className="font-bold text-slate-700">Thành tiền</span>
                    <span className="text-2xl font-black text-primary">
                      {totalPrice.toLocaleString()}đ
                    </span>
                  </div>

                  <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 group mt-4">
                    <ShoppingCart className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    Xác nhận đặt lịch ngay
                  </button>

                  <div className="flex gap-2 p-3 rounded-xl bg-amber-50 group border border-amber-100 transition-colors hover:bg-amber-100/50 mt-4">
                    <div className="shrink-0 pt-0.5">
                      <Bolt className="h-3 w-3 text-amber-600" />
                    </div>
                    <p className="text-[10px] text-amber-700 leading-normal font-medium">
                      Vui lòng nhấn nút <b>Xác nhận</b> để đồng ý với Chính sách & Điều khoản của PETPEEs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                    <Star className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">
                    Vui lòng chọn dịch vụ để<br />xem thông tin chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-8 mt-12">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Đánh giá dịch vụ</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(initialProduct?.rating || 4.5) ? "fill-yellow-500" : "text-slate-300"}`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-slate-700">{initialProduct?.rating}</span>
                <span className="text-sm text-muted-foreground">({relevantReviews.length} đánh giá)</span>
              </div>
            </div>
            <button className="bg-white border border-emerald-500 text-emerald-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-emerald-50 transition shadow-sm">
              Viết đánh giá
            </button>
          </div>

          <div className="grid gap-6">
            {relevantReviews.map((review) => (
              <div key={review.id} className="space-y-4 pb-6 border-b border-slate-100 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {review.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{review.customerName}</div>
                      <div className="text-xs text-muted-foreground">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                <button className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition">
                  <ThumbsUp className="h-3 w-3" />
                  Hữu ích ({review.helpful})
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Other Services Section */}
        {otherServices.length > 0 && (
          <div className="space-y-6 mt-12 pb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">Các dịch vụ khác của {spa.name}</h3>
              <button
                onClick={() => navigate("/products")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherServices.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    navigate(`/booking?productId=${product.id}`)
                    window.scrollTo(0, 0)
                  }}
                  className="overflow-hidden rounded-2xl border border-[#f1f1f1] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full flex flex-col group cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="h-[80px] w-[80px] shrink-0 overflow-hidden rounded-xl bg-[#fafafa]">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 space-y-1 flex flex-col justify-center">
                      <h4 className="line-clamp-2 text-[14px] font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="inline-block rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-100">
                          {product.category}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {product.rating}
                          </div>
                        )}
                      </div>
                      <p className="text-[15px] font-bold text-primary">{product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AppDialog
          open={showPetModal}
          onClose={() => setShowPetModal(false)}
          title="Chọn thú cưng"
          description="Vui lòng chọn thú cưng bạn muốn đặt dịch vụ"
        >
          <div className="grid gap-3 py-2">
            {mockUserPets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => handleSelectPet(pet)}
                className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-left group"
              >
                <div className="h-14 w-14 rounded-lg bg-slate-100 overflow-hidden border border-border">
                  <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800">{pet.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {pet.type} • {pet.breed} • {pet.weight}kg
                  </div>
                </div>
              </button>
            ))}
            <button className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition text-left mt-2">
              <div className="h-14 w-14 rounded-lg bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 text-slate-400">
                <Plus className="h-6 w-6" />
              </div>
              <div className="font-semibold text-slate-600">Thêm thú cưng mới</div>
            </button>
          </div>
        </AppDialog>
      </div>
    </section>
  )
}
