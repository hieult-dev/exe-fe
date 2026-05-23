import { useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { InputNumber } from "primereact/inputnumber"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { createProductCategory, deleteProductCategory, getProductCategories, updateProductCategory } from "@/apps/product/api/productApi"
import type { ProductCategoryDTO, ProductCategoryWriteRequest } from "@/apps/product/model"
import { notify } from "@/common/toast/ToastHelper"

type ProductCategoryManagerDialogProps = {
  visible: boolean
  onHide: () => void
  onChanged: (category?: ProductCategoryDTO) => void
}

const emptyForm: ProductCategoryWriteRequest = {
  name: "",
  description: "",
  active: true,
  sortOrder: 10,
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export function ProductCategoryManagerDialog({ visible, onHide, onChanged }: ProductCategoryManagerDialogProps) {
  const [categories, setCategories] = useState<ProductCategoryDTO[]>([])
  const [editingCategory, setEditingCategory] = useState<ProductCategoryDTO | null>(null)
  const [form, setForm] = useState<ProductCategoryWriteRequest>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      setCategories(await getProductCategories(true))
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh mục sản phẩm."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!visible) return
    setEditingCategory(null)
    setForm(emptyForm)
    loadCategories()
  }, [visible])

  const startEdit = (category: ProductCategoryDTO) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description ?? "",
      active: category.active,
      sortOrder: category.sortOrder,
    })
  }

  const resetForm = () => {
    setEditingCategory(null)
    setForm(emptyForm)
  }

  const saveCategory = async () => {
    if (!form.name.trim()) {
      notify.error("Vui lòng nhập tên danh mục.")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
      }
      const savedCategory = editingCategory
        ? await updateProductCategory(editingCategory.id, payload)
        : await createProductCategory(payload)

      notify.success(editingCategory ? "Đã cập nhật danh mục sản phẩm." : "Đã tạo danh mục sản phẩm.")
      resetForm()
      await loadCategories()
      onChanged(savedCategory)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không lưu được danh mục sản phẩm."))
    } finally {
      setIsSaving(false)
    }
  }

  const removeCategory = async (category: ProductCategoryDTO) => {
    setDeletingId(category.id)
    try {
      await deleteProductCategory(category.id)
      notify.success("Đã xóa danh mục sản phẩm.")
      await loadCategories()
      onChanged()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không xóa được danh mục sản phẩm."))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Quản lý danh mục sản phẩm"
      style={{ width: "100%", maxWidth: "48rem" }}
      className="[&_.p-dialog-content]:!bg-[#f6f8fb] [&_.p-dialog-content]:!pb-4 [&_.p-dialog-header]:!border-0"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),18rem]">
        <div className="overflow-hidden rounded-xl border border-[#dbe5f2] bg-white shadow-sm">
          <DataTable
            value={categories}
            loading={isLoading}
            size="small"
            dataKey="id"
            emptyMessage="Chưa có danh mục sản phẩm."
            rowHover
            stripedRows
            className="[&_.p-datatable-thead>tr>th]:!bg-[#f1f5f9] [&_.p-datatable-thead>tr>th]:!text-[#24364d]"
          >
            <Column field="name" header="Tên danh mục" />
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
              body={(category: ProductCategoryDTO) => (
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    icon="pi pi-pencil"
                    onClick={() => startEdit(category)}
                    aria-label="Sửa danh mục"
                    className="!m-0 !h-8 !w-8 !rounded-lg !border-none !bg-[#eaf2ff] !p-0 !text-[#214388] hover:!bg-[#d8e8ff] [&_.p-button-icon]:!text-[#214388]"
                  />
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    loading={deletingId === category.id}
                    onClick={() => removeCategory(category)}
                    aria-label="Xóa danh mục"
                    className="!m-0 !h-8 !w-8 !rounded-lg !border-none !bg-[#fee2e2] !p-0 !text-[#b42318] hover:!bg-[#fecaca] [&_.p-button-icon]:!text-[#b42318]"
                  />
                </div>
              )}
            />
          </DataTable>
        </div>

        <div className="space-y-3 rounded-xl border border-[#dbe5f2] bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-[#eef5ff] px-3 py-2">
            <p className="m-0 text-sm font-bold text-[#214388]">{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}</p>
          </div>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 block">Tên danh mục</span>
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
