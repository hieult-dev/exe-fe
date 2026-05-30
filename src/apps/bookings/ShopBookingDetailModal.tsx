import { useEffect, useState, type ReactNode } from "react"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { ProgressSpinner } from "primereact/progressspinner"
import { Tag } from "primereact/tag"
import { getBookingById } from "@/apps/bookings/api/bookingApi"
import type { BookingDTO, BookingItemType, BookingStatus } from "@/apps/bookings/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận", bg: "bg-sky-100", text: "text-sky-700" },
  IN_PROGRESS: { label: "Đang thực hiện", bg: "bg-violet-100", text: "text-violet-700" },
  COMPLETED: { label: "Hoàn thành", bg: "bg-emerald-100", text: "text-emerald-700" },
  REJECTED: { label: "Từ chối", bg: "bg-rose-100", text: "text-rose-700" },
  CANCELLED: { label: "Khách hủy", bg: "bg-slate-100", text: "text-slate-600" },
}

const STATUS_FLOW: Partial<Record<BookingStatus, BookingStatus>> = {
  CONFIRMED: "IN_PROGRESS",
}

type ShopBookingDetailModalProps = {
  visible: boolean
  booking: BookingDTO | null
  onHide: () => void
  onAccept: (id: number) => void | Promise<void>
  onReject: (id: number) => void
  onNextStatus: (booking: BookingDTO) => boolean | Promise<boolean>
  onLoaded?: (booking: BookingDTO) => void
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-[#70829a]">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function getBookingCustomerName(booking: BookingDTO) {
  return booking.customerFullName || booking.customerName || booking.userFullName || (booking.userId ? `Khách #${booking.userId}` : "---")
}

function getBookingCustomerContact(booking: BookingDTO) {
  return booking.customerPhone || booking.userPhone || booking.userEmail || "---"
}

function getBookingItemMeta(itemType: BookingItemType) {
  if (itemType === "PRODUCT") {
    return {
      label: "Sản phẩm",
      icon: "pi pi-box",
      rowClass: "bg-sky-50/70",
      tagClass: "!bg-sky-100 !text-sky-700",
    }
  }

  if (itemType === "PACKAGE_REDEEM") {
    return {
      label: "Gói",
      icon: "pi pi-ticket",
      rowClass: "bg-amber-50/70",
      tagClass: "!bg-amber-100 !text-amber-700",
    }
  }

  if (itemType === "ADJUSTMENT") {
    return {
      label: "Điều chỉnh",
      icon: "pi pi-sliders-h",
      rowClass: "bg-slate-50",
      tagClass: "!bg-slate-200 !text-slate-700",
    }
  }

  return {
    label: "Dịch vụ",
    icon: "pi pi-sparkles",
    rowClass: "bg-emerald-50/70",
    tagClass: "!bg-emerald-100 !text-emerald-700",
  }
}

export function ShopBookingDetailModal({
  visible,
  booking,
  onHide,
  onAccept,
  onReject,
  onNextStatus,
  onLoaded,
}: ShopBookingDetailModalProps) {
  const [detail, setDetail] = useState<BookingDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    if (!visible || !booking) {
      setDetail(null)
      setIsLoading(false)
      setHasLoadError(false)
      return
    }

    let isActive = true
    setDetail(null)
    setIsLoading(true)
    setHasLoadError(false)

    getBookingById(booking.id)
      .then((fullBooking) => {
        if (!isActive) return
        setDetail(fullBooking)
        onLoaded?.(fullBooking)
      })
      .catch((err) => {
        if (!isActive) return
        setHasLoadError(true)
        notify.error(getErrorMessage(err, "Không tải được chi tiết lịch hẹn."))
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [visible, booking?.id])

  if (!booking) {
    return null
  }

  const nextStatus = detail ? STATUS_FLOW[detail.status] : undefined

  const handleNextStatus = async () => {
    if (!detail) return
    if (!nextStatus) return

    const success = await onNextStatus(detail)
    if (!success) return

    const updatedBooking = {
      ...detail,
      status: nextStatus,
      statusLabel: STATUS_CONFIG[nextStatus]?.label || "",
    }

    setDetail(updatedBooking)
    onLoaded?.(updatedBooking)
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Chi tiết Lịch hẹn ${detail?.bookingCode ?? booking.bookingCode}`}
      style={{ width: "100%", maxWidth: "48rem" }}
      footer={
        <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
          <Button
            type="button"
            label="Đóng"
            onClick={onHide}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
          />
          {detail?.status === "DRAFT" && (
            <>
              <Button
                label="Chấp nhận"
                icon="pi pi-check"
                severity="success"
                onClick={() => {
                  onAccept(detail.id)
                  onHide()
                }}
                className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-emerald-500 !bg-emerald-500 !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-emerald-600"
              />
              <Button
                label="Từ chối"
                icon="pi pi-times"
                severity="danger"
                onClick={() => {
                  onHide()
                  onReject(detail.id)
                }}
                className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-rose-500 !bg-rose-500 !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-rose-600"
              />
            </>
          )}
          {nextStatus && (
            <Button
              label={`Chuyển → ${STATUS_CONFIG[nextStatus].label}`}
              icon="pi pi-arrow-right"
              onClick={handleNextStatus}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a]"
            />
          )}
        </div>
      }
    >
      {!detail ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3 text-sm text-[#73849b]">
          {hasLoadError ? (
            <span>Không tải được chi tiết lịch hẹn.</span>
          ) : (
            <>
              <ProgressSpinner style={{ width: "2.5rem", height: "2.5rem" }} strokeWidth="4" />
              <span>Đang tải chi tiết lịch hẹn...</span>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 mt-0 text-sm text-[#73849b]">Xem thông tin và cập nhật tiến độ.</p>
          <div className="relative space-y-4">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm">
                <ProgressSpinner style={{ width: "2.5rem", height: "2.5rem" }} strokeWidth="4" />
              </div>
            )}

            <div className="rounded-xl border border-[#d3e3f6] bg-[#eef3fb] p-4 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#214388]">Thời gian hẹn</p>
              <p className="text-xl font-bold text-[#1a365d]">{formatDateTimeViVN(detail.time)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Khách hàng</p>
                <div className="space-y-3">
                  <InfoItem icon={<i className="pi pi-user h-4 w-4" />} label="Họ tên" value={getBookingCustomerName(detail)} />
                  <InfoItem icon={<i className="pi pi-phone h-4 w-4" />} label="Điện thoại" value={getBookingCustomerContact(detail)} />
                </div>
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Hạng mục đặt hẹn</p>
                <div className="space-y-2">
                  {detail.items.map((item, i) => {
                    const meta = getBookingItemMeta(item.itemType)

                    return (
                      <div key={`${item.itemType}-${item.id}-${i}`} className={`rounded-lg p-2.5 ${meta.rowClass}`}>
                        <div className="flex items-start justify-between gap-3 text-sm">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex min-w-0 items-center gap-2">
                              <Tag
                                value={meta.label}
                                icon={meta.icon}
                                className={`!inline-flex !h-6 !shrink-0 !items-center !whitespace-nowrap !rounded-md !px-2 !py-0 !text-[11px] !font-semibold ${meta.tagClass} [&_.p-tag-icon]:!mr-1 [&_.p-tag-value]:!whitespace-nowrap`}
                              />
                              <span className="shrink-0 text-xs font-semibold text-slate-500">x{item.quantity}</span>
                            </div>
                            <p className="m-0 truncate font-semibold text-slate-800">{item.name}</p>
                            <p className="m-0 mt-0.5 text-xs text-slate-500">Đơn giá {formatCurrencyVND(item.unitPrice)}</p>
                          </div>
                          <span className="shrink-0 font-semibold text-[#ef5c2c]">{formatCurrencyVND(item.amount)}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex items-center justify-between pt-1 text-sm font-bold">
                    <span className="text-slate-800">Tổng cộng</span>
                    <span className="text-[#ef5c2c]">{formatCurrencyVND(detail.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</p>
                <span
                  className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[detail.status]?.bg} ${STATUS_CONFIG[detail.status]?.text}`}
                >
                  {detail.statusLabel || STATUS_CONFIG[detail.status]?.label}
                </span>
                {detail.source && (
                  <p className="mt-2 text-xs text-slate-500">Nguồn: {detail.source}</p>
                )}
              </div>
            </div>

            <p className="text-right text-xs text-slate-400">Ngày tạo: {formatDateTimeViVN(detail.createdAt)}</p>
          </div>
        </>
      )}
    </Dialog>
  )
}
