import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dropdown } from "primereact/dropdown"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { Password } from "primereact/password"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type {
  GhtkConfigDTO,
  GhtkConfigRequest,
  GhtkPickOption,
  GhtkTransport,
} from "@/apps/ghtk_config/model"

type GhtkConfigFormProps = {
  formId: string
  config: GhtkConfigDTO | null
  onSubmit: (request: GhtkConfigRequest) => void
}

const pickOptionOptions: { label: string; value: GhtkPickOption }[] = [
  { label: "COD", value: "cod" },
  { label: "Bưu cục", value: "post" },
]

const transportOptions: { label: string; value: GhtkTransport }[] = [
  { label: "Đường bộ", value: "road" },
  { label: "Đường bay", value: "fly" },
]

const requiredWhenEnabledFields = [
  "pickName",
  "pickTel",
  "pickAddress",
  "pickProvince",
  "pickDistrict",
  "pickWard",
] as const

const GhtkConfigFormSchema = z
  .object({
    enabled: z.boolean(),
    hasApiToken: z.boolean(),
    apiToken: z.string().trim().max(500, "API token không được vượt quá 500 ký tự."),
    clientSource: z.string().trim().max(255, "Client source không được vượt quá 255 ký tự."),
    pickName: z.string().trim().max(255, "Tên điểm lấy hàng không được vượt quá 255 ký tự."),
    pickTel: z.string().trim().max(30, "Số điện thoại không được vượt quá 30 ký tự."),
    pickAddress: z.string().trim().max(500, "Địa chỉ lấy hàng không được vượt quá 500 ký tự."),
    pickProvince: z.string().trim().max(120, "Tỉnh/thành không được vượt quá 120 ký tự."),
    pickDistrict: z.string().trim().max(120, "Quận/huyện không được vượt quá 120 ký tự."),
    pickWard: z.string().trim().max(120, "Phường/xã không được vượt quá 120 ký tự."),
    pickOption: z.enum(["cod", "post"]),
    transport: z.enum(["road", "fly"]),
  })
  .superRefine((values, context) => {
    if (!values.enabled) return

    if (!values.hasApiToken && !values.apiToken.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["apiToken"],
        message: "API token là bắt buộc khi bật GHTK.",
      })
    }

    requiredWhenEnabledFields.forEach((field) => {
      const value = values[field]
      if (typeof value === "string" && !value.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Trường này là bắt buộc khi bật GHTK.",
        })
      }
    })
  })

type GhtkConfigFormState = z.infer<typeof GhtkConfigFormSchema>

const defaultFormState: GhtkConfigFormState = {
  enabled: false,
  hasApiToken: false,
  apiToken: "",
  clientSource: "",
  pickName: "",
  pickTel: "",
  pickAddress: "",
  pickProvince: "",
  pickDistrict: "",
  pickWard: "",
  pickOption: "cod",
  transport: "road",
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0"

function toFormState(config: GhtkConfigDTO | null): GhtkConfigFormState {
  if (!config) return defaultFormState

  return {
    enabled: config.enabled,
    hasApiToken: config.hasApiToken,
    apiToken: "",
    clientSource: config.clientSource ?? "",
    pickName: config.pickName,
    pickTel: config.pickTel,
    pickAddress: config.pickAddress,
    pickProvince: config.pickProvince,
    pickDistrict: config.pickDistrict,
    pickWard: config.pickWard,
    pickOption: config.pickOption,
    transport: config.transport,
  }
}

function toRequest(formState: GhtkConfigFormState): GhtkConfigRequest {
  const apiToken = formState.apiToken.trim()
  const clientSource = formState.clientSource.trim()

  return {
    enabled: formState.enabled,
    ...(apiToken ? { apiToken } : {}),
    ...(clientSource ? { clientSource } : {}),
    pickName: formState.pickName.trim(),
    pickTel: formState.pickTel.trim(),
    pickAddress: formState.pickAddress.trim(),
    pickProvince: formState.pickProvince.trim(),
    pickDistrict: formState.pickDistrict.trim(),
    pickWard: formState.pickWard.trim(),
    pickOption: formState.pickOption,
    transport: formState.transport,
  }
}

export function GhtkConfigForm({ formId, config, onSubmit }: GhtkConfigFormProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GhtkConfigFormState>({
    resolver: zodResolver(GhtkConfigFormSchema),
    defaultValues: defaultFormState,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const formState = watch()

  useEffect(() => {
    reset(toFormState(config))
  }, [config, reset])

  const updateForm = (patch: Partial<GhtkConfigFormState>) => {
    Object.entries(patch).forEach(([key, value]) => {
      setValue(key as keyof GhtkConfigFormState, value as never, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  const submitForm = (values: GhtkConfigFormState) => {
    onSubmit(toRequest(values))
  }

  return (
    <form id={formId} onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <section className="space-y-4 rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col gap-3 border-b border-[#e2e8f0] pb-4 md:flex-row md:items-center md:justify-between">
          <h2 className="m-0 text-base font-semibold text-[#24364d]">Kết nối GHTK</h2>
          <SwitchField
            inputId="ghtk-enabled"
            label="Kích hoạt"
            checked={formState.enabled}
            onChange={(value) => updateForm({ enabled: value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PasswordField
            label="API token"
            value={formState.apiToken}
            maxLength={500}
            error={errors.apiToken?.message}
            placeholder={formState.hasApiToken ? "Để trống để giữ token hiện tại" : undefined}
            onChange={(value) => updateForm({ apiToken: value })}
          />
          <PasswordField
            label="Client source"
            value={formState.clientSource}
            maxLength={255}
            error={errors.clientSource?.message}
            onChange={(value) => updateForm({ clientSource: value })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="m-0 text-base font-semibold text-[#24364d]">Thông tin lấy hàng</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ConfigDropdown
              label="Pick option"
              value={formState.pickOption}
              options={pickOptionOptions}
              onChange={(value) => updateForm({ pickOption: value as GhtkPickOption })}
            />
            <ConfigDropdown
              label="Transport"
              value={formState.transport}
              options={transportOptions}
              onChange={(value) => updateForm({ transport: value as GhtkTransport })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ConfigInput
            label="Tên điểm lấy hàng"
            required={formState.enabled}
            value={formState.pickName}
            maxLength={255}
            error={errors.pickName?.message}
            onChange={(value) => updateForm({ pickName: value })}
          />
          <ConfigInput
            label="Số điện thoại lấy hàng"
            required={formState.enabled}
            value={formState.pickTel}
            maxLength={30}
            error={errors.pickTel?.message}
            onChange={(value) => updateForm({ pickTel: value })}
          />
          <ConfigInput
            label="Tỉnh/thành"
            required={formState.enabled}
            value={formState.pickProvince}
            maxLength={120}
            error={errors.pickProvince?.message}
            onChange={(value) => updateForm({ pickProvince: value })}
          />
          <ConfigInput
            label="Quận/huyện"
            required={formState.enabled}
            value={formState.pickDistrict}
            maxLength={120}
            error={errors.pickDistrict?.message}
            onChange={(value) => updateForm({ pickDistrict: value })}
          />
          <ConfigInput
            label="Phường/xã"
            required={formState.enabled}
            value={formState.pickWard}
            maxLength={120}
            error={errors.pickWard?.message}
            onChange={(value) => updateForm({ pickWard: value })}
          />
        </div>

        <ConfigTextarea
          label="Địa chỉ lấy hàng"
          required={formState.enabled}
          value={formState.pickAddress}
          maxLength={500}
          error={errors.pickAddress?.message}
          onChange={(value) => updateForm({ pickAddress: value })}
        />
      </section>
    </form>
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

function PasswordField({
  label,
  value,
  maxLength,
  placeholder,
  error,
  onChange,
}: {
  label: string
  value: string
  maxLength: number
  placeholder?: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <Password
        value={value}
        feedback={false}
        toggleMask
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        inputClassName={`${inputClassName} ${error ? "!border-rose-400 focus:!border-rose-400" : ""}`}
        className="w-full [&_.p-password-input]:w-full"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function ConfigTextarea({
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
      <InputTextarea
        value={value}
        rows={3}
        autoResize
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`${inputClassName} ${error ? "!border-rose-400 focus:!border-rose-400" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function ConfigDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block min-w-[160px] text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <Dropdown
        value={value}
        options={options}
        optionLabel="label"
        optionValue="value"
        filter
        filterBy="label,value"
        filterPlaceholder={`Tìm ${label.toLowerCase()}`}
        emptyFilterMessage="Không tìm thấy lựa chọn"
        onChange={(event) => onChange(String(event.value))}
        className="!h-10 !w-full !rounded-lg !border-transparent !bg-[#f8fafc] !text-sm !shadow-none focus:!border-[#d9e1eb] [&_.p-dropdown-label]:!flex [&_.p-dropdown-label]:!items-center [&_.p-dropdown-label]:!py-0 [&_.p-dropdown-label]:!text-sm [&_.p-dropdown-trigger]:!w-9"
        panelClassName="text-sm"
      />
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
