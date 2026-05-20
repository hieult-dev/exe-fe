import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Tag } from "primereact/tag"
import type { AdminShopDTO } from "@/apps/admin/model"
import { adminShopStatusLabel } from "@/apps/admin/model"
import { formatDateTimeViVN } from "@/common/utils/format"

type AdminShopDetailDialogProps = {
  shop: AdminShopDTO | null
  visible: boolean
  onClose: () => void
}

function statusSeverity(status: string) {
  if (status === "ACTIVE") return "success" as const
  if (status === "PENDING_APPROVAL") return "warning" as const
  if (status === "REJECTED") return "danger" as const
  return "info" as const
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Chưa có" : String(value)
}

function locationSourceLabel(value: string | null | undefined) {
  if (value === "MANUAL") return "Nhập thủ công"
  if (value === "BROWSER_GEO") return "Vị trí trình duyệt"
  if (value === "PLACE_PICKER") return "Chọn trên bản đồ"
  return "Chưa có"
}

function coordinateValue(shop: AdminShopDTO) {
  if (shop.lat === null || shop.lng === null) return null
  return `${shop.lat}, ${shop.lng}`
}

function accuracyValue(value: number | null | undefined) {
  return value === null || value === undefined ? null : `${value} m`
}

function SectionTitle({ children }: { children: string }) {
  return <p className="m-0 text-sm font-semibold text-slate-700">{children}</p>
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="m-0 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <i className={`${icon} text-[11px]`} />
        {label}
      </p>
      <p className="m-0 mt-1 break-words text-sm font-medium text-slate-800">{displayValue(value)}</p>
    </div>
  )
}

export function AdminShopDetailDialog({ shop, visible, onClose }: AdminShopDetailDialogProps) {
  const footer = (
    <div className="flex justify-center">
      <Button
        type="button"
        label="Đóng"
        icon="pi pi-times"
        onClick={onClose}
        className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-5 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
      />
    </div>
  )

  return (
    <Dialog
      header="Chi tiết shop"
      visible={visible}
      modal
      draggable={false}
      onHide={onClose}
      footer={footer}
      className="w-[min(860px,calc(100vw-2rem))]"
    >
      {shop && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-xl bg-[#f8fafc] p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="m-0 text-xl font-semibold text-slate-900">{shop.name}</p>
              <p className="m-0 mt-1 text-sm text-slate-500">Mã shop: {shop.id}</p>
            </div>
            <Tag value={adminShopStatusLabel(shop.status)} severity={statusSeverity(shop.status)} rounded />
          </div>

          <section className="space-y-3">
            <SectionTitle>Thông tin shop</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              <DetailItem icon="pi pi-map-marker" label="Địa chỉ shop" value={shop.addressText} />
              <DetailItem icon="pi pi-phone" label="Số điện thoại shop" value={shop.phone} />
              <DetailItem icon="pi pi-envelope" label="Email shop" value={shop.email} />
              <DetailItem icon="pi pi-facebook" label="Facebook" value={shop.facebookUrl} />
              <DetailItem icon="pi pi-clock" label="Giờ mở cửa" value={shop.openingHours} />
              <DetailItem icon="pi pi-clock" label="Giờ đóng cửa" value={shop.closingHours} />
              <DetailItem icon="pi pi-map" label="Tọa độ" value={coordinateValue(shop)} />
              <DetailItem icon="pi pi-compass" label="Nguồn vị trí" value={locationSourceLabel(shop.locationSource)} />
              <DetailItem icon="pi pi-bullseye" label="Độ chính xác vị trí" value={accuracyValue(shop.locationAccuracyM)} />
              <DetailItem icon="pi pi-calendar-plus" label="Ngày đăng ký" value={formatDateTimeViVN(shop.createdAt)} />
              <DetailItem icon="pi pi-calendar" label="Cập nhật lần cuối" value={formatDateTimeViVN(shop.updatedAt)} />
              <DetailItem icon="pi pi-align-left" label="Mô tả" value={shop.description} />
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle>Thông tin chủ shop</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              <DetailItem icon="pi pi-user" label="Họ tên" value={shop.owner?.fullName} />
              <DetailItem icon="pi pi-envelope" label="Email" value={shop.owner?.email} />
              <DetailItem icon="pi pi-phone" label="Số điện thoại" value={shop.owner?.phone} />
              <DetailItem icon="pi pi-map-marker" label="Địa chỉ" value={shop.owner?.address} />
              <DetailItem icon="pi pi-id-card" label="Tuổi" value={shop.owner?.age} />
            </div>
          </section>
        </div>
      )}
    </Dialog>
  )
}
