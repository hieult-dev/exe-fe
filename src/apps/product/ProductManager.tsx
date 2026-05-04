import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { Toolbar } from "primereact/toolbar"
import { TableActionMenu } from "@/common/component/TableActionMenu"
import { useShopOwnerContext } from "@/common/store/ShopOwnerContext"
import { notify } from "@/common/toast/ToastHelper"
import { formatCurrencyVND } from "@/common/utils/format"
import {
  deleteProduct,
  getProducts,
} from "@/apps/product/api/productApi"
import { ProductForm, type ProductFormMode } from "@/apps/product/components/ProductForm"
import {
  ACTIVE_FILTER_OPTIONS,
  type ActiveFilter,
  type ProductDTO,
} from "@/apps/product/model"

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) return message
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function activeLabel(active: boolean) {
  return active ? "Đang kích hoạt" : "Tạm ẩn"
}

function activeClass(active: boolean) {
  return active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
}

function buildSummary(products: ProductDTO[]) {
  return {
    total: products.length,
    active: products.filter((item) => item.active).length,
    inStock: products.filter((item) => item.stockQty > 0).length,
  }
}

export function ProductManager() {
  const { globalSearchQuery } = useShopOwnerContext()
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const [productFormMode, setProductFormMode] = useState<ProductFormMode>(null)
  const [productFormTargetId, setProductFormTargetId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadProducts = async (isLoadMore = false, nextActiveFilter = activeFilter, nextKeyword = globalSearchQuery) => {
    if (isLoadMore) {
      if (!hasNext || isLoadingMore || nextCursor === null) return
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const active = nextActiveFilter === "ALL" ? null : nextActiveFilter === "ACTIVE"
      const currentCursor = isLoadMore ? nextCursor : null
      const result = await getProducts(20, currentCursor, nextKeyword, active)
      const mapped = result.content

      if (isLoadMore) {
        setProducts((prev) => {
          const prevIds = new Set(prev.map((product) => product.id))
          const uniqueNew = mapped.filter((product) => !prevIds.has(product.id))
          return [...prev, ...uniqueNew]
        })
      } else {
        setProducts(mapped)
      }

      setNextCursor(result.nextCursor ?? null)
      setHasNext(result.hasNext ?? false)
    } catch (error) {
      notify.error(getErrorMessage(error, "Không tải được danh sách sản phẩm."))
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadProducts(false)
  }, [activeFilter, globalSearchQuery])

  useEffect(() => {
    if (isLoading || isLoadingMore || !hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadProducts(true)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [activeFilter, globalSearchQuery, hasNext, isLoading, isLoadingMore, nextCursor])

  const summary = useMemo(() => buildSummary(products), [products])

  const visibleProducts = useMemo(() => {
    return [...products].sort((first, second) => Number(second.active) - Number(first.active))
  }, [products])

  const closeDeleteDialog = () => {
    setDeletingId(null)
    setIsDeleteOpen(false)
  }

  const closeProductForm = () => {
    setProductFormMode(null)
    setProductFormTargetId(null)
  }

  const openCreateForm = () => {
    setProductFormTargetId(null)
    setProductFormMode("CREATE")
  }

  const openProductMode = (mode: Exclude<ProductFormMode, null | "CREATE">, id: number) => {
    setProductFormTargetId(id)
    setProductFormMode(mode)
  }

  const requestDelete = (id: number) => {
    setDeletingId(id)
    setIsDeleteOpen(true)
  }

  const handleRefreshView = () => {
    setActiveFilter("ALL")
    closeProductForm()
    closeDeleteDialog()
    loadProducts(false, "ALL")
  }

  const handleProductSaved = (savedProduct: ProductDTO, mode: "CREATE" | "EDIT") => {
    setProducts((prev) =>
      mode === "EDIT"
        ? prev.map((product) => (product.id === savedProduct.id ? savedProduct : product))
        : [savedProduct, ...prev],
    )
    closeProductForm()
  }

  const confirmDelete = async () => {
    if (deletingId === null) return

    try {
      await deleteProduct(deletingId)
      setProducts((prev) => prev.filter((item) => item.id !== deletingId))
      notify.success("Đã xóa sản phẩm.")
      closeDeleteDialog()
    } catch (error) {
      notify.error(getErrorMessage(error, "Không xóa được sản phẩm."))
    }
  }

  const indexBody = (_item: unknown, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const productBody = (product: ProductDTO) => {
    return (
      <div className="w-full text-center">
        <p className="font-semibold text-[#24364d]">{product.name}</p>
      </div>
    )
  }

  const centeredText = (value: string | number | null) => <div className="w-full text-center text-[#4c5f78]">{value ?? "—"}</div>

  const priceBody = (product: ProductDTO) => {
    return <div className="w-full text-center font-semibold text-[#ef5c2c]">{formatCurrencyVND(product.price)}</div>
  }

  const stockQtyBody = (product: ProductDTO) => (
    <div className="w-full text-center font-semibold text-[#24364d]">{product.stockQty}</div>
  )

  const activeBody = (product: ProductDTO) => {
    return (
      <div className="flex w-full justify-center">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${activeClass(product.active)}`}>
          {activeLabel(product.active)}
        </span>
      </div>
    )
  }

  const productActionsBody = (product: ProductDTO) => {
    const actionItems = [
      {
        label: "Xem chi tiết",
        icon: "pi pi-eye",
        command: () => openProductMode("VIEW", product.id),
      },
      {
        label: "Chỉnh sửa",
        icon: "pi pi-pencil",
        command: () => openProductMode("EDIT", product.id),
      },
      {
        label: "Xóa",
        icon: "pi pi-trash",
        className: "text-red-500",
        command: () => requestDelete(product.id),
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
              <h1 className="text-lg font-semibold text-slate-800">Quản lý sản phẩm</h1>
              <p className="mt-0.5 text-sm text-slate-500">Quản lý sản phẩm bán ra, danh mục, giá bán và ảnh sản phẩm.</p>
            </div>
          }
          end={
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm leading-none text-[#52657e]">
                <i className="pi pi-filter h-4 w-4 shrink-0 text-[#70829a]" />
                <span className="leading-none">Trạng thái</span>
                <Dropdown
                  value={activeFilter}
                  options={ACTIVE_FILTER_OPTIONS}
                  onChange={(event) => setActiveFilter(event.value as ActiveFilter)}
                  className="!flex !h-8 !min-w-24 !items-center !border-none !shadow-none [&_.p-dropdown-label]:!flex [&_.p-dropdown-label]:!items-center [&_.p-dropdown-label]:!py-0 [&_.p-dropdown-label]:!pl-0 [&_.p-dropdown-label]:!pr-2 [&_.p-dropdown-label]:!text-sm [&_.p-dropdown-label]:!leading-none [&_.p-dropdown-trigger]:!w-7"
                  panelClassName="text-sm"
                />
              </label>

              <Button
                label="Thêm sản phẩm"
                icon="pi pi-plus"
                onClick={openCreateForm}
                className="!h-9 !rounded-md !border-[#214388] !bg-[#214388] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#19356a] [&_.p-button-icon]:!text-white [&_.p-button-label]:!text-white"
              />
              <Button
                label="Làm mới"
                icon="pi pi-refresh"
                outlined
                onClick={handleRefreshView}
                className="!h-9 !rounded-md !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-medium !text-[#40526b] hover:!bg-[#f8fafc]"
              />
            </div>
          }
        />

        <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard icon="pi pi-box" label="Tổng sản phẩm" value={summary.total.toString()} color="blue" />
              <StatCard icon="pi pi-check-circle" label="Đang kinh doanh" value={summary.active.toString()} color="emerald" />
              <StatCard icon="pi pi-warehouse" label="Còn hàng" value={summary.inStock.toString()} color="amber" />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#24364d]">Danh sách sản phẩm</p>
                <p className="text-sm text-[#73849b]">Theo dõi danh mục, giá bán, tồn kho và trạng thái kinh doanh của từng sản phẩm.</p>
              </div>
              <p className="text-sm text-[#73849b]">Hiển thị {visibleProducts.length}/{products.length} mục</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
              <DataTable
                value={visibleProducts}
                dataKey="id"
                size="small"
                stripedRows
                rowHover
                showGridlines
                loading={isLoading}
                tableStyle={{ minWidth: "72rem" }}
                emptyMessage="Chưa có sản phẩm nào."
              >
                <Column header="TT" body={indexBody} style={{ width: "64px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="sku" header="SKU" body={(product) => centeredText((product as ProductDTO).sku)} style={{ minWidth: "150px" }} alignHeader="center" />
                <Column field="name" header="Sản phẩm" body={productBody} style={{ minWidth: "220px" }} alignHeader="center" />
                <Column
                  field="categoryName"
                  header="Danh mục"
                  body={(product) => centeredText((product as ProductDTO).categoryName)}
                  style={{ minWidth: "160px" }}
                  alignHeader="center"
                />
                <Column field="unit" header="Đơn vị" body={(product) => centeredText((product as ProductDTO).unit)} style={{ minWidth: "110px" }} alignHeader="center" />
                <Column field="price" header="Giá bán" body={priceBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="stockQty" header="Tồn kho" body={stockQtyBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="active" header="Kích hoạt" body={activeBody} style={{ minWidth: "130px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Thao tác" body={productActionsBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
              </DataTable>
              {(hasNext || isLoadingMore) && (
                <div ref={observerTarget} className="flex h-12 w-full items-center justify-center p-4">
                  {isLoadingMore ? (
                    <i className="pi pi-spinner pi-spin text-xl text-[#4c5f78]" />
                  ) : (
                    <span className="text-sm text-transparent text-slate-500">Cuộn xuống để xem thêm</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductForm
        mode={productFormMode}
        productId={productFormTargetId}
        onClose={closeProductForm}
        onEdit={(id) => openProductMode("EDIT", id)}
        onSaved={handleProductSaved}
      />

      <Dialog
        visible={isDeleteOpen}
        onHide={closeDeleteDialog}
        header="Xác nhận xóa sản phẩm"
        style={{ width: "100%", maxWidth: "30rem" }}
        footer={
          <div className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              label="Hủy"
              onClick={closeDeleteDialog}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d9e1eb] !bg-white !px-4 !py-0 !text-sm !font-semibold !text-[#40526b] hover:!bg-[#f8fafc]"
            />
            <Button
              type="button"
              label="Xóa sản phẩm"
              icon="pi pi-trash"
              onClick={confirmDelete}
              className="!m-0 !inline-flex !h-10 !items-center !justify-center !rounded-lg !border !border-[#d93b1f] !bg-[#d93b1f] !px-4 !py-0 !text-sm !font-semibold !text-white hover:!bg-[#c23218]"
            />
          </div>
        }
      >
        <p className="mb-2 mt-0 text-sm text-[#73849b]">Sản phẩm bị xóa sẽ không còn xuất hiện trong danh sách.</p>
        <p className="text-sm text-slate-600">Bạn chắc chắn muốn xóa sản phẩm này?</p>
      </Dialog>
    </>
  )
}

type StatCardProps = {
  icon: string
  label: string
  value: string
  color: "blue" | "emerald" | "amber" | "red"
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const borderMap = {
    blue: "border-sky-200",
    emerald: "border-emerald-200",
    amber: "border-amber-200",
    red: "border-rose-200",
  }
  const bgMap = {
    blue: "bg-sky-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    red: "bg-rose-50",
  }
  const iconColorMap = {
    blue: "text-sky-500",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-rose-500",
  }

  return (
    <div className={`rounded-xl border ${borderMap[color]} ${bgMap[color]} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        <i className={`${icon} h-5 w-5 ${iconColorMap[color]}`} />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="text-3xl font-bold leading-none text-[#24364d]">{value}</p>
    </div>
  )
}
