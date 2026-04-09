---
name: prime-react-ui
description: Bắt buộc dùng PrimeReact components và PrimeIcons cho toàn bộ UI React khi sinh mới hoặc chỉnh sửa giao diện.
---

# PrimeReact UI Skill

## Mục tiêu
Khi tạo mới hoặc chỉnh sửa giao diện React/TypeScript, agent **phải ưu tiên dùng PrimeReact** cho component UI và **PrimeIcons** cho icon.

Không dùng HTML thuần hoặc thư viện UI khác nếu PrimeReact đã có component phù hợp.

---

## Quy tắc bắt buộc

### 1. Component UI
Agent phải dùng component của **PrimeReact** cho các thành phần giao diện phổ biến, ví dụ:

- Button → `primereact/button`
- Input text → `primereact/inputtext`
- Password → `primereact/password`
- Dropdown → `primereact/dropdown`
- Calendar/DatePicker → `primereact/calendar`
- Dialog/Modal → `primereact/dialog`
- Card → `primereact/card`
- Data table → `primereact/datatable`
- Column → `primereact/column`
- Checkbox → `primereact/checkbox`
- RadioButton → `primereact/radiobutton`
- InputSwitch → `primereact/inputswitch`
- Textarea → `primereact/inputtextarea`
- TabView → `primereact/tabview`
- Panel → `primereact/panel`
- Tag → `primereact/tag`
- Badge → `primereact/badge`
- Toast → `primereact/toast`
- ConfirmDialog → `primereact/confirmdialog`
- Sidebar / Drawer → `primereact/sidebar`
- Menu → `primereact/menu`
- Toolbar → `primereact/toolbar`
- Avatar → `primereact/avatar`
- ProgressSpinner → `primereact/progressspinner`
- Skeleton → `primereact/skeleton`

### 2. Icon
Agent phải dùng **PrimeIcons**:

- icon class dạng `pi pi-*`
- ví dụ:
  - save → `pi pi-save`
  - search → `pi pi-search`
  - user → `pi pi-user`
  - lock → `pi pi-lock`
  - eye → `pi pi-eye`
  - pencil → `pi pi-pencil`
  - trash → `pi pi-trash`
  - plus → `pi pi-plus`
  - minus → `pi pi-minus`
  - check → `pi pi-check`
  - times → `pi pi-times`

Không dùng icon từ:
- lucide-react
- react-icons
- heroicons
- font-awesome
trừ khi người dùng yêu cầu rõ ràng.

---

## Quy tắc ưu tiên

### Phải ưu tiên PrimeReact hơn:
- HTML thuần như `button`, `input`, `select`, `table`
- Bootstrap component
- Material UI
- Ant Design
- Chakra UI
- shadcn/ui

Ví dụ:
- Không dùng `<button>` nếu có thể thay bằng `<Button />`
- Không dùng `<input type="text" />` nếu có thể thay bằng `<InputText />`
- Không dùng modal tự custom nếu có thể thay bằng `<Dialog />`

---

## Mapping chuẩn

### Form
- Text input → `InputText`
- Password input → `Password`
- Number input → `InputNumber`
- Multi-line text → `InputTextarea`
- Checkbox → `Checkbox`
- Radio → `RadioButton`
- Toggle → `InputSwitch`
- Select 1 giá trị → `Dropdown`
- Select nhiều giá trị → `MultiSelect`
- Date → `Calendar`

### Action
- Submit / Save / Cancel / Delete → `Button`

### Feedback
- Notification → `Toast`
- Confirm action → `ConfirmDialog`
- Loading → `ProgressSpinner` hoặc `Skeleton`
- Empty state → ưu tiên `Card`, `Tag`, icon `pi`

### Layout hiển thị dữ liệu
- Bảng → `DataTable` + `Column`
- Thẻ thông tin → `Card`
- Popup → `Dialog`
- Khu vực thu gọn → `Panel`, `Accordion`
- Tab → `TabView`

---

## Quy tắc code style

### 1. Import đúng
Ví dụ:

```tsx
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dialog } from 'primereact/dialog';