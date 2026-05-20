import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog"
import { DataTable } from "primereact/datatable"
import { ProgressBar } from "primereact/progressbar"
import { ProgressSpinner } from "primereact/progressspinner"
import { Tag } from "primereact/tag"
import { Toolbar } from "primereact/toolbar"
import {
  cancelSepayPayment,
  createSepayQrPayment,
  getCurrentShopSubscriptionPayment,
  getSepayPaymentStatus,
  getShopSubscriptionOverview,
  getShopSubscriptionPayments,
} from "@/apps/subscriptions/api/subscriptionApi"
import { RenewSubscriptionDialog } from "@/apps/subscriptions/components/RenewSubscriptionDialog"
import type {
  CurrentSubscriptionPaymentResponse,
  RenewMonths,
  SepayPaymentStatus,
  SepayQrPaymentResponse,
  SubscriptionOverviewResponse,
  SubscriptionPaymentHistoryItem,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "@/apps/subscriptions/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrency, formatDateOnlyViVN, formatDateTimeViVN } from "@/common/utils/format"

const DAY_IN_MS = 24 * 60 * 60 * 1000

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { message?: string; error?: string } | undefined
  return apiError?.message || apiError?.error || fallback
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getRemainingDaysUntil(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const today = startOfLocalDay(new Date())
  const targetDate = startOfLocalDay(date)
  const remainingDays = Math.ceil((targetDate.getTime() - today.getTime()) / DAY_IN_MS)

  return remainingDays > 0 ? remainingDays : null
}

function getPaymentStatusLabel(status: SepayPaymentStatus) {
  if (status === "PENDING") return "Chờ thanh toán"
  if (status === "SUCCESS") return "Thành công"
  if (status === "FAILED") return "Thất bại"
  if (status === "EXPIRED") return "Hết hạn"
  return "Đã hủy"
}

function getPaymentStatusSeverity(status: SepayPaymentStatus) {
  if (status === "SUCCESS") return "success" as const
  if (status === "PENDING") return "warning" as const
  if (status === "FAILED" || status === "EXPIRED") return "danger" as const
  return "info" as const
}

function getPlanTypeLabel(planType: SubscriptionPlanType) {
  if (planType === "TRIAL") return "Dùng thử"
  if (planType === "MONTHLY") return "Theo tháng"
  return planType
}

function getPlanNameLabel(planName: string) {
  if (planName === "Monthly" || planName === "MONTHLY") return "Gói theo tháng"
  if (planName === "Trial" || planName === "TRIAL") return "Gói dùng thử"
  return planName
}

function getSubscriptionNotice(overview: SubscriptionOverviewResponse) {
  const planLabel = getPlanTypeLabel(overview.planType).toLowerCase()
  const baseMessage = `Gói ${planLabel} của bạn còn ${overview.currentPeriodRemainingDays} ngày.`

  if (overview.planType !== "TRIAL") return baseMessage

  return `${baseMessage} Sau thời gian này, bạn cần thanh toán ${formatCurrency(
    overview.monthlyPrice
  )}/tháng để tiếp tục sử dụng hệ thống.`
}

function getSubscriptionStatusLabel(status: SubscriptionStatus) {
  if (status === "ACTIVE") return "Đang hoạt động"
  if (status === "EXPIRED") return "Hết hạn"
  if (status === "CANCELED") return "Đã hủy"
  return status
}

function getSubscriptionStatusSeverity(status: SubscriptionStatus) {
  if (status === "ACTIVE") return "success" as const
  if (status === "EXPIRED") return "danger" as const
  return "info" as const
}

function CurrentPlanMetric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-lg border border-[#e5edf6] bg-[#f8fafc] px-3 py-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <i className={`${icon} text-[#5068ff]`} />
        <span>{label}</span>
      </div>
      <p className="m-0 text-base font-bold text-slate-900">{value}</p>
    </div>
  )
}

function CompactDateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-xs font-medium text-slate-500">{label}</p>
      <p className="m-0 mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function PeriodProgress({
  label,
  totalDays,
  remainingDays,
  usedPercent,
  className = "bg-[#f8fafc]",
}: {
  label: string
  totalDays: number
  remainingDays: number
  usedPercent: number
  className?: string
}) {
  return (
    <div className={`rounded-lg px-3 py-3 ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <span>
          {label}: {totalDays} ngày
        </span>
        <span>Còn lại: {remainingDays} ngày</span>
      </div>
      <div className="mb-2 flex justify-end text-xs text-slate-500">{usedPercent}%</div>
      <ProgressBar value={usedPercent} showValue={false} className="h-2 overflow-hidden rounded-full bg-[#e8edf5]" />
    </div>
  )
}

function sectionHeader(icon: string, title: string) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3ff] text-[#5068ff]">
        <i className={`${icon} text-sm`} />
      </span>
      <h2 className="m-0 text-base font-semibold text-slate-800">{title}</h2>
    </div>
  )
}

export function ShopSubscriptionPage() {
  const pollingTimerRef = useRef<number | null>(null)
  const activePaymentIdRef = useRef<number | null>(null)
  const [overview, setOverview] = useState<SubscriptionOverviewResponse | null>(null)
  const [currentPayment, setCurrentPayment] = useState<CurrentSubscriptionPaymentResponse>(null)
  const [paymentHistory, setPaymentHistory] = useState<SubscriptionPaymentHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [renewStep, setRenewStep] = useState<1 | 2>(1)
  const [selectedMonths, setSelectedMonths] = useState<RenewMonths>(3)
  const [paymentInfo, setPaymentInfo] = useState<SepayQrPaymentResponse | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<SepayPaymentStatus>("PENDING")
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [isCancelingPayment, setIsCancelingPayment] = useState(false)
  const [cancelingCurrentPaymentId, setCancelingCurrentPaymentId] = useState<number | null>(null)

  const monthlyPrice = overview?.monthlyPrice ?? 500000
  const planTotalDays = overview?.planTotalDays ?? 0
  const usedDays = overview?.usedDays ?? 0
  const currentPeriodUsedPercent = planTotalDays > 0 ? Math.min(100, Math.max(0, Math.round((usedDays / planTotalDays) * 100))) : 0
  const currentPendingPayment = currentPayment?.status === "PENDING" ? currentPayment : null
  const isTrialPlan = overview?.planType === "TRIAL"
  const trialRemainingDays = overview ? getRemainingDaysUntil(overview.trialEndsAt) : null
  const hasActiveTrial = !!overview && overview.trialTotalDays > 0 && trialRemainingDays !== null
  const trialUsedDays = overview && hasActiveTrial ? Math.max(0, overview.trialTotalDays - (trialRemainingDays ?? 0)) : 0
  const trialUsedPercent =
    overview && overview.trialTotalDays > 0 ? Math.min(100, Math.max(0, Math.round((trialUsedDays / overview.trialTotalDays) * 100))) : 0
  const currentPeriodLabel = isTrialPlan ? "Kỳ dùng thử" : "Kỳ trả phí"
  const shouldShowExpirationNotice = !!overview && overview.currentPeriodRemainingDays < 15

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      window.clearInterval(pollingTimerRef.current)
      pollingTimerRef.current = null
    }
  }, [])

  const reloadSubscriptionData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)

    try {
      const [overviewResult, currentPaymentResult, paymentHistoryResult] = await Promise.all([
        getShopSubscriptionOverview(),
        getCurrentShopSubscriptionPayment(),
        getShopSubscriptionPayments(0, 10),
      ])

      setOverview(overviewResult)
      setCurrentPayment(currentPaymentResult)
      setPaymentHistory(paymentHistoryResult.content ?? [])
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải dữ liệu gói sử dụng."))
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [])

  const expireCurrentPaymentOnFrontend = useCallback(async () => {
    stopPolling()
    activePaymentIdRef.current = null
    setRenewModalOpen(false)
    setRenewStep(1)
    setPaymentInfo(null)
    setPaymentStatus("PENDING")
    notify.warn("Mã thanh toán đã hết hạn.")
    await reloadSubscriptionData()
  }, [reloadSubscriptionData, stopPolling])

  const pollPaymentStatus = useCallback(async () => {
    if (!paymentInfo) return
    const pollingPaymentId = paymentInfo.paymentId

    try {
      const result = await getSepayPaymentStatus(pollingPaymentId)
      if (activePaymentIdRef.current !== pollingPaymentId) return

      setPaymentStatus(result.status)
      setPaymentInfo((current) =>
        current?.paymentId === pollingPaymentId
          ? {
              ...current,
              status: result.status,
              expiredAt: result.expiredAt,
              subscriptionExpiredAt: result.subscriptionExpiredAt ?? current.subscriptionExpiredAt,
            }
          : current
      )

      if (result.status === "SUCCESS") {
        stopPolling()
        await reloadSubscriptionData()
      }

      if (result.status === "EXPIRED") {
        await expireCurrentPaymentOnFrontend()
        return
      }

      if (result.status === "FAILED" || result.status === "CANCELED") {
        stopPolling()
        await reloadSubscriptionData()
      }
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể kiểm tra trạng thái thanh toán."))
    }
  }, [expireCurrentPaymentOnFrontend, paymentInfo, reloadSubscriptionData, stopPolling])

  useEffect(() => {
    void reloadSubscriptionData(true)
  }, [reloadSubscriptionData])

  useEffect(() => {
    stopPolling()

    if (!renewModalOpen || renewStep !== 2 || !paymentInfo || paymentStatus !== "PENDING") return

    pollingTimerRef.current = window.setInterval(() => {
      void pollPaymentStatus()
    }, 3000)

    return () => stopPolling()
  }, [paymentInfo, paymentStatus, pollPaymentStatus, renewModalOpen, renewStep, stopPolling])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const openRenewModal = (months: RenewMonths = 3) => {
    activePaymentIdRef.current = null
    stopPolling()
    setSelectedMonths(months)
    setRenewStep(1)
    setPaymentInfo(null)
    setPaymentStatus("PENDING")
    setRenewModalOpen(true)
  }

  const createPaymentAndOpenQr = async (months: RenewMonths = selectedMonths) => {
    stopPolling()
    activePaymentIdRef.current = null
    setPaymentInfo(null)
    setPaymentStatus("PENDING")
    setIsCreatingPayment(true)

    try {
      const payment = await createSepayQrPayment(months)
      activePaymentIdRef.current = payment.paymentId
      setSelectedMonths(payment.months)
      setPaymentInfo(payment)
      setPaymentStatus(payment.status)
      setRenewStep(2)
      setRenewModalOpen(true)
      await reloadSubscriptionData()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tạo mã thanh toán."))
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const openCurrentPayment = (payment: SepayQrPaymentResponse) => {
    stopPolling()
    activePaymentIdRef.current = payment.paymentId
    setSelectedMonths(payment.months)
    setPaymentInfo(payment)
    setPaymentStatus(payment.status)
    setRenewStep(2)
    setRenewModalOpen(true)
  }

  const cancelPaymentById = async (paymentId: number) => {
    setCancelingCurrentPaymentId(paymentId)

    try {
      await cancelSepayPayment(paymentId)
      if (paymentInfo?.paymentId === paymentId) {
        stopPolling()
        activePaymentIdRef.current = null
        setPaymentStatus("CANCELED")
      }
      await reloadSubscriptionData()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể hủy thanh toán."))
    } finally {
      setCancelingCurrentPaymentId(null)
    }
  }

  const cancelCurrentPayment = async () => {
    if (!paymentInfo) return

    setIsCancelingPayment(true)

    try {
      await cancelPaymentById(paymentInfo.paymentId)
    } finally {
      setIsCancelingPayment(false)
    }
  }

  const requestBackToPlanStep = () => {
    if (!paymentInfo || paymentStatus !== "PENDING") {
      stopPolling()
      activePaymentIdRef.current = null
      setRenewStep(1)
      setPaymentInfo(null)
      setPaymentStatus("PENDING")
      return
    }

    confirmDialog({
      header: "Quay lại chọn gói",
      message: "Thanh toán hiện tại sẽ bị hủy. Bạn có muốn quay lại chọn gói không?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Đồng ý",
      rejectLabel: "Không",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await cancelCurrentPayment()
        activePaymentIdRef.current = null
        setRenewStep(1)
        setPaymentInfo(null)
        setPaymentStatus("PENDING")
      },
    })
  }

  const closeRenewModal = () => {
    stopPolling()
    activePaymentIdRef.current = null
    setRenewModalOpen(false)
  }

  const closeSuccessModal = () => {
    stopPolling()
    activePaymentIdRef.current = null
    setRenewModalOpen(false)
    setRenewStep(1)
    setPaymentInfo(null)
    setPaymentStatus("PENDING")
  }

  const copyValue = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      notify.success(message)
    } catch {
      notify.error("Không thể sao chép nội dung.")
    }
  }

  return (
    <>
      <ConfirmDialog />
      <div className="flex flex-1 flex-col gap-2">
        <Toolbar
          className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          start={
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Gói sử dụng</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Quản lý thời hạn dùng thử, gói hiện tại và lịch sử thanh toán của shop.
              </p>
            </div>
          }
          end={
            <Button
              type="button"
              label="Gia hạn ngay"
              icon="pi pi-refresh"
              disabled={!overview?.canRenew}
              onClick={() => openRenewModal(3)}
              className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] disabled:!opacity-60 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          {isLoading && !overview ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <ProgressSpinner />
            </div>
          ) : overview ? (
            <div className="space-y-4">
              {shouldShowExpirationNotice && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <i className="pi pi-exclamation-triangle text-sm" />
                    </span>
                    <p className="m-0 text-sm font-medium text-amber-900">
                      {getSubscriptionNotice(overview)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    label={overview.planType === "TRIAL" ? "Nâng cấp ngay" : "Gia hạn ngay"}
                    disabled={!overview.canRenew}
                    onClick={() => openRenewModal(3)}
                    className="!h-9 !rounded-md !border-amber-300 !bg-white !px-4 !py-0 !text-sm !font-semibold !text-amber-700 hover:!bg-amber-100 disabled:!opacity-60 [&_.p-button-label]:!text-amber-700"
                  />
                </div>
              )}

              <section className="rounded-xl border border-[#dce4ee] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef3ff] text-[#5068ff]">
                        <i className="pi pi-calendar text-sm" />
                      </span>
                      <div>
                        <h2 className="m-0 text-base font-semibold text-slate-800">Gói hiện tại</h2>
                        <p className="m-0 mt-1 text-xs font-medium text-slate-500">
                          {formatDateOnlyViVN(overview.currentPeriodStart)} - {formatDateOnlyViVN(overview.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                    <Tag value={getSubscriptionStatusLabel(overview.status)} severity={getSubscriptionStatusSeverity(overview.status)} rounded />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <CurrentPlanMetric label="Loại gói" value={getPlanTypeLabel(overview.planType)} icon="pi pi-bookmark" />
                    <CurrentPlanMetric label={`Còn lại ${currentPeriodLabel.toLowerCase()}`} value={`${overview.currentPeriodRemainingDays} ngày`} icon="pi pi-clock" />
                    <CurrentPlanMetric label="Giá theo tháng" value={`${formatCurrency(overview.monthlyPrice)} / tháng`} icon="pi pi-wallet" />
                    <CurrentPlanMetric label="Hết hạn quyền dùng" value={formatDateOnlyViVN(overview.expiredAt)} icon="pi pi-calendar-times" />
                  </div>

                  <div className={`mt-4 grid gap-3 ${hasActiveTrial ? "lg:grid-cols-2" : ""}`}>
                    {hasActiveTrial && overview.trialTotalDays > 0 && trialRemainingDays !== null && (
                      <PeriodProgress
                        label="Kỳ dùng thử"
                        totalDays={overview.trialTotalDays}
                        remainingDays={trialRemainingDays}
                        usedPercent={trialUsedPercent}
                        className="border border-amber-100 bg-amber-50"
                      />
                    )}
                    <PeriodProgress
                      label={currentPeriodLabel}
                      totalDays={overview.planTotalDays}
                      remainingDays={overview.currentPeriodRemainingDays}
                      usedPercent={currentPeriodUsedPercent}
                    />
                  </div>

                  <div className="mt-4 rounded-lg border border-[#e5edf6] bg-white px-3 py-3">
                    <h3 className="m-0 text-sm font-semibold text-slate-800">Mốc thời gian</h3>
                    <div className="mt-3 grid gap-4 md:grid-cols-3">
                      <div className="space-y-3 border-b border-[#eef2f6] pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                        <p className="m-0 text-xs font-bold uppercase text-[#5068ff]">{currentPeriodLabel}</p>
                        <CompactDateRow label="Bắt đầu" value={formatDateOnlyViVN(overview.currentPeriodStart)} />
                        <CompactDateRow label="Kết thúc" value={formatDateOnlyViVN(overview.currentPeriodEnd)} />
                      </div>
                      <div className="space-y-3 border-b border-[#eef2f6] pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                        <p className="m-0 text-xs font-bold uppercase text-amber-600">Kỳ dùng thử</p>
                        <CompactDateRow label="Bắt đầu đăng ký" value={formatDateOnlyViVN(overview.subscriptionStartedAt)} />
                        <CompactDateRow label="Kết thúc dùng thử" value={formatDateOnlyViVN(overview.trialEndsAt)} />
                      </div>
                      <div className="space-y-3">
                        <p className="m-0 text-xs font-bold uppercase text-emerald-600">Quyền sử dụng</p>
                        <CompactDateRow label="Hết hạn quyền dùng" value={formatDateOnlyViVN(overview.expiredAt)} />
                        <CompactDateRow label="Trạng thái" value={getSubscriptionStatusLabel(overview.status)} />
                      </div>
                    </div>
                  </div>
              </section>

              {currentPendingPayment && (
                <section className="rounded-xl border border-[#dce4ee] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      {sectionHeader("pi pi-clock", "Thanh toán hiện tại")}
                      <div className="grid gap-3 md:grid-cols-5">
                        <DetailSummary label="Mã thanh toán" value={currentPendingPayment.invoiceNumber} />
                        <DetailSummary label="Số tiền" value={formatCurrency(currentPendingPayment.amount)} />
                        <DetailSummary label="Trạng thái" value={getPaymentStatusLabel(currentPendingPayment.status)} tagSeverity="warning" />
                        <DetailSummary label="Thời gian tạo" value={formatDateTimeViVN(currentPendingPayment.createdAt)} />
                        <DetailSummary label="Phương thức" value={currentPendingPayment.provider} />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                      <Button
                        type="button"
                        label="Tiếp tục thanh toán"
                        onClick={() => openCurrentPayment(currentPendingPayment)}
                        className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
                      />
                      <Button
                        type="button"
                        label="Hủy thanh toán"
                        outlined
                        loading={cancelingCurrentPaymentId === currentPendingPayment.paymentId}
                        onClick={() => void cancelPaymentById(currentPendingPayment.paymentId)}
                        className="!h-9 !rounded-md !border-[#d8e0ea] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-red-500 hover:!bg-red-50 [&_.p-button-label]:!text-red-500"
                      />
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-xl border border-[#dce4ee] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                {sectionHeader("pi pi-list", "Lịch sử thanh toán")}
                <DataTable
                  value={paymentHistory}
                  dataKey="paymentId"
                  size="small"
                  stripedRows
                  showGridlines
                  emptyMessage={<div className="py-3 text-center text-sm text-slate-500">Không có lịch sử thanh toán.</div>}
                  tableStyle={{ minWidth: "56rem" }}
                >
                  <Column field="invoiceNumber" header="Mã giao dịch" style={{ minWidth: "180px" }} />
                  <Column
                    field="planName"
                    header="Gói"
                    body={(row) => getPlanNameLabel((row as SubscriptionPaymentHistoryItem).planName)}
                    style={{ minWidth: "130px" }}
                  />
                  <Column
                    field="amount"
                    header="Số tiền"
                    body={(row) => formatCurrency((row as SubscriptionPaymentHistoryItem).amount)}
                    style={{ minWidth: "130px" }}
                  />
                  <Column
                    field="status"
                    header="Trạng thái"
                    body={(row) => {
                      const item = row as SubscriptionPaymentHistoryItem
                      return <Tag value={getPaymentStatusLabel(item.status)} severity={getPaymentStatusSeverity(item.status)} rounded />
                    }}
                    style={{ minWidth: "150px" }}
                  />
                  <Column
                    field="paidAt"
                    header="Ngày thanh toán"
                    body={(row) => {
                      const item = row as SubscriptionPaymentHistoryItem
                      return formatDateTimeViVN(item.paidAt ?? item.createdAt)
                    }}
                    style={{ minWidth: "180px" }}
                  />
                </DataTable>
              </section>
            </div>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-slate-500">
              Không có dữ liệu gói sử dụng.
            </div>
          )}
        </div>
      </div>

      <RenewSubscriptionDialog
        visible={renewModalOpen}
        step={renewStep}
        selectedMonths={selectedMonths}
        paymentInfo={paymentInfo}
        paymentStatus={paymentStatus}
        creating={isCreatingPayment}
        canceling={isCancelingPayment}
        monthlyPrice={monthlyPrice}
        onHide={closeRenewModal}
        onSelectMonths={setSelectedMonths}
        onContinue={() => void createPaymentAndOpenQr()}
        onBack={requestBackToPlanStep}
        onCancelPayment={() => void cancelCurrentPayment()}
        onCloseSuccess={closeSuccessModal}
        onCopy={(value, message) => void copyValue(value, message)}
      />
    </>
  )
}

function DetailSummary({
  label,
  value,
  tagSeverity,
}: {
  label: string
  value: string
  tagSeverity?: "success" | "info" | "warning" | "danger"
}) {
  return (
    <div>
      <p className="m-0 text-xs font-semibold text-slate-500">{label}</p>
      {tagSeverity ? (
        <Tag value={value} severity={tagSeverity} rounded className="mt-1" />
      ) : (
        <p className="m-0 mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
      )}
    </div>
  )
}
