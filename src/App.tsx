import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { LoginPage } from "@/common/auth/page/LoginPage"
import { ShopRegisterPage } from "@/common/auth/page/ShopRegisterPage"
import { ForgotPasswordPage } from "@/common/auth/page/ForgotPasswordPage"
import { UnauthorizedPage } from "@/common/auth/page/UnauthorizedPage"
import AuthRedirect from "@/common/auth/guard/AuthRedirect"
import { RoleHomeRedirect } from "@/common/auth/guard/RoleHomeRedirect"

import { ShopConsoleLayout, ShopConsoleDefaultRedirect } from "@/common/layout/ShopOwnerLayout"
import { AdminDefaultRedirect, AdminLayout } from "@/common/layout/AdminLayout"
import { ShopDashboardPage } from "@/apps/dashboard/ShopDashboardPage"
import { ShopOverviewPage } from "@/apps/profile/ShopOverviewPage"
import { ShopServiceManager } from "@/apps/services/ShopServiceManager"
import { ProductManager } from "@/apps/product/ProductManager"
import { ShopOrdersPage } from "@/apps/orders/ShopOrdersPage"
import { ShopBookingsPage } from "@/apps/bookings/ShopBookingsPage"
import { ShopPaymentConfigPage } from "@/apps/payment_config/ShopPaymentConfigPage"
import { ShopGhtkConfigPage } from "@/apps/ghtk_config/ShopGhtkConfigPage"
import { ShopSubscriptionPage } from "@/apps/subscriptions/ShopSubscriptionPage"
import { ShopPlatformFeePage } from "@/apps/platform-fees/ShopPlatformFeePage"
import { ShopChatPage } from "@/apps/chat/ShopChatPage"
import { StaffCustomerDisplayPage } from "@/apps/staff/StaffCustomerDisplayPage"
import { StaffSalesPage } from "@/apps/staff/StaffSalesPage"
import { NotificationRealtimeBridge } from "@/apps/notifications/NotificationRealtimeBridge"
import ToastProvider from "@/common/toast/ToastProvider"
import { AdminShopApprovalPage } from "@/apps/admin/AdminShopApprovalPage"
function App() {
  return (
    <>
      <ToastProvider />
      <NotificationRealtimeBridge />
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
            <Route path="/shop/sales/customer-display" element={<StaffCustomerDisplayPage />} />
            <Route path="/shop/tax" element={<Navigate to="/shop/dashboard" replace />} />

            <Route path="/staff/*" element={<LegacyStaffRedirect />} />
            <Route path="/shop-owner/*" element={<LegacyShopOwnerRedirect />} />

            <Route element={<ShopConsoleLayout />}>
              <Route path="/shop" element={<ShopConsoleDefaultRedirect />} />
              <Route path="/shop/dashboard" element={<ShopDashboardPage />} />
              <Route path="/shop/chat" element={<ShopChatPage />} />
              <Route path="/shop/sales" element={<StaffSalesPage />} />
              <Route path="/shop/profile" element={<ShopOverviewPage />} />
              <Route path="/shop/services" element={<ShopServiceManager />} />
              <Route path="/shop/product" element={<ProductManager />} />
              <Route path="/shop/orders" element={<ShopOrdersPage />} />
              <Route path="/shop/bookings" element={<ShopBookingsPage />} />
              <Route path="/shop/payment-config" element={<ShopPaymentConfigPage />} />
              <Route path="/shop/ghtk-config" element={<ShopGhtkConfigPage />} />
              <Route path="/shop/subscriptions" element={<ShopSubscriptionPage />} />
              <Route path="/shop/platform-fees" element={<ShopPlatformFeePage />} />
            </Route>

            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDefaultRedirect />} />
              <Route path="/admin/shops" element={<AdminShopApprovalPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

function LegacyShopOwnerRedirect() {
  const { pathname, search, hash } = useLocation()
  const suffix = pathname.replace(/^\/shop-owner/, "")
  const targetPath = !suffix || suffix === "/members" || suffix === "/tax" ? "/dashboard" : suffix
  return <Navigate to={`/shop${targetPath}${search}${hash}`} replace />
}

function LegacyStaffRedirect() {
  const { pathname, search, hash } = useLocation()
  const suffix = pathname.replace(/^\/staff/, "")
  const routeMap: Record<string, string> = {
    "": "/sales",
    "/sales": "/sales",
    "/bookings": "/bookings",
    "/orders": "/orders",
    "/sales/customer-display": "/sales/customer-display",
  }

  return <Navigate to={`/shop${routeMap[suffix] ?? "/sales"}${search}${hash}`} replace />
}

export default App
