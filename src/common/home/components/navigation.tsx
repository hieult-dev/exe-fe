import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Menu,
  X,
  Search,
  Globe,
  User,
  Package,
  MapPin,
  ShoppingCart,
} from "lucide-react"
import { useUserStore } from "@/apps/user/store/UserStore"
import { AvatarChip } from "@/common/component/AvatarChip"
import { GATEWAY_URL } from "@/common/config/api"
import { logout } from "@/common/auth/api/authApi"

// react-bootstrap modal
import { Modal, Button } from "react-bootstrap"

interface NavigationProps {
  onUseLocation: () => Promise<void>
}

export function Navigation({ onUseLocation }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, authentication, resetUserStore } = useUserStore()

  // modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isLoggedIn = Boolean(authentication && authentication.trim() && user)
  const userName = user?.fullName?.trim() || "Tài khoản"
  const avatarUrl =
    user?.avatarUrlPreview?.startsWith("http")
      ? user.avatarUrlPreview
      : user?.avatarUrlPreview
        ? `${GATEWAY_URL}${user.avatarUrlPreview}`
        : null

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set("search", searchQuery.trim())
      navigate(`/products?${params.toString()}`)
      setSearchQuery("")
      setOpen(false)
    }
  }

  const handleLogoClick = () => {
    setOpen(false)
    if (location.pathname !== "/") {
      navigate("/")
    }
  }

  const handleLoginClick = () => {
    setOpen(false)
    navigate("/login")
  }

  // mở modal confirm
  const openLogoutConfirm = () => {
    setOpen(false)
    setShowLogoutModal(true)
  }

  // logout thật sự (gọi API + clear local)
  const doLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } catch {
    } finally {
      resetUserStore()
      setShowLogoutModal(false)
      setIsLoggingOut(false)
      navigate("/", { replace: true })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div className="bg-[#1e90ff] text-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-20 items-center gap-4">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 font-black tracking-wide hover:opacity-80 transition cursor-pointer"
              >
                <span className="text-xl">PETPEEs</span>
              </button>

              {/* ===== Desktop ===== */}
              <div className="hidden md:flex flex-1 items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-10 w-full rounded-full bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-500"
                      placeholder="Tìm kiếm sản phẩm..."
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-4 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition text-sm"
                  >
                    Tìm kiếm
                  </button>
                </div>

                {/* Actions (đưa khối đăng nhập ra sau giỏ hàng) */}
                <div className="flex items-center gap-5 text-sm">
                  <button
                    className="flex items-center gap-2"
                    onClick={() => navigate("/orders")}
                  >
                    <Package className="h-4 w-4" />
                    <span>Đơn hàng</span>
                  </button>

                  <button
                    className="flex items-center gap-2"
                    onClick={() => navigate("/cart")}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Giỏ hàng</span>
                  </button>

                  {!isLoggedIn ? (
                    <button
                      className="flex items-center gap-2"
                      onClick={handleLoginClick}
                    >
                      <User className="h-4 w-4" />
                      <span>Đăng nhập</span>
                    </button>
                  ) : (
                    <div className="relative group">
                      <button className="flex items-center gap-2 rounded-full bg-white/15 px-2 py-1 hover:bg-white/20 transition">
                        <AvatarChip name={userName} avatarUrl={avatarUrl} />
                        <span className="max-w-[140px] truncate font-semibold">
                          {userName}
                        </span>
                      </button>

                      {/* Dropdown */}
                      <div className="absolute right-0 top-full hidden group-hover:block z-[999]">
                        {/* bridge để rê chuột không bị mất (cầu nối hover) */}
                        <div className="h-2" />

                        <div className="w-52 rounded-xl bg-white text-slate-900 shadow-xl overflow-hidden pointer-events-auto">
                          <button
                            onClick={() => navigate("/profile")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                          >
                            Hồ sơ cá nhân
                          </button>
                          <button
                            onClick={() => navigate("/orders")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                          >
                            Đơn hàng
                          </button>
                          <div className="h-px bg-slate-200" />
                          <button
                            onClick={openLogoutConfirm}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 font-semibold"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => void onUseLocation()}
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white"
                  >
                    <MapPin className="h-4 w-4 text-white" />
                    <span>Vị trí của tôi</span>
                  </button>
                </div>
              </div>

              {/* Mobile toggle */}
              <button className="ml-auto md:hidden" onClick={() => setOpen(!open)}>
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* ===== Mobile ===== */}
            {open && (
              <div className="md:hidden pb-4 space-y-4">
                {/* Search */}
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-10 w-full rounded-full bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-500"
                      placeholder="Tìm kiếm sản phẩm..."
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition text-sm"
                  >
                    Tìm
                  </button>
                </div>

                {/* Grid actions (không dùng dropdown hover trên mobile) */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <button className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Tiếng Việt</span>
                  </button>

                  <button
                    className="flex items-center gap-2"
                    onClick={() => {
                      setOpen(false)
                      navigate("/orders")
                    }}
                  >
                    <Package className="h-4 w-4" />
                    <span>Đơn hàng</span>
                  </button>

                  <button
                    className="flex items-center gap-2"
                    onClick={() => {
                      setOpen(false)
                      navigate("/cart")
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Giỏ hàng</span>
                  </button>

                  {!isLoggedIn ? (
                    <button className="flex items-center gap-2" onClick={handleLoginClick}>
                      <User className="h-4 w-4" />
                      <span>Đăng nhập</span>
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setOpen(false)
                        navigate("/profile")
                      }}
                    >
                      <AvatarChip name={userName} avatarUrl={avatarUrl} />
                      <span className="truncate font-semibold">{userName}</span>
                    </button>
                  )}

                  <button
                    className="flex items-center gap-2"
                    onClick={() => void onUseLocation()}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Vị trí của tôi</span>
                  </button>

                  {isLoggedIn ? (
                    <button
                      className="flex items-center gap-2 text-red-100"
                      onClick={openLogoutConfirm}
                    >
                      <X className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm font-semibold">
                  <a href="#dog" onClick={() => setOpen(false)}>Thức ăn chó</a>
                  <a href="#cat" onClick={() => setOpen(false)}>Thức ăn mèo</a>
                  <a href="#spa" onClick={() => setOpen(false)}>Spa</a>
                  <a href="#toys" onClick={() => setOpen(false)}>Đồ chơi</a>
                  <a href="#care" onClick={() => setOpen(false)}>Chăm sóc</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== Mega menu strip ===== */}
        <div className="relative z-20 w-full">
          <div className="bg-[#1e90ff]">
            <div className="mx-auto max-w-7xl px-4">
              <nav className="flex flex-wrap items-center justify-center gap-6 text-white font-semibold">
                <div className="relative group">
                  <button className="py-2 border-b-2 border-transparent group-hover:border-white transition">
                    Dịch vụ
                  </button>
                  <div className="absolute left-0 top-full hidden group-hover:block">
                    <div className="w-[720px] bg-white text-slate-900 shadow-xl rounded-b-lg p-6">
                      <div className="grid grid-cols-3 gap-8 text-sm">
                        <div className="space-y-3">
                          <div className="font-semibold text-slate-900">Gói spa</div>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Chăm sóc cơ bản
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Chăm sóc nâng cao
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Tắm, cắt tỉa lông
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Gỡ rối, khử mùi
                          </a>
                        </div>
                        <div className="space-y-3">
                          <div className="font-semibold text-slate-900">Chăm sóc y tế</div>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Khám tổng quát
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Tiêm phòng
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Điều trị bệnh
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Tư vấn dinh dưỡng
                          </a>
                        </div>
                        <div className="space-y-3">
                          <div className="font-semibold text-slate-900">Thức ăn</div>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Thức ăn hạt
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Thức ăn tươi
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Thức ăn chức năng
                          </a>
                          <a className="block text-slate-600 hover:text-slate-900" href="#">
                            Bánh thưởng
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <button className="py-3 border-b-2 border-transparent group-hover:border-white transition">
                    Thú cưng
                  </button>

                  <div className="absolute left-0 top-full hidden group-hover:block">
                    <div className="w-40 bg-white text-slate-900 shadow-lg rounded-b-lg py-3">
                      <a href="#dog" className="block px-4 py-2 text-sm hover:bg-slate-100">
                        Chó
                      </a>
                      <a href="#cat" className="block px-4 py-2 text-sm hover:bg-slate-100">
                        Mèo
                      </a>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <button className="py-3 border-b-2 border-transparent group-hover:border-white transition">
                    Thức ăn
                  </button>

                  <div className="absolute left-0 top-full hidden group-hover:block">
                    <div className="w-40 bg-white text-slate-900 shadow-lg rounded-b-lg py-3">
                      <a href="#dog" className="block px-4 py-2 text-sm hover:bg-slate-100">
                        Thức ăn hạt
                      </a>
                      <a href="#cat" className="block px-4 py-2 text-sm hover:bg-slate-100">
                        Thức ăn tươi
                      </a>
                      <a href="#cat" className="block px-4 py-2 text-sm hover:bg-slate-100">
                        Thức ăn chức năng
                      </a>
                      <a href="#cat" className="block px-4 py-2 text-sm hover:bg-slate-100">
                        Bánh thưởng
                      </a>
                    </div>
                  </div>
                </div>

                <button className="py-2 border-b-2 border-transparent hover:border-white transition">
                  Thiết bị thông minh
                </button>
                <button className="py-2 border-b-2 border-transparent hover:border-white transition">
                  Hàng mới về
                </button>
                <button className="py-2 border-b-2 border-transparent hover:border-white transition">
                  Blog
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Modal xác nhận đăng xuất ===== */}
      <Modal
        show={showLogoutModal}
        onHide={() => !isLoggingOut && setShowLogoutModal(false)}
        centered
        backdrop={isLoggingOut ? "static" : true}
        keyboard={!isLoggingOut}
      >
        <Modal.Header closeButton={!isLoggingOut}>
          <Modal.Title>Xác nhận đăng xuất</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn đăng xuất?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={isLoggingOut}
            onClick={() => setShowLogoutModal(false)}
          >
            Hủy
          </Button>
          <Button variant="danger" disabled={isLoggingOut} onClick={doLogout}>
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
