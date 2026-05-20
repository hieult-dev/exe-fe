import { useEffect, useMemo, useState } from "react"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { ProgressSpinner } from "primereact/progressspinner"
import { Tag } from "primereact/tag"
import type { RenewMonths, SepayPaymentStatus, SepayQrPaymentResponse } from "@/apps/subscriptions/model"
import { formatCurrency, formatDateTimeViVN } from "@/common/utils/format"

type RenewStep = 1 | 2

type RenewSubscriptionDialogProps = {
  visible: boolean
  step: RenewStep
  selectedMonths: RenewMonths
  paymentInfo: SepayQrPaymentResponse | null
  paymentStatus: SepayPaymentStatus
  creating: boolean
  canceling: boolean
  onHide: () => void
  onSelectMonths: (months: RenewMonths) => void
  onContinue: () => void
  onBack: () => void
  onCancelPayment: () => void
  onCloseSuccess: () => void
  onCopy: (value: string, message: string) => void
  monthlyPrice: number
}

const renewBaseOptions: Array<{
  months: RenewMonths
  badge?: string
  badgeClassName?: string
}> = [
  { months: 1 },
  { months: 3, badge: "Phổ biến", badgeClassName: "bg-emerald-100 text-emerald-700" },
  { months: 6, badge: "Tiết kiệm thời gian", badgeClassName: "bg-orange-100 text-orange-700" },
]

function statusText(status: SepayPaymentStatus) {
  if (status === "SUCCESS") return "Thanh toán thành công"
  if (status === "EXPIRED") return "Mã thanh toán đã hết hạn"
  if (status === "CANCELED") return "Đã hủy thanh toán"
  if (status === "FAILED") return "Thanh toán thất bại"
  return "Đang chờ thanh toán..."
}

function getEffectiveExpiredAt(paymentInfo: SepayQrPaymentResponse | null) {
  if (!paymentInfo) return null

  const effectiveExpiredAt = new Date(paymentInfo.expiredAt).getTime()

  return Number.isFinite(effectiveExpiredAt) ? effectiveExpiredAt : null
}

function formatCountdown(expiredAt: number | null) {
  if (!expiredAt) return "00:00"

  const diffMs = expiredAt - Date.now()
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "00:00"

  const totalSeconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function Stepper({ step }: { step: RenewStep }) {
  return (
    <div className="mx-auto grid w-full max-w-[520px] grid-cols-[auto,1fr,auto] items-center gap-3">
      <StepBadge active completed={step === 2} label="Chọn gói" number={1} />
      <span className="h-px flex-1 bg-[#dbe4f0]" />
      <StepBadge active={step === 2} completed={false} label="Thanh toán" number={2} />
    </div>
  )
}

function StepBadge({
  active,
  completed,
  label,
  number,
}: {
  active: boolean
  completed: boolean
  label: string
  number: number
}) {
  return (
    <div className={`flex items-center gap-2 text-sm font-semibold ${active ? "text-[#214388]" : "text-slate-400"}`}>
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
          active ? "bg-[#214388] text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {completed ? <i className="pi pi-check text-[11px]" /> : number}
      </span>
      {label}
    </div>
  )
}

function DetailLine({
  label,
  value,
  copyMessage,
  onCopy,
}: {
  label: string
  value: string
  copyMessage?: string
  onCopy?: (value: string, message: string) => void
}) {
  return (
    <div className="grid grid-cols-[132px,1fr] items-start gap-4 border-b border-[#edf1f6] py-3 text-sm last:border-b-0">
      <span className="leading-6 text-slate-500">{label}</span>
      <span className="flex min-w-0 items-start justify-end gap-2 text-right font-semibold leading-6 text-slate-800">
        <span className="min-w-0 break-words">{value}</span>
        {copyMessage && onCopy && (
          <Button
            type="button"
            icon="pi pi-copy"
            rounded
            text
            aria-label={`Sao chép ${label.toLowerCase()}`}
            onClick={() => onCopy(value, copyMessage)}
            className="!-mr-1 !h-7 !w-7 !shrink-0 !text-slate-500 hover:!bg-slate-100"
          />
        )}
      </span>
    </div>
  )
}

function SummaryTile({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-[#e3eaf4] bg-white px-3 py-3">
      <p className="m-0 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className={`m-0 mt-1 text-base font-bold ${highlight ? "text-[#214388]" : "text-slate-900"}`}>{value}</p>
    </div>
  )
}

export function RenewSubscriptionDialog({
  visible,
  step,
  selectedMonths,
  paymentInfo,
  paymentStatus,
  creating,
  canceling,
  onHide,
  onSelectMonths,
  onContinue,
  onBack,
  onCancelPayment,
  onCloseSuccess,
  onCopy,
  monthlyPrice,
}: RenewSubscriptionDialogProps) {
  const effectiveExpiredAt = getEffectiveExpiredAt(paymentInfo)
  const [countdown, setCountdown] = useState(formatCountdown(effectiveExpiredAt))
  const renewOptions = useMemo(
    () =>
      renewBaseOptions.map((option) => ({
        ...option,
        price: monthlyPrice * option.months,
        days: 30 * option.months,
      })),
    [monthlyPrice]
  )
  const selectedOption = renewOptions.find((option) => option.months === selectedMonths) ?? renewOptions[1]
  const isTerminal = paymentStatus !== "PENDING"
  const headerBadge = step === 1 ? "Bước 1/2" : "Bước 2/2"

  useEffect(() => {
    setCountdown(formatCountdown(effectiveExpiredAt))
    if (!visible || !effectiveExpiredAt || paymentStatus !== "PENDING") return

    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(effectiveExpiredAt))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [effectiveExpiredAt, paymentStatus, visible])

  const title = "Gia hạn gói sử dụng"
  const subtitle =
    step === 1
      ? "Chọn thời hạn gia hạn phù hợp cho shop của bạn."
      : "Quét mã QR hoặc chuyển khoản để hoàn tất thanh toán."

  const footer = useMemo(() => {
    if (step === 1) {
      return (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            label="Hủy"
            outlined
            disabled={creating}
            onClick={onHide}
            className="!h-9 !rounded-md !border-[#d8e0ea] !bg-white !px-5 !py-0 !text-sm !font-semibold !text-slate-600 hover:!bg-slate-50"
          />
          <Button
            type="button"
            label="Tiếp tục"
            loading={creating}
            onClick={onContinue}
            className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-5 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
          />
        </div>
      )
    }

    if (paymentStatus === "SUCCESS") {
      return (
        <div className="flex justify-center">
          <Button
            type="button"
            label="Đóng"
            onClick={onCloseSuccess}
            className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-6 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
          />
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-sm text-slate-500">
          {paymentStatus === "PENDING" && paymentInfo
            ? `Mã thanh toán hết hạn sau ${countdown}`
            : statusText(paymentStatus)}
        </p>
        <div className="flex justify-center gap-2">
          {paymentStatus === "EXPIRED" ? (
            <Button
              type="button"
              label="Tạo mã mới"
              outlined
              onClick={onBack}
              className="!h-9 !rounded-md !border-[#214388] !bg-white !px-5 !py-0 !text-sm !font-semibold !text-[#214388] hover:!bg-[#eef3ff]"
            />
          ) : (
            <Button
              type="button"
              label="Quay lại"
              outlined
              disabled={canceling || paymentStatus === "CANCELED"}
              onClick={onBack}
              className="!h-9 !rounded-md !border-[#d8e0ea] !bg-white !px-5 !py-0 !text-sm !font-semibold !text-slate-600 hover:!bg-slate-50"
            />
          )}
          {paymentStatus === "PENDING" ? (
            <Button
              type="button"
              label="Hủy thanh toán"
              loading={canceling}
              onClick={onCancelPayment}
              outlined
              className="!h-9 !rounded-md !border-red-300 !bg-white !px-5 !py-0 !text-sm !font-semibold !text-red-500 hover:!bg-red-50 [&_.p-button-label]:!text-red-500"
            />
          ) : (
            <Button
              type="button"
              label="Đóng"
              onClick={onHide}
              className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-5 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
            />
          )}
        </div>
      </div>
    )
  }, [canceling, countdown, creating, onBack, onCancelPayment, onCloseSuccess, onContinue, onHide, paymentInfo, paymentStatus, step])

  return (
    <Dialog
      visible={visible}
      modal
      draggable={false}
      onHide={onHide}
      footer={footer}
      className="w-[min(880px,calc(100vw-2rem))]"
      header={
        <div className="flex items-start justify-between gap-3 pr-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="m-0 text-lg font-semibold text-slate-900">{title}</p>
              <Tag value={headerBadge} severity="info" rounded />
            </div>
            <p className="m-0 mt-1 text-sm font-normal text-slate-500">{subtitle}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <Stepper step={step} />

        {step === 1 ? (
          <>
            <div className="rounded-lg border border-[#dbe8ff] bg-[#f5f9ff] px-3 py-2 text-sm font-medium text-[#214388]">
              Sau khi thanh toán, thời hạn sử dụng sẽ được cộng thêm vào ngày hết hạn hiện tại.
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {renewOptions.map((option) => {
                const selected = option.months === selectedMonths
                return (
                  <button
                    key={option.months}
                    type="button"
                    onClick={() => onSelectMonths(option.months)}
                    className={`rounded-xl border bg-white p-4 text-center transition ${
                      selected ? "border-[#3264ff] shadow-[0_10px_28px_rgba(50,100,255,0.14)]" : "border-[#dce4ee] hover:border-[#9eb6ff]"
                    }`}
                  >
                    <div className="mb-3 flex min-h-6 items-center justify-center">
                      {option.badge && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${option.badgeClassName}`}>
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3ff] text-[#3264ff]">
                      <i className="pi pi-calendar text-lg" />
                    </span>
                    <p className="m-0 mt-3 text-lg font-bold text-slate-900">{option.months} tháng</p>
                    <p className="m-0 mt-1 text-xl font-bold text-[#214388]">{formatCurrency(option.price)}</p>
                    <p className="m-0 mt-1 text-sm text-slate-500">Gia hạn {option.days} ngày</p>
                    <span
                      className={`mx-auto mt-3 flex h-4 w-4 items-center justify-center rounded-full border ${
                        selected ? "border-[#3264ff] bg-[#3264ff]" : "border-slate-300"
                      }`}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="rounded-xl border border-[#dce4ee] bg-[#f8fafc] p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef3ff] text-[#214388]">
                  <i className="pi pi-receipt text-sm" />
                </span>
                <p className="m-0 text-sm font-semibold text-slate-800">Tóm tắt gói gia hạn</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryTile label="Gói đã chọn" value={`${selectedOption.months} tháng`} />
                <SummaryTile label="Số tiền" value={formatCurrency(selectedOption.price)} highlight />
                <SummaryTile label="Cộng thêm" value={`${selectedOption.days} ngày`} />
              </div>
            </div>
          </>
        ) : paymentInfo ? (
          paymentStatus === "SUCCESS" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <i className="pi pi-check text-2xl" />
              </span>
              <h3 className="m-0 mt-4 text-xl font-bold text-emerald-900">Thanh toán thành công</h3>
              <p className="m-0 mt-2 text-sm text-emerald-800">Bạn đã gia hạn gói {paymentInfo.months} tháng.</p>
              <p className="m-0 mt-1 text-sm text-emerald-800">Thời hạn đã được cộng thêm {paymentInfo.durationDays} ngày.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-[0.9fr,1.1fr]">
              <section className="text-center">
                <h3 className="m-0 text-base font-semibold text-slate-800">Mã QR thanh toán</h3>
                <div className="mx-auto mt-3 flex aspect-square max-w-[260px] items-center justify-center bg-white">
                  <img src={paymentInfo.qrUrl} alt="Mã QR thanh toán SePay" className="h-full w-full object-contain" />
                </div>
                <div className="mx-auto mt-3 flex min-h-6 w-fit items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                  {paymentStatus === "PENDING" && <ProgressSpinner className="h-4 w-4" strokeWidth="8" />}
                  {statusText(paymentStatus)}
                </div>
              </section>

              <section>
                <div>
                  <DetailLine label="Gói đã chọn" value={`${paymentInfo.months} tháng`} />
                  <DetailLine label="Số tiền" value={formatCurrency(paymentInfo.amount)} />
                  <DetailLine label="Thời hạn cộng thêm" value={`${paymentInfo.durationDays} ngày`} />
                  <DetailLine label="Hạn gói sau gia hạn" value={formatDateTimeViVN(paymentInfo.subscriptionExpiredAt)} />
                  <DetailLine label="Ngân hàng" value={paymentInfo.bankName || paymentInfo.bankCode || "Chưa có"} />
                  <DetailLine label="Số tài khoản" value={paymentInfo.accountNumber} copyMessage="Đã sao chép số tài khoản" onCopy={onCopy} />
                  <DetailLine label="Chủ tài khoản" value={paymentInfo.accountName} />
                  <DetailLine label="Nội dung CK" value={paymentInfo.transferContent} copyMessage="Đã sao chép nội dung chuyển khoản" onCopy={onCopy} />
                </div>
                <div className="mt-4 rounded-lg bg-[#f5f9ff] p-4 text-sm font-medium leading-6 text-[#214388]">
                  Hệ thống sẽ tự động cập nhật khi nhận được giao dịch thành công.
                </div>
                {isTerminal && (
                  <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">
                    {statusText(paymentStatus)}
                  </div>
                )}
              </section>
            </div>
          )
        ) : null}
      </div>
    </Dialog>
  )
}
