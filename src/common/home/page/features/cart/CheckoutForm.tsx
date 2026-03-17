interface CheckoutFormProps {
  totalItems: number
  subtotal: number
  shippingFee: number
  onCheckout: () => void
}

export function CheckoutForm({ totalItems, subtotal, shippingFee, onCheckout }: CheckoutFormProps) {
  const total = subtotal + shippingFee

  return (
    <aside className="rounded-sm border border-[#efefef] bg-white p-4">
      <h3 className="text-base font-semibold text-slate-800">Tổng quan đơn hàng</h3>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Tổng sản phẩm</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Tạm tính</span>
          <span>{subtotal.toLocaleString()}đ</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Phí vận chuyển</span>
          <span>{shippingFee.toLocaleString()}đ</span>
        </div>
      </div>

      <div className="mt-4 border-t border-[#efefef] pt-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-slate-600">Tổng thanh toán</span>
          <span className="text-2xl font-bold text-[#ee4d2d]">{total.toLocaleString()}đ</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="mt-5 w-full rounded-sm bg-[#ee4d2d] py-3 text-sm font-semibold text-white transition hover:bg-[#db4324]"
      >
        Mua hàng ({totalItems})
      </button>

      <p className="mt-3 text-xs text-slate-500">
        Nhấn "Mua hàng" đồng nghĩa bạn đồng ý điều khoản và chính sách của PETPEEs.
      </p>
    </aside>
  )
}
