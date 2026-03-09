import { useEffect, useMemo, useState } from "react"
import { Bolt, MapPinned, Store } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { PetMomentsSection } from "@/common/home/components/pet-moments-section"
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

function soldPercent(index: number) {
  return 35 + (index % 5) * 12
}

export function AppHome({ userLocation }: AppHomeProps) {
  const navigate = useNavigate()
  const featuredSpas = useMemo(() => mockSpas.filter((spa) => spa.featured), [])
  const flashSaleProducts = useMemo(() => mockProducts.slice(0, 6), [])
  const [bannerIndex, setBannerIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % topBanners.length)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [])

  const suggestedProducts = useMemo(() => {
    const cloned = mockProducts.map((product, index) => ({
      ...product,
      id: `${product.id}-extra-${index}`,
    }))
    return [...mockProducts, ...cloned]
  }, [])

  const quickCategories = useMemo(() => serviceCategoriesWithImages.slice(0, 10), [])
  const activeBanner = topBanners[bannerIndex]

  return (
    <div className="bg-[#f5f5f5] pb-8">
      <main className="mx-auto max-w-7xl space-y-4 px-3 pt-4 md:px-4">
        <section className="rounded-sm bg-white p-3 md:p-4">
          <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
            <button
              onClick={() => navigate("/products")}
              className="group relative h-52 overflow-hidden rounded-sm text-left md:h-[280px]"
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
                  className="group relative h-[134px] overflow-hidden rounded-sm text-left"
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
                className="rounded-sm border border-[#efefef] p-2 text-center hover:border-[#ee4d2d]/30"
              >
                <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-[#fff1ed]" />
                <p className="text-[11px] text-slate-700 md:text-xs">{entry}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-sm bg-white p-4">
          <h3 className="mb-4 text-base font-semibold uppercase tracking-wide text-slate-700">Danh mục</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {quickCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                className="group flex flex-col items-center gap-2 rounded-sm border border-[#f1f1f1] px-2 py-3 transition hover:-translate-y-0.5 hover:border-[#ee4d2d]/40"
              >
                <div className="h-14 w-14 overflow-hidden rounded-full bg-[#fafafa]">
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                </div>
                <span className="text-center text-xs text-slate-700">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-sm bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-[#ee4d2d]">
              <Bolt className="h-4 w-4" />
              Flash sale cho pet
            </h3>
            <button onClick={() => navigate("/products")} className="text-sm text-[#ee4d2d]">
              Xem tất cả
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {flashSaleProducts.map((product, index) => (
              <FlashSaleCard key={product.id} product={product} sold={soldPercent(index)} />
            ))}
          </div>
        </section>

        <section className="rounded-sm bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-slate-700">
              <Store className="h-4 w-4" />
              Spa/Shop yêu thích
            </h3>
            <button onClick={() => navigate("/booking")} className="text-sm text-[#ee4d2d]">
              Đặt lịch ngay
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {featuredSpas.map((spa) => (
              <SpaMallCard key={spa.id} spa={spa} onBook={() => navigate("/booking")} />
            ))}
          </div>
        </section>

        <section className="rounded-sm bg-white">
          <MapSection spas={mockSpas} onSpaSelect={() => {}} userLocation={userLocation} />
        </section>

        <PetMomentsSection />

        <section className="rounded-sm bg-white p-4">
          <h3 className="mb-4 text-center text-lg font-semibold uppercase tracking-wide text-[#ee4d2d]">Gợi ý hôm nay</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {suggestedProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/products/${product.id.split("-extra-")[0]}`)}
                className="group overflow-hidden rounded-sm border border-[#f1f1f1] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#ee4d2d]/30 hover:shadow-sm"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 min-h-10 text-sm text-slate-800">{product.name}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-base font-semibold text-[#ee4d2d]">{product.price}</p>
                    <p className="text-xs text-slate-500">Đã bán {15 + (product.id.length % 8) * 9}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function FlashSaleCard({ product, sold }: { product: Product; sold: number }) {
  return (
    <button className="group overflow-hidden rounded-sm border border-[#f1f1f1] text-left transition hover:-translate-y-0.5 hover:border-[#ee4d2d]/30 hover:shadow-sm">
      <div className="relative h-44 overflow-hidden bg-[#fafafa]">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-sm bg-[#ffe97a] px-1.5 py-0.5 text-[11px] font-bold text-[#ee4d2d]">
          -{10 + (product.id.length % 4) * 5}%
        </span>
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-2 min-h-10 text-sm text-slate-700">{product.name}</p>
        <p className="text-base font-semibold text-[#ee4d2d]">{product.price}</p>
        <div className="h-4 overflow-hidden rounded-full bg-[#ffeadf]">
          <div
            className="h-full bg-gradient-to-r from-[#ee4d2d] to-[#ff7337]"
            style={{ width: `${sold}%` }}
          />
        </div>
      </div>
    </button>
  )
}

function SpaMallCard({ spa, onBook }: { spa: Spa; onBook: () => void }) {
  return (
    <article className="overflow-hidden rounded-sm border border-[#f1f1f1]">
      <div className="relative h-36 overflow-hidden bg-[#fafafa]">
        <img src={spa.image} alt={spa.name} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-2 p-3">
        <h4 className="line-clamp-1 font-semibold text-slate-800">{spa.name}</h4>
        <p className="line-clamp-2 text-sm text-slate-600">{spa.address}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#ee4d2d]">{spa.priceRange}</span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <MapPinned className="h-4 w-4" />
            {spa.rating}
          </span>
        </div>
        <button
          onClick={onBook}
          className="w-full rounded-sm border border-[#ee4d2d] py-2 text-sm font-semibold text-[#ee4d2d] hover:bg-[#fff1ed]"
        >
          Đặt lịch tại spa
        </button>
      </div>
    </article>
  )
}


