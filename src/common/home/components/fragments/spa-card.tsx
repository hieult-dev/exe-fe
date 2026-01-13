import { Star, MapPin, Clock, Phone } from "lucide-react"
import { Button } from "react-bootstrap"
import type { Spa } from "@/common/utils/mock-data"

interface SpaCardProps {
  spa: Spa
  onViewDetails: (spa: Spa) => void
}

export function SpaCard({ spa, onViewDetails }: SpaCardProps) {
  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-muted">
        <img src={spa.image || "/placeholder.svg"} alt={spa.name} className="w-full h-full object-cover" />
        {spa.featured && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{spa.name}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{spa.description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold">{spa.rating}</span>
          </div>
          <span className="text-muted-foreground">({spa.reviews} reviews)</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{spa.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{spa.hours}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{spa.phone}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {spa.services.slice(0, 3).map((service) => (
            <span key={service} className="px-3 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
              {service}
            </span>
          ))}
          {spa.services.length > 3 && (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              +{spa.services.length - 3} more
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">{spa.priceRange}</span>
            <Button onClick={() => onViewDetails(spa)}>View Details</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
