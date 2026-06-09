import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown"
import { Skeleton } from "primereact/skeleton"
import { TabPanel, TabView } from "primereact/tabview"
import { Tag } from "primereact/tag"
import { Toolbar } from "primereact/toolbar"
import {
  getCommissionInvoiceDetail,
  getCommissionInvoices,
  getCommissionPaymentInfo,
  getCommissionSummary,
  getCommissions,
} from "@/apps/platform-fees/api/platformFeeApi"
import { CommissionInvoiceDetailSidebar } from "@/apps/platform-fees/components/CommissionInvoiceDetailSidebar"
import { CommissionPaymentDialog } from "@/apps/platform-fees/components/CommissionPaymentDialog"
import type {
  CommissionDTO,
  CommissionInvoiceDTO,
  CommissionInvoiceDetailDTO,
  CommissionInvoiceStatus,
  CommissionPaymentInfoDTO,
  CommissionSourceType,
  CommissionStatus,
  CommissionSummaryDTO,
  PageResponse,
} from "@/apps/platform-fees/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND, formatDateOnlyViVN, formatDateTimeViVN } from "@/common/utils/format"

const PAGE_SIZE = 10
type PageMergeMode = "replace" | "append"
const ALL_FILTER_VALUE = "ALL"

const emptyPage = <T,>(): PageResponse<T> => ({
  content: [],
  page: 0,
  size: PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
})

const invoiceStatusOptions: Array<{ label: string; value: CommissionInvoiceStatus | typeof ALL_FILTER_VALUE }> = [
  { label: "Tất cả", value: ALL_FILTER_VALUE },
  { label: "Chờ thanh toán", value: "PENDING" },
  { label: "Đã thanh toán", value: "PAID" },
  { label: "Quá hạn", value: "OVERDUE" },
  { label: "Đã hủy", value: "CANCELED" },
]

const commissionStatusOptions: Array<{ label: string; value: CommissionStatus | typeof ALL_FILTER_VALUE }> = [
  { label: "Tất cả", value: ALL_FILTER_VALUE },
  { label: "Chờ chốt kỳ", value: "PENDING" },
  { label: "Đã lên hóa đơn", value: "INVOICED" },
  { label: "Đã thu phí", value: "COLLECTED" },
  { label: "Đã hoàn/điều chỉnh", value: "REFUNDED" },
  { label: "Đã hủy", value: "CANCELED" },
]

const sourceTypeOptions: Array<{ label: string; value: CommissionSourceType | typeof ALL_FILTER_VALUE }> = [
  { label: "Tất cả", value: ALL_FILTER_VALUE },
  { label: "Đơn hàng", value: "ORDER" },
  { label: "Dịch vụ spa", value: "SERVICE_BOOKING" },
  { label: "Lịch thú y", value: "VET_BOOKING" },
]

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { message?: string; error?: string } | undefined
  return apiError?.message || apiError?.error || fallback
}

function getInvoiceStatusLabel(status: CommissionInvoiceStatus) {
  if (status === "PENDING") return "Chờ thanh toán"
  if (status === "PAID") return "Đã thanh toán"
  if (status === "OVERDUE") return "Quá hạn"
  return "Đã hủy"
}

function getInvoiceStatusSeverity(status: CommissionInvoiceStatus) {
  if (status === "PAID") return "success" as const
  if (status === "PENDING") return "warning" as const
  if (status === "OVERDUE") return "danger" as const
  return "secondary" as const
}

function getCommissionStatusLabel(status: CommissionStatus) {
  if (status === "PENDING") return "Chờ chốt kỳ"
  if (status === "INVOICED") return "Đã lên hóa đơn"
  if (status === "COLLECTED") return "Đã thu phí"
  if (status === "REFUNDED") return "Đã hoàn/điều chỉnh"
  return "Đã hủy"
}

function getCommissionStatusSeverity(status: CommissionStatus) {
  if (status === "COLLECTED") return "success" as const
  if (status === "PENDING" || status === "INVOICED") return "warning" as const
  if (status === "REFUNDED") return "info" as const
  return "secondary" as const
}

function getSourceTypeLabel(sourceType: CommissionSourceType) {
  if (sourceType === "ORDER") return "Đơn hàng"
  if (sourceType === "SERVICE_BOOKING") return "Dịch vụ spa"
  return "Lịch thú y"
}

function canPayInvoice(status: CommissionInvoiceStatus) {
  return status === "PENDING" || status === "OVERDUE"
}

export function ShopPlatformFeePage() {
  const invoiceLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const commissionLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const historyLoadMoreRef = useRef<HTMLDivElement | null>(null)
  const [summary, setSummary] = useState<CommissionSummaryDTO | null>(null)
  const [invoices, setInvoices] = useState<PageResponse<CommissionInvoiceDTO>>(emptyPage)
  const [commissions, setCommissions] = useState<PageResponse<CommissionDTO>>(emptyPage)
  const [paidInvoices, setPaidInvoices] = useState<PageResponse<CommissionInvoiceDTO>>(emptyPage)
  const [invoiceStatus, setInvoiceStatus] = useState<CommissionInvoiceStatus | undefined>()
  const [commissionStatus, setCommissionStatus] = useState<CommissionStatus | undefined>()
  const [sourceType, setSourceType] = useState<CommissionSourceType | undefined>()
  const [activeTab, setActiveTab] = useState(0)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isLoadingCommissions, setIsLoadingCommissions] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<CommissionInvoiceDetailDTO | null>(null)
  const [paymentVisible, setPaymentVisible] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<CommissionPaymentInfoDTO | null>(null)

  const isRefreshing = isLoadingSummary || isLoadingInvoices || isLoadingCommissions || isLoadingHistory
  const hasMoreInvoices = invoices.totalPages > 0 && invoices.page + 1 < invoices.totalPages
  const hasMoreCommissions = commissions.totalPages > 0 && commissions.page + 1 < commissions.totalPages
  const hasMorePaidInvoices = paidInvoices.totalPages > 0 && paidInvoices.page + 1 < paidInvoices.totalPages

  const nearestPayableInvoiceId = useMemo(() => {
    if (summary?.nearestUnpaidInvoiceId) return summary.nearestUnpaidInvoiceId
    return invoices.content.find((invoice) => canPayInvoice(invoice.status))?.id ?? null
  }, [invoices.content, summary?.nearestUnpaidInvoiceId])

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true)
    try {
      setSummary(await getCommissionSummary())
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải tổng quan phí nền tảng."))
    } finally {
      setIsLoadingSummary(false)
    }
  }, [])

  const loadInvoices = useCallback(async (status = invoiceStatus, page = invoices.page, size = invoices.size, mode: PageMergeMode = "replace") => {
    setIsLoadingInvoices(true)
    try {
      const nextInvoices = await getCommissionInvoices({ status, page, size })
      setInvoices((currentInvoices) =>
        mode === "append"
          ? {
              ...nextInvoices,
              content: [...currentInvoices.content, ...(nextInvoices.content ?? [])],
            }
          : nextInvoices
      )
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải danh sách hóa đơn phí nền tảng."))
    } finally {
      setIsLoadingInvoices(false)
    }
  }, [invoiceStatus, invoices.page, invoices.size])

  const loadCommissions = useCallback(async (
    page = commissions.page,
    size = commissions.size,
    status = commissionStatus,
    nextSourceType = sourceType,
    mode: PageMergeMode = "replace",
  ) => {
    setIsLoadingCommissions(true)
    try {
      const nextCommissions = await getCommissions({ status, sourceType: nextSourceType, page, size })
      setCommissions((currentCommissions) =>
        mode === "append"
          ? {
              ...nextCommissions,
              content: [...currentCommissions.content, ...(nextCommissions.content ?? [])],
            }
          : nextCommissions
      )
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải danh sách giao dịch tính phí."))
    } finally {
      setIsLoadingCommissions(false)
    }
  }, [commissionStatus, commissions.page, commissions.size, sourceType])

  const loadPaidInvoices = useCallback(async (page = paidInvoices.page, size = paidInvoices.size, mode: PageMergeMode = "replace") => {
    setIsLoadingHistory(true)
    try {
      const nextPaidInvoices = await getCommissionInvoices({ status: "PAID", page, size })
      setPaidInvoices((currentPaidInvoices) =>
        mode === "append"
          ? {
              ...nextPaidInvoices,
              content: [...currentPaidInvoices.content, ...(nextPaidInvoices.content ?? [])],
            }
          : nextPaidInvoices
      )
      setHistoryLoaded(true)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải lịch sử thanh toán."))
    } finally {
      setIsLoadingHistory(false)
    }
  }, [paidInvoices.page, paidInvoices.size])

  useEffect(() => {
    void Promise.all([loadSummary(), loadInvoices(undefined, 0, PAGE_SIZE), loadCommissions(0, PAGE_SIZE, undefined, undefined)])
  }, [])

  useEffect(() => {
    const target = invoiceLoadMoreRef.current
    if (!target || activeTab !== 0 || !hasMoreInvoices || isLoadingInvoices) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadInvoices(invoiceStatus, invoices.page + 1, invoices.size, "append")
        }
      },
      { rootMargin: "160px" }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [activeTab, hasMoreInvoices, invoiceStatus, invoices.page, invoices.size, isLoadingInvoices, loadInvoices])

  useEffect(() => {
    const target = commissionLoadMoreRef.current
    if (!target || activeTab !== 1 || !hasMoreCommissions || isLoadingCommissions) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadCommissions(commissions.page + 1, commissions.size, commissionStatus, sourceType, "append")
        }
      },
      { rootMargin: "160px" }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [activeTab, commissionStatus, commissions.page, commissions.size, hasMoreCommissions, isLoadingCommissions, loadCommissions, sourceType])

  useEffect(() => {
    const target = historyLoadMoreRef.current
    if (!target || activeTab !== 2 || !hasMorePaidInvoices || isLoadingHistory) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadPaidInvoices(paidInvoices.page + 1, paidInvoices.size, "append")
        }
      },
      { rootMargin: "160px" }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [activeTab, hasMorePaidInvoices, isLoadingHistory, loadPaidInvoices, paidInvoices.page, paidInvoices.size])

  const refreshPage = useCallback(async () => {
    await Promise.all([
      loadSummary(),
      loadInvoices(invoiceStatus, 0, PAGE_SIZE),
      loadCommissions(0, PAGE_SIZE),
      historyLoaded ? loadPaidInvoices(0, PAGE_SIZE) : Promise.resolve(),
    ])
  }, [
    commissionStatus,
    commissions.page,
    commissions.size,
    historyLoaded,
    invoiceStatus,
    invoices.page,
    invoices.size,
    loadCommissions,
    loadInvoices,
    loadPaidInvoices,
    loadSummary,
    paidInvoices.page,
    paidInvoices.size,
  ])

  const openInvoiceDetail = async (invoiceId: number) => {
    setDetailVisible(true)
    setDetailLoading(true)
    setSelectedInvoice(null)
    try {
      setSelectedInvoice(await getCommissionInvoiceDetail(invoiceId))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải chi tiết hóa đơn."))
    } finally {
      setDetailLoading(false)
    }
  }

  const openPaymentDialog = async (invoiceId: number) => {
    setPaymentVisible(true)
    setPaymentLoading(true)
    setPaymentInfo(null)
    try {
      setPaymentInfo(await getCommissionPaymentInfo(invoiceId))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải thông tin thanh toán."))
    } finally {
      setPaymentLoading(false)
    }
  }

  const copyValue = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      notify.success(message)
    } catch (_error) {
      notify.error("Không thể sao chép nội dung.")
    }
  }

  const handleInvoiceStatusChange = (event: DropdownChangeEvent) => {
    const nextStatus = event.value === ALL_FILTER_VALUE ? undefined : (event.value as CommissionInvoiceStatus)
    setInvoiceStatus(nextStatus)
    void loadInvoices(nextStatus, 0, invoices.size)
  }

  const handleCommissionStatusChange = (event: DropdownChangeEvent) => {
    const nextStatus = event.value === ALL_FILTER_VALUE ? undefined : (event.value as CommissionStatus)
    setCommissionStatus(nextStatus)
    void loadCommissions(0, commissions.size, nextStatus, sourceType)
  }

  const handleSourceTypeChange = (event: DropdownChangeEvent) => {
    const nextSourceType = event.value === ALL_FILTER_VALUE ? undefined : (event.value as CommissionSourceType)
    setSourceType(nextSourceType)
    void loadCommissions(0, commissions.size, commissionStatus, nextSourceType)
  }

  const summaryCards = [
    {
      label: "Công nợ chưa trả",
      value: formatCurrencyVND(summary?.unpaidInvoiceAmount),
      count: `${summary?.unpaidInvoiceCount ?? 0} hóa đơn chưa thanh toán`,
      icon: "pi pi-file-excel",
      color: "text-rose-600",
      iconClassName: "bg-rose-100 text-rose-600",
    },
    {
      label: "Phí kỳ hiện tại",
      value: formatCurrencyVND(summary?.pendingCommissionAmount),
      count: `${summary?.pendingCommissionCount ?? 0} giao dịch`,
      icon: "pi pi-chart-pie",
      color: "text-[#214388]",
      iconClassName: "bg-blue-100 text-[#214388]",
    },
    {
      label: "Đã thanh toán",
      value: formatCurrencyVND(summary?.paidInvoiceAmount),
      count: `${summary?.paidInvoiceCount ?? 0} hóa đơn`,
      icon: "pi pi-check-circle",
      color: "text-emerald-600",
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Hóa đơn quá hạn",
      value: formatCurrencyVND(summary?.overdueInvoiceAmount),
      count: `${summary?.overdueInvoiceCount ?? 0} hóa đơn`,
      icon: "pi pi-hourglass",
      color: "text-red-600",
      iconClassName: "bg-red-100 text-red-600",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-2">
      <Toolbar
        className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        start={
          <div>
            <h1 className="m-0 text-lg font-semibold text-slate-800">Phí nền tảng</h1>
            <p className="m-0 mt-0.5 text-sm text-slate-500">
              Theo dõi phí nền tảng 15% từ các đơn hàng, dịch vụ và lịch thú y đã hoàn thành.
            </p>
          </div>
        }
        end={
          <Button
            type="button"
            label="Làm mới"
            icon="pi pi-refresh"
            outlined
            loading={isRefreshing}
            onClick={() => void refreshPage()}
            className="!h-9 !rounded-md !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-medium !text-[#40526b] hover:!bg-[#f8fafc]"
          />
        }
      />

      <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
        <div className="space-y-5">
          {summary?.hasUnpaidInvoice && (
            <div className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <i className="pi pi-exclamation-triangle" />
                </span>
                <div>
                  <p className="m-0 text-sm font-bold text-slate-800">Bạn có hóa đơn phí nền tảng cần thanh toán</p>
                  <p className="m-0 mt-1 text-sm text-slate-600">
                    {summary.message ||
                      `Số tiền: ${formatCurrencyVND(summary.unpaidInvoiceAmount)}. Hạn thanh toán: ${formatDateOnlyViVN(summary.nextDueDate)}.`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  label="Thanh toán ngay"
                  icon="pi pi-qrcode"
                  disabled={!nearestPayableInvoiceId}
                  onClick={() => nearestPayableInvoiceId && void openPaymentDialog(nearestPayableInvoiceId)}
                  className="!h-9 !rounded-md !border-orange-600 !bg-orange-600 !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-orange-700 [&_.p-button-label]:!text-white"
                />
                <Button
                  type="button"
                  label="Xem chi tiết"
                  outlined
                  disabled={!nearestPayableInvoiceId}
                  onClick={() => nearestPayableInvoiceId && void openInvoiceDetail(nearestPayableInvoiceId)}
                  className="!h-9 !rounded-md !border-[#d8e0ea] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-slate-600 hover:!bg-slate-50"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} loading={isLoadingSummary && !summary} />
            ))}
          </div>

          <div className="rounded-xl border border-[#e5edf6] bg-[#f8fafc] px-4 py-3">
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <PeriodInfo label="Kỳ hiện tại" value={`${formatDateOnlyViVN(summary?.currentPeriodFrom)} - ${formatDateOnlyViVN(summary?.currentPeriodTo)}`} />
              <PeriodInfo label="Ngày chốt kỳ tiếp theo" value={formatDateOnlyViVN(summary?.nextInvoiceDate)} />
              <PeriodInfo label="Hạn thanh toán gần nhất" value={formatDateTimeViVN(summary?.nextDueDate)} />
            </div>
          </div>

          <TabView
            activeIndex={activeTab}
            onTabChange={(event) => {
              setActiveTab(event.index)
              if (event.index === 2 && !historyLoaded) void loadPaidInvoices(0, PAGE_SIZE)
            }}
            className="shop-platform-fee-tabview [&_.p-tabview-nav]:!mb-5 [&_.p-tabview-nav]:!grid [&_.p-tabview-nav]:!grid-cols-1 [&_.p-tabview-nav]:!gap-0 [&_.p-tabview-nav]:!overflow-hidden [&_.p-tabview-nav]:!rounded-lg [&_.p-tabview-nav]:!border [&_.p-tabview-nav]:!border-[#dbe5f2] [&_.p-tabview-nav]:!bg-white md:[&_.p-tabview-nav]:!grid-cols-3 [&_.p-tabview-nav>li]:!m-0 [&_.p-tabview-nav>li]:!border-0 [&_.p-tabview-nav-link]:!h-12 [&_.p-tabview-nav-link]:!justify-center [&_.p-tabview-nav-link]:!gap-2 [&_.p-tabview-nav-link]:!rounded-none [&_.p-tabview-nav-link]:!border-0 [&_.p-tabview-nav-link]:!bg-white [&_.p-tabview-nav-link]:!text-sm [&_.p-tabview-nav-link]:!font-semibold [&_.p-tabview-nav-link]:!text-slate-600 [&_.p-tabview-panels]:!bg-transparent [&_.p-tabview-panels]:!p-0 [&_.p-tabview-selected_.p-tabview-nav-link]:!bg-[#eef5ff] [&_.p-tabview-selected_.p-tabview-nav-link]:!text-[#0f5fff] [&_.p-tabview-selected_.p-tabview-nav-link]:!shadow-[inset_0_0_0_1px_#93b8ff] [&_.p-highlight_.p-tabview-nav-link]:!bg-[#eef5ff] [&_.p-highlight_.p-tabview-nav-link]:!text-[#0f5fff] [&_.p-highlight_.p-tabview-nav-link]:!shadow-[inset_0_0_0_1px_#93b8ff]"
            panelContainerClassName="!px-0 !pb-0"
          >
            <TabPanel header="Hóa đơn" leftIcon="pi pi-file mr-2">
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="m-0 text-base font-bold text-[#24364d]">Danh sách hóa đơn</h2>
                  <p className="m-0 mt-1 text-xs text-slate-500">Theo dõi hóa đơn phí nền tảng theo từng kỳ 15 ngày.</p>
                </div>
                <FilterDropdown
                  icon="pi pi-filter"
                  label="Trạng thái"
                  value={invoiceStatus ?? ALL_FILTER_VALUE}
                  options={invoiceStatusOptions}
                  onChange={handleInvoiceStatusChange}
                />
              </div>
              <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                <DataTable
                  value={invoices.content}
                  dataKey="id"
                  size="small"
                  stripedRows
                  rowHover
                  showGridlines
                  tableStyle={{ minWidth: "72rem" }}
                  loading={isLoadingInvoices}
                  emptyMessage={<div className="w-full py-2 text-center text-[#4c5f78]">Chưa có hóa đơn phí nền tảng</div>}
                >
                  <Column field="invoiceCode" header="Mã hóa đơn" alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Kỳ tính phí" body={(row: CommissionInvoiceDTO) => `${formatDateOnlyViVN(row.periodFrom)} - ${formatDateOnlyViVN(row.periodTo)}`} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Số tiền" body={(row: CommissionInvoiceDTO) => formatCurrencyVND(row.totalCommissionAmount)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Hạn thanh toán" body={(row: CommissionInvoiceDTO) => formatDateTimeViVN(row.dueAt)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Trạng thái" body={(row: CommissionInvoiceDTO) => <Tag value={getInvoiceStatusLabel(row.status)} severity={getInvoiceStatusSeverity(row.status)} />} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Thao tác" body={(row: CommissionInvoiceDTO) => <InvoiceActions invoice={row} onView={openInvoiceDetail} onPay={openPaymentDialog} />} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                </DataTable>
                {invoices.content.length > 0 && hasMoreInvoices && (
                  <div ref={invoiceLoadMoreRef} className="flex h-12 items-center justify-center py-3 text-sm text-slate-500">
                    {isLoadingInvoices && (
                      <span className="inline-flex items-center gap-2">
                        <i className="pi pi-spinner pi-spin" />
                        Đang tải thêm hóa đơn...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel header="Giao dịch tính phí" leftIcon="pi pi-percentage mr-2">
              <div className="mb-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="m-0 text-base font-bold text-[#24364d]">Giao dịch phát sinh phí</h2>
                  <p className="m-0 mt-1 text-xs text-slate-500">Phí nền tảng được tính trên các giao dịch đã hoàn thành.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <FilterDropdown
                    icon="pi pi-filter"
                    label="Trạng thái"
                    value={commissionStatus ?? ALL_FILTER_VALUE}
                    options={commissionStatusOptions}
                    onChange={handleCommissionStatusChange}
                  />
                  <FilterDropdown
                    icon="pi pi-list"
                    label="Loại"
                    value={sourceType ?? ALL_FILTER_VALUE}
                    options={sourceTypeOptions}
                    onChange={handleSourceTypeChange}
                  />
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                <DataTable
                  value={commissions.content}
                  dataKey="id"
                  size="small"
                  stripedRows
                  rowHover
                  showGridlines
                  tableStyle={{ minWidth: "86rem" }}
                  loading={isLoadingCommissions}
                  emptyMessage={<div className="w-full py-2 text-center text-[#4c5f78]">Chưa có giao dịch tính phí</div>}
                >
                  <Column header="Loại giao dịch" body={(row: CommissionDTO) => getSourceTypeLabel(row.sourceType)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column field="sourceCode" header="Mã giao dịch" body={(row: CommissionDTO) => row.sourceCode || `#${row.sourceId}`} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Ngày hoàn thành" body={(row: CommissionDTO) => formatDateTimeViVN(row.completedAt)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Doanh thu" body={(row: CommissionDTO) => formatCurrencyVND(row.grossAmount)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Giảm giá" body={(row: CommissionDTO) => formatCurrencyVND(row.discountAmount)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Phí ship" body={(row: CommissionDTO) => formatCurrencyVND(row.shippingFee)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Giá trị tính phí" body={(row: CommissionDTO) => formatCurrencyVND(row.commissionBase)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Phí nền tảng" body={(row: CommissionDTO) => formatCurrencyVND(row.commissionAmount)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Trạng thái" body={(row: CommissionDTO) => <Tag value={getCommissionStatusLabel(row.status)} severity={getCommissionStatusSeverity(row.status)} />} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                </DataTable>
                {commissions.content.length > 0 && hasMoreCommissions && (
                  <div ref={commissionLoadMoreRef} className="flex h-12 items-center justify-center py-3 text-sm text-slate-500">
                    {isLoadingCommissions && (
                      <span className="inline-flex items-center gap-2">
                        <i className="pi pi-spinner pi-spin" />
                        Đang tải thêm giao dịch...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel header="Lịch sử thanh toán" leftIcon="pi pi-history mr-2">
              <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                <DataTable
                  value={paidInvoices.content}
                  dataKey="id"
                  size="small"
                  stripedRows
                  rowHover
                  showGridlines
                  tableStyle={{ minWidth: "72rem" }}
                  loading={isLoadingHistory}
                  emptyMessage={<div className="w-full py-2 text-center text-[#4c5f78]">Chưa có lịch sử thanh toán</div>}
                >
                  <Column field="invoiceCode" header="Mã hóa đơn" alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Kỳ tính phí" body={(row: CommissionInvoiceDTO) => `${formatDateOnlyViVN(row.periodFrom)} - ${formatDateOnlyViVN(row.periodTo)}`} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Số tiền" body={(row: CommissionInvoiceDTO) => formatCurrencyVND(row.totalCommissionAmount)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Ngày thanh toán" body={(row: CommissionInvoiceDTO) => formatDateTimeViVN(row.paidAt)} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                  <Column header="Thao tác" body={(row: CommissionInvoiceDTO) => <Button type="button" label="Xem chi tiết" icon="pi pi-eye" text onClick={() => void openInvoiceDetail(row.id)} className="!text-[#214388]" />} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                </DataTable>
                {paidInvoices.content.length > 0 && hasMorePaidInvoices && (
                  <div ref={historyLoadMoreRef} className="flex h-12 items-center justify-center py-3 text-sm text-slate-500">
                    {isLoadingHistory && (
                      <span className="inline-flex items-center gap-2">
                        <i className="pi pi-spinner pi-spin" />
                        Đang tải thêm lịch sử...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <CommissionInvoiceDetailSidebar
        visible={detailVisible}
        loading={detailLoading}
        invoice={selectedInvoice}
        onHide={() => setDetailVisible(false)}
        onPay={(invoiceId) => void openPaymentDialog(invoiceId)}
      />
      <CommissionPaymentDialog
        visible={paymentVisible}
        loading={paymentLoading}
        paymentInfo={paymentInfo}
        onHide={() => setPaymentVisible(false)}
        onCopy={(value, message) => void copyValue(value, message)}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  count,
  icon,
  color,
  iconClassName,
  loading,
}: {
  label: string
  value: string
  count: string
  icon: string
  color: string
  iconClassName: string
  loading: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc] p-4">
      <div className="absolute -bottom-5 -right-4 opacity-[0.04]">
        <i className={icon} style={{ fontSize: "5rem" }} />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-slate-600">{label}</p>
          {loading ? <Skeleton width="7rem" height="2rem" className="mt-4" /> : <p className={`m-0 mt-4 text-2xl font-bold ${color}`}>{value}</p>}
          {loading ? <Skeleton width="8rem" height=".875rem" className="mt-2" /> : <p className="m-0 mt-2 text-xs text-slate-500">{count}</p>}
        </div>
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
          <i className={icon} />
        </span>
      </div>
    </div>
  )
}

function PeriodInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="m-0 mt-1 font-bold text-slate-900">{value}</p>
    </div>
  )
}

function FilterDropdown({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: string
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (event: DropdownChangeEvent) => void
}) {
  return (
    <label className="inline-flex h-9 w-full items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e] md:w-auto">
      <i className={`${icon} h-4 w-4 text-[#70829a]`} />
      <span className="shrink-0">{label}</span>
      <Dropdown
        value={value}
        options={options}
        optionLabel="label"
        optionValue="value"
        filter
        filterBy="label"
        filterPlaceholder={`Tìm ${label.toLowerCase()}`}
        emptyFilterMessage="Không có dữ liệu phù hợp"
        onChange={onChange}
        className="min-w-32 !border-0 !bg-transparent !shadow-none [&_.p-dropdown-label]:!p-0 [&_.p-dropdown-label]:!text-sm [&_.p-dropdown-label]:!font-medium [&_.p-dropdown-label]:!text-[#24364d]"
        panelClassName="min-w-[260px] text-sm [&_.p-dropdown-filter-container]:!p-2 [&_.p-dropdown-filter]:!h-9 [&_.p-dropdown-filter]:!w-full [&_.p-dropdown-filter]:!rounded-md [&_.p-dropdown-filter]:!border-[#d9e1eb] [&_.p-dropdown-filter]:!px-3 [&_.p-dropdown-filter]:!pr-9 [&_.p-dropdown-filter]:!text-sm [&_.p-dropdown-filter-icon]:!right-5 [&_.p-dropdown-item]:!px-4 [&_.p-dropdown-item]:!py-3"
        dropdownIcon="pi pi-chevron-down text-[#70829a]"
      />
    </label>
  )
}

function InvoiceActions({
  invoice,
  onView,
  onPay,
}: {
  invoice: CommissionInvoiceDTO
  onView: (invoiceId: number) => void
  onPay: (invoiceId: number) => void
}) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-2">
      {canPayInvoice(invoice.status) && (
        <Button
          type="button"
          label="Thanh toán"
          icon="pi pi-qrcode"
          onClick={() => void onPay(invoice.id)}
          className="!h-8 !rounded-md !border-[#214388] !bg-[#214388] !px-3 !py-0 !text-xs !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
        />
      )}
      <Button
        type="button"
        label="Xem chi tiết"
        icon="pi pi-eye"
        outlined
        onClick={() => void onView(invoice.id)}
        className="!h-8 !rounded-md !border-[#d8e0ea] !bg-white !px-3 !py-0 !text-xs !font-semibold !text-slate-600 hover:!bg-slate-50"
      />
    </div>
  )
}
