import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckoutForm } from "@/common/home/page/features/cart/CheckoutForm"
import { CartItem, type CartLine } from "@/common/home/page/features/cart/CartItem"
import { mockProducts } from "@/common/utils/mock-data"

const shopNames = ["PETPEEs Mall", "Spa House Official", "Doggo Planet"]

function parsePrice(value: string) {
  const amount = Number(value.replace(/[^0-9]/g, ""))
  return Number.isNaN(amount) ? 0 : amount
}

function buildInitialCart(): CartLine[] {
  return mockProducts.slice(0, 3).map((product, index) => ({
    id: `cart-${product.id}`,
    name: product.name,
    image: product.image || "/placeholder.svg",
    quantity: index + 1,
    price: parsePrice(product.price),
    shopName: shopNames[index % shopNames.length],
  }))
}

export function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CartLine[]>(() => buildInitialCart())

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const shippingFee = items.length > 0 ? 18000 : 0

  const increaseItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    )
  }

  const decreaseItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return { ...item, quantity: Math.max(1, item.quantity - 1) }
      })
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <section className="min-h-screen bg-[#f5f5f5] py-6">
      <div className="mx-auto max-w-7xl space-y-4 px-3 md:px-4">
        <div className="rounded-sm bg-white p-4">
          <h1 className="text-2xl font-semibold text-slate-800">Giỏ hàng của bạn</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý sản phẩm từ spa/shop trong một nơi.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-sm bg-white p-10 text-center">
            <p className="text-slate-600">Giỏ hàng đang trống. Hãy quay lại để tiếp tục mua sắm.</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-4 rounded-sm bg-[#ee4d2d] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Xem sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrease={increaseItem}
                  onDecrease={decreaseItem}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <CheckoutForm
              totalItems={totalItems}
              subtotal={subtotal}
              shippingFee={shippingFee}
              onCheckout={() => navigate("/orders")}
            />
          </div>
        )}
      </div>
    </section>
  )
}
