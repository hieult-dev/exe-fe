import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { ProgressSpinner } from "primereact/progressspinner"
import { Sidebar } from "primereact/sidebar"
import { Tag } from "primereact/tag"
import type {
  CommissionInvoiceDetailDTO,
  CommissionInvoiceItemDTO,
  CommissionInvoiceStatus,
  CommissionSourceType,
} from "@/apps/platform-fees/model"
import { formatCurrencyVND, formatDateOnlyViVN, formatDateTimeViVN } from "@/common/utils/format"

type CommissionInvoiceDetailSidebarProps = {
  visible: boolean
  loading: boolean
  invoice: CommissionInvoiceDetailDTO | null
  onHide: () => void
  onPay: (invoiceId: number) => void
}

function getInvoiceStatusLabel(status: CommissionInvoiceStatus) {
  if (status === "PENDING") return "Chờ thanh toán"
  if (status === "PAID") return "Đã thanh toán"
  if (status === "OVERDUE") return "Quá hạn"
  return "Đã hủy"
}

function getInvoiceStatusSeverity(status: CommissionInvoiceStatus) {
  if (status === "PAID") return "success" as const
  if (status === "PENDING") return "warning" as const
  if (status === "OVERDUE") return "danger" as const
  return "secondary" as const
}

function getSourceTypeLabel(sourceType: CommissionSourceType) {
  if (sourceType === "ORDER") return "Đơn hàng"
  if (sourceType === "SERVICE_BOOKING") return "Dịch vụ spa"
  return "Lịch thú y"
}

function canPay(status: CommissionInvoiceStatus) {
  return status === "PENDING" || status === "OVERDUE"
}

function DetailMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-[#e5edf6] bg-[#f8fafc] px-3 py-3">
      <p className="m-0 text-xs font-semibold text-slate-500">{label}</p>
      <p className={`m-0 mt-1 text-sm font-bold ${highlight ? "text-rose-600" : "text-slate-900"}`}>{value}</p>
    </div>
  )
}

export function CommissionInvoiceDetailSidebar({ visible, loading, invoice, onHide, onPay }: CommissionInvoiceDetailSidebarProps) {
  const footer = (
    <div className="flex justify-center gap-2 border-t border-[#edf1f6] bg-white px-4 py-3">
      <Button
        type="button"
        label="Đóng"
        outlined
        onClick={onHide}
        className="!h-9 !rounded-md !border-[#d8e0ea] !bg-white !px-5 !py-0 !text-sm !font-semibold !text-slate-600 hover:!bg-slate-50"
      />
      {invoice && canPay(invoice.status) && (
        <Button
          type="button"
          label="Thanh toán ngay"
          icon="pi pi-qrcode"
          onClick={() => onPay(invoice.id)}
          className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-5 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-label]:!text-white"
        />
      )}
    </div>
  )

  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onHide}
      showCloseIcon
      className="w-full md:!w-[720px] xl:!w-[860px]"
      header={<span className="text-base font-bold text-slate-900">Chi tiết hóa đơn</span>}
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <ProgressSpinner strokeWidth="4" style={{ width: 44, height: 44 }} />
              <span>Đang tải chi tiết hóa đơn...</span>
            </div>
          ) : invoice ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-[#e5edf6] bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="m-0 text-xs font-semibold uppercase text-slate-500">Mã hóa đơn</p>
                    <h3 className="m-0 mt-1 text-base font-bold text-slate-900">{invoice.invoiceCode}</h3>
                  </div>
                  <Tag value={getInvoiceStatusLabel(invoice.status)} severity={getInvoiceStatusSeverity(invoice.status)} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailMetric label="Kỳ tính phí" value={`${formatDateOnlyViVN(invoice.periodFrom)} - ${formatDateOnlyViVN(invoice.periodTo)}`} />
                  <DetailMetric label="Ngày tạo hóa đơn" value={formatDateTimeViVN(invoice.createdAt)} />
                  <DetailMetric label="Hạn thanh toán" value={formatDateTimeViVN(invoice.dueAt)} />
                  <DetailMetric label="Số tiền cần thanh toán" value={formatCurrencyVND(invoice.totalCommissionAmount)} highlight />
                </div>
              </div>

              <div className="rounded-xl border border-[#e5edf6] bg-white p-4">
                <h4 className="m-0 mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">Danh sách giao dịch trong hóa đơn</h4>
                <DataTable
                  value={invoice.items ?? []}
                  dataKey="commissionId"
                  size="small"
                  stripedRows
                  scrollable
                  scrollHeight="360px"
                  emptyMessage={<div className="py-3 text-center text-sm text-slate-500">Hóa đơn chưa có giao dịch.</div>}
                  className="text-sm"
                >
                  <Column header="Loại giao dịch" body={(row: CommissionInvoiceItemDTO) => getSourceTypeLabel(row.sourceType)} />
                  <Column field="sourceCode" header="Mã giao dịch" body={(row: CommissionInvoiceItemDTO) => row.sourceCode || `#${row.sourceId}`} />
                  <Column header="Ngày hoàn thành" body={(row: CommissionInvoiceItemDTO) => formatDateTimeViVN(row.completedAt)} />
                  <Column header="Doanh thu" body={(row: CommissionInvoiceItemDTO) => formatCurrencyVND(row.grossAmount)} />
                  <Column header="Giảm giá" body={(row: CommissionInvoiceItemDTO) => formatCurrencyVND(row.discountAmount)} />
                  <Column header="Phí ship" body={(row: CommissionInvoiceItemDTO) => formatCurrencyVND(row.shippingFee)} />
                  <Column header="Giá trị tính phí" body={(row: CommissionInvoiceItemDTO) => formatCurrencyVND(row.commissionBase)} />
                  <Column header="Phí nền tảng" body={(row: CommissionInvoiceItemDTO) => formatCurrencyVND(row.commissionAmount)} />
                </DataTable>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
              <i className="pi pi-file text-2xl text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">Không tìm thấy chi tiết hóa đơn.</p>
            </div>
          )}
        </div>
        {footer}
      </div>
    </Sidebar>
  )
}
