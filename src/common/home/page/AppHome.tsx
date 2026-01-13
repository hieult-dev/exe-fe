import { useMemo, useState } from "react"

import { Navigation } from "@/common/home/components/navigation"
import { mockSpas, serviceCategories, type Spa } from "@/common/utils/mock-data"
import { CtaSection } from "@/common/home/components/cta-section"
import { FeaturedSpasSection } from "@/common/home/components/featured-spas-section"
import { HomeFooter } from "@/common/home/components/home-footer"
import { HomeHero } from "@/common/home/components/home-hero"
import { MapSection } from "@/common/home/components/map-section"
import { ServiceFilterSection } from "@/common/home/components/service-filter-section"
import { SpaListSection } from "@/common/home/components/spa-list-section"

export function AppHome() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState("All")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null)

  const handleUseLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please allow location access.")
      },
    )
  }

  const filteredSpas = useMemo(() => {
    return mockSpas.filter((spa) => {
      const matchesSearch =
        searchQuery === "" ||
        spa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spa.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spa.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesService = selectedService === "All" || spa.services.includes(selectedService)
      return matchesSearch && matchesService
    })
  }, [searchQuery, selectedService])

  const featuredSpas = mockSpas.filter((spa) => spa.featured)

  return (
    <div className="min-h-screen">
      <Navigation />

      <HomeHero totalSpas={mockSpas.length} onSearch={setSearchQuery} onUseLocation={handleUseLocation} />
      <ServiceFilterSection
        services={serviceCategories}
        selectedService={selectedService}
        onSelectService={setSelectedService}
      />
      <FeaturedSpasSection spas={featuredSpas} onViewDetails={setSelectedSpa} />
      <MapSection spas={filteredSpas} onSpaSelect={setSelectedSpa} userLocation={userLocation} />
      <SpaListSection spas={filteredSpas} onViewDetails={setSelectedSpa} />
      <CtaSection />
      <HomeFooter />
    </div>
  )
}
