import React, { useEffect, useMemo, useRef, useState } from "react"
import { Dialog } from "primereact/dialog"
import { DataTable } from "primereact/datatable"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import type { MenuItem } from "primereact/menuitem"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { deleteOrder, getOrderById, getOrders, updateOrder } from "@/apps/orders/api/orderApi"
import type {
  OrderDTO,
  OrderItemDTO,
  OrderListItemDTO,
  OrderSource,
  OrderSourceFilter,
  OrderStatus,
  OrderStatusFilter,
} from "@/apps/orders/model"
import { notify } from "@/common/toast/ToastHelper"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận", bg: "bg-sky-100", text: "text-sky-700" },
  PACKING: { label: "Đang đóng gói", bg: "bg-violet-100", text: "text-violet-700" },
  SHIPPING: { label: "Đang giao", bg: "bg-orange-100", text: "text-orange-700" },
  COMPLETED: { label: "Hoàn thành", bg: "bg-emerald-100", text: "text-emerald-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600" },
}

const SOURCE_CONFIG: Record<OrderSource, string> = {
  ONLINE: "Online",
  STAFF: "Nhân viên",
}

const STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  CONFIRMED: "PACKING",
  PACKING: "SHIPPING",
  SHIPPING: "COMPLETED",
}

const STATUS_FILTER_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: STATUS_CONFIG.PENDING.label },
  { value: "CONFIRMED", label: STATUS_CONFIG.CONFIRMED.label },
  { value: "PACKING", label: STATUS_CONFIG.PACKING.label },
  { value: "SHIPPING", label: STATUS_CONFIG.SHIPPING.label },
  { value: "COMPLETED", label: STATUS_CONFIG.COMPLETED.label },
  { value: "CANCELLED", label: STATUS_CONFIG.CANCELLED.label },
]

const SOURCE_FILTER_OPTIONS: { value: OrderSourceFilter; label: string }[] = [
  { value: "ONLINE", label: SOURCE_CONFIG.ONLINE },
  { value: "STAFF", label: SOURCE_CONFIG.STAFF },
  { value: "ALL", label: "Tất cả nguồn" },
]

function fmt(value: number | null | undefined) {
  return `${Number(value ?? 0).toLocaleString("vi-VN")}đ`
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "---"

  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "---"

  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusLabel(status: OrderStatus, fallback?: string | null) {
  return STATUS_CONFIG[status]?.label || fallback || status
}

function normalizeItem(item: Partial<OrderItemDTO>): OrderItemDTO {
  return {
    id: item.id,
    shopId: item.shopId,
    orderId: item.orderId,
    productId: Number(item.productId ?? 0),
    productName: item.productName,
    qty: Number(item.qty ?? 0),
    unitPrice: item.unitPrice,
    amount: item.amount,
    createdAt: item.createdAt,
  }
}

function normalizeListItem(order: Partial<OrderListItemDTO>): OrderListItemDTO {
  const status = (order.status || "PENDING") as OrderStatus
  const source = (order.source || "ONLINE") as OrderSource

  return {
    id: Number(order.id ?? 0),
    orderCode: order.orderCode || `#${order.id ?? ""}`,
    shopId: Number(order.shopId ?? 0),
    customerId: Number(order.customerId ?? 0),
    customerName: order.customerName ?? null,
    customerPhone: order.customerPhone ?? null,
    receiverName: order.receiverName ?? null,
    receiverPhone: order.receiverPhone ?? null,
    shippingAddress: order.shippingAddress ?? null,
    items: Array.isArray(order.items) ? order.items.map(normalizeItem) : [],
    totalAmount: Number(order.totalAmount ?? 0),
    status,
    statusLabel: order.statusLabel || statusLabel(status),
    source,
    createdAt: order.createdAt || "",
  }
}

function normalizeDetail(order: Partial<OrderDTO>, fallback?: OrderListItemDTO | null): OrderDTO {
  const status = (order.status || fallback?.status || "PENDING") as OrderStatus
  const source = (order.source || fallback?.source || "ONLINE") as OrderSource
  const totalAmount = Number(order.totalAmount ?? fallback?.totalAmount ?? 0)

  return {
    id: Number(order.id ?? fallback?.id ?? 0),
    orderCode: order.orderCode || fallback?.orderCode || "",
    shopId: Number(order.shopId ?? fallback?.shopId ?? 0),
    customerId: Number(order.customerId ?? fallback?.customerId ?? 0),
    status,
    source,
    subtotalAmount: Number(order.subtotalAmount ?? totalAmount),
    shippingFee: Number(order.shippingFee ?? 0),
    discountAmount: Number(order.discountAmount ?? 0),
    totalAmount,
    receiverName: order.receiverName ?? fallback?.receiverName ?? null,
    receiverPhone: order.receiverPhone ?? fallback?.receiverPhone ?? null,
    shippingAddress: order.shippingAddress ?? fallback?.shippingAddress ?? null,
    note: order.note ?? null,
    createdAt: order.createdAt || fallback?.createdAt || "",
    updatedAt: order.updatedAt || order.createdAt || fallback?.createdAt || "",
    items: Array.isArray(order.items)
      ? order.items.map(normalizeItem)
      : fallback?.items.map(normalizeItem) || [],
  }
}

export function ShopOrdersPage() {
  const { globalSearchQuery } = useShopOwnerContext()

  const [debouncedSearch, setDebouncedSearch] = useState(globalSearchQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(globalSearchQuery), 500)
    return () => clearTimeout(timer)
  }, [globalSearchQuery])

  const [orders, setOrders] = useState<OrderListItemDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL")
  const [sourceFilter, setSourceFilter] = useState<OrderSourceFilter>("ONLINE")

  const [selectedListOrder, setSelectedListOrder] = useState<OrderListItemDTO | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelNote, setCancelNote] = useState("")
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrderListItemDTO | null>(null)

  const loadOrders = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (!hasNext || isLoadingMore) return
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const currentCursor = isLoadMore ? nextCursor : null
      const result = await getOrders({
        size: 20,
        cursor: currentCursor,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        source: sourceFilter === "ALL" ? undefined : sourceFilter,
      }) as any

      const payload = result?.data || result
      const contentArray = Array.isArray(payload) ? payload : payload?.content || []
      const newCursor = payload?.nextCursor || null
      const newHasNext = payload?.hasNext ?? false

      if (Array.isArray(contentArray)) {
        const mapped = contentArray.map(normalizeListItem).filter((order) => order.id > 0)

        if (isLoadMore) {
          setOrders((prev) => {
            const prevIds = new Set(prev.map((item) => item.id))
            const uniqueNew = mapped.filter((item) => !prevIds.has(item.id))
            return [...prev, ...uniqueNew]
          })
        } else {
          setOrders(mapped)
        }

        setNextCursor(newCursor)
        setHasNext(newHasNext)
      }
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được danh sách đơn hàng."))
      console.error("Failed to load orders:", err)
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadOrders(false)
  }, [statusFilter, sourceFilter])

  useEffect(() => {
    if (isLoading || isLoadingMore || !hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadOrders(true)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNext, isLoading, isLoadingMore, nextCursor, statusFilter, sourceFilter])

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length
    const active = orders.filter((order) => ["CONFIRMED", "PACKING", "SHIPPING"].includes(order.status)).length
    const shipping = orders.filter((order) => order.status === "SHIPPING").length
    const completed = orders.filter((order) => order.status === "COMPLETED").length
    return { pending, active, shipping, completed }
  }, [orders])

  const visibleOrders = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()
    if (!keyword) return orders

    return orders.filter((order) => {
      const searchable = [
        order.orderCode,
        order.customerName,
        order.customerPhone,
        order.receiverName,
        order.receiverPhone,
        order.shippingAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchable.includes(keyword)
    })
  }, [orders, debouncedSearch])

  const patchOrderInState = (id: number, patch: Partial<OrderListItemDTO & OrderDTO>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              ...patch,
              statusLabel: patch.status ? statusLabel(patch.status) : order.statusLabel,
            }
          : order,
      ),
    )

    setSelectedListOrder((prev) =>
      prev?.id === id
        ? {
            ...prev,
            ...patch,
            statusLabel: patch.status ? statusLabel(patch.status) : prev.statusLabel,
          }
        : prev,
    )

    setSelectedOrder((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  const handleAccept = async (id: number) => {
    try {
      await updateOrder(id, { status: "CONFIRMED" })
      patchOrderInState(id, { status: "CONFIRMED" })
      notify.success("Đã xác nhận đơn hàng.")
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể xác nhận đơn hàng."))
    }
  }

  const openCancel = (id: number) => {
    setCancelTargetId(id)
    setCancelNote("")
    setIsCancelOpen(true)
  }

  const confirmCancel = async () => {
    if (!cancelTargetId) return

    try {
      await updateOrder(cancelTargetId, {
        status: "CANCELLED",
        note: cancelNote || undefined,
      })
      patchOrderInState(cancelTargetId, {
        status: "CANCELLED",
        note: cancelNote || undefined,
      })
      setIsCancelOpen(false)
      setCancelTargetId(null)
      notify.success("Đã hủy đơn hàng.")
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể hủy đơn hàng."))
    }
  }

  const handleNextStatus = async (order: Pick<OrderListItemDTO, "id" | "status">) => {
    const next = STATUS_FLOW[order.status]
    if (!next) return

    try {
      await updateOrder(order.id, { status: next })
      patchOrderInState(order.id, { status: next })
      notify.success("Đã cập nhật trạng thái đơn hàng.")
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể cập nhật trạng thái đơn hàng."))
    }
  }

  const openDetail = async (order: OrderListItemDTO) => {
    setSelectedListOrder(order)
    setSelectedOrder(normalizeDetail({}, order))
    setIsDetailOpen(true)
    setIsDetailLoading(true)

    try {
      const detail = await getOrderById(order.id) as any
      setSelectedOrder(normalizeDetail(detail?.data || detail, order))
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được chi tiết đơn hàng."))
    } finally {
      setIsDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedListOrder(null)
    setSelectedOrder(null)
  }

  const openDelete = (order: OrderListItemDTO) => {
    setDeleteTarget(order)
    setIsDeleteOpen(true)
  }

  const closeDelete = () => {
    setDeleteTarget(null)
    setIsDeleteOpen(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteOrder(deleteTarget.id)
      setOrders((prev) => prev.filter((order) => order.id !== deleteTarget.id))
      if (selectedOrder?.id === deleteTarget.id) closeDetail()
      closeDelete()
      notify.success("Đã xóa đơn hàng.")
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể xóa đơn hàng."))
    }
  }

  const handleRefreshView = () => {
    const isDefaultView = statusFilter === "ALL" && sourceFilter === "ONLINE"
    setStatusFilter("ALL")
    setSourceFilter("ONLINE")

    if (isDefaultView) {
      loadOrders(false)
    }
  }

  const indexBody = (_order: OrderListItemDTO, opts: ColumnBodyOptions) => (
    <div className="text-center text-sm text-slate-500">{opts.rowIndex + 1}</div>
  )

  const orderCodeBody = (order: OrderListItemDTO) => (
    <div className="text-center font-mono text-xs font-semibold text-[#214388]">{order.orderCode}</div>
  )

  const customerBody = (order: OrderListItemDTO) => {
    const name = order.customerName || order.receiverName || "---"
    const phone = order.customerPhone || order.receiverPhone || "---"

    return (
      <div>
        <p className="text-sm font-semibold text-slate-800">{name}</p>
        <p className="text-xs text-slate-500">{phone}</p>
      </div>
    )
  }

  const itemsBody = (order: OrderListItemDTO) => (
    <div className="text-xs text-slate-600">
      {order.items.slice(0, 2).map((item) => (
        <p key={`${order.id}-${item.id ?? item.productId}`} className="truncate">
          {item.qty}x {item.productName || `Product #${item.productId}`}
        </p>
      ))}
      {order.items.length > 2 && <p className="text-slate-400">+{order.items.length - 2} mục khác</p>}
      {order.items.length === 0 && <p className="italic text-slate-400">Chưa có sản phẩm</p>}
    </div>
  )

  const totalBody = (order: OrderListItemDTO) => (
    <div className="text-center text-sm font-semibold text-[#ef5c2c]">{fmt(order.totalAmount)}</div>
  )

  const sourceBody = (order: OrderListItemDTO) => (
    <div className="flex justify-center">
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
        {SOURCE_CONFIG[order.source] || order.source}
      </span>
    </div>
  )

  const statusBody = (order: OrderListItemDTO) => {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
    return (
      <div className="flex justify-center">
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          {statusLabel(order.status)}
        </span>
      </div>
    )
  }

  const createdAtBody = (order: OrderListItemDTO) => (
    <div className="text-center text-xs text-slate-500">{fmtDate(order.createdAt)}</div>
  )

  const actionsBody = (order: OrderListItemDTO) => {
    const actionItems: MenuItem[] = [
      {
        label: "Xem chi tiết",
        icon: "pi pi-eye",
        command: () => openDetail(order),
      },
    ]

    if (order.status === "PENDING") {
      actionItems.push({
        label: "Xác nhận",
        icon: "pi pi-check-circle",
        className: "text-emerald-600",
        command: () => handleAccept(order.id),
      })
    }

    const nextStatus = STATUS_FLOW[order.status]
    if (nextStatus) {
      actionItems.push({
        label: `Chuyển sang ${statusLabel(nextStatus).toLowerCase()}`,
        icon: order.status === "SHIPPING" ? "pi pi-check-circle" : "pi pi-arrow-right",
        className: "text-violet-600",
        command: () => handleNextStatus(order),
      })
    }

    if (!["COMPLETED", "CANCELLED"].includes(order.status)) {
      actionItems.push({
        label: "Hủy đơn",
        icon: "pi pi-times-circle",
        className: "text-rose-500",
        command: () => openCancel(order.id),
      })
    }

    actionItems.push({
      label: "Xóa",
      icon: "pi pi-trash",
      className: "text-red-500",
      command: () => openDelete(order),
    })

    return <TableActionMenu items={actionItems} />
  }

  const detail = selectedOrder
  const detailCustomerName = selectedListOrder?.customerName || detail?.receiverName || "---"
  const detailCustomerPhone = selectedListOrder?.customerPhone || detail?.receiverPhone || "---"

  return (
    <>
      <div className="flex flex-1 flex-col gap-2">
        <Toolbar
          className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          start={
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Đơn hàng online</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Quản lý đơn hàng mua sản phẩm, xác nhận và theo dõi tiến trình giao hàng.
              </p>
            </div>
          }
          end={
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-filter h-4 w-4 text-[#70829a]" />
                <span>Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as OrderStatusFilter)}
                  className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
                >
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-shopping-cart h-4 w-4 text-[#70829a]" />
                <span>Nguồn</span>
                <select
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value as OrderSourceFilter)}
                  className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
                >
                  {SOURCE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={handleRefreshView}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-4 text-sm font-medium text-[#40526b] transition hover:bg-[#f8fafc]"
                disabled={isLoading}
              >
                <i className={`pi pi-refresh h-4 w-4 ${isLoading ? "pi-spin" : ""}`} />
                Refresh
              </button>
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={<i className="pi pi-clock h-5 w-5 text-amber-500" />} label="Chờ xác nhận" value={stats.pending} color="amber" />
              <StatCard icon={<i className="pi pi-box h-5 w-5 text-violet-500" />} label="Đang xử lý" value={stats.active} color="violet" />
              <StatCard icon={<i className="pi pi-truck h-5 w-5 text-orange-500" />} label="Đang giao" value={stats.shipping} color="orange" />
              <StatCard icon={<i className="pi pi-check-circle h-5 w-5 text-emerald-500" />} label="Hoàn thành" value={stats.completed} color="emerald" />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-bold text-[#24364d]">Quản lý đơn hàng</p>
                <p className="text-sm text-[#73849b]">Bảng bên dưới là danh sách đơn hàng của cửa hàng.</p>
              </div>
              <p className="text-sm text-[#73849b]">
                Hiển thị {visibleOrders.length}/{orders.length} đơn hàng
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
              <DataTable
                value={visibleOrders}
                dataKey="id"
                size="small"
                stripedRows
                rowHover
                showGridlines
                tableStyle={{ minWidth: "82rem" }}
                emptyMessage={<div className="w-full py-2 text-center text-[#4c5f78]">Không có đơn hàng nào.</div>}
                loading={isLoading}
              >
                <Column header="TT" body={indexBody} style={{ width: "56px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Mã đơn" body={orderCodeBody} style={{ width: "130px" }} alignHeader="center" />
                <Column header="Khách hàng" body={customerBody} style={{ minWidth: "190px" }} alignHeader="left" />
                <Column header="Sản phẩm" body={itemsBody} style={{ minWidth: "230px" }} alignHeader="left" />
                <Column header="Tổng tiền" body={totalBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Nguồn" body={sourceBody} style={{ minWidth: "110px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Trạng thái" body={statusBody} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Ngày tạo" body={createdAtBody} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Thao tác" body={actionsBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
              </DataTable>
              {(hasNext || isLoadingMore) && (
                <div ref={observerTarget} className="flex h-12 w-full items-center justify-center p-4">
                  {isLoadingMore ? (
                    <i className="pi pi-spinner pi-spin text-xl text-[#4c5f78]" />
                  ) : (
                    <span className="text-sm text-transparent text-slate-500">Cuộn xuống để xem thêm</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {detail && (
        <Dialog
          visible={isDetailOpen}
          onHide={closeDetail}
          header={`Chi tiết đơn hàng ${detail.orderCode}`}
          style={{ width: "100%", maxWidth: "52rem" }}
          footer={
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
              >
                Đóng
              </button>
              {detail.status === "PENDING" && (
                <button
                  onClick={() => handleAccept(detail.id)}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Xác nhận
                </button>
              )}
              {STATUS_FLOW[detail.status] && (
                <button
                  onClick={() => handleNextStatus(detail)}
                  className="rounded-lg bg-[#214388] px-4 py-2 text-sm font-semibold text-white hover:bg-[#19356a]"
                >
                  Chuyển sang {statusLabel(STATUS_FLOW[detail.status]!).toLowerCase()}
                </button>
              )}
              {!["COMPLETED", "CANCELLED"].includes(detail.status) && (
                <button
                  onClick={() => openCancel(detail.id)}
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Hủy đơn
                </button>
              )}
            </div>
          }
        >
          <p className="mb-4 mt-0 text-sm text-[#73849b]">
            {isDetailLoading ? "Đang tải chi tiết đơn hàng..." : "Xem thông tin người mua, sản phẩm và tiến trình đơn hàng."}
          </p>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Khách hàng</p>
                <div className="space-y-3">
                  <InfoItem icon={<i className="pi pi-user h-4 w-4" />} label="Họ tên" value={detailCustomerName} />
                  <InfoItem icon={<i className="pi pi-phone h-4 w-4" />} label="Điện thoại" value={detailCustomerPhone} />
                  <InfoItem icon={<i className="pi pi-shopping-cart h-4 w-4" />} label="Nguồn" value={SOURCE_CONFIG[detail.source] || detail.source} />
                </div>
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Người nhận</p>
                <div className="space-y-3">
                  <InfoItem icon={<i className="pi pi-user h-4 w-4" />} label="Họ tên" value={detail.receiverName || "---"} />
                  <InfoItem icon={<i className="pi pi-phone h-4 w-4" />} label="Điện thoại" value={detail.receiverPhone || "---"} />
                  <InfoItem icon={<i className="pi pi-map-marker h-4 w-4" />} label="Địa chỉ" value={detail.shippingAddress || "---"} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Sản phẩm đặt hàng</p>
              <div className="space-y-2">
                {detail.items.map((item) => (
                  <div key={`${detail.id}-${item.id ?? item.productId}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-slate-700">
                      {item.qty}x {item.productName || `Product #${item.productId}`}
                    </span>
                    <span className="whitespace-nowrap font-semibold text-[#ef5c2c]">
                      {fmt(item.amount ?? (item.unitPrice || 0) * item.qty)}
                    </span>
                  </div>
                ))}
                {detail.items.length === 0 && <p className="text-sm italic text-slate-400">Chưa có sản phẩm.</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Thanh toán</p>
                <div className="space-y-2 text-sm">
                  <MoneyRow label="Tạm tính" value={detail.subtotalAmount} />
                  <MoneyRow label="Phí giao hàng" value={detail.shippingFee} />
                  <MoneyRow label="Giảm giá" value={-detail.discountAmount} />
                  <div className="flex items-center justify-between border-t border-[#f0f4f8] pt-2 font-bold">
                    <span className="text-slate-800">Tổng cộng</span>
                    <span className="text-[#ef5c2c]">{fmt(detail.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</p>
                <span className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[detail.status].bg} ${STATUS_CONFIG[detail.status].text}`}>
                  {statusLabel(detail.status)}
                </span>
                {detail.note && <p className="mt-3 text-sm text-slate-600">Ghi chú: {detail.note}</p>}
                <div className="mt-4 space-y-1 text-xs text-slate-400">
                  <p>Ngày tạo: {fmtDate(detail.createdAt)}</p>
                  <p>Cập nhật: {fmtDate(detail.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      <Dialog
        visible={isCancelOpen}
        onHide={() => setIsCancelOpen(false)}
        header="Hủy đơn hàng"
        style={{ width: "100%", maxWidth: "30rem" }}
        footer={
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCancelOpen(false)}
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Đóng
            </button>
            <button
              onClick={confirmCancel}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Xác nhận hủy
            </button>
          </div>
        }
      >
        <p className="mb-4 mt-0 text-sm text-[#73849b]">Thao tác này sẽ chuyển trạng thái đơn sang đã hủy.</p>
        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">Lý do hủy (tùy chọn)</span>
          <textarea
            rows={3}
            value={cancelNote}
            onChange={(event) => setCancelNote(event.target.value)}
            className="w-full resize-none rounded-lg border border-[#d9e1eb] px-3 py-2 text-sm outline-none focus:border-rose-400"
          />
        </label>
      </Dialog>

      <Dialog
        visible={isDeleteOpen}
        onHide={closeDelete}
        header="Xác nhận xóa đơn hàng"
        style={{ width: "100%", maxWidth: "30rem" }}
        footer={
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeDelete}
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-[#d93b1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c23218]"
            >
              Xóa đơn hàng
            </button>
          </div>
        }
      >
        <p className="mb-2 mt-0 text-sm text-slate-500">Đơn hàng bị xóa sẽ không còn hiển thị trong danh sách.</p>
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa đơn {deleteTarget?.orderCode || ""}?</p>
      </Dialog>
    </>
  )
}

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: number | string
  color: "amber" | "violet" | "emerald" | "orange"
}

function StatCard({ icon, label, value, color }: StatCardProps) {
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
      <p className="text-3xl font-bold leading-none text-[#24364d]">{value}</p>
    </div>
  )
}

type InfoItemProps = { icon: React.ReactNode; label: string; value: React.ReactNode }
function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-[#70829a]">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="break-words font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

type MoneyRowProps = { label: string; value: number }
function MoneyRow({ label, value }: MoneyRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{fmt(value)}</span>
    </div>
  )
}
