import { useCallback, useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog"
import { DataTable } from "primereact/datatable"
import type { MenuItem } from "primereact/menuitem"
import { Tag } from "primereact/tag"
import { Toolbar } from "primereact/toolbar"
import { approveAdminShop, getAdminShopById, getAdminShops, rejectAdminShop, sendAdminShopEmail } from "@/apps/admin/api/adminShopApi"
import { AdminShopFeedbackEmailDialog } from "@/apps/admin/components/AdminShopFeedbackEmailDialog"
import { AdminShopDetailDialog } from "@/apps/admin/components/AdminShopDetailDialog"
import type { AdminShopDTO } from "@/apps/admin/model"
import { adminShopStatusLabel } from "@/apps/admin/model"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import { notify } from "@/common/toast/ToastHelper"
import { formatDateTimeViVN } from "@/common/utils/format"

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { message?: string; error?: string } | undefined
  return apiError?.message || apiError?.error || fallback
}

function statusSeverity(status: string) {
  if (status === "ACTIVE") return "success" as const
  if (status === "PENDING_APPROVAL") return "warning" as const
  if (status === "REJECTED") return "danger" as const
  return "info" as const
}

function emptyValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Chưa có" : String(value)
}

export function AdminShopApprovalPage() {
  const [shops, setShops] = useState<AdminShopDTO[]>([])
  const [selectedShop, setSelectedShop] = useState<AdminShopDTO | null>(null)
  const [feedbackTarget, setFeedbackTarget] = useState<AdminShopDTO | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mutatingShopId, setMutatingShopId] = useState<number | null>(null)
  const [detailLoadingShopId, setDetailLoadingShopId] = useState<number | null>(null)
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)

  const loadPendingShops = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await getAdminShops("PENDING_APPROVAL")
      setShops(result)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải danh sách shop chờ duyệt."))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPendingShops()
  }, [loadPendingShops])

  const approveShop = async (shop: AdminShopDTO) => {
    setMutatingShopId(shop.id)

    try {
      await approveAdminShop(shop.id)
      notify.success(`Đã duyệt shop ${shop.name}.`)
      await loadPendingShops()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể duyệt shop."))
    } finally {
      setMutatingShopId(null)
    }
  }

  const rejectShop = async (shop: AdminShopDTO) => {
    setMutatingShopId(shop.id)

    try {
      await rejectAdminShop(shop.id)
      notify.success(`Đã từ chối shop ${shop.name}.`)
      await loadPendingShops()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể từ chối shop."))
    } finally {
      setMutatingShopId(null)
    }
  }

  const requestApprove = (shop: AdminShopDTO) => {
    confirmDialog({
      header: "Duyệt shop",
      message: `Bạn có chắc muốn duyệt shop ${shop.name}? Chủ shop sẽ được kích hoạt sau khi duyệt.`,
      icon: "pi pi-check-circle",
      acceptLabel: "Duyệt",
      rejectLabel: "Hủy",
      acceptClassName: "p-button-success",
      accept: () => void approveShop(shop),
    })
  }

  const requestReject = (shop: AdminShopDTO) => {
    confirmDialog({
      header: "Từ chối shop",
      message: `Bạn có chắc muốn từ chối shop ${shop.name}? Các thành viên của shop sẽ chuyển sang không hoạt động.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Từ chối",
      rejectLabel: "Hủy",
      acceptClassName: "p-button-danger",
      accept: () => void rejectShop(shop),
    })
  }

  const openShopDetail = async (shop: AdminShopDTO) => {
    setDetailLoadingShopId(shop.id)

    try {
      const detail = await getAdminShopById(shop.id)
      setSelectedShop(detail)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể tải chi tiết shop."))
    } finally {
      setDetailLoadingShopId(null)
    }
  }

  const sendFeedbackEmail = async (title: string, content: string) => {
    if (!feedbackTarget) return

    setIsSendingFeedback(true)

    try {
      await sendAdminShopEmail(feedbackTarget.id, { title, content })
      notify.success(`Đã gửi phản hồi đến shop ${feedbackTarget.name}.`)
      setFeedbackTarget(null)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không thể gửi email phản hồi."))
    } finally {
      setIsSendingFeedback(false)
    }
  }

  const indexBody = (_shop: AdminShopDTO, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const shopBody = (shop: AdminShopDTO) => {
    return (
      <div className="min-w-0">
        <p className="m-0 truncate text-sm font-semibold text-slate-800">{shop.name}</p>
        <p className="m-0 mt-1 truncate text-xs text-slate-500">Mã shop: {shop.id}</p>
      </div>
    )
  }

  const emailBody = (shop: AdminShopDTO) => {
    return <div className="w-full break-words text-center text-[#4c5f78]">{emptyValue(shop.owner?.email)}</div>
  }

  const addressBody = (shop: AdminShopDTO) => {
    return <div className="max-w-[360px] whitespace-normal break-words text-[#4c5f78]">{emptyValue(shop.addressText)}</div>
  }

  const statusBody = (shop: AdminShopDTO) => {
    return (
      <div className="flex w-full justify-center">
        <Tag value={adminShopStatusLabel(shop.status)} severity={statusSeverity(shop.status)} rounded />
      </div>
    )
  }

  const actionsBody = (shop: AdminShopDTO) => {
    const disabled = mutatingShopId !== null || detailLoadingShopId !== null || isSendingFeedback || isLoading
    const isDetailLoading = detailLoadingShopId === shop.id
    const actionItems: MenuItem[] = [
      {
        label: "Xem chi tiết",
        icon: isDetailLoading ? "pi pi-spin pi-spinner" : "pi pi-eye",
        disabled,
        command: () => void openShopDetail(shop),
      },
      {
        label: "Phản hồi",
        icon: "pi pi-envelope",
        disabled,
        command: () => setFeedbackTarget(shop),
      },
      {
        label: "Duyệt shop",
        icon: "pi pi-check",
        disabled,
        command: () => requestApprove(shop),
      },
      {
        label: "Từ chối shop",
        icon: "pi pi-times",
        disabled,
        command: () => requestReject(shop),
      },
    ]

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
              <h1 className="text-lg font-semibold text-slate-800">Duyệt shop</h1>
              <p className="mt-0.5 text-sm text-slate-500">Danh sách shop đang chờ quản trị viên hệ thống phê duyệt.</p>
            </div>
          }
          end={
            <Button
              type="button"
              label="Làm mới"
              icon="pi pi-refresh"
              loading={isLoading}
              onClick={() => void loadPendingShops()}
              className="!h-9 !rounded-md !border-none !bg-white !px-3 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f4f7fb] [&_.p-button-icon]:!text-[#40526b] [&_.p-button-label]:!text-[#40526b]"
            />
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <div className="space-y-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#24364d]">Shop chờ duyệt</p>
                <p className="text-sm text-[#73849b]">Duyệt để kích hoạt shop và chủ shop, hoặc từ chối để khóa yêu cầu đăng ký.</p>
              </div>
              <p className="text-sm text-[#73849b]">Hiển thị {shops.length} shop</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
              <DataTable
                value={shops}
                dataKey="id"
                size="small"
                stripedRows
                rowHover
                showGridlines
                loading={isLoading || mutatingShopId !== null || detailLoadingShopId !== null}
                tableStyle={{ minWidth: "78rem" }}
                emptyMessage={<div className="w-full py-2 text-center text-[#4c5f78]">Không có shop nào đang chờ duyệt.</div>}
              >
                <Column header="TT" body={indexBody} style={{ width: "64px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="name" header="Shop" body={(shop) => shopBody(shop as AdminShopDTO)} style={{ minWidth: "220px" }} />
                <Column field="owner.email" header="Email" body={(shop) => emailBody(shop as AdminShopDTO)} style={{ minWidth: "220px" }} alignHeader="center" />
                <Column field="addressText" header="Địa chỉ" body={(shop) => addressBody(shop as AdminShopDTO)} style={{ minWidth: "280px" }} />
                <Column field="status" header="Trạng thái" body={(shop) => statusBody(shop as AdminShopDTO)} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="createdAt" header="Ngày đăng ký" body={(shop) => <div className="w-full text-center text-[#4c5f78]">{emptyValue(formatDateTimeViVN((shop as AdminShopDTO).createdAt))}</div>} style={{ minWidth: "170px" }} alignHeader="center" />
                <Column header="Thao tác" body={(shop) => actionsBody(shop as AdminShopDTO)} style={{ width: "110px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <AdminShopDetailDialog
        shop={selectedShop}
        visible={selectedShop !== null}
        onClose={() => setSelectedShop(null)}
      />
      <AdminShopFeedbackEmailDialog
        shop={feedbackTarget}
        visible={feedbackTarget !== null}
        sending={isSendingFeedback}
        onClose={() => setFeedbackTarget(null)}
        onSubmit={(title, content) => void sendFeedbackEmail(title, content)}
      />
    </>
  )
}
