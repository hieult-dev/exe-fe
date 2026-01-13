# Pet Spa Marketplace - React + Vite

Nền tảng tìm kiếm và đặt dịch vụ spa thú cưng với Google Maps tích hợp. Xây dựng với React, TypeScript và Vite.

## Tính năng

- 🔍 Tìm kiếm spa theo tên, địa chỉ, dịch vụ
- 🗺️ Bản đồ Google Maps hiển thị tất cả spa với markers tương tác
- 🎯 Bộ lọc theo loại dịch vụ (Tắm rửa, Cắt tỉa, Massage, Khách sạn)
- ⭐ Hiển thị đánh giá và giá cả spa
- 📱 Responsive design cho mobile và desktop
- ⚡ Build nhanh với Vite

## Yêu cầu hệ thống

- Node.js 18+ hoặc mới hơn
- npm, yarn, hoặc pnpm

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 2. Cấu hình Google Maps API Key (Tùy chọn)

Nếu bạn muốn sử dụng Google Maps API key riêng, tạo file `.env.local` trong thư mục gốc:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Lấy Google Maps API Key:**
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật **Maps JavaScript API**
4. Tạo API credentials và copy API key
5. Thêm domain restrictions để bảo mật:
   - Application restrictions: HTTP referrers (web sites)
   - Website restrictions: Thêm domain của bạn (VD: `yourdomain.com/*`)
   - API restrictions: Chỉ chọn "Maps JavaScript API"

**Lưu ý bảo mật:** API key cho Google Maps được thiết kế để sử dụng ở phía client. Điều này là an toàn khi bạn thiết lập HTTP referrer restrictions trong Google Cloud Console.

### 3. Chạy development server

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:5173](http://localhost:5173) để xem kết quả.

## Build production

```bash
npm run build
npm run preview
```

File build sẽ được tạo trong thư mục `dist/`.

## Deploy

### Vercel (Khuyến nghị)
1. Push code lên GitHub
2. Import project vào Vercel
3. Thêm environment variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` trong Vercel dashboard
4. Deploy

### Netlify
1. Build project: `npm run build`
2. Upload thư mục `dist/` lên Netlify
3. Thiết lập environment variables trong Netlify dashboard

### Các platform khác
Build project và upload thư mục `dist/` lên bất kỳ static hosting nào (GitHub Pages, Firebase Hosting, etc.)

## Cấu trúc thư mục

```
├── src/
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Entry point
│   ├── common/style/global.css  # Global styles
│   ├── common/components/
│   │   ├── navigation.tsx      # Navigation bar
│   │   ├── search-bar.tsx      # Search functionality
│   │   ├── service-filter.tsx  # Service filter
│   │   ├── spa-card.tsx        # Spa card component
│   │   ├── interactive-map.tsx # Google Maps component
│   │   └── ui/
│   │       └── button.tsx      # Button component
│   └── common/lib/
│       ├── mock-data.ts        # Sample spa data
│       └── utils.ts            # Utility functions
├── public/                 # Static assets (images)
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── tsconfig.json           # TypeScript config
```

## Công nghệ sử dụng

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool và dev server
- **Tailwind CSS v3** - Styling
- **Radix UI** - Accessible UI components
- **Google Maps JavaScript API** - Maps integration
- **Lucide React** - Icons

## Tùy chỉnh dữ liệu spa

Chỉnh sửa file `src/common/lib/mock-data.ts` để thêm/sửa thông tin spa:

```typescript
export const mockSpas: Spa[] = [
  {
    id: "1",
    name: "Tên Spa",
    description: "Mô tả spa",
    address: "Địa chỉ đầy đủ",
    lat: 10.7769,
    lng: 106.7009,
    rating: 4.8,
    reviews: 234,
    image: "/path/to/image.jpg",
    services: ["Cắt Tỉa Lông", "Tắm & Vệ Sinh"],
    priceRange: "500.000 - 2.000.000đ",
    phone: "0901234567",
    hours: "8:00 - 20:00",
    featured: true,
  },
  // Thêm spa khác...
]
```

## Thêm hình ảnh

Đặt hình ảnh spa vào thư mục `public/` và reference trong mock-data:

```typescript
image: "/my-spa-image.jpg"  // Tương ứng với public/my-spa-image.jpg
```

## Troubleshooting

### Bản đồ không hiển thị
- Kiểm tra Google Maps API key đã được thiết lập đúng
- Mở Developer Console (F12) để xem lỗi chi tiết
- Đảm bảo Maps JavaScript API đã được bật trong Google Cloud Console

### Build lỗi
- Xóa thư mục `node_modules` và `dist`, sau đó chạy lại `npm install`
- Đảm bảo Node.js version >= 18

### Lỗi TypeScript
- Chạy `npm run build` để xem lỗi chi tiết
- Kiểm tra imports và exports trong các component

## License

MIT License - Tự do sử dụng cho dự án cá nhân và thương mại.

## Liên hệ & Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub repository.
