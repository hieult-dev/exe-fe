import { useMemo } from "react"
import { Chart } from "primereact/chart"
import { Toolbar } from "primereact/toolbar"
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

/* ─── fake data ─── */
const MONTHS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
const fakeRevenue = [4200000, 5100000, 3800000, 6700000, 7500000, 6300000, 8100000, 9200000, 7600000, 10400000, 11200000, 9800000]

const VAT_RATE = 0.08
const PIT_RATE = 0.015
const BUSINESS_LICENSE_TAX = 1000000

const fakeVAT = fakeRevenue.map((r) => Math.round(r * VAT_RATE))
const fakePIT = fakeRevenue.map((r) => Math.round(r * PIT_RATE))

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"]
function sumQuarter(arr: number[], q: number) {
  return arr.slice(q * 3, q * 3 + 3).reduce((s, v) => s + v, 0)
}

export function ShopTaxPage() {
  const totalRevenue = fakeRevenue.reduce((s, v) => s + v, 0)
  const totalVAT = fakeVAT.reduce((s, v) => s + v, 0)
  const totalPIT = fakePIT.reduce((s, v) => s + v, 0)
  const totalTax = totalVAT + totalPIT + BUSINESS_LICENSE_TAX

  const taxKpis = [
    { label: "Tổng thuế phải nộp", value: formatCurrencyVND(totalTax), icon: "pi pi-file", color: C.rose, bg: C.roseLight, sub: "Cả năm 2026" },
    { label: "Thuế GTGT (8%)", value: formatCurrencyVND(totalVAT), icon: "pi pi-percentage", color: C.amber, bg: C.amberLight, sub: "Trên doanh thu dịch vụ" },
    { label: "Thuế TNCN (1.5%)", value: formatCurrencyVND(totalPIT), icon: "pi pi-user", color: C.indigo, bg: C.indigoLight, sub: "Hộ kinh doanh cá thể" },
    { label: "Thuế Môn Bài", value: formatCurrencyVND(BUSINESS_LICENSE_TAX), icon: "pi pi-id-card", color: C.sky, bg: C.skyLight, sub: "Nộp 1 lần/năm" },
  ]

  /* ── Revenue vs Tax line chart ── */
  const revenueVsTaxData = useMemo(
    () => ({
      labels: MONTHS,
      datasets: [
        {
          label: "Doanh thu",
          data: fakeRevenue,
          fill: false,
          borderColor: C.emerald,
          backgroundColor: C.emerald,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: C.white,
          pointBorderColor: C.emerald,
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          yAxisID: "y",
        },
        {
          label: "Tổng thuế",
          data: fakeRevenue.map((r) => Math.round(r * (VAT_RATE + PIT_RATE))),
          fill: true,
          borderColor: C.rose,
          backgroundColor: "rgba(244,63,94,.08)",
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: C.white,
          pointBorderColor: C.rose,
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          yAxisID: "y",
        },
      ],
    }),
    []
  )

  const revenueVsTaxOptions = useMemo(
    () => ({
      ...baseLineBarOptions,
      plugins: {
        ...baseLineBarOptions.plugins,
        legend: {
          display: true,
          position: "top" as const,
          align: "end" as const,
          labels: { usePointStyle: true, pointStyle: "circle", padding: 16, color: C.slate700, font: { size: 11 } },
        },
      },
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

  /* ── Stacked bar ── */
  const taxBarData = useMemo(
    () => ({
      labels: MONTHS,
      datasets: [
        {
          label: "Thuế GTGT",
          data: fakeVAT,
          backgroundColor: C.amber,
          borderRadius: 4,
          borderSkipped: false as const,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: "Thuế TNCN",
          data: fakePIT,
          backgroundColor: C.indigo,
          borderRadius: 4,
          borderSkipped: false as const,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    }),
    []
  )

  const taxBarOptions = useMemo(
    () => ({
      ...baseLineBarOptions,
      plugins: {
        ...baseLineBarOptions.plugins,
        legend: {
          display: true,
          position: "top" as const,
          align: "end" as const,
          labels: { usePointStyle: true, pointStyle: "circle", padding: 16, color: C.slate700, font: { size: 11 } },
        },
      },
      scales: {
        ...baseLineBarOptions.scales,
        x: { ...baseLineBarOptions.scales.x, stacked: true },
        y: {
          ...baseLineBarOptions.scales.y,
          stacked: true,
          ticks: {
            ...baseLineBarOptions.scales.y.ticks,
            callback: (v: number) => (v >= 1_000_000 ? `${v / 1_000_000}tr` : v >= 1_000 ? `${v / 1000}k` : v),
          },
        },
      },
    }),
    []
  )

  /* ── Doughnut ── */
  const taxComposition = useMemo(
    () => ({
      labels: ["Thuế GTGT", "Thuế TNCN", "Thuế Môn Bài"],
      datasets: [
        {
          data: [totalVAT, totalPIT, BUSINESS_LICENSE_TAX],
          backgroundColor: [C.amber, C.indigo, C.sky],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    }),
    [totalVAT, totalPIT]
  )

  /* ── Tax rate comparison (horizontal bar) ── */
  const taxRateData = useMemo(
    () => ({
      labels: ["Thuế GTGT", "Thuế TNCN", "Tổng thuế suất"],
      datasets: [
        {
          label: "Thuế suất (%)",
          data: [VAT_RATE * 100, PIT_RATE * 100, (VAT_RATE + PIT_RATE) * 100],
          backgroundColor: [C.amber, C.indigo, C.rose],
          borderRadius: 6,
          borderSkipped: false as const,
          barPercentage: 0.5,
        },
      ],
    }),
    []
  )

  const taxRateOptions = useMemo(
    () => ({
      indexAxis: "y" as const,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: C.slate700,
          callbacks: {
            label: (ctx: { parsed: { x: number } }) => `${ctx.parsed.x}%`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(226,232,240,.5)", drawBorder: false },
          ticks: { color: C.slate400, font: { size: 11 }, callback: (v: number) => `${v}%` },
          border: { display: false },
          beginAtZero: true,
          max: 12,
        },
        y: {
          grid: { display: false },
          ticks: { color: C.slate700, font: { size: 12, weight: "600" as const } },
          border: { display: false },
        },
      },
    }),
    []
  )

  /* ── Quarterly table ── */
  const quarterlyTax = QUARTERS.map((q, i) => {
    const rev = sumQuarter(fakeRevenue, i)
    const vat = sumQuarter(fakeVAT, i)
    const pit = sumQuarter(fakePIT, i)
    const monBai = i === 0 ? BUSINESS_LICENSE_TAX : 0
    return { quarter: q, revenue: rev, vat, pit, monBai, total: vat + pit + monBai }
  })

  return (
    <div className="flex flex-1 flex-col gap-2">
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={<h1 className="text-lg font-semibold text-slate-800">Quản lý Thuế</h1>}
        end={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
            <i className="pi pi-info-circle text-[11px]" /> Dữ liệu ước tính · 2026
          </span>
        }
      />

      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
      <div className="space-y-6">

      {/* Tax KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {taxKpis.map((t) => (
          <div
            key={t.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className="absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-40 blur-2xl transition-transform duration-500 group-hover:scale-150"
              style={{ backgroundColor: t.color }}
            />
            <div className="relative z-10 flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: t.bg }}
              >
                <i className={t.icon} style={{ color: t.color, fontSize: "1.15rem" }} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-slate-900 truncate">{t.value}</p>
                <p className="text-xs font-medium text-slate-500">{t.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{t.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 — Revenue vs Tax & Stacked bar */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Doanh thu vs Thuế theo tháng" subtitle="So sánh doanh thu và tổng thuế phải nộp">
          <Chart type="line" data={revenueVsTaxData} options={revenueVsTaxOptions} className="h-[280px] w-full" />
        </ChartCard>
        <ChartCard title="Chi tiết thuế theo tháng" subtitle="GTGT + TNCN · biểu đồ cột chồng">
          <Chart type="bar" data={taxBarData} options={taxBarOptions} className="h-[280px] w-full" />
        </ChartCard>
      </div>

      {/* Charts row 2 — Doughnut + Horizontal bar + Quick info */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Cơ cấu thuế cả năm" subtitle="Tỉ lệ từng loại thuế">
          <div className="mx-auto h-[240px] max-w-[280px]">
            <Chart type="doughnut" data={taxComposition} options={pieDoughnutOptions} className="h-full w-full" />
          </div>
        </ChartCard>
        <ChartCard title="Thuế suất áp dụng" subtitle="Theo quy định cho hộ kinh doanh">
          <Chart type="bar" data={taxRateData} options={taxRateOptions} className="h-[200px] w-full" />
        </ChartCard>

        {/* Quick tax info */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Thông tin nhanh</h3>
          <p className="mt-0.5 text-xs text-slate-500">Các chỉ số thuế quan trọng</p>
          <div className="mt-5 space-y-4">
            <InfoRow label="Tỉ lệ thuế / Doanh thu" value={`${((totalTax / totalRevenue) * 100).toFixed(1)}%`} color={C.rose} bg={C.roseLight} icon="pi pi-chart-pie" />
            <InfoRow label="Thuế TB / tháng" value={formatCurrencyVND(Math.round((totalVAT + totalPIT) / 12))} color={C.amber} bg={C.amberLight} icon="pi pi-calendar" />
            <InfoRow label="Thuế TB / quý" value={formatCurrencyVND(Math.round((totalVAT + totalPIT) / 4))} color={C.indigo} bg={C.indigoLight} icon="pi pi-clock" />
            <InfoRow label="Doanh thu sau thuế" value={formatCurrencyVND(totalRevenue - totalTax)} color={C.emerald} bg={C.emeraldLight} icon="pi pi-wallet" />
          </div>
        </div>
      </div>

      {/* Quarterly tax table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Nghĩa vụ thuế theo Quý</h3>
          <p className="mt-0.5 text-xs text-slate-500">Chi tiết từng loại thuế cần kê khai & nộp mỗi quý</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5">Quý</th>
                <th className="px-6 py-3.5 text-right">Doanh thu</th>
                <th className="px-6 py-3.5 text-right">Thuế GTGT (8%)</th>
                <th className="px-6 py-3.5 text-right">Thuế TNCN (1.5%)</th>
                <th className="px-6 py-3.5 text-right">Thuế Môn Bài</th>
                <th className="px-6 py-3.5 text-right">Tổng thuế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quarterlyTax.map((row) => (
                <tr key={row.quarter} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{row.quarter}</td>
                  <td className="px-6 py-4 text-right text-slate-700">{formatCurrencyVND(row.revenue)}</td>
                  <td className="px-6 py-4 text-right text-amber-700 font-medium">{formatCurrencyVND(row.vat)}</td>
                  <td className="px-6 py-4 text-right text-indigo-700 font-medium">{formatCurrencyVND(row.pit)}</td>
                  <td className="px-6 py-4 text-right text-sky-700 font-medium">{row.monBai > 0 ? formatCurrencyVND(row.monBai) : "—"}</td>
                  <td className="px-6 py-4 text-right font-bold text-rose-700">{formatCurrencyVND(row.total)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50/80 font-bold">
                <td className="px-6 py-4 text-slate-800">Cả năm</td>
                <td className="px-6 py-4 text-right text-slate-800">{formatCurrencyVND(totalRevenue)}</td>
                <td className="px-6 py-4 text-right text-amber-700">{formatCurrencyVND(totalVAT)}</td>
                <td className="px-6 py-4 text-right text-indigo-700">{formatCurrencyVND(totalPIT)}</td>
                <td className="px-6 py-4 text-right text-sky-700">{formatCurrencyVND(BUSINESS_LICENSE_TAX)}</td>
                <td className="px-6 py-4 text-right text-rose-700">{formatCurrencyVND(totalTax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax notes */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 px-6 py-5">
        <i className="pi pi-exclamation-triangle mt-0.5 text-amber-600" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-semibold mb-1.5 text-sm">Lưu ý về thuế cho Hộ kinh doanh</p>
          <ul className="list-disc ml-4 space-y-1">
            <li><strong>Thuế GTGT:</strong> 8% trên doanh thu (áp dụng cho dịch vụ thú cưng).</li>
            <li><strong>Thuế TNCN:</strong> 1.5% trên doanh thu đối với hộ kinh doanh cá thể.</li>
            <li><strong>Thuế Môn Bài:</strong> Nộp 1 lần/năm — DT {">"} 500 triệu: 1.000.000đ; DT 300–500 triệu: 500.000đ; DT {"<"} 300 triệu: 300.000đ.</li>
            <li>Hộ KD có doanh thu {"<"} 100 triệu/năm được <strong>miễn thuế GTGT và TNCN</strong>.</li>
            <li>Kỳ kê khai: <strong>Theo quý</strong> (nộp trước ngày 30 của tháng đầu quý tiếp theo).</li>
          </ul>
        </div>
      </div>
      </div>
      </div>
    </div>
  )
}

/* ─── Sub‑components ─── */

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

function InfoRow({ label, value, color, bg, icon }: { label: string; value: string; color: string; bg: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: bg }}>
        <i className={icon} style={{ color, fontSize: ".85rem" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}
