import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Tag } from "primereact/tag"
import { formatCurrencyVND } from "@/common/utils/format"
import { NOT_FOUND_IMAGE_URL } from "@/common/utils/url"
import { canAddSaleItem, getSaleItemTypeLabel, type SaleCatalogItem } from "@/apps/staff/model"

type SaleCatalogCardProps = {
  item: SaleCatalogItem
  onAdd: (item: SaleCatalogItem) => void
}

export function SaleCatalogCard({ item, onAdd }: SaleCatalogCardProps) {
  const canAdd = canAddSaleItem(item)
  const imageSrc = item.type === "PRODUCT" ? item.imageUrl || NOT_FOUND_IMAGE_URL : item.imageUrl
  const stockLabel =
    item.type === "PRODUCT"
      ? Number(item.stockQty ?? 0) > 0
        ? `Còn ${item.stockQty}`
        : "Hết hàng"
      : `${item.durationMin ?? 0} phút`

  return (
    <Card className="h-full !rounded-lg !border !border-slate-100 !bg-white !shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex h-full flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={item.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = NOT_FOUND_IMAGE_URL
                }}
              />
            ) : (
              <i className={`${item.type === "PRODUCT" ? "pi pi-box" : "pi pi-sparkles"} text-2xl`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex min-w-0 items-center gap-2">
              <Tag
                value={getSaleItemTypeLabel(item.type)}
                severity={item.type === "PRODUCT" ? "info" : "success"}
                className="!inline-flex !h-6 !shrink-0 !items-center !whitespace-nowrap !rounded-md !px-2 !py-0 !text-[11px] !font-semibold [&_.p-tag-value]:!whitespace-nowrap"
              />
              <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{item.code || item.category || "Đang bán"}</span>
            </div>
            <h3 className="m-0 line-clamp-2 text-sm font-semibold leading-5 text-slate-800">{item.name}</h3>
            <p className="mb-0 mt-1 truncate text-xs text-slate-500">{item.category || item.unitLabel}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <p className="m-0 text-base font-bold text-[#214388]">{formatCurrencyVND(item.unitPrice)}</p>
            <p className={`m-0 text-xs ${canAdd ? "text-slate-500" : "text-rose-600"}`}>{stockLabel}</p>
          </div>
          <Button
            type="button"
            icon="pi pi-plus"
            label="Thêm"
            size="small"
            disabled={!canAdd}
            className="!rounded-lg"
            onClick={() => onAdd(item)}
          />
        </div>
      </div>
    </Card>
  )
}
