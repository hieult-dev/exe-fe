export type Spa = {
  id: string
  name: string
  description: string
  address: string
  lat: number
  lng: number
  rating: number
  reviews: number
  image: string
  services: string[]
  priceRange: string
  phone: string
  hours: string
  featured?: boolean
}

export const serviceCategories = [
  "All",
  "Bathing",
  "Trimming",
  "Massage",
  "Boarding",
  "Skin Care",
]

export const mockSpas: Spa[] = [
  {
    id: "1",
    name: "PetSpa Central",
    description: "Premium grooming and relaxation services for pets.",
    address: "123 Nguyen Trai, District 1, Ho Chi Minh City",
    lat: 10.768,
    lng: 106.693,
    rating: 4.8,
    reviews: 320,
    image: "/cute-cat-after-grooming-spa.jpg",
    services: ["Bathing", "Trimming", "Massage"],
    priceRange: "300,000 - 800,000 VND",
    phone: "0901 234 567",
    hours: "08:00 - 20:00",
    featured: true,
  },
  {
    id: "2",
    name: "Golden Paws Spa",
    description: "Gentle care with professional stylists and on-call vets.",
    address: "45 Le Loi, District 1, Ho Chi Minh City",
    lat: 10.773,
    lng: 106.705,
    rating: 4.6,
    reviews: 210,
    image: "/cute-cat-after-grooming-spa.jpg",
    services: ["Bathing", "Skin Care"],
    priceRange: "250,000 - 650,000 VND",
    phone: "0902 456 789",
    hours: "09:00 - 19:00",
    featured: true,
  },
  {
    id: "3",
    name: "Happy Tails Studio",
    description: "Full-service grooming with modern equipment and clean rooms.",
    address: "88 Vo Van Tan, District 3, Ho Chi Minh City",
    lat: 10.781,
    lng: 106.689,
    rating: 4.7,
    reviews: 178,
    image: "/cute-cat-after-grooming-spa.jpg",
    services: ["Trimming", "Massage"],
    priceRange: "200,000 - 550,000 VND",
    phone: "0903 111 222",
    hours: "08:30 - 18:30",
  },
  {
    id: "4",
    name: "Pawfect Hotel",
    description: "Boarding and spa packages with daily photo updates.",
    address: "12 Phan Xich Long, Phu Nhuan, Ho Chi Minh City",
    lat: 10.801,
    lng: 106.684,
    rating: 4.5,
    reviews: 95,
    image: "/cute-cat-after-grooming-spa.jpg",
    services: ["Boarding", "Bathing"],
    priceRange: "400,000 - 1,200,000 VND",
    phone: "0904 222 333",
    hours: "07:30 - 21:00",
    featured: true,
  },
  {
    id: "5",
    name: "City Pet Care",
    description: "Quick wash and trim for busy pet parents.",
    address: "210 Nguyen Van Cu, District 5, Ho Chi Minh City",
    lat: 10.755,
    lng: 106.667,
    rating: 4.3,
    reviews: 64,
    image: "/cute-cat-after-grooming-spa.jpg",
    services: ["Bathing", "Trimming"],
    priceRange: "150,000 - 400,000 VND",
    phone: "0905 333 444",
    hours: "09:00 - 18:00",
  },
  {
    id: "6",
    name: "Green Paw Wellness",
    description: "Skin treatment and wellness packages for sensitive pets.",
    address: "9 Dien Bien Phu, Binh Thanh, Ho Chi Minh City",
    lat: 10.803,
    lng: 106.704,
    rating: 4.4,
    reviews: 88,
    image: "/cute-cat-after-grooming-spa.jpg",
    services: ["Skin Care", "Massage"],
    priceRange: "280,000 - 700,000 VND",
    phone: "0906 444 555",
    hours: "08:00 - 19:30",
  },
]