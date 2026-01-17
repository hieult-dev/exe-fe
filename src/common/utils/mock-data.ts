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

export type Product = {
  id: string
  name: string
  image?: string
  rating: number
  reviews?: number
  price: string
  category: string
  description: string
  sizes?: string[]
  variants?: string[]
}

export type ServiceCategory = {
  id: string
  name: string
  image: string
}

export const serviceCategories = [
  "Tất cả sản phẩm",
  "Spa",
  "Thú y",
  "Chó",
  "Mèo",
  "Vệ sinh",
  "Sữa tắm",
  "Đồ chơi",
  "Thức ăn",
]

export const serviceCategoriesWithImages: ServiceCategory[] = [
  {
    id: "all",
    name: "Tất cả sản phẩm",
    image: "/image/all.jpg",
  },
  {
    id: "spa",
    name: "Spa",
    image: "/image/spa.jpg",
  },
  {
    id: "vet",
    name: "Thú y",
    image: "/image/vet.jpg",
  },
  {
    id: "dog",
    name: "Chó",
    image: "/image/dog.jpg",
  },
  {
    id: "cat",
    name: "Mèo",
    image: "/image/cat.jpg",
  },
  {
    id: "cleaning",
    name: "Vệ sinh",
    image: "/image/cleaning.jpg",
  },
  {
    id: "shampoo",
    name: "Sữa tắm",
    image: "/image/shampoo.jpg",
  },
  {
    id: "toys",
    name: "Đồ chơi",
    image: "/image/toys.jpg",
  },
  {
    id: "food",
    name: "Thức ăn",
    image: "/image/food.jpg",
  },
]

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Gói spa cơ bản cho mèo",
    image: "/image/1.png",
    rating: 4.8,
    reviews: 120,
    price: "199,000 VND",
    category: serviceCategories[1],
    description: "Gói spa cơ bản giúp mèo sạch sẽ, thư giãn và dễ chịu.",
  },
  {
    id: "p2",
    name: "Gói spa cao cấp cho chó",
    image: "/image/2.png",
    rating: 4.7,
    reviews: 98,
    price: "349,000 VND",
    category: serviceCategories[1],
    description: "Dịch vụ spa cao cấp dành cho chó với chăm sóc toàn diện.",
  },
  {
    id: "p3",
    name: "Khám tổng quát cho chó",
    image: "/image/1.png",
    rating: 4.6,
    reviews: 64,
    price: "259,000 VND",
    category: serviceCategories[2],
    description: "Khám sức khỏe tổng quát định kỳ cho chó cưng.",
  },
  {
    id: "p4",
    name: "Tiêm phòng định kỳ",
    image: "/image/2.png",
    rating: 4.5,
    reviews: 42,
    price: "189,000 VND",
    category: serviceCategories[2],
    description: "Dịch vụ tiêm phòng giúp thú cưng phòng tránh bệnh nguy hiểm.",
  },
  {
    id: "p5",
    name: "Thức ăn chó",
    image: "/image/1.png",
    rating: 4.9,
    reviews: 210,
    price: "129,000 VND",
    category: serviceCategories[3],
    description: "Thức ăn giàu dinh dưỡng dành cho chó ở mọi độ tuổi.",
    variants: ["Gà", "Bò"],
    sizes: ["S", "M", "L"],
  },
  {
    id: "p6",
    name: "Thức ăn mèo premium",
    image: "/image/2.png",
    rating: 4.8,
    reviews: 176,
    price: "149,000 VND",
    category: serviceCategories[4],
    description: "Thức ăn cao cấp giúp mèo khỏe mạnh và lông bóng mượt.",
    variants: ["Gà", "Bò"],
    sizes: ["S", "M", "L"],
  },
  {
    id: "p7",
    name: "Cát vệ sinh mèo",
    image: "/image/1.png",
    rating: 4.4,
    reviews: 52,
    price: "99,000 VND",
    category: serviceCategories[5],
    description: "Cát vệ sinh khử mùi tốt, an toàn cho mèo.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "p8",
    name: "Sữa tắm khử mùi cho chó",
    image: "/image/2.png",
    rating: 4.6,
    reviews: 88,
    price: "79,000 VND",
    category: serviceCategories[6],
    description: "Sữa tắm giúp khử mùi và bảo vệ da cho chó.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "p9",
    name: "Đồ chơi gấu bông cho mèo",
    image: "/image/1.png",
    rating: 4.3,
    reviews: 34,
    price: "59,000 VND",
    category: serviceCategories[7],
    description: "Đồ chơi giúp mèo vận động và giảm căng thẳng.",
    sizes: ["S", "M", "L"],
  },
  {
    id: "p10",
    name: "Snack thưởng cho chó",
    image: "/image/2.png",
    rating: 4.7,
    reviews: 142,
    price: "39,000 VND",
    category: serviceCategories[8],
    description: "Snack thưởng thơm ngon, phù hợp huấn luyện chó.",
    variants: ["Gà", "Bò"],
    sizes: ["S", "M", "L"],
  },
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


