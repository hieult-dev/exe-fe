import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Tag } from "primereact/tag"
import type { InvoiceDetailDTO, InvoiceLineDTO, InvoiceLineType, InvoicePaymentMethod, InvoiceStatus } from "@/apps/invoices/model"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"

export type InvoiceDetailReference = {
  code?: string | null
  customerName?: string | null
  customerPhone?: string | null
  delivery?: {
    name?: string | null
    tel?: string | null
    address?: string | null
    street?: string | null
    hamlet?: string | null
    ward?: string | null
    district?: string | null
    province?: string | null
  } | null
  emptyMessage?: string
}

type InvoiceDetailDialogProps = {
  visible: boolean
  loading: boolean
  invoice: InvoiceDetailDTO | null
  reference?: InvoiceDetailReference | null
  onHide: () => void
}

const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  ISSUED: "Đã phát hành",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
}

const INVOICE_STATUS_SEVERITY: Record<InvoiceStatus, "success" | "info" | "danger"> = {
  ISSUED: "info",
  PAID: "success",
  CANCELLED: "danger",
}

const PAYMENT_METHOD_LABEL: Record<InvoicePaymentMethod, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
}

const LINE_TYPE_LABEL: Record<InvoiceLineType, string> = {
  PRODUCT: "Sản phẩm",
  SERVICE: "Dịch vụ",
  PACKAGE_REDEEM: "Gói dịch vụ",
  ADJUSTMENT: "Điều chỉnh",
}

const LINE_TYPE_SEVERITY: Record<InvoiceLineType, "success" | "info" | "warning" | "secondary"> = {
  PRODUCT: "info",
  SERVICE: "success",
  PACKAGE_REDEEM: "warning",
  ADJUSTMENT: "secondary",
}

export function InvoiceDetailDialog({ visible, loading, invoice, reference, onHide }: InvoiceDetailDialogProps) {
  const customerName = reference?.customerName || "Khách lẻ"
  const customerPhone = reference?.customerPhone || "---"
  const delivery = reference?.delivery
  const deliveryAddress =
    [delivery?.address, delivery?.street, delivery?.hamlet, delivery?.ward, delivery?.district, delivery?.province].filter(Boolean).join(", ") || "---"
  const hasDeliveryInfo = Boolean(
    delivery?.name || delivery?.tel || delivery?.address || delivery?.street || delivery?.hamlet || delivery?.ward || delivery?.district || delivery?.province,
  )

  const footer = (
    <div className="mt-4 flex justify-center">
      <Button
        type="button"
        label="Đóng"
        icon="pi pi-times"
        onClick={onHide}
        className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border-none !bg-[#fee2e2] !px-4 !py-0 !text-sm !font-semibold !text-[#b42318] hover:!bg-[#fecaca] [&_.p-button-icon]:!text-[#b42318] [&_.p-button-label]:!text-[#b42318]"
      />
    </div>
  )

  const lineTypeBody = (line: InvoiceLineDTO) => (
    <Tag value={LINE_TYPE_LABEL[line.lineType] || line.lineType} severity={LINE_TYPE_SEVERITY[line.lineType] || "info"} />
  )
  const itemNameBody = (line: InvoiceLineDTO) => (
    <div>
      <p className="m-0 text-sm font-semibold text-slate-800">{line.itemName}</p>
      <p className="m-0 mt-0.5 text-xs text-slate-400">Ref #{line.refId}</p>
    </div>
  )
  const qtyBody = (line: InvoiceLineDTO) => <span className="font-semibold text-slate-700">{line.qty}</span>
  const unitPriceBody = (line: InvoiceLineDTO) => <span>{formatCurrencyVND(line.unitPrice)}</span>
  const amountBody = (line: InvoiceLineDTO) => <span className="font-semibold text-[#ef5c2c]">{formatCurrencyVND(line.amount)}</span>

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Hóa đơn ${invoice ? `#${invoice.id}` : reference?.code || ""}`}
      style={{ width: "100%", maxWidth: "58rem" }}
      footer={footer}
    >
      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
          <i className="pi pi-spinner pi-spin mr-2" />
          Đang tải hóa đơn...
        </div>
      ) : invoice ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Khách hàng</p>
              <p className="m-0 text-sm font-semibold text-slate-800">{customerName}</p>
              <p className="m-0 mt-1 text-xs text-slate-500">{customerPhone}</p>
            </div>
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Thanh toán</p>
              <p className="m-0 text-lg font-bold text-[#ef5c2c]">{formatCurrencyVND(invoice.totalAmount)}</p>
              <p className="m-0 mt-1 text-xs text-slate-500">
                {invoice.paymentMethod ? PAYMENT_METHOD_LABEL[invoice.paymentMethod] : "Chưa thanh toán"}
              </p>
            </div>
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</p>
              <Tag value={INVOICE_STATUS_LABEL[invoice.status] || invoice.status} severity={INVOICE_STATUS_SEVERITY[invoice.status]} />
              <p className="m-0 mt-2 text-xs text-slate-500">{formatDateTimeViVN(invoice.issuedAt, "---")}</p>
            </div>
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Thời gian</p>
              <p className="m-0 text-xs text-slate-500">Ngày tạo</p>
              <p className="m-0 text-sm font-semibold text-slate-800">{formatDateTimeViVN(invoice.createdAt, "---")}</p>
              <p className="m-0 mt-2 text-xs text-slate-500">Cập nhật</p>
              <p className="m-0 text-sm font-semibold text-slate-800">{formatDateTimeViVN(invoice.updatedAt, "---")}</p>
            </div>
          </div>

          {hasDeliveryInfo && (
            <div className="rounded-xl border border-[#e2e8f0] bg-[#fbfdff] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Thông tin giao hàng</p>
              <div className="grid gap-3 md:grid-cols-[minmax(0,14rem),minmax(0,1fr)]">
                <div>
                  <p className="m-0 text-sm font-semibold text-slate-800">{delivery?.name || "---"}</p>
                  <p className="m-0 mt-1 text-xs text-slate-500">{delivery?.tel || "---"}</p>
                </div>
                <p className="m-0 text-sm font-medium leading-6 text-slate-700">{deliveryAddress}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#e2e8f0] bg-white">
            <DataTable
              value={invoice.lines}
              dataKey="id"
              size="small"
              rowHover
              emptyMessage={<div className="py-2 text-center text-sm text-slate-500">Hóa đơn chưa có dòng hàng.</div>}
            >
              <Column header="Loại" body={lineTypeBody} style={{ width: "120px" }} />
              <Column header="Mặt hàng" body={itemNameBody} />
              <Column header="SL" body={qtyBody} alignHeader="center" bodyStyle={{ textAlign: "center" }} style={{ width: "80px" }} />
              <Column header="Đơn giá" body={unitPriceBody} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ width: "140px" }} />
              <Column header="Thành tiền" body={amountBody} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ width: "150px" }} />
            </DataTable>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
          <i className="pi pi-file-excel mb-2 text-2xl text-slate-300" />
          <p className="m-0 text-sm font-semibold text-slate-600">{reference?.emptyMessage || "Không tìm thấy hóa đơn."}</p>
        </div>
      )}
    </Dialog>
  )
}
