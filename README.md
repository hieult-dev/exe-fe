# 🐾 Pet Spa Marketplace - Frontend

Frontend application for the **Pet Spa & Pet Service Management System**, built with React, Vite, Tailwind CSS, PrimeReact, Zustand, and Axios.

This README documents the current state of the `FE/` repository. Keep it accurate before adding or moving features, because several screens are UI/local-state first while only part of the shop-owner flow is currently connected to the Spring Boot backend.

## 📋 Project Overview

This app is currently focused on the **shop-owner admin portal**:

- **Authentication**: shop login and shop-owner registration call the backend auth endpoints.
- **Session handling**: access token, refresh token, role, and user profile are stored through Zustand persistence plus browser storage helpers.
- **Shop owner shell**: authenticated users enter a fixed admin layout with top header, global search, rail navigation, and nested `/shop-owner/*` routes.
- **Service management**: service list/create/update/delete/status toggle is connected to backend `/api/services`; category options come from `/api/shops/{shopId}/service-categories`.
- **Dashboard/Profile/Inventory/Members**: currently use `ShopOwnerContext` and local storage seed data instead of backend feature APIs.
- **Orders/Bookings/Tax**: currently use page-local mock/fake data for UI workflow simulation.
- **Communication**: user feedback is centralized through React Toastify helpers.

Do not assume every visible screen is backend-integrated. Check the status matrix below before extending a feature.

## ⚙️ Tech Stack

### Core
- **React 18** — UI library
- **Vite** — Fast build tool & dev server
- **React Router DOM** — Client-side routing
- **Zustand** — Global state management
- **Axios** — API communication

### Forms & Validation
- **react-hook-form** — Performant form state management
- **Zod** — Schema-based runtime validation with TypeScript inference
- **@hookform/resolvers** — Connects Zod schemas to react-hook-form

### UI & Styling
- **Tailwind CSS** — Utility-first styling architecture
- **PrimeReact** — Pre-built UI components (DataTable, Sidebar, Dialog, Toolbar, etc.)
- **PrimeIcons** — Icon pack
- **React Toastify** — Toast notifications

### Maps & Geolocation
- **Leaflet** & **React-Leaflet** — used by the shop registration location picker.
- **OpenLayers (`ol`)** — dependency/CSS is present; no active feature page uses OpenLayers APIs yet.
- **Google Maps API packages/types** — installed for future integrations; current source does not call `google.maps` directly.

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
   Create a `.env.local` file in `FE/` based on your backend URL.
   ```
   VITE_GATEWAY=http://localhost:8080
   ```

   `VITE_GATEWAY` is required by `src/common/config/api/index.ts`. The value is normalized by removing trailing slashes.

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

## 🧭 Route Map

Routes are defined in `src/App.tsx`.

| Route | Component | Current behavior |
|------|-----------|------------------|
| `/` | `Navigate` | Redirects to `/shop-owner/dashboard` |
| `/login` | `LoginPage` | Shop login through `POST /api/auth/shop/login` |
| `/register` | `ShopRegisterPage` | Shop-owner registration through `POST /api/auth/shop-owner/register` using `multipart/form-data` |
| `/forgot-password` | `ForgotPasswordPage` | UI-only screen; no backend call is wired yet |
| `/shop-owner` | `ShopOwnerDefaultRedirect` | Redirects to `/shop-owner/dashboard` |
| `/shop-owner/dashboard` | `ShopDashboardPage` | Dashboard cards/charts from local shop-owner context and fake arrays |
| `/shop-owner/profile` | `ShopOverviewPage` | Local shop info view/edit through context and localStorage |
| `/shop-owner/services` | `ShopServiceManager` | Backend-integrated service CRUD and category lookup |
| `/shop-owner/inventory` | `ShopInventoryPage` | Local products/materials CRUD through context and localStorage |
| `/shop-owner/members` | `ShopMembersPage` | Local member CRUD through context and localStorage |
| `/shop-owner/orders` | `ShopOrdersPage` | Mock order workflow in page state |
| `/shop-owner/bookings` | `ShopBookingsPage` | Mock booking workflow in page state |
| `/shop-owner/tax` | `ShopTaxPage` | Fake tax metrics/charts |
| `*` | `Navigate` | Redirects to `/shop-owner/dashboard` |

`AuthRedirect` prevents logged-in users from opening `/login` and `/register`. `ShopOwnerLayout` protects `/shop-owner/*` by requiring both `user` and `authentication` from `useUserStore`.

---

## 🔌 Backend Integration Reality

| Frontend area | Backend endpoints used now | Notes |
|---------------|----------------------------|-------|
| Login | `POST /api/auth/shop/login` | Sends `{ email, password }`; applies returned access/refresh tokens |
| Register | `POST /api/auth/shop-owner/register` | Sends `FormData`; includes owner, shop, address/location, and optional avatar data depending on form state |
| Refresh token | `POST /api/auth/refreshToken` | Called by Axios interceptor after `401` on protected requests |
| Logout | `POST /api/auth/logout` | Clears local/session storage before calling backend logout |
| Services | `GET/POST/PUT/DELETE /api/services` | Service manager is the main backend-integrated feature page |
| Service categories | `GET /api/shops/{shopId}/service-categories?active=true` | Used by service list and service form to resolve category options |

Important integration details:

- `src/common/config/api/index.ts` exposes `GATEWAY_URL`, `AUTH_URL`, `USER_URL`, and `REFRESH_TOKEN_URL`.
- `src/common/api/baseApi.ts` creates an Axios client for each request and injects `Authorization` from `useUserStore.authentication`.
- The stored access token must include the `Bearer ` prefix. `applyAuthSession` normalizes this.
- On `401`, the interceptor calls `refreshToken()`. If refresh also fails, it clears the store and redirects to `/login`.
- API errors are rethrown as `err.response.data` when available, so UI code should use `getErrorMessage` or toast helpers instead of assuming an Axios error shape.
- `ShopServiceManager.tsx` and `ShopServiceForm.tsx` currently hard-code `SHOP_ID = 1`. Replace this with the authenticated shop id when backend/user session data exposes it reliably.
- Backend `ServiceDTO` currently returns `categoryId`, not category name. The service page fetches categories separately and maps `categoryId` to a UI `category` label.

---

## 🧩 Feature Status Matrix

| Feature | Path | Data source | Current status |
|---------|------|-------------|----------------|
| Auth login | `src/common/auth/page/LoginPage.tsx` | Backend | Functional shop login |
| Shop-owner register | `src/common/auth/page/ShopRegisterPage.tsx` | Backend + Leaflet picker | Functional registration flow with map/location UI |
| Forgot password | `src/common/auth/page/ForgotPasswordPage.tsx` | None | UI only |
| Shop owner layout | `src/common/layout/ShopOwnerLayout.tsx` | Zustand user store + local context provider | Functional protected shell |
| Dashboard | `src/apps/dashboard/ShopDashboardPage.tsx` | Context seed + fake chart arrays | UI/local data |
| Profile | `src/apps/profile/ShopOverviewPage.tsx` | Context/localStorage | UI/local edit only |
| Services | `src/apps/services/*` | Backend `/api/services` + category endpoint | Main integrated module |
| Inventory | `src/apps/inventory/ShopInventoryPage.tsx` | Context/localStorage | UI/local CRUD only |
| Members | `src/apps/members/ShopMembersPage.tsx` | Context/localStorage | UI/local CRUD only |
| Orders | `src/apps/orders/ShopOrdersPage.tsx` | Page-local mock data | UI workflow only |
| Bookings | `src/apps/bookings/ShopBookingsPage.tsx` | Page-local mock data | UI workflow only |
| Tax | `src/apps/tax/ShopTaxPage.tsx` | Fake arrays | UI/chart only |

When wiring a local/mock page to backend, add a feature `api/` module, align DTOs with backend response fields, replace local mutations with backend calls, and update this matrix in the same change.

---

## 🗂️ Project Structure

This README documents the `FE/` app. The workspace root currently has two sibling repositories:

```
EXE101/
├── BE/                              # Spring Boot backend; see BE/README.md
└── FE/                              # React + Vite frontend
```

Generated or local-only folders such as `dist/`, `node_modules/`, `.git/`, and `.agents/` may exist in the working tree but are intentionally omitted from the project layout below.

Frontend root layout:

```
FE/
├── public/                          # Static images, icons, and videos served by Vite
├── src/                             # Application source
├── components.json                  # shadcn/ui metadata; no generated shadcn tree is active yet
├── index.html                       # Vite HTML entry
├── package.json                     # Scripts and dependencies
├── package-lock.json                # npm lockfile
├── pnpm-lock.yaml                   # pnpm lockfile metadata
├── postcss.config.js                # PostCSS config
├── postcss.config.mjs               # PostCSS config variant kept in repo
├── tailwind.config.js               # Tailwind config
├── tsconfig.json                    # TypeScript app config
├── tsconfig.node.json               # TypeScript config for Vite/node-side files
└── vite.config.ts                   # Vite config and path aliases
```

Detailed `src/` layout:

```
src/
├── App.tsx                         # Root router & route definitions
├── main.tsx                        # React entry point
│
├── apps/
│   ├── bookings/
│   │   └── ShopBookingsPage.tsx
│   ├── dashboard/
│   │   └── ShopDashboardPage.tsx
│   ├── inventory/
│   │   └── ShopInventoryPage.tsx
│   ├── members/
│   │   └── ShopMembersPage.tsx
│   ├── orders/
│   │   └── ShopOrdersPage.tsx
│   ├── profile/
│   │   └── ShopOverviewPage.tsx
│   ├── services/                   # Modularized feature (model + api + components pattern)
│   │   ├── api/
│   │   │   └── serviceApi.ts       # CRUD API calls for /services endpoint
│   │   ├── model/
│   │   │   └── index.ts            # ServiceDTO types & ServiceVisibilityFilter
│   │   ├── components/
│   │   │   └── ShopServiceForm.tsx # Sidebar (Create/Edit) + Dialog (View) with Zod validation
│   │   └── ShopServiceManager.tsx  # Table, filtering, state orchestration
│   ├── tax/
│   │   └── ShopTaxPage.tsx
│   └── user/
│       ├── model/index.ts          # User model types
│       └── store/UserStore.ts      # Zustand store for logged-in user
│
└── common/
    ├── api/
    │   └── baseApi.ts              # Axios base client (token injection, refresh logic)
    │
    ├── auth/
    │   ├── api/authApi.ts          # Login, register, refresh token API calls
    │   ├── guard/AuthRedirect.tsx  # Route guard (redirect if already logged in)
    │   ├── page/                   # Auth screens (Login, Register, ForgotPassword)
    │   ├── store/ResetStore.ts     # Utility to clear state & redirect on logout
    │   └── utils/session.ts        # Session helpers (token storage, etc.)
    │
    ├── component/                  # Shared UI components
    │   ├── AvatarChip.tsx          # User avatar chip
    │   └── TableActionMenu.tsx     # Context-menu for data table rows
    │
    ├── config/
    │   ├── api/index.ts            # API constants (GATEWAY_URL, endpoint paths)
    │   └── sidebar.config.ts       # Sidebar width presets (DEFAULT, WIDE, etc.)
    │
    ├── layout/
    │   └── ShopOwnerLayout.tsx     # Sidebar + header shell, Context provider
    │
    ├── store/
    │   ├── ShopOwnerContext.tsx    # React Context + Provider (globalSearchQuery, etc.)
    │   └── shopOwnerStore.ts       # Zustand store, type defs, helpers (formatCurrencyVND…)
    │
    ├── style/
    │   └── global.css              # Global CSS / Tailwind base layer
    │
    ├── toast/                      # Toast notification helpers
    │   ├── ToastConfig.ts
    │   ├── ToastHelper.ts
    │   └── ToastProvider.tsx
    │
    ├── user/
    │   └── utils/profile.ts        # User profile utilities
    │
    └── utils/                      # General-purpose utilities
        ├── location.ts
        ├── mock-data.ts
        └── use-mobile.ts
```

> **Architecture Convention:**
> - Each feature page lives in its own subfolder under `src/apps/`.
> - `src/apps/services/` is the current reference module for the `api/` + `model/` + `components/` split.
> - Other `src/apps/*` folders are still single-page feature screens unless their local complexity requires extraction.
> - Pages that call the backend and share request logic should have an `api/` subfolder (e.g. `services/api/serviceApi.ts`).
> - Pages with complex UI forms should extract them into a `components/` subfolder (e.g. `services/components/ShopServiceForm.tsx`).
> - Shared type definitions should live in a `model/index.ts` subfolder when used by both the API and UI layers.
> - Shared components & utilities go in `src/common/component/` and `src/common/utils/`.
> - Use PrimeReact's native `Dialog` and `Sidebar` — the legacy `AppDialog` wrapper has been removed.
> - Create/Edit sidebars must use a custom header with a red back-arrow close button on the left and the title next to it.
> - Sidebar titles must reflect the current mode, for example "Thêm ..." for create and "Cập nhật ..." for update.
> - Forms that need schema validation should use **Zod + react-hook-form**; auth and service forms already follow this pattern.
> - Footer action buttons in forms, dialogs, and sidebars must be horizontally centered.
> - API errors in forms must be shown through toast notifications only; do not render duplicate error banners inside sidebars or dialogs.
> - Do not add placeholder text, placeholder styling, or placeholder image assets. Use labels, helper text, examples outside inputs, or explicit empty states instead.

---

## 🧠 State Management

There are two separate state layers:

| State layer | File | Purpose |
|-------------|------|---------|
| Auth/user store | `src/apps/user/store/UserStore.ts` | Zustand persisted store for logged-in user, role, access token, refresh token, and refresh state |
| Shop-owner context | `src/common/store/ShopOwnerContext.tsx` | Per-owner context for global search, shop info, services, members, products, and materials |

Persistence rules:

- Auth store persists under the Zustand key `user-store`.
- `applyAuthSession` also stores `accessToken`, `refreshToken`, and `role` in either `localStorage` or `sessionStorage` based on "remember me".
- `clearStoredAuthTokens` removes token keys from both storage types.
- Shop-owner context persists under `petpees:shop-owner:<owner email>`.
- The context has seed data in `shopOwnerStore.ts`; do not treat seed records as backend truth.
- The services page overwrites `data.services` with backend results after `getServices()` succeeds.

---

## 🎨 UI/Layout Rules

- Pages inside `/shop-owner/*` should return a root `div` with `flex flex-1 flex-col gap-2`.
- The first block should be a PrimeReact `Toolbar` with white background, rounded corners, and no border.
- The second block should be a white content area with rounded corners and light shadow.
- Do not wrap toolbar and page content in one larger white panel.
- Use `TableActionMenu` for row action menus in PrimeReact `DataTable`.
- Keep table empty states explicit and centered when the table has no rows.
- Use `notify.success/error/info/warn` from `src/common/toast/ToastHelper.ts` for user feedback.
- Prefer Tailwind utility classes already used in nearby files. Avoid introducing a second UI pattern unless the feature requires it.

---

## 🧪 Validation And Forms

- Auth login and shop-owner registration use `react-hook-form`, `zod`, and `zodResolver`.
- Service create/update uses `react-hook-form` and `zod` in `ShopServiceForm.tsx`.
- Service form validation currently requires:
  - `name`: non-empty, max 255 chars.
  - `categoryId`: selected category id greater than `0`.
  - `basePrice`: number greater than or equal to `0`.
  - `durationMin`: number greater than or equal to `1`.
  - `active`: boolean.
- Do not duplicate backend/API errors in persistent inline banners unless the UX is intentionally redesigned. Current convention is toast-only for API failures.

---

## ⚙️ Config Files

| File | Description |
|------|-------------|
| `vite.config.ts` | Vite bundler config, alias `@` → `./src` |
| `tsconfig.json` | TypeScript config, path alias `@/*` → `src/*` |
| `tsconfig.node.json` | TypeScript config for Vite/node-side files |
| `tailwind.config.js` | Tailwind theme & content paths |
| `postcss.config.js`, `postcss.config.mjs` | PostCSS config files currently kept in the repo |
| `components.json` | shadcn/ui metadata; generated aliases are not the active `src/common/component/` layout |
| `.env`, `.env.local` | Environment variables (`VITE_GATEWAY`, etc.) |
| `package-lock.json`, `pnpm-lock.yaml` | Lockfiles present in the repo; prefer one package manager per change |

---

## 🚧 Known Gaps

- Only auth and service management are currently wired to backend APIs.
- `SHOP_ID = 1` is hard-coded in the service feature until authenticated shop context is available.
- `ForgotPasswordPage` is UI-only.
- Dashboard, inventory, members, orders, bookings, and tax screens should not be used as evidence that backend workflows are complete.
- `baseApi.ts` still defines `LOGIN_URL` as `/api/auth/authenticate`, while real login uses `/api/auth/shop/login`; this mostly affects the interceptor skip condition and should be cleaned up when auth code is revisited.
- Both `package-lock.json` and `pnpm-lock.yaml` exist. The current dependency install in this working tree uses npm; avoid switching package managers inside unrelated changes.

---

## 📌 Documentation Rule

Update this README whenever you:

- add, remove, or rename a route;
- connect a UI/local page to backend data;
- change `VITE_*` environment variables;
- change auth/session/refresh-token behavior;
- move shared components, stores, API clients, or feature folders;
- change service/category API contracts;
- change layout conventions for `/shop-owner/*`.
