export type ShopStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"
export type ShopMemberRole = "OWNER" | "MANAGER" | "STAFF"
export type ShopMemberStatus = "ACTIVE" | "INACTIVE" | "INVITED" | "REMOVED"

export type ShopInfo = {
  id: string
  name: string
  addressText: string
  lat: number
  lng: number
  status: ShopStatus
  locationSource: "MANUAL" | "BROWSER_GEO" | "PLACE_PICKER"
  locationUpdatedAt: string
}

export type ShopService = {
  id: string
  name: string
  category: string
  basePrice: number
  durationMin: number
  active: boolean
  description?: string
}

export type ShopMember = {
  id: string
  fullName: string
  email: string
  phone?: string
  role: ShopMemberRole
  status: ShopMemberStatus
}

export type ShopOwnerData = {
  shop: ShopInfo
  services: ShopService[]
  members: ShopMember[]
}

const STORAGE_PREFIX = "petpees:shop-owner:"

const defaultSeed: ShopOwnerData = {
  shop: {
    id: "shop-01",
    name: "PETPEEs Mall",
    addressText: "123 Nguyen Trai, Quan 1, TP HCM",
    lat: 10.762622,
    lng: 106.660172,
    status: "ACTIVE",
    locationSource: "MANUAL",
    locationUpdatedAt: new Date().toISOString(),
  },
  services: [
    {
      id: "svc-01",
      name: "Khám tổng quát",
      category: "Khám",
      basePrice: 180000,
      durationMin: 30,
      active: true,
      description: "Khám sức khỏe cơ bản cho thú cưng.",
    },
    {
      id: "svc-02",
      name: "Tiêm phòng định kỳ",
      category: "Tiêm",
      basePrice: 220000,
      durationMin: 20,
      active: true,
      description: "Tiêm phòng theo lịch và tư vấn sau tiêm.",
    },
    {
      id: "svc-03",
      name: "Grooming cao cấp",
      category: "Grooming",
      basePrice: 350000,
      durationMin: 90,
      active: false,
      description: "Tắm, cắt tỉa, vệ sinh tai và móng.",
    },
  ],
  members: [
    {
      id: "mem-01",
      fullName: "Le Trung Hieu",
      email: "hieu@gmail.com",
      phone: "0858111305",
      role: "OWNER",
      status: "ACTIVE",
    },
    {
      id: "mem-02",
      fullName: "Nguyen Minh Quan",
      email: "quan.staff@gmail.com",
      phone: "0908001122",
      role: "STAFF",
      status: "ACTIVE",
    },
    {
      id: "mem-03",
      fullName: "Tran Thu Ha",
      email: "ha.manager@gmail.com",
      phone: "0911223344",
      role: "MANAGER",
      status: "INVITED",
    },
  ],
}

const seedByOwner: Record<string, ShopOwnerData> = {
  "hieu@gmail.com": defaultSeed,
  default: defaultSeed,
}

function getStorageKey(ownerKey: string) {
  return `${STORAGE_PREFIX}${ownerKey}`
}

function safeParse(raw: string | null): ShopOwnerData | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed?.shop || !Array.isArray(parsed?.services) || !Array.isArray(parsed?.members)) {
      return null
    }

    return parsed as ShopOwnerData
  } catch {
    return null
  }
}

export function loadShopOwnerData(ownerKey: string) {
  const storageKey = getStorageKey(ownerKey)
  const fromStorage = safeParse(localStorage.getItem(storageKey))

  if (fromStorage) {
    return fromStorage
  }

  const seeded = seedByOwner[ownerKey] ?? seedByOwner.default
  return {
    shop: { ...seeded.shop },
    services: seeded.services.map((item) => ({ ...item })),
    members: seeded.members.map((item) => ({ ...item })),
  }
}

export function saveShopOwnerData(ownerKey: string, data: ShopOwnerData) {
  const storageKey = getStorageKey(ownerKey)
  localStorage.setItem(storageKey, JSON.stringify(data))
}

export function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`
}

export function formatCurrencyVND(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`
}

