import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { mockProducts } from "@/common/utils/mock-data"

interface ProductDetailProps {
  productId: string
  onBack?: () => void
}

export function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const product = mockProducts.find((item) => item.id === productId)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  useEffect(() => {
    setSelectedSize(product?.sizes?.[0] ?? null)
    setSelectedVariant(product?.variants?.[0] ?? null)
  }, [product?.id])

  if (!product) {
    return (
      <section className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Khong tim thay san pham</h2>
            {onBack && (
              <button
                onClick={onBack}
                className="rounded-full px-5 py-2 border border-border text-sm hover:bg-muted/60 transition"
              >
                Quay lai
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">Chi tiet san pham</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full px-5 py-2 border border-border text-sm hover:bg-muted/60 transition"
            >
              Quay lai
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-[360px] object-cover rounded-xl"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{product.name}</h3>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                {typeof product.reviews === "number" && (
                  <span className="text-muted-foreground">({product.reviews} danh gia)</span>
                )}
              </div>
              <div className="text-2xl font-semibold text-primary">{product.price}</div>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Chon size</div>
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
                  <div className="text-sm text-muted-foreground">Khong co size</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Chon phan loai</div>
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
                  <div className="text-sm text-muted-foreground">Khong co phan loai</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
