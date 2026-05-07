import type { ReactNode } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Tag } from "primereact/tag"
import type { OrderDetailDTO, OrderItemDTO, OrderSource, OrderStatus } from "@/apps/orders/model"
import { formatCurrencyVND, formatDateTimeViVN } from "@/common/utils/format"

type ShopOrderDetailModalProps = {
  visible: boolean
  loading: boolean
  order: OrderDetailDTO | null
  onHide: () => void
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKING: "Đang đóng gói",
  WAITING_GHTK_PICKUP: "Chờ GHTK đến lấy",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
}

const ORDER_STATUS_SEVERITY: Record<OrderStatus, "success" | "info" | "warning" | "danger" | "secondary"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PACKING: "secondary",
  WAITING_GHTK_PICKUP: "info",
  SHIPPING: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
}

const ORDER_SOURCE_LABEL: Record<OrderSource, string> = {
  ONLINE: "Online",
  STAFF: "Nhân viên",
}

function getCustomerName(order: OrderDetailDTO) {
  return order.customer?.fullName || order.userFullName || (order.userId ? `User #${order.userId}` : "---")
}

function getCustomerContact(order: OrderDetailDTO) {
  return order.customer?.phone || order.userPhone || order.userEmail || "---"
}

function getCustomerEmail(order: OrderDetailDTO) {
  return order.customer?.email || order.userEmail || "---"
}

function deliveryAddress(order: OrderDetailDTO) {
  const address = order.customerAddress
  if (address) {
    return [address.address, address.hamlet, address.ward, address.district, address.province].filter(Boolean).join(", ") || "---"
  }

  const snapshot = order.shippingSnapshot
  if (snapshot) {
    return [snapshot.address, snapshot.street, snapshot.hamlet, snapshot.ward, snapshot.district, snapshot.province]
      .filter(Boolean)
      .join(", ") || "---"
  }

  return [
    order.shippingAddress,
    order.shippingStreet,
    order.shippingHamlet,
    order.shippingWard,
    order.shippingDistrict,
    order.shippingProvince,
  ]
    .filter(Boolean)
    .join(", ") || "---"
}

function itemNameBody(item: OrderItemDTO) {
  return (
    <div>
      <p className="m-0 text-sm font-semibold text-slate-800">{item.productName || `Sản phẩm #${item.productId}`}</p>
      <p className="m-0 mt-0.5 text-xs text-slate-400">Sản phẩm #{item.productId}</p>
    </div>
  )
}

function qtyBody(item: OrderItemDTO) {
  return <span className="font-semibold text-slate-700">{item.qty}</span>
}

function unitPriceBody(item: OrderItemDTO) {
  return <span>{formatCurrencyVND(item.unitPrice)}</span>
}

function amountBody(item: OrderItemDTO) {
  return <span className="font-semibold text-[#ef5c2c]">{formatCurrencyVND(item.amount)}</span>
}

function getOrderSubtotal(order: OrderDetailDTO) {
  return order.subtotalAmount ?? order.items.reduce((sum, item) => {
    const amount = item.amount ?? (item.unitPrice ?? 0) * Number(item.qty ?? 0)
    return sum + Number(amount ?? 0)
  }, 0)
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  )
}

export function ShopOrderDetailModal({ visible, loading, order, onHide }: ShopOrderDetailModalProps) {
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

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Chi tiết đơn hàng ${order?.orderCode || ""}`}
      style={{ width: "100%", maxWidth: "64rem" }}
      footer={footer}
    >
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
          <i className="pi pi-spinner pi-spin mr-2" />
          Đang tải chi tiết đơn hàng...
        </div>
      ) : order ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <InfoItem label="Mã đơn" value={order.orderCode} />
            </div>
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <InfoItem label="Nguồn" value={ORDER_SOURCE_LABEL[order.source] || order.source} />
            </div>
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</p>
              <Tag value={ORDER_STATUS_LABEL[order.status] || order.status} severity={ORDER_STATUS_SEVERITY[order.status]} />
            </div>
            <div className="rounded-xl border border-[#e2e8f0] p-4">
              <InfoItem label="Ngày tạo" value={formatDateTimeViVN(order.createdAt, "---")} />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Khách hàng</p>
              <div className="space-y-3">
                <InfoItem label="Họ tên" value={getCustomerName(order)} />
                <InfoItem label="Số điện thoại" value={getCustomerContact(order)} />
                <InfoItem label="Email" value={getCustomerEmail(order)} />
              </div>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] bg-[#fbfdff] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Thông tin giao hàng</p>
              <div className="space-y-3">
                <InfoItem label="Người nhận" value={order.customerAddress?.name || order.shippingSnapshot?.receiverName || order.receiverName || "---"} />
                <InfoItem label="Số điện thoại" value={order.customerAddress?.tel || order.shippingSnapshot?.receiverPhone || order.receiverPhone || "---"} />
                <InfoItem label="Địa chỉ" value={<p className="m-0 leading-6">{deliveryAddress(order)}</p>} />
              </div>
            </div>
          </div>

          {order.note && (
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Ghi chú</p>
              <p className="m-0 text-sm leading-6 text-slate-700">{order.note}</p>
            </div>
          )}

          <div className="rounded-xl border border-[#e2e8f0] bg-white">
            <DataTable
              value={order.items}
              size="small"
              rowHover
              emptyMessage={<div className="py-2 text-center text-sm text-slate-500">Đơn hàng chưa có sản phẩm.</div>}
            >
              <Column header="Sản phẩm" body={itemNameBody} />
              <Column header="SL" body={qtyBody} alignHeader="center" bodyStyle={{ textAlign: "center" }} style={{ width: "80px" }} />
              <Column header="Đơn giá" body={unitPriceBody} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ width: "140px" }} />
              <Column header="Thành tiền" body={amountBody} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ width: "150px" }} />
            </DataTable>
          </div>

          <div className="ml-auto w-full max-w-sm rounded-xl border border-[#e2e8f0] bg-[#fbfdff] p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span>Tạm tính</span>
                <span>{formatCurrencyVND(getOrderSubtotal(order))}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span>Phí giao hàng</span>
                <span>{formatCurrencyVND(order.shippingFee ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <span>Giảm giá</span>
                <span>-{formatCurrencyVND(order.discountAmount ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <span>Tổng tiền</span>
                <span className="text-[#ef5c2c]">{formatCurrencyVND(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
          <i className="pi pi-file-excel mb-2 text-2xl text-slate-300" />
          <p className="m-0 text-sm font-semibold text-slate-600">Không tìm thấy chi tiết đơn hàng.</p>
        </div>
      )}
    </Dialog>
  )
}
