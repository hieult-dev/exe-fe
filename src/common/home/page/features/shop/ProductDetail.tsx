import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import { mockProducts, mockReviews } from "@/common/utils/mock-data"
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
    (p) => p.category === product?.category && p.id !== product?.id
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
          <div className="border-t border-border pt-8 space-y-6">
            <h3 className="text-2xl font-bold">Sản phẩm liên quan</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAction={() => {}}
                  onCardClick={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
