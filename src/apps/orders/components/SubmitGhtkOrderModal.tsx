import { useEffect, useMemo, useState } from "react"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Dialog } from "primereact/dialog"
import { InputTextarea } from "primereact/inputtextarea"
import type { SubmitGhtkOrderRequest } from "@/apps/orders/model"
import { formatDateForApi, formatDateOnlyViVN } from "@/common/utils/format"

type SubmitGhtkOrderModalProps = {
  visible: boolean
  submitting: boolean
  orderCode?: string | null
  onHide: () => void
  onSubmit: (data: SubmitGhtkOrderRequest) => void | Promise<void>
}

function startOfDay(value = new Date()) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function defaultPickDate() {
  const date = startOfDay()
  date.setDate(date.getDate() + 1)
  return date
}

export function SubmitGhtkOrderModal({ visible, submitting, orderCode, onHide, onSubmit }: SubmitGhtkOrderModalProps) {
  const [pickDate, setPickDate] = useState<Date | null>(() => defaultPickDate())
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const minPickDate = useMemo(() => startOfDay(), [])

  useEffect(() => {
    if (!visible) return
    setPickDate(defaultPickDate())
    setNote("")
    setError("")
  }, [visible])

  const handleSubmit = () => {
    if (!pickDate) {
      setError("Vui lòng chọn ngày lấy hàng.")
      return
    }

    if (startOfDay(pickDate).getTime() < startOfDay().getTime()) {
      setError("Ngày lấy hàng không được nhỏ hơn hôm nay.")
      return
    }

    const trimmedNote = note.trim()
    if (trimmedNote.length > 120) {
      setError("Ghi chú tối đa 120 ký tự.")
      return
    }

    const formattedPickDate = formatDateForApi(pickDate)
    if (!formattedPickDate) {
      setError("Ngày lấy hàng không hợp lệ.")
      return
    }

    setError("")
    onSubmit({
      pickDate: formattedPickDate,
      isFreeship: 0,
      note: trimmedNote || undefined,
    })
  }

  const footer = (
    <div className="mt-2 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
      <Button
        type="button"
        label="Đóng"
        icon="pi pi-times"
        onClick={onHide}
        disabled={submitting}
        className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
      />
      <Button
        type="button"
        label="Xác nhận gửi GHTK"
        icon={`pi ${submitting ? "pi-spinner pi-spin" : "pi-send"}`}
        onClick={handleSubmit}
        disabled={submitting || !pickDate}
        className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#18346f] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
      />
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        if (!submitting) onHide()
      }}
      header={`Chuyển cho bên GHTK ${orderCode ? `- ${orderCode}` : ""}`}
      style={{ width: "100%", maxWidth: "34rem" }}
      footer={footer}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700">
            Ngày lấy hàng <span className="text-rose-500">*</span>
          </label>
          <Calendar
            value={pickDate}
            onChange={(event) => {
              setPickDate(event.value instanceof Date ? event.value : null)
              setError("")
            }}
            minDate={minPickDate}
            dateFormat="dd/mm/yy"
            inline
            disabled={submitting}
            className="w-full [&_.p-datepicker]:!w-full [&_.p-datepicker]:!border-0 [&_.p-datepicker]:!p-0 [&_.p-datepicker]:!shadow-none [&_.p-datepicker-calendar]:!text-sm [&_.p-datepicker-calendar_td.p-datepicker-today>span]:!bg-transparent [&_.p-datepicker-calendar_td.p-datepicker-today>span]:!text-slate-600 [&_.p-datepicker-calendar_td.p-datepicker-today>span.p-highlight]:!bg-[#214388] [&_.p-datepicker-calendar_td.p-datepicker-today>span.p-highlight]:!text-white [&_.p-datepicker-calendar_td>span.p-highlight]:!bg-[#214388] [&_.p-datepicker-calendar_td>span.p-highlight]:!font-semibold [&_.p-datepicker-calendar_td>span.p-highlight]:!text-white [&_.p-datepicker-header]:!border-0 [&_.p-datepicker-header]:!px-0 [&_.p-datepicker-header]:!pt-0"
          />
          <div className="mt-2 flex items-center justify-between rounded-lg bg-[#f8fafc] px-3 py-2 text-sm">
            <span className="font-medium text-slate-500">Ngày đã chọn</span>
            <span className="font-semibold text-[#214388]">{formatDateOnlyViVN(pickDate, "---")}</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="ghtk-note" className="text-sm font-semibold text-slate-700">
              Ghi chú
            </label>
            <span className="text-xs font-medium text-slate-400">{note.length}/120</span>
          </div>
          <InputTextarea
            id="ghtk-note"
            value={note}
            onChange={(event) => {
              setNote(event.target.value)
              setError("")
            }}
            maxLength={120}
            rows={3}
            autoResize
            disabled={submitting}
            placeholder="Giao giờ hành chính"
            className="w-full rounded-lg border border-[#d9e1eb] px-3 py-2 text-sm outline-none focus:border-[#214388]"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}
      </div>
    </Dialog>
  )
}
