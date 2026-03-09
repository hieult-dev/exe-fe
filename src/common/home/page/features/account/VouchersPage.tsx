const vouchers = [
  {
    id: "v1",
    title: "Giảm 30k cho đơn từ 299k",
    code: "PETPEES30",
    validUntil: "31/03/2026",
  },
  {
    id: "v2",
    title: "Freeship tối đa 20k",
    code: "FREESHIPPET",
    validUntil: "15/03/2026",
  },
  {
    id: "v3",
    title: "Giảm 15% dịch vụ spa",
    code: "SPAPET15",
    validUntil: "20/03/2026",
  },
]

export function VouchersPage() {
  return (
    <>
      <div className="border-b border-[#f2f2f2] pb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Kho voucher</h1>
        <p className="mt-1 text-sm text-slate-500">Lưu và sử dụng voucher khi mua sản phẩm/dịch vụ.</p>
      </div>

      <div className="grid gap-3 pt-4 md:grid-cols-2">
        {vouchers.map((voucher) => (
          <article
            key={voucher.id}
            className="relative overflow-hidden rounded-sm border border-dashed border-[#ee4d2d]/60 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wide text-[#ee4d2d]">PETPEEs Voucher</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-800">{voucher.title}</h2>
            <p className="mt-2 text-sm text-slate-600">Mã: {voucher.code}</p>
            <p className="mt-1 text-xs text-slate-500">Hiệu lực đến {voucher.validUntil}</p>

            <button className="mt-4 rounded-sm bg-[#ee4d2d] px-4 py-2 text-sm font-semibold text-white">
              Lưu voucher
            </button>
          </article>
        ))}
      </div>
    </>
  )
}
