import { Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "@/common/auth/page/LoginPage"
import { ShopRegisterPage } from "@/common/auth/page/ShopRegisterPage"
import { ForgotPasswordPage } from "@/common/auth/page/ForgotPasswordPage"
import AuthRedirect from "@/common/auth/guard/AuthRedirect"

import { ShopOwnerLayout, ShopOwnerDefaultRedirect } from "@/common/layout/ShopOwnerLayout"
import { ShopDashboardPage } from "@/apps/dashboard/ShopDashboardPage"
import { ShopOverviewPage } from "@/apps/profile/ShopOverviewPage"
import { ShopServiceManager } from "@/apps/services/ShopServiceManager"
import { ShopInventoryPage } from "@/apps/inventory/ShopInventoryPage"
import { ShopMembersPage } from "@/apps/members/ShopMembersPage"
import { ShopOrdersPage } from "@/apps/orders/ShopOrdersPage"
import { ShopBookingsPage } from "@/apps/bookings/ShopBookingsPage"
import { ShopTaxPage } from "@/apps/tax/ShopTaxPage"
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
              <Route path="/shop-owner/services" element={<ShopServiceManager />} />
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
