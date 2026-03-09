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
      <h3 className="text-base font-semibold text-slate-800">Tong quan don hang</h3>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Tong san pham</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Tam tinh</span>
          <span>{subtotal.toLocaleString()}đ</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Phi van chuyen</span>
          <span>{shippingFee.toLocaleString()}đ</span>
        </div>
      </div>

      <div className="mt-4 border-t border-[#efefef] pt-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-slate-600">Tong thanh toan</span>
          <span className="text-2xl font-bold text-[#ee4d2d]">{total.toLocaleString()}đ</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="mt-5 w-full rounded-sm bg-[#ee4d2d] py-3 text-sm font-semibold text-white transition hover:bg-[#db4324]"
      >
        Mua hang ({totalItems})
      </button>

      <p className="mt-3 text-xs text-slate-500">
        Nhan "Mua hang" dong nghia ban dong y dieu khoan va chinh sach cua PETPEEs.
      </p>
    </aside>
  )
}
