import { SearchBar } from "@/common/home/components/fragments/search-bar-home-hero"

interface HomeHeroProps {
  totalSpas: number
  onSearch: (query: string) => void
  onUseLocation: () => void
}

export function HomeHero({ totalSpas, onSearch, onUseLocation }: HomeHeroProps) {
  return (
    <section className="relative pt-32 pb-16 px-4 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
            Find the Best Pet Spas Near You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
            Connect with trusted pet spas, compare services, and book instantly
          </p>

          <div className="pt-6">
            <SearchBar onSearch={onSearch} onUseLocation={onUseLocation} />
          </div>

          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalSpas}+</div>
              <div className="text-sm text-muted-foreground">Pet Spas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
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