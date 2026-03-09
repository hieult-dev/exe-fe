const notifications = [
  {
    id: "n1",
    title: "Đơn hàng đang được xử lý",
    message: "Shop PETPEEs Mall đã xác nhận đơn hàng DH-102931.",
    time: "2 phút trước",
  },
  {
    id: "n2",
    title: "Voucher mới dành cho bạn",
    message: "Nhận ngay mã PETPEES30 giảm đến 30k cho đơn từ 299k.",
    time: "1 giờ trước",
  },
  {
    id: "n3",
    title: "Thông báo từ spa",
    message: "Lịch hẹn grooming của bạn sẽ bắt đầu lúc 15:00 hôm nay.",
    time: "Hôm nay",
  },
]

export function NotificationsPage() {
  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Thông báo</h1>
        <p className="mt-1 text-sm text-slate-500">Cập nhật đơn hàng, khuyến mãi và lịch đặt dịch vụ.</p>
      </div>

      <div className="space-y-3 pt-4">
        {notifications.map((item) => (
          <article key={item.id} className="rounded-sm border border-[#efefef] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-800">{item.title}</h2>
              <span className="text-xs text-slate-500">{item.time}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.message}</p>
          </article>
        ))}
      </div>
    </>
  )
}
