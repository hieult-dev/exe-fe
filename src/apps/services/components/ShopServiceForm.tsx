import { useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Sidebar } from "primereact/sidebar"
import { Dialog } from "primereact/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SidebarConfig } from "@/common/config/sidebar.config"
import { createService, getServiceCategories, updateService } from "@/apps/services/api/serviceApi"
import type { ServiceCategoryDTO, ServiceDTO } from "@/apps/services/model"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND } from "@/common/utils/format"

export type FormMode = "CREATE" | "EDIT" | "VIEW" | null
type ShopServiceFormProps = {
  mode: FormMode
  service: ServiceDTO | null
  shopId: number
  onClose: () => void
  onSaved: () => void
}

const ServiceSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên dịch vụ"),
  categoryId: z.number({ message: "Vui lòng chọn nhóm dịch vụ" }).min(1, "Vui lòng chọn nhóm dịch vụ"),
  basePrice: z.number({ message: "Vui lòng nhập số hợp lệ" }).min(0, "Giá dịch vụ phải lớn hơn hoặc bằng 0"),
  durationMin: z.number({ message: "Vui lòng nhập số hợp lệ" }).min(1, "Thời gian thực hiện phải tối thiểu 1 phút"),
  active: z.boolean(),
})

type ServiceFormValues = z.infer<typeof ServiceSchema>

const emptyForm: ServiceFormValues = {
  name: "",
  categoryId: 0,
  basePrice: 0,
  durationMin: 30,
  active: true,
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

export function ShopServiceForm({ mode, service, shopId, onClose, onSaved }: ShopServiceFormProps) {
  const [categories, setCategories] = useState<ServiceCategoryDTO[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [categoryError, setCategoryError] = useState("")
  const sidebarTitle = mode === "EDIT" ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: emptyForm,
  })

  useEffect(() => {
    if (mode === "EDIT" && service) {
      reset({
        name: service.name,
        categoryId: service.categoryId ?? 0,
        basePrice: service.basePrice,
        durationMin: service.durationMin,
        active: service.active,
      })
    } else if (mode === "CREATE") {
      reset(emptyForm)
    }
  }, [mode, service, reset])

  useEffect(() => {
    if (mode !== "CREATE" && mode !== "EDIT") {
      return
    }

    let isMounted = true
    setIsLoadingCategories(true)
    setCategoryError("")

    getServiceCategories(true)
      .then((result) => {
        if (!isMounted) return
        setCategories(result.filter((category) => typeof category.id === "number"))
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
  }, [mode])

  useEffect(() => {
    if (mode !== "CREATE" && mode !== "EDIT") {
      return
    }

    const firstCategoryId = categories[0]?.id
    if (!firstCategoryId) {
      return
    }

    if (mode === "CREATE" || !service?.categoryId) {
      setValue("categoryId", firstCategoryId, { shouldValidate: true })
    }
  }, [categories, mode, service?.categoryId, setValue])

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const payload: ServiceDTO = {
        shopId: shopId,
        name: data.name,
        durationMin: data.durationMin,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        active: data.active,
      }

      if (mode === "EDIT" && service?.id) {
        await updateService(service.id, payload)
        notify.success("Cập nhật dịch vụ thành công!")
      } else if (mode === "CREATE") {
        await createService(payload)
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
              <p className="text-sm text-slate-800 font-medium">{service.category || (service.categoryId ? `#${service.categoryId}` : "---")}</p>
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
              <input
                type="text"
                {...register("name")}
                className={`w-full rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none border ${errors.name ? 'border-red-500 focus:bg-white' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </label>

            <label className="text-sm text-slate-700 block">
              <div className="mb-1">Nhóm dịch vụ <span className="text-red-500">*</span></div>
              <select
                {...register("categoryId", { valueAsNumber: true })}
                disabled={isLoadingCategories || categories.length === 0}
                className={`w-full rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none border ${errors.categoryId ? 'border-red-500 focus:bg-white' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {isLoadingCategories && <p className="mt-1 text-xs text-slate-500">Đang tải nhóm dịch vụ...</p>}
              {!isLoadingCategories && categoryError && <p className="mt-1 text-xs text-red-500">{categoryError}</p>}
              {!isLoadingCategories && !categoryError && categories.length === 0 && (
                <p className="mt-1 text-xs text-red-500">Chưa có nhóm dịch vụ hoạt động.</p>
              )}
              {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
            </label>

            <label className="text-sm text-slate-700 block">
              <div className="mb-1">Giá dịch vụ (VND) <span className="text-red-500">*</span></div>
              <input
                type="number"
                {...register("basePrice", { valueAsNumber: true })}
                className={`w-full rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none border ${errors.basePrice ? 'border-red-500 focus:bg-white' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
              />
              {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>}
            </label>

            <label className="text-sm text-slate-700 block">
              <div className="mb-1">Thời gian thực hiện (phút) <span className="text-red-500">*</span></div>
              <input
                type="number"
                {...register("durationMin", { valueAsNumber: true })}
                className={`w-full rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none border ${errors.durationMin ? 'border-red-500 focus:bg-white' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
              />
              {errors.durationMin && <p className="mt-1 text-xs text-red-500">{errors.durationMin.message}</p>}
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                {...register("active")}
                className="h-4 w-4 rounded"
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
            disabled={isSubmitting || isLoadingCategories || categories.length === 0}
            label={isSubmitting ? "Đang lưu..." : (mode === "EDIT" ? "Lưu thay đổi" : "Tạo dịch vụ")}
            icon="pi pi-save"
            className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] disabled:!cursor-not-allowed disabled:!opacity-70 [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
          />
        </div>
      </div>
    </Sidebar>
  )
}
