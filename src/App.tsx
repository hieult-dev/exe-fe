import { useEffect, useState } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { AppHome } from "@/common/home/page/AppHome"
import { ProductCart } from "@/common/home/page/features/shop/ProductCart"
import { BookService } from "@/common/home/page/features/service/BookService"
import { ProductDetail } from "@/common/home/page/features/shop/ProductDetail"
import { LoginPage } from "@/common/auth/page/LoginPage"
import { RegisterPage } from "@/common/auth/page/RegisterPage"
import { ForgotPasswordPage } from "@/common/auth/page/ForgotPasswordPage"
import { HomeHero } from "@/common/home/components/home-hero"
import { Navigation } from "@/common/home/components/navigation"
import { HomeFooter } from "@/common/home/components/home-footer"
import { mockSpas } from "@/common/utils/mock-data"
import ToastProvider from "@/common/toast/ToastProvider"
import AuthRedirect from "@/common/auth/guard/AuthRedirect"
function App() {
  const location = useLocation()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()

  useEffect(() => {
    if (location.pathname !== "/") {
      setUserLocation(undefined)
    }
  }, [location.pathname])

  const handleUseLocation = () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.")
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (location.pathname === "/") {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          }
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

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen flex flex-col">
        <Navigation onUseLocation={handleUseLocation} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <AppHome userLocation={userLocation} />
            }
            />
            <Route path="/products" element={
              <>
                <HomeHero totalSpas={mockSpas.length} />
                <ProductCart />
              </>
            }
            />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/booking" element={<BookService />} />
            <Route element={<AuthRedirect />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <HomeFooter />
      </div>
    </>
  )
}

export default App
