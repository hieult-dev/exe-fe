import { z } from "zod"

export type ShopMemberRole = "OWNER" | "MANAGER" | "STAFF"
export type ShopMemberStatus = "ACTIVE" | "INACTIVE" | "INVITED" | "REMOVED"

export interface ShopMemberDTO {
  shopId: number
  userId: number
  role: ShopMemberRole
  status: ShopMemberStatus
  createdAt: string
  userFullName: string | null
  userEmail: string | null
  userPhone: string | null
  avatarUrlPreview: string | null
}

export type ShopMemberCreateRequest = {
  fullName: string
  email: string
  password: string
  phone: string
  address?: string
  age?: number
  role: ShopMemberRole
  status?: ShopMemberStatus
}

export type ShopMemberUpdateRequest = {
  role?: ShopMemberRole
  status?: ShopMemberStatus
}

export type ShopMemberResetPasswordRequest = {
  newPassword: string
}

export const SHOP_MEMBER_ROLE_OPTIONS: { label: string; value: ShopMemberRole }[] = [
  { label: "Chủ shop", value: "OWNER" },
  { label: "Quản lý", value: "MANAGER" },
  { label: "Nhân viên", value: "STAFF" },
]

export const SHOP_MEMBER_STATUS_OPTIONS: { label: string; value: ShopMemberStatus }[] = [
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Tạm nghỉ", value: "INACTIVE" },
  { label: "Đã mời", value: "INVITED" },
  { label: "Đã xóa", value: "REMOVED" },
]

export const ShopMemberFormSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên."),
  email: z.string().trim().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
  password: z
    .string()
    .min(6, "Mật khẩu phải có 6-32 ký tự.")
    .max(32, "Mật khẩu phải có 6-32 ký tự."),
  phone: z.string().trim().min(1, "Vui lòng nhập số điện thoại."),
  address: z.string().trim(),
  age: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true
      const age = Number(value)
      return Number.isInteger(age) && age > 0
    }, "Tuổi phải là số nguyên dương."),
  role: z.enum(["OWNER", "MANAGER", "STAFF"], {
    message: "Vui lòng chọn vai trò.",
  }),
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED", "REMOVED"], {
    message: "Vui lòng chọn trạng thái.",
  }),
})

export const ShopMemberUpdateFormSchema = ShopMemberFormSchema.pick({
  role: true,
  status: true,
})

export const ShopMemberResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu mới.")
    .min(6, "Mật khẩu phải có 6-32 ký tự.")
    .max(32, "Mật khẩu phải có 6-32 ký tự."),
})

export type ShopMemberFormValues = z.infer<typeof ShopMemberFormSchema>
export type ShopMemberResetPasswordValues = z.infer<typeof ShopMemberResetPasswordSchema>

export const emptyShopMemberForm: ShopMemberFormValues = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  age: "",
  role: "STAFF",
  status: "ACTIVE",
}

export function roleLabel(role: ShopMemberRole) {
  return SHOP_MEMBER_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role
}

export function statusLabel(status: ShopMemberStatus) {
  return SHOP_MEMBER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export function statusClass(status: ShopMemberStatus) {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-700"
  if (status === "INVITED") return "bg-sky-100 text-sky-700"
  if (status === "INACTIVE") return "bg-slate-100 text-slate-600"
  return "bg-rose-100 text-rose-700"
}

export function toShopMemberForm(member: ShopMemberDTO): ShopMemberFormValues {
  return {
    fullName: member.userFullName ?? "",
    email: member.userEmail ?? "",
    password: "",
    phone: member.userPhone ?? "",
    address: "",
    age: "",
    role: member.role,
    status: member.status,
  }
}

export function getShopMemberDisplayName(member: ShopMemberDTO) {
  return member.userFullName?.trim() || `User #${member.userId}`
}

export function getShopMemberInitial(member: ShopMemberDTO) {
  return (getShopMemberDisplayName(member).trim()[0] || "U").toUpperCase()
}
