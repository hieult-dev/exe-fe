import { useState } from "react"
import {
  Menu,
  X,
  Search,
  Globe,
  User,
  Package,
  Heart,
  ShoppingCart,
} from "lucide-react"

export function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-[#1e90ff] text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-20 items-center gap-4">
            <div className="flex items-center gap-2 font-black tracking-wide">
              <div className="h-12 w-12 bg-white flex items-center justify-center overflow-hidden rounded-lg">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-full w-full object-contain scale-150"
                />
              </div>
              <span className="text-xl">PETMALL</span>
            </div>

            <div className="hidden md:flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="h-10 w-full rounded-full bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-500"
                  placeholder="Tim kiem san pham..."
                />
              </div>
              <div className="flex items-center gap-5 text-sm">

                <button className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Dang nhap</span>
                </button>
                <button className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Don hang</span>
                </button>
                <button className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Yeu thich</span>
                </button>
                <button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Gio hang</span>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="h-10 w-full rounded-full bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-500"
                  placeholder="Tim kiem san pham..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Tieng Viet</span>
                </button>
                <button className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Dang nhap</span>
                </button>
                <button className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Don hang</span>
                </button>
                <button className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Yeu thich</span>
                </button>
                <button className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Gio hang</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <a href="#dog">Thuc an cho</a>
                <a href="#cat">Thuc an meo</a>
                <a href="#spa">Spa</a>
                <a href="#toys">Do choi</a>
                <a href="#care">Cham soc</a>
              </div>
            </div>
          )}
        </div>
      </div>


    </header>
  )
}
