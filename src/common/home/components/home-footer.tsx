import { Link } from "react-router-dom"

const columns = [
  {
    title: "CHĂM SÓC KHÁCH HÀNG",
    links: [
      { label: "Trung tâm trợ giúp", to: "/products" },
      { label: "Hướng dẫn đặt dịch vụ", to: "/booking" },
      { label: "Vận chuyển và thanh toán", to: "/cart" },
      { label: "Bảo hành và hoàn tiền", to: "/orders" },
    ],
  },
  {
    title: "VỀ PETPEEs",
    links: [
      { label: "Giới thiệu", to: "/" },
      { label: "Tuyển dụng", to: "/" },
      { label: "Điều khoản", to: "/" },
      { label: "Chính sách bảo mật", to: "/" },
    ],
  },
  {
    title: "THANH TOÁN",
    links: [
      { label: "Ví điện tử", to: "/cart" },
      { label: "Thẻ ngân hàng", to: "/cart" },
      { label: "Thanh toán khi nhận hàng", to: "/cart" },
      { label: "Trả góp", to: "/cart" },
    ],
  },
  {
    title: "THEO DÕI CHÚNG TÔI",
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
    <footer className="bg-gradient-to-b from-[#fc5c88] to-[#ff7ca3] text-white">
      <div className="mx-auto max-w-7xl px-3 py-8 md:px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/80">{column.title}</h4>
              <ul className="space-y-2 text-sm text-white/90">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-white transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/20 pt-6 text-xs text-white/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>© 2026 PETPEEs. Nền tảng kết nối mua bán cho pet owner và spa/shop tại Việt Nam.</p>
            <p>Quốc gia &amp; Khu vực: Việt Nam | Hồ Chí Minh</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
