import { useEffect, useState } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { LoginPage } from "@/common/auth/page/LoginPage"
import { RegisterPage } from "@/common/auth/page/RegisterPage"
import { ForgotPasswordPage } from "@/common/auth/page/ForgotPasswordPage"
import AuthRedirect from "@/common/auth/guard/AuthRedirect"
import { Navigation } from "@/common/home/components/navigation"
import { HomeFooter } from "@/common/home/components/home-footer"
import { AppHome } from "@/common/home/page/AppHome"
import { AccountLayout } from "@/common/home/page/features/account/AccountLayout"
import { ProfilePage } from "@/common/home/page/features/account/ProfilePage"
import { MyPetsPage } from "@/common/home/page/features/account/MyPetsPage"
import { NotificationsPage } from "@/common/home/page/features/account/NotificationsPage"
import { VouchersPage } from "@/common/home/page/features/account/VouchersPage"
import { ShopOwnerLayout, ShopOwnerDefaultRedirect } from "@/common/home/page/features/shop-owner/ShopOwnerLayout"
import { ShopOverviewPage } from "@/common/home/page/features/shop-owner/ShopOverviewPage"
import { ShopServicesPage } from "@/common/home/page/features/shop-owner/ShopServicesPage"
import { ShopMembersPage } from "@/common/home/page/features/shop-owner/ShopMembersPage"
import { BookService } from "@/common/home/page/features/service/BookService"
import { ProductDetail } from "@/common/home/page/features/shop/ProductDetail"
import { ProductCart } from "@/common/home/page/features/shop/ProductCart"
import { CartPage } from "@/common/home/page/features/cart/CartPage"
import { OrdersPage } from "@/common/home/page/features/order/OrdersPage"
import ToastProvider from "@/common/toast/ToastProvider"

function App() {
  const location = useLocation()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()

  const isShopOwnerRoute = location.pathname.startsWith("/shop-owner")

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
        }
      )
    })
  }

  return (
    <>
      <ToastProvider />
      <div className={isShopOwnerRoute ? "min-h-screen" : "min-h-screen flex flex-col"}>
        {!isShopOwnerRoute && <Navigation onUseLocation={handleUseLocation} />}

        <main className={isShopOwnerRoute ? "min-h-screen" : "flex-1"}>
          <Routes>
            <Route path="/" element={<AppHome userLocation={userLocation} />} />
            <Route path="/products" element={<ProductCart />} />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/booking" element={<BookService />} />
            <Route path="/cart" element={<CartPage />} />

            <Route element={<AccountLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-pets" element={<MyPetsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/vouchers" element={<VouchersPage />} />
            </Route>

            <Route element={<ShopOwnerLayout />}>
              <Route path="/shop-owner" element={<ShopOwnerDefaultRedirect />} />
              <Route path="/shop-owner/profile" element={<ShopOverviewPage />} />
              <Route path="/shop-owner/services" element={<ShopServicesPage />} />
              <Route path="/shop-owner/members" element={<ShopMembersPage />} />
            </Route>

            <Route element={<AuthRedirect />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isShopOwnerRoute && <HomeFooter />}
      </div>
    </>
  )
}

export default App
