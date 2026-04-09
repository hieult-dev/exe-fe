import { useMemo, useState } from "react"
import { AppDialog } from "@/common/component/AppDialog"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "DELIVERING"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"

type ShopOrder = {
  id: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  items: { name: string; qty: number; price: number }[]
  total: number
  status: OrderStatus
  assignedTo?: string
  note?: string
  createdAt: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STAFF_LIST = ["Nguyễn Văn A", "Trần Thị B", "Phạm Minh C", "Lê Hoàng D"]

const mockOrders: ShopOrder[] = [
  {
    id: "ORD-001",
    buyerName: "Hoàng Minh Tuấn",
    buyerPhone: "0912345678",
    buyerEmail: "tuan.hoang@gmail.com",
    items: [
      { name: "Hạt dinh dưỡng premium", qty: 2, price: 149000 },
      { name: "Sữa tắm thảo mộc", qty: 1, price: 89000 },
    ],
    total: 387000,
    status: "PENDING",
    createdAt: "2026-03-17T08:30:00",
    note: "Giao trước 12h",
  },
  {
    id: "ORD-002",
    buyerName: "Nguyễn Thị Lan",
    buyerPhone: "0987654321",
    buyerEmail: "lan.nguyen@gmail.com",
    items: [{ name: "Đồ chơi gặm răng", qty: 3, price: 59000 }],
    total: 177000,
    status: "ACCEPTED",
    assignedTo: "Nguyễn Văn A",
    createdAt: "2026-03-17T07:10:00",
  },
  {
    id: "ORD-003",
    buyerName: "Trần Văn Khoa",
    buyerPhone: "0901122334",
    buyerEmail: "khoa.tran@gmail.com",
    items: [{ name: "Hạt dinh dưỡng premium", qty: 1, price: 149000 }],
    total: 149000,
    status: "DELIVERING",
    assignedTo: "Trần Thị B",
    createdAt: "2026-03-16T15:45:00",
  },
  {
    id: "ORD-004",
    buyerName: "Phạm Thu Hà",
    buyerPhone: "0933445566",
    buyerEmail: "ha.pham@gmail.com",
    items: [
      { name: "Sữa tắm thảo mộc", qty: 2, price: 89000 },
      { name: "Dung dịch sát khuẩn", qty: 1, price: 75000 },
    ],
    total: 253000,
    status: "COMPLETED",
    assignedTo: "Phạm Minh C",
    createdAt: "2026-03-16T10:20:00",
  },
  {
    id: "ORD-005",
    buyerName: "Lê Đức Thịnh",
    buyerPhone: "0944556677",
    buyerEmail: "thinh.le@gmail.com",
    items: [{ name: "Hạt dinh dưỡng premium", qty: 5, price: 149000 }],
    total: 745000,
    status: "PREPARING",
    assignedTo: "Lê Hoàng D",
    createdAt: "2026-03-17T06:00:00",
  },
  {
    id: "ORD-006",
    buyerName: "Võ Minh Nhật",
    buyerPhone: "0955667788",
    buyerEmail: "nhat.vo@gmail.com",
    items: [{ name: "Đồ chơi gặm răng", qty: 2, price: 59000 }],
    total: 118000,
    status: "REJECTED",
    createdAt: "2026-03-15T14:00:00",
    note: "Hết hàng tạm thời",
  },
  {
    id: "ORD-007",
    buyerName: "Đỗ Thị Thanh",
    buyerPhone: "0966778899",
    buyerEmail: "thanh.do@gmail.com",
    items: [
      { name: "Sữa tắm thảo mộc", qty: 1, price: 89000 },
      { name: "Hạt dinh dưỡng premium", qty: 2, price: 149000 },
    ],
    total: 387000,
    status: "PENDING",
    createdAt: "2026-03-17T09:15:00",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700" },
  ACCEPTED: { label: "Đã xác nhận", bg: "bg-sky-100", text: "text-sky-700" },
  PREPARING: { label: "Đang chuẩn bị", bg: "bg-violet-100", text: "text-violet-700" },
  DELIVERING: { label: "Đang giao", bg: "bg-orange-100", text: "text-orange-700" },
  COMPLETED: { label: "Hoàn thành", bg: "bg-emerald-100", text: "text-emerald-700" },
  REJECTED: { label: "Từ chối", bg: "bg-rose-100", text: "text-rose-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600" },
}

const STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus[]>> = {
  ACCEPTED: ["PREPARING"],
  PREPARING: ["DELIVERING"],
  DELIVERING: ["COMPLETED"],
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

type StatusFilter = "ALL" | OrderStatus
const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "ACCEPTED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "DELIVERING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ShopOrdersPage() {
  const [orders, setOrders] = useState<ShopOrder[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "PENDING").length
    const active = orders.filter((o) => ["ACCEPTED", "PREPARING", "DELIVERING"].includes(o.status)).length
    const completed = orders.filter((o) => o.status === "COMPLETED").length
    const revenue = orders.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + o.total, 0)
    return { pending, active, completed, revenue }
  }, [orders])

  // ── Filtered ──────────────────────────────────────────────────────────────────
  const visibleOrders = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return orders
      .filter((o) => {
        if (statusFilter !== "ALL" && o.status !== statusFilter) return false
        if (keyword) {
          return (
            o.id.toLowerCase().includes(keyword) ||
            o.buyerName.toLowerCase().includes(keyword) ||
            o.buyerPhone.includes(keyword)
          )
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, searchQuery, statusFilter])

  // ── Actions ───────────────────────────────────────────────────────────────────
  const updateOrder = (id: string, patch: Partial<ShopOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
    if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, ...patch } : prev)
  }

  const handleAccept = (id: string) => updateOrder(id, { status: "ACCEPTED" })

  const openReject = (id: string) => {
    setRejectTargetId(id)
    setRejectNote("")
    setIsRejectOpen(true)
  }

  const confirmReject = () => {
    if (rejectTargetId) updateOrder(rejectTargetId, { status: "REJECTED", note: rejectNote || undefined })
    setIsRejectOpen(false)
    setRejectTargetId(null)
  }

  const handleNextStatus = (order: ShopOrder) => {
    const next = STATUS_FLOW[order.status]?.[0]
    if (next) updateOrder(order.id, { status: next })
  }

  const handleAssign = (id: string, staff: string) => {
    updateOrder(id, { assignedTo: staff })
  }

  const openDetail = (order: ShopOrder) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  // ── Column bodies ─────────────────────────────────────────────────────────────
  const indexBody = (_: ShopOrder, opts: ColumnBodyOptions) => (
    <div className="text-center text-sm text-slate-500">{opts.rowIndex + 1}</div>
  )

  const idBody = (order: ShopOrder) => (
    <div className="text-center font-mono text-xs font-semibold text-[#214388]">{order.id}</div>
  )

  const buyerBody = (order: ShopOrder) => (
    <div>
      <p className="text-sm font-semibold text-slate-800">{order.buyerName}</p>
      <p className="text-xs text-slate-500">{order.buyerPhone}</p>
    </div>
  )

  const itemsBody = (order: ShopOrder) => (
    <div className="text-xs text-slate-600">
      {order.items.slice(0, 2).map((item, i) => (
        <p key={i} className="truncate">
          {item.qty}× {item.name}
        </p>
      ))}
      {order.items.length > 2 && <p className="text-slate-400">+{order.items.length - 2} mục khác</p>}
    </div>
  )

  const totalBody = (order: ShopOrder) => (
    <div className="text-center text-sm font-semibold text-[#ef5c2c]">{fmt(order.total)}</div>
  )

  const statusBody = (order: ShopOrder) => {
    const cfg = STATUS_CONFIG[order.status]
    return (
      <div className="flex justify-center">
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
      </div>
    )
  }

  const assignBody = (order: ShopOrder) => (
    <div className="flex justify-center">
      {order.assignedTo ? (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{order.assignedTo}</span>
      ) : (
        <span className="text-xs text-slate-400">Chưa gán</span>
      )}
    </div>
  )

  const dateBody = (order: ShopOrder) => (
    <div className="text-center text-xs text-slate-500">{fmtDate(order.createdAt)}</div>
  )

  const actionsBody = (order: ShopOrder) => (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => openDetail(order)}
        title="Xem chi tiết"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d7dfe9] bg-white text-[#214388] hover:bg-[#eef3fb]"
      >
        <i className="pi pi-eye h-3.5 w-3.5" />
      </button>

      {order.status === "PENDING" && (
        <>
          <button
            onClick={() => handleAccept(order.id)}
            title="Chấp nhận"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
          >
            <i className="pi pi-check-circle h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => openReject(order.id)}
            title="Từ chối"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 hover:bg-rose-50"
          >
            <i className="pi pi-times-circle h-3.5 w-3.5" />
          </button>
        </>
      )}

      {STATUS_FLOW[order.status] && (
        <button
          onClick={() => handleNextStatus(order)}
          title="Chuyển trạng thái tiếp"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-violet-200 bg-white text-violet-600 hover:bg-violet-50"
        >
          <i className="pi pi-truck h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Yêu cầu mua hàng</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý tất cả đơn hàng đến — xác nhận, phân công và theo dõi tiến trình.</p>
      </div>

      <div className="grid gap-3 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<i className="pi pi-clock h-5 w-5 text-amber-500" />} label="Chờ xác nhận" value={stats.pending} color="amber" />
        <StatCard icon={<i className="pi pi-shopping-bag h-5 w-5 text-violet-500" />} label="Đang xử lý" value={stats.active} color="violet" />
        <StatCard icon={<i className="pi pi-check-circle h-5 w-5 text-emerald-500" />} label="Hoàn thành" value={stats.completed} color="emerald" />
        <StatCard icon={<i className="pi pi-chart-line h-5 w-5 text-[#ef5c2c]" />} label="Doanh thu" value={fmt(stats.revenue)} color="orange" isText />
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 lg:flex-row lg:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-[#d9e1eb] bg-[#fbfcfe] px-3 py-2">
          <i className="pi pi-search h-4 w-4 text-[#70829a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#24364d] outline-none"
          />
        </label>

        <label className="inline-flex items-center gap-2 rounded-lg border border-[#d9e1eb] bg-white px-3 py-2 text-sm">
          <i className="pi pi-filter h-4 w-4 text-[#70829a]" />
          <span className="text-slate-500">Trạng thái</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <i className="pi pi-chevron-down h-3.5 w-3.5 text-slate-400" />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <p>Hiển thị {visibleOrders.length}/{orders.length} đơn hàng</p>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="mt-2 overflow-hidden rounded-xl border border-[#e2e8f0]">
        <DataTable
          value={visibleOrders}
          dataKey="id"
          size="small"
          stripedRows
          rowHover
          showGridlines
          tableStyle={{ minWidth: "80rem" }}
          emptyMessage="Không có đơn hàng nào."
        >
          <Column header="TT" body={indexBody} style={{ width: "56px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Mã đơn" body={idBody} style={{ width: "110px" }} alignHeader="center" />
          <Column header="Khách hàng" body={buyerBody} style={{ minWidth: "180px" }} alignHeader="left" />
          <Column header="Sản phẩm" body={itemsBody} style={{ minWidth: "200px" }} alignHeader="left" />
          <Column header="Tổng tiền" body={totalBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Trạng thái" body={statusBody} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Người giao" body={assignBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Thời gian" body={dateBody} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
          <Column header="Thao tác" body={actionsBody} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
        </DataTable>
      </div>

      {/* ── Detail dialog ─────────────────────────────────────────────────────── */}
      {selectedOrder && (
        <AppDialog
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi tiết đơn hàng ${selectedOrder.id}`}
          description="Xem thông tin, xử lý và gán người giao hàng."
          size="lg"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
              >
                Đóng
              </button>
              {selectedOrder.status === "PENDING" && (
                <>
                  <button
                    onClick={() => { handleAccept(selectedOrder.id); setIsDetailOpen(false) }}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => { setIsDetailOpen(false); openReject(selectedOrder.id) }}
                    className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                  >
                    Từ chối
                  </button>
                </>
              )}
              {STATUS_FLOW[selectedOrder.status] && (
                <button
                  onClick={() => handleNextStatus(selectedOrder)}
                  className="rounded-lg bg-[#214388] px-4 py-2 text-sm font-semibold text-white hover:bg-[#19356a]"
                >
                  Chuyển → {STATUS_CONFIG[STATUS_FLOW[selectedOrder.status]![0]].label}
                </button>
              )}
            </>
          }
        >
          <div className="space-y-5">
            {/* Buyer info */}
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Thông tin khách hàng</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <InfoItem icon={<i className="pi pi-user h-4 w-4" />} label="Họ tên" value={selectedOrder.buyerName} />
                <InfoItem icon={<i className="pi pi-phone h-4 w-4" />} label="Điện thoại" value={selectedOrder.buyerPhone} />
                <InfoItem icon={<i className="pi pi-envelope h-4 w-4" />} label="Email" value={selectedOrder.buyerEmail} />
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Sản phẩm đặt hàng</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.qty}× {item.name}</span>
                    <span className="font-semibold text-[#ef5c2c]">{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[#f0f4f8] pt-2 text-sm font-bold">
                  <span className="text-slate-800">Tổng cộng</span>
                  <span className="text-[#ef5c2c]">{fmt(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Status & Assign */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</p>
                <span className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[selectedOrder.status].bg} ${STATUS_CONFIG[selectedOrder.status].text}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </span>
                {selectedOrder.note && (
                  <p className="mt-2 text-xs text-slate-500">Ghi chú: {selectedOrder.note}</p>
                )}
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Gán người giao</p>
                <select
                  value={selectedOrder.assignedTo ?? ""}
                  onChange={(e) => handleAssign(selectedOrder.id, e.target.value)}
                  className="w-full rounded-lg border border-[#d9e1eb] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#214388]"
                >
                  <option value="">-- Chưa gán --</option>
                  {STAFF_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Thời gian đặt hàng</p>
              <p className="text-sm text-slate-700">{fmtDate(selectedOrder.createdAt)}</p>
            </div>
          </div>
        </AppDialog>
      )}

      {/* ── Reject dialog ─────────────────────────────────────────────────────── */}
      <AppDialog
        open={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Từ chối đơn hàng"
        description="Nhập lý do từ chối để thông báo đến khách hàng."
        footer={
          <>
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
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Thao tác này sẽ chuyển trạng thái đơn sang <strong>Từ chối</strong>.</p>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block font-medium">Lý do từ chối (tùy chọn)</span>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full resize-none rounded-lg border border-[#d9e1eb] px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
          </label>
        </div>
      </AppDialog>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: number | string
  color: "amber" | "violet" | "emerald" | "orange"
  isText?: boolean
}

function StatCard({ icon, label, value, color, isText = false }: StatCardProps) {
  const borderMap = {
    amber: "border-amber-200",
    violet: "border-violet-200",
    emerald: "border-emerald-200",
    orange: "border-orange-200",
  }
  const bgMap = {
    amber: "bg-amber-50",
    violet: "bg-violet-50",
    emerald: "bg-emerald-50",
    orange: "bg-orange-50",
  }

  return (
    <div className={`rounded-xl border ${borderMap[color]} ${bgMap[color]} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className={`${isText ? "text-xl" : "text-3xl"} font-bold leading-none text-[#24364d]`}>{value}</p>
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
