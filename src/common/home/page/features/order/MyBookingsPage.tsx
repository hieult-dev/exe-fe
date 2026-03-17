import { useMemo, useState } from "react"

const tabs = ["Tất cả", "Sắp tới", "Đã hoàn thành", "Đã hủy"]

type BookingStatus = "Chờ xác nhận" | "Đã xác nhận" | "Đang thực hiện" | "Hoàn thành" | "Từ chối" | "Khách hủy"

type BookingItem = {
  id: string
  shop: string
  serviceName: string
  petName: string
  bookingDate: string
  bookingTime: string
  createdAt: string
  status: BookingStatus
  total: number
}

const mockBookings: BookingItem[] = [
  {
    id: "BOK-293812",
    shop: "PETPEEs Mall",
    serviceName: "Grooming cao cấp",
    petName: "Milu (Chó)",
    bookingDate: "20/03/2026",
    bookingTime: "09:00",
    createdAt: "17/03/2026",
    status: "Chờ xác nhận",
    total: 350000,
  },
  {
    id: "BOK-293755",
    shop: "Spa House Official",
    serviceName: "Khám bệnh ngoài da",
    petName: "Mimi (Mèo)",
    bookingDate: "21/03/2026",
    bookingTime: "14:30",
    createdAt: "15/03/2026",
    status: "Đã xác nhận",
    total: 200000,
  },
  {
    id: "BOK-292104",
    shop: "Doggo Planet",
    serviceName: "Khám tổng quát",
    petName: "Kiki (Chó)",
    bookingDate: "02/03/2026",
    bookingTime: "10:00",
    createdAt: "28/02/2026",
    status: "Hoàn thành",
    total: 250000,
  },
  {
    id: "BOK-291002",
    shop: "PETPEEs Mall",
    serviceName: "Tỉa lông cơ bản",
    petName: "Bông (Chó)",
    bookingDate: "01/03/2026",
    bookingTime: "16:00",
    createdAt: "25/02/2026",
    status: "Từ chối",
    total: 150000,
  },
]

const statusClassMap: Record<BookingStatus, string> = {
  "Chờ xác nhận": "text-amber-600",
  "Đã xác nhận": "text-sky-600",
  "Đang thực hiện": "text-violet-600",
  "Hoàn thành": "text-emerald-600",
  "Từ chối": "text-rose-600",
  "Khách hủy": "text-slate-600",
}

export function MyBookingsPage() {
  const [selectedTab, setSelectedTab] = useState("Tất cả")

  const filteredBookings = useMemo(() => {
    if (selectedTab === "Tất cả") return mockBookings
    if (selectedTab === "Sắp tới") {
      return mockBookings.filter((b) => ["Chờ xác nhận", "Đã xác nhận", "Đang thực hiện"].includes(b.status))
    }
    if (selectedTab === "Đã hoàn thành") {
      return mockBookings.filter((b) => b.status === "Hoàn thành")
    }
    if (selectedTab === "Đã hủy") {
      return mockBookings.filter((b) => ["Từ chối", "Khách hủy"].includes(b.status))
    }
    return mockBookings
  }, [selectedTab])

  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Lịch dịch vụ</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý các lịch đặt spa, khám bệnh cho thú cưng của bạn.</p>
      </div>

      <div className="pt-4">
        <div className="rounded-sm border border-[#efefef]">
          <div className="flex overflow-x-auto border-b border-[#efefef]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm transition-colors ${
                  selectedTab === tab
                    ? "border-[#ee4d2d] font-semibold text-[#ee4d2d]"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-4 bg-slate-50 min-h-[400px]">
            {filteredBookings.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500">Khộng có lịch hẹn nào ở trạng thái này.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <article key={booking.id} className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5f5f5] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-xl">🏩</div>
                      <div>
                        <p className="text-[15px] font-semibold text-slate-800">{booking.shop}</p>
                        <p className="text-[11px] text-slate-400">Mã đơn: {booking.id}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold uppercase ${statusClassMap[booking.status]}`}>{booking.status}</p>
                  </div>

                  <div className="py-4 grid grid-cols-[1fr,auto]">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{booking.serviceName}</h3>
                      <p className="mt-1 text-sm flex items-center gap-1.5 text-slate-600">
                        <span className="font-medium text-slate-700">{booking.petName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">Thời gian</p>
                      <p className="text-[15px] font-bold text-[#214388]">{booking.bookingTime}</p>
                      <p className="text-xs font-semibold text-[#214388]">{booking.bookingDate}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f5f5f5] pt-3">
                    <p className="text-xs text-slate-400 hidden sm:block">Đặt ngày: {booking.createdAt}</p>
                    <div className="flex items-center justify-end flex-1 gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Tổng thanh toán</p>
                        <p className="text-lg font-bold text-[#ee4d2d] leading-none mt-0.5">{booking.total.toLocaleString()}đ</p>
                      </div>
                      
                      {/* Thao tác tuỳ trạng thái */}
                      {["Chờ xác nhận", "Đã xác nhận"].includes(booking.status) && (
                         <button className="rounded px-4 py-2 border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                           Hủy lịch
                         </button>
                      )}
                      {["Hoàn thành"].includes(booking.status) && (
                         <button className="rounded px-4 py-2 bg-[#ee4d2d] text-sm font-semibold text-white hover:bg-[#d73f22]">
                           Mua lại dịch vụ
                         </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
