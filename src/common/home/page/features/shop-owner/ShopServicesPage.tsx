import { useMemo, useState, type FormEvent } from "react"
import { Plus, PencilLine, Power, PowerOff, Trash2 } from "lucide-react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { AppDialog } from "@/common/component/AppDialog"
import { useShopOwnerContext } from "@/common/home/page/features/shop-owner/store/ShopOwnerContext"
import { createLocalId, formatCurrencyVND, type ShopService } from "@/common/home/page/features/shop-owner/store/shopOwnerStore"

type ServiceFormState = {
  name: string
  category: string
  basePrice: string
  durationMin: string
  description: string
  active: boolean
}

const emptyForm: ServiceFormState = {
  name: "",
  category: "Khám",
  basePrice: "",
  durationMin: "",
  description: "",
  active: true,
}

function toForm(service: ShopService): ServiceFormState {
  return {
    name: service.name,
    category: service.category,
    basePrice: String(service.basePrice),
    durationMin: String(service.durationMin),
    description: service.description || "",
    active: service.active,
  }
}

function serviceStatusLabel(isActive: boolean) {
  return isActive ? "Đang hoạt động" : "Tạm dừng"
}

function serviceStatusClass(isActive: boolean) {
  return isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
}

export function ShopServicesPage() {
  const { data, setServices } = useShopOwnerContext()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null)
  const [formState, setFormState] = useState<ServiceFormState>(emptyForm)
  const [formError, setFormError] = useState("")

  const activeCount = useMemo(() => data.services.filter((item) => item.active).length, [data.services])

  const openCreateDialog = () => {
    setEditingServiceId(null)
    setFormState(emptyForm)
    setFormError("")
    setIsFormOpen(true)
  }

  const openEditDialog = (service: ShopService) => {
    setEditingServiceId(service.id)
    setFormState(toForm(service))
    setFormError("")
    setIsFormOpen(true)
  }

  const closeFormDialog = () => {
    setEditingServiceId(null)
    setFormState(emptyForm)
    setFormError("")
    setIsFormOpen(false)
  }

  const handleSave = (event: FormEvent) => {
    event.preventDefault()

    const name = formState.name.trim()
    const category = formState.category.trim()
    const basePrice = Number(formState.basePrice)
    const durationMin = Number(formState.durationMin)

    if (!name || !category) {
      setFormError("Vui lòng nhập đầy đủ tên dịch vụ và nhóm dịch vụ.")
      return
    }

    if (Number.isNaN(basePrice) || basePrice < 0) {
      setFormError("Giá dịch vụ phải là số >= 0.")
      return
    }

    if (Number.isNaN(durationMin) || durationMin <= 0) {
      setFormError("Thời gian thực hiện phải > 0 phút.")
      return
    }

    if (editingServiceId) {
      setServices(
        data.services.map((item) =>
          item.id === editingServiceId
            ? {
                ...item,
                name,
                category,
                basePrice,
                durationMin,
                active: formState.active,
                description: formState.description.trim() || undefined,
              }
            : item
        )
      )
    } else {
      const newService: ShopService = {
        id: createLocalId("svc"),
        name,
        category,
        basePrice,
        durationMin,
        active: formState.active,
        description: formState.description.trim() || undefined,
      }
      setServices([newService, ...data.services])
    }

    closeFormDialog()
  }

  const toggleServiceStatus = (serviceId: string) => {
    setServices(
      data.services.map((item) =>
        item.id === serviceId
          ? {
              ...item,
              active: !item.active,
            }
          : item
      )
    )
  }

  const requestDelete = (serviceId: string) => {
    setDeletingServiceId(serviceId)
    setIsDeleteOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeletingServiceId(null)
    setIsDeleteOpen(false)
  }

  const confirmDelete = () => {
    if (!deletingServiceId) return
    setServices(data.services.filter((item) => item.id !== deletingServiceId))
    closeDeleteDialog()
  }

  const indexBody = (_service: ShopService, options: ColumnBodyOptions) => {
    return <span>{options.rowIndex + 1}</span>
  }

  const serviceNameBody = (service: ShopService) => {
    return (
      <div>
        <p className="font-semibold text-slate-800">{service.name}</p>
        <p className="text-xs text-slate-500">{service.id}</p>
      </div>
    )
  }

  const descriptionBody = (service: ShopService) => {
    return <span className="block max-w-[320px] truncate">{service.description || "Khong co mo ta"}</span>
  }

  const priceBody = (service: ShopService) => {
    return <span className="font-semibold text-[#ee4d2d]">{formatCurrencyVND(service.basePrice)}</span>
  }

  const durationBody = (service: ShopService) => {
    return <span>{service.durationMin} phút</span>
  }

  const statusBody = (service: ShopService) => {
    return (
      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${serviceStatusClass(service.active)}`}>
        {serviceStatusLabel(service.active)}
      </span>
    )
  }

  const actionsBody = (service: ShopService) => {
    return (
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => toggleServiceStatus(service.id)}
          title={service.active ? "Tạm dừng dịch vụ" : "Kích hoạt dịch vụ"}
          aria-label={service.active ? "Tạm dừng dịch vụ" : "Kích hoạt dịch vụ"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8e0ea] text-slate-600 hover:bg-slate-100"
        >
          {service.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
        </button>

        <button
          onClick={() => openEditDialog(service)}
          title="Sửa dịch vụ"
          aria-label="Sửa dịch vụ"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8e0ea] text-slate-600 hover:bg-slate-100"
        >
          <PencilLine className="h-4 w-4" />
        </button>

        <button
          onClick={() => requestDelete(service.id)}
          title="Xóa dịch vụ"
          aria-label="Xóa dịch vụ"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#f0c2b7] text-[#c73d1e] hover:bg-[#fff4f1]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Quản lý dịch vụ</h1>
        <p className="mt-1 text-sm text-slate-500">Thêm, sửa, xóa dịch vụ và quản lý giá, thời lượng, trạng thái hoạt động.</p>
      </div>

      <div className="pt-5">
        <div className="mb-4 grid gap-3 rounded-sm border border-[#efefef] bg-[#fafafa] p-4 md:grid-cols-3">
          <SummaryCard label="Tổng dịch vụ" value={String(data.services.length)} />
          <SummaryCard label="Đang hoạt động" value={String(activeCount)} />
          <SummaryCard label="Tạm dừng" value={String(data.services.length - activeCount)} />
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
          >
            <Plus className="h-4 w-4" />
            Thêm dịch vụ
          </button>
        </div>

        <div className="rounded-sm border border-[#d9e1ec] bg-white">
          <DataTable
            value={data.services}
            dataKey="id"
            size="small"
            stripedRows
            showGridlines
            tableStyle={{ minWidth: "64rem" }}
            emptyMessage="Chưa có dịch vụ nào."
          >
            <Column
              header="TT"
              body={indexBody}
              style={{ width: "64px" }}
              headerStyle={{ textAlign: "center" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column field="name" header="Tên dịch vụ" body={serviceNameBody} style={{ minWidth: "220px" }} />
            <Column field="category" header="Nhóm" style={{ minWidth: "140px" }} />
            <Column field="description" header="Mô tả" body={descriptionBody} style={{ minWidth: "260px" }} />
            <Column
              field="basePrice"
              header="Giá"
              body={priceBody}
              style={{ minWidth: "140px" }}
              headerStyle={{ textAlign: "right" }}
              bodyStyle={{ textAlign: "right" }}
            />
            <Column
              field="durationMin"
              header="Thời lượng"
              body={durationBody}
              style={{ minWidth: "120px" }}
              headerStyle={{ textAlign: "center" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              field="active"
              header="Trạng thái"
              body={statusBody}
              style={{ minWidth: "140px" }}
              headerStyle={{ textAlign: "center" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              header="Thao tác"
              body={actionsBody}
              style={{ minWidth: "140px" }}
              headerStyle={{ textAlign: "center" }}
              bodyStyle={{ textAlign: "center" }}
            />
          </DataTable>
        </div>
      </div>

      <AppDialog
        open={isFormOpen}
        onClose={closeFormDialog}
        title={editingServiceId ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
        description="Thiết lập giá, thời lượng và trạng thái hoạt động của dịch vụ."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeFormDialog}
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa]"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="shop-service-form"
              className="rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#de4322]"
            >
              {editingServiceId ? "Lưu thay đổi" : "Tạo dịch vụ"}
            </button>
          </>
        }
      >
        <form id="shop-service-form" onSubmit={handleSave} className="space-y-3">
          {formError && (
            <div className="rounded-sm border border-[#f0c2b7] bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <InputField
              label="Tên dịch vụ"
              value={formState.name}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
            />
            <InputField
              label="Nhóm dịch vụ"
              value={formState.category}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}
            />
            <InputField
              label="Giá dịch vụ (VND)"
              type="number"
              value={formState.basePrice}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, basePrice: value }))}
            />
            <InputField
              label="Thời gian thực hiện (phút)"
              type="number"
              value={formState.durationMin}
              required
              onChange={(value) => setFormState((prev) => ({ ...prev, durationMin: value }))}
            />

            <label className="text-sm text-slate-700 md:col-span-2">
              <div className="mb-1">Mô tả dịch vụ</div>
              <textarea
                rows={3}
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full resize-none rounded-sm border border-[#d9d9d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={formState.active}
                onChange={(event) => setFormState((prev) => ({ ...prev, active: event.target.checked }))}
                className="h-4 w-4 rounded border-[#d9d9d9]"
              />
              Kích hoạt dịch vụ sau khi lưu
            </label>
          </div>
        </form>
      </AppDialog>

      <AppDialog
        open={isDeleteOpen}
        onClose={closeDeleteDialog}
        title="Xác nhận xóa dịch vụ"
        description="Dịch vụ bị xóa sẽ không hiển thị trong danh sách đặt lịch."
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteDialog}
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-sm bg-[#d93b1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c23218]"
            >
              Xóa dịch vụ
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa dịch vụ này?</p>
      </AppDialog>
    </>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[#efefef] bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-800">{value}</p>
    </div>
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
        min={type === "number" ? 0 : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-[#d9d9d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#ee4d2d]"
      />
    </label>
  )
}
