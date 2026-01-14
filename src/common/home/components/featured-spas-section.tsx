import { Star } from "lucide-react"

import { SpaCard } from "@/common/home/components/fragments/spa-card"
import type { Spa } from "@/common/utils/mock-data"

interface FeaturedSpasSectionProps {
  spas: Spa[]
  onViewDetails: (spa: Spa) => void
}

export function FeaturedSpasSection({ spas, onViewDetails }: FeaturedSpasSectionProps) {
  return (
    <section id="featured" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Star className="h-6 w-6 text-primary fill-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">Spa nổi bật</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spas.map((spa) => (
            <SpaCard key={spa.id} spa={spa} onViewDetails={onViewDetails} />
          ))}
        </div>
      </div>
    </section>
  )
}
