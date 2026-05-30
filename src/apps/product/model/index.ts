export interface ProductDTO {
  id: number
  shopId: number
  categoryId: number | null
  categoryName: string | null
  sku: string
  name: string
  unit: string
  price: number
  active: boolean
  stockQty: number
  imageUrls: (string | null)[] | null
}

export type ProductCreateRequest = {
  categoryId: number | null
  sku: string
  name: string
  unit: string
  price: number
  active: boolean
  stockQty: number
  imageUrls?: string[]
  imageFiles?: File[]
  replaceImages?: boolean
}

export interface ProductCategoryDTO {
  id: number
  shopId: number
  name: string
  description: string | null
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type ProductCategoryWriteRequest = {
  name: string
  description: string | null
  active: boolean
  sortOrder: number
}

export interface ScrollResponse<T> {
  content: T[]
  size: number
  nextCursor: number | null
  hasNext: boolean
}

export type ProductScrollResponse = ScrollResponse<ProductDTO>

export type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE"

export type ProductFormState = {
  categoryId: number | null
  name: string
  sku: string
  unit: string
  price: string
  stockQty: string
  imageUrls: string[]
  imageFiles: File[]
  active: boolean
}

const PRODUCT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg", ".avif"]

export const ACTIVE_FILTER_OPTIONS: { label: string; value: ActiveFilter }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đang kích hoạt", value: "ACTIVE" },
  { label: "Tạm ẩn", value: "INACTIVE" },
]

export const PRODUCT_UNIT_OPTIONS: { label: string; value: string }[] = [
  { label: "Cái", value: "cái" },
  { label: "Bộ", value: "bộ" },
  { label: "Gói", value: "gói" },
  { label: "Hộp", value: "hộp" },
  { label: "Chai", value: "chai" },
  { label: "Tuýp", value: "tuýp" },
  { label: "Kg", value: "kg" },
  { label: "Gram", value: "gram" },
  { label: "Lít", value: "lít" },
  { label: "ml", value: "ml" },
]

export const emptyProductForm: ProductFormState = {
  categoryId: null,
  name: "",
  sku: "",
  unit: "",
  price: "",
  stockQty: "",
  imageUrls: [],
  imageFiles: [],
  active: true,
}

export function toProductForm(product: ProductDTO): ProductFormState {
  return {
    categoryId: product.categoryId,
    name: product.name,
    sku: product.sku,
    unit: product.unit,
    price: String(product.price),
    stockQty: String(product.stockQty),
    imageUrls: (product.imageUrls ?? []).filter((imageUrl): imageUrl is string => Boolean(imageUrl?.trim())),
    imageFiles: [],
    active: product.active,
  }
}

export function isProductImageFile(file: File) {
  const mimeType = file.type.toLowerCase()
  if (mimeType.startsWith("image/")) return true

  const fileName = file.name.toLowerCase()
  return PRODUCT_IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension))
}
