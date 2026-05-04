export type SaleCatalogItemType = "PRODUCT" | "SERVICE"
export type SaleCustomerMode = "WALK_IN" | "CUSTOMER"

export type SaleCatalogItem = {
  type: SaleCatalogItemType
  id: number
  name: string
  code?: string | null
  category?: string | null
  unitLabel: string
  unitPrice: number
  active: boolean
  stockQty?: number | null
  durationMin?: number | null
  imageUrl?: string | null
}

export type SaleCartItem = SaleCatalogItem & {
  quantity: number
}

export function getSaleItemKey(item: Pick<SaleCatalogItem, "type" | "id">) {
  return `${item.type}-${item.id}`
}

export function getSaleItemTypeLabel(type: SaleCatalogItemType) {
  return type === "PRODUCT" ? "Sản phẩm" : "Dịch vụ"
}

export function canAddSaleItem(item: SaleCatalogItem) {
  if (!item.active) return false
  if (item.type === "PRODUCT") return Number(item.stockQty ?? 0) > 0
  return true
}

export interface CustomerDTO {
  id: number
  shopId: number
  userId: number | null
  fullName: string
  phone: string
  email: string | null
  createdAt: string
  updatedAt: string
}

export type CustomerCreateRequest = {
  userId: null
  fullName: string
  phone: string
  email: string | null
}

export type CustomerDisplayInvoiceMode = "EMPTY" | "ORDER" | "BOOKING"
export type CustomerDisplayInvoiceLineType = "SERVICE" | "PRODUCT" | "PACKAGE_REDEEM" | "ADJUSTMENT"

export type CustomerDisplayInvoiceLine = {
  type: CustomerDisplayInvoiceLineType
  name: string
  imageUrl?: string | null
  qty: number
  unitPrice: number
  amount: number
}

export type CustomerDisplayPaymentQr = {
  url: string
  orderCode: string
  invoiceId?: number | null
  orderId?: number | null
  bookingId?: number | null
  amount: number
  bankCode: string
  accountNumber: string
  accountName: string
  displayName: string
}

export type CustomerDisplayInvoiceSnapshot = {
  mode: CustomerDisplayInvoiceMode
  code?: string
  customerName?: string
  lines: CustomerDisplayInvoiceLine[]
  subtotal: number
  discountAmount: number
  totalAmount: number
  paymentQr?: CustomerDisplayPaymentQr | null
  updatedAt: string
}
