export type ShopStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"
export type ShopMemberRole = "OWNER" | "MANAGER" | "STAFF"
export type ShopMemberStatus = "ACTIVE" | "INACTIVE" | "INVITED" | "REMOVED"
export type InventoryStockState = "OUT" | "LOW" | "OK"

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
  id: string | number
  name: string
  category: string
  categoryId?: number | null
  basePrice: number
  durationMin: number
  active: boolean
}

export type ShopMember = {
  id: string
  fullName: string
  email: string
  phone?: string
  role: ShopMemberRole
  status: ShopMemberStatus
}

export type ShopInventoryProduct = {
  id: string
  sku: string
  name: string
  category: string
  sellPrice: number
  stockQty: number
  reorderLevel: number
  active: boolean
  description?: string
  imageUrl?: string
}

export type ShopInventoryMaterial = {
  id: string
  code: string
  name: string
  unit: string
  stockQty: number
  reorderLevel: number
  active: boolean
  note?: string
}

export type ShopInventory = {
  products: ShopInventoryProduct[]
  materials: ShopInventoryMaterial[]
}

export type ShopOwnerData = {
  shop: ShopInfo
  services: ShopService[]
  members: ShopMember[]
  inventory: ShopInventory
}

const STORAGE_PREFIX = "petpees:shop-owner:"

const defaultInventory: ShopInventory = {
  products: [
    {
      id: "prd-01",
      sku: "PET-FOOD-01",
      name: "Hạt dinh dưỡng premium",
      category: "Thức ăn",
      sellPrice: 149000,
      stockQty: 36,
      reorderLevel: 10,
      active: true,
      description: "Dòng sản phẩm bán chạy cho thú cưng trong shop.",
      imageUrl: "/image/food.jpg",
    },
    {
      id: "prd-02",
      sku: "PET-CARE-02",
      name: "Sữa tắm thảo mộc",
      category: "Chăm sóc",
      sellPrice: 89000,
      stockQty: 8,
      reorderLevel: 8,
      active: true,
      description: "Phù hợp cho chó và mèo có làn da nhạy cảm.",
      imageUrl: "/image/shampoo.jpg",
    },
    {
      id: "prd-03",
      sku: "PET-TOY-03",
      name: "Đồ chơi gặm răng",
      category: "Đồ chơi",
      sellPrice: 59000,
      stockQty: 0,
      reorderLevel: 6,
      active: false,
      description: "Đang tạm dừng để bổ sung lô hàng mới.",
      imageUrl: "/image/toys.jpg",
    },
  ],
  materials: [
    {
      id: "mat-01",
      code: "SUP-SHAM-01",
      name: "Dầu gội yến mạch",
      unit: "chai",
      stockQty: 15,
      reorderLevel: 5,
      active: true,
      note: "Vật tư cho gói grooming cơ bản và nâng cao.",
    },
    {
      id: "mat-02",
      code: "SUP-TOWEL-02",
      name: "Khăn tắm microfiber",
      unit: "cái",
      stockQty: 4,
      reorderLevel: 6,
      active: true,
      note: "Cần bổ sung thêm cho khu spa.",
    },
    {
      id: "mat-03",
      code: "SUP-DISINFECT-03",
      name: "Dung dịch sát khuẩn",
      unit: "chai",
      stockQty: 0,
      reorderLevel: 4,
      active: false,
      note: "Tạm dừng sử dụng cho đến khi nhập kho mới.",
    },
  ],
}

const defaultSeed: ShopOwnerData = {
  shop: {
    id: "shop-01",
    name: "PETPEEs Mall",
    addressText: "123 Nguyễn Trãi, Quận 1, TP.HCM",
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
    },
    {
      id: "svc-02",
      name: "Tiêm phòng định kỳ",
      category: "Tiêm",
      basePrice: 220000,
      durationMin: 20,
      active: true,
    },
    {
      id: "svc-03",
      name: "Grooming cao cap",
      category: "Grooming",
      basePrice: 350000,
      durationMin: 90,
      active: false,
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
  inventory: defaultInventory,
}

const seedByOwner: Record<string, ShopOwnerData> = {
  "hieu@gmail.com": defaultSeed,
  default: defaultSeed,
}

function cloneServices(services: ShopService[]) {
  return services.map((item) => ({ ...item }))
}

function cloneMembers(members: ShopMember[]) {
  return members.map((item) => ({ ...item }))
}

function cloneInventory(inventory: ShopInventory): ShopInventory {
  return {
    products: inventory.products.map((item) => ({ ...item })),
    materials: inventory.materials.map((item) => ({ ...item })),
  }
}

function cloneShopOwnerData(data: ShopOwnerData): ShopOwnerData {
  return {
    shop: { ...data.shop },
    services: cloneServices(data.services),
    members: cloneMembers(data.members),
    inventory: cloneInventory(data.inventory),
  }
}

function getStorageKey(ownerKey: string) {
  return `${STORAGE_PREFIX}${ownerKey}`
}

function safeParse(raw: string | null): Partial<ShopOwnerData> | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)

    if (!parsed?.shop || !Array.isArray(parsed?.services) || !Array.isArray(parsed?.members)) {
      return null
    }

    return parsed as Partial<ShopOwnerData>
  } catch {
    return null
  }
}

function normalizeInventory(inventory: Partial<ShopInventory> | undefined, fallback: ShopInventory): ShopInventory {
  return {
    products: Array.isArray(inventory?.products)
      ? inventory.products.map((item) => ({ ...item }))
      : fallback.products.map((item) => ({ ...item })),
    materials: Array.isArray(inventory?.materials)
      ? inventory.materials.map((item) => ({ ...item }))
      : fallback.materials.map((item) => ({ ...item })),
  }
}

export function loadShopOwnerData(ownerKey: string) {
  const storageKey = getStorageKey(ownerKey)
  const seeded = seedByOwner[ownerKey] ?? seedByOwner.default
  const fallback = cloneShopOwnerData(seeded)
  const fromStorage = safeParse(localStorage.getItem(storageKey))

  if (!fromStorage) {
    return fallback
  }

  return {
    shop: { ...(fromStorage.shop as ShopInfo) },
    services: cloneServices(fromStorage.services as ShopService[]),
    members: cloneMembers(fromStorage.members as ShopMember[]),
    inventory: normalizeInventory(fromStorage.inventory, fallback.inventory),
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

export function resolveInventoryStockState(stockQty: number, reorderLevel: number): InventoryStockState {
  if (stockQty <= 0) return "OUT"
  if (stockQty <= reorderLevel) return "LOW"
  return "OK"
}
