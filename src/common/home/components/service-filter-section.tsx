import { CategoryGrid } from "@/common/home/components/fragments/category-grid"
import { ServiceCategory } from "@/common/utils/mock-data"

interface ServiceFilterSectionProps {
  services: ServiceCategory[]
  selectedService: string
  onSelectService: (service: string) => void
}

export function ServiceFilterSection({
  services,
  selectedService,
  onSelectService,
}: ServiceFilterSectionProps) {
  return (
    <section className="py-8 border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <CategoryGrid
          categories={services}
          selectedCategory={selectedService}
          onSelectCategory={onSelectService}
        />
      </div>
    </section>
  )
}
