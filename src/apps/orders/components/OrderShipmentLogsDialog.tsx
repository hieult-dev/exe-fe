import { useEffect, useMemo, useState } from "react"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Tag } from "primereact/tag"
import { getOrderShipmentLogs } from "@/apps/orders/api/orderApi"
import type { JsonValue, OrderShipmentLogDTO } from "@/apps/orders/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"

type OrderShipmentLogsDialogProps = {
  visible: boolean
  orderId: number | null
  orderCode?: string | null
  onHide: () => void
}

const PROCESSING_STATUS_LABEL: Record<string, string> = {
  APPLIED: "Đã cập nhật đơn",
  FAILED: "Cần kiểm tra",
  IGNORED: "Không cần cập nhật",
  SKIPPED: "Không cần cập nhật",
  PENDING: "Đang chờ xử lý",
  RECEIVED: "Đã tiếp nhận",
}

const PROCESSING_STATUS_SEVERITY: Record<string, "success" | "info" | "warning" | "danger" | "secondary"> = {
  APPLIED: "success",
  FAILED: "danger",
  IGNORED: "secondary",
  SKIPPED: "secondary",
  PENDING: "warning",
  RECEIVED: "info",
}

const GHTK_STATUS_LABEL: Record<string, string> = {
  "-1": "Đã hủy vận đơn",
  "1": "Chờ GHTK đến lấy",
  "2": "GHTK đã tiếp nhận",
  "3": "Đã lấy hàng",
  "4": "Đang giao hàng",
  "5": "Đã giao hàng",
  "6": "Đã đối soát",
  "7": "Lấy hàng không thành công",
  "8": "Hoãn lấy hàng",
  "9": "Giao hàng không thành công",
  "10": "Hoãn giao hàng",
  "20": "Đang hoàn hàng",
  "21": "Đã hoàn hàng",
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }

  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function statusLabel(value: string | null | undefined) {
  if (!value) return "Không xác định"
  return PROCESSING_STATUS_LABEL[value] || "Không xác định"
}

function statusSeverity(value: string | null | undefined) {
  if (!value) return "secondary"
  return PROCESSING_STATUS_SEVERITY[value] || "secondary"
}

function formatPayload(log: OrderShipmentLogDTO) {
  return JSON.stringify(log.rawPayloadJson ?? {}, null, 2)
}

function asPayloadRecord(value: JsonValue | null): Record<string, JsonValue> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value
}

function getPayloadText(log: OrderShipmentLogDTO, key: string) {
  const value = asPayloadRecord(log.rawPayloadJson)?.[key]
  if (value === null || value === undefined || typeof value === "object") return null
  const text = String(value).trim()
  return text || null
}

function formatPayloadMoney(log: OrderShipmentLogDTO, key: string) {
  const raw = getPayloadText(log, key)
  if (!raw) return "---"
  const value = Number(raw)
  if (!Number.isFinite(value)) return raw
  return formatCurrencyVND(value)
}

function formatPayloadWeight(log: OrderShipmentLogDTO) {
  const raw = getPayloadText(log, "weight")
  if (!raw) return "---"
  const value = Number(raw)
  if (!Number.isFinite(value)) return raw
  return `${value.toLocaleString("vi-VN")} g`
}

function getGhtkStatusLabel(log: OrderShipmentLogDTO) {
  const statusId = log.statusId ?? getPayloadText(log, "status_id")
  if (statusId === null || statusId === undefined || statusId === "") return "GHTK cập nhật vận đơn"
  return GHTK_STATUS_LABEL[String(statusId)] || `GHTK cập nhật trạng thái ${statusId}`
}

function getReasonText(log: OrderShipmentLogDTO) {
  const reason = getPayloadText(log, "reason")
  if (reason) return reason

  const message = getPayloadText(log, "message")
  if (message) return message

  return null
}

function getDisplayTime(log: OrderShipmentLogDTO) {
  return log.actionTime || getPayloadText(log, "action_time") || log.createdAt
}

function getLogTitle(log: OrderShipmentLogDTO) {
  if (log.processingStatus === "FAILED") return "Cập nhật cần kiểm tra"
  return getGhtkStatusLabel(log)
}

export function OrderShipmentLogsDialog({ visible, orderId, orderCode, onHide }: OrderShipmentLogsDialogProps) {
  const [logs, setLogs] = useState<OrderShipmentLogDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedLogId, setCopiedLogId] = useState<number | null>(null)

  useEffect(() => {
    if (!visible || !orderId) return

    let cancelled = false
    setLoading(true)
    setLogs([])
    setCopiedLogId(null)

    getOrderShipmentLogs(orderId)
      .then((response) => {
        if (!cancelled) setLogs(Array.isArray(response) ? response : [])
      })
      .catch((error) => {
        if (!cancelled) {
          notify.error(getErrorMessage(error, "Không tải được lịch sử vận chuyển."))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [orderId, visible])

  const latestLog = useMemo(() => logs[0] ?? null, [logs])

  const copyPayload = async (log: OrderShipmentLogDTO) => {
    try {
      await navigator.clipboard.writeText(formatPayload(log))
      setCopiedLogId(log.id)
      window.setTimeout(() => setCopiedLogId(null), 1600)
    } catch {
      notify.error("Không thể sao chép dữ liệu kỹ thuật.")
    }
  }

  const footer = (
    <div className="mt-2 flex justify-center">
      <Button
        type="button"
        label="Đóng"
        icon="pi pi-times"
        onClick={onHide}
        className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-semibold !text-slate-700 hover:!bg-[#ecf1f8]"
      />
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Theo dõi vận chuyển GHTK ${orderCode ? `- ${orderCode}` : ""}`}
      style={{ width: "100%", maxWidth: "58rem" }}
      footer={footer}
      className="[&_.p-dialog-content]:!pb-4"
    >
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
          <i className="pi pi-spinner pi-spin mr-2" />
          Đang tải lịch sử vận chuyển...
        </div>
      ) : logs.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl bg-[#f8fafc] px-6 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#214388] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <i className="pi pi-truck text-xl" />
          </span>
          <p className="m-0 text-sm font-semibold text-slate-700">Chưa có cập nhật vận chuyển.</p>
          <p className="m-0 mt-1 text-sm text-slate-500">Khi GHTK gửi thông tin mới, trạng thái sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="Số lần cập nhật" value={logs.length.toString()} />
            <SummaryCard
              label="Tình trạng xử lý"
              value={<Tag value={statusLabel(latestLog?.processingStatus)} severity={statusSeverity(latestLog?.processingStatus)} />}
            />
            <SummaryCard label="Cập nhật gần nhất" value={formatDateTimeViVN(latestLog ? getDisplayTime(latestLog) : null, "---")} />
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {logs.map((log, index) => {
              const reason = getReasonText(log)

              return (
                <section key={log.id} className="rounded-xl border border-[#e7edf5] bg-white p-4 shadow-[0_10px_32px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f1ff] text-[#214388]">
                        <i className={log.processingStatus === "FAILED" ? "pi pi-exclamation-triangle" : index === 0 ? "pi pi-truck" : "pi pi-history"} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="m-0 text-sm font-bold text-slate-800">{getLogTitle(log)}</p>
                          <Tag value={statusLabel(log.processingStatus)} severity={statusSeverity(log.processingStatus)} />
                        </div>
                        <p className="m-0 mt-1 text-xs font-medium text-slate-400">
                          {formatDateTimeViVN(getDisplayTime(log), "---")} · Ghi nhận lúc {formatDateTimeViVN(log.createdAt, "---")}
                        </p>

                        <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                          <InfoPill label="Mã vận đơn" value={log.labelId || getPayloadText(log, "label_id") || "---"} />
                          <InfoPill label="Mã đơn hàng" value={log.partnerId || getPayloadText(log, "partner_id") || "---"} />
                          <InfoPill label="Phí vận chuyển" value={formatPayloadMoney(log, "fee")} />
                          <InfoPill label="Tiền thu hộ" value={formatPayloadMoney(log, "pick_money")} />
                          <InfoPill label="Khối lượng" value={formatPayloadWeight(log)} />
                          <InfoPill label="Đơn vị vận chuyển" value={log.carrier || "GHTK"} />
                        </div>

                        {reason && <p className="m-0 mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium leading-6 text-amber-800">{reason}</p>}
                        {log.errorMessage && <p className="m-0 mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium leading-6 text-rose-700">{log.errorMessage}</p>}
                      </div>
                    </div>

                    <Button
                      type="button"
                      icon={copiedLogId === log.id ? "pi pi-check" : "pi pi-copy"}
                      label={copiedLogId === log.id ? "Đã sao chép" : "Sao chép mã hỗ trợ"}
                      onClick={() => copyPayload(log)}
                      className="!m-0 !inline-flex !h-9 !shrink-0 !items-center !justify-center !rounded-lg !border-none !bg-[#eef6f3] !px-3 !py-0 !text-xs !font-semibold !text-[#167052] hover:!bg-[#dff0e9] [&_.p-button-icon]:!text-[#167052] [&_.p-button-label]:!text-[#167052]"
                    />
                  </div>

                  <details className="mt-3 rounded-lg border border-[#e7edf5] bg-[#f8fafc] px-3 py-2 text-xs text-slate-500">
                    <summary className="cursor-pointer select-none font-semibold text-slate-600">Chi tiết kỹ thuật cho bộ phận hỗ trợ</summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-white p-3 leading-5 text-slate-600">{formatPayload(log)}</pre>
                  </details>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </Dialog>
  )
}

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#f8fafc] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="m-0 mt-2 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f8fafc] px-3 py-2">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="m-0 mt-0.5 truncate text-xs font-semibold text-slate-700" title={value}>
        {value}
      </p>
    </div>
  )
}
