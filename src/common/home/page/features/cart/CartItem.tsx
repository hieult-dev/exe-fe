import { Minus, Plus, Trash2 } from "lucide-react"

export type CartLine = {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  shopName: string
}

interface CartItemProps {
  item: CartLine
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
  onRemove: (id: string) => void
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <article className="rounded-sm border border-[#efefef] bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-700">Shop: {item.shopName}</div>
      <div className="grid items-center gap-3 sm:grid-cols-[92px,1fr,130px,140px,60px]">
        <img src={item.image} alt={item.name} className="h-20 w-20 rounded-sm object-cover" />

        <div>
          <h3 className="line-clamp-2 text-sm text-slate-800">{item.name}</h3>
          <p className="mt-1 text-xs text-slate-500">Sản phẩm chính hãng PETPEEs Mall</p>
        </div>

        <div className="text-sm font-semibold text-[#ee4d2d]">{item.price.toLocaleString()}đ</div>

        <div className="inline-flex items-center rounded-sm border border-[#e5e5e5]">
          <button
            onClick={() => onDecrease(item.id)}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-[#fafafa]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="inline-flex h-8 min-w-10 items-center justify-center border-x border-[#e5e5e5] text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrease(item.id)}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-[#fafafa]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-slate-500 hover:bg-[#fafafa] hover:text-[#ee4d2d]"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
