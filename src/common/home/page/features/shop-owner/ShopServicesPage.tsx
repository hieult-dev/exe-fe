import { useMemo, useState, type FormEvent } from "react"
import { ListFilter, PencilLine, Plus, Power, PowerOff, RefreshCw, Trash2 } from "lucide-react"
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

type ServiceVisibilityFilter = "ALL" | "ACTIVE" | "INACTIVE"

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
  const [statusFilter, setStatusFilter] = useState<ServiceVisibilityFilter>("ALL")
  const [formState, setFormState] = useState<ServiceFormState>(emptyForm)
  const [formError, setFormError] = useState("")

  const activeCount = useMemo(() => data.services.filter((item) => item.active).length, [data.services])
  const inactiveCount = data.services.length - activeCount

  const visibleServices = useMemo(() => {
    if (statusFilter === "ACTIVE") {
      return data.services.filter((item) => item.active)
    }

    if (statusFilter === "INACTIVE") {
      return data.services.filter((item) => !item.active)
    }

    return data.services
  }, [data.services, statusFilter])

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

  const handleRefreshView = () => {
    setStatusFilter("ALL")
    closeFormDialog()
    closeDeleteDialog()
  }

  const indexBody = (_service: ShopService, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const serviceNameBody = (service: ShopService) => {
    return (
      <div className="w-full text-center">
        <p className="font-semibold text-[#24364d]">{service.name}</p>
        <p className="text-xs text-[#73849b]">{service.id}</p>
      </div>
    )
  }

  const categoryBody = (service: ShopService) => {
    return <div className="w-full text-center text-[#4c5f78]">{service.category}</div>
  }

  const descriptionBody = (service: ShopService) => {
    return <div className="w-full text-center text-[#4c5f78]">{service.description || "Không có mô tả"}</div>
  }

  const priceBody = (service: ShopService) => {
    return <div className="w-full text-center font-semibold text-[#ef5c2c]">{formatCurrencyVND(service.basePrice)}</div>
  }

  const durationBody = (service: ShopService) => {
    return <div className="w-full text-center text-[#4c5f78]">{service.durationMin} phút</div>
  }

  const statusBody = (service: ShopService) => {
    return (
      <div className="flex w-full justify-center">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${serviceStatusClass(service.active)}`}>
          {serviceStatusLabel(service.active)}
        </span>
      </div>
    )
  }

  const actionsBody = (service: ShopService) => {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => toggleServiceStatus(service.id)}
          title={service.active ? "Tạm dừng dịch vụ" : "Kích hoạt dịch vụ"}
          aria-label={service.active ? "Tạm dừng dịch vụ" : "Kích hoạt dịch vụ"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d7dfe9] bg-white text-slate-600 transition hover:bg-slate-50"
        >
          {service.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
        </button>

        <button
          onClick={() => openEditDialog(service)}
          title="Sửa dịch vụ"
          aria-label="Sửa dịch vụ"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d7dfe9] bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <PencilLine className="h-4 w-4" />
        </button>

        <button
          onClick={() => requestDelete(service.id)}
          title="Xóa dịch vụ"
          aria-label="Xóa dịch vụ"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#f0c2b7] bg-white text-[#c73d1e] transition hover:bg-[#fff4f1]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[#dbe3ed] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e7edf4] bg-[#fbfcfe] px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <h1 className="text-lg font-semibold text-[#24364d]">Danh sách dịch vụ</h1>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              onClick={openCreateDialog}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#214388] px-4 text-sm font-semibold text-white transition hover:bg-[#19356a]"
            >
              <Plus className="h-4 w-4" />
              Thêm mới
            </button>

            <label className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
              <ListFilter className="h-4 w-4 text-[#70829a]" />
              <span>Xem theo</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ServiceVisibilityFilter)}
                className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm dừng</option>
              </select>
            </label>

            <button
              onClick={handleRefreshView}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-4 text-sm font-medium text-[#40526b] transition hover:bg-[#f8fafc]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-5 px-4 py-4 lg:px-5 lg:py-5">
          <p className="text-sm text-[#74849a]">Quản lý giá, thời lượng và trạng thái hoạt động của từng dịch vụ.</p>

          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="Tổng dịch vụ" value={String(data.services.length)} />
            <SummaryCard label="Đang hoạt động" value={String(activeCount)} />
            <SummaryCard label="Tạm dừng" value={String(inactiveCount)} />
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#24364d]">Quản lý dịch vụ</p>
              <p className="text-sm text-[#73849b]">Bảng bên dưới là danh sách dịch vụ hiện có của cửa hàng.</p>
            </div>
            <p className="text-sm text-[#73849b]">Hiển thị {visibleServices.length}/{data.services.length} dịch vụ</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
            <DataTable
              value={visibleServices}
              dataKey="id"
              size="small"
              stripedRows
              rowHover
              showGridlines
              tableStyle={{ minWidth: "68rem" }}
              emptyMessage="Chưa có dịch vụ nào."
            >
              <Column
                header="TT"
                body={indexBody}
                style={{ width: "64px" }}
                alignHeader="center"
                bodyStyle={{ textAlign: "center" }}
              />
              <Column field="name" header="Tên dịch vụ" body={serviceNameBody} style={{ minWidth: "240px" }} alignHeader="center" />
              <Column field="category" header="Nhóm" body={categoryBody} style={{ minWidth: "140px" }} alignHeader="center" />
              <Column field="description" header="Mô tả" body={descriptionBody} style={{ minWidth: "280px" }} alignHeader="center" />
              <Column
                field="basePrice"
                header="Giá"
                body={priceBody}
                alignHeader="center"
                bodyStyle={{ textAlign: "center" }}
              />
              <Column
                field="durationMin"
                header="Thời lượng"
                body={durationBody}
                alignHeader="center"
                bodyStyle={{ textAlign: "center" }}
              />
              <Column
                field="active"
                header="Trạng thái"
                body={statusBody}
                alignHeader="center"
                bodyStyle={{ textAlign: "center" }}
              />
              <Column
                header="Thao tác"
                body={actionsBody}
                alignHeader="center"
                bodyStyle={{ textAlign: "center" }}
              />
            </DataTable>
          </div>
        </div>
      </section>

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
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="shop-service-form"
              className="rounded-lg bg-[#214388] px-4 py-2 text-sm font-semibold text-white hover:bg-[#19356a]"
            >
              {editingServiceId ? "Lưu thay đổi" : "Tạo dịch vụ"}
            </button>
          </>
        }
      >
        <form id="shop-service-form" onSubmit={handleSave} className="space-y-3">
          {formError && <div className="rounded-lg bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>}

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
                className="w-full resize-none rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:bg-white"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={formState.active}
                onChange={(event) => setFormState((prev) => ({ ...prev, active: event.target.checked }))}
                className="h-4 w-4 rounded"
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
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-[#d93b1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c23218]"
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
    <div className="rounded-xl border border-[#e5ebf3] bg-white p-4">
      <p className="text-sm text-[#70829a]">{label}</p>
      <p className="mt-2 text-[1.8rem] font-semibold leading-none text-[#24364d]">{value}</p>
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
        className="w-full rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:bg-white"
      />
    </label>
  )
}

