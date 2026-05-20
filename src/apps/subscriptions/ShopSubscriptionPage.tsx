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

const planFeatures = [
  "Quản lý shop",
  "Quản lý dịch vụ",
  "Quản lý sản phẩm",
  "Quản lý lịch đặt",
  "Tin nhắn với khách hàng",
  "AI chat hỗ trợ khách hàng",
]

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { message?: string; error?: string } | undefined
  return apiError?.message || apiError?.error || fallback
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
  if (planType === "MONTHLY") return "Monthly"
  return planType
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px,1fr] border-b border-[#edf1f6] py-2 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
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
  const trialTotalDays = overview?.trialTotalDays ?? 0
  const remainingDays = overview?.remainingDays ?? 0
  const trialPercent = trialTotalDays > 0 ? Math.round((remainingDays / trialTotalDays) * 100) : 0
  const currentPendingPayment = currentPayment?.status === "PENDING" ? currentPayment : null

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
              <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <i className="pi pi-exclamation-triangle text-sm" />
                  </span>
                  <p className="m-0 text-sm font-medium text-amber-900">
                    {overview.message ||
                      `Gói dùng thử của bạn còn ${overview.remainingDays} ngày. Sau thời gian này, bạn cần thanh toán ${formatCurrency(
                        overview.monthlyPrice
                      )}/tháng để tiếp tục sử dụng hệ thống.`}
                  </p>
                </div>
                <Button
                  type="button"
                  label="Nâng cấp ngay"
                  disabled={!overview.canRenew}
                  onClick={() => openRenewModal(3)}
                  className="!h-9 !rounded-md !border-amber-300 !bg-white !px-4 !py-0 !text-sm !font-semibold !text-amber-700 hover:!bg-amber-100 disabled:!opacity-60 [&_.p-button-label]:!text-amber-700"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
                <section className="rounded-xl border border-[#dce4ee] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  {sectionHeader("pi pi-calendar", "Gói hiện tại")}
                  <div className="space-y-1">
                    <DetailRow label="Loại gói" value={getPlanTypeLabel(overview.planType)} />
                    <div className="grid grid-cols-[140px,1fr] border-b border-[#edf1f6] py-2 text-sm">
                      <span className="text-slate-500">Trạng thái</span>
                      <span>
                        <Tag value={getSubscriptionStatusLabel(overview.status)} severity={getSubscriptionStatusSeverity(overview.status)} rounded />
                      </span>
                    </div>
                    <DetailRow label="Ngày bắt đầu" value={formatDateOnlyViVN(overview.startedAt)} />
                    <DetailRow label="Ngày hết hạn" value={formatDateOnlyViVN(overview.expiredAt)} />
                    <DetailRow label="Thời gian còn lại" value={`${overview.remainingDays} ngày`} />
                    <DetailRow label="Giá sau dùng thử" value={`${formatCurrency(overview.monthlyPrice)} / tháng`} />
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>
                        {overview.remainingDays}/{overview.trialTotalDays} ngày
                      </span>
                      <span>{trialPercent}%</span>
                    </div>
                    <ProgressBar value={trialPercent} showValue={false} className="h-2 overflow-hidden rounded-full bg-[#e8edf5]" />
                  </div>
                </section>

                <section className="relative overflow-hidden rounded-xl border border-[#dce4ee] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="pointer-events-none absolute right-6 top-10 h-40 w-40 rounded-full bg-emerald-100/70" />
                  <div className="pointer-events-none absolute right-12 top-16 flex h-28 w-28 items-center justify-center rounded-full bg-white/70 text-emerald-500">
                    <i className="pi pi-calendar-plus text-5xl opacity-90" />
                  </div>
                  <div className="relative">
                    {sectionHeader("pi pi-shield", "Gói Monthly")}
                    <p className="m-0 text-2xl font-bold text-slate-900">
                      {formatCurrency(overview.monthlyPrice)}
                      <span className="ml-1 text-sm font-semibold text-slate-500">/ tháng</span>
                    </p>
                    <ul className="mt-4 space-y-2 p-0">
                      {planFeatures.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <i className="pi pi-check text-[10px]" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      label="Gia hạn 1 tháng"
                      disabled={!overview.canRenew}
                      onClick={() => openRenewModal(1)}
                      className="mt-5 !h-10 w-full !rounded-md !border-emerald-500 !bg-emerald-500 !py-0 !text-sm !font-semibold !text-white hover:!bg-emerald-600 disabled:!opacity-60 [&_.p-button-label]:!text-white"
                    />
                  </div>
                </section>
              </div>

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
                  <Column field="planName" header="Gói" style={{ minWidth: "130px" }} />
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
