import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { ProgressSpinner } from "primereact/progressspinner"
import type { CommissionPaymentInfoDTO } from "@/apps/platform-fees/model"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"

type CommissionPaymentDialogProps = {
  visible: boolean
  loading: boolean
  paymentInfo: CommissionPaymentInfoDTO | null
  onHide: () => void
  onCopy: (value: string, message: string) => void
}

function PaymentLine({
  label,
  value,
  copyMessage,
  onCopy,
}: {
  label: string
  value: string
  copyMessage?: string
  onCopy: (value: string, message: string) => void
}) {
  return (
    <div className="grid grid-cols-[132px,1fr] items-start gap-4 border-b border-[#edf1f6] py-3 text-sm last:border-b-0">
      <span className="leading-6 text-slate-500">{label}</span>
      <span className="flex min-w-0 items-start justify-end gap-2 text-right font-semibold leading-6 text-slate-800">
        <span className="min-w-0 break-words">{value}</span>
        {copyMessage && (
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

export function CommissionPaymentDialog({ visible, loading, paymentInfo, onHide, onCopy }: CommissionPaymentDialogProps) {
  const footer = (
    <div className="flex justify-center">
      <Button
        type="button"
        label="Đóng"
        outlined
        onClick={onHide}
        className="!h-9 !rounded-md !border-[#d8e0ea] !bg-white !px-5 !py-0 !text-sm !font-semibold !text-slate-600 hover:!bg-slate-50"
      />
    </div>
  )

  return (
    <Dialog
      visible={visible}
      modal
      draggable={false}
      resizable={false}
      header="Thanh toán hóa đơn"
      footer={footer}
      onHide={onHide}
      className="w-[min(94vw,660px)]"
    >
      {loading ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <ProgressSpinner strokeWidth="4" style={{ width: 44, height: 44 }} />
          <span>Đang tải thông tin thanh toán...</span>
        </div>
      ) : paymentInfo ? (
        <div>
          <p className="m-0 text-sm text-slate-500">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới.</p>
          <div className="mt-5 grid gap-5 md:grid-cols-[220px,1fr]">
            <div className="flex items-center justify-center rounded-xl border border-[#e3eaf4] bg-white p-3">
              <img src={paymentInfo.qrUrl} alt="Mã QR thanh toán phí nền tảng" className="h-48 w-48 object-contain" />
            </div>
            <div className="rounded-xl border border-[#e3eaf4] bg-[#fbfcfe] px-4">
              <PaymentLine label="Ngân hàng" value={paymentInfo.bankCode} onCopy={onCopy} />
              <PaymentLine label="Số tài khoản" value={paymentInfo.accountNumber} copyMessage="Đã sao chép số tài khoản" onCopy={onCopy} />
              <PaymentLine label="Chủ tài khoản" value={paymentInfo.accountName} onCopy={onCopy} />
              <PaymentLine
                label="Nội dung chuyển khoản"
                value={paymentInfo.transferContent}
                copyMessage="Đã sao chép nội dung chuyển khoản"
                onCopy={onCopy}
              />
              <PaymentLine label="Hạn thanh toán" value={formatDateTimeViVN(paymentInfo.dueAt)} onCopy={onCopy} />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-rose-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">Số tiền cần thanh toán</span>
            <span className="text-xl font-bold text-rose-600">{formatCurrencyVND(paymentInfo.amount)}</span>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
          <i className="pi pi-qrcode text-2xl text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">Chưa có thông tin thanh toán.</p>
        </div>
      )}
    </Dialog>
  )
}
