import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { Galleria } from "primereact/galleria"
import { Image } from "primereact/image"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { ProgressSpinner } from "primereact/progressspinner"
import { Sidebar } from "primereact/sidebar"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SidebarConfig } from "@/common/config/sidebar.config"
import { formatCurrencyVND, formatFileSize, formatVndInput, readVndAmount, toDigitsOnly } from "@/common/utils/format"
import { NOT_FOUND_IMAGE_URL, getImageUrlOrNotFound } from "@/common/utils/url"
import { createProduct, getProductById, getProductCategories, updateProductMultipart } from "@/apps/product/api/productApi"
import {
  PRODUCT_UNIT_OPTIONS,
  emptyProductForm,
  isProductImageFile,
  toProductForm,
  type ProductCategoryDTO,
  type ProductCreateRequest,
  type ProductDTO,
  type ProductFormState,
} from "@/apps/product/model"
import { notify } from "@/common/toast/ToastHelper"

export type ProductFormMode = "CREATE" | "EDIT" | "VIEW" | null
type ProductWriteMode = "CREATE" | "EDIT"

type FileUploadSelectLikeEvent = {
  files?: File[]
}

type ProductFormProps = {
  mode: ProductFormMode
  productId: number | null
  onClose: () => void
  onEdit: (id: number) => void
  onSaved: (product: ProductDTO, mode: ProductWriteMode) => void
}

type ImagePreviewItem = {
  key: string
  file: File
  url: string
}

type ProductDetailImage = {
  key: string
  src: string
  alt: string
}

const inputClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] px-3 py-2 text-sm text-[#24364d] outline-none focus:!border-[#d9e1eb] focus:!bg-white focus:!shadow-none focus:!ring-0"

const dropdownClassName =
  "w-full rounded-lg border border-transparent bg-[#f8fafc] text-sm shadow-none focus:!border-[#d9e1eb] focus:!shadow-none focus:!ring-0 [&.p-focus]:!border-[#d9e1eb] [&.p-focus]:!shadow-none [&_.p-dropdown-label]:px-3 [&_.p-dropdown-label]:py-2 [&_.p-dropdown-label]:text-sm [&_.p-dropdown-trigger]:w-10"

const detailGalleryResponsiveOptions = [{ breakpoint: "640px", numVisible: 3 }]

const previewActionButtonClassName =
  "!mx-1 !inline-flex !h-10 !w-10 !items-center !justify-center !rounded-full !border !border-sky-100 !bg-white !text-[#214388] !shadow-[0_8px_22px_rgba(15,23,42,0.18)] hover:!bg-[#eaf2ff] disabled:!cursor-not-allowed disabled:!opacity-40 [&_.p-icon]:!h-4 [&_.p-icon]:!w-4"

const previewCloseButtonClassName =
  "!mx-1 !inline-flex !h-10 !w-10 !items-center !justify-center !rounded-full !border !border-rose-100 !bg-white !text-rose-600 !shadow-[0_8px_22px_rgba(15,23,42,0.18)] hover:!bg-rose-50 [&_.p-icon]:!h-4 [&_.p-icon]:!w-4"

const imagePreviewPassThrough = {
  button: { className: "!bg-[#214388]/25" },
  icon: { className: "!text-white" },
  toolbar: {
    className: "!right-4 !top-4 rounded-full bg-white/75 p-1 shadow-[0_12px_30px_rgba(15,23,42,0.22)] backdrop-blur",
  },
  downloadButton: { className: previewActionButtonClassName },
  rotateRightButton: { className: previewActionButtonClassName },
  rotateLeftButton: { className: previewActionButtonClassName },
  zoomOutButton: { className: previewActionButtonClassName },
  zoomInButton: { className: previewActionButtonClassName },
  closeButton: { className: previewCloseButtonClassName },
}

const ProductFormSchema = z.object({
  categoryId: z.number().nullable().refine((value) => value !== null, "Vui lòng chọn danh mục."),
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm."),
  sku: z.string().trim().min(1, "Vui lòng nhập SKU."),
  unit: z.string().trim().min(1, "Vui lòng chọn đơn vị."),
  price: z.string().trim().min(1, "Vui lòng nhập giá bán.").refine((value) => {
    const numericValue = Number(value || 0)
    return !Number.isNaN(numericValue) && numericValue >= 0
  }, "Giá bán phải là số >= 0."),
  stockQty: z.string().trim().min(1, "Vui lòng nhập tồn kho.").refine((value) => {
    const numericValue = Number(value || 0)
    return !Number.isNaN(numericValue) && numericValue >= 0
  }, "Tồn kho phải là số >= 0."),
  imageUrls: z.array(z.string()),
  imageFiles: z.array(
    z.custom<File>((value) => typeof File !== "undefined" && value instanceof File && isProductImageFile(value), {
      message: "Chỉ được chọn file ảnh.",
    }),
  ),
  active: z.boolean(),
})

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function activeLabel(active: boolean) {
  return active ? "Đang kích hoạt" : "Tạm ẩn"
}

function activeClass(active: boolean) {
  return active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
}

function getImageFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function mergeImageFiles(currentFiles: File[], selectedFiles: File[]) {
  const fileMap = new Map<string, File>()

  currentFiles.forEach((file) => fileMap.set(getImageFileKey(file), file))
  selectedFiles.forEach((file) => fileMap.set(getImageFileKey(file), file))

  return Array.from(fileMap.values())
}

function areStringArraysEqual(first: string[], second: string[]) {
  return first.length === second.length && first.every((value, index) => value === second[index])
}

export function ProductForm({ mode, productId, onClose, onEdit, onSaved }: ProductFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [product, setProduct] = useState<ProductDTO | null>(null)
  const [categories, setCategories] = useState<ProductCategoryDTO[]>([])
  const [imagePreviewItems, setImagePreviewItems] = useState<ImagePreviewItem[]>([])
  const [formError, setFormError] = useState("")
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const {
    clearErrors,
    handleSubmit: submitForm,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormState>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: emptyProductForm,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const isFormMode = mode === "CREATE" || mode === "EDIT"
  const formState = watch()
  const totalFormImages = formState.imageUrls.length + imagePreviewItems.length

  useEffect(() => {
    if (mode === null) {
      setProduct(null)
      reset(emptyProductForm)
      setFormError("")
      return
    }

    if (mode === "CREATE") {
      setProduct(null)
      reset(emptyProductForm)
      setFormError("")
      loadCategories()
      return
    }

    if (!productId) return

    if (mode === "EDIT") {
      setFormError("")
      setIsLoadingDetail(true)
      Promise.all([getProductById(productId), loadCategories()])
        .then(([freshProduct]) => {
          setProduct(freshProduct)
          reset(toProductForm(freshProduct))
        })
        .catch((error) => {
          const message = getErrorMessage(error, "Không tải được thông tin sản phẩm.")
          setFormError(message)
          notify.error(message)
        })
        .finally(() => setIsLoadingDetail(false))
      return
    }

    if (mode === "VIEW") {
      setFormError("")
      setIsLoadingDetail(true)
      getProductById(productId)
        .then(setProduct)
        .catch((error) => {
          const message = getErrorMessage(error, "Không tải được chi tiết sản phẩm.")
          setFormError(message)
          notify.error(message)
        })
        .finally(() => setIsLoadingDetail(false))
    }
  }, [mode, productId, reset])

  useEffect(() => {
    const previewItems = formState.imageFiles.map((file) => ({
      key: getImageFileKey(file),
      file,
      url: URL.createObjectURL(file),
    }))

    setImagePreviewItems(previewItems)

    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [formState.imageFiles])

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const result = await getProductCategories(true)
      setCategories(result)
    } catch (error) {
      const message = getErrorMessage(error, "Không tải được danh mục sản phẩm.")
      setFormError(message)
      notify.error(message)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const updateForm = (patch: Partial<ProductFormState>, shouldValidate = true) => {
    if ("categoryId" in patch) setValue("categoryId", patch.categoryId ?? null, { shouldDirty: true, shouldValidate })
    if ("name" in patch) setValue("name", patch.name ?? "", { shouldDirty: true, shouldValidate })
    if ("sku" in patch) setValue("sku", patch.sku ?? "", { shouldDirty: true, shouldValidate })
    if ("unit" in patch) setValue("unit", patch.unit ?? "", { shouldDirty: true, shouldValidate })
    if ("price" in patch) setValue("price", patch.price ?? "", { shouldDirty: true, shouldValidate })
    if ("stockQty" in patch) setValue("stockQty", patch.stockQty ?? "", { shouldDirty: true, shouldValidate })
    if ("imageUrls" in patch) setValue("imageUrls", patch.imageUrls ?? [], { shouldDirty: true, shouldValidate })
    if ("imageFiles" in patch) setValue("imageFiles", patch.imageFiles ?? [], { shouldDirty: true, shouldValidate })
    if ("active" in patch) setValue("active", patch.active ?? true, { shouldDirty: true, shouldValidate })
  }

  const getSelectedFiles = (event: FileUploadSelectLikeEvent) => {
    return Array.from(event.files ?? [])
  }

  const handleImageSelect = (files: File[]) => {
    if (files.length === 0) return

    const invalidFiles = files.filter((file) => !isProductImageFile(file))
    const imageFiles = mergeImageFiles(formState.imageFiles, files.filter(isProductImageFile))

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((file) => file.name).join(", ")
      setFormError(`Chỉ được chọn file ảnh. File không hợp lệ: ${invalidFileNames}`)
      updateForm({ imageFiles })
      return
    }

    setFormError("")
    clearErrors("imageFiles")
    updateForm({ imageFiles })
  }

  const handleNativeImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(getSelectedFiles({ files: Array.from(event.target.files ?? []) }))
    event.target.value = ""
  }

  const removeImageFile = (fileKey: string) => {
    setFormError("")
    clearErrors("imageFiles")
    updateForm({
      imageFiles: formState.imageFiles.filter((file) => getImageFileKey(file) !== fileKey),
    })
  }

  const removeExistingImageUrl = (imageIndex: number) => {
    setFormError("")
    clearErrors("imageUrls")
    updateForm({
      imageUrls: formState.imageUrls.filter((_, index) => index !== imageIndex),
    })
  }

  const clearImageFiles = () => {
    setFormError("")
    clearErrors("imageFiles")
    updateForm({ imageFiles: [] })
  }

  const handlePriceChange = (value: string) => {
    updateForm({ price: toDigitsOnly(value) })
  }

  const buildProductRequest = (values: ProductFormState): ProductCreateRequest => {
    const name = values.name.trim()
    const sku = values.sku.trim().toUpperCase()
    const unit = values.unit.trim()
    const price = Number(values.price || 0)
    const stockQty = Number(values.stockQty || 0)

    const initialImageUrls = (product?.imageUrls ?? []).filter((imageUrl): imageUrl is string => Boolean(imageUrl?.trim()))
    const hasImageUrlChanges = mode === "EDIT" && !areStringArraysEqual(values.imageUrls, initialImageUrls)
    const hasImageFileChanges = values.imageFiles.length > 0
    const shouldSendImageState =
      mode === "CREATE" ? values.imageUrls.length > 0 || hasImageFileChanges : hasImageUrlChanges || hasImageFileChanges

    const request: ProductCreateRequest = {
      categoryId: values.categoryId,
      sku,
      name,
      unit,
      price,
      active: values.active,
      stockQty,
    }

    if (shouldSendImageState) {
      request.imageUrls = values.imageUrls
      request.imageFiles = values.imageFiles
    }

    if (mode === "EDIT" && shouldSendImageState) {
      request.replaceImages = true
    }

    return request
  }

  const handleSubmit = async (values: ProductFormState) => {
    if (mode !== "CREATE" && mode !== "EDIT") return

    setFormError("")
    const request = buildProductRequest(values)

    setIsSaving(true)
    try {
      const savedProduct =
        mode === "EDIT" && productId
          ? await updateProductMultipart(productId, request)
          : await createProduct(request)

      notify.success(mode === "EDIT" ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm.")
      onSaved(savedProduct, mode)
    } catch (error) {
      notify.error(getErrorMessage(error, mode === "EDIT" ? "Không cập nhật được sản phẩm." : "Không tạo được sản phẩm."))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog
        visible={mode === "VIEW"}
        onHide={onClose}
        header={product ? `Chi tiết sản phẩm ${product.sku}` : "Chi tiết sản phẩm"}
        style={{ width: "100%", maxWidth: "42rem" }}
        footer={
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Đóng"
              onClick={onClose}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-medium !text-slate-700 hover:!bg-[#ecf1f8]"
            />
            {product && (
              <Button
                type="button"
                label="Chỉnh sửa"
                icon="pi pi-pencil"
                onClick={() => onEdit(product.id)}
                className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
              />
            )}
          </div>
        }
      >
        {renderDetailContent()}
      </Dialog>

      <Sidebar
        visible={isFormMode}
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
                aria-label="Đóng form sản phẩm"
                onClick={onClose}
                className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !border-none !bg-[#fee2e2] !p-0 !text-[#b42318] hover:!bg-[#fecaca] [&_.p-button-icon]:!text-sm [&_.p-button-icon]:!text-[#b42318]"
              />
              <h2 className="m-0 text-xl font-bold text-[#24364d]">{mode === "EDIT" ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
            </div>
            <p className="mt-1 text-sm text-[#73849b]">Thiết lập danh mục, giá bán, tồn kho và ảnh sản phẩm.</p>
          </div>

          {isLoadingDetail ? (
            <div className="flex flex-1 items-center justify-center">
              <ProgressSpinner style={{ width: "2.5rem", height: "2.5rem" }} />
            </div>
          ) : (
            <form id="shop-product-form" onSubmit={submitForm(handleSubmit)} className="flex-1 space-y-4 overflow-y-auto pb-20 pr-2">
              {formError && <div className="rounded-lg bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Tên sản phẩm" required error={errors.name?.message}>
                  <InputText value={formState.name} onChange={(event) => updateForm({ name: event.target.value })} className={inputClassName} />
                </FormField>

                <FormField label="Danh mục" required error={errors.categoryId?.message}>
                  <Dropdown
                    value={formState.categoryId}
                    options={categories}
                    optionLabel="name"
                    optionValue="id"
                    showClear
                    filter
                    filterBy="name"
                    emptyFilterMessage="Không tìm thấy danh mục"
                    loading={isLoadingCategories}
                    onChange={(event) => updateForm({ categoryId: event.value ?? null })}
                    className={dropdownClassName}
                  />
                </FormField>

                <FormField label="SKU (mã sản phẩm)" required error={errors.sku?.message}>
                  <InputText value={formState.sku} onChange={(event) => updateForm({ sku: event.target.value })} className={inputClassName} />
                </FormField>

                <FormField label="Đơn vị" required error={errors.unit?.message}>
                  <Dropdown
                    value={formState.unit}
                    options={PRODUCT_UNIT_OPTIONS}
                    filter
                    filterBy="label,value"
                    emptyFilterMessage="Không tìm thấy đơn vị"
                    onChange={(event) => updateForm({ unit: event.value ?? "" })}
                    className={dropdownClassName}
                  />
                </FormField>

                <FormField label="Giá bán (VND)" required error={errors.price?.message}>
                  <InputText
                    inputMode="numeric"
                    value={formatVndInput(formState.price)}
                    onChange={(event) => handlePriceChange(event.target.value)}
                    className={inputClassName}
                  />
                  <p className="mt-1 text-xs italic text-[#73849b]">Bằng chữ: {readVndAmount(formState.price)}</p>
                </FormField>

                <FormField label="Tồn kho" required error={errors.stockQty?.message}>
                  <InputText
                    type="number"
                    min="0"
                    value={formState.stockQty}
                    onChange={(event) => updateForm({ stockQty: event.target.value })}
                    className={inputClassName}
                  />
                </FormField>

                <div className="flex items-center gap-3 text-sm text-slate-700 md:col-span-2">
                  <InputSwitch
                    inputId="product-active"
                    checked={formState.active}
                    onChange={(event) => updateForm({ active: Boolean(event.value) })}
                    className="[&.p-inputswitch-checked_.p-inputswitch-slider]:!bg-[#214388]"
                  />
                  <label htmlFor="product-active" className="m-0">
                    Kích hoạt sản phẩm
                    <span className="ml-2 text-xs font-semibold text-[#73849b]">{formState.active ? "Bật" : "Tắt"}</span>
                  </label>
                </div>

                <FormField label="Ảnh tải lên" className="md:col-span-2" error={errors.imageFiles?.message}>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleNativeImageSelect}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      icon="pi pi-upload"
                      label="Chọn ảnh"
                      onClick={() => imageInputRef.current?.click()}
                      className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#3b82f6] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#2563eb] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
                    />
                    <span className="text-xs text-[#73849b]">Chỉ nhận file ảnh. Có thể chọn nhiều ảnh cùng lúc.</span>
                  </div>

                  {totalFormImages > 0 && (
                    <div className="mt-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#52657e]">Đang có {totalFormImages} ảnh</span>
                        {imagePreviewItems.length > 0 && (
                          <Button
                            type="button"
                            label="Xóa ảnh mới"
                            icon="pi pi-trash"
                            text
                            onClick={clearImageFiles}
                            className="!m-0 !h-8 !p-0 !text-xs !font-semibold !text-rose-600 [&_.p-button-icon]:!text-xs [&_.p-button-icon]:!text-rose-600 [&_.p-button-label]:!text-rose-600"
                          />
                        )}
                      </div>

                      {formState.imageUrls.length > 0 && (
                        <div className={imagePreviewItems.length > 0 ? "mb-4" : ""}>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {formState.imageUrls.map((imageUrl, index) => (
                              <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
                                <div className="relative h-32 bg-[#e8eef8]">
                                  <Image
                                    src={getImageUrlOrNotFound(imageUrl)}
                                    alt={`Ảnh hiện có ${index + 1}`}
                                    preview
                                    onError={(event) => {
                                      const image = event.target as HTMLImageElement
                                      image.src = NOT_FOUND_IMAGE_URL
                                    }}
                                    pt={imagePreviewPassThrough}
                                    imageClassName="h-full w-full object-cover"
                                    className="block h-full w-full [&_.p-image-preview-container]:!block [&_.p-image-preview-container]:!h-full [&_.p-image-preview-container]:!w-full"
                                  />
                                  <Button
                                    type="button"
                                    icon="pi pi-times"
                                    aria-label={`Xóa ảnh hiện có ${index + 1}`}
                                    onClick={() => removeExistingImageUrl(index)}
                                    className="!absolute !right-1.5 !top-1.5 !z-10 !m-0 !flex !h-7 !w-7 !items-center !justify-center !rounded-full !border-none !bg-white/90 !p-0 !text-rose-600 hover:!bg-white [&_.p-button-icon]:!text-xs [&_.p-button-icon]:!text-rose-600"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {imagePreviewItems.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold text-[#73849b]">Ảnh mới chọn</p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {imagePreviewItems.map((item) => (
                              <div key={item.key} className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
                                <div className="relative h-28 bg-[#e8eef8]">
                                  <Image
                                    src={item.url}
                                    alt={item.file.name}
                                    preview
                                    pt={imagePreviewPassThrough}
                                    imageClassName="h-full w-full object-cover"
                                    className="block h-full w-full [&_.p-image-preview-container]:!block [&_.p-image-preview-container]:!h-full [&_.p-image-preview-container]:!w-full"
                                  />
                                  <Button
                                    type="button"
                                    icon="pi pi-times"
                                    aria-label={`Xóa ảnh ${item.file.name}`}
                                    onClick={() => removeImageFile(item.key)}
                                    className="!absolute !right-1.5 !top-1.5 !z-10 !m-0 !flex !h-7 !w-7 !items-center !justify-center !rounded-full !border-none !bg-white/90 !p-0 !text-rose-600 hover:!bg-white [&_.p-button-icon]:!text-xs [&_.p-button-icon]:!text-rose-600"
                                  />
                                </div>
                                <div className="p-2">
                                  <p className="m-0 truncate text-xs font-semibold text-[#24364d]" title={item.file.name}>
                                    {item.file.name}
                                  </p>
                                  <p className="m-0 mt-0.5 text-[11px] text-[#73849b]">{formatFileSize(item.file.size)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </FormField>
              </div>
            </form>
          )}

          <div className="mt-auto flex items-center justify-center gap-3 border-t border-[#e2e8f0] bg-white pb-4 pt-4">
            <Button
              type="button"
              label="Hủy"
              onClick={onClose}
              disabled={isSaving}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#f4f7fb] !px-4 !py-0 !text-sm !font-medium !text-slate-700 hover:!bg-[#ecf1f8]"
            />
            <Button
              type="submit"
              form="shop-product-form"
              label={mode === "EDIT" ? "Lưu thay đổi" : "Tạo sản phẩm"}
              loading={isSaving}
              disabled={isLoadingDetail}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] disabled:!cursor-not-allowed disabled:!opacity-70 [&_.p-button-label]:!text-white"
            />
          </div>
        </div>
      </Sidebar>
    </>
  )

  function renderDetailContent() {
    if (isLoadingDetail) {
      return (
        <div className="flex h-40 items-center justify-center">
          <ProgressSpinner style={{ width: "2.5rem", height: "2.5rem" }} />
        </div>
      )
    }

    if (formError) {
      return <div className="rounded-lg bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>
    }

    if (!product) {
      return <p className="m-0 text-sm text-[#73849b]">Không có dữ liệu sản phẩm.</p>
    }

    const existingImageUrls = (product.imageUrls ?? []).filter((imageUrl): imageUrl is string => Boolean(imageUrl?.trim()))
    const detailImages = (existingImageUrls.length > 0 ? existingImageUrls : [null]).map((imageUrl, index) => ({
      key: `${imageUrl ?? "not-found"}-${index}`,
      src: getImageUrlOrNotFound(imageUrl),
      alt: `${product.name} ${index + 1}`,
    }))

    const renderGalleryItem = (image: ProductDetailImage) => (
      <div className="flex h-64 w-full items-center justify-center bg-[#f8fafc] sm:h-72">
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-full max-w-full object-contain"
          onError={(event) => {
            event.currentTarget.src = NOT_FOUND_IMAGE_URL
          }}
        />
      </div>
    )

    const renderGalleryThumbnail = (image: ProductDetailImage) => (
      <img
        src={image.src}
        alt={image.alt}
        className="h-14 w-14 rounded-lg border border-[#e2e8f0] object-cover sm:h-16 sm:w-16"
        onError={(event) => {
          event.currentTarget.src = NOT_FOUND_IMAGE_URL
        }}
      />
    )

    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <InfoItem label="Tên sản phẩm" value={product.name} />
          <InfoItem label="SKU" value={product.sku} />
          <InfoItem label="Danh mục" value={product.categoryName ?? "—"} />
          <InfoItem label="Đơn vị" value={product.unit || "—"} />
          <InfoItem label="Giá bán" value={formatCurrencyVND(product.price)} highlight />
          <InfoItem label="Tồn kho" value={String(product.stockQty)} />
          <StatusItem label="Kích hoạt" value={activeLabel(product.active)} className={activeClass(product.active)} />
        </div>

        <section className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="m-0 text-sm font-semibold text-[#24364d]">Ảnh sản phẩm</h3>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#73849b]">
              {existingImageUrls.length > 0 ? `${detailImages.length} ảnh` : "Ảnh mặc định"}
            </span>
          </div>
          <Galleria
            value={detailImages}
            item={renderGalleryItem}
            thumbnail={renderGalleryThumbnail}
            numVisible={4}
            responsiveOptions={detailGalleryResponsiveOptions}
            circular={detailImages.length > 1}
            showItemNavigators={detailImages.length > 1}
            showItemNavigatorsOnHover={detailImages.length > 1}
            showThumbnailNavigators={detailImages.length > 4}
            thumbnailsPosition="bottom"
            className="overflow-hidden rounded-xl bg-white [&_.p-galleria-item-wrapper]:rounded-xl [&_.p-galleria-thumbnail-container]:!bg-white [&_.p-galleria-thumbnail-container]:!px-2 [&_.p-galleria-thumbnail-container]:!py-3"
          />
        </section>
      </div>
    )
  }
}

type FormFieldProps = {
  label: string
  required?: boolean
  className?: string
  error?: string
  children: ReactNode
}

function FormField({ label, required, className = "", error, children }: FormFieldProps) {
  return (
    <label className={`block text-sm text-slate-700 ${className}`}>
      <div className="mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </label>
  )
}

function InfoItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
      <p className="mb-1 text-xs font-semibold uppercase text-[#94a3b8]">{label}</p>
      <p className={`m-0 text-sm font-semibold ${highlight ? "text-[#ef5c2c]" : "text-[#24364d]"}`}>{value}</p>
    </div>
  )
}

function StatusItem({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-[#94a3b8]">{label}</p>
      <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${className}`}>{value}</span>
    </div>
  )
}
