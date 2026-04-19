import React, { useEffect, useMemo, useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import type { ColumnBodyOptions } from "primereact/column"
import { Toolbar } from "primereact/toolbar"
import { Dialog } from "primereact/dialog"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { formatCurrencyVND } from "@/common/store/shopOwnerStore"
import { getServiceCategories, getServices, updateService, deleteService } from "@/apps/services/api/serviceApi"
import type { ServiceCategoryDTO, ServiceDTO, ServiceVisibilityFilter } from "@/apps/services/model"
import { ShopServiceForm, type FormMode } from "@/apps/services/components/ShopServiceForm"
import { notify } from "@/common/toast/ToastHelper"

const SHOP_ID = 1

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

export function ShopServiceManager() {
  const { data, setServices } = useShopOwnerContext()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategoryDTO[]>([])

  const [targetService, setTargetService] = useState<ServiceDTO | null>(null)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [statusFilter, setStatusFilter] = useState<ServiceVisibilityFilter>("ALL")

  const loadServices = async () => {
    setIsLoading(true)
    try {
      let nextCategories = categories
      try {
        nextCategories = await getServiceCategories(SHOP_ID, true)
        setCategories(nextCategories)
      } catch (err) {
        notify.error(getErrorMessage(err, "Không tải được danh sách nhóm dịch vụ."))
        console.error("Failed to load service categories:", err)
      }

      const categoryNameById = new Map(
        nextCategories
          .filter((category) => typeof category.id === "number")
          .map((category) => [category.id, category.name])
      )
      const result = await getServices()
      if (result) {
        setServices(result.map((s: ServiceDTO) => ({
          id: s.id!,
          name: s.name,
          category: s.category || (s.categoryId ? categoryNameById.get(s.categoryId) ?? "Chưa phân nhóm" : "Chưa phân nhóm"),
          categoryId: s.categoryId ?? null,
          basePrice: s.basePrice,
          durationMin: s.durationMin,
          active: s.active,
        })))
      }
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được danh sách dịch vụ."))
      console.error("Failed to load services:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

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

  // ================= FORM ACTIONS =================
  const openCreateDialog = () => {
    setTargetService(null)
    setFormMode("CREATE")
  }

  const openEditDialog = (service: ServiceDTO) => {
    setTargetService(service)
    setFormMode("EDIT")
  }

  const openViewDialog = (service: ServiceDTO) => {
    setTargetService(service)
    setFormMode("VIEW")
  }

  const closeFormDialog = () => {
    setTargetService(null)
    setFormMode(null)
  }

  const handleFormSaved = () => {
    loadServices()
    closeFormDialog()
  }

  // ================= STATUS & DELETE ACTIONS =================
  const toggleServiceStatus = async (service: any) => {
    if (!service.id) return
    try {
      await updateService(Number(service.id), {
        shopId: SHOP_ID,
        name: service.name,
        durationMin: service.durationMin,
        basePrice: service.basePrice,
        active: !service.active,
        categoryId: service.categoryId ?? null,
      })
      await loadServices()
    } catch (err) {
      notify.error(getErrorMessage(err, "Không cập nhật được trạng thái dịch vụ."))
      console.error(err)
    }
  }

  const requestDelete = (serviceId: string | number) => {
    setDeletingServiceId(Number(serviceId))
    setIsDeleteOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeletingServiceId(null)
    setIsDeleteOpen(false)
  }

  const confirmDelete = async () => {
    if (!deletingServiceId) return
    try {
      await deleteService(deletingServiceId)
      await loadServices()
      closeDeleteDialog()
    } catch (err) {
      notify.error(getErrorMessage(err, "Không xóa được dịch vụ."))
      console.error(err)
    }
  }

  const handleRefreshView = () => {
    setStatusFilter("ALL")
    loadServices()
    closeFormDialog()
    closeDeleteDialog()
  }

  // ================= TABLE RENDERING =================
  const indexBody = (_service: any, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const serviceNameBody = (service: any) => {
    return (
      <div className="w-full text-center">
        <p className="font-semibold text-[#24364d]">{service.name}</p>
      </div>
    )
  }

  const categoryBody = (service: any) => {
    return <div className="w-full text-center text-[#4c5f78]">{service.category || "Chưa phân nhóm"}</div>
  }

  const priceBody = (service: any) => {
    return <div className="w-full text-center font-semibold text-[#ef5c2c]">{formatCurrencyVND(service.basePrice)}</div>
  }

  const durationBody = (service: any) => {
    return <div className="w-full text-center text-[#4c5f78]">{service.durationMin} phút</div>
  }

  const statusBody = (service: any) => {
    return (
      <div className="flex w-full justify-center">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${serviceStatusClass(service.active)}`}>
          {serviceStatusLabel(service.active)}
        </span>
      </div>
    )
  }

  const actionsBody = (service: any) => {
    const actionItems = [
      {
        label: "Xem chi tiết",
        icon: "pi pi-eye",
        command: () => openViewDialog(service),
      },
      {
        label: service.active ? "Tạm dừng" : "Kích hoạt",
        icon: service.active ? "pi pi-times-circle" : "pi pi-check-circle",
        command: () => toggleServiceStatus(service),
      },
      {
        label: "Chỉnh sửa",
        icon: "pi pi-pencil",
        command: () => openEditDialog(service),
      },
      {
        label: "Xóa",
        icon: "pi pi-trash",
        className: "text-red-500",
        command: () => requestDelete(service.id),
      },
    ]

    return <TableActionMenu items={actionItems} />
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-2">
        <Toolbar
          className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          start={
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Danh sách dịch vụ</h1>
              <p className="mt-0.5 text-sm text-slate-500">Quản lý giá, thời lượng và trạng thái hoạt động của từng dịch vụ.</p>
            </div>
          }
          end={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openCreateDialog}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#214388] px-4 text-sm font-semibold text-white transition hover:bg-[#19356a]"
              >
                <i className="pi pi-plus h-4 w-4" />
                Thêm mới
              </button>
              <label className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-filter h-4 w-4 text-[#70829a]" />
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
                disabled={isLoading}
              >
                <i className={`pi pi-refresh h-4 w-4 ${isLoading ? 'pi-spin' : ''}`} />
                Refresh
              </button>
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <div className="space-y-5">

            <div className="grid gap-3 md:grid-cols-3">
              <SummaryCard icon={<i className="pi pi-list h-5 w-5 text-sky-500" />} label="Tổng dịch vụ" value={String(data.services.length)} color="sky" />
              <SummaryCard icon={<i className="pi pi-check-circle h-5 w-5 text-emerald-500" />} label="Đang hoạt động" value={String(activeCount)} color="emerald" />
              <SummaryCard icon={<i className="pi pi-pause-circle h-5 w-5 text-orange-500" />} label="Tạm dừng" value={String(inactiveCount)} color="orange" />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-bold text-[#24364d]">Quản lý dịch vụ</p>
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
                emptyMessage={
                  <div className="w-full py-2 text-center text-[#4c5f78]">
                    Chưa có dịch vụ nào.
                  </div>
                }
                loading={isLoading}
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
        </div>
      </div>

      <Dialog
        visible={isDeleteOpen}
        onHide={closeDeleteDialog}
        header="Xác nhận xóa dịch vụ"
        style={{ width: '100%', maxWidth: '30rem' }}
        footer={
          <div className="flex justify-end gap-2 mt-4">
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
          </div>
        }
      >
        <p className="mb-2 text-sm text-slate-500 mt-0">Dịch vụ bị xóa sẽ không hiển thị trong danh sách đặt lịch.</p>
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa dịch vụ này?</p>
      </Dialog>

      <ShopServiceForm
        mode={formMode}
        service={targetService}
        onClose={closeFormDialog}
        onSaved={handleFormSaved}
      />
    </>
  )
}

type SummaryCardProps = {
  icon: React.ReactNode
  label: string
  value: string
  color: "sky" | "emerald" | "orange"
}

function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  const borderMap = { sky: "border-sky-200", emerald: "border-emerald-200", orange: "border-orange-200" }
  const bgMap = { sky: "bg-sky-50", emerald: "bg-emerald-50", orange: "bg-orange-50" }

  return (
    <div className={`rounded-xl border ${borderMap[color]} ${bgMap[color]} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="text-3xl font-bold leading-none text-[#24364d]">{value}</p>
    </div>
  )
}
