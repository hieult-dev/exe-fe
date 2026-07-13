import { Button } from "primereact/button"
import { Column, type ColumnBodyOptions } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Tag } from "primereact/tag"
import type { AdminCommissionCollectionStatus, AdminShopMonthlyCommissionDTO } from "@/apps/admin-commissions/model"
import { formatCurrencyVND } from "@/common/utils/format"
import { getImageUrlOrNotFound } from "@/common/utils/url"

type AdminCommissionTableProps = {
  rows: AdminShopMonthlyCommissionDTO[]
  totalRecords: number
  page: number
  pageSize: number
  loading: boolean
  onPageChange: (page: number, pageSize: number) => void
  onOpenDetail: (shop: AdminShopMonthlyCommissionDTO) => void
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

export function AdminCommissionTable({
  rows,
  totalRecords,
  page,
  pageSize,
  loading,
  onPageChange,
  onOpenDetail,
}: AdminCommissionTableProps) {
  const indexBody = (_row: AdminShopMonthlyCommissionDTO, options: ColumnBodyOptions) => (
    <div className="w-full text-center text-slate-500">{page * pageSize + options.rowIndex + 1}</div>
  )

  const shopBody = (shop: AdminShopMonthlyCommissionDTO) => (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={getImageUrlOrNotFound(shop.shopImageUrl)}
        alt={shop.shopName}
        className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover"
      />
      <div className="min-w-0">
        <p className="m-0 max-w-[220px] truncate text-sm font-semibold text-[#24364d]">{shop.shopName}</p>
        <p className="m-0 mt-1 text-xs text-slate-500">Mã shop #{shop.shopId}</p>
      </div>
    </div>
  )

  const outstandingBody = (shop: AdminShopMonthlyCommissionDTO) => (
    <div className="text-right">
      <p className={`m-0 font-semibold ${shop.outstandingAmount > 0 ? "text-amber-700" : "text-slate-500"}`}>
        {formatCurrencyVND(shop.outstandingAmount)}
      </p>
      {shop.outstandingAmount > 0 && (
        <p className="m-0 mt-1 text-[11px] text-slate-500">Chờ chốt {formatCurrencyVND(shop.pendingAmount)}</p>
      )}
    </div>
  )

  return (
    <section>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="m-0 text-base font-bold text-[#24364d]">Hoa hồng theo shop</h2>
          <p className="m-0 mt-1 text-xs text-slate-500">Số tiền được tổng hợp từ các giao dịch hoàn thành trong tháng đã chọn.</p>
        </div>
        <p className="m-0 text-sm text-slate-500">Tìm thấy {totalRecords} shop</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
        <DataTable
          value={rows}
          dataKey="shopId"
          size="small"
          stripedRows
          rowHover
          showGridlines
          lazy
          paginator
          first={page * pageSize}
          rows={pageSize}
          totalRecords={totalRecords}
          rowsPerPageOptions={[10, 20, 50]}
          onPage={(event) => onPageChange(event.page ?? 0, event.rows)}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          currentPageReportTemplate="Hiển thị {first}–{last} trong {totalRecords} shop"
          loading={loading}
          tableStyle={{ minWidth: "92rem" }}
          emptyMessage={
            <div className="flex min-h-36 flex-col items-center justify-center py-5 text-center text-[#4c5f78]">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <i className="pi pi-inbox text-lg" />
              </span>
              <p className="m-0 mt-3 text-sm font-semibold">Không có dữ liệu hoa hồng phù hợp</p>
              <p className="m-0 mt-1 text-xs text-slate-400">Hãy thử chọn tháng hoặc điều kiện lọc khác.</p>
            </div>
          }
        >
          <Column header="TT" body={indexBody} style={{ width: "64px" }} alignHeader="center" />
          <Column header="Shop" body={(row: AdminShopMonthlyCommissionDTO) => shopBody(row)} style={{ minWidth: "250px" }} />
          <Column field="transactionCount" header="Giao dịch" alignHeader="center" bodyStyle={{ textAlign: "center" }} style={{ minWidth: "100px" }} />
          <Column header="Doanh thu" body={(row: AdminShopMonthlyCommissionDTO) => formatCurrencyVND(row.grossAmount)} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ minWidth: "140px" }} />
          <Column header="Giá trị tính phí" body={(row: AdminShopMonthlyCommissionDTO) => formatCurrencyVND(row.commissionBase)} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ minWidth: "150px" }} />
          <Column header="Hoa hồng phát sinh" body={(row: AdminShopMonthlyCommissionDTO) => <span className="font-semibold text-[#214388]">{formatCurrencyVND(row.commissionAmount)}</span>} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ minWidth: "170px" }} />
          <Column header="Đã thanh toán" body={(row: AdminShopMonthlyCommissionDTO) => <span className="font-medium text-emerald-700">{formatCurrencyVND(row.collectedAmount)}</span>} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ minWidth: "150px" }} />
          <Column header="Còn phải thu" body={(row: AdminShopMonthlyCommissionDTO) => outstandingBody(row)} alignHeader="right" style={{ minWidth: "170px" }} />
          <Column header="Quá hạn" body={(row: AdminShopMonthlyCommissionDTO) => <span className={row.overdueAmount > 0 ? "font-semibold text-rose-600" : "text-slate-400"}>{formatCurrencyVND(row.overdueAmount)}</span>} alignHeader="right" bodyStyle={{ textAlign: "right" }} style={{ minWidth: "130px" }} />
          <Column header="Trạng thái" body={(row: AdminShopMonthlyCommissionDTO) => <Tag value={collectionStatusLabel(row.status)} severity={collectionStatusSeverity(row.status)} rounded />} alignHeader="center" bodyStyle={{ textAlign: "center" }} style={{ minWidth: "160px" }} />
          <Column
            header="Thao tác"
            body={(row: AdminShopMonthlyCommissionDTO) => (
              <Button
                type="button"
                label="Chi tiết"
                icon="pi pi-eye"
                outlined
                onClick={() => onOpenDetail(row)}
                className="!h-8 !rounded-md !border-[#cdd8e6] !bg-white !px-3 !py-0 !text-xs !font-semibold !text-[#40526b] hover:!bg-[#f4f7fb]"
              />
            )}
            alignHeader="center"
            bodyStyle={{ textAlign: "center" }}
            style={{ minWidth: "120px" }}
          />
        </DataTable>
      </div>
    </section>
  )
}
