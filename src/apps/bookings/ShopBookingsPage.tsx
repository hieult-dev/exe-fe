import { useMemo, useState } from "react"
import { Dialog } from "primereact/dialog"
import { DataTable } from "primereact/datatable"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import type { MenuItem } from "primereact/menuitem"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"

type ShopBooking = {
  id: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  petInfo: {
    name: string
    type: string // "Dog" | "Cat"
    weight: string
    breed: string
  }
  serviceName: string
  price: number
  bookingDate: string // YYYY-MM-DD
  bookingTime: string // HH:mm
  status: BookingStatus
  assignedTo?: string
  note?: string
  createdAt: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STAFF_LIST = ["Nguyễn Văn A (Groomer)", "Trần Thị B (Vet)", "Phạm Minh C (Groomer)", "Lê Hoàng D (Staff)"]

const mockBookings: ShopBooking[] = [
  {
    id: "BOK-001",
    buyerName: "Hoàng Minh Tuấn",
    buyerPhone: "0912345678",
    buyerEmail: "tuan.hoang@gmail.com",
    petInfo: { name: "Milu", type: "Chó", weight: "5kg", breed: "Poodle" },
    serviceName: "Grooming cao cấp",
    price: 350000,
    bookingDate: "2026-03-20",
    bookingTime: "09:00",
    status: "PENDING",
    createdAt: "2026-03-17T08:30:00",
    note: "Khách yêu cầu cắt ngắn gọn gàng.",
  },
  {
    id: "BOK-002",
    buyerName: "Nguyễn Thị Lan",
    buyerPhone: "0987654321",
    buyerEmail: "lan.nguyen@gmail.com",
    petInfo: { name: "Mimi", type: "Mèo", weight: "3kg", breed: "Anh lông ngắn" },
    serviceName: "Khám tổng quát",
    price: 180000,
    bookingDate: "2026-03-18",
    bookingTime: "14:30",
    status: "ACCEPTED",
    assignedTo: "Trần Thị B (Vet)",
    createdAt: "2026-03-17T07:10:00",
  },
  {
    id: "BOK-003",
    buyerName: "Trần Văn Khoa",
    buyerPhone: "0901122334",
    buyerEmail: "khoa.tran@gmail.com",
    petInfo: { name: "Kiki", type: "Chó", weight: "12kg", breed: "Corgi" },
    serviceName: "Tiêm phòng định kỳ",
    price: 220000,
    bookingDate: "2026-03-17",
    bookingTime: "10:00",
    status: "IN_PROGRESS",
    assignedTo: "Lê Hoàng D (Staff)",
    createdAt: "2026-03-16T15:45:00",
  },
  {
    id: "BOK-004",
    buyerName: "Phạm Thu Hà",
    buyerPhone: "0933445566",
    buyerEmail: "ha.pham@gmail.com",
    petInfo: { name: "Bông", type: "Chó", weight: "4kg", breed: "Phốc sóc" },
    serviceName: "Grooming cơ bản",
    price: 250000,
    bookingDate: "2026-03-15",
    bookingTime: "16:00",
    status: "COMPLETED",
    assignedTo: "Nguyễn Văn A (Groomer)",
    createdAt: "2026-03-14T10:20:00",
  },
  {
    id: "BOK-005",
    buyerName: "Lê Đức Thịnh",
    buyerPhone: "0944556677",
    buyerEmail: "thinh.le@gmail.com",
    petInfo: { name: "Mun", type: "Mèo", weight: "4.5kg", breed: "Mèo ta" },
    serviceName: "Khám bệnh ngoài da",
    price: 200000,
    bookingDate: "2026-03-21",
    bookingTime: "08:30",
    status: "PENDING",
    createdAt: "2026-03-17T06:00:00",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700" },
  ACCEPTED: { label: "Đã xác nhận", bg: "bg-sky-100", text: "text-sky-700" },
  IN_PROGRESS: { label: "Đang thực hiện", bg: "bg-violet-100", text: "text-violet-700" },
  COMPLETED: { label: "Hoàn thành", bg: "bg-emerald-100", text: "text-emerald-700" },
  REJECTED: { label: "Từ chối", bg: "bg-rose-100", text: "text-rose-700" },
  CANCELLED: { label: "Khách hủy", bg: "bg-slate-100", text: "text-slate-600" },
}

const STATUS_FLOW: Partial<Record<BookingStatus, BookingStatus[]>> = {
  ACCEPTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
}

function fmt(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fmtBookingTime(dateStr: string, timeStr: string) {
  // Example: 2026-03-20 & 09:00 -> "09:00 - 20/03/2026"
  const parts = dateStr.split("-")
  if (parts.length !== 3) return `${timeStr} - ${dateStr}`
  return `${timeStr} - ${parts[2]}/${parts[1]}/${parts[0]}`
}

type StatusFilter = "ALL" | BookingStatus
const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "ACCEPTED", label: "Đã xác nhận" },
  { value: "IN_PROGRESS", label: "Đang thực hiện" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Khách hủy" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ShopBookingsPage() {
  const { globalSearchQuery } = useShopOwnerContext()
  const [bookings, setBookings] = useState<ShopBooking[]>(mockBookings)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [selectedBooking, setSelectedBooking] = useState<ShopBooking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "PENDING").length
    const incoming = bookings.filter((b) => b.status === "ACCEPTED").length
    const active = bookings.filter((b) => b.status === "IN_PROGRESS").length
    const completed = bookings.filter((b) => b.status === "COMPLETED").length
    return { pending, incoming, active, completed }
  }, [bookings])

  // ── Filtered ──────────────────────────────────────────────────────────────────
  const visibleBookings = useMemo(() => {
    const keyword = globalSearchQuery.trim().toLowerCase()
    return bookings
      .filter((b) => {
        if (statusFilter !== "ALL" && b.status !== statusFilter) return false
        if (keyword) {
          return (
            b.id.toLowerCase().includes(keyword) ||
            b.buyerName.toLowerCase().includes(keyword) ||
            b.buyerPhone.includes(keyword) ||
            b.petInfo.name.toLowerCase().includes(keyword)
          )
        }
        return true
      })
      .sort((a, b) => {
        // Sort by booking date ascending (upcoming first) if pending/accepted
        const tA = new Date(`${a.bookingDate}T${a.bookingTime}`).getTime()
        const tB = new Date(`${b.bookingDate}T${b.bookingTime}`).getTime()
        if (a.status === "PENDING" || a.status === "ACCEPTED") return tA - tB
        return tB - tA // Others sort descending
      })
  }, [bookings, globalSearchQuery, statusFilter])

  // ── Actions ───────────────────────────────────────────────────────────────────
  const updateBooking = (id: string, patch: Partial<ShopBooking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
    if (selectedBooking?.id === id) setSelectedBooking((prev) => prev ? { ...prev, ...patch } : prev)
  }

  const handleAccept = (id: string) => updateBooking(id, { status: "ACCEPTED" })

  const openReject = (id: string) => {
    setRejectTargetId(id)
    setRejectNote("")
    setIsRejectOpen(true)
  }

  const confirmReject = () => {
    if (rejectTargetId) updateBooking(rejectTargetId, { status: "REJECTED", note: rejectNote || undefined })
    setIsRejectOpen(false)
    setRejectTargetId(null)
  }

  const handleNextStatus = (booking: ShopBooking) => {
    const next = STATUS_FLOW[booking.status]?.[0]
    if (next) updateBooking(booking.id, { status: next })
  }

  const handleAssign = (id: string, staff: string) => {
    updateBooking(id, { assignedTo: staff })
  }

  const openDetail = (booking: ShopBooking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  // ── Column bodies ─────────────────────────────────────────────────────────────
  const indexBody = (_: ShopBooking, opts: ColumnBodyOptions) => (
    <div className="text-center text-sm text-slate-500">{opts.rowIndex + 1}</div>
  )

  const idBody = (booking: ShopBooking) => (
    <div className="text-center font-mono text-xs font-semibold text-[#214388]">{booking.id}</div>
  )

  const buyerBody = (booking: ShopBooking) => (
    <div>
      <p className="text-sm font-semibold text-slate-800">{booking.buyerName}</p>
      <p className="text-xs text-slate-500">{booking.buyerPhone}</p>
      <p className="mt-1 text-xs text-slate-400 max-w-[150px] truncate" title={booking.buyerEmail}>{booking.buyerEmail}</p>
    </div>
  )

  const petAndServiceBody = (booking: ShopBooking) => (
    <div>
      <p className="text-sm font-semibold text-[#214388]">Dịch vụ: {booking.serviceName}</p>
      <p className="mt-1 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">{booking.petInfo.name}</span> • {booking.petInfo.type} ({booking.petInfo.breed}) • {booking.petInfo.weight}
      </p>
    </div>
  )

  const timeBody = (booking: ShopBooking) => (
    <div className="text-center">
      <p className="text-sm font-bold text-slate-800">{booking.bookingTime}</p>
      <p className="text-xs text-slate-500">{booking.bookingDate.split("-").reverse().join("/")}</p>
    </div>
  )

  const statusBody = (booking: ShopBooking) => {
    const cfg = STATUS_CONFIG[booking.status]
    return (
      <div className="flex justify-center">
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
      </div>
    )
  }

  const assignBody = (booking: ShopBooking) => (
    <div className="flex justify-center">
      {booking.assignedTo ? (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 text-center max-w-[120px] line-clamp-2" title={booking.assignedTo}>{booking.assignedTo}</span>
      ) : (
        <span className="text-xs text-slate-400">Chưa gán</span>
      )}
    </div>
  )

  const actionsBody = (booking: ShopBooking) => {
    const actionItems: MenuItem[] = [
      {
        label: "Xem chi tiết",
        icon: "pi pi-eye",
        command: () => openDetail(booking),
      },
    ]

    if (booking.status === "PENDING") {
      actionItems.push(
        {
          label: "Chấp nhận hẹn",
          icon: "pi pi-check-circle",
          className: "text-emerald-600",
          command: () => handleAccept(booking.id),
        },
        {
          label: "Từ chối hẹn",
          icon: "pi pi-times-circle",
          className: "text-rose-500",
          command: () => openReject(booking.id),
        }
      )
    }

    if (STATUS_FLOW[booking.status]) {
      actionItems.push({
        label: "Cập nhật tiến độ",
        icon: booking.status === "ACCEPTED" ? "pi pi-play-circle" : "pi pi-check-circle",
        className: "text-violet-600",
        command: () => handleNextStatus(booking),
      })
    }

    return <TableActionMenu items={actionItems} />
  }

  return (
    <>
    <div className="flex flex-1 flex-col gap-2">
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Lịch dịch vụ (Bookings)</h1>
            <p className="mt-0.5 text-sm text-slate-500">Quản lý lịch hẹn dịch vụ — sắp xếp thời gian và phân bổ nhân viên.</p>
          </div>
        }
        end={
          <label className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
            <i className="pi pi-filter h-4 w-4 text-[#70829a]" />
            <span>Trạng thái</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        }
      />

      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">

      <div className="grid gap-3 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<i className="pi pi-clock h-5 w-5 text-amber-500" />} label="Chờ xác nhận" value={stats.pending} color="amber" />
        <StatCard icon={<i className="pi pi-calendar h-5 w-5 text-sky-500" />} label="Sắp tới" value={stats.incoming} color="blue" />
        <StatCard icon={<i className="pi pi-cut h-5 w-5 text-violet-500" />} label="Đang thực hiện" value={stats.active} color="violet" />
        <StatCard icon={<i className="pi pi-check-circle h-5 w-5 text-emerald-500" />} label="Hoàn thành" value={stats.completed} color="emerald" />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <p>Hiển thị {visibleBookings.length}/{bookings.length} lịch hẹn</p>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="mt-2 overflow-hidden rounded-xl border border-[#e2e8f0]">
        <DataTable
          value={visibleBookings}
          dataKey="id"
          size="small"
          stripedRows
          rowHover
          showGridlines
          tableStyle={{ minWidth: "80rem" }}
          emptyMessage="Không có lịch hẹn nào."
        >
          <Column header="TT" body={indexBody} style={{ width: "56px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Mã Code" body={idBody} style={{ width: "110px" }} alignHeader="center" />
          <Column header="Thời gian hẹn" body={timeBody} style={{ minWidth: "120px" }} alignHeader="center" />
          <Column header="Khách hàng" body={buyerBody} style={{ minWidth: "180px" }} alignHeader="left" />
          <Column header="Dịch vụ & Thú cưng" body={petAndServiceBody} style={{ minWidth: "220px" }} alignHeader="left" />
          <Column header="Trạng thái" body={statusBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Phụ trách" body={assignBody} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Thao tác" body={actionsBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
        </DataTable>
      </div>
      </div>

      {/* ── Detail dialog ─────────────────────────────────────────────────────── */}
      {selectedBooking && (
        <Dialog
          visible={isDetailOpen}
          onHide={() => setIsDetailOpen(false)}
          header={`Chi tiết Lịch hẹn ${selectedBooking.id}`}
          style={{ width: '100%', maxWidth: '48rem' }}
          footer={
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
              >
                Đóng
              </button>
              {selectedBooking.status === "PENDING" && (
                <>
                  <button
                    onClick={() => { handleAccept(selectedBooking.id); setIsDetailOpen(false) }}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => { setIsDetailOpen(false); openReject(selectedBooking.id) }}
                    className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                  >
                    Từ chối
                  </button>
                </>
              )}
              {STATUS_FLOW[selectedBooking.status] && (
                <button
                  onClick={() => handleNextStatus(selectedBooking)}
                  className="rounded-lg bg-[#214388] px-4 py-2 text-sm font-semibold text-white hover:bg-[#19356a]"
                >
                  Chuyển → {STATUS_CONFIG[STATUS_FLOW[selectedBooking.status]![0]].label}
                </button>
              )}
            </div>
          }
        >
          <p className="mb-4 mt-0 text-sm text-[#73849b]">Xem thông tin và cập nhật tiến độ.</p>
          <div className="space-y-4">

            {/* Thời gian */}
            <div className="rounded-xl bg-[#eef3fb] border border-[#d3e3f6] p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#214388] mb-1">Thời gian đã đặt</p>
              <p className="text-xl font-bold text-[#1a365d]">{fmtBookingTime(selectedBooking.bookingDate, selectedBooking.bookingTime)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Buyer info */}
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Khách hàng</p>
                <div className="space-y-3">
                  <InfoItem icon={<i className="pi pi-user h-4 w-4" />} label="Họ tên" value={selectedBooking.buyerName} />
                  <InfoItem icon={<i className="pi pi-phone h-4 w-4" />} label="Điện thoại" value={selectedBooking.buyerPhone} />
                  <InfoItem icon={<i className="pi pi-envelope h-4 w-4" />} label="Email" value={selectedBooking.buyerEmail} />
                </div>
              </div>

              {/* Pet & Service */}
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Dịch vụ & Thú cưng</p>
                <div className="space-y-3">
                  <div className="mb-2">
                    <p className="text-xs text-slate-400">Dịch vụ</p>
                    <p className="font-semibold text-[#ef5c2c]">{selectedBooking.serviceName} - {fmt(selectedBooking.price)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Tên PET</p>
                      <p className="text-sm font-semibold">{selectedBooking.petInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Loài</p>
                      <p className="text-sm font-semibold">{selectedBooking.petInfo.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Giống</p>
                      <p className="text-sm font-semibold">{selectedBooking.petInfo.breed}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Cân nặng</p>
                      <p className="text-sm font-semibold">{selectedBooking.petInfo.weight}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Assign */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</p>
                <span className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[selectedBooking.status].bg} ${STATUS_CONFIG[selectedBooking.status].text}`}>
                  {STATUS_CONFIG[selectedBooking.status].label}
                </span>
                {selectedBooking.note && (
                  <p className="mt-2 text-sm text-slate-600 bg-amber-50 p-2 rounded border border-amber-100 italic">" {selectedBooking.note} "</p>
                )}
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nhân viên phụ trách</p>
                <select
                  value={selectedBooking.assignedTo ?? ""}
                  onChange={(e) => handleAssign(selectedBooking.id, e.target.value)}
                  className="w-full rounded-lg border border-[#d9e1eb] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#214388]"
                >
                  <option value="">-- Chọn Staff/Groomer --</option>
                  {STAFF_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-right text-slate-400">Booked at: {fmtDate(selectedBooking.createdAt)}</p>
          </div>
        </Dialog>
      )}

      {/* ── Reject dialog ─────────────────────────────────────────────────────── */}
      <Dialog
        visible={isRejectOpen}
        onHide={() => setIsRejectOpen(false)}
        header="Từ chối lịch hẹn"
        style={{ width: '100%', maxWidth: '30rem' }}
        footer={
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsRejectOpen(false)}
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Hủy
            </button>
            <button
              onClick={confirmReject}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Xác nhận từ chối
            </button>
          </div>
        }
      >
        <p className="mb-4 mt-0 text-sm text-[#73849b]">Nhập lý do để thông báo qua email/sms cho khách.</p>
        <div className="space-y-3">
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block font-medium">Lý do từ chối (bắt buộc)</span>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full resize-none rounded-lg border border-[#d9e1eb] px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
          </label>
        </div>
      </Dialog>
    </div>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: number | string
  color: "amber" | "violet" | "emerald" | "orange" | "blue"
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const borderMap = {
    amber: "border-amber-200",
    violet: "border-violet-200",
    emerald: "border-emerald-200",
    orange: "border-orange-200",
    blue: "border-sky-200",
  }
  const bgMap = {
    amber: "bg-amber-50",
    violet: "bg-violet-50",
    emerald: "bg-emerald-50",
    orange: "bg-orange-50",
    blue: "bg-sky-50",
  }

  return (
    <div className={`rounded-xl border ${borderMap[color]} ${bgMap[color]} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="text-3xl font-bold leading-none text-[#24364d]">{value}</p>
    </div>
  )
}

type InfoItemProps = { icon: React.ReactNode; label: string; value: string }
function InfoItem({ icon, label, value }: InfoItemProps) {
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
