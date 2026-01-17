import { useState } from "react"
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

interface NavigationProps {
  onUseLocation: () => Promise<void>
  onLogoClick?: () => void
  onSearch?: (query: string) => void
}

export function Navigation({ onUseLocation, onLogoClick, onSearch }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery)
      setSearchQuery("")
    }
  }

  const handleLogoClick = () => {
    setOpen(false)
    onLogoClick?.()
  }

  return (
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

            <div className="hidden md:flex flex-1 items-center gap-3">
              <div className="relative flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="h-10 w-full rounded-full bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-500"
                    placeholder="Tim kiem san pham..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition text-sm"
                >
                  Tìm kiếm
                </button>
              </div>
              <div className="flex items-center gap-5 text-sm">

                <button className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </button>
                <button className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Đơn hàng</span>
                </button>
                <button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Giỏ hàng</span>
                </button>
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

            <button className="ml-auto md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* <div className="hidden md:flex items-center gap-6 pb-3 text-sm font-semibold">
            <a href="#dog">Thuc an cho</a>
            <a href="#cat">Thuc an meo</a>
            <a href="#spa">Spa</a>
            <a href="#toys">Do choi</a>
            <a href="#care">Cham soc</a>
          </div> */}

          {open && (
            <div className="md:hidden pb-4 space-y-4">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="h-10 w-full rounded-full bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-500"
                    placeholder="Tim kiem san pham..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition text-sm"
                >
                  Tìm
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Tiếng Việt</span>
                </button>
                <button className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  className="flex items-center gap-2"
                  onClick={() => void onUseLocation()}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Vị trí của tôi</span>
                </button>
                <button className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Đơn hàng</span>
                </button>
                {/* Favorite removed; moved to hero as location button */}
                <button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Giỏ hàng</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <a href="#dog">Thức ăn chó</a>
                <a href="#cat">Thức ăn mèo</a>
                <a href="#spa">Spa</a>
                <a href="#toys">Đồ chơi</a>
                <a href="#care">Chăm sóc</a>
              </div>
            </div>
          )}
        </div>
      </div>

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
                          Go rối, khử mùi
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
                    <a
                      href="#dog"
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      Chó
                    </a>
                    <a
                      href="#cat"
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
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
                    <a
                      href="#dog"
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      Thức ăn hạt
                    </a>
                    <a
                      href="#cat"
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      Thức ăn tươi
                    </a>
                    <a
                      href="#cat"
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      Thức ăn chức năng
                    </a>
                    <a
                      href="#cat"
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
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
                Blogs
              </button>
            </nav>
          </div>
        </div>
      </div>

    </header>
  )
}
