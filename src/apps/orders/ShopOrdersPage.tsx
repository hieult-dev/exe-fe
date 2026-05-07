import React, { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Dialog } from "primereact/dialog"
import { DataTable } from "primereact/datatable"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import type { MenuItem } from "primereact/menuitem"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { getInvoiceByOrderId } from "@/apps/invoices/api/invoiceApi"
import type { InvoiceDetailDTO } from "@/apps/invoices/model"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { deleteOrder, getOrderById, getOrders, updateOrder } from "@/apps/orders/api/orderApi"
import { submitGhtkOrder } from "@/apps/orders/api/ghtkOrderApi"
import { InvoiceDetailDialog } from "@/apps/invoices/components/InvoiceDetailDialog"
import { ShopOrderDetailModal } from "@/apps/orders/components/ShopOrderDetailModal"
import { SubmitGhtkOrderModal } from "@/apps/orders/components/SubmitGhtkOrderModal"
import type {
  OrderDetailDTO,
  OrderItemDTO,
  OrderListItemDTO,
  OrderSource,
  OrderSourceFilter,
  OrderStatus,
  OrderStatusFilter,
  SubmitGhtkOrderRequest,
} from "@/apps/orders/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND, formatDateForApi, formatDateOnlyViVN, formatDateTimeViVN } from "@/common/utils/format"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }
  return null
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận", bg: "bg-sky-100", text: "text-sky-700" },
  PACKING: { label: "Đang đóng gói", bg: "bg-violet-100", text: "text-violet-700" },
  WAITING_GHTK_PICKUP: { label: "Chờ GHTK đến lấy", bg: "bg-indigo-100", text: "text-indigo-700" },
  SHIPPING: { label: "Đang giao", bg: "bg-orange-100", text: "text-orange-700" },
  COMPLETED: { label: "Hoàn thành", bg: "bg-emerald-100", text: "text-emerald-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600" },
}

const SOURCE_CONFIG: Record<OrderSource, string> = {
  ONLINE: "Online",
  STAFF: "Nhân viên",
}

const SOURCE_BADGE_CONFIG: Record<OrderSource, { bg: string; text: string }> = {
  ONLINE: { bg: "bg-sky-100", text: "text-sky-700" },
  STAFF: { bg: "bg-violet-100", text: "text-violet-700" },
}

const STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  CONFIRMED: "PACKING",
  WAITING_GHTK_PICKUP: "SHIPPING",
  SHIPPING: "COMPLETED",
}

const STATUS_FILTER_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: STATUS_CONFIG.PENDING.label },
  { value: "CONFIRMED", label: STATUS_CONFIG.CONFIRMED.label },
  { value: "PACKING", label: STATUS_CONFIG.PACKING.label },
  { value: "WAITING_GHTK_PICKUP", label: STATUS_CONFIG.WAITING_GHTK_PICKUP.label },
  { value: "SHIPPING", label: STATUS_CONFIG.SHIPPING.label },
  { value: "COMPLETED", label: STATUS_CONFIG.COMPLETED.label },
  { value: "CANCELLED", label: STATUS_CONFIG.CANCELLED.label },
]

const SOURCE_FILTER_OPTIONS: { value: OrderSourceFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả nguồn" },
  { value: "ONLINE", label: SOURCE_CONFIG.ONLINE },
  { value: "STAFF", label: SOURCE_CONFIG.STAFF },
]

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
    userId: order.userId ?? null,
    userFullName: order.userFullName ?? null,
    userPhone: order.userPhone ?? null,
    userEmail: order.userEmail ?? null,
    userAvatarUrlPreview: order.userAvatarUrlPreview ?? null,
    customerId: order.customerId ?? null,
    customer: order.customer ?? null,
    customerAddressId: order.customerAddressId ?? null,
    customerAddress: order.customerAddress ?? null,
    userAddressId: order.userAddressId ?? null,
    shippingSnapshot: order.shippingSnapshot ?? null,
    items: Array.isArray(order.items) ? order.items.map(normalizeItem) : [],
    totalAmount: Number(order.totalAmount ?? 0),
    status,
    statusLabel: order.statusLabel || statusLabel(status),
    source,
    createdAt: order.createdAt || "",
  }
}

function getOrderCustomerName(order: Pick<OrderListItemDTO, "customer" | "userFullName" | "userId"> | null | undefined) {
  if (!order) return undefined
  return order.customer?.fullName || order.userFullName || (order.userId ? `User #${order.userId}` : undefined)
}

function getOrderCustomerContact(
  order: Pick<OrderListItemDTO, "customer" | "userPhone" | "userEmail"> | null | undefined,
) {
  if (!order) return undefined
  return order.customer?.phone || order.userPhone || order.userEmail || undefined
}

function getOrderDelivery(order: OrderListItemDTO | OrderDetailDTO | null | undefined) {
  if (!order) return null
  if (order.customerAddress) {
    return {
      name: order.customerAddress.name,
      tel: order.customerAddress.tel,
      address: order.customerAddress.address,
      hamlet: order.customerAddress.hamlet,
      ward: order.customerAddress.ward,
      district: order.customerAddress.district,
      province: order.customerAddress.province,
      street: null,
    }
  }

  const snapshot = order.shippingSnapshot
  if (snapshot) {
    return {
      name: snapshot.receiverName,
      tel: snapshot.receiverPhone,
      address: snapshot.address,
      hamlet: snapshot.hamlet,
      ward: snapshot.ward,
      district: snapshot.district,
      province: snapshot.province,
      street: snapshot.street,
    }
  }

  return null
}

export function ShopOrdersPage() {
  const location = useLocation()
  const { globalSearchQuery } = useShopOwnerContext()
  const highlightedOrderId = useMemo(
    () => getNumber(new URLSearchParams(location.search).get("orderId")),
    [location.search],
  )
  const highlightedOrderFetchRef = useRef<number | null>(null)

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
  const [sourceFilter, setSourceFilter] = useState<OrderSourceFilter>("ALL")
  const [createdDateFilter, setCreatedDateFilter] = useState<Date | null>(null)

  const [selectedDetailOrder, setSelectedDetailOrder] = useState<OrderDetailDTO | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const [ghtkTarget, setGhtkTarget] = useState<OrderListItemDTO | null>(null)
  const [isGhtkOpen, setIsGhtkOpen] = useState(false)
  const [isGhtkSubmitting, setIsGhtkSubmitting] = useState(false)

  const [selectedListOrder, setSelectedListOrder] = useState<OrderListItemDTO | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetailDTO | null>(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false)

  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelNote, setCancelNote] = useState("")
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrderListItemDTO | null>(null)

  useEffect(() => {
    if (!highlightedOrderId) return
    setStatusFilter("ALL")
    setSourceFilter("ALL")
    setCreatedDateFilter(null)
  }, [highlightedOrderId])

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
        createdDate: formatDateForApi(createdDateFilter),
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
    if (!highlightedOrderId) return
    if (orders.some((order) => order.id === highlightedOrderId)) return
    if (highlightedOrderFetchRef.current === highlightedOrderId) return

    let cancelled = false
    highlightedOrderFetchRef.current = highlightedOrderId

    getOrderById(highlightedOrderId)
      .then((detail) => {
        if (cancelled) return
        const highlightedOrder = normalizeListItem(detail)
        if (highlightedOrder.id <= 0) return

        setOrders((prev) => {
          if (prev.some((order) => order.id === highlightedOrder.id)) {
            return prev.map((order) => (order.id === highlightedOrder.id ? highlightedOrder : order))
          }

          return [highlightedOrder, ...prev]
        })
      })
      .catch((error) => console.error("[ORDER HIGHLIGHT]", error))
      .finally(() => {
        if (!cancelled && highlightedOrderFetchRef.current === highlightedOrderId) {
          highlightedOrderFetchRef.current = null
        }
      })

    return () => {
      cancelled = true
    }
  }, [highlightedOrderId, orders])

  useEffect(() => {
    loadOrders(false)
  }, [createdDateFilter, statusFilter, sourceFilter])

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
  }, [createdDateFilter, hasNext, isLoading, isLoadingMore, nextCursor, statusFilter, sourceFilter])

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length
    const shipping = orders.filter((order) => order.status === "SHIPPING").length
    const completed = orders.filter((order) => order.status === "COMPLETED").length
    return { pending, shipping, completed }
  }, [orders])

  const visibleOrders = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()
    if (!keyword) return orders

    return orders.filter((order) => {
      if (highlightedOrderId && order.id === highlightedOrderId) return true

      const searchable = [
        order.orderCode,
        getOrderCustomerName(order),
        getOrderCustomerContact(order),
        order.shippingSnapshot?.address,
        order.shippingSnapshot?.receiverName,
        order.shippingSnapshot?.receiverPhone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchable.includes(keyword)
    })
  }, [orders, debouncedSearch, highlightedOrderId])

  useEffect(() => {
    if (!highlightedOrderId || !visibleOrders.some((order) => order.id === highlightedOrderId)) return

    const frameId = window.requestAnimationFrame(() => {
      document.querySelector(".order-row-highlight")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [highlightedOrderId, visibleOrders])

  const patchOrderInState = (id: number, patch: Partial<OrderListItemDTO & { note?: string }>) => {
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
    setSelectedDetailOrder(null)
    setIsDetailOpen(true)
    setIsDetailLoading(true)

    try {
      const detail = await getOrderById(order.id)
      setSelectedDetailOrder(detail)
    } catch (err) {
      setIsDetailOpen(false)
      notify.error(getErrorMessage(err, "Không tải được chi tiết đơn hàng."))
    } finally {
      setIsDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedDetailOrder(null)
  }

  const openGhtkSubmit = (order: OrderListItemDTO) => {
    setGhtkTarget(order)
    setIsGhtkOpen(true)
  }

  const closeGhtkSubmit = () => {
    if (isGhtkSubmitting) return
    setIsGhtkOpen(false)
    setGhtkTarget(null)
  }

  const confirmGhtkSubmit = async (data: SubmitGhtkOrderRequest) => {
    if (!ghtkTarget) return

    setIsGhtkSubmitting(true)
    try {
      const response = await submitGhtkOrder(ghtkTarget.id, data)

      if (!response.success) {
        notify.error(response.error || response.message || "Không thể gửi đơn sang GHTK.")
        return
      }

      notify.success(response.message || "Đã gửi đơn sang GHTK.")
      if (response.warning) notify.warn(response.warning)
      setIsGhtkOpen(false)
      setGhtkTarget(null)
      loadOrders(false)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể gửi đơn sang GHTK."))
    } finally {
      setIsGhtkSubmitting(false)
    }
  }

  const openInvoice = async (order: OrderListItemDTO) => {
    setSelectedListOrder(order)
    setSelectedInvoice(null)
    setIsInvoiceOpen(true)
    setIsInvoiceLoading(true)

    try {
      const invoice = await getInvoiceByOrderId(order.id)
      setSelectedInvoice(invoice)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được hóa đơn của đơn hàng."))
    } finally {
      setIsInvoiceLoading(false)
    }
  }

  const closeInvoice = () => {
    setIsInvoiceOpen(false)
    setSelectedListOrder(null)
    setSelectedInvoice(null)
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
      if (selectedDetailOrder?.id === deleteTarget.id) closeDetail()
      if (ghtkTarget?.id === deleteTarget.id) closeGhtkSubmit()
      if (selectedListOrder?.id === deleteTarget.id) closeInvoice()
      closeDelete()
      notify.success("Đã xóa đơn hàng.")
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể xóa đơn hàng."))
    }
  }

  const handleRefreshView = () => {
    const isDefaultView = statusFilter === "ALL" && sourceFilter === "ALL" && createdDateFilter === null
    setStatusFilter("ALL")
    setSourceFilter("ALL")
    setCreatedDateFilter(null)

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
    const name = getOrderCustomerName(order) || "---"
    const phone = getOrderCustomerContact(order) || "---"

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
    <div className="text-center text-sm font-semibold text-[#ef5c2c]">{formatCurrencyVND(order.totalAmount)}</div>
  )

  const sourceBody = (order: OrderListItemDTO) => (
    <div className="flex justify-center">
      <span className={`rounded-md px-2 py-1 text-xs font-medium ${SOURCE_BADGE_CONFIG[order.source]?.bg || "bg-slate-100"} ${SOURCE_BADGE_CONFIG[order.source]?.text || "text-slate-700"}`}>
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
    <div className="text-center text-xs text-slate-500">{formatDateTimeViVN(order.createdAt, "---")}</div>
  )

  const actionsBody = (order: OrderListItemDTO) => {
    const actionItems: MenuItem[] = []

    actionItems.push({
      label: "Xem chi tiết",
      icon: "pi pi-info-circle",
      command: () => openDetail(order),
    })

    if (order.status === "COMPLETED") {
      actionItems.push({
        label: "Xem hóa đơn",
        icon: "pi pi-eye",
        command: () => openInvoice(order),
      })
    }

    if (order.status === "PENDING") {
      actionItems.push({
        label: "Xác nhận",
        icon: "pi pi-check-circle",
        className: "text-emerald-600",
        command: () => handleAccept(order.id),
      })
    }

    if (order.status === "PACKING") {
      actionItems.push({
        label: "Chuyển cho bên GHTK",
        icon: "pi pi-truck",
        className: "text-violet-600",
        command: () => openGhtkSubmit(order),
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

  const orderRowClassName = (order: OrderListItemDTO) => {
    return highlightedOrderId && order.id === highlightedOrderId ? "order-row-highlight" : ""
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-2">
        <Toolbar
          className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          start={
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Đơn hàng</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Quản lý đơn hàng online và đơn bán tại quầy, xác nhận và theo dõi tiến trình.
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
              <div className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-calendar h-4 w-4 text-[#70829a]" />
                <span>Ngày tạo</span>
                <Calendar
                  value={createdDateFilter}
                  onChange={(event) => setCreatedDateFilter(event.value instanceof Date ? event.value : null)}
                  dateFormat="dd/mm/yy"
                  placeholder="Tất cả"
                  readOnlyInput
                  showButtonBar
                  inputClassName="!w-24 !border-0 !bg-transparent !p-0 !text-sm !font-medium !text-[#24364d] !shadow-none !outline-none"
                  className="[&_.p-datepicker-trigger]:!hidden [&_.p-inputtext]:!h-auto"
                  panelClassName="text-sm"
                />
                {createdDateFilter && (
                  <Button
                    type="button"
                    icon="pi pi-times"
                    text
                    rounded
                    aria-label={`Bỏ lọc ngày ${formatDateOnlyViVN(createdDateFilter)}`}
                    className="!m-0 !h-6 !w-6 !p-0 !text-slate-400 hover:!bg-slate-100"
                    onClick={() => setCreatedDateFilter(null)}
                  />
                )}
              </div>
              <Button
                type="button"
                icon={`pi pi-refresh ${isLoading ? "pi-spin" : ""}`}
                label="Refresh"
                onClick={handleRefreshView}
                disabled={isLoading}
                className="!m-0 !inline-flex !h-9 !items-center !justify-center !rounded-md !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-medium !text-[#40526b] hover:!bg-[#f8fafc]"
              />
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard icon={<i className="pi pi-clock h-5 w-5 text-amber-500" />} label="Chờ xác nhận" value={stats.pending} color="amber" />
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
                rowClassName={orderRowClassName}
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

      <SubmitGhtkOrderModal
        visible={isGhtkOpen}
        submitting={isGhtkSubmitting}
        orderCode={ghtkTarget?.orderCode}
        onHide={closeGhtkSubmit}
        onSubmit={confirmGhtkSubmit}
      />

      <ShopOrderDetailModal
        visible={isDetailOpen}
        loading={isDetailLoading}
        order={selectedDetailOrder}
        onHide={closeDetail}
      />

      <InvoiceDetailDialog
        visible={isInvoiceOpen}
        loading={isInvoiceLoading}
        invoice={selectedInvoice}
        reference={{
          code: selectedListOrder?.orderCode,
          customerName: getOrderCustomerName(selectedListOrder),
          customerPhone: getOrderCustomerContact(selectedListOrder),
          delivery: getOrderDelivery(selectedListOrder),
          emptyMessage: "Không tìm thấy hóa đơn cho đơn hàng này.",
        }}
        onHide={closeInvoice}
      />

      <Dialog
        visible={isCancelOpen}
        onHide={() => setIsCancelOpen(false)}
        header="Hủy đơn hàng"
        style={{ width: "100%", maxWidth: "30rem" }}
        footer={
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Đóng"
              icon="pi pi-times"
              onClick={() => setIsCancelOpen(false)}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
            <Button
              type="button"
              label="Xác nhận hủy"
              icon="pi pi-times-circle"
              onClick={confirmCancel}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-rose-500 !bg-rose-500 !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-rose-600 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
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
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Hủy"
              icon="pi pi-times"
              onClick={closeDelete}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
            <Button
              type="button"
              label="Xóa đơn hàng"
              icon="pi pi-trash"
              onClick={confirmDelete}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d93b1f] !bg-[#d93b1f] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#c23218] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
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

