import type { User } from "@/apps/user/model"

export function canAccessAdminConsole(user: User | null, userRole: string | null | undefined) {
  return user?.role === "ADMIN" || userRole === "ADMIN"
}
