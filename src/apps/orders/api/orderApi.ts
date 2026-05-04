import api from "@/common/api/baseApi"
import { GATEWAY_URL } from "@/common/config/api"
import type {
  CreateOrderRequest,
  OrderCursorPage,
  OrderDTO,
  OrderListItemDTO,
  OrderSource,
  OrderStatus,
} from "@/apps/orders/model"

const ORDER_URL = `${GATEWAY_URL}/api/orders`

type GetOrdersParams = {
  customerId?: number
  status?: OrderStatus
  source?: OrderSource
  createdDate?: string
  cursor?: number | null
  size?: number
}

export const getOrders = async ({
  customerId,
  status,
  source,
  createdDate,
  cursor = null,
  size = 20,
}: GetOrdersParams = {}) => {
  const params: Record<string, number | string> = { size }

  if (typeof customerId === "number") params.customerId = customerId
  if (status) params.status = status
  if (source) params.source = source
  if (createdDate) params.createdDate = createdDate
  if (typeof cursor === "number") params.cursor = cursor

  return api.get<OrderCursorPage>(ORDER_URL, { params })
}

export const getOrderById = async (id: number) => {
  return api.get<OrderDTO>(`${ORDER_URL}/${id}`)
}

export const createOrder = async (data: CreateOrderRequest) => {
  return api.post<OrderDTO>(ORDER_URL, data)
}

export const updateOrder = async (id: number, data: Partial<OrderDTO>) => {
  return api.put<OrderDTO>(`${ORDER_URL}/${id}`, data)
}

export const deleteOrder = async (id: number) => {
  return api.del<void>(`${ORDER_URL}/${id}`, undefined)
}

export type { OrderListItemDTO }
