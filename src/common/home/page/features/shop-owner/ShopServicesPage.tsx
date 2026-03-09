import { useMemo, useState, type FormEvent } from "react"
import { Clock3, Plus, PencilLine, Power, PowerOff, Trash2, Wrench } from "lucide-react"
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

        <div className="space-y-3">
          {data.services.map((service) => (
            <article key={service.id} className="rounded-sm border border-[#efefef] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f5f5f5] pb-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{service.name}</h3>
                  <p className="text-sm text-slate-500">Nhóm: {service.category}</p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    service.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {service.active ? "Đang hoạt động" : "Tạm dừng"}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                <p className="inline-flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-slate-500" />
                  Giá: <span className="font-semibold text-[#ee4d2d]">{formatCurrencyVND(service.basePrice)}</span>
                </p>
                <p className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-500" />
                  Thời gian: <span className="font-semibold">{service.durationMin} phút</span>
                </p>
              </div>

              <p className="mt-3 rounded-sm bg-[#fafafa] p-2 text-xs text-slate-600">{service.description || "Không có mô tả"}</p>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#e8e8e8] px-2 py-1 text-xs text-slate-700 hover:bg-[#fafafa]"
                >
                  {service.active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                  {service.active ? "Tạm dừng" : "Kích hoạt"}
                </button>
                <button
                  onClick={() => openEditDialog(service)}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#e8e8e8] px-2 py-1 text-xs text-slate-700 hover:bg-[#fafafa]"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Sửa
                </button>
                <button
                  onClick={() => requestDelete(service.id)}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#f0c2b7] px-2 py-1 text-xs text-[#c73d1e] hover:bg-[#fff4f1]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa
                </button>
              </div>
            </article>
          ))}
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

