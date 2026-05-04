import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { Sidebar } from "primereact/sidebar"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { ShopPaymentConfigDTO, ShopPaymentConfigRequest } from "@/apps/payment_config/model"
import { SidebarConfig } from "@/common/config/sidebar.config"
import { toUppercaseNoDiacritics } from "@/common/utils/format"

export type PaymentConfigEditorMode = "CREATE" | "EDIT" | null

type PaymentConfigEditorSidebarProps = {
  mode: PaymentConfigEditorMode
  config: ShopPaymentConfigDTO | null
  saving: boolean
  onClose: () => void
  onSubmit: (request: ShopPaymentConfigRequest) => void
}

const PaymentConfigFormSchema = z.object({
  bankCode: z.string().trim().min(1, "Mã ngân hàng là bắt buộc.").max(50, "Mã ngân hàng không được vượt quá 50 ký tự."),
  accountNumber: z.string().trim().min(1, "Số tài khoản là bắt buộc.").max(100, "Số tài khoản không được vượt quá 100 ký tự."),
  accountName: z.string().trim().min(1, "Tên chủ tài khoản là bắt buộc.").max(255, "Tên chủ tài khoản không được vượt quá 255 ký tự."),
  displayName: z.string().trim().min(1, "Tên hiển thị là bắt buộc.").max(255, "Tên hiển thị không được vượt quá 255 ký tự."),
  active: z.boolean(),
})

type PaymentConfigFormState = z.infer<typeof PaymentConfigFormSchema>

const defaultFormState: PaymentConfigFormState = {
  bankCode: "",
  accountNumber: "",
  accountName: "",
  displayName: "",
  active: true,
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0"

function toFormState(config: ShopPaymentConfigDTO | null): PaymentConfigFormState {
  if (!config) return defaultFormState

  return {
    bankCode: config.bankCode,
    accountNumber: config.accountNumber,
    accountName: toUppercaseNoDiacritics(config.accountName),
    displayName: toUppercaseNoDiacritics(config.displayName),
    active: config.active,
  }
}

function toRequest(formState: PaymentConfigFormState): ShopPaymentConfigRequest {
  return {
    bankCode: formState.bankCode.trim().toUpperCase(),
    accountNumber: formState.accountNumber.trim(),
    accountName: toUppercaseNoDiacritics(formState.accountName.trim()),
    displayName: toUppercaseNoDiacritics(formState.displayName.trim()),
    active: formState.active,
  }
}

export function PaymentConfigEditorSidebar({
  mode,
  config,
  saving,
  onClose,
  onSubmit,
}: PaymentConfigEditorSidebarProps) {
  const visible = mode !== null
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentConfigFormState>({
    resolver: zodResolver(PaymentConfigFormSchema),
    defaultValues: defaultFormState,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const formState = watch()

  useEffect(() => {
    reset(visible ? toFormState(config) : defaultFormState)
  }, [config, reset, visible])

  const updateForm = (patch: Partial<PaymentConfigFormState>) => {
    if ("bankCode" in patch) setValue("bankCode", patch.bankCode ?? "", { shouldDirty: true, shouldValidate: true })
    if ("accountNumber" in patch) setValue("accountNumber", patch.accountNumber ?? "", { shouldDirty: true, shouldValidate: true })
    if ("accountName" in patch) {
      setValue("accountName", toUppercaseNoDiacritics(patch.accountName ?? ""), { shouldDirty: true, shouldValidate: true })
    }
    if ("displayName" in patch) {
      setValue("displayName", toUppercaseNoDiacritics(patch.displayName ?? ""), { shouldDirty: true, shouldValidate: true })
    }
    if ("active" in patch) setValue("active", patch.active ?? true, { shouldDirty: true, shouldValidate: true })
  }

  const submitForm = (values: PaymentConfigFormState) => {
    onSubmit(toRequest(values))
  }

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onClose}
      showCloseIcon={false}
      className={SidebarConfig.sizes.DEFAULT}
    >
      <div className="flex h-full flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              icon="pi pi-arrow-left"
              aria-label="Đóng form cấu hình ngân hàng"
              onClick={onClose}
              disabled={saving}
              className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !border-none !bg-[#fee2e2] !p-0 !text-[#b42318] hover:!bg-[#fecaca] disabled:!opacity-60 [&_.p-button-icon]:!text-sm [&_.p-button-icon]:!text-[#b42318]"
            />
            <h2 className="m-0 text-xl font-bold text-[#24364d]">
              {mode === "CREATE" ? "Thêm cấu hình ngân hàng" : "Cập nhật cấu hình ngân hàng"}
            </h2>
          </div>
          <p className="mt-1 text-sm text-[#73849b]">Thiết lập tài khoản nhận chuyển khoản cho QR thanh toán.</p>
        </div>

        <form
          id="shop-payment-config-form"
          onSubmit={handleSubmit(submitForm)}
          className="flex-1 space-y-4 overflow-y-auto pb-20 pr-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ConfigInput
              label="Mã ngân hàng"
              required
              value={formState.bankCode}
              maxLength={50}
              error={errors.bankCode?.message}
              onChange={(value) => updateForm({ bankCode: value })}
            />
            <ConfigInput
              label="Số tài khoản"
              required
              value={formState.accountNumber}
              maxLength={100}
              error={errors.accountNumber?.message}
              onChange={(value) => updateForm({ accountNumber: value })}
            />
            <ConfigInput
              label="Tên chủ tài khoản"
              required
              value={formState.accountName}
              maxLength={255}
              error={errors.accountName?.message}
              onChange={(value) => updateForm({ accountName: value })}
            />
            <ConfigInput
              label="Tên hiển thị"
              required
              value={formState.displayName}
              maxLength={255}
              error={errors.displayName?.message}
              onChange={(value) => updateForm({ displayName: value })}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SwitchField
              inputId="payment-config-active"
              label="Kích hoạt"
              checked={formState.active}
              onChange={(value) => updateForm({ active: value })}
            />
          </div>
        </form>

        <div className="mt-auto flex items-center justify-center gap-3 border-t border-[#e2e8f0] bg-white pb-4 pt-4">
          <Button
            type="button"
            label="Hủy"
            onClick={onClose}
            disabled={saving}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-medium !text-slate-700 hover:!bg-[#ecf1f8]"
          />
          <Button
            type="submit"
            form="shop-payment-config-form"
            label={mode === "CREATE" ? "Tạo cấu hình" : "Lưu thay đổi"}
            loading={saving}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
          />
        </div>
      </div>
    </Sidebar>
  )
}

function ConfigInput({
  label,
  required = false,
  value,
  maxLength,
  error,
  onChange,
}: {
  label: string
  required?: boolean
  value: string
  maxLength: number
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </div>
      <InputText
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`${inputClassName} ${error ? "!border-rose-400 focus:!border-rose-400" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function SwitchField({
  inputId,
  label,
  checked,
  onChange,
}: {
  inputId: string
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <InputSwitch
        inputId={inputId}
        checked={checked}
        onChange={(event) => onChange(Boolean(event.value))}
        className="[&.p-inputswitch-checked_.p-inputswitch-slider]:!bg-[#214388]"
      />
      <label htmlFor={inputId} className="m-0">
        {label}
        <span className="ml-2 text-xs font-semibold text-[#73849b]">{checked ? "Bật" : "Tắt"}</span>
      </label>
    </div>
  )
}
