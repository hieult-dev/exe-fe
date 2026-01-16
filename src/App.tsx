import { useState } from "react"
import { AppHome } from "@/common/home/page/AppHome"
import { ProductCart } from "@/common/home/page/features/shop/ProductCart"
import { BookService } from "@/common/home/page/features/service/BookService"
import { ProductDetail } from "@/common/home/page/features/shop/ProductDetail"
import { serviceCategories } from "@/common/utils/mock-data"

function App() {
  const [activePage, setActivePage] = useState<"home" | "product" | "book" | "detail">("home")
  const [productCategory, setProductCategory] = useState(serviceCategories[0])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const handleSelectProductCategory = (category: string) => {
    setProductCategory(category)
    setActivePage("product")
  }

  if (activePage === "product") {
    return (
      <ProductCart
        category={productCategory}
        onBackToHome={() => setActivePage("home")}
        onSelectCategory={handleSelectProductCategory}
        onBookService={() => setActivePage("book")}
        onViewProduct={(product) => {
          setSelectedProductId(product.id)
          setActivePage("detail")
        }}
      />
    )
  }

  if (activePage === "book") {
    return <BookService onBack={() => setActivePage("product")} />
  }

  if (activePage === "detail" && selectedProductId) {
    return <ProductDetail productId={selectedProductId} onBack={() => setActivePage("product")} />
  }

  return <AppHome onSelectProductCategory={handleSelectProductCategory} />
}

export default App
