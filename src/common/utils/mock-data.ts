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
  fullDescription?: string
  images?: string[]
  spaId?: string
}

export type Review = {
  id: string
  customerName: string
  rating: number
  comment: string
  date: string
  helpful: number
}

export type ServiceCategory = {
  id: string
  name: string
  image: string
}

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
    id: "cleaning",
    name: "Cát Vệ sinh",
    image: "/image/cleaning.jpg",
  },
  {
    id: "shampoo",
    name: "Sữa tắm cho thú cưng",
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
  {
    id: "homeCat",
    name: "Nhà Cho Mèo",
    image: "/image/homeC.jpg",
  },
  {
    id: "homeDog",
    name: "Nhà Cho Chó",
    image: "/image/homeD.jpg",
  },
  {
    id: "accessory",
    name: "Phụ kiện",
    image: "/image/accessory.jpg",
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
    category: "Spa",
    description: "Gói spa cơ bản giúp mèo sạch sẽ, thư giãn và dễ chịu.",
    fullDescription: "Gói spa cơ bản của chúng tôi được thiết kế đặc biệt cho những chú mèo yêu thích chăm sóc da và lông. Dịch vụ bao gồm rửa mặt, massage thư giãn, sấy khô và chải lông chuyên nghiệp. Chúng tôi sử dụng các sản phẩm cao cấp, an toàn cho mèo, giúp làm sạch sâu và nuôi dưỡng lông mượt. Mỗi buổi spa kéo dài khoảng 2 giờ với sự chăm sóc tận tâm từ các chuyên gia.",
    images: ["/image/1.png", "/image/spa1.jpg", "/image/spa2.jpg"],
    spaId: "1",
  },
  {
    id: "p2",
    name: "Gói spa cao cấp cho chó",
    image: "/image/2.png",
    rating: 4.7,
    reviews: 98,
    price: "349,000 VND",
    category: "Spa",
    description: "Dịch vụ spa cao cấp dành cho chó với chăm sóc toàn diện.",
    spaId: "2",
  },
  {
    id: "p3",
    name: "Khám tổng quát cho chó",
    image: "/image/1.png",
    rating: 4.6,
    reviews: 64,
    price: "259,000 VND",
    category: "Thú y",
    description: "Khám sức khỏe tổng quát định kỳ cho chó cưng.",
    spaId: "1",
  },
  {
    id: "p4",
    name: "Tiêm phòng định kỳ",
    image: "/image/2.png",
    rating: 4.5,
    reviews: 42,
    price: "189,000 VND",
    category: "Thú y",
    description: "Dịch vụ tiêm phòng giúp thú cưng phòng tránh bệnh nguy hiểm.",
    spaId: "2",
  },
  {
    id: "p15",
    name: "Cắt tỉa lông thú cưng",
    image: "/image/1.png",
    rating: 4.8,
    reviews: 135,
    price: "220,000 VND",
    category: "Spa",
    description: "Cắt tỉa lông chuyên nghiệp, tạo kiểu thời trang cho bé.",
    spaId: "1",
  },
  {
    id: "p16",
    name: "Lấy cao răng thú y",
    image: "/image/2.png",
    rating: 4.7,
    reviews: 89,
    price: "150,000 VND",
    category: "Thú y",
    description: "Làm sạch mảng bám, giúp răng miệng thú cưng sạch sẽ và khỏe mạnh.",
    spaId: "2",
  },
  {
    id: "p5",
    name: "Thức ăn chó",
    image: "/image.png",
    rating: 4.9,
    reviews: 210,
    price: "129,000 VND",
    category: "Chó",
    description: "Thức ăn giàu dinh dưỡng dành cho chó ở mọi độ tuổi.",
    variants: ["Gà", "Bò"],
    sizes: ["S", "M", "L"],
    spaId: "1",
  },
  {
    id: "p6",
    name: "Thức ăn mèo premium",
    image: "/image copy.png",
    rating: 4.8,
    reviews: 176,
    price: "149,000 VND",
    category: "Mèo",
    description: "Thức ăn cao cấp giúp mèo khỏe mạnh và lông bóng mượt.",
    variants: ["Gà", "Bò"],
    sizes: ["S", "M", "L"],
    spaId: "2",
  },
  {
    id: "p7",
    name: "Cát vệ sinh mèo",
    image: "/image copy 2.png",
    rating: 4.4,
    reviews: 52,
    price: "99,000 VND",
    category: "Vệ sinh",
    description: "Cát vệ sinh khử mùi tốt, an toàn cho mèo.",
    sizes: ["S", "M", "L"],
    spaId: "1",
  },
  {
    id: "p8",
    name: "Sữa tắm khử mùi cho chó",
    image: "/image copy 3.png",
    rating: 4.6,
    reviews: 88,
    price: "79,000 VND",
    category: "Sữa tắm",
    description: "Sữa tắm giúp khử mùi và bảo vệ da cho chó.",
    sizes: ["S", "M", "L"],
    spaId: "2",
  },
  {
    id: "p9",
    name: "Gấu bông đồ chơi cho mèo (cần câu lông)",
    image: "/image copy 4.png",
    rating: 4.3,
    reviews: 34,
    price: "59,000 VND",
    category: "Đồ chơi",
    description: `Đồ chơi cần câu lông cho mèo giúp bé vận động và giải trí mỗi ngày.

✨ Đặc điểm nổi bật:
- Cần câu làm từ thép dẻo bền, uốn cong linh hoạt, khó gãy
- Chuyển động tự nhiên giúp kích thích mèo săn mồi và chơi đùa hứng thú hơn
- Hỗ trợ giảm stress, tăng vận động, tốt cho sức khỏe và phản xạ
- Giúp hạn chế tình trạng cào/cắn phá đồ trong nhà

📏 Kích thước:
- Dây thép dài: 95cm
- Mồi câu dài: 12cm

🧩 Chất liệu:
Nhựa, thép dẻo và lông nhân tạo

#dochoimeo #cancaumeo #phukienmeo #chamsocmeo`,
    sizes: ["S", "M", "L"],
    spaId: "1",
  }
  ,
  {
    id: "p10",
    name: "Snack thưởng cho chó",
    image: "/image copy 5.png",
    rating: 4.7,
    reviews: 142,
    price: "39,000 VND",
    category: "Thức ăn",
    description: "Snack thưởng thơm ngon, phù hợp huấn luyện chó.",
    variants: ["Gà", "Bò"],
    sizes: ["S", "M", "L"],
    spaId: "2",
  },
  {
    id: "p11",
    name: "Súp thưởng Ciao cho mèo",
    image: "/image copy 6.png",
    rating: 4.9,
    reviews: 512,
    price: "45,000 VND",
    category: "Mèo",
    description: "Súp thưởng thơm ngon kích thích vị giác của mèo.",
    variants: ["Cá ngừ", "Gà"],
    spaId: "1",
  },
  {
    id: "p12",
    name: "Xương gặm sạch răng cho chó",
    image: "/image copy 7.png",
    rating: 4.8,
    reviews: 89,
    price: "25,000 VND",
    category: "Chó",
    description: "Giúp chó sạch răng và giảm stress.",
    spaId: "1",
  },
  {
    id: "p13",
    name: "Vòng cổ chuông cho mèo",
    image: "/image copy 8.png",
    rating: 4.5,
    reviews: 67,
    price: "15,000 VND",
    category: "Phụ kiện",
    description: "Vòng cổ xinh xắn kèm chuông nhỏ cho bé mèo.",
    spaId: "2",
  },
  {
    id: "p14",
    name: "Bát ăn đôi chống kiến",
    image: "/image copy 9.png",
    rating: 4.6,
    reviews: 45,
    price: "85,000 VND",
    category: "Tiện ích",
    description: "Bát ăn thiết kế thông minh ngăn kiến bò vào.",
    spaId: "2",
  }
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
    featured: true,
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

export const mockReviews: Review[] = [
  {
    id: "r1",
    customerName: "Nguyễn Thị A",
    rating: 5,
    comment: "Sản phẩm rất tốt, mèo tôi rất thích. Lông bóng mượt sau khi sử dụng.",
    date: "2024-01-15",
    helpful: 23,
  },
  {
    id: "r2",
    customerName: "Trần Văn B",
    rating: 4,
    comment: "Chất lượng tốt, giá hợp lý. Giao hàng nhanh chóng.",
    date: "2024-01-10",
    helpful: 15,
  },
  {
    id: "r3",
    customerName: "Phạm Minh C",
    rating: 5,
    comment: "Tuyệt vời! Chó tôi khỏe mạnh hơn sau khi dùng gói này.",
    date: "2024-01-05",
    helpful: 31,
  },
  {
    id: "r4",
    customerName: "Võ Thị D",
    rating: 4,
    comment: "Còn tốt nhưng có thể bao bì lớn hơn một chút.",
    date: "2023-12-28",
    helpful: 8,
  },
  {
    id: "r5",
    customerName: "Hồ Văn E",
    rating: 5,
    comment: "Đáng tiền. Sẽ mua lại cho chó tôi.",
    date: "2023-12-20",
    helpful: 12,
  },
]

export type UserPet = {
  id: string
  name: string
  type: string
  breed?: string
  weight: string
  image?: string
}

export const mockUserPets: UserPet[] = [
  {
    id: "pet1",
    name: "Milu",
    type: "Chó",
    breed: "Poodle",
    weight: "5",
    image: "/image/dog.jpg"
  },
  {
    id: "pet2",
    name: "Mimi",
    type: "Mèo",
    breed: "Anh lông ngắn",
    weight: "4",
    image: "/image/cat.png"
  },
  {
    id: "pet3",
    name: "LuLu",
    type: "Chó",
    breed: "Corgi",
    weight: "8",
    image: "/image/dog.jpg"
  }
]


