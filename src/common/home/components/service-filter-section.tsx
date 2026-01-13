import { ServiceFilter } from "@/common/home/components/fragments/service-filter"

interface ServiceFilterSectionProps {
  services: string[]
  selectedService: string
  onSelectService: (service: string) => void
}

export function ServiceFilterSection({
  services,
  selectedService,
  onSelectService,
}: ServiceFilterSectionProps) {
  return (
    <section className="py-8 border-b border-border bg-background sticky top-20 z-40">
      <div className="container mx-auto px-4">
        <ServiceFilter
          services={services}
          selectedService={selectedService}
          onSelectService={onSelectService}
        />
      </div>
    </section>
  )
}
