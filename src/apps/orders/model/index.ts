export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED"

export type OrderSource = "ONLINE" | "STAFF"

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
  customerId: number
  customerName: string | null
  customerPhone: string | null
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
  customerId: number
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
  shopId: number
  customerId: number
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

export interface ScrollResponse<T> {
  content: T[]
  size: number
  nextCursor: number | null
  hasNext: boolean
}

export type OrderCursorPage = ScrollResponse<OrderListItemDTO>
export type OrderStatusFilter = "ALL" | OrderStatus
export type OrderSourceFilter = "ALL" | OrderSource
