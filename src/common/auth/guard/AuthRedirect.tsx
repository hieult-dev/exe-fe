import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useUserStore } from "@/apps/user/store/UserStore"

export default function AuthRedirect() {
  const { user, authentication } = useUserStore()
  const location = useLocation()

  const isLoggedIn = Boolean(authentication?.trim() && user)

  if (isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}
