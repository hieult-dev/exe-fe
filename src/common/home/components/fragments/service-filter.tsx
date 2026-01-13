interface ServiceFilterProps {
  services: string[]
  selectedService: string
  onSelectService: (service: string) => void
}

export function ServiceFilter({ services, selectedService, onSelectService }: ServiceFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {services.map((service) => (
        <button
          key={service}
          onClick={() => onSelectService(service)}
          className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedService === service
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {service}
        </button>
      ))}
    </div>
  )
}
