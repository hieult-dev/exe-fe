import { Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "@/common/auth/page/LoginPage"
import { ShopRegisterPage } from "@/common/auth/page/ShopRegisterPage"
import { ForgotPasswordPage } from "@/common/auth/page/ForgotPasswordPage"
import { UnauthorizedPage } from "@/common/auth/page/UnauthorizedPage"
import AuthRedirect from "@/common/auth/guard/AuthRedirect"
import { RoleHomeRedirect } from "@/common/auth/guard/RoleHomeRedirect"

import { ShopOwnerLayout, ShopOwnerDefaultRedirect } from "@/common/layout/ShopOwnerLayout"
import { StaffDefaultRedirect, StaffLayout } from "@/common/layout/StaffLayout"
import { StaffManagementLayout } from "@/common/layout/StaffManagementLayout"
import { ShopDashboardPage } from "@/apps/dashboard/ShopDashboardPage"
import { ShopOverviewPage } from "@/apps/profile/ShopOverviewPage"
import { ShopServiceManager } from "@/apps/services/ShopServiceManager"
import { ProductManager } from "@/apps/product/ProductManager"
import { ShopMembersPage } from "@/apps/members/ShopMembersPage"
import { ShopOrdersPage } from "@/apps/orders/ShopOrdersPage"
import { ShopBookingsPage } from "@/apps/bookings/ShopBookingsPage"
import { ShopPaymentConfigPage } from "@/apps/payment_config/ShopPaymentConfigPage"
import { ShopGhtkConfigPage } from "@/apps/ghtk_config/ShopGhtkConfigPage"
import { StaffCustomerDisplayPage } from "@/apps/staff/StaffCustomerDisplayPage"
import { StaffSalesPage } from "@/apps/staff/StaffSalesPage"
import { ShopTaxPage } from "@/apps/tax/ShopTaxPage"
import ToastProvider from "@/common/toast/ToastProvider"
function App() {
  return (
    <>
      <ToastProvider />
      <div className="min-h-screen">
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<RoleHomeRedirect />} />

            <Route element={<AuthRedirect />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<ShopRegisterPage />} />
            </Route>

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/staff/sales/customer-display" element={<StaffCustomerDisplayPage />} />

            <Route element={<StaffLayout />}>
              <Route path="/staff" element={<StaffDefaultRedirect />} />
              <Route path="/staff/sales" element={<StaffSalesPage />} />
            </Route>

            <Route element={<StaffManagementLayout />}>
              <Route path="/staff/bookings" element={<ShopBookingsPage />} />
              <Route path="/staff/orders" element={<ShopOrdersPage />} />
            </Route>

            <Route element={<ShopOwnerLayout />}>
              <Route path="/shop-owner" element={<ShopOwnerDefaultRedirect />} />
              <Route path="/shop-owner/dashboard" element={<ShopDashboardPage />} />
              <Route path="/shop-owner/profile" element={<ShopOverviewPage />} />
              <Route path="/shop-owner/services" element={<ShopServiceManager />} />
              <Route path="/shop-owner/product" element={<ProductManager />} />
              <Route path="/shop-owner/members" element={<ShopMembersPage />} />
              <Route path="/shop-owner/orders" element={<ShopOrdersPage />} />
              <Route path="/shop-owner/bookings" element={<ShopBookingsPage />} />
              <Route path="/shop-owner/tax" element={<ShopTaxPage />} />
              <Route path="/shop-owner/payment-config" element={<ShopPaymentConfigPage />} />
              <Route path="/shop-owner/ghtk-config" element={<ShopGhtkConfigPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App
