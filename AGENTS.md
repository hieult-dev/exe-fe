# Agent Rules

This file defines the working rules for AI agents in this repository.

## Purpose

- Provide guidance for the AI assistant when editing code in this workspace.
- Define preferred behavior for changes, code style, and project conventions.
- Keep interactions focused, practical, and aligned with the user request.

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
  
## Split Components When Files Are Too Long**

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