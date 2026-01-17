import { useMemo, useState } from "react"
import { PetMomentsSection } from "@/common/home/components/pet-moments-section"
import { Navigation } from "@/common/home/components/navigation"
import { mockSpas, serviceCategoriesWithImages, type Spa } from "@/common/utils/mock-data"
import { CtaSection } from "@/common/home/components/cta-section"
import { FeaturedSpasSection } from "@/common/home/components/featured-spas-section"
import { HomeFooter } from "@/common/home/components/home-footer"
import { HomeHero } from "@/common/home/components/home-hero"
import { MapSection } from "@/common/home/components/map-section"
import { ServiceFilterSection } from "@/common/home/components/service-filter-section"
import { SpaListSection } from "@/common/home/components/spa-list-section"

interface AppHomeProps {
  onSelectProductCategory?: (category: string) => void
}

export function AppHome({ onSelectProductCategory }: AppHomeProps) {
  const [searchQuery, ] = useState("")
  const [selectedService, setSelectedService] = useState("Tất cả sản phẩm")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()
  const [, setSelectedSpa] = useState<Spa | null>(null)

  const handleUseLocation = () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.")
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          resolve()
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please allow location access.")
          reject(error)
        },
      )
    })
  }

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
      <Navigation onUseLocation={handleUseLocation} />

      <div className="w-full">
        <main className="min-w-0 flex-1 px-0">
          <HomeHero totalSpas={mockSpas.length} />
          <ServiceFilterSection
            services={serviceCategoriesWithImages}
            selectedService={selectedService}
            onSelectService={(service) => {
              setSelectedService(service)
              onSelectProductCategory?.(service)
            }}
          />
          <FeaturedSpasSection spas={featuredSpas} onViewDetails={setSelectedSpa} />
          <MapSection spas={filteredSpas} onSpaSelect={setSelectedSpa} userLocation={userLocation} />
          <SpaListSection spas={filteredSpas} onViewDetails={setSelectedSpa} />
          <PetMomentsSection />
          <CtaSection />
          <HomeFooter />
        </main>
      </div>
    </div>
  )
}
