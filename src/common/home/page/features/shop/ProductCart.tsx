import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ProductCard } from "@/common/home/page/features/shop/ProductCard"
import { mockProducts, serviceCategoriesWithImages, type Product } from "@/common/utils/mock-data"

const sortOptions = ["Liên quan", "Mới nhất", "Bán chạy", "Giá"]

export function ProductCart() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultCategory = serviceCategoriesWithImages[0]?.name ?? ""
  const categoryParam = searchParams.get("category")
  const category = categoryParam || defaultCategory
  const searchParam = searchParams.get("search") ?? ""
  const normalizedSearch = searchParam.trim().toLowerCase()
  const currentSearch = searchParams.toString()

  const isAll = category === "Tat ca san pham" || category === "Tất cả sản phẩm"
  const isBookingCategory = category === "Spa" || category === "Thu y" || category === "Thú y"

  const filteredProducts = useMemo(() => {
    let products = mockProducts

    if (!isAll) {
      products = products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (normalizedSearch) {
      products = products.filter((product) => {
        const name = product.name.toLowerCase()
        const description = product.description.toLowerCase()
        return name.includes(normalizedSearch) || description.includes(normalizedSearch)
      })
    }

    return products
  }, [category, isAll, normalizedSearch])

  const handleAddToCart = (product: Product) => {
    console.log("add-to-cart", product)
    navigate("/cart")
  }

  const handlePrimaryAction = (product: Product) => {
    if (isBookingCategory) {
      navigate(currentSearch ? `/booking?${currentSearch}` : "/booking")
      return
    }
    handleAddToCart(product)
  }

  const handleSelectCategory = (nextCategory: string) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("category", nextCategory)
    setSearchParams(nextParams)
  }

  const handleViewProduct = (product: Product) => {
    const detailPath = currentSearch
      ? `/products/${product.id}?${currentSearch}`
      : `/products/${product.id}`
    navigate(detailPath)
  }

  return (
    <section className="min-h-screen bg-[#f5f5f5] py-6">
      <div className="mx-auto grid max-w-7xl gap-4 px-3 md:px-4 lg:grid-cols-[220px,1fr]">
        <aside className="space-y-4 rounded-sm bg-white p-4">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-wide text-slate-800">Danh mục</h2>
            <p className="mt-1 text-xs text-slate-500">Chọn nhóm sản phẩm/dịch vụ</p>
          </div>

          <div className="space-y-1 text-sm">
            {serviceCategoriesWithImages.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectCategory(item.name)}
                className={`flex w-full items-center rounded-sm px-3 py-2 text-left transition ${
                  category === item.name
                    ? "bg-[#fff1ed] font-semibold text-[#ee4d2d]"
                    : "text-slate-700 hover:bg-[#fafafa]"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full rounded-sm border border-[#ee4d2d] py-2 text-sm font-semibold text-[#ee4d2d] hover:bg-[#fff1ed]"
          >
            Quay lại trang chủ
          </button>
        </aside>

        <div className="space-y-4">
          <div className="rounded-sm bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Kết quả cho: {category}</h1>
                {normalizedSearch ? (
                  <p className="text-sm text-slate-500">Từ khóa tìm kiếm: {searchParam}</p>
                ) : (
                  <p className="text-sm text-slate-500">{filteredProducts.length} sản phẩm hiển thị</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Sắp xếp:</span>
                {sortOptions.map((option, index) => (
                  <button
                    key={option}
                    className={`rounded-sm border px-3 py-1.5 ${
                      index === 0
                        ? "border-[#ee4d2d] bg-[#ee4d2d] text-white"
                        : "border-[#e5e5e5] text-slate-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-sm bg-white p-10 text-center text-slate-600">
              Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  actionLabel={isBookingCategory ? "Đặt lịch ngay" : undefined}
                  onAction={handlePrimaryAction}
                  onCardClick={handleViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
