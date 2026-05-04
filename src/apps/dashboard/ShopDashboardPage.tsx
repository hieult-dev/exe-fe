import { useMemo } from "react"
import { Chart } from "primereact/chart"
import { Toolbar } from "primereact/toolbar"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { formatCurrencyVND } from "@/common/utils/format"

/* ─── colour tokens ─── */
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

/* ─── shared chart options ─── */
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

const pieDoughnutOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { usePointStyle: true, pointStyle: "circle", padding: 16, color: C.slate700, font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: C.slate700,
      titleFont: { size: 12, weight: "600" as const },
      bodyFont: { size: 12 },
      padding: 10,
      cornerRadius: 8,
    },
  },
}

/* ─── fake monthly data (demo) ─── */
const MONTHS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
const fakeRevenue = [4200000, 5100000, 3800000, 6700000, 7500000, 6300000, 8100000, 9200000, 7600000, 10400000, 11200000, 9800000]
const fakeOrders = [32, 41, 28, 52, 58, 47, 63, 72, 56, 81, 88, 74]

export function ShopDashboardPage() {
  const { data } = useShopOwnerContext()

  /* ── KPI cards ── */
  const totalRevenue = fakeRevenue.reduce((s, v) => s + v, 0)
  const totalOrders = fakeOrders.reduce((s, v) => s + v, 0)
  const currentMonthRevenue = fakeRevenue[fakeRevenue.length - 1] // Doanh thu tháng gần nhất
  const currentMonthOrders = fakeOrders[fakeOrders.length - 1] // Đơn hàng tháng gần nhất

  const kpis = [
    { label: "Doanh thu (tháng này)", value: formatCurrencyVND(currentMonthRevenue), icon: "pi pi-chart-line", color: C.sky, bg: C.skyLight },
    { label: "Đơn hàng (tháng này)", value: String(currentMonthOrders), icon: "pi pi-shopping-bag", color: C.violet, bg: C.violetLight },
    { label: "Doanh thu (năm)", value: formatCurrencyVND(totalRevenue), icon: "pi pi-wallet", color: C.indigo, bg: C.indigoLight },
    { label: "Đơn hàng (năm)", value: String(totalOrders), icon: "pi pi-shopping-cart", color: C.emerald, bg: C.emeraldLight },
  ]

  /* ── Revenue line chart ── */
  const revenueData = useMemo(
    () => ({
      labels: MONTHS,
      datasets: [
        {
          label: "Doanh thu",
          data: fakeRevenue,
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
    []
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
            callback: (v: number) => (v >= 1_000_000 ? `${v / 1_000_000}tr` : v >= 1_000 ? `${v / 1000}k` : v),
          },
        },
      },
    }),
    []
  )

  /* ── Orders bar chart ── */
  const ordersData = useMemo(
    () => ({
      labels: MONTHS,
      datasets: [
        {
          label: "Đơn hàng",
          data: fakeOrders,
          backgroundColor: C.emerald,
          borderRadius: 6,
          borderSkipped: false as const,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
      ],
    }),
    []
  )

  /* ── Services by category doughnut ── */
  const serviceCats = useMemo(() => {
    const map = new Map<string, number>()
    data.services.forEach((s) => {
      map.set(s.category, (map.get(s.category) ?? 0) + 1)
    })
    return {
      labels: Array.from(map.keys()),
      datasets: [
        {
          data: Array.from(map.values()),
          backgroundColor: [C.indigo, C.emerald, C.amber, C.rose, C.sky, C.violet],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    }
  }, [data.services])

  /* ── Inventory stock doughnut ── */
  const stockSummary = useMemo(() => {
    let ok = 0
    let low = 0
    let out = 0
    ;[...data.inventory.products, ...data.inventory.materials].forEach((item) => {
      if (item.stockQty <= 0) out++
      else if (item.stockQty <= item.reorderLevel) low++
      else ok++
    })
    return {
      labels: ["Đủ hàng", "Sắp hết", "Hết hàng"],
      datasets: [
        {
          data: [ok, low, out],
          backgroundColor: [C.emerald, C.amber, C.rose],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    }
  }, [data.inventory])

  return (
    <div className="flex flex-1 flex-col gap-2">
      {/* Toolbar — PrimeReact Toolbar, nền trắng, tách biệt với content */}
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Tổng quan</h1>
            <p className="text-sm text-slate-500">Theo dõi hiệu suất kinh doanh và hoạt động cửa hàng</p>
          </div>
        }
      />

      {/* Content — white rounded box */}
      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="absolute inset-x-0 top-0 h-[3px] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundImage: `linear-gradient(to right, transparent, ${kpi.color}, transparent)` }}
                />
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125">
                  <i className={kpi.icon} style={{ fontSize: "7rem" }} />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-[14px] shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: kpi.bg, color: kpi.color }}
                  >
                    <i className={kpi.icon} style={{ fontSize: "1.25rem" }} />
                  </div>
                </div>

                <div className="relative z-10 mt-6 sm:mt-8">
                  <p className="text-[1.75rem] font-bold tracking-tight text-slate-800 transition-colors group-hover:text-slate-900">{kpi.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 — Revenue & Orders */}
          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Doanh thu theo tháng" subtitle="Biểu đồ doanh thu cả năm">
              <Chart type="line" data={revenueData} options={revenueOptions} className="h-[280px] w-full" />
            </ChartCard>
            <ChartCard title="Đơn hàng theo tháng" subtitle="Số lượng đơn hàng xử lý">
              <Chart type="bar" data={ordersData} options={baseLineBarOptions} className="h-[280px] w-full" />
            </ChartCard>
          </div>

          {/* Charts Row 2 — Doughnut ring charts */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ChartCard title="Dịch vụ theo danh mục" subtitle={`${data.services.length} dịch vụ`}>
              <div className="mx-auto h-[240px] max-w-[280px]">
                <Chart type="doughnut" data={serviceCats} options={pieDoughnutOptions} className="h-full w-full" />
              </div>
            </ChartCard>
            <ChartCard title="Tình trạng tồn kho" subtitle={`${data.inventory.products.length + data.inventory.materials.length} mặt hàng`}>
              <div className="mx-auto h-[240px] max-w-[280px]">
                <Chart type="doughnut" data={stockSummary} options={pieDoughnutOptions} className="h-full w-full" />
              </div>
            </ChartCard>

            {/* Recent activity */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Hoạt động gần đây</h3>
              <p className="mt-0.5 text-xs text-slate-500">Cập nhật từ hệ thống</p>
              <div className="mt-5 space-y-4">
                <ActivityItem icon="pi pi-check-circle" color={C.emerald} bg={C.emeraldLight} text="Đơn hàng mới #1042 đã xác nhận" time="5 phút trước" />
                <ActivityItem icon="pi pi-box" color={C.amber} bg={C.amberLight} text="Khăn tắm microfiber sắp hết hàng" time="1 giờ trước" />
                <ActivityItem icon="pi pi-user-plus" color={C.indigo} bg={C.indigoLight} text="Thành viên Tran Thu Ha được mời" time="2 giờ trước" />
                <ActivityItem icon="pi pi-star" color={C.violet} bg={C.violetLight} text="Khách đánh giá 5⭐ dịch vụ Grooming" time="3 giờ trước" />
                <ActivityItem icon="pi pi-shopping-cart" color={C.sky} bg={C.skyLight} text="2 sản phẩm được thêm vào kho" time="Hôm qua" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Small sub‑components ─── */

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function ActivityItem({ icon, color, bg, text, time }: { icon: string; color: string; bg: string; text: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: bg }}>
        <i className={icon} style={{ color, fontSize: ".85rem" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 leading-snug">{text}</p>
        <p className="mt-0.5 text-xs text-slate-400">{time}</p>
      </div>
    </div>
  )
}
