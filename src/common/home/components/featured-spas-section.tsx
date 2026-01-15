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
          <h2 className="text-3xl md:text-4xl font-bold">Spa Nổi Bật</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spas.map((spa) => (
            <SpaCard key={spa.id} spa={spa} onViewDetails={onViewDetails} />
          ))}
        </div>
      </div>
      <div className="w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 lg:gap-8">

            <div className="w-full sm:w-1/2 relative overflow-hidden group rounded-xl">
              <a
                href="/spa/featured-1"
                className="block aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/9] overflow-hidden"
              >
                <img
                  src="/image/1.png"
                  alt="Banner 1"
                  className="w-full h-full object-contain bg-gray-50 transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
            </div>

            <div className="w-full sm:w-1/2 relative overflow-hidden group rounded-xl">
              <a
                href="/spa/featured-2"
                className="block aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/9] overflow-hidden"
              >
                <img
                  src="/image/2.png"
                  alt="Banner 2"
                  className="w-full h-full object-contain bg-gray-50 transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
