import { ShoppingCart, Star } from "lucide-react"
import { Button } from "react-bootstrap"
import type { Product } from "@/common/utils/mock-data"

interface ProductCardProps {
  product: Product
  actionLabel?: string
  onAction: (product: Product) => void
  onCardClick?: (product: Product) => void
}

export function ProductCard({
  product,
  actionLabel,
  onAction,
  onCardClick,
}: ProductCardProps) {
  const buttonLabel = actionLabel ?? "Them vao gio hang"

  return (
    <div
      className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer"
      onClick={() => onCardClick?.(product)}
    >
      <div className="relative h-48 bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">{product.name}</h3>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
            </div>
            {typeof product.reviews === "number" && (
              <span className="text-muted-foreground">({product.reviews} đánh giá)</span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border mt-auto">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-primary">{product.price}</span>
            <Button
              onClick={(event) => {
                event.stopPropagation()
                onAction(product)
              }}
              className="inline-flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {buttonLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
