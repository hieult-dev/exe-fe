import { useCallback, useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog"
import { DataTable } from "primereact/datatable"
import { Dropdown } from "primereact/dropdown"
import type { MenuItem } from "primereact/menuitem"
import { Tag } from "primereact/tag"
import { Toolbar } from "primereact/toolbar"
import {
  createShopPaymentConfig,
  deleteShopPaymentConfig,
  getShopPaymentConfigById,
  getShopPaymentConfigs,
  updateShopPaymentConfig,
} from "@/apps/payment_config/api/shopPaymentConfigApi"
import {
  PaymentConfigEditorSidebar,
  type PaymentConfigEditorMode,
} from "@/apps/payment_config/components/PaymentConfigEditorSidebar"
import type {
  ShopPaymentConfigApiError,
  ShopPaymentConfigDTO,
  ShopPaymentConfigRequest,
} from "@/apps/payment_config/model"
import { useUserStore } from "@/apps/user/store/UserStore"
import { resolveCurrentAuthShop } from "@/common/auth/utils/shopAccess"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import { notify } from "@/common/toast/ToastHelper"
import { formatDateTimeViVN } from "@/common/utils/format"

type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE"

const activeFilterOptions: { label: string; value: ActiveFilter }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đang bật", value: "ACTIVE" },
  { label: "Đang tắt", value: "INACTIVE" },
]

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ShopPaymentConfigApiError> | undefined
  return apiError?.message || fallback
}

function activeParamFromFilter(filter: ActiveFilter) {
  if (filter === "ACTIVE") return true
  if (filter === "INACTIVE") return false
  return null
}

export function ShopPaymentConfigPage() {
  const currentShopId = useUserStore((state) => state.currentShopId)
  const shops = useUserStore((state) => state.shops)
  const currentShop = resolveCurrentAuthShop(shops, currentShopId)
  const [configs, setConfigs] = useState<ShopPaymentConfigDTO[]>([])
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL")
  const [editorMode, setEditorMode] = useState<PaymentConfigEditorMode>(null)
  const [editorConfig, setEditorConfig] = useState<ShopPaymentConfigDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isMutating, setIsMutating] = useState(false)

  const loadConfigs = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await getShopPaymentConfigs({ active: activeParamFromFilter(activeFilter) })
      setConfigs(result)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải danh sách cấu hình ngân hàng."))
    } finally {
      setIsLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    void loadConfigs()
  }, [loadConfigs])

  const openCreateForm = () => {
    setEditorConfig(null)
    setEditorMode("CREATE")
  }

  const openEditForm = async (config: ShopPaymentConfigDTO) => {
    setIsMutating(true)

    try {
      const freshConfig = await getShopPaymentConfigById(config.id)
      setEditorConfig(freshConfig)
      setEditorMode("EDIT")
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được cấu hình ngân hàng."))
    } finally {
      setIsMutating(false)
    }
  }

  const closeEditor = () => {
    if (isSaving) return
    setEditorConfig(null)
    setEditorMode(null)
  }

  const handleSubmitConfig = async (request: ShopPaymentConfigRequest) => {
    if (editorMode === "EDIT" && !editorConfig) {
      notify.error("Không xác định được cấu hình cần cập nhật.")
      return
    }

    setIsSaving(true)

    try {
      const savedConfig =
        editorMode === "CREATE"
          ? await createShopPaymentConfig(request)
          : await updateShopPaymentConfig(editorConfig!.id, request)

      setConfigs((prev) => {
        if (editorMode === "CREATE") return [savedConfig, ...prev]
        return prev.map((config) => (config.id === savedConfig.id ? savedConfig : config))
      })

      setEditorConfig(null)
      setEditorMode(null)
      notify.success(editorMode === "CREATE" ? "Đã tạo cấu hình ngân hàng." : "Đã cập nhật cấu hình ngân hàng.")
      await loadConfigs()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể lưu cấu hình ngân hàng."))
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (config: ShopPaymentConfigDTO) => {
    setIsMutating(true)

    try {
      const freshConfig = await getShopPaymentConfigById(config.id)
      const nextActive = !freshConfig.active
      const savedConfig = await updateShopPaymentConfig(freshConfig.id, {
        bankCode: freshConfig.bankCode,
        accountNumber: freshConfig.accountNumber,
        accountName: freshConfig.accountName,
        displayName: freshConfig.displayName,
        active: nextActive,
      })

      setConfigs((prev) => prev.map((item) => (item.id === savedConfig.id ? savedConfig : item)))
      notify.success(nextActive ? "Đã bật cấu hình ngân hàng." : "Đã tắt cấu hình ngân hàng.")
      await loadConfigs()
    } catch (error) {
      notify.error(getErrorMessage(error, config.active ? "Không thể tắt cấu hình ngân hàng." : "Không thể bật cấu hình ngân hàng."))
    } finally {
      setIsMutating(false)
    }
  }

  const requestDelete = (config: ShopPaymentConfigDTO) => {
    confirmDialog({
      header: "Xóa cấu hình ngân hàng",
      message: `Bạn có chắc muốn xóa cấu hình ${config.displayName}?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Xóa",
      rejectLabel: "Hủy",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setIsMutating(true)

        try {
          await deleteShopPaymentConfig(config.id)
          setConfigs((prev) => prev.filter((item) => item.id !== config.id))
          notify.success("Đã xóa cấu hình ngân hàng.")
        } catch (error) {
          notify.error(getErrorMessage(error, "Không thể xóa cấu hình ngân hàng."))
        } finally {
          setIsMutating(false)
        }
      },
    })
  }

  const indexBody = (_config: ShopPaymentConfigDTO, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const centeredText = (value: string | number | null | undefined) => {
    const text = value === null || value === undefined || value === "" ? "—" : String(value)
    return <div className="w-full text-center text-[#4c5f78]">{text}</div>
  }

  const activeBody = (config: ShopPaymentConfigDTO) => {
    return (
      <div className="flex w-full justify-center">
        <Tag value={config.active ? "Đang bật" : "Đang tắt"} severity={config.active ? "success" : "danger"} rounded />
      </div>
    )
  }

  const actionsBody = (config: ShopPaymentConfigDTO) => {
    const actionItems: MenuItem[] = [
      {
        label: "Chỉnh sửa",
        icon: "pi pi-pencil",
        command: () => void openEditForm(config),
      },
    ]

    actionItems.push({
      label: config.active ? "Tắt trạng thái" : "Bật trạng thái",
      icon: config.active ? "pi pi-eye-slash" : "pi pi-eye",
      command: () => void handleToggleActive(config),
    })

    actionItems.push({
      label: "Xóa",
      icon: "pi pi-trash",
      command: () => requestDelete(config),
    })

    return <TableActionMenu items={actionItems} />
  }

  return (
    <>
      <ConfirmDialog />
      <div className="flex flex-1 flex-col gap-2">
        <Toolbar
          className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          start={
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Cấu hình ngân hàng</h1>
              <p className="mt-0.5 text-sm text-slate-500">Tài khoản nhận chuyển khoản của {currentShop?.name ?? "cửa hàng hiện tại"}.</p>
            </div>
          }
          end={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm leading-none text-[#52657e]">
                <i className="pi pi-filter h-4 w-4 shrink-0 text-[#70829a]" />
                <span className="leading-none">Trạng thái</span>
                <Dropdown
                  value={activeFilter}
                  options={activeFilterOptions}
                  optionLabel="label"
                  optionValue="value"
                  filter
                  filterBy="label,value"
                  emptyFilterMessage="Không tìm thấy trạng thái"
                  onChange={(event) => setActiveFilter(event.value as ActiveFilter)}
                  className="!flex !h-8 !min-w-28 !items-center !border-none !shadow-none [&_.p-dropdown-label]:!flex [&_.p-dropdown-label]:!items-center [&_.p-dropdown-label]:!py-0 [&_.p-dropdown-label]:!pl-0 [&_.p-dropdown-label]:!pr-2 [&_.p-dropdown-label]:!text-sm [&_.p-dropdown-label]:!leading-none [&_.p-dropdown-trigger]:!w-7"
                  panelClassName="text-sm"
                />
              </label>
              <Button
                type="button"
                label="Làm mới"
                icon="pi pi-refresh"
                loading={isLoading}
                onClick={() => void loadConfigs()}
                className="!h-9 !rounded-md !border-none !bg-white !px-3 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f4f7fb] [&_.p-button-icon]:!text-[#40526b] [&_.p-button-label]:!text-[#40526b]"
              />
              <Button
                type="button"
                label="Thêm cấu hình"
                icon="pi pi-plus"
                onClick={openCreateForm}
                className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
              />
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <div className="space-y-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#24364d]">Danh sách cấu hình</p>
                <p className="text-sm text-[#73849b]">Danh sách tài khoản nhận chuyển khoản cho QR thanh toán.</p>
              </div>
              <p className="text-sm text-[#73849b]">Hiển thị {configs.length} mục</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
              <DataTable
                value={configs}
                dataKey="id"
                size="small"
                stripedRows
                rowHover
                showGridlines
                loading={isLoading || isMutating}
                tableStyle={{ minWidth: "72rem" }}
                emptyMessage={<div className="w-full py-2 text-center text-[#4c5f78]">Chưa có cấu hình ngân hàng.</div>}
              >
                <Column header="TT" body={indexBody} style={{ width: "64px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="displayName" header="Tên hiển thị" body={(config) => centeredText((config as ShopPaymentConfigDTO).displayName)} style={{ minWidth: "190px" }} alignHeader="center" />
                <Column field="bankCode" header="Mã ngân hàng" body={(config) => centeredText((config as ShopPaymentConfigDTO).bankCode)} style={{ minWidth: "150px" }} alignHeader="center" />
                <Column field="accountNumber" header="Số tài khoản" body={(config) => centeredText((config as ShopPaymentConfigDTO).accountNumber)} style={{ minWidth: "170px" }} alignHeader="center" />
                <Column field="accountName" header="Tên chủ tài khoản" body={(config) => centeredText((config as ShopPaymentConfigDTO).accountName)} style={{ minWidth: "220px" }} alignHeader="center" />
                <Column field="active" header="Trạng thái" body={(config) => activeBody(config as ShopPaymentConfigDTO)} style={{ minWidth: "130px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="updatedAt" header="Cập nhật" body={(config) => centeredText(formatDateTimeViVN((config as ShopPaymentConfigDTO).updatedAt))} style={{ minWidth: "160px" }} alignHeader="center" />
                <Column header="Thao tác" body={(config) => actionsBody(config as ShopPaymentConfigDTO)} style={{ minWidth: "110px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <PaymentConfigEditorSidebar
        mode={editorMode}
        config={editorConfig}
        saving={isSaving}
        onClose={closeEditor}
        onSubmit={handleSubmitConfig}
      />
    </>
  )
}
