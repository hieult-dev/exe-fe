import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PetMomentsSection } from "@/common/home/components/pet-moments-section"
import { mockSpas, serviceCategoriesWithImages, type Spa } from "@/common/utils/mock-data"
import { CtaSection } from "@/common/home/components/cta-section"
import { FeaturedSpasSection } from "@/common/home/components/featured-spas-section"
import { HomeHero } from "@/common/home/components/home-hero"
import { MapSection } from "@/common/home/components/map-section"
import { ServiceFilterSection } from "@/common/home/components/service-filter-section"
import { SpaListSection } from "@/common/home/components/spa-list-section"

interface AppHomeProps {
  userLocation?: { lat: number; lng: number }
}

export function AppHome({ userLocation }: AppHomeProps) {
  const navigate = useNavigate()
  const [searchQuery] = useState("")
  const [selectedService, setSelectedService] = useState("Tất cả sản phẩm")
  const [, setSelectedSpa] = useState<Spa | null>(null)

  const filteredSpas = useMemo(() => {
    return mockSpas.filter((spa) => {
      const matchesSearch =
        searchQuery === "" ||
        spa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spa.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spa.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesService =
        selectedService === "Tất cả sản phẩm" || spa.services.includes(selectedService)
      return matchesSearch && matchesService
    })
  }, [searchQuery, selectedService])

  const featuredSpas = mockSpas.filter((spa) => spa.featured)

  return (
    <div className="min-h-screen ">
      <div className="w-full">
        <main className="min-w-0 flex-1 px-0">
          <HomeHero totalSpas={mockSpas.length} />
          <ServiceFilterSection
            services={serviceCategoriesWithImages}
            selectedService={selectedService}
            onSelectService={(service) => {
              setSelectedService(service)
              const params = new URLSearchParams()
              params.set("category", service)
              navigate(`/products?${params.toString()}`)
            }}
          />
          <FeaturedSpasSection spas={featuredSpas} onViewDetails={setSelectedSpa} />
          <MapSection spas={filteredSpas} onSpaSelect={setSelectedSpa} userLocation={userLocation} />
          <SpaListSection spas={filteredSpas} onViewDetails={setSelectedSpa} />
          <PetMomentsSection />
          <CtaSection />
        </main>
      </div>
    </div>
  )
}
