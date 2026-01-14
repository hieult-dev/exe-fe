export function HomeFooter() {
  return (
    <footer className="py-12 bg-muted/30 border-t border-border">
      <div className="w-full px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-3xl">PS</div>
              <span className="text-2xl font-bold text-primary">PetSpaHub</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nền tảng hàng đầu kết nối các spa thú cưng và những người yêu thú cưng tại Việt Nam.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Dành cho khách hàng</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Tìm spa</li>
              <li>Đặt lịch</li>
              <li>Đánh giá</li>
              <li>Khuyến mãi</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Dành cho Spa</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Đăng ký spa</li>
              <li>Quản lý</li>
              <li>Giá cả</li>
              <li>Hỗ trợ</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: info@petspahub.vn</li>
              <li>Hotline: 1900-xxxx</li>
              <li>Facebook</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2026 PetSpaHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
