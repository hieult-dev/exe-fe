export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED"

export type OrderSource = "ONLINE" | "STAFF"

export interface OrderCustomerDTO {
  id: number
  shopId: number
  userId: number | null
  fullName: string
  phone: string
  email: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderCustomerAddressDTO {
  id: number
  customerId: number
  name: string
  tel: string
  address: string
  province: string
  district: string
  ward: string
  hamlet: string
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export interface OrderItemDTO {
  id?: number
  shopId?: number
  orderId?: number
  productId: number
  productName?: string
  qty: number
  unitPrice?: number
  amount?: number
  createdAt?: string
}

export interface OrderListItemDTO {
  id: number
  orderCode: string
  shopId: number
  customerId: number | null
  customer: OrderCustomerDTO | null
  customerAddressId: number | null
  customerAddress: OrderCustomerAddressDTO | null
  receiverName: string | null
  receiverPhone: string | null
  shippingAddress: string | null
  items: OrderItemDTO[]
  totalAmount: number
  status: OrderStatus
  statusLabel: string
  source: OrderSource
  createdAt: string
}

export interface OrderDTO {
  id: number
  orderCode: string
  shopId: number
  customerId: number | null
  customer: OrderCustomerDTO | null
  customerAddressId: number | null
  customerAddress: OrderCustomerAddressDTO | null
  status: OrderStatus
  source: OrderSource
  subtotalAmount: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  receiverName: string | null
  receiverPhone: string | null
  shippingAddress: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  items: OrderItemDTO[]
}

export type CreateOrderRequest = {
  customerId?: number | null
  orderCode?: string
  status?: OrderStatus
  source?: OrderSource
  shippingFee?: number
  discountAmount?: number
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: string
  note?: string
  items: OrderItemDTO[]
}

export type SubmitGhtkOrderRequest = {
  pickDate: string
  isFreeship?: 0 | 1
  note?: string
}

export interface SubmitGhtkOrderResponse {
  success: boolean
  message: string
  order: Record<string, unknown> | null
  error: string | null
  warning: string | null
}

export interface ScrollResponse<T> {
  content: T[]
  size: number
  nextCursor: number | null
  hasNext: boolean
}

export type OrderCursorPage = ScrollResponse<OrderListItemDTO>
export type OrderStatusFilter = "ALL" | OrderStatus
export type OrderSourceFilter = "ALL" | OrderSource
