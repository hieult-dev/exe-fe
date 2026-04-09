import { Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "@/common/auth/page/LoginPage"
import { ShopRegisterPage } from "@/common/auth/page/ShopRegisterPage"
import { ForgotPasswordPage } from "@/common/auth/page/ForgotPasswordPage"
import AuthRedirect from "@/common/auth/guard/AuthRedirect"

import { ShopOwnerLayout, ShopOwnerDefaultRedirect } from "@/common/home/page/features/shop-owner/ShopOwnerLayout"
import { ShopDashboardPage } from "@/common/home/page/features/shop-owner/ShopDashboardPage"
import { ShopOverviewPage } from "@/common/home/page/features/shop-owner/ShopOverviewPage"
import { ShopServicesPage } from "@/common/home/page/features/shop-owner/ShopServicesPage"
import { ShopInventoryPage } from "@/common/home/page/features/shop-owner/ShopInventoryPage"
import { ShopMembersPage } from "@/common/home/page/features/shop-owner/ShopMembersPage"
import { ShopOrdersPage } from "@/common/home/page/features/shop-owner/ShopOrdersPage"
import { ShopBookingsPage } from "@/common/home/page/features/shop-owner/ShopBookingsPage"
import { ShopTaxPage } from "@/common/home/page/features/shop-owner/ShopTaxPage"
import ToastProvider from "@/common/toast/ToastProvider"
function App() {
  return (
    <>
      <ToastProvider />
      <div className="min-h-screen">
        <main className="min-h-screen">
          <Routes>
            {/* Redirect root to shop-owner */}
            <Route path="/" element={<Navigate to="/shop-owner/dashboard" replace />} />

            <Route element={<AuthRedirect />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<ShopRegisterPage />} />
            </Route>

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<ShopOwnerLayout />}>
              <Route path="/shop-owner" element={<ShopOwnerDefaultRedirect />} />
              <Route path="/shop-owner/dashboard" element={<ShopDashboardPage />} />
              <Route path="/shop-owner/profile" element={<ShopOverviewPage />} />
              <Route path="/shop-owner/services" element={<ShopServicesPage />} />
              <Route path="/shop-owner/inventory" element={<ShopInventoryPage />} />
              <Route path="/shop-owner/members" element={<ShopMembersPage />} />
              <Route path="/shop-owner/orders" element={<ShopOrdersPage />} />
              <Route path="/shop-owner/bookings" element={<ShopBookingsPage />} />
              <Route path="/shop-owner/tax" element={<ShopTaxPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/shop-owner/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App
