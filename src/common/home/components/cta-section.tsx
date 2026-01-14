import { Button } from "react-bootstrap"

export function CtaSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Bạn có đang sở hữu một tiệm spa, y tế thú cưng không?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto text-pretty opacity-90 leading-relaxed">
          Gia nhập mạng lưới của chúng tôi để tiếp cận nhiều khách hàng hơn và phát triển doanh nghiệp spa thú cưng của bạn ngay hôm nay!
        </p>
        <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
          Danh sách tiệm spa của tôi
        </Button>
      </div>
    </section>
  )
}
