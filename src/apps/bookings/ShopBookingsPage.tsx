import React, { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Dialog } from "primereact/dialog"
import { PickList, type PickListChangeEvent } from "primereact/picklist"
import { DataTable } from "primereact/datatable"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import { StaffAvatarGroup } from "@/common/component/StaffAvatarGroup"
import type { MenuItem } from "primereact/menuitem"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { getBookingById, getBookings, updateBookingStatus, assignBooking, getBookingInvoice } from "@/apps/bookings/api/bookingApi"
import { getActiveStaff, type ShopMemberDTO } from "@/apps/members/api/shopMemberApi"
import type { BookingDTO, BookingStatus, BookingStatusFilter } from "@/apps/bookings/model"
import { ShopBookingDetailModal } from "@/apps/bookings/ShopBookingDetailModal"
import { InvoiceDetailDialog } from "@/apps/invoices/components/InvoiceDetailDialog"
import type { InvoiceDetailDTO } from "@/apps/invoices/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND, formatDateForApi, formatDateOnlyViVN, formatDateTimeViVN } from "@/common/utils/format"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const STATUS_FILTER_OPTIONS: { value: BookingStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "DRAFT", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "IN_PROGRESS", label: "Đang thực hiện" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Khách hủy" },
]

function isTodayBooking(booking: BookingDTO) {
  const value = booking.startAt || booking.time
  if (!value) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  const today = new Date()
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
}

function getBookingCustomerName(booking: BookingDTO | null | undefined) {
  if (!booking) return undefined
  return booking.customerName || booking.userFullName || (booking.userId ? `User #${booking.userId}` : undefined)
}

function getBookingCustomerContact(booking: BookingDTO | null | undefined) {
  if (!booking) return undefined
  return booking.customerPhone || booking.userPhone || booking.userEmail || undefined
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ShopBookingsPage() {
  const location = useLocation()
  const { globalSearchQuery } = useShopOwnerContext()
  const highlightedBookingId = useMemo(
    () => getNumber(new URLSearchParams(location.search).get("bookingId")),
    [location.search],
  )
  const highlightedBookingFetchRef = useRef<number | null>(null)

  // ── Debounce search ───────────────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState(globalSearchQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(globalSearchQuery), 500)
    return () => clearTimeout(timer)
  }, [globalSearchQuery])

  // ── Data states ───────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<BookingDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL")
  const [createDateFilter, setCreateDateFilter] = useState<Date | null>(null)
  const [appointmentDateFilter, setAppointmentDateFilter] = useState<Date | null>(null)

  // ── Dialog states ─────────────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [assignTargetId, setAssignTargetId] = useState<number | null>(null)
  const [assignSource, setAssignSource] = useState<ShopMemberDTO[]>([])
  const [assignTarget, setAssignTarget] = useState<ShopMemberDTO[]>([])
  const [isAssignLoading, setIsAssignLoading] = useState(false)
  const [invoiceBooking, setInvoiceBooking] = useState<BookingDTO | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetailDTO | null>(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false)
  const [todayConfirmedCount, setTodayConfirmedCount] = useState(0)

  useEffect(() => {
    if (highlightedBookingId === null) return

    setStatusFilter("ALL")
    setCreateDateFilter(null)
    setAppointmentDateFilter(null)
  }, [highlightedBookingId])

  // ── Load bookings (mirrors services pattern) ──────────────────────────────
  const loadBookings = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (!hasNext || isLoadingMore) return
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const currentCursor = isLoadMore ? nextCursor : null
      const result = await getBookings(
        20,
        currentCursor,
        debouncedSearch,
        statusFilter,
        formatDateForApi(createDateFilter),
        formatDateForApi(appointmentDateFilter),
      )
      const mapped = result.content

      if (isLoadMore) {
        setBookings((prev) => {
          const prevIds = new Set(prev.map((p) => p.id))
          const uniqueNew = mapped.filter((n) => !prevIds.has(n.id))
          return [...prev, ...uniqueNew]
        })
      } else {
        setBookings(mapped)
      }

      setNextCursor(result.nextCursor ?? null)
      setHasNext(result.hasNext ?? false)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được danh sách lịch hẹn."))
      console.error("Failed to load bookings:", err)
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  const loadTodayConfirmedCount = async () => {
    try {
      let cursor: number | null = null
      let count = 0

      do {
        const result = await getBookings(100, cursor, "", "CONFIRMED")
        count += result.content.filter(isTodayBooking).length
        cursor = result.hasNext ? result.nextCursor : null
      } while (cursor !== null)

      setTodayConfirmedCount(count)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được số lịch hẹn đã xác nhận hôm nay."))
    }
  }

  // ── Auto-load on search/filter change ─────────────────────────────────────
  useEffect(() => {
    if (highlightedBookingId === null) return
    if (bookings.some((booking) => booking.id === highlightedBookingId)) return
    if (highlightedBookingFetchRef.current === highlightedBookingId) return

    let cancelled = false
    highlightedBookingFetchRef.current = highlightedBookingId

    getBookingById(highlightedBookingId)
      .then((booking) => {
        if (cancelled || !booking || booking.id <= 0) return

        setBookings((prev) => {
          if (prev.some((item) => item.id === booking.id)) {
            return prev.map((item) => (item.id === booking.id ? booking : item))
          }
          return [booking, ...prev]
        })
      })
      .catch((error) => console.error("[BOOKING HIGHLIGHT]", error))
      .finally(() => {
        if (!cancelled && highlightedBookingFetchRef.current === highlightedBookingId) {
          highlightedBookingFetchRef.current = null
        }
      })

    return () => {
      cancelled = true
    }
  }, [highlightedBookingId, bookings])

  useEffect(() => {
    loadBookings(false)
  }, [appointmentDateFilter, createDateFilter, debouncedSearch, statusFilter])

  useEffect(() => {
    loadTodayConfirmedCount()
  }, [])

  // ── Infinite scroll observer ──────────────────────────────────────────────
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadBookings(true)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [appointmentDateFilter, createDateFilter, hasNext, isLoading, isLoadingMore, nextCursor, statusFilter])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const DRAFT = bookings.filter((b) => b.status === "DRAFT").length
    const active = bookings.filter((b) => b.status === "IN_PROGRESS").length
    return { DRAFT, active }
  }, [bookings])

  useEffect(() => {
    if (highlightedBookingId === null || !bookings.some((booking) => booking.id === highlightedBookingId)) return

    const frameId = window.requestAnimationFrame(() => {
      document.querySelector(".booking-row-highlight")?.scrollIntoView({ behavior: "smooth", block: "center" })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [highlightedBookingId, bookings])

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleAccept = async (id: number) => {
    try {
      await updateBookingStatus(id, "CONFIRMED")
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CONFIRMED" as BookingStatus, statusLabel: STATUS_CONFIG.CONFIRMED.label } : b)))
      notify.success("Đã xác nhận lịch hẹn.")
      loadBookings(false)
      loadTodayConfirmedCount()
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể xác nhận lịch hẹn."))
    }
  }

  const openReject = (id: number) => {
    setRejectTargetId(id)
    setRejectNote("")
    setIsRejectOpen(true)
  }

  const confirmReject = async () => {
    if (!rejectTargetId) return
    try {
      await updateBookingStatus(rejectTargetId, "REJECTED", rejectNote || undefined)
      setBookings((prev) =>
        prev.map((b) => (b.id === rejectTargetId ? { ...b, status: "REJECTED" as BookingStatus, statusLabel: STATUS_CONFIG.REJECTED.label } : b)),
      )
      setIsRejectOpen(false)
      setRejectTargetId(null)
      notify.success("Đã từ chối lịch hẹn.")
      loadBookings(false)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể từ chối lịch hẹn."))
    }
  }

  const handleNextStatus = async (booking: BookingDTO) => {
    const next = STATUS_FLOW[booking.status]
    if (!next) return false
    try {
      await updateBookingStatus(booking.id, next)
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: next, statusLabel: STATUS_CONFIG[next]?.label || "" } : b)))
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: next, statusLabel: STATUS_CONFIG[next]?.label || "" } : prev))
      }
      loadBookings(false)
      loadTodayConfirmedCount()
      return true
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể cập nhật trạng thái."))
      return false
    }
  }

  const openDetail = (booking: BookingDTO) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const openInvoice = async (booking: BookingDTO) => {
    if (booking.status !== "COMPLETED") {
      notify.error("Chỉ có thể xem hóa đơn khi lịch hẹn đã hoàn thành.")
      return
    }

    setInvoiceBooking(booking)
    setSelectedInvoice(null)
    setIsInvoiceOpen(true)
    setIsInvoiceLoading(true)

    try {
      const invoice = await getBookingInvoice(booking.id)
      setSelectedInvoice(invoice)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được hóa đơn của lịch hẹn."))
    } finally {
      setIsInvoiceLoading(false)
    }
  }

  const closeInvoice = () => {
    setIsInvoiceOpen(false)
    setInvoiceBooking(null)
    setSelectedInvoice(null)
  }

  // ── Assign staff ──────────────────────────────────────────────────────────
  const openAssign = async (id: number, bookingOverride?: BookingDTO) => {
    const booking = bookingOverride ?? bookings.find((item) => item.id === id) ?? (selectedBooking?.id === id ? selectedBooking : null)

    setAssignTargetId(id)
    setAssignSource([])
    setAssignTarget([])
    setIsAssignOpen(true)
    setIsAssignLoading(true)

    try {
      const staffList = await getActiveStaff()
      const assignedStaffIdSet = new Set(booking?.assignedStaffs.map((staff) => staff.userId) ?? [])
      const assignedStaff = staffList.filter((staff) => assignedStaffIdSet.has(staff.userId))

      setAssignTarget(assignedStaff)
      setAssignSource(staffList.filter((staff) => !assignedStaffIdSet.has(staff.userId)))
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được danh sách nhân viên."))
    } finally {
      setIsAssignLoading(false)
    }
  }

  const confirmAssign = async () => {
    if (!assignTargetId || assignTarget.length === 0) return
    const staffUserIds = assignTarget
      .map((member) => Number(member.userId))
      .filter((id) => Number.isFinite(id))
    if (staffUserIds.length === 0) return

    try {
      await assignBooking(assignTargetId, staffUserIds)
      setIsAssignOpen(false)
      setAssignTargetId(null)
      notify.success("Đã gán nhân viên phụ trách.")
      loadBookings(false)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể gán nhân viên."))
    }
  }

  const handleRefreshView = () => {
    setStatusFilter("ALL")
    setCreateDateFilter(null)
    setAppointmentDateFilter(null)
    if (statusFilter === "ALL" && createDateFilter === null && appointmentDateFilter === null) {
      loadBookings(false)
    }
  }

  // ── Column bodies ─────────────────────────────────────────────────────────
  const indexBody = (_: BookingDTO, opts: ColumnBodyOptions) => (
    <div className="text-center text-sm text-slate-500">{opts.rowIndex + 1}</div>
  )

  const bookingCodeBody = (booking: BookingDTO) => (
    <div className="text-center font-mono text-xs font-semibold text-[#214388]">{booking.bookingCode}</div>
  )

  const customerBody = (booking: BookingDTO) => (
    <div>
      <p className="text-sm font-semibold text-slate-800">{getBookingCustomerName(booking) || "---"}</p>
      <p className="text-xs text-slate-500">{getBookingCustomerContact(booking) || "---"}</p>
    </div>
  )

  const itemsBody = (booking: BookingDTO) => (
    <div className="text-xs text-slate-600">
      {booking.items.slice(0, 2).map((item, i) => (
        <p key={i} className="truncate">
          {item.quantity}× {item.name}
        </p>
      ))}
      {booking.items.length > 2 && <p className="text-slate-400">+{booking.items.length - 2} mục khác</p>}
      {booking.items.length === 0 && <p className="text-slate-400 italic">Chưa có dịch vụ</p>}
    </div>
  )

  const totalBody = (booking: BookingDTO) => (
    <div className="text-center text-sm font-semibold text-[#ef5c2c]">{formatCurrencyVND(booking.totalAmount)}</div>
  )

  const timeBody = (booking: BookingDTO) => (
    <div className="text-center text-xs text-slate-500">{formatDateTimeViVN(booking.time)}</div>
  )

  const statusBody = (booking: BookingDTO) => {
    const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.DRAFT
    return (
      <div className="flex justify-center">
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          {booking.statusLabel || cfg.label}
        </span>
      </div>
    )
  }

  const assignBody = (booking: BookingDTO) => {
    return <StaffAvatarGroup staffs={booking.assignedStaffs} maxVisible={4} />
  }

  const createdAtBody = (booking: BookingDTO) => (
    <div className="text-center text-xs text-slate-500">{formatDateTimeViVN(booking.createdAt)}</div>
  )

  const actionsBody = (booking: BookingDTO) => {
    const actionItems: MenuItem[] = [
      {
        label: "Xem chi tiết",
        icon: "pi pi-eye",
        command: () => openDetail(booking),
      },
    ]

    if (booking.status === "COMPLETED") {
      actionItems.push({
        label: "Xem hóa đơn",
        icon: "pi pi-file",
        className: "text-[#214388]",
        command: () => openInvoice(booking),
      })
    }

    if (booking.status === "DRAFT") {
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
        },
      )
    }

    const nextStatus = STATUS_FLOW[booking.status]
    if (nextStatus) {
      actionItems.push({
        label: "Cập nhật tiến độ",
        icon: booking.status === "CONFIRMED" ? "pi pi-play-circle" : "pi pi-check-circle",
        className: "text-violet-600",
        command: () => handleNextStatus(booking),
      })
    }

    // Gán nhân viên chỉ trước khi bắt đầu thực hiện.
    if (booking.status === "CONFIRMED") {
      actionItems.push({
        label: booking.assignedStaffs.length ? "Đổi nhân viên" : "Gán nhân viên",
        icon: "pi pi-user-plus",
        className: "text-sky-600",
        command: () => openAssign(booking.id),
      })
    }

    return <TableActionMenu items={actionItems} />
  }

  const bookingRowClassName = (booking: BookingDTO) => {
    return highlightedBookingId !== null && booking.id === highlightedBookingId ? "booking-row-highlight" : ""
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-1 flex-col gap-2">
        <Toolbar
          className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          start={
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Lịch dịch vụ (Bookings)</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Quản lý lịch hẹn dịch vụ — sắp xếp thời gian và phân bổ nhân viên.
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
                  onChange={(e) => setStatusFilter(e.target.value as BookingStatusFilter)}
                  className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
                >
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-calendar h-4 w-4 text-[#70829a]" />
                <span>Ngày tạo</span>
                <Calendar
                  value={createDateFilter}
                  onChange={(event) => setCreateDateFilter(event.value instanceof Date ? event.value : null)}
                  dateFormat="dd/mm/yy"
                  placeholder="Tất cả"
                  readOnlyInput
                  showButtonBar
                  inputClassName="!w-24 !border-0 !bg-transparent !p-0 !text-sm !font-medium !text-[#24364d] !shadow-none !outline-none"
                  className="[&_.p-datepicker-trigger]:!hidden [&_.p-inputtext]:!h-auto"
                  panelClassName="text-sm"
                />
                {createDateFilter && (
                  <Button
                    type="button"
                    icon="pi pi-times"
                    text
                    rounded
                    aria-label={`Bỏ lọc ngày ${formatDateOnlyViVN(createDateFilter)}`}
                    className="!m-0 !h-6 !w-6 !p-0 !text-slate-400 hover:!bg-slate-100"
                    onClick={() => setCreateDateFilter(null)}
                  />
                )}
              </div>
              <div className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-calendar h-4 w-4 text-[#70829a]" />
                <span>Ngày hẹn</span>
                <Calendar
                  value={appointmentDateFilter}
                  onChange={(event) => setAppointmentDateFilter(event.value instanceof Date ? event.value : null)}
                  dateFormat="dd/mm/yy"
                  placeholder="Tất cả"
                  readOnlyInput
                  showButtonBar
                  inputClassName="!w-24 !border-0 !bg-transparent !p-0 !text-sm !font-medium !text-[#24364d] !shadow-none !outline-none"
                  className="[&_.p-datepicker-trigger]:!hidden [&_.p-inputtext]:!h-auto"
                  panelClassName="text-sm"
                />
                {appointmentDateFilter && (
                  <Button
                    type="button"
                    icon="pi pi-times"
                    text
                    rounded
                    aria-label={`Bỏ lọc ngày hẹn ${formatDateOnlyViVN(appointmentDateFilter)}`}
                    className="!m-0 !h-6 !w-6 !p-0 !text-slate-400 hover:!bg-slate-100"
                    onClick={() => setAppointmentDateFilter(null)}
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
            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard icon={<i className="pi pi-clock h-5 w-5 text-amber-500" />} label="Chờ xác nhận" value={stats.DRAFT} color="amber" />
              <StatCard
                icon={<i className="pi pi-calendar h-5 w-5 text-sky-500" />}
                label="Đã xác nhận hôm nay"
                value={todayConfirmedCount}
                color="blue"
              />
              <StatCard icon={<i className="pi pi-wrench h-5 w-5 text-violet-500" />} label="Đang thực hiện" value={stats.active} color="violet" />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-bold text-[#24364d]">Quản lý lịch hẹn</p>
                <p className="text-sm text-[#73849b]">Bảng bên dưới là danh sách lịch hẹn hiện có của cửa hàng.</p>
              </div>
              <p className="text-sm text-[#73849b]">Hiển thị {bookings.length} lịch hẹn</p>
            </div>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
              <DataTable
                value={bookings}
                dataKey="id"
                size="small"
                stripedRows
                rowHover
                rowClassName={bookingRowClassName}
                showGridlines
                tableStyle={{ minWidth: "80rem" }}
                emptyMessage={
                  <div className="w-full py-2 text-center text-[#4c5f78]">Không có lịch hẹn nào.</div>
                }
                loading={isLoading}
              >
                <Column header="TT" body={indexBody} style={{ width: "56px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Mã Code" body={bookingCodeBody} style={{ width: "130px" }} alignHeader="center" />
                <Column header="Khách hàng" body={customerBody} style={{ minWidth: "180px" }} alignHeader="left" />
                <Column header="Dịch vụ" body={itemsBody} style={{ minWidth: "200px" }} alignHeader="left" />
                <Column header="Tổng tiền" body={totalBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Thời gian hẹn" body={timeBody} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Trạng thái" body={statusBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Phụ trách" body={assignBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
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

      <ShopBookingDetailModal
        visible={isDetailOpen}
        booking={selectedBooking}
        onHide={() => setIsDetailOpen(false)}
        onAccept={handleAccept}
        onReject={openReject}
        onNextStatus={handleNextStatus}
        onAssign={(booking) => openAssign(booking.id, booking)}
        onLoaded={setSelectedBooking}
      />

      <InvoiceDetailDialog
        visible={isInvoiceOpen}
        loading={isInvoiceLoading}
        invoice={selectedInvoice}
        reference={{
          code: invoiceBooking?.bookingCode,
          customerName: getBookingCustomerName(invoiceBooking),
          customerPhone: getBookingCustomerContact(invoiceBooking),
          emptyMessage: "Không tìm thấy hóa đơn cho lịch hẹn này.",
        }}
        onHide={closeInvoice}
      />

      {/* ── Reject dialog ──────────────────────────────────────────────────── */}
      <Dialog
        visible={isRejectOpen}
        onHide={() => setIsRejectOpen(false)}
        header="Từ chối lịch hẹn"
        style={{ width: "100%", maxWidth: "30rem" }}
        footer={
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Hủy"
              icon="pi pi-times"
              onClick={() => setIsRejectOpen(false)}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
            <Button
              type="button"
              label="Xác nhận từ chối"
              icon="pi pi-times-circle"
              onClick={confirmReject}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-rose-500 !bg-rose-500 !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-rose-600 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
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

      {/* ── Assign staff dialog ────────────────────────────────────────────── */}
      <Dialog
        visible={isAssignOpen}
        onHide={() => setIsAssignOpen(false)}
        header="Gán nhân viên phụ trách"
        style={{ width: "100%", maxWidth: "56rem" }}
        footer={
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Hủy"
              icon="pi pi-times"
              onClick={() => setIsAssignOpen(false)}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
            <Button
              type="button"
              label="Xác nhận gán"
              icon="pi pi-check"
              onClick={confirmAssign}
              disabled={assignTarget.length === 0}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-sky-500 !bg-sky-500 !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-sky-600 disabled:!cursor-not-allowed disabled:!opacity-50 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
          </div>
        }
      >
        <p className="mb-4 mt-0 text-sm text-[#73849b]">Chọn nhân viên trong shop để phụ trách lịch hẹn này.</p>
        {isAssignLoading ? (
          <div className="flex h-32 items-center justify-center">
            <i className="pi pi-spinner pi-spin text-2xl text-[#214388]" />
          </div>
        ) : assignSource.length === 0 && assignTarget.length === 0 ? (
          <p className="text-xs italic text-slate-400">Chưa có nhân viên nào. Hãy thêm ở mục Thành viên.</p>
        ) : (
          <PickList
            dataKey="userId"
            source={assignSource}
            target={assignTarget}
            onChange={(e: PickListChangeEvent) => {
              setAssignSource(e.source as ShopMemberDTO[])
              setAssignTarget(e.target as ShopMemberDTO[])
            }}
            itemTemplate={(item) => (
              <div className="flex items-center gap-3 py-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8eef8] text-xs font-semibold text-[#2c4b7a]">
                  {(item.userFullName?.[0] || "U").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.userFullName}</p>
                  <p className="text-xs text-slate-500">{item.userEmail}</p>
                </div>
              </div>
            )}
            sourceHeader="Nhân viên có sẵn"
            targetHeader="Đã chọn"
            sourceStyle={{ height: "16rem" }}
            targetStyle={{ height: "16rem" }}
            showSourceControls={false}
            showTargetControls={false}
          />
        )}
      </Dialog>


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

