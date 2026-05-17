import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { Sidebar } from "primereact/sidebar"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SidebarConfig } from "@/common/config/sidebar.config"
import type { ShopDTO, ShopLocationSource, ShopProfileUpdateRequest } from "@/apps/profile/model"

type ShopProfileEditorSidebarProps = {
  visible: boolean
  shop: ShopDTO | null
  saving: boolean
  onClose: () => void
  onSubmit: (request: ShopProfileUpdateRequest) => void
}

const LOCATION_SOURCE_OPTIONS: { label: string; value: ShopLocationSource }[] = [
  { label: "Nhập thủ công", value: "MANUAL" },
  { label: "Định vị trình duyệt", value: "BROWSER_GEO" },
  { label: "Chọn trên bản đồ", value: "PLACE_PICKER" },
]

const ShopProfileFormSchema = z.object({
  name: z.string().trim().min(1, "Tên cửa hàng là bắt buộc.").max(255, "Tên cửa hàng không được vượt quá 255 ký tự."),
  addressText: z.string().trim().max(500, "Địa chỉ không được vượt quá 500 ký tự.").optional(),
  imageUrl: z.string().trim().max(1000, "Đường dẫn ảnh đại diện không được vượt quá 1000 ký tự.").optional(),
  coverImageUrl: z.string().trim().max(1000, "Đường dẫn ảnh bìa không được vượt quá 1000 ký tự.").optional(),
  phone: z.string().trim().max(50, "Số điện thoại không được vượt quá 50 ký tự.").optional(),
  email: z.string().trim().max(255, "Email không được vượt quá 255 ký tự.").optional(),
  description: z.string().trim().max(2000, "Mô tả không được vượt quá 2000 ký tự.").optional(),
  openingHours: z.string().trim().optional(),
  closingHours: z.string().trim().optional(),
  facebookUrl: z.string().trim().max(1000, "Đường dẫn Facebook không được vượt quá 1000 ký tự.").optional(),
  lat: z.number({ message: "Vĩ độ là bắt buộc." }).min(-90, "Vĩ độ phải từ -90 đến 90.").max(90, "Vĩ độ phải từ -90 đến 90."),
  lng: z.number({ message: "Kinh độ là bắt buộc." }).min(-180, "Kinh độ phải từ -180 đến 180.").max(180, "Kinh độ phải từ -180 đến 180."),
  locationSource: z.enum(["MANUAL", "BROWSER_GEO", "PLACE_PICKER"]),
  locationAccuracyM: z.number().min(0, "Độ chính xác không được âm.").optional(),
})

type ShopProfileFormState = z.infer<typeof ShopProfileFormSchema>

const defaultFormState: ShopProfileFormState = {
  name: "",
  addressText: "",
  imageUrl: "",
  coverImageUrl: "",
  phone: "",
  email: "",
  description: "",
  openingHours: "",
  closingHours: "",
  facebookUrl: "",
  lat: 0,
  lng: 0,
  locationSource: "MANUAL",
  locationAccuracyM: undefined,
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0"

function blankToUndefined(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function toFormState(shop: ShopDTO | null): ShopProfileFormState {
  if (!shop) return defaultFormState

  return {
    name: shop.name ?? "",
    addressText: shop.addressText ?? "",
    imageUrl: shop.imageUrl ?? "",
    coverImageUrl: shop.coverImageUrl ?? "",
    phone: shop.phone ?? "",
    email: shop.email ?? "",
    description: shop.description ?? "",
    openingHours: shop.openingHours ?? "",
    closingHours: shop.closingHours ?? "",
    facebookUrl: shop.facebookUrl ?? "",
    lat: shop.lat,
    lng: shop.lng,
    locationSource: shop.locationSource,
    locationAccuracyM: shop.locationAccuracyM ?? undefined,
  }
}

function toRequest(values: ShopProfileFormState): ShopProfileUpdateRequest {
  return {
    name: values.name.trim(),
    addressText: blankToUndefined(values.addressText),
    imageUrl: blankToUndefined(values.imageUrl),
    coverImageUrl: blankToUndefined(values.coverImageUrl),
    phone: blankToUndefined(values.phone),
    email: blankToUndefined(values.email),
    description: blankToUndefined(values.description),
    openingHours: blankToUndefined(values.openingHours),
    closingHours: blankToUndefined(values.closingHours),
    facebookUrl: blankToUndefined(values.facebookUrl),
    lat: values.lat,
    lng: values.lng,
    locationSource: values.locationSource,
    locationAccuracyM: values.locationAccuracyM,
  }
}

export function ShopProfileEditorSidebar({ visible, shop, saving, onClose, onSubmit }: ShopProfileEditorSidebarProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShopProfileFormState>({
    resolver: zodResolver(ShopProfileFormSchema),
    defaultValues: defaultFormState,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const formState = watch()

  useEffect(() => {
    reset(visible ? toFormState(shop) : defaultFormState)
  }, [reset, shop, visible])

  const updateForm = <K extends keyof ShopProfileFormState>(field: K, value: ShopProfileFormState[K]) => {
    setValue(field, value as never, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <Sidebar visible={visible} position="right" onHide={onClose} showCloseIcon={false} className={SidebarConfig.sizes.LG}>
      <div className="flex h-full flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              icon="pi pi-arrow-left"
              aria-label="Đóng form cập nhật hồ sơ"
              onClick={onClose}
              disabled={saving}
              className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !border-none !bg-[#fee2e2] !p-0 !text-[#b42318] hover:!bg-[#fecaca] [&_.p-button-icon]:!text-[#b42318]"
            />
            <h2 className="m-0 text-xl font-bold text-[#24364d]">Cập nhật hồ sơ cửa hàng</h2>
          </div>
          <p className="mt-1 text-sm text-[#73849b]">Cập nhật thông tin hiển thị, liên hệ, giờ hoạt động và vị trí cửa hàng.</p>
        </div>

        <form id="shop-profile-form" onSubmit={handleSubmit((values) => onSubmit(toRequest(values)))} className="flex-1 space-y-6 overflow-y-auto pb-20 pr-2">
          <FormSection title="Thông tin hiển thị">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextField label="Tên cửa hàng" required value={formState.name} error={errors.name?.message} onChange={(value) => updateForm("name", value)} />
              </div>
              <div className="md:col-span-2">
                <TextareaField label="Mô tả" value={formState.description ?? ""} error={errors.description?.message} onChange={(value) => updateForm("description", value)} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Liên hệ và giờ hoạt động">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Số điện thoại" value={formState.phone ?? ""} error={errors.phone?.message} onChange={(value) => updateForm("phone", value)} />
              <TextField label="Email" value={formState.email ?? ""} error={errors.email?.message} onChange={(value) => updateForm("email", value)} />
              <TextField label="Giờ mở cửa" type="time" value={formState.openingHours ?? ""} error={errors.openingHours?.message} onChange={(value) => updateForm("openingHours", value)} />
              <TextField label="Giờ đóng cửa" type="time" value={formState.closingHours ?? ""} error={errors.closingHours?.message} onChange={(value) => updateForm("closingHours", value)} />
              <div className="md:col-span-2">
                <TextField label="Facebook" value={formState.facebookUrl ?? ""} error={errors.facebookUrl?.message} onChange={(value) => updateForm("facebookUrl", value)} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Vị trí">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextField label="Địa chỉ" value={formState.addressText ?? ""} error={errors.addressText?.message} onChange={(value) => updateForm("addressText", value)} />
              </div>
              <NumberField label="Vĩ độ" value={formState.lat} error={errors.lat?.message} onChange={(value) => updateForm("lat", value ?? 0)} />
              <NumberField label="Kinh độ" value={formState.lng} error={errors.lng?.message} onChange={(value) => updateForm("lng", value ?? 0)} />
              <LocationSourceField value={formState.locationSource} error={errors.locationSource?.message} onChange={(value) => updateForm("locationSource", value)} />
              <NumberField label="Độ chính xác vị trí (m)" value={formState.locationAccuracyM} error={errors.locationAccuracyM?.message} onChange={(value) => updateForm("locationAccuracyM", value ?? undefined)} />
            </div>
          </FormSection>
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
            form="shop-profile-form"
            label="Lưu thay đổi"
            icon="pi pi-save"
            loading={saving}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
          />
        </div>
      </div>
    </Sidebar>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#24364d]">{title}</h3>
      {children}
    </section>
  )
}

function TextField({ label, value, required = false, type = "text", error, onChange }: { label: string; value: string; required?: boolean; type?: string; error?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </div>
      <InputText value={value} type={type} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} className={`${inputClassName} ${error ? "!border-rose-400" : ""}`} />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function TextareaField({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <InputTextarea value={value} rows={4} autoResize onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} className={`${inputClassName} ${error ? "!border-rose-400" : ""}`} />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function NumberField({ label, value, error, onChange }: { label: string; value: number | undefined; error?: string; onChange: (value: number | null) => void }) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <InputNumber
        value={value ?? null}
        minFractionDigits={0}
        maxFractionDigits={8}
        onValueChange={(event) => onChange(event.value ?? null)}
        aria-invalid={Boolean(error)}
        className="w-full"
        inputClassName={`${inputClassName} ${error ? "!border-rose-400" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function LocationSourceField({ value, error, onChange }: { value: ShopLocationSource; error?: string; onChange: (value: ShopLocationSource) => void }) {
  return (
    <label className="block text-sm text-slate-700">
      <div className="mb-1">Nguồn vị trí</div>
      <Dropdown
        value={value}
        options={LOCATION_SOURCE_OPTIONS}
        optionLabel="label"
        optionValue="value"
        filter
        filterBy="label"
        filterPlaceholder="Tìm nguồn vị trí"
        emptyFilterMessage="Không có nguồn phù hợp"
        onChange={(event) => onChange(event.value as ShopLocationSource)}
        className="w-full !rounded-lg !border-transparent !bg-[#f8fafc]"
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}
