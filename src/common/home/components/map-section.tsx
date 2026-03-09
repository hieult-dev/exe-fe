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
    <section id="map" className="p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-[#ee4d2d]" />
        <h2 className="text-base font-semibold uppercase tracking-wide text-slate-700">Ban do spa gan day</h2>
      </div>

      <InteractiveMap spas={spas} onSpaSelect={onSpaSelect} userLocation={userLocation} />
    </section>
  )
}
