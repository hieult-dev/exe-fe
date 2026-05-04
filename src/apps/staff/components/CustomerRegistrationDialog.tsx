import { useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { createCustomer } from "@/apps/staff/api/customerApi"
import type { CustomerDTO } from "@/apps/staff/model"
import { notify } from "@/common/toast/ToastHelper"

type CustomerRegistrationDialogProps = {
  visible: boolean
  onHide: () => void
  onCreated: (customer: CustomerDTO) => void
}

type CustomerForm = {
  fullName: string
  phone: string
  email: string
}

const emptyForm: CustomerForm = {
  fullName: "",
  phone: "",
  email: "",
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0 disabled:cursor-not-allowed disabled:text-[#73849b]"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  return fallback
}

export function CustomerRegistrationDialog({ visible, onHide, onCreated }: CustomerRegistrationDialogProps) {
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setForm(emptyForm)
      setError(null)
    }
  }, [visible])

  const updateForm = (patch: Partial<CustomerForm>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setError(null)
  }

  const handleHide = () => {
    if (!isSubmitting) onHide()
  }

  const handleSubmit = async () => {
    const fullName = form.fullName.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()

    if (!fullName || !phone) {
      setError("Vui lòng nhập họ tên và số điện thoại.")
      return
    }

    setIsSubmitting(true)
    try {
      const customer = await createCustomer({
        userId: null,
        fullName,
        phone,
        email: email || null,
      })

      notify.success("Đã đăng ký customer.")
      onCreated(customer)
      onHide()
    } catch (err) {
      setError(getErrorMessage(err, "Không đăng ký được customer."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      visible={visible}
      header={
        <div>
          <h2 className="m-0 text-xl font-bold text-[#24364d]">Đăng ký customer</h2>
          <p className="m-0 mt-1 text-sm font-normal text-[#73849b]">Lưu hồ sơ khách hàng để gắn với hóa đơn tại quầy.</p>
        </div>
      }
      modal
      draggable={false}
      className="w-[min(92vw,500px)] [&_.p-dialog-content]:!px-5 [&_.p-dialog-content]:!pb-5 [&_.p-dialog-header]:!px-5 [&_.p-dialog-header]:!pb-3 [&_.p-dialog-header]:!pt-5 [&_.p-dialog-footer]:!border-t [&_.p-dialog-footer]:!border-[#e2e8f0] [&_.p-dialog-footer]:!px-5 [&_.p-dialog-footer]:!py-4"
      onHide={handleHide}
      footer={
        <div className="flex justify-center gap-3">
          <Button
            type="button"
            label="Hủy"
            disabled={isSubmitting}
            onClick={onHide}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-medium !text-slate-700 hover:!bg-[#ecf1f8]"
          />
          <Button
            type="button"
            label="Đăng ký"
            icon="pi pi-check"
            loading={isSubmitting}
            onClick={handleSubmit}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
          />
        </div>
      }
    >
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{error}</div>}

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block">Họ tên <span className="text-rose-500">*</span></span>
          <InputText
            value={form.fullName}
            className={inputClassName}
            disabled={isSubmitting}
            onChange={(event) => updateForm({ fullName: event.target.value })}
          />
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block">Số điện thoại <span className="text-rose-500">*</span></span>
          <InputText
            value={form.phone}
            className={inputClassName}
            disabled={isSubmitting}
            onChange={(event) => updateForm({ phone: event.target.value })}
          />
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-1 block">Email</span>
          <InputText
            value={form.email}
            className={inputClassName}
            disabled={isSubmitting}
            onChange={(event) => updateForm({ email: event.target.value })}
          />
        </label>
      </div>
    </Dialog>
  )
}
