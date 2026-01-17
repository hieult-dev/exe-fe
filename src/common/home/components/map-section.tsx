import { MapPin } from "lucide-react"

import { InteractiveMap } from "@/common/home/components/fragments/interactive-map"
import type { Spa } from "@/common/utils/mock-data"

interface MapSectionProps {
  spas: Spa[]
  onSpaSelect: (spa: Spa) => void
  userLocation?: { lat: number; lng: number }
}

export function MapSection({ spas, onSpaSelect, userLocation }: MapSectionProps) {
  return (
    <section id="map" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">Bản đồ tiệm spa gần đây</h2>
        </div>

        <InteractiveMap spas={spas} onSpaSelect={onSpaSelect} userLocation={userLocation} />
      </div>
    </section>
  )
}
