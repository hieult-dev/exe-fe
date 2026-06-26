import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Button } from "primereact/button"
import { Sidebar } from "primereact/sidebar"
import { Dialog } from "primereact/dialog"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dropdown } from "primereact/dropdown"
import { Image } from "primereact/image"
import { InputNumber } from "primereact/inputnumber"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { SidebarConfig } from "@/common/config/sidebar.config"
import { createServiceMultipart, getServiceCategories, getVaccines, updateServiceMultipart } from "@/apps/services/api/serviceApi"
import { ServiceCategoryManagerDialog } from "@/apps/services/components/ServiceCategoryManagerDialog"
import type { ServiceCategoryDTO, ServiceDTO, ServiceType, ServiceWriteRequest, VaccineDTO, VeterinaryServiceType } from "@/apps/services/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND } from "@/common/utils/format"
import { formatFileSize } from "@/common/utils/format"
import { getImageUrlOrNotFound, NOT_FOUND_IMAGE_URL } from "@/common/utils/url"

export type FormMode = "CREATE" | "EDIT" | "VIEW" | null
type ShopServiceFormProps = {
  mode: FormMode
  service: ServiceDTO | null
  shopId: number
  initialServiceType: ServiceType
  onClose: () => void
  onSaved: () => void
}

type ImagePreviewItem = {
  key: string
  file: File
  url: string
}

const veterinaryServiceTypeOptions: Array<{ label: string; value: VeterinaryServiceType }> = [
  { label: "Tiêm phòng", value: "VACCINATION" },
  { label: "Khám bệnh", value: "EXAMINATION" },
  { label: "Điều trị", value: "TREATMENT" },
  { label: "Xét nghiệm", value: "TEST" },
  { label: "Phẫu thuật", value: "SURGERY" },
  { label: "Tư vấn", value: "CONSULTATION" },
  { label: "Khác", value: "OTHER" },
]

const serviceTypeOptions: Array<{ label: string; value: ServiceType }> = [
  { label: "Dịch vụ Spa", value: "GENERAL" },
  { label: "Dịch vụ thú y", value: "VETERINARY" },
]

const serviceImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg", ".avif"]

const imagePreviewPassThrough = {
  button: { className: "!bg-[#214388]/25" },
  icon: { className: "!text-white" },
}

const ServiceSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên dịch vụ"),
  categoryId: z.number().nullable(),
  basePrice: z.number({ message: "Vui lòng nhập số hợp lệ" }).min(0, "Giá dịch vụ phải lớn hơn hoặc bằng 0"),
  durationMin: z.number({ message: "Vui lòng nhập số hợp lệ" }).min(1, "Thời gian thực hiện phải tối thiểu 1 phút"),
  active: z.boolean(),
  serviceType: z.enum(["GENERAL", "VETERINARY"]),
  veterinaryServiceType: z.enum(["VACCINATION", "EXAMINATION", "TREATMENT", "TEST", "SURGERY", "CONSULTATION", "OTHER"]).nullable(),
  vaccineId: z.number().nullable(),
  imageUrl: z.string().trim(),
  imageFile: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File && isServiceImageFile(value), {
    message: "Chỉ được chọn file ảnh.",
  }).nullable(),
}).superRefine((data, ctx) => {
  if (data.serviceType === "GENERAL") return

  if (!data.veterinaryServiceType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["veterinaryServiceType"],
      message: "Vui lòng chọn loại dịch vụ thú y",
    })
  }

  if (data.veterinaryServiceType === "VACCINATION" && !data.vaccineId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["vaccineId"],
      message: "Vui lòng nhập mã vaccine",
    })
  }
})

type ServiceFormValues = z.infer<typeof ServiceSchema>

const emptyForm: ServiceFormValues = {
  name: "",
  categoryId: null,
  basePrice: 0,
  durationMin: 30,
  active: true,
  serviceType: "GENERAL",
  veterinaryServiceType: null,
  vaccineId: null,
  imageUrl: "",
  imageFile: null,
}

function getImageFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function isServiceImageFile(file: File) {
  const mimeType = file.type.toLowerCase()
  if (mimeType.startsWith("image/")) return true

  const fileName = file.name.toLowerCase()
  return serviceImageExtensions.some((extension) => fileName.endsWith(extension))
}

function filterCategoriesByServiceType(categories: ServiceCategoryDTO[], serviceType: ServiceType) {
  return categories.filter(
    (category) =>
      typeof category.id === "number" &&
      category.active !== false &&
      (!category.serviceType || category.serviceType === serviceType),
  )
}

function findDefaultVeterinaryCategoryId(categories: ServiceCategoryDTO[], preferredCategoryId?: number | null) {
  const veterinaryCategories = filterCategoriesByServiceType(categories, "VETERINARY")
  if (preferredCategoryId !== null && preferredCategoryId !== undefined) {
    const existingCategory = veterinaryCategories.find((category) => category.id === preferredCategoryId)
    if (existingCategory?.id) return existingCategory.id
  }

  return veterinaryCategories[0]?.id ?? null
}
async function resolveVeterinaryCategoryId(
  currentCategories: ServiceCategoryDTO[],
  preferredCategoryId?: number | null,
) {
  const localCategoryId = findDefaultVeterinaryCategoryId(currentCategories, preferredCategoryId)
  if (localCategoryId) return localCategoryId

  const freshCategories = await getServiceCategories(true, "VETERINARY")
  return findDefaultVeterinaryCategoryId(freshCategories, preferredCategoryId)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

function serviceStatusLabel(isActive: boolean) {
  return isActive ? "Đang hoạt động" : "Tạm dừng"
}

function serviceStatusClass(isActive: boolean) {
  return isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
}

export function ShopServiceForm({ mode, service, shopId, initialServiceType, onClose, onSaved }: ShopServiceFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<ServiceCategoryDTO[]>([])
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [categoryError, setCategoryError] = useState("")
  const [vaccines, setVaccines] = useState<VaccineDTO[]>([])
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false)
  const [vaccineError, setVaccineError] = useState("")
  const [imagePreviewItem, setImagePreviewItem] = useState<ImagePreviewItem | null>(null)
  const [imageError, setImageError] = useState("")
  const sidebarTitle = mode === "EDIT" ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: { ...emptyForm, serviceType: initialServiceType },
  })

  const selectedServiceType = watch("serviceType")
  const selectedVeterinaryServiceType = watch("veterinaryServiceType")
  const selectedCategoryId = watch("categoryId")
  const selectedImageFile = watch("imageFile")
  const currentImageUrl = watch("imageUrl")
  const categoryPlaceholder = selectedServiceType ? "Chọn nhóm dịch vụ" : "Chọn phân loại dịch vụ trước"

  useEffect(() => {
    if (!selectedImageFile) {
      setImagePreviewItem(null)
      return
    }

    const previewItem = {
      key: getImageFileKey(selectedImageFile),
      file: selectedImageFile,
      url: URL.createObjectURL(selectedImageFile),
    }

    setImagePreviewItem(previewItem)

    return () => URL.revokeObjectURL(previewItem.url)
  }, [selectedImageFile])

  useEffect(() => {
    if (mode === "EDIT" && service) {
      reset({
        name: service.name,
        categoryId: service.categoryId ?? null,
        basePrice: service.basePrice,
        durationMin: service.durationMin,
        active: service.active,
        serviceType: service.serviceType,
        veterinaryServiceType: service.veterinaryServiceType ?? null,
        vaccineId: service.vaccineId ?? null,
        imageUrl: service.imageUrl ?? "",
        imageFile: null,
      })
      setImageError("")
    } else if (mode === "CREATE") {
      reset({ ...emptyForm, serviceType: initialServiceType })
      setImageError("")
    }
  }, [mode, service, initialServiceType, reset])

  useEffect(() => {
    if (selectedServiceType === "GENERAL") {
      setValue("veterinaryServiceType", null, { shouldValidate: true })
      setValue("vaccineId", null, { shouldValidate: true })
      return
    }

    if (selectedVeterinaryServiceType !== "VACCINATION") {
      setValue("vaccineId", null, { shouldValidate: true })
    }
  }, [selectedServiceType, selectedVeterinaryServiceType, setValue])

  useEffect(() => {
    if (mode !== "CREATE" && mode !== "EDIT") {
      return
    }

    if (!selectedServiceType) {
      setCategories([])
      setCategoryError("")
      setIsLoadingCategories(false)
      return
    }

    let isMounted = true
    setIsLoadingCategories(true)
    setCategoryError("")

    getServiceCategories(true, selectedServiceType)
      .then((result) => {
        if (!isMounted) return
        setCategories(filterCategoriesByServiceType(result, selectedServiceType))
      })
      .catch((err) => {
        if (!isMounted) return
        const message = getErrorMessage(err, "Không tải được danh sách nhóm dịch vụ.")
        setCategoryError(message)
        notify.error(message)
        console.error(err)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCategories(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [mode, selectedServiceType])

  useEffect(() => {
    if (mode !== "CREATE" && mode !== "EDIT") return
    if (selectedServiceType !== "VETERINARY") return
    if (isLoadingCategories || categories.length === 0) return

    const defaultCategoryId = findDefaultVeterinaryCategoryId(categories, selectedCategoryId ?? service?.categoryId ?? null)
    if (!defaultCategoryId || selectedCategoryId === defaultCategoryId) return

    setValue("categoryId", defaultCategoryId, { shouldDirty: false, shouldValidate: true })
  }, [categories, isLoadingCategories, mode, selectedCategoryId, selectedServiceType, service?.categoryId, setValue])

  useEffect(() => {
    if (mode !== "CREATE" && mode !== "EDIT") {
      return
    }

    if (selectedServiceType !== "VETERINARY" || selectedVeterinaryServiceType !== "VACCINATION") {
      return
    }

    let isMounted = true
    setIsLoadingVaccines(true)
    setVaccineError("")

    getVaccines()
      .then((result) => {
        if (!isMounted) return
        setVaccines(result)
      })
      .catch((err) => {
        if (!isMounted) return
        const message = getErrorMessage(err, "Không tải được danh sách vaccine.")
        setVaccineError(message)
        notify.error(message)
        console.error(err)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingVaccines(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [mode, selectedServiceType, selectedVeterinaryServiceType])

  const handleServiceTypeChange = (nextServiceType: ServiceType) => {
    setValue("serviceType", nextServiceType, { shouldDirty: true, shouldValidate: true })
    setValue("categoryId", null, { shouldDirty: true, shouldValidate: true })
    setValue("veterinaryServiceType", null, { shouldDirty: true, shouldValidate: true })
    setValue("vaccineId", null, { shouldDirty: true, shouldValidate: true })
    setCategories([])
    setCategoryError("")
  }

  const handleVeterinaryServiceTypeChange = (nextVeterinaryServiceType: VeterinaryServiceType | null) => {
    setValue("veterinaryServiceType", nextVeterinaryServiceType, { shouldDirty: true, shouldValidate: true })
    setValue("categoryId", null, { shouldDirty: true, shouldValidate: true })
    if (nextVeterinaryServiceType !== "VACCINATION") {
      setValue("vaccineId", null, { shouldDirty: true, shouldValidate: true })
    }

    const defaultCategoryId = findDefaultVeterinaryCategoryId(categories, selectedCategoryId)
    if (defaultCategoryId) {
      setValue("categoryId", defaultCategoryId, { shouldDirty: true, shouldValidate: true })
    }
  }

  const handleServiceCategoryChanged = async (category?: ServiceCategoryDTO) => {
    if (!selectedServiceType) return

    try {
      const nextCategories = await getServiceCategories(true, selectedServiceType)
      setCategories(filterCategoriesByServiceType(nextCategories, selectedServiceType))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh sách nhóm dịch vụ."))
    }

    if (!category?.active || category.serviceType !== selectedServiceType) return

    if (selectedServiceType === "GENERAL" && category.id) {
      setValue("categoryId", category.id, { shouldDirty: true, shouldValidate: true })
      return
    }

    if (category.id) {
      setValue("categoryId", category.id, { shouldDirty: true, shouldValidate: true })
    }
  }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    event.target.value = ""
    if (!file) return

    if (!isServiceImageFile(file)) {
      setImageError(`Chỉ được chọn file ảnh. File không hợp lệ: ${file.name}`)
      setValue("imageFile", null, { shouldDirty: true, shouldValidate: true })
      return
    }

    setImageError("")
    clearErrors("imageFile")
    setValue("imageFile", file, { shouldDirty: true, shouldValidate: true })
  }

  const removeSelectedImageFile = () => {
    setImageError("")
    clearErrors("imageFile")
    setValue("imageFile", null, { shouldDirty: true, shouldValidate: true })
  }

  const removeExistingImage = () => {
    setImageError("")
    setValue("imageUrl", "", { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const resolvedCategoryId =
        data.serviceType === "VETERINARY"
          ? await resolveVeterinaryCategoryId(categories, data.categoryId)
          : data.categoryId

      const payload: ServiceWriteRequest = {
        shopId: shopId,
        name: data.name,
        durationMin: data.durationMin,
        basePrice: data.basePrice,
        categoryId: resolvedCategoryId || null,
        active: data.active,
        serviceType: data.serviceType,
        veterinaryServiceType: data.serviceType === "VETERINARY" ? data.veterinaryServiceType : null,
        vaccineId: data.serviceType === "VETERINARY" && data.veterinaryServiceType === "VACCINATION" ? data.vaccineId : null,
        imageUrl: data.imageUrl || null,
        imageFile: data.imageFile,
      }

      if (mode === "EDIT" && service?.id) {
        await updateServiceMultipart(service.id, payload)
        notify.success("Cập nhật dịch vụ thành công!")
      } else if (mode === "CREATE") {
        await createServiceMultipart(payload)
        notify.success("Thêm dịch vụ thành công!")
      }
      onSaved()
    } catch (err) {
      const message = getErrorMessage(err, "Lỗi khi lưu dịch vụ. Vui lòng thử lại.")
      notify.error(message)
      console.error(err)
    }
  }

  // --- RENDERING ---
  if (mode === "VIEW" && service) {
    return (
      <Dialog
        visible={true}
        onHide={onClose}
        header="Chi tiết dịch vụ"
        style={{ width: '100%', maxWidth: '32rem' }}
        footer={
          <div className="mt-4 flex w-full justify-center">
            <Button
              type="button"
              label="Đóng"
              icon="pi pi-times"
              onClick={onClose}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
          </div>
        }
      >
        <div className="mb-4 text-sm text-[#73849b]">
          Thông tin chi tiết về dịch vụ đã chọn.
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Tên dịch vụ</p>
              <p className="text-sm text-slate-800 font-medium">{service.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Nhóm dịch vụ</p>
              <p className="text-sm text-slate-800 font-medium">{service.categoryName || service.category || (service.categoryId ? `#${service.categoryId}` : "---")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Giá dịch vụ</p>
              <p className="text-sm text-orange-600 font-bold">{formatCurrencyVND(service.basePrice)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Thời lượng</p>
              <p className="text-sm text-slate-800 font-medium">{service.durationMin} phút</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-500 mb-1">Phân loại dịch vụ</p>
              <p className="text-sm text-slate-800 font-medium">{service.serviceType === "VETERINARY" ? "Dịch vụ thú y" : "Dịch vụ Spa"}</p>
            </div>
            {service.serviceType === "VETERINARY" && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">Loại dịch vụ thú y</p>
                <p className="text-sm text-slate-800 font-medium">
                  {veterinaryServiceTypeOptions.find((option) => option.value === service.veterinaryServiceType)?.label || "---"}
                </p>
              </div>
            )}
            {service.veterinaryServiceType === "VACCINATION" && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">Vaccine</p>
                <p className="text-sm text-slate-800 font-medium">{service.vaccineName || (service.vaccineId ? `#${service.vaccineId}` : "---")}</p>
              </div>
            )}
            {service.imageUrl && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">Ảnh dịch vụ</p>
                <div className="h-40 overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
                  <Image
                    src={getImageUrlOrNotFound(service.imageUrl)}
                    alt={service.name}
                    preview
                    pt={imagePreviewPassThrough}
                    imageClassName="h-full w-full object-cover"
                    className="block h-full w-full [&_.p-image-preview-container]:!block [&_.p-image-preview-container]:!h-full [&_.p-image-preview-container]:!w-full"
                    onError={(event) => {
                      const image = event.target as HTMLImageElement
                      image.src = NOT_FOUND_IMAGE_URL
                    }}
                  />
                </div>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-500 mb-1">Trạng thái</p>
              <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${serviceStatusClass(service.active)}`}>
                {serviceStatusLabel(service.active)}
              </span>
            </div>
          </div>
        </div>
      </Dialog>
    )
  }

  // Create or Update Form
  return (
    <>
      <Sidebar
        visible={mode === "CREATE" || mode === "EDIT"}
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
              onClick={onClose}
              aria-label="Đóng form dịch vụ"
              icon="pi pi-arrow-left"
              className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !border-none !bg-[#fee2e2] !p-0 !text-[#b42318] hover:!bg-[#fecaca] [&_.p-button-icon]:!text-sm [&_.p-button-icon]:!text-[#b42318]"
            />
            <h2 className="text-xl font-bold text-[#24364d]">{sidebarTitle}</h2>
          </div>
          <p className="text-sm text-[#73849b] mt-1">
            Thiết lập giá, thời lượng và trạng thái hoạt động của dịch vụ.
          </p>
        </div>

        <form id="shop-service-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-y-auto pr-2 pb-20">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-700 block">
              <div className="mb-1">Tên dịch vụ <span className="text-red-500">*</span></div>
              <InputText
                {...register("name")}
                className={`w-full !rounded-lg !bg-[#f8fafc] !px-3 !py-2 !text-sm !outline-none ${errors.name ? '!border-red-500 focus:!bg-white' : '!border-transparent focus:!border-blue-500 focus:!bg-white'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </label>

            <label className="text-sm text-slate-700 block">
              <div className="mb-1">Giá dịch vụ (VND) <span className="text-red-500">*</span></div>
              <Controller
                name="basePrice"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    value={field.value}
                    onValueChange={(event) => field.onChange(event.value ?? 0)}
                    min={0}
                    locale="vi-VN"
                    className={`w-full [&_.p-inputtext]:!rounded-lg [&_.p-inputtext]:!bg-[#f8fafc] [&_.p-inputtext]:!px-3 [&_.p-inputtext]:!py-2 [&_.p-inputtext]:!text-sm ${errors.basePrice ? '[&_.p-inputtext]:!border-red-500' : '[&_.p-inputtext]:!border-transparent focus-within:[&_.p-inputtext]:!border-blue-500'}`}
                  />
                )}
              />
              {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>}
            </label>

            <label className="text-sm text-slate-700 block">
              <div className="mb-1">Thời gian thực hiện (phút) <span className="text-red-500">*</span></div>
              <Controller
                name="durationMin"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    value={field.value}
                    onValueChange={(event) => field.onChange(event.value ?? 0)}
                    min={1}
                    suffix=" phút"
                    className={`w-full [&_.p-inputtext]:!rounded-lg [&_.p-inputtext]:!bg-[#f8fafc] [&_.p-inputtext]:!px-3 [&_.p-inputtext]:!py-2 [&_.p-inputtext]:!text-sm ${errors.durationMin ? '[&_.p-inputtext]:!border-red-500' : '[&_.p-inputtext]:!border-transparent focus-within:[&_.p-inputtext]:!border-blue-500'}`}
                  />
                )}
              />
              {errors.durationMin && <p className="mt-1 text-xs text-red-500">{errors.durationMin.message}</p>}
            </label>

            <label className="text-sm text-slate-700 block">
              <div className="mb-1">Phân loại dịch vụ <span className="text-red-500">*</span></div>
              <Controller
                name="serviceType"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    value={field.value}
                    options={serviceTypeOptions}
                    onChange={(event) => handleServiceTypeChange(event.value)}
                    filter
                    filterBy="label"
                    filterPlaceholder="Tìm phân loại"
                    emptyFilterMessage="Không tìm thấy phân loại"
                    placeholder="Chọn phân loại"
                    className="w-full !rounded-lg !border-transparent !bg-[#f8fafc] !text-sm focus:!border-blue-500"
                  />
                )}
              />
            </label>

            {selectedServiceType === "VETERINARY" && (
              <label className="text-sm text-slate-700 block">
                <div className="mb-1">Loại dịch vụ thú y <span className="text-red-500">*</span></div>
                <Controller
                  name="veterinaryServiceType"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      <Dropdown
                        value={field.value}
                        options={veterinaryServiceTypeOptions}
                        onChange={(event) => handleVeterinaryServiceTypeChange(event.value)}
                        filter
                        filterBy="label"
                        filterPlaceholder="Tìm loại dịch vụ thú y"
                        emptyFilterMessage="Không tìm thấy loại dịch vụ thú y"
                        emptyMessage="Không có loại dịch vụ thú y"
                        placeholder="Chọn loại dịch vụ thú y"
                        className={`w-full !rounded-lg !bg-[#f8fafc] !text-sm ${errors.veterinaryServiceType ? '!border-red-500' : '!border-transparent focus:!border-blue-500'}`}
                      />
                      <Button
                        type="button"
                        icon="pi pi-plus"
                        aria-label="Quản lý nhóm dịch vụ thú y"
                        onClick={() => setIsCategoryManagerOpen(true)}
                        className="!m-0 !h-10 !w-10 !shrink-0 !rounded-lg !border-none !bg-[#214388] !p-0 !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white"
                      />
                    </div>
                  )}
                />
                {errors.veterinaryServiceType && <p className="mt-1 text-xs text-red-500">{errors.veterinaryServiceType.message}</p>}
              </label>
            )}

            {selectedServiceType !== "VETERINARY" && (
              <label className="text-sm text-slate-700 block">
                <div className="mb-1">Nhóm dịch vụ</div>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      <Dropdown
                        value={field.value}
                        options={categories.map((category) => ({ label: category.name, value: category.id }))}
                        onChange={(event) => field.onChange(event.value)}
                        disabled={!selectedServiceType || isLoadingCategories || categories.length === 0}
                        filter
                        filterBy="label"
                        filterPlaceholder="Tìm nhóm dịch vụ"
                        emptyFilterMessage="Không tìm thấy nhóm dịch vụ"
                        emptyMessage="Không có nhóm dịch vụ"
                        placeholder={categoryPlaceholder}
                        className={`w-full !rounded-lg !bg-[#f8fafc] !text-sm ${errors.categoryId ? '!border-red-500' : '!border-transparent focus:!border-blue-500'}`}
                      />
                      <Button
                        type="button"
                        icon="pi pi-plus"
                        aria-label="Quản lý nhóm dịch vụ"
                        onClick={() => setIsCategoryManagerOpen(true)}
                        className="!m-0 !h-10 !w-10 !shrink-0 !rounded-lg !border-none !bg-[#214388] !p-0 !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white"
                      />
                    </div>
                  )}
                />
                {isLoadingCategories && <p className="mt-1 text-xs text-slate-500">Đang tải nhóm dịch vụ...</p>}
                {!selectedServiceType && <p className="mt-1 text-xs text-slate-500">Chọn phân loại dịch vụ trước.</p>}
                {!isLoadingCategories && categoryError && <p className="mt-1 text-xs text-red-500">{categoryError}</p>}
                {selectedServiceType && !isLoadingCategories && !categoryError && categories.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">Chưa có nhóm dịch vụ hoạt động.</p>
                )}
              </label>
            )}

            {selectedServiceType === "VETERINARY" && isLoadingCategories && (
              <p className="text-xs text-slate-500">Đang xác định nhóm dịch vụ thú y...</p>
            )}

            {selectedServiceType === "VETERINARY" && categoryError && (
              <p className="text-xs text-red-500">{categoryError}</p>
            )}

            {selectedServiceType === "VETERINARY" && selectedVeterinaryServiceType === "VACCINATION" && (
              <label className="text-sm text-slate-700 block">
                <div className="mb-1">Vaccine <span className="text-red-500">*</span></div>
                <Controller
                  name="vaccineId"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      value={field.value}
                      options={vaccines.map((vaccine) => ({ label: vaccine.name, value: vaccine.id }))}
                      onChange={(event) => field.onChange(event.value)}
                      disabled={isLoadingVaccines || vaccines.length === 0}
                      filter
                      filterBy="label"
                      filterPlaceholder="Tìm vaccine"
                      emptyFilterMessage="Không tìm thấy vaccine"
                      emptyMessage="Không có vaccine"
                      placeholder="Chọn vaccine"
                      className={`w-full !rounded-lg !bg-[#f8fafc] !text-sm ${errors.vaccineId ? '!border-red-500' : '!border-transparent focus:!border-blue-500'}`}
                    />
                  )}
                />
                {isLoadingVaccines && <p className="mt-1 text-xs text-slate-500">Đang tải danh sách vaccine...</p>}
                {!isLoadingVaccines && vaccineError && <p className="mt-1 text-xs text-red-500">{vaccineError}</p>}
                {!isLoadingVaccines && !vaccineError && vaccines.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">Chưa có vaccine.</p>
                )}
                {errors.vaccineId && <p className="mt-1 text-xs text-red-500">{errors.vaccineId.message}</p>}
              </label>
            )}

            <div className="text-sm text-slate-700 md:col-span-2">
              <div className="mb-1">Ảnh dịch vụ</div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  icon="pi pi-upload"
                  label="Chọn ảnh"
                  onClick={() => imageInputRef.current?.click()}
                  className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#3b82f6] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#2563eb] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
                />
                <span className="text-xs text-[#73849b]">Chỉ nhận file ảnh. Ảnh mới chọn sẽ thay ảnh hiện có khi lưu.</span>
              </div>
              {(imageError || errors.imageFile?.message) && (
                <p className="mt-1 text-xs text-red-500">{imageError || errors.imageFile?.message}</p>
              )}

              {(currentImageUrl || imagePreviewItem) && (
                <div className="mt-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                  {currentImageUrl && (
                    <div className={imagePreviewItem ? "mb-4" : ""}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="m-0 text-xs font-semibold text-[#52657e]">Ảnh hiện có</p>
                        <Button
                          type="button"
                          label="Xóa ảnh hiện có"
                          icon="pi pi-trash"
                          text
                          onClick={removeExistingImage}
                          className="!m-0 !h-8 !p-0 !text-xs !font-semibold !text-rose-600 [&_.p-button-icon]:!text-xs [&_.p-button-icon]:!text-rose-600 [&_.p-button-label]:!text-rose-600"
                        />
                      </div>
                      <div className="max-w-56 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
                        <div className="relative h-32 bg-[#e8eef8]">
                          <Image
                            src={getImageUrlOrNotFound(currentImageUrl)}
                            alt="Ảnh dịch vụ hiện có"
                            preview
                            pt={imagePreviewPassThrough}
                            imageClassName="h-full w-full object-cover"
                            className="block h-full w-full [&_.p-image-preview-container]:!block [&_.p-image-preview-container]:!h-full [&_.p-image-preview-container]:!w-full"
                            onError={(event) => {
                              const image = event.target as HTMLImageElement
                              image.src = NOT_FOUND_IMAGE_URL
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {imagePreviewItem && (
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="m-0 text-xs font-semibold text-[#73849b]">Ảnh mới chọn</p>
                        <Button
                          type="button"
                          label="Xóa ảnh mới"
                          icon="pi pi-trash"
                          text
                          onClick={removeSelectedImageFile}
                          className="!m-0 !h-8 !p-0 !text-xs !font-semibold !text-rose-600 [&_.p-button-icon]:!text-xs [&_.p-button-icon]:!text-rose-600 [&_.p-button-label]:!text-rose-600"
                        />
                      </div>
                      <div className="max-w-56 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
                        <div className="relative h-32 bg-[#e8eef8]">
                          <Image
                            src={imagePreviewItem.url}
                            alt={imagePreviewItem.file.name}
                            preview
                            pt={imagePreviewPassThrough}
                            imageClassName="h-full w-full object-cover"
                            className="block h-full w-full [&_.p-image-preview-container]:!block [&_.p-image-preview-container]:!h-full [&_.p-image-preview-container]:!w-full"
                          />
                        </div>
                        <div className="p-2">
                          <p className="m-0 truncate text-xs font-semibold text-[#24364d]" title={imagePreviewItem.file.name}>
                            {imagePreviewItem.file.name}
                          </p>
                          <p className="m-0 mt-0.5 text-[11px] text-[#73849b]">{formatFileSize(imagePreviewItem.file.size)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <InputSwitch checked={field.value} onChange={(event) => field.onChange(event.value)} />
                )}
              />
              Kích hoạt dịch vụ sau khi lưu
            </label>
          </div>
        </form>

        <div className="mt-auto border-t border-[#e2e8f0] pt-4 flex items-center justify-center gap-3 bg-white pb-4">
          <Button
            type="button"
            label="Hủy"
            icon="pi pi-times"
            onClick={onClose}
            disabled={isSubmitting}
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-medium !text-slate-700 hover:!bg-[#ecf1f8]"
          />
          <Button
            type="submit"
            form="shop-service-form"
            disabled={isSubmitting || isLoadingCategories || categories.length === 0 || (selectedServiceType === "VETERINARY" && selectedVeterinaryServiceType === "VACCINATION" && (isLoadingVaccines || vaccines.length === 0))}
            label={isSubmitting ? "Đang lưu..." : (mode === "EDIT" ? "Lưu thay đổi" : "Tạo dịch vụ")}
            icon="pi pi-save"
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] disabled:!cursor-not-allowed disabled:!opacity-70 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
          />
        </div>
        </div>
      </Sidebar>

      <ServiceCategoryManagerDialog
        visible={isCategoryManagerOpen}
        serviceType={selectedServiceType}
        onHide={() => setIsCategoryManagerOpen(false)}
        onChanged={handleServiceCategoryChanged}
      />
    </>
  )
}
