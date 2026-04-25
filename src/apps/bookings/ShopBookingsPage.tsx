import React, { useEffect, useMemo, useRef, useState } from "react"
import { Dialog } from "primereact/dialog"
import { PickList, type PickListChangeEvent } from "primereact/picklist"
import { DataTable } from "primereact/datatable"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import { StaffAvatarGroup } from "@/common/component/StaffAvatarGroup"
import { StaffProfile } from "@/common/component/StaffProfile"
import type { MenuItem } from "primereact/menuitem"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { getBookings, updateBookingStatus, getBookingById, assignBooking } from "@/apps/bookings/api/bookingApi"
import { getActiveStaff } from "@/apps/members/api/shopMemberApi"
import type { BookingDTO, BookingStaffDTO, BookingStatus, BookingStatusFilter } from "@/apps/bookings/model"
import { notify } from "@/common/toast/ToastHelper"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
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
  IN_PROGRESS: "COMPLETED",
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

type AssignStaffItem = {
  id: number
  fullName: string | null
  email: string | null
  status?: string | null
  avatarUrlPreview?: string | null
}

function fmt(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function normalizeAssigneeIds(rawIds: unknown, fallbackId?: unknown) {
  const values = Array.isArray(rawIds) && rawIds.length > 0 ? rawIds : fallbackId == null ? [] : [fallbackId]
  return values.map((id) => Number(id)).filter((id) => Number.isFinite(id))
}

function normalizeAssigneeNames(rawNames: unknown, fallbackName?: unknown) {
  const values = Array.isArray(rawNames) ? rawNames : fallbackName == null ? [] : [fallbackName]
  return values
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
    .map((name) => name.trim())
}

function normalizeAssignedStaffs(rawStaffs: unknown) {
  if (!Array.isArray(rawStaffs)) return []

  return rawStaffs
    .map((staff): BookingStaffDTO | null => {
      if (!staff || typeof staff !== "object") return null
      const item = staff as Partial<BookingStaffDTO>
      const userId = Number(item.userId)
      if (!Number.isFinite(userId)) return null

      return {
        bookingId: item.bookingId,
        userId,
        fullName: item.fullName ?? null,
        email: item.email ?? null,
        avatarUrlPreview: item.avatarUrlPreview ?? null,
      }
    })
    .filter((staff): staff is BookingStaffDTO => staff !== null)
}

function formatAssigneeNames(names: string[]) {
  return names.length > 0 ? names.join(", ") : null
}

function normalizeAssignStaffItems(rawStaffs: unknown) {
  if (!Array.isArray(rawStaffs)) return []

  return rawStaffs
    .map((staff): AssignStaffItem | null => {
      if (!staff || typeof staff !== "object") return null
      const item = staff as Record<string, unknown>
      const id = Number(item.userId ?? item.id)
      if (!Number.isFinite(id)) return null

      return {
        id,
        fullName: typeof item.userFullName === "string" ? item.userFullName : typeof item.fullName === "string" ? item.fullName : null,
        email: typeof item.userEmail === "string" ? item.userEmail : typeof item.email === "string" ? item.email : null,
        status: typeof item.status === "string" ? item.status : null,
        avatarUrlPreview: typeof item.avatarUrlPreview === "string" ? item.avatarUrlPreview : null,
      }
    })
    .filter((staff): staff is AssignStaffItem => staff !== null)
}

function getAssignedStaffItems(booking: BookingDTO | null | undefined, staffPool: AssignStaffItem[] = []) {
  if (!booking) return []

  const assignedStaffs = normalizeAssignedStaffs(booking.assignedStaffs)
  const assignedIdsFromStaffs = assignedStaffs.map((staff) => staff.userId)
  const rawAssignedIds = Array.isArray(booking.assignedStaffIds) && booking.assignedStaffIds.length > 0
    ? booking.assignedStaffIds
    : assignedIdsFromStaffs
  const assignedIds = normalizeAssigneeIds(rawAssignedIds, booking.assigneeId)
  const poolById = new Map(staffPool.map((staff) => [staff.id, staff]))
  const assignedById = new Map(assignedStaffs.map((staff) => [staff.userId, staff]))
  const fallbackNames = normalizeAssigneeNames(
    assignedStaffs.map((staff) => staff.fullName),
    assignedIds.length === 1 ? booking.assigneeName : undefined,
  )
  const seen = new Set<number>()

  return assignedIds
    .map((id, index): AssignStaffItem | null => {
      if (seen.has(id)) return null
      seen.add(id)

      const poolItem = poolById.get(id)
      const assignedItem = assignedById.get(id)

      return {
        id,
        fullName: poolItem?.fullName ?? assignedItem?.fullName ?? fallbackNames[index] ?? `Staff #${id}`,
        email: poolItem?.email ?? assignedItem?.email ?? null,
        status: poolItem?.status ?? null,
        avatarUrlPreview: poolItem?.avatarUrlPreview ?? assignedItem?.avatarUrlPreview ?? null,
      }
    })
    .filter((staff): staff is AssignStaffItem => staff !== null)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ShopBookingsPage() {
  const { globalSearchQuery, data } = useShopOwnerContext()
  const activeMembers = useMemo(() => data.members.filter((m) => m.status === "ACTIVE"), [data.members])

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

  // ── Dialog states ─────────────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [assignTargetId, setAssignTargetId] = useState<number | null>(null)
  const [assignSource, setAssignSource] = useState<any[]>([])
  const [assignTarget, setAssignTarget] = useState<any[]>([])
  const [isAssignLoading, setIsAssignLoading] = useState(false)

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
      const result = await getBookings(20, currentCursor, debouncedSearch, statusFilter) as any

      if (result) {
        const payload = result?.data || result
        const contentArray = Array.isArray(payload) ? payload : (payload?.content || [])
        const newCursor = payload?.nextCursor || null
        const newHasNext = payload?.hasNext ?? false

        if (Array.isArray(contentArray)) {
          const mapped: BookingDTO[] = contentArray.map((b: any) => {
            const assignedStaffs = normalizeAssignedStaffs(b.assignedStaffs)
            const assignedStaffIds = normalizeAssigneeIds(
              b.assignedStaffIds ?? assignedStaffs.map((staff) => staff.userId),
              b.assigneeId,
            )
            const assigneeNames = normalizeAssigneeNames(
              assignedStaffs.map((staff) => staff.fullName),
              b.assigneeName,
            )

            return {
              id: b.id,
              bookingCode: b.bookingCode || "",
              shopId: b.shopId,
              customerId: b.customerId ?? null,
              customerName: b.customerName || "",
              customerPhone: b.customerPhone || "",
              items: Array.isArray(b.items) ? b.items : [],
              totalAmount: b.totalAmount || 0,
              status: b.status || "DRAFT",
              statusLabel: b.statusLabel || STATUS_CONFIG[b.status as BookingStatus]?.label || "",
              source: b.source || null,
              assigneeId: assignedStaffIds[0] ?? null,
              assigneeName: formatAssigneeNames(assigneeNames),
              assignedStaffIds,
              assignedStaffs,
              time: b.time ?? null,
              createdAt: b.createdAt || "",
            }
          })

          if (isLoadMore) {
            setBookings((prev) => {
              const prevIds = new Set(prev.map((p) => p.id))
              const uniqueNew = mapped.filter((n) => !prevIds.has(n.id))
              return [...prev, ...uniqueNew]
            })
          } else {
            setBookings(mapped)
          }

          setNextCursor(newCursor)
          setHasNext(newHasNext)
        }
      }
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

  // ── Auto-load on search/filter change ─────────────────────────────────────
  useEffect(() => {
    loadBookings(false)
  }, [debouncedSearch, statusFilter])

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
  }, [hasNext, isLoading, isLoadingMore, nextCursor])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const DRAFT = bookings.filter((b) => b.status === "DRAFT").length
    const incoming = bookings.filter((b) => b.status === "CONFIRMED").length
    const active = bookings.filter((b) => b.status === "IN_PROGRESS").length
    return { DRAFT, incoming, active }
  }, [bookings])

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleAccept = async (id: number) => {
    try {
      await updateBookingStatus(id, "CONFIRMED")
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CONFIRMED" as BookingStatus, statusLabel: STATUS_CONFIG.CONFIRMED.label } : b)))
      notify.success("Đã xác nhận lịch hẹn.")
      loadBookings(false)
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
    if (!next) return
    try {
      await updateBookingStatus(booking.id, next)
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: next, statusLabel: STATUS_CONFIG[next]?.label || "" } : b)))
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: next, statusLabel: STATUS_CONFIG[next]?.label || "" } : prev))
      }
      loadBookings(false)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không thể cập nhật trạng thái."))
    }
  }

  const openDetail = async (booking: BookingDTO) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
    setIsDetailLoading(true)
    try {
      const res = await getBookingById(booking.id) as any
      const fullBooking = res?.data || res
      const assignedStaffs = normalizeAssignedStaffs(fullBooking.assignedStaffs ?? booking.assignedStaffs)
      const assignedStaffIds = normalizeAssigneeIds(
        fullBooking.assignedStaffIds ?? booking.assignedStaffIds ?? assignedStaffs.map((staff) => staff.userId),
        fullBooking.assigneeId ?? booking.assigneeId,
      )
      const assigneeNames = normalizeAssigneeNames(
        assignedStaffs.map((staff) => staff.fullName),
        fullBooking.assigneeName ?? booking.assigneeName,
      )
      const mappedFull: BookingDTO = {
        id: fullBooking.id || booking.id,
        bookingCode: fullBooking.bookingCode || booking.bookingCode,
        shopId: fullBooking.shopId || booking.shopId,
        customerId: fullBooking.customerId ?? booking.customerId,
        customerName: fullBooking.customerName || booking.customerName,
        customerPhone: fullBooking.customerPhone || booking.customerPhone,
        items: Array.isArray(fullBooking.items) ? fullBooking.items : booking.items,
        totalAmount: fullBooking.totalAmount ?? booking.totalAmount,
        status: fullBooking.status || booking.status,
        statusLabel: fullBooking.statusLabel || booking.statusLabel,
        source: fullBooking.source || booking.source,
        assigneeId: assignedStaffIds[0] ?? null,
        assigneeName: formatAssigneeNames(assigneeNames),
        assignedStaffIds,
        assignedStaffs,
        time: fullBooking.time ?? booking.time,
        createdAt: fullBooking.createdAt || booking.createdAt,
      }
      setSelectedBooking(mappedFull)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được chi tiết lịch hẹn."))
    } finally {
      setIsDetailLoading(false)
    }
  }

  // ── Assign staff ──────────────────────────────────────────────────────────
  const openAssign = async (id: number) => {
    const booking = bookings.find((item) => item.id === id) ?? (selectedBooking?.id === id ? selectedBooking : null)

    setAssignTargetId(id)
    setAssignSource([])
    setAssignTarget(getAssignedStaffItems(booking))
    setIsAssignOpen(true)
    setIsAssignLoading(true)

    try {
      const res = await getActiveStaff() as any;
      const staffList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const mappedStaff = normalizeAssignStaffItems(staffList);
      const assignedStaff = getAssignedStaffItems(booking, mappedStaff);
      const assignedStaffIds = new Set(assignedStaff.map((staff) => staff.id));

      setAssignTarget(assignedStaff);
      setAssignSource(mappedStaff.filter((staff) => !assignedStaffIds.has(staff.id)));
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được danh sách nhân viên."));
      const fallbackStaff = normalizeAssignStaffItems(activeMembers);
      const assignedStaff = getAssignedStaffItems(booking, fallbackStaff);
      const assignedStaffIds = new Set(assignedStaff.map((staff) => staff.id));

      setAssignTarget(assignedStaff);
      setAssignSource(fallbackStaff.filter((staff) => !assignedStaffIds.has(staff.id)));
    } finally {
      setIsAssignLoading(false);
    }
  }

  const confirmAssign = async () => {
    if (!assignTargetId || assignTarget.length === 0) return
    const staffUserIds = assignTarget
      .map((member) => Number(member.id))
      .filter((id) => Number.isFinite(id))
    if (staffUserIds.length === 0) return

    const assignedStaffs: BookingStaffDTO[] = assignTarget.map((member) => ({
      bookingId: assignTargetId,
      userId: Number(member.id),
      fullName: member.fullName || null,
      email: member.email || null,
      avatarUrlPreview: member.avatarUrlPreview || null,
    }))
    const assigneeNames = normalizeAssigneeNames(assignedStaffs.map((staff) => staff.fullName))
    const assigneeName = formatAssigneeNames(assigneeNames)

    try {
      await assignBooking(assignTargetId, staffUserIds)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === assignTargetId
            ? { ...b, assigneeId: staffUserIds[0] ?? null, assigneeName, assignedStaffIds: staffUserIds, assignedStaffs }
            : b,
        ),
      )
      if (selectedBooking?.id === assignTargetId) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, assigneeId: staffUserIds[0] ?? null, assigneeName, assignedStaffIds: staffUserIds, assignedStaffs } : prev,
        )
      }
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
    loadBookings(false)
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
      <p className="text-sm font-semibold text-slate-800">{booking.customerName}</p>
      <p className="text-xs text-slate-500">{booking.customerPhone}</p>
    </div>
  )

  const itemsBody = (booking: BookingDTO) => (
    <div className="text-xs text-slate-600">
      {booking.items.slice(0, 2).map((item, i) => (
        <p key={i} className="truncate">
          {item.quantity || 1}× {item.serviceName || "Dịch vụ"}
        </p>
      ))}
      {booking.items.length > 2 && <p className="text-slate-400">+{booking.items.length - 2} mục khác</p>}
      {booking.items.length === 0 && <p className="text-slate-400 italic">Chưa có dịch vụ</p>}
    </div>
  )

  const totalBody = (booking: BookingDTO) => (
    <div className="text-center text-sm font-semibold text-[#ef5c2c]">{fmt(booking.totalAmount)}</div>
  )

  const timeBody = (booking: BookingDTO) => (
    <div className="text-center text-xs text-slate-500">{fmtDate(booking.time)}</div>
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

  const getBookingAssignedStaffs = (booking: BookingDTO) =>
    booking.assignedStaffs?.length
      ? booking.assignedStaffs
      : getAssignedStaffItems(booking).map((staff) => ({
        userId: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        avatarUrlPreview: staff.avatarUrlPreview,
      }))

  const assignBody = (booking: BookingDTO) => {
    const assignedStaffs = getBookingAssignedStaffs(booking)

    return <StaffAvatarGroup staffs={assignedStaffs} maxVisible={4} />
  }

  const assignedStaffProfilesBody = (booking: BookingDTO) => {
    const assignedStaffs = getBookingAssignedStaffs(booking)

    if (assignedStaffs.length === 0) {
      return <span className="italic text-slate-400">Chưa gán</span>
    }

    return (
      <div className="space-y-2">
        {assignedStaffs.map((staff, index) => (
          <StaffProfile key={staff.userId ?? index} staff={staff} />
        ))}
      </div>
    )
  }

  const createdAtBody = (booking: BookingDTO) => (
    <div className="text-center text-xs text-slate-500">{fmtDate(booking.createdAt)}</div>
  )

  const actionsBody = (booking: BookingDTO) => {
    const actionItems: MenuItem[] = [
      {
        label: "Xem chi tiết",
        icon: "pi pi-eye",
        command: () => openDetail(booking),
      },
    ]

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
        label: booking.assigneeName ? "Đổi nhân viên" : "Gán nhân viên",
        icon: "pi pi-user-plus",
        className: "text-sky-600",
        command: () => openAssign(booking.id),
      })
    }

    return <TableActionMenu items={actionItems} />
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
            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard icon={<i className="pi pi-clock h-5 w-5 text-amber-500" />} label="Chờ xác nhận" value={stats.DRAFT} color="amber" />
              <StatCard icon={<i className="pi pi-calendar h-5 w-5 text-sky-500" />} label="Sắp tới" value={stats.incoming} color="blue" />
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

      {/* ── Detail dialog ──────────────────────────────────────────────────── */}
      {selectedBooking && (
        <Dialog
          visible={isDetailOpen}
          onHide={() => setIsDetailOpen(false)}
          header={`Chi tiết Lịch hẹn ${selectedBooking.bookingCode}`}
          style={{ width: "100%", maxWidth: "48rem" }}
          footer={
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
              >
                Đóng
              </button>
              {selectedBooking.status === "DRAFT" && (
                <>
                  <button
                    onClick={() => {
                      handleAccept(selectedBooking.id)
                      setIsDetailOpen(false)
                    }}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailOpen(false)
                      openReject(selectedBooking.id)
                    }}
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
                  Chuyển → {STATUS_CONFIG[STATUS_FLOW[selectedBooking.status]!].label}
                </button>
              )}
              {selectedBooking.status === "CONFIRMED" && (
                <button
                  onClick={() => {
                    setIsDetailOpen(false)
                    openAssign(selectedBooking.id)
                  }}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                >
                  <i className="pi pi-user-plus mr-1" />
                  {selectedBooking.assigneeName ? "Đổi NV" : "Gán NV"}
                </button>
              )}

            </div>
          }
        >
          <p className="mb-4 mt-0 text-sm text-[#73849b]">Xem thông tin và cập nhật tiến độ.</p>
          <div className="space-y-4">
            {isDetailLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm">
                <i className="pi pi-spinner pi-spin text-3xl text-[#214388]" />
              </div>
            )}
            {/* Thời gian hẹn */}
            <div className="rounded-xl border border-[#d3e3f6] bg-[#eef3fb] p-4 text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#214388]">Thời gian hẹn</p>
              <p className="text-xl font-bold text-[#1a365d]">{fmtDate(selectedBooking.time)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Khách hàng */}
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Khách hàng</p>
                <div className="space-y-3">
                  <InfoItem icon={<i className="pi pi-user h-4 w-4" />} label="Họ tên" value={selectedBooking.customerName} />
                  <InfoItem icon={<i className="pi pi-phone h-4 w-4" />} label="Điện thoại" value={selectedBooking.customerPhone} />
                </div>
              </div>

              {/* Dịch vụ */}
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Dịch vụ đặt hẹn</p>
                <div className="space-y-2">
                  {selectedBooking.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{item.quantity || 1}× {item.serviceName || "Dịch vụ"}</span>
                      <span className="font-semibold text-[#ef5c2c]">{fmt(item.subtotal || item.unitPrice || 0)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-[#f0f4f8] pt-2 text-sm font-bold">
                    <span className="text-slate-800">Tổng cộng</span>
                    <span className="text-[#ef5c2c]">{fmt(selectedBooking.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trạng thái & Phụ trách */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</p>
                <span
                  className={`inline-flex rounded-md px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[selectedBooking.status]?.bg} ${STATUS_CONFIG[selectedBooking.status]?.text}`}
                >
                  {selectedBooking.statusLabel || STATUS_CONFIG[selectedBooking.status]?.label}
                </span>
                {selectedBooking.source && (
                  <p className="mt-2 text-xs text-slate-500">Nguồn: {selectedBooking.source}</p>
                )}
              </div>

              <div className="rounded-xl border border-[#e2e8f0] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nhân viên phụ trách</p>
                {assignedStaffProfilesBody(selectedBooking)}
              </div>
            </div>

            <p className="text-right text-xs text-slate-400">Ngày tạo: {fmtDate(selectedBooking.createdAt)}</p>
          </div>
        </Dialog>
      )}

      {/* ── Reject dialog ──────────────────────────────────────────────────── */}
      <Dialog
        visible={isRejectOpen}
        onHide={() => setIsRejectOpen(false)}
        header="Từ chối lịch hẹn"
        style={{ width: "100%", maxWidth: "30rem" }}
        footer={
          <div className="mt-4 flex justify-center gap-2">
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

      {/* ── Assign staff dialog ────────────────────────────────────────────── */}
      <Dialog
        visible={isAssignOpen}
        onHide={() => setIsAssignOpen(false)}
        header="Gán nhân viên phụ trách"
        style={{ width: "100%", maxWidth: "56rem" }}
        footer={
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Hủy
            </button>
            <button
              onClick={confirmAssign}
              disabled={assignTarget.length === 0}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Xác nhận gán
            </button>
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
            dataKey="id"
            source={assignSource}
            target={assignTarget}
            onChange={(e: PickListChangeEvent) => {
              setAssignSource(e.source)
              setAssignTarget(e.target)
            }}
            itemTemplate={(item) => (
              <div className="flex items-center gap-3 py-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8eef8] text-xs font-semibold text-[#2c4b7a]">
                  {(item.fullName?.[0] || "U").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.fullName}</p>
                  <p className="text-xs text-slate-500">{item.email}</p>
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
