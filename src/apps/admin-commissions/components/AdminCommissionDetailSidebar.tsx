import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { ProgressSpinner } from "primereact/progressspinner"
import { Sidebar } from "primereact/sidebar"
import { TabPanel, TabView } from "primereact/tabview"
import { Tag } from "primereact/tag"
import type {
  AdminCommissionCollectionStatus,
  AdminShopMonthlyCommissionDetailDTO,
} from "@/apps/admin-commissions/model"
import type {
  CommissionDTO,
  CommissionInvoiceDTO,
  CommissionInvoiceStatus,
  CommissionSourceType,
  CommissionStatus,
} from "@/apps/platform-fees/model"
import { formatCurrencyVND, formatDateOnlyViVN, formatDateTimeViVN } from "@/common/utils/format"
import { getImageUrlOrNotFound } from "@/common/utils/url"

type AdminCommissionDetailSidebarProps = {
  visible: boolean
  loading: boolean
  detail: AdminShopMonthlyCommissionDetailDTO | null
  onHide: () => void
}

function collectionStatusLabel(status: AdminCommissionCollectionStatus) {
  if (status === "OVERDUE") return "Có khoản quá hạn"
  if (status === "PAID") return "Đã thanh toán"
  return "Còn phải thu"
}

function collectionStatusSeverity(status: AdminCommissionCollectionStatus) {
  if (status === "OVERDUE") return "danger" as const
  if (status === "PAID") return "success" as const
  return "warning" as const
}

function commissionStatusLabel(status: CommissionStatus) {
  if (status === "PENDING") return "Chờ chốt kỳ"
  if (status === "INVOICED") return "Đã lên hóa đơn"
  if (status === "COLLECTED") return "Đã thu phí"
  if (status === "REFUNDED") return "Đã hoàn phí"
  return "Đã hủy"
}

function commissionStatusSeverity(status: CommissionStatus) {
  if (status === "COLLECTED") return "success" as const
  if (status === "INVOICED" || status === "PENDING") return "warning" as const
  if (status === "REFUNDED") return "info" as const
  return "secondary" as const
}

function invoiceStatusLabel(status: CommissionInvoiceStatus) {
  if (status === "PENDING") return "Chờ thanh toán"
  if (status === "PAID") return "Đã thanh toán"
  if (status === "OVERDUE") return "Quá hạn"
  return "Đã hủy"
}

function invoiceStatusSeverity(status: CommissionInvoiceStatus) {
  if (status === "PAID") return "success" as const
  if (status === "OVERDUE") return "danger" as const
  if (status === "PENDING") return "warning" as const
  return "secondary" as const
}

function sourceTypeLabel(sourceType: CommissionSourceType) {
  if (sourceType === "ORDER") return "Đơn hàng"
  if (sourceType === "SERVICE_BOOKING") return "Dịch vụ spa"
  return "Lịch thú y"
}

function DetailMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" | "success" }) {
  const valueClass = tone === "danger" ? "text-rose-600" : tone === "success" ? "text-emerald-600" : "text-slate-900"
  return (
    <div className="rounded-xl border border-[#e3eaf3] bg-[#f8fafc] p-3.5">
      <p className="m-0 text-xs font-semibold text-slate-500">{label}</p>
      <p className={`m-0 mt-2 text-base font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

export function AdminCommissionDetailSidebar({ visible, loading, detail, onHide }: AdminCommissionDetailSidebarProps) {
  const shop = detail?.shop

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onHide}
      showCloseIcon
      className="w-full md:!w-[820px] xl:!w-[980px]"
      header={<span className="text-base font-bold text-slate-900">Chi tiết hoa hồng của shop</span>}
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <ProgressSpinner strokeWidth="4" style={{ width: 46, height: 46 }} />
              <span>Đang tải chi tiết hoa hồng...</span>
            </div>
          ) : detail && shop ? (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-2xl border border-[#dce7f4] bg-gradient-to-br from-[#eef5ff] via-white to-[#f8fbff] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={getImageUrlOrNotFound(shop.shopImageUrl)}
                      alt={shop.shopName}
                      className="h-14 w-14 shrink-0 rounded-xl border border-white object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="m-0 truncate text-base font-bold text-[#1d3557]">{shop.shopName}</p>
                      <p className="m-0 mt-1 text-xs text-slate-500">
                        Mã shop #{shop.shopId} · {formatDateOnlyViVN(detail.periodFrom)} - {formatDateOnlyViVN(detail.periodTo)}
                      </p>
                    </div>
                  </div>
                  <Tag value={collectionStatusLabel(shop.status)} severity={collectionStatusSeverity(shop.status)} rounded />
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailMetric label="Hoa hồng phát sinh" value={formatCurrencyVND(shop.commissionAmount)} />
                <DetailMetric label="Còn phải thu" value={formatCurrencyVND(shop.outstandingAmount)} tone="danger" />
                <DetailMetric label="Đã thanh toán" value={formatCurrencyVND(shop.collectedAmount)} tone="success" />
                <DetailMetric label="Khoản quá hạn" value={formatCurrencyVND(shop.overdueAmount)} tone="danger" />
              </section>

              <div className="rounded-xl border border-[#e2e8f0] bg-white p-3 sm:p-4">
                <TabView
                  className="[&_.p-tabview-nav]:!mb-4 [&_.p-tabview-nav-link]:!px-4 [&_.p-tabview-nav-link]:!py-3 [&_.p-tabview-panels]:!p-0"
                  panelContainerClassName="!px-0 !pb-0"
                >
                  <TabPanel header={`Giao dịch (${detail.commissions.length})`} leftIcon="pi pi-list mr-2">
                    <DataTable
                      value={detail.commissions}
                      dataKey="id"
                      size="small"
                      stripedRows
                      rowHover
                      showGridlines
                      scrollable
                      scrollHeight="430px"
                      tableStyle={{ minWidth: "78rem" }}
                      emptyMessage={<div className="py-3 text-center text-sm text-slate-500">Tháng này chưa có giao dịch tính hoa hồng.</div>}
                    >
                      <Column header="Loại" body={(row: CommissionDTO) => sourceTypeLabel(row.sourceType)} />
                      <Column header="Mã giao dịch" body={(row: CommissionDTO) => row.sourceCode || `#${row.sourceId}`} />
                      <Column header="Hoàn thành" body={(row: CommissionDTO) => formatDateTimeViVN(row.completedAt)} />
                      <Column header="Doanh thu" body={(row: CommissionDTO) => formatCurrencyVND(row.grossAmount)} />
                      <Column header="Giá trị tính phí" body={(row: CommissionDTO) => formatCurrencyVND(row.commissionBase)} />
                      <Column header="Tỷ lệ" body={(row: CommissionDTO) => `${Number(row.commissionRateBps / 100).toLocaleString("vi-VN")}%`} />
                      <Column header="Hoa hồng" body={(row: CommissionDTO) => <span className="font-semibold text-[#214388]">{formatCurrencyVND(row.commissionAmount)}</span>} />
                      <Column header="Hóa đơn" body={(row: CommissionDTO) => row.invoiceCode || "Chưa lập"} />
                      <Column header="Trạng thái" body={(row: CommissionDTO) => <Tag value={commissionStatusLabel(row.status)} severity={commissionStatusSeverity(row.status)} />} />
                    </DataTable>
                  </TabPanel>

                  <TabPanel header={`Hóa đơn (${detail.invoices.length})`} leftIcon="pi pi-file mr-2">
                    <DataTable
                      value={detail.invoices}
                      dataKey="id"
                      size="small"
                      stripedRows
                      rowHover
                      showGridlines
                      tableStyle={{ minWidth: "58rem" }}
                      emptyMessage={<div className="py-3 text-center text-sm text-slate-500">Các khoản phát sinh trong tháng chưa được lập hóa đơn.</div>}
                    >
                      <Column field="invoiceCode" header="Mã hóa đơn" />
                      <Column header="Kỳ tính phí" body={(row: CommissionInvoiceDTO) => `${formatDateOnlyViVN(row.periodFrom)} - ${formatDateOnlyViVN(row.periodTo)}`} />
                      <Column header="Số tiền" body={(row: CommissionInvoiceDTO) => <span className="font-semibold">{formatCurrencyVND(row.totalCommissionAmount)}</span>} />
                      <Column header="Hạn thanh toán" body={(row: CommissionInvoiceDTO) => formatDateTimeViVN(row.dueAt)} />
                      <Column header="Ngày thanh toán" body={(row: CommissionInvoiceDTO) => formatDateTimeViVN(row.paidAt)} />
                      <Column header="Trạng thái" body={(row: CommissionInvoiceDTO) => <Tag value={invoiceStatusLabel(row.status)} severity={invoiceStatusSeverity(row.status)} />} />
                    </DataTable>
                  </TabPanel>
                </TabView>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <i className="pi pi-chart-bar text-xl" />
              </span>
              <p className="m-0 mt-3 text-sm font-medium text-slate-500">Không tìm thấy dữ liệu hoa hồng của shop.</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center border-t border-[#edf1f6] bg-white pt-3">
          <Button
            type="button"
            label="Đóng"
            outlined
            onClick={onHide}
            className="!h-9 !rounded-md !border-[#d8e0ea] !bg-white !px-6 !py-0 !text-sm !font-semibold !text-slate-600 hover:!bg-slate-50"
          />
        </div>
      </div>
    </Sidebar>
  )
}
