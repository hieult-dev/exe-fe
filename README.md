# 🚀 Pet Spa Marketplace - Frontend

Frontend application for the **Pet Spa & Pet Service Management System**, built with React, Vite, and Tailwind CSS. This application serves as a multi-tenant client interacting with the Spring Boot backend to manage spas, customers, pets, services, bookings, and more.

## 📌 Project Overview

This is a comprehensive management system featuring:
- **Authentication**: JWT-based login, registration (integrates with Supabase for avatars).
- **Multi-tenancy**: Role-based access control (Owner, Manager, Staff) per Shop.
- **Pet Management**: Manage customer profiles, pets, health records, and vaccinations.
- **Service & Product Catalog**: Define spa services, retail products, and manage inventory.
- **Booking System**: Handle appointment scheduling (Draft, Confirmed, Checked In, etc.).
- **Point of Sale**: Invoices, service packages, and payments (VNPAY, Momo, Stripe integrations defined in BE).
- **Communication**: Live conversation/chat support between Staff and Customers.

## 🛠 Tech Stack

### Core
- ⚛️ **React 18** – UI library
- 🧰 **Vite** – Fast build tool & dev server
- 🧩 **React Router DOM** – Client-side routing
- 🐻 **Zustand** – Global state management
- 🌐 **Axios** – API communication

### UI & Styling
- 💨 **Tailwind CSS** – Utility-first styling architecture
- 🎨 **React-Bootstrap** & **PrimeReact** – Pre-built UI component libraries
- 🏗 **shadcn/ui (Radix UI)** – Accessible, customizable unstyled components
- 🖼 **Lucide React** & **PrimeIcons** – Icon packs
- 🔔 **React Toastify** – Toast notifications

### Maps & Geolocation
- 🗺️ **Leaflet** & **React-Leaflet**
- 📍 **OpenLayers (`ol`)**
- 🌍 **Google Maps API**

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm i
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root based on your backend and third-party keys.
   *(Check `.env` examples if available, usually requires `VITE_API_BASE_URL` pointing to the Spring Boot BE).*

### Running the App

- **Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Preview Production Build:**
  ```bash
  npm run preview
  ```
- **TypeScript Type Check:**
  ```bash
  npm run typecheck
  ```

---

## 📂 Project Structure

- `src/` - Main source code directory.
- `public/` - Static assets.
- `components.json` - configuration for `shadcn/ui` components.
- `tailwind.config.js` - Tailwind utility classes and theme configuration.
- `vite.config.ts` - Vite bundler configuration.
