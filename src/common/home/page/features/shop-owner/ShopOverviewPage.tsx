import { useMemo, useState, type FormEvent } from "react"
import { AppDialog } from "@/common/component/AppDialog"
import { useShopOwnerContext } from "@/common/home/page/features/shop-owner/store/ShopOwnerContext"
import type { ShopInfo, ShopStatus } from "@/common/home/page/features/shop-owner/store/shopOwnerStore"

const statusOptions: ShopStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"]

type ShopFormState = {
  name: string
  addressText: string
  lat: string
  lng: string
  status: ShopStatus
  locationSource: ShopInfo["locationSource"]
}

function toFormState(shop: ShopInfo): ShopFormState {
  return {
    name: shop.name,
    addressText: shop.addressText,
    lat: String(shop.lat),
    lng: String(shop.lng),
    status: shop.status,
    locationSource: shop.locationSource,
  }
}

function statusText(status: ShopStatus) {
  if (status === "ACTIVE") return "Đang hoạt động"
  if (status === "INACTIVE") return "Tạm dừng"
  return "Bị khóa"
}

function statusClass(status: ShopStatus) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
  if (status === "INACTIVE") return "bg-slate-50 text-slate-700 ring-1 ring-slate-600/20"
  return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
}

export function ShopOverviewPage() {
  const { data, setShop } = useShopOwnerContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formError, setFormError] = useState("")
  const [formState, setFormState] = useState<ShopFormState>(() => toFormState(data.shop))

  const openDialog = () => {
    setFormError("")
    setFormState(toFormState(data.shop))
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setFormError("")
    setIsDialogOpen(false)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const name = formState.name.trim()
    const addressText = formState.addressText.trim()
    const lat = Number(formState.lat)
    const lng = Number(formState.lng)

    if (!name || !addressText) {
      setFormError("Tên cửa hàng và địa chỉ là bắt buộc.")
      return
    }

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setFormError("Vĩ độ phải trong khoảng -90 đến 90.")
      return
    }

    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      setFormError("Kinh độ phải trong khoảng -180 đến 180.")
      return
    }

    setShop({
      ...data.shop,
      name,
      addressText,
      lat,
      lng,
      status: formState.status,
      locationSource: formState.locationSource,
      locationUpdatedAt: new Date().toISOString(),
    })

    closeDialog()
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hồ sơ Cửa Hàng</h1>
          <p className="mt-2 text-slate-500 max-w-xl text-sm md:text-base">
            Quản lý thông tin chi tiết, vị trí và trạng thái hoạt động cửa hàng của bạn.
          </p>
        </div>
        <button
          onClick={openDialog}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-700 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full md:w-auto"
        >
          <i className="pi pi-pencil h-4 w-4" />
          Cập nhật hồ sơ
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 lg:p-8 relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-70 pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 relative z-10">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-sm ring-1 ring-indigo-100/50">
                <i className="pi pi-building" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{data.shop.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(data.shop.status)}`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${data.shop.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-transparent'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${data.shop.status === 'ACTIVE' ? 'bg-emerald-500' : data.shop.status === 'INACTIVE' ? 'bg-slate-500' : 'bg-amber-500'}`}></span>
                    </span>
                    {statusText(data.shop.status)}
                  </span>
                  <span className="text-sm text-slate-500">ID: #{data.shop.shopId || "TBD"}</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 relative z-10">
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <i className="pi pi-map-marker text-indigo-500" /> Địa chỉ
                </div>
                <div className="text-slate-800 font-medium text-sm leading-relaxed">{data.shop.addressText}</div>
              </div>
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <i className="pi pi-compass text-indigo-500" /> Vị trí tọa độ
                </div>
                <div className="text-slate-800 font-medium text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Vĩ độ</span>
                    <span>{data.shop.lat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kinh độ</span>
                    <span>{data.shop.lng}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 h-full">
            <h3 className="text-sm font-bold text-slate-900 mb-5 pb-4 border-b border-slate-100 uppercase tracking-wider">Hệ thống & Cập nhật</h3>
            
            <div className="space-y-5">
              <div className="group">
                <div className="text-xs font-semibold text-slate-500 mb-2 transition-colors group-hover:text-indigo-600">Cập nhật lần cuối</div>
                <div className="flex items-center gap-3 text-slate-800 font-medium text-sm bg-slate-50/80 px-4 py-3 rounded-xl border border-slate-100 transition-colors group-hover:border-indigo-100 group-hover:bg-indigo-50/30">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <i className="pi pi-clock text-indigo-500" />
                  </div>
                  {new Date(data.shop.locationUpdatedAt).toLocaleString("vi-VN")}
                </div>
              </div>

              <div className="group">
                <div className="text-xs font-semibold text-slate-500 mb-2 transition-colors group-hover:text-indigo-600">Nguồn vị trí</div>
                <div className="flex items-center gap-3 text-slate-800 font-medium text-sm bg-slate-50/80 px-4 py-3 rounded-xl border border-slate-100 transition-colors group-hover:border-indigo-100 group-hover:bg-indigo-50/30">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <i className="pi pi-sitemap text-indigo-500" />
                  </div>
                  {data.shop.locationSource}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppDialog
        open={isDialogOpen}
        onClose={closeDialog}
        title="Cập nhật thông tin cửa hàng"
        description="Bạn có thể chỉnh tên, địa chỉ, vị trí và trạng thái hoạt động."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-200 focus:outline-none"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="shop-info-form"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              Lưu thay đổi
            </button>
          </>
        }
      >
        <form id="shop-info-form" onSubmit={handleSubmit} className="space-y-6 mt-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <i className="pi pi-exclamation-circle text-red-600 mt-0.5 text-lg" />
              <div className="text-sm text-red-700 font-medium">{formError}</div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <InputField
                label="Tên cửa hàng"
                value={formState.name}
                required
                onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Địa chỉ"
                value={formState.addressText}
                required
                onChange={(value) => setFormState((prev) => ({ ...prev, addressText: value }))}
              />
            </div>
            <InputField
              label="Vĩ độ (Latitude)"
              value={formState.lat}
              type="number"
              onChange={(value) => setFormState((prev) => ({ ...prev, lat: value }))}
            />
            <InputField
              label="Kinh độ (Longitude)"
              value={formState.lng}
              type="number"
              onChange={(value) => setFormState((prev) => ({ ...prev, lng: value }))}
            />

            <SelectField
              label="Trạng thái hoạt động"
              value={formState.status}
              options={statusOptions}
              onChange={(value) => setFormState((prev) => ({ ...prev, status: value as ShopStatus }))}
              optionRenderer={(opt) => statusText(opt as ShopStatus)}
            />
            <SelectField
              label="Nguồn vị trí"
              value={formState.locationSource}
              options={["MANUAL", "BROWSER_GEO", "PLACE_PICKER"]}
              onChange={(value) => setFormState((prev) => ({ ...prev, locationSource: value as ShopInfo["locationSource"] }))}
            />
          </div>
        </form>
      </AppDialog>
    </>
  )
}

type InputFieldProps = {
  label: string
  value: string
  required?: boolean
  type?: "text" | "number"
  onChange: (value: string) => void
}

function InputField({ label, value, required = false, type = "text", onChange }: InputFieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <div className="mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  optionRenderer?: (option: string) => string
}

function SelectField({ label, value, options, onChange, optionRenderer }: SelectFieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <div className="mb-1.5 flex items-center gap-1">{label}</div>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors hover:bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {optionRenderer ? optionRenderer(option) : option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <i className="pi pi-chevron-down text-xs" />
        </div>
      </div>
    </label>
  )
}
