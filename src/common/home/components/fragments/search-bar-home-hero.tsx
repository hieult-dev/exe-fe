import { Search, MapPin } from "lucide-react"
import { Button } from "react-bootstrap"

interface SearchBarProps {
  onSearch: (query: string) => void
  onUseLocation: () => void
}

export function SearchBar({ onSearch, onUseLocation }: SearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search spas by name, address, or service..."
          className="w-full pl-12 pr-4 py-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button onClick={onUseLocation} size="lg" variant="outline-primary" className="gap-2 bg-transparent">
        <MapPin className="h-5 w-5" />
        Use Location
      </Button>
    </div>
  )
}
