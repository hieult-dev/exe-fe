import { ShoppingCart, Star } from "lucide-react"
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
    <article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-[#f1f1f1] bg-white transition hover:-translate-y-0.5 hover:border-[#ee4d2d]/35 hover:shadow-sm"
      onClick={() => onCardClick?.(product)}
    >
      <div className="relative h-44 overflow-hidden bg-[#fafafa]">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm text-slate-800">{product.name}</h3>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1 text-[#f59e0b]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
          {typeof product.reviews === "number" && <span>({product.reviews} danh gia)</span>}
        </div>

        <div className="mt-auto pt-3">
          <div className="mb-2 text-base font-semibold text-[#ee4d2d]">{product.price}</div>
          <button
            onClick={(event) => {
              event.stopPropagation()
              onAction(product)
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#ee4d2d] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#db4324]"
          >
            <ShoppingCart className="h-4 w-4" />
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  )
}
