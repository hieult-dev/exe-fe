import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Store, MapPin, ShieldCheck, ArrowUpRight, MessageSquare, Phone } from "lucide-react"
import { mockProducts, mockReviews, mockSpas } from "@/common/utils/mock-data"
import { ProductCard } from "./ProductCard"

const REVIEWS_PER_PAGE = 3

export function ProductDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { productId } = useParams()
  const onBack = () => {
    navigate(`/products${location.search}`)
  }
  const product = mockProducts.find((item) => item.id === productId)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [reviewPage, setReviewPage] = useState(0)

  const spa = mockSpas.find(s => s.id === product?.spaId) || mockSpas[0]

  useEffect(() => {
    setSelectedSize(product?.sizes?.[0] ?? null)
    setSelectedVariant(product?.variants?.[0] ?? null)
  }, [product?.id])

  const handleAddToCart = () => {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleNextImage = () => {
    const images = product?.images || [product?.image]
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrevImage = () => {
    const images = product?.images || [product?.image]
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const relatedProducts = mockProducts.filter(
    (p) => (p.spaId === product?.spaId || p.category === product?.category) && p.id !== product?.id
  ).slice(0, 4)

  const paginatedReviews = mockReviews.slice(
    reviewPage * REVIEWS_PER_PAGE,
    (reviewPage + 1) * REVIEWS_PER_PAGE
  )
  const totalReviewPages = Math.ceil(mockReviews.length / REVIEWS_PER_PAGE)

  if (!product) {
    return (
      <section className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Không tìm thấy sản phẩm</h2>
            {onBack && (
              <button
                onClick={onBack}
                className="rounded-full px-5 py-2 border border-border text-sm hover:bg-muted/60 transition"
              >
                Quay lại
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const productImages = product.images || [product.image || "/placeholder.svg"]
  const currentImage = productImages[currentImageIndex]

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">Chi tiết sản phẩm</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full px-5 py-2 border border-border text-sm hover:bg-muted/60 transition"
            >
              Quay lại
            </button>
          )}
        </div>

        {/* Image Gallery & Product Options */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative bg-card rounded-2xl border border-border p-6">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-96 object-cover rounded-xl"
            />
            {productImages.length > 1 && (
              <div className="absolute inset-y-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2">
                <button
                  onClick={handlePrevImage}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
            {productImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition ${
                      index === currentImageIndex ? "bg-primary w-8" : "bg-muted w-2"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Options */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{product.name}</h3>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                {typeof product.reviews === "number" && (
                  <span className="text-muted-foreground">({product.reviews} đánh giá)</span>
                )}
              </div>
              <div className="text-3xl font-semibold text-primary">{product.price}</div>
            </div>

            <div className="space-y-5 border-t border-border pt-6">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Chọn size</div>
                {hasSizes ? (
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-full px-4 py-2 text-sm border transition ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Không có size</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Chọn phân loại</div>
                {hasVariants ? (
                  <div className="flex flex-wrap gap-2">
                    {product.variants?.map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`rounded-full px-4 py-2 text-sm border transition ${
                          selectedVariant === variant
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Không có phân loại</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Số lượng</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-full px-3 py-2 border border-border hover:bg-muted transition"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-full px-3 py-2 border border-border hover:bg-muted transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-full font-semibold transition flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {addedToCart ? "Đã thêm vào giỏ hàng" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="border-t border-border pt-8 space-y-4">
          <h3 className="text-xl font-bold">Mô tả sản phẩm</h3>
          <p className="text-muted-foreground leading-relaxed">
            {expandedDescription ? product.fullDescription : product.description}
          </p>
          {product.fullDescription && product.fullDescription.length > product.description.length && (
            <button
              onClick={() => setExpandedDescription(!expandedDescription)}
              className="text-primary font-semibold hover:underline"
            >
              {expandedDescription ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>

        {/* Shop Information Section */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Shop Avatar & Basic Info */}
            <div className="flex items-center gap-5 md:pr-8 md:border-r border-slate-100 shrink-0">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-2 border-primary/20 p-1 bg-white">
                  <img src={spa.image} alt={spa.name} className="h-full w-full object-cover rounded-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                  <ShieldCheck className="h-3 w-3" />
                </div>
              </div>
              <div>
                <h4 
                  className="font-bold text-xl text-slate-800 flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/shop/${spa.id}`)}
                >
                  {spa.name}
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Mall</span>
                </h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-[13px] font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    {spa.rating}
                  </div>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-[13px] text-slate-500 font-medium">{spa.reviews} đánh giá</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="bg-primary text-white text-[12px] font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center gap-1.5 shadow-lg shadow-primary/20">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chát ngay
                  </button>
                  <button 
                    onClick={() => navigate(`/shop/${spa.id}`)}
                    className="border border-slate-200 text-slate-600 text-[12px] font-bold px-4 py-2 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <Store className="h-3.5 w-3.5" />
                    Xem Shop
                  </button>
                </div>
              </div>
            </div>

            {/* Shop Stats & Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8 flex-1">
              <div className="space-y-1">
                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <Phone className="h-3 w-3" /> Hotline
                 </div>
                 <div className="text-[14px] font-bold text-slate-700">{spa.phone}</div>
              </div>
              <div className="space-y-1">
                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sản phẩm</div>
                 <div className="text-[14px] font-bold text-primary">120+</div>
              </div>
              <div className="space-y-1">
                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tham gia</div>
                 <div className="text-[14px] font-bold text-slate-700">6 tháng trước</div>
              </div>
              <div className="col-span-2 sm:col-span-3 space-y-1">
                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <MapPin className="h-3 w-3" /> Địa chỉ
                 </div>
                 <div className="text-[13px] text-slate-600 leading-snug font-medium">{spa.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="border-t border-border pt-8 space-y-6">
          <h3 className="text-xl font-bold">Bình luận từ khách hàng</h3>

          {/* Write Review Form */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h4 className="font-semibold">Viết đánh giá của bạn</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold mb-2 block">Họ tên</label>
                <input
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Đánh giá</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="text-2xl hover:text-primary transition">
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Nhận xét</label>
                <textarea
                  placeholder="Chia sẻ ý kiến của bạn..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:bg-primary/90 transition">
                Gửi đánh giá
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {paginatedReviews.map((review) => (
              <div key={review.id} className="bg-card rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{review.customerName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
                <button className="text-xs text-muted-foreground hover:text-primary transition">
                   Có ích ({review.helpful})
                </button>
              </div>
            ))}
          </div>

          {/* Review Pagination */}
          {totalReviewPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalReviewPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setReviewPage(index)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    index === reviewPage
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-12 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Cùng danh mục từ Shop</h3>
              <button 
                onClick={() => navigate("/products")}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAction={() => {}}
                  onCardClick={(item) => {
                    navigate(`/products/${item.id}`)
                    window.scrollTo(0, 0)
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
