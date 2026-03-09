import { Link } from "react-router-dom"

const columns = [
  {
    title: "CHAM SOC KHACH HANG",
    links: [
      { label: "Trung tam tro giup", to: "/products" },
      { label: "Huong dan dat dich vu", to: "/booking" },
      { label: "Van chuyen va thanh toan", to: "/cart" },
      { label: "Bao hanh va hoan tien", to: "/orders" },
    ],
  },
  {
    title: "VE PETPEEs",
    links: [
      { label: "Gioi thieu", to: "/" },
      { label: "Tuyen dung", to: "/" },
      { label: "Dieu khoan", to: "/" },
      { label: "Chinh sach bao mat", to: "/" },
    ],
  },
  {
    title: "THANH TOAN",
    links: [
      { label: "Vi dien tu", to: "/cart" },
      { label: "The ngan hang", to: "/cart" },
      { label: "Thanh toan khi nhan hang", to: "/cart" },
      { label: "Tra gop", to: "/cart" },
    ],
  },
  {
    title: "THEO DOI CHUNG TOI",
    links: [
      { label: "Facebook", to: "/" },
      { label: "Instagram", to: "/" },
      { label: "TikTok", to: "/" },
      { label: "YouTube", to: "/" },
    ],
  },
]

export function HomeFooter() {
  return (
    <footer className="border-t border-[#e5e5e5] bg-white">
      <div className="mx-auto max-w-7xl px-3 py-8 md:px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-700">{column.title}</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-[#ee4d2d]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[#f2f2f2] pt-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>© 2026 PETPEEs. Nen tang ket noi mua ban cho pet owner va spa/shop tai Viet Nam.</p>
            <p>Quoc gia & Khu vuc: Viet Nam | Ho Chi Minh City</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
