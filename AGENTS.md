# Agent Rules

This file defines the working rules for AI agents in this repository.

## Purpose

- Provide guidance for the AI assistant when editing code in this workspace.
- Define preferred behavior for changes, code style, and project conventions.
- Keep interactions focused, practical, and aligned with the user request.

## Vietnamese UI Text Rule

- Tất cả chữ hiển thị trên giao diện người dùng phải dùng tiếng Việt có dấu.
- Áp dụng cho: tiêu đề trang, nhãn form, placeholder, tooltip, nút bấm, tab, menu, breadcrumb, thông báo lỗi, thông báo thành công, confirm dialog, empty state, table header, filter label và mọi text mà người dùng nhìn thấy.
- Không dùng tiếng Việt không dấu trong UI, ví dụ dùng `Cấu hình GHTK`, không dùng `Cau hinh GHTK`.
- Không hard-code text tiếng Anh trên UI nếu màn hình dành cho người dùng Việt, ví dụ dùng `Lưu`, `Hủy`, `Tìm kiếm`, `Đang tải...`, `Không có dữ liệu`.
- Chỉ giữ tiếng Anh cho tên biến, tên hàm, tên class, tên file, API path, enum, package, keyword kỹ thuật và giá trị kỹ thuật không hiển thị trực tiếp cho người dùng.
- Nếu backend trả về enum hoặc mã trạng thái tiếng Anh, frontend phải map sang nhãn tiếng Việt có dấu trước khi hiển thị, ví dụ `PENDING` → `Đang chờ`, `CONFIRMED` → `Đã xác nhận`.
- Khi thêm hoặc sửa component, phải rà soát các text hiển thị trong phần component đó và chuyển sang tiếng Việt có dấu nếu còn thiếu.

## Rules for the Agent

1. **Follow user instructions carefully.**
   - Only make edits that the user explicitly requests.
   - If the user asks for a fix or feature, implement it directly without unrelated refactoring.

2. **Preserve existing project style.**
   - Use the existing coding conventions and utility classes already present in the project.
   - Prefer minimal, local changes over broad sweeping edits.

3. **Use project tooling when appropriate.**
   - If a file or component already exists and is reusable, use it instead of inventing a new pattern.
   - Prefer `PrimeReact` and Tailwind-style classes in UI code when matching existing components.

4. **Avoid breaking the build.**
   - Ensure code remains syntactically valid.
   - Do not remove or change project dependencies unless explicitly requested.

5. **Keep UI changes consistent.**
   - Align new UI elements with existing visual patterns and spacing.
   - Maintain current form validation behavior unless the user asks otherwise.

6. **Maintain clear communication.**
   - When the user asks for changes, summarize exactly what was changed.
   - If a requested change is ambiguous, ask a concise clarifying question.

## Agent Scope

- Primary focus: frontend React + TypeScript code in this workspace.
- Secondary focus: project configuration files relevant to builds and styling.
- Do not modify unrelated files outside the workspace unless explicitly requested.

## Notes

- This repository uses React, Vite, Tailwind CSS, and PrimeReact.
- Form validation is implemented with `react-hook-form` and `zod`.
- Prefer using existing shared components when possible.

## DTO And API Data Handling

- When the user provides a backend DTO, mirror that DTO in the frontend model with the same fields and compatible types.
- API functions must return typed DTOs such as `BookingDTO`, not `unknown` or broad `any`, unless the DTO is genuinely unavailable.
- If the DTO shape is unclear or the runtime response does not match the current frontend type, ask for the full backend DTO before adding fallback logic.
- When unsure about backend fields, ask the user to provide the exact DTO names and full DTO fields before changing frontend logic.
- Prefer direct data flow from API response to UI. Do not add broad fallback, merge, normalize, or legacy-field inference logic unless the DTO explicitly has multiple valid shapes.
- If both list and detail endpoints return the same backend DTO, type both endpoints with the same frontend DTO.
- Keep legacy fields in the frontend type only when the backend DTO still returns them. Do not use legacy fields in UI logic when the user has specified a newer single source of truth.

## Modal And Manager Component Rules

- Manager pages should not contain large modal implementations inline.
- Detail, create, update, and similar dialogs must be split into dedicated components such as `ShopBookingDetailModal.tsx`.
- A feature may use one dedicated component for related view/create/update flows when the user requests that style. In that case, render view/detail as a PrimeReact `Dialog` and create/update as a right-side PrimeReact `Sidebar` inside that component.
- View/detail and update/edit flows must fetch fresh data from the backend `getById` endpoint before showing detail content or populating the update form. Do not rely on the table row/list DTO as the full detail source.
- When create or update flows are expected to slide in from the right, use a dedicated PrimeReact `Sidebar` component instead of a dialog.
- Small delete confirmation dialogs may stay inline in the manager page when they contain only simple confirmation text and actions.
- Manager pages should mainly handle list state, page-level actions, filters, table rendering, and opening/closing modal components.
- Modal footer action buttons should be centered in the modal unless the user explicitly requests a different layout.
- Use PrimeReact modal and button components for dialog UI, and keep button spacing, sizing, and text color explicit enough to avoid broken-looking controls.

## Dropdown Rules

- Every dropdown/select in the UI should support search/filter when the chosen component provides it.
- For PrimeReact `Dropdown`, enable `filter` by default and set an appropriate `filterBy`, `filterPlaceholder`, and `emptyFilterMessage`.
- Keep dropdown values aligned with backend DTO types. For example, when the backend expects a string, dropdown option values should still be strings.

## Common Utility Rules

- Do not create local formatting helpers such as `fmt`, `fmtDate`, `fmtVND`, or scattered currency/date formatters inside page/component files.
- Shared formatting logic must live in `src/common/utils/format.ts`.
- Use existing common helpers for VND currency, date/time, formatted money input, and money-in-words before adding a new formatter.

## Feature Folder Structure

- Feature folders under `src/apps/<feature>/` should be organized with `api/`, `model/`, and `components/` folders when that feature has API calls, local DTO/types, or reusable UI pieces.
- Keep manager page files at the feature root with concise names, for example `ProductManager.tsx`.
- Put API clients in `api/`, typed DTOs and feature-specific UI state types in `model/`, and split modal/table/form components in `components/`.
- Do not leave large detail, create, or update components beside the page file when a `components/` folder exists.
- Do not invent placeholder API functions when backend endpoints or DTOs are not provided. Create the API file only when there is a real endpoint to call.

## Split Components When Files Are Too Long

- If a React file becomes too long or contains a lot of complex logic/UI, split it into smaller components.

- Each component should have a clear single responsibility.

- Place the split components in the same directory or the appropriate `components/` directory.

- Import these components back into the main file instead of keeping all the code in one file.

- Avoid creating excessively large inline components within the same file.

## Shop Owner Page Layout Convention

All pages inside the **Shop Owner** section (`/shop-owner/*`) **MUST** follow this layout pattern:

### Structure

Each page returns **two separate blocks** stacked vertically with a small gap:

1. **Toolbar** — PrimeReact `<Toolbar />` component (from `primereact/toolbar`)
2. **Content Box** — A `<div>` with white background and rounded corners

```tsx
import { Toolbar } from "primereact/toolbar"

return (
  <div className="flex flex-1 flex-col gap-2">
    {/* 1. Toolbar — nền trắng, tách biệt, nằm trên nền xám */}
    <Toolbar
      className="rounded-xl border-none bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
      start={<h1 className="text-lg font-semibold text-slate-800">Tiêu đề trang</h1>}
      end={/* Optional: buttons, filters */}
    />

    {/* 2. Content — khung trắng bo góc chứa nội dung chính */}
    <div className="flex-1 rounded-xl bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-4">
      {/* Nội dung trang ở đây */}
    </div>
  </div>
)
```

### Key Rules

- **Toolbar và Content là 2 khối riêng biệt**, cách nhau bằng `gap-2`.
- **Toolbar** dùng PrimeReact `<Toolbar />`, nền trắng (`bg-white`), bo góc `rounded-xl`, không border (`border-none`).
- **Content box** nền trắng (`bg-white`), bo góc `rounded-xl`, có shadow nhẹ.
- **Không bọc** cả 2 vào chung 1 khung trắng. Chúng phải nằm tách biệt trên nền xám `#eef2f6` của layout.
- `ShopOwnerLayout.tsx` **không bọc** `<Outlet />` trong khung trắng — mỗi page tự quản lý layout riêng.
