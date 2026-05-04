import type { AuthShopDTO } from "@/apps/user/model"

export function resolveCurrentAuthShop(shops: AuthShopDTO[], currentShopId: number | null) {
  if (currentShopId == null) return shops[0] ?? null
  return shops.find((shop) => shop.id === currentShopId) ?? null
}

export function canAccessShopOwnerPages(shop: AuthShopDTO | null) {
  return shop?.memberRole === "OWNER"
}

export function canAccessStaffPages(shop: AuthShopDTO | null) {
  return shop?.memberRole === "OWNER" || shop?.memberRole === "STAFF"
}
