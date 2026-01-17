import { useState } from "react"
import { AppHome } from "@/common/home/page/AppHome"
import { ProductCart } from "@/common/home/page/features/shop/ProductCart"
import { BookService } from "@/common/home/page/features/service/BookService"
import { ProductDetail } from "@/common/home/page/features/shop/ProductDetail"
import { Navigation } from "@/common/home/components/navigation"
import { HomeHero } from "@/common/home/components/home-hero"
import { HomeFooter } from "@/common/home/components/home-footer"
import { mockSpas, serviceCategories } from "@/common/utils/mock-data"

function App() {
  const [activePage, setActivePage] = useState<"home" | "product" | "book" | "detail">("home")
  const [productCategory, setProductCategory] = useState(serviceCategories[0])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const handleSelectProductCategory = (category: string) => {
    setProductCategory(category)
    setActivePage("product")
  }

  const handleUseLocation = () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.")
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve()
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please allow location access.")
          reject(error)
        },
      )
    })
  }

  if (activePage === "product") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation onUseLocation={handleUseLocation} />
        <HomeHero totalSpas={mockSpas.length} />
        
        <div className="flex-1">
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
        </div>
        
        <HomeFooter />
      </div>
    )
  }

  if (activePage === "book") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation onUseLocation={handleUseLocation} />
        <div className="flex-1">
          <BookService onBack={() => setActivePage("product")} />
        </div>
        <HomeFooter />
      </div>
    )
  }

  if (activePage === "detail" && selectedProductId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation onUseLocation={handleUseLocation} />
        <div className="flex-1">
          <ProductDetail productId={selectedProductId} onBack={() => setActivePage("product")} />
        </div>
        <HomeFooter />
      </div>
    )
  }

  return <AppHome onSelectProductCategory={handleSelectProductCategory} />
}

export default App
