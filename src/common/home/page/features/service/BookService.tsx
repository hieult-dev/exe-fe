import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Phone, Clock, MapPin } from "lucide-react"
import { mockSpas } from "@/common/utils/mock-data"

const TIME_SLOTS = [
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30", "19:45",
  "20:00", "20:15", "20:30", "20:45",
  "21:00", "21:15", "21:30", "21:45",
  "22:00", "22:15", "22:30", "22:45",
  "23:00", "23:15", "23:30", "23:45",
]

export function BookService() {
  const navigate = useNavigate()
  const location = useLocation()
  const onBack = () => {
    navigate(`/products${location.search}`)
  }
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [totalGuests, setTotalGuests] = useState("1")
  const [selectedSpa, setSelectedSpa] = useState(mockSpas[0])
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [discount] = useState(0)

  const servicePrice = selectedService ? 500000 : 0
  const totalPrice = servicePrice - discount

  const spa = selectedSpa

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Đặt lịch dịch vụ</h2>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full px-5 py-2 border border-border text-sm hover:bg-muted/60 transition"
            >
              Quay lai
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Quý khách vui lòng biết thông tin</h3>
                <p className="text-sm text-muted-foreground">(*) Vui lòng nhập thông tin bắt buộc</p>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Họ và tên *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Họ và tên khách hàng"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Tổng số khách</label>
                  <input
                    type="number"
                    value={totalGuests}
                    onChange={(e) => setTotalGuests(e.target.value)}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              {/* Service Info */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-semibold">Thông tin dịch vụ</h4>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Chọn chi nhánh *</label>
                  <div className="space-y-2">
                    {mockSpas.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSpa(s)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition ${
                          selectedSpa.id === s.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-sm text-muted-foreground">{s.address}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Dịch vụ *</label>
                  <div className="space-y-2">
                    {spa.services.map((service) => (
                      <button
                        key={service}
                        onClick={() => setSelectedService(service)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition ${
                          selectedService === service
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Ngày đặt lịch *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="font-semibold">Chọn khung giờ dịch vụ *</h4>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg border text-sm transition ${
                        selectedTime === time
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90 transition">
                Đặt lịch
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Spa Info */}
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold">{spa.name}</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Hotline</div>
                    <div className="text-sm text-muted-foreground">{spa.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Giờ mở cửa</div>
                    <div className="text-sm text-muted-foreground">{spa.hours}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Địa chỉ</div>
                    <div className="text-sm text-muted-foreground">{spa.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <h4 className="font-semibold">Dịch vụ ({selectedService || "Chưa chọn"})</h4>

              {selectedService && (
                <>
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-semibold">{servicePrice.toLocaleString()}đ</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span className="text-muted-foreground">Giảm giá</span>
                        <span className="font-semibold">-{discount.toLocaleString()}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Thời gian dự kiến</span>
                      <span>60 phút</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tổng tiền</span>
                    <span className="text-2xl font-bold text-primary">
                      {totalPrice.toLocaleString()}đ
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Vui lòng nhân nút "Đặt lịch" đồng ý ban đã đồng ý với Chính sách bảo vệ và điều kiện nhân của Easysalon.
                  </p>
                </>
              )}

              {!selectedService && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Vui lòng chọn dịch vụ để xem giá tiền
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
