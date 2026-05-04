import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Tag } from "primereact/tag"
import type { BookingDTO } from "@/apps/bookings/model"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"

type StaffBookingCardProps = {
  booking: BookingDTO
  selected: boolean
  onSelect: (booking: BookingDTO) => void
}

export function StaffBookingCard({ booking, selected, onSelect }: StaffBookingCardProps) {
  const firstItems = booking.items.slice(0, 2)

  return (
    <Card
      className={`h-full !rounded-lg !border !bg-white !shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${
        selected ? "!border-[#214388]" : "!border-slate-100"
      }`}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex min-w-0 items-center gap-2">
              <Tag value="Booking" severity="info" className="!h-6 !rounded-md !px-2 !py-0 !text-[11px] !font-semibold" />
              <span className="min-w-0 truncate font-mono text-xs font-semibold text-[#214388]">{booking.bookingCode}</span>
            </div>
            <h3 className="m-0 truncate text-sm font-semibold text-slate-800">{booking.customerName}</h3>
            <p className="m-0 mt-1 truncate text-xs text-slate-500">{booking.customerPhone}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="m-0 text-sm font-bold text-[#214388]">{formatCurrencyVND(booking.totalAmount)}</p>
            <p className="m-0 mt-1 text-xs text-slate-500">{formatDateTimeViVN(booking.startAt || booking.time)}</p>
          </div>
        </div>

        <div className="min-h-[48px] space-y-1 text-xs text-slate-500">
          {firstItems.map((item, index) => (
            <div key={`${item.refId ?? item.id}-${index}`} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">{item.name}</span>
              <span className="shrink-0">x{item.quantity}</span>
            </div>
          ))}
          {booking.items.length > 2 && <p className="m-0 text-slate-400">+{booking.items.length - 2} dịch vụ khác</p>}
          {booking.items.length === 0 && <p className="m-0 italic text-slate-400">Chưa có dịch vụ</p>}
        </div>

        <Button
          type="button"
          label={selected ? "Đã chọn" : "Chọn"}
          icon={selected ? "pi pi-check" : "pi pi-plus"}
          size="small"
          className="mt-auto !justify-center !rounded-lg"
          outlined={!selected}
          onClick={() => onSelect(booking)}
        />
      </div>
    </Card>
  )
}
