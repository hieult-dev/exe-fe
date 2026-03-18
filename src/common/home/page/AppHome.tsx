import { useEffect, useMemo, useState } from "react"
import { Bolt, MapPinned, Store, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { MapSection } from "@/common/home/components/map-section"
import { mockProducts, mockSpas, serviceCategoriesWithImages, type Product, type Spa } from "@/common/utils/mock-data"

interface AppHomeProps {
  userLocation?: { lat: number; lng: number }
}

const topBanners = [
  {
    title: "Đồng hành cùng nàng",
    subtitle: "Voucher 0đ và ưu đãi cho pet owner mới",
    image: "/luxury-pet-spa.png",
  },
  {
    title: "Shopee-style pet sale",
    subtitle: "Freeship và giảm sốc đến 40% hôm nay",
    image: "/professional-pet-groomer-with-dog.jpg",
  },
  {
    title: "PetPees mall week",
    subtitle: "Combo thức ăn + phụ kiện giá tốt mỗi ngày",
    image: "/modern-pet-grooming-salon.png",
  },
]

const sideBanners = [
  {
    title: "Khám thú y định kỳ",
    image: "/image/vet.jpg",
  },
  {
    title: "Thanh toán và voucher",
    image: "/image/toys.jpg",
  },
]

const quickEntry = [
  "Hàng quốc tế",
  "Xử lý đơn nhanh",
  "Deal hot giờ vàng",
  "Voucher 30%",
  "Khách hàng thân thiết",
  "Mã giảm giá",
]

export function AppHome({ userLocation }: AppHomeProps) {
  const navigate = useNavigate()
  const featuredSpas = useMemo(() => mockSpas.filter((spa) => spa.featured), [])
  const [bannerIndex, setBannerIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % topBanners.length)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [])



  const goodsProducts = useMemo(() => {
    return mockProducts.filter((p) => p.category !== "Spa" && p.category !== "Thú y")
  }, [])

  const serviceProducts = useMemo(() => {
    return mockProducts.filter((p) => p.category === "Spa" || p.category === "Thú y")
  }, [])

  const quickCategories = useMemo(() => serviceCategoriesWithImages.slice(0, 10), [])
  const activeBanner = topBanners[bannerIndex]

  return (
    <div className="bg-[#f5f5f5] pb-8">
      <main className="mx-auto max-w-7xl space-y-4 px-3 pt-4 md:px-4">
        <section className="rounded-xl bg-white p-3 md:p-4 shadow-sm border border-slate-100">
          <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
            <button
              onClick={() => navigate("/products")}
              className="group relative h-52 overflow-hidden rounded-lg text-left md:h-[280px]"
            >
              <img
                src={activeBanner.image}
                alt={activeBanner.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#d63b1f]/70 via-[#d63b1f]/40 to-black/10" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/85">PetPees Mall</p>
                <h2 className="mt-2 text-2xl font-bold leading-tight md:text-4xl">{activeBanner.title}</h2>
                <p className="mt-2 text-sm text-white/95 md:text-base">{activeBanner.subtitle}</p>
              </div>

              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
                {topBanners.map((banner, index) => (
                  <span
                    key={banner.title}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setBannerIndex(index)
                    }}
                    className={`h-2.5 rounded-full transition ${
                      bannerIndex === index ? "w-7 bg-white" : "w-2.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </button>

            <div className="grid gap-3">
              {sideBanners.map((banner) => (
                <button
                  key={banner.title}
                  onClick={() => navigate("/products")}
                  className="group relative h-[134px] overflow-hidden rounded-lg text-left"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-black/20" />
                  <h3 className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">{banner.title}</h3>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
            {quickEntry.map((entry) => (
              <button
                key={entry}
                onClick={() => navigate("/products")}
                className="rounded-lg border border-[#efefef] p-2 text-center hover:border-[#ee4d2d]/30 hover:bg-orange-50/50 transition"
              >
                <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-[#fff1ed]" />
                <p className="text-[11px] text-slate-700 md:text-xs font-medium">{entry}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <h3 className="mb-4 text-base font-semibold uppercase tracking-wide text-slate-700">Danh mục</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {quickCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                className="group flex flex-col items-center gap-2 rounded-lg border border-[#f1f1f1] px-2 py-3 transition hover:-translate-y-0.5 hover:border-[#ee4d2d]/40 shadow-sm hover:shadow"
              >
                <div className="h-14 w-14 overflow-hidden rounded-full bg-[#fafafa]">
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                </div>
                <span className="text-center text-xs font-medium text-slate-700">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Dịch vụ & Spa - Nổi bật hàng đầu */}
        <section className="rounded-xl bg-white p-4 md:p-5 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 relative z-10">
            <h3 className="inline-flex items-center gap-2 text-base md:text-lg font-bold uppercase tracking-wide text-[#ee4d2d]">
              <Bolt className="h-5 w-5" />
              Dịch Vụ Spa & Thú Y Nổi Bật
            </h3>
            <button onClick={() => navigate("/products")} className="text-sm font-medium text-[#ee4d2d] hover:underline">
              Tìm thêm dịch vụ
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
            {serviceProducts.slice(0, 6).map((product) => (
              <ServiceCard key={product.id} product={product} onClick={() => navigate(`/booking?productId=${product.id}`)} />
            ))}
          </div>
        </section>

        {/* Hàng hóa / Vật tư */}
        <section className="rounded-xl bg-white p-4 md:p-5 shadow-sm border border-[#efefef]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-base md:text-lg font-bold uppercase tracking-wide text-[#ee4d2d]">
              <Store className="h-5 w-5" />
              Hàng hóa & Vật tư cho Pet
            </h3>
            <button onClick={() => navigate("/products")} className="text-sm font-medium text-[#ee4d2d] hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {goodsProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => navigate(`/products/${product.id}`)} />
            ))}
          </div>
        </section>

        {/* Spa Nổi Bật */}
        <section className="rounded-xl bg-white p-4 md:p-5 shadow-sm border border-[#efefef]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-base md:text-lg font-bold uppercase tracking-wide text-slate-700">
              <Store className="h-5 w-5" />
              Spa & Thú y yêu thích
            </h3>
            <button onClick={() => navigate("/booking")} className="text-sm font-medium text-[#ee4d2d] hover:underline">
              Đặt lịch ngay
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredSpas.map((spa) => (
              <SpaMallCard key={spa.id} spa={spa} onBook={() => navigate("/booking")} />
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section className="rounded-xl bg-white shadow-sm border border-[#efefef] overflow-hidden">
          <MapSection spas={mockSpas} onSpaSelect={() => {}} userLocation={userLocation} />
        </section>
      </main>
    </div>
  )
}

function SpaMallCard({ spa, onBook }: { spa: Spa; onBook: () => void }) {
  const navigate = useNavigate()
  return (
    <article className="overflow-hidden rounded-xl border border-[#f1f1f1] group hover:border-[#ee4d2d]/30 hover:shadow-md transition">
      <div 
        className="relative h-40 overflow-hidden bg-[#fafafa] cursor-pointer"
        onClick={() => navigate(`/shop/${spa.id}`)}
      >
        <img src={spa.image} alt={spa.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="space-y-3 p-4">
        <h4 
          className="line-clamp-1 font-bold text-slate-800 text-base cursor-pointer hover:text-[#ee4d2d] transition-colors"
          onClick={() => navigate(`/shop/${spa.id}`)}
        >
          {spa.name}
        </h4>
        <p className="line-clamp-2 text-sm text-slate-500">{spa.address}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-[#ee4d2d]">{spa.priceRange}</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <MapPinned className="h-4 w-4 text-emerald-500" />
            {spa.rating}
          </span>
        </div>
        <button
          onClick={onBook}
          className="w-full rounded-lg border border-[#ee4d2d] py-2 text-sm font-bold text-[#ee4d2d] hover:bg-[#ee4d2d] hover:text-white transition"
        >
          Đặt lịch tại spa
        </button>
      </div>
    </article>
  )
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-xl border border-[#f1f1f1] bg-white text-left transition hover:-translate-y-1 hover:border-[#ee4d2d]/30 hover:shadow-md"
    >
      <div className="relative h-48 overflow-hidden bg-[#fafafa]">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-2 min-h-10 text-sm font-medium text-slate-700 group-hover:text-[#ee4d2d] transition-colors">{product.name}</p>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[#ee4d2d]">{product.price}</p>
          {product.rating && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-500" />
              {product.rating}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function ServiceCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#f1f1f1] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full flex flex-col group relative">
      <div className="flex gap-4">
        <div className="h-[90px] w-[90px] shrink-0 overflow-hidden rounded-2xl bg-[#fafafa]">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 space-y-2 flex flex-col justify-center">
          <h4 className="line-clamp-2 text-[15px] font-bold text-slate-800 leading-snug group-hover:text-[#ee4d2d] transition-colors">{product.name}</h4>
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600 border border-slate-100">
              {product.category}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                <Star className="h-3 w-3 fill-amber-500" />
                {product.rating}
              </div>
            )}
          </div>
          {product.description && (
            <p className="line-clamp-2 text-[12px] text-slate-500 leading-normal">{product.description}</p>
          )}
          <p className="text-[16px] font-extrabold text-[#ee4d2d]">{product.price}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className="mt-5 w-full rounded-xl border border-[#ee4d2d] py-3 text-[14px] font-bold text-[#ee4d2d] transition-all duration-300 hover:bg-[#ee4d2d] hover:text-white"
      >
        Đặt lịch ngay
      </button>
    </div>
  )
}
