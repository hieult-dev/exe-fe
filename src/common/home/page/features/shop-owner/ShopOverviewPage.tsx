import { useMemo, useState, type FormEvent } from "react"
import { Building2, MapPin, PencilLine, Radar } from "lucide-react"
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
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700"
  if (status === "INACTIVE") return "bg-slate-100 text-slate-600"
  return "bg-amber-50 text-amber-700"
}

export function ShopOverviewPage() {
  const { data, setShop } = useShopOwnerContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formError, setFormError] = useState("")
  const [formState, setFormState] = useState<ShopFormState>(() => toFormState(data.shop))

  const detailRows = useMemo(
    () => [
      { label: "Tên cửa hàng", value: data.shop.name, icon: <Building2 className="h-4 w-4" /> },
      { label: "Địa chỉ", value: data.shop.addressText, icon: <MapPin className="h-4 w-4" /> },
      { label: "Vị trí", value: `${data.shop.lat}, ${data.shop.lng}`, icon: <Radar className="h-4 w-4" /> },
      { label: "Nguồn vị trí", value: data.shop.locationSource, icon: <Radar className="h-4 w-4" /> },
      {
        label: "Cập nhật lần cuối",
        value: new Date(data.shop.locationUpdatedAt).toLocaleString("vi-VN"),
        icon: <PencilLine className="h-4 w-4" />,
      },
    ],
    [data.shop]
  )

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
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Thông tin cửa hàng</h1>
        <p className="mt-1 text-sm text-slate-500">Xem chi tiết và cập nhật hồ sơ cửa hàng của bạn.</p>
      </div>

      <div className="pt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#efefef] bg-[#fafafa] p-4">
          <div>
            <p className="text-sm text-slate-500">Trạng thái hoạt động</p>
            <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClass(data.shop.status)}`}>
              {statusText(data.shop.status)}
            </span>
          </div>

          <button
            onClick={openDialog}
            className="inline-flex items-center gap-2 rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
          >
            <PencilLine className="h-4 w-4" />
            Cập nhật cửa hàng
          </button>
        </div>

        <div className="space-y-3">
          {detailRows.map((row) => (
            <div key={row.label} className="grid gap-2 rounded-sm border border-[#efefef] px-4 py-3 md:grid-cols-[180px,1fr] md:items-center">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                {row.icon}
                {row.label}
              </div>
              <div className="text-sm font-medium text-slate-800">{row.value}</div>
            </div>
          ))}
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
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa]"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="shop-info-form"
              className="rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
            >
              Lưu cập nhật
            </button>
          </>
        }
      >
        <form id="shop-info-form" onSubmit={handleSubmit} className="space-y-3">
          {formError && (
            <div className="rounded-sm border border-[#f0c2b7] bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <InputField
              label="Tên cửa hàng"
              value={formState.name}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
            />
            <InputField
              label="Địa chỉ"
              value={formState.addressText}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, addressText: value }))}
            />
            <InputField
              label="Vĩ độ"
              value={formState.lat}
              type="number"
              onChange={(value) => setFormState((prev) => ({ ...prev, lat: value }))}
            />
            <InputField
              label="Kinh độ"
              value={formState.lng}
              type="number"
              onChange={(value) => setFormState((prev) => ({ ...prev, lng: value }))}
            />

            <SelectField
              label="Trạng thái"
              value={formState.status}
              options={statusOptions}
              onChange={(value) => setFormState((prev) => ({ ...prev, status: value as ShopStatus }))}
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
    <label className="text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <input
        type={type}
        value={value}
        required={required}
        step={type === "number" ? "any" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-[#d9d9d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
      />
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-[#d9d9d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

