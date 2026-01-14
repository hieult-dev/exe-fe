interface HomeHeroProps {
  totalSpas: number
}

export function HomeHero({ totalSpas }: HomeHeroProps) {
  return (
    <section className="relative pt-32 pb-16 px-4">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            Tìm tiệm spa thú cưng hoàn hảo gần bạn
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto  text-white">
            Đặt lịch trị liệu spa, khám sức khỏe thú y và tìm cửa hàng thú cưng gần đó một cách dễ dàng.
          </p>
          {/* Search bar and location moved to Navigation for a cleaner hero */}

          <div className="pt-6 flex justify-center gap-4">
            <button className="rounded-full px-6 py-3 border border-white/60 text-white bg-transparent hover:bg-white/10 transition">
              Book now
            </button>
            <button className="rounded-full px-6 py-3 border border-white/40 text-white bg-transparent hover:bg-white/10 transition">
              Tìm cửa hàng
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalSpas}+</div>
              <div className="text-sm text-muted-foreground">Tiệm spa</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Đánh giá</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4.8/5</div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}