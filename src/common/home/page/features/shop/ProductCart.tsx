import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ProductCard } from "@/common/home/page/features/shop/ProductCard"
import { CategoryGrid } from "@/common/home/components/fragments/category-grid"
import { mockProducts, serviceCategoriesWithImages, type Product } from "@/common/utils/mock-data"

export function ProductCart() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultCategory = serviceCategoriesWithImages[0]?.name ?? ""
  const categoryParam = searchParams.get("category")
  const category = categoryParam || defaultCategory
  const searchParam = searchParams.get("search") ?? ""
  const normalizedSearch = searchParam.trim().toLowerCase()
  const currentSearch = searchParams.toString()
  const isAll = category === "Tất cả sản phẩm"
  const isBookingCategory =
    category === "Spa" || category === "Thú y"

  const filteredProducts = useMemo(() => {
    let products = mockProducts
    if (!isAll) {
      products = products.filter((product) => product.category === category)
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
  }

  const handlePrimaryAction = (product: Product) => {
    if (isBookingCategory) {
      navigate(currentSearch ? `/booking?${currentSearch}` : "/booking")
      return
    }
    handleAddToCart(product)
  }

  const handleBackToHome = () => {
    navigate("/")
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

  const onBackToHome = handleBackToHome
  const onSelectCategory = handleSelectCategory
  const onViewProduct = handleViewProduct

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Sản phẩm</h2>
            <p className="text-sm text-muted-foreground">Danh mục dành cho {category}</p>
          </div>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="rounded-full px-5 py-2 border border-border text-sm hover:bg-muted/60 transition"
            >
              Quay lại
            </button>
          )}
        </div>

        <CategoryGrid
          categories={serviceCategoriesWithImages}
          selectedCategory={category}
          onSelectCategory={(nextCategory) => onSelectCategory?.(nextCategory)}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              actionLabel={isBookingCategory ? "Dat lich ngay" : undefined}
              onAction={handlePrimaryAction}
              onCardClick={onViewProduct}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
