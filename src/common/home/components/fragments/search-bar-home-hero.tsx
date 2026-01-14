import { Search, MapPin, Loader2 } from "lucide-react"
import { Button } from "react-bootstrap"
import { useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void
  onUseLocation: () => Promise<void>
}

export function SearchBar({ onSearch, onUseLocation }: SearchBarProps) {
  const [locating, setLocating] = useState(false)

  const handleUseLocation = async () => {
    try {
      setLocating(true)
      await onUseLocation()
    } catch (e) {
      console.error(e)
    } finally {
      setLocating(false)
    }
  }

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
      <Button onClick={handleUseLocation} size="lg" variant="outline-primary" className="gap-2 bg-transparent" disabled={locating}>
        {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
        {locating ? "Đang xác định..." : "Sử dụng vị trí của tôi"}
      </Button>
    </div>
  )
}
