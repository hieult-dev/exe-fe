import { useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import {
  createServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  updateServiceCategory,
} from "@/apps/services/api/serviceApi"
import type { ServiceCategoryDTO, ServiceCategoryWriteRequest, ServiceType } from "@/apps/services/model"
import { notify } from "@/common/toast/ToastHelper"

type ServiceCategoryManagerDialogProps = {
  visible: boolean
  serviceType: ServiceType
  onHide: () => void
  onChanged: (category?: ServiceCategoryDTO) => void
}

const serviceTypeOptions: Array<{ label: string; value: ServiceType }> = [
  { label: "Dịch vụ Spa", value: "GENERAL" },
  { label: "Dịch vụ thú y", value: "VETERINARY" },
]

function createEmptyForm(serviceType: ServiceType): ServiceCategoryWriteRequest {
  return {
    name: "",
    description: "",
    active: true,
    sortOrder: 10,
    serviceType,
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export function ServiceCategoryManagerDialog({ visible, serviceType, onHide, onChanged }: ServiceCategoryManagerDialogProps) {
  const [categories, setCategories] = useState<ServiceCategoryDTO[]>([])
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryDTO | null>(null)
  const [form, setForm] = useState<ServiceCategoryWriteRequest>(() => createEmptyForm(serviceType))
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadCategories = async (nextServiceType = form.serviceType) => {
    setIsLoading(true)
    try {
      setCategories(await getServiceCategories(true, nextServiceType))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được nhóm dịch vụ."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!visible) return
    const nextForm = createEmptyForm(serviceType)
    setEditingCategory(null)
    setForm(nextForm)
    loadCategories(serviceType)
  }, [visible, serviceType])

  const startEdit = (category: ServiceCategoryDTO) => {
    const nextServiceType = category.serviceType ?? serviceType
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description ?? "",
      active: category.active ?? true,
      sortOrder: category.sortOrder ?? 10,
      serviceType: nextServiceType,
    })
  }

  const resetForm = () => {
    setEditingCategory(null)
    setForm(createEmptyForm(serviceType))
  }

  const saveCategory = async () => {
    if (!form.name.trim()) {
      notify.error("Vui lòng nhập tên nhóm dịch vụ.")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
      }
      const savedCategory = editingCategory?.id
        ? await updateServiceCategory(editingCategory.id, payload)
        : await createServiceCategory(payload)

      notify.success(editingCategory ? "Đã cập nhật nhóm dịch vụ." : "Đã tạo nhóm dịch vụ.")
      resetForm()
      await loadCategories(payload.serviceType)
      onChanged(savedCategory)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không lưu được nhóm dịch vụ."))
    } finally {
      setIsSaving(false)
    }
  }

  const removeCategory = async (category: ServiceCategoryDTO) => {
    if (!category.id) return
    setDeletingId(category.id)
    try {
      await deleteServiceCategory(category.id)
      notify.success("Đã xóa nhóm dịch vụ.")
      await loadCategories()
      onChanged()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không xóa được nhóm dịch vụ."))
    } finally {
      setDeletingId(null)
    }
  }

  const changeServiceType = (nextServiceType: ServiceType) => {
    setForm((prev) => ({ ...prev, serviceType: nextServiceType }))
    loadCategories(nextServiceType)
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Quản lý nhóm dịch vụ"
      style={{ width: "100%", maxWidth: "50rem" }}
      className="[&_.p-dialog-content]:!bg-[#f6f8fb] [&_.p-dialog-content]:!pb-4 [&_.p-dialog-header]:!border-0"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),18rem]">
        <div className="overflow-hidden rounded-xl border border-[#dbe5f2] bg-white shadow-sm">
          <DataTable
            value={categories}
            loading={isLoading}
            size="small"
            dataKey="id"
            emptyMessage="Chưa có nhóm dịch vụ."
            rowHover
            stripedRows
            className="[&_.p-datatable-thead>tr>th]:!bg-[#f1f5f9] [&_.p-datatable-thead>tr>th]:!text-[#24364d]"
          >
            <Column field="name" header="Tên nhóm" />
            <Column
              field="sortOrder"
              header="Thứ tự"
              style={{ width: "5rem" }}
              alignHeader="center"
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              header="Thao tác"
              style={{ width: "8rem" }}
              alignHeader="center"
              bodyStyle={{ textAlign: "center" }}
              body={(category: ServiceCategoryDTO) => (
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    icon="pi pi-pencil"
                    onClick={() => startEdit(category)}
                    aria-label="Sửa nhóm dịch vụ"
                    className="!m-0 !h-8 !w-8 !rounded-lg !border-none !bg-[#eaf2ff] !p-0 !text-[#214388] hover:!bg-[#d8e8ff] [&_.p-button-icon]:!text-[#214388]"
                  />
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    loading={deletingId === category.id}
                    onClick={() => removeCategory(category)}
                    aria-label="Xóa nhóm dịch vụ"
                    className="!m-0 !h-8 !w-8 !rounded-lg !border-none !bg-[#fee2e2] !p-0 !text-[#b42318] hover:!bg-[#fecaca] [&_.p-button-icon]:!text-[#b42318]"
                  />
                </div>
              )}
            />
          </DataTable>
        </div>

        <div className="space-y-3 rounded-xl border border-[#dbe5f2] bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-[#eef5ff] px-3 py-2">
            <p className="m-0 text-sm font-bold text-[#214388]">{editingCategory ? "Cập nhật nhóm" : "Thêm nhóm"}</p>
          </div>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block">Phân loại</span>
            <Dropdown
              value={form.serviceType}
              options={serviceTypeOptions}
              onChange={(event) => changeServiceType(event.value)}
              className="w-full !rounded-lg !border-transparent !bg-[#f8fafc]"
              disabled={Boolean(editingCategory)}
            />
          </label>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block">Tên nhóm</span>
            <InputText value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full !h-10 !rounded-lg !border-transparent !bg-[#f8fafc] !px-3 !py-2" />
          </label>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block">Mô tả</span>
            <InputTextarea
              value={form.description ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="w-full !rounded-lg !border-transparent !bg-[#f8fafc] !px-3 !py-2"
            />
          </label>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block">Thứ tự</span>
            <InputNumber value={form.sortOrder} onValueChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.value ?? 0 }))} className="w-full [&_.p-inputtext]:!h-10 [&_.p-inputtext]:!rounded-lg [&_.p-inputtext]:!border-transparent [&_.p-inputtext]:!bg-[#f8fafc] [&_.p-inputtext]:!px-3 [&_.p-inputtext]:!py-2" />
          </label>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <InputSwitch checked={form.active} onChange={(event) => setForm((prev) => ({ ...prev, active: Boolean(event.value) }))} />
            Đang hoạt động
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <Button
              type="button"
              label="Làm mới"
              icon="pi pi-refresh"
              onClick={resetForm}
              className="!m-0 !h-10 !rounded-lg !border-none !bg-[#edf2f7] !px-4 !text-[#40526b] hover:!bg-[#e2e8f0] [&_.p-button-icon]:!text-[#40526b] [&_.p-button-label]:!text-[#40526b]"
            />
            <Button
              type="button"
              label={editingCategory ? "Lưu" : "Thêm"}
              icon="pi pi-save"
              loading={isSaving}
              onClick={saveCategory}
              className="!m-0 !h-10 !rounded-lg !border-none !bg-[#214388] !px-4 !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
