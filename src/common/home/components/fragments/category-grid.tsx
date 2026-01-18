import { ServiceCategory } from "@/common/utils/mock-data"

interface CategoryGridProps {
  categories: ServiceCategory[]
  selectedCategory?: string
  onSelectCategory: (categoryName: string) => void
}

export function CategoryGrid({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.name)}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:shadow-lg ${
            selectedCategory === category.name
              ? "ring-2 ring-primary bg-primary/10"
              : "hover:bg-muted/50"
          }`}
        >
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "https://via.placeholder.com/100"
              }}
            />
          </div>
          <span className="text-sm font-medium text-center line-clamp-2">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  )
}
