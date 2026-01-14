import { TrendingUp } from "lucide-react"

import { SpaCard } from "@/common/home/components/fragments/spa-card"
import type { Spa } from "@/common/utils/mock-data"

interface SpaListSectionProps {
  spas: Spa[]
  onViewDetails: (spa: Spa) => void
}

export function SpaListSection({ spas, onViewDetails }: SpaListSectionProps) {
  return (
    <section id="spas" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">Tất cả tiệm spa({spas.length})</h2>
        </div>
        {spas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spas.map((spa) => (
              <SpaCard key={spa.id} spa={spa} onViewDetails={onViewDetails} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">Không có tiệm spa nào phù hợp với tiêu chí của bạn</p>
          </div>
        )}
      </div>
    </section>
  )
}
