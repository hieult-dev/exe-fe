import React, { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "primereact/button"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import type { ColumnBodyOptions } from "primereact/column"
import { Toolbar } from "primereact/toolbar"
import { Dialog } from "primereact/dialog"
import { TabPanel, TabView } from "primereact/tabview"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { deleteService, getServiceById, getServiceCategories, getServices, updateService } from "@/apps/services/api/serviceApi"
import type { ServiceCategoryDTO, ServiceDTO, ServiceType, ServiceVisibilityFilter } from "@/apps/services/model"
import { ShopServiceForm, type FormMode } from "@/apps/services/components/ShopServiceForm"
import { useUserStore } from "@/apps/user/store/UserStore"
import { resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND } from "@/common/utils/format"
import { getImageUrlOrNotFound, NOT_FOUND_IMAGE_URL } from "@/common/utils/url"

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

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
  }
  return null
}

function serviceStatusLabel(isActive: boolean) {
  return isActive ? "Đang hoạt động" : "Tạm dừng"
}

function serviceStatusClass(isActive: boolean) {
  return isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
}

const serviceTabTypes: ServiceType[] = ["GENERAL", "VETERINARY"]

export function ShopServiceManager() {
  const location = useLocation()
  const { globalSearchQuery } = useShopOwnerContext()
  const currentShopId = useUserStore((state) => state.currentShopId)
  const shops = useUserStore((state) => state.shops)
  const currentShop = resolveCurrentAuthShop(shops, currentShopId)
  const shopId = currentShop?.id ?? currentShopId ?? 0
  const highlightedServiceId = useMemo(
    () => getNumber(new URLSearchParams(location.search).get("serviceId")),
    [location.search],
  )
  const highlightedServiceFetchRef = useRef<number | null>(null)

  const [debouncedSearch, setDebouncedSearch] = useState(globalSearchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalSearchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [globalSearchQuery])

  const [services, setServices] = useState<ServiceDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState<boolean>(false)
  const observerTarget = React.useRef<HTMLDivElement>(null)

  const [categories, setCategories] = useState<ServiceCategoryDTO[]>([])

  const [targetService, setTargetService] = useState<ServiceDTO | null>(null)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [serviceDetailLoadingId, setServiceDetailLoadingId] = useState<number | null>(null)
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [statusFilter, setStatusFilter] = useState<ServiceVisibilityFilter>("ALL")
  const [activeServiceType, setActiveServiceType] = useState<ServiceType>("GENERAL")
  const activeTabIndex = activeServiceType === "VETERINARY" ? 1 : 0

  useEffect(() => {
    if (highlightedServiceId === null) return
    setStatusFilter("ALL")
  }, [highlightedServiceId])

  const loadServices = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (!hasNext || isLoadingMore) return
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      let nextCategories = categories
      if (!isLoadMore) {
        try {
          nextCategories = await getServiceCategories(true, activeServiceType)
          setCategories(nextCategories)
        } catch (err) {
          notify.error(getErrorMessage(err, "Không tải được danh sách nhóm dịch vụ."))
          console.error("Failed to load service categories:", err)
        }
      }

      const categoryNameById = new Map(
        (Array.isArray(nextCategories) ? nextCategories : [])
          .filter((category) => typeof category.id === "number")
          .map((category) => [category.id, category.name])
      )

      const currentCursor = isLoadMore ? nextCursor : null
      const result = await getServices({
        size: 20,
        cursor: currentCursor,
        search: debouncedSearch,
        serviceType: activeServiceType,
      })
      if (result) {
        const servicesArray = result.content

        const newCursor = result.nextCursor ?? null
        const newHasNext = result.hasNext ?? false

        if (Array.isArray(servicesArray)) {
          const mappedServices = servicesArray.map((s: ServiceDTO) => ({
            id: s.id!,
            shopId: s.shopId || shopId,
            name: s.name,
            category: s.categoryName || s.category || (s.categoryId ? categoryNameById.get(s.categoryId) ?? "Chưa phân nhóm" : "Chưa phân nhóm"),
            categoryId: s.categoryId ?? null,
            categoryName: s.categoryName ?? null,
            basePrice: s.basePrice,
            durationMin: s.durationMin,
            active: s.active,
            serviceType: s.serviceType,
            veterinaryServiceType: s.veterinaryServiceType ?? null,
            vaccineId: s.vaccineId ?? null,
            vaccineName: s.vaccineName ?? null,
            imageUrl: s.imageUrl ?? null,
          }))

          if (isLoadMore) {
            setServices((prev) => {
              const prevIds = new Set(prev.map(p => p.id));
              const uniqueNew = mappedServices.filter(n => !prevIds.has(n.id));
              return [...prev, ...uniqueNew];
            })
          } else {
            setServices(mappedServices)
          }

          setNextCursor(newCursor)
          setHasNext(newHasNext)
        }
      }
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được danh sách dịch vụ."))
      console.error("Failed to load services:", err)
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadServices(false)
  }, [debouncedSearch, activeServiceType])

  useEffect(() => {
    if (isLoading || isLoadingMore || !hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadServices(true)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [hasNext, isLoading, isLoadingMore, nextCursor, activeServiceType])

  const activeCount = useMemo(() => services.filter((item) => item.active).length, [services])
  const inactiveCount = services.length - activeCount

  const visibleServices = useMemo(() => {
    if (statusFilter === "ACTIVE") {
      return services.filter((item) => item.active)
    }

    if (statusFilter === "INACTIVE") {
      return services.filter((item) => !item.active)
    }

    return services
  }, [services, statusFilter])

  // ================= FORM ACTIONS =================
  const buildServiceWithCategory = (service: ServiceDTO, fallback?: ServiceDTO): ServiceDTO => {
    const merged = { ...fallback, ...service }
    const categoryId = merged.categoryId ?? null
    const category = merged.category || (categoryId ? categories.find((item) => item.id === categoryId)?.name : undefined)

    return {
      id: merged.id,
      shopId: merged.shopId || shopId,
      name: merged.name || "",
      category: category || "Chưa phân nhóm",
      categoryId,
      categoryName: merged.categoryName ?? category ?? null,
      basePrice: Number(merged.basePrice ?? 0),
      durationMin: Number(merged.durationMin ?? 0),
      active: typeof merged.active === "boolean" ? merged.active : true,
      serviceType: merged.serviceType ?? "GENERAL",
      veterinaryServiceType: merged.veterinaryServiceType ?? null,
      vaccineId: merged.vaccineId ?? null,
      vaccineName: merged.vaccineName ?? null,
      imageUrl: merged.imageUrl ?? null,
    }
  }

  useEffect(() => {
    if (highlightedServiceId === null) return
    if (services.some((service) => service.id === highlightedServiceId)) return
    if (highlightedServiceFetchRef.current === highlightedServiceId) return

    let cancelled = false
    highlightedServiceFetchRef.current = highlightedServiceId

    getServiceById(highlightedServiceId)
      .then((result) => {
        if (cancelled) return
        const detail = result
        if (!detail || !detail.id) return
        const nextService = buildServiceWithCategory(detail)
        if (nextService.serviceType !== activeServiceType) {
          setActiveServiceType(nextService.serviceType)
        }

        setServices((prev) => {
          if (prev.some((item) => item.id === nextService.id)) {
            return prev.map((item) => (item.id === nextService.id ? nextService : item))
          }
          return [nextService, ...prev]
        })
      })
      .catch((error) => console.error("[SERVICE HIGHLIGHT]", error))
      .finally(() => {
        if (!cancelled && highlightedServiceFetchRef.current === highlightedServiceId) {
          highlightedServiceFetchRef.current = null
        }
      })

    return () => {
      cancelled = true
    }
  }, [highlightedServiceId, services, categories, shopId, activeServiceType])

  useEffect(() => {
    if (highlightedServiceId === null || !visibleServices.some((service) => service.id === highlightedServiceId)) return

    const frameId = window.requestAnimationFrame(() => {
      document.querySelector(".service-row-highlight")?.scrollIntoView({ behavior: "smooth", block: "center" })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [highlightedServiceId, visibleServices])

  const loadServiceDetailForAction = async (service: ServiceDTO, mode: Exclude<FormMode, null>) => {
    if (!service.id) {
      setTargetService(service)
      setFormMode(mode)
      return
    }

    setServiceDetailLoadingId(Number(service.id))
    try {
      const detail = await getServiceById(Number(service.id))
      setTargetService(buildServiceWithCategory(detail, service))
      setFormMode(mode)
    } catch (err) {
      notify.error(getErrorMessage(err, "Không tải được chi tiết dịch vụ."))
      console.error("Failed to load service detail:", err)
    } finally {
      setServiceDetailLoadingId(null)
    }
  }

  const openCreateDialog = () => {
    setTargetService(null)
    setFormMode("CREATE")
  }

  const openEditDialog = (service: ServiceDTO) => {
    loadServiceDetailForAction(service, "EDIT")
  }

  const openViewDialog = (service: ServiceDTO) => {
    loadServiceDetailForAction(service, "VIEW")
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
  const toggleServiceStatus = async (service: ServiceDTO) => {
    if (!service.id) return
    try {
      await updateService(Number(service.id), {
        shopId: shopId,
        name: service.name,
        durationMin: service.durationMin,
        basePrice: service.basePrice,
        active: !service.active,
        categoryId: service.categoryId ?? null,
        serviceType: service.serviceType ?? activeServiceType,
        veterinaryServiceType: service.serviceType === "VETERINARY" ? service.veterinaryServiceType ?? null : null,
        vaccineId: service.serviceType === "VETERINARY" && service.veterinaryServiceType === "VACCINATION" ? service.vaccineId ?? null : null,
        imageUrl: service.imageUrl ?? null,
      })
      setServices((prev) => prev.map((s) => s.id === service.id ? { ...s, active: !s.active } : s))
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

  const serviceImageBody = (service: ServiceDTO) => {
    return (
      <div className="flex w-full justify-center">
        <img
          src={getImageUrlOrNotFound(service.imageUrl)}
          alt={service.name}
          className="h-10 w-10 shrink-0 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] object-cover"
          onError={(event) => {
            event.currentTarget.src = NOT_FOUND_IMAGE_URL
          }}
        />
      </div>
    )
  }

  const serviceNameBody = (service: ServiceDTO) => {
    return (
      <div className="w-full text-center">
        <p className="m-0 font-semibold text-[#24364d]">{service.name}</p>
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
    const isLoadingDetail = serviceDetailLoadingId === service.id
    const actionItems = [
      {
        label: "Xem chi tiết",
        icon: isLoadingDetail ? "pi pi-spinner pi-spin" : "pi pi-eye",
        disabled: isLoadingDetail,
        command: () => openViewDialog(service),
      },
      {
        label: service.active ? "Tạm dừng" : "Kích hoạt",
        icon: service.active ? "pi pi-times-circle" : "pi pi-check-circle",
        disabled: isLoadingDetail,
        command: () => toggleServiceStatus(service),
      },
      {
        label: "Chỉnh sửa",
        icon: isLoadingDetail ? "pi pi-spinner pi-spin" : "pi pi-pencil",
        disabled: isLoadingDetail,
        command: () => openEditDialog(service),
      },
      {
        label: "Xóa",
        icon: "pi pi-trash",
        className: "text-red-500",
        disabled: isLoadingDetail,
        command: () => requestDelete(service.id),
      },
    ]

    return <TableActionMenu items={actionItems} />
  }

  const serviceRowClassName = (service: ServiceDTO) => {
    return highlightedServiceId !== null && service.id === highlightedServiceId ? "service-row-highlight" : ""
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
                Làm mới
              </button>
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <TabView
            activeIndex={activeTabIndex}
            onTabChange={(event) => {
              setStatusFilter("ALL")
              setActiveServiceType(serviceTabTypes[event.index] ?? "GENERAL")
            }}
            className="shop-service-tabview [&_.p-tabview-nav]:!mb-5 [&_.p-tabview-nav]:!grid [&_.p-tabview-nav]:!grid-cols-1 [&_.p-tabview-nav]:!gap-0 [&_.p-tabview-nav]:!overflow-hidden [&_.p-tabview-nav]:!rounded-lg [&_.p-tabview-nav]:!border [&_.p-tabview-nav]:!border-[#dbe5f2] [&_.p-tabview-nav]:!bg-white sm:[&_.p-tabview-nav]:!grid-cols-2 [&_.p-tabview-nav>li]:!m-0 [&_.p-tabview-nav>li]:!border-0 [&_.p-tabview-nav-link]:!h-12 [&_.p-tabview-nav-link]:!justify-center [&_.p-tabview-nav-link]:!gap-2 [&_.p-tabview-nav-link]:!rounded-none [&_.p-tabview-nav-link]:!border-0 [&_.p-tabview-nav-link]:!bg-white [&_.p-tabview-nav-link]:!text-sm [&_.p-tabview-nav-link]:!font-semibold [&_.p-tabview-nav-link]:!text-slate-600 [&_.p-tabview-panels]:!bg-transparent [&_.p-tabview-panels]:!p-0 [&_.p-tabview-selected_.p-tabview-nav-link]:!bg-[#eef5ff] [&_.p-tabview-selected_.p-tabview-nav-link]:!text-[#0f5fff] [&_.p-tabview-selected_.p-tabview-nav-link]:!shadow-[inset_0_0_0_1px_#93b8ff] [&_.p-highlight_.p-tabview-nav-link]:!bg-[#eef5ff] [&_.p-highlight_.p-tabview-nav-link]:!text-[#0f5fff] [&_.p-highlight_.p-tabview-nav-link]:!shadow-[inset_0_0_0_1px_#93b8ff]"
            panelContainerClassName="!px-0 !pb-0"
          >
            <TabPanel header="Dịch vụ Spa" leftIcon="pi pi-star mr-2">
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryCard icon={<i className="pi pi-list h-5 w-5 text-sky-500" />} label="Tổng dịch vụ" value={String(services.length)} color="sky" />
                  <SummaryCard icon={<i className="pi pi-check-circle h-5 w-5 text-emerald-500" />} label="Đang hoạt động" value={String(activeCount)} color="emerald" />
                  <SummaryCard icon={<i className="pi pi-pause-circle h-5 w-5 text-orange-500" />} label="Tạm dừng" value={String(inactiveCount)} color="orange" />
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-bold text-[#24364d]">Quản lý dịch vụ Spa</p>
                    <p className="text-sm text-[#73849b]">Bảng bên dưới là danh sách dịch vụ Spa hiện có của cửa hàng.</p>
                  </div>
                  <p className="text-sm text-[#73849b]">Hiển thị {visibleServices.length}/{services.length} dịch vụ</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                  <DataTable
                    value={visibleServices}
                    dataKey="id"
                    size="small"
                    stripedRows
                    rowHover
                    rowClassName={serviceRowClassName}
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
                    <Column body={serviceImageBody} style={{ width: "72px" }} bodyStyle={{ textAlign: "center" }} />
                    <Column field="name" header="Tên dịch vụ" body={serviceNameBody} style={{ minWidth: "220px" }} alignHeader="center" />
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
                  {(hasNext || isLoadingMore) && (
                    <div ref={observerTarget} className="flex h-12 w-full items-center justify-center p-4">
                      {isLoadingMore ? (
                        <i className="pi pi-spinner pi-spin text-[#4c5f78] text-xl" />
                      ) : (
                        <span className="text-sm text-slate-500 text-transparent">Cuộn xuống để xem thêm</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Dịch vụ thú y" leftIcon="pi pi-heart mr-2">
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryCard icon={<i className="pi pi-list h-5 w-5 text-sky-500" />} label="Tổng dịch vụ" value={String(services.length)} color="sky" />
                  <SummaryCard icon={<i className="pi pi-check-circle h-5 w-5 text-emerald-500" />} label="Đang hoạt động" value={String(activeCount)} color="emerald" />
                  <SummaryCard icon={<i className="pi pi-pause-circle h-5 w-5 text-orange-500" />} label="Tạm dừng" value={String(inactiveCount)} color="orange" />
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-bold text-[#24364d]">Quản lý dịch vụ thú y</p>
                    <p className="text-sm text-[#73849b]">Bảng bên dưới là danh sách dịch vụ thú y hiện có của cửa hàng.</p>
                  </div>
                  <p className="text-sm text-[#73849b]">Hiển thị {visibleServices.length}/{services.length} dịch vụ</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
                  <DataTable
                    value={visibleServices}
                    dataKey="id"
                    size="small"
                    stripedRows
                    rowHover
                    rowClassName={serviceRowClassName}
                    showGridlines
                    tableStyle={{ minWidth: "68rem" }}
                    emptyMessage={
                      <div className="w-full py-2 text-center text-[#4c5f78]">
                        Chưa có dịch vụ thú y nào.
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
                    <Column body={serviceImageBody} style={{ width: "72px" }} bodyStyle={{ textAlign: "center" }} />
                    <Column field="name" header="Tên dịch vụ" body={serviceNameBody} style={{ minWidth: "220px" }} alignHeader="center" />
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
                  {(hasNext || isLoadingMore) && (
                    <div ref={observerTarget} className="flex h-12 w-full items-center justify-center p-4">
                      {isLoadingMore ? (
                        <i className="pi pi-spinner pi-spin text-[#4c5f78] text-xl" />
                      ) : (
                        <span className="text-sm text-slate-500 text-transparent">Cuộn xuống để xem thêm</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <Dialog
        visible={isDeleteOpen}
        onHide={closeDeleteDialog}
        header="Xác nhận xóa dịch vụ"
        style={{ width: '100%', maxWidth: '30rem' }}
        footer={
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Hủy"
              icon="pi pi-times"
              onClick={closeDeleteDialog}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
            <Button
              type="button"
              label="Xóa dịch vụ"
              icon="pi pi-trash"
              onClick={confirmDelete}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d93b1f] !bg-[#d93b1f] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#c23218] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
            />
          </div>
        }
      >
        <p className="mb-2 text-sm text-slate-500 mt-0">Dịch vụ bị xóa sẽ không hiển thị trong danh sách đặt lịch.</p>
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa dịch vụ này?</p>
      </Dialog>

      <ShopServiceForm
        shopId={shopId}
        mode={formMode}
        service={targetService}
        initialServiceType={activeServiceType}
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
