import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react"
import { Avatar } from "primereact/avatar"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Menu } from "primereact/menu"
import { Skeleton } from "primereact/skeleton"
import { Tag } from "primereact/tag"
import { Toolbar } from "primereact/toolbar"
import { getShopProfile, updateShopProfile } from "@/apps/profile/api/shopProfileApi"
import { ShopProfileEditorSidebar } from "@/apps/profile/components/ShopProfileEditorSidebar"
import type { ShopDTO, ShopLocationSource, ShopProfileUpdateRequest } from "@/apps/profile/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatDateTimeViVN } from "@/common/utils/format"
import { buildUploadPublicUrl } from "@/common/utils/url"

const fallbackCoverImage = "/modern-pet-grooming-salon.png"
const fallbackAvatarImage = "/logo.png"
const acceptedImageTypes = "image/png,image/jpeg,image/jpg,image/webp,image/gif"

type ProfileImageTarget = "avatar" | "cover"

type ViewedProfileImage = {
  title: string
  url: string
} | null

type PendingProfileImage = {
  target: ProfileImageTarget
  file: File
} | null

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function statusText(status: string) {
  if (status === "ACTIVE") return "Đang hoạt động"
  if (status === "INACTIVE") return "Tạm dừng"
  if (status === "SUSPENDED") return "Bị khóa"
  return status || "Chưa xác định"
}

function statusSeverity(status: string) {
  if (status === "ACTIVE") return "success" as const
  if (status === "SUSPENDED") return "warning" as const
  return "info" as const
}

function locationSourceText(source: ShopLocationSource) {
  if (source === "BROWSER_GEO") return "Định vị trình duyệt"
  if (source === "PLACE_PICKER") return "Chọn trên bản đồ"
  return "Nhập thủ công"
}

function optionalText(value: string | number | null | undefined, fallback = "Chưa cập nhật") {
  if (value === null || value === undefined || value === "") return fallback
  return String(value)
}

function formatCoordinate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(6) : "Chưa cập nhật"
}

function hasValidCoordinates(shop: ShopDTO) {
  return typeof shop.lat === "number" && Number.isFinite(shop.lat) && typeof shop.lng === "number" && Number.isFinite(shop.lng)
}

function toProfileUpdateRequest(shop: ShopDTO): ShopProfileUpdateRequest | null {
  if (!hasValidCoordinates(shop)) return null

  return {
    name: shop.name,
    addressText: shop.addressText ?? undefined,
    imageUrl: shop.imageUrl ?? undefined,
    coverImageUrl: shop.coverImageUrl ?? undefined,
    phone: shop.phone ?? undefined,
    email: shop.email ?? undefined,
    description: shop.description ?? undefined,
    openingHours: shop.openingHours ?? undefined,
    closingHours: shop.closingHours ?? undefined,
    facebookUrl: shop.facebookUrl ?? undefined,
    lat: shop.lat,
    lng: shop.lng,
    locationSource: shop.locationSource,
    locationAccuracyM: shop.locationAccuracyM ?? undefined,
  }
}

export function ShopOverviewPage() {
  const [shop, setShopProfile] = useState<ShopDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imageSavingTarget, setImageSavingTarget] = useState<ProfileImageTarget | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const result = await getShopProfile()
      setShopProfile(result)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tải hồ sơ cửa hàng."))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleSubmit = async (request: ShopProfileUpdateRequest) => {
    setIsSaving(true)
    try {
      const result = await updateShopProfile(request)
      setShopProfile(result)
      setIsEditorOpen(false)
      notify.success("Đã cập nhật hồ sơ cửa hàng.")
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể cập nhật hồ sơ cửa hàng."))
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageSubmit = async (target: ProfileImageTarget, file: File) => {
    if (!shop) return false
    if (!file.type.startsWith("image/")) {
      notify.error("Vui lòng chọn tệp ảnh hợp lệ.")
      return false
    }

    const request = toProfileUpdateRequest(shop)
    if (!request) {
      notify.error("Không thể cập nhật ảnh khi hồ sơ chưa có tọa độ hợp lệ.")
      return false
    }

    setImageSavingTarget(target)
    try {
      const result = await updateShopProfile({
        ...request,
        avatar: target === "avatar" ? file : undefined,
        cover_img: target === "cover" ? file : undefined,
      })
      setShopProfile(result)
      notify.success(target === "avatar" ? "Đã cập nhật ảnh đại diện." : "Đã cập nhật ảnh bìa.")
      return true
    } catch (error) {
      notify.error(getErrorMessage(error, target === "avatar" ? "Không thể cập nhật ảnh đại diện." : "Không thể cập nhật ảnh bìa."))
      return false
    } finally {
      setImageSavingTarget(null)
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-2">
        <Toolbar
          className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          start={
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Hồ sơ cửa hàng</h1>
              <p className="mt-0.5 text-sm text-slate-500">Quản lý thông tin hiển thị, liên hệ và vị trí kinh doanh.</p>
            </div>
          }
          end={
            <div className="flex items-center gap-2">
              <Button
                label="Làm mới"
                icon="pi pi-refresh"
                outlined
                loading={isLoading}
                onClick={loadProfile}
                className="!h-9 !rounded-md !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-medium !text-[#40526b] hover:!bg-[#f8fafc]"
              />
              <Button
                label="Cập nhật hồ sơ"
                icon="pi pi-pencil"
                disabled={!shop}
                onClick={() => setIsEditorOpen(true)}
                className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
              />
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          {errorMessage && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:flex-row md:items-center md:justify-between">
              <span>{errorMessage}</span>
              <Button label="Thử lại" icon="pi pi-refresh" text onClick={loadProfile} className="!h-8 !px-2 !py-0 !text-sm !font-semibold !text-rose-700" />
            </div>
          )}

          {isLoading ? (
            <ProfileSkeleton />
          ) : shop ? (
            <ProfileContent shop={shop} imageSavingTarget={imageSavingTarget} onImageSubmit={handleImageSubmit} />
          ) : (
            <EmptyProfile />
          )}
        </div>
      </div>

      <ShopProfileEditorSidebar visible={isEditorOpen} shop={shop} saving={isSaving} onClose={() => setIsEditorOpen(false)} onSubmit={handleSubmit} />
    </>
  )
}

function ProfileContent({
  shop,
  imageSavingTarget,
  onImageSubmit,
}: {
  shop: ShopDTO
  imageSavingTarget: ProfileImageTarget | null
  onImageSubmit: (target: ProfileImageTarget, file: File) => Promise<boolean>
}) {
  const coverImage = buildUploadPublicUrl(shop.coverImageUrl) || fallbackCoverImage
  const avatarImage = buildUploadPublicUrl(shop.imageUrl) || fallbackAvatarImage
  const canOpenMap = hasValidCoordinates(shop)
  const avatarMenuRef = useRef<Menu>(null)
  const coverMenuRef = useRef<Menu>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [viewedImage, setViewedImage] = useState<ViewedProfileImage>(null)
  const [pendingImage, setPendingImage] = useState<PendingProfileImage>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState("")
  const isUploadingImage = Boolean(imageSavingTarget)

  useEffect(() => {
    if (!pendingImage) {
      setPendingPreviewUrl("")
      return
    }

    const url = URL.createObjectURL(pendingImage.file)
    setPendingPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingImage])

  const handleImageChange = (target: ProfileImageTarget) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      notify.error("Vui lòng chọn tệp ảnh hợp lệ.")
      return
    }
    setPendingImage({ target, file })
  }

  const closePendingImage = () => {
    if (isUploadingImage) return
    setPendingImage(null)
  }

  const savePendingImage = async () => {
    if (!pendingImage) return

    const isSaved = await onImageSubmit(pendingImage.target, pendingImage.file)
    if (isSaved) setPendingImage(null)
  }

  const avatarMenuItems = [
    {
      label: "Xem ảnh",
      icon: "pi pi-eye",
      command: () => setViewedImage({ title: "Ảnh đại diện", url: avatarImage }),
    },
    {
      label: "Đổi ảnh",
      icon: "pi pi-upload",
      disabled: isUploadingImage,
      command: () => avatarInputRef.current?.click(),
    },
  ]

  const coverMenuItems = [
    {
      label: "Xem ảnh",
      icon: "pi pi-eye",
      command: () => setViewedImage({ title: "Ảnh bìa", url: coverImage }),
    },
    {
      label: "Đổi ảnh",
      icon: "pi pi-upload",
      disabled: isUploadingImage,
      command: () => coverInputRef.current?.click(),
    },
  ]

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_.9fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="relative min-h-[18rem] bg-slate-100">
            <Menu ref={coverMenuRef} model={coverMenuItems} popup />
            <Menu ref={avatarMenuRef} model={avatarMenuItems} popup />
            <input ref={coverInputRef} type="file" accept={acceptedImageTypes} disabled={isUploadingImage} onChange={handleImageChange("cover")} className="sr-only" />
            <img
              src={coverImage}
              alt={`Ảnh bìa ${shop.name}`}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = fallbackCoverImage
              }}
            />
            <button
              type="button"
              aria-label="Tùy chọn ảnh bìa"
              disabled={isUploadingImage}
              onClick={(event) => coverMenuRef.current?.toggle(event)}
              className="absolute inset-0 z-10 cursor-pointer bg-transparent disabled:cursor-wait"
            />
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <Button
              type="button"
              label="Ảnh bìa"
              icon={imageSavingTarget === "cover" ? "pi pi-spin pi-spinner" : "pi pi-camera"}
              disabled={isUploadingImage}
              onClick={(event) => coverMenuRef.current?.toggle(event)}
              className="!absolute !right-4 !top-4 !z-40 !h-9 !rounded-md !border-none !bg-white/95 !px-3 !py-0 !text-sm !font-semibold !text-[#214388] !shadow-sm hover:!bg-white [&_.p-button-icon]:!text-[#214388] [&_.p-button-label]:!text-[#214388]"
            />
            <div className="absolute bottom-5 left-5 right-5 z-30">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                  <input ref={avatarInputRef} type="file" accept={acceptedImageTypes} disabled={isUploadingImage} onChange={handleImageChange("avatar")} className="sr-only" />
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={(event) => avatarMenuRef.current?.toggle(event)}
                    className="group relative block shrink-0 cursor-pointer rounded-full bg-transparent p-0 disabled:cursor-wait"
                    aria-label="Tùy chọn ảnh đại diện"
                  >
                    <Avatar
                      image={avatarImage}
                      shape="circle"
                      className="!h-24 !w-24 !border-4 !border-white !bg-white !shadow-lg"
                      imageAlt={`Ảnh đại diện ${shop.name}`}
                    />
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/0 text-white transition group-hover:bg-slate-950/45">
                      <i className={imageSavingTarget === "avatar" ? "pi pi-spin pi-spinner text-lg opacity-100" : "pi pi-ellipsis-h text-lg opacity-0 group-hover:opacity-100"} />
                    </span>
                  </button>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Tag value={statusText(shop.status)} severity={statusSeverity(shop.status)} />
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">Mã cửa hàng #{shop.id}</span>
                    </div>
                    <h2 className="m-0 break-words text-3xl font-bold text-white">{shop.name}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-slate-100">{optionalText(shop.description, "Chưa cập nhật mô tả cửa hàng.")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2">
            <InfoTile icon="pi pi-map-marker" label="Địa chỉ" value={optionalText(shop.addressText)} wide />
            <InfoTile icon="pi pi-phone" label="Số điện thoại" value={optionalText(shop.phone)} />
            <InfoTile icon="pi pi-envelope" label="Email" value={optionalText(shop.email)} />
            <InfoTile icon="pi pi-clock" label="Giờ hoạt động" value={`${optionalText(shop.openingHours, "--:--")} - ${optionalText(shop.closingHours, "--:--")}`} />
            <InfoTile icon="pi pi-facebook" label="Facebook" value={optionalText(shop.facebookUrl)} />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-slate-900">Vị trí cửa hàng</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="Vĩ độ" value={formatCoordinate(shop.lat)} />
              <Metric label="Kinh độ" value={formatCoordinate(shop.lng)} />
              <Metric label="Nguồn vị trí" value={locationSourceText(shop.locationSource)} />
              <Metric label="Độ chính xác" value={shop.locationAccuracyM ? `${shop.locationAccuracyM} m` : "Chưa cập nhật"} />
            </div>
            {canOpenMap && (
              <a
                href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm font-semibold text-[#214388] hover:bg-[#f8fafc]"
              >
                <i className="pi pi-map" />
                Xem trên bản đồ
              </a>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-slate-900">Hệ thống</h3>
            <div className="mt-4 space-y-3">
              <SystemRow icon="pi pi-calendar-plus" label="Ngày tạo" value={formatDateTimeViVN(shop.createdAt)} />
              <SystemRow icon="pi pi-history" label="Cập nhật lần cuối" value={formatDateTimeViVN(shop.updatedAt)} />
              <SystemRow icon="pi pi-shield" label="Trạng thái hệ thống" value={statusText(shop.status)} />
            </div>
          </section>
        </div>
      </div>

      <Dialog
        visible={Boolean(viewedImage)}
        onHide={() => setViewedImage(null)}
        header={viewedImage?.title}
        modal
        className="w-[min(92vw,56rem)]"
        contentClassName="!p-0"
      >
        {viewedImage && (
          <div className="flex max-h-[78vh] items-center justify-center bg-slate-950">
            <img src={viewedImage.url} alt={viewedImage.title} className="max-h-[78vh] max-w-full object-contain" />
          </div>
        )}
      </Dialog>

      <Dialog
        visible={Boolean(pendingImage)}
        onHide={closePendingImage}
        header={pendingImage?.target === "avatar" ? "Xem trước ảnh đại diện" : "Xem trước ảnh bìa"}
        modal
        className="w-[min(92vw,44rem)]"
        footer={
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              label="Hủy"
              disabled={isUploadingImage}
              onClick={closePendingImage}
              className="!m-0 !h-10 !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-medium !text-slate-700 hover:!bg-[#ecf1f8]"
            />
            <Button
              type="button"
              label="Lưu ảnh"
              icon="pi pi-save"
              loading={isUploadingImage}
              onClick={savePendingImage}
              className="!m-0 !h-10 !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
          </div>
        }
      >
        {pendingImage && (
          <div className="space-y-3">
            <div className="flex max-h-[62vh] items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              <img
                src={pendingPreviewUrl}
                alt={pendingImage.target === "avatar" ? "Xem trước ảnh đại diện" : "Xem trước ảnh bìa"}
                className={pendingImage.target === "avatar" ? "max-h-[58vh] max-w-full rounded-full object-cover" : "max-h-[62vh] max-w-full object-contain"}
              />
            </div>
            <p className="m-0 truncate text-center text-sm text-slate-500">{pendingImage.file.name}</p>
          </div>
        )}
      </Dialog>
    </>
  )
}

function InfoTile({ icon, label, value, wide = false }: { icon: string; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-[#f8fafc] p-4 ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <i className={icon} />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f8fafc] px-4 py-3">
      <p className="m-0 text-xs font-semibold text-slate-500">{label}</p>
      <p className="m-0 mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  )
}

function SystemRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#f8fafc] px-4 py-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
        <i className={icon} />
      </span>
      <div>
        <p className="m-0 text-xs text-slate-500">{label}</p>
        <p className="m-0 mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_.9fr]">
      <Skeleton height="30rem" borderRadius="12px" />
      <div className="space-y-4">
        <Skeleton height="14rem" borderRadius="12px" />
        <Skeleton height="14rem" borderRadius="12px" />
      </div>
    </div>
  )
}

function EmptyProfile() {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
      <i className="pi pi-building text-3xl text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-600">Chưa có hồ sơ cửa hàng</p>
    </div>
  )
}
