import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Bell,
  ChevronDown,
  Globe,
  HelpCircle,
  MapPin,
  Menu,
  Package,
  Store,
  Search,
  ShoppingCart,
  TicketPercent,
  User,
  X,
} from "lucide-react"
import { useUserStore } from "@/apps/user/store/UserStore"
import { AvatarChip } from "@/common/component/AvatarChip"
import { AppDialog } from "@/common/component/AppDialog"
import { resolveAvatarUrl } from "@/common/user/utils/profile"
import { logout } from "@/common/auth/api/authApi"

interface NavigationProps {
  onUseLocation: () => Promise<void>
}


const menuCategories = [
  "Tất cả sản phẩm",
  "Spa",
  "Thú y",
  "Đồ chơi",
  "Thức ăn",
  "Phụ kiện",
]

export function Navigation({ onUseLocation }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openMobileMenu, setOpenMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [openAccountDropdown, setOpenAccountDropdown] = useState(false)

  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const { user, authentication, resetUserStore } = useUserStore()

  const isLoggedIn = Boolean(authentication && authentication.trim() && user)
  const userName = user?.fullName?.trim() || "Tài khoản"
  const avatarUrl = resolveAvatarUrl(user?.avatarUrlPreview, "")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current) return
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setOpenAccountDropdown(false)
      }
    }

    window.addEventListener("mousedown", handleClickOutside)
    return () => window.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setOpenAccountDropdown(false)
  }, [location.pathname])

  const handleSearch = () => {
    const keyword = searchQuery.trim()
    if (!keyword) {
      return
    }
    const params = new URLSearchParams()
    params.set("search", keyword)
    navigate(`/products?${params.toString()}`)
    setOpenMobileMenu(false)
  }


  const handleChooseCategory = (category: string) => {
    const params = new URLSearchParams()
    params.set("category", category)
    navigate(`/products?${params.toString()}`)
    setOpenMobileMenu(false)
  }

  const doLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } catch {
      // keep local logout fallback
    } finally {
      resetUserStore()
      setShowLogoutModal(false)
      setIsLoggingOut(false)
      setOpenMobileMenu(false)
      setOpenAccountDropdown(false)
      navigate("/", { replace: true })
    }
  }

  const isHome = location.pathname === "/"

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#efefef] shadow-sm">
        <div className="bg-gradient-to-b from-[#fc5c88] to-[#ff7ca3] text-white">
          <div className="mx-auto max-w-7xl px-3 md:px-4">
            <div className="hidden h-9 items-center justify-between text-xs md:flex relative z-50">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/")} className="hover:opacity-85 transition">
                  Kênh Spa/Shop
                </button>
                <button onClick={() => navigate("/products")} className="hover:opacity-85 transition">
                  Mua sắm
                </button>
                <button onClick={() => navigate("/shop-owner/profile")} className="hover:opacity-85 transition">
                  Kênh shop owner
                </button>
                <button
                  type="button"
                  onClick={() => void onUseLocation()}
                  className="inline-flex items-center gap-1 hover:opacity-85 transition"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Vị trí của tôi
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/notifications")}
                  className="inline-flex items-center gap-1 hover:opacity-85 transition"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Thông báo
                </button>
                <button
                  onClick={() => navigate("/vouchers")}
                  className="inline-flex items-center gap-1 hover:opacity-85 transition"
                >
                  <TicketPercent className="h-3.5 w-3.5" />
                  Voucher
                </button>
                <button className="inline-flex items-center gap-1 hover:opacity-85 transition">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Hỗ trợ
                </button>
                <button className="inline-flex items-center gap-1 hover:opacity-85 transition">
                  <Globe className="h-3.5 w-3.5" />
                  Tiếng Việt
                </button>

                {!isLoggedIn ? (
                  <>
                    <button onClick={() => navigate("/register")} className="hover:opacity-85 transition">
                      Đăng ký
                    </button>
                    <span className="h-3.5 w-px bg-white/40" />
                    <button onClick={() => navigate("/login")} className="hover:opacity-85 transition">
                      Đăng nhập
                    </button>
                  </>
                ) : (
                  <div ref={accountMenuRef} className="relative z-50">
                    <button
                      type="button"
                      onClick={() => setOpenAccountDropdown((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2 py-1 hover:bg-white/20 transition"
                    >
                      <AvatarChip name={userName} avatarUrl={avatarUrl} />
                      <span className="max-w-[140px] truncate">{userName}</span>
                      <ChevronDown className={`h-4 w-4 transition ${openAccountDropdown ? "rotate-180" : ""}`} />
                    </button>

                    {openAccountDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-44 rounded-sm border border-[#f2f2f2] bg-white py-1 text-sm text-slate-700 shadow-xl">
                        <button
                          onClick={() => {
                            setOpenAccountDropdown(false)
                            navigate("/profile")
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-[#fff0f5] hover:text-[#fc5c88]"
                        >
                          Tài khoản của tôi
                        </button>
                        <button
                          onClick={() => {
                            setOpenAccountDropdown(false)
                            navigate("/orders")
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-[#fff0f5] hover:text-[#fc5c88]"
                        >
                          Đơn mua
                        </button>
                        <button
                          onClick={() => {
                            setOpenAccountDropdown(false)
                            navigate("/shop-owner/profile")
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-[#fff0f5] hover:text-[#fc5c88]"
                        >
                          Kênh shop owner
                        </button>
                        <button
                          onClick={() => {
                            setOpenAccountDropdown(false)
                            navigate("/shop/1")
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-[#fff0f5] hover:text-[#fc5c88]"
                        >
                          Trang shop của tôi
                        </button>
                        <button
                          onClick={() => {
                            setOpenAccountDropdown(false)
                            setShowLogoutModal(true)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-[#fff0f5] hover:text-[#fc5c88]"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 md:py-4">
              <button
                onClick={() => {
                  setOpenMobileMenu(false)
                  if (!isHome) navigate("/")
                }}
                className="shrink-0 text-left"
              >
                <div className="text-2xl font-extrabold leading-none tracking-wide">PETPEEs</div>
                <div className="text-xs text-white/80">Pet Marketplace</div>
              </button>

              <div className="hidden flex-1 md:block">
                <div className="flex items-center rounded-sm bg-white p-1">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch()
                      }
                    }}
                    placeholder="Tìm sản phẩm, spa, gói dịch vụ..."
                    className="h-9 flex-1 rounded-sm border-0 px-3 text-sm text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex h-9 w-14 items-center justify-center rounded-sm bg-[#fc5c88] text-white hover:bg-[#e64b81] transition"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="relative ml-auto hidden rounded-sm p-2 hover:bg-white/10 md:inline-flex"
              >
                <ShoppingCart className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-[#fc5c88]">
                  2
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOpenMobileMenu((value) => !value)}
                className="ml-auto inline-flex rounded-sm p-2 hover:bg-white/10 md:hidden"
              >
                {openMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {openMobileMenu && (
              <div className="space-y-4 pb-4 md:hidden">
                <div className="flex items-center rounded-sm bg-white p-1">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="h-9 flex-1 rounded-sm border-0 px-3 text-sm text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex h-9 w-12 items-center justify-center rounded-sm bg-[#fc5c88] text-white"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <button onClick={() => navigate("/cart")} className="rounded-sm bg-white/10 px-3 py-2 text-left">
                    Giỏ hàng
                  </button>
                  <button
                    onClick={() => navigate("/orders")}
                    className="rounded-sm bg-white/10 px-3 py-2 text-left"
                  >
                    Đơn mua
                  </button>
                  <button
                    onClick={() => navigate("/notifications")}
                    className="rounded-sm bg-white/10 px-3 py-2 text-left"
                  >
                    Thông báo
                  </button>
                  <button
                    onClick={() => navigate("/vouchers")}
                    className="rounded-sm bg-white/10 px-3 py-2 text-left"
                  >
                    Voucher
                  </button>
                  <button
                    onClick={() => navigate("/shop-owner/profile")}
                    className="rounded-sm bg-white/10 px-3 py-2 text-left"
                  >
                    Kênh shop owner
                  </button>
                  <button
                    onClick={() => navigate("/shop/1")}
                    className="rounded-sm bg-white/10 px-3 py-2 text-left"
                  >
                    Trang shop của tôi
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void onUseLocation()}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <MapPin className="h-4 w-4" />
                  Sử dụng vị trí hiện tại
                </button>

                {!isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => navigate("/login")} className="rounded-sm bg-white px-3 py-2 text-[#fc5c88]">
                      Đăng nhập
                    </button>
                    <button onClick={() => navigate("/register")} className="rounded-sm border border-white px-3 py-2">
                      Đăng ký
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex w-full items-center gap-2 rounded-sm bg-white/10 px-3 py-2"
                    >
                      <User className="h-4 w-4" />
                      Tài khoản của tôi
                    </button>
                    <button
                      onClick={() => navigate("/orders")}
                      className="flex w-full items-center gap-2 rounded-sm bg-white/10 px-3 py-2"
                    >
                      <Package className="h-4 w-4" />
                      Đơn mua
                    </button>
                    <button
                      onClick={() => navigate("/shop-owner/profile")}
                      className="flex w-full items-center gap-2 rounded-sm bg-white/10 px-3 py-2"
                    >
                      <Store className="h-4 w-4" />
                      Kênh shop owner
                    </button>
                    <button
                      onClick={() => navigate("/shop/1")}
                      className="flex w-full items-center gap-2 rounded-sm bg-white/10 px-3 py-2"
                    >
                      <Store className="h-4 w-4" />
                      Trang shop của tôi
                    </button>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full rounded-sm border border-white/60 px-3 py-2"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden border-b bg-white md:block">
          <div className="mx-auto flex h-11 max-w-7xl items-center gap-6 overflow-x-auto px-3 text-sm text-slate-700 md:px-4">
            {menuCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleChooseCategory(category)}
                className="whitespace-nowrap border-b-2 border-transparent pt-0.5 hover:border-[#fc5c88] hover:text-[#fc5c88]"
              >
                {category}
              </button>
            ))}
            <button
              onClick={() => navigate("/booking")}
              className="ml-auto inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#fc5c88] px-3 py-1 text-xs font-semibold text-[#fc5c88]"
            >
              <Package className="h-3.5 w-3.5" />
              Đặt lịch nhanh
            </button>
          </div>
        </div>
      </header>

      <AppDialog
        open={showLogoutModal}
        onClose={() => {
          if (!isLoggingOut) {
            setShowLogoutModal(false)
          }
        }}
        title="Xác nhận đăng xuất"
        description="Bạn chắc chắn muốn đăng xuất?"
        disableClose={isLoggingOut}
        footer={
          <>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => setShowLogoutModal(false)}
              className="rounded-sm border border-[#d9d9d9] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={doLogout}
              className="rounded-sm bg-[#d93b1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c23218] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </>
        }
      />
    </>
  )
}

