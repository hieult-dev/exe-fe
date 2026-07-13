import { Skeleton } from "primereact/skeleton"
import type { AdminCommissionMonthlyReportDTO } from "@/apps/admin-commissions/model"
import { formatCurrencyVND, formatDateOnlyViVN, formatMonthViVN } from "@/common/utils/format"

type AdminCommissionSummaryProps = {
  report: AdminCommissionMonthlyReportDTO | null
  month: string
  loading: boolean
}

export function AdminCommissionSummary({ report, month, loading }: AdminCommissionSummaryProps) {
  const summary = report?.summary
  const cards = [
    {
      label: "Hoa hồng phát sinh",
      value: formatCurrencyVND(summary?.commissionAmount),
      supporting: `${summary?.transactionCount ?? 0} giao dịch từ ${summary?.shopCount ?? 0} shop`,
      icon: "pi pi-chart-line",
      accent: "text-[#214388]",
      iconClassName: "bg-blue-100 text-[#214388]",
      barClassName: "bg-[#214388]",
    },
    {
      label: "Còn phải thu",
      value: formatCurrencyVND(summary?.outstandingAmount),
      supporting: `${summary?.outstandingShopCount ?? 0} shop còn công nợ`,
      icon: "pi pi-wallet",
      accent: "text-amber-600",
      iconClassName: "bg-amber-100 text-amber-600",
      barClassName: "bg-amber-500",
    },
    {
      label: "Khoản quá hạn",
      value: formatCurrencyVND(summary?.overdueAmount),
      supporting: `${summary?.overdueShopCount ?? 0} shop có khoản quá hạn`,
      icon: "pi pi-exclamation-triangle",
      accent: "text-rose-600",
      iconClassName: "bg-rose-100 text-rose-600",
      barClassName: "bg-rose-500",
    },
    {
      label: "Đã thanh toán",
      value: formatCurrencyVND(summary?.collectedAmount),
      supporting: "Hoa hồng đã được hệ thống ghi nhận",
      icon: "pi pi-check-circle",
      accent: "text-emerald-600",
      iconClassName: "bg-emerald-100 text-emerald-600",
      barClassName: "bg-emerald-500",
    },
  ]

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-[#dbe6f3] bg-gradient-to-r from-[#f0f6ff] via-white to-[#f8fbff] px-4 py-4 sm:px-5">
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[#214388]/[0.05]" />
        <div className="relative">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-[#5d7391]">Kỳ báo cáo</p>
            <h2 className="m-0 mt-1.5 text-xl font-bold text-[#1d3557]">{formatMonthViVN(month)}</h2>
            <p className="m-0 mt-1 text-sm text-slate-500">
              {report ? `${formatDateOnlyViVN(report.periodFrom)} - ${formatDateOnlyViVN(report.periodTo)}` : "Đang xác định kỳ báo cáo"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} loading={loading && !report} />
        ))}
      </section>
    </>
  )
}

function SummaryCard({
  label,
  value,
  supporting,
  icon,
  accent,
  iconClassName,
  barClassName,
  loading,
}: {
  label: string
  value: string
  supporting: string
  icon: string
  accent: string
  iconClassName: string
  barClassName: string
  loading: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <span className={`absolute inset-x-0 top-0 h-1 ${barClassName}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-slate-600">{label}</p>
          {loading ? <Skeleton width="7.5rem" height="1.75rem" className="mt-3" /> : <p className={`m-0 mt-3 text-2xl font-bold ${accent}`}>{value}</p>}
        </div>
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
          <i className={icon} />
        </span>
      </div>
      {loading ? <Skeleton width="9rem" height="0.75rem" className="mt-3" /> : <p className="m-0 mt-3 truncate text-xs text-slate-500">{supporting}</p>}
    </div>
  )
}
