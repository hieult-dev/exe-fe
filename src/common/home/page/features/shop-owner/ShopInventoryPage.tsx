import { useMemo, useState, type FormEvent } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import type { ColumnBodyOptions } from "primereact/column"
import { AppDialog } from "@/common/component/AppDialog"
import { useShopOwnerContext } from "@/common/home/page/features/shop-owner/store/ShopOwnerContext"
import {
  createLocalId,
  formatCurrencyVND,
  resolveInventoryStockState,
  type InventoryStockState,
  type ShopInventoryMaterial,
  type ShopInventoryProduct,
} from "@/common/home/page/features/shop-owner/store/shopOwnerStore"

type InventoryTab = "PRODUCTS" | "MATERIALS"
type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE"
type StockFilter = "ALL" | "IN_STOCK" | "LOW" | "OUT"

type ProductFormState = {
  name: string
  sku: string
  category: string
  sellPrice: string
  stockQty: string
  reorderLevel: string
  description: string
  imageUrl: string
  active: boolean
}

type MaterialFormState = {
  name: string
  code: string
  unit: string
  stockQty: string
  reorderLevel: string
  note: string
  active: boolean
}

const emptyProductForm: ProductFormState = {
  name: "",
  sku: "",
  category: "",
  sellPrice: "",
  stockQty: "",
  reorderLevel: "",
  description: "",
  imageUrl: "",
  active: true,
}

const emptyMaterialForm: MaterialFormState = {
  name: "",
  code: "",
  unit: "chai",
  stockQty: "",
  reorderLevel: "",
  note: "",
  active: true,
}

function toProductForm(product: ShopInventoryProduct): ProductFormState {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    sellPrice: String(product.sellPrice),
    stockQty: String(product.stockQty),
    reorderLevel: String(product.reorderLevel),
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    active: product.active,
  }
}

function toMaterialForm(material: ShopInventoryMaterial): MaterialFormState {
  return {
    name: material.name,
    code: material.code,
    unit: material.unit,
    stockQty: String(material.stockQty),
    reorderLevel: String(material.reorderLevel),
    note: material.note || "",
    active: material.active,
  }
}

function stockStateLabel(state: InventoryStockState) {
  if (state === "OUT") return "Hết hàng"
  if (state === "LOW") return "Sắp hết"
  return "Ổn định"
}

function stockStateClass(state: InventoryStockState) {
  if (state === "OUT") return "bg-rose-100 text-rose-700"
  if (state === "LOW") return "bg-amber-100 text-amber-700"
  return "bg-emerald-100 text-emerald-700"
}

function activeLabel(active: boolean) {
  return active ? "Đang kích hoạt" : "Tạm ẩn"
}

function activeClass(active: boolean) {
  return active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
}

function matchesActiveFilter(active: boolean, filter: ActiveFilter) {
  if (filter === "ACTIVE") return active
  if (filter === "INACTIVE") return !active
  return true
}

function matchesStockFilter(state: InventoryStockState, filter: StockFilter) {
  if (filter === "IN_STOCK") return state === "OK"
  if (filter === "LOW") return state === "LOW"
  if (filter === "OUT") return state === "OUT"
  return true
}

function buildSummary(items: { active: boolean; stockQty: number; reorderLevel: number }[]) {
  const low = items.filter((item) => resolveInventoryStockState(item.stockQty, item.reorderLevel) === "LOW").length
  const out = items.filter((item) => resolveInventoryStockState(item.stockQty, item.reorderLevel) === "OUT").length

  return {
    total: items.length,
    active: items.filter((item) => item.active).length,
    low,
    out,
  }
}

export function ShopInventoryPage() {
  const { data, setInventoryMaterials, setInventoryProducts } = useShopOwnerContext()
  const [activeTab, setActiveTab] = useState<InventoryTab>("PRODUCTS")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL")
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [productFormState, setProductFormState] = useState<ProductFormState>(emptyProductForm)
  const [materialFormState, setMaterialFormState] = useState<MaterialFormState>(emptyMaterialForm)
  const [formError, setFormError] = useState("")

  const isProductTab = activeTab === "PRODUCTS"
  const productSummary = useMemo(() => buildSummary(data.inventory.products), [data.inventory.products])
  const materialSummary = useMemo(() => buildSummary(data.inventory.materials), [data.inventory.materials])

  const visibleProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return data.inventory.products.filter((item) => {
      const stockState = resolveInventoryStockState(item.stockQty, item.reorderLevel)
      const matchesKeyword =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.sku.toLowerCase().includes(keyword)

      return matchesKeyword && matchesActiveFilter(item.active, activeFilter) && matchesStockFilter(stockState, stockFilter)
    })
  }, [activeFilter, data.inventory.products, searchQuery, stockFilter])

  const visibleMaterials = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return data.inventory.materials.filter((item) => {
      const stockState = resolveInventoryStockState(item.stockQty, item.reorderLevel)
      const matchesKeyword =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword)

      return matchesKeyword && matchesActiveFilter(item.active, activeFilter) && matchesStockFilter(stockState, stockFilter)
    })
  }, [activeFilter, data.inventory.materials, searchQuery, stockFilter])

  const summary = isProductTab ? productSummary : materialSummary
  const totalItems = isProductTab ? data.inventory.products.length : data.inventory.materials.length
  const visibleItems = isProductTab ? visibleProducts.length : visibleMaterials.length

  const resetCurrentForm = () => {
    if (isProductTab) {
      setProductFormState(emptyProductForm)
      return
    }

    setMaterialFormState(emptyMaterialForm)
  }

  const closeFormDialog = () => {
    setEditingId(null)
    setFormError("")
    setIsFormOpen(false)
    resetCurrentForm()
  }

  const closeDeleteDialog = () => {
    setDeletingId(null)
    setIsDeleteOpen(false)
  }

  const switchTab = (tab: InventoryTab) => {
    setActiveTab(tab)
    setSearchQuery("")
    setActiveFilter("ALL")
    setStockFilter("ALL")
    setFormError("")
    setEditingId(null)
    setDeletingId(null)
    setIsFormOpen(false)
    setIsDeleteOpen(false)
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setFormError("")
    resetCurrentForm()
    setIsFormOpen(true)
  }

  const openEditProductDialog = (product: ShopInventoryProduct) => {
    setEditingId(product.id)
    setProductFormState(toProductForm(product))
    setFormError("")
    setIsFormOpen(true)
  }

  const openEditMaterialDialog = (material: ShopInventoryMaterial) => {
    setEditingId(material.id)
    setMaterialFormState(toMaterialForm(material))
    setFormError("")
    setIsFormOpen(true)
  }

  const requestDelete = (id: string) => {
    setDeletingId(id)
    setIsDeleteOpen(true)
  }

  const handleRefreshView = () => {
    setSearchQuery("")
    setActiveFilter("ALL")
    setStockFilter("ALL")
    closeFormDialog()
    closeDeleteDialog()
  }

  const handleSave = (event: FormEvent) => {
    event.preventDefault()

    if (isProductTab) {
      const name = productFormState.name.trim()
      const sku = productFormState.sku.trim().toUpperCase()
      const category = productFormState.category.trim()
      const sellPrice = Number(productFormState.sellPrice)
      const stockQty = Number(productFormState.stockQty)
      const reorderLevel = Number(productFormState.reorderLevel)

      if (!name || !sku || !category) {
        setFormError("Vui lòng nhập đầy đủ tên, SKU và danh mục sản phẩm.")
        return
      }

      if ([sellPrice, stockQty, reorderLevel].some((value) => Number.isNaN(value) || value < 0)) {
        setFormError("Giá bán, tồn kho và mức cảnh báo phải là số >= 0.")
        return
      }

      const duplicated = data.inventory.products.find(
        (item) => item.sku.toLowerCase() === sku.toLowerCase() && item.id !== editingId
      )

      if (duplicated) {
        setFormError("SKU này đã tồn tại trong kho sản phẩm.")
        return
      }

      const nextProduct: ShopInventoryProduct = {
        id: editingId || createLocalId("prd"),
        name,
        sku,
        category,
        sellPrice,
        stockQty,
        reorderLevel,
        active: productFormState.active,
        description: productFormState.description.trim() || undefined,
        imageUrl: productFormState.imageUrl.trim() || undefined,
      }

      setInventoryProducts(
        editingId
          ? data.inventory.products.map((item) => (item.id === editingId ? nextProduct : item))
          : [nextProduct, ...data.inventory.products]
      )

      closeFormDialog()
      return
    }

    const name = materialFormState.name.trim()
    const code = materialFormState.code.trim().toUpperCase()
    const unit = materialFormState.unit.trim()
    const stockQty = Number(materialFormState.stockQty)
    const reorderLevel = Number(materialFormState.reorderLevel)

    if (!name || !code || !unit) {
      setFormError("Vui lòng nhập đầy đủ tên, mã vật tư và đơn vị.")
      return
    }

    if ([stockQty, reorderLevel].some((value) => Number.isNaN(value) || value < 0)) {
      setFormError("Tồn kho và mức cảnh báo phải là số >= 0.")
      return
    }

    const duplicated = data.inventory.materials.find(
      (item) => item.code.toLowerCase() === code.toLowerCase() && item.id !== editingId
    )

    if (duplicated) {
      setFormError("Mã vật tư này đã tồn tại trong kho.")
      return
    }

    const nextMaterial: ShopInventoryMaterial = {
      id: editingId || createLocalId("mat"),
      name,
      code,
      unit,
      stockQty,
      reorderLevel,
      active: materialFormState.active,
      note: materialFormState.note.trim() || undefined,
    }

    setInventoryMaterials(
      editingId
        ? data.inventory.materials.map((item) => (item.id === editingId ? nextMaterial : item))
        : [nextMaterial, ...data.inventory.materials]
    )

    closeFormDialog()
  }

  const confirmDelete = () => {
    if (!deletingId) return

    if (isProductTab) {
      setInventoryProducts(data.inventory.products.filter((item) => item.id !== deletingId))
    } else {
      setInventoryMaterials(data.inventory.materials.filter((item) => item.id !== deletingId))
    }

    closeDeleteDialog()
  }

  const indexBody = (_item: unknown, options: ColumnBodyOptions) => {
    return <div className="w-full text-center">{options.rowIndex + 1}</div>
  }

  const productBody = (product: ShopInventoryProduct) => {
    return (
      <div className="w-full text-center">
        <p className="font-semibold text-[#24364d]">{product.name}</p>
        <p className="text-xs text-[#73849b]">{product.sku}</p>
      </div>
    )
  }

  const materialBody = (material: ShopInventoryMaterial) => {
    return (
      <div className="w-full text-center">
        <p className="font-semibold text-[#24364d]">{material.name}</p>
        <p className="text-xs text-[#73849b]">{material.note || "Không có ghi chú"}</p>
      </div>
    )
  }

  const centeredText = (value: string | number) => <div className="w-full text-center text-[#4c5f78]">{value}</div>

  const priceBody = (product: ShopInventoryProduct) => {
    return <div className="w-full text-center font-semibold text-[#ef5c2c]">{formatCurrencyVND(product.sellPrice)}</div>
  }

  const stockQtyBody = (item: { stockQty: number }) => <div className="w-full text-center font-semibold text-[#24364d]">{item.stockQty}</div>

  const reorderLevelBody = (item: { reorderLevel: number }) => <div className="w-full text-center text-[#4c5f78]">{item.reorderLevel}</div>

  const stockStateBody = (item: { stockQty: number; reorderLevel: number }) => {
    const stockState = resolveInventoryStockState(item.stockQty, item.reorderLevel)

    return (
      <div className="flex w-full justify-center">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${stockStateClass(stockState)}`}>
          {stockStateLabel(stockState)}
        </span>
      </div>
    )
  }

  const activeBody = (item: { active: boolean }) => {
    return (
      <div className="flex w-full justify-center">
        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${activeClass(item.active)}`}>
          {activeLabel(item.active)}
        </span>
      </div>
    )
  }

  const productActionsBody = (product: ShopInventoryProduct) => {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => openEditProductDialog(product)}
          title="Sửa sản phẩm"
          aria-label="Sửa sản phẩm"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d7dfe9] bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <i className="pi pi-pencil h-4 w-4" />
        </button>
        <button
          onClick={() => requestDelete(product.id)}
          title="Xóa sản phẩm"
          aria-label="Xóa sản phẩm"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#f0c2b7] bg-white text-[#c73d1e] transition hover:bg-[#fff4f1]"
        >
          <i className="pi pi-trash h-4 w-4" />
        </button>
      </div>
    )
  }

  const materialActionsBody = (material: ShopInventoryMaterial) => {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => openEditMaterialDialog(material)}
          title="Sửa vật tư"
          aria-label="Sửa vật tư"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d7dfe9] bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <i className="pi pi-pencil h-4 w-4" />
        </button>
        <button
          onClick={() => requestDelete(material.id)}
          title="Xóa vật tư"
          aria-label="Xóa vật tư"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#f0c2b7] bg-white text-[#c73d1e] transition hover:bg-[#fff4f1]"
        >
          <i className="pi pi-trash h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[#dbe3ed] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e7edf4] bg-[#fbfcfe] px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div>
            <h1 className="text-lg font-semibold text-[#24364d]">Quản lý kho</h1>
            <p className="mt-1 text-sm text-[#74849a]">Quản lý sản phẩm bán ra và vật tư phục vụ cho các gói dịch vụ.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              onClick={openCreateDialog}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#214388] px-4 text-sm font-semibold text-white transition hover:bg-[#19356a]"
            >
              <i className="pi pi-plus h-4 w-4" />
              {isProductTab ? "Thêm sản phẩm" : "Thêm vật tư"}
            </button>

            <button
              onClick={handleRefreshView}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-4 text-sm font-medium text-[#40526b] transition hover:bg-[#f8fafc]"
            >
              <i className="pi pi-refresh h-4 w-4" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="space-y-5 px-4 py-4 lg:px-5 lg:py-5">
          <div className="inline-flex rounded-xl border border-[#d9e1eb] bg-[#f8fafc] p-1">
            <button
              type="button"
              onClick={() => switchTab("PRODUCTS")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${isProductTab ? "bg-white text-[#214388] shadow-sm" : "text-[#5a6c84] hover:text-[#214388]"
                }`}
            >
              <i className="pi pi-box h-4 w-4" />
              Sản phẩm
            </button>
            <button
              type="button"
              onClick={() => switchTab("MATERIALS")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${!isProductTab ? "bg-white text-[#214388] shadow-sm" : "text-[#5a6c84] hover:text-[#214388]"
                }`}
            >
              <i className="pi pi-cog h-4 w-4" />
              Vật tư
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label={isProductTab ? "Tổng sản phẩm" : "Tổng vật tư"} value={String(summary.total)} />
            <SummaryCard label="Đang kích hoạt" value={String(summary.active)} />
            <SummaryCard label="Sắp hết" value={String(summary.low)} />
            <SummaryCard label="Hết hàng" value={String(summary.out)} />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex min-h-10 flex-1 items-center gap-2 rounded-md border border-[#d9e1eb] bg-[#fbfcfe] px-3">
              <i className="pi pi-search h-4 w-4 text-[#70829a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={isProductTab ? "Tìm theo tên sản phẩm hoặc SKU..." : "Tìm theo tên vật tư hoặc mã vật tư..."}
                className="w-full border-0 bg-transparent text-sm text-[#24364d] outline-none placeholder:text-[#8ca0b8]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-filter h-4 w-4 text-[#70829a]" />
                <span>Trạng thái</span>
                <select
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
                  className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Đang kích hoạt</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
              </label>

              <label className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d9e1eb] bg-white px-3 text-sm text-[#52657e]">
                <i className="pi pi-filter h-4 w-4 text-[#70829a]" />
                <span>Tồn kho</span>
                <select
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value as StockFilter)}
                  className="border-0 bg-transparent font-medium text-[#24364d] outline-none"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="IN_STOCK">Ổn định</option>
                  <option value="LOW">Sắp hết</option>
                  <option value="OUT">Hết hàng</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#24364d]">{isProductTab ? "Danh sách sản phẩm" : "Danh sách vật tư"}</p>
              <p className="text-sm text-[#73849b]">
                {isProductTab
                  ? "Theo dõi giá bán, tồn kho và khả năng kinh doanh của từng sản phẩm."
                  : "Theo dõi vật tư tiêu hao và mức cảnh báo cho khu dịch vụ."}
              </p>
            </div>
            <p className="text-sm text-[#73849b]">Hiển thị {visibleItems}/{totalItems} mục</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
            {isProductTab ? (
              <DataTable
                value={visibleProducts}
                dataKey="id"
                size="small"
                stripedRows
                rowHover
                showGridlines
                tableStyle={{ minWidth: "76rem" }}
                emptyMessage="Chưa có sản phẩm nào trong kho."
              >
                <Column header="TT" body={indexBody} style={{ width: "64px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="name" header="Sản phẩm" body={productBody} style={{ minWidth: "220px" }} alignHeader="center" />
                <Column field="category" header="Danh mục" body={(product) => centeredText((product as ShopInventoryProduct).category)} style={{ minWidth: "140px" }} alignHeader="center" />
                <Column field="sellPrice" header="Giá bán" body={priceBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="stockQty" header="Tồn kho" body={stockQtyBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="reorderLevel" header="Mức cảnh báo" body={reorderLevelBody} style={{ minWidth: "130px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="stockState" header="Trạng thái kho" body={stockStateBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="active" header="Kích hoạt" body={activeBody} style={{ minWidth: "130px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Thao tác" body={productActionsBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
              </DataTable>
            ) : (
              <DataTable
                value={visibleMaterials}
                dataKey="id"
                size="small"
                stripedRows
                rowHover
                showGridlines
                tableStyle={{ minWidth: "74rem" }}
                emptyMessage="Chưa có vật tư nào trong kho."
              >
                <Column header="TT" body={indexBody} style={{ width: "64px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="name" header="Vật tư" body={materialBody} style={{ minWidth: "220px" }} alignHeader="center" />
                <Column field="code" header="Mã vật tư" body={(material) => centeredText((material as ShopInventoryMaterial).code)} style={{ minWidth: "150px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="unit" header="Đơn vị" body={(material) => centeredText((material as ShopInventoryMaterial).unit)} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="stockQty" header="Tồn kho" body={stockQtyBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="reorderLevel" header="Mức cảnh báo" body={reorderLevelBody} style={{ minWidth: "130px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="stockState" header="Trạng thái kho" body={stockStateBody} style={{ minWidth: "140px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column field="active" header="Kích hoạt" body={activeBody} style={{ minWidth: "130px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
                <Column header="Thao tác" body={materialActionsBody} style={{ minWidth: "120px" }} alignHeader="center" bodyStyle={{ textAlign: "center" }} />
              </DataTable>
            )}
          </div>
        </div>
      </section>

      <AppDialog
        open={isFormOpen}
        onClose={closeFormDialog}
        title={isProductTab ? (editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới") : editingId ? "Cập nhật vật tư" : "Thêm vật tư mới"}
        description={isProductTab ? "Quản lý sản phẩm bán ra và tồn kho hiện tại của shop." : "Quản lý vật tư sử dụng trong quá trình vận hành và dịch vụ."}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeFormDialog}
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="shop-inventory-form"
              className="rounded-lg bg-[#214388] px-4 py-2 text-sm font-semibold text-white hover:bg-[#19356a]"
            >
              {editingId ? "Lưu thay đổi" : isProductTab ? "Tạo sản phẩm" : "Tạo vật tư"}
            </button>
          </>
        }
      >
        <form id="shop-inventory-form" onSubmit={handleSave} className="space-y-3">
          {formError && <div className="rounded-lg bg-[#fff4f1] px-3 py-2 text-sm text-[#c73d1e]">{formError}</div>}

          {isProductTab ? (
            <div className="grid gap-3 md:grid-cols-2">
              <InputField
                label="Tên sản phẩm"
                value={productFormState.name}
                required
                onChange={(value) => setProductFormState((prev) => ({ ...prev, name: value }))}
              />
              <InputField
                label="SKU"
                value={productFormState.sku}
                required
                onChange={(value) => setProductFormState((prev) => ({ ...prev, sku: value }))}
              />
              <InputField
                label="Danh mục"
                value={productFormState.category}
                required
                onChange={(value) => setProductFormState((prev) => ({ ...prev, category: value }))}
              />
              <InputField
                label="Giá bán (VND)"
                type="number"
                value={productFormState.sellPrice}
                required
                onChange={(value) => setProductFormState((prev) => ({ ...prev, sellPrice: value }))}
              />
              <InputField
                label="Tồn kho"
                type="number"
                value={productFormState.stockQty}
                required
                onChange={(value) => setProductFormState((prev) => ({ ...prev, stockQty: value }))}
              />
              <InputField
                label="Mức cảnh báo"
                type="number"
                value={productFormState.reorderLevel}
                required
                onChange={(value) => setProductFormState((prev) => ({ ...prev, reorderLevel: value }))}
              />
              <InputField
                label="Image URL"
                type="url"
                value={productFormState.imageUrl}
                onChange={(value) => setProductFormState((prev) => ({ ...prev, imageUrl: value }))}
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:mt-7">
                <input
                  type="checkbox"
                  checked={productFormState.active}
                  onChange={(event) => setProductFormState((prev) => ({ ...prev, active: event.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Kích hoạt sản phẩm
              </label>
              <TextAreaField
                label="Mô tả"
                value={productFormState.description}
                onChange={(value) => setProductFormState((prev) => ({ ...prev, description: value }))}
                className="md:col-span-2"
              />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <InputField
                label="Tên vật tư"
                value={materialFormState.name}
                required
                onChange={(value) => setMaterialFormState((prev) => ({ ...prev, name: value }))}
              />
              <InputField
                label="Mã vật tư"
                value={materialFormState.code}
                required
                onChange={(value) => setMaterialFormState((prev) => ({ ...prev, code: value }))}
              />
              <InputField
                label="Đơn vị"
                value={materialFormState.unit}
                required
                onChange={(value) => setMaterialFormState((prev) => ({ ...prev, unit: value }))}
              />
              <InputField
                label="Tồn kho"
                type="number"
                value={materialFormState.stockQty}
                required
                onChange={(value) => setMaterialFormState((prev) => ({ ...prev, stockQty: value }))}
              />
              <InputField
                label="Mức cảnh báo"
                type="number"
                value={materialFormState.reorderLevel}
                required
                onChange={(value) => setMaterialFormState((prev) => ({ ...prev, reorderLevel: value }))}
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:mt-7">
                <input
                  type="checkbox"
                  checked={materialFormState.active}
                  onChange={(event) => setMaterialFormState((prev) => ({ ...prev, active: event.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Kích hoạt vật tư
              </label>
              <TextAreaField
                label="Ghi chú"
                value={materialFormState.note}
                onChange={(value) => setMaterialFormState((prev) => ({ ...prev, note: value }))}
                className="md:col-span-2"
              />
            </div>
          )}
        </form>
      </AppDialog>

      <AppDialog
        open={isDeleteOpen}
        onClose={closeDeleteDialog}
        title={isProductTab ? "Xác nhận xóa sản phẩm" : "Xác nhận xóa vật tư"}
        description={isProductTab ? "Sản phẩm bị xóa sẽ không còn xuất hiện trong kho nội bộ." : "Vật tư bị xóa sẽ không còn được theo dõi trong kho."}
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteDialog}
              className="rounded-lg bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#ecf1f8]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-[#d93b1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c23218]"
            >
              {isProductTab ? "Xóa sản phẩm" : "Xóa vật tư"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">{isProductTab ? "Bạn chắc chắn muốn xóa sản phẩm này?" : "Bạn chắc chắn muốn xóa vật tư này?"}</p>
      </AppDialog>
    </>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e5ebf3] bg-white p-4">
      <p className="text-sm text-[#70829a]">{label}</p>
      <p className="mt-2 text-[1.8rem] font-semibold leading-none text-[#24364d]">{value}</p>
    </div>
  )
}

type InputFieldProps = {
  label: string
  value: string
  required?: boolean
  type?: "text" | "number" | "url"
  onChange: (value: string) => void
}

function InputField({ label, value, required = false, type = "text", onChange }: InputFieldProps) {
  return (
    <label className="text-sm text-slate-700">
      <div className="mb-1">{label}</div>
      <input
        type={type}
        value={value}
        min={type === "number" ? 0 : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:bg-white"
      />
    </label>
  )
}

type TextAreaFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}

function TextAreaField({ label, value, onChange, className = "" }: TextAreaFieldProps) {
  return (
    <label className={`text-sm text-slate-700 ${className}`}>
      <div className="mb-1">{label}</div>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-lg bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:bg-white"
      />
    </label>
  )
}
