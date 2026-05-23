import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Tag } from "primereact/tag"
import type { BookingDTO, BookingLineItemDTO } from "@/apps/bookings/model"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"

type StaffBookingCardProps = {
  booking: BookingDTO
  selected: boolean
  starting: boolean
  onSelect: (booking: BookingDTO) => void
  onStart: (booking: BookingDTO) => void
}

const bookingStatusTagConfig: Partial<Record<BookingDTO["status"], { label: string; className: string }>> = {
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "!bg-sky-50 !text-sky-700",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    className: "!bg-violet-50 !text-violet-700",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "!bg-emerald-50 !text-emerald-700",
  },
}

function getServiceTypeTag(item: BookingLineItemDTO) {
  if (item.itemType !== "SERVICE") return null

  if (item.serviceType === "VETERINARY") {
    return {
      value: "Dịch vụ thú y",
      className: "!bg-emerald-50 !text-emerald-700",
    }
  }

  if (item.serviceType === "GENERAL") {
    return {
      value: "Dịch vụ Spa",
      className: "!bg-sky-50 !text-sky-700",
    }
  }

  return null
}

export function StaffBookingCard({ booking, selected, starting, onSelect, onStart }: StaffBookingCardProps) {
  const firstItems = booking.items.slice(0, 2)
  const customerName = booking.customerFullName || booking.customerName || booking.userFullName || `Khách #${booking.userId ?? booking.id}`
  const customerPhone = booking.customerPhone || booking.userPhone || booking.userEmail || "Chưa có số điện thoại"
  const canStart = booking.status === "CONFIRMED"
  const canPay = booking.status === "IN_PROGRESS"
  const statusTag = bookingStatusTagConfig[booking.status]

  return (
    <Card
      className={`h-full !min-h-[220px] !rounded-lg !border !bg-white !shadow-[0_8px_24px_rgba(15,23,42,0.04)] [&_.p-card-body]:!h-full [&_.p-card-content]:!h-full ${
        selected ? "!border-[#214388]" : "!border-slate-100"
      }`}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <Tag value="Lịch hẹn" severity="info" className="!h-6 !shrink-0 !rounded-md !px-2 !py-0 !text-[11px] !font-semibold" />
              <span className="min-w-0 truncate font-mono text-xs font-semibold text-[#214388]">{booking.bookingCode}</span>
            </div>
            <div className="mt-1 h-6">
              {statusTag && (
                <Tag
                  value={booking.statusLabel || statusTag.label}
                  className={`!h-6 !rounded-md !px-2 !py-0 !text-[11px] !font-semibold ${statusTag.className}`}
                />
              )}
            </div>
            <h3 className="m-0 truncate text-sm font-semibold text-slate-800">{customerName}</h3>
            <p className="m-0 mt-1 truncate text-xs text-slate-500">{customerPhone}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="m-0 text-sm font-bold text-[#214388]">{formatCurrencyVND(booking.totalAmount)}</p>
            <p className="m-0 mt-1 text-xs text-slate-500">{formatDateTimeViVN(booking.startAt || booking.time)}</p>
          </div>
        </div>

        <div className="min-h-[48px] space-y-1 text-xs text-slate-500">
          {firstItems.map((item, index) => {
            const serviceTypeTag = getServiceTypeTag(item)

            return (
              <div key={`${item.refId ?? item.id}-${index}`} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="min-w-0 truncate">{item.name}</span>
                  {serviceTypeTag && (
                    <Tag
                      value={serviceTypeTag.value}
                      className={`shrink-0 !rounded-md !px-1.5 !py-0.5 !text-[10px] !font-semibold ${serviceTypeTag.className}`}
                    />
                  )}
                </div>
                <span className="shrink-0">x{item.quantity}</span>
              </div>
            )
          })}
          {booking.items.length > 2 && <p className="m-0 text-slate-400">+{booking.items.length - 2} dịch vụ khác</p>}
          {booking.items.length === 0 && <p className="m-0 italic text-slate-400">Chưa có dịch vụ</p>}
        </div>

        <div className="mt-auto flex h-9 gap-2">
          {canStart && (
            <Button
              type="button"
              label="Thực hiện"
              icon="pi pi-play"
              size="small"
              loading={starting}
              disabled={starting}
              className="!h-9 !min-w-[6.25rem] !justify-center !rounded-md !border-[#214388] !bg-[#214388] !px-3 !py-0 !text-xs !font-semibold !text-white hover:!border-[#19356a] hover:!bg-[#19356a] disabled:!opacity-70 [&_.p-button-icon]:!mr-1.5 [&_.p-button-icon]:!text-xs [&_.p-button-icon]:!text-white [&_.p-button-label]:!whitespace-nowrap [&_.p-button-label]:!text-white"
              onClick={() => onStart(booking)}
            />
          )}
          <Button
            type="button"
            label="Thanh toán"
            icon={selected ? "pi pi-check" : "pi pi-wallet"}
            size="small"
            className={`!h-9 !flex-1 !justify-center !rounded-md !border-emerald-500 !px-3 !py-0 !text-xs !font-semibold ${
              selected
                ? "!bg-emerald-600 !text-white hover:!bg-emerald-700"
                : "!bg-emerald-500 !text-white hover:!bg-emerald-600"
            } disabled:!cursor-not-allowed disabled:!opacity-45 [&_.p-button-icon]:!mr-1.5 [&_.p-button-icon]:!text-xs [&_.p-button-icon]:!text-white [&_.p-button-label]:!whitespace-nowrap [&_.p-button-label]:!text-white`}
            disabled={!canPay}
            onClick={() => onSelect(booking)}
          />
        </div>
      </div>
    </Card>
  )
}
