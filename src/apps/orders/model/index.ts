export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKING"
  | "WAITING_GHTK_PICKUP"
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

export interface OrderShippingSnapshotDTO {
  receiverName: string | null
  receiverPhone: string | null
  address: string | null
  province: string | null
  district: string | null
  ward: string | null
  street: string | null
  hamlet: string | null
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
  userId: number | null
  userFullName: string | null
  userPhone: string | null
  userEmail: string | null
  userAvatarUrlPreview: string | null
  customerId: number | null
  customer: OrderCustomerDTO | null
  customerAddressId: number | null
  customerAddress: OrderCustomerAddressDTO | null
  userAddressId: number | null
  shippingSnapshot: OrderShippingSnapshotDTO | null
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
  userId: number | null
  customerId: number | null
  customerAddressId: number | null
  userAddressId: number | null
  status: OrderStatus
  source: OrderSource
  subtotalAmount: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  receiverName: string | null
  receiverPhone: string | null
  shippingAddress: string | null
  shippingProvince: string | null
  shippingDistrict: string | null
  shippingWard: string | null
  shippingStreet: string | null
  shippingHamlet: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  items: OrderItemDTO[]
}

export type OrderDetailDTO = OrderListItemDTO &
  Partial<
    Pick<
      OrderDTO,
      | "subtotalAmount"
      | "shippingFee"
      | "discountAmount"
      | "receiverName"
      | "receiverPhone"
      | "shippingAddress"
      | "shippingProvince"
      | "shippingDistrict"
      | "shippingWard"
      | "shippingStreet"
      | "shippingHamlet"
      | "note"
      | "updatedAt"
    >
  >

export type CreateOrderRequest = {
  userId?: number | null
  customerId?: number | null
  customerAddressId?: number | null
  userAddressId?: number | null
  orderCode?: string
  status?: OrderStatus
  source?: OrderSource
  shippingFee?: number
  discountAmount?: number
  receiverName?: string
  receiverPhone?: string
  shippingAddress?: string
  shippingProvince?: string
  shippingDistrict?: string
  shippingWard?: string
  shippingStreet?: string
  shippingHamlet?: string
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
