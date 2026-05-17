import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { Button } from "primereact/button"
import { Chart } from "primereact/chart"
import { Skeleton } from "primereact/skeleton"
import { Tag } from "primereact/tag"
import { Toolbar } from "primereact/toolbar"
import {
  getBookingsByCategory,
  getDashboardSummary,
  getOrdersByMonth,
  getRevenueByMonth,
} from "@/apps/dashboard/api/dashboardApi"
import type {
  BookingCategoryStatDTO,
  DashboardSummaryDTO,
  MonthlyOrderDTO,
  MonthlyRevenueDTO,
} from "@/apps/dashboard/model"
import { formatCurrencyVND } from "@/common/utils/format"

const C = {
  indigo: "rgba(99,102,241,1)",
  indigoLight: "rgba(99,102,241,.12)",
  emerald: "rgba(16,185,129,1)",
  emeraldLight: "rgba(16,185,129,.12)",
  amber: "rgba(245,158,11,1)",
  amberLight: "rgba(245,158,11,.12)",
  rose: "rgba(244,63,94,1)",
  roseLight: "rgba(244,63,94,.12)",
  sky: "rgba(14,165,233,1)",
  skyLight: "rgba(14,165,233,.12)",
  violet: "rgba(139,92,246,1)",
  violetLight: "rgba(139,92,246,.12)",
  slate400: "rgba(148,163,184,1)",
  slate700: "rgba(51,65,85,1)",
  white: "#ffffff",
}

const baseLineBarOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: C.slate700,
      titleFont: { size: 12, weight: "600" as const },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 8,
      boxPadding: 4,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: C.slate400, font: { size: 11 } },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(226,232,240,.5)", drawBorder: false },
      ticks: { color: C.slate400, font: { size: 11 } },
      border: { display: false },
      beginAtZero: true,
    },
  },
}

const emptySummary: DashboardSummaryDTO = {
  monthlyRevenue: 0,
  monthlyOrderCount: 0,
  yearlyRevenue: 0,
  todayRevenue: 0,
}

const bookingCategoryStyles = [
  { icon: "pi pi-star", color: C.indigo, bg: C.indigoLight },
  { icon: "pi pi-heart", color: C.emerald, bg: C.emeraldLight },
  { icon: "pi pi-sparkles", color: C.amber, bg: C.amberLight },
  { icon: "pi pi-shield", color: C.sky, bg: C.skyLight },
  { icon: "pi pi-bookmark", color: C.violet, bg: C.violetLight },
  { icon: "pi pi-tag", color: C.rose, bg: C.roseLight },
]

type BookingCategoryDisplayItem = BookingCategoryStatDTO & (typeof bookingCategoryStyles)[number]

const inventoryPreviewItems = [
  { id: "P-1024", name: "Sữa tắm khử mùi", typeLabel: "Sản phẩm", imageUrl: "/image/shampoo.jpg", onHand: 6, reserved: 2, reorderPoint: 5 },
  { id: "M-031", name: "Khăn tắm microfiber", typeLabel: "Vật tư", imageUrl: "/image/cleaning.jpg", onHand: 7, reserved: 4, reorderPoint: 5 },
  { id: "P-088", name: "Xịt dưỡng lông", typeLabel: "Sản phẩm", imageUrl: "/image/spa.jpg", onHand: 4, reserved: 3, reorderPoint: 5 },
  { id: "M-014", name: "Dầu xả lông mềm", typeLabel: "Vật tư", imageUrl: "/image/all.jpg", onHand: 2, reserved: 2, reorderPoint: 5 },
  { id: "P-119", name: "Bánh thưởng cá hồi", typeLabel: "Sản phẩm", imageUrl: "/image/food.jpg", onHand: 18, reserved: 2, reorderPoint: 5 },
]

type InventoryPreviewItem = (typeof inventoryPreviewItems)[number]
type InventoryStatusLabel = "Đủ hàng" | "Sắp hết" | "Hết hàng"

function getCurrentDashboardParams() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function formatCompactCurrencyTick(value: number | string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value
  if (amount >= 1_000_000_000) return `${amount / 1_000_000_000}tỷ`
  if (amount >= 1_000_000) return `${amount / 1_000_000}tr`
  if (amount >= 1_000) return `${amount / 1000}k`
  return amount
}

function getInventoryAvailable(item: InventoryPreviewItem) {
  return Math.max(item.onHand - item.reserved, 0)
}

function getInventoryStatusLabel(item: InventoryPreviewItem): InventoryStatusLabel {
  const available = getInventoryAvailable(item)
  if (available <= 0) return "Hết hàng"
  if (available <= item.reorderPoint) return "Sắp hết"
  return "Đủ hàng"
}

function buildInventorySummary(items: InventoryPreviewItem[]) {
  return items.reduce(
    (summary, item) => {
      const status = getInventoryStatusLabel(item)
      if (status === "Hết hàng") summary.outOfStock += 1
      else if (status === "Sắp hết") summary.lowStock += 1
      else summary.inStock += 1
      summary.total += 1
      return summary
    },
    { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 },
  )
}

function inventoryTagSeverity(status: InventoryStatusLabel) {
  if (status === "Hết hàng") return "danger" as const
  if (status === "Sắp hết") return "warning" as const
  return "success" as const
}

function inventoryBarColor(status: InventoryStatusLabel) {
  if (status === "Hết hàng") return C.rose
  if (status === "Sắp hết") return C.amber
  return C.emerald
}

export function ShopDashboardPage() {
  const [{ year, month }] = useState(getCurrentDashboardParams)
  const [summary, setSummary] = useState<DashboardSummaryDTO>(emptySummary)
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueDTO[]>([])
  const [monthlyOrders, setMonthlyOrders] = useState<MonthlyOrderDTO[]>([])
  const [bookingCategories, setBookingCategories] = useState<BookingCategoryStatDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const [nextSummary, nextRevenue, nextOrders, nextBookingCategories] = await Promise.all([
        getDashboardSummary({ year, month }),
        getRevenueByMonth({ year }),
        getOrdersByMonth({ year }),
        getBookingsByCategory({ year, month }),
      ])

      setSummary(nextSummary)
      setMonthlyRevenue(nextRevenue)
      setMonthlyOrders(nextOrders)
      setBookingCategories(nextBookingCategories)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải dữ liệu dashboard."))
    } finally {
      setIsLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const kpis = useMemo(
    () => [
      {
        label: "Doanh thu tháng này",
        value: formatCurrencyVND(summary.monthlyRevenue),
        icon: "pi pi-chart-line",
        color: C.sky,
        bg: C.skyLight,
      },
      {
        label: "Đơn hàng tháng này",
        value: String(summary.monthlyOrderCount),
        icon: "pi pi-shopping-bag",
        color: C.violet,
        bg: C.violetLight,
      },
      {
        label: "Doanh thu năm",
        value: formatCurrencyVND(summary.yearlyRevenue),
        icon: "pi pi-wallet",
        color: C.indigo,
        bg: C.indigoLight,
      },
      {
        label: "Doanh thu hôm nay",
        value: formatCurrencyVND(summary.todayRevenue),
        icon: "pi pi-calendar-clock",
        color: C.emerald,
        bg: C.emeraldLight,
      },
    ],
    [summary],
  )

  const revenueData = useMemo(
    () => ({
      labels: monthlyRevenue.map((item) => `T${item.month}`),
      datasets: [
        {
          label: "Doanh thu",
          data: monthlyRevenue.map((item) => item.revenue),
          fill: true,
          borderColor: C.indigo,
          backgroundColor: "rgba(99,102,241,.08)",
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: C.white,
          pointBorderColor: C.indigo,
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    }),
    [monthlyRevenue],
  )

  const revenueOptions = useMemo(
    () => ({
      ...baseLineBarOptions,
      scales: {
        ...baseLineBarOptions.scales,
        y: {
          ...baseLineBarOptions.scales.y,
          ticks: {
            ...baseLineBarOptions.scales.y.ticks,
            callback: formatCompactCurrencyTick,
          },
        },
      },
    }),
    [],
  )

  const ordersData = useMemo(
    () => ({
      labels: monthlyOrders.map((item) => `T${item.month}`),
      datasets: [
        {
          label: "Đơn hàng",
          data: monthlyOrders.map((item) => item.orderCount),
          backgroundColor: C.emerald,
          borderRadius: 6,
          borderSkipped: false as const,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
      ],
    }),
    [monthlyOrders],
  )

  const bookingCategoryItems = useMemo(
    () =>
      bookingCategories.map((item, index) => ({
        ...item,
        ...bookingCategoryStyles[index % bookingCategoryStyles.length],
      })),
    [bookingCategories],
  )

  const totalCategoryBookings = bookingCategories.reduce((total, item) => total + item.bookingCount, 0)
  const inventorySummary = buildInventorySummary(inventoryPreviewItems)

  return (
    <div className="flex flex-1 flex-col gap-2">
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Theo dõi doanh thu, đơn hàng, lượt đặt lịch và tồn kho trong năm {year}.
            </p>
          </div>
        }
        end={
          <Button
            label="Làm mới"
            icon="pi pi-refresh"
            outlined
            loading={isLoading}
            onClick={loadDashboard}
            className="!h-9 !rounded-md !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-medium !text-[#40526b] hover:!bg-[#f8fafc]"
          />
        }
      />

      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
        <div className="space-y-6">
          {errorMessage && (
            <div className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:flex-row md:items-center md:justify-between">
              <span>{errorMessage}</span>
              <Button
                label="Thử lại"
                icon="pi pi-refresh"
                text
                onClick={loadDashboard}
                className="!h-8 !px-2 !py-0 !text-sm !font-semibold !text-rose-700"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} isLoading={isLoading} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Doanh thu theo tháng" subtitle="Biểu đồ doanh thu cả năm" isLoading={isLoading}>
              <Chart type="line" data={revenueData} options={revenueOptions} className="h-[280px] w-full" />
            </ChartCard>
            <ChartCard title="Đơn hàng theo tháng" subtitle="Số lượng đơn hàng xử lý" isLoading={isLoading}>
              <Chart type="bar" data={ordersData} options={baseLineBarOptions} className="h-[280px] w-full" />
            </ChartCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ChartCard title="Lượt đặt lịch theo danh mục" subtitle={`${totalCategoryBookings} lượt đặt lịch`} isLoading={isLoading}>
              <BookingCategoryPreview items={bookingCategoryItems} total={totalCategoryBookings} />
            </ChartCard>
            <ChartCard title="Cảnh báo tồn kho" subtitle={`${inventorySummary.total} mặt hàng theo dõi`} isLoading={isLoading}>
              <InventoryAlertPreview items={inventoryPreviewItems} summary={inventorySummary} />
            </ChartCard>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Hoạt động gần đây</h3>
              <p className="mt-0.5 text-xs text-slate-500">Chưa có dữ liệu từ hệ thống</p>
              <div className="mt-8 flex h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
                <i className="pi pi-inbox text-2xl text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">Chưa có hoạt động gần đây</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon,
  color,
  bg,
  isLoading,
}: {
  label: string
  value: string
  icon: string
  color: string
  bg: string
  isLoading: boolean
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="absolute inset-x-0 top-0 h-[3px] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${color}, transparent)` }}
      />
      <div className="absolute -bottom-6 -right-6 opacity-[0.03] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125">
        <i className={icon} style={{ fontSize: "7rem" }} />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-[14px] shadow-sm transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: bg, color }}
        >
          <i className={icon} style={{ fontSize: "1.25rem" }} />
        </div>
      </div>

      <div className="relative z-10 mt-6 sm:mt-8">
        {isLoading ? (
          <>
            <Skeleton width="8rem" height="2rem" />
            <Skeleton width="7rem" height=".875rem" className="mt-2" />
          </>
        ) : (
          <>
            <p className="text-[1.75rem] font-bold tracking-tight text-slate-800 transition-colors group-hover:text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
          </>
        )}
      </div>
    </div>
  )
}

function BookingCategoryPreview({
  items,
  total,
}: {
  items: BookingCategoryDisplayItem[]
  total: number
}) {
  const topCategory = items[0]

  if (!topCategory) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
        <i className="pi pi-calendar-times text-2xl text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">Chưa có lượt đặt lịch theo danh mục</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[280px] flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Tổng lượt đặt</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Danh mục nhiều nhất</p>
          <p className="mt-1 text-sm font-bold text-slate-800">{topCategory.categoryName}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.bookingCount / total) * 100) : 0

          return (
            <div key={item.categoryName} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    <i className={item.icon} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.categoryName}</p>
                    <p className="text-xs text-slate-500">{percent}% tổng lượt đặt</p>
                  </div>
                </div>
                <p className="shrink-0 text-base font-bold text-slate-900">{item.bookingCount}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InventoryAlertPreview({
  items,
  summary,
}: {
  items: InventoryPreviewItem[]
  summary: ReturnType<typeof buildInventorySummary>
}) {
  const alertItems = items.filter((item) => getInventoryStatusLabel(item) !== "Đủ hàng")
  const sortedItems = [...alertItems].sort((a, b) => {
    const priority: Record<InventoryStatusLabel, number> = { "Hết hàng": 0, "Sắp hết": 1, "Đủ hàng": 2 }
    return priority[getInventoryStatusLabel(a)] - priority[getInventoryStatusLabel(b)] || getInventoryAvailable(a) - getInventoryAvailable(b)
  })
  const alertCount = sortedItems.length
  const lowStockPercent = alertCount > 0 ? (summary.lowStock / alertCount) * 100 : 0
  const outOfStockPercent = alertCount > 0 ? (summary.outOfStock / alertCount) * 100 : 0

  return (
    <div className="min-h-[280px] space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Cần xử lý</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{alertCount}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <InventorySummaryPill label="Sắp hết" value={summary.lowStock} color={C.amber} bg={C.amberLight} />
          <InventorySummaryPill label="Hết hàng" value={summary.outOfStock} color={C.rose} bg={C.roseLight} />
        </div>
      </div>

      <div>
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
          <div style={{ width: `${lowStockPercent}%`, backgroundColor: C.amber }} />
          <div style={{ width: `${outOfStockPercent}%`, backgroundColor: C.rose }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Chỉ hiển thị mặt hàng sắp hết hoặc đã hết hàng</p>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {sortedItems.length === 0 ? (
          <div className="flex h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
            <i className="pi pi-check-circle text-2xl text-emerald-400" />
            <p className="mt-3 text-sm font-medium text-slate-500">Không có mặt hàng cần xử lý</p>
          </div>
        ) : sortedItems.map((item) => {
          const available = getInventoryAvailable(item)
          const status = getInventoryStatusLabel(item)
          const ratio = item.reorderPoint > 0 ? Math.min((available / item.reorderPoint) * 100, 100) : 100

          return (
            <div key={item.id} className="rounded-xl border border-slate-200/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      <Tag value={status} severity={inventoryTagSeverity(status)} className="!px-2 !py-0.5 !text-xs" />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.typeLabel} · Mã {item.id}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-slate-900">{available}</p>
                  <p className="text-xs text-slate-500">khả dụng</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tồn {item.onHand}</span>
                  <span>Giữ chỗ {item.reserved}</span>
                  <span>Ngưỡng {item.reorderPoint}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${ratio}%`, backgroundColor: inventoryBarColor(status) }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InventorySummaryPill({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ backgroundColor: bg }}>
      <p className="text-base font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[11px] font-medium text-slate-600">{label}</p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
  isLoading,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  isLoading: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {isLoading ? <Skeleton height="280px" borderRadius="12px" /> : children}
    </div>
  )
}
