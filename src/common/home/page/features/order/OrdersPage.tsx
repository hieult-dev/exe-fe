import { useMemo, useState } from "react"

const tabs = ["Tất cả", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Đã hoàn thành", "Đã hủy"]

type OrderStatus = "Chờ xác nhận" | "Đang xử lý" | "Đang giao" | "Đã hoàn thành" | "Đã hủy"

type OrderItem = {
  id: string
  shop: string
  productName: string
  createdAt: string
  status: OrderStatus
  total: number
}

const mockOrders: OrderItem[] = [
  {
    id: "DH-102931",
    shop: "PETPEEs Mall",
    productName: "Gói spa cao cấp cho chó",
    createdAt: "08/03/2026",
    status: "Đang xử lý",
    total: 349000,
  },
  {
    id: "DH-102887",
    shop: "Spa House Official",
    productName: "Thức ăn mèo premium",
    createdAt: "06/03/2026",
    status: "Đang giao",
    total: 149000,
  },
  {
    id: "DH-102821",
    shop: "Doggo Planet",
    productName: "Khám tổng quát cho chó",
    createdAt: "02/03/2026",
    status: "Đã hoàn thành",
    total: 259000,
  },
]

const statusClassMap: Record<OrderStatus, string> = {
  "Chờ xác nhận": "text-amber-600",
  "Đang xử lý": "text-blue-600",
  "Đang giao": "text-indigo-600",
  "Đã hoàn thành": "text-emerald-600",
  "Đã hủy": "text-red-600",
}

export function OrdersPage() {
  const [selectedTab, setSelectedTab] = useState("Tất cả")

  const filteredOrders = useMemo(() => {
    if (selectedTab === "Tất cả") {
      return mockOrders
    }
    return mockOrders.filter((order) => order.status === selectedTab)
  }, [selectedTab])

  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Đơn mua</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái đơn hàng của bạn.</p>
      </div>

      <div className="pt-4">
        <div className="rounded-sm border border-[#efefef]">
          <div className="flex overflow-x-auto border-b border-[#efefef]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm ${
                  selectedTab === tab
                    ? "border-[#ee4d2d] font-semibold text-[#ee4d2d]"
                    : "border-transparent text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-4">
            {filteredOrders.length === 0 ? (
              <p className="py-10 text-center text-slate-500">Không có đơn hàng nào ở trạng thái này.</p>
            ) : (
              filteredOrders.map((order) => (
                <article key={order.id} className="rounded-sm border border-[#efefef] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5f5f5] pb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{order.shop}</p>
                      <p className="text-xs text-slate-500">Mã đơn: {order.id}</p>
                    </div>
                    <p className={`text-sm font-semibold ${statusClassMap[order.status]}`}>{order.status}</p>
                  </div>

                  <div className="py-3">
                    <p className="text-sm text-slate-700">{order.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">Ngày tạo: {order.createdAt}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f5f5f5] pt-3">
                    <p className="text-sm text-slate-500">Tổng thanh toán</p>
                    <p className="text-lg font-semibold text-[#ee4d2d]">{order.total.toLocaleString()}đ</p>
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
